"""
Entrenamiento y exportación del modelo de detección de movimiento para SPARKS.
Entrena un DecisionTreeClassifier / Random Forest y exporta a JSON interpretable en TypeScript.
"""
import os
import json
from typing import Dict, Any
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix

from ml.reader import load_diffs
from ml.injector import generate_synthetic_dataset

def export_tree_to_json(tree_model, feature_names: list) -> Dict[str, Any]:
    """Exporta la estructura de un DecisionTreeClassifier a un dict JSON compatible."""
    tree = tree_model.tree_
    
    def recurse(node_id: int) -> Dict[str, Any]:
        if tree.feature[node_id] != -2: # Not a leaf
            feat_idx = int(tree.feature[node_id])
            threshold = float(tree.threshold[node_id])
            return {
                "type": "split",
                "feature": feature_names[feat_idx],
                "feature_index": feat_idx,
                "threshold": threshold,
                "left": recurse(int(tree.children_left[node_id])),
                "right": recurse(int(tree.children_right[node_id]))
            }
        else:
            value = tree.value[node_id][0].tolist()
            total = sum(value)
            probs = [v / total if total > 0 else 0.0 for v in value]
            predicted_class = int(np.argmax(probs))
            return {
                "type": "leaf",
                "counts": value,
                "probabilities": probs,
                "class": predicted_class
            }
            
    return {
        "features": feature_names,
        "classes": ["static", "motion", "variable"],
        "root": recurse(0)
    }

def main():
    data_dir = "/home/gcons17/Proyectos/SPARKS/data-sample/barnard"
    diffs = load_diffs(data_dir)
    print(f"Diferencias cargadas: {diffs.shape}")
    
    print("Generando dataset sintético por inyección sobre fondo real...")
    X, y, feature_names, meta = generate_synthetic_dataset(diffs, n_samples_per_class=600, seed=123)
    print(f"Dataset generado: X={X.shape}, y={y.shape}")
    
    # Partición estratificada 75% train, 25% test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )
    
    # Entrenar árbol de decisión regularizado (para interpretabilidad y exportación directa)
    clf = DecisionTreeClassifier(max_depth=5, min_samples_leaf=10, random_state=42)
    clf.fit(X_train, y_train)
    
    train_acc = clf.score(X_train, y_train)
    test_acc = clf.score(X_test, y_test)
    print(f"Accuracy Train: {train_acc:.4f} | Test: {test_acc:.4f}")
    
    y_pred = clf.predict(X_test)
    print("\nReporte de Clasificación (Test):")
    print(classification_report(y_test, y_pred, target_names=["static", "motion", "variable"]))
    print("Matriz de confusión:")
    print(confusion_matrix(y_test, y_pred))
    
    # Exportar árbol a JSON para inferencia en TS
    tree_dict = export_tree_to_json(clf, feature_names)
    out_json_path = "/home/gcons17/Proyectos/SPARKS/app/src/core/motion_model.json"
    with open(out_json_path, "w", encoding="utf-8") as f:
        json.dump(tree_dict, f, indent=2)
    print(f"\nModelo exportado a JSON: {out_json_path}")
    
    # Generar 250 casos de prueba para test cruzado en TypeScript
    test_cases = []
    for i in range(250):
        feats_dict = {name: float(X_test[i, idx]) for idx, name in enumerate(feature_names)}
        probs = clf.predict_proba(X_test[i:i+1])[0].tolist()
        pred_cls = int(clf.predict(X_test[i:i+1])[0])
        test_cases.append({
            "features": feats_dict,
            "expected_class": pred_cls,
            "probabilities": probs,
            "class_name": ["static", "motion", "variable"][pred_cls]
        })
        
    fixtures_path = "/home/gcons17/Proyectos/SPARKS/app/tests/motion_fixtures.json"
    with open(fixtures_path, "w", encoding="utf-8") as f:
        json.dump(test_cases, f, indent=2)
    print(f"Fixtures para pruebas en TS guardados en: {fixtures_path}")

if __name__ == "__main__":
    main()
