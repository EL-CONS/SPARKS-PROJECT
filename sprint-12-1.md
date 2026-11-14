# Sprint 12-1 · sábado 14 de noviembre de 2026, 12:00 a 13:00

Un solo bloque de una hora. Cada persona trabaja en su propia rama (`cons`, `carlos`, `horacio`, `joako`) y al final abre un pull request a `main`. Nadie hace push directo a `main` salvo este archivo.

## El reto

**Planet X and SPHEREx** (NASA Space Apps Challenge 2026).

Desde 2025, la misión SPHEREx de NASA mapea todo el cielo cada seis meses en 102 bandas de luz infrarroja cercana. Hay imágenes de más de mil millones de objetos. Cometas, asteroides, estrellas, enanas cafés y hasta planetas nuevos se delatan porque cambian de posición entre imágenes, pero ninguna persona puede revisar todo eso sola.

Hay que crear una **herramienta web pública** que muestre imágenes del cielo de SPHEREx para que cualquiera vea rápido cómo cambian en el tiempo. La persona escribe las coordenadas de un parche de cielo (ascensión recta y declinación) y la herramienta muestra una serie de imágenes de ese parche como un pequeño video, para detectar objetos que se mueven.

Objetivos de prueba obligatorios:

| Objeto | Qué es |
|---|---|
| Estrella de Barnard | Estrella de movimiento propio muy alto |
| Epsilon Indi B | Pareja de enanas cafés que orbita una estrella |
| WISE 0855 | Enana café de movimiento rápido. RA 08h55m10.831s, Dec -7d14m42.53s |
| RW Aurigae | Estrella variable |
| R Draconis | Estrella variable |

Consideraciones opcionales del enunciado: que sea fácil de actualizar con datos nuevos; mostrar las 102 bandas de forma creativa (sumar los datos de cada uno de los seis detectores, espectros al vuelo); sumar o restar imágenes de distintas épocas; campo de visión elegible; superponer datos de Gaia y WISE; consulta por coordenadas en la URL; mostrar metadatos y banderas de contaminación; usar herramientas como Astropy y Aladin.

## Recursos del reto

NASA no respalda a entidades que no son del gobierno de EE. UU. y no responde por su contenido. Si un sitio tiene reglas de uso de datos, hay que cumplirlas.

**NASA**
- [NASA/IPAC Infrared Science Archive, SPHEREx](https://irsa.ipac.caltech.edu/Missions/spherex.html): archivo oficial de los datos.
- [Tutoriales de SPHEREx (notebooks)](https://caltech-ipac.github.io/irsa-tutorials/spherex/): cómo acceder a los datos con Python.
- [WiseView](http://byw.tools/wiseview): herramienta parecida para datos de WISE; sirve de modelo.
- [Gaia, datos en STScI](https://archive.stsci.edu/missions-and-data/gaia): usar la última publicación (Data Release 3).

**Agencia Espacial Canadiense (CSA)**
- [NEOSSat: asteroides, basura espacial y exoplanetas](https://www.asc-csa.gc.ca/eng/satellites/neossat/)
- [Canadian Astronomy Data Centre (CADC)](https://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/en/)
- [Tutorial de datos de NEOSSat](https://github.com/asc-csa/NEOSSAT_Tutorial)
- [Dataset de NEOSSat](https://data.asc-csa.gc.ca/dataset/neossat)

## Reloj del sprint

| Hora | Qué pasa |
|---|---|
| 12:00 a 12:10 | Todos: `git pull`, crear su rama, leer su sección de este archivo |
| 12:10 a 12:35 | Trabajo individual, primera mitad |
| 12:35 a 12:40 | Revisión cruzada de Carlos y Horacio (se leen el borrador del otro) |
| 12:40 a 12:50 | Trabajo individual, segunda mitad |
| 12:50 a 13:00 | Cierre: cada persona abre su pull request a `main` y dice en el grupo qué quedó y qué no |

---

## Carlos: recursos del reto

**Rama:** `carlos` · **Entrega:** `docs/sprint-12-1/recursos.md` · **Horario:** 12:00 a 13:00

**Objetivo.** Entender qué ofrece cada recurso de la lista de arriba y decidir cuáles usamos, con qué límites y en qué parte del proyecto.

**Qué hacer**
1. Abre cada enlace de la sección "Recursos del reto". Por cada uno, anota: qué datos o herramientas da, cómo se accede (API, descarga, notebook), si hay reglas de uso o límites, y en qué parte de Sparks encaja.
2. Prioridad alta: IRSA y los tutoriales de SPHEREx (cómo se piden imágenes por coordenadas, cómo se leen las banderas), WiseView (qué hace bien y qué copiaríamos), y Gaia DR3 (cómo cruzar posiciones y movimientos propios).
3. Prioridad media: los cuatro recursos de la CSA. Responde si NEOSSat o CADC aportan algo real a nuestra herramienta o son solo contexto. Si no aportan, dilo con una frase y la razón.
4. Revisa qué ya tenemos antes de repetir trabajo: `research/planetx/04-herramientas.md`, `research/planetx/07-skills-y-recursos.md` y `research/planetx/02-spherex-datos.md`. Marca qué cambió o falta.
5. Cierra con una tabla "recurso, qué da, lo usamos (sí/no/quizá), por qué, quién lo conecta".

**Formato de entrega.** Un solo archivo, sin relleno, cada afirmación con su enlace. Si no pudiste verificar algo, escribe "sin verificar".

**Archivos útiles del repo:** [`research/planetx/04-herramientas.md`](research/planetx/04-herramientas.md), [`research/planetx/07-skills-y-recursos.md`](research/planetx/07-skills-y-recursos.md), [`research/planetx/02-spherex-datos.md`](research/planetx/02-spherex-datos.md), [`research/planetx/01-reto-y-jueceo.md`](research/planetx/01-reto-y-jueceo.md).

**Enlaces:** [IRSA SPHEREx](https://irsa.ipac.caltech.edu/Missions/spherex.html) · [Tutoriales](https://caltech-ipac.github.io/irsa-tutorials/spherex/) · [WiseView](http://byw.tools/wiseview) · [Gaia en STScI](https://archive.stsci.edu/missions-and-data/gaia) · [NEOSSat](https://www.asc-csa.gc.ca/eng/satellites/neossat/) · [CADC](https://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/en/) · [Tutorial NEOSSat](https://github.com/asc-csa/NEOSSAT_Tutorial) · [Dataset NEOSSat](https://data.asc-csa.gc.ca/dataset/neossat)

---

## Horacio: clasificación por movimiento con ML

**Rama:** `horacio` · **Entrega:** `docs/sprint-12-1/clasificacion-ml.md` · **Horario:** 12:00 a 13:00

**Pregunta de fondo.** ¿Se puede, con aprendizaje automático, clasificar un cuerpo celeste según cómo se mueve (exoplaneta, estrella, enana café, asteroide, cometa, variable, etcétera)?

**Qué hacer, en este orden**
1. **¿Es posible?** Piensa qué información de movimiento nos da SPHEREx (desplazamiento entre temporadas, dirección, tamaño del salto, brillo y su variación, color en las 102 bandas) y qué clases se podrían separar con eso. Sé honesto con los límites: qué clases sí, cuáles apenas y cuáles no (por ejemplo, un exoplaneta en una sola imagen de píxeles grandes). Cada afirmación con fuente o con la cuenta a la vista.
2. **¿Ya existe?** Busca trabajo previo: clasificadores de objetos en movimiento en WISE y NEOWISE, lo que usan los proyectos con voluntarios (Backyard Worlds), clasificación con Gaia DR3, detección de asteroides y cometas en encuestas de cielo, y cualquier modelo o paper público. Por cada hallazgo: qué clasifica, con qué datos, qué precisión reporta, si el código o el modelo es público y su licencia.
3. **¿Lo podemos implementar mejor o más claro?** Compáralo con lo que ya tenemos (regla transparente más detector LightGBM, ver archivos abajo). Responde: ¿qué haría nuestra versión distinto o más explicable?, ¿qué datos nos faltan?, ¿cuánto esfuerzo cuesta?, ¿cabe antes de la entrega del domingo?
4. **Veredicto.** Una frase por pregunta: sí, no o parcial, y la recomendación concreta (qué construir, qué no, qué decir al jurado sin exagerar).

**Reglas de honestidad.** Nada de "descubrimos". Hablamos de candidatos a revisar. Ningún número sin fuente. Si no sabes, escribe "sin verificar".

**Formato de entrega.** Un solo archivo con las cuatro partes, tabla de trabajo previo (con enlaces) y el veredicto arriba, en un párrafo.

**Archivos útiles del repo (lo que ya hicimos en ML)**
- [`docs/team/rol-3-ml.md`](docs/team/rol-3-ml.md): el rol de ML, conceptos y orden de lectura.
- [`docs/methods.md`](docs/methods.md): métodos, sección 7 y 7b.
- [`models/report/test_protocol.md`](models/report/test_protocol.md), [`models/report/final_test.md`](models/report/final_test.md), [`models/report/validation.md`](models/report/validation.md), [`models/report/development_check.md`](models/report/development_check.md): protocolo y resultados.
- [`research/planetx/03-ciencia.md`](research/planetx/03-ciencia.md) y [`research/planetx/05-competencia.md`](research/planetx/05-competencia.md).

**Puntos de partida para buscar**
- [Backyard Worlds](https://backyardworlds.org/): el proyecto de voluntarios que más descubrió con esta técnica.
- [Archivo IRSA, SPHEREx](https://irsa.ipac.caltech.edu/Missions/spherex.html) y [tutoriales](https://caltech-ipac.github.io/irsa-tutorials/spherex/).
- [Gaia DR3 en STScI](https://archive.stsci.edu/missions-and-data/gaia).
- [SIMBAD](https://simbad.cds.unistra.fr/): tipos de objeto de referencia (etiquetas).
- [Minor Planet Center](https://www.minorplanetcenter.net/) y [JPL Horizons](https://ssd.jpl.nasa.gov/horizons/): posiciones de asteroides y cometas.
- [Documentación de Astropy](https://docs.astropy.org/).
- [scikit-learn, errores comunes](https://scikit-learn.org/stable/common_pitfalls.html) y [LightGBM](https://lightgbm.readthedocs.io/): para evaluar sin fuga de datos.

---

## Cons: la interfaz web

**Rama:** `cons` · **Entrega:** pull request a `main` con la primera versión navegable · **Horario:** 12:00 a 13:00

**Objetivo.** Construir el front de Sparks, la herramienta web pública del reto. Una persona escribe una posición del cielo, ve las fotos de SPHEREx de esa zona parpadeando como un video corto y puede notar qué se mueve.

**Qué debe lograr en esta hora (alcance realista)**
1. Proyecto base funcionando con `npm run dev`: Vite, React 18 y TypeScript. Fuentes Archivo (títulos) e IBM Plex Sans (texto), instaladas como dependencias.
2. Tokens de color, tipografía, espaciado y movimiento definidos en un archivo de estilos, tomados de la pauta de abajo.
3. Barra superior con la marca (logo en `Logo/`), campo de coordenadas y botones de los cinco objetivos de prueba (Barnard, Epsilon Indi B, WISE 0855, RW Aurigae, R Draconis).
4. Escenario del cielo con seis paneles (uno por detector) y controles de transporte: reproducir, pausar, cuadro anterior y siguiente, velocidad.
5. Selector de modo: parpadeo, suma, resta.
6. Que las coordenadas viajen en la URL (por ejemplo `?ra=...&dec=...`) para poder incrustar la herramienta en otros sitios.
7. Si queda tiempo: selector de idioma inglés y español, y estados de error y vacío con texto claro.

Si no hay datos reales todavía, usa los de `results/results.json` y deja las imágenes como marcadores bien resueltos. No inventes imágenes.

**Material que se le entrega**
- Contexto del proyecto: [`CONTEXTO.md`](CONTEXTO.md).
- Dirección visual completa y tokens: [`DESIGN.md`](DESIGN.md).
- Esqueleto del recorrido y de las pantallas: [`ESQUELETO-UX.md`](ESQUELETO-UX.md).
- Herramientas de diseño y criterios de revisión: [`SKILLS-UX.md`](SKILLS-UX.md) y [`docs/skills-digest.md`](docs/skills-digest.md).
- Logo y favicon: carpeta [`Logo/`](Logo/) (símbolo, horizontal, versiones de una tinta, símbolo animado, favicon). Los estudios completos están en [`branding/sparks/concept-01/`](branding/sparks/concept-01/).
- Lista de skills con su fuente: [`skills-lock.json`](skills-lock.json).

**Skills a instalar y usar** (en este orden de uso)

| Skill | Para qué | Repositorio |
|---|---|---|
| frontend-design | Dirección visual, tipografía y texto de interfaz | [anthropics/skills](https://github.com/anthropics/skills) (`skills/frontend-design`) |
| ui-ux-pro-max | Guías de UX, accesibilidad y gráficas. Solo el dominio UX | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) |
| ux-copy | Textos de botones, errores y estados vacíos | [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) (`design/skills/ux-copy`) |
| accessibility-review | Revisión WCAG 2.1 AA | [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) (`design/skills/accessibility-review`) |
| webapp-testing | Capturas y pruebas con Playwright | [anthropics/skills](https://github.com/anthropics/skills) (`skills/webapp-testing`) |
| web-design-guidelines | Revisión final del código | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) (`skills/web-design-guidelines`) |
| design-taste-frontend | Solo su revisor de contraste y bordes | [leonxlnx/taste-skill](https://github.com/leonxlnx/taste-skill) |
| astropy | Solo para revisar nombres y números de astronomía | [K-Dense-AI/scientific-agent-skills](https://github.com/K-Dense-AI/scientific-agent-skills) (`skills/astropy`) |

Además, Joaquín tiene estas dos instaladas en su equipo y no tienen repositorio verificado: `dataviz` (método para gráficas) y `fixing-motion-performance` (auditoría de animaciones). Si las necesitas, pídele que te pase la carpeta.

**Cómo se revisa lo que entrega.** Se abre a 390 px y a 1440 px, y se recorre con teclado. Para capturas y pruebas, la skill `webapp-testing`.

---

## Joaquín: coordinación, datos y pitch

**Rama:** `joako` · **Entrega:** lo de abajo, hecho o con su estado anotado · **Horario:** 12:00 a 13:00

Lo que le toca a la persona que coordina, en orden de prioridad.

1. **12:00 a 12:10. Arrancar al equipo.** Confirma que Cons, Carlos y Horacio hicieron `git pull`, tienen su rama y abrieron este archivo. Resuelve accesos al repositorio que falten.
2. **12:10 a 12:30. Datos para Cons.** El front necesita algo que mostrar. Prepara un paquete mínimo: `results/results.json` y un campo de ejemplo (Barnard). Si pesa más de 25 MB, súbelo fuera de git y pon el enlace aquí abajo. Escribe en tres líneas qué archivos hay y cómo se leen.
3. **12:30 a 12:40. Primer chequeo con Cons.** Que abra la app, que se vea el bastidor y los tokens, y corregir rumbo temprano.
4. **12:40 a 12:50. Esqueleto del pitch.** Parte de `docs/pitch/pitch-3min-es.md` y `docs/pitch/slides-outline.md`, y define en una frase qué hallazgo de Carlos y de Horacio entra al pitch.
5. **12:50 a 13:00. Cierre.** Revisa los pull requests, fusiona lo que esté listo, y deja en el grupo la lista de pendientes para el siguiente sprint.

Si sobra tiempo, en este orden: revisar el borrador de Horacio contra `models/report/final_test.md`; preparar el despliegue (el proyecto anterior usaba `vercel.json`); ensayar la narración del pitch en voz alta.

**Enlace al paquete de datos de ejemplo:** pendiente (lo pone Joaquín).

---

## Reglas comunes del sprint

- Español. Sin emojis.
- Cada afirmación científica lleva su fuente. Si no se verificó, se escribe "sin verificar".
- Hablamos de candidatos, no de descubrimientos.
- Trabajo en tu rama. Pull request a `main` a las 12:50, no antes de revisar tu propio archivo una vez.
- Si algo te bloquea más de cinco minutos, avisa en el grupo.
