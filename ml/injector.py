"""
Simulador de inyección de fuentes astronómicas sobre parches reales de fondo de SPHEREx.
Genera muestras etiquetadas:
  0: estático (fondo real o estrella no movida)
  1: movimiento (dipolo con desplazamiento 0.2 a 3.0 px)
  2: variable (monopolo o cambio de flujo sin desplazamiento)
"""
import random
from typing import List, Tuple, Dict, Any
import numpy as np

def gaussian_psf(shape: Tuple[int, int] = (16, 16), xc: float = 8.0, yc: float = 8.0, fwhm_pix: float = 1.6) -> np.ndarray:
    """Genera PSF gaussiana normalizada a integral = 1.0."""
    H, W = shape
    y, x = np.mgrid[0:H, 0:W]
    sigma = fwhm_pix / 2.35482
    psf = np.exp(-((x - xc)**2 + (y - yc)**2) / (2.0 * sigma**2))
    s = psf.sum()
    if s > 0:
        psf /= s
    return psf

def generate_synthetic_dataset(
    background_diffs: np.ndarray,
    n_samples_per_class: int = 400,
    patch_size: int = 16,
    seed: int = 42
) -> Tuple[np.ndarray, np.ndarray, List[Dict[str, float]]]:
    """
    background_diffs: array (N, 64, 64) con diferencias reales de fondo.
    Devuelve X (features), y (labels), metadata.
    labels: 0=static, 1=motion, 2=variable
    """
    random.seed(seed)
    np.random.seed(seed)
    
    from ml.features import extract_patch_features
    
    n_diffs, H, W = background_diffs.shape
    features_list = []
    labels = []
    meta = []
    
    # Lista de parches de fondo limpios
    for class_id in [0, 1, 2]:
        for i in range(n_samples_per_class):
            diff_idx = random.randint(0, n_diffs - 1)
            raw_diff = background_diffs[diff_idx]
            
            # Seleccionar recorte aleatorio evitando los bordes
            y0 = random.randint(2, H - patch_size - 2)
            x0 = random.randint(2, W - patch_size - 2)
            patch = np.copy(raw_diff[y0:y0+patch_size, x0:x0+patch_size])
            patch = np.nan_to_num(patch, nan=0.0)
            
            # Ruido sigma estimado del parche
            noise_sigma = float(np.std(patch)) if np.std(patch) > 1e-4 else 0.01
            
            xc = patch_size / 2.0 + random.uniform(-1.0, 1.0)
            yc = patch_size / 2.0 + random.uniform(-1.0, 1.0)
            
            # S/N del objeto entre 3 y 40
            snr = random.uniform(3.5, 35.0)
            flux = snr * noise_sigma * 5.0
            
            if class_id == 0:
                # Estático: o solo fondo, o dos fuentes fijas que se anulan en la diferencia
                if random.random() < 0.5:
                    # Inyectar idéntica en ambas épocas -> residuo = 0 + ruido
                    res = patch + np.random.normal(0, noise_sigma * 0.2, patch.shape)
                else:
                    res = patch
                    
            elif class_id == 1:
                # Movimiento: Dipolo (fuente en S2 menos fuente en S1)
                # Desplazamiento de 0.2 a 3.0 píxeles en dirección theta
                shift_dist = random.uniform(0.3, 3.0)
                angle = random.uniform(0, 2.0 * np.pi)
                dx = shift_dist * np.cos(angle)
                dy = shift_dist * np.sin(angle)
                
                # S2 (positivo) - S1 (negativo)
                psf_pos = gaussian_psf((patch_size, patch_size), xc + dx/2.0, yc + dy/2.0)
                psf_neg = gaussian_psf((patch_size, patch_size), xc - dx/2.0, yc - dy/2.0)
                
                dipole = (psf_pos - psf_neg) * flux
                res = patch + dipole
                
            elif class_id == 2:
                # Variable: Cambio de brillo sin desplazamiento centroidal
                delta_flux = flux * random.uniform(0.4, 1.5) * random.choice([1.0, -1.0])
                psf = gaussian_psf((patch_size, patch_size), xc, yc)
                res = patch + psf * delta_flux
                
            feats = extract_patch_features(res, noise_sigma=noise_sigma)
            features_list.append(feats)
            labels.append(class_id)
            meta.append({"class": class_id, "snr": snr, "noise_sigma": noise_sigma})
            
    # Convertir a matriz numpy de features
    feature_keys = [
        "pos_flux", "neg_flux", "flux_asymmetry", "dipole_balance",
        "centroid_separation", "peak_pos_snr", "peak_neg_snr",
        "min_peak_snr", "total_abs_flux", "net_flux", "border_dist"
    ]
    
    X = np.zeros((len(features_list), len(feature_keys)), dtype=np.float32)
    for row_idx, f_dict in enumerate(features_list):
        for col_idx, k in enumerate(feature_keys):
            X[row_idx, col_idx] = f_dict[k]
            
    return X, np.array(labels, dtype=np.int64), feature_keys, meta
