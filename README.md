# Sparks

*"Every spark that moves has a fingerprint."*

Web tool by Team **Cosmonautas** (Hermosillo, Sonora, Mexico) for the **Planet X and SPHEREx** challenge at the NASA Space Apps Challenge 2026.

Enter a sky position and Sparks blinks the images NASA's SPHEREx telescope captured of that field on different dates. Anything that jumps has moved. Blue shows where it was; amber shows where it is now.

Sparks surfaces **candidates to review**, never discovery claims. It is an independent project, not affiliated with or endorsed by NASA.

## Challenge targets included

- **Barnard's Star** (`269.4485 / +4.7394`, J2016)
- **ε Indi B** (`331.0441 / −56.7828`, J2000; distinct from ε Indi A at `330.8404 / −56.7869`)
- **WISE 0855** (`133.7951 / −7.2451`)
- **RW Aurigae** (`76.9561 / +30.4012`)
- **R Draconis** (`248.1674 / +66.7550`, J2016)

## What it does

- Accepts coordinates in degrees (`269.4486 4.7672`), in hours and degrees (`08h55m10.831s -7d14m42.53s`, `17:57:48.5 +04:41:36`), or by selecting a challenge target name.
- Displays the field across all six SPHEREx detectors in three viewing modes: **blink** (alternating seasons at 1, 2, or 3 changes per second), **sum** (average across seasons, with lower noise), and **difference** (one season minus another, in units of noise sigma).
- **Selectable field of view**: full cutout, half, or quarter.
- **On-the-fly spectrum**: click any point and Sparks measures it across every individual exposure.
- **Gaia DR3** and **CatWISE2020** catalog overlays on top of the image.
- NASA quality flags, per-detector noise levels, and source attribution for every measurement.
- Full state encoded in the URL for sharing or embedding: `?ra=269.4486&dec=4.7672&fov=3.28&mode=diff&det=all&lang=en#explorar`.
- English and Spanish support. Single dark theme (team decision by Joaquin, November 14).

Challenge requirements checklist and evidence: [`docs/auditoria/requisitos.md`](docs/auditoria/requisitos.md).

## How to run it

Tested with Node 26; Vite 5 requires Node 18 or newer.

```bash
cd app
npm ci
npm run dev        # opens http://localhost:5173
```

Other commands inside `app/`:

| Command | Purpose |
|---|---|
| `npm test` | Logic unit tests (coordinates, URL state, player, field of view, spectrum) |
| `npm run typecheck` | TypeScript type checking |
| `npm run check-data` | Validates `data-sample/` and `data-new/` against the schema |
| `npm run build` | Builds the static site into `app/dist/`, including data files |
| `npm run preview` | Serves `app/dist/` at http://localhost:4173 for pre-deployment testing |

## How to deploy

`npm run build` outputs a complete static site in `app/dist/` (around 21 MB with data). It works on any free static hosting provider.

- **At a domain root** (Netlify, Cloudflare Pages, Vercel): run `npm run build` and deploy `app/dist/`.
- **In a subfolder**, such as GitHub Pages at `https://<user>.github.io/SPARKS-PROJECT/`: set the base path to the repository name.

```bash
VITE_BASE=/SPARKS-PROJECT/ npm run build
```

For GitHub Pages, the repository must be public (or on a paid plan).

## Repository structure

| Folder | Description |
|---|---|
| `app/` | Web application (Vite, React, TypeScript). `src/core/` holds pure logic with unit tests; `src/data/` loads datasets; `src/ui/` contains the UI; `src/i18n/` provides English and Spanish copy; `src/styles/` holds stylesheets |
| `data-sample/` | Pre-processed Barnard's Star field plus the target index. Format documented in [`data-sample/README.md`](data-sample/README.md) |
| `data-new/` | WISE 0855, ε Indi B, RW Aurigae, and R Draconis fields, processed during the hackathon with `pipeline/` |
| `ml-clasificador/` | Object-type classifier (`estrella`, `enana marron`, `enana blanca`, `variable`): v2 Random Forest on 69 verified-class objects (`78.3%`, `54/69` leave-one-out in `resultados_v2.json`; v1 kept for historical reference) |
| `docs/reto/` | Challenge prompt, official resources, and event rules |
| `docs/sprint-13-30/` | Zero-dependency verification scripts (`cobertura.py`, `recortes.py`) and live browser S3 `Range` test (`s3-range-test.html`) with reports |
| `docs/auditoria/` | Requirements audit, branch map, asset provenance, and screenshots |
| `docs/entrega/` | Space Apps submission copy: SI/AI usage disclosure and submission checklist |
| `Logo/`, `branding/` | Sparks visual identity |
| `design-proto/` | Discarded design prototypes and the selected design |

The pipeline that downloads and processes images (`pipeline/`) and its methodology (`docs/pipeline/`) live on the `Horacio` branch. Branch ownership map: [`docs/auditoria/mapa-de-ramas.md`](docs/auditoria/mapa-de-ramas.md).

## Data sources

- **Images**: NASA's SPHEREx mission via the NASA/IPAC IRSA SIA service (`https://irsa.ipac.caltech.edu/SIA`, collections `spherex_dr1` and `spherex_qr3`; `spherex_qr2` returns `0` rows in SIA across the 36 objects checked in [`docs/sprint-13-30/cobertura.csv`](docs/sprint-13-30/cobertura.csv)). `data-new/` manifests document DR1 (`10.26131/IRSA678`, 338 frames) and QR3 (74 frames); the public S3 archive `nasa-irsa-spherex` (`us-east-1`) also supports partial `HTTP 206` reads directly from the browser with CORS ([`docs/sprint-13-30/lectura-navegador.md`](docs/sprint-13-30/lectura-navegador.md)).
- **Reference positions and proper motions**: Gaia DR3 (`gea.esac.esa.int/tap-server/tap/sync`, ESA/Gaia/DPAC), CatWISE2020 (mid-infrared for cold sources invisible in Gaia such as `WISE 0855`), and SIMBAD (Harvard mirror).
- **Processing**: 64 × 64 pixel cutouts (6.56′ wide, 6.15″ per pixel), aligned and coadded per detector and season. The app never alters the raw sky images: it displays them with nearest-neighbor scaling and renders overlays on a separate layer.

## Adding a new field or data release

1. Process the field with `pipeline/` (`Horacio` branch; instructions in `docs/pipeline/`). This outputs a folder containing `manifest.json`, `catalogs.json`, `.bin` cubes, and `png/`.
2. Copy the folder to `data-new/<id>/` and register the field in `data-new/index.json`.
3. Run `npm run check-data` inside `app/`.
4. Run `npm run build` and deploy.

The web app (`app/src/data/loader.ts`) reads both `data-sample/index.json` and `data-new/index.json`, and `npm run build` bundles both folders into `app/dist/`.

### Standalone verification scripts (`docs/sprint-13-30/`)

Require only standard-library Python 3 (no external dependencies):

- `python3 docs/sprint-13-30/cobertura.py` — Queries SIA across 36 objects (`spherex_dr1`, `spherex_qr3`, `spherex_qr2`).
- `python3 docs/sprint-13-30/recortes.py --out <path_outside_git>` — Downloads `size=0.11` cutouts without the `EPSF` cube, using 6 threads and retries.

## What we do NOT do (scope and honest limits)

- **We do not claim discoveries:** Sparks surfaces **candidates to review** with error bars and source traceability, never definitive findings.
- **We do not override the physical rule when a model underperforms:** in the prior run `data-sample/results.json` (provenance under review in [`docs/auditoria/procedencia.md`](docs/auditoria/procedencia.md)), the physical rule outperformed LightGBM on the frozen test (`8/9` with `0` false alarms vs. `6/9` with `10` false alarms); the primary verdict uses physical rules and the v2 random forest serves as an auxiliary class hint.
- **We do not measure cores on saturated sources:** `R Draconis` is saturated in `534/534` frames ([`docs/sprint-13-30/entrega-horacio.md`](docs/sprint-13-30/entrega-horacio.md)), so `data-new/results.json` reports status `parcial` (`0 < 3` core detections).
- **We do not run full FITS calibration in the browser yet:** direct S3 `Range` reads are verified for the `IMAGE` plane (`551,040 B` in 2 requests or `45,184 B` in 65 requests), but the web client does not yet perform on-the-fly `ZODI` subtraction, `Rice` `FLAGS` decoding, or reprojection.
- **Privacy and repository hygiene:** no under-18 photos or voices per [`docs/reto/normas.md`](docs/reto/normas.md); the `578` FITS cutouts stay outside Git, and no code or data from preliminary material in `research/` is reused.

## Team

Cosmonautas, Hermosillo, Sonora, Mexico. SI (AI) tools usage disclosure: [`docs/entrega/uso-de-si.md`](docs/entrega/uso-de-si.md).
