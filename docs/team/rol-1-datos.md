# Rol 1 · Datos y pipeline

## 1. Qué te toca
Eres dueño de **cómo llegan los datos**: qué imágenes de SPHEREx existen, cómo se leen sin bajar archivos completos, cómo se limpian y se suman.
Si mañana sale `spherex_qr4`, tú confirmas que entra solo y que los números no cambian por un error de lectura.
Durante el hackatón preparas campos nuevos (galería, asteroides) y dejas listos los datos para despliegue.
También eres el contacto con **Yuca** (`docs/team/yuca.md`): bajar datos una vez, procesar ahí.
Tu frase para el jurado: "leemos solo los bytes que necesitamos, y lo verificamos píxel por píxel contra el servicio oficial".

## 2. Conceptos que debes dominar
Los enlaces marcados ✔ ya los revisó el equipo en `research/planetx/fuentes.md`; los demás son documentación oficial: verifiquen que abran.

| Concepto | Lecturas |
|---|---|
| SPHEREx: qué mide, cómo escanea, 6 detectores × 17 canales | ✔ IRSA SPHEREx mission page https://irsa.ipac.caltech.edu/Missions/spherex.html · ✔ QR overview https://irsa.ipac.caltech.edu/data/SPHEREx/docs/overview_qr.html |
| Productos L2 (IMAGE, FLAGS, VARIANCE, ZODI, PSF, WCS-WAVE) | ✔ Archive User Guide – Data Products https://caltech-ipac.github.io/spherex-archive-documentation/spherex-data-products |
| Acceso: ObsTAP, SIA2, IBE, cutouts | ✔ Data Access https://caltech-ipac.github.io/spherex-archive-documentation/spherex-data-access · ✔ Tutorial intro https://caltech-ipac.github.io/irsa-tutorials/spherex-intro/ · ✔ Tutorial cutouts https://caltech-ipac.github.io/irsa-tutorials/spherex-cutouts/ |
| Estándares VO (TAP, ObsCore) | IVOA ObsCore https://www.ivoa.net/documents/ObsCore/ · IVOA TAP https://www.ivoa.net/documents/TAP/ |
| FITS multi-extensión | Astropy FITS https://docs.astropy.org/en/stable/io/fits/index.html · Estándar FITS https://fits.gsfc.nasa.gov/fits_standard.html |
| WCS espacial y espectral (clave alterna `W`) | Astropy WCS https://docs.astropy.org/en/stable/wcs/index.html · ✔ Tutorial PSF/WCS https://caltech-ipac.github.io/irsa-tutorials/spherex-psf/ |
| Reproyección | reproject https://reproject.readthedocs.io/en/stable/ |
| HTTP Range (multi-rango) | MDN "HTTP range requests" https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests |
| Releases QR1/QR2/QR3, DOIs, cómo citar | ✔ QR overview (arriba) · ✔ DOIs https://www.ipac.caltech.edu/doi/irsa/10.26131/IRSA652 |

## 3. Archivos del repo a leer, en orden
1. `pipeline/sparks/config.py`: bits de banderas (`BAD_BITS`, `SAT_MASK`, `GHOST_MASK`) y DOIs. Pregúntate por qué SOURCE y GHOST no se excluyen.
2. `pipeline/sparks/discover.py`: `discover_collections()` (de dónde sale la lista de lotes), `coverage()` (SIA2, de-duplicado por versión), `assign_seasons()` (corte a 40 días).
3. `pipeline/sparks/remote_fits.py`: cómo se calculan los offsets de cada HDU, por qué bloques de 90 rangos, cómo se decodifica FLAGS (Rice).
4. `pipeline/sparks/frames.py`: caché `.npz`, concurrencia 6, resta de ZODI, máscaras.
5. `pipeline/sparks/coadd.py`: `common_wcs`, `resample`, `inverse_variance_coadd`.
6. `scripts/precompute.py` y `scripts/check_releases.py`: el flujo completo y la detección de lotes nuevos.
7. `docs/methods.md` §1–3 y `DECISIONS.md` (entradas de lectura parcial y malla común).

## 4. Ejercicios de replicación
1. **Lista de lotes (15 min).** Con `astroquery` o `pyvo`, consulta ObsTAP: `SELECT obs_collection, COUNT(*) FROM ivoa.obscore WHERE obs_collection LIKE 'spherex%' GROUP BY obs_collection`. Compara con `results/results.json → archive`.
2. **Cobertura de Barnard (20 min).** SIA2 en (269.4486, 4.7672) para `spherex_qr2` y `spherex_qr3`. ¿Cuántas imágenes por detector? ¿Cuántas temporadas con un corte de 40 días?
3. **Un FITS completo (30 min).** Baja UNA imagen L2 (65 MB). Lista sus extensiones con `fits.info`. Calcula λ en el píxel central con `WCS(header, key='W')`.
4. **Lectura parcial (1 h).** Lee un recorte de 40×40 de esa misma imagen con `remote_fits.read_cutout` y compáralo píxel por píxel con el recorte del archivo completo.
5. **Rehacer desde cero (2–3 h): la suma de una temporada.** En `notebooks/rol1_coadd_desde_cero.ipynb`: para Barnard, detector 1, primera temporada, baja las imágenes, resta ZODI, aplica banderas, reproyecta a la rejilla 64×64 de 6.15″/px y haz la suma 1/σ². Compara el ruido de píxel antes y después contra `app/public/fields/barnard/manifest.json → coadds[0]` (`sigma_single`, `sigma_coadd`).

## 5. Preguntas del jurado sobre tu parte
- **¿Por qué no usan el servicio de cutouts de IRSA?**
  - *Corta:* manda siempre el cubo de PSF; nosotros leemos solo los bytes del recorte, 10 veces menos datos, y lo verificamos píxel por píxel.
  - *Larga:* el L2 casi no está comprimido, así que conocemos el offset de cada fila. Pedimos rangos HTTP (≤ 90 por petición, porque con > 100 el servidor manda el archivo completo). FLAGS sí viene en Rice y se decodifica con el códec de Astropy. 0.4 s por imagen contra 4.6 s.
- **¿Qué pasa cuando salga un lote nuevo?**
  - *Corta:* entra solo; la lista de lotes se pide a IRSA cada vez.
  - *Larga:* `discover_collections()` lee ObsTAP; `check_releases.py` regenera si aparece una colección o crece > 2 %; hay una GitHub Action semanal. Si una imagen se reprocesa, nos quedamos con la versión más nueva.
- **¿Cómo manejan la luz zodiacal y los píxeles malos?**
  - *Corta:* restamos el modelo ZODI que trae cada imagen y excluimos los píxeles con banderas malas.
  - *Larga:* lista exacta de bits en `config.py`; GHOST no se borra, se muestra como capa para que el usuario lo vea.
- **¿Por qué rejilla de 64×64?**
  - *Corta:* 6.6′ alcanza para los 5 objetivos y mantiene la app ligera.
  - *Larga:* campos más grandes solo en vivo; el selector de FOV avisa los MB y el tiempo.

## 6. Antes del 14 y durante el hackatón
**Antes del 14:**
- [ ] Ejercicios 1–4 y el notebook del 5.
- [ ] El 13 de noviembre: `make check-releases`. Si hay datos nuevos, regenerar y avisar al rol 2 (cambian los números) y al rol 4 (pitch).
- [ ] Probar desde la red de la UTH: `irsa.ipac.caltech.edu`, `gea.esac.esa.int`, `cdn.jsdelivr.net`, `aladin.cds.unistra.fr`.
- [ ] Confirmar con Yuca los datos de `docs/team/yuca.md` (gestor de colas, internet desde los nodos).

**Durante el hackatón:** produces campos nuevos (galería, asteroides), mantienes el caché, levantas la API si se usa en vivo. En la presentación respondes las preguntas de datos.

## 7. Hoja de ruta de mejoras (impacto ↓, esfuerzo entre paréntesis)
1. **Fijar el objetivo por ID de catálogo** (bajo) → rescata Luhman 16.
2. **Leer la ePSF oficial (QR3 `EPSF`)** y pasarla al rol 2 (medio).
3. **Campo de asteroides** con IRSA MOST / JPL Horizons (medio).
4. **Campos más grandes y precálculo de muchos campos en Yuca** (medio–alto).
5. **Acceso por la nube (AWS Open Data)** en vez de HTTP a IRSA para trabajos masivos: ✔ https://caltech-ipac.github.io/irsa-tutorials/cloud-access-intro (alto).
