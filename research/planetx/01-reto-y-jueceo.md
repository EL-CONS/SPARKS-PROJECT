# 01 · Reto, jueceo y envío

Consulta: 2026-11-05. spaceappschallenge.org no se deja leer con `curl` (certificado), así que la página del reto se leyó con el navegador integrado. Los datos de jueceo y envío vienen de la investigación anterior del equipo (`research/01-reto-y-jueceo.md`, leída el 2026-11-04); aquí se re-etiquetan con su fuente original.

## Resumen
- Reto: **"Planet X and SPHEREx"**, dificultad Advanced, temas Astrophysics, Planets & Moons, Software. [VERIFICADO] https://www.spaceappschallenge.org/2026/challenges/planet-x-and-spherex/
- Solo hay **un objetivo duro**: una herramienta web pública que, dadas RA/Dec, muestre una serie de imágenes SPHEREx de esa zona "como un pequeño video". Las 8 "potential considerations" el enunciado las marca como **opcionales**, pero el equipo decidió tratarlas todas como obligatorias. [VERIFICADO texto] / [decisión del equipo]
- La pestaña **Resources está vacía** hasta el viernes 13 de noviembre. [VERIFICADO] (?tab=resources, 2026-11-05)
- **Hay 587 equipos en el mundo con este reto**, uno de los más concurridos. En Hermosillo no hay ninguno: Cosmonautas sigue inscrito en *Harmonization of MODIS and VIIRS Hot Spots*. **Hay que cambiar el reto en la plataforma.** [VERIFICADO] (?tab=teams del reto y de la sede, 2026-11-05)

## 1. Requisitos como checklist verificable

El enunciado agrupa varias ideas en una sola consideración, así que las 10 del brief del equipo se reparten en 8 viñetas oficiales. Se numeran igual que en el brief.

| # | Requisito | Prueba de aceptación (cómo se verifica) | Origen |
|---|---|---|---|
| R1 | Herramienta **web pública** | URL pública sin login, abre en un teléfono | Obligatorio [VERIFICADO] |
| R2 | El usuario **ingresa RA y Dec** | Acepta sexagesimal (`08h55m10.831s −7d14m42.53s`) y decimal; valida rangos | Obligatorio [VERIFICADO] |
| R3 | Muestra una **serie de imágenes como video** | Reproductor con play/pausa, velocidad y cuadro por cuadro, ordenado por fecha y con la fecha en pantalla | Obligatorio [VERIFICADO] |
| R4 | Hace fácil **ver objetos que se mueven** | En Barnard o WISE 0855, alguien no experto señala el objeto que se mueve en menos de 30 s | Obligatorio [VERIFICADO] |
| R5 | Probado con **Barnard's Star, ε Indi B, WISE 0855, RW Aur, R Dra** | Los 5 tienen un botón, un enlace permanente y una captura en el README | Obligatorio [VERIFICADO] |
| C1 | Fácil de **actualizar con nuevos releases** | Una colección nueva (`spherex_qr4`) se detecta sola por ObsTAP; prueba: QR3 entra sin cambiar código | "Potential consideration" [VERIFICADO] |
| C2 | Mostrar las **102 bandas** de forma creativa para descubrir | Vista que codifica λ (color o sonido) y permite elegir canal o detector | Consideración [VERIFICADO] |
| C3 | **Sumar por cada uno de los 6 detectores** para mejorar S/N | Coadd por detector y temporada con el S/N reportado (antes y después) | Consideración [VERIFICADO] |
| C4 | **Espectros al vuelo** ("extra kudos") | Clic en una fuente → espectro λ-flujo con barras de error en menos de 20 s, o precalculado | Consideración [VERIFICADO] |
| C5 | **Sumar o restar** imágenes de distintas fechas | Modos: suma (stack), resta época A − B y resta contra la mediana | Consideración [VERIFICADO] |
| C6 | **Campo de visión** elegible (más grande = más datos) | Selector de FOV con la estimación de MB o tiempo a la vista | Consideración [VERIFICADO] |
| C7 | **Superponer Gaia o WISE** | Capas: catálogo Gaia DR3 con vectores de movimiento propio, CatWISE y un fondo HiPS de AllWISE | Consideración [VERIFICADO] |
| C8 | **Coordenadas en la URL** (incrustable) | `?ra=…&dec=…&fov=…&mode=…` reproduce el estado; existe un `<iframe>` de ejemplo | Consideración [VERIFICADO] |
| C9 | **Metadatos y banderas de contaminación** | Panel por cuadro: obs_id, fecha, detector, λ, versión y máscara de banderas superpuesta | Consideración [VERIFICADO] |
| C10 | Usar **Astropy** y **Aladin (CDS)** | Backend con astropy (WCS, FITS, reproyección) y frontend con Aladin Lite v3 | Consideración (el texto dice "Astrophy tools") [VERIFICADO] |

## 2. Jueceo global

- 10 premios globales: Best Use of Science, Best Use of Data, Best Use of Technology, Galactic Impact, Best Mission Concept, Most Inspirational, Best Use of Storytelling, Global Connection, Art & Technology, Local Impact. [VERIFICADO] https://www.spaceappschallenge.org/awards/ (leída 2026-11-04)
- Criterios de la guía 2025, del 1 al 5 cada uno: **Impact** (tamaño del problema, a cuántos ayuda), **Creativity** (originalidad), **Validity** (base científica y factibilidad, qué tan completo y usable), **Relevance** (responde al reto e integra datos NASA como núcleo), **Presentation** (cómo se cuenta). La guía pide dar a Presentation el mismo peso. [VERIFICADO] guía 2025 en Wayback: https://web.archive.org/web/20251013144403/https://www.spaceappschallenge.org/resources/judging-awards-guide/
- Proceso: jueces locales → Global Nominees; expertos NASA y agencias socias → Finalists y Honorable Mentions; comité ejecutivo → 10 ganadores. [VERIFICADO] misma guía
- La guía de jueceo 2026 sale el 13 de noviembre; la URL daba 404 el 4 de noviembre. [VERIFICADO] https://www.spaceappschallenge.org/resources/judging-awards-guide/

**Premios que mejor encajan** [INFERENCIA]:
1. **Best Use of Data**: hacer usable un archivo de 1.1 millones de imágenes con 102 bandas. Lo ganó en 2025 un proyecto de IA para exoplanetas (Resonant Exoplanets). [VERIFICADO: lista 2025]
2. **Best Use of Science**: astrometría y espectros correctos, validación con objetos conocidos. En 2024 lo ganó un proyecto de objetos cercanos a la Tierra (WMPGang). [SECUNDARIO: nota NASA vía búsqueda]
3. **Best Use of Technology**: el detector ML con validación por inyección. En 2025 lo ganó un equipo de Monterrey, México (Twisters). [VERIFICADO: lista 2025]
4. **Most Inspirational / Galactic Impact**: ciencia ciudadana ("cualquiera puede descubrir"). Local Impact encaja poco, salvo el ángulo de cielos oscuros de Sonora.

## 3. Requisitos de envío (guía 2025; la 2026 sale el 13 nov)
- Demo obligatorio: **video de hasta 30 s o hasta 7 diapositivas**, en un enlace público sin login; pasarse del límite quita la elegibilidad global. [VERIFICADO] https://web.archive.org/web/20251013154045/https://www.spaceappschallenge.org/resources/project-submission-guide/
- **Inglés**: formulario y materiales en inglés; un video en otro idioma necesita subtítulos en inglés. [VERIFICADO] misma guía
- Campos obligatorios: nombre, resumen, enlace al demo, enlace al proyecto, descripción, **NASA Data**, **Space Agency Partner & Other Data** (todo recurso externo: código, imágenes, librerías) y **uso de IA**. [VERIFICADO] misma guía
- **Trabajo original**: casilla que lo confirma; los T&C 2026 exigen citar cada fuente y documentar licencias. Sin licencia explícita, NASA lo trata como Apache 2.0. [VERIFICADO] https://www.spaceappschallenge.org/legal/
- **IA**: en 2026 la FAQ la llama "Super Intelligence (SI)"; está permitida pero hay que describir su uso. En 2025, imágenes o video generados con marca de agua y prohibido generar marca NASA. [VERIFICADO] https://www.spaceappschallenge.org/resources/participant-faqs/
- La FAQ 2026 dice que no se puede empezar a trabajar en los retos antes del hackatón. Investigar y preparar cuentas no es construir el producto; por eso este chat no escribe código del producto. [VERIFICADO FAQ] / [INFERENCIA sobre el límite]
- Citar SPHEREx: DOI del release (QR2 10.26131/IRSA652, QR3 10.26131/IRSA662) y la frase de reconocimiento de la misión. [VERIFICADO] https://irsa.ipac.caltech.edu/data/SPHEREx/docs/overview_qr.html

## 4. Sede Hermosillo
- UTH, presencial. Agenda: hacking desde el sáb 14 a las 10:30, entrega local sugerida dom 15 a las 12:00, pitches 12:30, premiación 17:00, cierre global 23:59 (Hermosillo = UTC−7 sin horario de verano). 1.º y 2.º lugar pasan a evaluación global. [VERIFICADO] https://www.spaceappschallenge.org/2026/local-events/hermosillo/?tab=schedule (leída 2026-11-04)
- La página no publica rúbrica local ni entregables locales (repo, Canva, duración del pitch). [VERIFICADO: ausencia] Lo de "pitch de 3 min, Canva, video de 30 s" viene del brief del equipo, no de una fuente pública → preguntas abiertas.
- 15 equipos locales; **ninguno en Planet X**. [VERIFICADO] ?tab=teams (2026-11-05)

## Fuentes
- https://www.spaceappschallenge.org/2026/challenges/planet-x-and-spherex/ (Details, Resources, Teams), 2026-11-05
- https://www.spaceappschallenge.org/2026/local-events/hermosillo/?tab=teams, 2026-11-05
- https://www.spaceappschallenge.org/awards/
- https://web.archive.org/web/20251013144403/https://www.spaceappschallenge.org/resources/judging-awards-guide/
- https://web.archive.org/web/20251013154045/https://www.spaceappschallenge.org/resources/project-submission-guide/
- https://www.spaceappschallenge.org/resources/participant-faqs/
- https://www.spaceappschallenge.org/legal/
- https://www.spaceappschallenge.org/2025/awards/global-winners/
