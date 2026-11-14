# 36 de 37 objetos de la lista tienen al menos dos temporadas con cobertura SPHEREx

**Cobertura y acceso · SPHEREx · sprint 13:30 a 14:30 · sábado 14 de noviembre de 2026 · rama `carlos`**

El único objeto que queda con una sola temporada es **Gliese 687**, pero tiene 858 imágenes en 17 meses continuos (2025-05-13 a 2026-10-04): no es un objeto sin serie, es un objeto sin huecos de más de 60 días. Con la definición de temporada que se explica en la sección 4, la cifra que se pide es 36/37; con la pregunta física de fondo (¿hay dos épocas separadas para medir movimiento?), los 37 sirven.

**Entrega:** este archivo, [`cobertura.csv`](cobertura.csv), [`cobertura.py`](cobertura.py), [`consultas.json`](consultas.json) y [`aladin-wcs-test.html`](aladin-wcs-test.html).

---

## 1. Acceso a los tutoriales

Los notebooks se leen directamente en GitHub. El enlace de `caltech-ipac.github.io` se reemplazó en [`docs/sprint-12-1/recursos.md`](../sprint-12-1/recursos.md) por estos:

| Archivo | Enlace |
|---|---|
| Índice | <https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex.md> |
| Introducción | <https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_intro.md> |
| Cutouts | <https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_cutouts.md> |
| PSF / ePSF | <https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_psf.md> |
| Mosaicos | <https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_mosaic.md> |
| Cubos HiPS | <https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_hipscube.md> |
| Source Discovery | <https://github.com/Caltech-IPAC/irsa-tutorials/tree/main/tutorials/spherex/spherex_source_discovery> |

Los siete enlaces de la tabla respondieron HTTP 200 el 14-nov-2026: los seis archivos `raw.githubusercontent.com` en 0,27–1,36 s y la carpeta `spherex_source_discovery` en 1,53 s, todos a partir de las 14:32. El enlace del repositorio (`tutorials/spherex`) también respondió 200 a las 14:31:59 en 1,15 s. [MEDIDO: 14-nov-2026, 14:31–14:33 MST]

**El dominio `caltech-ipac.github.io` no sirve desde la red del equipo.** Joaquín midió más de 45 s de espera a las 13:04; esta máquina midió 25 s sin respuesta a las 14:31:34, con el dominio completo caído. No es un problema del notebook ni de GitHub: es el host de páginas renderizadas. [MEDIDO: 14-nov-2026, 13:04 y 14:31 MST]

En `recursos.md` quedaron el repositorio y los siete archivos enlazados; no queda ningún enlace a `caltech-ipac.github.io` (`grep '](https://caltech-ipac.github.io'` devuelve 0).

---

## 2. Limpieza de `docs/sprint-12-1/recursos.md`

- Marcas `[cite: ...]`: **0**. La versión anterior tenía 59; se quitaron. El conteo da 0 tanto en el archivo de trabajo como en `git show HEAD:docs/sprint-12-1/recursos.md`.
- Enlaces de tutoriales: los dos enlaces a `github.io` (sección 2 y tabla de decisión) se reemplazaron por el repositorio y los archivos de GitHub.
- La nota de la sección 2.2 ahora registra las dos mediciones: más de 45 s de Joaquín a las 13:04 y 25 s propios a las 14:31.
- Las afirmaciones sobre Gaia (sección 0 y 4.4) y sobre Aladin (sección 6.2) se actualizaron con las pruebas de hoy: la ESA respondió 200 en 2,7 s y 3,6 s frente al 503 del 5-nov, y Aladin 3.8.2 carga un FITS TAN pero no respeta el SIP.

---

## 3. Pruebas de acceso de hoy

Todas las filas son del 14-nov-2026. La columna de 13:04 es la medición de Joaquín desde su máquina; la de 14:30–14:44 es propia, con `curl -L --max-time 25/30/40` desde la red del equipo. Los tiempos son de la respuesta completa, no del primer byte.

| Recurso | 13:04 (Joaquín) | 14:30–14:44 (Carlos) | Estado |
|---|---|---|---|
| IRSA · página de SPHEREx | 1 timeout y luego 200 en segundos | 14:31:23: 000 en 4,15 s; 14:33:44 y 14:34:14: timeout de 30 s | Intermitente |
| IRSA · TAP capabilities | 200 en menos de 1,5 s | 14:30:58: 200 en 0,25 s | Responde |
| IRSA · TAP sync (consulta simple) | TAP 200 en menos de 1,5 s (endpoint no detallado) | 14:32:44: 502 en 0,31 s; 14:32:44 y 14:33:14: timeout de 30 s | No confiable |
| IRSA · SIA DR1 (Barnard) | 200 en menos de 1,5 s | 14:30:49: 200 en 6,98 s, 239 filas; 14:44:21: 502 en 0,43 s | Responde, con fallos sueltos |
| IRSA · SIA QR3 (Barnard) | 200 en menos de 1,5 s | 14:30:56: 200 en 1,08 s, 119 filas; 14:44:22: 200 en 1,43 s | Responde |
| Tutoriales · `caltech-ipac.github.io` | más de 45 s sin respuesta | 14:31:34: timeout de 25 s | Caído desde el equipo |
| Tutoriales · repositorio GitHub | 200 | 14:31:59: 200 en 1,15 s | Responde |
| Tutoriales · `raw.githubusercontent.com` | 200 | 14:32:00: 200 en 0,27 s | Responde |
| Gaia · ESA capabilities | 200 en unos 5 s | 14:31:27: 200 en 5,86 s; 14:34:47: 200 en 5,10 s | Responde |
| Gaia · ESA TAP sync (ADQL) | no medido | 14:34:44: 400 por URL incompleta; 14:34:58: 200 en 2,67 s; 14:35:01: 200 en 3,59 s | Responde |
| Gaia · STScI | 200 | 14:31:33: 200 en 1,04 s | Responde |
| CSA · dataset NEOSSat | falla por certificado SSL | 14:32:01: 000 en 25 s (SSL) | No usable |
| CSA · página NEOSSat | responde | 14:32:26: 000 en 0,56 s | Discrepancia: hoy no responde |
| CADC | no medido | no repetido | Sin verificar hoy |
| AWS · registro SPHEREx | 200 | 14:32:26: 200 en 5,57 s | Responde |
| WiseView, MAST, JPL Horizons | 200 | no repetidos | Sin repetir hoy |

**URLs medidas:**

- IRSA SIA DR1: `https://irsa.ipac.caltech.edu/SIA?COLLECTION=spherex_dr1&POS=circle+269.4486+4.7672+0.0005&RESPONSEFORMAT=CSV`
- IRSA SIA QR3: `https://irsa.ipac.caltech.edu/SIA?COLLECTION=spherex_qr3&POS=circle+269.4486+4.7672+0.0005&RESPONSEFORMAT=CSV`
- IRSA TAP capabilities: `https://irsa.ipac.caltech.edu/TAP/capabilities`
- IRSA TAP sync: `https://irsa.ipac.caltech.edu/TAP/sync?QUERY=SELECT+TOP+1+obs_collection+FROM+ivoa.obscore&FORMAT=csv`
- IRSA página: `https://irsa.ipac.caltech.edu/Missions/spherex.html`
- Tutoriales `github.io`: `https://caltech-ipac.github.io/irsa-tutorials/spherex/`
- Tutoriales repo: `https://github.com/Caltech-IPAC/irsa-tutorials/tree/main/tutorials/spherex`
- Tutoriales raw: `https://raw.githubusercontent.com/Caltech-IPAC/irsa-tutorials/main/tutorials/spherex/spherex_cutouts.md`
- Gaia ESA capabilities: `https://gea.esac.esa.int/tap-server/tap/capabilities`
- Gaia ESA TAP sync: `https://gea.esac.esa.int/tap-server/tap/sync?REQUEST=doQuery&LANG=ADQL&QUERY=SELECT+TOP+1+source_id+FROM+gaiadr3.gaia_source&FORMAT=csv`
- Gaia STScI: `https://archive.stsci.edu/missions-and-data/gaia`
- CSA dataset: `https://data.asc-csa.gc.ca/dataset/neossat`
- CSA página: `https://www.asc-csa.gc.ca/eng/satellites/neossat/`
- AWS: `https://registry.opendata.aws/spherex-qr/`
- CADC: `https://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/en/` (no medido)

**Lectura:**

- **El recurso que a mí no me dejó fue el dominio de tutoriales.** `curl -L https://caltech-ipac.github.io/irsa-tutorials/spherex/` devolvió 000 tras 25 s (`Connection timed out after 25001 milliseconds`) a las 14:31:34 MST, desde la red del equipo (IP no registrada). IRSA también falló de forma intermitente: `502 Proxy Error` en TAP sync a las 14:32:44 y timeouts de 30 s en la página a las 14:33:44 y 14:34:14. En las reconsultas de 14:44–14:45, SIA dio 502 y un timeout sueltos, pero los reintentos devolvieron los mismos conteos. [MEDIDO: 14-nov-2026]
- **IRSA es intermitente en la página y en TAP sync, pero SIA responde.** La página falló 3 de 3 veces en la ventana de 14:31–14:34; SIA respondió 200 en 1,1–7,0 s. Para el pipeline, usar SIA o descarga directa, no la página ni TAP sync en vivo. [MEDIDO: 14-nov-2026]
- **El TAP de Gaia de la ESA se recuperó.** El 5-nov-2026 devolvió 503 con la cola síncrona llena (150 peticiones; hora no registrada). Hoy respondió 200 en 5,9 s a `capabilities` y 2,7–3,6 s a una consulta ADQL real sobre `gaiadr3.gaia_source`. Las dos mediciones quedan: 5-nov 503; 14-nov 14:34:58 y 14:35:01, 200. [MEDIDO: 5-nov y 14-nov-2026]
- **La copia de Gaia en IRSA sigue sin reverificar.** El “más de 250 s” del archivo anterior es del TAP de IRSA, no de la ESA; hoy no se repitió. [SIN VERIFICAR: 14-nov-2026]
- **El fallo de la CSA no es de NASA.** El dataset de NEOSSat falla por certificado SSL. La página también devolvió 000, aunque en 0,56 s: es un fallo de esta red, no un timeout. Joaquín la vio responder a las 13:04; las dos mediciones no coinciden y no se investigó la causa. [MEDIDO: 14-nov-2026]

---

## 4. Cobertura de SPHEREx

### 4.1 Entrada y método

- **Lista de entrada:** `docs/sprint-13-30/verdad-terreno.csv`, de la rama `Horacio`, commit `2554170` (14-nov-2026 13:18), 37 objetos, md5 `0d8cc3e4fd97914cc3d5bdf196e4ba58`. El repositorio es privado: el enlace web da 404 sin sesión y hay que usar `git`. No se copió a esta rama para no pisar la entrega de Horacio; el comando para reconstruirla está al final de esta sección.
- **Consulta:** SIA2 de IRSA, radio de 0,0005° (1,8″), colecciones `spherex_qr2`, `spherex_dr1` y `spherex_qr3`. Es el mismo radio y la misma plantilla usados en `recursos.md`.
- **Plantilla:** `https://irsa.ipac.caltech.edu/SIA?COLLECTION=<coleccion>&POS=circle+<RA>+<Dec>+0.0005&RESPONSEFORMAT=CSV`
- **Temporada:** bloque de fechas de observación separado por más de **60 días** del siguiente. Se calcula sobre la unión de las fechas de DR1 y QR3, redondeadas a 1e-4 día para no contar dos veces la misma exposición reprocesada. Las temporadas por colección también están en el CSV (`temporadas_dr1`, `temporadas_qr3`).
- **Ventana:** consultas iniciadas entre 14:22:26 y 14:23:13 MST; reintentos hasta 14:24:53. Cada fila del CSV lleva la hora del primer intento; [`consultas.json`](consultas.json) guarda los 133 intentos con URL, HTTP, filas, segundos y error.
- **Errores:** una consulta que falla se deja vacía, no en 0. El 0 significaría “la colección no tiene imágenes de ese objeto”; vacío significa “no se pudo verificar”. Al final quedó **1 celda sin verificar de 111** (37 objetos × 3 colecciones): QR2 de WISE J0350-5658, por error de red.
- **Script:** [`cobertura.py`](cobertura.py), escrito para este sprint, solo biblioteca estándar, sin nada del proyecto anterior.

**Sobre QR2.** Respondió **0 filas en 36 de 37 objetos** y falló por red en el restante. Ese 0 no significa que no existan archivos: QR2 ya no se indexa para búsqueda y solo se descarga hasta febrero de 2027. [VERIFICADO: [data releases](https://github.com/Caltech-IPAC/spherex-archive-documentation/blob/main/documentation/spherex_data_releases.md)] Además, en pruebas sueltas QR2 dio 502 y timeouts, así que tampoco es un endpoint estable.

### 4.2 Validación con los cinco objetivos del reto

Se repitieron las consultas con las coordenadas documentadas en `recursos.md` y, por separado, con las de la lista de Horacio. La diferencia importa en R Draconis.

| Objetivo | Coordenadas de la lista | DR1 | QR3 | Total | Temporadas | Comparación con `recursos.md` |
|---|---|---:|---:|---:|---:|---|
| Barnard's Star | 269,4486 / +4,7672 | 239 | 119 | 358 | 3 | 363 antes; −5 (−1,4 %). Mismas coordenadas |
| ε Indi B | 330,8404 / −56,7869 | 343 | 116 | 459 | 4 | 460 antes; −1. Con 330,84024 / −56,78598 da 344 + 116 = 460, exacto |
| WISE 0855 | 133,7951 / −7,2451 | 258 | 0 | 258 | 3 | 258 antes, exacto |
| RW Aurigae | 76,9535 / +30,4015 | 226 | 109 | 335 | 3 | 335 antes, exacto |
| R Draconis | 248,3308 / +66,7028 | 433 | 123 | 556 | 3 | 539 antes; +17. Con 248,1675 / +66,754972 da 413 + 126 = 539, exacto |

- **4 de 5 reproducen exacto** (ε Indi B, WISE 0855, RW Aur y R Dra) cuando se usan las coordenadas de `recursos.md`; la quinta, Barnard, difiere en 5 imágenes. El método es el mismo; no hay un error de conteo.
- **Barnard difiere en 5 imágenes** (239/119 hoy frente a 240/123 antes). Es un 1,4 % y no cambia ninguna conclusión. La causa no se investigó. [SIN VERIFICAR]
- **La coordenada de R Draconis de la lista está a ~5,0′ de SIMBAD.** SIMBAD da 16h 32m 40,227s, +66° 45′ 17,926″ (J2000), es decir 248,1676 / +66,7550 en grados; la lista trae 248,3308 / +66,7028. No es redondeo: es otra posición. Con la posición de SIMBAD salen 413 + 126 = 539, que es la cifra que ya tenía `recursos.md`. Hay que corregir esa fila de `verdad-terreno.csv`. [VERIFICADO: [SIMBAD R Dra](https://simbad.harvard.edu/simbad/sim-id?Ident=R+Dra), espejo de Harvard; CDS no responde desde esta red]
- RW Aur tiene un corrimiento de 8,7″ y ε Indi B de 3,3″, pero los conteos no cambian. [MEDIDO: diferencia de coordenadas y consultas del 14-nov-2026]

### 4.3 Resultado

| Métrica | Valor |
|---|---|
| Objetos en la lista | 37 |
| Objetos con cobertura en DR1 | 37 de 37 |
| Objetos con cobertura en QR3 | 35 de 37 (sin QR3: WISE 0855 y Procyon B) |
| Imágenes por objeto | 221 a 858 |
| Objetos con 4 temporadas | 3: ε Indi B, Gliese 725 A, Chi Cygni |
| Objetos con 3 temporadas | 32 |
| Objetos con 2 temporadas | 1: Procyon B |
| Objetos con 1 temporada | 1: Gliese 687 |
| Rango temporal global | 2025-04-24 a 2026-10-04 |
| Objetos con al menos 2 temporadas | **36 de 37** |

- **Todos tienen más de 200 imágenes y más de 6 meses de línea base.** El mínimo es Procyon B con 221 imágenes (2025-10-09 a 2026-04-15); el máximo es Gliese 687 con 858 (2025-05-13 a 2026-10-04).
- **Las temporadas no son épocas.** Una temporada puede tener decenas de imágenes; para el flipbook se elige una coadd o un cuadro por temporada, no las 300. El conteo de imágenes es el que devuelve SIA (una fila por imagen de detector que cubre la posición), no el número de visitas independientes.
- **`cobertura.csv` tiene las 37 filas** con objeto, RA, Dec, imágenes en QR2, QR3, temporadas, fecha y hora, más DR1, total y las temporadas por colección. Ahí están las cifras que no se repiten en esta tabla.

### 4.4 Excepciones y avisos

- **Gliese 687:** 858 imágenes, 293 en QR3 y 565 en DR1, sin huecos de más de 60 días. La cifra de “1 temporada” es correcta con la definición, pero no significa una sola época: hay 17 meses de cobertura continua. Es el mejor objeto de la lista para una curva de luz, no el peor.
- **WISE 0855:** QR3 = 0. Su serie está en DR1 y termina el 2026-05-14; tiene 3 temporadas, pero el demo no debe prometer una campaña de 2026 para este objeto. [MEDIDO: 14-nov-2026]
- **Procyon B:** QR3 = 0 y solo 2 temporadas; 221 imágenes, el mínimo. Suficiente, pero es el objeto más justo de la lista.
- **Lacaille 8760:** solo 8 imágenes en QR3, pero 285 en DR1 y 3 temporadas. No es un problema.
- **Wolf 359 (40 en QR3) y Lalande 21185 (30 en QR3):** pocas en QR3, muchas en DR1; 3 temporadas cada uno.
- **WISE J0350-5658:** única celda sin verificar (QR2, error de red). QR2 no se usa, así que no afecta.
- **Las colecciones *deep* no se consultaron.** El CSV es de las colecciones *wide*, igual que `recursos.md`; `qr3_deep` tardó más de 20 min en la prueba anterior y no sirve para vivo. [VERIFICADO: [`02-spherex-datos.md`](../../research/planetx/02-spherex-datos.md)]

**Para reconstruir la entrada y el CSV:**

```bash
git fetch origin Horacio
git show origin/Horacio:docs/sprint-13-30/verdad-terreno.csv > /tmp/verdad-terreno.csv
python3 docs/sprint-13-30/cobertura.py /tmp/verdad-terreno.csv docs/sprint-13-30/cobertura.csv
```

---

## 5. La cifra para decidir

**36 de 37.** Ese es el número de objetos de la lista con al menos dos temporadas separadas por más de 60 días. El único que no cumple es Gliese 687, y no por falta de datos: tiene 858 imágenes en 17 meses continuos. Si la pregunta es “¿cuántos permiten medir un vector de movimiento propio?”, la respuesta es **37 de 37**; si se exige el corte de dos temporadas, **36 de 37**. La diferencia no cambia la decisión: la lista completa sirve para el modo de movimiento.

---

## 6. Aladin Lite 3.8.2 con WCS propio

La pregunta pendiente era si Aladin Lite 3.8.2 puede cargar una imagen con su propio WCS. La respuesta corta: **sí, pero no con el cutout MEF de SPHEREx tal como lo entrega IRSA.**

### 6.1 Montaje

- Aladin Lite **3.8.2** desde el paquete npm (`dist/aladin.js`), Firefox **159.0** en modo headless y geckodriver **0.37.1**. La página de prueba es [`aladin-wcs-test.html`](aladin-wcs-test.html); se sirve por HTTP local junto con `aladin.js` y el FITS.
- **El `dist` de npm es un módulo ES.** Cargarlo con `<script src="aladin.js">` falla con `SyntaxError: export declarations may only appear at top level of a module` y luego `A is not defined`. Hay que usar `<script type="module">import A from './aladin.js'</script>`. Es la primera trampa de integración y no está en el ejemplo “vanilla” del README, que usa el `aladin.js` del CDN, no el de npm.
- Se probaron cuatro FITS: (a) un FITS sintético de 100×100 con TAN + matriz `CD` en 269,4486 / +4,7672; (b) el cutout MEF de SPHEREx de 12×12 px y 4.037.760 B, centrado en 269,4486 / +4,7672, con `size=0.02`; (c) el mismo cutout con la extensión IMAGE como HDU primaria, `CTYPE` sin `-SIP` y `PC`/`CDELT`; (d) igual que (c) pero con matriz `CD`.

Para reproducirlo:

```bash
npm pack aladin-lite@3.8.2 && tar xzf aladin-lite-3.8.2.tgz
cp package/dist/aladin.js .
curl -L -o cutout.fits "https://irsa.ipac.caltech.edu/ibe/data/spherex/qr3/level2/2026W33_2A/l2b-v27-2026-241/3/level2_2026W33_2A_0594_4D3_spx_l2b-v27-2026-241.fits?center=269.4486,4.7672&size=0.02"
python3 -m http.server 8765   # abrir http://127.0.0.1:8765/aladin-wcs-test.html
```

### 6.2 Resultados

| FITS | Estado | Posición del layer (RA / Dec) | FOV | Lectura |
|---|---|---|---|---|
| (a) TAN + CD | `fits-ok` | 269,4486 / +4,7672 | 0,0200° | Usa el WCS correctamente |
| (b) cutout MEF con SIP | `fits-ok` | 99,0668 / +83,6219 | 0,02045° | Carga, pero **mal ubicado** |
| (c) sin SIP, PC + CDELT | `fits-ok` | 269,4491 / +4,7703 | 0,02045° | Correcto |
| (d) sin SIP, CD | `fits-ok` | 269,4491 / +4,7703 | 0,02045° | Correcto |

- **El problema es el SIP.** El cutout de SPHEREx declara `RA---TAN-SIP` y `DEC--TAN-SIP` con coeficientes `A_*`/`B_*`. Aladin lo carga sin error, pero coloca la imagen en 99° / +83,6° en vez de 269,4° / +4,77°. Al quitar `-SIP` y dejar solo la parte lineal (con `PC`/`CDELT` o con `CD`), la posición coincide con el centro del recorte. No es un problema de `CD` ni de que el MEF tenga varias extensiones: es el SIP. [MEDIDO: 14-nov-2026, 14:40–14:48 MST]
- **No se midió el error angular del SIP quitado.** Para contexto y overlay es aceptable; para astrometría no. La medida se hace con el MEF original y `astropy`, no con Aladin. [INFERENCIA]

### 6.3 Qué hacer en Sparks

1. **No alimentar Aladin con el MEF crudo.** El pipeline debe producir, por cuadro, un FITS de una sola extensión con `CTYPE` TAN sin SIP y matriz `CD` (o un PNG con la WCS aparte), y ese es el que se muestra.
2. **Mantener el MEF para medir.** El recorte original conserva la ePSF, las banderas y el WCS completo; Aladin es solo contexto.
3. **Fijar la versión y cargar como módulo ES.** `3.8.2` sigue siendo la última estable; `latest` es `3.9.2-beta`. [VERIFICADO: [npm](https://registry.npmjs.org/aladin-lite)]
4. **Si se usa el cubo HiPS de DR1 como fondo**, no reemplaza a los cutouts: son 102 capas de 12,9″/px, demasiado gruesas para medir movimiento. [VERIFICADO: [data products](https://github.com/Caltech-IPAC/spherex-archive-documentation/blob/main/documentation/spherex_data_products.md)]

---

## 7. Pendientes y límites de esta entrega

- **Sin repetir a las 14:30:** CADC (no medido), WiseView, MAST y JPL Horizons (solo la medición de Joaquín a las 13:04); el TAP de Gaia en IRSA (el “más de 250 s” es del 5-nov); la causa de las 5 imágenes de diferencia de Barnard; el error angular exacto de quitar el SIP.
- **La lista de Horacio tiene una coordenada a corregir:** R Draconis, 248,3308 / +66,7028, a ~5′ de SIMBAD. Los conteos de esa fila son de esa posición; con la posición correcta son 413 + 126 = 539 y la conclusión no cambia.
- **La definición de temporada es una convención** (60 días), no una definición física. Está declarada para que se pueda repetir o cambiar; el CSV trae las temporadas por colección para recalcular.
- **El CSV no distingue visitas de imágenes.** Cuenta filas SIA, que es lo que pide la tarea. Para el flipbook hay que agrupar por `obs_id`/fecha y elegir una imagen por grupo.
- **La prueba de Aladin es de escritorio, no de móvil.** No se midió rendimiento ni memoria en un teléfono. [SIN VERIFICAR]

---

### Archivos de esta entrega

- [`cobertura.csv`](cobertura.csv): 37 objetos, 13 columnas, con fecha y hora de consulta.
- [`cobertura.py`](cobertura.py): script de consulta y cálculo de temporadas, solo biblioteca estándar.
- [`consultas.json`](consultas.json): los 133 intentos con URL, HTTP, filas, segundos y error.
- [`aladin-wcs-test.html`](aladin-wcs-test.html): página mínima de la prueba de WCS.
