# Pitch · 5 minutos · español

Misma historia que la versión de 3 minutos, con dos respiros más: la prueba (cómo sabemos que no es ruido) y la parte de "todo es tuyo". Mismas reglas: frases cortas, sin jerga, cada número en `fuentes.md`.

---

### 0:00 · Mundo ordinario (30 s)
**Pantalla:** negro → logotipo Sparks.

> Somos Cosmonautas. Estudiantes de Ciencias de la Computación en Hermosillo.
> Aquí, de noche, el desierto apaga casi todo. Y el cielo se enciende.
> Y aun así… pasamos semanas mirando al suelo.
> Primero radares que miden la Tierra. Después incendios.
> Hasta le pusimos nombre al proyecto: Sparks. Chispas de fuego.
> **(pausa)**
> Nos llamamos Cosmonautas. Algo no cuadraba.

### 0:30 · El llamado y la duda (30 s)
**Pantalla:** la página del reto "Planet X and SPHEREx".

> Entonces encontramos este reto. Planeta X.
> Lo primero que sentimos fue miedo. Somos programadores, no astrónomos.
> Pero el reto contaba una historia que nos cambió la idea.

### 1:00 · El mentor (30 s)
**Pantalla:** dos placas de 1930, lado a lado, alternándose (con crédito).

> 1930. Un joven de una granja de Kansas. Sin dinero para la universidad.
> Toma dos fotografías del mismo pedazo de cielo, con seis días de diferencia.
> Las mete en una máquina que las alterna. Una. Otra. Una. Otra.
> Y un puntito salta.
> Era Plutón.
> **(pausa)**
> Su herramienta no era un telescopio. Era mirar dos veces.

### 1:30 · La prueba (45 s)
**Pantalla:** el contador 1,607,473; luego un panel de Sparks en "Every image" corriendo rápido: cada cuadro de otro color.

> Noventa y seis años después, la NASA tiene SPHEREx.
> Fotografía todo el cielo en 102 colores. Ya publicó más de un millón seiscientas mil imágenes.
> Nadie puede compararlas a mano. Y no es fácil por tres razones.
> Uno: lo que se mueve apenas avanza un par de cuadritos de la imagen en un año.
> Dos: cada foto se toma en un color distinto. Si comparas dos fotos al azar, todo parece cambiar.
> Tres: el detector tiene ruido, reflejos, píxeles quemados.
> **(pausa)**
> Es como seguir un satélite… con una cámara que cambia de color en cada foto.
> Lo resolvimos así: juntamos las fotos del mismo color y de la misma temporada, las alineamos contra estrellas conocidas, y solo entonces restamos.

### 2:15 · La recompensa (60 s)
**Pantalla:** Sparks. Barnard en "Subtract B−A" → tarjeta. Luego WISE 0855: D6 → "Not in Gaia DR3" → huella → espectro.

> Barnard. La estrella más veloz del cielo.
> Restamos el cielo de hace un año al de hoy. Azul: donde estaba. Ámbar: donde está.
> Nuestra medida: 10.2 segundos de arco por año. Gaia dice 10.4. Coinciden.
> **(pausa)**
> La primera vez que vimos las dos flechas juntas, nos quedamos callados.
> **(pausa)**
> Y WISE 0855. La enana café más fría que se conoce. Unos 23 grados bajo cero.
> Gaia, el mejor catálogo de estrellas del mundo, no la tiene.
> En luz casi visible no hay nada. En el infrarrojo largo, ahí está.
> Su huella de 102 colores está apagada al principio y encendida al final.
> Esa forma dice "fría". El metano de su atmósfera se come la luz justo aquí.

### 3:15 · Cómo sabemos que no es ruido (45 s; si el tiempo aprieta, saltar la línea del modelo)
**Pantalla:** tabla de `models/report/final_test.md` (9 estrellas, una fila cada una) y `completeness.png`.

> Una pregunta honesta: ¿y si es un error del detector?
> Primero nos equivocamos. Ajustamos nuestra regla mirando las mismas estrellas con las que la probábamos. Eso no vale.
> Así que empezamos de nuevo. Elegimos estrellas veloces nuevas, las sorteamos, y guardamos la mitad bajo llave.
> Al final, con todo congelado, las abrimos una sola vez.
> **(pausa)**
> De nueve estrellas, Sparks encontró ocho. Y no inventó ninguna.
> También entrenamos un modelo de aprendizaje automático. Encuentra más estrellas débiles falsas que pusimos a propósito. Pero con las reales encontró seis, y dio diez falsas alarmas.
> Así que la app usa la regla. No queremos venderles algo que no está probado.

### 3:50 · El regreso con el elixir (45 s)
**Pantalla:** escribir coordenadas libres (precalentadas en la caché de la API; si no, decir en voz alta que tarda ~2 min) → cambiar campo de visión → "Share" → "Open on phone" con el QR.

> Sparks es de todos. Los objetivos del reto abren al instante. Escribes cualquier otra posición del cielo y en un par de minutos armamos su película en vivo.
> Eliges cuánto cielo ver. Sumas fechas o las restas. Prendes las marcas de calidad del detector.
> Copias un enlace, o lo metes en tu página.
> SPHEREx publica imágenes nuevas cada semana. Sparks no tiene los lotes escritos a mano: le pregunta al archivo de la NASA cuáles hay. Hoy usa dos, y el siguiente entrará sin tocar código.
> ¿Para quién? Voluntarios que buscan enanas cafés. Clubes de astronomía. Una escuela en Sonora. Y astrónomos que quieren un primer vistazo.
> No decimos "descubrimos". Decimos: aquí hay candidatos para revisar.

### 4:35 · Cierre (25 s)
**Pantalla:** QR grande y el lema.

> Plutón se encontró mirando dos veces.
> Nosotros miramos un millón de veces, en 102 colores.
> Escaneen el código. Su teléfono ahora es un pedazo de cielo de SPHEREx.
> **(pausa)**
> Cada chispa que se mueve tiene una huella.
> Somos Cosmonautas. Gracias.

---

## Si la demo en vivo falla
Igual que en la versión de 3 minutos: a los 5 segundos, `docs/pitch/demo-backup.webm` (36 s) y capturas. Frase puente: "El Wi-Fi decidió ser un asteroide. Les muestro la grabación de hace una hora, con los mismos datos." La sección 3:50 se cuenta sobre `v1-epsindib-frames-1440.png` (banderas) y la captura del diálogo de QR.

## Preguntas probables del jurado (respuestas de 1 frase)
- **¿Cuánto error tiene su alineación?** Medimos el desplazamiento de estrellas de referencia en cada suma: típicamente 0.01–0.05 píxeles, y entra en la barra de error.
- **¿WISE 0855 se mueve?** Sí: medimos 7.9 ± 1.4″/año; CatWISE dice 8.1. En 2026 pasa encima de otra estrella; medimos el brillo de esa estrella cuando estaban separadas y lo restamos.
- **¿El índice de frío es IA?** No. Es un cociente de luz entre dos colores y la profundidad de la banda de metano. Física, no aprendizaje automático.
- **¿Cómo validaron?** Elegimos 14 estrellas veloces de Gaia que nunca habíamos usado, las sorteamos con una semilla fija en validación (6) y prueba final (8), lo escribimos y lo guardamos antes de procesarlas, y corrimos la prueba final una sola vez con la regla y el modelo congelados.
- **¿No hicieron trampa antes?** Sí, sin querer: la primera prueba la usamos para ajustar la regla. Lo decimos en el repo y esas estrellas quedaron como conjunto de desarrollo.
- **¿Cuál estrella falló?** Una de magnitud 8.8 que se movió poco más de medio píxel; la regla la llamó "artefacto". Está en `final_test.md`.
- **¿Nueve estrellas no son pocas?** Sí. Alcanzan para ver que el detector funciona, no para dar un porcentaje preciso. El siguiente paso es probar con cientos en la supercomputadora Yuca.
- **¿Funciona con datos nuevos?** Sí: la lista de lotes se pide a IRSA cada vez; un `spherex_qr4` entra sin tocar código.
