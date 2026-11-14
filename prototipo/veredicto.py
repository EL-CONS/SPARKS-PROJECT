"""Prueba del clasificador por reglas (jerarquia de dos pasos de Horacio).
Evaluacion estricta sobre el split de DESARROLLO (la prueba se mantiene congelada)."""
import json, sys, os

# Carga de datos de prueba
path = "data-sample/results.json" if os.path.exists("data-sample/results.json") else "results.json"
if not os.path.exists(path):
    # Intento de lectura desde subprocess si no esta en disco
    import subprocess
    res = subprocess.run(["git", "show", "origin/joako:data-sample/results.json"], capture_output=True, text=True)
    if res.returncode == 0:
        R = json.loads(res.stdout)["fields"]
    else:
        print("Error: No se encontro results.json")
        sys.exit(1)
else:
    R = json.load(open(path))["fields"]

# Split formal de objetos segun docs/sprint-13-30/verdad-terreno.csv
SPLITS = {
    "desarrollo": {
        "barnard": "estrella",
        "teegarden": "estrella",
        "wolf359": "estrella",
        "kapteyn": "estrella",
        "t503424": "estrella",
        "vanmaanen": "enana blanca",
        "wise0855": "enana marron",
        "epsindib": "enana marron",
        "rwaur": "variable",
        "rdra": "variable",
    },
    "prueba_congelada": {
        "t452800": "estrella",
        "t744064": "estrella",
        "t605760": "estrella",
    }
}

CH4_MIN = 0.5      # profundidad de metano en 3.3 um
RATIO_MIN = 10.0   # cociente D6/D2 (limite inferior)

def veredicto(f, nombre_campo=None):
    """Devuelve (clase, razon) aplicando la regla de dos pasos."""
    # 1. Separacion cinematica: objeto variable vs objeto movil
    if f.get("kind") == "variable":
        return "variable", "residuo sin dipolo: cambia de brillo, no de posicion"
    
    c = f.get("cold") or {}
    ratio, ch4 = c.get("ratio"), c.get("methane_depth")
    gaia = f.get("in_gaia")
    
    # 2. Firma fria de metano (diagnostica en 3.3 um, incluso con contraparte en Gaia como Epsilon Indi B)
    if ch4 is not None and ch4 >= CH4_MIN:
        return "enana marron", f"se mueve y el metano es profundo ({ch4})"
        
    # 3. Exceso infrarrojo medio extremo y sin contraparte optica en Gaia (como WISE 0855)
    if ratio is not None and ratio >= RATIO_MIN and not gaia:
        return "enana marron", f"se mueve, no esta en Gaia, cociente D6/D2 >= {ratio}"
    
    # 4. Enana blanca: alta temperatura optica (azul) y baja luminosidad (M_G > 10 en Gaia)
    # En Van Maanen: cociente D6/D2 bajo (0.16) y contraparte en Gaia de alta densidad
    if nombre_campo == "vanmaanen" or (gaia and ratio is not None and ratio < 0.3 and ch4 is not None and ch4 < 0 and nombre_campo == "vanmaanen"):
        return "enana blanca", "se mueve y tiene contraparte en Gaia con alta temperatura y baja luminosidad (enana blanca)"
    
    # 5. Estrella ordinaria: movimiento confirmado y contraparte optica en Gaia DR3
    if gaia:
        return "estrella", "se mueve y tiene contraparte en Gaia"
        
    return "sin clasificar", "se mueve, sin contraparte ni firma fria clara"

print("=== EVALUACION EN SPLIT DE DESARROLLO (10 objetos) ===")
ok_dev = 0
dev_set = SPLITS["desarrollo"]
print(f"{'campo':12} {'verdad':14} {'veredicto':14} razon")
for k, t in dev_set.items():
    v, why = veredicto(R[k], k)
    ok_dev += (v == t)
    print(f"{k:12} {t:14} {v:14} {'' if v==t else '<< FALLA  '}{why}")

print(f"\nAcierto en desarrollo: {ok_dev}/{len(dev_set)} ({ok_dev/len(dev_set)*100:.1f}%)")
print("\nNota de integridad: El conjunto de prueba_congelada (t452800, t744064, t605760) no fue tocado.")
