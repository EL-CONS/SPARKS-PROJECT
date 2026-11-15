# Sparks

Web tool by Team Cosmonautas for the **Planet X and SPHEREx** challenge at the NASA Space Apps Challenge 2026 (Hermosillo local site).

Enter a sky position and Sparks blinks the images NASA's SPHEREx telescope captured of that field on different dates. Anything that jumps has moved. Blue shows where it was; amber shows where it is now.

Sparks surfaces **candidates to review**, never discovery claims. It is an independent project, not affiliated with or endorsed by NASA.

**Live demo (AWS S3 + CloudFront):** https://d3hfqg5g7frqp1.cloudfront.net/

**Presentation (AWS S3 + CloudFront):** https://d3hfqg5g7frqp1.cloudfront.net/sparks-presentacion.html

## What it does

- Accepts coordinates in degrees (`269.4486 4.7672`), in hours and degrees (`08h55m10.831s -7d14m42.53s`, `17:57:48.5 +04:41:36`), or by selecting a challenge target name.
- Displays the field across all six SPHEREx detectors in three viewing modes: **blink** (alternating seasons at 1, 2, or 3 changes per second), **sum** (average across seasons, with lower noise), and **difference** (one season minus another, in units of noise sigma).
- **Selectable field of view**: full cutout, half, or quarter.
- **On-the-fly spectrum**: click any point and Sparks measures it across every individual exposure.
- **Gaia DR3** and **CatWISE2020** catalog overlays on top of the image.
- NASA quality flags, per-detector noise levels, and source attribution for every measurement.
- Full state encoded in the URL for sharing or embedding: `?ra=269.4486&dec=4.7672&fov=3.28&mode=diff&det=all&lang=en#explorar` (defaults to the intro view unless `#explorar` is present).
- English and Spanish support (the `ES`/`EN` button displays the active language). Single dark theme.

Challenge requirements checklist and evidence: [`docs/auditoria/requisitos.md`](docs/auditoria/requisitos.md).

## How to run it

Tested with Node 26 (and Node 20); Vite 5 requires Node 18 or newer.

```bash
cd app
npm ci
npm run dev        # opens http://localhost:5173
```

Other commands inside `app/`:

| Command | Purpose |
|---|---|
| `npm test` | Logic unit tests (coordinates, URL state, player, field of view, spectrum, classifier, verdict) |
| `npm run typecheck` | TypeScript type checking |
| `npm run check-data` | Validates `data-sample/` and `data-new/` against the schema |
| `npm run build` | Builds the static site into `app/dist/`, including data files |
| `npm run preview` | Serves `app/dist/` at http://localhost:4173 for pre-deployment testing |

## How to deploy

`npm run build` outputs a complete static site in `app/dist/` (around 21 MB with data). It works on any free static hosting provider.

- **At a domain root** (AWS S3 + CloudFront, Netlify, Cloudflare Pages, Vercel): run `npm run build` and deploy `app/dist/`. See [`docs/backend/despliegue-aws.md`](docs/backend/despliegue-aws.md) for the AWS S3 + CloudFront setup and post-deploy checks.
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
| `ml-clasificador/` | Object-type classifier: v2 Random Forest trained on 69 verified-class objects; metrics in `resultados_v2.json` (v1 kept for historical reference) |
| `docs/reto/` | Challenge prompt, official resources, and event rules |
| `docs/auditoria/` | Requirements audit, branch map, asset provenance, and screenshots |
| `docs/entrega/` | Space Apps submission copy: SI/AI usage disclosure and submission checklist |
| `Logo/`, `branding/` | Sparks visual identity |
| `design-proto/` | Discarded design prototypes and the selected design |

The pipeline that downloads and processes images (`pipeline/`) and its methodology (`docs/pipeline/`) live on the `Horacio` branch. Branch ownership map: [`docs/auditoria/mapa-de-ramas.md`](docs/auditoria/mapa-de-ramas.md).

## Data sources

- **Images**: NASA's SPHEREx mission via the NASA/IPAC Infrared Science Archive (IRSA). Releases QR2 (DOI `10.26131/IRSA652`), QR3 (DOI `10.26131/IRSA662`), and DR1, depending on the field; each manifest records the exact releases used.
- **Reference positions and proper motions**: Gaia DR3 (ESA/Gaia/DPAC) and CatWISE2020.
- **Processing**: 64 × 64 pixel cutouts (6.56′ wide, 6.15″ per pixel), aligned and coadded per detector and season. The app never alters the raw sky images: it displays them with nearest-neighbor scaling and renders overlays on a separate layer.

## Adding a new field or data release

1. Process the field with `pipeline/` (`Horacio` branch; instructions in `docs/pipeline/`). This outputs a folder containing `manifest.json`, `catalogs.json`, `.bin` cubes, and `png/`.
2. Copy the folder to `data-new/<id>/` and register the field in `data-new/index.json`.
3. Run `npm run check-data` inside `app/`.
4. Run `npm run build` and deploy.

Note: `data-new/` support in the loader is integrated alongside `data-sample/` (see the audit docs for details).

## Team

Cosmonautas, Hermosillo, Sonora, Mexico. SI (AI) tools usage disclosure: [`docs/entrega/uso-de-si.md`](docs/entrega/uso-de-si.md).
