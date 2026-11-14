# Concepto ganador · Sparks: Cold Sparks

## Pitch y lema
- **En una frase:** Sparks convierte el archivo de SPHEREx en un flipbook del cielo que te dice **qué se mueve y qué es frío**: escribes coordenadas, ves el cielo parpadear en 6 detectores, y cada "chispa" trae su movimiento medido y su huella de 102 colores.
- **Lema:** *"Every spark that moves has a fingerprint."* (alterno: *"The coldest sparks glow in infrared."*)

## Qué hace, para quién y por qué es "wow"
- **Qué hace:**
  1. RA/Dec (o URL) → todas las imágenes SPHEREx de QR2+QR3 de ese punto.
  2. Coadds por detector y temporada, en un flipbook de 6 paneles.
  3. Resta entre temporadas con dipolos marcados.
  4. Un clasificador etiqueta cada residuo: se mueve / varía / artefacto / residuo de resta.
  5. Cada candidato tiene una tarjeta: flecha medida contra la esperada (CatWISE/Gaia), espectro al vuelo con índice de "frío" (metano y agua) y curva de luz.
- **Para quién:** voluntarios tipo Backyard Worlds y clubes de astronomía (usuario principal); estudiantes; astrónomos que quieren un vistazo rápido antes de bajar datos (secundario).
- **Por qué es wow** [INFERENCIA]: ninguno de los ~15 rivales maduros que revisamos junta **movimiento medido + espectro** en un veredicto (`05-competencia.md`). Es lo que haría un astrónomo, y el público lo entiende con una frase: "se mueve y es frío".
- **El momento exacto (1:00 del pitch):** WISE 0855 en pantalla. La capa Gaia está **vacía** ("el mejor catálogo de estrellas no la ve"). El panel D1 está negro. Se desliza a D6 (5 µm) y aparece un punto. Blink → dipolo → la **flecha medida se encima sobre la flecha de CatWISE** y la tarjeta dice "8.1″/yr expected · measured 𝑥 ± σ". Clic → el espectro cae a cero en 1–3 µm y sube a 5 µm. *Pendiente: verificar el sábado que WISE 0855 no está en Gaia DR3 y medir 𝑥 ± σ.*

## Matriz de cumplimiento

| Req. | Componente | Cómo se demuestra |
|---|---|---|
| R1 Web pública | Frontend estático en CDN + backend ligero | Abrir la URL en el teléfono del juez (QR) |
| R2 RA/Dec | Barra de coordenadas (sexagesimal/decimal) con astropy `SkyCoord` en el backend y parser en JS | Teclear las coordenadas de WISE 0855 del enunciado tal cual |
| R3 Video | Flipbook `<canvas>` con play, velocidad, cuadro a cuadro y fecha | Play en Barnard |
| R4 Objetos que se mueven | Modos blink, resta y rastro; dipolos resaltados; detector | Barnard: el dipolo con flecha |
| R5 Los 5 objetivos | Botones precalculados + enlaces permanentes + capturas en el README | Recorrer los 5 en 20 s (diapositiva de respaldo) |
| C1 Releases nuevos | `discover_collections()`: ObsTAP `SELECT DISTINCT obs_collection … LIKE 'spherex_qr%'`; manifest con la versión; job de regeneración (cron o GitHub Action) | Mostrar que **QR3 entró sin cambiar código** (ya nos pasó: el enunciado no lo menciona) |
| C2 102 bandas creativas | Selector de detector o canal + "huella" de 102 celdas coloreada por λ + índice de frío | Huella de WISE 0855 vs una estrella del mismo campo |
| C3 Suma por detector | Coadd ponderado por inversa de varianza (HDU VARIANCE) por detector y temporada; S/N antes y después en el panel | "S/N 4 → 19 al sumar 40 imágenes D6" (número real del sábado) |
| C4 Espectros al vuelo | Fotometría forzada (apertura en v1, ePSF en v2) en cada cutout a la posición propagada con el movimiento propio; λ desde el WCS `W` | Clic en RW Aur: espectros de sep-2025 y sep-2026 superpuestos |
| C5 Sumar o restar fechas | Modos: Stack (A+B), Resta (A−B), Resta contra la mediana; selector de temporadas | Alternar en Barnard |
| C6 Campo de visión | Selector de 2′ a 30′ con estimación de MB y tiempo (cutouts sin PSF) | Cambiar a 20′ y mostrar la estimación |
| C7 Gaia / WISE | Aladin Lite 3.8.2: HiPS AllWISE/2MASS (espejo IRSA) + catálogos Gaia DR3 y CatWISE2020 con vectores de movimiento propio | Capa Gaia vacía en WISE 0855; vectores CatWISE en Barnard |
| C8 Coordenadas en la URL | `?ra=&dec=&fov=&mode=&det=&t=` reproduce el estado; botón "Embed" con `<iframe>` | Pegar el `<iframe>` en una página de prueba |
| C9 Metadatos y banderas | Panel por cuadro: obs_id, fecha, detector, λ, versión, release; máscara de banderas (GHOST, OVERFLOW, TRANSIENT…) encendible | Encender la máscara GHOST junto a ε Indi A |
| C10 Astropy + Aladin | Backend astropy (FITS, WCS, `Cutout2D`, `reproject`) + frontend Aladin Lite | Diapositiva "Built on" + README |

## El componente de ML

- **Qué aprende:** a clasificar cada residuo de la imagen de diferencia (estampa de 15×15 px por detector y temporada) en 4 clases: **mover** (dipolo), **variable** (residuo simétrico), **artefacto** (fantasma, rayo cósmico, píxel caliente, saturación) y **residuo estático** (estrella mal restada).
- **Datos y etiquetas:**
  - *Movers y variables sintéticos:* se inyectan fuentes con la **ePSF oficial** (QR3, válida también para QR2) sobre imágenes **reales** de SPHEREx, con desplazamientos de 0.2–3 px y flujos de S/N 3–50. Las etiquetas salen gratis y son exactas.
  - *Artefactos reales:* residuos en píxeles con bits GHOST (22), OUTLIER (19), TRANSIENT (0), OVERFLOW (1), HOT (10) y PERSIST (17) del propio pipeline. Son etiquetas débiles.
  - *Residuos estáticos:* residuos de estrellas de Gaia/CatWISE sin movimiento propio significativo.
- **Modelo:** gradient boosting (LightGBM) sobre ~20 features explicables (asimetría del dipolo, χ² del ajuste PSF, fracción de píxeles con bandera, S/N, consistencia entre los 6 detectores, distancia a la fuente brillante más cercana). Si sobra tiempo, una CNN chica sobre las estampas (ciencia/referencia/diferencia) para comparar.
- **Validación (lo que se presenta):**
  1. Curva de **completitud y pureza vs S/N** sobre inyecciones de un campo que no se usó para entrenar.
  2. **Test independiente sin inyecciones:** las estrellas de alto movimiento propio de CatWISE/Gaia en los 5 campos y los asteroides conocidos (MOST/JPL) en un campo de la eclíptica. Se reporta cuántos recupera el clasificador.
  3. Matriz de confusión.
  - El sesgo "inyectado vs real" (crítica de Infrarrojo) se controla con el punto 2.
- **Qué NO es ML** (y se dice así): el índice de frío es un cociente de flujos físico (p. ej. D6/D2 y la profundidad de la banda de metano); la flecha es un ajuste de centroides.
- **Plan B:** si a las 16:00 el modelo no supera a un umbral simple de dipolo + banderas en el test independiente, en la app se usa la regla (etiquetada "rule-based score") y el ML se presenta como experimento con su curva, sin vender lo que no funciona.

## Lo "técnicamente increíble" para la astrónoma [INFERENCIA]
1. **Comparar a la misma λ:** nunca se resta un cuadro D6 a 4.96 µm contra otro a 4.5 µm. Se agrupa por detector y temporada, y se muestra la λ efectiva de cada coadd.
2. **Coadd con inversa de varianza, ZODI restado, banderas aplicadas** y la ePSF correcta (con el fix del header de PSF).
3. **Movimiento propio medido con barra de error y comparado con CatWISE/Gaia.** Si no da, se dice.
4. **Release-aware:** cada cuadro lleva la versión (`l2b-v20/v24/v27`) y el DOI del release; QR2 y QR3 se unen sin duplicar.
5. **Validación independiente del ML** con objetos conocidos, no solo con inyecciones.

## Arquitectura y stack

```
             ┌────────────── navegador ────────────────┐
             │ Vite + TS (vanilla o Svelte)            │
             │  • Flipbook <canvas> 6 paneles          │
             │  • Aladin Lite 3.8.2 (jsDelivr)         │
             │    HiPS AllWISE/2MASS (espejo IRSA)     │
             │  • Tarjetas: flecha, huella, espectro   │
             │  • Estado ⇄ URL, embed, QR              │
             └───────▲─────────────────────▲───────────┘
                     │ JSON/WebP           │ estáticos (CDN)
     ┌───────────────┴────────┐   ┌────────┴──────────────────┐
     │ Backend FastAPI (vivo) │   │ /fields/<id>/manifest.json│
     │ SIA/ObsTAP → cutouts   │   │ WebP por det×temporada    │
     │ async, sin PSF, −ZODI, │   │ candidatos, espectros     │
     │ reproject, coadd, ML   │   │ (5 objetivos + galería)   │
     └────────┬───────────────┘   └──────────▲────────────────┘
              │  IRSA (SIA, IBE cutouts, TAP CatWISE/unWISE),  │
              │  Gaia (ESA TAP / VizieR), JPL/MOST             │
              └──── misma pipeline, `precompute.py` ───────────┘
```
- Stack: Python 3.12, astropy, astroquery/pyvo, reproject, photutils, numpy/scipy, LightGBM, FastAPI/uvicorn, httpx; frontend Vite + TS, Aladin Lite 3.8.2, uPlot; hosting estático en Vercel o GitHub Pages; backend en Render, Fly o Hugging Face Spaces (a decidir; cuidado con el arranque en frío).
- Regla: **el demo del pitch nunca depende del backend.** Todo lo que se muestra en el pitch es estático; el modo en vivo es un plus. [INFERENCIA]

## Alcance en 13.5 h (en orden de prioridad, con cortes)

| Hora | Meta | Corte / plan B |
|---|---|---|
| Sáb 10:30–12:30 | Ingesta de 1 objetivo (Barnard): ObsTAP → cutouts en paralelo → quitar PSF → −ZODI → reproject → coadds por detector y temporada → manifest. En paralelo: esqueleto del frontend (flipbook + URL + Aladin) | **12:30:** si no hay coadds de Barnard, usar cuadros individuales sin reproyección (alineación por WCS al vecino más cercano) |
| 12:30–14:30 | Los 5 objetivos precalculados; resta y dipolos; CatWISE/Gaia precalculados; centroides por temporada | **14:30:** si la flecha medida no converge, mostrar solo dipolo + vector esperado |
| 13:00–16:00 (persona de ML) | Set de inyecciones con ePSF, features, LightGBM, curva de completitud, test con objetos conocidos | **16:00:** si no gana a la regla → plan B (regla en la app, ML como diapositiva) |
| 16:00–18:00 | Espectro al vuelo para los 5 (fotometría forzada) + índice de frío + curva de luz (R Dra, RW Aur) | **18:00:** si falla, espectro solo para WISE 0855 y RW Aur |
| 18:00–20:00 | Modo en vivo (FOV limitado, 2 detectores por defecto), panel de banderas y metadatos, deploy | **19:30:** URL pública arriba o se va solo con estáticos |
| Noche (fuera de la sede, opcional) | Galería de 10 campos extra (incluido uno de asteroides), README con capturas | — |
| Dom 8:00–10:00 | QR + parches estáticos, pruebas en móvil (webapp-testing), pulido visual | **9:30:** congelar features |
| 10:00–11:15 | Video de 30 s, Canva, página del equipo en inglés | — |
| 11:15–12:00 | Entrega local, ensayo del pitch ×2 | — |

Se recorta en este orden: CNN → modo en vivo → curva de luz → QR (el QR también funciona como "abre este enlace").

## Guion del pitch (3 min)

| Tiempo | Qué se dice | Qué se ve |
|---|---|---|
| 0:00–0:20 | "En 1930 descubrieron Plutón comparando dos fotos. Hoy SPHEREx, de la NASA, ya publicó más de un millón y medio de imágenes en 102 colores. Nadie puede compararlas todas a mano. Lo que se mueve es como un satélite que hay que rastrear entre fotos." | Plutón blink → contador del archivo |
| 0:20–0:40 | "Sparks: escribes coordenadas y el cielo parpadea." | URL con coordenadas → flipbook de 6 paneles de Barnard |
| 0:40–1:00 | "La estrella de Barnard se mueve 10 segundos de arco al año. Al restar dos temporadas aparece este par blanco y negro: eso es movimiento. Nuestra flecha medida coincide con la de Gaia." | Dipolo + flechas |
| 1:00–1:40 | **Momento wow** con WISE 0855: Gaia vacío → D1 negro → D6 brilla → dipolo → espectro | Ver arriba |
| 1:40–2:10 | "¿Cómo sabemos que no es un artefacto? Entrenamos un clasificador con miles de objetos falsos inyectados con el PSF real de SPHEREx y lo probamos con estrellas conocidas: recupera X%." | Curva de completitud + matriz |
| 2:10–2:35 | "Y todo es tuyo: elige el campo, suma o resta fechas, mira las banderas de calidad, e incrústalo en tu sitio. Los datos nuevos entran solos: QR3 apareció este septiembre y ya está." | Selector de FOV, máscara de banderas, embed |
| 2:35–3:00 | "Escaneen este código: su teléfono es ahora un campo de SPHEREx. Cada chispa que se mueve tiene una huella. Somos Cosmonautas, de Hermosillo." | QR en pantalla; teléfonos |

## Video de 30 s (inglés)

| s | Voz | Imagen |
|---|---|---|
| 0–5 | "Pluto was found by blinking two photos." | Blink histórico (con crédito) |
| 5–11 | "NASA's SPHEREx now maps the whole sky in 102 infrared colors." | Mosaico SPHEREx, contador |
| 11–18 | "Sparks turns it into a flipbook: type coordinates, watch the sky move." | Barra de coordenadas → Barnard parpadeando |
| 18–25 | "Our model flags what moves — and the spectrum shows what's cold." | WISE 0855: dipolo + espectro |
| 25–30 | "Every spark that moves has a fingerprint. Sparks." | Logo + URL |

(Si se usa IA generativa para música o imagen: marca de agua y declararlo. Créditos de datos en la pantalla final.)

## Riesgos y mitigación

| Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|
| Movimiento de 1–2 px no medible con el S/N real | Media | Alto | Coadds; centroide PSF; si falla, dipolo + vector esperado y decirlo |
| IRSA lenta o caída durante el pitch | Media | Alto | Todo lo del pitch es estático; video de respaldo |
| CDS inaccesible desde la red de la UTH | Media | Medio | HiPS del espejo de IRSA; catálogos precalculados; Aladin desde jsDelivr |
| Gaia TAP saturado (503) | Alta | Medio | Precalcular Gaia de los 5 campos el sábado temprano |
| Saturación de Barnard, ε Ind A, R Dra | Media | Medio | Mostrar banderas OVERFLOW; para R Dra usar los detectores no saturados; avisarlo en pantalla |
| ML sin tiempo o sin validar | Media | Alto (Validity) | Corte a las 16:00 y plan B honesto |
| Prometer "Planet X" o "descubrimiento" | Baja | Muy alto | Frase prohibida; decir "candidatos para revisión" |
| Rivales globales más completos | Alta | Medio | Ganar por la tesis "se mueve + frío" y por la validación, no por la cantidad de features |
| Regla de "no trabajar antes" | — | Alto | No escribir código del producto antes del 14; los precálculos se hacen el sábado |
| Wi-Fi de la sede para el QR | Media | Medio | Parches como WebP en un CDN; enlace corto de respaldo; hotspot propio |

## Checklist antes del 14
- [ ] **Cambiar el reto de Cosmonautas** en la plataforma de *Harmonization* a *Planet X and SPHEREx* (hoy sigue en Harmonization).
- [ ] Cuentas: GitHub (repo vacío con licencia, p. ej. MIT o Apache-2.0), Vercel o Pages, el host del backend, Canva; confirmar quién edita la página del equipo.
- [ ] Laptops: Python 3.12 + uv; Node 20+; probar `curl` a irsa.ipac.caltech.edu, cdn.jsdelivr.net y aladin.cds.unistra.fr **desde la red de la UTH** (o preguntarlo).
- [ ] El 13 de noviembre: leer Resources del reto, la guía de envío 2026 y la de jueceo; volver a consultar la cobertura (¿hay QR3 para WISE 0855 y R Dra?).
- [ ] Leer los tutoriales de IRSA de intro, cutouts y PSF (leer no es construir).
- [ ] Repartir roles: datos/backend, ML, frontend, presentación (pitch, video, Canva, página en inglés).
- [ ] Preguntas para el líder local: duración real del pitch y formato (¿en vivo con proyector?), rúbrica local, si la sede está abierta de noche, red disponible (¿bloquea puertos o dominios?), si se permiten demos en teléfonos del jurado, entregables locales exactos.
