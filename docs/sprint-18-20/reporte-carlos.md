# Reporte de cierre · Sprint 18:00 a 20:00 · Rama `carlos`

**Fecha:** sábado 14 de noviembre de 2026 · **Rama:** `carlos` · **Base del plan:** [`docs/sprint-18-20/carlos.md`](carlos.md)

## 1. Resumen de entregables

### 1.1 Recortes de los cuatro campos (`18:00–18:30`)
- **Estado:** descargados y completos fuera de Git en `/home/carlos/Documents/SPARKS-PROJECT-data/recortes` (`578/578` FITS, `0` faltantes, `81,783,360 B` en FITS y `82,741,594 B` totales incluyendo JSON; fuente: `resumen.json` global generado `2026-11-14T19:28:26-07:00` y los `resumen.json` individuales por campo):
  - `R_Draconis`: `144/144` (`3` temporadas, `539` filas SIA, `579,248,640 B` bajados → `20,206,080 B` guardados sin `EPSF`).
  - `RW_Aurigae`: `144/144` (`3` temporadas, `335` filas SIA, `579,479,040 B` bajados → `20,436,480 B` guardados sin `EPSF`).
  - `WISE_0855`: `126/126` (`3` temporadas, `258` filas SIA, `506,897,280 B` bajados → `17,907,840 B` guardados sin `EPSF`, coordenada propagada por cuadro).
  - `Epsilon_Indi_B`: `164/164` (`4` temporadas, `465` filas SIA, `660,323,520 B` bajados → `23,232,960 B` guardados sin `EPSF`, coordenada propagada por cuadro).
- **Eliminación de `EPSF`:** verificada sobre `578/578` archivos (`0/578` conservan `EPSF`; cada FITS queda en `~140 KB` frente a `3,977,280–4,095,360 B` crudos en `consultas.json`).
- **Automatización en [`recortes.py`](../sprint-13-30/recortes.py):** se añadió la escritura automática del `resumen.json` individual dentro de cada carpeta de campo (verificado con `python3 -B -m py_compile`).
- **Bloqueo en nube:** no hay cliente ni credenciales de nube instalados en esta máquina (`rclone`, `gdrive`, `aws`, `gsutil` y `gh` ausentes en `PATH`). El enlace en [`docs/sprint-13-30/recortes-lugar.md`](../sprint-13-30/recortes-lugar.md) queda marcado como `[[PENDIENTE: enlace de la carpeta compartida en la nube]]` y el origen local queda documentado para Horacio y Cons.

### 1.2 Prueba de lectura S3 por `Range` desde el navegador (`18:30–19:10`)
- **Página de prueba:** [`docs/sprint-13-30/s3-range-test.html`](../sprint-13-30/s3-range-test.html) (lectura dinámica de cabeceras `PRIMARY + IMAGE` en bloques de `28,800 B`, proyección `WCS TAN + SIP` inversa opcional, decodificación big-endian con `DataView.getFloat32(..., false)`, cálculo `FNV-1a` y dos modos: slab contiguo y 64 rangos de `256 B`).
- **Resultado en vivo (Firefox headless + WebDriver BiDi):** **sí funciona** con CORS (`Access-Control-Allow-Origin: *`, `HTTP 206 Partial Content`, `0` errores de CORS).
  - **Slab contiguo (2 peticiones):** `551,040 B` (`538.1 KB`) en `797.0 ms` (`spherex_qr3`, `22:08:37 MST`), `713.6 ms` (`spherex_dr1`, `22:09:02 MST`) y `701.0 ms` (`WISE 0855 DR1` con `WCS+SIP`, `22:15:13 MST`). Frente al archivo completo (`65,790,720 B` por `HEAD`, `access_estsize = 65,791 KB` en `/SIA`), reduce `119.39×` (`0.838%`), y frente al recorte IRSA (`4,008,960 B`), reduce `7.28×`.
  - **64 rangos de `256 B` (65 peticiones, `22:15:14 MST`):** `45,184 B` (`44.1 KB`) en `6,988.0 ms` (`42,304 B` = `0.0643%` con lectura exacta de `25,920 B` de cabecera), `1,456.06×` menor que el archivo completo y `88.73×` menor que el recorte IRSA.
  - **Verificación cruzada:** ambos modos sobre `WISE 0855 DR1` (`133.795129, -7.245147` → píxel 1-based `(382.223, 154.736)`, caja `x=349..412`, `y=122..185`) dieron `4096/4096` píxeles finitos e idéntica huella `fnv1a=1bc318be` frente a Python.
- **Límites documentados en [`docs/sprint-13-30/lectura-navegador.md`](../sprint-13-30/lectura-navegador.md):** `Content-Range` no es legible en JS (`Access-Control-Expose-Headers` solo expone `ETag` y `x-amz-meta-custom-header`); `/SIA` sigue siendo necesario para descubrir `cloud_access` (`/SIA2` da `404`), y la calibración completa en navegador requeriría leer `ZODI`, `WCS-WAVE` y `FLAGS` (Rice).

### 1.3 Piezas de la entrega del domingo (`19:10–19:40`)
- [`docs/entrega/pagina-equipo-en.md`](../entrega/pagina-equipo-en.md): página del equipo en inglés con roles, qué se construyó y evaluación honesta (separa hechos verificados en `carlos` de cifras previas en `origin/cons:data-sample/results.json`, marcadas como `unverified on carlos`).
- [`docs/entrega/video-30s-guion-en.md`](../entrega/video-30s-guion-en.md): guion en inglés plano por plano (`30 s`, 5 planos, historia de Tombaugh, azul/ámbar, Barnard, WISE 0855 y candidatos a revisar).
- [`docs/entrega/diapositivas-outline.md`](../entrega/diapositivas-outline.md): guion de 10 diapositivas en español (título y una frase por idea, sin emojis, fuentes citadas).

## 2. Consistencia de coordenadas y reglas
- **Coordenadas vigentes de ε Indi en todos los documentos:** `ε Indi B` en `331.044 / −56.783` (`331.0441 / −56.7828`, J2000) y `ε Indi A` en `330.84 / −56.786` (`330.8404 / −56.7869`).
- **Cobertura verificada en [`cobertura.csv`](../sprint-13-30/cobertura.csv):** `36` objetos, `35/36` con `>= 2` temporadas (`Gliese 687` único con `1` temporada, `965` imágenes en `17` meses), `36/36` con `DR1`, rango `221–965` imágenes por objeto.
- **Reglas cumplidas:** sin emojis, sin referencias a `research/planetx/` ni `docs/methods.md`, sin tocar `data-sample/` ni `Logo/`, sin afirmaciones de descubrimiento ("candidatos a revisar").

## 3. Borrador para cierre y Pull Request (`carlos` → `main`)

**Nota operativa:** el commit `fd68faa` ya existe en `carlos` y en `origin/carlos`; los cambios posteriores en `docs/sprint-13-30/` (`recortes.py`, `s3-range-test.html`, `lectura-navegador.md`, `recortes-lugar.md`), `docs/entrega/` y este reporte permanecen sin `commit` ni `push` en espera de confirmación del usuario antes de modificar el historial o abrir el PR.

- **Título sugerido del PR:** `Sprint 18-20 (carlos): recortes 4 campos, prueba S3 Range en navegador y piezas de entrega`
- **Resumen para el PR:**
  - Descarga completa de los 4 campos asignados fuera de Git (`578/578` FITS sin `EPSF` en `/home/carlos/Documents/SPARKS-PROJECT-data/recortes`) y automatización de `resumen.json` por campo en `docs/sprint-13-30/recortes.py`.
  - Prueba en vivo desde navegador (`s3-range-test.html` + `lectura-navegador.md`) confirmando lectura directa por `HTTP Range` desde `nasa-irsa-spherex` (`551,040 B` en 2 peticiones o `45,184 B` en 65 peticiones con `WCS+SIP`, verificado contra Python).
  - Piezas de entrega en `docs/entrega/` (`pagina-equipo-en.md`, `video-30s-guion-en.md`, `diapositivas-outline.md`) con coordenadas vigentes de ε Indi y fuentes trazables.
