# Procedencia: qué material viene de antes del hackatón (E4)

Regla (de `docs/reto/normas.md`, punto 5): "Los equipos no tienen permitido empezar a trabajar en los retos antes del hackatón". El hackatón es el 14 y 15 de noviembre de 2026.

**Este documento no decide nada.** Es el inventario para que Joaquín decida. No consta en los documentos que tenemos cómo interpreta la organización esta regla (investigación previa, ideas, datos públicos); eso lo diría el texto oficial o el Líder Local.

## Cómo se hizo

Git no sirve para fechar: el primer commit de todo el repositorio es del 14 de noviembre a las 10:58 (`8680db1`), así que `git log --follow` da el 14 para todo. Las fechas de abajo salen del contenido: campos `generated_utc` y `pipeline_version` de los manifiestos, y fechas escritas en los textos (búsqueda de `2026-11-01` a `2026-11-13` y "N de noviembre" en todas las ramas).

## Material con fecha anterior al 14 de noviembre

| Material | Rama | Evidencia de fecha | ¿Se ve en la app o en la entrega? |
|---|---|---|---|
| `data-sample/barnard/` (382 archivos: imágenes, cubos, catálogos) | `joako`, `cons`, `frontend-del-cons` | `manifest.json`: `generated_utc` 2026-11-05T09:50:08Z, `pipeline_version` 0.3.0 | **Sí: es lo único que la app muestra hoy** |
| `data-sample/index.json`, `data-sample/results.json` | las mismas | `results.json`: `generated_utc` 2026-11-06 01:40 UTC. Trae 13 campos y una "prueba final" de un detector que no está en el repositorio | Sí: lista de objetivos y cifras de movimiento de los campos sin fotos |
| `data-sample/README.md` | las mismas | Dice "versión 0.3.0 del pipeline, generados el 2026-11-05" | No |
| `models/report/` (4 informes de validación de un clasificador LightGBM) | todas | Fechas de noviembre previas al 14 dentro del texto; el código (`ml.py`, `scripts/train_ml.py`) no está en el repositorio | No en la app. `docs/pitch/team-page-en.md` cita sus resultados (8 de 9, 6 de 9) |
| `research/planetx/` (11 documentos y `scratch/` con cobertura de IRSA) | todas | Fechas del 11 y 12 de noviembre en el texto | No en la app; base del concepto y del pitch |
| `CONTEXTO.md` | todas | "actualizado 11 de noviembre de 2026"; menciona un prototipo previo y una llamada del 11 | No |
| `docs/pitch/slides-outline.md`, `docs/pitch/fuentes.md` | todas / `joako` | Fechas previas en el texto | Sí, si se usan para la presentación |
| `docs/pitch/team-page-en.md`, `docs/pitch/video-30s-en.md` | `joako` | "real runs, 5 Nov 2026"; cifras de la canalización 0.3.0 | **Sí: son los textos que se pegarían en la entrega** |
| `docs/compliance.md`, `docs/design-audit.md`, `docs/team/` (roles, notebooks, cola de Yuca) | `joako` | Describen una aplicación anterior y pruebas "del 5 de noviembre" | No |
| `PRODUCT.md`, `ESQUELETO-UX.md`, `SKILLS-UX.md` | varias | Fechas previas en el texto | No |
| `Logo/`, `branding/sparks/` | todas | Sin fecha en el contenido. `team-page-en.md` dice que el nombre Sparks viene de un proyecto anterior del equipo | Sí: el logo |

## Material hecho durante el hackatón

| Material | Evidencia |
|---|---|
| `data-new/` (WISE 0855, ε Indi B, RW Aurigae, R Draconis) | `generated_utc` del 2026-11-15 entre 01:02 y 01:57 UTC, es decir, 14 de noviembre entre 18:02 y 18:57 de Hermosillo; `pipeline_version` 0.1.0 |
| `pipeline/` (`sparkspipe`), `docs/pipeline/` | Rama `Horacio`, commits del 14 de noviembre |
| `app/` completa (front, pruebas) | Commits del 14 de noviembre desde las 12:00 |
| `ml-clasificador/` | Commit `5a8e8f0`, 14 de noviembre 18:52 |
| `docs/sprint-*`, `docs/reto/`, `docs/auditoria/`, `docs/entrega/` | 14 de noviembre |

No se puede comprobar desde el repositorio si `pipeline/` de Horacio reutiliza código de la canalización 0.3.0 anterior. Eso lo sabe Horacio.

## Opciones para Joaquín

1. **Regenerar Barnard con `pipeline/` de Horacio** y dejarlo en `data-new/barnard`. Quita de la app todo dato anterior al hackatón. Costo: una corrida de la canalización (Horacio sabe cuánto tarda; los otros cuatro salieron en menos de una hora) y depende de que IRSA responda. Después hay que retirar `data-sample/` o dejarlo fuera del build, y rehacer las cifras de `team-page-en.md` y del video.
2. **Retirar lo previo.** Sacar `data-sample/`, `models/report/`, `docs/compliance.md` y las cifras del 5 de noviembre de los textos de entrega. Si no se regenera Barnard, la app se queda sin su mejor demostración hasta que el cargador de Cons lea `data-new/`.
3. **Declararlo.** Dejar todo y decir en la entrega, con fechas, qué se preparó antes (investigación del 11 y 12, un campo de prueba del 5) y qué se construyó el 14 y 15. Es lo más rápido; el riesgo es que la organización lo considere trabajo adelantado.

Las opciones 1 y 3 se pueden combinar: regenerar Barnard y declarar la investigación previa.

Pase lo que pase, **`docs/pitch/team-page-en.md` y `video-30s-en.md` hay que corregirlos**: dicen que las corridas son del 5 de noviembre y citan cifras que ya no coinciden con `data-new/`.
