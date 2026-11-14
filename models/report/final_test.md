# Final test: known movers (run once, rule and model frozen)

Run: 2026-11-05 23:35 UTC. Fields: t452800, t744064, t048640, t602752, t605760, t322432, t759552, t177024.
A known mover is the field's target or a Gaia DR3 star with pm > 100 mas/yr at 10σ, G < 19, inside the grid, with an expected shift >= 0.5 px (6.15″ pixels) between the first and last season; stars within 1 px of each other count as one. No injections.

| Field | Object | PM (mas/yr) | G | Shift (px) | Residual within 3 px | Rule | ML (p mover) |
|---|---|---|---|---|---|---|---|
| t452800 | Lacaille 9352 | 6896 | 6.5 | 1.13 | yes | mover | mover (1.00) |
| t744064 | Gliese 1 | 6098 | 7.7 | 0.99 | yes | mover | variable (0.23) |
| t048640 | Lacaille 8760 | 3455 | 6.0 | 0.80 | yes | mover | mover (0.80) |
| t602752 | Gaia DR3 778947814402602752 | 4505 | 7.9 | 0.73 | yes | mover | variable (0.20) |
| t602752 | Gaia DR3 778947608243864320 | 4445 | 12.3 | 0.72 | yes | mover | mover (0.77) |
| t605760 | Gaia DR3 3713594960831605760 | 3898 | 14.4 | 0.63 | yes | mover | mover (0.99) |
| t322432 | Gaia DR3 411413822074322432 | 3805 | 4.9 | 0.62 | yes | mover | mover (0.97) |
| t759552 | Gaia DR3 6307374845312759552 | 3680 | 8.8 | 0.59 | yes | artifact | variable (0.24) |
| t177024 | Gaia DR3 4847957293278177024 | 3121 | 4.1 | 0.51 | yes | mover | mover (0.99) |

Rule labels **8/9** as mover; ML labels **6/9**; either: 8/9; a residual was found for 9/9.

False alarms (candidates labelled mover with no known mover within 3 px and no Gaia pm > 100 mas/yr match):

| Field | Candidates | Rule 'mover' | ML 'mover' |
|---|---|---|---|
| t452800 | 71 | 0 | 3 |
| t744064 | 42 | 0 | 2 |
| t048640 | 39 | 0 | 0 |
| t602752 | 37 | 0 | 2 |
| t605760 | 26 | 0 | 0 |
| t322432 | 122 | 0 | 1 |
| t759552 | 41 | 0 | 1 |
| t177024 | 163 | 0 | 1 |
| **total** | 541 | **0** | **10** |

Code and model hashes (sha256):

- `pipeline/sparks/candidates.py` 80706aa4840f3cf8…
- `pipeline/sparks/ml.py` 30dd67cc04487122…
- `pipeline/sparks/field.py` c51ffd051f135951…
- `pipeline/sparks/astrometry.py` dfea98f543b4e36e…
- `models/spark_detector.txt` 72af546a0840257b…
- `scripts/eval_known_movers.py` 7e49d960af38ee2b…
