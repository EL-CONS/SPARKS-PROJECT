# Publicación estática de Sparks

Sparks compila a archivos estáticos en `app/dist/`. Desde la integración del 14 de noviembre (`joako-integracion`), el build copia también los datos: `app/dist/data-sample/` y `app/dist/data-new/` (plugin `serveDataStatic` en `app/vite.config.ts`, gancho `closeBundle`). La carpeta `app/dist/` es lo único que hay que subir.

Versión anterior de este documento: Cons, `cbef27d`. Corregida por Joaquín (con Claude Code) el 14 de noviembre a las 23:14, con lo comprobado abajo. La salida completa de `curl` está en `docs/backend/curl-preview.txt`.

## Qué se comprobó (14 de noviembre de 2026, 23:14, commit `587fe9e`)

1. **Build con subruta.** `cd app && VITE_BASE=/SPARKS-PROJECT/ npm run build`. Pasa `tsc` y `vite build`; `app/dist/` pesa 21 MB y contiene 35 archivos `.bin`.
2. **`npm run preview` con la misma `VITE_BASE`** (puerto 4174). Todo responde `200`: la página `/SPARKS-PROJECT/` (1 645 bytes), `data-sample/index.json` (6 057), `data-new/index.json` (3 288), `data-sample/barnard/frames.bin` (2 908 160) y `data-new/wise0855/frames.bin` (1 253 376).
   - Ojo: en `preview` (y en `dev`), los datos los sirve el middleware de Vite **desde la raíz del repositorio**, no desde `dist/`. Por eso esta prueba no basta para decir que `dist/` sirve solo.
   - El middleware también responde en `/data-new/` sin el prefijo, y a una ruta inexistente responde `200` con `index.html` (respaldo de SPA de Vite).
3. **`app/dist/` servido por un servidor estático simple**, sin Vite: `python3 -m http.server` sobre una carpeta con `SPARKS-PROJECT -> app/dist`, puerto 4175. Responden `200` la página, los dos `index.json`, ambos `frames.bin` y `data-new/rdra/manifest.json`. Una ruta inexistente da `404`. Abierta en el navegador, WISE 0855 carga sus 10 archivos de datos con `200` (índices, manifiesto, `coadds*.bin`, `diffs*.bin`, `catalogs.json`, `frames.bin`, `masks.bin`) y 6 PNG; el espectro al vuelo mide 127 de 153 fotos. Sin errores de consola.
4. **Rangos de bytes.** La app no pide rangos (no hay cabeceras `Range` en `app/src/`): descarga cada `.bin` entero con `fetch`. `vite preview` responde `200` completo a una petición con `Range`.
5. **Rutas.** La app no tiene enrutado de cliente con rutas propias: el estado va en la cadena de consulta (`?ra=&dec=&fov=&mode=&det=&lang=`) y en el ancla (`#explorar`). No hace falta un respaldo a `index.html` para rutas profundas.

## Qué valor de `VITE_BASE`

- Sitio en la raíz de un dominio: sin `VITE_BASE` (vale `/`).
- Sitio en una subruta, por ejemplo `/SPARKS-PROJECT/`: `VITE_BASE=/SPARKS-PROJECT/`, con barra al principio y al final. Todas las rutas de datos salen de `import.meta.env.BASE_URL` (`BASE` en `app/src/ui/kit/useSparks.ts` y `app/src/data/loader.ts`).

## Plataformas externas

- No se desplegó nada en ninguna plataforma (GitHub Pages, Cloudflare Pages, Netlify, Vercel, AWS) en esta sesión.
- GitHub Pages con repositorio privado: **sin verificar**. No se consultó la documentación oficial de GitHub en esta sesión; no se afirma que funcione. El destino acordado es AWS (Cons): ver `docs/backend/despliegue-aws.md`.
