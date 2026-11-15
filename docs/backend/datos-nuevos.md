# Flujo para datos nuevos y comando `npm run check-data`

## 1. Cómo entra un campo nuevo

1. Crear la carpeta `<data-dir>/<field_id>/` con:
   - `manifest.json` (`schema: 1`, `detectors`, `seasons`, `coadds`).
   - `png/` con todos los PNGs referenciados en `coadds[].png` (ej. `png/coadd_D1_S0.png`).
2. Agregar o actualizar la entrada correspondiente en `<data-dir>/index.json` y en `<data-dir>/results.json`.
3. Validar antes de publicar:
   ```bash
   cd app
   npm run check-data -- ../ruta-a-carpeta-de-datos
   ```

## 2. Qué comprueba el frontend antes de mostrar un campo

- Al cargar `index.json`, `fetchFieldIndex()` valida el esquema con `validateIndexJson()`.
- Al seleccionar un campo, `loadFieldAssets()` solicita `<field_id>/manifest.json`:
  - Si responde **404**, devuelve `{ status: 'soon', field }` y la interfaz muestra el estado "pronto" sin romper.
  - Si responde **200**, valida `schema === 1` y `coadds[]` con `validateManifestJson()` antes de construir las URLs de imagen.

## 3. Qué debe hacer la herramienta cuando llega un lanzamiento posterior (ej. `spherex_qr4`)

1. **Actualizar `releases` y `seasons`:** agregar `"QR4"` a `releases` en `index.json` y la nueva temporada en `manifest.json` (`seasons[]`).
2. **Recalcular coadds y restas:** generar nuevos coadds por detector y temporada y nuevas restas (`diffs`) comparando temporadas nuevas contra previas, manteniendo emparejamiento de longitud de onda (`lambda_matched`).
3. **Actualizar `results.json`:** recalcular `mu`, `mu_err`, `pa` y `archive.by_collection` con el nuevo lote.
4. **Correr `npm run check-data`** y la suite `npm test` para confirmar que no hay rutas rotas ni cambios incompatibles en `schema`.

## 4. Comando `npm run check-data`

Implementado en [`app/scripts/check-data.mjs`](../../app/scripts/check-data.mjs). Comprueba:
- Existencia y sintaxis JSON de `index.json` y `results.json`.
- Rangos de `ra` (`[0, 360]`), `dec` (`[-90, 90]`), tipos obligatorios (`id`, `name`, `kind`, `note`, `in_gaia`, `releases`).
- Si existe carpeta de campo (ej. `barnard/`), valida `manifest.json` (`schema === 1`) y verifica en disco que **cada PNG listado en `coadds[]`** exista realmente.
- Devuelve código de salida `0` si pasa o `1` con el listado exacto de fallas.
