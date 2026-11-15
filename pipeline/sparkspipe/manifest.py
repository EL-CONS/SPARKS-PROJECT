"""Write ``data-new/<id>/`` in the same format as ``data-sample/barnard``.

Dense array names, shapes and dtypes are preserved. The only difference is in
the encoding of ``frames.bin``: Barnard does not document its own and we could
not reproduce it, so here we store a normalized version made explicit in the
manifest itself::

    int16_value = round((image - bkg) / sigma * 1000)

so that ``image = bkg + value/1000 * sigma`` using ``bkg`` and ``sigma`` from
the corresponding row of ``manifest.json``. Out-of-range pixels are clipped to
+-32767. Everything else (coadds, differences, medians) is in the same physical
units as the manifest (MJy/sr).
"""

from __future__ import annotations

import json
import math
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Iterable

import numpy as np
from PIL import Image

from . import binfmt
from .config import CUTOUT_PX, FOV_ARCMIN, N_PIX, PIXEL_ARCSEC, REFERENCE_MJD, Target
from .http import sha256_file, utc_now

SCHEMA = 1
PIPELINE_VERSION = "0.1.0"
MJD_EPOCH = datetime(1858, 11, 17, tzinfo=timezone.utc)
FRAME_GAIN = 1000.0
FRAME_CLIP = 32767

# Constants from Barnard's manifest that do not depend on the target.
COLD_BANDS_UM = {
    "short": [1.1, 1.6],
    "long": [4.4, 5.0],
    "ch4": [3.15, 3.45],
    "ch4_cont": [3.9, 4.1],
}
BLACKBODY_RATIO_4P7_1P35 = {
    "300": 2352929397.016231,
    "600": 7512.780675,
    "1000": 49.498582,
    "3000": 0.452788,
    "6000": 0.174726,
}


def mjd_to_iso(mjd: float) -> str:
    try:
        return (MJD_EPOCH + timedelta(days=float(mjd))).strftime("%Y-%m-%d %H:%M")
    except Exception:  # noqa: BLE001
        return ""


def _plain(value: Any) -> Any:
    """Convert numpy types to JSON types and NaN/inf to None."""
    if isinstance(value, np.generic):
        value = value.item()
    if isinstance(value, float) and not math.isfinite(value):
        return None
    if isinstance(value, dict):
        return {str(k): _plain(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [_plain(v) for v in value]
    return value


def _json_dump(path: Path, payload: Any) -> int:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(_plain(payload), indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    return path.stat().st_size


def stretch_uint8(data: np.ndarray, lo: float, hi: float, *, gamma: float = 0.5) -> np.ndarray:
    data = np.asarray(data, dtype=np.float64)
    if not np.isfinite(hi) or not np.isfinite(lo) or hi <= lo:
        lo, hi = float(np.nanmin(data)), float(np.nanmax(data))
    if not np.isfinite(hi) or hi <= lo:
        hi = lo + 1.0
    norm = (data - lo) / (hi - lo)
    norm = np.clip(np.nan_to_num(norm, nan=0.0), 0.0, 1.0)
    if gamma != 1.0:
        norm = norm**gamma
    return (norm * 255.0 + 0.5).astype(np.uint8)


def write_png(
    path: Path,
    data: np.ndarray,
    lo: float,
    hi: float,
    *,
    out_px: int = 256,
    gamma: float = 0.5,
) -> int:
    path.parent.mkdir(parents=True, exist_ok=True)
    img = Image.fromarray(stretch_uint8(data, lo, hi, gamma=gamma), mode="L")
    if out_px and img.size != (out_px, out_px):
        img = img.resize((out_px, out_px), Image.Resampling.BILINEAR)
    img.save(path, format="PNG", optimize=True)
    return path.stat().st_size


def frame_to_int16(image: np.ndarray, bkg: float, sigma: float) -> np.ndarray:
    if not np.isfinite(sigma) or sigma <= 0:
        scale = 1.0
    else:
        scale = FRAME_GAIN / sigma
    values = np.nan_to_num((image - bkg) * scale, nan=0.0)
    return np.clip(np.round(values), -FRAME_CLIP, FRAME_CLIP).astype(np.int16)


def detector_scales(frames: Iterable[dict], coadds: Iterable[Any]) -> dict[str, dict[str, float]]:
    """Per-detector display limits, as in Barnard.

    ``lo``/``hi`` are the 0.5 and 99.5 percentiles of the detector's coadds,
    widened to always contain the full image. ``noise`` is the median noise of
    the coadds.
    """
    by_det: dict[int, list[np.ndarray]] = {}
    sigmas: dict[int, list[float]] = {}
    for c in coadds:
        by_det.setdefault(int(c.det), []).append(np.asarray(c.image, dtype=float))
        sigmas.setdefault(int(c.det), []).append(float(np.nanmedian(c.sigma)))
    for fr in frames:
        by_det.setdefault(int(fr["det"]), []).append(np.asarray(fr["image"], dtype=float))
    scales: dict[str, dict[str, float]] = {}
    for det, arrays in sorted(by_det.items()):
        finite = [a[np.isfinite(a)] for a in arrays if np.isfinite(a).any()]
        if not finite:
            continue
        allv = np.concatenate(finite)
        if allv.size == 0:
            continue
        lo = float(np.percentile(allv, 0.5))
        hi = float(np.percentile(allv, 99.5))
        lo = min(lo, float(allv.min()))
        hi = max(hi, float(allv.max()))
        if hi <= lo:
            hi = lo + 1.0
        noise = float(np.nanmedian(sigmas.get(det, [float("nan")])))
        scales[str(det)] = {"lo": lo, "hi": hi, "noise": noise}
    return scales


def measure_registration(motion: dict, pixel_arcsec: float = PIXEL_ARCSEC) -> dict[str, Any]:
    """Scatter of the centroids around the proper-motion model.

    This is not a relative registration to reference stars: the DR1 WCS is
    already registered. It measures what remains after subtracting the PM
    model; it includes centroid noise and any registration error, and is
    declared as such.
    """
    points = [p for p in motion.get("points", []) if p.get("use")]
    measured = motion.get("measured") or {}
    out: dict[str, Any] = {
        "method": "residuos de los centroides frente al modelo de movimiento propio",
        "note": "no se hace registro relativo a estrellas de referencia; se usa la WCS de DR1",
        "n_points": len(points),
        "dx_rms_px": None,
        "dy_rms_px": None,
        "radial_rms_px": None,
    }
    if not points or not measured:
        return out
    mu_ra = measured.get("mu_ra")
    mu_dec = measured.get("mu_dec")
    mjd0 = min(p["mjd"] for p in points)
    # Points are already on the grid; prediction is in arcsec.
    dra_model = []
    ddec_model = []
    for p in points:
        dt = (p["mjd"] - mjd0) / 365.25
        dra_model.append((mu_ra or 0.0) * dt)
        ddec_model.append((mu_dec or 0.0) * dt)
    # Without the intercept the absolute residual cannot be reconstructed; we
    # use the scatter of positions relative to the first point.
    x = np.array([p["x"] for p in points])
    y = np.array([p["y"] for p in points])
    t = np.array([(p["mjd"] - mjd0) / 365.25 for p in points])
    ax = np.polyfit(t, x, 1)
    ay = np.polyfit(t, y, 1)
    rx = x - np.polyval(ax, t)
    ry = y - np.polyval(ay, t)
    out["dx_rms_px"] = float(np.sqrt(np.mean(rx**2)))
    out["dy_rms_px"] = float(np.sqrt(np.mean(ry**2)))
    out["radial_rms_px"] = float(np.sqrt(np.mean(rx**2 + ry**2)))
    out["arcsec_per_px"] = float(pixel_arcsec)
    return out


def build_manifest(
    target: Target,
    *,
    center_ra: float,
    center_dec: float,
    center_mjd: float,
    seasons: list[dict[str, Any]],
    frames: list[dict[str, Any]],
    coadds: list[Any],
    diffs: list[Any],
    motion: dict[str, Any],
    files: dict[str, str],
    releases: list[dict[str, Any]],
    flag_bits: dict[str, str],
    status: str,
    blockers: list[str],
    timings: dict[str, float],
    note: str,
    catalogs: dict[str, Any] | None = None,
    extras: dict[str, Any] | None = None,
    cold: dict[str, Any] | None = None,
) -> dict[str, Any]:
    detectors = sorted({int(f["det"]) for f in frames})
    scales = detector_scales(frames, coadds)
    frame_rows: list[dict[str, Any]] = []
    for i, fr in enumerate(frames):
        frame_rows.append(
            {
                "i": i,
                "obs_id": fr["obs_id"],
                "det": int(fr["det"]),
                "season": int(fr["season"]),
                "mjd": round(float(fr["mjd"]), 6),
                "date": mjd_to_iso(fr["mjd"]),
                "lam": round(float(fr["lam"]), 6) if fr.get("lam") else None,
                "dlam": round(float(fr["dlam"]), 6) if fr.get("dlam") else None,
                "release": fr["release"],
                "version": fr.get("version", ""),
                "exptime": round(float(fr.get("exptime") or 0.0), 4),
                "bkg": round(float(fr["bkg"]), 6),
                "zodi": round(float(fr["zodi"]), 6) if np.isfinite(fr.get("zodi", float("nan"))) else None,
                "sigma": round(float(fr["sigma"]), 6),
                "flag_pixels": {k: int(v) for k, v in (fr.get("flag_pixels") or {}).items()},
                "pix_total": int(fr.get("pix_total", N_PIX * N_PIX)),
                "png": f"png/frame_{i:04d}.png",
                "coverage": round(float(fr.get("coverage", 1.0)), 4),
                "status": fr.get("status", "ok"),
            }
        )

    coadd_rows = [c.as_dict(i, f"png/coadd_D{c.det}_S{c.season}.png") for i, c in enumerate(coadds)]
    diff_rows = [d.as_dict(i) for i, d in enumerate(diffs)]

    measured = motion.get("measured")
    expected = motion.get("expected")
    target_block: dict[str, Any] = {
        "source": {
            "ra": center_ra,
            "dec": center_dec,
            "reference_mjd": REFERENCE_MJD,
            "catalog_ra": target.ra,
            "catalog_dec": target.dec,
            "catalog_epoch": target.coord_epoch_label,
            "catalog_source": target.source,
            "gaia_source_id": target.gaia_source_id,
            "in_gaia": target.in_gaia,
        },
        "kind": target.kind,
        "gaia_check": {
            "in_gaia": target.in_gaia,
            "gaia_id": target.gaia_source_id,
            "sep_arcsec": 0.0 if target.in_gaia else None,
            "note": "sin contraparte Gaia" if not target.in_gaia else "source_id de Gaia DR3",
        },
        "expected": expected,
        "measured": measured,
        "comparison": motion.get("comparison"),
        "reason": motion.get("reason", ""),
        "n_used": motion.get("n_used", 0),
        "n_seasons_used": motion.get("n_seasons_used", 0),
        "method": motion.get("method", ""),
        "points": motion.get("points", []),
        "spectrum": [],
        "cold": cold
        or {
            "short_mjy": None,
            "short_err": None,
            "long_mjy": None,
            "long_err": None,
            "n_short": 0,
            "n_long": 0,
            "ratio": None,
            "ratio_kind": "sin datos",
            "methane_depth": None,
            "methane_err": None,
        },
        "snr": {},
        "lightcurve": None,
        "n_refs": {"gaia": 1 if target.in_gaia else 0, "catwise": 0},
        "catalogs": catalogs or {},
    }

    manifest = {
        "schema": SCHEMA,
        "pipeline_version": PIPELINE_VERSION,
        "generated_utc": utc_now(),
        "status": status,
        "blockers": blockers,
        "field": {
            "id": target.id,
            "name": target.name,
            "ra": center_ra,
            "dec": center_dec,
            "n": N_PIX,
            "pixel_arcsec": PIXEL_ARCSEC,
            "fov_arcmin": FOV_ARCMIN,
            "cutout_px": CUTOUT_PX,
            "wcs": {
                "ctype": ["RA---TAN", "DEC--TAN"],
                "crval": [center_ra, center_dec],
                "crpix": [(N_PIX + 1) / 2.0, (N_PIX + 1) / 2.0],
                "cdelt": [-PIXEL_ARCSEC / 3600.0, PIXEL_ARCSEC / 3600.0],
            },
            "reference_mjd": REFERENCE_MJD,
            "center_mjd": center_mjd,
        },
        "releases": releases,
        "seasons": seasons,
        "detectors": detectors,
        "scales": scales,
        "coadds": coadd_rows,
        "diffs": diff_rows,
        "frames": frame_rows,
        "flag_bits": {str(k): str(v) for k, v in sorted(flag_bits.items(), key=lambda kv: int(kv[0]))},
        "frames_encoding": {
            "dtype": "int16 little-endian",
            "formula": "valor = round((imagen - bkg) / sigma * 1000), recortado a +-32767",
            "inverse": "imagen = bkg + valor / 1000 * sigma",
            "units": "MJy/sr",
        },
        "target": target_block,
        "candidates": [],
        "candidates_note": "la busqueda de candidatos no forma parte de esta canalizacion; ver el detector de Cons",
        "cold_bands_um": COLD_BANDS_UM,
        "blackbody_ratio_4p7_1p35": BLACKBODY_RATIO_4P7_1P35,
        "timings": {k: round(float(v), 2) for k, v in timings.items()},
        "registration": measure_registration(motion),
        "files": files,
        "note": note,
        "caveats": list(getattr(target, "caveats", ())),
        "kind": target.kind,
        "ml": {
            "model": None,
            "decision": "rule",
            "note": "sin modelo de ML en esta canalizacion; los datos quedan listos para el detector de Cons",
        },
    }
    if extras:
        manifest.update(extras)
    return manifest


def build_catalogs(target: Target, gaia_row: dict[str, Any] | None, *, service: str, queried: str) -> dict[str, Any]:
    sources: list[dict[str, Any]] = []
    error = None
    if gaia_row:
        sources.append(gaia_row)
    elif target.in_gaia:
        error = "consulta Gaia no ejecutada en esta corrida"
    else:
        error = "sin contraparte Gaia DR3 conocida"
    return {
        "gaia": {
            "epoch_mjd": 57388.5,
            "service": service,
            "queried": queried,
            "error": error,
            "sources": sources,
        }
    }


def index_entry(
    target: Target,
    *,
    center_ra: float,
    center_dec: float,
    n_frames: int,
    seasons: list[dict[str, Any]],
    releases: list[dict[str, Any]],
    motion: dict[str, Any],
    thumb: str | None,
    status: str,
) -> dict[str, Any]:
    measured = motion.get("measured") or {}
    expected = motion.get("expected") or {}
    return {
        "id": target.id,
        "name": target.name,
        "ra": center_ra,
        "dec": center_dec,
        "catalog_ra": target.ra,
        "catalog_dec": target.dec,
        "catalog_epoch": target.coord_epoch_label,
        "reference_mjd": REFERENCE_MJD,
        "kind": target.kind,
        "note": target.note,
        "n_frames": int(n_frames),
        "seasons": len(seasons),
        "releases": sorted({r["release"] for r in releases}),
        "mu_measured": measured.get("mu"),
        "mu_err": measured.get("mu_err"),
        "pa": measured.get("pa_deg"),
        "mu_expected": expected.get("mu"),
        "pa_expected": expected.get("pa_deg"),
        "in_gaia": bool(target.in_gaia),
        "thumb": thumb,
        "status": status,
        "reason": motion.get("reason", ""),
    }


def write_bins(
    out_dir: Path,
    *,
    frames: list[dict[str, Any]],
    coadds: list[Any],
    diffs: list[Any],
    medians: np.ndarray,
) -> dict[str, str]:
    """Write the folder's .bin files and return the ``files`` map."""
    frames_int = np.stack(
        [frame_to_int16(fr["image"], float(fr["bkg"]), float(fr["sigma"])) for fr in frames]
    ) if frames else np.zeros((0, N_PIX, N_PIX), dtype=np.int16)
    masks = np.stack([fr["mask"].astype(np.uint8) for fr in frames]) if frames else np.zeros(
        (0, N_PIX, N_PIX), dtype=np.uint8
    )
    coadds_arr = np.stack([np.asarray(c.image, dtype=np.float32) for c in coadds]) if coadds else np.zeros(
        (0, N_PIX, N_PIX), dtype=np.float32
    )
    coadds_sig = np.stack([np.asarray(c.sigma, dtype=np.float32) for c in coadds]) if coadds else np.zeros(
        (0, N_PIX, N_PIX), dtype=np.float32
    )
    diffs_arr = np.stack([np.asarray(d.image, dtype=np.float32) for d in diffs]) if diffs else np.zeros(
        (0, N_PIX, N_PIX), dtype=np.float32
    )
    diffs_sig = np.stack([np.asarray(d.sigma, dtype=np.float32) for d in diffs]) if diffs else np.zeros(
        (0, N_PIX, N_PIX), dtype=np.float32
    )
    medians = np.asarray(medians, dtype=np.float32)

    files = {
        "coadds": "coadds.bin",
        "coadds_sig": "coadds_sig.bin",
        "diffs": "diffs.bin",
        "diffs_sig": "diffs_sig.bin",
        "medians": "medians.bin",
        "frames": "frames.bin",
        "masks": "masks.bin",
        "catalogs": "catalogs.json",
    }
    binfmt.write_array(out_dir / "frames.bin", frames_int, "frames")
    binfmt.write_array(out_dir / "masks.bin", masks, "masks")
    binfmt.write_array(out_dir / "coadds.bin", coadds_arr, "coadds")
    binfmt.write_array(out_dir / "coadds_sig.bin", coadds_sig, "coadds_sig")
    binfmt.write_array(out_dir / "diffs.bin", diffs_arr, "diffs")
    binfmt.write_array(out_dir / "diffs_sig.bin", diffs_sig, "diffs_sig")
    binfmt.write_array(out_dir / "medians.bin", medians, "medians")
    return files


def write_outputs(
    out_dir: Path,
    *,
    target: Target,
    manifest: dict[str, Any],
    frames: list[dict[str, Any]],
    coadds: list[Any],
    diffs: list[Any],
    medians: np.ndarray,
    catalogs: dict[str, Any],
    scale_lo_hi: dict[str, dict[str, float]] | None = None,
    thumb_rel: str | None = None,
) -> dict[str, Any]:
    """Write PNG, JSON and .bin files. Returns a summary with byte sizes."""
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "png").mkdir(exist_ok=True)
    written: dict[str, int] = {}

    scales = scale_lo_hi or manifest.get("scales") or {}
    for i, fr in enumerate(frames):
        det = str(int(fr["det"]))
        scale = scales.get(det, {"lo": -1.0, "hi": 1.0})
        written[f"png/frame_{i:04d}.png"] = write_png(
            out_dir / "png" / f"frame_{i:04d}.png",
            fr["image"],
            float(scale["lo"]),
            float(scale["hi"]),
            out_px=128,
        )
    for c in coadds:
        det = str(int(c.det))
        scale = scales.get(det, {"lo": -1.0, "hi": 1.0})
        written[f"png/coadd_D{c.det}_S{c.season}.png"] = write_png(
            out_dir / "png" / f"coadd_D{c.det}_S{c.season}.png",
            c.image,
            float(scale["lo"]),
            float(scale["hi"]),
            out_px=256,
        )

    files = write_bins(out_dir, frames=frames, coadds=coadds, diffs=diffs, medians=medians)
    written["catalogs.json"] = _json_dump(out_dir / "catalogs.json", catalogs)
    manifest = dict(manifest)
    manifest["files"] = files
    written["manifest.json"] = _json_dump(out_dir / "manifest.json", manifest)

    hashes = {name: sha256_file(out_dir / name) for name in files.values() if (out_dir / name).exists()}
    return {
        "dir": str(out_dir),
        "bytes": written,
        "total_bytes": sum(written.values()),
        "sha256": hashes,
    }
