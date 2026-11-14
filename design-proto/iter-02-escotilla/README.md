# Iteración 2 · Escotilla

**Rama:** `iter/02-escotilla` · **Base:** `iter/kit` (fondo infinito con astros, gráficas que responden, sobre Cosmos).

## Qué combina
- **De Cosmos:** el fondo de estrellas infinito con los cinco astros del reto y el cometa (tenues detrás de la herramienta y con nombre en la portada).
- **Del Club de exploradores:** la misión en tres pasos y la tipografía Baloo 2.

Aquí la misión es un asistente: se ve un solo paso a la vez, con el paso a paso arriba y "Atrás" / "Siguiente" abajo. Elegir Barnard te lleva solo al paso 2.

## Qué cambia en botones y tarjetas
- **Teclas.** Botones gruesos con un azulejo de ícono a la izquierda y una base que se hunde 4 px al pulsar, como una tecla física. El principal es ámbar con base ámbar oscura.
- **Escotillas.** Paneles profundos, sin borde, con un degradado leve y una línea de luz en el borde superior, como una escotilla iluminada desde arriba.
- **Astros como piezas.** Cada objetivo es una pieza que se puede pulsar, con su personaje, su nota y su estado ("fotos listas" o "pronto").

## Gráficas
Las mismas del kit: cada título es la respuesta y las etiquetas van sobre las marcas. En este diseño cada gráfica vive en su propia escotilla.

## Validación
Typecheck, Vitest 13/13 y build correctos. Detector de Impeccable: 1 aviso `bounce-easing` en la entrada del logo (intencional).

Recorrido probado en Chromium por el protocolo de depuración: inicio → paso 2 (6 detectores) → aviso de destellos → reproducción → paso 3 (6 gráficas).
