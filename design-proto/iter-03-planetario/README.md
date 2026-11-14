# Iteración 3 · Planetario

**Rama:** `iter/03-planetario` · **Base:** `iter/kit` (fondo infinito con astros, gráficas que responden, sobre Cosmos).

## Qué combina
- **De Cosmos:** el fondo de estrellas infinito (en modo tenue, para que la órbita de la portada sea la protagonista), Unbounded y Manrope.
- **Del Club de exploradores:** los personajes de los astros como protagonistas que el niño toca.

## Pantallas
- **Portada (cúpula).** El logo al centro y los cinco objetivos del reto girando en órbita alrededor, muy lento (2 minutos por vuelta), cada uno con su nombre. Tocar uno te lleva a él. Están marcados como ilustración.
- **Exploración.** "¿A dónde miramos?" con los astros como avatares redondos, el cielo grande al centro y una consola de botones redondos debajo: modos con ícono propio, reproducir grande y velocidades.
- **Gráficas como capítulos.** Sin tarjetas: la respuesta grande a la izquierda y la gráfica a la derecha, separadas por una línea fina.

## Qué cambia en botones y tarjetas
- **Botones "dial".** Círculos con su etiqueta debajo, como la consola de un planetario o la app de cámara; el activo se enciende con un anillo ámbar.
- **Sin tarjetas.** Todo es aire, filetes y círculos.

## Validación
Typecheck, Vitest 13/13 y build correctos. Detector de Impeccable: 1 aviso `bounce-easing` en el rebote de los diales (intencional).

Probé en Chromium: portada → exploración (6 detectores) → aviso → reproducción → resta (6 canvas) → 6 gráficas → objetivo "pronto".
