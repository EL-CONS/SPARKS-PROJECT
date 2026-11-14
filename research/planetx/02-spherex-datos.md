# 02 · SPHEREx: datos, acceso y prueba práctica

Consulta: 2026-11-05. Las pruebas en vivo se hicieron desde la red del equipo con `curl` y un venv de Python (astropy 8.0.2, astroquery 0.4.11, pyvo 1.10.0) en `research/planetx/scratch/`. Los resultados crudos están en `scratch/coverage_summary_all.txt`, `scratch/cov_*.csv` y `scratch/cutouts/`.

## Resumen para el sábado

- SPHEREx cubre **0.75–5.0 µm** con **6 detectores** de 2040×2040 px detrás de filtros lineales variables (LVF). Cada detector se divide en **17 canales**, y 6 × 17 da las **102 bandas** del enunciado. [VERIFICADO] (archive docs, IRSA mission page; arXiv 2511.15823 vía búsqueda)
- **Hoy hay dos releases vivos: QR2 y QR3.** QR3 empezó en septiembre de 2026 y el enunciado no lo menciona. En nuestras consultas QR2 llega hasta mayo–julio de 2026 y QR3 empieza en agosto de 2026: **no se solapan en el tiempo**, así que hay que consultar las dos colecciones y unirlas. [VERIFICADO: consulta propia; la regla general es INFERENCIA]
- **Cada objetivo de prueba tiene de 224 a 536 imágenes**, agrupadas en 2 o 3 "temporadas" separadas unos 6 meses, con docenas de exposiciones por temporada. R Draconis, cerca del polo norte de la eclíptica, tiene muchas más visitas. [VERIFICADO: consulta propia]
- **Hallazgo crítico de arquitectura:** un cutout de 18×18 px pesa **~5 MB**, porque el servicio incluye el cubo PSF completo (121×101×101) sin recortarlo. Un flipbook de 300 cuadros serían ~1.5 GB si se pide así. Hay que recortar del lado del servidor y quitar el PSF antes de mandarlo al navegador. [VERIFICADO: medición propia + archive docs]
- La SIA responde en 1–3 s para las colecciones *wide*. Una consulta a `spherex_qr3_deep` se quedó colgada más de 20 min. Gaia DR3 en IRSA no respondió en 250 s y el TAP de Gaia de la ESA devolvió 503 por saturación. **Hay que precalcular.** [VERIFICADO: medición propia, 2026-11-05]

## 1. Qué es SPHEREx

| Dato | Valor | Etiqueta / fuente |
|---|---|---|
| Lanzamiento / vida | Marzo 2025; misión planeada 2025–2027 (~2 años) | [VERIFICADO] https://irsa.ipac.caltech.edu/data/SPHEREx/docs/overview_qr.html |
| Bandas (detectores) | D1 0.75–1.09 µm R=39; D2 1.10–1.62 R=41; D3 1.63–2.41 R=41; D4 2.42–3.82 R=35; D5 3.83–4.41 R=112; D6 4.42–5.00 R=128 | [VERIFICADO] https://caltech-ipac.github.io/spherex-archive-documentation/spherex-data-products |
| Óptica | Un dicroico divide el haz en dos planos focales; cada uno lleva 3 arreglos 2K×2K detrás de LVF, con la longitud de onda central variando a lo largo de un eje del detector | [VERIFICADO] misma fuente |
| Cómo forma el espectro | Repunta la nave para que una fuente caiga en distintas posiciones del LVF; cada exposición mide **una** longitud de onda por fuente y por detector | [VERIFICADO] misma fuente |
| 102 canales | Para planear el survey, cada banda se divide en 17 canales nominales (6 × 17 = 102) | [SECUNDARIO: resumen de búsqueda de arXiv 2511.15823 / 2603.25790; no leí el PDF] |
| Píxel | 6.15″ (`s_pixel_scale` en la SIA); el PSF se describe en súper-resolución 10× sobre 0.615″ | [VERIFICADO] consulta SIA propia; archive docs |
| PSF | `PSF_FWHM = 6.61″` en el header de un cutout de D6, o sea, del orden de un píxel (submuestreado) | [VERIFICADO: header propio] / [INFERENCIA: "submuestreado"] |
| Exposición | `t_exptime` mediano **113.6 s** en los 5 objetivos | [VERIFICADO: consulta propia] |
| Campo de una imagen | `s_fov = 3.485°` (~3.5°×3.5°) | [VERIFICADO: consulta propia] |
| Cadencia | Cielo completo ~cada 6 meses, 4 veces en la misión; cada píxel de 6.15″ se mide en cada uno de los 102 canales al menos 4 veces; campos profundos en los polos eclípticos (~200 deg², ~200 medidas por canal) | [SECUNDARIO: resumen de búsqueda de arXiv 2511.15823 y presentaciones; no leí el PDF] |
| Planeación | El "planning period" (p. ej. `2025W18_2B`) cubre ~3.5 días; un "large slew" tiene hasta 4 "small slews" | [VERIFICADO] archive docs |

### Cadencia real medida (no solo "cada seis meses")

Consulta SIA con `POS=circle RA Dec 0.0005` sobre `spherex_qr2` y `spherex_qr3` (2026-11-05). Las imágenes se agruparon en bloques separados por más de 3 días:

| Objetivo | QR2 (imgs / rango) | QR3 (imgs / rango) | Temporadas (bloques grandes) |
|---|---|---|---|
| WISE 0855 | 256 / 2025-05-05 → 2026-05-14 | **0** | may-2025 (30), oct–dic-2025 (126 en 4 bloques), abr–may-2026 (100 en 3 bloques) |
| Barnard's Star | 240 / 2025-08-15 → 2026-05-05 | 119 / 2026-08-16 → 2026-09-22 | ago–oct-2025 (119), mar–may-2026 (121), ago–sep-2026 (119) |
| ε Indi B | 329 / 2025-04-24 → 2026-05-04 | 120 / 2026-09-22 → 2026-10-02 (solo D2, D3, D5, D6) | abr–jun-2025 (117), sep–nov-2025 (138), abr–may-2026 (74), sep–oct-2026 (120) |
| RW Aurigae | 224 / 2025-09-01 → 2026-03-12 | 109 / 2026-09-02 → 2026-09-16 | sep-2025 (110), feb–mar-2026 (114), sep-2026 (109) |
| R Draconis | 536 / 2025-05-16 → 2026-07-16 | **0** | ~25 bloques casi continuos de mayo a julio de 2025, oct-2025 a ene-2026 y abr–jul-2026 |

Fuente: [VERIFICADO: consulta propia a https://irsa.ipac.caltech.edu/SIA, salida en `scratch/coverage_summary_all.txt`]

Lecturas:
- Un punto típico recibe **~100–130 imágenes por temporada**, repartidas en los 6 detectores durante 1–3 semanas. Cada imagen lo ve a una longitud de onda distinta. [VERIFICADO: conteo] / [INFERENCIA: lo de "longitud de onda distinta" sale del diseño LVF]
- **Para movimiento propio:** las temporadas son las épocas útiles (separación ~6 meses). **Para asteroides:** sirven las exposiciones dentro de una temporada (horas a días). [INFERENCIA]
- **Dos cuadros consecutivos casi nunca son a la misma longitud de onda.** Un flipbook ingenuo que alterna imágenes crudas mezcla cambios de color con cambios de posición. Hay que comparar el mismo detector (o el mismo canal) entre temporadas. [INFERENCIA, apoyada en el diseño LVF; un repo rival lo resuelve igual: [SECUNDARIO] https://github.com/minhaz-42/spherex-explorer]
- La ausencia de QR3 para WISE 0855 y R Dra puede ser que la temporada de otoño 2026 aún no se ingiere, o rezago de la SIA (~1 día según la doc). **Hay que volver a consultar el 13 de noviembre.** [INFERENCIA → preguntas-abiertas]
- Que ε Indi B tenga solo 4 detectores en QR3 cuadra con la doc: algunas observaciones no traen las 6 bandas porque la calidad se evalúa por banda. [VERIFICADO] archive docs

## 2. Qué datos hay hoy en IRSA

- **Releases:** QR1 (jul-2025, retirado en feb-2026), **QR2** (oct-2025, reprocesa todo QR1; headers corregidos en abr-2026), **QR3** (sep-2026). Liberación **semanal**. DOIs: QR2 10.26131/IRSA652, QR3 10.26131/IRSA662. [VERIFICADO] https://irsa.ipac.caltech.edu/data/SPHEREx/docs/overview_qr.html
- **Colecciones en ObsTAP hoy** (`ivoa.obscore`): `spherex_qr2` 1,097,080 · `spherex_qr2_cal` 74 · `spherex_qr2_deep` 270,250 · `spherex_qr3` 192,961 · `spherex_qr3_cal` 88 · `spherex_qr3_deep` 47,182 filas. [VERIFICADO: consulta propia a https://irsa.ipac.caltech.edu/TAP/sync]
- Otros productos: catálogo de hielos SPLICES, imágenes del cometa 3I/ATLAS, búsqueda de catálogos SPHEREx en Gator. [VERIFICADO] https://irsa.ipac.caltech.edu/Missions/spherex.html
- Más adelante habrá productos de nivel superior (cubos espectrales de todo el cielo; la doc de IRSA menciona 102 cubos all-sky). Hoy no están en IRSA como HiPS: el directorio de HiPS de IRSA no tiene ninguno de SPHEREx. [VERIFICADO: listado de https://irsa.ipac.caltech.edu/data/hips/ y /CDS/] / [SECUNDARIO: presentación IVOA 2025, https://wiki.ivoa.net/internal/IVOA/InterOpJune2025Plenary/SPHEREx_VO_IRSA_laity_interopMay2025.pdf]

### Estructura del MEF nivel 2 (Spectral Image)

Archivo de ~70 MB por detector y apuntado (mediana medida: 70.0 MB en QR2, 60–64 MB en QR3). [VERIFICADO: archive docs + `access_estsize`]

| HDU | Contenido |
|---|---|
| 1 `IMAGE` | Brillo superficial calibrado en MJy/sr, 2040×2040. **No** se le resta la luz zodiacal |
| 2 `FLAGS` | Bitmap de banderas por píxel (Tabla 10 del Explanatory Supplement) |
| 3 `VARIANCE` | Varianza (MJy/sr)² |
| 4 `ZODI` | Modelo de luz zodiacal (MJy/sr), sin restar |
| 5 `PSF` | Cubo 121×101×101 (malla 11×11 de zonas; súper-resolución 10×) |
| 6 `WCS-WAVE` | Tabla de búsqueda (X, Y, VALUES) que da λ central y ancho de banda por píxel; precisión ~1 nm con interpolación bilineal; pensada para visualizar |

Fuente: [VERIFICADO] https://caltech-ipac.github.io/spherex-archive-documentation/spherex-data-products

Nombre de archivo: `level2_[ObsID]D[Det]_spx_l2b-v[Ver]-[YYYY-DDD].fits`. Versiones medidas: QR2 `v20`/`v24`, QR3 `v27`. [VERIFICADO: archive docs + consulta propia]

**Banderas** (bits leídos del header `FLAGS` de un cutout real): 0 TRANSIENT, 1 OVERFLOW, 2 SUR_ERROR, 4 PHANTOM, 5 REFERENCE, 6 NONFUNC, 7 DICHROIC, 9 MISSING_DATA, 10 HOT, 11 COLD, 12 FULLSAMPLE, 14 PHANMISS, 15 NONLINEAR, 17 PERSIST, 19 OUTLIER, **21 SOURCE** (píxel asignado a una fuente conocida), **22 GHOST** (afectado por una fuente brillante dentro de la exposición). El header también trae conteos (`L2 N_OUTLIER`, `L2 N_TRANSIENT`…). [VERIFICADO: header de `scratch/cutouts/2026W20_1A_0033_1_D6.fits`]

**Calibraciones** (solo en directorios navegables, no en la SIA): ganancia absoluta, dark, dicroico (bandas 3 y 4), **ePSF** (solo QR3; reemplaza al PSF y se recomienda también para QR2), WCS espectral (`CWAVE`/`CBAND`, para ciencia), canales espectrales, SIP, plantillas de auroras, He y "shuttle glow" (QR3), crosstalk, escalado de zodi, corrección de flujo L3. [VERIFICADO] archive docs (data products y data access)

## 3. Formas de acceso

| Vía | Qué hace | ¿Nos sirve? |
|---|---|---|
| **SIA2** `https://irsa.ipac.caltech.edu/SIA?COLLECTION=spherex_qr2&POS=circle+RA+DEC+R` | Lista imágenes por posición, banda o tiempo. Devuelve `access_url`, `cloud_access` (S3), `t_min`, `energy_bandpassname` (`SPHEREx-D1`…`D6`), `s_region`, etc. | **Sí, es la base del modo en vivo.** 1–3 s por consulta *wide* [VERIFICADO: medición] |
| **ObsTAP** `https://irsa.ipac.caltech.edu/TAP/sync` (`ivoa.obscore`, `spherex.plane`, `spherex.artifact`…) | ADQL. El tutorial de cutouts arma las URLs de cutout directo en SQL con `spherex.artifact JOIN spherex.plane`. Sirve para descubrir colecciones nuevas | **Sí**: `SELECT DISTINCT obs_collection … LIKE 'spherex%'` detecta QR4 sin tocar código [VERIFICADO: consulta propia; patrón del tutorial] |
| **Cutouts IBE**: `access_url?center=RA,DEC&size=0.03` (grados por defecto; acepta `pix`, `arcmin`; `gzip=false`) | Devuelve MEF con las mismas HDU recortadas; el **PSF va completo**; el WCS-WAVE se ajusta al recorte; `CRPIX1A/2A` permite volver a coordenadas del detector | **Sí, pero hay que quitar el PSF en el servidor** (5 MB por cutout) [VERIFICADO: medición + https://irsa.ipac.caltech.edu/ibe/cutouts.html] |
| **Directorios navegables** `https://irsa.ipac.caltech.edu/ibe/data/spherex/{qr2,qr3}/…` | Árbol de archivos; los datos nuevos aparecen aquí antes que en la SIA (~1 día de rezago) | Para calibraciones (ePSF, CWAVE) [VERIFICADO] archive docs |
| **AWS S3** `s3://nasa-irsa-spherex/qr2/…` (us-east-1, Open Data) | Copia en la nube; la SIA da la llave en `cloud_access` | Útil para `Cutout2D` con lectura parcial (fsspec) sin bajar 70 MB. Por probar [VERIFICADO: campo `cloud_access`; https://registry.opendata.aws/spherex-qr/] / [INFERENCIA: lectura parcial] |
| **pyvo / astroquery** (`Irsa.query_sia(pos=…, collection='spherex_qr2')`, `Irsa.query_tap`) | Envoltorios en Python | Sí, en el backend [VERIFICADO] archive docs |
| **SPHEREx Data Explorer** `https://irsa.ipac.caltech.edu/applications/spherex` | GUI de búsqueda, vista y descarga (cutouts por script) | Referencia para validar nuestros resultados; no se incrusta [VERIFICADO] |
| **Spectrophotometry Tool** | Espectro por fotometría forzada sobre las Spectral Images | Para **validar** nuestros espectros al vuelo; se corrigió por el error de PSF (abr-2026) [VERIFICADO] mission page + psfhdrerr |
| **Mosaic Tool** | Mosaicos multi-λ a la medida | No en vivo; quizá para una imagen de portada [VERIFICADO] |
| **Source Discovery Tool** (notebook) | Detecta y caracteriza fuentes sin catálogo previo, solo con SPHEREx | Inspiración para el detector; es un notebook, no una API [VERIFICADO] mission page |
| **MOST** (Moving Object Search Tool) | Calcula la órbita de un objeto del Sistema Solar y encuentra las imágenes SPHEREx donde debió estar | Ideal para el modo "seguir un asteroide/cometa" y para la verdad de terreno del ML [VERIFICADO] mission page; API no revisada → preguntas abiertas |

## 4. Prueba práctica de cutouts (WISE 0855, D6)

- Pedí la imagen D6 más antigua (2025-05-05) y la más reciente (2026-05-11) con `size=0.03` (grados): 18×18 px, **3.7–4.3 s** y **5.06 MB** cada una. [VERIFICADO: `scratch/cut.py`]
- HDU recibidas: PRIMARY, IMAGE, FLAGS, VARIANCE, ZODI (18×18), PSF (121×101×101) y WCS-WAVE. [VERIFICADO]
- Header: `BUNIT='MJy / sr'`, `DETECTOR=6`, `MJD-AVG`, `DATE-AVG`, `CTYPE1='RA---TAN-SIP'`, `A_ORDER=3`, `CRPIX1A/2A`, `PSF_FWHM=6.61`. [VERIFICADO]
- Astropy lee el WCS espectral como WCS alterno `key='W'` (`WAVE-TAB`). En la posición de WISE 0855 da λ = **4.962 µm** y Δλ = 0.037 µm en ambas épocas: el mismo canal en las dos fechas, buena señal para comparar. [VERIFICADO]
- Astropy avisa de SIP inconsistente ("CTYPE sin -SIP") al leer el WCS alterno. Es ruido, pero confunde: hay que silenciarlo y no usar el WCS `W` para lo celeste. [VERIFICADO: warning propio]
- No intenté medir el movimiento de WISE 0855 con 18 px: el pico más brillante del cutout es una fuente vecina. La medición real queda para el sábado, con un campo más grande. [VERIFICADO: resultado propio]

## 5. Limitaciones y problemas conocidos

- **Píxel de 6.15″ y PSF de ~6.6″**: las enanas marrones cercanas se mueven ~1–2 px por año (ver `03-ciencia.md`). Se nota en un blink o en una resta (dipolo +/−), pero no como un desplazamiento obvio en un video. [VERIFICADO: escalas] / [INFERENCIA: visibilidad]
- **Error de header del PSF** en QR1/QR2 antes del 31-mar-2026: el orden de los planos venía en x pero el header decía y; hasta ±5% de error fotométrico en esquinas. Los archivos corregidos llevan `VERSION` con `+psffix1`. La ePSF de QR3 reemplaza a todo. [VERIFICADO] https://irsa.ipac.caltech.edu/data/SPHEREx/docs/psfhdrerr.html
- Convenciones de píxel: header 1-based vs Astropy 0-based; el índice del cubo PSF es `i-1`. [VERIFICADO] archive docs
- El WCS-WAVE es para visualizar; para ciencia, CWAVE/CBAND. [VERIFICADO]
- Sin resta zodiacal: hay que restar `ZODI` (o un fondo local) antes de comparar épocas. [VERIFICADO: que no viene restado] / [INFERENCIA: hay que hacerlo]
- **Latencia / servicios externos:** SIA *wide* 1–3 s, cutout ~4 s; `spherex_qr3_deep` colgada más de 20 min; Gaia DR3 en IRSA más de 250 s sin respuesta; Gaia ESA dio **503: cola síncrona llena (150)**; CatWISE en IRSA, 14 s. **Desde esta red no se llega a CDS** (SIMBAD, Sesame, alasky, aladin.cds): timeouts. [VERIFICADO: mediciones propias 2026-11-05; la causa de lo de CDS no está clara → preguntas abiertas]
- Límites de uso de IRSA: no encontré límites publicados para SIA o cutouts. [VERIFICADO: ausencia → preguntas abiertas]
- Saturación: los MEF tienen bandera `OVERFLOW` y `NONLINEAR`, pero no encontré la magnitud de saturación. Barnard, ε Indi A y R Dra son brillantes en el IR cercano. [VERIFICADO: banderas] / [INFERENCIA: riesgo de saturación → preguntas abiertas]
- "Spectral Channels" (QR3) dice que el índice de canal va de **0 a 18** por detector, no de 0 a 16. ¿Cambió la definición de canales en QR3? No está resuelto. [VERIFICADO: texto de archive docs; interpretación → preguntas abiertas]

## Fuentes de este archivo
- https://irsa.ipac.caltech.edu/Missions/spherex.html (2026-11-05)
- https://irsa.ipac.caltech.edu/data/SPHEREx/docs/overview_qr.html (2026-11-05)
- https://caltech-ipac.github.io/spherex-archive-documentation/spherex-data-products (fechado 2026-09-28)
- https://caltech-ipac.github.io/spherex-archive-documentation/spherex-data-access (fechado 2026-09-28)
- https://irsa.ipac.caltech.edu/ibe/cutouts.html
- https://irsa.ipac.caltech.edu/data/SPHEREx/docs/cutout_tool.html
- https://irsa.ipac.caltech.edu/data/SPHEREx/docs/psfhdrerr.html
- https://registry.opendata.aws/spherex-qr/ (vía búsqueda)
- https://github.com/Caltech-IPAC/irsa-tutorials/tree/main/tutorials/spherex (spherex_cutouts.md)
- arXiv 2511.15823 (pipeline, Akeson et al.) y 2603.25790: solo vía resultados de búsqueda
- Consultas propias: https://irsa.ipac.caltech.edu/SIA y https://irsa.ipac.caltech.edu/TAP/sync
