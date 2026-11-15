# Prueba de lectura por rango (HTTP Range) desde el navegador hacia S3

**Fecha:** sábado 14 de noviembre de 2026 · **Rama:** `carlos` · **Página de prueba:** [`s3-range-test.html`](s3-range-test.html)

## 1. Objetivo y contexto

El bucket S3 `nasa-irsa-spherex` (`us-east-1`) es público, pero no tiene índice espacial por coordenadas; el servicio SIA de IRSA (`/SIA`) entrega la ruta en `cloud_access` (por ejemplo, `bucket_name: "nasa-irsa-spherex"`, `key: "dr1/level2/..."` o `"qr3/level2/..."`) y `access_estsize` en kilobytes decimales (`65,791 KB`, `65,863 KB` y `65,996 KB` en los tres archivos consultados en `/SIA`). Según mediciones directas con `HEAD` sobre S3, esos mismos archivos FITS Level 2 pesan `65,790,720 B`, `65,862,720 B` y `65,995,200 B` (`Content-Length`).

Si el navegador puede leer un recorte 64 × 64 directo desde S3 mediante peticiones `Range` (CORS + HTTP `206`), la descarga de píxeles para un campo nuevo puede resolverse sin pasar por el servicio de recortes de IRSA (que devuelve HTTP `503` intermitentes y envía `3,977,280–4,095,360 B` por archivo, `4,008,960 B` típicos, al incluir el cubo `EPSF`, según los `consultas.json` de los cuatro campos).

## 2. Resultado de la prueba en vivo (navegador)

Se sirvió [`s3-range-test.html`](s3-range-test.html) localmente en Firefox headless con WebDriver BiDi sobre `http://127.0.0.1` y se probaron archivos reales de `spherex_qr3` y `spherex_dr1`.

### 2.1 Fallos detectados y corregidos antes y durante las corridas

1. **Cabecera CORS `Content-Range` no expuesta a JavaScript (18:56–18:58 MST):** el bucket responde `Access-Control-Allow-Origin: *`, `Access-Control-Allow-Methods: HEAD, GET` y `Access-Control-Expose-Headers: ETag, x-amz-meta-custom-header`. Por ello `res.headers.get('content-range')` y `res.headers.get('access-control-allow-origin')` devuelven `null` en `fetch()`; el cliente debe validar `res.status === 206` y `buf.byteLength`, sin exigir `Content-Range`.
2. **Orden de bytes de FITS (big-endian vs little-endian):** `Float32Array` sobre el buffer crudo usa el orden nativo little-endian y corrompe los píxeles. Es obligatorio decodificar con `DataView.prototype.getFloat32(offset, false)`.
3. **Límite fijo inicial de `23,040 B` en cabeceras (22:07:14 y 22:07:33 MST):** en la primera corrida con corte fijo en `23,040 B` (8 bloques FITS), tanto QR3 (`22:07:14 MST`) como DR1 (`22:07:33 MST`) devolvieron `HTTP 206` sin error de CORS, pero fallaron porque la cabecera `PRIMARY + IMAGE` mide `25,920 B` o `28,800 B`. Se reemplazó por lectura dinámica en bloques de `28,800 B` hasta encontrar `END` del HDU `IMAGE`.

### 2.2 Corridas exitosas medidas en navegador

- **Modo slab contiguo (22:08:37 y 22:09:02 MST, centro geométrico):**

| Colección | Hora local (MST) / UTC | Archivo probado en `nasa-irsa-spherex.s3.amazonaws.com` | `Content-Length` (S3 `HEAD`) | Peticiones HTTP | Cabeceras (`PRIMARY` + `IMAGE`) | Datos leídos | Total leído | Tiempo | Resultado |
|---|---|---|---:|---:|---:|---:|---:|---:|---|
| `spherex_qr3` | `22:08:37 MST` (`2026-11-15T05:08:37.065Z`) | `qr3/level2/2026W39_1A/l2b-v27-2026-268/3/level2_2026W39_1A_0276_2D3_spx_l2b-v27-2026-268.fits` | 65,995,200 B | 2 (`HTTP 206`) | 25,920 B (chunk 1 de 28,800 B) | 522,240 B (`[8088000-8610239]`) | **551,040 B (`538.1 KB`)** | 797.0 ms | Éxito: `4096/4096` px finitos (`min=-0.7786`, `max=139.2`), fuentes visibles |
| `spherex_dr1` | `22:09:02 MST` (`2026-11-15T05:09:02.769Z`) | `dr1/level2/2025W19_1B/l2b-v27-2026-197/1/level2_2025W19_1B_0241_1D1_spx_l2b-v27-2026-197.fits` | 65,862,720 B | 2 (`HTTP 206`) | 28,800 B (chunk 1 de 28,800 B) | 522,240 B (`[8090880-8613119]`) | **551,040 B (`538.1 KB`)** | 713.6 ms | Éxito: `4096/4096` px finitos (`min=-1.580`, `max=309.5`), fuentes visibles |

- **Comparación directa de ambos modos con centrado WCS (`TAN` + `SIP` inversa) sobre WISE 0855 (22:15:13 y 22:15:14 MST):**
  - Archivo DR1: `dr1/level2/2025W19_1B/l2b-v27-2026-197/3/level2_2025W19_1B_0116_1D3_spx_l2b-v27-2026-197.fits` (`Content-Length` medido por S3 `HEAD`: `65,790,720 B`).
  - Coordenada de catálogo usada para la consulta del recorte: `RA = 133.795129`, `Dec = -7.245147` → píxel FITS 1-based `(382.223, 154.736)` tras invertir proyección `TAN` y polinomios `AP/BP` + refinamiento `A/B`; caja 64 × 64 en `x = 349..412`, `y = 122..185` (0-based).
  - **Modo slab contiguo (`22:15:13 MST` / `2026-11-15T05:15:13.169Z`):** `2` peticiones (`28,800 B` de cabecera + `522,240 B` de slab `[1021440-1543679]`), **551,040 B (`538.1 KB`)** en **701.0 ms**.
  - **Modo 64 rangos de fila (`22:15:14 MST` / `2026-11-15T05:15:14.238Z`):** `65` peticiones (`1` chunk de `28,800 B` para `25,920 B` de cabeceras `PRIMARY + IMAGE` + `64` peticiones de `256 B` = `16,384 B` de píxeles), **45,184 B (`44.1 KB`)** en **6,988.0 ms** (`6,838.0 ms` las 64 filas). (Si se leen exactamente los `25,920 B` de cabecera, el mínimo de transferencia es `42,304 B` = `0.0643%` del archivo completo).
  - **Verificación independiente en Python:** tanto el modo slab como el modo por filas en Firefox produjeron `4096/4096` píxeles finitos idénticos (`min=-1.656810`, `max=3.623372`, `mean=0.165205`, `center=0.205186`, huella `FNV-1a = 1bc318be`), exactamente iguales a la extracción independiente por `Range` en Python.

Observaciones de red y CORS en el navegador:
- El preflight CORS (`OPTIONS` con cabecera `Range`) y las peticiones `GET` con `Range` devolvieron `HTTP 206 Partial Content` con **0 errores de CORS o consola**.
- `Content-Range` y `Access-Control-Allow-Origin` no son legibles por JavaScript debido a `Access-Control-Expose-Headers: ETag, x-amz-meta-custom-header`.

## 3. Comparación de bytes medidos (recorte 64 × 64 px)

Comparación usando el archivo DR1 de WISE 0855 (`access_estsize = 65,791 KB` en `/SIA`; `65,790,720 B` medidos por S3 `HEAD`) y el recorte típico del servicio de IRSA con `size=0.11` (`4,008,960 B` en `WISE_0855/consultas.json`, que incluye `EPSF`):

| Método | Peticiones | Bytes transferidos | Comparación vs archivo completo (`65,790,720 B`) | Comparación vs recorte IRSA (`4,008,960 B`) |
|---|---:|---:|---:|---:|
| Archivo FITS completo en S3 (`HEAD Content-Length` / `access_estsize = 65,791 KB`) | 1 | 65,790,720 B (~65.8 MB) | 1.0× | 16.41× mayor |
| Recorte IRSA (`size=0.11`, incluye `EPSF`) | 1 | 4,008,960 B (~4.0 MB) | 16.41× menor (6.09%) | 1.0× |
| **Medido:** S3 `Range` (chunk cabecera 28,800 B + slab contiguo de 64 filas) | **2** | **551,040 B (538.1 KB)** | **119.39× menor (0.838%)** | **7.28× menor (13.75%)** |
| **Medido:** S3 `Range` (chunk cabecera 28,800 B + 64 rangos de 256 B por fila) | **65** | **45,184 B (44.1 KB)** | **1,456.06× menor (0.0687%)** | **88.73× menor (1.13%)** |
| Mínimo exacto con cabecera de 25,920 B + 64 rangos de 256 B | — | 42,304 B (41.3 KB) | 1,555.19× menor (0.0643%) | 94.77× menor (1.06%) |

Nota práctica: el modo de 64 rangos de 256 B minimiza los bytes transferidos (`44.1 KB`), pero tarda ~`7.0 s` por imagen debido a las 65 peticiones HTTP. El bloque contiguo de 64 filas requiere solo **2 peticiones** (`~0.7–0.8 s` medidos en navegador) y ya reduce el tráfico **7.28×** frente al recorte de IRSA y **119.4×** frente al archivo completo.

## 4. Conclusión arquitectónica

1. **¿Se puede resolver un recorte directo desde el navegador sin servidor de recortes?** **Sí** para la lectura de píxeles: `nasa-irsa-spherex` acepta `Range` por CORS (`HTTP 206`) y entrega un recorte 64 × 64 de `IMAGE` en `551,040 B` y menos de `0.8 s` (o `45,184 B` en 65 peticiones) sin tocar el servicio de cutouts de IRSA.
2. **Qué sigue requiriendo descubrimiento o procesamiento adicional:** el bucket S3 no tiene índice espacial por coordenadas, así que **SIA de IRSA (`/SIA`) sigue siendo necesario** para obtener la lista de archivos (`cloud_access` y geometría) que cubren unas coordenadas RA/Dec. Además, esta prueba leyó únicamente el plano `IMAGE` sin compresión; para replicar la calibración completa del pipeline en navegador habría que leer también `ZODI`, `WCS-WAVE` y decodificar `FLAGS` (comprimido con Rice).
