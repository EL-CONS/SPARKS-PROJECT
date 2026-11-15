# Despliegue de Sparks en AWS (relevo para Cons)

Escrito el 14 de noviembre de 2026, a las 23:18, desde `joako-integracion`. Aquí no se creó nada en AWS ni se consultaron precios: el despliegue lo decide y lo hace Cons. Lo que dice "comprobado" se probó en esta máquina (salida en `docs/backend/curl-preview.txt`); lo demás va marcado "sin verificar".

## 1. Build

```bash
cd app
npm ci
npm run build                                    # sitio en la raíz del dominio
VITE_BASE=/SPARKS-PROJECT/ npm run build         # sitio bajo una subruta (con barra al principio y al final)
```

- `VITE_BASE` vale `/` si el sitio va en la raíz (por ejemplo `https://sparks.ejemplo.org/`). Si va bajo una subruta, es esa subruta (por ejemplo `https://ejemplo.org/sparks/` → `VITE_BASE=/sparks/`). Todas las rutas de datos salen de ese valor (`import.meta.env.BASE_URL`).
- Comprobado: `npm ci` en limpio y `npm run build` pasan; `VITE_BASE=/SPARKS-PROJECT/` produce rutas `/SPARKS-PROJECT/assets/...`.

## 2. Qué se sube

**Todo el contenido de `app/dist/`, tal cual** (21 MB, comprobado). Contiene:

| Ruta en `dist/` | Qué es |
|---|---|
| `index.html` | La página |
| `assets/` | JavaScript, CSS y SVG con hash en el nombre |
| `logo.svg` | Ícono |
| `data-sample/` | `index.json`, `results.json`, `README.md` y `barnard/` (manifiesto, PNG, `coadds*.bin`, `diffs*.bin`, `frames.bin`, `masks.bin`, `catalogs.json`) |
| `data-new/` | `index.json`, `results.json` y `wise0855/`, `epsindib/`, `rwaur/`, `rdra/` con los mismos archivos |

El build copia `data-sample/` y `data-new/` de la raíz del repositorio a `dist/` al terminar (`closeBundle` en `app/vite.config.ts`). Hay 35 archivos `.bin`; el más grande es `data-sample/barnard/frames.bin` (2 908 160 bytes).

## 3. Lo que la app necesita del servidor

| Necesidad | Respuesta | Cómo se sabe |
|---|---|---|
| Archivos estáticos | Sí, solo eso: no hay API ni servidor propio | El código hace `fetch` a rutas relativas a `BASE_URL`; comprobado con `python3 -m http.server` sobre `dist/`: la app cargó WISE 0855 completo |
| Tipo MIME de `.json` | `application/json` | Comprobado con `curl` (servidor simple y `vite preview`) |
| Tipo MIME de `.bin` | `application/octet-stream` sirve | Comprobado con `curl`. La app lee el cuerpo con `arrayBuffer()`, no mira el tipo, salvo para descartar HTML |
| Tipo MIME de `.png`, `.svg`, `.css`, `.js` | Los normales (`image/png`, `image/svg+xml`, `text/css`, `text/javascript`) | Estándar; sin verificar en AWS |
| Rangos de bytes (`Range`) | **No hacen falta**: la app pide cada archivo entero | Revisado en `app/src/` (no hay cabecera `Range`) |
| Enrutado de cliente y respaldo a `index.html` | **No hace falta**: una sola página; el estado va en `?ra=&dec=...` y en `#explorar` | Revisado en `app/src/core/urlState.ts` y `App.tsx` |
| 404 en archivos que no existen | Recomendado devolver 404 de verdad | Con el respaldo de SPA, un archivo de datos que falta llega como HTML; la app lo detecta por `content-type` y dice "sus imágenes llegan pronto", pero un 404 es más claro |
| CORS | No hace falta si la página y los datos van en el mismo dominio | Sin verificar si se separan |
| Compresión | Conviene gzip o brotli para `.js`, `.css` y `.json`; los `.bin` comprimen poco | Sin verificar |
| Caché | `assets/` lleva hash en el nombre: puede ir con caché larga. `index.html` y `data-*/**` sin caché larga, para que una actualización de datos se vea | Recomendación, sin verificar |

## 4. Destino sugerido (sin verificar, decide Cons)

Un bucket de S3 con los archivos de `dist/` y CloudFront delante (HTTPS, compresión, caché), o AWS Amplify Hosting apuntando a la carpeta construida. **Sin verificar**: no se probó ninguno, no se crearon recursos y no se consultaron precios. Si se usa S3 detrás de CloudFront, los tipos MIME los fija quien sube los archivos (por ejemplo `aws s3 sync` los infiere por extensión; sin verificar para `.bin`).

## 5. Comprobación después del desplegar

Con `URL` = la dirección pública, incluida la subruta si la hay, terminada en `/`:

```bash
for p in "" data-sample/index.json data-new/index.json data-sample/barnard/frames.bin data-new/wise0855/frames.bin data-new/rdra/manifest.json data-new/epsindib/diffs.bin; do curl -s -o /dev/null -w "%{http_code} %{size_download} %{content_type} $p\n" "${URL}$p"; done
```

Deben salir los siete con `200`. Tamaños de referencia (comprobados en local): `data-sample/index.json` 6 057 bytes, `data-new/index.json` 3 288, `data-sample/barnard/frames.bin` 2 908 160, `data-new/wise0855/frames.bin` 1 253 376.

En pantalla, con `${URL}?ra=133.7602&dec=-7.2407&lang=es#explorar`:

1. La mira muestra los cinco objetivos con la etiqueta "con fotos".
2. En "Mira el cielo", WISE 0855 muestra seis paneles; "Reproducir" alterna mayo 2025, octubre 2025 y abril 2026.
3. "Resta" muestra azul y ámbar; "Medir el objetivo" dibuja un espectro (en local: 126 o 127 de 153 fotos medidas).
4. R Draconis y RW Aurigae muestran "Procesamiento parcial" y su motivo.
5. "¿Qué pasó?" muestra el panel del clasificador con "acierta 78 % en 69 objetos".
6. A 390 px de ancho (teléfono) no hay desplazamiento horizontal.
7. La consola del navegador no muestra errores.
