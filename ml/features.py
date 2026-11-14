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
    H, W = clean_patch.shape
    y_coords, x_coords = np.mgrid[0:H, 0:W]
    
    # Umbral de significancia local (2 sigma)
    pos_mask = clean_patch > 2.0 * noise_sigma
    neg_mask = clean_patch < -2.0 * noise_sigma
    
    pos_flux = float(np.sum(clean_patch[pos_mask])) if np.any(pos_mask) else 0.0
    neg_flux = float(np.abs(np.sum(clean_patch[neg_mask]))) if np.any(neg_mask) else 0.0
    
    total_abs_flux = float(np.sum(np.abs(clean_patch)))
    net_flux = float(np.sum(clean_patch))
    
    # Balance de dipolo: para un dipolo puro de movimiento, pos_flux y neg_flux son similares
    denom = (pos_flux + neg_flux)
    flux_asymmetry = abs(pos_flux - neg_flux) / (denom + 1e-9)
    dipole_balance = (2.0 * min(pos_flux, neg_flux) / (denom + 1e-9)) if denom > 0 else 0.0
    
    # S/N pico
    peak_pos_val = float(np.max(clean_patch))
    peak_neg_val = float(np.min(clean_patch))
    peak_pos_snr = peak_pos_val / (noise_sigma + 1e-9)
    peak_neg_snr = abs(peak_neg_val) / (noise_sigma + 1e-9)
    min_peak_snr = min(peak_pos_snr, peak_neg_snr)
    
    # Ponderación centroidal robusta:
    # Usar máscara compacta alrededor de los picos para evitar que fluctuaciones de ruido lejanas
    # distorsionen la separación hacia 5-10 píxeles.
    # Se pondera por intensidad cúbica o se restringe a un radio de 5 px alrededor de cada pico.
    if np.any(pos_mask) and peak_pos_snr >= 2.5:
        p_max_y, p_max_x = np.unravel_index(np.argmax(clean_patch), clean_patch.shape)
        # Ventana compacta de 9x9 alrededor del pico
        y_min, y_max = max(0, p_max_y - 4), min(H, p_max_y + 5)
        x_min, x_max = max(0, p_max_x - 4), min(W, p_max_x + 5)
        
        sub_pos = np.maximum(0.0, clean_patch[y_min:y_max, x_min:x_max] - 1.5 * noise_sigma)
        w = sub_pos ** 2
        sum_w = np.sum(w)
        if sum_w > 0:
            sub_y, sub_x = np.mgrid[y_min:y_max, x_min:x_max]
            pos_yc = float(np.sum(sub_y * w) / sum_w)
            pos_xc = float(np.sum(sub_x * w) / sum_w)
        else:
            pos_yc, pos_xc = float(p_max_y), float(p_max_x)
    else:
        pos_yc, pos_xc = H / 2.0, W / 2.0
        
    if np.any(neg_mask) and peak_neg_snr >= 2.5:
        n_min_y, n_min_x = np.unravel_index(np.argmin(clean_patch), clean_patch.shape)
        y_min, y_max = max(0, n_min_y - 4), min(H, n_min_y + 5)
        x_min, x_max = max(0, n_min_x - 4), min(W, n_min_x + 5)
        
        sub_neg = np.maximum(0.0, -clean_patch[y_min:y_max, x_min:x_max] - 1.5 * noise_sigma)
        w = sub_neg ** 2
        sum_w = np.sum(w)
        if sum_w > 0:
            sub_y, sub_x = np.mgrid[y_min:y_max, x_min:x_max]
            neg_yc = float(np.sum(sub_y * w) / sum_w)
            neg_xc = float(np.sum(sub_x * w) / sum_w)
        else:
            neg_yc, neg_xc = float(n_min_y), float(n_min_x)
    else:
        neg_yc, neg_xc = H / 2.0, W / 2.0
        
    if np.any(pos_mask) and np.any(neg_mask):
        centroid_separation = float(np.hypot(pos_yc - neg_yc, pos_xc - neg_xc))
    else:
        centroid_separation = 0.0
    
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
