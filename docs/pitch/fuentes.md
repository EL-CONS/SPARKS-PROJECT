# Fuentes de cada dato dicho en voz alta

| Dato | Valor | Fuente | Consultado |
|---|---|---|---|
| Plutón se encontró comparando dos placas del mismo cielo con un comparador de parpadeo | Placas tomadas con unos seis días de diferencia en enero de 1930; el hallazgo es del 18 de febrero de 1930 | Linda Hall Library, "Scientist of the Day – Clyde Tombaugh" https://www.lindahall.org/clyde-tombaugh · Wikipedia "Clyde Tombaugh" https://en.wikipedia.org/wiki/Clyde_Tombaugh | 2026-11-05 |
| Tombaugh venía de una granja de Kansas y no había ido a la universidad | Terminó la prepa en 1925; su familia no pudo pagarle la universidad; se tituló en la Universidad de Kansas hasta 1936 (licenciatura) y 1938 (maestría) | Wikipedia "Clyde Tombaugh"; Mental Floss https://mentalfloss.com/article/92359/day-1930-clyde-tombaugh-discovered-pluto | 2026-11-05 |
| Las fuentes no coinciden en su edad (22 o 24) | **No decir la edad en voz alta** | Deseret News 1996 vs Universe Today | 2026-11-05 |
| SPHEREx observa en 102 colores (6 detectores × 17 canales), 0.75–5 µm | — | IRSA SPHEREx archive docs (ver `research/planetx/02-spherex-datos.md`) | 2026-11-05 |
| Imágenes de SPHEREx en el archivo público | **1,607,473** imágenes de detector (QR2 + QR3, colecciones wide + deep, sin calibración) | Consulta propia a IRSA ObsTAP (`ivoa.obscore`), 2026-11-05 09:40 UTC | 2026-11-05 |
| Barnard se mueve ~10.4″ al año | Gaia DR3: 10.39″/año | Consulta propia a ESA Gaia TAP, fuente 4472832130942575872 | 2026-11-05 |
| Sparks mide a Barnard | **10.23 ± 0.43″/año**, dirección 354.8° ± 2.0° (Gaia: 355.6°) | Corrida del pipeline (`app/public/fields/barnard/manifest.json`) | 2026-11-05 |
| ε Indi B | Sparks 4.54 ± 0.11″/año; Gaia 4.68″/año | Corrida del pipeline | 2026-11-05 |
| WISE 0855 se mueve | Sparks 7.91 ± 1.35″/año (dirección 275.5° ± 9.7°); CatWISE 8.09″/año, 277.4° | Corrida del pipeline | 2026-11-05 |
| WISE 0855 no está en Gaia DR3 | La fuente Gaia más cercana a su posición de 2016 está a 10.7″ | Corrida del pipeline (cono Gaia DR3 de 6′) | 2026-11-05 |
| WISE 0855 es la enana café más fría conocida, ~250 K (≈ −23 °C, "como un congelador"; NO decir "más fría que el polo": el invierno polar es más frío) | — | `research/planetx/03-ciencia.md` (Luhman 2014; Wright et al. 2014) | 2026-11-05 |
| El espectro de WISE 0855 es casi cero bajo 3.7 µm y sube a 4–5 µm; el metano a 3.3 µm se come la luz | Flujo 4.5–4.75 µm ≈ 0.39 mJy; profundidad de metano 1.03 ± 0.07 | Corrida del pipeline | 2026-11-05 |
| La mayoría de enanas cafés y cometas conocidos los encontraron voluntarios con este método | Texto del enunciado del reto | https://www.spaceappschallenge.org/2026/challenges/planet-x-and-spherex/ | 2026-11-05 |
| ~~Hermosillo bajo uno de los cielos más oscuros de México~~ | **Quitado (2026-11-05):** sin fuente sólida. Ningún guion lo dice; el de 5 min solo dice "el desierto apaga casi todo", sin superlativo | — | 2026-11-05 |
| El modelo encuentra más objetos débiles inyectados que la regla | Completitud ML 74 % vs regla 57 % a S/N 20–32 (inyecciones en los 6 campos de validación) | `results/results.json → ml` | 2026-11-05 |
| "Probamos con nueve estrellas veloces que nunca usamos para ajustar nada, una sola vez: encontró ocho, sin falsas alarmas" | Prueba final: regla 8/9 con 0 falsas alarmas; ML 6/9 con 10 | `models/report/final_test.md`, `results/results.json → final_test` | 2026-11-05 |
| "Primero nos equivocamos: ajustamos la regla viendo las estrellas de prueba" | La prueba del 5 nov con seis estrellas quedó como conjunto de desarrollo | `docs/methods.md` §7b, `DECISIONS.md` | 2026-11-05 |
| Error de alineación entre temporadas | 0.01–0.05 px en las sumas de Barnard (estrellas de referencia Gaia/CatWISE) | `manifest.json` → `registration` | 2026-11-05 |
| "Noventa y seis años después" | 2026 − 1930 = 96 | — | — |
| Los objetivos del reto abren al instante (precalculados); un campo nuevo en vivo tarda "un par de minutos" en frío | 59 s con 72 imágenes (M101, D2+D6, 4′, red de casa); otra corrida (M51) tardó ~2 min y no quedó registrada. Decir "un par de minutos" cubre ambas | `results/live_timing.json` (`scripts/time_live.py`) | 2026-11-05 |
| SPHEREx publica datos nuevos con frecuencia; el reto pide una herramienta fácil de actualizar | "New SPHEREx data is arriving fast! Make sure to design a tool that's easy to update with the latest data releases." El enunciado **no menciona ningún lote concreto** (verificado 2026-11-05), así que ya no se dice "el reto mencionaba un lote". Liberación semanal: IRSA overview_qr | https://www.spaceappschallenge.org/2026/challenges/planet-x-and-spherex/ · https://irsa.ipac.caltech.edu/data/SPHEREx/docs/overview_qr.html | 2026-11-05 |
| "La primera vez que vimos las dos flechas juntas, nos quedamos callados" | Momento real del equipo al ver Barnard 10.23 vs Gaia 10.39 | El equipo (confirmar entre los cuatro que lo quieren decir así) | 2026-11-05 |
