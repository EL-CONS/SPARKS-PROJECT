# Publicación estática de Sparks

Sparks compila a archivos estáticos en `app/dist/` y consume los datos precalculados de `data-sample/` y `data-new/`.

## Qué se verificó en esta corrida (14 de noviembre de 2026)

1. **Compilación en raíz (`VITE_BASE` por omisión `/`):**
   - Comando: `npm --prefix app run build` (`tsc && vite build`).
   - Salida observada: `dist/index.html` (`1.59 kB`), `dist/assets/index-vO7vYyZr.css` (`32.25 kB`), `dist/assets/index-BctVQ2eU.js` (`394.23 kB`, `104.92 kB` gzip).
2. **Previsualización local con datos (`npm run preview`):**
   - Comando: `npm --prefix app run preview -- --port 4173 --host 127.0.0.1`.
   - El plugin `serveDataStatic` en `app/vite.config.ts` (`configurePreviewServer`) sirve `data-sample/` y `data-new/` tanto en `/data-sample` y `/data-new` como bajo el prefijo `VITE_BASE` cuando es distinto de `/`.
   - Respuestas comprobadas con `curl` y Chromium headless:
     - `GET /` -> HTTP `200`
     - `GET /data-sample/index.json` -> HTTP `200`
     - `GET /data-new/index.json` -> HTTP `200`
3. **Configuración de `base` en Vite para subrutas (no raíz):**
   - `app/vite.config.ts` lee `process.env.VITE_BASE || '/'`.
   - `app/src/ui/kit/useSparks.ts` usa `import.meta.env.BASE_URL` (`BASE`) para construir las rutas de `fetchFieldIndex(BASE)`, manifiestos, cubos y catálogo Gaia.
   - Prueba real con subruta: `VITE_BASE=/SPARKS-PROJECT/ npm --prefix app run build` generó `dist/index.html` (`1.62 kB`) y reportó `Remote assets in dist/assets/ will be served with base: /SPARKS-PROJECT/`.
   - **Nota importante para hosting estático en producción:** `npm run build` solo copia `app/src/` y `app/public/` a `app/dist/`; las carpetas `data-sample/` y `data-new/` viven en la raíz del repositorio y en local las sirve el middleware `serveDataStatic` de Vite (`dev` y `preview`). Al publicar `app/dist/` en un servidor estático externo, es necesario copiar o publicar `data-sample/` y `data-new/` dentro de la ruta publicada (por ejemplo `dist/data-sample/` y `dist/data-new/`), o ajustar la ruta pública correspondiente.

## Plataformas externas y repositorios privados

- No se realizó ningún despliegue real en Cloudflare Pages, Netlify, Vercel, Render ni GitHub Pages durante esta sesión, por lo que **no se afirma** soporte ni funcionamiento con repositorios privados en dichas plataformas hasta probarlo directamente en cada proveedor.
- Para publicar en una subruta como GitHub Pages (`https://<org>.github.io/SPARKS-PROJECT/`), se requiere compilar con `VITE_BASE=/SPARKS-PROJECT/` y asegurar que `data-sample/` y `data-new/` queden accesibles bajo `/SPARKS-PROJECT/data-sample/` y `/SPARKS-PROJECT/data-new/`.
