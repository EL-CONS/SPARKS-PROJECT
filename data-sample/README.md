# data-sample

Paquete mínimo de datos reales para que el front se pueda desarrollar sin esperar al pipeline. Son datos públicos de SPHEREx (IRSA) ya procesados, versión `0.3.0` del pipeline, generados el 2026-11-05. Pesa unos 8 MB.

| Archivo | Qué es |
|---|---|
| `index.json` | Lista de los campos disponibles con nombre, RA/Dec, tipo, movimiento propio medido y esperado (Gaia o CatWISE) y la miniatura. Aquí solo hay datos de Barnard en disco; los demás campos aparecen en la lista pero sus carpetas no están en este paquete. |
| `results.json` | Todos los números que el proyecto cita: archivo de IRSA, campos, validación y prueba final. Lo que se diga en la interfaz o en el pitch debe salir de aquí. |
| `barnard/manifest.json` | Descripción del campo: coordenadas y WCS, lanzamientos y temporadas, escalas por detector, y la lista de coadds con sus PNG. |
| `barnard/png/` | Imágenes ya renderizadas: un coadd por detector y temporada (`coadd_D6_S0.png`) y los cuadros sueltos (`frame_0078.png`). Es lo más fácil de enseñar en el escenario. |
| `barnard/*.bin` | Los mismos datos en crudo (`frames`, `coadds`, `diffs`, `medians`, `masks`), para quien quiera pintar en canvas. El formato lo describe el `manifest.json`. |
| `barnard/catalogs.json` | Fuentes de Gaia cercanas, con posición en la imagen (`x`, `y`), movimiento propio, paralaje y color. |

Cómo leerlo en tres líneas: pide `index.json` para pintar los botones de objetivos, luego `barnard/manifest.json` para saber cuántos detectores, temporadas y coadds hay, y muestra los PNG que enlaza. La escala de color de cada detector está en `scales` del manifest.

Barnard en números (de `index.json`): movimiento propio medido 10.23 ± 0.43 segundos de arco por año, esperado 10.39. Si la interfaz muestra otro número, hay un error.
