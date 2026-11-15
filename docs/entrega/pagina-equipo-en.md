# Team Cosmonautas — Sparks

## Who We Are
We are **Cosmonautas**, a team of Computer Science students in Hermosillo, Sonora, Mexico, competing in the NASA Space Apps Challenge 2026 (UTH Hermosillo local site) on the **Planet X and SPHEREx** challenge.

## Team Roles
- **Cons:** Frontend core logic (`app/src/core/`, `data/`, `i18n/`, automated tests), ML model integration, and browser bridge.
- **Carlos:** Challenge research, official guidelines, IRSA/SPHEREx data access and coverage verification (`cobertura.py`, `recortes.py`, `s3-range-test.html`), Aladin Lite WCS integration testing, and visual frontend direction.
- **Horacio:** Astrophysics and verdict logic — proper-motion measurement, spectral coldness indices, movement vs. variability separation, and ground-truth target catalog.
- **Joaquin:** Team coordination, visual UI direction, physical-rule prototype (`veredicto.py`), honest validation protocol, and pitch structure.

## What We Built
**Sparks** (*"Every spark that moves has a fingerprint."*) is a public web tool inspired by Clyde Tombaugh's 1930 blink comparator. You enter any sky coordinate (RA/Dec) or pick one of the five challenge targets (Barnard's Star, epsilon Indi B at `331.044 / -56.783` [`331.0441 / -56.7828`, J2000; distinct from epsilon Indi A at `330.84 / -56.786`, `330.8404 / -56.7869`], WISE 0855, RW Aurigae, R Draconis), and Sparks gathers multi-epoch NASA SPHEREx infrared images across all six detectors (102 spectral bands), blinks or subtracts seasons in **blue** (before) and **amber** (now), overlays a measured proper-motion vector compared against Gaia DR3 / CatWISE, and plots the object's 102-color infrared fingerprint to flag **candidates to review**.

## Honest Assessment: What Works and What Does Not
**What works (verified on branch `carlos`):**
- **SPHEREx coverage and cutout pipeline:** 35 of 36 ground-truth objects have at least two seasons (>60-day gap) in `spherex_dr1` + `spherex_qr3` (Gliese 687 is the sole 1-season exception, with 965 images over 17 continuous months), and all 36 of 36 have DR1 coverage (221 to 965 images per object; `docs/sprint-13-30/cobertura-y-acceso.md`). We downloaded all 578 cutouts across R Draconis (144/144), RW Aurigae (144/144), WISE 0855 (126/126), and epsilon Indi B (164/164) with EPSF stripping (`144,000 B` per file vs. `3,977,280–4,095,360 B` raw; `docs/sprint-13-30/recortes-lugar.md`).
- **Direct browser S3 Range reads (`docs/sprint-13-30/lectura-navegador.md`):** Tested live in headless Firefox against `nasa-irsa-spherex` on both QR3 and DR1 files: reading a `64 × 64` `IMAGE` cutout takes 2 HTTP `206` requests and **551,040 B (538.1 KB)** in `< 0.8 s` (`119.4×` smaller than the `65,790,720 B` DR1 WISE 0855 full file and `7.28×` smaller than IRSA's `4,008,960 B` cutout). With WCS+SIP targeting and 64 individual `256 B` row ranges, transfers drop to **45,184 B (44.1 KB)** across 65 requests (`6.99 s`; `42,304 B` / `0.0643%` exact-header minimum), verified byte-for-byte against Python (`FNV-1a = 1bc318be`).

**Pre-sprint detector & proper-motion benchmarks (`unverified on branch carlos`):**
- **Transparent detection vs. ML (`data-sample/results.json` on `origin/cons`, unverified on `carlos`):** On a pre-sprint (`2026-11-05`) one-time test of 9 known fast-moving stars, the physical rule flagged **8/9** movers with **0** false alarms across 541 candidates, whereas the LightGBM ML model flagged **6/9** with **10** false alarms. Because `data-sample/results.json` is not in branch `carlos` and has not been re-run against the new `data-new/` pipeline, these figures remain **unverified on `carlos`**.
- **Measured proper motions (`data-sample/results.json` on `origin/cons`, unverified on `carlos`):** Barnard's Star `10.23 ± 0.43″/yr` (Gaia DR3 `10.39″/yr`, `0.4σ`), epsilon Indi B `4.54 ± 0.11″/yr` (Gaia DR3 `4.68″/yr`, `1.3σ`), and WISE 0855 `7.91 ± 1.35″/yr` (CatWISE2020 `8.09″/yr`, `0.1σ`). Re-verification against `data-new/` is pending on `carlos`.

**What does not work or remains limited:**
- **Saturation in bright targets:** R Draconis is saturated in 534/534 frames, requiring outer-annulus photometry rather than core centroiding (`docs/sprint-13-30/entrega-horacio.md`).
- **Aladin Lite WCS limitation:** Aladin Lite 3.8.2 misplaces raw SPHEREx MEF files that include `-SIP` distortion keywords unless headers are stripped to linear `TAN` (`docs/sprint-13-30/cobertura-y-acceso.md`).
- **Live query latency and browser-side calibration:** IRSA's cutout service returns intermittent HTTP 503 errors (requiring retries with backoff), and building a brand-new sky field on the fly takes roughly a minute (`59 s` cold cache on M101 in `origin/cons:data-sample/results.json`, `unverified on carlos`). While direct S3 `Range` reads work for raw `IMAGE` cutouts, IRSA's `/SIA` endpoint is still required for coordinate discovery (`/SIA2` returns 404), and browser-side `ZODI` subtraction, Rice-compressed `FLAGS` decoding, and `WCS-WAVE` reprojection are not yet wired into the web client.
- **Cloud cutout link pending:** Cutouts for all four fields are stored locally outside Git, pending cloud upload credentials (`docs/sprint-13-30/recortes-lugar.md`).
- **No discovery claims:** Sparks does not claim to have discovered Planet X; it surfaces **candidates to review**.
