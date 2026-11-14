# Contrato de datos · `index.json`, `manifest.json` y `results.json`

Validación implementada en TypeScript en [`app/src/data/contract.ts`](../../app/src/data/contract.ts), conectada en [`app/src/data/loader.ts`](../../app/src/data/loader.ts) y probada contra `data-sample/` en [`app/tests/contract.test.ts`](../../app/tests/contract.test.ts).

## 1. `data-sample/index.json`

Lista maestra de campos para el selector y búsqueda por coordenadas.

- **Raíz:** `{ fields: IndexField[] }` (al menos 1 elemento).
- **Campos obligatorios por entrada:**
  - `id`: `string` no vacío (ej. `"barnard"`).
  - `name`: `string` no vacío.
  - `ra`: `number` finito en `[0, 360]`.
  - `dec`: `number` finito en `[-90, 90]`.
  - `kind`: `string` no vacío (`"mover"` | `"variable"`).
  - `note`: `string` no vacío.
  - `n_frames`: `number >= 0`.
  - `seasons`: `number >= 1`.
  - `releases`: `string[]` no vacío (ej. `["QR2", "QR3"]`).
  - `in_gaia`: `boolean`.
- **Campos opcionales (`number | null`):** `mu_measured`, `mu_err`, `pa`, `mu_expected`, `pa_expected`, más `thumb` (`string`).

## 2. `data-sample/<field_id>/manifest.json`

Detalle por campo con temporadas, detectores, escalas y rutas de PNGs.

- **Versión de esquema obligatoria:** `schema === 1`.
- **Campos obligatorios:**
  - `pipeline_version`: `string` no vacío (en muestra: `"0.3.0"`).
  - `field`: `{ id: string, n: number, ... }`.
  - `seasons`: arreglo no vacío de temporadas.
  - `detectors`: arreglo de enteros en `1..6`.
  - `coadds`: arreglo no vacío de objetos con `det` (entero), `season` (entero) y `png` (`string` relativo al campo, ej. `"png/coadd_D1_S0.png"`).
- **Campos opcionales:** `scales`, `diffs`, `frames`, `target`, `candidates`, `cold_bands_um`, `blackbody_ratio_4p7_1p35`.

## 3. `data-sample/results.json`

Fuente única de verdad numérica para el pitch, validación y resumen científico.

- **Campos obligatorios:**
  - `generated_utc`: `string` no vacío.
  - `archive`: `{ n_science_images: number, by_collection: Record<string, number> }`.
  - `fields`: diccionario no vacío donde cada campo tiene `name` (`string`), `kind` (`string`) e `in_gaia` (`boolean`).

## 4. Errores ante incumplimiento

`validateIndexJson`, `validateManifestJson` y `validateResultsJson` devuelven `{ ok: false, issues: [{ path, message }] }` indicando la ruta exacta (ej. `fields[0].ra`, `schema`, `coadds[2].png`). `loader.ts` lanza un error descriptivo con la primera falla si la respuesta HTTP 200 no cumple el contrato; si `manifest.json` devuelve HTTP 404, devuelve `{ status: 'soon', field }`.
