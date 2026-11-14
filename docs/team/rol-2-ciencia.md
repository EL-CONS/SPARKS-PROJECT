# Rol 2 · Ciencia: movimiento y luz

## 1. Qué te toca
Eres dueño de **los números científicos**: movimientos propios con barra de error, espectros, índice de frío y curvas de luz.
Debes poder explicar por qué 10.23 ± 0.43″/año es compatible con 10.39 y qué significa "metano 1.03 ± 0.07".
Tú validas contra la literatura y respondes las preguntas científicas del pitch.
Tu mejora estrella: usar la **ePSF oficial** en lugar de la gaussiana.
Tu frase para el jurado: "cada número trae su barra de error, y lo comparamos con un catálogo independiente".

## 2. Conceptos que debes dominar
| Concepto | Lecturas |
|---|---|
| Movimiento propio y paralaje | Wikipedia "Proper motion" https://en.wikipedia.org/wiki/Proper_motion · "Stellar parallax" https://en.wikipedia.org/wiki/Stellar_parallax · Gaia DR3 https://www.cosmos.esa.int/web/gaia/dr3 |
| Coordenadas y tiempo en Astropy | Astropy coordinates https://docs.astropy.org/en/stable/coordinates/index.html · Astropy time https://docs.astropy.org/en/stable/time/index.html · Learn Astropy https://learn.astropy.org/ |
| Ajuste de modelos y barras de error | Hogg, Bovy & Lang, "Data analysis recipes: Fitting a model to data" https://arxiv.org/abs/1008.4686 |
| Centroides, PSF y ePSF | Wikipedia "Point spread function" https://en.wikipedia.org/wiki/Point_spread_function · photutils (sección PSF/ePSF) https://photutils.readthedocs.io/en/stable/ · ✔ Tutorial PSF de SPHEREx https://caltech-ipac.github.io/irsa-tutorials/spherex-psf/ |
| Fotometría forzada y espectros SPHEREx | ✔ Rustamkulov et al. 2026, espectros SPHEREx de enanas cafés https://arxiv.org/abs/2607.00543 |
| Enanas cafés, tipos T/Y, metano | Wikipedia "Brown dwarf" https://en.wikipedia.org/wiki/Brown_dwarf · ✔ Luhman 2014 (WISE 0855) https://web3.arxiv.org/pdf/1405.7350 · ✔ McCaughrean et al. 2004 (ε Indi B) https://arxiv.org/abs/astro-ph/0309256 · Kirkpatrick et al. 2021 (censo de enanas cercanas) https://arxiv.org/abs/2011.11616 |
| CatWISE2020 (movimientos en infrarrojo) | Marocco et al. 2021 https://arxiv.org/abs/2012.13084 |
| Variables: Mira y T Tauri | ✔ Wikipedia "Mira variable" https://en.wikipedia.org/wiki/Mira_variable · Wikipedia "T Tauri star" https://en.wikipedia.org/wiki/T_Tauri_star · ✔ RW Aur dim state https://arxiv.org/abs/1511.01688 |

## 3. Archivos del repo a leer, en orden
1. `docs/methods.md` §4–6: la versión en prosa de todo lo tuyo.
2. `pipeline/sparks/astrometry.py`: `parallax_offsets`, `position_at`, `gaussian_centroid` (vecinas con brillo fijo), `fit_proper_motion` (un punto cero por detector, escala con √χ²).
3. `pipeline/sparks/field.py`: `find_target` (cómo se elige la fuente; por qué falló con Luhman 16), `register`, `analyse_target`, `_lightcurve`, `_joint_pm`.
4. `pipeline/sparks/photometry.py`: `_pix_gauss`, `forced_flux`, `wing_flux`, `cold_index`.
5. `app/public/fields/wise0855/manifest.json` → `target` (`measured`, `expected`, `cold`, `snr`, `gaia_check`).
6. `DECISIONS.md`: entradas de WISE 0855 (vecina de brillo fijo) y de la PSF gaussiana.

## 4. Ejercicios de replicación
1. **Propagar a Barnard (20 min).** Con la posición y el movimiento de Gaia DR3 (época 2016.0), calcula dónde está el 1 de enero de 2026 y cuántos píxeles de 6.15″ avanzó en un año.
2. **Paralaje (30 min).** Con `parallax_offsets`, grafica el bamboleo de WISE 0855 (449 mas) durante 2025–2026. ¿Cuántos píxeles mide?
3. **Centroide (45 min).** En la suma de D6 de ε Indi B (`coadds.bin` del campo o el `.pkl` de `data/fields`), ajusta una gaussiana 2D a la estrella y compara con `target.points`.
4. **Índice de frío (45 min).** Con los puntos de `target.spectrum` de WISE 0855, recalcula el cociente 4.4–5.0 / 1.1–1.6 µm y la profundidad de metano 1 − F(3.15–3.45)/F(3.9–4.1). Compara con `target.cold`.
5. **Rehacer desde cero (3 h): el movimiento de Barnard.** En `notebooks/rol2_movimiento_desde_cero.ipynb`: a partir de las sumas por detector × temporada (ya registradas), mide centroides, quita el paralaje, ajusta una recta por eje con un punto cero por detector y obtén μ con su error. Compáralo con 10.23 ± 0.43″/año (`results/results.json`) y con Gaia.

## 5. Preguntas del jurado sobre tu parte
- **¿Cómo miden algo que se mueve menos de 2 píxeles?**
  - *Corta:* no a ojo: con centroides subpíxel en sumas de decenas de imágenes, y un ajuste con barra de error.
  - *Larga:* cada suma da una posición con error de centésimas de píxel; alineamos contra estrellas de referencia (error 0.01–0.05 px) y ajustamos una recta con un punto cero por detector. El error escala con √χ² si el ajuste es peor que el ruido.
- **¿Por qué Barnard no tiene espectro?**
  - *Corta:* satura SPHEREx en todas las imágenes; preferimos no dar un espectro malo.
- **¿El índice de frío es IA?**
  - *Corta:* no. Es física: un cociente de luz entre dos colores y la profundidad de la banda de metano.
- **¿Qué tan buenos son los flujos absolutos?**
  - *Corta:* la forma del espectro es confiable; el nivel absoluto lleva ±10–20 % porque usamos una PSF gaussiana.
  - *Larga:* la ePSF oficial existe en QR3 y es la siguiente mejora; tampoco comparamos aún con la Spectrophotometry Tool de IRSA.
- **¿R Dra cambia de verdad?**
  - *Corta:* sí: baja en los 6 detectores a la vez, de 1.47 a 0.79 (relativo); es una Mira de 246 días. RW Aur solo es sugerente y lo decimos.
- **WISE 0855 pasa encima de una estrella: ¿no contamina?**
  - *Corta:* sí, por eso fijamos el brillo de esa estrella con la temporada en que estaban separadas y solo reajustamos la posición de la enana.

## 6. Antes del 14 y durante el hackatón
**Antes del 14:**
- [ ] Ejercicios 1–4 y el notebook del 5.
- [ ] Revisar cada número científico de `docs/pitch/fuentes.md` contra `results/results.json` y la literatura (temperatura de WISE 0855, tipo de ε Indi B, periodo de R Dra).
- [ ] Ensayar las respuestas de la sección 5 en voz alta, en 20 segundos cada una.

**Durante el hackatón:** si hay tiempo, ePSF oficial en `photometry.py` (con el rol 1). En la presentación respondes las preguntas científicas.

## 7. Hoja de ruta de mejoras
1. **ePSF oficial** para fotometría y centroides (medio) → flujos absolutos, espectros de estrellas brillantes.
2. **Comparar con la Spectrophotometry Tool de IRSA** (bajo).
3. **Ajustar paralaje** con más temporadas (necesita 2027+ de datos).
4. **Espectros de las estrellas de la galería y de la prueba final** (bajo, Yuca para muchos).
5. **Curvas de luz con periodo** cuando haya más visitas (medio).
