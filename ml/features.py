"""
Módulo de extracción de variables físicas sobre diferencias residuales de SPHEREx.
Calcula balance de lóbulos dipole, separación de centroides, S/N y consistencia.
"""
from typing import Dict, Any, Tuple
import numpy as np

def extract_patch_features(diff_patch: np.ndarray, noise_sigma: float = 0.01) -> Dict[str, float]:
    """
    Calcula variables morfológicas y fotométricas sobre un recorte de diferencia (ej. 16x16 o 24x24).
    diff_patch: array 2D centrado en el candidato o región de interés.
    noise_sigma: estimación del ruido residual local.
    """
    clean_patch = np.nan_to_num(diff_patch, nan=0.0)
    
    # Lóbulos positivo y negativo
    pos_mask = clean_patch > 2.0 * noise_sigma
    neg_mask = clean_patch < -2.0 * noise_sigma
    
    pos_flux = float(np.sum(clean_patch[pos_mask])) if np.any(pos_mask) else 0.0
    neg_flux = float(np.abs(np.sum(clean_patch[neg_mask]))) if np.any(neg_mask) else 0.0
    
    total_abs_flux = float(np.sum(np.abs(clean_patch)))
    net_flux = float(np.sum(clean_patch))
    
    # Balance de dipolo: para un dipolo puro de movimiento, pos_flux y neg_flux son similares
    # ratio_balance está cerca de 1.0 si es dipolo perfecto, o 0.0 si es monopolo (variable)
    denom = (pos_flux + neg_flux)
    flux_asymmetry = abs(pos_flux - neg_flux) / (denom + 1e-9)
    dipole_balance = (2.0 * min(pos_flux, neg_flux) / (denom + 1e-9)) if denom > 0 else 0.0
    
    # Centroides de lóbulos
    H, W = clean_patch.shape
    y_coords, x_coords = np.mgrid[0:H, 0:W]
    
    if pos_flux > 0:
        pos_yc = float(np.sum(y_coords * (clean_patch * pos_mask)) / pos_flux)
        pos_xc = float(np.sum(x_coords * (clean_patch * pos_mask)) / pos_flux)
    else:
        pos_yc, pos_xc = H / 2.0, W / 2.0
        
    if neg_flux > 0:
        neg_yc = float(np.sum(y_coords * (np.abs(clean_patch) * neg_mask)) / neg_flux)
        neg_xc = float(np.sum(x_coords * (np.abs(clean_patch) * neg_mask)) / neg_flux)
    else:
        neg_yc, neg_xc = H / 2.0, W / 2.0
        
    centroid_separation = float(np.hypot(pos_yc - neg_yc, pos_xc - neg_xc)) if (pos_flux > 0 and neg_flux > 0) else 0.0
    
    # S/N pico
    peak_pos_snr = float(np.max(clean_patch) / (noise_sigma + 1e-9))
    peak_neg_snr = float(abs(np.min(clean_patch)) / (noise_sigma + 1e-9))
    min_peak_snr = min(peak_pos_snr, peak_neg_snr)
    
    # Distancia al borde del parche para penalizar artefactos de frontera
    border_dist = min(pos_yc, H - 1 - pos_yc, pos_xc, W - 1 - pos_xc)
    
    return {
        "pos_flux": pos_flux,
        "neg_flux": neg_flux,
        "flux_asymmetry": flux_asymmetry,
        "dipole_balance": dipole_balance,
        "centroid_separation": centroid_separation,
        "peak_pos_snr": peak_pos_snr,
        "peak_neg_snr": peak_neg_snr,
        "min_peak_snr": min_peak_snr,
        "total_abs_flux": total_abs_flux,
        "net_flux": net_flux,
        "border_dist": border_dist
    }
