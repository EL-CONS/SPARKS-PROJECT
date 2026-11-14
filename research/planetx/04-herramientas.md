# 04 · Herramientas y arquitectura

Consulta: 2026-11-05.

## 1. Aladin Lite v3 (CDS)

- **Carga:** script v3 (CDS recomienda fijar la versión) + `A.init.then(() => { const aladin = A.aladin('#div', {...}) })`. [SECUNDARIO: resumen de búsqueda de https://aladin.cds.unistra.fr/AladinLite/doc/API y del tutorial https://aladin.cds.unistra.fr/AladinLite/doc/tutorials/interactive-finding-chart]
- **Por npm/jsDelivr:** el paquete `aladin-lite` existe. Estable más reciente **3.8.2** (2026-03-06); `latest` = 3.9.2-beta (2026-09-15). Fijar **3.8.2**. [VERIFICADO] https://registry.npmjs.org/aladin-lite · https://data.jsdelivr.com/v1/package/npm/aladin-lite
- **Catálogos:** `A.catalog(opts)` + `aladin.addCatalog(cat)`; `A.catalogFromVizieR(id, target, radio, opts, cb)`; `A.catalogHiPS(url, opts)` para catálogos progresivos. [SECUNDARIO: resumen de búsqueda de la API]
- **HiPS:** en v3 se crea una capa desde una URL o un ID de HiPS. [SECUNDARIO: misma fuente]
- **FITS propios:** la doc v2 tiene `displayFITS(url)`, que convierte en el servidor de CDS. **No confirmé el equivalente en v3** → preguntas abiertas. [SECUNDARIO] https://aladin.cds.unistra.fr/AladinLite/v2-doc/API/
  - Plan seguro [INFERENCIA]: no depender de que CDS convierta nuestros FITS. El backend genera **PNG/WebP con WCS conocido** y el frontend los muestra en nuestro propio `<canvas>` (el flipbook). Aladin se usa como **contexto** (fondo HiPS, catálogos, marcador, FOV) al lado o debajo.
- **Gaia y WISE:**
  - HiPS de AllWISE y 2MASS **espejados en IRSA** (`https://irsa.ipac.caltech.edu/data/hips/CDS/AllWISE/`, `/CDS/2MASS/Color`): responden 200 desde nuestra red. [VERIFICADO: listado y `curl`]
  - Catálogo Gaia DR3 con movimiento propio: VizieR (I/355) vía `catalogFromVizieR` [INFERENCIA: ID por verificar], o del backend con ESA TAP o IRSA `gaia_dr3_source`. **Ambos fallaron hoy** (ESA 503 por saturación, IRSA más de 250 s). Hay que **precalcular** Gaia para los 5 objetivos. [VERIFICADO: fallas medidas]
  - **CatWISE2020** en IRSA (`catwise_2020`, columnas `pmra`, `pmdec`, `w1mpro`, `w2mpro`): respondió en 14 s. Es la mejor fuente de **vectores de movimiento en IR**, que además incluye enanas marrones que Gaia no ve. [VERIFICADO: consulta propia]
  - **unWISE/NEOWISE** por época: la tabla `unwise.unwise_neo3_images` existe en el TAP de IRSA. Permite un "blink WISE vs SPHEREx" con 15 años de base. [VERIFICADO: la tabla existe] / [INFERENCIA: uso]
- **Riesgo de red:** desde esta máquina **no se llega a ningún host de CDS** (aladin.cds, alasky, simbad, Sesame; timeouts). Si pasa lo mismo en la UTH, Aladin carga desde jsDelivr pero los HiPS por defecto (alasky) no. Hay que configurar los HiPS de IRSA como fallback y resolver nombres de objetos sin Sesame (lista local de los 5 objetivos + coordenadas). [VERIFICADO: falla] / [INFERENCIA: mitigación]

## 2. Otras librerías

| Librería | Para qué | Estado |
|---|---|---|
| **astropy** (`io.fits`, `wcs`, `nddata.Cutout2D`, `time`, `coordinates`) | Leer MEF, WCS celeste y `key='W'` espectral, recortar, tiempos MJD | 8.0.2 instalado en el venv de scratch [VERIFICADO] |
| **astroquery / pyvo** | SIA y TAP | 0.4.11 / 1.10.0 [VERIFICADO] |
| **reproject** | Llevar cada cutout a una malla común norte-arriba antes de sumar o restar | Falta instalar [INFERENCIA: necesario] |
| **photutils** | Detección (DAOStarFinder), centroides, fotometría PSF/ePSF | Falta instalar; un rival lo usa así [SECUNDARIO] https://github.com/englszz/novax-space-data-lab |
| **fsspec/s3fs** | Leer secciones del MEF en S3 sin bajarlo completo | Falta; el patrón de `Cutout2D` remoto está en la doc de IRSA [VERIFICADO] https://irsa.ipac.caltech.edu/ibe/cutouts.html |
| **scikit-learn / PyTorch (CPU)** | Clasificador de candidatos (real/artefacto/variable/movimiento) | Falta |
| **JS9** / **Firefly** (IPAC) | Visores FITS en el navegador; Firefly es el toolkit de IRSA | No evaluados [INFERENCIA → evaluar solo si sobra tiempo] |
| **ipyaladin** | Aladin en notebooks (útil para depurar) | No evaluado |

## 3. Herramientas de "blink" existentes

| Herramienta | Qué hace bien | Qué le falta (para nuestro reto) |
|---|---|---|
| **WiseView / Backyard Worlds** | Flipbooks de coadds unWISE de 10+ años; tarea simple; comunidad | Solo 2 bandas (W1/W2), sin espectro; no usa SPHEREx [SECUNDARIO] https://en.wikipedia.org/wiki/Backyard_Worlds |
| **SPHEREx Data Explorer (IRSA)** | Búsqueda oficial, vista, cutouts y descarga por script | No es un flipbook temporal ni hace restas; está pensado para expertos [VERIFICADO: descripción] https://irsa.ipac.caltech.edu/applications/spherex |
| **Spectrophotometry Tool (IRSA)** | Espectro por fotometría forzada, oficial | Lento para un uso interactivo; no muestra el tiempo [VERIFICADO: descripción; INFERENCIA: lentitud] |
| **Repos rivales 2026** (ver `05-competencia.md`) | Time-lapse, blink, resta contra la mediana, cruce con JPL, seguimiento con Horizons | Casi ninguno valida el ML con inyección ni usa el espectro para clasificar al que se mueve |
| Brokers de transientes (ZTF: ALeRCE, Fink, Lasair) | Clasificadores ML "real/bogus" sobre imágenes de diferencia, con estampas (ciencia/referencia/diferencia) | Óptico, sin espectros; son el **patrón de diseño** para nuestro ML [INFERENCIA: conocimiento general, sin fuente leída hoy] |

## 4. Arquitecturas para 13.5 h

| Opción | Cómo | Pros | Contras |
|---|---|---|---|
| **A. Todo en el navegador** | JS consulta la SIA y pide cutouts directo a IRSA | Sin servidor, despliegue trivial | Cada cutout trae **5 MB de PSF** (300 cuadros ≈ 1.5 GB); CORS de IRSA sin confirmar; FITS en JS es lento; no hay astropy [VERIFICADO: peso] / [INFERENCIA] |
| **B. Backend ligero** (FastAPI) | El servidor consulta la SIA y pide cutouts en paralelo, **quita el PSF**, resta ZODI, reproyecta, hace coadds por detector y temporada y devuelve WebP + JSON | Respuestas chicas; astropy completo; cache; el ML corre en el servidor | Coordenadas nuevas tardan (≈100+ cutouts × 4 s ÷ paralelismo); hosting gratuito con poca RAM o CPU [INFERENCIA] |
| **C. Precálculo + modo en vivo** (recomendada) | Los 5 objetivos y una galería precalculados como estáticos (CDN). El modo en vivo para coordenadas libres usa B con FOV y detectores limitados y muestra progreso | El demo nunca depende de la red; lo libre sigue siendo real; cumple R2 y C6 | Dos rutas de código; hay que fijar formatos (manifest JSON) temprano [INFERENCIA] |

**Recomendación [INFERENCIA]:** C. El manifest por campo (`fields/<id>/manifest.json`) lista temporadas, detectores, cuadros, λ, banderas, versión de release y candidatos. Así el frontend es el mismo para lo precalculado y para lo vivo. Para actualizar con nuevos datos (C1) basta un job (GitHub Action o cron) que consulte ObsTAP por colecciones `spherex_*` nuevas y regenere los manifests.

## Fuentes
- https://aladin.cds.unistra.fr/AladinLite/doc/API · https://aladin.cds.unistra.fr/AladinLite/doc/tutorials/interactive-finding-chart · https://aladin.cds.unistra.fr/AladinLite/v2-doc/API/ (vía búsqueda)
- https://registry.npmjs.org/aladin-lite · https://data.jsdelivr.com/v1/package/npm/aladin-lite
- https://irsa.ipac.caltech.edu/data/hips/CDS/
- https://irsa.ipac.caltech.edu/TAP/sync (catwise_2020, unwise.unwise_neo3_images)
- https://irsa.ipac.caltech.edu/ibe/cutouts.html
- https://irsa.ipac.caltech.edu/applications/spherex
- https://en.wikipedia.org/wiki/Backyard_Worlds
