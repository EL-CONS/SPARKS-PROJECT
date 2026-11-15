"""Lectura y escritura de los arreglos densos de ``data-sample/barnard``.

Formato comprobado contra los tamanos del manifiesto de Barnard (no supuesto):

* ``frames.bin``      355 x 64 x 64 int16 little-endian   (2 908 160 B)
* ``masks.bin``       355 x 64 x 64 uint8                 (1 454 080 B)
* ``coadds.bin``       18 x 64 x 64 float32 little-endian (294 912 B)
* ``coadds_sig.bin``   18 x 64 x 64 float32               (294 912 B)
* ``diffs.bin``        18 x 64 x 64 float32               (294 912 B)
* ``diffs_sig.bin``    18 x 64 x 64 float32               (294 912 B)
* ``medians.bin``       6 x 64 x 64 float32               (98 304 B)

El orden de ejes es (indice, y, x), con ``y`` creciendo hacia el sur y ``x``
hacia el este, igual que en el manifiesto. El endianness se verifica leyendo
las escalas del manifiesto: si el archivo fuera big-endian los valores serian
absurdos.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

import numpy as np

DTYPES = {
    "frames": np.dtype("<i2"),
    "masks": np.dtype("u1"),
    "coadds": np.dtype("<f4"),
    "coadds_sig": np.dtype("<f4"),
    "diffs": np.dtype("<f4"),
    "diffs_sig": np.dtype("<f4"),
    "medians": np.dtype("<f4"),
}


@dataclass
class BarnardBundle:
    manifest: dict
    frames: np.ndarray
    masks: np.ndarray
    coadds: np.ndarray
    coadds_sig: np.ndarray
    diffs: np.ndarray
    diffs_sig: np.ndarray
    medians: np.ndarray


def read_array(path: Path, kind: str, n_pix: int = 64) -> np.ndarray:
    dtype = DTYPES[kind]
    raw = np.fromfile(path, dtype=dtype)
    if raw.size % (n_pix * n_pix) != 0:
        raise ValueError(
            f"{path.name}: {raw.size} elementos no es multiplo de {n_pix}x{n_pix}"
        )
    n = raw.size // (n_pix * n_pix)
    return raw.reshape(n, n_pix, n_pix)


def load_barnard(folder: Path) -> BarnardBundle:
    folder = Path(folder)
    manifest = json.loads((folder / "manifest.json").read_text(encoding="utf-8"))
    n = int(manifest["field"]["n"])
    return BarnardBundle(
        manifest=manifest,
        frames=read_array(folder / "frames.bin", "frames", n),
        masks=read_array(folder / "masks.bin", "masks", n),
        coadds=read_array(folder / "coadds.bin", "coadds", n),
        coadds_sig=read_array(folder / "coadds_sig.bin", "coadds_sig", n),
        diffs=read_array(folder / "diffs.bin", "diffs", n),
        diffs_sig=read_array(folder / "diffs_sig.bin", "diffs_sig", n),
        medians=read_array(folder / "medians.bin", "medians", n),
    )


def write_array(path: Path, array: np.ndarray, kind: str) -> int:
    """Escribe en el mismo dtype/orden que Barnard. Devuelve los bytes escritos."""
    dtype = DTYPES[kind]
    path.parent.mkdir(parents=True, exist_ok=True)
    data = np.ascontiguousarray(array.astype(dtype, copy=False))
    data.tofile(path)
    return path.stat().st_size


def verify_barnard(folder: Path) -> dict:
    """Comprueba tamanos, dtypes y que las coadds caigan en las escalas del manifiesto.

    Las formas se comparan contra el numero de filas del propio manifiesto, no
    contra las de Barnard: ``data-new`` tiene menos cuadros y mas o menos
    temporadas, y aun asi debe ser coherente.
    """
    folder = Path(folder)
    b = load_barnard(folder)
    man = b.manifest
    n_frames = len(man.get("frames", []))
    n_coadds = len(man.get("coadds", []))
    n_diffs = len(man.get("diffs", []))
    n_det = len(man.get("scales", {})) or 6
    checks = {
        "frames_shape": list(b.frames.shape),
        "masks_shape": list(b.masks.shape),
        "coadds_shape": list(b.coadds.shape),
        "diffs_shape": list(b.diffs.shape),
        "medians_shape": list(b.medians.shape),
        "frames_dtype": str(b.frames.dtype),
        "coadds_dtype": str(b.coadds.dtype),
        "frames_manifest_rows": n_frames,
        "coadds_manifest_rows": n_coadds,
        "diffs_manifest_rows": n_diffs,
        "medians_manifest_rows": n_det,
    }
    # Las escalas del manifiesto deben contener los valores de la coadd.
    ok_scales = True
    for coadd in man.get("coadds", []):
        det = str(coadd["det"])
        scale = man.get("scales", {}).get(det)
        if scale is None:
            ok_scales = False
            checks.setdefault("scale_mismatches", []).append({"i": coadd["i"], "det": det, "error": "sin escala"})
            continue
        arr = b.coadds[coadd["i"]]
        finite = arr[np.isfinite(arr)]
        if finite.size and (finite.min() < scale["lo"] - 1e-3 or finite.max() > scale["hi"] + 1e-3):
            ok_scales = False
            checks.setdefault("scale_mismatches", []).append(
                {"i": coadd["i"], "min": float(finite.min()), "max": float(finite.max()), "scale": scale}
            )
    checks["coadds_inside_manifest_scales"] = ok_scales

    problems: list[str] = []
    if b.frames.shape[0] != n_frames:
        problems.append(f"frames {b.frames.shape[0]} != manifiesto {n_frames}")
    if b.masks.shape != b.frames.shape:
        problems.append(f"masks {b.masks.shape} != frames {b.frames.shape}")
    if b.coadds.shape[0] != n_coadds:
        problems.append(f"coadds {b.coadds.shape[0]} != manifiesto {n_coadds}")
    if b.coadds_sig.shape != b.coadds.shape:
        problems.append(f"coadds_sig {b.coadds_sig.shape} != coadds {b.coadds.shape}")
    if b.diffs.shape[0] != n_diffs:
        problems.append(f"diffs {b.diffs.shape[0]} != manifiesto {n_diffs}")
    if b.diffs_sig.shape != b.diffs.shape:
        problems.append(f"diffs_sig {b.diffs_sig.shape} != diffs {b.diffs.shape}")
    if b.medians.shape != (6, 64, 64):
        problems.append(f"medians {b.medians.shape} != (6, 64, 64)")
    if not ok_scales:
        problems.append("hay coadds fuera de las escalas del manifiesto")
    checks["problems"] = problems
    checks["all_ok"] = not problems
    return checks


if __name__ == "__main__":
    import sys

    folder = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("data-sample/barnard")
    print(json.dumps(verify_barnard(folder), indent=2, ensure_ascii=False))
