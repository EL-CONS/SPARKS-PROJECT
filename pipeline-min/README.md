# Canalización Mínima SPHEREx (`pipeline-min`) · Camino B

## Contexto y Propósito
Canalización mínima de respaldo (Camino B del Sprint 18:00–20:00) desarrollada para procesar recortes crudos de SPHEREx cuando la canalización central no estuviera disponible en el repositorio.

- **Diseñada para:** `RW Aurigae` (estrella variable) y campos adicionales.
- **Formato de datos:** Idéntico al contrato del esquema 1 (`data-sample/barnard/manifest.json`).
- **Etiqueta metodológica obligatoria:** **"subconjunto de cuadros"** (8 cuadros por detector y temporada), sin inflar cobertura ni inventar datos.
- **Coordinación con el equipo:**
  - **Carlos:** Utiliza los recortes crudos descargados por `recortes.py` (evitando descargas duplicadas desde IRSA SIA).
  - **Horacio:** Homologa con las reglas de calidad astronómica y evita discrepancias de método con la canalización científica principal.

## Componentes
- `coadd.py`: Cálculo de coadds por detector y temporada con estadística robusta (mediana y MAD).
- `diff.py`: Resta de coadds entre temporadas sucesivas con alineación de fondo mediano de cielo.
- `manifest.py`: Construcción del archivo `manifest.json` validado contra `data/contract.ts`.
- `run_pipeline.py`: Ejecución de punta a punta, exportación de imágenes PNG calibradas y manifiesto JSON.

## Uso
```bash
python3 pipeline-min/run_pipeline.py \
  --field rwaur \
  --name "RW Aurigae" \
  --ra 76.9561 \
  --dec 30.4012 \
  --input-dir data-raw/rwaur \
  --out-dir data-new/rwaur
```
