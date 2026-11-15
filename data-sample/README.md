# data-sample

Minimal real-data package created so the frontend could be developed without waiting for the full pipeline. Contains pre-processed public SPHEREx data (IRSA), pipeline version `0.3.0`, generated on 2026-11-05 (~8 MB).

| File | Description |
|---|---|
| `index.json` | List of available fields with name, RA/Dec, object type, measured and expected proper motion (Gaia or CatWISE), and thumbnail. Only Barnard's Star data is stored on disk here; the other fields are listed in the index without local folders in this package. |
| `results.json` | Reference metrics cited by the project: IRSA archive stats, fields, validation, and final test results. Numbers displayed in the UI or pitch come from here. |
| `barnard/manifest.json` | Field metadata: coordinates and WCS, data releases and seasons, per-detector scales, and the list of coadds with their PNG paths. |
| `barnard/png/` | Pre-rendered images: one coadd per detector and season (`coadd_D6_S0.png`) and individual frames (`frame_0078.png`). |
| `barnard/*.bin` | Raw binary arrays (`frames`, `coadds`, `diffs`, `medians`, `masks`) for canvas rendering. The binary layout is described in `manifest.json`. |
| `barnard/catalogs.json` | Nearby Gaia sources with pixel coordinates (`x`, `y`), proper motion, parallax, and color. |

How to read it in three steps: fetch `index.json` to render target buttons, then fetch `barnard/manifest.json` to inspect detector, season, and coadd counts, and display the linked PNGs or binary cubes. Each detector's color scale is defined in `scales` inside the manifest.

Barnard's Star reference numbers (from `index.json`): measured proper motion `10.23 ± 0.43` arcsec/yr, expected `10.39` arcsec/yr.
