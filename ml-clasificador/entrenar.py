"""Clasificador de ML por clase de objeto (estrella, enana marron, enana blanca, variable).

Entrena un bosque aleatorio sobre los objetos con clase verificada de
datos/verdad-terreno.csv, usando la fotometria y astrometria de Gaia DR3
de datos/gaia-fotometria.csv. Evalua con validacion dejando uno fuera (LOO),
contra una linea base de la clase mayoritaria y contra una regla fisica sobre
las mismas variables, y con una prueba de permutacion. Exporta el modelo a JSON.

Limite declarado: son 36 objetos. Es una prueba de concepto honesta, no una
validacion a escala."""
import csv, json, math, sys
from collections import Counter
from pathlib import Path
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import LeaveOneOut

AQUI = Path(__file__).parent
SEMILLA = 42
CLASES = ["estrella", "enana marron", "enana blanca", "variable"]
VARS = ["en_gaia", "log10_paralaje", "mg_gaia", "bp_rp", "g_mag", "log10_mu"]
FALTA = -999.0  # valor para "no hay dato" (los arboles lo separan solos)


def num(x):
    try:
        v = float(x)
        return v if math.isfinite(v) else None
    except (TypeError, ValueError):
        return None


def cargar():
    clave = lambda r: r["id_campo"].strip() or r["nombre"].strip()
    vt = {clave(r): r for r in csv.DictReader(open(AQUI / "datos/verdad-terreno.csv", encoding="utf-8"))}
    gf = {clave(r): r for r in csv.DictReader(open(AQUI / "datos/gaia-fotometria.csv", encoding="utf-8"))}
    filas = []
    for fid, r in vt.items():
        g = gf.get(fid, {})
        plx, mg, bprp, gm = (num(g.get(k)) for k in ("parallax_mas", "mg_gaia", "bp_rp", "phot_g_mean_mag"))
        mu = num(r.get("mu_total_arcsec_yr"))
        x = [
            1.0 if r["en_gaia"].strip().lower().startswith("s") else 0.0,
            math.log10(plx) if plx and plx > 0 else FALTA,
            mg if mg is not None else FALTA,
            bprp if bprp is not None else FALTA,
            gm if gm is not None else FALTA,
            math.log10(abs(mu)) if mu and abs(mu) > 0 else FALTA,
        ]
        filas.append({"id": fid, "nombre": r["nombre"], "clase": r["clase"].replace("marrón", "marron"), "split": r["split"], "x": x})
    return filas


def regla_gaia(x):
    """Regla fisica sobre las mismas variables, sin entrenar."""
    en_gaia, _, mg, bprp, _, _ = x
    if en_gaia == 0:
        return "enana marron"
    if mg != FALTA and bprp != FALTA and mg >= 10.0 and bprp <= 0.8:
        return "enana blanca"
    return "estrella"


def modelo():
    return RandomForestClassifier(n_estimators=200, max_depth=4, min_samples_leaf=1, random_state=SEMILLA, class_weight="balanced")


def modelo_rapido():
    return RandomForestClassifier(n_estimators=30, max_depth=4, random_state=SEMILLA, class_weight="balanced")


def loo(X, y, fabrica=None):
    fabrica = fabrica or modelo
    pred = np.empty(len(y), dtype=object)
    for tr, te in LeaveOneOut().split(X):
        m = fabrica().fit(X[tr], y[tr])
        pred[te] = m.predict(X[te])
    return pred


def exactitud(p, y):
    return float(np.mean(p == y))


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


def predecir_json(modelo_json, x):
    suma = np.zeros(len(modelo_json["clases"]))
    for nodos in modelo_json["arboles"]:
        i = 0
        while not nodos[i]["hoja"]:
            n = nodos[i]
            i = n["i"] if x[n["f"]] <= n["t"] else n["d"]
        suma += np.array(nodos[i]["p"])
    suma /= len(modelo_json["arboles"])
    return modelo_json["clases"][int(np.argmax(suma))], suma


def main():
    filas = cargar()
    X = np.array([f["x"] for f in filas], dtype=float)
    y = np.array([f["clase"] for f in filas], dtype=object)
    print(f"{len(filas)} objetos:", dict(Counter(y)))

    pred = loo(X, y)
    acc = exactitud(pred, y)
    mayor = Counter(y).most_common(1)[0]
    base_mayor = mayor[1] / len(y)
    pred_regla = np.array([regla_gaia(x) for x in X], dtype=object)
    acc_regla = exactitud(pred_regla, y)

    # prueba de permutacion: cuantas veces un modelo con etiquetas barajadas iguala el acierto LOO
    rng = np.random.default_rng(SEMILLA)
    mejores = 0
    N = 40
    acc_rapido = exactitud(loo(X, y, modelo_rapido), y)  # mismo modelo ligero para comparar con las permutaciones
    for _ in range(N):
        yp = rng.permutation(y)
        if exactitud(loo(X, yp, modelo_rapido), yp) >= acc_rapido:
            mejores += 1
    p_perm = (mejores + 1) / (N + 1)

    matriz = {c: {c2: int(np.sum((y == c) & (pred == c2))) for c2 in CLASES} for c in CLASES}
    recall = {c: (matriz[c][c] / max(1, sum(matriz[c].values()))) for c in CLASES}
    fallos = [{"id": f["id"], "nombre": f["nombre"], "verdad": str(y[i]), "ml": str(pred[i])} for i, f in enumerate(filas) if pred[i] != y[i]]

    # split congelado de Horacio: entrenar con desarrollo y probar con prueba
    dev = np.array([f["split"] == "desarrollo" for f in filas])
    m_dev = modelo().fit(X[dev], y[dev])
    p_prueba = m_dev.predict(X[~dev])
    prueba = [{"nombre": filas[i]["nombre"], "verdad": str(y[i]), "ml": str(p)} for i, p in zip(np.where(~dev)[0], p_prueba)]

    # importancia de variables y modelo final con todos los datos
    final = modelo().fit(X, y)
    imp = {v: round(float(a), 4) for v, a in zip(VARS, final.feature_importances_)}
    mj = exportar(final)
    # paridad: el JSON exportado debe dar lo mismo que sklearn en todos los objetos
    desacuerdos = sum(1 for x, p in zip(X, final.predict(X)) if predecir_json(mj, x)[0] != p)

    res = {
        "n_objetos": len(filas), "clases": dict(Counter(y)), "validacion": "dejar uno fuera (LOO)",
        "exactitud_ml_loo": round(acc, 4), "linea_base_clase_mayoritaria": round(base_mayor, 4),
        "exactitud_regla_gaia_sin_entrenar": round(acc_regla, 4),
        "prueba_permutacion": {"repeticiones": N, "p_valor": round(p_perm, 4)},
        "matriz_confusion_loo": matriz, "recall_por_clase": {c: round(v, 3) for c, v in recall.items()},
        "fallos_loo": fallos, "split_congelado_horacio": {"entrena_con": int(dev.sum()), "prueba_con": int((~dev).sum()), "resultados": prueba},
        "importancia_variables": imp, "paridad_json_vs_sklearn_desacuerdos": desacuerdos, "semilla": SEMILLA,
    }
    (AQUI / "resultados.json").write_text(json.dumps(res, ensure_ascii=False, indent=1), encoding="utf-8")
    (AQUI / "modelo.json").write_text(json.dumps(mj), encoding="utf-8")
    print(json.dumps({k: res[k] for k in ("exactitud_ml_loo", "linea_base_clase_mayoritaria", "exactitud_regla_gaia_sin_entrenar", "prueba_permutacion", "recall_por_clase", "paridad_json_vs_sklearn_desacuerdos")}, ensure_ascii=False, indent=1))
    print("fallos LOO:", fallos)
    print("split de Horacio:", prueba)
    print("importancia:", imp)


if __name__ == "__main__":
    sys.exit(main())
