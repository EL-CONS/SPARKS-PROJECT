"""Clasificador v2: aplica las correcciones de la revision cientifica de Horacio (docs/ml/revision-ciencia-clasificador.md).

Cambios respecto a la v1:
- Se quitan log10_mu, log10_paralaje y g_mag: venian del catalogo y reflejaban el sesgo de distancia de la muestra, no la fisica de cada clase.
- Se conservan solo las variables de luminosidad y color de Gaia (mg_gaia, bp_rp) y las banderas de si hay dato.
- 69 objetos con clase verificada (catalogo ampliado de Horacio) en lugar de 36.
Sigue siendo una prueba de concepto: sin variables de SPHEREx todavia."""
import csv, json, math, sys
from collections import Counter
from pathlib import Path
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import LeaveOneOut

AQUI = Path(__file__).parent
SEMILLA = 42
CLASES = ["estrella", "enana marron", "enana blanca", "variable"]
VARS = ["en_gaia", "tiene_fotometria", "mg_gaia", "bp_rp"]
FALTA = -999.0


def num(x):
    try:
        v = float(x)
        return v if math.isfinite(v) else None
    except (TypeError, ValueError):
        return None


def clave(r):
    return r["id_campo"].strip() or r["nombre"].strip()


def cargar():
    vt = {clave(r): r for r in csv.DictReader(open(AQUI / "datos/verdad-terreno-v2.csv", encoding="utf-8"))}
    gf = {clave(r): r for r in csv.DictReader(open(AQUI / "datos/gaia-fotometria-v2.csv", encoding="utf-8"))}
    filas = []
    for k, r in vt.items():
        g = gf.get(k, {})
        mg, bprp = num(g.get("mg_gaia")), num(g.get("bp_rp"))
        tiene = mg is not None and bprp is not None
        x = [1.0 if r["en_gaia"].strip().lower().startswith("s") else 0.0, 1.0 if tiene else 0.0,
             mg if mg is not None else FALTA, bprp if bprp is not None else FALTA]
        filas.append({"id": k, "nombre": r["nombre"], "clase": r["clase"].replace("marrón", "marron"), "x": x})
    return filas


def modelo(n=200):
    return RandomForestClassifier(n_estimators=n, max_depth=4, random_state=SEMILLA, class_weight="balanced")


def loo(X, y, n=200):
    pred = np.empty(len(y), dtype=object)
    for tr, te in LeaveOneOut().split(X):
        pred[te] = modelo(n).fit(X[tr], y[tr]).predict(X[te])
    return pred


def exportar(m):
    arboles = []
    for est in m.estimators_:
        t = est.tree_
        nodos = []
        for i in range(t.node_count):
            if t.children_left[i] == -1:
                v = t.value[i][0]
                nodos.append({"hoja": True, "p": [round(float(a), 6) for a in v / v.sum()]})
            else:
                nodos.append({"hoja": False, "f": int(t.feature[i]), "t": float(t.threshold[i]), "i": int(t.children_left[i]), "d": int(t.children_right[i])})
        arboles.append(nodos)
    return {"clases": [str(c) for c in m.classes_], "variables": VARS, "falta": FALTA, "arboles": arboles}


def main():
    filas = cargar()
    X = np.array([f["x"] for f in filas], float)
    y = np.array([f["clase"] for f in filas], dtype=object)
    print(len(filas), "objetos:", dict(Counter(y)))
    pred = loo(X, y)
    acc = float(np.mean(pred == y))
    rng = np.random.default_rng(SEMILLA)
    acc_r = float(np.mean(loo(X, y, 30) == y))
    mejores = sum(1 for _ in range(30) if (lambda yp: float(np.mean(loo(X, yp, 30) == yp)) >= acc_r)(rng.permutation(y)))
    matriz = {c: {c2: int(np.sum((y == c) & (pred == c2))) for c2 in CLASES} for c in CLASES}
    recall = {c: round(matriz[c][c] / max(1, sum(matriz[c].values())), 3) for c in CLASES}
    fallos = [{"nombre": f["nombre"], "verdad": str(y[i]), "ml": str(pred[i])} for i, f in enumerate(filas) if pred[i] != y[i]]
    final = modelo().fit(X, y)
    mj = exportar(final)
    res = {"version": "v2", "n_objetos": len(filas), "clases": dict(Counter(y)), "validacion": "dejar uno fuera (LOO)",
           "exactitud_ml_loo": round(acc, 4), "linea_base_clase_mayoritaria": round(Counter(y).most_common(1)[0][1] / len(y), 4),
           "prueba_permutacion": {"repeticiones": 30, "p_valor": round((mejores + 1) / 31, 4)},
           "matriz_confusion_loo": matriz, "recall_por_clase": recall, "fallos_loo": fallos,
           "importancia_variables": {v: round(float(a), 4) for v, a in zip(VARS, final.feature_importances_)}, "semilla": SEMILLA}
    (AQUI / "resultados_v2.json").write_text(json.dumps(res, ensure_ascii=False, indent=1), encoding="utf-8")
    (AQUI / "modelo_v2.json").write_text(json.dumps(mj), encoding="utf-8")
    ej = [{"nombre": f["nombre"], "x": f["x"], "clase_sklearn": str(c), "prob": [float(a) for a in p]} for f, c, p in zip(filas, final.predict(X), final.predict_proba(X))]
    (AQUI / "paridad_v2.json").write_text(json.dumps({"clases": [str(c) for c in final.classes_], "ejemplos": ej}, ensure_ascii=False), encoding="utf-8")
    print(json.dumps({k: res[k] for k in ("exactitud_ml_loo", "linea_base_clase_mayoritaria", "prueba_permutacion", "recall_por_clase", "importancia_variables")}, ensure_ascii=False, indent=1))
    print("matriz:", json.dumps(matriz, ensure_ascii=False))
    print("fallos:", len(fallos), [f"{f['nombre']}:{f['verdad']}->{f['ml']}" for f in fallos])


if __name__ == "__main__":
    sys.exit(main())
