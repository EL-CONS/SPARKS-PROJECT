# 35 de 36 objetos de la lista tienen al menos dos temporadas con cobertura SPHEREx

**Cobertura y acceso · SPHEREx · sprint 13:30 a 14:30 · sábado 14 de noviembre de 2026 · rama `carlos`**

El único objeto que queda con una sola temporada es **Gliese 687**, pero tiene 965 imágenes en 17 meses continuos (2025-04-25 a 2026-10-04): no es un objeto sin serie, es un objeto sin huecos de más de 60 días. Con la definición de temporada que se explica en la sección 4, la cifra que se pide es **35/36**; con la pregunta física de fondo (¿hay dos épocas separadas para medir movimiento?), los 36 sirven.

**Entrega:** este archivo, [`cobertura.csv`](cobertura.csv), [`cobertura.py`](cobertura.py), [`consultas.json`](consultas.json), [`aladin-wcs-test.html`](aladin-wcs-test.html) y [`entrega-horacio.md`](entrega-horacio.md).

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

Todas las filas son del 14-nov-2026. La columna de 13:04 es la medición de Joaquín desde su máquina; la de 14:30–15:20 es propia, con `curl -L --max-time 25/30/40/90` desde la red del equipo. Los tiempos son de la respuesta completa, no del primer byte. **Se conserva además la medición anterior de Gaia ESA: el 5-nov-2026 el TAP sync devolvió HTTP 503 con la cola síncrona llena; hoy responde 200 (14:34:58 y 14:35:01).**

| Recurso | 13:04 (Joaquín) | 14:30–15:20 (Carlos) | Estado |
|---|---|---|---|
| IRSA · página de SPHEREx | 1 timeout y luego 200 en segundos | 14:31:23: 000 en 4,15 s; 14:33:44 y 14:34:14: timeout de 30 s | Intermitente |
| IRSA · TAP capabilities | 200 en menos de 1,5 s | 14:30:58: 200 en 0,25 s | Responde |
| IRSA · TAP sync (consulta simple) | TAP 200 en menos de 1,5 s (endpoint no detallado) | 14:32:44: 502 en 0,31 s; 14:32:44 y 14:33:14: timeout de 30 s | No confiable |
| IRSA · SIA DR1 (Barnard) | 200 en menos de 1,5 s | 14:30:49: 200 en 6,98 s, 239 filas; 14:44:21: 502 en 0,43 s | Responde, con fallos sueltos |
| IRSA · SIA QR3 (Barnard) | 200 en menos de 1,5 s | 14:30:56: 200 en 1,08 s, 119 filas; 14:44:22: 200 en 1,43 s | Responde |
| IRSA · ruta `/SIA2` | no probado | 15:16:03: 404 en 1,21 s | La ruta que responde es `/SIA` |
| IRSA · cutout DR1 (WISE 0855) | cortes de ~4 s y ~5 MB | 15:18:34: 200, 3,85 MB, 18×18; 15:20:21: 200 en 6,73 s, 3,91 MB, 64×64; entre medio 2×503 y 1 timeout de 90 s | Responde con reintentos; el cubo PSF domina el tamaño |
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
- IRSA cutout DR1 (WISE 0855): `https://irsa.ipac.caltech.edu/ibe/data/spherex/dr1/level2/2025W19_1B/l2b-v27-2026-197/3/level2_2025W19_1B_0116_1D3_spx_l2b-v27-2026-197.fits?center=133.795129,-7.245147d&size=0.11`
- IRSA `/SIA2`: devuelve 404; usar `/SIA` (o `/SIA/query`).
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

- **Lista de entrada:** `docs/sprint-13-30/verdad-terreno.csv`, de la rama `Horacio`, commit `83c9607` (14-nov-2026 14:30), 36 objetos, md5 `7fcb394c9f201ce7987cb4956e584907`. Es la lista vigente: corrige las coordenadas de R Draconis y ε Indi B, pasa Barnard a la época J2016 y añade la columna `aislado`. El repositorio es privado: el enlace web da 404 sin sesión y hay que usar `git`. No se copió a esta rama para no pisar la entrega de Horacio; el comando para reconstruirla está al final de esta sección.
- **Consulta:** servicio SIA de IRSA, radio de 0,0005° (1,8″), colecciones `spherex_qr2`, `spherex_dr1` y `spherex_qr3`. Es el mismo radio y la misma plantilla usados en `recursos.md`. La ruta que responde es `/SIA`; `/SIA2` devuelve 404 (15:16:03).
- **Plantilla:** `https://irsa.ipac.caltech.edu/SIA?COLLECTION=<coleccion>&POS=circle+<RA>+<Dec>+0.0005&RESPONSEFORMAT=CSV`
- **Temporada:** bloque de fechas de observación separado por más de **60 días** del siguiente. Se calcula sobre la unión de las fechas de DR1 y QR3, redondeadas a 1e-4 día para no contar dos veces la misma exposición reprocesada. Las temporadas por colección también están en el CSV (`temporadas_dr1`, `temporadas_qr3`).
- **Ventana:** consultas iniciadas entre 15:56:09 y 15:56:40 MST, sin reintentos pendientes al cerrar. La hora del CSV es la de escritura del archivo (15:56:40 MST, igual en todas las filas); [`consultas.json`](consultas.json) guarda la hora de cada uno de los **109 intentos** con URL, HTTP, filas, segundos y error.
- **Errores:** una consulta que falla se deja vacía, no en 0. El 0 significaría “la colección no tiene imágenes de ese objeto”; vacío significa “no se pudo verificar”. Al final quedó **0 celdas sin verificar de 108** (36 objetos × 3 colecciones): un timeout de QR2 en SS Cygni se reintentó con éxito.
- **Estrella brillante cercana:** columna aparte `companera_brillante_10arcsec` en el CSV, además de la columna `aislado` de la lista de Horacio. No se midió la separación angular en este sprint; se usa la clasificación de la lista y el compañero conocido.
- **Script:** [`cobertura.py`](cobertura.py), escrito para este sprint, solo biblioteca estándar, sin nada del proyecto anterior.

**Sobre QR2.** Respondió **0 filas en los 36 objetos**, así que sus temporadas son 0 en todos; por eso el CSV no lleva una columna `temporadas_qr2`. Ese 0 no significa que no existan archivos: QR2 ya no se indexa para búsqueda y solo se descarga hasta febrero de 2027. [VERIFICADO: [data releases](https://github.com/Caltech-IPAC/spherex-archive-documentation/blob/main/documentation/spherex_data_releases.md)] Además, en pruebas sueltas QR2 dio 502 y timeouts, así que tampoco es un endpoint estable.

### 4.2 Validación con los cinco objetivos del reto

Se probaron primero los cinco objetivos, con las coordenadas de la lista vigente. Los cinco reproducen exacto las cifras de `recursos.md` cuando se usa la misma posición.

| Objetivo | Coordenadas de la lista | DR1 | QR3 | Total | Temporadas | Comparación con `recursos.md` |
|---|---|---:|---:|---:|---:|---|
| Barnard's Star | 269,4485 / +4,7394 (J2016) | 240 | 123 | 363 | 3 | 363 antes, exacto. La lista anterior traía +4,7672 (época 2025.7) y daba 358 |
| ε Indi B | 331,0441 / −56,7828 (J2000) | 345 | 120 | 465 | 4 | 465 antes, exacto. La lista anterior traía la posición de ε Indi A y daba 459 |
| WISE 0855 | 133,7951 / −7,2451 | 258 | 0 | 258 | 3 | 258 antes, exacto |
| RW Aurigae | 76,9561 / +30,4012 | 226 | 109 | 335 | 3 | 335 antes, exacto |
| R Draconis | 248,1674 / +66,7550 (J2016) | 413 | 126 | 539 | 3 | 539 antes, exacto. La lista anterior estaba a ~5,0′ |

- **5 de 5 reproducen exacto.** No hay diferencia de método ni de conteo; las diferencias que aparecieron con la lista anterior (`2554170`) eran de coordenadas.
- **Barnard:** la lista anterior daba 358 (239 + 119) y la actual 363 (240 + 123). No era un error de conteo: el cambio de +4,7672 (época ~2025.7) a +4,7394 (J2016) mueve el centro de la consulta ~100″ (0,028°) y el círculo de 1,8″ cae sobre una zona con cobertura distinta. Con la posición J2016 se reproduce la cifra de `recursos.md`.
- **R Draconis:** la lista anterior traía 248,3308 / +66,7028, a ~5,0′ de SIMBAD. La vigente trae 248,1674 / +66,7550, que es la posición correcta, y da 413 + 126 = 539. [VERIFICADO: [SIMBAD R Dra](https://simbad.harvard.edu/simbad/sim-id?Ident=R+Dra), espejo de Harvard; CDS no responde desde esta red]
- **ε Indi B:** la lista anterior traía 330,8404 / −56,7869, que es la posición de ε Indi A; la vigente trae 331,0441 / −56,7828 y da 345 + 120 = 465. [VERIFICADO: [SIMBAD ε Indi B](https://simbad.harvard.edu/simbad/sim-id?Ident=eps+Ind+B), espejo de Harvard]
- **WISE 0855 y RW Aur:** las posiciones cambian poco respecto a `recursos.md` y los conteos no cambian.

**Estrella brillante cercana (columna aparte).** Cuatro objetos de la lista tienen una compañera muy brillante a menos de ~10″: **Sirius B** (Sirius A), **Procyon B** (Procyon A), **Stein 2051 B** (Stein 2051 A) y **Gliese 229 B** (Gliese 229 A). En el CSV llevan `companera_brillante_10arcsec = si (<compañera>)`. **Luhman 16** y **Gliese 725 A** son binarias, pero sin una estrella muy brillante al lado: llevan `no`, con la nota del tipo de binaria. La lista de Horacio ya las marca `aislado = no`; la columna separa el caso de compañera brillante del de binaria sin estrella brillante.

### 4.3 Resultado

| Métrica | Valor |
|---|---|
| Objetos en la lista | 36 |
| Objetos con cobertura en DR1 | 36 de 36 |
| Objetos con cobertura en QR3 | 34 de 36 (sin QR3: WISE 0855 y Procyon B) |
| Imágenes por objeto | 221 a 965 |
| Objetos con 4 temporadas | 4: Chi Cygni, ε Indi B, Gliese 725 A, Lacaille 8760 |
| Objetos con 3 temporadas | 30 |
| Objetos con 2 temporadas | 1: Procyon B |
| Objetos con 1 temporada | 1: Gliese 687 |
| Rango temporal global | 2025-04-24 a 2026-10-04 |
| Objetos con al menos 2 temporadas | **35 de 36** |

- **Todos tienen más de 200 imágenes y más de 6 meses de línea base.** El mínimo es Procyon B con 221 imágenes (2025-10-09 a 2026-04-15); el máximo es Gliese 687 con 965 (2025-04-25 a 2026-10-04).
- **Las temporadas no son épocas.** Una temporada puede tener decenas de imágenes; para el flipbook se elige una coadd o un cuadro por temporada, no las 300. El conteo de imágenes es el que devuelve SIA (una fila por imagen de detector que cubre la posición), no el número de visitas independientes.
- **`cobertura.csv` tiene las 36 filas** con objeto, RA, Dec, imágenes en QR2, QR3, temporadas, `aislado`, compañera brillante, fecha y hora, más DR1, total y las temporadas por colección (15 columnas). Ahí están las cifras que no se repiten en esta tabla.

### 4.4 Excepciones y avisos

- **Gliese 687:** 965 imágenes, 273 en QR3 y 692 en DR1, sin huecos de más de 60 días. La cifra de “1 temporada” es correcta con la definición, pero no significa una sola época: hay 17 meses de cobertura continua. Es el mejor objeto de la lista para una curva de luz, no el peor.
- **WISE 0855:** QR3 = 0. Su serie está en DR1 y termina el 2026-05-14; tiene 3 temporadas, pero el demo no debe prometer una campaña de 2026 para este objeto. [MEDIDO: 14-nov-2026]
- **Procyon B:** QR3 = 0 y solo 2 temporadas; 221 imágenes, el mínimo. Tiene a Procyon A a unos 5″, así que la fotometría de la enana blanca exige cuidar el halo de la primaria. Suficiente, pero es el objeto más justo de la lista.
- **Lacaille 8760:** solo 8 imágenes en QR3, pero 331 en DR1 y 4 temporadas. No es un problema.
- **Wolf 359 (40 en QR3) y Lalande 21185 (30 en QR3):** pocas en QR3, muchas en DR1 (251 y 266); 3 temporadas cada uno.
- **Compañera brillante:** Sirius B, Procyon B, Stein 2051 B y Gliese 229 B llevan `si` en la columna aparte. Luhman 16 y Gliese 725 A son binarias, pero sin estrella muy brillante: `no`. La lista de Horacio coincide con `aislado = no` en los seis.
- **Las colecciones *deep* no se consultaron.** El CSV es de las colecciones *wide*, igual que `recursos.md`; `qr3_deep` tardó más de 20 min en la prueba anterior y no sirve para vivo. [VERIFICADO: [`02-spherex-datos.md`](../../research/planetx/02-spherex-datos.md)]

**Para reconstruir la entrada y el CSV:**

```bash
git fetch origin Horacio
git show origin/Horacio:docs/sprint-13-30/verdad-terreno.csv > /tmp/verdad-terreno.csv
python3 docs/sprint-13-30/cobertura.py /tmp/verdad-terreno.csv docs/sprint-13-30/cobertura.csv
```

---

## 5. La cifra para decidir

**35 de 36.** Ese es el número de objetos de la lista vigente con al menos dos temporadas separadas por más de 60 días. El único que no cumple es Gliese 687, y no por falta de datos: tiene 965 imágenes en 17 meses continuos. Si la pregunta es “¿cuántos permiten medir un vector de movimiento propio?”, la respuesta es **36 de 36**; si se exige el corte de dos temporadas, **35 de 36**. La diferencia no cambia la decisión: la lista completa sirve para el modo de movimiento.

---

## 6. Aladin Lite 3.8.2 con WCS propio

La pregunta pendiente era si Aladin Lite 3.8.2 puede cargar una imagen con su propio WCS. La respuesta corta: **sí, pero no con el cutout MEF de SPHEREx tal como lo entrega IRSA.**

### 6.1 Montaje

- Aladin Lite **3.8.2** desde el paquete npm (`dist/aladin.js`), Firefox **159.0** en modo headless y geckodriver **0.37.1**. La página de prueba es [`aladin-wcs-test.html`](aladin-wcs-test.html); se sirve por HTTP local junto con `aladin.js` y el FITS.
- **El `dist` de npm es un módulo ES.** Cargarlo con `<script src="aladin.js">` falla con `SyntaxError: export declarations may only appear at top level of a module` y luego `A is not defined`. Hay que usar `<script type="module">import A from './aladin.js'</script>`. Es la primera trampa de integración y no está en el ejemplo “vanilla” del README, que usa el `aladin.js` del CDN, no el de npm.
- Se probaron cuatro FITS: (a) un FITS sintético de 100×100 con TAN + matriz `CD` en 269,4486 / +4,7672; (b) el cutout MEF de SPHEREx de 12×12 px y 4.037.760 B, centrado en 269,4486 / +4,7672, con `size=0.02`; (c) el mismo cutout con la extensión IMAGE como HDU primaria, `CTYPE` sin `-SIP` y `PC`/`CDELT`; (d) igual que (c) pero con matriz `CD`. La prueba se hizo antes de la lista vigente: la posición actual de Barnard es 269,4485 / +4,7394, 0,028° al sur; el resultado de WCS no depende de esa diferencia.

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

- **Sin repetir a las 14:30:** CADC (no medido), WiseView, MAST y JPL Horizons (solo la medición de Joaquín a las 13:04); el TAP de Gaia en IRSA (el “más de 250 s” es del 5-nov); el error angular exacto de quitar el SIP.
- **La lista de Horacio ya está corregida:** el commit `83c9607` trae R Draconis en 248,1674 / +66,7550 y ε Indi B en 331,0441 / −56,7828; ya no hay que corregir esas filas. El CSV se generó con esa lista.
- **La clasificación de compañera brillante es de la lista, no una medición nueva.** No se midió la separación angular ni el contraste en este sprint; se usan `aislado` y el compañero conocido. [SIN VERIFICAR la separación exacta]
- **La definición de temporada es una convención** (60 días), no una definición física. Está declarada para que se pueda repetir o cambiar; el CSV trae las temporadas por colección para recalcular.
- **El CSV no distingue visitas de imágenes.** Cuenta filas SIA, que es lo que pide la tarea. Para el flipbook hay que agrupar por `obs_id`/fecha y elegir una imagen por grupo.
- **La prueba de Aladin es de escritorio, no de móvil.** No se midió rendimiento ni memoria en un teléfono. [SIN VERIFICAR]

---

### Archivos de esta entrega

- [`cobertura.csv`](cobertura.csv): 36 objetos, 15 columnas, con fecha y hora de consulta.
- [`cobertura.py`](cobertura.py): script de consulta y cálculo de temporadas, solo biblioteca estándar.
- [`consultas.json`](consultas.json): los 109 intentos con URL, HTTP, filas, segundos y error.
- [`aladin-wcs-test.html`](aladin-wcs-test.html): página mínima de la prueba de WCS.
- [`entrega-horacio.md`](entrega-horacio.md): cobertura de los cinco objetivos para Horacio y revisión de su acceso.
