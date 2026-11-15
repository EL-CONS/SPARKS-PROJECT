# Declaración de uso de herramientas de Superinteligencia (SI)

Las normas del NASA Space Apps Challenge 2026 (`docs/reto/normas.md`, basadas en *NASA Space Apps Challenge 2026 Participant FAQs*) piden que la entrega describa honestamente cómo se usaron herramientas de **Superinteligencia (SI)** (modelos de lenguaje, asistentes de código, generación de texto/imágenes y agentes de desarrollo) durante el desarrollo. Abajo va la versión en español y al final la versión en inglés para pegar en `spaceappschallenge.org`.

**Estado:** borrador consolidado. Lo marcado con `[CONFIRMAR]` debe ser confirmado por cada persona interesada antes del envío final.

---

## 1. Qué herramientas de SI se usaron

- **Claude (Anthropic) vía Claude Code:** asistente principal de programación en la integración y frontend. Los commits llevan el trailer `Co-Authored-By` con el modelo usado: **Claude Sonnet 5.5**, **Claude Opus 5.5** y **Claude Fable 5.2**.
  - En la historia de la rama de integración (`joako-integracion`, al 14 de noviembre a las 23:17), **49 de 74 commits** llevan esa marca (todos bajo la cuenta de Joaquín, 52 commits); los 22 de Cons no la llevan, lo cual no prueba que no usara SI.
  - En el historial completo previo del repositorio (`git log --all` revisado en `carlos`), se registran **16 commits** con `Claude Opus 5.5` y **34 commits** con `Claude Sonnet 5.5`.
- **Asistentes / agentes en terminal e IDE (Gemini / Antigravity y agentes de terminal) en la rama `carlos`:** usados el sábado 14 de noviembre para redactar scripts en Python de verificación de cobertura/recortes, pruebas en navegador contra S3 (`Range` + CORS), reportes por sprint y borradores de entrega. Los commits de `carlos` no llevan trailer `Co-Authored-By`.
- **Habilidades cargadas en el entorno de agentes (`skills-lock.json`):** `astropy`, `design-taste-frontend`, `frontend-design`, `ui-ux-pro-max`, `web-design-guidelines`, `webapp-testing`.
- **`[CONFIRMAR CON CONS Y HORACIO]`** si usaron algún asistente de SI en sus sesiones locales (`cons`, `frontend-del-cons`, `Horacio`) y con qué herramientas.

---

## 2. Para qué se usaron y qué revisó, probó y corrigió una persona

| Parte | Uso de SI | Qué revisó, probó y corrigió una persona |
|---|---|---|
| Interfaz web (`app/src/ui/`, `app/src/styles/`) | El asistente escribió la mayor parte del código de las tres iteraciones de diseño (`Constelacion`, `Escotilla`, `Planetario`) y de la elegida (`Constelacion`). | Joaquín dio la dirección, eligió entre iteraciones y revisó el resultado en el navegador; decidió dejar tema oscuro único (`#06080C`). Cons integra y mantiene la rama. |
| Lógica de la app (`app/src/core/`, `app/src/data/`) | Campo de visión, espectro al vuelo, cargador dual (`data-sample/` + `data-new/`) y pruebas automáticas apoyados con asistente (`[CONFIRMAR con Cons el resto]`). | Revisión de Joaquín y pruebas unitarias ejecutadas con `npm test` (`64/64`), `npm run typecheck`, `npm run check-data` y revisión manual en `1440 px` y `390 px`. |
| Clasificador de tipo de objeto (`ml-clasificador/`) | El asistente escribió los scripts de entrenamiento (`entrenar.py`, `entrenar_v2.py`), reentrenamiento v2 e inferencia en JavaScript (`predecir.mjs`, `probar-paridad-v2.mjs`). | Horacio detectó fuga por distancia en la v1 (`movimiento propio`, `paralaje`, `magnitud G`) y la etiqueta errónea de `Wolf 489` (`Gaia DR3 3713594960831605760`), armando el catálogo verificado de 69 objetos (`78.3%`, `54/69`, `p = 0.0323` en `resultados_v2.json`); Joaquín revisó la evaluación dejando uno fuera y Cons/Joaquín verificaron la paridad JS/Python. |
| Canalización de datos (`pipeline/`, `data-new/`) | `[CONFIRMAR con Horacio]`. | Horacio ejecutó y validó `pipeline/sparkspipe/` sobre `wise0855`, `epsindib`, `rwaur` y `rdra`, detectó la saturación de `R Draconis` (`534/534` cuadros) e identificó las correcciones de coordenadas de `ε Indi A/B`. |
| Investigación, cobertura IRSA y prueba S3 en navegador (`docs/sprint-13-30/`) | Asistencia en scripts Python sin dependencias externas (`cobertura.py`, `recortes.py`) y prueba HTML (`s3-range-test.html`) más diagnóstico técnico (HTTP `503`, `/SIA2` → `404`, `spherex_qr2` → `0` filas en SIA). | Carlos ejecutó en vivo `109` consultas SIA sobre `36` objetos (`cobertura.csv`), descargó y verificó `578` recortes (`0/578` con `EPSF`) y corrió en vivo `s3-range-test.html` en Firefox headless (`14-nov`, `22:08–22:15 MST`), corrigiendo el corte de cabecera (`23,040 B` a bloques dinámicos de `28,800 B`), lectura big-endian `BITPIX = -32`, inversión `TAN + SIP` y validando igualdad exacta contra Python (`FNV-1a = 1bc318be`). |
| Planes de trabajo, reglas y documentos (`docs/reto/`, `docs/auditoria/`, `docs/entrega/`, `README.md`) | Redactados y actualizados con apoyo de asistentes de SI. | Joaquín revisó reglas oficiales (`docs/reto/normas.md`), aplicó el protocolo de prueba congelada una sola vez y auditó que cada cifra tuviera fuente; Carlos redactó y ajustó las piezas de entrega (`pagina-equipo-en.md`, `video-30s-guion-en.md`, `diapositivas-outline.md`, `checklist-qa.md`) sin afirmaciones de descubrimiento. |
| Logo e ilustraciones (`Logo/`, `branding/`) | `ASSETS_CREDITS.md` indica que los íconos y astros se dibujaron en SVG por el equipo (`[CONFIRMAR si el logo usó alguna herramienta de SI]`). | Revisión visual del equipo; `Logo/` permanece intacto. |

---

## 3. Para qué no se usó

- **Las imágenes del cielo no están generadas ni retocadas con SI.** Son datos públicos de SPHEREx bajados de NASA/IPAC IRSA y procesados con código propio.
- **Ninguna cifra científica la produjo un modelo de lenguaje.** Los movimientos propios, el ruido, las banderas y los espectros salen de la canalización y de los archivos de datos; la app los lee de ahí.
- **La app no llama a ningún servicio de SI cuando alguien la usa.**
- **El clasificador de tipo de objeto** (`ml-clasificador/resultados_v2.json`) es un bosque aleatorio (*random forest*) entrenado por el equipo con 69 objetos de clase verificada (`78.3%`, `54/69`). Es aprendizaje automático clásico, no un modelo generativo, y se presenta como candidato a clase, con sus límites.
- **No hay música, voz ni video generados con SI en el repositorio.** `[CONFIRMAR para el video de 30 segundos cuando se grabe.]`

---

## 4. Versión en inglés (para el sitio)

> **Use of SI tools.** We used AI coding assistants during development: Claude (Anthropic) via Claude Code (recorded in Git `Co-Authored-By` trailers across 49 of 74 integration commits with Claude Sonnet 5.5, Opus 5.5, and Fable 5.2) for front-end UI iterations, automated tests, classifier training/inference scripts, and integration docs; and terminal/IDE LLM agents (including Gemini / Antigravity) on branch `carlos` for standard-library IRSA SIA coverage checks, cutout downloads, the browser S3 `Range` CORS test, and draft submission docs. Team members set the architecture and visual direction, chose between iterations, checked live browser behavior (`1440 px` and `390 px`, `64/64` tests), reviewed scientific validity (removing 3 distance-biased features and a mislabeled object in the v2 classifier catalog), verified coordinates and saturation limits, and validated byte-for-byte S3 FITS reads against Python. `[CONFIRMAR / ADD whether Cons and Horacio used any local SI tools.]`
>
> SI was not used to create or alter any sky image: every image is public SPHEREx data from NASA/IPAC IRSA processed by our own code. No scientific number in Sparks was produced by a language model: proper motions, noise, flags, and spectra are computed from the data. The app calls no SI service at run time. Our object-type classifier is a classical random forest trained on 69 objects with a verified class (`78.3%` leave-one-out accuracy, `54/69`); it is shown strictly as a candidate class with its limits. No SI-generated audio, voice, or video exists in the repository.
