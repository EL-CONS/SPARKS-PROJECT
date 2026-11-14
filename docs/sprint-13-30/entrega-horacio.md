# Entrega a Horacio: cobertura de los cinco objetivos y revisión del acceso

**Fecha:** sábado 14 de noviembre de 2026, 15:56 MST · **Rama:** `carlos` · **Lista:** `origin/Horacio`, commit `83c9607`

---

## 1. Mensaje para Horacio (cobertura de los cinco objetivos)

**Consultas:** SIA de IRSA, radio de 0,0005° (1,8″), colecciones `spherex_dr1` y `spherex_qr3`. Iniciadas entre 15:56:09 y 15:56:40 MST; el único timeout (QR2 de SS Cygni) se reintentó con éxito. Cada cifra es una fila SIA (una imagen de detector que cubre la posición), no una visita independiente.

**Plantilla:**

```
https://irsa.ipac.caltech.edu/SIA?COLLECTION=<coleccion>&POS=circle+<RA>+<Dec>+0.0005&RESPONSEFORMAT=CSV
```

**Temporada:** bloque de fechas separado por más de 60 días del siguiente, calculado sobre la unión de DR1 y QR3.

| Objetivo | RA / Dec (grados) | DR1 | QR3 | Total | Temporadas | Temporadas DR1 / QR3 |
|---|---|---:|---:|---:|---:|---:|
| Barnard's Star | 269,4485 / +4,7394 (J2016) | 240 | 123 | 363 | 3 | 2 / 1 |
| ε Indi B | 331,0441 / −56,7828 (J2000) | 345 | 120 | 465 | 4 | 3 / 1 |
| WISE 0855 | 133,7951 / −7,2451 | 258 | 0 | 258 | 3 | 3 / 0 |
| RW Aurigae | 76,9561 / +30,4012 | 226 | 109 | 335 | 3 | 2 / 1 |
| R Draconis | 248,1674 / +66,7550 (J2016) | 413 | 126 | 539 | 3 | 3 / 1 |

**Notas de la tabla:**

- **Los cinco reproducen exacto** las cifras de `recursos.md`. Las diferencias que aparecían con la lista del commit `2554170` eran de coordenadas, no de método.
- **Barnard:** 240 + 123 = 363, la cifra de `recursos.md`, con la posición J2016. La posición anterior (+4,7672, época ~2025.7) daba 358; no era un error de conteo.
- **ε Indi B:** 345 + 120 = 465. La lista anterior traía 330,8404 / −56,7869, que es la posición de ε Indi A, y daba 459. La vigente usa la de B.
- **WISE 0855:** no tiene QR3. Su serie está en DR1 y termina el 2026-05-14; no prometas una campaña de 2026 para este objeto.
- **RW Aurigae:** 226 + 109 = 335, exacto.
- **R Draconis:** 413 + 126 = 539 con 248,1674 / +66,7550. La lista vigente ya corrigió la posición anterior (248,3308 / +66,7028, a ~5,0′ de SIMBAD); con esa posición equivocada salían 433 + 123 = 556 y el objeto quedaba fuera de un campo de 6,5′.
- **Ventanas de fechas (unión DR1 + QR3):** Barnard 2025-08-15 a 2026-09-22; ε Indi B 2025-04-24 a 2026-10-02; WISE 0855 2025-05-05 a 2026-05-14; RW Aur 2025-09-01 a 2026-09-16; R Dra 2025-05-16 a 2026-07-16.
- **Compañera brillante:** Sirius B, Procyon B, Stein 2051 B y Gliese 229 B tienen una estrella muy brillante a menos de ~10″; Luhman 16 y Gliese 725 A son binarias sin estrella muy brillante. En `cobertura.csv` va en la columna `companera_brillante_10arcsec`, separada de `aislado`.

**Archivos con el detalle:** `cobertura.csv` (36 objetos, 15 columnas), `cobertura.py` (script), `consultas.json` (109 intentos con URL, HTTP, filas, segundos y error).

---

## 2. Revisión de tu parte de acceso

**Qué revisé:** rama `Horacio`, commit `83c9607` (14-nov-2026 14:30). En esa rama todavía no hay `pipeline/` ni `docs/pipeline/metodo.md`. Lo revisable es `docs/methods.md` (pipeline 0.3.0 del 5-nov, proyecto anterior), `Investigacion.md` §8.2 y los scripts de `research/planetx/scratch/`. Si ya tienes la canalización nueva sin subir, pásamela y la reviso.

### Lo que pides a IRSA y cómo

- **Descubrimiento:** SIA por colección en la posición del objeto, radio 0,0005°, colecciones `spherex_qr2` y `spherex_qr3` (`docs/methods.md` §1; `scratch/cov2.py`). URL usada: `https://irsa.ipac.caltech.edu/SIA?COLLECTION=<coleccion>&POS=circle+<RA>+<Dec>+0.0005&RESPONSEFORMAT=VOTABLE`, con timeout de 280 s y hasta 4 reintentos cada 10 s.
- **Recortes:** sobre el `access_url` de cada fila, añadiendo `?center=<RA>,<Dec>&size=0.03&gzip=false` (`scratch/cut.py`).
- **Conteo de releases:** `SELECT obs_collection, COUNT(*) FROM ivoa.obscore WHERE obs_collection LIKE 'spherex%'` en ObsTAP (`docs/methods.md` §1). Los números que tienes son del 5-nov: `spherex_qr2` 1.097.080, `spherex_qr3` 192.961.
- **Temporadas:** cortes por huecos >40 días (`docs/methods.md` §1). En `scratch/cov2.py` y `coverage.py` el corte es >3 días, que agrupa visitas, no temporadas.
- **Lectura sin bajar el archivo completo:** peticiones HTTP por rangos para saltar el cubo PSF; ≤90 rangos por petición porque nginx devuelve el archivo entero con más de ~100; recortes de 80 × 80 px cacheados en `.npz`. Es del pipeline anterior, no de este sprint.

### Límites y errores concretos

1. **QR2 no sirve para descubrir.** SIA devolvió 0 filas en los 36 objetos. QR2 ya no se indexa para búsqueda y solo se puede descargar hasta febrero de 2027. Si el pipeline recorre `spherex_qr2` y `spherex_qr3`, la mitad de las consultas no aporta ni una imagen. Usa `spherex_dr1` + `spherex_qr3`. [VERIFICADO: 14-nov-2026, `consultas.json`; data releases de SPHEREx]
2. **La ruta `/SIA2` de IRSA no responde.** `https://irsa.ipac.caltech.edu/SIA2?...` devolvió 404 en 1,21 s a las 15:16:03. La que responde es `/SIA` (y `/SIA/query`). Si usas `pyvo` con `SIA2Service`, comprueba la URL base antes de confiar en que funciona.
3. **No mezcles ε Indi A con ε Indi B.** `scratch/cov2.py` usa 331,0438 / −56,7828, que es la posición correcta de B y da 465. La posición 330,8404 / −56,7869 es la de ε Indi A y da 459; con un campo de 6,5′ el objeto queda fuera. La lista vigente ya trae la buena; usa esa. [VERIFICADO: [SIMBAD ε Indi B](https://simbad.harvard.edu/simbad/sim-id?Ident=eps+Ind+B)]
4. **`size=0.03` no da un campo de 6,5′.** Medido con un cutout DR1 de WISE 0855: `size=0.03` devuelve 18 × 18 px; `size=0.11` devuelve 64 × 64 px (6,15″/px). Para 64 × 64 usa `size=0.11`; para 80 × 80, `size=0.137`. Añade la `d` al final de la Dec (`center=133.795129,-7.245147d`), como en el tutorial.
5. **Cada cutout pesa ~3,9 MB aunque sea pequeño.** `size=0.03` dio 3.850.000 bytes y `size=0.11` dio 3.910.000 bytes, porque el servicio devuelve el cubo EPSF completo (33 × 33 × 451). Quita `EPSF` antes de guardar; si no, 460 recortes de ε Indi B son ~1,8 GB solo de PSF.
6. **El servicio de cutouts es intermitente.** En dos minutos: dos HTTP 503 con cuerpo `Server busy, retry later`, un timeout de 90 s y dos 200 (6,73 s el último). Reintenta con espera; no interpretes un 503 como “no hay datos”.
7. **SIA también falla de vez en cuando.** Una consulta a WISE 0855 se quedó en timeout a las 15:17; el reintento a las 15:18:24 respondió 200 en 1,77 s con 258 filas. Reintenta y registra cada intento.
8. **TAP sync de IRSA no es para consultas en vivo.** Dio 502 a las 14:32:44 y timeouts de 30 s. SIA respondió 200 en 1,1–7,0 s. Para descubrir imágenes por objeto, usa SIA; para metadatos de releases, TAP en lote con reintentos. Los conteos de ObsTAP del 5-nov hay que refrescarlos antes de citarlos.
9. **Temporadas: usa 60 días, no 40.** El equipo cuenta temporadas con corte de 60 días sobre la unión DR1 + QR3. Con 40 puedes partir una campaña en dos y reportar una temporada de más; con 3 días estás contando visitas. Si prefieres 40, dilo y repito los conteos, pero no mezcles definiciones en la misma tabla.
10. **Colecciones `*_deep`:** una consulta SIA a `spherex_qr3_deep` se quedó colgada más de 20 minutos en la investigación previa. No las metas en el bucle principal; si las necesitas, timeout corto y aparte.
11. **Gaia ESA:** el 5-nov devolvió 503; hoy respondió 200 en 2,67 s y 3,59 s (14:34:58 y 14:35:01) a una consulta ADQL real. Deja las dos mediciones. Para clases, Gaia no sirve: usa SIMBAD o el artículo.
12. **SIMBAD CDS está bloqueado desde esta red.** El espejo de Harvard responde: `https://simbad.harvard.edu/simbad/sim-id?Ident=<objeto>&output.format=ASCII`.
13. **Los tutoriales en `caltech-ipac.github.io` no abren** (timeout de 25 s a las 14:31:34). Usa el repositorio: `https://github.com/Caltech-IPAC/irsa-tutorials/tree/main/tutorials/spherex`.
14. **No reutilices `docs/methods.md` ni `research/planetx/scratch/`.** Son del proyecto anterior (pipeline 0.3.0, 5-nov), y el sprint lo prohíbe. Además tienen los errores 3, 4 y 9. Toma las ideas, no el código ni los datos.

### Sobre la tabla de acceso de `Investigacion.md` §8.2

- **Gaia ESA:** dice “DISPONIBLE (HTTP 200)” y omite el 503 del 5-nov. Deja las dos mediciones.
- **IRSA TAP:** “15 a 60 s” y “inviable para consultas web en vivo” es correcto; para descubrir imágenes por objeto, SIA responde en 1–7 s.
- **SIMBAD:** “BLOQUEO / TIMEOUT” es correcto para CDS; el espejo de Harvard responde.
- **“Datos locales en `research/planetx/scratch/`”:** no es una fuente válida para este sprint; es material del proyecto anterior.
- **JPL Horizons:** el 200 es de las 13:04 de Joaquín; hoy no se repitió. [SIN VERIFICAR HOY]

### Lo que yo usaría

- Descubrimiento: `/SIA` con `COLLECTION=spherex_dr1` y `spherex_qr3`, radio 0,0005°, `RESPONSEFORMAT=CSV`, reintentos y registro de HTTP/tiempo.
- Coordenadas corregidas: usa las de la lista `83c9607`; en particular ε Indi B 331,0441 / −56,7828 y R Dra 248,1674 / +66,7550.
- Cutouts: `size=0.11` para 64 × 64 (o `0.137` para 80 × 80), `center=<RA>,<Dec>d`, guardar IMAGE, FLAGS, VARIANCE, ZODI y WCS-WAVE, descartar EPSF.
- Temporadas: corte de 60 días sobre la unión DR1 + QR3; guarda también el conteo por colección.
- WISE 0855: solo DR1, 3 temporadas, serie hasta 2026-05-14.
- R Dra: 534 de 534 imágenes saturadas; mide en el anillo exterior, no en el núcleo.

**Confírmame dos cosas cuando puedas:** qué colecciones usa tu pipeline (`dr1` + `qr3`, o todavía `qr2`) y qué corte de temporada. Con eso ajusto los números si hace falta.
