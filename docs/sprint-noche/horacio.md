# Trabajo de la noche · Horacio

Sábado 14 de noviembre de 2026, 19:30 en adelante. El hackatón cierra a las 20:00 y la entrega local es el domingo de 8:00 a 12:00.

## Mensaje para ti

Horacio, respondiste justo a lo que te pedí: WISE 0855 en D5 y D6 con 6.04 ± 0.76″/año (2.7 sigma contra 8.09), el índice de frío, y `results.json`. Hay una cosa que no cuadra y es lo más urgente.

**El índice de frío de WISE 0855 está contaminado por la estrella vecina.** En `data-new/wise0855/manifest.json` sale `short_mjy` = 0.534 y `long_mjy` = 0.442: la banda corta es más brillante que la larga, el cociente da menos de 1. Una enana Y debe ser al revés. El procesamiento anterior daba 0.007 mJy en corto y 0.31 en largo. Tu propio aviso explica por qué: la estrella de fondo a 9″ (1.5 píxeles) domina las bandas cortas. Con ese valor, el clasificador y la regla dirían que WISE 0855 no es fría, y es el objeto más importante de la demo.

## Tareas, en orden

1. **Arreglar el flujo corto de WISE 0855.** Enmascara o resta la estrella vecina (por ejemplo, ajustando su PSF con las estrellas del campo) antes de medir en D1 a D4, o reporta un límite superior donde no se detecte (como hacías antes con el límite inferior del cociente). Vuelve a calcular el cociente F_D6/F_D2 y la profundidad de metano, con su incertidumbre, y actualiza `manifest.json`, `results.json` e `index.json`. Si no se puede limpiar, el manifiesto lo dice con un código claro.
2. **Revisar el clasificador de ML con ojo científico.** Está en `ml-clasificador/` (rama `joako`, commit `5a8e8f0`). Lee su `README.md` y `entrenar.py`: bosque aleatorio sobre 36 objetos de tu lista con variables de Gaia, 91.7 % dejando uno fuera. Dime si ves fugas de información (por ejemplo, el movimiento propio `log10_mu` correlaciona con la clase y viene de catálogos, no de lo que mide la app), clases mal etiquetadas o afirmaciones exageradas. Propón mejoras concretas: qué variables de SPHEREx (cociente D6/D2, metano) conviene añadir y para qué objetos las tenemos. Entrégalo en `docs/ml/revision-ciencia-clasificador.md`.
3. **Ampliar la lista de objetos con clase verificada** de 36 a 60 o más, con las mismas reglas de siempre: fuente por fila (SIMBAD, el espejo de Harvard si CDS no responde, o artículo con arXiv o DOI), `source_id` de Gaia, columna `aislado`. Prioriza enanas marrones y variables, que están mal representadas (8 y 6). Más datos es lo que vuelve creíble al ML. Súbelo a `docs/sprint-13-30/verdad-terreno.csv` y la fotometría a `gaia-fotometria.csv`, y avísame para reentrenar.
4. **ε Indi B para el pitch.** Ya documentaste el respaldo técnico (DR1 contra DR1 más QR3). Deja en una página qué decir si preguntan por la diferencia de 15° en el ángulo de posición entre los dos ajustes.

## Reglas
Español, sin emojis. Cada afirmación con fuente o "sin verificar". "Candidatos", no "descubrimientos". No toques `data-sample/` ni `Logo/`. Pull request a `main` con lo que esté listo.
