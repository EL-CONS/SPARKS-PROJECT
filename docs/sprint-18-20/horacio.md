# Sprint 18:00 a 20:00 · Horacio · último sprint en el lugar

Sábado 14 de noviembre de 2026. El hackatón cierra a las 20:00; la entrega local es el domingo de 8:00 a 12:00. Seguimos trabajando en la noche, pero lo que no esté subido a las 19:40 no cuenta para este sprint. Trabajas en tu rama `Horacio` y abres pull request a `main` al final.

## Mensaje para ti

Horacio, tu parte 0 quedó bien: la regla de la enana blanca ya sale de la fotometría de Gaia y no del nombre, corregiste cuatro `source_id` y documentaste el split con honestidad (incluida la falla de Procyon B). Tengo dos cosas.

**Lo urgente: no hay nada tuyo en GitHub desde las 14:30.** Tu `pipeline/` está solo en tu computadora, y sin subirlo nadie lo puede revisar, usar ni retomar. A las 18:00, antes que nada: `git add pipeline/` (sin `data-sample/` ni `.venv`), commit y `git push origin Horacio`, aunque esté a medias.

**Tu bloqueo con el descubrimiento ya tiene solución.** SIA con radio mínimo funciona, y yo lo probé de punta a punta para WISE 0855:
`https://irsa.ipac.caltech.edu/SIA?COLLECTION=spherex_dr1&POS=circle+133.795129+-7.245147+0.0005&RESPONSEFORMAT=CSV`
respondió en 2.2 s con 258 filas. Sin `MAXREC` ni `SIZE`, y con radio grande se cuelga. Las colecciones son `spherex_dr1` y `spherex_qr3`; QR2 ya no se indexa. Cero filas en `spherex_qr3` para WISE 0855 es normal: no tiene QR3. El recorte, `access_url` + `?center=<RA>,<Dec>d&size=0.11&gzip=false`, falló dos veces (503 y corte) y entró al tercer intento: un FITS válido de 4.1 MB en 16 s. Reintenta con espera y quita el cubo EPSF antes de guardar. Todo esto y más está en `docs/sprint-13-30/entrega-horacio.md` de la rama `carlos`.

**Las coordenadas de ε Indi B.** Las tuyas (331.0441 / −56.7828) son correctas. Esa posición es la de B; 330.84 / −56.786 es ε Indi A. Si te llegó otro mensaje diciendo lo contrario, ignóralo.

## Tu sprint

| Hora | Qué |
|---|---|
| 18:00 a 18:10 | Subir `pipeline/` a tu rama y dime con qué datos estás |
| 18:10 a 19:10 | Procesar WISE 0855 y ε Indi B |
| 19:10 a 19:40 | Método, y revisión científica del pitch |
| 19:40 a 20:00 | Cierre, pull request y reporte |

### 1. Procesar WISE 0855 y ε Indi B (18:10 a 19:10)
Carlos baja los recortes de esos dos campos con su `recortes.py` (8 cuadros por detector y temporada, 6 hilos), y los comparte por la nube; coordina con él en lugar de bajarlos tú. Con eso:
1. Calidad, alineación a un WCS común y coadds por detector y temporada (ya tienes `quality.py`, `grid.py` y `coadd.py`).
2. Termina `manifest.py` y `motion.py`. Mide el movimiento propio y compáralo con el catálogo **sin ajustar el método al resultado**: WISE 0855 unos 8.09″/año (CatWISE) y ε Indi B unos 4.68″/año. Reporta el acuerdo en sigmas aunque sea malo. Si no coincide, ese es el resultado.
3. Escribe la salida en `data-new/<id>/` con el mismo formato que `data-sample/barnard/`, y un `data-new/index.json`. Pasa los archivos grandes a la nube y deja en Git solo manifiestos y PNG.
4. Si un campo no se puede completar, el manifiesto lo declara con un código claro (`blocked`, la URL y la hora, el error) y no se inventa nada.
5. **Es un subconjunto de cuadros.** Dilo en el manifiesto y en el método: son 8 por detector y temporada, no todos.

Cons puede hacer una canalización de respaldo si no subes `pipeline/` a las 18:15. Subirlo antes evita el trabajo duplicado.

### 2. Método y datos de Gaia (19:10 a 19:40)
1. `docs/pipeline/metodo.md`: de dónde salió cada dato (colección, versión, DOI de IRSA), cada paso del procesamiento, qué no pudiste verificar y las fallas con su evidencia (tu diagnóstico de TAP y S3 es útil y se queda).
2. `docs/pipeline/gaia-objetos.csv`, solo si ya está lo demás: la tabla que ya tienes en `docs/sprint-13-30/gaia-fotometria.csv` puede servir directamente; no la repitas.

### 3. Revisión científica del pitch (en paralelo, 19:10 en adelante)
Eres la persona de ciencia del equipo y el jurado incluye astrofísicos. Revisa el guion `docs/pitch/pitch-3min-es.md` contra `data-sample/results.json` y tus propios archivos:
1. Cada número del guion con su fuente, y marca "sin verificar" donde no la tengas. Ya sabemos que "sin falsas alarmas" solo es cierto para la regla, no para el ML.
2. Una lista de diez preguntas difíciles que haría una astrofísica, con la respuesta más honesta posible y la fuente de cada una (por ejemplo: por qué no detectamos exoplanetas, qué significa el límite inferior del cociente de WISE 0855, qué tan confiable es el ML).
3. Un párrafo de "qué no hacemos y por qué" para el cierre.

Entrégalo en `docs/pitch/revision-ciencia.md`.

## Reglas
Español, sin emojis. Cada afirmación con fuente o "sin verificar". "Candidatos", no "descubrimientos". Nada del proyecto anterior (ni `docs/methods.md` ni `research/planetx/scratch/`). No toques `data-sample/` ni `Logo/`. Si algo te bloquea más de cinco minutos, avisa en el grupo.
