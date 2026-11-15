# ML Classifier · Sparks

Classical machine-learning classifier (proof of concept) that suggests a candidate **astronomical object class** (`estrella`, `enana marron`, `enana blanca`, `variable`) using Gaia DR3 luminosity and color features.

---

## Current model (v2 — trained on verified catalog)

| Detail | Value |
| --- | --- |
| Algorithm | Random Forest (`RandomForestClassifier`, 200 trees, `max_depth=4`, `class_weight="balanced"`) |
| Training set | 69 verified objects (`19` stars, `20` brown dwarfs, `12` white dwarfs, `18` variables) |
| Features | 4 Gaia DR3 features (`en_gaia`, `tiene_fotometria`, `mg_gaia`, `bp_rp`) |
| Validation accuracy | **78.3%** (`54/69` Leave-One-Out cross-validation; majority-class baseline `29.0%`, permutation test `p = 0.0323`) |
| Inference integration | Exported to JSON (`app/src/core/modelo.json`) and TypeScript (`app/src/core/clasificador.ts`) — zero Python dependencies at runtime |

### Honest limitations

- **Sample size:** 69 verified objects is a small dataset; the model is an informative candidate-class hint, not a definitive classification.
- **No SPHEREx image features yet:** v2 uses only Gaia DR3 luminosity (`mg_gaia`), color (`bp_rp`), and availability flags. Variable stars (`0.556` recall) often require SPHEREx multi-epoch difference-image features to distinguish from ordinary stars.
- **Faint objects beyond Gaia:** Ultracool brown dwarfs or Planet 9 candidates fainter than Gaia DR3's limit (`en_gaia = 0`) lack Gaia photometry and still require manual inspection in the blink viewer.

---

## Files

| File | Description |
| --- | --- |
| `entrenar_v2.py` | Trains the v2 Random Forest model, runs Leave-One-Out validation, and exports `modelo_v2.json` |
| `probar-paridad-v2.mjs` | Verifies that JavaScript inference (`predecir.mjs`) matches Python `scikit-learn` outputs (`paridad_v2.json`) |
| `datos/verdad-terreno-v2.csv` | Ground-truth catalog of 69 verified objects |
| `datos/gaia-fotometria-v2.csv` | Gaia DR3 photometry (`mg_gaia`, `bp_rp`) for the 69 objects |
| `resultados_v2.json` | Leave-One-Out evaluation metrics and confusion matrix for v2 |
| `entrenar.py` / `probar-paridad.mjs` | Legacy v1 prototype kept for reference |

---

## Running the parity test

```bash
node ml-clasificador/probar-paridad-v2.mjs
```

---

## Version 1 history (reference)

Version 1 (`entrenar.py`, 36 objects) included distance-correlated features (`log10_mu`, `log10_paralaje`, `g_mag`) that leaked sample selection bias rather than intrinsic physics. Version 2 removed those features after scientific review and expanded the verified catalog to 69 objects.
