# Test protocol (v2) · written and committed before any of these stars was processed

Created 2026-11-05 (second autonomous session). Script: `scripts/select_test_stars.py` (selection rule in its docstring). Machine-readable copy: `test_protocol.json`.

## Why
The first "independent test" was contaminated: the rule was changed after seeing it fail on Kapteyn and Wolf 359, and re-measured on the same six stars. Those stars, and every field processed on 5 Nov (Barnard, ε Indi B, WISE 0855, RW Aur, R Dra, Teegarden, Van Maanen, Wolf 359, Kapteyn), are now the **development set**.

## Selection rule (fixed before running)
1. Gaia DR3 sources with pm > 2000 mas/yr (one ESA Gaia TAP query, 87 sources).
2. Drop anything within 0.5° of a development field; stars within 3′ of each other share one field (binaries, multiples).
3. Keep fields with SPHEREx coverage (QR2 + QR3 SIA) in ≥ 2 seasons and an expected shift ≥ 0.5 px between the first and last season. Pool: 68 fields; **19 qualify**.
4. At most 14 fields: the five stars named in the team brief that pass the cut first (Groombridge 1830, Lacaille 9352, Gliese 1, Lalande 21185, Lacaille 8760), the rest drawn at random with seed **20261106**.
5. Split with seed **1930**: 40 % validation, the rest final test.

Named stars that cannot pass the cut (≤ 1.6″/yr cannot reach 0.5 px in ~1 year): Ross 128, Ross 154, LHS 288. <!-- nocheck -->

## Fields

| Field | Star(s) (Gaia DR3) | Name | pm (mas/yr) | G | Images | Seasons | Expected shift (px) | Split |
|---|---|---|---|---|---|---|---|---|
| t489088 | 4034171629042489088 | Groombridge 1830 | 7062 | 6.2 | 348 | 3 | 1.15 | **validation** |
| t110464 | 762815470562110464 | Lalande 21185 | 4812 | 6.6 | 283 | 3 | 0.78 | **validation** |
| t223040 | 3195919528989223040, 3195919254111314816, 3195919254111315712 | — | 4090 | 4.2 | 428 | 3 | 0.66 | **validation** |
| t525696 | 5853498713190525696 | — | 3859 | 9.0 | 352 | 3 | 0.63 | **validation** |
| t503424 | 6281432246412503424 | — | 3508 | 16.6 | 343 | 3 | 0.56 | **validation** |
| t739840 | 5140693571158739840, 5140693571158946048 | — | 3429 | 10.5 | 346 | 3 | 0.55 | **validation** |
| t452800 | 6553614253923452800 | Lacaille 9352 | 6896 | 6.5 | 349 | 3 | 1.13 | **final test** |
| t744064 | 2306965202564744064 | Gliese 1 | 6098 | 7.7 | 367 | 3 | 0.99 | **final test** |
| t048640 | 6583272171336048640 | Lacaille 8760 | 3455 | 6.0 | 332 | 4 | 0.80 | **final test** |
| t602752 | 778947814402602752, 778947608243864320 | — | 4505 | 7.9 | 289 | 3 | 0.73 | **final test** |
| t605760 | 3713594960831605760 | — | 3898 | 14.4 | 388 | 3 | 0.63 | **final test** |
| t322432 | 411413822074322432 | — | 3805 | 4.9 | 390 | 3 | 0.62 | **final test** |
| t759552 | 6307374845312759552 | — | 3680 | 8.8 | 334 | 3 | 0.59 | **final test** |
| t177024 | 4847957293278177024 | — | 3121 | 4.1 | 428 | 3 | 0.51 | **final test** |

## Rules of use
- **Validation** fields may be used to tune the rule and the ML. Every change goes to `DECISIONS.md`.
- **Final-test** fields are processed only after freezing (`scripts/eval_known_movers.py freeze` writes the sha256 of the rule, the ML code, the pipeline and the model to `frozen.json`).
- The final test runs **once** (`scripts/eval_known_movers.py final_test`). The script refuses to run again, or to run if any frozen file changed. The result is reported as it comes out, in `final_test.md`.
- What the app uses (rule, ML or both) is decided only from the final test.
- Stars measured well may join the app gallery only after the final test.
- The pipeline itself (`field.py`, `astrometry.py`) is not changed between validation and the final test.

## Decision rule for the app (written 2026-11-05, before the final test)
Measured on the final test only:
- **ML in the app** if it labels at least as many known movers as the rule **and** gives no more false alarms (candidates labelled "mover" away from any known mover) than the rule.
- **Combination** ("mover" if either says so) only if it labels more known movers than the rule alone. Union false alarms are not computed by the evaluation, so this option needs the ML false alarms to be 0.
- **Otherwise the rule** stays, and the ML stays as an experimental second opinion.
