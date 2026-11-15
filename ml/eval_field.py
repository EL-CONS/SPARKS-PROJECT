"""
Script de evaluación por lotes para cualquier campo de datos (formato SPARKS).
Acepta carpetas como data-sample/barnard o data-new/<id>/ generadas por el pipeline de Horacio.
Evalúa los 6 detectores con el modelo ML y contrasta con la regla astrofísica de Horacio.
"""
import os
import sys
import json
import argparse
from typing import Dict, Any, List
import numpy as np

from ml.reader import load_diffs, load_manifest
from ml.features import extract_patch_features

repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def evaluate_field(field_dir: str, model_path: str = None) -> Dict[str, Any]:
    if model_path is None:
        model_path = os.path.join(repo_root, "app", "src", "core", "motion_model.json")
        
    with open(model_path, "r", encoding="utf-8") as f:
        model = json.load(f)
        
    mf = load_manifest(field_dir)
    diffs = load_diffs(field_dir)
    field_id = mf.get("field", {}).get("id", os.path.basename(field_dir))
    
    def predict_tree(node, feats):
        if node["type"] == "leaf":
            return node["probabilities"], node["class"]
        fval = feats[node["feature"]]
        if fval <= node["threshold"]:
            return predict_tree(node["left"], feats)
        else:
            return predict_tree(node["right"], feats)
            
    # Filtrar diferencias de mayor línea de base (primera temporada disponible vs última)
    # Por defecto buscar pares (S0 vs S2) o (S0 vs S1)
    seasons = [s["id"] for s in mf.get("seasons", [])]
    s_a = min(seasons)
    s_b = max(seasons)
    
    det_results = []
    
    for det_idx in range(1, 7):
        # Buscar diff correspondiente a este detector y temporadas
        match_diff = None
        match_idx = None
        for i, d in enumerate(mf.get("diffs", [])):
            if d.get("det") == det_idx:
                if (d.get("a") == s_a and d.get("b") == s_b) or (d.get("b") == s_a and d.get("a") == s_b):
                    match_diff = d
                    match_idx = i
                    break
        if match_diff is None:
            # Tomar la primera diff disponible para el detector
            for i, d in enumerate(mf.get("diffs", [])):
                if d.get("det") == det_idx:
                    match_diff = d
                    match_idx = i
                    break
                    
        if match_idx is not None and match_idx < len(diffs):
            diff_patch = diffs[match_idx][20:44, 20:44]
            noise_scale = mf.get("scales", {}).get(str(det_idx), {}).get("noise", 0.01)
            feats = extract_patch_features(diff_patch, noise_sigma=noise_scale)
            probs, pred_cls = predict_tree(model["root"], feats)
            cls_name = model["classes"][pred_cls]
            p_motion = probs[1]
            
            det_results.append({
                "detector": det_idx,
                "diff_index": match_idx,
                "seasons": f"S{match_diff.get('a')} vs S{match_diff.get('b')}",
                "pred_class": cls_name,
                "p_motion": p_motion,
                "dipole_balance": feats["dipole_balance"],
                "centroid_separation": feats["centroid_separation"],
                "min_peak_snr": feats["min_peak_snr"],
                "is_detected": (pred_cls == 1) and (p_motion >= 0.50)
            })
            
    success_detectors = sum(r["is_detected"] for r in det_results)
    ml_motion_verdict = "CONFIRMED" if success_detectors >= 4 else "UNCONFIRMED"
    
    return {
        "field_id": field_id,
        "success_detectors": success_detectors,
        "total_detectors": len(det_results),
        "ml_motion_verdict": ml_motion_verdict,
        "detectors": det_results
    }

def format_markdown_table(result: Dict[str, Any]) -> str:
    lines = [
        f"### Evaluación de Campo: `{result['field_id']}`",
        f"**Veredicto Global de Movimiento ML:** `{result['ml_motion_verdict']}` ({result['success_detectors']}/{result['total_detectors']} detectores)\n",
        "| Detector | Temporadas | Predicción ML | P(Movimiento) | Balance Dipolo | Sep. Centroides (px) | SNR Pico Mín |",
        "|---|---|---|---|---|---|---|"
    ]
    for d in result["detectors"]:
        lines.append(
            f"| D{d['detector']} | {d['seasons']} | **{d['pred_class'].upper()}** | {d['p_motion']:.3f} | {d['dipole_balance']:.2f} | {d['centroid_separation']:.2f} | {d['min_peak_snr']:.1f} |"
        )
    return "\n".join(lines)

def main():
    parser = argparse.ArgumentParser(description="Evaluador multiobjeto de campos SPHEREx")
    parser.add_argument("--dir", required=True, help="Ruta al directorio del campo (ej. data-sample/barnard o data-new/wise0855)")
    parser.add_argument("--out", default=None, help="Archivo Markdown de salida opcional")
    args = parser.parse_args()
    
    if not os.path.exists(args.dir):
        print(f"Error: No existe el directorio {args.dir}")
        sys.exit(1)
        
    res = evaluate_field(args.dir)
    md = format_markdown_table(res)
    print(md)
    
    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(md)
        print(f"\nReporte guardado en {args.out}")

if __name__ == "__main__":
    main()
