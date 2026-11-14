# Cola de trabajos para Yuca

Cada vez que algo no cabe en la laptop, **no se corre**: se anota aquí. El equipo lo corre después (ver `yuca.md` para el entorno y las plantillas). Al correrlo, agreguen la fecha, quién, el commit y el resultado.

Formato: qué · por qué · comando exacto · recursos estimados · resultado esperado · estado.

---

### Q1 · Prueba con ~300 estrellas conocidas (μ > 0.5″/año)
- **Por qué:** la prueba final de esta sesión tiene pocas estrellas (las que cumplen μ ≳ 3″/año con ~1 año de base). Con más estrellas, la tasa de recuperación tiene una barra de error útil.
- **Comandos:**
  1. En la laptop, definir y hacer commit del protocolo **antes** de procesar: copiar `scripts/select_test_stars.py` a `select_test_stars_big.py` con `pm > 500`, `MAX = 300`, sin estrellas de los protocolos anteriores; `python scripts/select_test_stars_big.py` → `models/report/test_protocol_big.json`.
  2. En Yuca: `sbatch --export=FIELDS=models/report/test_protocol_big.json docs/team/yuca/download_fields.sbatch`.
  3. `sbatch --array=0-299%20 --export=FIELDS=models/report/test_protocol_big.json docs/team/yuca/process_array.sbatch`.
  4. Evaluar con `scripts/eval_known_movers.py` adaptado para leer `test_protocol_big.json` (copiar la lógica del candado de una sola vez).
- **Recursos:** ~36 GB de caché; descarga ~1 día (limitada por IRSA, concurrencia 6); proceso ~25 h-CPU, 4 GB por trabajo.
- **Esperado:** fracción de movers recuperados por la regla y el ML en función de S/N y desplazamiento; la mayoría de estrellas con 0.5–1 px estarán en el límite.
- **Estado:** pendiente.

### Q2 · Entrenamiento del ML con 10× inyecciones y más campos
- **Por qué:** en la laptop se usaron 8 corridas por campo en 9 campos de desarrollo; las curvas de completitud tienen pocas fuentes por bin, sobre todo con saturadas.
- **Comando:** cambiar en `scripts/train_ml.py` `runs=8` → `runs=60` y agregar como desarrollo los campos de Q1 marcados como validación; `sbatch docs/team/yuca/train_ml.sbatch`.
- **Recursos:** ~50–100 h-CPU si `build_set` se paraleliza por campo (hoy es secuencial: separar en arreglo); 16 GB al juntar.
- **Esperado:** completitud con barras de error < 3 % por bin; nueva comparación regla vs ML **en validación** (no en la prueba final ya usada).
- **Estado:** pendiente.

### Q3 · Reprocesar los 9 campos de la app con la ePSF oficial
- **Por qué:** los flujos absolutos llevan ±10–20 % con la PSF gaussiana; la ePSF de QR3 daría espectros de estrellas brillantes y mejores centroides.
- **Comando:** primero implementar la lectura de `EPSF` en `remote_fits.py` y su uso en `photometry.py` (roles 1 y 2); luego `sbatch --array=0-8 --export=FIELDS=fields_app.json docs/team/yuca/process_array.sbatch` con `fields_app.json` generado de `app/public/fields/index.json`.
- **Recursos:** +4–5 MB por imagen si se baja la ePSF por imagen (≈ 3,000 imágenes → 15 GB); horas de CPU.
- **Esperado:** mismos movimientos (± error), espectros con nivel absoluto comparable a la Spectrophotometry Tool de IRSA.
- **Estado:** pendiente (necesita código nuevo).

### Q4 · CNN sobre recortes de las restas
- **Por qué:** comparar una red convolucional contra LightGBM con el mismo protocolo.
- **Comando:** pendiente de escribir (`scripts/train_cnn.py`); 1 GPU.
- **Recursos:** < 1 GB de recortes; minutos por época con GPU [CONFIRMAR GPU].
- **Esperado:** si no supera a LightGBM en validación, no pasa a prueba.
- **Estado:** pendiente (necesita código nuevo).

### Q5 · Campo con un asteroide (galería)
- **Por qué:** mostrar un "mover rápido" que en "Every image" salta entre cuadros.
- **Comando:** primero, en la laptop, buscar con IRSA MOST (https://irsa.ipac.caltech.edu/applications/MOST/) [CONFIRMAR que incluye SPHEREx] o con efemérides de JPL Horizons (https://ssd.jpl.nasa.gov/horizons/) un asteroide de magnitud 12–15 y las imágenes que lo contienen; luego `scripts/process_field_list.py` sobre esa posición y fecha (falta un modo "un solo día" en `process_field`).
- **Recursos:** pocas imágenes; el costo es la búsqueda, no el proceso.
- **Esperado:** un punto que aparece en 1–3 cuadros seguidos y no está en Gaia.
- **Estado:** pendiente (necesita código nuevo).
