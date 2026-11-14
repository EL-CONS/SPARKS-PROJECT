# Entrega a Horacio: cobertura de los cinco objetivos y revisión del acceso

**Fecha:** sábado 14 de noviembre de 2026, 15:20 MST · **Rama:** `carlos`

---

## 1. Mensaje para Horacio (cobertura de los cinco objetivos)

**Consultas:** SIA de IRSA, radio de 0,0005° (1,8″), colecciones `spherex_dr1` y `spherex_qr3`. Iniciadas entre 14:22:26 y 14:22:31 MST; reintentos hasta 14:24:53. Cada cifra es una fila SIA (una imagen de detector que cubre la posición), no una visita independiente.

**Plantilla:**

```
https://irsa.ipac.caltech.edu/SIA?COLLECTION=<coleccion>&POS=circle+<RA>+<Dec>+0.0005&RESPONSEFORMAT=CSV
```

**Temporada:** bloque de fechas separado por más de 60 días del siguiente, calculado sobre la unión de DR1 y QR3.

| Objetivo | RA / Dec (J2000, grados) | DR1 | QR3 | Total | Temporadas | Temporadas DR1 / QR3 |
|---|---|---:|---:|---:|---:|---:|
| Barnard's Star | 269,4486 / +4,7672 | 239 | 119 | 358 | 3 | 2 / 1 |
| ε Indi B | 330,84024 / −56,78598 | 344 | 116 | 460 | 4 | 3 / 1 |
| WISE 0855 | 133,795129 / −7,245147 | 258 | 0 | 258 | 3 | 3 / 0 |
| RW Aurigae | 76,9563 / +30,4014 | 226 | 109 | 335 | 3 | 2 / 1 |
| R Draconis | 248,1675 / +66,754972 | 413 | 126 | 539 | 3 | 3 / 1 |

**Notas de la tabla:**

- **Barnard:** 239 + 119 = 358. `recursos.md` tenía 363 (240 + 123); la diferencia de 5 imágenes (1,4 %) no está investigada. [SIN VERIFICAR]
- **ε Indi B:** con la coordenada de tu lista (330,8404 / −56,7869) salen 343 + 116 = 459. La coordenada de la tabla es la de `recursos.md` y da 460 exacto.
- **WISE 0855:** no tiene QR3. Su serie está en DR1 y termina el 2026-05-14; no prometas una campaña de 2026 para este objeto.
- **RW Aurigae:** 226 + 109 = 335, exacto.
- **R Draconis:** tu lista trae 248,3308 / +66,7028, que está a ~5,0′ de SIMBAD. En esa posición salen 433 + 123 = 556. Usa 248,1675 / +66,754972: 413 + 126 = 539, la cifra que ya tenía `recursos.md`. La diferencia no es redondeo; es otra posición, y con un campo de 6,5′ el objeto quedaría fuera del campo.
- **Ventanas de fechas (unión DR1 + QR3):** Barnard 2025-08-15 a 2026-09-22; ε Indi B 2025-04-24 a 2026-10-02; WISE 0855 2025-05-05 a 2026-05-14; RW Aur 2025-09-01 a 2026-09-16; R Dra 2025-05-16 a 2026-07-16.

**Archivos con el detalle:** `cobertura.csv` (37 objetos, 13 columnas), `cobertura.py` (script), `consultas.json` (133 intentos con URL, HTTP, filas, segundos y error).

---

## 2. Revisión de tu parte de acceso

**Qué revisé:** rama `Horacio`, commit `2554170` (14-nov-2026 13:18). En esa rama todavía no hay `pipeline/` ni `docs/pipeline/metodo.md`. Lo revisable es `docs/methods.md` (pipeline 0.3.0 del 5-nov, proyecto anterior), `Investigacion.md` §8.2 y los scripts de `research/planetx/scratch/`. Si ya tienes la canalización nueva sin subir, pásamela y la reviso.

### Lo que pides a IRSA y cómo

- **Descubrimiento:** SIA por colección en la posición del objeto, radio 0,0005°, colecciones `spherex_qr2` y `spherex_qr3` (`docs/methods.md` §1; `scratch/cov2.py`). URL usada: `https://irsa.ipac.caltech.edu/SIA?COLLECTION=<coleccion>&POS=circle+<RA>+<Dec>+0.0005&RESPONSEFORMAT=VOTABLE`, con timeout de 280 s y hasta 4 reintentos cada 10 s.
- **Recortes:** sobre el `access_url` de cada fila, añadiendo `?center=<RA>,<Dec>&size=0.03&gzip=false` (`scratch/cut.py`).
- **Conteo de releases:** `SELECT obs_collection, COUNT(*) FROM ivoa.obscore WHERE obs_collection LIKE 'spherex%'` en ObsTAP (`docs/methods.md` §1). Los números que tienes son del 5-nov: `spherex_qr2` 1.097.080, `spherex_qr3` 192.961.
- **Temporadas:** cortes por huecos >40 días (`docs/methods.md` §1). En `scratch/cov2.py` y `coverage.py` el corte es >3 días, que agrupa visitas, no temporadas.
- **Lectura sin bajar el archivo completo:** peticiones HTTP por rangos para saltar el cubo PSF; ≤90 rangos por petición porque nginx devuelve el archivo entero con más de ~100; recortes de 80 × 80 px cacheados en `.npz`. Es del pipeline anterior, no de este sprint.

### Límites y errores concretos

1. **QR2 no sirve para descubrir.** SIA devolvió 0 filas en 36 de 37 objetos y falló por red en el restante. QR2 ya no se indexa para búsqueda y solo se puede descargar hasta febrero de 2027. Si el pipeline recorre `spherex_qr2` y `spherex_qr3`, la mitad de las consultas no aporta ni una imagen. Usa `spherex_dr1` + `spherex_qr3`. [VERIFICADO: 14-nov-2026, `consultas.json`; data releases de SPHEREx]
2. **La ruta `/SIA2` de IRSA no responde.** `https://irsa.ipac.caltech.edu/SIA2?...` devolvió 404 en 1,21 s a las 15:16:03. La que responde es `/SIA` (y `/SIA/query`). Si usas `pyvo` con `SIA2Service`, comprueba la URL base antes de confiar en que funciona.
3. **La coordenada de ε Indi B en `scratch/cov2.py` y `coverage.py` está mal:** 331,0438 / −56,7828, unos 0,2° en RA (6,7′ en el cielo) al este de la posición real 330,84024 / −56,78598. Con un campo de 6,5′ el objeto queda fuera. No reutilices esos scripts.
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
- Coordenadas corregidas: ε Indi B 330,84024 / −56,78598; R Dra 248,1675 / +66,754972.
- Cutouts: `size=0.11` para 64 × 64 (o `0.137` para 80 × 80), `center=<RA>,<Dec>d`, guardar IMAGE, FLAGS, VARIANCE, ZODI y WCS-WAVE, descartar EPSF.
- Temporadas: corte de 60 días sobre la unión DR1 + QR3; guarda también el conteo por colección.
- WISE 0855: solo DR1, 3 temporadas, serie hasta 2026-05-14.
- R Dra: 534 de 534 imágenes saturadas; mide en el anillo exterior, no en el núcleo.

**Confírmame dos cosas cuando puedas:** qué colecciones usa tu pipeline (`dr1` + `qr3`, o todavía `qr2`) y qué corte de temporada. Con eso ajusto los números si hace falta.
