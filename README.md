# Sparks · SPHEREx data pipeline (branch `Horacio`)

Team **Cosmonautas** · NASA Space Apps Challenge 2026 · challenge **Planet X and SPHEREx** (Hermosillo local event).

This branch holds the science side of Sparks: the pipeline that downloads and processes NASA SPHEREx images, measures proper motion and a coldness index, and writes the data the web app reads. The web app itself lives on `main`.

Sparks shows **candidates to review**, never discoveries. It is an independent project, not affiliated with or endorsed by NASA.

## What is here

| Path | What it is |
|---|---|
| `pipeline/sparkspipe/` | Python package: discovery (IRSA SIA2), cutout download, quality masks, reprojection onto a common 64 x 64 grid (6.15″/px), coadds, season differences, proper-motion fit, PSF photometry and manifest writing |
| `pipeline/tests/` | `pytest` tests (binary format, motion fit, manifest) |
| `pipeline/make_results.py`, `pipeline/dipole_features.py` | Builds `data-new/results.json`; dipole features of the difference images |
| `data-new/` | Processed fields for WISE 0855, ε Indi B, RW Aurigae and R Draconis, in the same format as `data-sample/barnard` |
| `docs/pipeline/metodo.md` | **Full method**: epochs, discovery, cutouts, flags, coadds, proper motion, coldness index, results and limitations |
| `docs/methods.md` | Methods of the earlier detector (rule vs. ML) |
| `models/report/` | Frozen test protocol, validation and final test of the mover detector |
| `prototipo/veredicto.py` | Physical-rule prototype for the object verdict |

Planning notes, sprint plans and research notes (`CONTEXTO.md`, `sprint-*.md`, `docs/sprint-*`, `research/`) are internal team documents written in Spanish.

## Run it

Python 3.12. Exact versions in [`pipeline/ambiente.md`](pipeline/ambiente.md).

```powershell
python -m venv pipeline/.venv
pipeline\.venv\Scripts\python.exe -m pip install -r pipeline/requirements.txt

cd pipeline
.\.venv\Scripts\python.exe -m pytest tests -q
.\.venv\Scripts\python.exe -m sparkspipe discover all
.\.venv\Scripts\python.exe -m sparkspipe run all --cap 6 --workers 4
.\.venv\Scripts\python.exe -m sparkspipe verify ..\data-new\wise0855
```

## Results (final run, 14 November 2026)

| Target | Measured proper motion | Expected | Status |
|---|---|---|---|
| WISE 0855 | 6.04 ± 0.76″/yr (D5/D6, neighbor star masked) | 8.09″/yr | agreement within 3σ (2.7σ) |
| ε Indi B | 4.21 ± 0.28″/yr | 4.68″/yr | agreement within 2σ (1.7σ) |
| RW Aurigae | 1.32 ± 0.57″/yr | 0.028″/yr | upper limit, not a detection (variability) |
| R Draconis | not measured | 0.022″/yr | core saturated and masked |

Coldness index for WISE 0855: `F(D6)/F(D2) ≥ 10.09` (lower limit, after subtracting the neighbor star's PSF) and methane depth at 3.3 µm `1.20 ± 0.10`. Details and every caveat in [`docs/pipeline/metodo.md`](docs/pipeline/metodo.md).

## Data and credits

- **Images:** NASA SPHEREx mission, from the NASA/IPAC Infrared Science Archive (IRSA). Releases DR1 (DOI 10.26131/IRSA678) and QR3 (DOI 10.26131/IRSA662); QR2 (DOI 10.26131/IRSA652) was not returned by SIA2 for these fields.
- **Reference astrometry and photometry:** Gaia DR3 (ESA/Gaia/DPAC).
- **Literature values:** Luhman 2014 and Luhman & Esplin 2014 (WISE 0855); McCaughrean et al. 2004 (ε Indi B).
- **Software:** numpy, astropy, reproject, pyvo, requests, scipy, matplotlib, pillow, pytest.
