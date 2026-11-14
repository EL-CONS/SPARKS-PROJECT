# Pitch · 3 minutos · español

Tono: humilde, frases cortas, una idea por frase. Pausas marcadas con **(pausa)**. Nada de jerga. Cada número sale de `fuentes.md`.

Antes de subir: abrir `?field=barnard` y `?field=wise0855&det=6` en dos pestañas, **en pantalla completa (F11)**; en un proyector de 1280×720 los 6 paneles quedan chicos, así que para cada momento wow se toca un panel para ampliarlo (o se usa `det=N` en la URL). El QR listo en la diapositiva final; el video de respaldo en el escritorio.

---

### 0:00 · Mundo ordinario (20 s)
**Pantalla:** negro. Luego el logotipo de Sparks (los dos cuadritos: uno azul, uno ámbar).

> Somos Cosmonautas. Estudiamos Ciencias de la Computación aquí, en Hermosillo.
> Nos llamamos Cosmonautas… y pasamos semanas mirando al suelo.
> Radares que miden la Tierra. Incendios. Hasta le pusimos nombre al proyecto: Sparks. Chispas.
> **(pausa)**
> Algo no cuadraba.

### 0:20 · El llamado (25 s)
**Pantalla:** dos fotos viejas del cielo, lado a lado (placas de Plutón, con crédito).

> Entonces leímos este reto.
> En 1930, un muchacho de una granja de Kansas, sin título universitario, tomó dos fotografías del mismo cielo. Con seis días de diferencia.
> Las puso una contra otra. Y algo saltó.
> Era Plutón.
> **(pausa)**
> Eso nos atrapó. No hacía falta un telescopio gigante. Hacía falta mirar dos veces.

### 0:45 · La prueba (30 s)
**Pantalla:** un contador grande: 1,607,473. Debajo: "imágenes de SPHEREx, hoy".

> Hoy la NASA tiene un telescopio, SPHEREx, que fotografía el cielo entero en 102 colores.
> Ya hay más de un millón seiscientas mil imágenes. Nadie puede compararlas a mano.
> Y no es fácil. Un punto que se mueve, apenas avanza un par de cuadritos de la imagen en un año.
> Cada foto está tomada en un color distinto.
> Y el detector tiene su propio ruido, sus reflejos, sus manchas.
> Es como rastrear un satélite… cuando tu cámara cambia de color en cada foto.

### 1:15 · La recompensa: Barnard (30 s)
**Pantalla:** Sparks en vivo. Botón "Barnard's Star". Vista "Subtract B−A": la mancha ámbar arriba, la azul abajo. Luego la tarjeta con las dos flechas.

> Esto es Sparks. Eliges un pedazo de cielo… y el cielo parpadea.
> Esta es la estrella de Barnard. Restamos el cielo de hace un año al de hoy.
> Lo azul es donde estaba. Lo ámbar, donde está.
> **(pausa)**
> Nuestra flecha dice: 10.2 segundos de arco por año.
> La de Gaia, el mejor catálogo de estrellas del mundo, dice 10.4.
> Coinciden.
> **(pausa)**
> La primera vez que vimos las dos flechas juntas, nos quedamos callados.

### 1:45 · La recompensa: WISE 0855 (35 s)
**Pantalla:** botón "WISE 0855". Panel D6 solo, con el punto en la retícula. Luego la línea "Not in Gaia DR3". Luego la huella de 102 colores: oscura arriba, encendida abajo.

> Ahora, algo más difícil. WISE 0855. La enana café más fría que se conoce. Unos 23 grados bajo cero. Como un congelador.
> Gaia no la ve. No está en su catálogo.
> En luz casi visible, aquí no hay nada. **(pausa)** En el infrarrojo largo… ahí está.
> Y esta es su huella en 102 colores.
> Apagada aquí. Encendida al final.
> Esa forma dice: es fría. El metano de su atmósfera se come la luz.
> Y también se mueve: nuestra flecha marca 7.9 por año; el catálogo infrarrojo, 8.1.

### 2:20 · El regreso con el elixir (25 s)
**Pantalla:** el campo de coordenadas; luego el botón "Open on phone" con el QR.

> Sparks es para cualquiera. Escribes coordenadas, o abres el enlace en tu teléfono.
> Los cinco objetivos del reto abren al instante. Un pedazo de cielo nuevo tarda un par de minutos: Sparks lo arma en vivo.
> Para voluntarios que buscan enanas cafés. Para clubes. Para una escuela en Sonora.
> Y para el astrónomo que quiere un primer vistazo antes de bajar gigas de datos.
> SPHEREx publica imágenes nuevas cada semana. Sparks no tiene los lotes escritos a mano: le pregunta al archivo cuáles hay. Hoy usa dos; el siguiente entrará solo.
> Lo probamos una sola vez con nueve estrellas veloces que nunca habíamos usado: encontró ocho, sin falsas alarmas.
> No decimos que descubrimos nada. Te damos candidatos para revisar.

### 2:45 · Cierre (15 s)
**Pantalla:** QR grande + "Every spark that moves has a fingerprint."

> Plutón se encontró mirando dos veces.
> Nosotros miramos un millón de veces, en 102 colores.
> **(pausa)**
> Cada chispa que se mueve tiene una huella.
> Somos Cosmonautas. Gracias.

---

## Si la demo en vivo falla
**Regla:** no se arregla en el escenario. A los 5 segundos se cambia al video de respaldo **`docs/pitch/demo-backup.webm`** (36 s, grabado de la app real: Barnard → WISE 0855 → QR; se regenera con `tests/e2e/record_demo.py`) y a las capturas de `docs/screenshots/`.

Frase puente:
> El Wi-Fi decidió ser un asteroide. **(pausa)** Les muestro la grabación de hace una hora, con los mismos datos.

Luego se sigue el guion igual, señalando las capturas `v1-barnard-sub-1440.png` y `v1-wise0855-stack-1440.png`. Toda la app funciona sin internet si se corre local (`make build` + `python -m http.server` dentro de `app/dist`): tener esa pestaña abierta antes de subir.

## Lema: 3 opciones
1. **"Every spark that moves has a fingerprint."** ← elegido: junta las dos ideas del producto (se mueve + huella de colores) y suena bien en inglés y en español ("Cada chispa que se mueve tiene una huella").
2. "Look twice. In 102 colors."
3. "The coldest sparks glow in infrared."
