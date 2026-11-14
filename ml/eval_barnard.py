"""
Evaluación ciega del modelo sobre el campo real de Barnard.
Regla de congelado previo:
Se evalúa el parche central (32, 32) de tamaño 24x24 sobre las diferencias D1..D6 entre temporada 0 y temporada 2.
Umbrales fijados:
- Probabilidad de movimiento > 0.60
- Consistencia entre detectores: se espera detección positiva en al menos 4 de 6 detectores.
"""
import os
import json
import numpy as np
from ml.reader import load_diffs, load_manifest
from ml.features import extract_patch_features

def main():
    data_dir = "/home/gcons17/Proyectos/SPARKS/data-sample/barnard"
    mf = load_manifest(data_dir)
    diffs = load_diffs(data_dir)
    
    with open("/home/gcons17/Proyectos/SPARKS/app/src/core/motion_model.json", "r") as f:
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
    print("EVALUACIÓN CIEGA SOBRE CAMPO REAL DE BARNARD")
    print("==================================================")
    
    # Índices en diffs para temporada 0 vs temporada 2 en cada detector:
    # manifest diffs:
    # diffs i=1: det 1, a=0, b=2
    # diffs i=4: det 2, a=0, b=2
    # diffs i=7: det 3, a=0, b=2
    # diffs i=10: det 4, a=0, b=2
    # diffs i=13: det 5, a=0, b=2
    # diffs i=16: det 6, a=0, b=2
    s0_s2_diff_indices = [1, 4, 7, 10, 13, 16]
    
    detections = []
    
    for det_idx, diff_idx in enumerate(s0_s2_diff_indices, start=1):
        diff_map = diffs[diff_idx]
        # Parche central 24x24 alrededor del centro (32, 32)
        patch = diff_map[20:44, 20:44]
        feats = extract_patch_features(patch, noise_sigma=mf["scales"][str(det_idx)]["noise"])
        probs, pred_cls = predict_tree(model["root"], feats)
        cls_name = model["classes"][pred_cls]
        motion_prob = probs[1]
        
        is_detected = (pred_cls == 1) and (motion_prob >= 0.60)
        detections.append(is_detected)
        
        print(f"Detector {det_idx} (Diff #{diff_idx}): Pred={cls_name.upper()} (P_motion={motion_prob:.3f}) | DipoleBalance={feats['dipole_balance']:.2f} | CentroidSep={feats['centroid_separation']:.2f} px | MinPeakSNR={feats['min_peak_snr']:.1f}")
        
    success_count = sum(detections)
    print("--------------------------------------------------")
    print(f"Recuperación de Barnard en detectores: {success_count}/6")
    print(f"Veredicto final del modelo para Barnard: {'MOVIMIENTO CONFIRMADO' if success_count >= 4 else 'INCONCLUSO'}")
    print("==================================================")
    
    with open("/home/gcons17/Proyectos/SPARKS/ml/barnard_eval_result.json", "w") as f:
        json.dump({
            "success_count": success_count,
            "total_detectors": 6,
            "detections": detections,
            "verdict": "motion" if success_count >= 4 else "inconclusive"
        }, f, indent=2)

if __name__ == "__main__":
    main()
