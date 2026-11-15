# Recortes locales y compartidos en la nube (cuatro campos)

**Fecha:** sábado 14 de noviembre de 2026 · **Rama:** `carlos` · **Script:** [`recortes.py`](recortes.py)

Los recortes de los cuatro campos asignados ya están descargados fuera de Git en `/home/carlos/Documents/SPARKS-PROJECT-data/recortes`. **Horacio y Cons:** los archivos no suben al repositorio; si Horacio no alcanza a subir `pipeline/`, Cons puede tomar directamente estos FITS y los `resumen.json` desde la carpeta compartida.

## Enlace en la nube

- **Carpeta compartida:** `[[PENDIENTE: enlace de la carpeta compartida en la nube]]` (sin cliente ni credenciales de nube en esta máquina; pendiente de subir manualmente)
- **Origen local:** `/home/carlos/Documents/SPARKS-PROJECT-data/recortes` (`578` archivos FITS, `81,783,360 B`; `82,741,594 B` incluyendo JSON)

## Estructura de carpetas

```text
recortes/
├── resumen.json                  (resumen global de los 4 campos)
├── R_Draconis/
│   ├── resumen.json              (144 descargados, 0 faltantes)
│   ├── seleccion.json
│   ├── consultas.json
│   └── temporada_1..3/D1..D6/<obs_id>_<Dx>.fits
├── RW_Aurigae/
│   ├── resumen.json              (144 descargados, 0 faltantes)
│   ├── seleccion.json
│   ├── consultas.json
│   └── temporada_1..3/D1..D6/<obs_id>_<Dx>.fits
├── WISE_0855/
│   ├── resumen.json              (126 descargados, 0 faltantes)
│   ├── seleccion.json
│   ├── consultas.json
│   └── temporada_1..3/D1..D6/<obs_id>_<Dx>.fits
└── Epsilon_Indi_B/
    ├── resumen.json              (164 descargados, 0 faltantes)
    ├── seleccion.json
    ├── consultas.json
    └── temporada_1..4/D1..D6/<obs_id>_<Dx>.fits
```

## Resumen de descarga por campo

Parámetros aplicados en `recortes.py`: hasta 8 cuadros por detector y temporada, `size=0.11` (64 × 64 px), 6 hilos (`--workers 6`), reintentos con espera y eliminación del HDU `EPSF` antes de guardar (conservando `PRIMARY`, `IMAGE`, `FLAGS`, `VARIANCE`, `ZODI` y `WCS-WAVE`). Para WISE 0855 y ε Indi B se propagó la coordenada del catálogo a la época de cada cuadro al centrar el recorte.

| Campo | RA / Dec catálogo | Temporadas | Filas SIA | Seleccionados | Descargados | Faltantes | Bajado (con EPSF) | Guardado (sin EPSF) |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| R Draconis | 248.1674 / +66.7550 | 3 | 539 | 144 | 144 | 0 | 579.2 MB | 20.2 MB |
| RW Aurigae | 76.9561 / +30.4012 | 3 | 335 | 144 | 144 | 0 | 579.5 MB | 20.4 MB |
| WISE 0855 | 133.7951 / −7.2451 | 3 | 258 | 126 | 126 | 0 | 506.9 MB | 17.9 MB |
| ε Indi B | 331.0441 / −56.7828 | 4 | 465 | 164 | 164 | 0 | 660.3 MB | 23.2 MB |
| **Total** | | | **1597** | **578** | **578** | **0** | **2325.9 MB** | **81.8 MB** |

Notas:
- Coordenadas vigentes de ε Indi: **ε Indi B** en `331.044 / −56.783` (`331.0441 / −56.7828`, J2000) y **ε Indi A** en `330.84 / −56.786` (`330.8404 / −56.7869`).
- Cada archivo guardado sin `EPSF` pesa ~140 KB (144,000 B en los FITS revisados) en lugar de ~4.0 MB (`3,977,280–4,095,360 B` en `consultas.json`; reducción de ~28.5×). Verificación directa de cabeceras FITS sobre los 578 archivos en disco: `0/578` contienen HDU `EPSF` o `PSF`.
- `recortes.py` ahora genera automáticamente tanto el `resumen.json` global como el `resumen.json` individual de cada campo (junto con `seleccion.json` y `consultas.json`). Si se vuelve a ejecutar por línea de comando, la clave de `argparse` es `'epsilon Indi B'` en ASCII.
- Fuente de las cifras: `/home/carlos/Documents/SPARKS-PROJECT-data/recortes/resumen.json` (generado `2026-11-14T19:28:26-07:00`) y los `resumen.json` y `consultas.json` individuales por carpeta.
