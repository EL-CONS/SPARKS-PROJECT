# Prueba de lectura por rango (HTTP Range) desde el navegador hacia S3

**Fecha:** sabado 14 de noviembre de 2026 · **Rama:** `carlos` · **Pagina de prueba:** [`s3-range-test.html`](s3-range-test.html)

## 1. Objetivo y contexto

El bucket S3 `nasa-irsa-spherex` (`us-east-1`) es abierto, pero no tiene indice espacial por coordenadas; SIA de IRSA entrega la ruta en `cloud_access` (por ejemplo, `bucket_name: "nasa-irsa-spherex"`, `key: "dr1/level2/..."`) y el tamano estimado en `access_estsize` (reportado en KB, ~60–71.6 MB segun coleccion; ver `research/planetx/02-spherex-datos.md`).

Si el navegador puede leer un recorte 64 × 64 directo desde S3 mediante peticiones `Range` (CORS + HTTP 206), un campo nuevo podria resolverse sin pasar por el servicio de recortes de IRSA (que devuelve HTTP 503 intermitentes y envia ~4.0 MB por archivo por el cubo `EPSF`).

## 2. Resultado de la prueba en vivo

- **Estado:** `[SIN VERIFICAR EN VIVO]` — No se ejecuto la prueba contra S3 desde el navegador en esta sesion.
- **Como ejecutarla y registrarla:**
  1. Levantar servidor local en `docs/sprint-13-30/`: `python3 -m http.server 8765`.
  2. Abrir `http://127.0.0.1:8765/s3-range-test.html` en el navegador.
  3. Pegar la URL HTTPS de S3 armada desde `cloud_access` (`https://nasa-irsa-spherex.s3.amazonaws.com/<key>`) y pulsar **Probar Range**.
  4. Registrar aqui la hora exacta, si el preflight CORS (`OPTIONS` con `Access-Control-Request-Headers: range`) responde con `Access-Control-Allow-Headers` permitiendo `Range`, el codigo HTTP (esperado `206 Partial Content`), los bytes leidos y el tiempo.

## 3. Calculo de bytes teorico (FITS Level 2, 64 × 64 px)

Para una imagen SPHEREx Level 2 de `2040 × 2040` pixeles en punto flotante de 32 bits (`BITPIX = -32`, 4 bytes/pixel):

| Metodo | Peticiones | Bytes a transferir | Comparacion vs archivo completo (~65 MB) | Comparacion vs recorte IRSA (~4.0 MB) |
|---|---:|---:|---:|---:|
| Archivo FITS completo en S3 (`access_estsize` en KB) | 1 | ~65,000,000 B (~65 MB; 71,638 KB en QR2) | 1.0× | ~16.2× mayor |
| Recorte IRSA (`size=0.11`, incluye `EPSF`) | 1 | 4,008,960 B (~4.0 MB) | ~16.2× menor | 1.0× |
| S3 `Range` (cabeceras + bloque contiguo de 64 filas) | 2 | ~23,040 B (cabeceras) + 522,240 B (`64 × 2040 × 4`) = **~545,280 B (~532.5 KB)** | ~119× menor | ~7.4× menor |
| S3 `Range` (cabeceras + 64 rangos de 256 B por fila) | 65 | ~23,040 B + 16,384 B (`64 × 64 × 4`) = **~39,424 B (~38.5 KB)** | ~1,649× menor | ~101.7× menor |

Nota tecnica: leer 64 rangos individuales de 256 B minimiza bytes (~38.5 KB), pero exige 65 peticiones HTTP; leer 1 bloque contiguo de 64 filas (`522,240 B`) reduce a solo **2 peticiones** y sigue pesando **~7.4× menos** que el recorte de IRSA con `EPSF`.

## 4. Decision pendiente

- Si `s3-range-test.html` devuelve **HTTP 206** con `Access-Control-Allow-Origin: *` y `Access-Control-Allow-Headers` permitiendo `range`: un campo nuevo **si** puede resolverse desde el navegador sin servidor intermedio.
- Si falla por CORS (preflight `Range` bloqueado por la politica del bucket): se requiere un proxy/servidor ligero o seguir usando el servicio de recortes de IRSA con reintentos.
