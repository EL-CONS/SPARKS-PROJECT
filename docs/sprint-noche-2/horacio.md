# Segunda tanda de la noche · Horacio

Sábado 14 de noviembre de 2026, 22:15. Entrega el domingo de 8:00 a 12:00.

## Mensaje para ti

Horacio, tu revisión del clasificador fue lo más valioso de la noche: encontraste que tres variables inflaban el resultado y que había un objeto mal etiquetado. Le hice caso: reentrené sin esas variables y con tus 69 objetos. El resultado honesto es **75.4 % (52 de 69)** dejando uno fuera, enanas marrones 0.90, enanas blancas 0.82, estrellas 0.75 y variables 0.56. Está en `ml-clasificador/` de la rama `joako` (commit `da9bb1c`, README actualizado con el aviso).

Un detalle: en `docs/sprint-13-30/verdad-terreno.csv` el objeto `Gaia DR3 3713594960831605760` (Wolf 489) sigue etiquetado como `estrella`, aunque tu propia revisión lo identifica como enana blanca. El modelo lo llama enana blanca y cuenta como fallo.

## Tareas, en orden
1. **Corrige la etiqueta de Wolf 489** (y cualquier otra que tu revisión haya encontrado mal) en `verdad-terreno.csv`, con su fuente. Avísame para reentrenar.
2. **Revisa mi v2** (`ml-clasificador/entrenar_v2.py` y el README). Dime si ves otra fuga o alguna afirmación exagerada.
3. **Variables que separen las variables.** Con solo Gaia no se separan (recall 0.56). Tu pipeline sí produce lo que hace falta: las imágenes de diferencia de `data-new/` y de Barnard. Propón y calcula, para los campos que tenemos, un par de números que distingan "se movió" de "cambió de brillo" (por ejemplo el balance entre el lóbulo positivo y el negativo de la diferencia, que tú mismo describiste), y dime qué tan separables son con los cinco campos. Esto no es para entrenar con cinco ejemplos: es para saber si vale la pena y con qué datos.
4. **El pitch, con tus cifras.** Revisa `docs/pitch/pitch-3min-es.md` contra los datos nuevos y entrega `docs/pitch/revision-ciencia.md`: cada número del guion con su fuente. Hoy el guion dice WISE 0855 "7.9 contra 8.1", y tu medición nueva es 6.04 ± 0.76 contra 8.09 (2.7 sigma); y dice que se encontraron ocho de nueve estrellas "sin falsas alarmas", cosa que solo vale para la regla. Más: las diez preguntas difíciles que haría una astrofísica, con la respuesta más honesta y su fuente, y un párrafo de "qué no hacemos y por qué".
5. Si queda tiempo: el flujo corto de WISE 0855 sin la estrella vecina (el índice de frío contaminado que te marqué antes).

## Reglas
Español, sin emojis. Cada afirmación con fuente o "sin verificar". "Candidatos", no "descubrimientos".
