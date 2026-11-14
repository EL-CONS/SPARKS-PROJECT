# Yuca (supercomputadora de la Unison) para Sparks

**Estado:** el proyecto **no vive en Yuca** y el agente **no tiene acceso**. Nada de este archivo se ha corrido allá. Todo lo marcado **[CONFIRMAR]** lo tiene que verificar el equipo con los administradores antes de usarlo.

## 0. Lo que hay que confirmar primero
| Pregunta | Por qué importa | Respuesta |
|---|---|---|
| ¿Gestor de colas? (Slurm, PBS, otro) | Las plantillas de abajo son para Slurm | [CONFIRMAR] |
| Particiones / colas y límites de tiempo | Para `--partition` y `--time` | [CONFIRMAR] |
| ¿Hay GPU? ¿Cuáles? | Solo para la CNN (tarea E) | [CONFIRMAR] |
| ¿Python 3.12 o `uv`/conda disponibles? ¿Módulos (`module load`)? | Entorno reproducible | [CONFIRMAR] |
| ¿Los nodos de cómputo tienen salida a internet? | Para bajar de IRSA. Si no, se baja desde el nodo de login o un nodo de transferencia | [CONFIRMAR] |
| Espacio en disco por usuario / scratch y su política de borrado | La tarea A puede ocupar decenas de GB | [CONFIRMAR] |
| Política de uso (cuentas, horas, reconocimiento en publicaciones) | Para citar el uso de Yuca | [CONFIRMAR] |

## 1. Qué tareas de Sparks se benefician del clúster
| Tarea | Para qué | Prioridad |
|---|---|---|
| **A. Descargar una vez** los recortes de muchos campos a disco del clúster | Base para todo lo demás; respeta a IRSA | 1 |
| **B. Prueba con cientos de estrellas conocidas** (Gaia DR3, μ > 0.5″/año) | Que la validación no dependa de ~10 estrellas | 1 |
| **C. Entrenamiento del ML con muchas más inyecciones y campos** | Curvas de completitud con barras de error pequeñas | 2 |
| **D. Reprocesar todos los objetivos con la ePSF oficial** | Flujos absolutos y espectros de estrellas brillantes | 2 |
| **E. CNN sobre recortes de las restas** | Comparar contra LightGBM con el mismo protocolo | 3 |
| **F. Búsqueda de movedores en muchos campos** (p. ej. una franja de cielo) | Candidatos nuevos para revisar (nunca "descubrimientos" sin verificación) | 3 |

## 2. Detalle por tarea
Medidas de referencia en una laptop (5 nov 2026): lectura parcial ~0.4 s por imagen con 6 peticiones en paralelo; un campo de 64×64 con ~300 imágenes ocupa ~120 MB de caché `.npz`; procesarlo (sumas, registro, restas, astrometría, fotometría) toma unos minutos de CPU con ~2–4 GB de RAM.

### A. Descarga
- **Entrada:** lista de campos (RA, Dec) — p. ej. `models/report/test_protocol.json` o una tabla de Gaia.
- **Salida:** `data/cache/` (recortes `.npz` 80×80 por imagen y detector).
- **Datos:** ~300–500 imágenes por campo × ~0.3 MB por recorte ≈ 120 MB por campo. 500 campos ≈ 60 GB.
- **Tiempo:** limitado por IRSA, no por CPU: con concurrencia 6, ~2–4 min por campo → 500 campos ≈ 1 día. **No subir la concurrencia.**
- **Paralelizar:** NO en paralelo masivo contra IRSA. Un solo trabajo de descarga secuencial por campos (o 2 como máximo), en el nodo con internet.

### B. Prueba con cientos de estrellas conocidas
- **Entrada:** Gaia DR3 con μ > 500 mas/año, G < 19, cobertura ≥ 2 temporadas, desplazamiento esperado ≥ 0.5 px (mismo criterio que `scripts/select_test_stars.py`, con otro umbral y la lista de campos ya descargados).
- **Salida:** un `final_test.json` por lote, con el mismo formato de `scripts/eval_known_movers.py`.
- **Memoria/tiempo:** ~4 GB y ~5 min por campo; 300 campos ≈ 25 h-CPU.
- **Paralelizar:** un arreglo de trabajos (`--array`), **uno por campo**. Sin red (los datos ya están en disco).
- **Protocolo:** la división validación/prueba se escribe y se hace commit **antes** de procesar, igual que en `test_protocol.md`.

### C. Entrenamiento grande del ML
- **Entrada:** los `.pkl` de campos de desarrollo y validación (nunca prueba).
- **Salida:** `models/spark_detector.txt`, `models/report/metrics.json`.
- **Memoria/tiempo:** construir el conjunto es lo caro (`build_set`: ~1–3 min por campo y 8 corridas); 200 campos × 30 corridas ≈ 50–100 h-CPU; LightGBM entrena en minutos.
- **Paralelizar:** arreglo por campo para `build_set` (cada uno guarda su `.pkl` de filas); un trabajo final junta y entrena.

### D. ePSF oficial
- **Entrada:** la extensión `EPSF` de QR3 (hay que añadir su lectura a `remote_fits.py`; rol 1) y los campos existentes.
- **Salida:** campos regenerados; números nuevos en `results/results.json` (luego `check_numbers.py`).
- **Memoria/tiempo:** la ePSF agrega ~4–5 MB por imagen si se baja completa; leerla una vez por detector y época basta. ~10 campos → horas.
- **Paralelizar:** por campo.

### E. CNN
- **Entrada:** recortes 15×15 de las restas alrededor de cada candidato (6 detectores = 6 canales), con las mismas etiquetas que el ML.
- **Salida:** modelo + reporte con el mismo protocolo (validación / prueba).
- **Memoria/tiempo:** ~10⁵ recortes caben en RAM (< 1 GB); con GPU, minutos por época. [CONFIRMAR GPU]
- **Paralelizar:** un trabajo con GPU; la generación de recortes por campo en arreglo.

### F. Búsqueda en muchos campos
- **Entrada:** una rejilla de campos (p. ej. 6.6′ en una franja).
- **Salida:** candidatos con su regla y el ML como segunda opinión; lista para revisión humana.
- **Datos:** el cielo completo es ~10⁶ campos de 6.6′: **no** es realista con lecturas a IRSA. Empezar con una franja pequeña (100–1000 campos) o usar el acceso por nube (AWS Open Data).
- **Paralelizar:** por campo.

## 3. Plantillas
Están en [`yuca/`](yuca/). Son para **Slurm** (si Yuca usa otro gestor, se adaptan las líneas `#SBATCH`):
- `yuca/env_setup.sh`: crea el entorno una vez.
- `yuca/download_fields.sbatch`: tarea A (un trabajo, secuencial, respeta a IRSA).
- `yuca/process_array.sbatch`: tareas B, C, D, F (arreglo, un campo por índice).
- `yuca/train_ml.sbatch`: tarea C (paso final).

## 4. Recomendación
1. Bajar los datos **una sola vez** a disco del clúster (tarea A) con concurrencia baja (6, como en la laptop), y procesar desde ahí todas las veces que haga falta.
2. Copiar `data/cache/` de vuelta a la laptop solo para los campos que vayan a la app.
3. Mantener el protocolo: cualquier "prueba" nueva se define y se hace commit antes de mirarla.
4. Anotar cada corrida en `yuca-queue.md` (qué, cuándo, quién, resultado).
