# Recursos del reto · Sparks

**Rama:** `carlos` · **Archivo:** `docs/sprint-12-1/recursos.md` · **Sprint:** 12-1

---
  
## 1. Prioridad alta: recursos centrales de NASA / STScI

### 1.1 IRSA SPHEREx (Archivo oficial)
* **Enlace:** https://irsa.ipac.caltech.edu/Missions/spherex.html[cite: 2, 9]
* **Qué datos o herramientas da:**
  * Archivo oficial de imágenes espectrales nivel 2 (`spherex_qr2` con 1,097,080 filas y `spherex_qr3` con 192,961 filas en `ivoa.obscore`, que no se solapan en el tiempo), calibraciones (ePSF, CWAVE/CBAND), catálogo de hielos SPLICES e imágenes del cometa 3I/ATLAS ([overview_qr.html](https://irsa.ipac.caltech.edu/data/SPHEREx/docs/overview_qr.html))[cite: 2].
  * Servicios web y APIs: SIA2 (`https://irsa.ipac.caltech.edu/SIA`), TAP/ObsTAP (`https://irsa.ipac.caltech.edu/TAP/sync`), servicio de recortes IBE (`https://irsa.ipac.caltech.edu/ibe/cutouts.html`), SPHEREx Data Explorer, Spectrophotometry Tool, Mosaic Tool, Source Discovery Tool y MOST (Moving Object Search Tool)[cite: 2].
* **Cómo se accede:**
  * **Por coordenadas (SIA2):** `GET https://irsa.ipac.caltech.edu/SIA?COLLECTION=spherex_qr2&POS=circle+RA+DEC+R` (o vía `astroquery.ipac.irsa.Irsa.query_sia` y `pyvo`)[cite: 2]. Devuelve `access_url`, `cloud_access` (llave S3), `t_min`, `energy_bandpassname` (`SPHEREx-D1` a `D6`) y `s_region`[cite: 2].
  * **Por coordenadas (ObsTAP / ADQL):** Consulta SQL contra `ivoa.obscore`, `spherex.plane` y `spherex.artifact` en `https://irsa.ipac.caltech.edu/TAP/sync` para armar URLs de recorte directo y descubrir nuevas colecciones (`SELECT DISTINCT obs_collection ... LIKE 'spherex%'`)[cite: 2].
  * **Recortes directos (IBE Cutouts):** `access_url?center=RA,DEC&size=0.03` (grados por defecto; acepta `pix`, `arcmin` y `gzip=false`)[cite: 2].
  * **S3 Open Data:** `s3://nasa-irsa-spherex/qr2/...` en `us-east-1` ([AWS Registry](https://registry.opendata.aws/spherex-qr/)) para lectura parcial con `fsspec`/`Cutout2D` sin descargar los ~70 MB del FITS completo[cite: 2].
* **Cómo se leen las banderas (`FLAGS`):**
  * Cada archivo MEF nivel 2 contiene 6 HDUs: `IMAGE` (MJy/sr, sin resta zodiacal), `FLAGS` (bitmap por píxel), `VARIANCE`, `ZODI` (modelo zodiacal), `PSF` (cubo 121×101×101) y `WCS-WAVE` ([spherex-data-products](https://caltech-ipac.github.io/spherex-archive-documentation/spherex-data-products))[cite: 2].
  * Las banderas se decodifican leyendo el bitmap de la extensión 2 (`FLAGS`) definido en la Tabla 10 del Explanatory Supplement[cite: 2]:
    * Bit `0`: `TRANSIENT` | Bit `1`: `OVERFLOW` (saturación) | Bit `2`: `SUR_ERROR` | Bit `4`: `PHANTOM` | Bit `5`: `REFERENCE` | Bit `6`: `NONFUNC` | Bit `7`: `DICHROIC` | Bit `9`: `MISSING_DATA` | Bit `10`: `HOT` | Bit `11`: `COLD` | Bit `12`: `FULLSAMPLE` | Bit `14`: `PHANMISS` | Bit `15`: `NONLINEAR` | Bit `17`: `PERSIST` | Bit `19`: `OUTLIER` | Bit `21`: `SOURCE` (píxel de fuente conocida) | Bit `22`: `GHOST` (fantasma por fuente brillante cercana)[cite: 2].
  * El header también entrega conteos agregados (`L2 N_OUTLIER`, `L2 N_TRANSIENT`)[cite: 2].
* **Reglas de uso y límites:**
  * Requiere citar los DOIs de los releases (`10.26131/IRSA652` para QR2 y `10.26131/IRSA662` para QR3) y el reconocimiento oficial de la misión ([overview_qr.html](https://irsa.ipac.caltech.edu/data/SPHEREx/docs/overview_qr.html))[cite: 1, 2].
  * Límites de tasa (rate limits) explícitos de la API SIA/IBE: **sin verificar** (no están publicados en la documentación de IRSA)[cite: 2].
  * Latencia y peso medidos: SIA *wide* responde en 1–3 s; un recorte IBE de 18×18 px tarda ~4 s y pesa **5.06 MB** porque adjunta sin recortar el cubo `PSF` completo (121×101×101); las consultas a `spherex_qr3_deep` exceden los 20 min (timeout)[cite: 2].
  * Bug conocido de PSF ([psfhdrerr.html](https://irsa.ipac.caltech.edu/data/SPHEREx/docs/psfhdrerr.html)): archivos QR1/QR2 previos al 31-mar-2026 tenían invertidos los ejes x/y del cubo PSF; usar archivos con `+psffix1` o reemplazar con la ePSF de QR3[cite: 2].
* **Dónde encaja en Sparks:** Base de datos primaria del backend (`precompute.py` y FastAPI en vivo)[cite: 8]. El servidor debe descargar los cutouts en paralelo, eliminar la HDU `PSF` antes de enviar al frontend, restar `ZODI`, reproyectar y generar coadds por detector y temporada[cite: 2, 8].

### 1.2 Tutoriales de SPHEREx (Notebooks IPAC)
* **Enlace:** https://caltech-ipac.github.io/irsa-tutorials/spherex/ (Repo: https://github.com/Caltech-IPAC/irsa-tutorials/tree/main/tutorials/spherex)[cite: 7, 9]
* **Qué datos o herramientas da:**
  * Notebooks ejecutables en Python: `spherex_intro.md` (SIA y lectura MEF), `spherex_cutouts.md` (consultas TAP `spherex.artifact JOIN spherex.plane` para construir URLs de cutout con `center` y `size` y descarga paralela), `spherex_psf.md` (selección de zona PSF/ePSF), `spherex_source_discovery` (detección sin catálogo previo y lectura `cloud_access` en S3) y `spherex_mosaic.md`[cite: 7].
* **Cómo se accede:** Descarga directa o clonación vía GitHub y ejecución en Jupyter / Python (`astropy`, `astroquery`, `pyvo`)[cite: 7].
* **Reglas de uso y límites:** Código abierto bajo términos de IPAC/Caltech ([irsa-tutorials](https://github.com/Caltech-IPAC/irsa-tutorials))[cite: 7]. En los notebooks se advierte elevar el timeout por defecto a `astropy.utils.data.conf.remote_timeout = 120` para evitar cortes en descargas de SPHEREx ([spherex-cutouts](https://caltech-ipac.github.io/irsa-tutorials/spherex-cutouts/))[cite: 7].
* **Dónde encaja en Sparks:** Plantilla directa para el pipeline de ingesta en Python (horas 1–2 del hackathon) y extracción de λ central y `VERSION` por cuadro[cite: 7].

### 1.3 WiseView
* **Enlace:** http://byw.tools/wiseview[cite: 9]
* **Qué datos o herramientas da:** Visor web interactivo creado por voluntarios de *Backyard Worlds: Planet 9* ([Backyard Worlds](https://en.wikipedia.org/wiki/Backyard_Worlds)) que genera flipbooks animados a partir de coadds temporales de WISE/NEOWISE (unWISE)[cite: 3, 4].
* **Cómo se accede:** Interfaz web pública en navegador (sin instalación ni login)[cite: 9].
* **Reglas de uso y límites:** Herramienta web de consulta interactiva; no expone una API REST pública documentada para embeber sus tiles directamente en aplicaciones de terceros (**sin verificar** existencia de API interna)[cite: 4]. Solo cubre dos bandas infrarrojas (W1 a 3.4 µm y W2 a 4.6 µm), sin información espectroscópica[cite: 3, 4].
* **Qué hace bien y qué copiamos para Sparks:**
  * *Qué hace bien:* Parpadeo rápido entre épocas con pocos cuadros profundos (coadds) en lugar de cientos de exposiciones ruidosas, control de velocidad de reproducción, ajuste de contraste/zoom sincronizado y persistencia de parámetros de vista en la URL[cite: 3, 4].
  * *Qué copiamos:* El patrón de interacción del flipbook (play/pausa, paso cuadro a cuadro, velocidad, parpadeo entre temporadas limpias y estado codificado en URL `?ra=&dec=&fov=&mode=`), superándolo al añadir **6 paneles simultáneos por detector** y **espectros de 102 canales al vuelo**[cite: 1, 8].

### 1.4 Gaia en STScI (Data Release 3)
* **Enlace:** https://archive.stsci.edu/missions-and-data/gaia[cite: 9]
* **Qué datos o herramientas da:** Catálogo astrométrico y fotométrico de alta precisión Gaia DR3 (~1.8 mil millones de fuentes en óptico): posiciones celestes (RA/Dec en época J2016.0), paralajes y vectores de movimiento propio (`pmra`, `pmdec`)[cite: 4, 9].
* **Cómo se accede:** Consultas ADQL/TAP vía STScI MAST, ESA Gaia Archive (`gaiadr3.gaia_source`), IRSA TAP (`gaia_dr3_source`) o mediante VizieR (`I/355`) desde Aladin Lite (`A.catalogFromVizieR`)[cite: 4].
* **Cómo cruzar posiciones y movimientos propios:**
  * Consultar un cono alrededor de `(RA, Dec)` del campo SPHEREx para obtener `(ra_ep2016, dec_ep2016, pmra, pmdec)`.
  * Propagar las coordenadas de Gaia desde la época de referencia J2016.0 hasta la época media de observación de SPHEREx (`MJD-AVG`, ~2025.3–2026.8) aplicando $\Delta\alpha^* = \mu_{\alpha*} \cdot \Delta t$ y $\Delta\delta = \mu_\delta \cdot \Delta t$ (con `astropy.coordinates.SkyCoord.apply_space_motion`).
  * Superponer los vectores esperados en Aladin Lite v3.8.2 ([Aladin Lite API](https://aladin.cds.unistra.fr/AladinLite/doc/API)) y comparar la flecha esperada contra el desplazamiento medido por centroide ePSF en SPHEREx[cite: 4, 8]. En objetos ultrafríos como WISE 0855, la ausencia en Gaia DR3 sirve como evidencia visual de emisión exclusivamente infrarroja[cite: 3, 8].
* **Reglas de uso y límites:** Datos públicos bajo políticas de ESA/STScI ([Gaia STScI](https://archive.stsci.edu/missions-and-data/gaia))[cite: 9]. **Límite técnico crítico verificado:** el TAP de la ESA devuelve HTTP 503 (cola síncrona llena de 150 peticiones) y la tabla `gaia_dr3_source` en IRSA hace timeout (>250 s)[cite: 2, 4]. Además, Gaia no detecta enanas marrones tipo Y muy frías en óptico[cite: 3].
* **Dónde encaja en Sparks:** Capa de catálogo en Aladin Lite y validación cruzada de vectores de movimiento propio. **Mitigación obligatoria:** precalcular los catálogos Gaia DR3 para los 5 objetivos antes del demo y complementar en IR con `catwise_2020` en IRSA TAP (que responde en 14 s y sí detecta enanas marrones)[cite: 4].

---

## 2. Prioridad media: recursos de la Agencia Espacial Canadiense (CSA)

* **NEOSSat (Misión):** https://www.asc-csa.gc.ca/eng/satellites/neossat/ — Microsatélite canadiense en órbita terrestre dedicado a rastrear asteroides cercanos (NEOs), basura espacial y exoplanetas en luz visible[cite: 9]. Acceso web informativo[cite: 9].
* **CADC (Canadian Astronomy Data Centre):** https://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/en/ — Archivo astronómico nacional de Canadá (TAP/SIA/web) que hospeda datos de misiones canadienses e internacionales (CFHT, Gemini, HST, JWST, NEOSSat), pero **no hospeda los datos de SPHEREx**[cite: 2, 9].
* **Tutorial de datos de NEOSSat:** https://github.com/asc-csa/NEOSSAT_Tutorial — Notebooks en Python para descargar y reducir imágenes FITS de NEOSSat desde CADC (licencia abierta de la CSA)[cite: 9].
* **Dataset de NEOSSat:** https://data.asc-csa.gc.ca/dataset/neossat — Portal de datos abiertos del Gobierno de Canadá con metadatos y enlaces de descarga de observaciones de NEOSSat[cite: 9].

**Veredicto sobre los recursos de la CSA:**
Ninguno de los cuatro recursos de la CSA aporta datos ni funcionalidad real a Sparks y funcionan únicamente como contexto institucional de la agencia socia del reto, porque Sparks opera exclusivamente sobre imágenes espectro-fotométricas infrarrojas (0.75–5.0 µm) de SPHEREx alojadas en IRSA/NASA y catálogos astrométricos de todo el cielo (Gaia DR3 / CatWISE2020), mientras que NEOSSat observa campos apuntados en el óptico y CADC no distribuye la colección de SPHEREx[cite: 2, 4, 8, 9].

---

## 3. Revisión de lo que ya tenemos en `research/planetx/`

Antes de escribir código se auditaron los archivos existentes del repositorio:

1. **`research/planetx/02-spherex-datos.md`**[cite: 2]
   * *Qué ya está resuelto:* Cobertura real de los 5 objetivos en QR2+QR3 (224 a 536 imágenes por objetivo), estructura exacta de las 6 HDUs del MEF nivel 2, lista completa de bits de `FLAGS`, peso de cutouts (5.06 MB por culpa del cubo PSF) y tiempos de respuesta de SIA/TAP[cite: 2].
   * *Qué cambió o falta:*
     * **Falta:** Re-consultar la SIA para verificar si ya ingresaron observaciones de otoño 2026 en `spherex_qr3` para WISE 0855 y R Draconis (el 5 de noviembre daban 0 filas en QR3)[cite: 2].
     * **Falta:** Verificar en la documentación de QR3 por qué el índice de canales espectrales (`Spectral Channels`) aparece numerado de `0 a 18` por detector en lugar de `0 a 16` (17 canales × 6 = 102 bandas)[cite: 2].
     * **Falta:** Probar en código la API de `MOST` (Moving Object Search Tool) y medir la lectura parcial por rango de bytes en S3 (`s3://nasa-irsa-spherex/`) con `fsspec`[cite: 2].
     * **Falta:** Verificar el umbral exacto de saturación (`OVERFLOW` / `NONLINEAR`) para estrellas brillantes como Barnard, ε Indi A y R Draconis[cite: 2].

2. **`research/planetx/04-herramientas.md`**[cite: 4]
   * *Qué ya está resuelto:* Versión fijada de Aladin Lite (`3.8.2` vía jsDelivr), espejos HiPS de AllWISE y 2MASS alojados en IRSA (`https://irsa.ipac.caltech.edu/data/hips/CDS/`) para evitar bloqueos de red hacia `alasky.cds.unistra.fr`, y arquitectura híbrida (estáticos precalculados + backend FastAPI)[cite: 4].
   * *Qué cambió o falta:*
     * **Falta:** Confirmar el método exacto de carga de capas FITS o imágenes con WCS propio en Aladin Lite v3.8.2 (en v2 existía `displayFITS`, pendiente validar en v3 o usar `<canvas>` sincronizado con el WCS de Aladin)[cite: 4].
     * **Falta:** Verificar la conectividad de red desde la sede (UTH) hacia `aladin.cds.unistra.fr`, `simbad.cds.unistra.fr` y `irsa.ipac.caltech.edu` (el 5 de noviembre todos los hosts de CDS daban timeout)[cite: 4].

3. **`research/planetx/07-skills-y-recursos.md`**[cite: 7]
   * *Qué ya está resuelto:* Inventario de paquetes Python (`astropy 8.0.2`, `astroquery 0.4.11`, `pyvo 1.10.0`), librerías por instalar (`reproject`, `photutils`, `fastapi`, `httpx`, `lightgbm`, `Pillow`) y mapeo de los 6 tutoriales de IRSA[cite: 7].
   * *Qué cambió o falta:*
     * **Falta:** Instalar las dependencias faltantes en el entorno de producción del backend y confirmar la versión exacta de `aladin-lite` en el `package.json` del frontend (`3.8.2`)[cite: 4, 7].

---

## 4. Tabla resumen de decisión

| Recurso | Qué da | Lo usamos (sí/no/quizá) | Por qué | Quién lo conecta |
|---|---|---|---|---|
| [IRSA SPHEREx](https://irsa.ipac.caltech.edu/Missions/spherex.html)[cite: 9] | Imágenes MEF nivel 2 (QR2+QR3), SIA2, ObsTAP, IBE cutouts, banderas `FLAGS` y S3 Open Data[cite: 2] | **Sí** | Es la única fuente oficial de los datos de SPHEREx requeridos por el reto[cite: 2, 9] | Backend / Ingesta (`precompute.py` y FastAPI)[cite: 8] |
| [Tutoriales SPHEREx](https://caltech-ipac.github.io/irsa-tutorials/spherex/)[cite: 9] | Notebooks con consultas TAP (`artifact JOIN plane`), manejo de PSF y timeouts[cite: 7] | **Sí** | Acelera la implementación de descargas paralelas y calibración PSF sin errores de ejes[cite: 2, 7] | Backend / Ingesta[cite: 7] |
| [WiseView](http://byw.tools/wiseview)[cite: 9] | Visor web de flipbooks temporales de coadds WISE/unWISE[cite: 3, 4] | **Sí** (como referencia UX) | Es el estándar probado de ciencia ciudadana para detectar objetos móviles por parpadeo[cite: 3, 4] | Frontend (`<canvas>` flipbook y controles)[cite: 8] |
| [Gaia en STScI](https://archive.stsci.edu/missions-and-data/gaia)[cite: 9] | Catálogo DR3 con posiciones, paralajes y movimientos propios (`pmra`, `pmdec`)[cite: 4, 9] | **Sí** (precalculado + CatWISE) | Valida los vectores de movimiento propio medidos y demuestra que WISE 0855 es invisible en óptico[cite: 4, 8] | Backend (precálculo) + Frontend (Aladin Lite)[cite: 4, 8] |
| [NEOSSat](https://www.asc-csa.gc.ca/eng/satellites/neossat/)[cite: 9] | Información de misión óptica canadiense de NEOs y basura espacial[cite: 9] | **No** | Opera en espectro visible para NEOs; no aporta datos infrarrojos ni cobertura de SPHEREx | Ninguno |
| [CADC](https://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/en/)[cite: 9] | Portal de datos astronómicos de Canadá[cite: 9] | **No** | Los datos de SPHEREx residen en IRSA/IPAC, no en CADC | Ninguno |
| [Tutorial NEOSSat](https://github.com/asc-csa/NEOSSAT_Tutorial)[cite: 9] | Notebooks para reducción de imágenes FITS de NEOSSat[cite: 9] | **No** | Pipeline específico para otro instrumento y formato de datos | Ninguno |
| [Dataset NEOSSat](https://data.asc-csa.gc.ca/dataset/neossat)[cite: 9] | Metadatos y archivos abiertos de NEOSSat[cite: 9] | **No** | Fuera del alcance del reto de SPHEREx | Ninguno |
