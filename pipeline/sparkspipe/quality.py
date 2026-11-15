"""Decodificacion de banderas y estimacion de fondo/ruido por cuadro.

La tabla de bits se toma del encabezado FLAGS del propio MEF
(``MSKNnnnn``/``MSKDnnnn``) y, si no esta, del manifiesto de Barnard.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import numpy as np

from .config import DEFAULT_FLAG_BITS

# Bits que no se usan para fotometria/coadd. SOURCE, FULLSAMPLE y REFERENCE
# NO se enmascaran: SOURCE marca pixeles de fuentes conocidas (incluido el
# propio objeto) y enmascararlo borraria la senal que queremos medir.
BAD_BIT_NAMES = {
    "transient",
    "overflow",
    "sur_error",
    "nonfunc",
    "dichroic",
    "missing_data",
    "hot",
    "cold",
    "nonlinear",
    "non_linear",
    "persist",
    "persistence",
    "outlier",
    "crosstalk",
    "ghost",
    "ghost_fpa",
    "ghost_ext",
    "streak",
    "bloom",
    "snowball",
    "halo",
    "phantom",
    "phanmiss",
}

# Codigos de la mascara que escribimos (uint8, suma de bits).
MASK_BAD = 1
MASK_EDGE = 2
MASK_HIGH_ZODI = 4
MASK_CLIPPED = 8


@dataclass
class FrameQuality:
    mask: np.ndarray
    bad_fraction: float
    bkg: float
    zodi: float
    sigma: float
    flag_bits: dict[str, str]
    counts: dict[str, int]


def flag_bits_from_header(header: Any) -> dict[str, str]:
    bits: dict[str, str] = {}
    if header is None:
        return dict(DEFAULT_FLAG_BITS)
    for key in header:
        if key.startswith("MSKN"):
            suffix = key[4:]
            if suffix.isdigit():
                bits[str(int(suffix))] = str(header[key]).strip()
    if not bits:
        return dict(DEFAULT_FLAG_BITS)
    return dict(sorted(bits.items(), key=lambda kv: int(kv[0])))


def bad_bit_numbers(flag_bits: dict[str, str]) -> set[int]:
    out: set[int] = set()
    for bit, name in flag_bits.items():
        norm = name.strip().lower().replace("-", "_").replace(" ", "_")
        if norm in BAD_BIT_NAMES:
            out.add(int(bit))
    return out


def count_flags(flags: np.ndarray | None, flag_bits: dict[str, str]) -> dict[str, int]:
    """Cuenta pixeles por bandera. Incluye SOURCE y las demas no malas."""
    if flags is None:
        return {}
    flags = np.asarray(flags).astype(np.int64, copy=False)
    counts: dict[str, int] = {}
    for bit, name in sorted(flag_bits.items(), key=lambda kv: int(kv[0])):
        hit = ((flags >> int(bit)) & 1).astype(bool)
        n = int(hit.sum())
        if n:
            counts[name] = n
    return counts


def build_mask(
    flags: np.ndarray | None,
    flag_bits: dict[str, str],
    *,
    edge_pixels: int = 2,
) -> tuple[np.ndarray, dict[str, int]]:
    """Convierte el mapa de banderas en una mascara uint8 propia."""
    if flags is None:
        return np.zeros((0, 0), dtype=np.uint8), {}
    flags = np.asarray(flags).astype(np.int64, copy=False)
    mask = np.zeros(flags.shape, dtype=np.uint8)
    counts: dict[str, int] = {}
    for bit in sorted(bad_bit_numbers(flag_bits)):
        hit = ((flags >> bit) & 1).astype(bool)
        counts[flag_bits.get(str(bit), str(bit))] = int(hit.sum())
        if hit.any():
            mask[hit] |= MASK_BAD
    ny, nx = flags.shape
    if edge_pixels > 0 and ny > 2 * edge_pixels and nx > 2 * edge_pixels:
        edge = np.zeros_like(mask, dtype=bool)
        edge[:edge_pixels, :] = True
        edge[-edge_pixels:, :] = True
        edge[:, :edge_pixels] = True
        edge[:, -edge_pixels:] = True
        mask[edge] |= MASK_EDGE
        counts["edge_border"] = int(edge.sum())
    return mask, counts


def estimate_quality(
    image: np.ndarray,
    variance: np.ndarray | None,
    zodi: np.ndarray | None,
    mask: np.ndarray,
    flag_bits: dict[str, str],
    counts: dict[str, int],
) -> FrameQuality:
    good = (mask & (MASK_BAD | MASK_EDGE)) == 0
    if not good.any():
        good = np.isfinite(image)
    vals = image[good & np.isfinite(image)]
    bkg = float(np.median(vals)) if vals.size else float("nan")
    if variance is not None:
        var = variance[good & np.isfinite(variance)]
        sigma = float(np.sqrt(np.median(var))) if var.size and np.median(var) > 0 else float("nan")
    else:
        sigma = float(1.4826 * np.median(np.abs(vals - bkg))) if vals.size else float("nan")
    if not np.isfinite(sigma) or sigma <= 0:
        sigma = float(1.4826 * np.median(np.abs(vals - bkg))) if vals.size else float("nan")
    zodi_val = float("nan")
    if zodi is not None:
        z = zodi[good & np.isfinite(zodi)]
        if z.size:
            zodi_val = float(np.median(z))
    return FrameQuality(
        mask=mask,
        bad_fraction=float(1.0 - good.mean()),
        bkg=bkg,
        zodi=zodi_val,
        sigma=sigma,
        flag_bits=flag_bits,
        counts=counts,
    )
