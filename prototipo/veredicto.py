"""Quick test of the rule-based classifier (Horacio's two-step hierarchy).
Reads only data-sample/results.json. Not a trained model or a validation."""
import json, sys

R = json.load(open("data-sample/results.json"))["fields"]

# "Ground truth" label: taken from each field's note in index.json (prior knowledge, not from the rule).
TRUTH = {
    "barnard": "estrella", "teegarden": "estrella", "wolf359": "estrella", "kapteyn": "estrella",
    "t452800": "estrella", "t744064": "estrella", "t605760": "estrella", "t503424": "estrella",
    "vanmaanen": "enana blanca", "wise0855": "enana marron", "epsindib": "enana marron",
    "rwaur": "variable", "rdra": "variable",
}

CH4_MIN = 0.5      # methane depth threshold to flag a cold brown dwarf candidate
RATIO_MIN = 10.0   # D6/D2 ratio threshold (lower limit counts)

def veredicto(f):
    """Return (class, reason)."""
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
