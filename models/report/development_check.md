# Development-set check (NOT independent: these fields were used to build and tune Sparks)

Run: 2026-11-05 23:35 UTC. Fields: barnard, epsindib, kapteyn, rdra, rwaur, teegarden, vanmaanen, wise0855, wolf359.
A known mover is the field's target or a Gaia DR3 star with pm > 100 mas/yr at 10σ, G < 19, inside the grid, with an expected shift >= 0.5 px (6.15″ pixels) between the first and last season; stars within 1 px of each other count as one. No injections.

| Field | Object | PM (mas/yr) | G | Shift (px) | Residual within 3 px | Rule | ML (p mover) |
|---|---|---|---|---|---|---|---|
| barnard | Barnard's Star | 10393 | 8.2 | 1.66 | yes | mover | mover (0.89) |
| epsindib | ε Indi B | 4684 | 18.0 | 1.06 | yes | mover | mover (0.56) |
| kapteyn | Kapteyn's Star | 8644 | 8.1 | 1.40 | yes | mover | mover (0.95) |
| teegarden | Teegarden's Star | 5123 | 12.3 | 0.84 | yes | mover | variable (0.35) |
| wise0855 | WISE 0855−0714 | 8088 | — | 1.30 | yes | variable | static (0.03) |
| wolf359 | Wolf 359 | 4715 | 11.0 | 0.78 | yes | mover | variable (0.08) |

Rule labels **5/6** as mover; ML labels **3/6**; either: 5/6; a residual was found for 6/6.

False alarms (candidates labelled mover with no known mover within 3 px and no Gaia pm > 100 mas/yr match):

| Field | Candidates | Rule 'mover' | ML 'mover' |
|---|---|---|---|
| barnard | 122 | 0 | 0 |
| epsindib | 67 | 0 | 0 |
| kapteyn | 66 | 0 | 0 |
| rdra | 208 | 0 | 0 |
| rwaur | 76 | 0 | 0 |
| teegarden | 29 | 0 | 0 |
| vanmaanen | 18 | 0 | 0 |
| wise0855 | 64 | 1 | 1 |
| wolf359 | 23 | 0 | 0 |
| **total** | 673 | **1** | **1** |

Code and model hashes (sha256):

- `pipeline/sparks/candidates.py` 80706aa4840f3cf8…
- `pipeline/sparks/ml.py` 30dd67cc04487122…
- `pipeline/sparks/field.py` c51ffd051f135951…
- `pipeline/sparks/astrometry.py` dfea98f543b4e36e…
- `models/spark_detector.txt` 72af546a0840257b…
- `scripts/eval_known_movers.py` 7e49d960af38ee2b…
