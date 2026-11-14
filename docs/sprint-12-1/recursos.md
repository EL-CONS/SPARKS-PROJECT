# Recursos del reto · Carlos

**Rama:** `carlos` · **Entrega:** `docs/sprint-12-1/recursos.md` · **Consulta:** 2026-11-14
**Alcance:** los ocho enlaces de "Recursos del reto" y los tres archivos de investigación que pidió el sprint.
**Método:** cada enlace se abrió el 14-nov-2026. Las consultas a IRSA se hicieron con `curl` y Python desde la red del equipo. Etiquetas: `[VERIFICADO]` leído en la fuente, `[MEDIDO]` consulta propia, `[INFERENCIA]` deducción, `[SIN VERIFICAR]` no se pudo comprobar.

## 0. Veredicto en cinco líneas

1. La fuente de datos es IRSA, pero la colección cambió: desde noviembre de 2026 se usa **DR1 + QR3**. DR1 reprocesa QR2; QR2 ya no se puede buscar y solo queda para descarga directa hasta febrero de 2027. [VERIFICADO: [data releases](https://github.com/Caltech-IPAC/spherex-archive-documentation/blob/main/documentation/spherex_data_releases.md)]
2. Los tutoriales de IPAC son el pipeline de referencia: SIA/TAP por coordenadas, cutouts en paralelo, `remote_timeout=120`, ePSF y λ por píxel. [VERIFICADO: [tutorial de cutouts](https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_cutouts.md)]
3. WiseView es el modelo de interacción, no una fuente de datos: blink de coadds, superposición Gaia, diferencia e inyección sintética. [VERIFICADO: [WiseView](http://byw.tools/wiseview)]
4. Gaia DR3 se usa **precalculado** para validar movimiento propio; el TAP en vivo no es confiable (el 5-nov la ESA dio 503 y el TAP de Gaia en IRSA superó los 250 s; el 14-nov la ESA respondió en 2,7 s, pero la copia de IRSA sigue sin reverificarse). [MEDIDO: [`02-spherex-datos.md`](../../research/planetx/02-spherex-datos.md) · [`cobertura-y-acceso.md`](../sprint-13-30/cobertura-y-acceso.md)]
5. Los cuatro recursos de la CSA no cambian la arquitectura: NEOSSat es óptico y apuntado, y CADC no aloja SPHEREx. [VERIFICADO: [NEOSSat](https://www.asc-csa.gc.ca/eng/satellites/neossat/) · [CADC](https://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/en/)]

---

## 1. IRSA SPHEREx (prioridad alta)

**Enlace:** [irsa.ipac.caltech.edu/Missions/spherex.html](https://irsa.ipac.caltech.edu/Missions/spherex.html)

### 1.1 Qué datos y herramientas da

- Archivo oficial de la misión: imágenes espectrales nivel 2 de 0.75–5.0 µm, 6 detectores de 2040×2040 px, 102 canales nominales y ~6.15″/px. Cada MEF pesa ~70 MB. [VERIFICADO: [data products](https://github.com/Caltech-IPAC/spherex-archive-documentation/blob/main/documentation/spherex_data_products.md)]
- **DR1** (noviembre de 2026) contiene los Surveys 1 y 2 reprocesados con la misma tubería que QR3 y añade un **cubo all-sky de 102 canales**. **QR3** contiene los Surveys 3 y 4. Juntos forman el conjunto uniforme recomendado. [VERIFICADO: [data releases](https://github.com/Caltech-IPAC/spherex-archive-documentation/blob/main/documentation/spherex_data_releases.md) · [DR1](https://irsa.ipac.caltech.edu/data/SPHEREx/docs/overview_dr1.html)]
- Servicios: SIA2, ObsTAP/TAP, cutouts IBE, S3, SPHEREx Data Explorer, Spectrophotometry Tool, Mosaic Tool, Source Discovery Tool y MOST (Moving Object Search Tool). [VERIFICADO: [página de la misión](https://irsa.ipac.caltech.edu/Missions/spherex.html)]

### 1.2 Cómo se accede

| Vía | Uso concreto | Enlace |
|---|---|---|
| SIA2 | Lista las imágenes que cubren una posición, banda o fecha. Devuelve `access_url`, `cloud_access`, `t_min`, `energy_bandpassname` (`SPHEREx-D1` a `D6`) y `s_region`. | [data access](https://github.com/Caltech-IPAC/spherex-archive-documentation/blob/main/documentation/spherex_data_access.md) |
| ObsTAP / TAP | ADQL sobre `ivoa.obscore`, `spherex.plane` y `spherex.artifact`; el tutorial de cutouts arma las URLs con `artifact JOIN plane`. También sirve para detectar una colección nueva (`spherex_dr2`) sin tocar código. | [TAP](https://irsa.ipac.caltech.edu/TAP/sync) · [tutorial](https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_cutouts.md) |
| Cutouts IBE | A la `access_url` se le añade `?center=RA,DEC&size=0.1`. El tamaño va en grados si no se indica unidad; acepta `pix`, `arcmin`, `arcsec`. | [cutouts](https://irsa.ipac.caltech.edu/ibe/cutouts.html) |
| S3 | `s3://nasa-irsa-spherex/dr1/...` en `us-east-1`; la llave viene en `cloud_access`. Sirve para leer porciones del MEF sin bajar 70 MB. | [cloud access](https://irsa.ipac.caltech.edu/cloud_access/#spherex) |
| Data Explorer / MOST | Validar resultados a mano y encontrar las imágenes donde estuvo un objeto del Sistema Solar. | [Data Explorer](https://irsa.ipac.caltech.edu/applications/spherex) · [MOST](https://irsa.ipac.caltech.edu/applications/MOST) |

**Consulta por coordenadas (la base del reto):**

```text
https://irsa.ipac.caltech.edu/SIA?COLLECTION=spherex_dr1&POS=circle+133.795129+-7.245147+0.0005&RESPONSEFORMAT=CSV
```

Para pedir el recorte de una imagen concreta:

```text
<access_url>?center=133.795129,-7.245147&size=0.03
```

El radio de 0.0005° son 1.8″; para un FOV mayor hay que subir el radio. La consulta devuelve una fila por imagen y por detector. [VERIFICADO: [SIA](https://irsa.ipac.caltech.edu/SIA) y consulta propia del 14-nov-2026]

### 1.3 Cómo se leen las banderas

Un MEF nivel 2 tiene seis extensiones. En DR1/QR3 la quinta es **EPSF**; en QR2 era **PSF**. [VERIFICADO: [data products](https://github.com/Caltech-IPAC/spherex-archive-documentation/blob/main/documentation/spherex_data_products.md) y archivo medido]

| HDU | Contenido | Qué hacer en Sparks |
|---|---|---|
| `IMAGE` | Brillo superficial calibrado en MJy/sr, 2040×2040. **No** tiene la luz zodiacal restada. | Restar `ZODI` o un fondo local antes de comparar épocas. |
| `FLAGS` | Bitmap de banderas por píxel. | Enmascarar píxeles malos y leer las banderas de la fuente. |
| `VARIANCE` | Varianza en (MJy/sr)². | Peso y barra de error. |
| `ZODI` | Modelo de luz zodiacal. | Restarlo; no viene restado. |
| `EPSF` | Tabla de ePSF efectivas, una por zona del detector (21×21 zonas en D1, D2, D4, D5, D6; 11×41 en D3), cada una de 33×33 px. En QR2 era un cubo de 121 PSF de 101×101. | Quedarse con la zona correcta en el servidor; **no** mandar la tabla completa al navegador. |
| `WCS-WAVE` | Tabla que da λ central y ancho de banda por píxel. | Leer λ para etiquetar cada cuadro y para el espectro. |

La lista vigente de banderas está en la **Tabla 16** del [Explanatory Supplement v2.1 (2026-11-10)](https://irsa.ipac.caltech.edu/data/SPHEREx/docs/SPHEREx_Expsupp.pdf). El borrador [`02-spherex-datos.md`](../../research/planetx/02-spherex-datos.md) citaba la Tabla 10; hay que corregirlo. [VERIFICADO: PDF, §3.2.5]

| Bit | Nombre | Qué significa para nosotros |
|---:|---|---|
| 0 | `TRANSIENT` | Rayo cósmico o brillo espurio; puede imitar un objeto que aparece. |
| 1 | `OVERFLOW` | Saturación; riesgo en Barnard, ε Indi A y R Dra. |
| 2 | `SUR_ERROR` | Error de procesamiento a bordo. |
| 6 | `NONFUNC` | Píxel muerto permanente. |
| 7 | `DICHROIC` | Borde del dicroico; baja transmitancia en las bandas 3 y 4. |
| 9 | `MISSING_DATA` | Dato perdido en la bajada. |
| 10 | `HOT` | Píxel caliente de esa exposición. |
| 11 | `COLD` | Píxel anormalmente frío. |
| 12 | `FULLSAMPLE` | Historial completo de lectura; no es ciencia. |
| 14 | `PHANMISS` | No se pudo corregir un píxel fantasma. |
| 15 | `NONLINEAR` | Corrección de no linealidad no confiable; excluir. |
| 17 | `PERSIST` | Carga persistente de una exposición anterior. |
| 19 | `OUTLIER` | Píxel marcado por el detector de atípicos. |
| 20 | `CROSSTALK` | Contaminación entre píxeles vecinos. |
| 21 | `SOURCE` | Píxel asignado a una fuente conocida. |
| 22 | `GHOST` | Fantasma de una fuente brillante dentro del campo. |
| 23 | `GHOST_FPA` | Fantasma de una fuente en otro detector del plano focal. |
| 24 | `GHOST_EXT` | Fantasma de una fuente fuera del campo. |
| 25 | `STREAK` | Estela de un objeto en órbita terrestre. |
| 26 | `BLOOM` | Sangrado de una fuente saturada. |
| 27 | `SNOWBALL` | Evento de muchos electrones. |
| 28 | `HALO` | Halo de un transitorio. |
| 29 | `SATELLITE_HALO` | Halo de una estela de satélite. |

**Cómo leerlas en la práctica.** El header de `FLAGS` trae las claves `MSKNxxxx` (nombre) y `MSKMxxxx` (máscara, `1 << bit`). El decodificador debe leerlas del header en vez de escribir los bits a mano; así sigue funcionando si la tabla cambia. En el cutout medido el header trae **22** banderas y no incluye `SATELLITE_HALO` (bit 29), así que hay que tolerar claves ausentes. [MEDIDO: header de un cutout DR1/QR3 del 14-nov-2026]

Tres banderas que importan para los objetivos de prueba:

- `OVERFLOW` y `NONLINEAR`: Barnard, ε Indi A y R Dra son brillantes en el IR cercano; la saturación puede falsear el centroide. [INFERENCIA: [`03-ciencia.md`](../../research/planetx/03-ciencia.md)]
- `GHOST` y `GHOST_EXT`: ε Indi A está a ~6.7′ del par B; sus fantasmas pueden aparecer en el campo. Ojo: la Tabla 16 marca `GHOST_EXT` como "currently in development" y `GHOST_FPA` como no usado, así que la protección real hoy depende de `GHOST`. [INFERENCIA: [`03-ciencia.md`](../../research/planetx/03-ciencia.md) · Tabla 16]
- `TRANSIENT`, `PERSIST` y `OUTLIER`: son la fuente principal de falsos "movers" en una resta. [INFERENCIA: [Tabla 16](https://irsa.ipac.caltech.edu/data/SPHEREx/docs/SPHEREx_Expsupp.pdf)]

### 1.4 Reglas de uso y límites

- **Reconocimiento y DOI.** Hay que incluir el texto de reconocimiento de la misión y citar el DOI del producto: DR1 imágenes `10.26131/IRSA678`, cubo all-sky `10.26131/IRSA679`; QR3 `10.26131/IRSA662`; QR2 `10.26131/IRSA652`. [VERIFICADO: [DR1](https://irsa.ipac.caltech.edu/data/SPHEREx/docs/overview_dr1.html) · [QR](https://irsa.ipac.caltech.edu/data/SPHEREx/docs/overview_qr.html)]
- **Límites de tasa.** No encontré límites publicados para SIA2, TAP o cutouts en la documentación de IRSA. `[SIN VERIFICAR]` si existe un límite operativo. [Consultado: [IRSA APIs](https://irsa.ipac.caltech.edu/voapi.html) · [cutouts](https://irsa.ipac.caltech.edu/ibe/cutouts.html)]
- **Latencia medida.** SIA *wide*: 1–3 s. Cutout: 4–7 s. `spherex_qr3_deep`: más de 20 min (no usar en vivo). Gaia DR3 en IRSA: más de 250 s. [MEDIDO: [`02-spherex-datos.md`](../../research/planetx/02-spherex-datos.md)]
- **Peso del cutout.** Un cutout de 0.01° (6×6 px) pesó **3.95 MB** en QR3 y **4.04 MB** en DR1, y tardó 6.8–7.1 s. La tabla `EPSF` es 441 filas × 8752 B ≈ 3.86 MB: **97.6 % del archivo**. Sin EPSF, el mismo cutout queda en ~95 KB. [MEDIDO: [cutout QR3](https://irsa.ipac.caltech.edu/ibe/data/spherex/qr3/level2/2026W21_2A/l2b-v27-2026-268/1/level2_2026W21_2A_0001_2D1_spx_l2b-v27-2026-268.fits?center=337.8783221,-5.1891588&size=0.01) y cutout DR1 del 14-nov-2026]
  - Consecuencia: 300 cuadros × 4 MB ≈ 1.2 GB si se manda el cutout crudo; quitando EPSF, 300 × ~0.1 MB ≈ 30 MB. El servidor debe quitar `EPSF` y quedarse solo con la zona que necesita para el centroide. [INFERENCIA: medición anterior + [`04-herramientas.md`](../../research/planetx/04-herramientas.md)]
- **Orientación.** Los ejes del cutout están alineados con la imagen madre, no con el norte; el WCS tiene distorsión SIP. Hay que reproyectar a una malla común antes de sumar o restar. [VERIFICADO: [cutouts](https://irsa.ipac.caltech.edu/ibe/cutouts.html)]
- **Luz zodiacal.** `IMAGE` no viene restada; `ZODI` es el modelo. Sin restar, la comparación entre épocas mezcla fondo con fuente. [VERIFICADO: [data products](https://github.com/Caltech-IPAC/spherex-archive-documentation/blob/main/documentation/spherex_data_products.md)]
- **QR2 retirado.** QR2 ya no se busca; sigue disponible para descarga directa hasta febrero de 2027. No empezar un pipeline nuevo con QR2. [VERIFICADO: [data releases](https://github.com/Caltech-IPAC/spherex-archive-documentation/blob/main/documentation/spherex_data_releases.md)]
- **Bug de PSF en QR2.** Los archivos QR1/QR2 anteriores al 31-mar-2026 tenían mal el header del PSF; los corregidos llevan `+psffix1`. DR1/QR3 usan ePSF. [VERIFICADO: [psfhdrerr](https://irsa.ipac.caltech.edu/data/SPHEREx/docs/psfhdrerr.html)]
- **`VERSION` engañoso en cutouts.** En el cutout QR3 medido, `VERSION` del header primario era `7.0.5` (versión del servicio), no `v27`; la versión de procesamiento está en el nombre del archivo (`l2b-v27-2026-268`). Guardar ambas y no confundirlas. [MEDIDO: header del cutout del 14-nov-2026] `[SIN VERIFICAR]` en el MEF original.
- **Rezago de SIA.** Los datos nuevos aparecen primero en los directorios navegables, en Data Explorer y en algunas consultas TAP; SIA2 se retrasa ~1 día. [VERIFICADO: [data access](https://github.com/Caltech-IPAC/spherex-archive-documentation/blob/main/documentation/spherex_data_access.md)]

### 1.5 Dónde encaja en Sparks

- **Backend de ingesta:** consultar DR1 + QR3 por SIA2 o TAP, bajar cutouts en paralelo, quitar `EPSF`, restar `ZODI`, reproyectar y hacer coadds por detector y temporada. [INFERENCIA: [`04-herramientas.md`](../../research/planetx/04-herramientas.md)]
- **Modo en vivo:** limitar FOV y número de detectores, mostrar progreso y cachear. Para los cinco objetivos, usar el paquete precalculado.
- **Capa opcional de 102 bandas:** el cubo all-sky de DR1 y su árbol HiPS de PNG permiten un fondo/portada de 102 capas; no sustituyen a los cutouts para medir movimiento. [VERIFICADO: [data products](https://github.com/Caltech-IPAC/spherex-archive-documentation/blob/main/documentation/spherex_data_products.md) · [tutorial HiPS](https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_hipscube.md)]

---

## 2. Tutoriales de SPHEREx (prioridad alta)

**Enlace:** [Caltech-IPAC/irsa-tutorials · tutorials/spherex](https://github.com/Caltech-IPAC/irsa-tutorials/tree/main/tutorials/spherex) · **Archivos:** [spherex_intro.md](https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_intro.md) · [spherex_cutouts.md](https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_cutouts.md) · [spherex_psf.md](https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_psf.md) · [spherex_mosaic.md](https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_mosaic.md) · [spherex_hipscube.md](https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_hipscube.md) · [spherex.md](https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex.md) · [spherex_source_discovery](https://github.com/Caltech-IPAC/irsa-tutorials/tree/main/tutorials/spherex/spherex_source_discovery)

### 2.1 Qué dan

- Siete notebooks: introducción, cutouts, PSF/ePSF, Source Discovery Tool, mosaicos, cubos HiPS y el índice general. [VERIFICADO: [listado del repo](https://github.com/Caltech-IPAC/irsa-tutorials/tree/main/tutorials/spherex)]
- El de **cutouts** es el más útil: hace la consulta TAP `spherex.artifact JOIN spherex.plane`, arma la URL con `center` y `size`, descarga en serie o en paralelo y guarda la λ central y la versión de cada cuadro. Reporta ~5–7 min para 700 imágenes de 0.01°. [VERIFICADO: [spherex_cutouts.md](https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_cutouts.md)]
- El de **introducción** usa las colecciones `spherex_dr1` y `spherex_qr3` y sube `astropy.utils.data.conf.remote_timeout = 120`. [VERIFICADO: [spherex_intro.md](https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_intro.md)]
- El de **PSF** explica cómo elegir la ePSF correcta y qué hacer con QR2. [VERIFICADO: [spherex_psf.md](https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_psf.md)]
- El de **HiPS** abre el cubo all-sky de DR1 (102 capas) en Firefly. [VERIFICADO: [spherex_hipscube.md](https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_hipscube.md)]

### 2.2 Cómo se accede

- Clonar el repo y ejecutar en Jupyter con `astropy`, `astroquery`, `pyvo`, `numpy` y `matplotlib`. [VERIFICADO: [repo](https://github.com/Caltech-IPAC/irsa-tutorials)]
- Licencia **BSD-3-Clause**. [VERIFICADO: [LICENSE](https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/LICENSE)]
- Las páginas renderizadas de `caltech-ipac.github.io` **no responden desde la red del equipo**: Joaquín midió más de 45 s a las 13:04 y Carlos 25 s a las 14:31 del 14-nov-2026; el dominio completo falla desde ahí. Los notebooks se leen en GitHub y en `raw.githubusercontent.com`, que responden en 0,3–1,4 s. [MEDIDO: 14-nov-2026, 13:04 y 14:31 MST]

### 2.3 Reglas de uso y límites

- Son notebooks pedagógicos, no una librería: hay celdas que descargan cientos de imágenes y tardan minutos. [VERIFICADO: [spherex_cutouts.md](https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_cutouts.md)]
- No traen un manejador de límites de tasa; solo reintentos y `cache`. [VERIFICADO: mismo notebook]
- El timeout de 120 s es necesario para SPHEREx; no es opcional. [VERIFICADO: [spherex_intro.md](https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_intro.md)]

### 2.4 Dónde encaja en Sparks

- Es la plantilla directa del pipeline de ingesta: consulta TAP, descarga paralela, λ y versión por cuadro, selección de ePSF. [INFERENCIA: [`04-herramientas.md`](../../research/planetx/04-herramientas.md)]
- **No copiar** la descarga del MEF completo al navegador; el tutorial trabaja en Python y en disco. Sparks necesita el recorte limpio y una imagen web (WebP/PNG) por cuadro.

---

## 3. WiseView (prioridad alta)

**Enlace:** [byw.tools/wiseview](http://byw.tools/wiseview)

### 3.1 Qué da

- Visor web de **flipbooks temporales** de WISE/NEOWISE (coadds unWISE), operado por el [American Museum of Natural History](https://www.amnh.org/). Es el tipo de herramienta que usa la comunidad de [Backyard Worlds](https://www.zooniverse.org/projects/marckuchner/backyard-worlds-planet-9). [VERIFICADO: pie de página de WiseView; relación con Backyard Worlds es contexto del proyecto, `[SECUNDARIO]`]
- La interfaz permite elegir RA/Dec, FOV, W1/W2/W1+W2, ventana temporal, intervalo de parpadeo, zoom, estiramiento, inversión, rango dinámico, direcciones de escaneo, solo NEOWISE, saltar épocas o ventanas duplicadas, suavizado, borde de época, superposición **Gaia DR3**, imagen de diferencia, ventana de exclusión, *shift-and-add*, `pmra`/`pmdec` y un **objeto sintético** con resta. [MEDIDO: controles visibles en la interfaz el 14-nov-2026]

### 3.2 Cómo se accede

- Aplicación web pública, sin login ni instalación; pensada para Chrome. [VERIFICADO: [WiseView](http://byw.tools/wiseview)]
- No encontré una API REST pública documentada para incrustar sus tiles o su motor de blink. `[SIN VERIFICAR]` si existe una API interna. [Consultado: la misma página]

### 3.3 Reglas de uso y límites

- Solo cubre dos bandas (W1 ~3.4 µm y W2 ~4.6 µm), sin espectro y sin SPHEREx. [VERIFICADO: [`04-herramientas.md`](../../research/planetx/04-herramientas.md)]
- Es una herramienta externa: no se debe usar como backend ni como fuente de datos para Sparks. [INFERENCIA]

### 3.4 Qué hace bien y qué copiamos

| Qué hace bien | Qué copiamos en Sparks |
|---|---|
| Pocos cuadros profundos (coadds), no cientos de exposiciones ruidosas. | Coadds por detector y temporada; el blink muestra la temporada, no cada exposición. |
| Control explícito de intervalo y velocidad de parpadeo. | Los mismos controles de transporte en el escenario de 6 paneles. |
| Superposición de Gaia DR3 y vectores de movimiento propio. | Capa de Gaia precalculada y flecha esperada vs. medida. |
| Imagen de diferencia y *shift-and-add*. | Modos resta y suma; alineación antes de restar. |
| Objeto sintético con `pmra`/`pmdec` y resta. | Inyección sintética para validar el detector y medir completitud. |
| Interfaz simple, una tarea: "¿se mueve algo?". | El usuario no debe aprender astronomía para ver el movimiento. |

[VERIFICADO: [WiseView](http://byw.tools/wiseview) · [Backyard Worlds](https://www.zooniverse.org/projects/marckuchner/backyard-worlds-planet-9)]

### 3.5 Dónde encaja en Sparks

- Referencia de UX para Cons: qué se controla, qué se muestra y qué se deja fuera.
- Referencia de validación para Joaquín/Horacio: la inyección sintética y la resta son la forma de probar que el detector no se engaña.
- Lo que Sparks añade: 6 paneles, 102 bandas, espectro al vuelo y una lista de candidatos; WiseView no tiene nada de eso. [INFERENCIA: [`04-herramientas.md`](../../research/planetx/04-herramientas.md)]

---

## 4. Gaia en STScI / Gaia DR3 (prioridad alta)

**Enlace:** [archive.stsci.edu/missions-and-data/gaia](https://archive.stsci.edu/missions-and-data/gaia)

### 4.1 Qué da

- Gaia DR3 tiene solución astrométrica completa (posición, paralaje y movimiento propio) para **1.46 mil millones** de fuentes, con época de referencia **2016.0**, en el rango G ≈ 3–21. [VERIFICADO: [ESA Gaia DR3](https://www.cosmos.esa.int/web/gaia/dr3)]
- Magnitudes G para ~1.806 mil millones; BP y RP para ~1.54 y ~1.55 mil millones. [VERIFICADO: misma página]
- Es un catálogo **óptico**: no ve bien las enanas Y ultrafrías; para eso está CatWISE en IR. [INFERENCIA: [`03-ciencia.md`](../../research/planetx/03-ciencia.md) · [`04-herramientas.md`](../../research/planetx/04-herramientas.md)]

### 4.2 Cómo se accede

- **ESA Gaia Archive TAP:** tabla `gaiadr3.gaia_source`. [VERIFICADO: [archivo ESA](https://gea.esac.esa.int/archive/)]
- **MAST:** portal, CasJobs y servicios VO. [VERIFICADO: [Gaia en STScI](https://archive.stsci.edu/missions-and-data/gaia)]
- **VizieR I/355** y, si responde, `gaia_dr3_source` en IRSA. La tabla de IRSA no se pudo verificar hoy; el 5-nov dio más de 250 s. `[SIN VERIFICAR]` [VERIFICADO: [`04-herramientas.md`](../../research/planetx/04-herramientas.md)]
- **Precálculo obligatorio:** para los cinco objetivos, guardar el cono de Gaia en un JSON local; no consultar el TAP en vivo durante el demo. [INFERENCIA: [`02-spherex-datos.md`](../../research/planetx/02-spherex-datos.md)]

### 4.3 Cómo cruzar posiciones y movimientos propios

1. **Cono:** radio = FOV/2 + μ·Δt + 2″ de margen, para incluir la fuente en la época de Gaia y en la de SPHEREx. [INFERENCIA]
2. **Columnas:** `ra`, `dec`, `pmra`, `pmdec`, `parallax`, `ref_epoch`, `ruwe`, `phot_g_mean_mag`. [VERIFICADO: [modelo de datos Gaia](https://gea.esac.esa.int/archive/documentation/GDR3/Gaia_archive/chap_datamodel/sec_dm_main_source_catalogue/ssec_dm_gaia_source.html)]
3. **Unidades:** `pmra` es μ<sub>α</sub>* = μ<sub>α</sub> cos δ, no μ<sub>α</sub>; `pmdec` es μ<sub>δ</sub>. [VERIFICADO: mismo modelo de datos]
4. **Propagar:** llevar `(ra, dec)` desde `ref_epoch` (2016.0) a la época media de SPHEREx (`MJD-AVG`, 2025–2026). Se puede hacer con `SkyCoord.apply_space_motion` o, para Δt corto, con la aproximación lineal. [VERIFICADO: [Astropy](https://docs.astropy.org/en/stable/api/astropy.coordinates.SkyCoord.html#astropy.coordinates.SkyCoord.apply_space_motion)]
5. **Comparar:** el desplazamiento esperado en píxeles es μ (″/año) × Δt (años) / 6.15″. Para Barnard, ~10.4 × 1.1 / 6.15 ≈ 1.9 px. [INFERENCIA: [`03-ciencia.md`](../../research/planetx/03-ciencia.md)]
6. **Medir:** centroide sobre coadds por temporada, no sobre un cuadro suelto; comparar la flecha medida con la esperada y reportar la barra de error. [INFERENCIA: [`03-ciencia.md`](../../research/planetx/03-ciencia.md)]
7. **Sin Gaia:** para WISE 0855 y otras enanas Y, usar CatWISE2020 (`pmra`, `pmdec`, `w1mpro`, `w2mpro`) en IRSA TAP; respondió en 14 s en la prueba del 5-nov. [VERIFICADO: [`04-herramientas.md`](../../research/planetx/04-herramientas.md)]

### 4.4 Reglas de uso y límites

- **TAP de ESA:** el 5-nov-2026 devolvió HTTP 503 con la cola síncrona llena (150 peticiones); el 14-nov-2026 respondió HTTP 200 en 2,7 s y 3,6 s. Es intermitente, no permanente. [MEDIDO: 5-nov (hora no registrada) y 14-nov 14:34:58 / 14:35:01 MST, [`cobertura-y-acceso.md`](../sprint-13-30/cobertura-y-acceso.md)]
- **Gaia en IRSA:** más de 250 s sin respuesta. [MEDIDO: [`02-spherex-datos.md`](../../research/planetx/02-spherex-datos.md)] Sigue sin reverificarse; el 14-nov se probó el TAP de ESA, no la copia de IRSA.
- **Cobertura óptica:** un objeto Y4 como WISE 0855 puede no tener contrapartida; hay que verificarlo en Gaia DR3 antes de afirmarlo. `[SIN VERIFICAR]` para el objeto concreto. [INFERENCIA: [`03-ciencia.md`](../../research/planetx/03-ciencia.md)]
- **Errores:** revisar `ruwe` y la calidad astrométrica; no todos los 1.46 mil millones tienen la misma precisión. [INFERENCIA: modelo de datos Gaia]

### 4.5 Dónde encaja en Sparks

- Capa de catálogo en el frontend (Aladin Lite o canvas propio) y validación de los vectores medidos en SPHEREx.
- Vetting de candidatos: un "mover" debe tener un vector compatible con Gaia/CatWISE o una razón para no tenerlo (por ejemplo, ser demasiado frío).
- No es la fuente del flipbook; es la verdad de terreno astrométrica. [INFERENCIA: [`04-herramientas.md`](../../research/planetx/04-herramientas.md)]

---

## 5. Recursos de la CSA (prioridad media)

| Recurso | Qué da | Acceso | Reglas y límites | Veredicto |
|---|---|---|---|---|
| [NEOSSat](https://www.asc-csa.gc.ca/eng/satellites/neossat/) | Microsatélite óptico canadiense (2013, ~800 km) para asteroides, cometas, basura espacial y tránsitos de exoplanetas. | Página institucional; datos astronómicos abiertos y archivados en CADC. | Datos según la *Directive on Open Government* de Canadá. [VERIFICADO: página CSA] | **No** para Sparks: es óptico y apuntado, no cubre los cinco objetivos ni da espectros IR. |
| [CADC](https://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/en/) | Archivo nacional canadiense: NEOSSat, JWST, Gemini, CFHT, HST, JCMT, etc. | Portal web, TAP/SIA y servicios. | Datos abiertos, pero "not intended for general public use"; no figura SPHEREx en su catálogo. [VERIFICADO: página CADC] | **No**: el archivo de SPHEREx está en IRSA, no en CADC. |
| [Tutorial NEOSSat](https://github.com/asc-csa/NEOSSAT_Tutorial) | Notebooks para descargar, filtrar y visualizar FITS de NEOSSat desde CSA/CADC; Python 3.9, `astropy`, `numpy`, `matplotlib`, `pandas`. | GitHub; Jupyter. | Repo pedagógico; GitHub declara licencia `NOASSERTION` (sin licencia estándar). [VERIFICADO: API de GitHub] | **No**: pipeline específico de otro instrumento; no se reutiliza. |
| [Dataset NEOSSat](https://data.asc-csa.gc.ca/dataset/neossat) | Imágenes astronómicas de NEOSSat, guía de FITS y enlaces a CADC. | Portal de datos abiertos de Canadá. | *Open Government Licence - Canada*; publicado el 2018-10-16. [VERIFICADO: portal] | **No**: fuera del alcance del reto de SPHEREx. |

**Veredicto, en una frase:** los cuatro recursos de la CSA no aportan datos ni funcionalidad a Sparks; son contexto institucional, porque NEOSSat observa en óptico campos apuntados y CADC no distribuye la colección de SPHEREx. [VERIFICADO: [CSA](https://www.asc-csa.gc.ca/eng/satellites/neossat/) · [CADC](https://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/en/)]

El único uso imaginable sería cruzar asteroides con [SSOIS](https://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/en/ssois/) de CADC, pero para eso ya tenemos [JPL Horizons](https://ssd.jpl.nasa.gov/horizons/) y [MOST](https://irsa.ipac.caltech.edu/applications/MOST) de IRSA, que trabajan con las posiciones de SPHEREx. No vale la pena en este sprint. [INFERENCIA]

---

## 6. Lo que ya teníamos y qué cambió

### 6.1 [`02-spherex-datos.md`](../../research/planetx/02-spherex-datos.md)

**Lo que sigue siendo correcto:** los 6 detectores, 0.75–5.0 µm, 102 canales, 6.15″/px, las seis HDUs, la necesidad de quitar el PSF/ePSF antes de mandar el cutout al navegador y la latencia de SIA/cutouts.

**Lo que cambió o falta:**

- **DR1 reemplaza a QR2.** Desde noviembre de 2026 se usa **DR1 + QR3**; QR2 ya no se busca y solo se descarga hasta febrero de 2027. El archivo decía "QR2 y QR3"; hay que actualizarlo. [VERIFICADO: [data releases](https://github.com/Caltech-IPAC/spherex-archive-documentation/blob/main/documentation/spherex_data_releases.md)]
- **EPSF, no PSF.** DR1/QR3 traen una tabla de ePSF por zonas (441 zonas en la mayoría de detectores; 33×33 px cada una), no el cubo de 121 PSF de QR2. El cutout incluye la tabla completa. [VERIFICADO: [data products](https://github.com/Caltech-IPAC/spherex-archive-documentation/blob/main/documentation/spherex_data_products.md) · [medición propia](https://irsa.ipac.caltech.edu/ibe/data/spherex/dr1/level2/2025W19_1B/l2b-v27-2026-197/3/level2_2025W19_1B_0116_1D3_spx_l2b-v27-2026-197.fits?center=133.795129,-7.245147&size=0.01)]
- **La tabla de banderas es la 16, no la 10.** La versión vigente del Explanatory Supplement es v2.1 (2026-11-10). [VERIFICADO: [PDF](https://irsa.ipac.caltech.edu/data/SPHEREx/docs/SPHEREx_Expsupp.pdf)]
- **Ya existe un cubo all-sky y un HiPS de SPHEREx.** DR1 incluye 102 canales en teselas de 512×512 px (12.9″/px) y un árbol HiPS de PNG; los canales 51 y 52 están en blanco por el dicroico. El archivo decía que no había HiPS de SPHEREx. [VERIFICADO: [data products](https://github.com/Caltech-IPAC/spherex-archive-documentation/blob/main/documentation/spherex_data_products.md) · [tutorial HiPS](https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_hipscube.md)]
- **El peso del cutout no baja con el FOV.** Un cutout de 6×6 px ya pesa ~4 MB por la tabla EPSF; el archivo hablaba de 5 MB para 18×18 px. La conclusión es la misma, pero el número y la causa cambian. [MEDIDO: cutout del 14-nov-2026]
- **R Dra en QR3 no es 0.** Con las coordenadas correctas (RA 248.1675, Dec +66.755) hay **126 imágenes** en QR3 (2026-05-16 a 2026-07-16); el 0 anterior no se reproduce. Hay que corregir la tabla. [MEDIDO: [consulta SIA](https://irsa.ipac.caltech.edu/SIA?COLLECTION=spherex_qr3&POS=circle+248.1675+66.754972+0.0005&RESPONSEFORMAT=CSV)]
- **WISE 0855 sigue sin QR3.** Su serie está en DR1 (258 imágenes, 2025-05-05 a 2026-05-14); QR3 no tiene ninguna al 14-nov. No es bloqueante, pero la última época es mayo de 2026. [MEDIDO: [consulta SIA](https://irsa.ipac.caltech.edu/SIA?COLLECTION=spherex_dr1&POS=circle+133.795129+-7.245147+0.0005&RESPONSEFORMAT=CSV)]
- **Falta:** probar lectura parcial en S3 (`fsspec`/`Cutout2D`), la API de MOST, el umbral de saturación de Barnard/R Dra y el índice de canal 0–18 que sigue ambiguo. [VERIFICADO: [`02-spherex-datos.md`](../../research/planetx/02-spherex-datos.md)]

**Datos reconsultados el 14-nov-2026.** Radio de 0.0005° (1.8″), colecciones *wide*; no se consultaron las *deep*. La consulta base fue:

```text
https://irsa.ipac.caltech.edu/SIA?COLLECTION=<coleccion>&POS=circle+<RA>+<Dec>+0.0005&RESPONSEFORMAT=CSV
```

| Objetivo | DR1: imágenes / rango | QR3: imágenes / rango | Total | Nota |
|---|---:|---:|---:|---|
| Barnard's Star | 240 / 2025-08-15 → 2026-05-05 | 123 / 2026-08-16 → 2026-09-22 | 363 | D1–D6 en ambas |
| ε Indi B | 344 / 2025-04-24 → 2026-05-04 | 116 / 2026-09-22 → 2026-10-02 | 460 | QR3 solo D2, D3, D5, D6 |
| WISE 0855 | 258 / 2025-05-05 → 2026-05-14 | 0 | 258 | QR3 vacío al 14-nov |
| RW Aurigae | 226 / 2025-09-01 → 2026-03-12 | 109 / 2026-09-02 → 2026-09-16 | 335 | D1–D6 en ambas |
| R Draconis | 413 / 2025-05-16 → 2026-05-13 | 126 / 2026-05-16 → 2026-07-16 | 539 | D1–D6 en ambas |

[MEDIDO: consulta propia del 14-nov-2026; los conteos de DR1 no son comparables 1:1 con los de QR2 del 5-nov porque cambió la colección y el reprocesamiento]

### 6.2 [`04-herramientas.md`](../../research/planetx/04-herramientas.md)

**Lo que sigue siendo correcto:** Aladin Lite `3.8.2` como versión estable, los espejos HiPS de AllWISE y 2MASS en IRSA, CatWISE2020 para vectores en IR, y la arquitectura C (precálculo + modo en vivo).

**Lo que cambió o falta:**

- Aladin Lite `3.8.2` sigue siendo la última estable; `latest` es `3.9.2-beta`. Mantener el pin. [VERIFICADO: [npm](https://registry.npmjs.org/aladin-lite)]
- **Ya hay HiPS de SPHEREx** (cubo all-sky de DR1), así que la frase "no hay HiPS de SPHEREx" quedó vieja. Se puede usar como capa de contexto, no como reemplazo de los cutouts. [VERIFICADO: [tutorial HiPS](https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_hipscube.md)]
- **Falta:** probar el cubo HiPS en Firefly/Aladin y la conectividad a CDS desde la UTH. La carga de FITS propios ya está probada: Aladin Lite 3.8.2 lee un FITS TAN con CD, pero **no respeta el WCS SIP** del cutout MEF de SPHEREx; hay que quitarle el SIP antes de mostrarlo. [MEDIDO: [`cobertura-y-acceso.md`](../sprint-13-30/cobertura-y-acceso.md)]

### 6.3 [`07-skills-y-recursos.md`](../../research/planetx/07-skills-y-recursos.md)

**Lo que sigue siendo correcto:** inventario de paquetes Python (`astropy 8.0.2`, `astroquery 0.4.11`, `pyvo 1.10.0`), paquetes por instalar (`reproject`, `photutils`, `fsspec`, `s3fs`, `fastapi`, `httpx`, `lightgbm`, `Pillow`) y mapeo de tutoriales.

**Lo que cambió o falta:**

- Hay un tutorial nuevo, `spherex_hipscube.md`, y los notebooks ya usan `spherex_dr1` + `spherex_qr3`. [VERIFICADO: [repo](https://github.com/Caltech-IPAC/irsa-tutorials/tree/main/tutorials/spherex)]
- La licencia del repo de tutoriales es **BSD-3-Clause**. [VERIFICADO: [LICENSE](https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/LICENSE)]
- El tutorial de cutouts reporta 5–7 min para 700 imágenes de 0.01°; sirve para dimensionar el precálculo. [VERIFICADO: [spherex_cutouts.md](https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_cutouts.md)]
- **Falta:** instalar las dependencias del backend, fijar `aladin-lite@3.8.2` en `package.json` y añadir al inventario las skills de UX del sprint, que no están en `07`. [VERIFICADO: [`skills-lock.json`](../../skills-lock.json) · [`sprint-12-1.md`](../../sprint-12-1.md)]

### 6.4 [`01-reto-y-jueceo.md`](../../research/planetx/01-reto-y-jueceo.md)

No cambia por los recursos, pero es la referencia para priorizar: R1–R5 son obligatorios (herramienta web, RA/Dec, video, movimiento visible, cinco objetivos) y C1–C10 son las consideraciones que el equipo decidió tratar como obligatorias. [VERIFICADO: [`01-reto-y-jueceo.md`](../../research/planetx/01-reto-y-jueceo.md)]

---

## 7. Pendientes antes de codificar

1. **Fijar la colección:** `spherex_dr1` + `spherex_qr3` en la configuración; retirar QR2 del pipeline nuevo. [VERIFICADO: [data releases](https://github.com/Caltech-IPAC/spherex-archive-documentation/blob/main/documentation/spherex_data_releases.md)]
2. **Decodificador de banderas:** leer `MSKN`/`MSKM` del header y construir la máscara; probarlo con un cutout real. [MEDIDO: header del 14-nov-2026]
3. **Quitar EPSF antes del navegador:** conservar en el servidor solo la zona necesaria para el centroide; medir el payload final. [MEDIDO: 97.6 % del cutout es EPSF]
4. **Precalcular Gaia DR3 y CatWISE** para los cinco objetivos; no depender del TAP en vivo. [MEDIDO: [`02-spherex-datos.md`](../../research/planetx/02-spherex-datos.md)]
5. **Elegir FOV y número de cuadros** con la tabla de pesos y tiempos; documentar el costo en MB y segundos. [INFERENCIA: medición propia]
6. **Verificar lo que falta:** lectura parcial en S3, API de MOST, saturación de Barnard/R Dra y el índice de canal 0–18. [VERIFICADO: [`02-spherex-datos.md`](../../research/planetx/02-spherex-datos.md)]
7. **Actualizar `02`, `04` y `07`** con DR1, EPSF, Tabla 16, HiPS y los conteos del 14-nov; este archivo deja el mapa, no reemplaza esos documentos. [INFERENCIA]

---

## 8. Tabla de decisión

| Recurso | Qué da | Lo usamos (sí/no/quizá) | Por qué | Quién lo conecta |
|---|---|---|---|---|
| [IRSA SPHEREx](https://irsa.ipac.caltech.edu/Missions/spherex.html) | Imágenes MEF nivel 2 de DR1 y QR3, SIA2, TAP, cutouts IBE, S3, cubo all-sky y MOST. | **Sí** | Es la única fuente oficial de los datos de SPHEREx y la base del flipbook. [VERIFICADO: [data access](https://github.com/Caltech-IPAC/spherex-archive-documentation/blob/main/documentation/spherex_data_access.md)] | Gabriel (datos) + Joaquín (coordinación) |
| [Tutoriales de SPHEREx](https://github.com/Caltech-IPAC/irsa-tutorials/tree/main/tutorials/spherex) | Notebooks con SIA/TAP, cutouts en paralelo, ePSF, λ y cubos HiPS. | **Sí** | Acelera el pipeline y evita errores de PSF, timeout y versiones. [VERIFICADO: [repo](https://github.com/Caltech-IPAC/irsa-tutorials/tree/main/tutorials/spherex)] | Gabriel (datos) |
| [WiseView](http://byw.tools/wiseview) | Visor web de flipbooks de WISE/NEOWISE, con Gaia, diferencia e inyección sintética. | **Sí, como referencia UX** | Es el estándar probado de ciencia ciudadana para ver movimiento por parpadeo. [VERIFICADO: [WiseView](http://byw.tools/wiseview)] | Cons (frontend) + Carlos |
| [Gaia en STScI](https://archive.stsci.edu/missions-and-data/gaia) | Catálogo DR3 con posición, paralaje y movimiento propio; época 2016.0. | **Sí, precalculado** | Valida los vectores medidos y permite vetar candidatos; en vivo no es confiable. [VERIFICADO: [ESA DR3](https://www.cosmos.esa.int/web/gaia/dr3)] | Joaquín (ciencia/ML) + Carlos (overlay) |
| [NEOSSat](https://www.asc-csa.gc.ca/eng/satellites/neossat/) | Misión óptica canadiense para asteroides, cometas, basura espacial y exoplanetas. | **No** | Es óptico y apuntado; no cubre los cinco objetivos ni aporta espectros IR. [VERIFICADO: [CSA](https://www.asc-csa.gc.ca/eng/satellites/neossat/)] | Nadie |
| [CADC](https://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/en/) | Archivo nacional canadiense con NEOSSat, JWST, Gemini, CFHT, HST, etc. | **No** | No aloja SPHEREx; el archivo oficial está en IRSA. [VERIFICADO: [CADC](https://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/en/)] | Nadie |
| [Tutorial NEOSSat](https://github.com/asc-csa/NEOSSAT_Tutorial) | Notebooks de descarga, filtrado y visualización de FITS de NEOSSat. | **No** | Pipeline específico de otro instrumento; no se reutiliza. [VERIFICADO: [repo](https://github.com/asc-csa/NEOSSAT_Tutorial)] | Nadie |
| [Dataset NEOSSat](https://data.asc-csa.gc.ca/dataset/neossat) | Imágenes y guía FITS de NEOSSat bajo licencia abierta de Canadá. | **No** | Fuera del alcance del reto de SPHEREx. [VERIFICADO: [portal](https://data.asc-csa.gc.ca/dataset/neossat)] | Nadie |
| [Astropy](https://docs.astropy.org/) + [Aladin Lite](https://github.com/cds-astro/aladin-lite) | FITS, WCS, reproyección y visualización celeste. | **Sí** | C10 del enunciado: astropy en el backend y Aladin como contexto/catálogo. [VERIFICADO: [`01-reto-y-jueceo.md`](../../research/planetx/01-reto-y-jueceo.md)] | Gabriel/Joaquín (Astropy) + Cons (Aladin) |

**Cierre:** la decisión es usar IRSA **DR1 + QR3** como única fuente de imágenes, los tutoriales como plantilla de ingesta, WiseView como referencia de interacción y Gaia/CatWISE precalculados para validar movimiento. Los recursos de la CSA se documentan como contexto y no entran en la arquitectura. [INFERENCIA basada en las fuentes enlazadas arriba]
