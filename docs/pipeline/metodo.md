# Canalizacion de datos SPHEREx para los cuatro objetivos que faltan

Este documento describe como se construyo, desde cero, la canalizacion que
produce `data-new/wise0855`, `data-new/epsindib`, `data-new/rdra` y
`data-new/rwaur`, en el mismo formato que `data-sample/barnard`. No se reutilizo
nada del proyecto anterior. Todo lo que se afirma aqui se puede comprobar con
los archivos de `pipeline/_work/` y con las URLs citadas.

Aviso de vocabulario: en este documento se habla de **candidatos** y de
**detecciones**, nunca de descubrimientos. La canalizacion mide lo que hay en
los datos publicos; no reclama objetos nuevos.

## 0. Parte 0 del sprint: ya estaba hecha

La Parte 0 de este sprint (regla de enana blanca con Gaia, verdad de terreno con
fuente por fila y columna `aislado`, regla exacta de `desarrollo`/`prueba`) se
cerro en la entrega anterior y vive en `docs/sprint-13-30/`:
`verdad-terreno.csv`, `gaia-fotometria.csv`, `reglas-veredicto.md` y el
`prototipo/veredicto.py` corregido. No se rehizo en este sprint y este documento
no la duplica. La unica dependencia que la canalizacion toma de alli es
`docs/sprint-13-30/gaia-fotometria.csv`, para rellenar `catalogs.json` en R Dra
y RW Aur por `source_id` de Gaia DR3.

## 0b. Parte 2 del sprint: Gaia de los objetos aislados

`docs/pipeline/gaia-objetos.csv` tiene una fila por objeto con `aislado = si`
en `docs/sprint-13-30/verdad-terreno.csv` (24 objetos). Las columnas son:

| columna | contenido |
|---|---|
| `id_campo`, `nombre` | identificador interno y nombre |
| `gaia_source_id` | `source_id` de Gaia DR3 |
| `ra_deg_j2016`, `dec_deg_j2016` | posicion de Gaia DR3 en la epoca J2016.0 |
| `phot_g_mean_mag`, `bp_rp` | magnitud G y color BP-RP de Gaia DR3 |
| `parallax_mas`, `dist_pc` | paralaje y su inversa, `1000/parallax` |
| `pmra_mas_yr`, `pmdec_mas_yr` | movimiento propio de Gaia DR3, sin corregir |
| `mu_total_arcsec_yr`, `pa_deg` | modulo y angulo de posicion derivados de las dos componentes |
| `ruwe` | indicador de calidad del ajuste astrometrico |
| `mg_gaia` | magnitud absoluta G con el paralaje de Gaia |
| `clase`, `fuente_clase`, `enlace_fuente` | clase que trae `verdad-terreno.csv` y de donde salio |
| `fuente_pm` | `Gaia DR3` |
| `nota` | aclaraciones por objeto |

Dos limites, dichos en el propio CSV: `dist_pc` es la inversa del paralaje sin
correccion de Lutz-Kelker (a 2-5 pc el sesgo es pequeño pero existe), y la
clase no se volvio a consultar en SIMBAD en este sprint porque el servicio
respondio 404 desde `simbad.cds.unistra.fr`; se copia la de la entrega anterior,
que si quedo verificada. `mg_gaia` usa el paralaje. **Mira** (fuente saturada en
Gaia DR3) no tiene paralaje ni movimiento propio: sus celdas quedan vacias, la
columna `nota` lo dice y no se rellena con otro catalogo. Los otros 23 objetos
tienen paralaje, PM y `mg_gaia`.

## 1. Que hay y que no hay

Hay:

- Un paquete Python propio, `pipeline/sparkspipe/`, con descubrimiento,
  descarga de recortes, mascaras de calidad, reproyeccion a una malla comun,
  coadds, diferencias, medicion de movimiento propio y escritura del manifiesto.
- Un entorno virtual propio en `pipeline/.venv` (Python 3.12) y
  `pipeline/requirements.txt`.
- Pruebas en `pipeline/tests/` (11 pruebas, `pytest`).
- Salidas en `data-new/<id>/` con la misma estructura que `data-sample/barnard`:
  `manifest.json`, `catalogs.json`, `png/`, `frames.bin`, `masks.bin`,
  `coadds.bin`, `coadds_sig.bin`, `diffs.bin`, `diffs_sig.bin`, `medians.bin`.
- Un `data-new/index.json` con los cuatro campos y las colecciones usadas.
- `docs/pipeline/gaia-objetos.csv` (Parte 2 del sprint) con fotometria y
  movimiento propio de Gaia DR3 para los 24 objetos aislados del catalogo de
  verdad de terreno.

No hay:

- Modelo de aprendizaje automatico. El bloque `ml` del manifiesto lo dice de
  forma explicita: los datos quedan listos para el detector de Cons.
- Busqueda de candidatos en el campo. El bloque `candidates` va vacio y
  `candidates_note` explica por que.
- Nada copiado de `data-sample/` salvo la **forma** del formato, que se leyo
  para que el front pudiera consumir `data-new/` sin cambios.

## 2. Entorno

```
python -m venv pipeline/.venv
pipeline\.venv\Scripts\python.exe -m pip install -r pipeline/requirements.txt
```

Versiones exactas en `pipeline/ambiente.md` (numpy 2.5.4, astropy 8.0.2,
reproject 0.21.0, pyvo 1.10.0, requests 2.34.2, scipy 1.18.1, pillow 13.0.0,
matplotlib 3.11.2, pytest 9.2.0).

Uso:

```
cd pipeline
.\.venv\Scripts\python.exe -m pytest tests -q
.\.venv\Scripts\python.exe -m sparkspipe discover wise0855
.\.venv\Scripts\python.exe -m sparkspipe run all --cap 6 --workers 3
.\.venv\Scripts\python.exe -m sparkspipe verify ..\data-new\wise0855
```

## 3. Objetivos, coordenadas y epocas

Las coordenadas y el movimiento propio esperado salen de
`data-sample/index.json`. Ese archivo es el enunciado del reto, no una fuente
primaria; por eso cada fila del manifiesto lleva `catalog_source` y el bloque
`expected` aclara de donde viene el numero. Cuando existe `source_id` de Gaia
DR3 (R Dra, RW Aur) el valor se contrasta con `docs/sprint-13-30/gaia-fotometria.csv`.

| id | nombre | RA (catalogo) | Dec (catalogo) | epoca | mu esperado | PA esperado |
|---|---|---|---|---|---|---|
| `wise0855` | WISE 0855-0714 | 133.795129 | -7.245147 | MJD 55320.4 (epoca WISE) | 8.087789 "/yr | 277.357342 deg |
| `epsindib` | epsilon Indi B | 331.043800 | -56.782800 | J2000 | 4.684165 "/yr | 121.778186 deg |
| `rdra` | R Draconis | 248.167500 | 66.755000 | J2016.0 (Gaia DR3) | 0.021539 "/yr | 286.587074 deg |
| `rwaur` | RW Aurigae | 76.956400 | 30.401400 | J2016.0 (Gaia DR3) | 0.027525 "/yr | 174.494704 deg |

### WISE 0855: la epoca importa

Las coordenadas del index (`133.795129`, `-7.245147`) **no son J2000**: son la
posicion de la epoca WISE de 2010. Luhman (2014, ApJL 786, L18, Tabla 1) da
`alpha = 133.795224`, `delta = -7.245138` en **MJD 55320.4** con error de 0.40".
Coinciden con el designativo `WISE J085510.83-071442.5`, que se construyo con la
posicion de 2010. Tratar esas coordenadas como J2000 (como hace el index)
propaga el objeto 10.3 anios de mas: 209" en vez de 126", y la malla queda
corrida ~14 pixeles (84"). La canalizacion usa `coord_epoch_mjd = 55320.4`.

Movimiento propio verificado en la fuente primaria (Luhman 2014):
`pmRA*cos(dec) = -8.06 +- 0.09 "/yr`, `pmdec = +0.70 +- 0.07 "/yr` (mu = 8.09,
PA = 275.0). Luhman & Esplin (2014, arXiv:1409.5899) lo refinan a
`-8.10 +- 0.02`, `+0.70 +- 0.02`. El index da 8.087789 y PA 277.357: la
diferencia de PA (2.4 grados) produce 5" en declinacion a la epoca de
referencia, menos de un pixel. Se mantiene el valor del index para la
comparacion esperada y se declara la discrepancia; no se cambia el numero del
reto. Fotometria: W2 = 13.89 +- 0.05, [4.5] = 13.89 +- 0.02, W1 > 16.4, es
decir, el objeto es brillante solo en la banda D6 (~5 um).

### epsilon Indi B: posicion y naturaleza verificadas

Las coordenadas del index (`331.0438`, `-56.7828`) coinciden con la posicion
2MASS de epsilon Indi B, `22 04 10.5 -56 46 58` (epoca 1999.86), en
McCaughrean et al. (2004, A&A 413, 1029, arXiv:astro-ph/0309256, Tabla 1).
No son las coordenadas de epsilon Indi A: A queda a 402.3" = 6.70', fuera de la
malla de 6.56'. El objeto es un par T1+T6 (Ba+Bb) separado 0.732", invisible
para SPHEREx (6.15"/px): se mide el fotocentro del par. El PM de la fuente
primaria es `pmRA*cos(dec) = +3.976 +- 0.013`, `pmdec = -2.500 +- 0.014 "/yr`
(mu = 4.70, PA = 122.2), compatible con el index (4.684, PA 121.778).

### Por que se propaga la posicion antes de recortar

La malla final mide 64 x 64 pixeles de 6.15"/px, es decir 6.56' de lado. WISE
0855 se mueve 8.09"/yr; entre su epoca de catalogo (MJD 55320.4) y la epoca de
referencia (MJD 61000) pasan 15.55 anios, o sea unos 126" = 20 pixeles. Si se
tratara como J2000 serian 25.9 anios, 209" = 34 pixeles: por eso la correccion
de epoca de la seccion anterior es obligatoria. El centro se calcula una sola
vez:

```
centro = posicion_catalogo + PM_esperado * (REFERENCE_MJD - epoca_catalogo)
REFERENCE_MJD = 61000.0
```

Detalle importante: **la malla es fija**. No se recentra con los datos ni se
ajusta el centro a la posicion medida. Si se recentrara, se inyectaria el
movimiento que se quiere medir. El precio es que las coordenadas del campo en
el manifiesto no son las del catalogo sino las de la epoca de referencia; el
manifiesto guarda las dos (`source.ra/dec` y `source.catalog_ra/catalog_dec`).

## 4. Descubrimiento: que funciono y que no

### Lo que funciona: SIA2 de IRSA

```
GET https://irsa.ipac.caltech.edu/SIA
    ?POS=CIRCLE <ra> <dec> 0.06000
    &RESPONSEFORMAT=votable
```

La respuesta se guarda tal cual en `pipeline/_work/<id>/sia_r0.060.xml` y se
reutiliza en corridas posteriores. Es una respuesta grande (decenas de MB) y
tarda entre 30 y 100 s. De cada fila se conservan solo las imagenes SPHEREx con
`dataproduct_type=image` y URL `.fits` que no sea cubo; el detector se saca del
nombre del archivo (`...D6_spx...`).

Resultados de descubrimiento (2026-11-14):

| id | filas totales | imagenes SPHEREx | temporadas | XML |
|---|---|---|---|---|
| `wise0855` | 34 585 | 289 | 3 | 66.1 MB |
| `epsindib` | 15 305 | 487 | 4 | 29.9 MB |
| `rdra` | 22 816 | 2598 | **2** | 46.2 MB |
| `rwaur` | 9481 | 348 | 3 | 18.6 MB |

La traza completa esta en `discovery.trace` de cada manifiesto y en
`pipeline/_work/<id>/run.json`. Si este documento y el JSON no coinciden, manda
el JSON.

### Como se cortan las temporadas

Una temporada es un grupo de MJD separado del siguiente por mas de
`SEASON_GAP_DAYS`. Se eligio **35 dias** por la cadencia real de los datos, no
por el movimiento propio esperado:

| hueco maximo dentro del campo | valor | corte que lo separa |
|---|---|---|
| WISE 0855 | 26.6 d (y luego 128.8 y 178.2) | 35 d -> 3 temporadas |
| epsilon Indi B | 17.5 d (y luego 110.8, 141.1, 157.0) | 35 d -> 4 temporadas |
| R Draconis | 26.1 d (y luego 37.8) | 35 d -> 2 temporadas |
| RW Aurigae | 17.5 d (y luego 153.5, 174.1) | 35 d -> 3 temporadas |

El corte es estable entre ~27 y ~110 dias para los cuatro campos. Con 60 dias
R Dra cae en una sola temporada (su mayor hueco es 37.8 d) y el movimiento
propio no se puede separar de la variabilidad; con 45 dias pasa lo mismo. Con
25 dias aparecen 4 temporadas en WISE y 3 en R Dra, pero algunos grupos quedan
con muy pocos cuadros. 35 dias es el valor que deja a los cuatro campos con al
menos dos temporadas sin fragmentar visitas consecutivas.

**R Draconis** queda con dos temporadas (2025-04-24 a 2025-07-22 y 2025-08-29
a 2026-09-27), separadas por 37.8 d. La segunda es mucho mas larga y tiene 2317
imagenes; `--cap 6` limita lo que se descarga. Esto no garantiza un movimiento
propio medible: el PM esperado (0.0215"/yr) es 300 veces menor que el pixel. El
resultado se reporta como cota superior si es consistente con cero.

Las 2598 imagenes de R Dra no se procesan todas: `--cap` limita a 6 por
(detector, temporada), que es lo que hace viable la descarga.

### Dos trampas del servicio

1. Con `COLLECTION=spherex_dr1` o `MAXREC` la respuesta vuelve vacia. Sin esos
   parametros devuelve las imagenes que solapan la posicion.
2. El servicio de recortes responde a menudo `503 Server busy, retry later.`
   con HTTP 200 y cuerpo de texto. Hay que reintentar y validar el contenido,
   no solo el codigo HTTP. `download_cutout` lo hace: comprueba que el cuerpo no
   empiece por `server busy` y que pese mas de 1 KB.
3. Los reintentos son exponenciales pero con tope (`http.MAX_BACKOFF_S = 10 s`).
   Sin tope, una racha de 14 intentos a 1.6^n espera horas; con el tope una
   URL que falla se descarta en menos de tres minutos y el fallo queda contado
   en el manifiesto en vez de bloquear la corrida.

### Lo que no funciono: TAP

Se probaron tres rutas contra `https://irsa.ipac.caltech.edu/TAP`:

| ruta | resultado | tiempo |
|---|---|---|
| consulta espacial a `obscore` | 0 filas | 601.9 s |
| consulta espacial a la tabla de planos | 0 filas | 285.5 s |
| trabajo asincrono 28320260 | 502 del proxy, luego `COMPLETED` con 0 filas | ~604 s |

La evidencia esta en `pipeline/_work/access-probe.json`. Conclusion honesta: el
descubrimiento se hace por SIA2; TAP no se usa.

### Que releases hay

SIA2 devuelve `spherex_dr1` para los cuatro campos y **tambien `spherex_qr3` en
tres de ellos** (misma version `l2b-v27`):

| campo | cuadros DR1 usados | cuadros QR3 usados | temporada QR3 |
|---|---|---|---|
| `wise0855` | 93 | 0 | - |
| `epsindib` | 92 | 24 | S3, MJD 61305-61315 (solo QR3) |
| `rdra` | 49 | 13 | dentro de S1, MJD 60916-61310 (mezclada) |
| `rwaur` | 68 | 33 | S2, MJD 61285-61300 (solo QR3) |

`spherex_qr2` no aparece en ninguno. Las releases usadas quedan en `releases`,
en la columna `release` de cada cuadro y en el `blocker` que corresponde a la
que falta. Los DOI existen y estan citados:

- DR1: `10.26131/IRSA678` (https://doi.org/10.26131/IRSA678)
- QR3: `10.26131/IRSA662` (https://doi.org/10.26131/IRSA662)
- QR2: `10.26131/IRSA652` (https://doi.org/10.26131/IRSA652)
- cubo de todo el cielo: `10.26131/IRSA679`

El manifiesto de cada campo lleva un `blocker` por cada release que falta en
SIA2 para esa posicion. Cuando QR3 existe se usa tal cual; no se descarta ni se
presenta como DR1.

## 5. Recortes

Se pide un recorte de 0.12 grados (7.2') para cubrir las esquinas de la malla
de 6.56':

```
<access_url>?center=<ra>,<dec>d&size=0.1200
```

El servicio devuelve un MEF con `PRIMARY`, `IMAGE`, `FLAGS`, `VARIANCE`,
`ZODI`, `EPSF` y `WCS-WAVE`. `EPSF` es el 98 % del peso y no se usa, asi que se
elimina antes de guardar. El recorte crudo se borra tras recortarlo; el
recorte reducido queda en `pipeline/_work/<id>/cutouts/`.

La WCS de `IMAGE` ya esta centrada en el recorte: el pixel del objeto cae cerca
del centro (por ejemplo 17.2, 16.7 en un recorte de 35x35). Los coeficientes
SIP incluyen el termino constante que hace ese desplazamiento, asi que **no hay
que componer WCS**. Se comprobo con `world_to_pixel` sobre los recortes reales.

La longitud de onda sale de la extension binaria `WCS-WAVE` en el pixel del
objeto, interpolando bilinealmente. La rejilla de control esta en coordenadas
del detector completo y el desplazamiento al recorte esta en
`CRPIX1W/CDELT1W/CRVAL1W` del encabezado de **`IMAGE`**, no del de `WCS-WAVE`
(que no trae esas claves). La version anterior leia el encabezado equivocado y
usaba `CRPIX=0`, de modo que todas las bandas quedaban en su borde azul
(D1 1.118, D2 1.655, D3 2.423, D4 3.831, D5 4.430, D6 5.012 um). Con el
encabezado correcto, cada cuadro muestrea una longitud de onda distinta dentro
de su banda: D1 0.75-1.09, D2 1.10-1.63, D3 1.63-2.41, D4 2.48-3.74,
D5 3.82-4.41, D6 4.42-5.00 um. Eso es lo que permite medir el metano a 3.3 um
dentro de D4 y el continuo a 4.0 um dentro de D5. Si la tabla faltara se usa
`em_min/em_max` de SIA2, y el manifiesto deja `lam` en el valor que se uso.

## 6. Banderas y calidad

Los nombres de bit se leen del encabezado `FLAGS` de cada MEF (`MSKNnnnn`). Si
no estuvieran, se usa la tabla por defecto de `config.py`, que es la del
manifiesto de Barnard.

Se enmascaran los bits instrumentales malos: `TRANSIENT`, `OVERFLOW`,
`SUR_ERROR`, `NONFUNC`, `DICHROIC`, `MISSING_DATA`, `HOT`, `COLD`,
`NONLINEAR`, `PERSIST`, `OUTLIER`, `CROSSTALK`, `GHOST`, `GHOST_FPA`,
`GHOST_EXT`, `STREAK`, `BLOOM`, `SNOWBALL`, `HALO`, `PHANTOM`, `PHANMISS`.

**No** se enmascaran `SOURCE`, `FULLSAMPLE` ni `REFERENCE`. `SOURCE` marca
pixeles de fuentes conocidas, incluido el propio objeto; enmascararlo borraria
la senal que se quiere medir. Decision explicita, no olvido.

Consecuencia en objetos muy brillantes: en R Dra, `BLOOM`, `HALO` y `OVERFLOW`
cubren un disco de ~9 px de radio y, al enmascararlos, el nucleo se queda sin
pixeles. Esa es la causa del resultado nulo de R Dra (seccion 12). El paquete
prefiere decir "no se mide" antes que ajustar un centroide con pixeles que la
propia canalizacion considera malos.

La mascara propia es `uint8` con suma de bits: `1` mala, `2` borde, `4` zodi
alto, `8` recortado. En los recortes se usa `edge_pixels=0` porque el borde del
recorte no es el borde del detector.

Fondo y ruido por cuadro: mediana de los pixeles buenos y `sqrt(mediana de la
varianza)`; si la varianza no sirve, MAD robusto. El conteo por bandera va al
manifiesto (`flag_pixels`) y el total de pixeles a `pix_total`.

## 7. Malla comun y reproyeccion

La malla es la misma de Barnard: 64 x 64, `RA---TAN`, `crpix=32.5`,
`cdelt=6.15/3600`, centrada en la posicion propagada. Cada recorte se
reproyecta con `reproject.reproject_interp` (interpolacion bilineal) junto con
su varianza y su mascara. La varianza se reproyecta aparte y se marca como
mala cualquier zona sin cobertura.

No se hace registro relativo a estrellas de referencia: la WCS de DR1 ya viene
registrada. El bloque `registration` del manifiesto mide la dispersion de los
centroides frente al modelo de movimiento propio y lo declara como tal; no
pretende ser un registro astrometrico.

## 8. Coadds y diferencias

- **Coadd por (detector, temporada)**: media recortada a 3 sigma y ponderada
  por `1/varianza`, con hasta 5 iteraciones. Con menos de 3 cuadros no se
  recorta (no tiene sentido estadistico) y se usa media ponderada directa. El
  error del coadd se propaga desde la varianza, no desde la dispersion
  observada, para no subestimarlo con pocos cuadros.
- **Diferencias**: todas las parejas de temporadas del mismo detector,
  `imagen_b - imagen_a`, con `sigma = sqrt(sigma_a^2 + sigma_b^2)`.
  `lambda_matched` es verdadero cuando los intervalos `[lam_min, lam_max]` de
  las dos temporadas se solapan; `lam_lo/lam_hi` es ese solapamiento. Con dos o
  cuatro temporadas hay una o seis parejas por detector.
- **Medianas**: `medians.bin` es la mediana por detector sobre todos los
  cuadros, con forma `6 x 64 x 64`; los detectores ausentes quedan en `NaN`.

## 9. Movimiento propio

El metodo es simple y **no se ajusta al valor esperado**:

0. **WISE 0855: solo D5 y D6.** En D1-D4 domina una estrella de fondo a ~7
   arcsec (1.2 px). Su posicion se mide en las coadds de D1, donde WISE 0855 no
   aparece, con un ajuste gaussiano. En D5 y D6 se enmascara un disco de 0.7 px
   (los dos pixeles mas cercanos al pico de la estrella) y se mide el centroide
   con el resto. A 1.2 px las dos fuentes no se pueden descomponer: un ajuste de
   dos Gaussianas es degenerado (las amplitudes individuales tienen errores del
   orden del valor). La mascara quita el nucleo de la estrella y tambien una
   parte del objetivo; el resultado se declara con esa limitacion y no se
   presenta como una separacion limpia. Para WISE 0855 se descargan **todos**
   los cuadros de D5 y D6 (95 por SIA2, no 8 por detector), y el resto de
   detectores se usa solo para fotometria de apoyo con tope por temporada.
1. En cada coadd se mide el centroide en una apertura de radio 3 px sobre un
   anillo de cielo de 6 a 10 px. El anillo se recorta a 3 sigma para quitar
   estrellas de paso. El error del centroide sale de la varianza por pixel, con
   un suelo de 0.05 px.
2. Se descarta una deteccion si el SNR es menor que 3, si el centroide cae a
   mas de 10 px del predicho, o si el flujo no es positivo. Cada deteccion
   lleva su nota en el manifiesto.
3. Se ajusta una recta por minimos cuadrados ponderados a cada coordenada
   contra el tiempo. Se usa un **intercepto por detector** solo si, despues del
   recorte sigma, cada detector conserva al menos dos puntos; asi un
   desplazamiento sistematico entre detectores no se convierte en pendiente. Si
   algun detector queda con un solo punto, se usa un intercepto comun. En esta
   corrida los cuatro ajustes combinados usaron intercepto comun
   (`per_detector_intercept = false`), porque el recorte sigma dejo algun
   detector con un punto (por ejemplo epsilon Indi B: 21 detecciones, 16
   conservadas). Los ajustes por detector, con su propio intercepto, se
   reportan aparte para comparar.
4. Se reporta el ajuste combinado y, si hay al menos 3 puntos, el ajuste por
   detector. Si hay menos de 3 detecciones, menos de 2 temporadas o una linea
   base menor que 0.25 anios, el resultado es **nulo** y el manifiesto escribe
   la razon. No se rellena con el valor esperado.
5. Si el movimiento medido es consistente con cero a 3 sigma, se escribe como
   cota superior, no como deteccion. Paso en WISE 0855 (0.49 +- 0.58) y en RW
   Aur (1.32 +- 0.57, 2.3 sigma: justo por debajo del corte). En RW Aur la cota
   ademas esta dominada por variabilidad y por 6.15 "/px, que no permite medir
   0.03 "/anio; el `caveats` del manifiesto lo dice. R Dra queda nula por
   saturacion.

La comparacion con el catalogo calcula `sigma_mu = |mu_medido - mu_esperado| / mu_err`
usando **solo el error medido**. No se usa el error del catalogo (que en el
index no existe) y no se toca el resultado para que cuadre. El veredicto literal
(`acuerdo dentro de 1/2/3 sigma` o `desacuerdo mayor que 3 sigma`) va al JSON.

### 9b. Indice de frio

Se calcula en `photometry.py` mediante fotometria PSF gaussiana ponderada por
`1/sigma^2` en cada cuadro individual (ancho `psf_sigma` fijado desde las
coadds), usando las bandas de `docs/methods.md`:

- **Resta de la estrella vecina en WISE 0855 (D1-D4)**: en las bandas cortas
  (D1 a D4), donde WISE 0855 no aparece y domina la estrella de fondo a ~1.2 px
  `(32.72, 31.22)`, se ajusta en cada cuadro por minimos cuadrados ponderados
  (`1/sigma^2`, radio 3.5 px) la amplitud de una Gaussiana con la posicion y
  `sigma = 0.61 px` fijados desde las coadds de D1 mas un fondo constante, y se
  resta antes de medir en la posicion propagada del objetivo. Ademas se mantiene
  la mascara de nucleo de `0.7 px`.
- **Cociente** `F_D6/F_D2`: media ponderada por `1/error^2` de los flujos PSF
  de los cuadros de D6 con `4.42 <= lambda <= 5.01` um y de D2 con
  `1.10 <= lambda <= 1.63` um. Si el flujo corto no llega a 3 sigma, el cociente
  usa `max(flujo, 0) + 3*error` en el denominador (`short_upper_limit_3sigma_mjy`)
  y se marca `ratio_kind = lower_limit`.
- **Metano** `1 - F(3.15-3.45)/F(3.90-4.10)`: el numerador sale de los cuadros
  de D4 y el denominador de los de D5, elegidos por su longitud de onda. El
  error se propaga de los errores de las medias.

## 10. Formato de salida

`data-new/<id>/` replica `data-sample/barnard`:

| archivo | forma | tipo |
|---|---|---|
| `frames.bin` | n x 64 x 64 | int16 little-endian |
| `masks.bin` | n x 64 x 64 | uint8 |
| `coadds.bin` | c x 64 x 64 | float32 little-endian |
| `coadds_sig.bin` | c x 64 x 64 | float32 little-endian |
| `diffs.bin` | d x 64 x 64 | float32 little-endian |
| `diffs_sig.bin` | d x 64 x 64 | float32 little-endian |
| `medians.bin` | 6 x 64 x 64 | float32 little-endian |
| `manifest.json` | - | JSON con `schema`, `field`, `seasons`, `detectors`, `coadds`, `diffs`, `frames`, `scales`, `flag_bits`, `target`, `caveats`, `files`, `blockers` |
| `catalogs.json` | - | Gaia DR3 por `source_id`, con `epoch_mjd` |
| `png/` | 256x256 coadds, 128x128 cuadros | PNG en escala de grises |

`caveats` es una lista de advertencias que nacen del analisis de los datos de
ese campo (por ejemplo, un fotocentro mezclado con otra fuente). Va vacia
cuando no hay nada que advertir; no es un campo del reto ni se rellena con
texto generico.

Los PNG usan los limites `scales[det].lo/hi` del manifiesto y `gamma=0.5`,
igual que Barnard. Los `.bin` se escriben y se leen con el mismo modulo
(`binfmt.py`) y `sparkspipe verify` comprueba formas y tipos contra el
manifiesto.

### Codificacion de `frames.bin`

Barnard no documenta la codificacion de sus `frames.bin` y no fue posible
reproducirla: la mediana de sus valores es 9262, esta recortada en +-32000 y
correlaciona solo 0.28 con las coadds. En lugar de imitar un formato que no se
entiende, aqui se usa uno explicito, escrito en el propio manifiesto:

```
valor_int16 = round((imagen - bkg) / sigma * 1000)     recortado a +-32767
imagen      = bkg + valor / 1000 * sigma               (MJy/sr)
```

`bkg` y `sigma` son los de la fila correspondiente de `manifest.json`. Esto
mantiene el tamano y el tipo de Barnard, permite reconstruir la imagen fisica y
no finge compatibilidad bit a bit que no existe.

## 11. Verificacion

```
pytest: 11 pruebas
  test_binfmt.py     ida y vuelta de formas/tipos, rechazo de archivos corruptos
  test_motion.py     recupera un movimiento conocido, linea base corta -> nulo,
                     fuente ausente -> nulo, veredicto de sigmas
  test_manifest.py   codificacion de frames, recorte de valores, escala de PNG,
                     WCS de la malla, limites de visualizacion
```

Ademas, sobre datos reales:

- Sonda de centrado con los recortes ya descargados, reproyectados a la malla
  corregida (MJD 55320.4): el maximo cae a ~1.3 px del centro esperado, que es
  lo que se queria comprobar. Ese maximo resulto ser la estrella de fondo que
  se describe abajo, no el objeto; la sonda valida el centrado, no una
  deteccion.
- La corrida anterior, con la epoca equivocada (J2000), detectaba dos fuentes
  cerca del centro de la malla que no eran el objeto: estaban a ~14 px de su
  posicion real. Se descartan y quedan documentadas aqui para que no se
  confundan con una deteccion.
- **WISE 0855: estrella de fondo enmascarada, movimiento medido en D5 y D6.**
  La corrida final (`--cap 6`, todos los cuadros de D5 y D6) procesa 153 cuadros
  y 18 coadds. La estrella de fondo se localiza en las coadds de D1, donde el
  objeto no se ve: (32.72, 31.22), sigma 0.61 px. En D5 y D6 se enmascara un
  disco de 0.7 px (los dos pixeles mas cercanos al pico) y el centroide se mide
  con el resto: quedan 5 puntos usables (D5 S0/S1/S2 y D6 S1/S2; D6 S0 sin
  deteccion). El ajuste da `mu = 6.044 +- 0.755 "/anio`, PA 289.1 +- 3.8. La
  mascara quita el nucleo de la estrella y tambien una parte del objetivo; el
  resultado se declara con esa limitacion y no se presenta como una separacion
  limpia. Un ajuste de dos Gaussianas a 1.2 px es degenerado (se probo: los
  errores de amplitud son del orden del valor) y no se usa.
- `sparkspipe verify` sobre las cuatro carpetas de `data-new/` comprueba que los
  tamanos en disco coinciden con las formas del manifiesto: `all_ok = true` en
  `wise0855` (153 cuadros, 18 coadds), `epsindib` (116, 22), `rdra` (62, 12) y
  `rwaur` (101, 18), sin problemas.

## 12. Resultados de la corrida final

Corrida del 14 de noviembre de 2026 con `--cap 6 --workers 4`, 6 cuadros como
maximo por (detector, temporada). Los numeros salen de `manifest.json`; la
tabla se puede regenerar con `pipeline/_work/results_table.py` (ignorado por
git).

| objetivo | cuadros | coadds | diffs | temp. obs. | det. usables | base (a) | mu medida ("/a) | PA medida (deg) | mu esperada ("/a) | PA esperada (deg) | sigma_mu | veredicto |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `wise0855` | 153 | 18 | 18 | 3 | 5 | 1.00 | 6.044 +- 0.755 | 289.1 +- 3.8 | 8.088 | 277.4 | 2.71 | acuerdo dentro de 3 sigma (D5/D6, estrella enmascarada) |
| `epsindib` | 116 | 22 | 30 | 4 | 16 | 1.39 | 4.205 +- 0.281 | 124.9 +- 2.8 | 4.684 | 121.8 | 1.70 | acuerdo dentro de 2 sigma |
| `rdra` | 62 | 12 | 6 | 2 | 0 | - | nulo | - | 0.022 | 286.6 | - | sin medicion: nucleo saturado y enmascarado |
| `rwaur` | 101 | 18 | 18 | 3 | 10 | 1.03 | 1.323 +- 0.572 | 81.5 +- 15.7 | 0.028 | 174.5 | 2.27 | acuerdo dentro de 3 sigma (cota superior, no deteccion) |

`status` en `manifest.json` es `ok` solo cuando hay movimiento medido y
`mu >= 3*mu_err`. Con esa regla quedan `ok` `wise0855` y `epsindib`, y
`parcial` `rdra` (sin deteccion) y `rwaur` (2.3 sigma, consistente con cero).
La razon va en `blockers` y en `data-new/index.json`; no se esconde.

### Indice de frio

Definicion en la seccion 9b. Resultados con la corrida final:

| objetivo | F(D6) mJy | F(D2) mJy | cota 3 sigma D2 (mJy) | cociente | tipo | metano | error | cuadros |
|---|---|---|---|---|---|---|---|---|
| `wise0855` | 0.284 +- 0.019 (44) | -0.006 +- 0.009 (18) | 0.028 | 10.09 | `lower_limit` | 1.20 | 0.10 | 152 |
| `epsindib` | 17.130 +- 0.069 (19) | 13.099 +- 0.029 (22) | - | 1.31 | `measured` | 0.80 | 0.002 | 112 |

En `wise0855`, tras restar la PSF gaussiana de la estrella vecina en D1-D4
(posicion `(32.72, 31.22)` y `sigma = 0.61 px` fijados desde las coadds de D1),
la banda corta (1.1-1.6 um) queda en `-0.006 +- 0.009 mJy` (no detectada a 3
sigma; cota superior 3 sigma de `0.028 mJy`, S/N apilado `-0.67` en D2 frente a
`19.02` en D5 y `15.60` en D6). Con `F(D6) = 0.284 +- 0.019 mJy` el cociente da
`F_D6/F_D2 >= 10.09` (`lower_limit`) y la profundidad de metano `1.20 +- 0.10`,
consistente con el procesamiento anterior (`ratio > 10.88`, `methane_depth =
1.03 +- 0.07`) y por encima de los umbrales `CH4_MIN = 0.5` y `RATIO_MIN = 10.0`
de `prototipo/veredicto.py`.
En `epsindib` la fotometria PSF da metano `0.797 +- 0.002` (redondeado a `0.80`,
consistente con el `0.81` del procesamiento anterior) y un cociente `1.31`
(`measured`).

### Mezcla de releases

Tres campos usan QR3 ademas de DR1 (tabla de la seccion 4). En epsilon Indi B y
RW Aur QR3 ocupa una temporada entera; en R Dra, 13 de los 33 cuadros de S1 son
QR3 y comparten coadd con 20 de DR1. El ajuste de movimiento propio no lleva un
intercepto por release, solo por detector: un desplazamiento sistematico entre
releases entraria en la pendiente. En epsilon Indi B se midio esa sensibilidad
(DR1 solo contra DR1+QR3, 15 grados de diferencia en PA). Para R Dra y RW Aur no
hay medicion que rescatar, pero la mezcla se declara igual porque afecta a
cualquier uso posterior de sus coadds.

### epsilon Indi B: el unico movimiento propio medido

Es el resultado solido de la corrida. Componentes:
`pmRA*cos(dec) = +3.448 +- 0.183`, `pmdec = -2.407 +- 0.213` "/anio, con 16
puntos en los seis detectores (de 21 detecciones utiles; el recorte sigma
descarta 5) y 1.39 anios de linea base. El ajuste combinado usa **intercepto
comun** (`per_detector_intercept = false`): el recorte sigma dejo algun detector
con un solo punto. Los cinco ajustes por detector, cada uno con su intercepto,
dan entre 4.05 y 4.46 "/anio, compatibles entre si dentro del error. Frente al index:
`mu = 4.205 +- 0.281` contra 4.684, diferencia -0.479 = **1.70 sigma**; PA
124.9 +- 2.8 contra 121.78, diferencia 3.1 deg = 1.1 sigma. Cuatro temporadas:
tres de DR1 y una de QR3 (MJD 61305-61315), declaradas en `releases`.

Frente a la fuente primaria (McCaughrean et al. 2004: 4.70 "/anio, PA 122.2)
la diferencia es 0.49 "/anio, tambien dentro de 2 sigma del error medido. El
par T1+T6 no se resuelve: lo medido es el fotocentro del par, no una
componente.

Sensibilidad a mezclar releases: usando **solo DR1** (10 puntos, 0.97 anios)
sale `4.422 +- 0.430 "/anio`, PA `109.7 +- 4.3`; agregando QR3 (16 puntos,
1.39 anios) sale el valor de la tabla, `4.205 +- 0.281`, PA `124.9 +- 2.8`. Las
dos PA difieren 15 grados, ~3 sigma combinando errores. La diferencia se
declara: el ajuste conjunto es el que se reporta porque usa toda la linea base,
pero no se presenta como si las releases fueran intercambiables. El ajuste solo
con QR3 no tiene sentido (4 puntos en 0.01 anios de linea base).

### WISE 0855: movimiento medido en D5/D6 con la estrella enmascarada

La corrida final descarga **todos** los cuadros de D5 y D6 (95 por SIA2) y
mide el movimiento solo en esas dos bandas. La estrella de fondo se localiza en
las coadds de D1, donde WISE 0855 no se ve: `(x, y) = (32.72, 31.22)` con
sigma 0.61 px (3 coadds). En D5 y D6 se enmascara un disco de 0.7 px (2
pixeles) alrededor de esa posicion y se mide el centroide con el resto.

El ajuste da `mu = 6.044 +- 0.755` "/anio, PA `289.1 +- 3.8`, con 5 puntos
usables (D5 S0/S1/S2 y D6 S1/S2; D6 S0 queda sin deteccion) y 1.00 anios de
linea base. Frente al index (8.088 "/anio, PA 277.4): diferencia -2.04 "/anio
= **2.71 sigma**, acuerdo dentro de 3 sigma. No se usa el valor esperado para
nada del ajuste; la comparacion es posterior.

La mascara quita el nucleo de la estrella y tambien una parte del objetivo, y
las alas de la estrella siguen en la apertura. Por eso el resultado se declara
con esa limitacion: no es una separacion limpia de dos fuentes. Un ajuste de
dos Gaussianas a 1.2 px es degenerado (se probo: los errores de amplitud son
del orden del valor, `amplitude_err` ~1.1 MJy/sr para amplitudes de 0.1), asi
que no se usa. La mascara de 0.7 px se fija a priori y no se ajusta al
resultado; con 1.0 px los centroides cambian menos de 0.3 px y el signo del
movimiento no cambia.

### R Dra: nulo por saturacion

R Dra satura en las seis bandas. Las banderas BLOOM, HALO y OVERFLOW cubren un
disco de ~9 px de radio y la mascara deja el nucleo sin pixeles: los 12 coadds
responden `sin pixeles de apertura`, no hay detecciones utilizables y el
manifiesto escribe la razon. No se rellena con el valor de Gaia. Su PM esperado
(0.0215 "/anio) son 0.003 px/anio a 6.15 "/px: no es medible con SPHEREx aunque
no saturara.

### RW Aur: cota superior

El ajuste da `mu = 1.323 +- 0.572` "/anio con 3 temporadas y 1.03 anios de
linea base. Usa solo **10 de los 18** puntos: el recorte sigma descarta 8 por la
variabilidad. El veredicto literal es "acuerdo dentro de 3 sigma" porque
1.323/0.572 = 2.3 y el valor esperado (0.028) cabe dentro de ese error enorme;
**no es una deteccion**. El valor medido es ~48 veces el de Gaia y los ajustes por detector
van de 0.69 a 8.86 "/anio, señal de que la variabilidad y el desalineamiento
entre bandas dominan. Se reporta como cota superior.

## 13. Archivos grandes

Ningun archivo de `data-new/` pasa de 25 MB: el total de las cuatro carpetas es
10.9 MB y el archivo mayor es `wise0855/frames.bin` con 1.2 MB (153 cuadros de
64x64 int16; WISE 0855 es el unico campo con los detectores 5 y 6 completos).
Lo que si pesa y **no entra a git** esta en:

- `pipeline/_work/<id>/sia_r0.060.xml`: respuesta SIA2, 30-66 MB por campo.
- `pipeline/_work/<id>/cutouts/*.fits`: recortes MEF sin EPSF, ~1-4 MB cada uno.
- `pipeline/_work/<id>/frames/*.npz`: recortes ya procesados en la malla.
- `pipeline/_work/<id>/run.json`: traza completa, fallos y tiempos.
- `pipeline/.venv/`: entorno virtual.

`.gitignore` cubre `pipeline/.venv/`, `pipeline/_work/`, `pipeline/.pytest_cache/`,
`__pycache__/` y `data-new/**/raw/`.

## 14. Limitaciones y cosas sin verificar

- **QR2 no esta disponible por SIA2 para ninguno de los cuatro campos.** Se usa
  DR1 y, en epsilon Indi B, R Dra y RW Aur, ademas QR3 (24, 13 y 33 cuadros).
  El manifiesto declara las releases usadas y un blocker por cada una que falta.
  Si el jurado espera QR2, esta es la diferencia.
- **Dos de los cuatro campos dan un movimiento propio medible.** epsilon Indi B
  (`1.70 sigma` contra el index, 16 puntos, seis detectores) y WISE 0855
  (`2.71 sigma`, 5 puntos, solo D5/D6 y con la estrella de fondo enmascarada).
  En WISE 0855 la mascara quita parte del objetivo: el valor es una medicion
  con esa limitacion, no una separacion limpia. R Dra satura y su nucleo queda
  enmascarado; RW Aur da una cota superior de 1.32 +- 0.57 "/anio dominada por
  variabilidad y su `status` es `parcial`. Decirlo es parte del resultado; los
  manifiestos llevan la razon por escrito.
- **Fallos de descarga**: en la corrida final fallaron 7/160 recortes en WISE
  0855, 14/130 en epsilon Indi B, 10/72 en R Dra y 7/108 en RW Aur. No se
  ocultan: el manifiesto los cuenta y `_work/<id>/run.json` guarda cada intento
  con su codigo HTTP.
- **El movimiento propio esperado de WISE 0855 y epsilon Indi B ya esta
  verificado contra la fuente primaria.** WISE 0855: Luhman (2014,
  arXiv:1404.6501) da `pmRA*cos(dec)=-8.06+-0.09`, `pmdec=+0.70+-0.07` "/yr;
  Luhman & Esplin (2014, arXiv:1409.5899) refinan a `-8.10+-0.02`,
  `+0.70+-0.02`. epsilon Indi B: McCaughrean et al. (2004,
  arXiv:astro-ph/0309256) da `+3.976+-0.013`, `-2.500+-0.014` "/yr. El index
  del reto usa numeros ligeramente distintos (PA 277.357 frente a 275.0 en
  WISE 0855; 4.684 frente a 4.70 en epsilon Indi B). La comparacion se hace
  contra el index y la discrepancia se declara; no se reemplaza el valor del
  reto por el de la literatura.
- **epsilon Indi B no se resuelve**: el par T1+T6 (separacion 0.732") cabe en
  un pixel de 6.15". Lo que se mide es el fotocentro del par, no una componente.
  epsilon Indi A esta a 402.3" = 6.70', fuera de la malla.
- **R Dra y RW Aur son variables**. Con dos o tres temporadas, la variabilidad
  puede mover el centroide y contaminar la pendiente. En RW Aur los ajustes por
  detector van de 0.69 a 8.86 "/anio: eso es variabilidad y desalineamiento
  entre bandas, no movimiento. Por eso el resultado se reporta como cota
  superior y su `caveats` lo dice.
- **Paralaje no eliminada**. La linea base es de menos de un anio y el efecto es
  menor que el error del centroide, pero no se modela. El campo
  `parallax_removed_mas` vale 0.0 en el manifiesto para que nadie lo confunda.
- **No hay registro relativo a estrellas de referencia**: se confia en la WCS de
  DR1. El bloque `registration` mide los residuos y los declara.
- **Gaia DR1 no es Gaia DR3** en lo que respecta a SPHEREx: `catalogs.json` cita
  Gaia DR3 por `source_id` y `epoch_mjd=57388.5`, no la epoca de SPHEREx.
- **El front no lee `data-new/` todavia**: `app/src/data/loader.ts` tiene
  fijada la ruta `data-sample/`. Para la demo hay que cambiar la ruta base o
  mover las carpetas. Decision de Joaquin/Cons, no de esta canalizacion.
- **La comparacion de movimiento propio usa solo el error medido**. No es una
  prueba estadistica formal; es una medida de cuanto se aleja el valor medido
  del esperado en unidades del error. Se dice en el JSON.
- Los catalogos de proper motion externos (CatWISE, etc.) no se consultaron:
  `target.n_refs.catwise` vale 0.

## 15. Reproducir

```
cd pipeline
# 1. descubrimiento (una vez por campo; se cachea)
.\.venv\Scripts\python.exe -m sparkspipe discover all
# 2. canalizacion completa (los cuatro campos, uno por uno)
.\.venv\Scripts\python.exe -m sparkspipe run all --cap 6 --workers 4
# 3. comprobacion de formas y tipos
.\.venv\Scripts\python.exe -m sparkspipe verify ..\data-new\wise0855
```

`--cap` limita los cuadros por (detector, temporada) y se eligen repartidos en
el tiempo. `--limit` existe solo para pruebas cortas y rompe el ajuste de
movimiento propio si deja una sola temporada. `--reuse-only` rehace manifiesto,
PNGs y `.bin` usando solo los recortes ya procesados en `_work/<id>/frames/`:
sirve para cambiar textos del manifiesto sin volver a descargar; los cuadros que
no estan en cache se cuentan como fallo y quedan en el `blocker`
correspondiente.
