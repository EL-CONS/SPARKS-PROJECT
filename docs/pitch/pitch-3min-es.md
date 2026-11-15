# Pitch · 3 minutos · español · 7 diapositivas

Versión del 14 de noviembre, 23:40, alineada con la presentación `docs/pitch/presentacion/index.html` (7 diapositivas, el máximo de la regla; portada y cierre incluidos). Sustituye a la versión anterior, que citaba cifras del 5 de noviembre (WISE 0855 "7.9 contra 8.1", "1 607 473 imágenes", "ocho de nueve sin falsas alarmas") que ya no son las de `data-new/results.json`.

Tono: humilde, frases cortas, una idea por frase. **(pausa)** marca un silencio. Nunca "descubrimos": "candidatos para revisar".

Cómo presentar: abrir `docs/pitch/presentacion/index.html` en el navegador, pantalla completa (F11). Flechas o espacio para avanzar. La tecla `E` permite corregir un texto en vivo; se guarda en ese navegador. La URL de AWS ya está en `APP_URL`: el botón "Abrir Sparks en vivo" y el QR del cierre la usan.

---

### 1 · Portada (0:00–0:15)
> Somos Cosmonautas. Estudiamos Ciencias de la Computación aquí, en Hermosillo.
> Nos llamamos Cosmonautas… y pasamos semanas mirando al suelo. **(pausa)** Este reto nos hizo mirar arriba.

### 2 · Mirar dos veces (0:15–0:45)
> En 1930, Clyde Tombaugh tomó dos fotos del mismo cielo, con seis días de diferencia. Las alternó. Algo saltó. Era Plutón.
> **(pausa)**
> Hoy la NASA tiene SPHEREx, un telescopio que fotografía el cielo entero cada seis meses, en 102 colores.
> La estrella más rápida del cielo avanza apenas un píxel y medio en un año. Nadie puede revisar eso a mano.

Fuentes: placas del 23 y 29 de enero de 1930 (`docs/pitch/revision-ciencia.md`, verificado por Horacio). Barnard 10.39″/año (Gaia DR3) ÷ 6.15″ por píxel = 1.7 píxeles. 102 bandas y cielo completo cada seis meses: `docs/reto/reto.md`.

### 3 · Qué es Sparks: las luces (0:45–1:10)
> Así nació Sparks. Una chispa es una luz que cambió de lugar.
> Sparks toma fotos de SPHEREx de distintos meses y las hace parpadear. Lo que no se movió se queda quieto. Lo que se movió, salta.
> Azul es donde estaba. Ámbar, donde está ahora.
> Eliges un pedazo de cielo, o escribes sus coordenadas, desde un navegador o un teléfono.

Opcional, si sobra tiempo: clic en "Abrir Sparks en vivo" (abre WISE 0855 en la URL de AWS; enseñarla en **Resta**, no en parpadeo).

### 4 · La prueba: Barnard (1:10–1:40)
> Esta es la estrella de Barnard. Parpadea: un año de diferencia. Restamos una foto de la otra: lo que no se movió desaparece.
> Nuestra flecha dice: diez punto dos segundos de arco por año, más menos cuatro décimas.
> La de Gaia, el mejor catálogo de estrellas del mundo, dice diez punto cuatro.
> **(pausa)** Coinciden.

Fuente: `data-sample/results.json` (Barnard: 10.23 ± 0.43″/año contra 10.39, 0.4 σ; 6 puntos en D5 y D6, paralaje de Gaia descontada). Ojo: esta corrida es del 5 de noviembre; ver la decisión de procedencia en `docs/auditoria/procedencia.md`.

### 5 · Los cinco del reto (1:40–2:10)
> Probamos los cinco objetivos del reto. Tres se mueven. Dos cambian de brillo.
> WISE 0855 es la enana café más fría que se conoce. Gaia no la ve. En el infrarrojo largo brilla al menos diez veces más que en el corto: eso dice que es fría.
> Su movimiento nos da seis, el catálogo dice ocho. No lo escondemos: lo marcamos para revisar.
> Las dos variables no se mueven. R Draconis es tan brillante que satura la cámara, y Sparks lo dice en vez de inventar un número.

Fuentes (`data-new/results.json`): WISE 0855 6.04 ± 0.76 contra 8.088 (2.7 σ), cociente D6/D2 ≥ 10.09 (cota inferior); ε Indi B 4.21 ± 0.28 contra 4.684; RW Aurigae 1.32 ± 0.57, cota superior, no detección; R Draconis sin detecciones utilizables (satura).

### 6 · A escala (2:10–2:40)
> Pensemos en grande. SPHEREx ve más de mil millones de objetos, todo el cielo cada seis meses. Nadie puede revisarlo solo.
> Pero esto ya funcionó: cientos de miles de voluntarios han encontrado asteroides, cometas y enanas cafés comparando imágenes. La mayoría de las enanas cafés conocidas se encontraron así.
> Sparks corre en el navegador: cada pedazo de cielo nuevo es un archivo de unos cuatro megas, no un servidor más.
> Hoy son los cinco objetivos del reto. Lo que sigue es el cielo entero. Y siempre como candidatos para revisar: nuestro clasificador acierta 78 % en 69 objetos verificados.

Fuentes: más de mil millones de objetos, cielo completo cada seis meses, voluntarios y "la mayoría de las enanas cafés" (`docs/reto/reto.md`, texto de NASA; menciona backyardworlds.org). Tamaño por campo: los cinco campos pesan de 1.8 a 7.9 MB (`du` sobre `data-sample/barnard` y `data-new/*`). Clasificador: `ml-clasificador/resultados_v2.json` (0.7826, 69 objetos). "El cielo entero" es lo que sigue, no lo que hay hoy: dilo así.

### 7 · Cierre (2:40–3:00)
> A Plutón lo encontró un joven granjero de Kansas, mirando dos veces.
> **(pausa)**
> Con Sparks, el siguiente lo puedes encontrar tú.
> Cada chispa que se mueve tiene una huella. Somos Cosmonautas. Gracias.

En pantalla: QR a https://d3hfqg5g7frqp1.cloudfront.net/ (despliegue de Cons). Biografía de Tombaugh ("joven granjero de Kansas", sin título universitario): sin fuente en el repositorio; se usa como en el guion anterior.

---

## Si la demo en vivo falla
No se arregla en el escenario. La presentación no depende de la red, salvo las fuentes y el QR: el parpadeo y la resta son imágenes reales guardadas en `docs/pitch/presentacion/assets/`. Se sigue el guion igual.

## Preguntas difíciles
Las diez preguntas de un jurado astrofísico, con respuesta y fuente, están en `docs/pitch/revision-ciencia.md` (Horacio). Las tres más probables:
- **¿El 8 de 9 lo logró el ML?** Ya no lo citamos en este pitch. Si sale: fue la regla física, en una prueba previa (`data-sample/results.json`), no el modelo.
- **¿Por qué WISE 0855 da 6 y no 8?** Una estrella de fondo a 1.2 píxeles obliga a enmascararla y eso sesga el centroide; lo reportamos tal cual (P4 de la revisión).
- **¿Por qué R Draconis no tiene movimiento?** Satura las seis bandas; no usamos píxeles saturados ni rellenamos con Gaia (P8).
