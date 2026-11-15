"""Genera data-new/results.json con el mismo esquema que data-sample/results.json.

Lee los manifiestos de data-new/<id>/ y el index.json. No inventa bloques que
esta canalizacion no produce: los campos de ML y del split de candidatos se
declaran como no ejecutados, con una nota, en lugar de copiar los numeros del
equipo.

Uso:
    python make_results.py
"""

from __future__ import annotations

import hashlib
import json
import math
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data-new"
IDS = ("wise0855", "epsindib", "rwaur", "rdra")


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")


def _round(value, nd=3):
    if value is None:
        return None
    try:
        v = float(value)
    except (TypeError, ValueError):
        return None
    if not math.isfinite(v):
        return None
    return round(v, nd)


def _manifest(field_id: str) -> dict:
    path = DATA / field_id / "manifest.json"
    return json.loads(path.read_text(encoding="utf-8"))


def _catalog(man: dict) -> dict:
    expected = (man.get("target") or {}).get("expected") or {}
    catalogs = (man.get("target") or {}).get("catalogs") or {}
    gaia_sources = ((catalogs.get("gaia") or {}).get("sources") or [])
    if gaia_sources:
        g = gaia_sources[0]
        mu = None
        if g.get("pmra") is not None and g.get("pmdec") is not None:
            mu = math.hypot(float(g["pmra"]), float(g["pmdec"])) / 1000.0
        return {
            "name": "Gaia DR3",
            "mu": _round(mu),
            "pa": _round(
                math.degrees(math.atan2(float(g["pmra"]), float(g["pmdec"]))) % 360.0
                if g.get("pmra") is not None and g.get("pmdec") is not None
                else None
            ),
            "mu_err": None,
        }
    return {
        "name": expected.get("catalog") or "catalogo del index",
        "mu": _round(expected.get("mu")),
        "pa": _round(expected.get("pa_deg")),
        "mu_err": _round(expected.get("mu_err")),
    }


def _snr(man: dict, field_id: str) -> dict:
    """SNR por detector: mediana por cuadro y cociente del flujo combinado."""
    out: dict[str, dict] = {}
    points_path = ROOT / "pipeline" / "_work" / field_id / "cold_points.json"
    points = []
    if points_path.exists():
        points = json.loads(points_path.read_text(encoding="utf-8"))
    if not points:
        return out
    for det in sorted({int(p["det"]) for p in points}):
        pts = [p for p in points if int(p["det"]) == det]
        snrs = [
            float(p["flux_mjy"]) / float(p["flux_err_mjy"])
            for p in pts
            if p.get("flux_err_mjy")
        ]
        flux = [float(p["flux_mjy"]) for p in pts]
        err = [float(p["flux_err_mjy"]) for p in pts]
        good = [(f, e) for f, e in zip(flux, err) if e > 0 and math.isfinite(f)]
        if not good:
            continue
        w = [1.0 / e**2 for _, e in good]
        stacked_flux = sum(wi * f for wi, (f, _) in zip(w, good)) / sum(w)
        stacked_err = math.sqrt(1.0 / sum(w))
        out[str(det)] = {
            "single": _round(sorted(snrs)[len(snrs) // 2], 2) if snrs else None,
            "stacked": _round(stacked_flux / stacked_err, 2) if stacked_err else None,
            "n": len(pts),
        }
    return out


def _coadd_noise(man: dict) -> list[dict]:
    out = []
    for c in man.get("coadds") or []:
        out.append(
            {
                "det": int(c["det"]),
                "season": int(c["season"]),
                "n": int(c.get("n_frames") or 0),
                "single": _round(c.get("sigma_single"), 4),
                "coadd": _round(c.get("sigma_coadd"), 4),
                "gain": _round(c.get("snr_gain"), 1),
            }
        )
    return out


def _motion(man: dict) -> dict | None:
    t = man.get("target") or {}
    measured = t.get("measured")
    if not measured:
        return None
    return {
        "mu": _round(measured.get("mu"), 2),
        "mu_err": _round(measured.get("mu_err"), 2),
        "pa": _round(measured.get("pa_deg"), 1),
        "pa_err": _round(measured.get("pa_err_deg"), 1),
        "n_points": int(measured.get("n_points") or 0),
        "detectors": [int(d) for d in measured.get("detectors") or []],
        "baseline_yr": _round(measured.get("baseline_yr"), 2),
    }


def _agreement(man: dict) -> float | None:
    t = man.get("target") or {}
    measured = t.get("measured") or {}
    expected = t.get("expected") or {}
    mu, err, exp = measured.get("mu"), measured.get("mu_err"), expected.get("mu")
    if mu is None or not err or exp is None:
        return None
    return _round(abs(float(mu) - float(exp)) / float(err), 1)


def _cold(man: dict) -> dict | None:
    cold = (man.get("target") or {}).get("cold") or {}
    if cold.get("ratio") is None and cold.get("long_mjy") is None:
        return None
    return {
        "ratio": _round(cold.get("ratio"), 2),
        "ratio_kind": cold.get("ratio_kind") or "sin datos",
        "methane_depth": _round(cold.get("methane_depth"), 2),
        "methane_err": _round(cold.get("methane_err"), 2),
        "long_mjy": _round(cold.get("long_mjy"), 3),
        "short_mjy": _round(cold.get("short_mjy"), 3),
    }


def _field(field_id: str) -> dict:
    man = _manifest(field_id)
    target = man.get("target") or {}
    entry = {
        "name": (man.get("field") or {}).get("name"),
        "kind": man.get("kind"),
        "gallery": False,
        "n_images": len(man.get("frames") or []),
        "n_seasons": len(man.get("seasons") or []),
        "releases": sorted({str(r.get("release")) for r in man.get("releases") or []}),
        "motion": _motion(man),
        "catalog": _catalog(man),
        "agreement_sigma": _agreement(man),
        "in_gaia": bool((man.get("target") or {}).get("source", {}).get("in_gaia")),
        "nearest_gaia_arcsec": None,
        "cold": _cold(man),
        "snr": _snr(man, field_id),
        "coadd_noise": _coadd_noise(man),
        "registration_max_px": _round((man.get("registration") or {}).get("radial_rms_px"), 3),
        "status": man.get("status"),
        "reason": target.get("reason") or "",
    }
    if entry["kind"] == "variable":
        # La curva de luz por alas de la PSF no se implemento en esta
        # canalizacion: la clave existe con null para que el formato coincida
        # con data-sample, sin inventar numeros.
        entry["lightcurve"] = target.get("lightcurve")
    return entry


def _live(fields: dict) -> dict:
    man = _manifest("wise0855")
    field = man.get("field") or {}
    disc = man.get("discovery") or {}
    return {
        "label": "WISE 0855 (D5+D6 completos)",
        "ra": _round(field.get("ra"), 6),
        "dec": _round(field.get("dec"), 6),
        "fov_arcmin": _round(field.get("fov_arcmin"), 2),
        "detectors": [5, 6],
        "max_per_group": None,
        "n_images": (fields.get("wise0855") or {}).get("n_images"),
        "seconds": _round((man.get("timings") or {}).get("download_s"), 1),
        "measured_utc": man.get("generated_utc"),
        "note": (
            "todos los cuadros de D5 y D6; el resto de detectores se usa solo "
            "para fotometria de apoyo con tope por temporada"
        ),
    }


def _sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def build() -> dict:
    fields = {fid: _field(fid) for fid in IDS if (DATA / fid / "manifest.json").exists()}
    # Conteo por coleccion sumando los manifiestos de los cuatro campos. El
    # index.json guarda solo las colecciones del ultimo campo ejecutado.
    by_collection: dict[str, int] = {}
    for fid in fields:
        for rel in _manifest(fid).get("releases") or []:
            key = str(rel.get("collection"))
            by_collection[key] = by_collection.get(key, 0) + int(rel.get("n_frames") or 0)
    n_images = sum(by_collection.values())

    frozen = {}
    for rel in ("sparkspipe/run.py", "sparkspipe/motion.py", "sparkspipe/photometry.py", "sparkspipe/manifest.py"):
        p = ROOT / "pipeline" / rel
        if p.exists():
            frozen[f"pipeline/{rel}"] = _sha256(p)

    return {
        "generated_utc": utc_now(),
        "archive": {
            "queried_utc": utc_now(),
            "service": "IRSA SIA2 (conteo por coleccion en data-new/index.json)",
            "by_collection": by_collection,
            "n_science_images": n_images,
            "definition": (
                "cuadros seleccionados por SIA2 para los cuatro campos, sumados "
                "por coleccion a partir de los manifiestos; no es el censo "
                "global del archivo ni el numero de cuadros descargados"
            ),
        },
        "fields": fields,
        "ml": {
            "protocol": None,
            "train_fields": [],
            "validation_fields": [],
            "sat_frac": None,
            "train_counts": None,
            "test_counts": None,
            "f1_ml": None,
            "f1_rule": None,
            "completeness_ml": None,
            "completeness_rule": None,
            "saturated_completeness_ml": None,
            "saturated_completeness_rule": None,
            "purity_ml": None,
            "purity_rule": None,
            "note": "no ejecutado en esta canalizacion: es fotometria y astrometria, no el detector de candidatos",
        },
        "development_check": {
            "n": 0,
            "detected": 0,
            "rule_mover": 0,
            "ml_mover": 0,
            "either_mover": 0,
            "fields": [],
            "ran_utc": None,
            "n_candidates": 0,
            "rule_other_mover": 0,
            "ml_other_mover": 0,
            "objects": [],
            "note": "no ejecutado en esta canalizacion",
        },
        "validation": {
            "n": 0,
            "detected": 0,
            "rule_mover": 0,
            "ml_mover": 0,
            "either_mover": 0,
            "fields": [],
            "ran_utc": None,
            "n_candidates": 0,
            "rule_other_mover": 0,
            "ml_other_mover": 0,
            "objects": [],
            "note": "no ejecutado en esta canalizacion",
        },
        "final_test": {
            "n": 0,
            "detected": 0,
            "rule_mover": 0,
            "ml_mover": 0,
            "either_mover": 0,
            "fields": [],
            "ran_utc": None,
            "n_candidates": 0,
            "rule_other_mover": 0,
            "ml_other_mover": 0,
            "objects": [],
            "note": "no ejecutado en esta canalizacion",
        },
        "protocol": {
            "seed_pick": None,
            "seed_split": None,
            "pool": None,
            "qualifying": None,
            "validation": [],
            "final_test": [],
            "note": "no aplica: esta canalizacion no hace el split de desarrollo y prueba",
        },
        "live": _live(fields),
        "frozen": {"frozen_utc": utc_now(), "sha256": frozen},
        "note": (
            "Resultados de la canalizacion pipeline/sparkspipe sobre cuatro campos. "
            "Los bloques de ML y de split de candidatos no se ejecutaron aqui."
        ),
    }


def main() -> int:
    payload = build()
    out = DATA / "results.json"
    out.write_text(json.dumps(payload, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"escrito {out} ({out.stat().st_size} B, {len(payload['fields'])} campos)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
