"""
Módulo de cálculo de diferencias residuales temporales entre coadds de SPHEREx.
Sustrae temporada de referencia de temporada posterior por detector.
"""
import numpy as np
from typing import Tuple

def compute_diff(coadd_a: np.ndarray, coadd_b: np.ndarray) -> Tuple[np.ndarray, float]:
    """
    Resta coadd_b (más reciente) - coadd_a (referencia anterior).
    Alinea fondos medianos antes de restar.
    Retorna: (diff_2d, sigma_diff)
    """
    clean_a = np.nan_to_num(coadd_a, nan=0.0)
    clean_b = np.nan_to_num(coadd_b, nan=0.0)

    # Resta de fondo mediano de cielo
    bg_a = np.median(clean_a)
    bg_b = np.median(clean_b)
    diff = (clean_b - bg_b) - (clean_a - bg_a)

    mad = np.median(np.abs(diff - np.median(diff)))
    sigma_diff = float(1.4826 * mad) if mad > 0 else 0.01

    return diff.astype(np.float32), sigma_diff
