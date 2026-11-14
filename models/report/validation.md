# Validation: known movers (may be used for tuning)

Run: 2026-11-05 22:56 UTC. Fields: t489088, t110464, t223040, t525696, t503424, t739840.
A known mover is the field's target or a Gaia DR3 star with pm > 100 mas/yr at 10σ, G < 19, inside the grid, with an expected shift >= 0.5 px (6.15″ pixels) between the first and last season; stars within 1 px of each other count as one. No injections.

| Field | Object | PM (mas/yr) | G | Shift (px) | Residual within 3 px | Rule | ML (p mover) |
|---|---|---|---|---|---|---|---|
| t489088 | Groombridge 1830 | 7062 | 6.2 | 1.15 | yes | mover | variable (0.45) |
| t110464 | Lalande 21185 | 4812 | 6.6 | 0.78 | yes | mover | mover (0.99) |
| t223040 | Gaia DR3 3195919528989223040 | 4090 | 4.2 | 0.66 | yes | mover | mover (0.97) |
| t223040 | Gaia DR3 3195919254111315712 | 4019 | 9.5 | 0.65 | yes | mover | mover (0.70) |
| t223040 | Gaia DR3 3195919254111314816 | 4084 | 9.8 | 0.66 | yes | mover | mover (0.70) |
| t525696 | Gaia DR3 5853498713190525696 | 3859 | 9.0 | 0.63 | yes | mover | mover (0.64) |
| t503424 | Gaia DR3 6281432246412503424 | 3508 | 16.6 | 0.56 | yes | mover | mover (0.98) |
| t739840 | Gaia DR3 5140693571158739840 | 3429 | 10.5 | 0.55 | yes | mover | mover (0.92) |

Rule labels **8/8** as mover; ML labels **7/8**; either: 8/8; a residual was found for 8/8.

False alarms (candidates labelled mover with no known mover within 3 px and no Gaia pm > 100 mas/yr match):

| Field | Candidates | Rule 'mover' | ML 'mover' |
|---|---|---|---|
| t489088 | 45 | 0 | 2 |
| t110464 | 73 | 0 | 3 |
| t223040 | 134 | 0 | 3 |
| t525696 | 509 | 3 | 54 |
| t503424 | 21 | 0 | 0 |
| t739840 | 29 | 0 | 1 |
| **total** | 811 | **3** | **63** |

Code and model hashes (sha256):

- `pipeline/sparks/candidates.py` 80706aa4840f3cf8…
- `pipeline/sparks/ml.py` 30dd67cc04487122…
- `pipeline/sparks/field.py` c51ffd051f135951…
- `pipeline/sparks/astrometry.py` dfea98f543b4e36e…
- `models/spark_detector.txt` 72af546a0840257b…
- `scripts/eval_known_movers.py` 7e49d960af38ee2b…
