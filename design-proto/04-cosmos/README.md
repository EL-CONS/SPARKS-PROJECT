# Diseño 4 · Cosmos

**Rama:** `design/04-cosmos` · **Commit base:** `4a50241` (kit lógico neutro sobre `joako`)

## Concepto
Sparks como una ventana al espacio. Detrás de todo hay un campo de estrellas vivo (canvas, 420 estrellas que titilan y se desplazan apenas con el puntero) y una luna con cráteres. La pestaña de inicio es una llegada: el logo flota en una órbita punteada que gira muy lento, y la explicación se cuenta con dos luces (azul y ámbar) unidas por una flecha que se dibuja sola. La navegación es un dock flotante abajo, como en un sistema operativo. En exploración, el cielo de SPHEREx es un visor negro con halo ámbar; las temporadas son "lunitas" en una órbita.

## Identidad
- **Paleta.** Espacio profundo (`#02040A`) con brumas verde azulado y cálida (sin violeta). De día cambia el mundo: cielo diurno de celeste a arena, sin estrellas, con una luna pálida de día.
- **Tipografía.** Unbounded (títulos anchos, espaciales), Manrope (texto), Martian Mono (cifras).
- **Forma.** Superficies flotantes de 18 px, píldoras, botones circulares, halos de luz en la acción principal.
- **Gesto propio.** El campo de estrellas con paralaje del puntero y el dock.

## Investigación visual
Referencias revisadas de memoria; no se navegaron en esta sesión.
- "100,000 Stars" (Google Chrome Experiments): navegación inmersiva en un campo estelar.
- NASA Eyes on the Solar System (eyes.nasa.gov): datos reales dentro de una escena espacial.
- Página de producto de Apple Vision Pro y estudios como Lusion y Active Theory: profundidad, superficies flotantes, dock.
- Portafolio de Bruno Simon: lo lúdico dentro de una escena.
- Fuera del sector: el dock de macOS, un patrón de navegación que todos reconocen.

## Funciones
Las mismas que los diseños anteriores:
- pestaña de inicio con logo grande, lema ES/EN, explicación de luces y flecha, CTA y datos;
- búsqueda y cinco objetivos con personajes;
- seis detectores con parpadeo, suma y resta;
- transporte con aviso de destellos y 1–3 Hz;
- temporadas como lunitas, pares de resta y capa de Gaia;
- panel de lectura (medido contra Gaia y ángulo de posición, con error), veredicto y capas de cifras;
- estados pronto, error y carga (anillo de progreso); temas, ES/EN y URL.

## Recursos y licencias
- Fuentes: Unbounded (NORD ID), Manrope (Mikhail Sharanda) y Martian Mono (Evil Martians), todas SIL OFL 1.1, servidas por Google Fonts.
- Campo de estrellas, luna, órbitas y flechas: generados en código (canvas y SVG), propios.
- Logo: copia sin cambios de `Logo/`.

## Validación
Typecheck: sin errores. Vitest: 13/13. Build: correcto. ESLint no está configurado. Detector de Impeccable: 0 hallazgos.

Probé en Chromium real, por el protocolo de depuración y sin interfaz:
- el CTA abre `#explorar` con 6 paneles;
- aparece el aviso de destellos y la reproducción avanza a ago 2026;
- la suma dibuja 6 canvas;
- R Draconis muestra el estado "pronto".

## Fortalezas
Es la de mayor asombro a primera vista y la que más se siente "espacio". El tema de día no es una inversión: es otro cielo.

## Limitaciones
- El campo de estrellas es una animación continua; está limitado a 2× de densidad de píxeles, se detiene con la pestaña oculta y queda quieto con `prefers-reduced-motion`, pero gasta más batería que los demás.
- El dock fijo tapa contenido al pie de cada pantalla.
- Unbounded es muy ancha y pide frases cortas.

## Pendientes
Medir el rendimiento en un teléfono modesto real.
