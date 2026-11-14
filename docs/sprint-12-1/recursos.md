# Recursos del reto · Planet X and SPHEREx

Sprint 12-1 · rama `carlos` · 14 de noviembre de 2026.
Alcance: los ocho enlaces de la sección "Recursos del reto" de [`sprint-12-1.md`](../../sprint-12-1.md), más lo que ya teníamos en `research/planetx/`.

## Veredicto

Cuatro recursos sostienen el producto: IRSA con **DR1**, los tutoriales de SPHEREx, WiseView como modelo de interfaz y Gaia DR3 como capa de movimiento propio. Los cuatro de la CSA no entran al núcleo: NEOSSat es un telescopio apuntado de campo estrecho, no un relevamiento de todo el cielo, y no hay cobertura verificada de nuestros cinco campos.

El cambio importante respecto de nuestra investigación previa es DR1: hay un release nuevo, con cubo all-sky de 102 canales y ePSF, que reemplaza a QR2 y se usa junto con QR3. Eso vuelve obsoletas varias afirmaciones de `02-spherex-datos.md` y `04-herramientas.md`.

---

## 1. IRSA · archivo oficial de SPHEREx (prioridad alta)

Enlace del reto: <https://irsa.ipac.caltech.edu/Missions/spherex.html>

### Qué da

- Archivo oficial de la misión. SPHEREx se lanzó en marzo de 2025, opera entre 2025 y 2027, cubre 0.75–5.0 µm con seis detectores con filtro de línea variable (LVF) y apunta a un relevamiento del 100 % del cielo. <https://irsa.ipac.caltech.edu/Missions/spherex.html>
- Seis bandas por detector, 102 canales nominales en total:

| Detector | Rango (µm) | R |
|---|---|---|
| D1 | 0.75–1.09 | 39 |
| D2 | 1.10–1.62 | 41 |
| D3 | 1.63–2.41 | 41 |
| D4 | 2.42–3.82 | 35 |
| D5 | 3.83–4.41 | 112 |
| D6 | 4.42–5.00 | 128 |

Fuente: <https://irsa.ipac.caltech.edu/Missions/spherex.html> y <https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_intro.md>

### Releases: DR1 cambia el punto de partida

- Cronología: QR1 en julio de 2025; QR2 en octubre de 2025; corrección de headers de QR2 el 10 de abril de 2026; QR3 en septiembre de 2026; **DR1 en noviembre de 2026**. <https://irsa.ipac.caltech.edu/Missions/spherex.html>
- DR1 reprocesa las imágenes espectrales de QR2 y agrega un **cubo all-sky en los 102 canales nominales**. La recomendación es usar DR1 **junto con QR3**, no en lugar de QR3. <https://irsa.ipac.caltech.edu/data/SPHEREx/docs/overview_dr1.html>
- DOIs: imágenes DR1 `10.26131/IRSA678`, cubo `10.26131/IRSA679`. <https://irsa.ipac.caltech.edu/data/SPHEREx/docs/overview_dr1.html>
- Colecciones SIA vigentes: `spherex_dr1`, `spherex_dr1_deep`, `spherex_qr3`, `spherex_qr3_deep`. <https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_intro.md>
- QR3 y DR1 reemplazan a QR2; la búsqueda en IRSA ya no devuelve QR2. <https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_psf.md>

Consecuencia para nosotros: la consulta de ingesta debe pedir `spherex_dr1` + `spherex_qr3`, y la tabla de colecciones de `02-spherex-datos.md` quedó desactualizada.

### Cómo se accede

| Vía | Qué hace | Enlace |
|---|---|---|
| SIA2 | Lista imágenes por posición, banda y tiempo. Devuelve `access_url`, `cloud_access`, `s_region`, `t_min`, `t_max`, `s_pixel_scale`, `em_min`, `em_max` | <https://irsa.ipac.caltech.edu/ibe/sia.html> |
| TAP / ObsTAP | Consultas por tabla (`spherex.artifact`, `spherex.plane`), sin el rezago de la SIA | <https://irsa.ipac.caltech.edu/TAP/sync> |
| Cutouts IBE | Recorta un MEF por posición y tamaño (`center`, `size`, `gzip`) | <https://irsa.ipac.caltech.edu/ibe/cutouts.html> |
| Directorios navegables | Árbol de archivos; los datos nuevos llegan antes que a la SIA | <https://irsa.ipac.caltech.edu/ibe/data/spherex/> |
| AWS S3 | Copia en la nube, llave en `cloud_access`; útil para lectura parcial sin bajar el archivo completo | <https://registry.opendata.aws/spherex-qr/> |
| HiPS del cubo all-sky | Capa de 102 longitudes de onda para visualización | <https://irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube> |

La SIA responde en 1–3 s para las colecciones *wide*; una consulta a `spherex_qr3_deep` se colgó más de 20 minutos. Medición propia del 5 de noviembre de 2026, registrada en [`02-spherex-datos.md`](../../research/planetx/02-spherex-datos.md).

### Límites y reglas de uso

- La SIA tiene casi mil millones de registros: una consulta sin restricciones expira, los trabajos de más de 5 minutos se cancelan y para volúmenes grandes hay que usar TAP y `MAXREC`. <https://irsa.ipac.caltech.edu/ibe/sia.html>
- La SIA va ~1 día atrás de la ingesta; TAP y los directorios navegables no. <https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_intro.md>
- Los cutouts de SPHEREx no vienen comprimidos en gzip, se recortan todas las extensiones del MEF, los ejes quedan alineados a la imagen madre (no norte arriba) y la distorsión queda en el WCS. <https://irsa.ipac.caltech.edu/ibe/cutouts.html>
- El texto de agradecimiento obligatorio está en la página de la misión y en el resumen de DR1. <https://irsa.ipac.caltech.edu/Missions/spherex.html> · <https://irsa.ipac.caltech.edu/data/SPHEREx/docs/overview_dr1.html>
- No encontré una cuota publicada de peticiones por minuto para SIA ni cutouts; solo el comportamiento de timeout y cancelación descrito arriba. **Sin verificar** si existe un límite formal.

### ePSF: lo que hay que leer para centroides y espectros

- Para versiones ≥ 7.0 (QR3, DR1) la PSF es una **ePSF**: malla de 21×21 zonas (441 regiones), arreglos de 33×33, sobremuestreada 5×. Para QR1/QR2 (versiones < 7.0) sigue la PSF antigua. <https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_psf.md>
- La ePSF reemplaza a la PSF antigua en las versiones nuevas y evita el problema del header que afectaba a QR1/QR2. Los archivos corregidos de QR2 llevan `+psffix1` en `VERSION`. <https://irsa.ipac.caltech.edu/data/SPHEREx/docs/psfhdrerr.html>

### El cubo all-sky de 102 capas

- HiPS: `https://irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube`; datos en `https://irsa.ipac.caltech.edu/ibe/data/spherex/dr1/hips5_cube/hips_20261026`. <https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_hipscube.md>
- 102 capas de longitud de onda; cubo FITS de ~300 MB; extensiones `IMAGE`, `NHITS`, `FLAGS`, `SPECTRAL_CHANNELS`. <https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_hipscube.md>
- El espectro que se saca del cubo es **solo para visualización**; para ciencia hay que usar la herramienta de espectrofotometría. <https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_hipscube.md>

Esto responde la consideración C2 (mostrar las 102 bandas) sin construir un visor de cubos desde cero: se puede montar el HiPS oficial como capa y reservar nuestro desarrollo para el blink, la resta y la capa de catálogos.

### Dónde encaja en Sparks

- Ingesta por coordenadas: SIA sobre `spherex_dr1` y `spherex_qr3`; el backend guarda `obs_id`, `t_min`, detector, λ central, `VERSION` y `s_region` (C1, C9).
- Cutouts: pedir tamaño chico y descartar el cubo PSF antes de mandar nada al navegador. En QR2 medimos ~5 MB por un recorte de 18×18 px justamente por el PSF incluido; con DR1 hay que volver a medir si la ePSF viaja completa en el recorte. Medición propia en `02-spherex-datos.md`.
- 102 bandas: capa HiPS oficial para el contexto; el canal elegido se lee del cubo o se pide por SIA (C2, C3).
- Resta y suma de épocas: sobre los cutouts ya normalizados (C5).
- Actualización: si aparece `spherex_dr2`, se detecta por nombre de colección en ObsTAP y no hay que reescribir la consulta (C1).

---

## 2. Tutoriales de SPHEREx (prioridad alta)

Enlace del reto: <https://caltech-ipac.github.io/irsa-tutorials/spherex/>

Repositorio: <https://github.com/Caltech-IPAC/irsa-tutorials/tree/main/tutorials/spherex>

El índice en GitHub Pages (`caltech-ipac.github.io`) no respondió desde nuestra red durante este sprint; el contenido se verificó en el repositorio de GitHub. El sitio publicado queda **sin verificar**; el código fuente sí está verificado.

| Tutorial | Qué resuelve | Dónde lo usamos |
|---|---|---|
| [`spherex_intro.md`](https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_intro.md) | SIA con astroquery sobre DR1, abrir el MEF, extensiones, colecciones vigentes | Base de la ingesta |
| [`spherex_cutouts.md`](https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_cutouts.md) | TAP con `spherex.artifact JOIN spherex.plane` que arma URLs de cutout con `center` y `size`; descarga serial y paralela; guarda λ central y `VERSION` | Casi nuestro pipeline completo |
| [`spherex_psf.md`](https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_psf.md) | Elegir la zona correcta de PSF/ePSF; distinción por versión | Centroides, fotometría, espectros |
| [`spherex_hipscube.md`](https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_hipscube.md) | Cubo all-sky de 102 capas, descarga y lectura | Vista de 102 bandas |
| [`spherex_source_discovery_tool_demo.md`](https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_source_discovery/spherex_source_discovery_tool_demo.md) | Detección de fuentes solo con SPHEREx; ejemplo de `cloud_access` | Detector de candidatos, comparación con nuestro método |
| [`cloud-access-intro`](https://caltech-ipac.github.io/irsa-tutorials/cloud-access-intro/) | Lectura desde S3 | Si los cutouts IBE fallan |

Detalles operativos que ya están en el código de los tutoriales y conviene copiar:

- El tutorial de cutouts usa 0.01° por recorte, tarda 5–7 minutos en serie para ~700 imágenes y ~3 minutos con 10 procesos; recomienda 7–12 workers. <https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_cutouts.md>
- Sube `astropy.utils.data.conf.remote_timeout` a 120 s porque la lectura de SPHEREx excede el timeout por defecto. <https://github.com/Caltech-IPAC/irsa-tutorials/blob/main/tutorials/spherex/spherex_cutouts.md>
- El índice de canal del cubo espectral va de 0 a 18 por detector en QR3, no de 0 a 16; la definición exacta sigue **sin verificar** en [`02-spherex-datos.md`](../../research/planetx/02-spherex-datos.md).

---

## 3. WiseView (prioridad alta, como modelo)

Enlaces: <http://byw.tools/wiseview> · <https://blog.backyardworlds.org/2017/09/13/wiseview> · <https://github.com/backyardworlds/wiseview>

### Qué es

Herramienta web de flipbook para coadds unWISE W1/W2, creada para el proyecto Backyard Worlds y operada por el American Museum of Natural History; está pensada para Chrome. <http://byw.tools/wiseview>

### Qué hace bien y qué copiamos

- Entrada por RA/Dec y campo de visión en segundos de arco. Es exactamente el gesto de entrada de Sparks.
- Elección de banda (W1, W2, W1+W2), ventana deslizante de épocas, intervalo de parpadeo, zoom, mínimo y máximo de estiramiento, inversión de la escala y direcciones de escaneo separadas.
- Filtros: solo NEOWISE, saltear épocas del medio y duplicados, suavizado por dirección de escaneo.
- Superposición de **Gaia DR3** con vectores de movimiento propio.
- Imágenes de diferencia, *shift-and-add* con `pmra`/`pmdec`, inyección de objetos sintéticos para probar el detector y resta. <http://byw.tools/wiseview>
- Normalización `AsinhStretch` y comparación con PanSTARRS. <https://blog.backyardworlds.org/2017/09/13/wiseview>

Copiamos el modelo de interacción: campo de visión elegible (C6), velocidad de parpadeo, estiramiento manual con leyenda de unidades, resta A−B y contra la mediana (C5), capa Gaia con vectores (C7) e inyección sintética para validar que el blink detecta lo que debe. No copiamos su dependencia de unWISE ni su estética.

### Qué no copiamos

- Solo dos bandas W1/W2 y ningún espectro; nuestra ventaja es el cubo de 102 canales. <https://blog.backyardworlds.org/2017/09/13/wiseview>
- Depende de una arquitectura de coadds de WISE que no existe para SPHEREx; el nuestro se arma con cutouts por época.

### Licencia y cita

- Código liberado al **dominio público**, sin restricciones: <https://github.com/backyardworlds/wiseview>
- Cita: Caselden et al. 2018, ASCL `ascl:1806.004`, <https://ui.adsabs.harvard.edu/abs/2018ascl.soft06004C/abstract>

Uso recomendado: modelo de UX y de funciones, **no** dependencia de producción.

---

## 4. Gaia DR3 (prioridad alta)

Enlaces del reto: <https://archive.stsci.edu/missions-and-data/gaia> · archivo principal <https://www.cosmos.esa.int/web/gaia/dr3>

### Qué da

- DR3 se publicó el 13 de junio de 2022: 1.811.709.771 fuentes, astrometría completa para ~1.47 mil millones, posiciones, movimientos propios y paralajes, límite G ≈ 21, época de referencia 2016.0. <https://www.cosmos.esa.int/web/gaia/dr3>
- 158.152 objetos del sistema solar y variabilidad para 10.5 millones de fuentes. <https://www.cosmos.esa.int/web/gaia/dr3>
- Acceso por el archivo de la ESA y por socios (CDS, AIP, ARI, ASDC, Flatiron); STScI figura como afiliado. <https://www.cosmos.esa.int/web/gaia/data-access> · <https://archive.stsci.edu/missions-and-data/gaia>

### Por qué DR3 y no DR4

- DR4 está anunciado para el **2 de diciembre de 2026**, después del hackathon. Por eso la indicación del reto ("usar la última publicación, Data Release 3") sigue siendo correcta y no hay que cambiar de plan. <https://www.cosmos.esa.int/web/gaia/data-release-4>

### Cómo lo usamos

- Capa de catálogo con posición, `pmra`, `pmdec` y paralaje para los cinco objetivos, dibujada sobre el blink y usada para *shift-and-add* y para predecir dónde debería estar la fuente en cada época (C7).
- Cruce por cono de búsqueda de 1–2 arcmin alrededor del centro del campo.
- Para objetos que Gaia no ve (enanas cafés frías), el complemento es CatWISE2020, que ya respondió en 14 s desde nuestra red. Medición propia en [`04-herramientas.md`](../../research/planetx/04-herramientas.md).

### Límites reales

- Gaia DR3 en IRSA no respondió en 250 s y el TAP de la ESA devolvió 503 por saturación de la cola síncrona. **Hay que precalcular** los cinco campos y servir el resultado desde nuestro backend. Medición propia del 5 de noviembre de 2026, [`02-spherex-datos.md`](../../research/planetx/02-spherex-datos.md).
- La época de referencia es 2016.0: para propagar a las épocas de SPHEREx (2025–2026) hay que aplicar el movimiento propio, no usar la posición tal cual.
- Los términos exactos de la licencia de DR3 no los leí completos. **Sin verificar**; la página existe: <https://www.cosmos.esa.int/web/gaia-users/license>. Las instrucciones de crédito por release están en <https://www.cosmos.esa.int/web/gaia-users/credits>.

---

## 5. CSA: NEOSSat, CADC, tutorial y dataset (prioridad media)

### Qué son

- **NEOSSat**: microsatélite canadiense lanzado el 25 de febrero de 2013, activo; Maksutov de 15 cm, 3″/píxel, campo de visión de 0.85°. Observa asteroides, cometas, basura espacial y tránsitos de exoplanetas. Los datos son abiertos bajo la Directiva de Gobierno Abierto de Canadá y se archivan en CADC. <https://www.asc-csa.gc.ca/eng/satellites/neossat/> · <https://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/en/neossat/>
- **CADC**: archivo canadiense; aloja NEOSSat y otras colecciones. Los productos NEOSSat son RAW, CLEAN, COR y CORD en `*.fits` y `*.fits.gz`, con texto de agradecimiento obligatorio. <https://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/en/neossat/>
- **Dataset**: FITS bajo Open Government Licence – Canada, actualizado según necesidad, con enlace a CADC. El portal `data.asc-csa.gc.ca` no respondió desde nuestra red; el contenido se verificó en el espejo de Open Government, que sí respondió. <https://data.asc-csa.gc.ca/dataset/neossat> (sin verificar) · <https://open.canada.ca/data/en/dataset/9ae3e718-8b6d-40b7-8aa4-858f00e84b30>
- **Tutorial**: notebooks en Jupyter, Python 3.9+, astropy/numpy/matplotlib/pandas, descarga y visualización de FITS y preprocesamiento de NEO; licencia MIT modificada. <https://github.com/asc-csa/NEOSSAT_Tutorial>

### Veredicto

**No aportan al núcleo.** NEOSSat es un telescopio apuntado de campo estrecho (0.85°), no un relevamiento de todo el cielo, y no verificamos que haya observado nuestros cinco campos; CADC además se declara "not intended for general public use" (<https://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/en/>). Sirven como contexto y como ejemplo de seguimiento de objetos del sistema solar, no como fuente de datos de Sparks.

Lo que sí se puede tomar: el tutorial es un ejemplo limpio de lectura y visualización de FITS con astropy, y la lógica de preprocesamiento de NEO se puede citar en el pitch si alguien pregunta por seguimiento. La cobertura de los cinco campos por NEOSSat queda **sin verificar**.

---

## 6. Qué cambió y qué falta respecto de la investigación previa

| Archivo | Qué decía | Qué cambió |
|---|---|---|
| [`02-spherex-datos.md`](../../research/planetx/02-spherex-datos.md) | "Hoy hay dos releases vivos: QR2 y QR3"; sin HiPS de SPHEREx; PSF descrita como cubo 121×101×101 | **DR1 (nov-2026)** reemplaza a QR2 y se usa con QR3; existe el HiPS all-sky de 102 capas; para versiones ≥ 7.0 la PSF es ePSF (441 regiones, 33×33, 5×) |
| [`02-spherex-datos.md`](../../research/planetx/02-spherex-datos.md) | Colecciones `spherex_qr2*`, `spherex_qr3*` | Ahora `spherex_dr1`, `spherex_dr1_deep`, `spherex_qr3`, `spherex_qr3_deep`; QR2 ya no se devuelve |
| [`04-herramientas.md`](../../research/planetx/04-herramientas.md) | "el directorio de HiPS de IRSA no tiene ninguno de SPHEREx" | Falso desde DR1: hay HiPS oficial del cubo all-sky |
| [`04-herramientas.md`](../../research/planetx/04-herramientas.md) | WiseView descrito como flipbook de dos bandas | Ahora también tiene capa Gaia DR3, imágenes de diferencia, shift-and-add e inyección sintética |
| [`07-skills-y-recursos.md`](../../research/planetx/07-skills-y-recursos.md) | Lista de tutoriales sin `spherex_hipscube.md`, sin ePSF por versión y con URLs anteriores | Faltan `spherex_hipscube.md`, la distinción PSF/ePSF por versión y los nombres de colección de DR1 |
| [`01-reto-y-jueceo.md`](../../research/planetx/01-reto-y-jueceo.md) | C1 "fácil de actualizar" era una promesa; C2 requería construir la vista de 102 bandas | C1 ya está demostrado por DR1; C2 se apoya en el HiPS oficial y no en un visor propio |

Pendiente de verificar y no inventado:

- Cantidad de imágenes DR1/QR3 por cada uno de los cinco objetivos. Las consultas fallaron por timeout; los conteos de `02-spherex-datos.md` son de QR2/QR3 y no de DR1. **Sin verificar.**
- Cuota formal de peticiones de IRSA. **Sin verificar.**
- Cobertura de NEOSSat sobre los cinco campos. **Sin verificar.**

---

## 7. Tabla final

| Recurso | Qué da | Lo usamos | Por qué | Quién lo conecta |
|---|---|---|---|---|
| [IRSA · SPHEREx](https://irsa.ipac.caltech.edu/Missions/spherex.html) | Archivo oficial: imágenes espectrales, cubo all-sky de 102 canales, SIA, TAP, cutouts, S3 | **Sí** | Es la única fuente real de datos del reto; DR1 + QR3 es la base de la ingesta | Carlos define colecciones y límites; Joaquín arma el paquete de datos |
| [Tutoriales de SPHEREx](https://caltech-ipac.github.io/irsa-tutorials/spherex/) | Notebooks de SIA, cutouts, PSF/ePSF, HiPS y detección de fuentes | **Sí** | El de cutouts es casi nuestro pipeline; el de HiPS resuelve las 102 bandas | Carlos deja el recetario; Joaquín lo ejecuta |
| [WiseView](http://byw.tools/wiseview) | Flipbook maduro: FOV, blink, estiramiento, diferencia, shift-and-add, Gaia, inyección sintética | **Sí, como modelo** | Copiamos interacción y funciones, no la dependencia ni la estética | Cons copia la UX; Horacio reusa la lógica de resta y shift-and-add |
| [Gaia DR3 (STScI / ESA)](https://archive.stsci.edu/missions-and-data/gaia) | Posiciones, movimientos propios y paralajes para 1.8 mil millones de fuentes | **Sí** | Capa de movimiento propio y shift-and-add; Gaia no ve las enanas cafés más frías, ahí entra CatWISE | Horacio precalcula los cinco campos; Cons dibuja la capa |
| [NEOSSat (CSA)](https://www.asc-csa.gc.ca/eng/satellites/neossat/) | Telescopio apuntado de 0.85°, 3″/píxel, para asteroides, basura espacial y tránsitos | **No** | Campo estrecho y sin cobertura verificada de nuestros campos; no es un relevamiento de cielo | Carlos lo cita como contexto en el pitch |
| [CADC](https://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/en/) | Archivo canadiense; aloja NEOSSat y otras colecciones | **No** | No aporta datos para los cinco objetivos; además está declarado como archivo para investigación profesional | Carlos, solo como referencia |
| [Tutorial de NEOSSat](https://github.com/asc-csa/NEOSSAT_Tutorial) | Notebooks de lectura y visualización de FITS y preprocesamiento de NEO | **Quizá** | Sirve como ejemplo de código, no como fuente de datos | Horacio lo mira si necesita otro ejemplo de FITS |
| [Dataset de NEOSSat](https://data.asc-csa.gc.ca/dataset/neossat) | FITS bajo Open Government Licence – Canada, enlazado a CADC | **No** | Mismo motivo que NEOSSat: sin cobertura verificada de nuestros campos | Carlos lo deja documentado y descartado |
| HiPS del cubo all-sky (dentro de IRSA) | 102 capas de longitud de onda listas para visualizar | **Sí** | Evita construir un visor de cubos; el espectro del cubo es solo visual | Cons lo monta como capa; Carlos documenta la URL |
| CatWISE2020 (complemento, ya en el repo) | Movimientos propios en infrarrojo, incluye enanas cafés que Gaia no ve | **Sí** | Completa la capa de movimiento donde Gaia no llega | Horacio |

Regla de cierre: lo que no está verificado se dice. No hay descubrimientos, hay candidatos a revisar.
