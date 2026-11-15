"""
Lector de binarios densos de SPHEREx y utilidades para inspección de datos.
Basado en las especificaciones del manifest.json de SPARKS.
"""
import os
import json
from typing import Dict, Any, Tuple
import numpy as np

def load_manifest(data_dir: str) -> Dict[str, Any]:
    with open(os.path.join(data_dir, "manifest.json"), "r", encoding="utf-8") as f:
        return json.load(f)

def load_coadds(data_dir: str, n_coadds: int = 18, shape: Tuple[int, int] = (64, 64)) -> np.ndarray:
    """Lee coadds.bin como arreglo (18, 64, 64) float32."""
    path = os.path.join(data_dir, "coadds.bin")
    data = np.fromfile(path, dtype=np.float32)
    return data.reshape((n_coadds, *shape))

def load_diffs(data_dir: str, n_diffs: int = 18, shape: Tuple[int, int] = (64, 64)) -> np.ndarray:
    """Lee diffs.bin como arreglo (18, 64, 64) float32."""
    path = os.path.join(data_dir, "diffs.bin")
    data = np.fromfile(path, dtype=np.float32)
    return data.reshape((n_diffs, *shape))

def load_diffs_sig(data_dir: str, n_diffs: int = 18, shape: Tuple[int, int] = (64, 64)) -> np.ndarray:
    """Lee diffs_sig.bin como arreglo (18, 64, 64) float32."""
    path = os.path.join(data_dir, "diffs_sig.bin")
    data = np.fromfile(path, dtype=np.float32)
    return data.reshape((n_diffs, *shape))

def load_medians(data_dir: str, n_detectors: int = 6, shape: Tuple[int, int] = (64, 64)) -> np.ndarray:
    """Lee medians.bin como arreglo (6, 64, 64) float32."""
    path = os.path.join(data_dir, "medians.bin")
    data = np.fromfile(path, dtype=np.float32)
    return data.reshape((n_detectors, *shape))

def load_masks(data_dir: str, n_frames: int = 355, shape: Tuple[int, int] = (64, 64)) -> np.ndarray:
    """Lee masks.bin como arreglo (355, 64, 64) uint8."""
    path = os.path.join(data_dir, "masks.bin")
    data = np.fromfile(path, dtype=np.uint8)
    return data.reshape((n_frames, *shape))

def load_frames(data_dir: str, n_frames: int = 355, shape: Tuple[int, int] = (64, 64)) -> np.ndarray:
    """Lee frames.bin como arreglo (355, 64, 64) float16 o int16."""
    path = os.path.join(data_dir, "frames.bin")
    data = np.fromfile(path, dtype=np.float16)
    return data.reshape((n_frames, *shape))
