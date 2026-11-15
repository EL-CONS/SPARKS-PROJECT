"""
Módulo de apilado (coadd) mínimo para recortes de SPHEREx.
Agrupa cuadros por detector (1 a 6) y temporada, y calcula el apilado robusto por mediana/media ponderada.
"""
import numpy as np
from typing import List, Tuple, Dict, Any

def compute_coadd(frames: List[np.ndarray]) -> Tuple[np.ndarray, float, float]:
    """
    Calcula el coadd sobre una lista de recortes 2D del mismo detector y temporada.
    Retorna: (coadd_2d, sigma_single, sigma_coadd)
    """
    if not frames:
        empty = np.zeros((64, 64), dtype=np.float32)
        return empty, 0.0, 0.0

    stack = np.stack(frames, axis=0) # shape (N, H, W)
    coadd = np.nanmedian(stack, axis=0)

    # Estimación de sigma individual y sigma del coadd usando MAD
    diffs = stack - coadd[np.newaxis, :, :]
    mad = np.nanmedian(np.abs(diffs - np.nanmedian(diffs)))
    sigma_single = float(1.4826 * mad) if mad > 0 else 0.01
    sigma_coadd = float(sigma_single / np.sqrt(max(1, len(frames))))

    return coadd.astype(np.float32), sigma_single, sigma_coadd
