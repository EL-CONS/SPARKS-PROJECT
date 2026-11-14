# Compliance matrix

Status: **done** = works and is tested · **partial** = works with a stated limit · **pending** = not built.

| # | Requirement / consideration | Component | How it is shown | Status |
|---|---|---|---|---|
| R1 | Public web tool | Static Vite build (`app/dist`) + Pages/Vercel config | Open the URL on a phone (QR button) | **partial** — deployable, not deployed (no accounts created) |
| R2 | User enters RA/Dec | `coords.ts` parser (sexagesimal, colon, decimal) + live API | Type the challenge's `08h55m10.831s -7d14m42.53s` → WISE 0855 (e2e test) | **done** (any position needs the API running) |
| R3 | Series of images "like a small video" | `stage.ts` 6-panel canvas flipbook: play, pause, speed 1–12 fps, step, date + λ per panel | "Every image" view on Barnard | **done** |
| R4 | Easy to see moving objects | Registered, λ-matched season differences (blue = before, amber = now), target reticle, measured vs catalog arrows | Barnard opens in Subtract B−A | **done** |
| R5 | Tested on the 5 targets | Precomputed fields + buttons + permanent links + screenshots | `docs/screenshots/v1-*`; e2e test loads all five | **done** |
| C1 | Easy to update with new releases | `discover_collections()` (ObsTAP) + `scripts/check_releases.py` + weekly GitHub Action | Collections are queried, not hard-coded (QR2 + QR3 today); `make check-releases` | **done** |
| C2 | 102 bands, creatively | 6 × 17 fingerprint coloured by λ, brightness by flux; per-panel λ chips; spectrum coloured by λ | WISE 0855 fingerprint dark → bright | **done** |
| C3 | Sum per detector to raise S/N | Inverse-variance stacks per detector × season; S/N table (one image vs all) | Pixel noise ×4–5 lower per season (card → "Signal-to-noise") | **done** |
| C4 | Spectra on the fly | Forced PSF photometry in every image at the propagated position | WISE 0855 / ε Indi B spectra with 1σ bars | **done** (precomputed for targets; live fields compute it for the typed position) |
| C5 | Add or subtract dates | Stack A+B, Subtract B−A, Minus median; season A/B selectors | Any target | **done** |
| C6 | Choose the field of view | FOV selector (crop) + live-mode MB/time estimate; API accepts 1.5–10′ | Change to 2.0′ on any target | **partial** — static fields are 6.6′ max; larger fields only in live mode |
| C7 | Overlay Gaia or WISE | Gaia DR3 + CatWISE2020 precomputed per field; drawn on SPHEREx panels with 10-year motion lines; Aladin Lite with AllWISE colour | "Catalog stars" checkbox; Sky context tab | **partial** — Aladin's HiPS background needs CDS (unreachable from our network on 5 Nov; catalogs still draw) |
| C8 | Coordinates in the URL, embeddable | Full state in the query string; Embed dialog with `<iframe>`; `embed=1` hides chrome | e2e test reproduces det/seasons/FOV from a URL | **done** |
| C9 | Metadata and contamination flags | Image details tab: obs_id, date, λ, release, version, background, zodi, flag percentages; per-image flag overlay (excluded, saturated, GHOST) | ε Indi B "Every image" + flags (GHOST ring of ε Indi A in D6) | **done** |
| C10 | Use Astropy and Aladin | Astropy (FITS, WCS incl. spectral `W` key, coordinates, time) + reproject + photutils; Aladin Lite 3.8.2 | README "Built with" | **done** |
| — | Measured motion with error bar vs catalog | `astrometry.py`, `field.py` | Card dial | **done** (Barnard, ε Indi B, WISE 0855) |
| — | ML with honest validation | `ml.py`, `scripts/train_ml.py`, `models/report/` | Protocol written before looking; validation and a once-only final test on 9 new fast stars (rule 8/9, 0 false alarms; ML 6/9, 10 false alarms); `models/report/final_test.md` | **done** — rule in the app, ML as second opinion |
| — | Gallery of extra fields | `scripts/gallery.py` (Teegarden, Van Maanen, Wolf 359, Kapteyn) | "More fast stars" row; all four within 1σ of Gaia | **done** (no asteroid field yet) |
| — | Live mode for any position | `api/main.py` | M101 built cold in 59 s (`results/live_timing.json`) | **done** (needs a host) |
| — | QR for phones | "Open on phone" dialog | — | **done** |
| — | Spanish / English | `i18n.ts` | `?lang=es` | **done** |
| — | Light curves of RW Aur and R Dra | PSF-wing photometry (both saturate) | Card "Brightness over time" | **done** for R Dra (clear trend in all detectors); **partial** for RW Aur (suggestive) |
