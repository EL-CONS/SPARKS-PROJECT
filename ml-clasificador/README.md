> **UPDATE (v2, Nov 14 night).** Horacio's scientific review (`docs/ml/revision-ciencia-clasificador.md`) found that the 91.7% figure below (v1) was inflated: three features (catalog proper motion, parallax, and G magnitude) reflected sample distance bias rather than the physics of each class, and missing values were interpreted as "brown dwarf". **v2** removes those features, uses only Gaia luminosity and color (`mg_gaia`, `bp_rp`) plus data-availability flags, and is trained on the expanded **69-object** catalog.
>
> **Honest v2 result (LOO, 69 objects): 75.4% (52 of 69)**, vs. 29.0% for the majority class; permutation test `p = 0.032`. Per-class recall: brown dwarf 0.90, white dwarf 0.82, star 0.75, **variable 0.56**. Variables do not separate well using Gaia alone: that requires SPHEREx difference-image features (dipole vs. monopole), which this model does not yet use. Files: `entrenar_v2.py`, `modelo_v2.json` (uses the same `predecir.mjs`, with 4 features: `[en_gaia, tiene_fotometria, mg_gaia, bp_rp]`), `resultados_v2.json`, `paridad_v2.json`. Note: in `datos/verdad-terreno-v2.csv`, object `Gaia DR3 3713594960831605760` (Wolf 489) is still labeled as a star even though Horacio identified it as a white dwarf; the model predicts white dwarf and counts it as a miss until the label is corrected.
>
> **What can be stated in the pitch:** "A random forest on Gaia luminosity and color achieves 75% on 69 verified-class objects and clearly beats chance; it separates brown dwarfs very well and struggles on variables, which require SPHEREx imagery." Everything below is v1, kept for historical reference.

# Object-Class ML Classifier

A random forest (200 trees, depth 4, seed 42) that classifies an object into **star, brown dwarf, white dwarf, or variable** using six Gaia DR3 features: Gaia presence, parallax, absolute magnitude, BP-RP color, G magnitude, and proper motion. Trained on the 36 objects in `datos/verdad-terreno.csv` (class verified with SIMBAD or literature) and `datos/gaia-fotometria.csv`, both curated by Horacio.

## Results (leave-one-out, 36 objects)

| | Accuracy |
|---|---|
| **Random forest (ML)** | **91.7% (33 of 36)** |
| Majority class (learns nothing) | 47.2% |
| Untrained physical rule on Gaia variables only | 77.8% |

Permutation test (40 shuffles of labels): none matched the accuracy, `p = 0.024`. Per-class recall: star 1.00, brown dwarf 0.88, white dwarf 0.80, variable 0.83. With Horacio's split (train on 33, test on 3 held-out stars): 3 of 3.

The three misses: Mira (variable, missing Gaia parallax, predicted brown dwarf), Luhman 16 (brown dwarf in Gaia, predicted variable), and Procyon B (white dwarf missing Gaia photometry, predicted brown dwarf). All three have missing or unusual Gaia entries.

## Limitations (read before citing in the pitch)
- **Only 36 objects.** This is an honest proof of concept, not a large-scale validation. The confidence interval on 33/36 is wide.
- The white-dwarf rule and the model use similar variables (absolute magnitude and color), so ML does not discover new physics there: it reproduces the rule.
- The "Gaia-only" rule cannot separate variables, so comparing against it is not fair; the full app rule also uses the difference image.
- Brown dwarfs are mostly flagged because they are absent from Gaia. Separating them from other faint objects requires the SPHEREx spectral fingerprint (`D6/D2` ratio and methane), which this model does not yet use.
- Outputs are a "candidate class", never a definitive identification.

## Files
- `entrenar.py`: trains, evaluates, and exports. Requires `scikit-learn` and `numpy`.
- `modelo.json`: the exported forest. `predecir.mjs`: zero-dependency JavaScript inference for the browser.
- `probar-paridad.mjs`: verifies that `predecir.mjs` matches `scikit-learn` across all 36 objects (run with `node`): 0 class mismatches, max probability difference `7e-8`.
- `resultados.json`: all numbers above, confusion matrix, and feature importances.
