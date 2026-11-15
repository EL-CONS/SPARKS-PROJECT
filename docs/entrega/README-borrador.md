# Repository README Draft · Sparks

**Tagline:** *"Every spark that moves has a fingerprint."*
**Team:** Cosmonautas (Hermosillo, Sonora, Mexico) — NASA Space Apps Challenge 2026, *Planet X and SPHEREx* challenge.

> **Note on the current branch (`carlos`):** in this repository, sprint work is split across branches while being integrated into `main`. The `app/`, `data-sample/`, and `server/` directories live in `origin/cons`; `pipeline/` and `data-new/` live in `origin/Horacio` (also integrated into `origin/cons` / `origin/joako`); `ml-clasificador/` lives in `origin/joako` (and `origin/cons`). The `carlos` branch holds the IRSA access/coverage verification, the S3 `Range` test, the cutout backup scripts, and these submission documents.

---

## 1. What Sparks Is

Sparks is a public web tool inspired by the blink comparator Clyde Tombaugh used to discover Pluto in 1930. Users enter a sky coordinate (`RA / Dec`) or pick one of the five challenge targets:

- **Barnard's Star** (`269.4485 / +4.7394`, J2016)
- **ε Indi B** (`331.0441 / −56.7828`, J2000; distinct from ε Indi A at `330.8404 / −56.7869`)
- **WISE 0855** (`133.7951 / −7.2451`)
- **RW Aurigae** (`76.9561 / +30.4012`)
- **R Draconis** (`248.1674 / +66.7550`, J2016)

Sparks aligns available SPHEREx seasons across all 6 detectors (`D1`–`D6`, 102 infrared bands), lets users blink or subtract seasons in **blue** (before) and **amber** (now), overlays the measured proper-motion vector against Gaia DR3 / CatWISE2020, and displays the spectral fingerprint to flag **candidates to review**.

---

## 2. How to Run Locally

### Web application (`app/`, `cons` branch or integrated branch)

Requirements: Node.js and npm. According to `origin/cons:app/package.json`:

```bash
cd app
npm install
npm run dev
```

Vite serves the UI at `http://localhost:5173` and exposes `/data-sample` from the parent directory via the `serve-data-sample` plugin (`app/vite.config.ts`).

Other scripts available in `app/package.json`:
- `npm run build` — Compiles TypeScript and builds `app/dist/` (`tsc && vite build`).
- `npm run preview` — Serves the generated build.
- `npm run typecheck` — Checks types without emitting files (`tsc --noEmit`).
- `npm test` — Runs the unit test suite with Vitest (`vitest run`).
- `npm run check-data` — Validates data JSON files (`node scripts/check-data.mjs`).

### Live backup server (`server/`, `cons` branch)
- `node server/demo-server.mjs` — Helper server for live queries when the Python backend is not running on the client machine.

### Scientific pipeline (`pipeline/`, `Horacio` branch)
- Python package `pipeline/sparkspipe/` with dependencies in `pipeline/requirements.txt` (`astropy`, `numpy`, `requests`, `scipy`, `reproject`). Generates `data-new/` (`coadds.bin`, `diffs.bin`, `medians.bin`, `masks.bin`, `manifest.json`, `catalogs.json`, `results.json`).

### Coverage and cutout scripts (`docs/sprint-13-30/`, `carlos` branch)
Python 3 standard library only (no external dependencies):
- `python3 docs/sprint-13-30/cobertura.py` — Queries SIA across 36 objects (`spherex_dr1`, `spherex_qr3`, `spherex_qr2`).
- `python3 docs/sprint-13-30/recortes.py --out <path_outside_git>` — Downloads `size=0.11` cutouts without the `EPSF` cube, using 6 threads and retries.

---

## 3. Repository Structure

| Folder | Primary Branch | Contents and Role |
|---|---|---|
| `app/` | `origin/cons`, `origin/joako` | React + TypeScript + Vite frontend (`src/core/`, `src/data/`, `src/i18n/`, `src/ui/`, `tests/`). |
| `data-sample/` | `origin/cons`, `origin/joako` | Pre-sprint data package (`results.json` from `2026-11-06`, `barnard/`, `index.json`). Do not modify. |
| `data-new/` | `origin/Horacio`, `origin/cons` | New outputs generated on `2026-11-14/15` by `pipeline/sparkspipe/` for `wise0855`, `epsindib`, `rwaur`, `rdra`, with `results.json`. |
| `pipeline/` | `origin/Horacio`, `origin/joako` | New Python pipeline (`sparkspipe/`) for SIA discovery, downloads, per-season coadds, background/neighbor-PSF subtraction, astrometry, and photometry. |
| `ml-clasificador/` | `origin/joako`, `origin/cons` | Random Forest object-class classifier (`estrella`, `enana marron`, `enana blanca`, `variable`) with Python training (`entrenar_v2.py`, `75.4%` LOO on 69 objects) and JS inference (`predecir.mjs`, `modelo_v2.json`). |
| `docs/` | All branches | Challenge docs, sprint plans, access tests (`sprint-13-30/`), rules (`reto/normas.md`), pitch scripts (`pitch/`), and submission pieces (`entrega/`). |
| `branding/` & `Logo/` | All branches | Visual identity, palettes (`#06080C`, `#62B6E8`, `#FFB238`), and Sparks SVG/PNG logos. Do not modify `Logo/`. |

*(Note: `research/` contains preliminary research material; per sprint rules, no code or data from any prior project is reused.)*

---

## 4. Data Sources

1. **SPHEREx images and metadata:** NASA/IPAC IRSA SIA service (`https://irsa.ipac.caltech.edu/SIA`) querying `spherex_dr1` and `spherex_qr3` (`spherex_qr2` returns `0` rows in SIA across the 36 objects checked in `docs/sprint-13-30/cobertura.csv`). The public S3 bucket `nasa-irsa-spherex` (`us-east-1`) serves full files or byte-range reads (`HTTP 206` with CORS enabled, verified in `docs/sprint-13-30/lectura-navegador.md`).
2. **Reference astrometric and photometric catalogs:**
   - **ESA Gaia DR3** (TAP `gea.esac.esa.int/tap-server/tap/sync`): proper motions, parallaxes, and `G`, `BP-RP` photometry.
   - **CatWISE2020** (mid-infrared): reference proper motion for cold sources invisible in Gaia such as `WISE 0855` (`origin/cons:data-sample/results.json`).
   - **SIMBAD (Harvard mirror)** and literature references (`Luhman & Esplin 2014` for `WISE 0855` epoch and proper motion in `recortes.py`).

---

## 5. What We Do NOT Do (Scope and Honest Limits)

- **We do not claim discoveries:** Sparks never announces Planet X discoveries or definitive classifications; it outputs **candidates to review** with error bars and source traceability.
- **We do not replace the physical detector with ML when ML underperforms:** in the prior frozen test (`origin/cons:data-sample/results.json`, unverified on `carlos`), the physical rule outperformed LightGBM (`8/9` with `0` false alarms vs. `6/9` with `10` false alarms); therefore the primary verdict uses physical rules and ML serves as a second opinion.
- **We do not measure cores on saturated sources:** `R Draconis` is saturated in `534/534` frames (`docs/sprint-13-30/entrega-horacio.md`), preventing core centroiding (`0` usable detections in `origin/Horacio:data-new/results.json`).
- **We do not run full FITS calibration in the browser yet:** although direct `S3 Range` reads work for the `IMAGE` plane (`551,040 B` in 2 requests or `45,184 B` in 65 requests), the web client does not yet perform on-the-fly `ZODI` subtraction, `Rice` `FLAGS` decoding, or `WCS-WAVE` reprojection.
- **We do not push the 578 FITS cutouts to Git or include anyone under 18:** cutouts live outside the repository and the submission complies with the privacy rules in `docs/reto/normas.md`.
