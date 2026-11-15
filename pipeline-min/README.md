# Minimal SPHEREx Pipeline (`pipeline-min`) · Path B

## Context and Purpose
Minimal backup pipeline (Sprint 18:00–20:00 Path B) built to process raw SPHEREx cutouts whenever the main pipeline was not yet available in the repository.

- **Designed for:** `RW Aurigae` (variable star) and additional fields.
- **Data format:** Matches the Schema 1 contract (`data-sample/barnard/manifest.json`).
- **Mandatory methodological label:** **"frame subset"** (`subconjunto de cuadros`, 8 frames per detector and season), without inflating coverage or fabricating data.
- **Team coordination:**
  - **Carlos:** Uses raw cutouts downloaded by `recortes.py` (avoiding duplicate downloads from IRSA SIA).
  - **Horacio:** Aligns with astronomical quality rules to avoid methodological discrepancies with the main scientific pipeline.

## Components
- `coadd.py`: Computes per-detector, per-season coadds using robust statistics (median and MAD).
- `diff.py`: Subtracts coadds across successive seasons with median sky background alignment.
- `manifest.py`: Builds `manifest.json` validated against `data/contract.ts`.
- `run_pipeline.py`: End-to-end execution, exporting calibrated PNG images and the JSON manifest.

## Usage
```bash
python3 pipeline-min/run_pipeline.py \
  --field rwaur \
  --name "RW Aurigae" \
  --ra 76.9561 \
  --dec 30.4012 \
  --input-dir data-raw/rwaur \
  --out-dir data-new/rwaur
```
