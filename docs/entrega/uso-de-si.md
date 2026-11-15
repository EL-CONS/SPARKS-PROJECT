# Declaración de uso de SI (IA) en Sparks

Las normas del NASA Space Apps Challenge 2026 piden que la entrega describa cómo se usaron herramientas de "Superinteligencia" (SI) durante el desarrollo. Este es el borrador en español; abajo va la versión en inglés para pegar en el sitio.

**Estado: borrador.** Lo marcado con [CONFIRMAR] lo tiene que responder cada persona; no se puede saber desde el repositorio.

## Qué herramienta se usó

Claude, de Anthropic, a través de Claude Code (asistente de programación). Los commits llevan la marca `Co-Authored-By` con el modelo usado: Claude Sonnet 5.5, Claude Opus 5.5 y Claude Fable 5.2.

Al 14 de noviembre a las 20:40, 47 de los 90 commits del repositorio llevan esa marca. Todos son de la cuenta de Joaquín. Los commits de las otras tres cuentas (39) no la llevan; eso no prueba que no usaran SI. [CONFIRMAR con Cons, Horacio y Carlos si usaron algún asistente y para qué.]

## Para qué se usó

| Parte | Uso de SI | Qué hizo una persona |
|---|---|---|
| Interfaz web (`app/src/ui/`, `app/src/styles/`) | El asistente escribió la mayor parte del código de las tres iteraciones de diseño y de la elegida ("Constelación") | Joaquín dio la dirección, eligió entre iteraciones y revisó el resultado en el navegador. Cons integra y mantiene la rama |
| Lógica de la app (`app/src/core/`: coordenadas, URL, reproductor, campo de visión, espectro) | Campo de visión y espectro al vuelo los escribió el asistente, con pruebas automáticas. [CONFIRMAR con Cons el resto] | Revisión de Joaquín; las pruebas corren con `npm test` |
| Clasificador de tipo de objeto (`ml-clasificador/`) | El asistente escribió el entrenamiento y la inferencia en JavaScript | Joaquín eligió los 36 objetos y revisó la evaluación dejando uno fuera |
| Canalización de datos (`pipeline/`, `data-new/`) | [CONFIRMAR con Horacio] | Horacio |
| Investigación (`docs/sprint-*`, `Investigacion.md`, cobertura de IRSA) | [CONFIRMAR con Carlos y Horacio] | Carlos y Horacio |
| Planes de trabajo y documentos (`docs/reto/`, planes de sprint, auditoría de requisitos, este documento, `README.md`) | Redactados con el asistente | Joaquín los revisa antes de usarlos |
| Logo e ilustraciones | `ASSETS_CREDITS.md` dice que los íconos y los astros se dibujaron en SVG por el equipo. [CONFIRMAR si el logo se hizo con alguna herramienta de SI] | — |
| Textos del pitch, página del equipo y guion del video (`docs/pitch/`) | [CONFIRMAR con Carlos] | Carlos |

## Para qué no se usó

- **Las imágenes del cielo no están generadas ni retocadas con SI.** Son datos públicos de SPHEREx bajados de NASA/IPAC IRSA y procesados con código propio.
- **Ninguna cifra científica la produjo un modelo de lenguaje.** Los movimientos propios, el ruido, las banderas y los espectros salen de la canalización y de los archivos de datos; la app los lee de ahí.
- La app no llama a ningún servicio de SI cuando alguien la usa.
- El clasificador de tipo de objeto es un bosque aleatorio entrenado por el equipo con 36 objetos. Es aprendizaje automático clásico, no un modelo generativo, y se presenta con ese límite.
- No hay música, voz ni video generados con SI en el repositorio. [CONFIRMAR para el video de 30 segundos cuando se grabe.]

## Versión en inglés (para el sitio)

> **Use of SI tools.** We used Claude (Anthropic), through the Claude Code assistant, to speed up development: it wrote most of the front-end code, parts of the application logic with their automated tests, the training and inference code of our small object-class classifier, and drafts of our planning and documentation. Team members set the direction, chose between design iterations, and reviewed the code and the results in the browser. [ADD: what Cons, Horacio and Carlos used, if anything.]
>
> SI was not used to create or alter any sky image: every image is public SPHEREx data from NASA/IPAC IRSA processed by our own code. No scientific number in Sparks was produced by a language model: proper motions, noise, flags and spectra are computed from the data. The app calls no SI service at run time. Our classifier is a classical random forest trained on 36 objects and is presented with that limit.
