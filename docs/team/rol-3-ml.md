# Rol 3 · ML y validación

## 1. Qué te toca
Eres dueño de **cómo decide Sparks qué es un "mover"** y de **cómo sabemos que no nos engañamos**.
Eso incluye la regla transparente (`candidates.py`), el Spark Detector (LightGBM, `ml.py`) y el protocolo de validación y prueba.
La primera sesión cometió un error clásico: ajustó la regla viendo las estrellas de prueba. Tú eres el guardián de que no vuelva a pasar.
Tus resultados viven en `models/report/` y en `results/results.json`.
Tu frase para el jurado: "separamos validación y prueba antes de mirar, y la prueba se corrió una sola vez".

## 2. Conceptos que debes dominar
| Concepto | Lecturas |
|---|---|
| Fuga de datos y validación honesta | scikit-learn "Common pitfalls" https://scikit-learn.org/stable/common_pitfalls.html · "Cross-validation" https://scikit-learn.org/stable/modules/cross_validation.html |
| Métricas: F1, matriz de confusión, completitud (recall) y pureza (precision) | scikit-learn "Model evaluation" https://scikit-learn.org/stable/modules/model_evaluation.html |
| Gradient boosting / LightGBM | LightGBM docs https://lightgbm.readthedocs.io/ (Features, Parameters Tuning) |
| Inyección y recuperación (cómo los astrónomos miden completitud) | Hogg, Bovy & Lang https://arxiv.org/abs/1008.4686 (modelos generativos) · ✔ Source discovery tool demo de IRSA https://caltech-ipac.github.io/irsa-tutorials/spherex-source-discovery-tool-demo/ |
| Restas de imágenes y dipolos | Wikipedia "Blink comparator" https://en.wikipedia.org/wiki/Blink_comparator · ✔ Backyard Worlds https://en.wikipedia.org/wiki/Backyard_Worlds |
| CNN para imágenes (futuro) | CS231n (Stanford, abierto) https://cs231n.github.io/ |

## 3. Archivos del repo a leer, en orden
1. `models/report/test_protocol.md`: el protocolo; la división validación / prueba final y la semilla.
2. `models/report/final_test.md`: el resultado de la prueba final, por estrella.
3. `docs/methods.md` §7 y §7b.
4. `pipeline/sparks/candidates.py`: `residuals_in_diff` (dipolos y lóbulos a través de un núcleo saturado), `features_for`, `rule_label_why`, `find_candidates`.
5. `pipeline/sparks/ml.py`: `inject` (incluye movedores saturados), `label_real` (etiquetas débiles), `build_set`.
6. `scripts/train_ml.py`: entrenamiento en desarrollo, métricas en validación.
7. `scripts/eval_known_movers.py`: la evaluación con estrellas conocidas y el candado de "una sola vez".
8. `DECISIONS.md`: todas las entradas de regla y ML (ojo con las marcadas "superado por").

## 4. Ejercicios de replicación
1. **Leer un candidato (20 min).** Abre `app/public/fields/barnard/manifest.json → candidates[0]`. Explica en voz alta cada rasgo y por qué la regla le puso esa etiqueta.
2. **La regla a mano (30 min).** Escribe tu propia versión de `rule_label_why` en 15 líneas y compárala con la del repo sobre los candidatos de los 9 campos de desarrollo.
3. **Una inyección (45 min).** Usa `ml.inject` sobre un campo de desarrollo con `n_src=5` y dibuja la resta con y sin inyecciones. Encuentra los dipolos a ojo.
4. **Completitud (1 h).** Repite la inyección 20 veces con S/N fijo (10, 20, 40) y mide qué fracción recupera la regla.
5. **Rehacer desde cero (3 h): la curva de completitud.** En `notebooks/rol3_completitud_desde_cero.ipynb`: entrena tu propio LightGBM **solo con campos de desarrollo**, evalúalo **solo en validación**, y reproduce la curva completitud vs S/N de `models/report/completeness.png`. No toques los campos de prueba final.

## 5. Preguntas del jurado sobre tu parte
- **¿Cómo saben que no es ruido?**
  - *Corta:* probamos con estrellas veloces conocidas que nunca usamos para ajustar nada, una sola vez, y reportamos el resultado tal cual (`models/report/final_test.md`).
  - *Larga:* primero cometimos un error: ajustamos la regla viendo las estrellas de prueba. Lo reconocimos, convertimos esas estrellas en conjunto de desarrollo, elegimos estrellas nuevas de Gaia DR3 con un criterio escrito antes, las dividimos por sorteo con semilla fija en validación y prueba, congelamos regla y modelo con su hash y corrimos la prueba una vez.
- **¿Por qué no usan solo ML?**
  - *Corta:* la decisión se tomó con la prueba final, no antes: ver `final_test.md` y `DECISIONS.md`.
- **¿Con qué entrenaron?**
  - *Corta:* con fuentes falsas inyectadas en las sumas reales (mismo ruido, mismos defectos), incluidas estrellas saturadas; etiquetas exactas.
  - *Larga:* las clases "static" y "artifact" usan etiquetas débiles de residuos reales; los movers conocidos nunca entran al entrenamiento.
- **¿Cuántas estrellas tiene la prueba? ¿No son pocas?**
  - *Corta:* sí, son pocas; por eso damos el detalle estrella por estrella. Con Yuca se puede probar con cientos (ver `docs/team/yuca.md`).

## 6. Antes del 14 y durante el hackatón
**Antes del 14:**
- [ ] Ejercicios 1–4 y el notebook del 5.
- [ ] Releer `test_protocol.md` y `final_test.md` hasta poder contarlos sin papel.
- [ ] Revisar que `make test` (incluye `check_numbers.py`) pasa.

**Durante el hackatón:** no se vuelve a correr la prueba final. Si se mejora algo, se valida en validación y se dice "no probado en prueba final". En la presentación respondes las preguntas de validación.

## 7. Hoja de ruta de mejoras
1. **Prueba con cientos de estrellas conocidas** (Gaia DR3 con μ > 0.5″/año y bases de tiempo más largas) en Yuca (medio).
2. **Más inyecciones y más campos de entrenamiento** en Yuca (medio).
3. **CNN sobre recortes de la resta** (alto) comparada contra LightGBM con el mismo protocolo.
4. **Asteroides** como clase "mover rápido" (medio, con el rol 1).
5. **Calibrar probabilidades** del ML (bajo).
