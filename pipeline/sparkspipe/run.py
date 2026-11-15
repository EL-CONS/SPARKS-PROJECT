"""Orquestador: descubrimiento, recortes, coadds, movimiento y escritura.

Cada etapa escribe su cache en ``pipeline/_work/<id>/`` para poder reanudar sin
volver a descargar. La salida publicable va a ``data-new/<id>/`` y no contiene
nada que pase de 25 MB por archivo.
"""

from __future__ import annotations

import csv
import json
import math
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any

import numpy as np

from . import binfmt, coadd, manifest, motion
from .config import (
    CUTOUT_SIZE_DEG,
    FRAME_CAP_PER_DET_SEASON,
    MAX_WORKERS,
    N_PIX,
    REFERENCE_MJD,
    Target,
    data_new_root,
    repo_root,
    work_root,
)
from .cutout import CutoutFrame, download_and_extract, pixel_in_frame
from .discovery import ImageRecord, assign_seasons, cutout_url, discover, mjd_to_date, release_summary, select_frames
from .grid import resample, target_wcs
from .http import HttpClient, utc_now
from .quality import build_mask, estimate_quality

# Version del recorte procesado; si cambia el metodo se sube para invalidar cache.
# v2: centrar la malla depende de la epoca del catalogo (WISE 0855 paso de
# J2000 a MJD 55320.4), asi que los cuadros v1 quedan invalidados.
PROCESS_VERSION = "2"


def _npz_path(work: Path, record: ImageRecord) -> Path:
    return work / "frames" / f"{record.obs_id}_D{record.det}.npz"


def _save_processed(
    path: Path,
    *,
    image: np.ndarray,
    variance: np.ndarray,
    mask: np.ndarray,
    coverage: np.ndarray,
    meta: dict[str, Any],
) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    np.savez_compressed(
        path,
        image=image.astype(np.float32),
        variance=variance.astype(np.float32),
        mask=mask.astype(np.uint8),
        coverage=coverage.astype(np.float32),
        meta=np.array(json.dumps(meta, ensure_ascii=False)),
    )


def _load_processed(path: Path) -> dict[str, Any] | None:
    try:
        with np.load(path, allow_pickle=False) as data:
            meta = json.loads(str(data["meta"]))
            if meta.get("process_version") != PROCESS_VERSION:
                return None
            return {
                "image": np.asarray(data["image"], dtype=np.float64),
                "variance": np.asarray(data["variance"], dtype=np.float64),
                "mask": np.asarray(data["mask"], dtype=np.uint8),
                "coverage": np.asarray(data["coverage"], dtype=np.float64),
                "meta": meta,
            }
    except Exception:  # noqa: BLE001
        return None


def process_frame(
    record: ImageRecord,
    *,
    target: Target,
    center_ra: float,
    center_dec: float,
    work: Path,
    reuse_only: bool = False,
) -> dict[str, Any]:
    """Descarga (o reutiliza), recorta, enmascara y reproyecta un cuadro."""
    path = _npz_path(work, record)
    cached = _load_processed(path)
    if cached:
        # ``cached["coverage"]`` es el mapa 2D de cobertura; el escalar que va al
        # manifiesto esta en ``meta["coverage"]``. No pisar uno con el otro.
        return {**cached["meta"], "image": cached["image"], "variance": cached["variance"],
                "mask": cached["mask"], "coverage_arr": cached["coverage"], "cached": True}
    if reuse_only:
        # Reproducir la salida sin volver a pedir recortes: util cuando el
        # servicio esta lento y solo se cambio el manifiesto o sus textos.
        raise RuntimeError("sin recorte procesado en cache y --reuse-only esta activo")

    client = HttpClient(retries=10, backoff=1.5, timeout=240.0)
    frame: CutoutFrame = download_and_extract(
        client,
        record,
        ra=center_ra,
        dec=center_dec,
        cutout_dir=work / "cutouts",
        raw_dir=work / "raw",
        size_deg=CUTOUT_SIZE_DEG,
    )
    if not pixel_in_frame(frame, center_ra, center_dec, margin=2):
        raise RuntimeError("el recorte no contiene el centro pedido")

    mask_cut, counts = build_mask(frame.flags, frame.flag_bits, edge_pixels=0)
    quality = estimate_quality(frame.image, frame.variance, frame.zodi, mask_cut, frame.flag_bits, counts)

    wcs_out = target_wcs(center_ra, center_dec)
    res = resample(
        frame.image,
        frame.wcs,
        wcs_out,
        variance=np.where(np.isfinite(frame.variance) & (frame.variance > 0), frame.variance, np.nan),
        mask=mask_cut,
    )
    # Marcar como malo cualquier pixel sin cobertura.
    mask64 = res.mask.astype(np.uint8).copy()
    mask64[~np.isfinite(res.image)] |= 1
    coverage = float(np.isfinite(res.image).mean())

    meta = {
        "process_version": PROCESS_VERSION,
        "obs_id": frame.obs_id,
        "det": frame.det,
        "season": int(record.season or 0),
        "mjd": float(frame.mjd),
        "lam": frame.wl_um,
        "dlam": frame.bw_um,
        "release": frame.release,
        "version": frame.version,
        "exptime": frame.exptime,
        "bkg": quality.bkg,
        "zodi": quality.zodi,
        "sigma": quality.sigma,
        "flag_pixels": quality.counts,
        "flag_bits": frame.flag_bits,
        "pix_total": int(frame.pix_total),
        "coverage": coverage,
        "source_url": frame.source_url,
        "status": "ok",
    }
    _save_processed(
        path,
        image=res.image,
        variance=res.variance,
        mask=mask64,
        coverage=res.coverage,
        meta=meta,
    )
    return {**meta, "image": res.image, "variance": res.variance, "mask": mask64,
            "coverage_arr": res.coverage, "cached": False}


def _season_summary(frames: list[dict[str, Any]], all_seasons: list[dict[str, Any]]) -> list[dict[str, Any]]:
    by_season: dict[int, list[dict[str, Any]]] = {}
    for fr in frames:
        by_season.setdefault(int(fr["season"]), []).append(fr)
    out: list[dict[str, Any]] = []
    for season in all_seasons:
        sid = int(season["id"])
        members = by_season.get(sid, [])
        if not members:
            continue
        mjds = [float(f["mjd"]) for f in members]
        out.append(
            {
                "id": sid,
                "mjd_min": float(min(mjds)),
                "mjd_max": float(max(mjds)),
                "mjd_mean": float(np.mean(mjds)),
                "start": mjd_to_date(min(mjds)),
                "end": mjd_to_date(max(mjds)),
                "n_frames": len(members),
                "releases": sorted({str(f["release"]).lower() for f in members}),
            }
        )
    return out


def _gaia_row(target: Target) -> dict[str, Any] | None:
    """Fila de Gaia desde la tabla ya verificada del sprint anterior."""
    path = repo_root() / "docs" / "sprint-13-30" / "gaia-fotometria.csv"
    if not target.gaia_source_id or not path.exists():
        return None
    with path.open(encoding="utf-8") as fh:
        for row in csv.DictReader(fh):
            if row.get("gaia_source_id") == target.gaia_source_id:
                out: dict[str, Any] = {"id": target.gaia_source_id, "cat": "Gaia DR3"}
                for key, name in (
                    ("ra_deg", "ra"),
                    ("dec_deg", "dec"),
                    ("phot_g_mean_mag", "g"),
                    ("bp_rp", "bp_rp"),
                    ("parallax_mas", "plx"),
                    ("pmra_mas_yr", "pmra"),
                    ("pmdec_mas_yr", "pmdec"),
                    ("ruwe", "ruwe"),
                    ("mg_gaia", "mg"),
                ):
                    try:
                        out[name] = float(row[key]) if row.get(key) not in (None, "") else None
                    except ValueError:
                        out[name] = None
                out["epoch_mjd"] = 57388.5
                out["source"] = "docs/sprint-13-30/gaia-fotometria.csv (Gaia DR3 por source_id)"
                return out
    return None


def run_target(
    target: Target,
    *,
    cap: int = FRAME_CAP_PER_DET_SEASON,
    workers: int = MAX_WORKERS,
    limit: int | None = None,
    use_cache: bool = True,
    reuse_only: bool = False,
    verbose: bool = True,
) -> dict[str, Any]:
    t_start = time.time()
    work = work_root() / target.id
    work.mkdir(parents=True, exist_ok=True)
    center_ra, center_dec = target.position_at(REFERENCE_MJD)
    blockers: list[str] = []

    def log(msg: str) -> None:
        if verbose:
            print(f"[{target.id}] {msg}", flush=True)

    log(f"centro de malla {center_ra:.6f} {center_dec:.6f} (epoca MJD {REFERENCE_MJD:.0f})")

    # --- 1. Descubrimiento -------------------------------------------------
    client = HttpClient(retries=4, backoff=2.0, timeout=420.0)
    t0 = time.time()
    records, seasons, trace = discover(client, target, position=(center_ra, center_dec))
    discovery_s = time.time() - t0
    if not records:
        blockers.append("SIA2 no devolvio imagenes SPHEREx que cubran la posicion")
        result = _write_blocked(target, work, center_ra, center_dec, trace, blockers, discovery_s)
        return result
    log(f"SIA2: {len(records)} imagenes, {len(seasons)} temporadas, {discovery_s:.0f} s")

    # --- 2. Seleccion ------------------------------------------------------
    selected = select_frames(records, cap_per_det_season=cap)
    if limit is not None:
        selected = selected[: int(limit)]
    log(f"seleccionados {len(selected)} cuadros (tope {cap} por detector y temporada)")

    # --- 3. Descarga y procesamiento ---------------------------------------
    t0 = time.time()
    frames: list[dict[str, Any]] = []
    failures: list[dict[str, Any]] = []

    def task(rec: ImageRecord) -> dict[str, Any]:
        return process_frame(
            rec,
            target=target,
            center_ra=center_ra,
            center_dec=center_dec,
            work=work,
            reuse_only=reuse_only,
        )

    with ThreadPoolExecutor(max_workers=max(1, workers)) as pool:
        futures = {pool.submit(task, rec): rec for rec in selected}
        done = 0
        for fut in as_completed(futures):
            rec = futures[fut]
            done += 1
            try:
                frames.append(fut.result())
            except Exception as exc:  # noqa: BLE001
                failures.append(
                    {
                        "obs_id": rec.obs_id,
                        "det": rec.det,
                        "mjd": rec.mjd,
                        "error": f"{type(exc).__name__}: {exc}",
                    }
                )
            if verbose and (done % 10 == 0 or done == len(futures)):
                log(f"procesados {done}/{len(futures)} (fallos {len(failures)})")
    download_s = time.time() - t0

    if not frames:
        blockers.append("todos los recortes fallaron o no contenian el objeto")
        return _write_blocked(target, work, center_ra, center_dec, trace, blockers, discovery_s, failures)

    frames.sort(key=lambda f: (float(f["mjd"]), int(f["det"])))
    for i, fr in enumerate(frames):
        fr["i"] = i
        fr["mask"] = np.asarray(fr["mask"], dtype=np.uint8)

    # --- 4. Coadds, diferencias y medianas ---------------------------------
    t0 = time.time()
    coadd_input = [
        {
            "det": int(fr["det"]),
            "season": int(fr["season"]),
            "mjd": float(fr["mjd"]),
            "image": np.asarray(fr["image"], dtype=np.float64),
            "variance": np.asarray(fr["variance"], dtype=np.float64),
            "mask": np.asarray(fr["mask"]) > 0,
            "wl_um": fr.get("lam"),
            "bw_um": fr.get("dlam"),
            "index": i,
        }
        for i, fr in enumerate(frames)
    ]
    coadds, _ = coadd.coadd_by_det_season(coadd_input)
    diffs = coadd.season_diffs(coadds)
    medians = coadd.median_per_detector(frames)
    analysis_s = time.time() - t0
    log(f"coadds {len(coadds)}, diferencias {len(diffs)}")

    # --- 5. Movimiento propio ---------------------------------------------
    t0 = time.time()
    wcs = target_wcs(center_ra, center_dec)
    motion_result = motion.measure_motion(
        [
            {"det": c.det, "season": c.season, "mjd": float(np.mean([frames[i]["mjd"] for i in c.members])) if c.members else float("nan"),
             "image": c.image, "sigma": c.sigma, "mask": ~np.isfinite(c.image)}
            for c in coadds
        ],
        wcs,
        center_ra,
        center_dec,
        target,
    )
    motion_s = time.time() - t0
    if motion_result.get("measured") is None:
        blockers.append(motion_result.get("reason") or "sin movimiento propio medible")
    log(f"movimiento: {motion_result.get('measured') and motion_result['measured'].get('mu')}")

    # --- 6. Manifiesto y archivos -----------------------------------------
    if not any(r["release"] == "QR2" for r in release_summary(selected)):
        blockers.append(
            "spherex_qr2 no aparece en SIA2 para esta posicion; se usan las "
            "releases que SIA2 devuelve para este campo (ver docs/pipeline/metodo.md)"
        )
    if not any(r["release"] == "QR3" for r in release_summary(selected)):
        blockers.append(
            "spherex_qr3 no aparece en SIA2 para esta posicion; se usan las "
            "releases que SIA2 devuelve para este campo (ver docs/pipeline/metodo.md)"
        )
    status = "ok" if motion_result.get("measured") is not None else "parcial"
    if failures:
        blockers.append(f"{len(failures)} recortes fallaron; detalle en _work/{target.id}/run.json")

    seasons_used = _season_summary(frames, seasons)
    releases = release_summary(selected)
    flag_bits: dict[str, str] = {}
    for fr in frames:
        for bit, name in (fr.get("flag_bits") or {}).items():
            flag_bits.setdefault(str(bit), str(name))

    out_dir = data_new_root() / target.id
    catalogs = manifest.build_catalogs(
        target,
        _gaia_row(target),
        service="Gaia DR3 (docs/sprint-13-30/gaia-fotometria.csv)",
        queried=utc_now(),
    )
    man = manifest.build_manifest(
        target,
        center_ra=center_ra,
        center_dec=center_dec,
        center_mjd=float(np.mean([f["mjd"] for f in frames])),
        seasons=seasons_used,
        frames=frames,
        coadds=coadds,
        diffs=diffs,
        motion=motion_result,
        files={},
        releases=releases,
        flag_bits=flag_bits,
        status=status,
        blockers=blockers,
        timings={"discovery_s": discovery_s, "download_s": download_s, "analysis_s": analysis_s},
        note=target.note,
        catalogs=catalogs,
        extras={
            "discovery": {
                "service": "IRSA SIA2",
                "url": "https://irsa.ipac.caltech.edu/SIA",
                "position": [center_ra, center_dec],
                "radius_deg": 0.06,
                "n_images_total": len(records),
                "n_images_selected": len(selected),
                "seasons_total": len(seasons),
                "frame_cap_per_det_season": cap,
                "trace": trace,
            },
            "processing": {
                "pipeline": "pipeline/sparkspipe",
                "process_version": PROCESS_VERSION,
                "cutout_size_deg": CUTOUT_SIZE_DEG,
                "grid": f"{N_PIX}x{N_PIX}",
                "note": "ver docs/pipeline/metodo.md",
            },
        },
    )
    thumb = None
    if coadds:
        pick = next((c for c in coadds if c.det >= 5), coadds[0])
        thumb = f"{target.id}/png/coadd_D{pick.det}_S{pick.season}.png"
    written = manifest.write_outputs(
        out_dir,
        target=target,
        manifest=man,
        frames=frames,
        coadds=coadds,
        diffs=diffs,
        medians=medians,
        catalogs=catalogs,
        scale_lo_hi=man["scales"],
        thumb_rel=thumb,
    )
    entry = manifest.index_entry(
        target,
        center_ra=center_ra,
        center_dec=center_dec,
        n_frames=len(frames),
        seasons=seasons_used,
        releases=releases,
        motion=motion_result,
        thumb=thumb,
        status=status,
    )
    _update_index(entry, releases)

    run_summary = {
        "target": target.id,
        "status": status,
        "blockers": blockers,
        "center_ra": center_ra,
        "center_dec": center_dec,
        "n_records": len(records),
        "n_selected": len(selected),
        "n_frames": len(frames),
        "failures": failures,
        "seasons": seasons_used,
        "releases": releases,
        "motion": motion_result,
        "discovery_trace": trace,
        "http_attempts": [a.as_dict() for a in client.attempts],
        "files": written,
        "seconds": round(time.time() - t_start, 1),
        "generated_utc": utc_now(),
    }
    (work / "run.json").write_text(json.dumps(run_summary, indent=1, ensure_ascii=False), encoding="utf-8")
    log(f"escrito {out_dir} en {time.time() - t_start:.0f} s")
    return run_summary


def _write_blocked(
    target: Target,
    work: Path,
    center_ra: float,
    center_dec: float,
    trace: list[dict[str, Any]],
    blockers: list[str],
    discovery_s: float,
    failures: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Manifiesto explicito para un campo que no se pudo completar."""
    out_dir = data_new_root() / target.id
    out_dir.mkdir(parents=True, exist_ok=True)
    man = {
        "schema": manifest.SCHEMA,
        "pipeline_version": manifest.PIPELINE_VERSION,
        "generated_utc": utc_now(),
        "status": "bloqueado",
        "blockers": blockers,
        "field": {
            "id": target.id,
            "name": target.name,
            "ra": center_ra,
            "dec": center_dec,
            "n": N_PIX,
            "pixel_arcsec": 6.15,
            "fov_arcmin": N_PIX * 6.15 / 60.0,
        },
        "releases": [],
        "seasons": [],
        "detectors": [],
        "scales": {},
        "coadds": [],
        "diffs": [],
        "frames": [],
        "flag_bits": {},
        "target": {
            "kind": target.kind,
            "expected": motion.expected_pm(target),
            "measured": None,
            "points": [],
            "reason": "; ".join(blockers),
        },
        "candidates": [],
        "files": {},
        "note": target.note,
        "kind": target.kind,
        "discovery": {"trace": trace},
    }
    (out_dir / "manifest.json").write_text(json.dumps(man, indent=1, ensure_ascii=False), encoding="utf-8")
    entry = manifest.index_entry(
        target,
        center_ra=center_ra,
        center_dec=center_dec,
        n_frames=0,
        seasons=[],
        releases=[],
        motion={"expected": motion.expected_pm(target), "measured": None, "reason": "; ".join(blockers)},
        thumb=None,
        status="bloqueado",
    )
    _update_index(entry, [])
    summary = {
        "target": target.id,
        "status": "bloqueado",
        "blockers": blockers,
        "failures": failures or [],
        "seconds": round(discovery_s, 1),
        "generated_utc": utc_now(),
    }
    (work / "run.json").write_text(json.dumps(summary, indent=1, ensure_ascii=False), encoding="utf-8")
    return summary


def _update_index(entry: dict[str, Any], releases: list[dict[str, Any]]) -> None:
    root = data_new_root()
    root.mkdir(parents=True, exist_ok=True)
    path = root / "index.json"
    payload: dict[str, Any]
    if path.exists():
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            payload = {"fields": [], "collections": [], "generated_utc": utc_now()}
    else:
        payload = {"fields": [], "collections": [], "generated_utc": utc_now()}
    fields = [f for f in payload.get("fields", []) if f.get("id") != entry["id"]]
    fields.append(entry)
    from .config import TARGETS

    order = {t.id: i for i, t in enumerate(TARGETS)}
    fields.sort(key=lambda f: order.get(f.get("id", ""), 99))
    payload["fields"] = fields
    payload["generated_utc"] = utc_now()
    payload["collections"] = [
        {
            "collection": r["collection"],
            "release": r["release"],
            "doi": r.get("doi"),
            "n_images": r["n_frames"],
        }
        for r in releases
    ]
    path.write_text(json.dumps(payload, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")


def run_all(
    target_ids: list[str] | None = None,
    *,
    cap: int = FRAME_CAP_PER_DET_SEASON,
    workers: int = MAX_WORKERS,
    limit: int | None = None,
) -> list[dict[str, Any]]:
    from .config import TARGETS

    wanted = target_ids or [t.id for t in TARGETS]
    out: list[dict[str, Any]] = []
    for target in TARGETS:
        if target.id not in wanted:
            continue
        out.append(run_target(target, cap=cap, workers=workers, limit=limit))
    return out
