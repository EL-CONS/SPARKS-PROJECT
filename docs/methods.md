# Methods

All numbers here come from the pipeline runs of 5 November 2026 (pipeline 0.3.0). Code references are to `pipeline/sparks/`.

## 1. Finding the data (`discover.py`)
- **Releases:** `SELECT obs_collection, COUNT(*) FROM ivoa.obscore WHERE obs_collection LIKE 'spherex%'` on IRSA ObsTAP. Today: `spherex_qr2` (1,097,080 images), `spherex_qr3` (192,961), plus deep-field and calibration collections. Science collections matching `spherex_qrN` are used automatically; deep collections are skipped because their SIA hung for >20 min during research. `scripts/check_releases.py` regenerates the fields when a new collection appears or one grows by >2 %.
- **Coverage:** IRSA SIA2 per collection at the target (radius 0.0005°). Duplicated (obs_id, detector) pairs keep the newest processing version.
- **Seasons:** exposures sorted by time and split at gaps > 40 days. Every target gets 3–4 seasons (~6 months apart) of 74–211 images.

## 2. Reading only what we need (`remote_fits.py`)
A SPHEREx Level-2 file is ~65 MB: IMAGE, FLAGS (Rice-compressed, one tile per row), VARIANCE, ZODI, PSF/EPSF and the WCS-WAVE lookup table. IRSA's cutout service always returns the full PSF cube (measured 4.0 MB and 4.6 s for a 60-px cutout). Instead we:
1. read the headers with HTTP range requests and compute the byte offsets of each HDU;
2. fetch the needed rows of IMAGE, VARIANCE and ZODI with **multi-range requests** (IRSA's nginx returns the whole file when more than ~100 ranges are requested, so we send ≤ 90 per request);
3. fetch the compressed FLAGS rows and decode them with Astropy's Rice codec;
4. fetch the WCS-WAVE table so that Astropy's alternate WCS `W` gives λ and Δλ per pixel.

The result was checked pixel by pixel against IRSA's cutout service (identical IMAGE and FLAGS). Cost: ~0.4 s per image with 6 parallel requests; the 1,933 images of the five targets took 22 minutes in total. Cutouts are 80 × 80 px and cached as `.npz`.

## 3. Calibration, masking, reprojection, stacking (`frames.py`, `coadd.py`)
- **Background:** IMAGE − ZODI (the zodiacal-light model provided in the file), then a 3σ-clipped median per image.
- **Masks:** pixels with TRANSIENT, OVERFLOW, SUR_ERROR, NONFUNC, DICHROIC, MISSING_DATA, HOT, COLD, NONLINEAR, PERSIST or OUTLIER are excluded. SOURCE and GHOST are kept (GHOST is shown as an overlay).
- **Common grid:** every image is reprojected (bilinear, `reproject_interp`) onto a 64 × 64, 6.15″/px, north-up TAN grid centred on the requested position.
- **Stacks (consideration 3):** per detector and season, inverse-variance weighted mean. The pixel noise drops as expected: e.g. Barnard D1, first season, 24 images: σ 0.023 → 0.0048 MJy/sr (×4.8). Each stack carries the mean, minimum and maximum wavelength of its images.

## 4. Seeing motion: registration and differences (`field.py`)
- **Registration:** on every stack we fit Gaussian centroids to isolated reference stars (Gaia DR3 G 10.5–17 for D1–D3, CatWISE W2 8.5–14 for D4–D6, PM < 0.1″/yr, propagated to the season epoch). The median offset is the stack's registration error. Barnard's stacks: 0.01–0.05 px.
- **Differences (consideration 5):** for each detector and pair of seasons we re-stack only images whose wavelengths overlap in both seasons ("λ-matched"), shift each stack by its registration offset, subtract (later − earlier) and remove large-scale background with an 11-px median filter. A source that moved leaves a negative lobe where it was and a positive lobe where it is.

## 5. Measuring the motion (`astrometry.py`, `field.py`)
- **Which source:** the catalog source with the largest significant proper motion near the field (Gaia DR3 first, CatWISE2020 otherwise; CatWISE splits fast movers into several entries, so entries within 30″ are grouped and the best-measured one is kept).
- **Centroids:** a 2D Gaussian + constant is fitted to each detector × season stack around the predicted position; catalog stars 0.5–4 px away are fitted at the same time (fixed positions, free fluxes) so they do not pull the centroid. A point is used if S/N ≥ 5, it lies < 2 px from the prediction and its error is < 0.5 px. A catalog star within 0.5 px of the target blends with it: the point is dropped unless that star's brightness could be measured in another season (see WISE 0855 below).
- **Fit:** offsets (east, north) in arcsec vs time, with one zero point per detector and a common proper motion; the known parallax displacement is removed first (Gaia parallax, or 449 mas for WISE 0855 from the literature). Errors are scaled by √χ² when χ² > 1.
- **Results:** Barnard 10.23 ± 0.43″/yr at PA 354.8 ± 2.0° (Gaia 10.39″/yr, 355.6°; D5 + D6, 6 points). ε Indi B 4.54 ± 0.11″/yr at 120.5 ± 1.7° (Gaia 4.68″/yr, 121.8°; all six detectors). WISE 0855 7.91 ± 1.35″/yr at 275.5 ± 9.7° (CatWISE 8.09″/yr, 277.4°; D5 + D6, 5 points). In April–May 2026 the dwarf passes 0.2 px from a G = 16.3 / W2 = 15.2 star: where a neighbour comes within 1.2 px, its brightness is fixed to the value fitted in the season where the two were farthest apart (1.5 px) and only the dwarf's position is refitted.
- Barnard, ε Indi B and WISE 0855 agree with the catalogs within 0.4σ, 1.3σ and 0.1σ.

## 6. Spectra on the fly (`photometry.py`; consideration 4)
- In **every single image** (not the stacks), at the target position propagated to that image's time and corrected by the stack registration, we fit a pixel-integrated Gaussian PSF (FWHM from the `PSF_FWHM` header) plus neighbours and a constant — a linear least-squares fit. λ and Δλ come from the WCS-WAVE table at that pixel.
- A point is "clean" if < 20 % of the PSF falls on masked pixels, it is not saturated and no catalog star is within 0.8 px.
- **Cold index (physical, not ML):** F_ν(4.4–5.0 µm) / F_ν(1.1–1.6 µm) (inverse-variance means of clean points), its equivalent blackbody temperature (an index, brown dwarfs are not blackbodies), and the 3.3 µm methane depth 1 − F(3.15–3.45)/F(3.9–4.1).
  - WISE 0855: ratio > 10.9 (short band not detected), methane depth 1.03 ± 0.07.
  - ε Indi B: ratio 1.73, methane depth 0.81.
  - Reference blackbodies: 6000 K ≈ 0.17, 1000 K ≈ 49.5.
- **Light curves** (RW Aur, R Dra): each image divided by the median of images of the same detector within ±0.05 µm, so that colour changes do not masquerade as variability. Both stars saturate SPHEREx in most or all images; their brightness is measured in an annulus just outside the largest saturated core of each detector (the "PSF wings"), which keeps a fixed fraction of the light for a given detector and wavelength. Results (median relative brightness per season):
  - **R Draconis** (534/534 images saturated; annulus from 6–9 px): 528 usable points. Season medians 1.47 (May–Jul 2025), 1.00 (Oct 2025–Jan 2026), 0.79 (Apr–Jul 2026), and the same trend in all six detectors (D1 1.50 → 0.91, D6 1.65 → 0.77). Consistent with a Mira pulsating with a 246-day period sampled three times; the cadence is too sparse to fit the period.
  - **RW Aurigae** (302/331 saturated; annulus from 1.5–2.5 px): 330 points. D5–D6 are fainter in September 2026 (season medians 0.59–0.66 vs 1.0–1.4 before) while D1 is brighter (1.22). The scatter within seasons is large (16–84 % range 0.59–1.31), so we call this suggestive, not a detection. The binary companion and neighbours fall inside the annulus.

## 7. Candidates and the Spark Detector (`candidates.py`, `ml.py`)
- **Residuals:** local maxima above 5σ in |difference/σ|; positive and negative peaks 0.5–3.5 px apart are paired as dipoles; residuals in different detectors within 1.5 px are merged.
- **20 explainable features:** lobe S/N, balance, separation, **dipole amplitude relative to the source** (a real mover of ≳1 px leaves lobes as bright as the source; a misregistered static star leaves a few per cent), flagged/ghost/saturated fractions, stack S/N in each season, flux ratio, distance and magnitude of the nearest bright star, edge distance, sharpness, χ² of the stamp, wavelength matching, number of images, number of detectors (with a dipole).
- **Rule (used by the app):** mover if the before/after lobes sit on opposite sides of a saturated (masked) core and are as bright as the star's own wings there; artifact if flagged/ghost/saturated/edge/bright-star halo; mover if a paired residual ≥ 5σ, balanced, with dipole amplitude > 0.3 of the source in ≥ 2 detectors (or ≥ 10σ in one detector, ≥ 4 px from the edge); variable if a same-sign residual in ≥ 3 detectors; static if a residual on a bright star; otherwise artifact. Each candidate shows its reason.
- **Spark Detector (experimental, v2.1):** LightGBM (300 trees, 15 leaves, class-balanced) on 21 features. Movers and variables are synthetic sources injected into the **real registered season stacks** with an empirical Gaussian PSF measured on each stack (shifts 0.2–3 px, S/N 3–50, four spectral shapes); **30 % of the injected movers are saturated** (S/N 300–30,000, core set to NaN and flagged, lobes only in the wings). Static and artifact labels are weak labels from real residuals; residuals around a masked core get no weak label (their truth is unknown). Trained on the 9 development fields only.
- **Injection metrics on the 6 validation fields (never trained on):**
  - Held-out F1 (ML vs rule): mover 0.75 vs 0.60, variable 0.68 vs 0.58, static 0.74 vs 0.56, artifact 0.73 vs 0.55.
  - Unsaturated mover completeness vs injected S/N (ML / rule): 3–5: 14 % / 1 %; 5–8: 32 % / 9 %; 8–13: 49 % / 24 %; 13–20: 67 % / 45 %; 20–32: 74 % / 57 %; 32–50: 88 % / 65 %.
  - Saturated injected movers recovered: ML 49 %, rule 25 %.
  - Purity of "mover" labels by residual S/N: ML 65–85 %, rule 94–99 %.

## 7b. Known movers: protocol and final test
- **Contamination notice.** The first "independent test" (5 Nov) was **not independent**: the rule was changed (pairing lobes across a saturated core; the ≥ 10σ / ≥ 4 px single-detector condition) *after* we saw it fail on Kapteyn and Wolf 359, and it was re-measured on the same six stars. Every field processed that day is now the **development set**.
- **Protocol** (`models/report/test_protocol.md`, committed before any new star was processed): Gaia DR3 stars with pm > 2″/yr, > 0.5° from development fields, ≥ 2 SPHEREx seasons and an expected shift ≥ 0.5 px; 19 of 68 fields qualified; 14 taken (5 named by the team + 9 drawn, seed 20261106) and split by seed 1930 into 6 validation and 8 final-test fields. A known mover is the field's target or any Gaia star with pm > 100 mas/yr, G < 19 and shift ≥ 0.5 px; stars < 1 px apart count once. A **false alarm** is a candidate labelled "mover" with no known mover within 3 px and no Gaia pm > 100 mas/yr match.
- **Validation** (used for tuning): rule 8/8 with 3 false alarms; ML v2.1 7/8 with 63 false alarms (`validation.md`). A first ML version (v2.0) recovered far fewer; the fix was to stop labelling masked-core residuals as artifacts (`DECISIONS.md`).
- **Final test** (run once, rule and model frozen with sha256 in `frozen.json`; `final_test.md`): **rule 8/9 with 0 false alarms; ML 6/9 with 10 false alarms**; either 8/9. The rule missed Gaia DR3 6307374845312759552 (G 8.8, 0.59 px, labelled artifact); the ML called Gliese 1, Gaia DR3 778947814402602752 and that same star "variable".
- **Development-set check** (same six stars as before, frozen model; `development_check.md`): rule 5/6, ML 3/6. Not evidence of anything: these stars shaped the rule.
- **Decision** (rule written before the final test): the ML neither matches the rule nor has fewer false alarms, and combining adds no star, so **the app labels candidates with the rule**; the ML is shown as an experimental second opinion.

## 8. Live mode (`api/main.py`)
The same pipeline for any RA/Dec, limited to D2 and D6, ≤ 12 images per detector and season and a 4′ field. Results are cached on disk by position. A cold field took 59 s for 72 images (M101, `results/live_timing.json`; an earlier unrecorded run on M51 took about two minutes); a cached one < 1 s.

## 9. What we did not do
- The official ePSF (QR3 `EPSF` HDU) is not used; a Gaussian is enough for spectral shapes but not for absolute fluxes.
- No comparison yet against IRSA's Spectrophotometry Tool.
- Parallax is removed, not fitted (0.5″ with 6.15″ pixels and 3–4 epochs is not measurable).
- The final test has nine known movers: enough to catch a broken detector, not to quote a precise recovery rate. Hundreds of known stars (Gaia, pm > 0.5″/yr) and asteroids (IRSA MOST) would; see `docs/team/yuca-queue.md`.
