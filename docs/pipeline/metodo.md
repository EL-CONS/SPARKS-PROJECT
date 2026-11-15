# SPHEREx data pipeline for the four remaining targets

This document describes how we built, from scratch, the pipeline that
produces `data-new/wise0855`, `data-new/epsindib`, `data-new/rdra` and
`data-new/rwaur`, in the same format as `data-sample/barnard`. Nothing from the
previous project was reused. Every claim here can be checked against the files
in `pipeline/_work/` and the cited URLs.

A note on vocabulary: this document talks about **candidates** and
**detections**, never discoveries. The pipeline measures what is in the public
data; it does not claim new objects.

## 0. Sprint Part 0: already done

Part 0 of this sprint (white-dwarf rule with Gaia, ground truth with a source
per row and an `aislado` (isolated) column, exact `desarrollo`/`prueba`
(development/test) rule) was closed in the previous delivery and lives in
`docs/sprint-13-30/`: `verdad-terreno.csv`, `gaia-fotometria.csv`,
`reglas-veredicto.md` and the corrected `prototipo/veredicto.py`. It was not
redone in this sprint and this document does not duplicate it. The only
dependency the pipeline takes from there is
`docs/sprint-13-30/gaia-fotometria.csv`, used to fill `catalogs.json` for R Dra
and RW Aur by Gaia DR3 `source_id`.

## 0b. Sprint Part 2: Gaia data for the isolated objects

`docs/pipeline/gaia-objetos.csv` has one row per object with `aislado = si`
(isolated = yes) in `docs/sprint-13-30/verdad-terreno.csv` (24 objects). Columns
(names kept in Spanish because the code and CSVs use them):

| column | content |
|---|---|
| `id_campo`, `nombre` | internal field ID and name |
| `gaia_source_id` | Gaia DR3 `source_id` |
| `ra_deg_j2016`, `dec_deg_j2016` | Gaia DR3 position at epoch J2016.0 |
| `phot_g_mean_mag`, `bp_rp` | Gaia DR3 G magnitude and BP-RP color |
| `parallax_mas`, `dist_pc` | parallax and its inverse, `1000/parallax` |
| `pmra_mas_yr`, `pmdec_mas_yr` | Gaia DR3 proper motion, uncorrected |
| `mu_total_arcsec_yr`, `pa_deg` | total proper motion and position angle derived from the two components |
| `ruwe` | astrometric fit quality indicator |
| `mg_gaia` | absolute G magnitude using the Gaia parallax |
| `clase`, `fuente_clase`, `enlace_fuente` | class from `verdad-terreno.csv` and where it came from |
| `fuente_pm` | `Gaia DR3` |
| `nota` | per-object notes |

Two limits, stated in the CSV itself: `dist_pc` is the inverse parallax without
a Lutz-Kelker correction (at 2-5 pc the bias is small but real), and the class
was not re-queried in SIMBAD during this sprint because the service returned
404 from `simbad.cds.unistra.fr`; we copy the class from the previous delivery,
which was verified. `mg_gaia` uses the parallax. **Mira** (saturated in Gaia
DR3) has no parallax or proper motion: its cells are empty, the `nota` column
says so, and they are not filled from another catalog. The other 23 objects
have parallax, PM and `mg_gaia`.

## 1. What exists and what does not

Exists:

- Our own Python package, `pipeline/sparkspipe/`, with discovery, cutout
  download, quality masks, reprojection onto a common grid, coadds,
  differences, proper-motion measurement and manifest writing.
- Its own virtual environment in `pipeline/.venv` (Python 3.12) and
  `pipeline/requirements.txt`.
- Tests in `pipeline/tests/` (11 tests, `pytest`).
- Outputs in `data-new/<id>/` with the same structure as `data-sample/barnard`:
  `manifest.json`, `catalogs.json`, `png/`, `frames.bin`, `masks.bin`,
  `coadds.bin`, `coadds_sig.bin`, `diffs.bin`, `diffs_sig.bin`, `medians.bin`.
- A `data-new/index.json` with the four fields and the collections used.
- `docs/pipeline/gaia-objetos.csv` (sprint Part 2) with Gaia DR3 photometry
  and proper motion for the 24 isolated objects of the ground-truth catalog.

Does not exist:

- A machine-learning model. The manifest's `ml` block says so explicitly: the
  data are ready for Cons's detector.
- A candidate search over the field. The `candidates` block is empty and
  `candidates_note` explains why.
- Anything copied from `data-sample/` except the **shape** of the format,
  which was read so that the front end could consume `data-new/` unchanged.

## 2. Environment

```
python -m venv pipeline/.venv
pipeline\.venv\Scripts\python.exe -m pip install -r pipeline/requirements.txt
```

Exact versions in `pipeline/ambiente.md` (numpy 2.5.4, astropy 8.0.2,
reproject 0.21.0, pyvo 1.10.0, requests 2.34.2, scipy 1.18.1, pillow 13.0.0,
matplotlib 3.11.2, pytest 9.2.0).

Usage:

```
cd pipeline
.\.venv\Scripts\python.exe -m pytest tests -q
.\.venv\Scripts\python.exe -m sparkspipe discover wise0855
.\.venv\Scripts\python.exe -m sparkspipe run all --cap 6 --workers 3
.\.venv\Scripts\python.exe -m sparkspipe verify ..\data-new\wise0855
```

## 3. Targets, coordinates and epochs

Coordinates and expected proper motion come from `data-sample/index.json`.
That file is the challenge statement, not a primary source; that is why each
manifest row carries `catalog_source` and the `expected` block states where the
number comes from. When a Gaia DR3 `source_id` exists (R Dra, RW Aur) the value
is cross-checked against `docs/sprint-13-30/gaia-fotometria.csv`.

| id | name | RA (catalog) | Dec (catalog) | epoch | expected mu | expected PA |
|---|---|---|---|---|---|---|
| `wise0855` | WISE 0855-0714 | 133.795129 | -7.245147 | MJD 55320.4 (WISE epoch) | 8.087789 "/yr | 277.357342 deg |
| `epsindib` | epsilon Indi B | 331.043800 | -56.782800 | J2000 | 4.684165 "/yr | 121.778186 deg |
| `rdra` | R Draconis | 248.167500 | 66.755000 | J2016.0 (Gaia DR3) | 0.021539 "/yr | 286.587074 deg |
| `rwaur` | RW Aurigae | 76.956400 | 30.401400 | J2016.0 (Gaia DR3) | 0.027525 "/yr | 174.494704 deg |

### WISE 0855: the epoch matters

The index coordinates (`133.795129`, `-7.245147`) **are not J2000**: they are
the position at the 2010 WISE epoch. Luhman (2014, ApJL 786, L18, Table 1)
gives `alpha = 133.795224`, `delta = -7.245138` at **MJD 55320.4** with a 0.40"
error. They match the designation `WISE J085510.83-071442.5`, which was built
from the 2010 position. Treating those coordinates as J2000 (as the index does)
propagates the object 10.3 years too far: 209" instead of 126", and the grid
ends up offset by ~14 pixels (84"). The pipeline uses `coord_epoch_mjd = 55320.4`.

Proper motion verified against the primary source (Luhman 2014):
`pmRA*cos(dec) = -8.06 +- 0.09 "/yr`, `pmdec = +0.70 +- 0.07 "/yr` (mu = 8.09,
PA = 275.0). Luhman & Esplin (2014, arXiv:1409.5899) refine it to
`-8.10 +- 0.02`, `+0.70 +- 0.02`. The index gives 8.087789 and PA 277.357: the
PA difference (2.4 degrees) produces 5" in declination at the reference epoch,
less than one pixel. We keep the index value for the expected comparison and
declare the discrepancy; we do not change the challenge's number. Photometry:
W2 = 13.89 +- 0.05, [4.5] = 13.89 +- 0.02, W1 > 16.4, i.e. the object is
bright only in band D6 (~5 um).

### epsilon Indi B: position and nature verified

The index coordinates (`331.0438`, `-56.7828`) match the 2MASS position of
epsilon Indi B, `22 04 10.5 -56 46 58` (epoch 1999.86), in McCaughrean et al.
(2004, A&A 413, 1029, arXiv:astro-ph/0309256, Table 1). They are not the
coordinates of epsilon Indi A: A lies 402.3" = 6.70' away, outside the 6.56'
grid. The object is a T1+T6 pair (Ba+Bb) separated by 0.732", unresolvable by
SPHEREx (6.15"/px): we measure the photocenter of the pair. The primary-source
PM is `pmRA*cos(dec) = +3.976 +- 0.013`, `pmdec = -2.500 +- 0.014 "/yr`
(mu = 4.70, PA = 122.2), consistent with the index (4.684, PA 121.778).

### Why the position is propagated before cutting

The final grid is 64 x 64 pixels of 6.15"/px, i.e. 6.56' on a side. WISE 0855
moves 8.09"/yr; between its catalog epoch (MJD 55320.4) and the reference epoch
(MJD 61000) there are 15.55 years, about 126" = 20 pixels. If treated as J2000
it would be 25.9 years, 209" = 34 pixels: that is why the epoch correction in
the previous section is mandatory. The center is computed only once:

```
center = catalog_position + expected_PM * (REFERENCE_MJD - catalog_epoch)
REFERENCE_MJD = 61000.0
```

Important detail: **the grid is fixed**. It is not re-centered on the data and
the center is not adjusted to the measured position. Re-centering would inject
the very motion we want to measure. The cost is that the field coordinates in
the manifest are those of the reference epoch, not the catalog's; the manifest
stores both (`source.ra/dec` and `source.catalog_ra/catalog_dec`).

## 4. Discovery: what worked and what did not

### What works: IRSA SIA2

```
GET https://irsa.ipac.caltech.edu/SIA
    ?POS=CIRCLE <ra> <dec> 0.06000
    &RESPONSEFORMAT=votable
```

The response is saved as-is in `pipeline/_work/<id>/sia_r0.060.xml` and reused
in later runs. It is a large response (tens of MB) and takes 30 to 100 s. From
each row we keep only SPHEREx images with `dataproduct_type=image` and a
`.fits` URL that is not a cube; the detector is taken from the file name
(`...D6_spx...`).

Discovery results (2026-11-14):

| id | total rows | SPHEREx images | seasons | XML |
|---|---|---|---|---|
| `wise0855` | 34 585 | 289 | 3 | 66.1 MB |
| `epsindib` | 15 305 | 487 | 4 | 29.9 MB |
| `rdra` | 22 816 | 2598 | **2** | 46.2 MB |
| `rwaur` | 9481 | 348 | 3 | 18.6 MB |

The full trace is in `discovery.trace` in each manifest and in
`pipeline/_work/<id>/run.json`. If this document and the JSON disagree, the
JSON wins.

### How seasons are split

A season is a group of MJDs separated from the next by more than
`SEASON_GAP_DAYS`. We chose **35 days** based on the actual cadence of the
data, not on the expected proper motion:

| largest gap inside the field | value | cut that separates it |
|---|---|---|
| WISE 0855 | 26.6 d (then 128.8 and 178.2) | 35 d -> 3 seasons |
| epsilon Indi B | 17.5 d (then 110.8, 141.1, 157.0) | 35 d -> 4 seasons |
| R Draconis | 26.1 d (then 37.8) | 35 d -> 2 seasons |
| RW Aurigae | 17.5 d (then 153.5, 174.1) | 35 d -> 3 seasons |

The cut is stable between ~27 and ~110 days for the four fields. With 60 days
R Dra falls into a single season (its largest gap is 37.8 d) and proper motion
cannot be separated from variability; 45 days gives the same result. With 25
days WISE gets 4 seasons and R Dra 3, but some groups end up with very few
frames. 35 days is the value that leaves all four fields with at least two
seasons without splitting consecutive visits.

**R Draconis** ends up with two seasons (2025-04-24 to 2025-07-22 and
2025-08-29 to 2026-09-27), separated by 37.8 d. The second is much longer and
has 2317 images; `--cap 6` limits what is downloaded. This does not guarantee a
measurable proper motion: the expected PM (0.0215"/yr) is 300 times smaller
than a pixel. The result is reported as an upper limit if it is consistent
with zero.

Not all 2598 R Dra images are processed: `--cap` limits them to 6 per
(detector, season), which is what makes the download feasible.

### Service pitfalls

1. With `COLLECTION=spherex_dr1` or `MAXREC` the response comes back empty.
   Without those parameters it returns the images overlapping the position.
2. The cutout service often answers `503 Server busy, retry later.` with HTTP
   200 and a text body. You must retry and validate the content, not just the
   HTTP code. `download_cutout` does this: it checks that the body does not
   start with `server busy` and that it is larger than 1 KB.
3. Retries are exponential but capped (`http.MAX_BACKOFF_S = 10 s`). Without a
   cap, a run of 14 attempts at 1.6^n waits for hours; with the cap a failing
   URL is dropped in under three minutes and the failure is counted in the
   manifest instead of blocking the run.

### What did not work: TAP

We tried three routes against `https://irsa.ipac.caltech.edu/TAP`:

| route | result | time |
|---|---|---|
| spatial query on `obscore` | 0 rows | 601.9 s |
| spatial query on the planes table | 0 rows | 285.5 s |
| async job 28320260 | proxy 502, then `COMPLETED` with 0 rows | ~604 s |

The evidence is in `pipeline/_work/access-probe.json`. Honest conclusion:
discovery is done with SIA2; TAP is not used.

### Which releases exist

SIA2 returns `spherex_dr1` for all four fields and **also `spherex_qr3` for
three of them** (same version `l2b-v27`):

| field | DR1 frames used | QR3 frames used | QR3 season |
|---|---|---|---|
| `wise0855` | 93 | 0 | - |
| `epsindib` | 92 | 24 | S3, MJD 61305-61315 (QR3 only) |
| `rdra` | 49 | 13 | inside S1, MJD 60916-61310 (mixed) |
| `rwaur` | 68 | 33 | S2, MJD 61285-61300 (QR3 only) |

`spherex_qr2` does not appear in any of them. The releases used are recorded in
`releases`, in the `release` column of each frame, and in the `blocker` for the
missing one. The DOIs exist and are cited:

- DR1: `10.26131/IRSA678` (https://doi.org/10.26131/IRSA678)
- QR3: `10.26131/IRSA662` (https://doi.org/10.26131/IRSA662)
- QR2: `10.26131/IRSA652` (https://doi.org/10.26131/IRSA652)
- all-sky cube: `10.26131/IRSA679`

Each field's manifest carries one `blocker` per release missing from SIA2 at
that position. When QR3 exists it is used as-is; it is neither discarded nor
presented as DR1.

## 5. Cutouts

We request a 0.12-degree (7.2') cutout to cover the corners of the 6.56' grid:

```
<access_url>?center=<ra>,<dec>d&size=0.1200
```

The service returns a MEF with `PRIMARY`, `IMAGE`, `FLAGS`, `VARIANCE`,
`ZODI`, `EPSF` and `WCS-WAVE`. `EPSF` is 98 % of the size and is not used, so
it is removed before saving. The raw cutout is deleted after trimming; the
reduced cutout stays in `pipeline/_work/<id>/cutouts/`.

The `IMAGE` WCS is already centered on the cutout: the object's pixel lands
near the center (e.g. 17.2, 16.7 in a 35x35 cutout). The SIP coefficients
include the constant term that produces that shift, so **there is no need to
compose WCS**. This was checked with `world_to_pixel` on the real cutouts.

The wavelength comes from the `WCS-WAVE` binary extension at the object's
pixel, with bilinear interpolation. The control grid is in full-detector
coordinates and the offset to the cutout is in `CRPIX1W/CDELT1W/CRVAL1W` of the
**`IMAGE`** header, not the `WCS-WAVE` header (which lacks those keys). The
previous version read the wrong header and used `CRPIX=0`, so every band sat at
its blue edge (D1 1.118, D2 1.655, D3 2.423, D4 3.831, D5 4.430, D6 5.012 um).
With the correct header, each frame samples a different wavelength within its
band: D1 0.75-1.09, D2 1.10-1.63, D3 1.63-2.41, D4 2.48-3.74, D5 3.82-4.41,
D6 4.42-5.00 um. That is what lets us measure methane at 3.3 um inside D4 and
the continuum at 4.0 um inside D5. If the table were missing, `em_min/em_max`
from SIA2 is used, and the manifest records in `lam` the value that was used.

## 6. Flags and quality

Bit names are read from the `FLAGS` header of each MEF (`MSKNnnnn`). If they
were missing, the default table in `config.py` is used, which is the one from
the Barnard manifest.

Bad instrumental bits are masked: `TRANSIENT`, `OVERFLOW`, `SUR_ERROR`,
`NONFUNC`, `DICHROIC`, `MISSING_DATA`, `HOT`, `COLD`, `NONLINEAR`, `PERSIST`,
`OUTLIER`, `CROSSTALK`, `GHOST`, `GHOST_FPA`, `GHOST_EXT`, `STREAK`, `BLOOM`,
`SNOWBALL`, `HALO`, `PHANTOM`, `PHANMISS`.

`SOURCE`, `FULLSAMPLE` and `REFERENCE` are **not** masked. `SOURCE` marks
pixels of known sources, including the object itself; masking it would erase
the signal we want to measure. This is an explicit decision, not an oversight.

Consequence for very bright objects: in R Dra, `BLOOM`, `HALO` and `OVERFLOW`
cover a disk of ~9 px radius and, once masked, the core has no pixels left.
That is the cause of the null result for R Dra (section 12). The package
prefers to say "not measured" rather than fit a centroid with pixels that the
pipeline itself considers bad.

Our own mask is a `uint8` bit sum: `1` bad, `2` edge, `4` high zodi, `8`
clipped. Cutouts use `edge_pixels=0` because the cutout edge is not the
detector edge.

Background and noise per frame: median of the good pixels and
`sqrt(median of the variance)`; if the variance is unusable, a robust MAD. The
per-flag pixel count goes into the manifest (`flag_pixels`) and the total pixel
count into `pix_total`.

## 7. Common grid and reprojection

The grid is the same as Barnard's: 64 x 64, `RA---TAN`, `crpix=32.5`,
`cdelt=6.15/3600`, centered on the propagated position. Each cutout is
reprojected with `reproject.reproject_interp` (bilinear interpolation) along
with its variance and mask. The variance is reprojected separately and any
region without coverage is marked bad.

No relative registration to reference stars is done: the DR1 WCS is already
registered. The manifest's `registration` block measures the scatter of the
centroids against the proper-motion model and labels it as such; it does not
claim to be an astrometric registration.

## 8. Coadds and differences

- **Coadd per (detector, season)**: 3-sigma clipped mean weighted by
  `1/variance`, with up to 5 iterations. With fewer than 3 frames no clipping
  is done (it makes no statistical sense) and a plain weighted mean is used.
  The coadd error is propagated from the variance, not from the observed
  scatter, so it is not underestimated with few frames.
- **Differences**: every pair of seasons for the same detector,
  `image_b - image_a`, with `sigma = sqrt(sigma_a^2 + sigma_b^2)`.
  `lambda_matched` is true when the `[lam_min, lam_max]` intervals of the two
  seasons overlap; `lam_lo/lam_hi` is that overlap. With two or four seasons
  there are one or six pairs per detector.
- **Medians**: `medians.bin` is the per-detector median over all frames, with
  shape `6 x 64 x 64`; missing detectors are `NaN`.

## 9. Proper motion

The method is simple and **is not fitted to the expected value**:

0. **WISE 0855: D5 and D6 only.** In D1-D4 a background star ~7 arcsec
   (1.2 px) away dominates. Its position is measured with a Gaussian fit in the
   D1 coadds, where WISE 0855 does not appear. In D5 and D6 a 0.7 px disk (the
   two pixels closest to the star's peak) is masked and the centroid is
   measured with the rest. At 1.2 px the two sources cannot be decomposed: a
   two-Gaussian fit is degenerate (the individual amplitudes have errors of the
   order of the value). The mask removes the star's core and also part of the
   target; the result is stated with that limitation and is not presented as a
   clean separation. For WISE 0855 **all** D5 and D6 frames are downloaded (95
   from SIA2, not 8 per detector), and the other detectors are used only for
   supporting photometry with a per-season cap.
1. In each coadd the centroid is measured in a 3 px radius aperture over a sky
   annulus of 6 to 10 px. The annulus is 3-sigma clipped to remove passing
   stars. The centroid error comes from the per-pixel variance, with a floor of
   0.05 px.
2. A detection is discarded if SNR is below 3, if the centroid lands more than
   10 px from the predicted position, or if the flux is not positive. Each
   detection carries its note in the manifest.
3. A weighted least-squares line is fitted to each coordinate against time. A
   **per-detector intercept** is used only if, after sigma clipping, every
   detector keeps at least two points; that way a systematic offset between
   detectors does not turn into a slope. If any detector is left with a single
   point, a common intercept is used. In this run all four combined fits used
   a common intercept (`per_detector_intercept = false`), because sigma
   clipping left some detector with one point (e.g. epsilon Indi B: 21
   detections, 16 kept). Per-detector fits, each with its own intercept, are
   reported separately for comparison.
4. The combined fit is reported and, if there are at least 3 points, the
   per-detector fit. With fewer than 3 detections, fewer than 2 seasons or a
   baseline shorter than 0.25 years, the result is **null** and the manifest
   writes the reason. It is never filled with the expected value.
5. If the measured motion is consistent with zero at 3 sigma, it is written as
   an upper limit, not a detection. This happened in WISE 0855 (0.49 +- 0.58)
   and in RW Aur (1.32 +- 0.57, 2.3 sigma: just below the cut). In RW Aur the
   limit is also dominated by variability and by the 6.15 "/px scale, which
   cannot measure 0.03 "/yr; the manifest's `caveats` says so. R Dra is null
   due to saturation.

The catalog comparison computes `sigma_mu = |mu_measured - mu_expected| / mu_err`
using **only the measured error**. The catalog error (which does not exist in
the index) is not used, and the result is never adjusted to match. The literal
verdict (`acuerdo dentro de 1/2/3 sigma` = agreement within 1/2/3 sigma, or
`desacuerdo mayor que 3 sigma` = disagreement greater than 3 sigma) goes into
the JSON.

### 9b. Coldness index

Computed in `photometry.py` with Gaussian PSF photometry weighted by
`1/sigma^2` on each individual frame (width `psf_sigma` fixed from the
coadds), using the bands in `docs/methods.md`:

- **Neighbor-star subtraction in WISE 0855 (D1-D4)**: in the short bands (D1
  to D4), where WISE 0855 does not appear and the background star at ~1.2 px
  `(32.72, 31.22)` dominates, we fit in each frame by weighted least squares
  (`1/sigma^2`, radius 3.5 px) the amplitude of a Gaussian with position and
  `sigma = 0.61 px` fixed from the D1 coadds plus a constant background, and
  subtract it before measuring at the target's propagated position. The
  `0.7 px` core mask is also kept.
- **Ratio** `F_D6/F_D2`: `1/error^2`-weighted mean of the PSF fluxes of D6
  frames with `4.42 <= lambda <= 5.01` um and D2 frames with
  `1.10 <= lambda <= 1.63` um. If the short-band flux does not reach 3 sigma,
  the ratio uses `max(flux, 0) + 3*error` in the denominator
  (`short_upper_limit_3sigma_mjy`) and is flagged `ratio_kind = lower_limit`.
- **Methane** `1 - F(3.15-3.45)/F(3.90-4.10)`: the numerator comes from D4
  frames and the denominator from D5 frames, selected by wavelength. The error
  is propagated from the errors of the means.

## 10. Output format

`data-new/<id>/` mirrors `data-sample/barnard`:

| file | shape | type |
|---|---|---|
| `frames.bin` | n x 64 x 64 | int16 little-endian |
| `masks.bin` | n x 64 x 64 | uint8 |
| `coadds.bin` | c x 64 x 64 | float32 little-endian |
| `coadds_sig.bin` | c x 64 x 64 | float32 little-endian |
| `diffs.bin` | d x 64 x 64 | float32 little-endian |
| `diffs_sig.bin` | d x 64 x 64 | float32 little-endian |
| `medians.bin` | 6 x 64 x 64 | float32 little-endian |
| `manifest.json` | - | JSON with `schema`, `field`, `seasons`, `detectors`, `coadds`, `diffs`, `frames`, `scales`, `flag_bits`, `target`, `caveats`, `files`, `blockers` |
| `catalogs.json` | - | Gaia DR3 by `source_id`, with `epoch_mjd` |
| `png/` | 256x256 coadds, 128x128 frames | grayscale PNG |

`caveats` is a list of warnings that arise from analyzing that field's data
(for example, a photocenter blended with another source). It is empty when
there is nothing to warn about; it is not a challenge field and is never filled
with generic text.

The PNGs use the manifest's `scales[det].lo/hi` limits and `gamma=0.5`, same as
Barnard. The `.bin` files are written and read with the same module
(`binfmt.py`), and `sparkspipe verify` checks shapes and types against the
manifest.

### `frames.bin` encoding

Barnard does not document the encoding of its `frames.bin` and we could not
reproduce it: the median of its values is 9262, it is clipped at +-32000 and it
correlates only 0.28 with the coadds. Instead of imitating a format we do not
understand, we use an explicit one, written into the manifest itself:

```
int16_value = round((image - bkg) / sigma * 1000)     clipped to +-32767
image       = bkg + value / 1000 * sigma              (MJy/sr)
```

`bkg` and `sigma` come from the matching row of `manifest.json`. This keeps
Barnard's size and type, allows reconstructing the physical image, and does
not pretend to a bit-for-bit compatibility that does not exist.

## 11. Verification

```
pytest: 11 tests
  test_binfmt.py     shape/type round trip, rejection of corrupt files
  test_motion.py     recovers a known motion, short baseline -> null,
                     missing source -> null, sigma verdict
  test_manifest.py   frame encoding, value clipping, PNG scaling,
                     grid WCS, display limits
```

Also, on real data:

- Centering probe with the already-downloaded cutouts, reprojected onto the
  corrected grid (MJD 55320.4): the peak lands ~1.3 px from the expected
  center, which is what we wanted to check. That peak turned out to be the
  background star described below, not the object; the probe validates the
  centering, not a detection.
- The previous run, with the wrong epoch (J2000), detected two sources near
  the grid center that were not the object: they were ~14 px from its real
  position. They are discarded and documented here so they are not mistaken
  for a detection.
- **WISE 0855: background star masked, motion measured in D5 and D6.** The
  final run (`--cap 6`, all D5 and D6 frames) processes 153 frames and 18
  coadds. The background star is located in the D1 coadds, where the object is
  not visible: (32.72, 31.22), sigma 0.61 px. In D5 and D6 a 0.7 px disk (the
  two pixels closest to the peak) is masked and the centroid is measured with
  the rest: 5 usable points remain (D5 S0/S1/S2 and D6 S1/S2; D6 S0 without
  detection). The fit gives `mu = 6.044 +- 0.755 "/yr`, PA 289.1 +- 3.8. The
  mask removes the star's core and also part of the target; the result is
  stated with that limitation and is not presented as a clean separation. A
  two-Gaussian fit at 1.2 px is degenerate (we tried: amplitude errors are of
  the order of the value) and is not used.
- `sparkspipe verify` on the four `data-new/` folders checks that the on-disk
  sizes match the manifest shapes: `all_ok = true` for `wise0855` (153 frames,
  18 coadds), `epsindib` (116, 22), `rdra` (62, 12) and `rwaur` (101, 18), with
  no problems.

## 12. Final run results

Run of 14 November 2026 with `--cap 6 --workers 4`, at most 6 frames per
(detector, season). Numbers come from `manifest.json`; the table can be
regenerated with `pipeline/_work/results_table.py` (ignored by git).

| target | frames | coadds | diffs | obs. seasons | usable det. | baseline (yr) | measured mu ("/yr) | measured PA (deg) | expected mu ("/yr) | expected PA (deg) | sigma_mu | verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `wise0855` | 153 | 18 | 18 | 3 | 5 | 1.00 | 6.044 +- 0.755 | 289.1 +- 3.8 | 8.088 | 277.4 | 2.71 | agreement within 3 sigma (D5/D6, star masked) |
| `epsindib` | 116 | 22 | 30 | 4 | 16 | 1.39 | 4.205 +- 0.281 | 124.9 +- 2.8 | 4.684 | 121.8 | 1.70 | agreement within 2 sigma |
| `rdra` | 62 | 12 | 6 | 2 | 0 | - | null | - | 0.022 | 286.6 | - | not measured: core saturated and masked |
| `rwaur` | 101 | 18 | 18 | 3 | 10 | 1.03 | 1.323 +- 0.572 | 81.5 +- 15.7 | 0.028 | 174.5 | 2.27 | agreement within 3 sigma (upper limit, not a detection) |

`status` in `manifest.json` is `ok` only when there is a measured motion and
`mu >= 3*mu_err`. With that rule `wise0855` and `epsindib` are `ok`, and `rdra`
(no detection) and `rwaur` (2.3 sigma, consistent with zero) are `parcial`
(partial). The reason goes into `blockers` and `data-new/index.json`; it is not
hidden.

### Coldness index

Definition in section 9b. Results from the final run:

| target | F(D6) mJy | F(D2) mJy | D2 3-sigma limit (mJy) | ratio | kind | methane | error | frames |
|---|---|---|---|---|---|---|---|---|
| `wise0855` | 0.284 +- 0.019 (44) | -0.006 +- 0.009 (18) | 0.028 | 10.09 | `lower_limit` | 1.20 | 0.10 | 152 |
| `epsindib` | 17.130 +- 0.069 (19) | 13.099 +- 0.029 (22) | - | 1.31 | `measured` | 0.80 | 0.002 | 112 |

In `wise0855`, after subtracting the Gaussian PSF of the neighbor star in
D1-D4 (position `(32.72, 31.22)` and `sigma = 0.61 px` fixed from the D1
coadds), the short band (1.1-1.6 um) is `-0.006 +- 0.009 mJy` (not detected at
3 sigma; 3-sigma upper limit `0.028 mJy`, stacked S/N `-0.67` in D2 versus
`19.02` in D5 and `15.60` in D6). With `F(D6) = 0.284 +- 0.019 mJy` the ratio
is `F_D6/F_D2 >= 10.09` (`lower_limit`) and the methane depth `1.20 +- 0.10`,
consistent with the previous processing (`ratio > 10.88`,
`methane_depth = 1.03 +- 0.07`) and above the thresholds `CH4_MIN = 0.5` and
`RATIO_MIN = 10.0` in `prototipo/veredicto.py`.
In `epsindib` PSF photometry gives methane `0.797 +- 0.002` (rounded to
`0.80`, consistent with the `0.81` of the previous processing) and a ratio of
`1.31` (`measured`).

### Mixed releases

Three fields use QR3 in addition to DR1 (table in section 4). In epsilon Indi B
and RW Aur QR3 fills an entire season; in R Dra, 13 of the 33 S1 frames are QR3
and share a coadd with 20 DR1 frames. The proper-motion fit has no per-release
intercept, only per-detector: a systematic offset between releases would leak
into the slope. In epsilon Indi B we measured that sensitivity (DR1 only versus
DR1+QR3, 15 degrees of PA difference). For R Dra and RW Aur there is no
measurement to salvage, but the mix is declared anyway because it affects any
later use of their coadds.

### epsilon Indi B: the only clean proper-motion measurement

This is the solid result of the run. Components:
`pmRA*cos(dec) = +3.448 +- 0.183`, `pmdec = -2.407 +- 0.213` "/yr, with 16
points across the six detectors (out of 21 usable detections; sigma clipping
drops 5) and a 1.39-year baseline. The combined fit uses a **common intercept**
(`per_detector_intercept = false`): sigma clipping left some detector with a
single point. The five per-detector fits, each with its own intercept, give
between 4.05 and 4.46 "/yr, consistent with each other within the errors.
Against the index: `mu = 4.205 +- 0.281` versus 4.684, difference -0.479 =
**1.70 sigma**; PA 124.9 +- 2.8 versus 121.78, difference 3.1 deg = 1.1 sigma.
Four seasons: three from DR1 and one from QR3 (MJD 61305-61315), declared in
`releases`.

Against the primary source (McCaughrean et al. 2004: 4.70 "/yr, PA 122.2) the
difference is 0.49 "/yr, also within 2 sigma of the measured error. The T1+T6
pair is not resolved: what we measure is the photocenter of the pair, not one
component.

Sensitivity to mixing releases: using **DR1 only** (10 points, 0.97 years)
gives `4.422 +- 0.430 "/yr`, PA `109.7 +- 4.3`; adding QR3 (16 points, 1.39
years) gives the table value, `4.205 +- 0.281`, PA `124.9 +- 2.8`. The two PAs
differ by 15 degrees, ~3 sigma combining errors. The difference is declared:
the joint fit is the one reported because it uses the full baseline, but it is
not presented as if the releases were interchangeable. A QR3-only fit makes no
sense (4 points over a 0.01-year baseline).

### WISE 0855: motion measured in D5/D6 with the star masked

The final run downloads **all** D5 and D6 frames (95 from SIA2) and measures
the motion only in those two bands. The background star is located in the D1
coadds, where WISE 0855 is not visible: `(x, y) = (32.72, 31.22)` with sigma
0.61 px (3 coadds). In D5 and D6 a 0.7 px disk (2 pixels) around that position
is masked and the centroid is measured with the rest.

The fit gives `mu = 6.044 +- 0.755` "/yr, PA `289.1 +- 3.8`, with 5 usable
points (D5 S0/S1/S2 and D6 S1/S2; D6 S0 has no detection) and a 1.00-year
baseline. Against the index (8.088 "/yr, PA 277.4): difference -2.04 "/yr =
**2.71 sigma**, agreement within 3 sigma. The expected value is not used
anywhere in the fit; the comparison comes afterwards.

The mask removes the star's core and also part of the target, and the star's
wings remain in the aperture. That is why the result is stated with that
limitation: it is not a clean separation of two sources. A two-Gaussian fit at
1.2 px is degenerate (we tried: amplitude errors are of the order of the value,
`amplitude_err` ~1.1 MJy/sr for amplitudes of 0.1), so it is not used. The
0.7 px mask is fixed a priori and not tuned to the result; with 1.0 px the
centroids change by less than 0.3 px and the sign of the motion does not change.

### R Dra: null due to saturation

R Dra saturates in all six bands. The BLOOM, HALO and OVERFLOW flags cover a
disk of ~9 px radius and the mask leaves the core with no pixels: all 12
coadds return `sin pixeles de apertura` (no aperture pixels), there are no
usable detections and the manifest writes the reason. It is not filled with the
Gaia value. Its expected PM (0.0215 "/yr) is 0.003 px/yr at 6.15 "/px: it is
not measurable with SPHEREx even without saturation.

### RW Aur: upper limit

The fit gives `mu = 1.323 +- 0.572` "/yr with 3 seasons and a 1.03-year
baseline. It uses only **10 of the 18** points: sigma clipping drops 8 because
of variability. The literal verdict is "agreement within 3 sigma" because
1.323/0.572 = 2.3 and the expected value (0.028) fits inside that huge error;
**it is not a detection**. The measured value is ~48 times Gaia's and the
per-detector fits range from 0.69 to 8.86 "/yr, a sign that variability and
band-to-band misalignment dominate. It is reported as an upper limit.

## 13. Large files

No file in `data-new/` exceeds 25 MB: the four folders total 10.9 MB and the
largest file is `wise0855/frames.bin` at 1.2 MB (153 frames of 64x64 int16;
WISE 0855 is the only field with detectors 5 and 6 complete). What is heavy and
**does not go into git** is in:

- `pipeline/_work/<id>/sia_r0.060.xml`: SIA2 response, 30-66 MB per field.
- `pipeline/_work/<id>/cutouts/*.fits`: MEF cutouts without EPSF, ~1-4 MB each.
- `pipeline/_work/<id>/frames/*.npz`: cutouts already processed onto the grid.
- `pipeline/_work/<id>/run.json`: full trace, failures and timings.
- `pipeline/.venv/`: virtual environment.

`.gitignore` covers `pipeline/.venv/`, `pipeline/_work/`, `pipeline/.pytest_cache/`,
`__pycache__/` and `data-new/**/raw/`.

## 14. Limitations and unverified items

- **QR2 is not available through SIA2 for any of the four fields.** We use DR1
  and, for epsilon Indi B, R Dra and RW Aur, also QR3 (24, 13 and 33 frames).
  The manifest declares the releases used and a blocker for each missing one.
  If the judges expect QR2, this is the difference.
- **Two of the four fields give a measurable proper motion.** epsilon Indi B
  (`1.70 sigma` against the index, 16 points, six detectors) and WISE 0855
  (`2.71 sigma`, 5 points, D5/D6 only and with the background star masked).
  In WISE 0855 the mask removes part of the target: the value is a measurement
  with that limitation, not a clean separation. R Dra saturates and its core is
  masked; RW Aur gives an upper limit of 1.32 +- 0.57 "/yr dominated by
  variability and its `status` is `parcial` (partial). Saying so is part of the
  result; the manifests carry the reason in writing.
- **Download failures**: in the final run 7/160 cutouts failed for WISE 0855,
  14/130 for epsilon Indi B, 10/72 for R Dra and 7/108 for RW Aur. They are not
  hidden: the manifest counts them and `_work/<id>/run.json` stores each
  attempt with its HTTP code.
- **The expected proper motion of WISE 0855 and epsilon Indi B is verified
  against the primary source.** WISE 0855: Luhman (2014, arXiv:1404.6501) gives
  `pmRA*cos(dec)=-8.06+-0.09`, `pmdec=+0.70+-0.07` "/yr; Luhman & Esplin (2014,
  arXiv:1409.5899) refine it to `-8.10+-0.02`, `+0.70+-0.02`. epsilon Indi B:
  McCaughrean et al. (2004, arXiv:astro-ph/0309256) give `+3.976+-0.013`,
  `-2.500+-0.014` "/yr. The challenge index uses slightly different numbers
  (PA 277.357 versus 275.0 for WISE 0855; 4.684 versus 4.70 for epsilon Indi
  B). The comparison is made against the index and the discrepancy is
  declared; the challenge value is not replaced by the literature value.
- **epsilon Indi B is not resolved**: the T1+T6 pair (0.732" separation) fits
  inside one 6.15" pixel. What we measure is the photocenter of the pair, not
  one component. epsilon Indi A is 402.3" = 6.70' away, outside the grid.
- **R Dra and RW Aur are variables**. With two or three seasons, variability
  can shift the centroid and contaminate the slope. In RW Aur the per-detector
  fits range from 0.69 to 8.86 "/yr: that is variability and band-to-band
  misalignment, not motion. That is why the result is reported as an upper
  limit and its `caveats` says so.
- **Parallax not removed**. The baseline is under a year and the effect is
  smaller than the centroid error, but it is not modeled. The
  `parallax_removed_mas` field is 0.0 in the manifest so nobody is misled.
- **No relative registration to reference stars**: we rely on the DR1 WCS.
  The `registration` block measures the residuals and declares them.
- **Gaia DR1 is not Gaia DR3** as far as SPHEREx is concerned: `catalogs.json`
  cites Gaia DR3 by `source_id` and `epoch_mjd=57388.5`, not the SPHEREx epoch.
- **The front end does not read `data-new/` yet**: `app/src/data/loader.ts`
  has the `data-sample/` path hard-coded. For the demo the base path must be
  changed or the folders moved. That is Joaquin/Cons's decision, not this
  pipeline's.
- **The proper-motion comparison uses only the measured error**. It is not a
  formal statistical test; it is a measure of how far the measured value is
  from the expected one in units of the error. The JSON says so.
- External proper-motion catalogs (CatWISE, etc.) were not queried:
  `target.n_refs.catwise` is 0.

## 15. Reproduce

```
cd pipeline
# 1. discovery (once per field; cached)
.\.venv\Scripts\python.exe -m sparkspipe discover all
# 2. full pipeline (all four fields, one at a time)
.\.venv\Scripts\python.exe -m sparkspipe run all --cap 6 --workers 4
# 3. shape and type check
.\.venv\Scripts\python.exe -m sparkspipe verify ..\data-new\wise0855
```

`--cap` limits frames per (detector, season), chosen spread out in time.
`--limit` exists only for short tests and breaks the proper-motion fit if it
leaves a single season. `--reuse-only` rebuilds the manifest, PNGs and `.bin`
files using only the cutouts already processed in `_work/<id>/frames/`: it is
useful to change manifest text without downloading again; frames not in the
cache are counted as failures and recorded in the corresponding `blocker`.
