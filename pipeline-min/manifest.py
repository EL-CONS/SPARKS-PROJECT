"""
Generador de manifest.json bajo el esquema 1 de SPARKS.
Garantiza compatibilidad completa con data/loader.ts y data/contract.ts.
"""
from typing import Dict, Any, List
from datetime import datetime

def build_manifest(
    field_id: str,
    field_name: str,
    ra: float,
    dec: float,
    seasons: List[Dict[str, Any]],
    scales: Dict[str, Dict[str, float]],
    coadds: List[Dict[str, Any]],
    diffs: List[Dict[str, Any]],
    frames: List[Dict[str, Any]],
    is_subset: bool = True
) -> Dict[str, Any]:
    """
    Construye el diccionario de manifiesto para el campo procesado.
    """
    now_utc = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

    manifest = {
        "schema": 1,
        "pipeline_version": "0.4.0-min",
        "generated_utc": now_utc,
        "note": "subconjunto de cuadros" if is_subset else "cobertura completa",
        "field": {
            "id": field_id,
            "name": field_name,
            "ra": ra,
            "dec": dec,
            "n": 64,
            "pixel_arcsec": 6.15,
            "fov_arcmin": 6.56,
            "cutout_px": 64,
            "wcs": {
                "ctype": ["RA---TAN", "DEC--TAN"],
                "crval": [ra, dec],
                "crpix": [32.5, 32.5],
                "cdelt": [-0.001708, 0.001708]
            }
        },
        "releases": [
            {
                "collection": "spherex_dr1",
                "release": "DR1",
                "doi": "10.26131/IRSA652",
                "n_frames": len(frames),
                "versions": ["l2b-v24", "l2b-v27"]
            }
        ],
        "seasons": seasons,
        "detectors": [1, 2, 3, 4, 5, 6],
        "scales": scales,
        "coadds": coadds,
        "diffs": diffs,
        "frames": frames,
        "target": {
            "source": {
                "id": field_id,
                "ra": ra,
                "dec": dec
            },
            "kind": "variable" if field_id in ["rwaur", "rdra"] else "mover",
            "points": []
        }
    }
    return manifest
