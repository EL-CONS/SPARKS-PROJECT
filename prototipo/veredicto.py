"""Rule-based classifier test (Horacio's two-step hierarchy).

Gaia DR3 photometry and astrometry are read from the verified table
`docs/sprint-13-30/gaia-fotometria.csv` (queried via TAP on 2026-11-14).
No hard-coded values by name or generic links.

The white-dwarf rule is physical: M_G = G + 5 + 5*log10(plx/1000) >= 10.0
and BP-RP <= 0.8. If Gaia photometry is missing, the object is reported as
`estrella` (star) with an explicit reason; no verdict is fabricated.

Only the `desarrollo` (development) split is evaluated. The three `prueba`
(test) objects (t452800, t744064, t605760) are neither evaluated nor used to
tune thresholds.
"""
import csv
import json
import math
import os
import sys

# ---------------------------------------------------------------- paths
def buscar(*rutas):
    for r in rutas:
        if os.path.exists(r):
            return r
    return None

path_results = buscar("data-sample/results.json", "results.json")
path_gaia = buscar(
    "docs/sprint-13-30/gaia-fotometria.csv",
    "../docs/sprint-13-30/gaia-fotometria.csv",
)

if path_results is None:
    print("Error: no se encontro results.json")
    sys.exit(1)
if path_gaia is None:
    print("Error: no se encontro docs/sprint-13-30/gaia-fotometria.csv")
    sys.exit(1)

R = json.load(open(path_results, encoding="utf-8"))["fields"]

# ---------------------------------------------------------------- Gaia table
GAIA = {}
with open(path_gaia, encoding="utf-8", newline="") as fh:
    for fila in csv.DictReader(fh):
        idc = (fila.get("id_campo") or "").strip()
        if idc:
            GAIA[idc] = fila


def num(fila, columna):
    """Return float or None if the cell is empty or says 'sin verificar'."""
    if fila is None:
        return None
    valor = (fila.get(columna) or "").strip()
    if not valor or valor.lower().startswith("sin"):
        return None
    try:
        return float(valor)
    except ValueError:
        return None


# ---------------------------------------------------------------- splits
# Deterministic rule: `prueba` are the three data-sample fields whose id
# starts with "t" (t452800, t744064, t605760). The rest is `desarrollo`.
# No random seed was used. See docs/sprint-13-30/reglas-veredicto.md.
SPLIT_DESARROLLO = {
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
}
SPLIT_PRUEBA = {
    "t452800": "estrella",
    "t744064": "estrella",
    "t605760": "estrella",
}

CH4_MIN = 0.5      # 3.3 um methane absorption (SPHEREx band D4)
RATIO_MIN = 10.0   # minimum F_D6/F_D2 for ultracool objects without Gaia
MG_WD_MIN = 10.0   # minimum absolute magnitude for the white-dwarf sequence
BPRP_WD_MAX = 0.8  # maximum optical color for a white dwarf


def calcular_mg(g, plx_mas):
    """M_G = G + 5 + 5*log10(plx/1000); plx in milliarcseconds."""
    if g is None or plx_mas is None or plx_mas <= 0:
        return None
    return g + 5.0 + 5.0 * math.log10(plx_mas / 1000.0)


def veredicto(f, fid):
    """Classify an object using only physics and the verified Gaia table."""
    # 1. Kinematics: residual without dipole (variable) vs translation (mover)
    if f.get("kind") == "variable":
        return "variable", "residuo sin dipolo: cambia de brillo, no de posicion"

    cold = f.get("cold") or {}
    ratio = cold.get("ratio")
    ch4 = cold.get("methane_depth")
    in_gaia = bool(f.get("in_gaia"))

    # 2. Deep methane: molecular signature of cold atmospheres.
    #    Evaluated before Gaia because a T dwarf may have a faint optical
    #    counterpart or be bound to a star (epsilon Indi B).
    if ch4 is not None and ch4 >= CH4_MIN:
        return "enana marron", (
            f"se mueve y presenta absorcion profunda de metano "
            f"(CH4={ch4:.2f} >= {CH4_MIN})"
        )

    # 3. Ultracool brown dwarf with no optical detection in Gaia.
    if ratio is not None and ratio >= RATIO_MIN and not in_gaia:
        return "enana marron", (
            f"se mueve, ausente en Gaia y cociente infrarrojo "
            f"D6/D2={ratio:.2f} >= {RATIO_MIN}"
        )

    # 4. Astrophysical classification with Gaia DR3.
    if in_gaia:
        fila = GAIA.get(fid)
        g = num(fila, "phot_g_mean_mag")
        bp_rp = num(fila, "bp_rp")
        plx = num(fila, "parallax_mas")
        mg = calcular_mg(g, plx)
        sid = (fila or {}).get("gaia_source_id", "")

        if mg is not None and bp_rp is not None:
            if mg >= MG_WD_MIN and bp_rp <= BPRP_WD_MAX:
                return "enana blanca", (
                    f"Gaia DR3 {sid}: M_G={mg:.2f} >= {MG_WD_MIN} "
                    f"y BP-RP={bp_rp:.2f} <= {BPRP_WD_MAX}"
                )
            return "estrella", (
                f"Gaia DR3 {sid}: M_G={mg:.2f}, BP-RP={bp_rp:.2f}; "
                f"no cumple el criterio de enana blanca"
            )

        # Has in_gaia flag, but the table lacks photometry/parallax.
        return "estrella", (
            "se mueve y tiene contraparte en Gaia, pero la tabla no trae "
            "fotometria/paralaje verificable; no se puede calcular M_G"
        )

    return "sin clasificar", "se mueve, sin contraparte Gaia ni firma fria concluyente"


print("=== EVALUACION EN EL SPLIT DE DESARROLLO ===")
print("(la tabla Gaia se lee de docs/sprint-13-30/gaia-fotometria.csv)")
print(f"{'campo':11} {'verdad':14} {'veredicto':14} razon")
ok = 0
for fid, verdad in SPLIT_DESARROLLO.items():
    pred, razon = veredicto(R[fid], fid)
    acierto = pred == verdad
    ok += acierto
    marca = "" if acierto else "<< FALLA  "
    print(f"{fid:11} {verdad:14} {pred:14} {marca}{razon}")

print(f"\nAcierto en desarrollo: {ok}/{len(SPLIT_DESARROLLO)} "
      f"({ok / len(SPLIT_DESARROLLO) * 100:.1f}%)")
print("Caveat: las reglas se ajustaron sobre este mismo conjunto (n=10); "
      "no es una validacion independiente.")

# ---------------------------------------------------------------- external control
# White dwarfs that are NOT among the 10 development fields with SPHEREx
# features in results.json (though they appear in the catalog as development).
# Used as an honesty check for the physical rule; not used to tune thresholds.
CONTROL_WD = {
    "siriusb": "enana blanca",
    "stein2051b": "enana blanca",
    "gliese440": "enana blanca",
    "procyonb": "enana blanca",
}
print("\n=== CONTROL EXTERNO DE ENANAS BLANCAS (no es el split evaluado) ===")
print("No estan entre los 10 campos con features de SPHEREx y no se usaron")
print("para ajustar umbrales.")
ok_wd = 0
for fid, verdad in CONTROL_WD.items():
    f = {"kind": "mover", "in_gaia": True, "cold": {}}
    pred, razon = veredicto(f, fid)
    acierto = pred == verdad
    ok_wd += acierto
    marca = "" if acierto else "<< FALLA  "
    print(f"{fid:11} {verdad:14} {pred:14} {marca}{razon}")

print(f"\nControl externo de enanas blancas: {ok_wd}/{len(CONTROL_WD)}")
print("Nota: Procyon B no tiene fotometria Gaia DR3 verificable en este "
      "entorno; la regla lo reporta como estrella en vez de inventar M_G.")

print("\n=== PRUEBA CONGELADA ===")
print("t452800, t744064, t605760: no evaluados. Sus etiquetas y features "
      "no se usaron para ajustar la regla.")
