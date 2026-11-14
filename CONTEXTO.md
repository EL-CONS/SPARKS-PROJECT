# CONTEXTO · Sparks (actualizado 11 de noviembre de 2026)

Léelo antes de cualquier tarea. Si choca con algo de `PLAN.md`, `DECISIONS.md` o `research/`, **este archivo es más reciente y manda**; anota la diferencia en `DECISIONS.md`.

## 1. El proyecto en corto

- **Concurso:** NASA Space Apps Challenge 2026, sede Hermosillo (UTH).
- **Reto:** *Planet X and SPHEREx*. Herramienta web pública que muestra imágenes de SPHEREx de una zona del cielo (el usuario da RA/Dec) como un pequeño video, para ver qué se mueve. Debe probarse con Barnard's Star, Epsilon Indi B, WISE 0855, RW Aurigae y R Draconis. Las 10 consideraciones del enunciado **son obligatorias para nosotros** (ver `research/planetx/concepto-ganador.md`).
- **Equipo:** Cosmonautas. **Producto:** Sparks.
- **Concepto ("Cold Sparks"):** escribes una posición del cielo, ves las fotos de SPHEREx parpadeando en 6 detectores, y Sparks te dice **qué se mueve** (movimiento medido con barra de error, comparado con Gaia/CatWISE) y **qué es frío** (huella de 102 colores, espectro e índice de frío físico).
- **Momentos wow:**
  - **Barnard's Star (garantizado):** el punto salta entre temporadas y nuestra medida coincide con Gaia.
  - **WISE 0855:** Gaia no la tiene; nosotros sí la vemos, y su huella dice que es fría (apagada en longitudes cortas, encendida a 4–5 µm, metano en 3.3 µm).
- **Lema propuesto:** "Every spark that moves has a fingerprint."

## 2. Fechas

| Fecha | Qué |
|---|---|
| Mié 11 nov | Llamada del equipo: votar ideas y amarrar el plan |
| Jue 12 nov | Versiones corregidas de las ideas, con fuentes |
| Vie 13 nov | Salen Resources del reto y las guías oficiales de envío y jueceo 2026: leerlas y ajustar |
| Sáb 14 nov | Hackatón en la UTH, 10:30–20:00 |
| Dom 15 nov | 8:00–12:00, entrega local. Pitch de 3–5 minutos |

Entregables: app desplegada, repo documentado, página del equipo en inglés, video ≤ 30 s en inglés, presentación en Canva, pitch.

## 3. Equipo y roles

| Persona | Rol | Responsable de |
|---|---|---|
| **Gabriel** | Datos | Bajar imágenes de SPHEREx desde IRSA, limpiarlas, sumarlas y alinearlas; nuevos campos; actualización con releases nuevos |
| **Carlos** | Investigación + cómo se ve | Panorama de otros equipos, guías oficiales, referencias visuales (Backyard Worlds, Aladin Lite); frontend y diseño junto con `DESIGN.md` |
| **Joaquín** | Ciencia y ML + coordinación | Detector de "chispas" (regla física y ML), validación honesta, coordinación del equipo |
| **Horacio** | Ciencia | Física del motor: movimiento propio, índices espectrales, separación movimiento vs variabilidad, verificación de números con fuentes |
| **Todos** | Pitch | Cada quien explica su parte en palabras de humano; una persona narra (se decide en la llamada) |

Nota: Horacio ya **no** lleva ML. Si alguna tarea de ML aparece asignada a Horacio en otro archivo, pásala a Joaquín.

## 4. Ideas sobre la mesa

### Ideas de ciencia de Horacio (con veredicto)

| Idea | Veredicto | Ajuste |
|---|---|---|
| 1. Firma espectral de enanas cafés (razón 1.6/2.2 µm) | **Se queda, ajustada** | Las enanas más frías (WISE 0855) casi no emiten en 1.6 y 2.2 µm. Usar **4.5 µm contra 1.6 µm** y la **banda de metano en 3.3 µm** |
| 2. Paralaje y velocidad angular | **Se queda solo en parte** | Paralaje de estrellas **no** es medible (< 1″ contra píxeles de ~6″). Sí: movimiento propio de estrellas en ″/año; para asteroides, usar la velocidad para estimar qué tan lejos están |
| 3. Temperatura con curva de Planck | **Se quita** | Las enanas cafés no son cuerpos negros. Reemplazar por un **índice de color** (presentado como índice, no temperatura exacta) o, para asteroides, **luz reflejada vs calor propio** |
| 4. Filtro movimiento vs variabilidad | **Se queda** | Es la **regla física** del detector: un objeto que se mueve deja un par antes/después; una variable solo cambia de brillo en el mismo lugar. El ML se compara contra esta regla |

**Correcciones de números pendientes:**
- "TNOs / Planet X < 2″/día" es incorrecto: se mueven bastante más rápido. Buscar fuente.
- Enanas cafés cercanas: de menos de 1″ hasta ~8″/año (WISE 0855), no "~2.7″/año" como regla.
- Una sola unidad por tipo de objeto: ″/día para asteroides, ″/año para estrellas.
- Bandas citadas correctas: agua 1.4 y 1.9 µm; metano 1.66, 2.2 y 3.3 µm; CO₂ 4.26 µm.

### Otras ideas en la mesa (de la investigación)
- **Flipbook por detector** con modos blink, suma, resta y resta contra la mediana (base obligatoria).
- **Clic en una fuente → espectro al vuelo** (fotometría forzada).
- **"Gaia no lo ve":** marcar fuentes brillantes en infrarrojo sin contraparte en Gaia.
- **QR para que el jurado abra un campo en su teléfono.**
- **Detector de chispas:** clases mover / variable / artefacto / residuo estático.
- Detalle en `research/planetx/ideas.md` y `research/planetx/jurado.md`.

### Pendiente de las otras ramas
Las ideas de Gabriel (datos) y Carlos (investigación y visual) se agregan aquí cuando lleguen. Ideas de ML de Joaquín: pendientes.

## 5. Estado del repo y pendientes técnicos

Hay un prototipo en el repo (ver `PROGRESS.md`, `DECISIONS.md`, `docs/methods.md`). Pendientes conocidos:
1. **Validación contaminada:** la regla del detector se ajustó después de ver fallar a Kapteyn y Wolf 359, y luego se volvió a medir con las mismas seis estrellas. El 5/6 **no es independiente**. Hay que hacer una prueba nueva con estrellas nunca usadas, dividiendo validación y prueba final antes de ver resultados, y correr la prueba final una sola vez (ver `prompt-validacion-y-equipo.md` si existe).
2. **Números inconsistentes** entre README, docs, pitch y `DECISIONS.md`: unificar en una sola fuente (`results/results.json`).
3. **Pitch:** aclarar que el modo en vivo tarda un par de minutos, quitar frases sin fuente, agregar el momento real en que la medida de Barnard coincidió con Gaia.
4. **Sin desplegar:** falta GitHub Pages o Vercel y host para la API.

## 6. Reglas

- **Ningún número sin fuente o sin corrida real.** Lo no medido se marca `[[PENDIENTE]]`.
- **Nunca decir "descubrimos" ni "Planet X encontrado".** Decir "candidatos para revisar".
- **Honestidad con el ML:** si no le gana a la regla física en la prueba final, la app usa la regla y el ML se presenta como experimento.
- **Estética prioritaria:** `DESIGN.md` manda. Skills de diseño: `ui-ux-pro-max`, `frontend-design`, `design-taste-frontend`, `web-design-guidelines`. La estética nunca altera los datos científicos.
- **El pitch** va en tono de viaje del héroe, humilde y sin jerga: los jueces de la UTH son físicos e ingenieros de satélites (Mexsat), no astrónomos.
- **Sin subagentes** (gastan demasiados tokens).
- **Yuca** (supercomputadora de la Unison): el equipo tiene acceso, pero el proyecto no vive ahí y el agente **no se conecta**. Lo que requiera mucho cómputo se anota en `docs/team/yuca-queue.md` con comando y recursos estimados.

## 7. Decisiones abiertas (para la llamada o para el 13)

1. Quién narra el pitch.
2. Lema final.
3. Si el modo en vivo se muestra en el pitch o solo los campos precalculados.
4. Qué ideas de Gabriel y Carlos entran al alcance.
5. Ajustes después de leer Resources y las guías oficiales el 13.
