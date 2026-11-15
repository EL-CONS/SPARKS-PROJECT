"""
Simulador de inyección de fuentes astronómicas sobre parches reales de fondo de SPHEREx.
Excluye explícitamente el centro (32, 32) donde está Barnard para evitar fuga de datos.
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
    n_samples_per_class: int = 600,
    patch_size: int = 16,
    seed: int = 42
) -> Tuple[np.ndarray, np.ndarray, List[str], List[Dict[str, float]]]:
    """
    background_diffs: array (N, 64, 64) con diferencias reales de fondo.
    Excluye parches cuyo centro esté a menos de 12 px del centro de Barnard (32, 32).
    """
    random.seed(seed)
    np.random.seed(seed)
    
    from ml.features import extract_patch_features
    
    n_diffs, H, W = background_diffs.shape
    features_list = []
    labels = []
    meta = []
    
    # Precomputar coordenadas válidas periféricas (centro del parche dist >= 12 px de (32, 32))
    valid_coords = []
    for y0 in range(2, H - patch_size - 2):
        for x0 in range(2, W - patch_size - 2):
            yc = y0 + patch_size / 2.0
            xc = x0 + patch_size / 2.0
            dist = np.hypot(yc - 32.0, xc - 32.0)
            if dist >= 12.0:
                valid_coords.append((y0, x0))
                
    for class_id in [0, 1, 2]:
        for i in range(n_samples_per_class):
            diff_idx = random.randint(0, n_diffs - 1)
            raw_diff = background_diffs[diff_idx]
            
            y0, x0 = random.choice(valid_coords)
            patch = np.copy(raw_diff[y0:y0+patch_size, x0:x0+patch_size])
            patch = np.nan_to_num(patch, nan=0.0)
            
            noise_sigma = float(np.std(patch)) if np.std(patch) > 1e-4 else 0.01
            
            xc = patch_size / 2.0 + random.uniform(-1.0, 1.0)
            yc = patch_size / 2.0 + random.uniform(-1.0, 1.0)
            
            snr = random.uniform(3.5, 35.0)
            flux = snr * noise_sigma * 5.0
            
            if class_id == 0:
                # Estático
                if random.random() < 0.5:
                    res = patch + np.random.normal(0, noise_sigma * 0.2, patch.shape)
                else:
                    res = patch
                    
            elif class_id == 1:
                # Movimiento: Desplazamiento de 0.3 a 3.0 px
                shift_dist = random.uniform(0.3, 3.0)
                angle = random.uniform(0, 2.0 * np.pi)
                dx = shift_dist * np.cos(angle)
                dy = shift_dist * np.sin(angle)
                
                psf_pos = gaussian_psf((patch_size, patch_size), xc + dx/2.0, yc + dy/2.0)
                psf_neg = gaussian_psf((patch_size, patch_size), xc - dx/2.0, yc - dy/2.0)
                
                dipole = (psf_pos - psf_neg) * flux
                res = patch + dipole
                
            elif class_id == 2:
                # Variable
                delta_flux = flux * random.uniform(0.4, 1.5) * random.choice([1.0, -1.0])
                psf = gaussian_psf((patch_size, patch_size), xc, yc)
                res = patch + psf * delta_flux
                
            feats = extract_patch_features(res, noise_sigma=noise_sigma)
            features_list.append(feats)
            labels.append(class_id)
            meta.append({"class": class_id, "snr": snr, "noise_sigma": noise_sigma})
            
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
