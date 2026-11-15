# Sprint 18:00 a 20:00 · Carlos · último sprint en el lugar

Sábado 14 de noviembre de 2026. El hackatón cierra a las 20:00; la entrega local es el domingo de 8:00 a 12:00. Seguimos trabajando en la noche, pero lo que no esté subido a las 19:40 no cuenta para este sprint. Trabajas en tu rama `carlos` y abres pull request a `main` al final.

## Mensaje para ti

Carlos, tu trabajo fue el que destrabó el proyecto. Tu cobertura de 36 de 37 objetos con al menos dos temporadas y el descubrimiento de que QR2 ya no se indexa (los datos están en `spherex_dr1`) resolvieron el bloqueo de Horacio. Bajar 144 recortes por campo de R Draconis y RW Aurigae con 6 hilos y reintentos fue exactamente lo pedido, y tu aviso de que los 534 cuadros de R Draconis están saturados cambia cómo hay que medirlo.

Una cosa que te toca saber: en un momento dijiste que la coordenada de ε Indi B de la lista de Horacio estaba mal y después lo corregiste; la versión final (B en 331.044 / −56.783, A en 330.84 / −56.786) es la correcta. Deja todos los documentos con esa versión.

## Tu sprint

| Hora | Qué |
|---|---|
| 18:00 a 18:30 | Recortes de WISE 0855 y ε Indi B, y compartir los de los cuatro campos |
| 18:30 a 19:10 | Prueba de lectura desde el navegador |
| 19:10 a 19:40 | Piezas de la entrega del domingo |
| 19:40 a 20:00 | Cierre, pull request y reporte |

### 1. Recortes y cómo compartirlos (18:00 a 18:30)
1. Si todavía no lo hiciste: corre tu `recortes.py` para **WISE 0855 y ε Indi B**, con los mismos parámetros que usaste (8 cuadros por detector y temporada, `size=0.11`, 6 hilos, reintentos con espera). Que Horacio no espere descargas.
2. **Compartir los recortes de los cuatro campos** (R Draconis, RW Aurigae, WISE 0855, ε Indi B) por la nube: una carpeta por campo, y en cada una el `resumen.json` con qué cuadros se bajaron y cuáles no. Los archivos no van a Git.
3. Pon el enlace y la estructura de carpetas en `docs/sprint-13-30/recortes-lugar.md` y avísale a Horacio y a Cons. **Cons puede necesitarlos si Horacio no sube su `pipeline/`**, así que que sea fácil encontrarlos.
4. Quita el cubo EPSF antes de guardar, como ya sabes, o los archivos pesan 4 MB cada uno.

### 2. Prueba de lectura desde el navegador (18:30 a 19:10)
Ya sabemos que el bucket S3 `nasa-irsa-spherex` envía `Access-Control-Allow-Origin: *`, pero que no tiene un índice por coordenadas. Con un `access_url` y las claves `cloud_access` que ya te da SIA:
1. ¿Se puede leer un recorte de un archivo con peticiones por rango (`Range`) directamente desde una página en el navegador, sin pasar por IRSA? Prueba con una página mínima y reporta el resultado con hora.
2. Si funciona: ¿cuántos bytes hay que leer para sacar un recorte de 64 × 64, comparado con el archivo completo (unos 65 MB según `access_estsize`, que SIA reporta en KB) y con los 4 MB del servicio de recortes? Mide.
3. Si no funciona, di por qué (cabeceras, rangos no soportados, etcétera). Este resultado decide si un campo nuevo puede resolverse sin un servidor.

Entrega en `docs/sprint-13-30/lectura-navegador.md`.

### 3. Piezas de la entrega del domingo (19:10 a 19:40)
La entrega local es de 8:00 a 12:00 y el pitch es de 3 a 5 minutos. Piezas que necesitamos y que puedes escribir tú, basándote en `sparks-en-breve.md`, `CONTEXTO.md` y `docs/pitch/pitch-3min-es.md`:
1. **Página del equipo en inglés** (`docs/entrega/pagina-equipo-en.md`): quiénes son, qué hace cada uno, qué construyeron, y un párrafo honesto de qué funciona y qué no.
2. **Guion del video de 30 segundos en inglés** (`docs/entrega/video-30s-guion-en.md`): plano por plano, con duración, texto y qué se ve en pantalla. Que cuente la historia de Tombaugh y el parpadeo en azul y ámbar.
3. **Guion de las diapositivas** (`docs/entrega/diapositivas-outline.md`): una diapositiva por idea, título y una frase.

Cada cifra con su fuente (`data-sample/results.json`). Lo que no esté verificado, "sin verificar". Nada de "descubrimos": son "candidatos a revisar".

## Reglas
Español (el video y la página del equipo, en inglés). Sin emojis. Hora y resultado de cada prueba de acceso. Nada del proyecto anterior. No toques `data-sample/` ni `Logo/`. Si algo te bloquea más de cinco minutos, avisa en el grupo.
