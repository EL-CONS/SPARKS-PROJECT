"""Prueba rapida del clasificador por reglas (jerarquia de dos pasos de Horacio).
Solo lee data-sample/results.json. No es un modelo entrenado ni una validacion."""
import json, sys

R = json.load(open("data-sample/results.json"))["fields"]

# Etiqueta "verdadera": sale de la nota de cada campo en index.json (conocimiento previo, no de la regla).
TRUTH = {
    "barnard": "estrella", "teegarden": "estrella", "wolf359": "estrella", "kapteyn": "estrella",
    "t452800": "estrella", "t744064": "estrella", "t605760": "estrella", "t503424": "estrella",
    "vanmaanen": "enana blanca", "wise0855": "enana marron", "epsindib": "enana marron",
    "rwaur": "variable", "rdra": "variable",
}

CH4_MIN = 0.5      # profundidad de metano para llamarla candidata a enana fria
RATIO_MIN = 10.0   # cociente D6/D2 (limite inferior vale)

def veredicto(f):
    """Devuelve (clase, razon)."""
    if f.get("kind") == "variable":
        return "variable", "residuo sin dipolo: cambia de brillo, no de posicion"
    c = f.get("cold") or {}
    ratio, ch4 = c.get("ratio"), c.get("methane_depth")
    gaia = f.get("in_gaia")
    if ratio is not None and ratio >= RATIO_MIN and not gaia:
        return "enana marron", f"se mueve, no esta en Gaia, cociente >= {ratio}"
    if ch4 is not None and ch4 >= CH4_MIN:
        return "enana marron", f"se mueve y el metano es profundo ({ch4})"
    if gaia:
        return "estrella", "se mueve y tiene contraparte en Gaia"
    return "sin clasificar", "se mueve, sin contraparte ni firma fria clara"

ok = 0
print(f"{'campo':10} {'verdad':13} {'veredicto':13} razon")
for k, t in TRUTH.items():
    v, why = veredicto(R[k])
    ok += (v == t)
    print(f"{k:10} {t:13} {v:13} {'' if v==t else '<< FALLA  '}{why}")
print(f"\nacierto: {ok}/{len(TRUTH)}")
