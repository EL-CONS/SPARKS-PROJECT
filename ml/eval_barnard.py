"""
Evaluación ciega del modelo sobre el campo real de Barnard.
Rutas relativas dinámicas. Protocolo y umbrales congelados previamente en:
docs/ml/protocolo-congelado.md
"""
import os
import json
import numpy as np
from ml.reader import load_diffs, load_manifest
from ml.features import extract_patch_features

repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def main():
    data_dir = os.path.join(repo_root, "data-sample", "barnard")
    mf = load_manifest(data_dir)
    diffs = load_diffs(data_dir)
    
    model_path = os.path.join(repo_root, "app", "src", "core", "motion_model.json")
    with open(model_path, "r", encoding="utf-8") as f:
        model = json.load(f)
        
    def predict_tree(node, feats):
        if node["type"] == "leaf":
            return node["probabilities"], node["class"]
        fval = feats[node["feature"]]
        if fval <= node["threshold"]:
            return predict_tree(node["left"], feats)
        else:
            return predict_tree(node["right"], feats)
            
    print("==================================================")
    print("CORRIDA ÚNICA CONGELADA SOBRE CAMPO REAL DE BARNARD")
    print("==================================================")
    
    # Índices de diffs para Temporada 0 vs Temporada 2 (S0 vs S2):
    s0_s2_diff_indices = [1, 4, 7, 10, 13, 16]
    results = []
    
    for det_idx, diff_idx in enumerate(s0_s2_diff_indices, start=1):
        diff_map = diffs[diff_idx]
        patch = diff_map[20:44, 20:44]
        feats = extract_patch_features(patch, noise_sigma=mf["scales"][str(det_idx)]["noise"])
        probs, pred_cls = predict_tree(model["root"], feats)
        cls_name = model["classes"][pred_cls]
        motion_prob = probs[1]
        
        is_detected = (pred_cls == 1) and (motion_prob >= 0.50)
        results.append({
            "detector": det_idx,
            "diff_index": diff_idx,
            "predicted_class": cls_name,
            "motion_probability": motion_prob,
            "dipole_balance": feats["dipole_balance"],
            "centroid_separation": feats["centroid_separation"],
            "min_peak_snr": feats["min_peak_snr"],
            "is_detected": is_detected
        })
        
        print(f"Detector {det_idx} (Diff #{diff_idx}): Pred={cls_name.upper()} (P_motion={motion_prob:.3f}) | DipoleBalance={feats['dipole_balance']:.2f} | CentroidSep={feats['centroid_separation']:.2f} px | MinPeakSNR={feats['min_peak_snr']:.1f}")
        
    success_count = sum(r["is_detected"] for r in results)
    print("--------------------------------------------------")
    print(f"Recuperación de Barnard en detectores: {success_count}/6")
    verdict_str = "MOVIMIENTO CONFIRMADO" if success_count >= 4 else "MOVIMIENTO NO CONFIRMADO"
    print(f"Veredicto final según criterio congelado: {verdict_str}")
    print("==================================================")
    
    out_eval_path = os.path.join(repo_root, "ml", "barnard_eval_result.json")
    with open(out_eval_path, "w", encoding="utf-8") as f:
        json.dump({
            "success_count": success_count,
            "total_detectors": 6,
            "verdict": verdict_str,
            "details": results
        }, f, indent=2)
    print(f"Resultados guardados en: {out_eval_path}")

if __name__ == "__main__":
    main()
