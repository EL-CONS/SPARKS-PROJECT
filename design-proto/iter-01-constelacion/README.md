# Iteración 1 · Constelación

**Rama:** `iter/01-constelacion` · **Base:** kit de iteración `iter/kit` (fondo infinito con astros, gráficas que responden, sobre Cosmos).

## Qué combina
- **De Cosmos:** el fondo de estrellas, ahora infinito: tres capas derivan en la diagonal ↗ del logo y dan la vuelta sin fin, con un paralaje suavizado y los cinco astros del reto cruzando el cielo con su nombre:
  - Barnard con su estela;
  - WISE 0855 con sus bandas;
  - ε Indi B como dos enanas que giran una alrededor de la otra;
  - RW Aurigae, que se enciende y se apaga;
  - R Draconis, que respira.
  - De vez en cuando pasa un cometa.
- **Del Club de exploradores:** la misión en tres pasos y el tono amable (Nunito).

## Qué cambia en botones y tarjetas
- **Sin tarjetas.** El contenido flota sobre el cielo, separado por aire y por la línea de la ruta que une las estrellas de los pasos 1, 2 y 3.
- **Botón "chispa".** Una píldora de contorno con un punto azul que, al pasar el cursor, se vuelve ámbar y salta hacia arriba a la derecha (antes → ahora). El principal es ámbar con el punto azul.
- **Objetivos en un mapa.** Se eligen sobre un mapa de todo el cielo, cada uno en su RA/Dec real.

## Gráficas: qué te dice cada una
Cada título es la respuesta. Por ejemplo: "Se mueve 10.23 ± 0.43″ por año. Gaia DR3 esperaba 10.39. Coinciden". Las etiquetas van sobre las marcas, sin leyendas que buscar. La huella de 102 colores se reemplazó por una barra: "No pudimos medir su color: 354 de 355 fotos salieron saturadas".

## Validación
Typecheck, Vitest 13/13 y build correctos. Detector de Impeccable: 1 aviso `bounce-easing` en el salto del punto de los botones (intencional y breve).
