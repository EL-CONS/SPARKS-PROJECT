# ESQUELETO-UX · Sparks · recorrido guiado

Fecha: 12 de noviembre de 2026. Base: commit `0949c86`, app corriendo con `make dev` (puerto 5174) y las capturas `docs/screenshots/v3-*`. Solo lectura sobre el repo; este archivo es el único entregable.

Qué leí: `app/src/*` completo (`main.ts`, `stage.ts`, `card.ts`, `panes.ts`, `data.ts`, `i18n.ts`, `live.ts`, `coords.ts`, `color.ts`), `app/index.html`, `app/src/styles/*`, `DESIGN.md`, `docs/compliance.md`, `docs/design-audit.md`, `AUDITORIA.md`, `JURADO.md`, `CONTEXTO*.md`, `results/results.json`, `branding/sparks/original/logo.svg` y el PNG de `Logo/`, y los `manifest.json` de los cinco objetivos.

Qué vi en vivo: Barnard en "Resta B−A" a 1440 px y WISE 0855 en "Suma A+B", D6, a 375 px, ambos en español. Coinciden con las capturas v3.

Convenciones del documento:
- Todo número citado sale de un `manifest.json`, de `results/results.json` o de `AUDITORIA.md`. Si una cifra la calculé yo (una división, una mediana), lo digo.
- **NUEVO** marca lo que el pipeline o la app no tienen hoy, con su requisito.
- "Dato" = campo del manifiesto. Ruta escrita como `target.measured.mu`.

---

## 1. Evaluación del prototipo actual

### 1.1 Lo que funciona

Los datos están. Los seis paneles, los modos, el dial, la huella, el espectro y la curva de luz existen y son correctos. El estado vive en la URL. Funciona a 390 px y sin internet. La estética ya sigue `DESIGN.md`. Nada de eso se tira.

### 1.2 Pantalla por pantalla

Columnas: ¿qué veo? / ¿qué significa? / ¿qué hago? = sí, no, parcial. Veredicto: claro, confuso, ruido.

**Barra superior**

| Elemento | Qué es | Veo | Significa | Hago | Veredicto |
|---|---|---|---|---|---|
| Marca "sparks" con dos cuadritos | Logo | parcial | no | no | Confuso. Nadie sabe que azul = antes y ámbar = ahora |
| Campo de coordenadas con `17h57m47.66s +04°46′01.9″` | Entrada RA/Dec | no | no | parcial | Confuso. Para quien no es astrónomo es una cadena críptica; nada dice "esto es una dirección en el cielo" |
| Botón "Ver cielo" | Enviar | sí | parcial | sí | Claro |
| Compartir / Insertar / Abrir en el teléfono | Herramientas | sí | sí | sí | Claro |
| EN / ES | Idioma | sí | sí | sí | Claro |

**Fila de objetivos**

| Elemento | Qué es | Veo | Significa | Hago | Veredicto |
|---|---|---|---|---|---|
| "Objetivos del reto" | Etiqueta | parcial | no | no | Confuso. "Reto" no significa nada para quien llega sin contexto |
| Botón "Barnard's Star · la estrella más veloz" | Selector | sí | parcial | sí | Claro. Es el mejor texto de toda la app |
| "RW Aurigae · estrella joven que se apaga" | Selector | sí | parcial | sí | Confuso: "se apaga" promete más de lo medido (1.00, 1.03, 0.89) |
| "Más estrellas veloces · se mueve 5.1″/año (medido)" | Galería | sí | parcial | sí | Parcial. "5.1″/año" sin escala humana |
| "Sobre Hermosillo ahora · en vivo · usa la API" | Cenit | parcial | no | no | Ruido en la demo (la API no está desplegada). Confuso para público |

**Escenario (los seis paneles)**

| Elemento | Qué es | Veo | Significa | Hago | Veredicto |
|---|---|---|---|---|---|
| Seis cuadros grises o azul/ámbar | Imágenes SPHEREx por detector | no | no | no | Confuso. Nadie sabe que son seis "colores" del mismo pedazo de cielo |
| "D1 · 0.92 µm" | Detector y longitud de onda | no | no | no | Ruido para no expertos. "µm" no se traduce |
| "λ-matched · 23+18 img" | Metadato de la resta | no | no | no | Ruido. Es útil para un físico, ilegible para los demás |
| "1′" (barra de escala) | Escala angular | no | no | no | Ruido sin frase |
| Retícula ámbar sobre el objetivo | Marca de la chispa | parcial | no | no | Confuso. No dice "aquí está la estrella" |
| Mancha azul + mancha ámbar (Resta B−A) | Dipolo de movimiento | parcial | no | no | Confuso. Es el momento wow y no tiene anotación |
| Destello al cambiar de cuadro | Gesto de marca | sí | no | no | Parcial |
| Clic en un panel para ampliar | Interacción | no | — | sí | Confuso: no hay pista de que se puede |

**Transporte y controles**

| Elemento | Qué es | Veo | Significa | Hago | Veredicto |
|---|---|---|---|---|---|
| Play / anterior / siguiente | Reproducción | sí | parcial | sí | Claro |
| Velocidad 3 | Cuadros por segundo | sí | no | sí | Parcial ("3" de qué) |
| Parpadeo · Cada imagen · Suma A+B · Resta B−A · Menos mediana | Modos | parcial | no | sí | Confuso. Ningún modo dice qué provoca antes de tocarlo |
| A 2025-08 (119) · B 2026-08 (118) | Temporadas | parcial | no | sí | Confuso. "A" y "B" no dicen "antes" y "ahora"; el 119 no dice "fotos" |
| Detector · Los 6 | Selector | parcial | no | sí | Parcial |
| Campo de visión · 6.6′ | Selector | no | no | sí | Confuso. El minuto de arco no es una unidad humana |
| Banderas de calidad · Estrellas de catálogo | Casillas | parcial | no | sí | Parcial |
| Línea de tiempo con fechas | Cuándo se tomó cada foto | parcial | no | no | Parcial. Buena, sin frase |
| Leyenda "Cambio, en unidades de ruido (σ) · −12σ antes · 0 · +12σ ahora · asinh" | Escala de color | parcial | no | no | Confuso. "σ" y "asinh" no se explican |
| "6.6′ × 6.6′ · 355 imágenes · live: ≈ 31.6 MB, ≈ 94 s" | Estimación del modo en vivo | no | no | no | Ruido en un campo precalculado |

**Tarjeta (lado derecho)**

| Elemento | Qué es | Veo | Significa | Hago | Veredicto |
|---|---|---|---|---|---|
| "Barnard's Star" + nota "Enana roja M4V a 1.8 pc" | Título y nota | sí | parcial | no | Parcial: "M4V" y "pc" sin traducir |
| "Se mueve 10.23 ± 0.43″ al año. Gaia DR3 dice 10.39″." | Veredicto | sí | parcial | no | Casi claro. Falta decir qué es Gaia y qué significa "±" |
| "En Gaia DR3 (G = 8.2)" | Verificación de catálogo | no | no | no | Ruido para no expertos |
| Dial con dos flechas | Medido vs esperado | parcial | no | no | Confuso sin leyenda escrita junto al dial (la hay solo en `title`) |
| "354.8° ± 2.0° · 6 pts · D5,6" | Dirección y puntos | no | no | no | Ruido sin frase |
| "Huella de 102 colores" + rejilla 6×17 | Espectro resumido | parcial | no | no | Confuso. "Tono = longitud de onda" no ayuda a un niño; a un físico le falta la escala |
| Espectro con bandas H₂O, CH₄, CO₂, CO | Gráfica | parcial | parcial | no | Parcial. Bien para físicos; sin frase para los demás |
| "¿Es fría? · cociente > 10.9 · Cuerpo negro con el mismo cociente < 1258 K · metano 1.03 ± 0.07" | Índice de frío | parcial | no | no | Confuso y, en la fila de kelvin, **falso como presentación** (B2 de la auditoría) |
| "Brillo en el tiempo" (R Dra, RW Aur) | Curva de luz | parcial | no | no | Confuso. Puntos de colores sin decir "esto sube y baja" |
| "Señal/ruido: una imagen vs la suma" (plegado) | Tabla | no | no | no | Ruido fuera de la capa experta |

**Cajón inferior (pestañas)**

| Elemento | Qué es | Veo | Significa | Hago | Veredicto |
|---|---|---|---|---|---|
| Contexto del cielo (Aladin) | Atlas | parcial | no | parcial | Parcial. Útil; sin frase de qué es |
| Detalles de la imagen (tabla de metadatos) | Metadatos y banderas | no | no | no | Ruido fuera de la capa experta; correcto para C9 |
| Candidatos (tabla con etiquetas) | Residuos del detector | no | no | parcial | Confuso. Texto en inglés en modo ES. En WISE 0855 contradice al dial (B1) |
| Datos y método | Explicación | sí | sí | no | Claro, pero en inglés y escondido |

**Estados**

| Estado | Texto actual | Veredicto |
|---|---|---|
| Cargando | "Cargando datos de SPHEREx…" | Parcial. Sin tiempo estimado ni nada que enseñar |
| Sin API | "Esta posición no está precalculada. El modo en vivo necesita la API…" | Claro, largo |
| IRSA lenta | "IRSA está lenta ahora. Puedes esperar o abrir uno de los 5 objetivos." | Claro |
| Error de carga | `String(e)` crudo | Ruido |
| Sin imágenes | "Todavía no hay imágenes de SPHEREx aquí." | Claro, sin salida |
| Vacío inicial | No existe: la app abre directo en Barnard | Confuso: no hay portada que diga qué es esto |

### 1.3 Auditoría de números sueltos

Conteo sobre `v3-barnard-sub-1440.png` (escritorio, Barnard, Resta B−A, lo que cabe en una pantalla) y sobre mi captura a 375 px de WISE 0855. Cuento como "número suelto" cualquier cifra, fecha o unidad sin una frase en lenguaje llano a menos de una línea de distancia.

| Zona | Números visibles | Con frase llana | Sueltos |
|---|---|---|---|
| Campo de coordenadas | 1 cadena | 0 | 1 |
| Seis paneles (D#, µm, "23+18 img", "1′") | 24 | 0 | 24 |
| Transporte (velocidad, A y B con conteos, campo 6.6′) | 6 | 0 | 6 |
| Tarjeta: veredicto | 2 | 2 | 0 |
| Tarjeta: nota, Gaia, dial y cifras del dial | 8 | 0 | 8 |
| **Total escritorio** | **41** | **2** | **39** |

A 375 px se suman la leyenda (−12σ, 0, +12σ), la estimación de modo en vivo (6.6′ × 6.6′, 255, 31.6 MB, 94 s) y la tarjeta completa de frío (> 10.9, < 1258 K, 1.03 ± 0.07, 0.17, 49.5, 7513): **57 números, 2 con frase.**

Resultado: 95 % de los números en pantalla son ruido para quien no sabe astronomía.

### 1.4 Los cinco problemas que más dañan la comprensión

1. **No hay portada ni primera frase.** La app abre en Barnard con 41 números y cero oraciones. Un visitante no sabe qué es, qué mirar ni qué hacer. Falla la prueba de 5 segundos.
2. **El momento wow no está anotado.** La mancha azul y la ámbar son el hallazgo y nadie dice "aquí estaba, aquí está". La gramática antes/ahora existe en los tokens y no en la pantalla.
3. **Los controles describen el mecanismo, no el efecto.** "Resta B−A", "Menos mediana", "λ-matched", "A/B". El usuario no puede predecir qué pasará si toca.
4. **Dos afirmaciones de pantalla contradicen la honestidad del proyecto.** "< 1258 K" como temperatura (B2) y la etiqueta "variable/static" del residuo de WISE 0855 junto a un dial que dice 7.9″/año (B1).
5. **La barra de error no se entiende.** "± 0.43" y la cuña del dial son correctas, pero nada dice "la verdad está entre 9.8 y 10.7, y Gaia cae adentro".

---

## 2. Idea central

**Metáfora única:** el comparador de parpadeo de Tombaugh, con un guía al lado.

**Frase que la resume (ES):** "Dos fotos del mismo cielo, con un año de diferencia. Mira qué saltó."
**(EN):** "Two photos of the same sky, one year apart. See what jumped."

**La gramática antes/ahora es el lenguaje de toda la interfaz:**
- Todo lo que es "antes" es azul `#62B6E8` y **hueco** (contorno). Todo lo que es "ahora" es ámbar `#FFB238` y **sólido**. El favicon ya lo hace; se extiende a todo.
- El logo son dos placas. En la portada las dos placas parpadean una vez (azul, ámbar, azul, ámbar), 3 veces por segundo, y se detienen. Eso enseña el instrumento sin texto.
- Las temporadas dejan de llamarse A y B. Se llaman **Antes** (azul, hueco) y **Ahora** (ámbar, sólido), con su fecha.
- Las marcas sobre las imágenes: un círculo hueco azul donde estaba, un punto sólido ámbar donde está, una flecha ámbar entre los dos.
- El dial: flecha hueca azul = lo que dice el catálogo (lo que ya se sabía, "antes"); flecha sólida ámbar = lo que midió Sparks ("ahora"). Ya es así en color; se le agrega el hueco/sólido y la leyenda escrita.
- El progreso del recorrido: pasos hechos en azul hueco, paso actual en ámbar sólido.
- El único botón ámbar sólido de cada pantalla es el siguiente paso.

**Qué ve y siente alguien en los primeros 5 segundos:** una pantalla casi negra, dos placas que parpadean, una frase corta y un botón ámbar que dice "Mira la estrella que más se mueve". Siente que es un instrumento, no una tabla. Entiende que va a comparar dos fotos.

**Prueba de 5 segundos.** Se muestra la portada 5 segundos a una persona que nunca vio Sparks, se tapa y se le pregunta: "¿Qué hace esto?". Pasa si dice algo equivalente a "compara fotos del cielo para ver qué se movió". Pasa el 4 de 5 personas o más.

---

## 3. Funcionamiento: el recorrido guiado

### 3.1 Qué es el narrador

No es un tutorial emergente ni una serie de globos sobre controles. Es una **franja de narración** fija (abajo del cielo en móvil, a la derecha del cielo en escritorio) que cuenta una historia en 7 pasos. Cada paso cambia lo que el escenario muestra y añade una anotación sobre la imagen. El usuario avanza con un botón ámbar o con la flecha derecha. Puede salir en cualquier paso y queda en la vista libre, con todo lo que el paso dejó puesto.

El narrador usa los datos que ya están en el manifiesto. No calcula nada nuevo salvo divisiones y una mediana (marcadas abajo).

### 3.2 El esqueleto común (7 pasos)

Mira → Compara → Algo se movió → Cuánto → ¿Es real? → Qué más cuenta → Ahora tú.

Para cada paso: qué aparece, qué se anima, texto del narrador (ES/EN), dato que lo alimenta, qué puede tocar el usuario, cómo salir. Los textos de abajo son los de Barnard; los demás objetivos están en 3.3.

**Paso 1 · Mira**
- Pantalla: un solo panel grande, D6 (el detector de 4.7 µm, donde Barnard se ve limpio), temporada Antes, gris. Retícula ámbar sobre la estrella. Anotación: "Esta es la estrella de Barnard" con una línea fina hasta la retícula. Abajo: "Foto de SPHEREx, agosto de 2025. 24 fotos sumadas."
- Animación: la retícula hace su destello de 160 ms al aparecer. Nada más.
- Narrador ES: "Este es un pedazo de cielo del tamaño de un cuarto de Luna. Cada punto es una estrella." EN: "This is a patch of sky about a quarter of the Moon wide. Every dot is a star."
- Dato: `coadds` (det 6, season 0), `seasons[0].start`, `coadds[].n_frames`, `field.fov_arcmin` (6.56′; la Luna mide ~31′, así que un cuarto de Luna es 7.8′: la analogía es "un poco menos de un cuarto de Luna"; se dice "cerca de un cuarto de Luna").
- Puede tocar: nada más que Siguiente y Salir. En capa "explora" puede cambiar de detector.
- Salir: botón "Explorar por mi cuenta" siempre visible. Saltar: flechas de paso y una barra de 7 puntos; se puede ir a cualquier paso.

**Paso 2 · Compara**
- Pantalla: mismo panel, modo Parpadeo entre Antes (agosto 2025) y Ahora (agosto 2026), a 2 cuadros por segundo. Etiqueta grande sobre la imagen que alterna: "ANTES · ago 2025" en azul hueco y "AHORA · ago 2026" en ámbar sólido.
- Animación: el parpadeo mismo. Con "reducir movimiento": no parpadea solo; aparecen dos paneles lado a lado, Antes y Ahora, con las etiquetas fijas.
- Narrador ES: "Ahora la misma foto, un año después. Fíjate en la estrella del centro." EN: "Now the same photo, one year later. Watch the star in the middle."
- Dato: `seasons[a]`, `seasons[b]`, `mjd_mean` para el "un año" (0.98 años en Barnard: se dice "un año").
- Puede tocar: pausa, velocidad.
- Salir: igual.

**Paso 3 · Algo se movió**
- Pantalla: el panel pasa a Resta (Ahora − Antes). Sobre el dipolo: círculo hueco azul en la posición medida en Antes, punto sólido ámbar en la posición medida en Ahora, flecha ámbar de uno a otro. Dos etiquetas: "estaba aquí" (azul) y "está aquí" (ámbar).
- Animación: primero aparece el círculo azul (0 ms), luego el punto ámbar (400 ms), luego la flecha se dibuja (800 ms a 1200 ms). Ver sección 8.
- Narrador ES: "Lo azul es donde estaba. Lo ámbar es donde está. Se movió." EN: "Blue is where it was. Amber is where it is. It moved."
- Dato: `target.points` con `use = true` para D6, temporadas 0 y 2 (`x`, `y` medidos; `ex`, `ey` sus errores). Si un objetivo no tiene puntos usados, las marcas vienen de `target.source` propagado con el catálogo y el narrador lo dice ("según el catálogo").
- Puede tocar: volver a Parpadeo, ver los seis detectores.
- Salir: igual.

**Paso 4 · Cuánto**
- Pantalla: sobre la imagen aparece una regla de un píxel de ancho junto a la flecha, con la etiqueta "1 cuadrito = 6 segundos de arco". A la derecha, el número grande en Archivo: "10.2″ al año" y debajo "1.7 cuadritos de esta foto por año".
- Animación: la regla se extiende desde el círculo azul hasta el punto ámbar.
- Narrador ES: "Avanza 10 segundos de arco cada año. Menos de dos cuadritos de esta foto. Para cruzar la Luna tardaría unos 180 años." EN: "It moves 10 arcseconds a year. Under two pixels of this photo. It would take about 180 years to cross the Moon."
- Dato: `target.measured.mu` (10.23), `field.pixel_arcsec` (6.15). "1.7 cuadritos" = 10.23 / 6.15 = 1.66 (división en el cliente). "180 años" = 1800″ / 10.2″ = 176 (la Luna mide ~0.5° = 1800″). Esta analogía solo se usa en Barnard; para los demás se calcula igual (ε Indi B: ~380 años; WISE 0855: ~220 años) o se omite.
- Puede tocar: nada nuevo.

**Paso 5 · ¿Es real?**
- Pantalla: el dial, con leyenda escrita junto a cada flecha: "Sparks midió" (ámbar sólido) y "El catálogo Gaia decía" (azul hueca). Debajo, la **barra de error dibujada como un rango**: una línea horizontal de 9.8 a 10.7 en ámbar, con un punto en 10.23, y una marca azul en 10.39 que cae dentro. Texto: "La verdad está entre 9.8 y 10.7. Gaia dice 10.39. Cae adentro."
- Animación: la marca azul entra desde fuera y se detiene dentro del rango.
- Narrador ES: "Gaia es el mejor catálogo de estrellas que existe. Ya sabía cuánto se mueve Barnard. Nuestra medida coincide. Eso prueba que el instrumento mide bien." EN: "Gaia is the best star catalog there is. It already knew how fast Barnard moves. Our measurement agrees. That shows the instrument works."
- Dato: `measured.mu`, `measured.mu_err`, `expected.mu`, `expected.catalog`. El rango es mu ± mu_err. El acuerdo en sigmas es |mu − exp| / mu_err (0.4 en Barnard; `results.json → agreement_sigma`).
- Reglas de verbo (sección 13): "coincide" solo si el acuerdo es ≤ 1σ y la barra es ≤ 10 % del valor (solo Barnard entre los cinco). Si no: "compatible".
- Puede tocar: "Ver por detector" (abre la tabla actual).

**Paso 6 · Qué más cuenta**
- Pantalla: depende del objetivo. En Barnard: la fila de objetivos de la galería con la frase "Lo repetimos en 11 estrellas. Todas dentro del error." (dato: `index.json`, 13 campos con `mu_measured`; los 8 de galería más Barnard, ε Indi B y WISE 0855 = 11). En WISE 0855: huella y cociente. En R Dra: curva de luz. Ver 3.3.
- Narrador ES (Barnard): "Barnard está saturada: brilla tanto que desborda el detector. Por eso aquí no hay espectro. Lo que sí hay son otras 10 estrellas medidas con el mismo método." EN: "Barnard is saturated: it is so bright it overflows the detector. That is why there is no spectrum here. What there is: 10 more stars measured the same way."
- Dato: `target.spectrum[].good` todos falsos → `saturated`; `index.json`.

**Paso 7 · Ahora tú**
- Pantalla: aparecen los controles de la capa "explora" (modos con sus efectos escritos, Antes/Ahora, detector) y un botón ámbar "Siguiente historia: WISE 0855, la enana fría". Debajo, en gris: "O escribe una dirección del cielo".
- Narrador ES: "Ahora te toca. Cambia de color, de fecha o de vista. Todo lo que ves se puede compartir con el enlace." EN: "Your turn. Change the colour, the date or the view. Everything you see can be shared with the link."
- Dato: ninguno.
- Puede tocar: todo lo de la capa activa.
- Salir: ya está fuera.

**Reglas del narrador**
1. Máximo 2 frases por paso. (Las de arriba tienen 2 o 3 frases cortas; el límite duro es 2 oraciones principales más una coletilla de menos de 8 palabras.)
2. Una idea por paso.
3. Ninguna jerga sin traducción en la misma frase: "segundo de arco" va siempre con "cuadrito"; "catálogo" con "lista de estrellas" la primera vez; "saturada" con "desborda el detector".
4. Ninguna afirmación que el dato no sostenga: el narrador se genera con plantillas que miran el dato (ver 3.5) y nunca con texto fijo por objetivo salvo las historias de los 5, que Horacio aprueba.
5. Siempre se puede pausar, retroceder, saltar y salir. Nada avanza solo.
6. El narrador nunca tapa la imagen. Vive en su franja; las anotaciones sobre la imagen son etiquetas cortas (≤ 3 palabras) con línea fina.

### 3.3 Los cinco objetivos del reto

| Objetivo | Historia en una línea | Pasos que aplican | Qué cambia | Datos |
|---|---|---|---|---|
| **Barnard** | Se mueve rápido | 1 a 7 completos | La historia modelo. Paso 6 = "lo repetimos en 11 estrellas" | Todo lo de 3.2 |
| **ε Indi B** | Dos mundos en órbita que SPHEREx ve como uno | 1, 2, 3, 4, 5, 6, 7 | Paso 1 añade: "En realidad son dos enanas que giran una alrededor de la otra; SPHEREx las ve como un punto". Paso 5 dice "compatible": 4.54 ± 0.11 contra 4.68 (1.3σ). El rango 4.43 a 4.65 deja a Gaia justo afuera: se dibuja y el narrador lo dice: "Gaia queda un pelo afuera del rango. Son dos estrellas girando; su centro de luz se mueve un poco. Lo llamamos compatible, no coincidencia." Paso 6 = huella y cociente 1.73 (es tibia, no fría: "más luz larga que corta, pero lejos de WISE 0855") y metano 0.81 | `measured`, `expected`, `cold.ratio` 1.73, `cold.methane_depth` 0.81, 22 puntos en los 6 detectores |
| **WISE 0855** | Fría y casi invisible | 1, 2, 3 (modificado), 4, 5, 6, 7 | Paso 1 abre en D1 (0.9 µm): "Aquí no hay nada". Luego salta a D6: "Aquí está". Paso 2 parpadea D6 entre Ahora (abr 2026, 100 fotos) y la temporada intermedia (nov 2025, 126 fotos), **no** la primera (29 fotos de dos días). Paso 3 **no usa la Resta**: muestra el parpadeo con el círculo azul y el punto ámbar en las posiciones medidas de D6 (temporadas 1 y 2) y el narrador dice: "En la resta no se alcanza a ver: la primera temporada son 29 fotos de solo dos días. La medimos donde sabíamos buscar." Paso 5 dice "compatible": 7.9 ± 1.4 contra 8.1 (rango 6.6 a 9.3). Añade la línea "Gaia no la ve: es demasiado tenue en luz visible. La encontró el telescopio WISE, en infrarrojo." Paso 6 = la huella: "102 colores y solo se enciende en los últimos. Eso dice que es fría." Cociente "más de 10 veces más luz a 4.5 µm que a 1.3 µm; una estrella como el Sol da 0.17". Metano: "la banda del metano se come toda la luz a 3.3 µm". **Nunca** kelvin | `snr` por detector (D1 1.7, D6 10.3), `points` D6 temporadas 1 y 2 (`use = true`), `gaia_check.in_gaia = false`, `nearest_gaia_arcsec` 10.7, `cold.ratio` 10.88 con `ratio_kind = lower_limit`, `blackbody_ratio_4p7_1p35["6000"]` 0.17, `methane_depth` 1.03 → se muestra como "absorción total" |
| **R Dra** | Cambia de brillo | 1, 2, 3 (reemplazado por "Algo cambió"), 4 (reemplazado), 5 (reemplazado), 6, 7 | Paso 2 parpadea las tres temporadas. Paso 3 "Algo cambió": modo Menos mediana; el centro aparece ámbar en may 2025 y azul en abr 2026, en el mismo lugar. Narrador: "No se movió. Cambió de brillo. Más brillante al principio, menos al final." Paso 4 "Cuánto": la curva de luz con tres medianas marcadas: 1.47, 1.00, 0.79. Narrador: "En mayo de 2025 brillaba casi una vez y media lo normal. Un año después, cuatro quintos. Es una estrella que respira: tarda 246 días en un ciclo y solo la vimos tres veces." Paso 5 "¿Es real?": "Cinco estrellas vecinas medidas igual no cambian ni 1 %. El cambio es de R Dra." Paso 6: saturada, sin espectro | `lightcurve.points` (528 puntos), medianas por temporada (**NUEVO**: calcularlas en el cliente con la mediana de `rel` por temporada, o exportarlas en `precompute`; los valores 1.47 / 1.00 / 0.79 ya están en `results.json`), `lightcurve.n_saturated` 534 de 534. El control de estrellas vecinas está en `AUDITORIA.md` G7, **no en el manifiesto**: la frase del paso 5 solo se dice en R Dra, como texto aprobado; si se quiere generalizar es NUEVO (requiere exportar las medianas de control) |
| **RW Aur** | Resultado sugerente, no concluyente | 1, 2, 3 (como R Dra), 4 (como R Dra), 5 (modificado), 7. Se omite 6 | Paso 4: medianas 1.00, 1.03, 0.89. Narrador: "Bajó un 10 % en la última temporada. Es poco y lo decimos así: sugerente, no concluyente." Paso 5: "Esta estrella joven tiene apagones famosos. Lo que vimos no alcanza para decir que fue uno." Sin control de vecinas | `lightcurve` (330 puntos, 302 de 331 saturadas), medianas por temporada (**NUEVO**, igual que R Dra) |

Cambio de texto obligado en la fila de objetivos: "RW Aurigae · estrella joven que se apaga" pasa a "estrella joven que cambia poco". "R Draconis · gigante que pulsa" se queda.

### 3.4 El flujo de demo de 3 minutos cae solo

Portada → botón "Barnard" → pasos 1 a 5 con la flecha derecha (5 clics) → paso 7, botón "Siguiente historia: WISE 0855" (1 clic) → pasos 1, 3, 6 (saltando con la barra de puntos: 3 clics) → "Siguiente historia: R Dra" → paso 3 y 4 (2 clics). Un clic por paso, sin tocar ningún selector. Las URLs de cada paso existen (`story=barnard&step=3`), así que las pestañas del pitch se abren directo.

### 3.5 Posición nueva sin historia preparada

Cuando el usuario escribe RA/Dec y no hay campo precalculado a menos de 2′, corre el modo en vivo (`live.ts`) y llega un manifiesto con `kind = field`, un `target` en la posición escrita (espectro forzado) y `candidates`. El narrador genérico se arma así, con plantillas que leen el dato:

| Paso | Plantilla ES | Dato | Si falta |
|---|---|---|---|
| Mira | "Este pedazo de cielo lo fotografió SPHEREx {n} veces entre {mes1} y {mes2}." | `frames.length`, `seasons[0].start`, `seasons[-1].end` | Si `n = 0`: estado "sin imágenes" (sección 6) |
| Compara | "Parpadeo entre {mesA} y {mesB}. Si algo salta, es que se movió." | `seasons` | Si hay una sola temporada: "Solo hay una fecha. Todavía no se puede comparar. SPHEREx vuelve cada seis meses." y se salta a Ahora tú |
| Algo se movió | Si hay candidato con `rule_label = mover` y `detectors.length ≥ 2`: "Hay un residuo que parece moverse (marcado). Es un candidato para revisar, no un hallazgo." Si no: "Nada se movió por encima del ruido en estas {n} fotos. Eso también es un resultado." | `candidates` | — |
| Cuánto | Solo si hay candidato mover: "El par azul/ámbar está separado {d} cuadritos. Eso sugiere más de {mu} segundos de arco al año, pero este número es grueso: viene de la distancia entre las dos manchas y subestima movimientos chicos." | `candidates[].dipole_motion.dx_px`, `dy_px`, `mu_arcsec_yr`, y su `note` | Se omite |
| ¿Es real? | "Sparks no midió una flecha aquí: no sabía qué buscar. Compara con las estrellas conocidas: {g} de Gaia en la foto." Si el candidato tiene `catalog.known_mover`: "Es una estrella que ya se sabía que se mueve: {pm}″ al año según {cat}." | `n_refs.gaia`, `candidates[].catalog` | — |
| Qué más cuenta | "Este es el espectro justo en la posición que escribiste." Si `cold.ratio` existe: cociente con la frase llana. Si no: "No hay señal suficiente para un espectro." | `target.spectrum`, `target.cold` | — |
| Ahora tú | Igual que siempre | — | — |

Regla dura: en un campo nuevo el narrador nunca dice "se mueve", "descubrimos", "es una enana", "es frío". Dice "parece", "candidato", "sugiere", "compatible con".

---

## 4. Traducción de números y gráficos

Columnas: para un niño de 8 (capa "mira"), para un aficionado (capa "explora"), versión científica (capa "mide"). Las tres viven en la misma pantalla; la capa decide cuál se ve (sección 5). Analogías verificadas con la cuenta escrita.

| Número o gráfico | Niño de 8 | Aficionado | Científico | Cuenta |
|---|---|---|---|---|
| Movimiento propio 10.23″/año (Barnard) | "Se mueve menos de dos cuadritos de la foto al año. Tardaría 180 años en cruzar la Luna." | "10 segundos de arco al año. Un segundo de arco es 1/3600 de grado. Es la estrella que más rápido cruza el cielo." | "μ = 10.23 ± 0.43″/año, PA 354.8° ± 2.0°, 6 puntos (D5, D6), base 0.98 años, paralaje restada (547 mas)." | 10.23 / 6.15 = 1.66 px/año. Luna ≈ 1800″; 1800 / 10.2 = 176 años |
| Un píxel = 6.15″ | "Un cuadrito es como ver una moneda a casi un kilómetro." | "Cada cuadrito mide 6 segundos de arco: una moneda de 2.5 cm a 840 m." | "6.15″/px, malla común norte arriba, 64 × 64 px, 6.56′." | 0.025 m / 838 m = 2.98e-5 rad = 6.15″ |
| 1″ (para la escala del dial) | "Un segundo de arco es un milímetro visto a 200 metros." | igual | "1″ = 4.85 µrad." | 0.001 / 206 m = 4.85e-6 rad = 1.0″ |
| Barra de error ± 0.43 | "La verdad está entre 9.8 y 10.7. Seguro." (ver dibujo abajo) | "Más o menos 0.43: si repitiéramos la medida muchas veces, dos de cada tres caerían entre 9.8 y 10.7." | "1σ, escalada por √χ² (3.6 y 4.8 en AR y Dec); jackknife 0.41." | 10.23 − 0.43 = 9.80; 10.23 + 0.43 = 10.66 |
| Comparación con Gaia / CatWISE | "Otro telescopio ya lo había medido. Dio casi lo mismo." | "Gaia (luz visible, ESA) dice 10.39. Cae dentro de nuestro rango: coincide." | "Δ = 0.16″/año = 0.4σ. Para ε Indi B 1.3σ; para WISE 0855 0.1σ con σ = 1.35." | |mu − exp| / mu_err |
| "Gaia no la ve" (WISE 0855) | "Gaia mira con luz normal y no la ve. SPHEREx mira con calor y sí." | "No está en Gaia DR3; la estrella de Gaia más cercana queda a 10.7″ (casi dos cuadritos). La encontró WISE en infrarrojo." | "`in_gaia = false`, `nearest_gaia_arcsec` 10.7, radio 3″, 285 fuentes Gaia en el campo." | 10.7 / 6.15 = 1.7 px |
| S/N (señal/ruido) 13.5 en D5 | "Qué tan claro se ve el punto contra el fondo. Trece es claro. Menos de tres es casi nada." | "Señal entre ruido. Por debajo de 3 no se distingue del fondo; aquí D5 da 13 y D1 da 1.7." | "S/N en el apilado por detector: 1.7, 1.0, −0.8, 2.6, 13.5, 10.3." | `target.snr` |
| Índice de color > 10.9 (WISE 0855) | "Casi no brilla en los colores cortos y sí en los largos. Las cosas frías son así: no se ven, pero dan calor." | "Más de 10 veces más luz a 4.5 µm que a 1.3 µm. Una estrella como el Sol da 0.17. Es un índice de color, no una temperatura." | "F(4.4–5.0) / F(1.1–1.6) > 10.88 (límite inferior; banda corta 0.007 ± 0.007 mJy). Referencias de cuerpo negro: 6000 K 0.17, 1000 K 49, 600 K 7513. No es una temperatura." | 10.9 / 0.17 = 64 |
| Metano 1.03 ± 0.07 | "Hay un color donde la luz desaparece. Lo traga el gas metano de su aire." | "A 3.3 µm el metano absorbe toda la luz: el flujo es compatible con cero." | "Profundidad 1 − F(3.15–3.45) / F(3.9–4.1) = 1.03 ± 0.07; > 1 no es físico; reportar como absorción total." | — |
| Huella de 102 colores | "Cada estrella tiene un código de colores, como una huella digital. Apagada arriba, encendida abajo = fría." | "6 filas (detectores) × 17 columnas (colores). Más claro = más luz. Rayado = sin medida limpia." | "Media ponderada por 1/σ² del flujo forzado en cada canal; filas D1–D6 de 0.75 a 5.0 µm; escala por el máximo." | `card.ts → fingerprint` |
| Espectro | "La misma huella, pero como una montaña: donde sube hay luz; donde baja, un gas se la comió." | "Flujo contra longitud de onda, con bandas de agua, metano, CO₂ y CO sombreadas. Barras = 1σ." | "Fotometría forzada PSF gaussiana por imagen, sin corrección de apertura: forma relativa confiable, nivel absoluto ±10–20 %." | — |
| Curva de luz (R Dra) | "El brillo de la estrella en tres momentos: alto, normal, bajo. Respira despacio." | "Cada punto es una foto dividida entre la mediana a ese color. Medianas por temporada: 1.47, 1.00, 0.79. Periodo 246 días: tres muestras no alcanzan para verlo entero." | "Fotometría en el anillo de alas de la PSF (534 de 534 saturadas); dispersión por imagen 30–45 %; medianas por temporada con error ~0.02–0.04." | medianas calculadas en el cliente |
| Candidatos | "Puntos que la computadora marcó para que una persona los revise." | "Residuos de la resta por encima de 5σ, con una etiqueta y la razón escrita: se mueve, cambia, fijo, defecto. Son candidatos, no hallazgos." | "Regla transparente; ML v2.1 como segunda opinión con su probabilidad; prueba final 8/9, 0 falsas alarmas." | `candidates` |
| Banderas de calidad | "Partes de la foto que no sirven: pixeles rotos o demasiado brillantes. Se pintan de rojo y no se usan." | "Rojo: excluidos (saturación, transitorios, calientes). Azul rayado: reflejo fantasma." | "Bits FLAGS: TRANSIENT, OVERFLOW, SUR_ERROR, …; GHOST se conserva como capa." | `flag_bits`, `frames[].flag_pixels` |
| Dial | "Dos flechas: la ámbar es lo que medimos; la azul, lo que ya se sabía. Si apuntan igual, medimos bien." | "Dirección y tamaño del movimiento. Norte arriba, este a la izquierda (como se ve el cielo). La cuña ámbar es la duda." | "Vector μ con cuña ±1σ en módulo y PA; flecha del catálogo discontinua." | — |
| Leyenda de la resta (σ) | "Azul = había algo antes y ya no. Ámbar = ahora hay algo que antes no. Oscuro = igual." | "El color crece con el cambio dividido entre el ruido. ±1σ queda oscuro; de ±8σ en adelante satura." | "Divergente asinh, rango común a los 6 paneles (percentil 99.5, mínimo 8σ)." | `stage.ts → diffRange` |

**Cómo se dibuja cada barra de error para que se entienda sin estadística.**
- Nunca solo "±". Siempre un **rango con dos extremos escritos**: una línea horizontal de 9.8 a 10.7, un punto sólido ámbar en 10.23 y, si hay catálogo, una marca azul hueca en 10.39. El texto debajo: "La verdad está entre 9.8 y 10.7". Si la marca azul cae dentro: "cae adentro". Si cae justo afuera por menos de 2σ: "queda un pelo afuera: compatible". Si queda a más de 2σ: "no coincide: hay que revisar" (hoy ningún objetivo).
- En el dial, la cuña ámbar ya existe; se le añade la palabra "duda" en la capa "mira" y "±1σ" en "mide".
- En el espectro y la curva de luz, las barras verticales se quedan y la frase de ayuda dice: "cada barrita es la duda de esa medida".
- Regla: un número con error nunca se muestra con más decimales que su error. 10.23 ± 0.43 se escribe "10.2 ± 0.4" en "mira" y "explora", y completo en "mide".

---

## 5. Divulgación progresiva: tres capas sobre la misma pantalla

Una sola plantilla de pantalla. Un atributo `data-layer` en la raíz (`mira`, `explora`, `mide`) y CSS que muestra u oculta. Nada se duplica: los mismos componentes, con tres niveles de texto (`data-level`) donde hace falta. Estado en la URL: `layer=mira|explora|mide`.

| | Mira (niño de 8) | Explora (aficionado) | Mide (científico, todo lo actual) |
|---|---|---|---|
| Escenario | Un panel grande (el que la historia elige) | Seis paneles, clic para ampliar | Seis paneles + banderas + catálogos |
| Narrador | Siempre visible, es la pantalla | Visible, plegable | Plegado por defecto, una línea |
| Anotaciones sobre imagen | Sí, con palabras ("estaba aquí") | Sí, cortas | Solo marcas, sin palabras |
| Transporte | Play, pausa | + velocidad, Antes/Ahora, modos con efecto escrito | + detector, campo de visión, casillas |
| Modos | Solo los que la historia usa | Cinco, nombrados por efecto: "Parpadear", "Ver cada foto", "Sumar las dos fechas", "Restar: qué cambió", "Restar lo típico" | Igual + nombre técnico entre paréntesis: "(B−A)", "(−mediana)" |
| Números | Redondeados, con frase, uno por paso | Con frase corta y rango | Completos, con ±, unidades y tabla por detector |
| Tarjeta | Solo veredicto en lenguaje llano y la gráfica del paso | Veredicto, dial con leyenda, huella con frase, cociente con frase | Todo lo actual, incluida la tabla de S/N y "por detector" |
| Cajón de pestañas | Oculto | Solo "Candidatos" (traducido) y "Cómo se hizo" | Las cuatro |
| Leyendas | Palabras ("antes / ahora") | Palabras + números | Números + unidades + "asinh" |
| Estimación de modo en vivo | Oculta | Oculta salvo en campo nuevo | Visible |

**Cómo se pasa de una a otra.** Un conmutador de tres posiciones en la barra superior, junto al idioma: "Mira · Explora · Mide". Además, dos atajos naturales: el paso 7 del narrador pasa a "explora"; cualquier clic en "ver más" o "por detector" pasa a "mide" solo ese bloque (no toda la pantalla). La URL compartida conserva la capa.

**Capa por defecto.** Portada → al elegir un objetivo: "mira". URL que llega con `det`, `a`, `b`, `flags` o `cats` distintos del defecto: "mide" (quien la compartió ya estaba midiendo). `embed=1`: "explora".

**Cómo no estorbar al experto.** El experto llega con una URL de "mide" o cambia una vez el conmutador; la elección se guarda en `localStorage` y en la URL. En "mide" el narrador es una sola línea plegada ("Historia: Barnard, paso 3 de 7 · abrir"), nunca una animación. Ningún texto de "mira" aparece en "mide". Los atajos de teclado actuales no cambian.

---

## 6. Mapa de pantallas y estados

### 6.1 Pantallas

| Pantalla | URL | Qué contiene | Acción principal (único botón ámbar) |
|---|---|---|---|
| **Portada** | `/` sin parámetros | Logo parpadeando una vez, frase, cinco tarjetas de historia, campo "o escribe una dirección del cielo", conmutador de capa, idioma | "Mira la estrella que más se mueve" (Barnard) |
| **Elección de objetivo** | misma portada, es la fila de cinco tarjetas | Cada tarjeta: nombre, historia en una línea, miniatura (`index.json → thumb`), duración ("1 minuto") | La tarjeta tocada |
| **Recorrido** | `?field=X&story=1&step=N&layer=mira` | Escenario de un panel, franja del narrador, barra de 7 puntos, Siguiente, Salir | Siguiente |
| **Vista libre (flipbook)** | `?field=X&layer=explora` (lo actual sin narrador) | Seis paneles, transporte por efecto, tarjeta, cajón según capa | Play |
| **Tarjeta de resultado** | misma vista, lado derecho (móvil: debajo) | Veredicto llano, rango con error, dial con leyenda, huella, espectro, frío, curva, S/N | "Compartir este resultado" |
| **Candidatos** | `?field=X&tab=cands` | Lista traducida: etiqueta en palabras, razón, detectores; clic marca en el cielo | Una fila |
| **Compartir** | diálogo | Enlace, Insertar, QR; texto "Este enlace abre exactamente esta vista, en este paso, en este idioma" | Copiar |
| **Campo nuevo** | `?ra=&dec=` | Igual a recorrido con narrador genérico (3.5) | Siguiente |

### 6.2 Estados

| Estado | Texto ES (EN en sección 9) | Qué puede hacer | Qué se enseña mientras |
|---|---|---|---|
| Cargando campo precalculado (< 2 s normalmente) | "Abriendo el cielo de Barnard…" | Nada; dura poco | El logo parpadea; nada más |
| Cargando "Cada imagen" (frames.bin, pesado) | "Bajando las 355 fotos originales. Unos segundos." | Esperar o volver a Parpadeo | La barra de progreso es la línea de tiempo llenándose de izquierda a derecha |
| Campo nuevo en vivo | "SPHEREx tiene {n} fotos de este lugar. Las estamos bajando del archivo de la NASA: cerca de {s} segundos. La primera vez tarda; la segunda es instantánea." Progreso con el mensaje del trabajo | Cancelar y volver a los cinco objetivos | Tres tarjetas que rotan cada 8 s: "Cada foto es de un color distinto", "Un cuadrito mide 6 segundos de arco", "Azul = antes, ámbar = ahora". Estimación honesta: `nimg × 0.37 s` (medido; `main.ts → updateFovEstimate`); se dice "cerca de", no "exacto" |
| Vacío (sin campo elegido) | No existe: siempre se abre la portada | — | — |
| Error de carga de un campo | "No pudimos abrir este cielo. Vuelve a intentar o abre otro. Detalle técnico: {e}" (detalle plegado) | Reintentar, portada | — |
| Sin API (offline o no desplegada) | "Esta dirección no está precalculada y ahora no hay conexión con el servidor de Sparks. Los cinco cielos de abajo funcionan sin internet." | Cinco tarjetas | — |
| IRSA lenta | "El archivo de la NASA responde despacio. Puedes esperar o abrir uno de los cinco cielos." | Esperar, cinco tarjetas | Igual que en vivo |
| Sin imágenes en esa posición | "SPHEREx todavía no ha fotografiado este lugar. Cubre todo el cielo cada seis meses: vuelve a intentar más adelante." | Portada, cinco tarjetas | — |
| Una sola temporada | "Solo hay fotos de una fecha. Todavía no se puede comparar." | Ver las fotos, portada | — |
| Objetivo saturado | "Esta estrella brilla tanto que desborda el detector. Por eso no hay espectro." | Seguir | — |
| Aladin no carga | "El atlas del cielo no cargó (necesita internet). Las estrellas de catálogo siguen dibujadas sobre las fotos." | Seguir | — |
| Reducir movimiento activo | Sin texto; el parpadeo no arranca solo y las comparaciones van lado a lado | Play manual | — |

---

## 7. Wireframes en ASCII

Jerarquía: MAYÚSCULAS = lo más grande. `[ ]` botón. `( )` ámbar sólido. `{ }` azul hueco. `~` texto del narrador. `*` anotación sobre la imagen.

### 7.1 Portada · móvil 390 px

```
+--------------------------------------+
| [ ]( ) sparks        EN|ES  Mira v   |
|                                      |
|          {  }   (  )                 |   <- las dos placas parpadean 1 vez
|                                      |
|  DOS FOTOS DEL MISMO CIELO,          |   <- Archivo, 31 px
|  CON UN AÑO DE DIFERENCIA.           |
|  Mira qué saltó.                     |   <- Plex 20 px
|                                      |
|  ( Mira la estrella que más se mueve)|   <- único botón ámbar
|                                      |
|  Otras historias                     |
|  +----------+ +----------+           |
|  | [mini]   | | [mini]   |  ...      |   <- fila deslizable
|  | WISE 0855| | ε Indi B |           |
|  | fría y   | | dos      |           |
|  | invisible| | mundos   |           |
|  | 1 min    | | 1 min    |           |
|  +----------+ +----------+           |
|                                      |
|  o escribe una dirección del cielo   |
|  [ RA Dec, p. ej. 17h57m +04°41′  ]  |
|  [ Ver ese cielo ]                   |
|                                      |
|  Datos: NASA SPHEREx · Gaia · WISE   |
+--------------------------------------+
```

### 7.2 Portada · escritorio 1440 px

```
+------------------------------------------------------------------------------+
| [ ]( ) sparks     [ dirección del cielo ................ ] [Ver]  Mira·Explora·Mide  EN|ES |
|                                                                              |
|      {   }      (   )                                                        |
|                                                                              |
|      DOS FOTOS DEL MISMO CIELO, CON UN AÑO DE DIFERENCIA.                    |
|      Mira qué saltó.                                                         |
|                                                                              |
|      ( Mira la estrella que más se mueve )                                   |
|                                                                              |
|  +-----------+ +-----------+ +-----------+ +-----------+ +-----------+       |
|  | Barnard   | | WISE 0855 | | ε Indi B  | | R Dra     | | RW Aur    |       |
|  | se mueve  | | fría y    | | dos mundos| | cambia de | | cambia    |       |
|  | rápido    | | invisible | | en órbita | | brillo    | | poco      |       |
|  | 1 min     | | 1 min     | | 1 min     | | 1 min     | | 40 s      |       |
|  +-----------+ +-----------+ +-----------+ +-----------+ +-----------+       |
|  Más estrellas medidas (8)  ·  Candidatos  ·  Cómo se hizo                   |
+------------------------------------------------------------------------------+
```

### 7.3 Recorrido · móvil 390 px (paso 3, Barnard)

```
+--------------------------------------+
| <  Barnard · 3 de 7        [Salir]   |   <- barra: {o}{o}(o) o o o o
|+------------------------------------+|
||                                    ||
||          * estaba aquí             ||   <- etiqueta azul, línea fina
||             {o}                    ||
||              |  <- flecha ámbar    ||
||             (o)                    ||
||          * está aquí               ||   <- etiqueta ámbar
||                                    ||
||  1′ ——  Resta: ahora − antes       ||   <- pie del panel, llano
|+------------------------------------+|
| D6 · 4.7 µm · luz infrarroja larga   |   <- solo en explora/mide
|                                      |
| ~ Lo azul es donde estaba.           |   <- Plex 20 px, franja fija
| ~ Lo ámbar es donde está. Se movió.  |
|                                      |
|            ( Siguiente > )           |   <- 44 px alto, ámbar
|  [ < Atrás ]        [ Explorar yo ]  |
+--------------------------------------+
```

### 7.4 Recorrido · escritorio 1440 px (paso 5, Barnard)

```
+------------------------------------------------------------------------------+
| [ ]( ) sparks  [ dirección ........ ][Ver]   Compartir  QR   Mira·Explora·Mide  EN|ES |
+-------------------------------------------------+----------------------------+
| Barnard · 5 de 7   {o}{o}{o}{o}(o) o o  [Salir]  |                            |
|                                                 |  ¿ES REAL?                 |
|   +---------------------------------------+     |                            |
|   |                                       |     |  Sparks midió              |
|   |          * estaba aquí {o}            |     |  10.2 ± 0.4 ″/año          |
|   |                         |             |     |  ( flecha ámbar sólida )   |
|   |                        (o) * está aquí|     |  El catálogo Gaia decía    |
|   |                                       |     |  10.4 ″/año                |
|   |                                       |     |  { flecha azul hueca }     |
|   |  1′ ——       Resta: ahora − antes     |     |                            |
|   +---------------------------------------+     |  9.8 |====(o)=={o}==| 10.7 |
|   D6 · 4.7 µm                                   |  La verdad está entre      |
|                                                 |  9.8 y 10.7. Gaia cae      |
|  ~ Gaia es el mejor catálogo de estrellas que   |  adentro: coincide.        |
|  ~ existe. Ya sabía cuánto se mueve Barnard.    |                            |
|  ~ Nuestra medida coincide.                     |  [ ver por detector ]      |
|                                                 |                            |
|  [ < Atrás ]   ( Siguiente > )   [ Explorar ]   |                            |
+-------------------------------------------------+----------------------------+
```

### 7.5 Vista libre · escritorio, capa "explora"

```
+------------------------------------------------------------------------------+
| barra superior igual                                                         |
| Barnard · WISE 0855 · ε Indi B · R Dra · RW Aur  |  Más estrellas (8)        |
+-------------------------------------------------+----------------------------+
|  +------+ +------+ +------+     luz corta  →    | BARNARD'S STAR             |
|  | D1   | | D2   | | D3   |                     | Se mueve 10.2 ± 0.4″ al año|
|  +------+ +------+ +------+                     | (menos de dos cuadritos).  |
|  +------+ +------+ +------+                     | Gaia decía 10.4: coincide. |
|  | D4   | | D5   | | D6   |     → luz larga     |                            |
|  +------+ +------+ +------+                     | [dial con leyenda escrita] |
|  Seis colores del mismo cielo. Toca uno.        | 9.8 |===(o)={o}=| 10.7      |
|                                                 |                            |
|  [<] (>) [>]  velocidad ●—— 3 fotos/s           | Huella: saturada, sin      |
|  Vista: [Parpadear] [Cada foto] [Sumar fechas]  | espectro. Brilla tanto que |
|         [Restar: qué cambió] [Restar lo típico] | desborda el detector.      |
|  {Antes: ago 2025 (119 fotos)} (Ahora: ago 2026)|                            |
|  ——|———————|————————|——  línea de tiempo       | [ Compartir este resultado]|
|  azul = había algo antes · ámbar = hay ahora    |                            |
+-------------------------------------------------+----------------------------+
|  Candidatos (3 para revisar)  ·  Cómo se hizo                [Mide: + 2 pestañas] |
+------------------------------------------------------------------------------+
```

### 7.6 Vista libre · móvil 390 px, capa "explora"

```
+--------------------------------------+
| [ ]( ) sparks   Compartir QR  EN|ES  |
| [ dirección del cielo      ][Ver]    |
| Barnard · WISE 0855 · ε Indi B · ... |
|+----+ +----+ +----+                  |
|| D1 | | D2 | | D3 |  Seis colores    |
|+----+ +----+ +----+  del mismo cielo.|
|+----+ +----+ +----+  Toca uno.       |
|| D4 | | D5 | | D6 |                  |
|+----+ +----+ +----+                  |
| [<]  (>)  [>]      velocidad ●— 3    |
| [Parpadear][Cada foto][Sumar][Restar]|
| {Antes ago 2025} (Ahora ago 2026)    |
| azul = antes · ámbar = ahora         |
|--------------------------------------|
| BARNARD'S STAR                       |
| Se mueve 10.2 ± 0.4″ al año (menos   |
| de dos cuadritos). Gaia decía 10.4.  |
| 9.8 |====(o)=={o}==| 10.7            |
| [dial]  Sparks midió / Gaia decía    |
| ...                                  |
| [ Candidatos (3) ] [ Cómo se hizo ]  |
+--------------------------------------+
```

### 7.7 Tarjeta de resultado (bloque, cualquier ancho)

```
+----------------------------------------------+
| NOMBRE                                       |  Archivo 31
| Una línea llana (qué es, a qué distancia)    |  Plex 13, gris
|----------------------------------------------|
| VEREDICTO EN UNA FRASE                        |  Plex 16
|  9.8 |=======(o)===={o}====| 10.7            |  rango con error
|  "La verdad está entre 9.8 y 10.7. Gaia cae  |
|   adentro: coincide."                        |
|----------------------------------------------|
| [dial]  (ámbar) Sparks midió 10.2 ± 0.4      |
|         {azul}  Gaia decía 10.4              |
|         > por detector (mide)                |
|----------------------------------------------|
| HUELLA DE 102 COLORES                         |
| [rejilla 6×17]  "apagada arriba, encendida   |
|                  abajo = fría"               |
|----------------------------------------------|
| ¿ES FRÍA?  (solo si hay cociente)            |
|  Más de 10 veces más luz larga que corta.    |
|  Una estrella como el Sol: 0.17.             |
|  Metano a 3.3 µm: absorción total.           |
|  "Es un índice de color, no una temperatura."|
|----------------------------------------------|
| BRILLO EN EL TIEMPO (solo variables)         |
|  [curva]  medianas 1.47 · 1.00 · 0.79        |
|----------------------------------------------|
| > Señal/ruido (mide)                         |
| ( Compartir este resultado )                 |
+----------------------------------------------+
```

### 7.8 Candidatos · escritorio

```
+------------------------------------------------------------------------------+
| CANDIDATOS PARA REVISAR · 3 de 122 residuos                                  |
| Puntos que la regla marcó. Son candidatos, no hallazgos. Toca uno: se marca  |
| en el cielo.                                                                 |
|------------------------------------------------------------------------------|
| (se mueve)  Barnard's Star · estrella conocida, 10.39″/año (Gaia)            |
|   por qué: lóbulos antes/después a los lados de un núcleo saturado · D1–D6   |
|   segunda opinión (ML, experimental): se mueve, 0.89                          |
|------------------------------------------------------------------------------|
| (cambia)    cerca de J175736.94+044314.6 · D1, D2, D3                          |
|   por qué: mismo signo en el mismo lugar en 3 detectores                      |
|------------------------------------------------------------------------------|
| [Mide]: + fijos (76) y defectos (43) en tabla completa                        |
+------------------------------------------------------------------------------+
```

### 7.9 Compartir (diálogo)

```
+--------------------------------------+
| COMPARTIR ESTA VISTA                 |
| Este enlace abre exactamente lo que  |
| ves: Barnard, paso 5, en español.    |
| [ https://…/?field=barnard&… ]       |
| ( Copiar enlace )  [ Insertar ]  [QR]|
| [ Cerrar ]                           |
+--------------------------------------+
```

---

## 8. El momento "se movió"

Secuencia exacta del paso 3 de Barnard. Tiempos acumulados desde que el usuario toca "Siguiente". Con "reducir movimiento" todo aparece a la vez en t = 0 y la flecha no se dibuja: está completa.

| t | Qué aparece | Texto | Duración |
|---|---|---|---|
| 0 ms | El panel pasa de Parpadeo a Resta. Fondo oscuro, el dipolo azul/ámbar queda visible | Pie del panel: "Resta: ahora − antes" | corte, sin fundido |
| 0 ms | Narrador, primera frase | "Lo azul es donde estaba." | — |
| 300 ms | Círculo hueco azul (r = 3.2 px de imagen, trazo 0.45) centrado en el centroide medido de la temporada Antes. Etiqueta "estaba aquí" con línea fina hacia arriba-izquierda | | aparece en 120 ms |
| 1 000 ms | Narrador, segunda frase | "Lo ámbar es donde está." | — |
| 1 300 ms | Punto sólido ámbar (r = 1.2) en el centroide medido de Ahora, con destello de marca (160 in + 360 out). Etiqueta "está aquí" | | 520 ms |
| 2 000 ms | Flecha ámbar de centro azul a centro ámbar, se dibuja con `stroke-dashoffset` | | 400 ms |
| 2 400 ms | Narrador, tercera frase, en Archivo 25 px | "Se movió." | — |
| 2 400 ms | Botón Siguiente pasa de gris a ámbar | | 120 ms |

**Cómo se hace sentir que 1.7 píxeles importan (paso 4).**
1. La regla: un rectángulo de exactamente 1 píxel de imagen de ancho se dibuja junto a la flecha, con la etiqueta "1 cuadrito = 6 segundos de arco". La flecha mide 1.6 cuadritos: el ojo lo compara.
2. El zoom honesto: el panel está a `image-rendering: pixelated`; a 390 px un cuadrito de la imagen mide ~5.5 px de pantalla, en escritorio ~11 px. Se dice: "Cada cuadrito que ves es un pixel real del detector. No hay zoom escondido."
3. La escala humana: "una moneda a 840 metros" para el píxel, "180 años para cruzar la Luna" para la velocidad. Ambas verificadas (sección 4).
4. La comparación con el resto: en el paso 6 de Barnard se muestra la fila de la galería con "las demás estrellas se mueven menos de un cuadrito al año; esta, casi dos".
5. Lo que no se hace: no se exagera la flecha, no se anima la estrella "volando" entre los dos puntos, no se agranda el dipolo. La resta es el dato.

**"Esto es frío" (WISE 0855, pasos 1 y 6).**

| t | Qué aparece | Texto |
|---|---|---|
| 0 ms | Panel D1 (0.9 µm), suma de las tres temporadas, retícula ámbar en la posición | Narrador: "Luz casi visible. Aquí no hay nada." Pie: "D1 · 0.9 µm · S/N 1.7: no se distingue del fondo" |
| 2 000 ms (o al tocar Siguiente) | El panel cambia a D6 (4.7 µm). La retícula destella. El punto está | Narrador: "Luz infrarroja larga, la del calor. Ahí está." Pie: "D6 · 4.7 µm · S/N 10" |
| paso 6, 0 ms | La huella 6×17 aparece fila por fila, de D1 a D6, 150 ms por fila; las filas D1 a D4 casi negras, D5 y D6 encendidas | Narrador: "102 colores, y solo se enciende en los últimos. Esa forma dice: es fría." |
| paso 6, 1 200 ms | Junto a la huella, la de una estrella normal del mismo pipeline (**NUEVO**: requiere guardar en `index.json` o en un JSON chico la huella de referencia de, por ejemplo, `t605760` o Van Maanen; hoy no está) | "Una estrella normal se enciende al revés: fuerte arriba, débil abajo." Si no se construye, se omite y se usa solo el cociente numérico: "más de 10 veces más luz larga que corta; una estrella como el Sol, 0.17" (dato `blackbody_ratio_4p7_1p35["6000"]`) |
| paso 6, 2 000 ms | El espectro, con la banda CH₄ a 3.3 µm sombreada y la etiqueta "aquí el metano se traga la luz" | "El metano de su aire se come un color entero." |
| siempre | Línea fija bajo el bloque | "Esto es un índice de color, no una temperatura. La temperatura la midió otro telescopio (Webb): entre 250 y 300 kelvin, más fría que este cuarto." (**La cifra 250–300 K no está en el manifiesto; viene de `AUDITORIA.md` G1 y debe estar en `fuentes.md` antes de mostrarse. Si Horacio no la aprueba, la frase termina en "no es una temperatura".**) |

**"Este brillo cambia" (R Dra, pasos 3 y 4).**

| t | Qué aparece | Texto |
|---|---|---|
| 0 ms | Panel D6 en "Restar lo típico" (−mediana), temporada may 2025: el centro ámbar | Narrador: "Mayo de 2025: más brillante de lo normal. Ámbar." |
| 1 500 ms | Pasa a abr 2026: el centro azul, en el mismo lugar. Una marca fija blanca punteada señala que la posición no cambió | "Abril de 2026: menos brillante. Azul. Mismo lugar: no se movió, cambió." |
| paso 4, 0 ms | La curva de luz; sobre cada temporada aparece su mediana como una línea horizontal corta con el número: 1.47, 1.00, 0.79 | "Casi una vez y media lo normal; luego normal; luego cuatro quintos." |
| paso 4, 1 000 ms | Una línea punteada muy tenue insinúa que entre temporadas pudo subir y bajar, con la etiqueta "no lo vimos" sobre los huecos | "Es una estrella que respira cada 246 días. La vimos solo tres veces. Entre una y otra, no sabemos." |
| siempre | Nota fija | "La estrella satura el detector; el brillo se mide en el anillo de luz que la rodea. Cada foto varía hasta 40 %; por eso usamos la mediana de cada temporada." |

Verbo permitido: "cambia". Prohibidos: "se apaga", "baja", "se está muriendo".

---

## 9. Microcopy

Nivel: niño de 12 lo entiende; un físico no encuentra nada falso. ES primero, EN debajo. Los números son los de los manifiestos; donde hay redondeo se indica.

1. **Portada, titular**
   ES: "Dos fotos del mismo cielo, con un año de diferencia. Mira qué saltó."
   EN: "Two photos of the same sky, one year apart. See what jumped."

2. **Portada, subtítulo**
   ES: "Sparks compara las fotos del telescopio SPHEREx de la NASA y te dice qué se movió, qué tan rápido y de qué color es."
   EN: "Sparks compares photos from NASA's SPHEREx telescope and tells you what moved, how fast, and what colour it is."

3. **Botón principal de portada**
   ES: "Mira la estrella que más se mueve"
   EN: "See the fastest-moving star"

4. **Tarjetas de historia (línea de cada una)**
   ES: Barnard "se mueve rápido" · WISE 0855 "fría y casi invisible" · ε Indi B "dos mundos en órbita" · R Draconis "cambia de brillo" · RW Aurigae "cambia poco: sugerente, no concluyente"
   EN: "moves fast" · "cold and almost invisible" · "two worlds in orbit" · "changes in brightness" · "changes a little: suggestive, not conclusive"

5. **Leyenda azul/ámbar (siempre que aparezcan los dos colores)**
   ES: "Azul: antes. Ámbar: ahora."
   EN: "Blue: before. Amber: now."
   Versión larga (resta): ES "Azul: había algo antes y ya no. Ámbar: hay algo ahora que antes no. Oscuro: igual." EN "Blue: something was there before and is gone. Amber: something is there now that was not. Dark: no change."

6. **Selectores de fecha**
   ES: "Antes: ago 2025 (119 fotos)" / "Ahora: ago 2026 (118 fotos)"
   EN: "Before: Aug 2025 (119 photos)" / "Now: Aug 2026 (118 photos)"

7. **Modos, nombrados por efecto (capa explora; en mide se añade el nombre técnico)**
   ES: "Parpadear" · "Ver cada foto" · "Sumar las dos fechas" · "Restar: qué cambió" · "Restar lo típico"
   EN: "Blink" · "Every photo" · "Add both dates" · "Subtract: what changed" · "Subtract the usual"
   Pista al pasar el cursor o al enfocar (una por modo), ES: "Alterna antes y ahora, como Tombaugh en 1930" · "Las 355 fotos originales, una por una, con su fecha" · "Suma las dos fechas: más señal, menos ruido" · "Ahora menos antes: lo que se movió deja una mancha azul y una ámbar" · "Cada fecha menos la mediana: lo que cambió de brillo se marca".

8. **Pie de cada panel (capa explora)**
   ES: "D6 · 4.7 µm · luz infrarroja larga" (D1: "luz casi visible"; D2–D3: "infrarrojo cercano"; D4–D5: "infrarrojo medio")
   EN: "D6 · 4.7 µm · long infrared light"

9. **Narrador de Barnard completo (ES)**
   1. "Este es un pedazo de cielo cerca de un cuarto de Luna de ancho. Cada punto es una estrella."
   2. "Ahora la misma foto, un año después. Fíjate en la estrella del centro."
   3. "Lo azul es donde estaba. Lo ámbar es donde está. Se movió."
   4. "Avanza 10 segundos de arco cada año. Menos de dos cuadritos de esta foto. Para cruzar la Luna tardaría unos 180 años."
   5. "Gaia es el mejor catálogo de estrellas que existe. Ya sabía cuánto se mueve Barnard. Nuestra medida coincide: el instrumento mide bien."
   6. "Barnard brilla tanto que desborda el detector. Por eso aquí no hay espectro. Lo que sí hay: otras 10 estrellas medidas igual, todas dentro del error."
   7. "Ahora te toca. Cambia de color, de fecha o de vista. Todo lo que ves se comparte con el enlace."

   **(EN)**
   1. "This is a patch of sky about a quarter of the Moon wide. Every dot is a star."
   2. "Now the same photo, one year later. Watch the star in the middle."
   3. "Blue is where it was. Amber is where it is. It moved."
   4. "It moves 10 arcseconds a year. Under two pixels of this photo. It would take about 180 years to cross the Moon."
   5. "Gaia is the best star catalog there is. It already knew how fast Barnard moves. Our measurement agrees: the instrument works."
   6. "Barnard is so bright it overflows the detector. That is why there is no spectrum here. What there is: 10 more stars measured the same way, all within their error."
   7. "Your turn. Change the colour, the date or the view. Everything you see is shared with the link."

10. **Rango con error (tarjeta)**
    ES: "La verdad está entre 9.8 y 10.7. Gaia dice 10.4: cae adentro."
    EN: "The truth is between 9.8 and 10.7. Gaia says 10.4: it falls inside."
    Variante compatible (ε Indi B): ES "La verdad está entre 4.4 y 4.7. Gaia dice 4.7: queda un pelo afuera. Compatible." EN "The truth is between 4.4 and 4.7. Gaia says 4.7: just outside. Compatible."

11. **Veredicto de WISE 0855 (tarjeta)**
    ES: "Se mueve 7.9 ± 1.4″ al año; el catálogo infrarrojo CatWISE dice 8.1. Compatible. La medimos donde sabíamos buscar: el detector automático aún no la encuentra solo."
    EN: "Moves 7.9 ± 1.4″ a year; the CatWISE infrared catalog says 8.1. Compatible. We measured it where we knew to look: the automatic detector does not yet find it on its own."

12. **Bloque de frío (reemplaza la fila de kelvin)**
    ES: "¿Es fría? Más de 10 veces más luz a 4.5 µm que a 1.3 µm. Una estrella como el Sol da 0.17. A 3.3 µm el metano se come toda la luz. Es un índice de color, no una temperatura."
    EN: "Is it cold? More than 10 times more light at 4.5 µm than at 1.3 µm. A Sun-like star gives 0.17. At 3.3 µm methane swallows all the light. This is a colour index, not a temperature."

13. **Veredicto de R Dra**
    ES: "No se mueve. Cambia de brillo entre temporadas: 1.47, 1.00, 0.79 veces lo normal. Una estrella que respira cada 246 días, vista tres veces."
    EN: "Does not move. Its brightness changes between seasons: 1.47, 1.00, 0.79 times normal. A star that breathes every 246 days, seen three times."

14. **Veredicto de RW Aur**
    ES: "No se mueve. Su brillo bajó un 10 % en la última temporada. Sugerente, no concluyente."
    EN: "Does not move. Its brightness dropped 10 % in the last season. Suggestive, not conclusive."

15. **Saturada**
    ES: "Brilla tanto que desborda el detector. No hay espectro limpio."
    EN: "So bright it overflows the detector. No clean spectrum."

16. **Candidatos, encabezado**
    ES: "Candidatos para revisar. Puntos que la regla marcó en la resta. No son hallazgos: alguien tiene que mirarlos."
    EN: "Candidates to review. Points the rule flagged in the difference. Not findings: someone has to look."
    Etiquetas ES: "se mueve" · "cambia" · "fijo" · "defecto". EN: "moves" · "changes" · "still" · "artifact". Columna ML: "segunda opinión (experimental)".

17. **Cargando campo nuevo**
    ES: "SPHEREx tiene {n} fotos de este lugar. Las bajamos del archivo de la NASA: cerca de {s} segundos. La primera vez tarda; la segunda es instantánea."
    EN: "SPHEREx has {n} photos of this spot. Fetching them from NASA's archive: about {s} seconds. The first time is slow; the second is instant."

18. **Sin conexión con la API**
    ES: "Esta dirección no está precalculada y ahora no hay conexión con el servidor de Sparks. Los cinco cielos de abajo funcionan sin internet."
    EN: "This position is not precomputed and the Sparks server is not reachable now. The five skies below work offline."

19. **Sin imágenes**
    ES: "SPHEREx todavía no ha fotografiado este lugar. Cubre todo el cielo cada seis meses: vuelve a intentar más adelante."
    EN: "SPHEREx has not photographed this spot yet. It covers the whole sky every six months: try again later."

20. **Compartir**
    ES: "Este enlace abre exactamente lo que ves: {objetivo}, {vista o paso}, en {idioma}."
    EN: "This link opens exactly what you see: {target}, {view or step}, in {language}."

21. **Pie de página**
    ES: "Datos: NASA/IPAC SPHEREx, ESA Gaia DR3, CatWISE2020. Hecho con Astropy y Aladin Lite. Candidatos, no descubrimientos."
    EN: "Data: NASA/IPAC SPHEREx, ESA Gaia DR3, CatWISE2020. Built with Astropy and Aladin Lite. Candidates, not discoveries."

---

## 10. Componentes y movimiento

### 10.1 Inventario (sin código)

| Componente | Qué hace | Estado |
|---|---|---|
| Portada | Logo, titular, botón, tarjetas de historia, campo de dirección | NUEVO |
| Logo parpadeante | Las dos placas alternan 4 veces a 3 Hz al cargar la portada y se detienen en ámbar | NUEVO (CSS sobre el SVG existente) |
| Tarjeta de historia | Miniatura (`index.json → thumb`), nombre, línea, duración | NUEVO |
| Conmutador de capa | Tres posiciones; escribe `layer=` en la URL | NUEVO |
| Franja del narrador | Texto de 1 a 3 frases, botones Atrás / Siguiente / Explorar, barra de 7 puntos | NUEVO |
| Anotación sobre imagen | Etiqueta corta + línea fina a un punto de la imagen, en el SVG de overlay | NUEVO (se dibuja en `stage.ts → drawOverlay`) |
| Marcas antes/ahora | Círculo hueco azul, punto sólido ámbar, flecha | Existen `mark-then`/`mark-now`; falta flecha, hueco/sólido y posiciones medidas |
| Regla de un píxel | Rectángulo de 1 px de imagen con etiqueta | NUEVO |
| Rango con error | Línea con dos extremos escritos, punto ámbar, marca azul | NUEVO (SVG pequeño) |
| Dial con leyenda | El actual + dos líneas de texto junto a las flechas | Existe; se añade texto |
| Escenario | Seis paneles o uno | Existe; se añade pie llano |
| Transporte por efecto | Modos renombrados, Antes/Ahora, pistas | Existe; cambia texto |
| Tarjeta | Veredicto, rango, dial, huella, frío, curva, S/N | Existe; se reordena y se quita kelvin |
| Medianas en la curva | Tres líneas cortas con número | NUEVO (mediana en cliente) |
| Candidatos traducidos | Etiquetas en palabras, razón, segunda opinión | Existe; cambia texto |
| Estados | Cargando con tarjetas rotatorias, error con detalle plegado | Existe; cambia texto y añade progreso |
| Compartir / Insertar / QR | Diálogo | Existe; cambia texto |

### 10.2 Reglas de movimiento (heredan `DESIGN.md` §2)

| Qué | Duración | Cuándo | Con "reducir movimiento" |
|---|---|---|---|
| Logo parpadeante en portada | 4 alternancias a 3 Hz (1.3 s), luego fijo | Solo al abrir la portada | Fijo desde el inicio |
| Destello de la retícula | 160 ms in + 360 ms out | Al cambiar de cuadro y al aparecer una marca | Solo cambio de borde |
| Aparición de anotaciones | 120 ms (`--t-fast`) | Al entrar a un paso | Instantáneo |
| Flecha que se dibuja | 400 ms | Paso 3 | Completa de inmediato |
| Regla que se extiende | 300 ms | Paso 4 | Completa |
| Marca del catálogo que entra al rango | 400 ms | Paso 5 | Fija |
| Huella fila por fila | 150 ms por fila (900 ms) | Paso 6 de WISE 0855 | Completa |
| Cambio de paso | 200 ms (`--t-base`) para la franja; el escenario corta sin fundido | Siguiente / Atrás | 0 ms |
| Parpadeo del flipbook | 2 a 12 cuadros/s, 2 por defecto dentro del recorrido, 3 fuera | Play | No arranca solo; comparación lado a lado |
| Nada se mueve por scroll. Sin entradas con fundido. Sin parallax. | | | |

**Pausa del narrador.** El narrador no tiene reloj: nunca avanza solo. Lo único que corre solo es el parpadeo, y se pausa con espacio, con el botón de pausa, al abrir un diálogo, al cambiar de pestaña del navegador (`visibilitychange`) y al perder el foco de la ventana. Al volver, no reanuda solo: espera un toque.

**Teclado.** Flecha derecha / izquierda cambian de paso dentro del recorrido (fuera, cambian de cuadro como hoy). Escape sale del recorrido. Los atajos actuales (espacio, 1–6, B S D M F) se conservan en las capas explora y mide.

---

## 11. Mapa de lo existente a lo nuevo

| Elemento actual | Destino | Nota |
|---|---|---|
| Marca con dos cuadritos (header) | Se queda | Gana tooltip "azul: antes · ámbar: ahora" |
| Campo de coordenadas en el header | Se queda; en portada se baja debajo del botón principal con la etiqueta "o escribe una dirección del cielo" | Placeholder: "RA Dec, p. ej. 17h57m48s +04°41′ o 269.45 4.69" |
| Botón "Ver cielo" | Se queda, texto "Ver ese cielo" | |
| Compartir / Insertar / QR | Se quedan | Texto nuevo (microcopy 20) |
| EN / ES | Se queda | |
| Fila "Objetivos del reto" | Se mueve a la portada como tarjetas de historia; en la vista libre queda como fila compacta sin la palabra "reto" | |
| "Más estrellas veloces" | Se queda en la fila compacta | Línea: "se mueve 5.1″/año: menos de un cuadrito" |
| "Sobre Hermosillo ahora" | Se esconde en capa "mide" | Ruido en la demo sin API |
| Seis paneles | Se quedan | Pie llano en explora; "D# · µm" en mide |
| "λ-matched · 23+18 img" | Se esconde en "mide" | En explora: "fotos del mismo color, 23 antes + 18 ahora" |
| Barra "1′" | Se queda con frase en explora: "1′ = un minuto de arco, 10 cuadritos" | 60″ / 6.15″ = 9.76 px |
| Retícula | Se queda | Gana etiqueta en el recorrido |
| Marcas then/now en resta | Se quedan, se completan (hueco/sólido, flecha, posiciones medidas) | |
| Destello | Se queda | |
| Play / anterior / siguiente / velocidad | Se quedan | "3 fotos/s" |
| Modos | Se quedan, renombrados por efecto | Nombre técnico solo en "mide" |
| A / B | Se quedan como Antes / Ahora | |
| Detector, campo de visión | Se esconden en "mide" (campo de visión) y "explora" (detector) | |
| Banderas, catálogos | Se esconden en "mide" | |
| Línea de tiempo | Se queda | Gana la frase "cada rayita es una foto" en explora |
| Leyenda σ | Se queda en "mide"; en explora y mira: palabras | |
| Estimación "≈ MB, ≈ s" | Se esconde en "mide" y en campo nuevo | |
| Tarjeta: título y nota | Se quedan; nota traducida a llano ("estrella enana roja a 6 años luz": 1.8 pc × 3.26 = 5.9 años luz) | |
| Veredicto | Se queda, reescrito (microcopy) | |
| "En Gaia DR3 (G = 8.2)" | Se esconde en "mide"; en explora: "está en el catálogo Gaia" | |
| Dial | Se queda con leyenda escrita | |
| "354.8° ± 2.0° · 6 pts · D5,6" | Se esconde en "mide" | |
| Por detector (plegado) | Se queda en "mide" | |
| Huella | Se queda con frase por capa | |
| Espectro | Se queda; en "mira" se esconde salvo en WISE 0855 y ε Indi B | |
| Fila "Cuerpo negro con el mismo cociente < 1258 K" | **Se elimina** (B2) | Nunca kelvin en pantalla |
| Cociente y metano | Se quedan con frase; metano > 1 se muestra como "absorción total" | |
| Curva de luz | Se queda; gana medianas | NUEVO: mediana por temporada en cliente |
| Tabla S/N | Se queda en "mide" | |
| Pestaña Contexto del cielo | Se queda en "mide" | |
| Pestaña Detalles de la imagen | Se queda en "mide" | C9 vive aquí |
| Pestaña Candidatos | Se queda en explora y mide, traducida | B1: nota cuando el candidato más cercano al objetivo no es "mover" |
| Pestaña Datos y método | Se queda, renombrada "Cómo se hizo", traducida al ES | |
| Pie de página | Se queda | Añade "Candidatos, no descubrimientos" |
| Mensajes de estado | Se quedan, reescritos | Error crudo `String(e)` pasa a detalle plegado |
| Portada | NUEVO | Requiere: una vista más en `main.ts`, sin datos nuevos |
| Narrador | NUEVO | Requiere: tabla de pasos por objetivo (JSON o TS), plantillas con datos del manifiesto, parámetros `story`/`step` en la URL |
| Capas | NUEVO | Requiere: `data-layer` en la raíz, reglas CSS, parámetro `layer` |
| Rango con error | NUEVO | Requiere: dos números del manifiesto |
| Huella de referencia junto a la de WISE 0855 | NUEVO | Requiere exportar una huella de estrella normal; si no, se omite |
| Medianas de control de R Dra | NUEVO | Requiere exportarlas desde el pkl; mientras, texto fijo aprobado solo en R Dra |
| "250–300 K" del Webb | NUEVO como texto | Requiere entrada en `fuentes.md` aprobada por Horacio |

**Dónde vive cada una de las 10 consideraciones después del cambio**

| # | Consideración | Dónde vive | Capa mínima |
|---|---|---|---|
| C1 | Actualizable con releases | "Cómo se hizo" (lista de lotes descubiertos) y pie "QR2, QR3" | explora |
| C2 | 102 bandas | Huella 6×17 y espectro en la tarjeta; paso 6 | mira |
| C3 | Suma por detector | Modo "Sumar las dos fechas"; tabla S/N | explora / mide |
| C4 | Espectro al vuelo | Espectro de la tarjeta; en campo nuevo, "el espectro justo donde escribiste" | explora |
| C5 | Sumar / restar fechas | Modos Sumar, Restar, Restar lo típico; Antes / Ahora | explora |
| C6 | Campo de visión | Selector de campo | mide |
| C7 | Gaia / WISE encimados | Casilla "Estrellas de catálogo" y pestaña Contexto (Aladin) | mide |
| C8 | Coordenadas en URL, embebible | Compartir / Insertar; `layer`, `story`, `step` se suman a la URL | todas |
| C9 | Metadatos y banderas | Pestaña Detalles de la imagen; casilla Banderas | mide |
| C10 | Astropy y Aladin | Pie y "Cómo se hizo"; Aladin en Contexto | explora / mide |

Los requisitos R1 a R5 no cambian de lugar. Offline, EN/ES, 390 px y Share/Embed/QR se conservan tal cual.

---

## 12. Tres niveles de implementación

Horas para un agente de código que ya conoce el repo; incluyen pasar `npm run build` (tsc) y los 33 checks e2e. Riesgo = probabilidad de romper algo que hoy funciona.

### Nivel A · mínimo (3 a 4 h) · riesgo bajo

Orden de construcción. Se puede parar después de cualquier punto y la app sigue desplegable.

| # | Tarea | Horas | Archivos | Riesgo |
|---|---|---|---|---|
| A1 | B2: quitar la fila de kelvin; reescribir el bloque de frío (microcopy 12); metano > 1 como "absorción total" | 0.5 | `card.ts`, `i18n.ts` | Nulo |
| A2 | B1: en la tarjeta de un objetivo "mover", si el candidato más cercano a la posición del objetivo (< 4 px) no es "mover", mostrar la nota de microcopy 11; traducir etiquetas de Candidatos | 0.5 | `card.ts`, `panes.ts`, `i18n.ts` | Bajo |
| A3 | Frase llana junto a cada número: veredictos nuevos, rango con error (SVG chico), leyenda del dial, pie de los paneles, Antes/Ahora, modos por efecto, "3 fotos/s", notas en llano | 1.0 | `card.ts`, `i18n.ts`, `index.html`, `main.ts` | Bajo. Cambia texto, no lógica. Revisar que el e2e que busca "Subtract B−A" se actualice |
| A4 | Anotaciones sobre el flipbook en la resta: círculo hueco azul y punto sólido ámbar en los centroides medidos (`target.points`, `use = true`) cuando existan, flecha entre ambos, etiquetas "estaba aquí / está aquí" | 0.75 | `stage.ts`, `app.css` | Medio. Es el overlay SVG; probar en los 13 campos y en live |
| A5 | Portada: vista sin parámetros con logo que parpadea una vez, titular, botón a Barnard, cinco tarjetas, campo de dirección | 0.75 | `index.html`, `main.ts`, `app.css` | Bajo. Hoy `boot()` abre `index[0]`; pasa a abrir la portada si no hay parámetros |
| A6 | Narrador solo para Barnard: 7 pasos como tabla en TS, franja, Siguiente/Atrás/Salir, `story=1&step=N` en la URL; cada paso fija `mode`, `det`, `a`, `b` y las anotaciones de A4 | 1.0 | `main.ts` (nuevo módulo `story.ts`), `app.css`, `i18n.ts` | Medio. No toca el pipeline ni los datos |

Total: 4.5 h con margen; 3.5 sin A6 pulido. **Después de A5 la demo ya cambia:** portada con frase, Barnard anotado, números con frase, B1 y B2 cerrados.

### Nivel B · medio (8 a 10 h) · riesgo medio

Construir sobre A, en este orden:

| # | Tarea | Horas |
|---|---|---|
| B1 | Narrador de WISE 0855 (D1 → D6, parpadeo entre temporadas 1 y 2, sin resta, huella fila por fila, compatible) | 1.0 |
| B2 | Capas mira / explora / mide: atributo, CSS, conmutador, `layer=` en URL, defectos por origen | 1.5 |
| B3 | Narrador de R Dra (medianas en cliente, "Algo cambió") y RW Aur | 1.0 |
| B4 | Narrador de ε Indi B ("compatible", dos mundos) | 0.5 |
| B5 | Narrador genérico para campo nuevo (plantillas de 3.5) | 1.0 |
| B6 | Estados: carga con tarjetas rotatorias y progreso en la línea de tiempo; error con detalle plegado; sin imágenes; una sola temporada | 1.0 |
| B7 | "Cómo se hizo" en español; pie con "Candidatos, no descubrimientos"; tooltips de modos | 0.5 |
| B8 | Pruebas de aceptación de la sección 13 automatizadas donde se pueda (cero números sueltos, afirmaciones prohibidas) | 1.0 |

Total: 7.5 h sobre A. Cada punto deja la app funcionando.

### Nivel C · completo (una semana)

- Huella de referencia junto a la de WISE 0855 (exportar desde `precompute`).
- Medianas de control de R Dra exportadas y mostradas ("cinco estrellas vecinas planas al 1 %").
- Comparación lado a lado para "reducir movimiento" en todos los pasos.
- Pruebas con 5 personas reales por capa y ajuste del microcopy.
- Lector de pantalla: narración con `aria-live` por paso, descripción textual de cada anotación.
- Versión de 1280×720 para proyector (paneles más grandes, texto 20 px mínimo).
- Modo "clase": QR por paso para que un salón siga el recorrido en sus teléfonos.
- Campo con asteroide (Q5 de Yuca) con su historia "salta entre cuadros".

### Recomendación: **Nivel A completo, hoy y mañana en la mañana. B1 (WISE 0855) solo si A está verificado antes del viernes a mediodía.**

Por qué: faltan dos días, un solo frontend (Carlos), y el pitch solo necesita Barnard y WISE 0855 en pantalla. A cierra los dos bloqueantes de la auditoría (B1, B2), pone la frase que hoy falta y anota el momento wow. Todo A es texto, SVG de overlay y una vista nueva: no toca el pipeline, los datos ni los archivos congelados. B es deseable pero las capas (B2) tocan el CSS de toda la app el día antes del evento: si se rompe el 390 px o el e2e a las 20:00 del viernes, no hay tiempo. Lo que de B es seguro y barato (B1, B7) entra si sobra tiempo; el resto es para después del 15.

---

## 13. Pruebas de aceptación

Pasa / no pasa. Se corren después de cada nivel.

**Prueba del niño de 8.** Un niño de 8 años frente a la portada, sin ayuda, 60 segundos, solo con el botón ámbar y Siguiente. Pasa si al final dice, con sus palabras: (a) que son dos fotos del cielo, (b) que una estrella se movió, (c) dónde estaba y dónde está (señala azul y ámbar). Tres de tres para pasar. Se prueba con al menos 2 niños.

**Prueba del astrofísico.** Una persona con formación en física, capa "mide", 5 minutos. Debe poder verificar sin ayuda: μ con su error y PA; qué detectores y cuántos puntos entraron; la base temporal; que la paralaje se restó; el acuerdo con el catálogo en σ; la S/N por detector; que el cociente de frío es un límite inferior y no una temperatura; cuántas imágenes y de qué lotes; las banderas de una imagen concreta. Pasa si encuentra las nueve cosas y no encuentra ninguna afirmación que considere falsa.

**Prueba de 5 segundos.** Sección 2. Pasa con 4 de 5 personas.

**Prueba de cero números sueltos.** Script sobre el DOM renderizado (Playwright, capas mira y explora, los 5 objetivos, 390 y 1440 px): todo nodo de texto que contenga un dígito debe tener, en el mismo elemento o en su contenedor inmediato, al menos 4 palabras sin dígitos. Excepciones permitidas: fechas en la línea de tiempo, el campo de coordenadas, los ticks de ejes de gráficas. Pasa con cero violaciones en "mira" y "explora". En "mide" no se exige.

**Prueba de teléfono de gama baja.** Chrome con CPU ×6 más lento y red 4G lenta, 390 px: la portada pinta en < 2 s; Barnard abre en < 5 s; el parpadeo a 3 cuadros/s no pierde cuadros; sin scroll horizontal; objetivos táctiles ≥ 44 px; el narrador se lee sin hacer zoom (≥ 16 px). Pasa si se cumplen las seis.

**Prueba de honestidad.** Script sobre todos los textos de `i18n.ts`, de la tabla de pasos del narrador y del DOM renderizado de los 13 campos. Ninguna de estas cadenas puede aparecer (ES y EN):
- "descubr", "discover", "Planet X encontrado", "found Planet X"
- "kelvin", " K" junto a un número en el bloque de frío, "°C", "grados bajo cero", "temperatura de" (salvo la frase aprobada de Webb, si Horacio la aprueba)
- "coincide" / "agrees" / "matches" en cualquier objetivo salvo Barnard
- "se apaga", "fades", "dims out", "baja de brillo" en R Dra o RW Aur
- "el detector encontró" / "detector found" en WISE 0855
- "89 %", "precisión de 0.01"
- "medimos la distancia", "paralaje medida", "measured parallax"
- "millón de veces" atribuido a Sparks
- "está en línea" si no hay URL pública
Pasa con cero coincidencias. Además, toda cifra con error debe mostrar el error en el mismo elemento (regex `\d+(\.\d+)?\s*±\s*\d` o la palabra "entre … y …").

---

## 14. Riesgos y qué no cambiar a dos días del evento

**No cambiar**
1. Nada del pipeline, los manifiestos ni los archivos congelados (`frozen.json`). El narrador lee, no escribe.
2. La escala de imagen por detector, la paleta divergente ni el rango común de la resta. Si se tocan, el parpadeo miente.
3. El estado en la URL que ya existe. Solo se añaden parámetros (`layer`, `story`, `step`); ninguno se renombra. Las URLs del pitch y del QR siguen funcionando.
4. La estructura de `index.html` que usan los e2e (`#stage`, `#modes`, `#card`, `#btn-play`). Renombrar textos sí; ids no.
5. Los atajos de teclado.
6. El modo embed.

**Riesgos**

| Riesgo | Probabilidad | Daño | Mitigación |
|---|---|---|---|
| El overlay anotado (A4) se dibuja mal en campos sin `points` usados o en modo en vivo | media | medio | Si no hay puntos usados, caer a las marcas de catálogo actuales y decirlo en la etiqueta ("según el catálogo") |
| Los e2e buscan textos viejos ("Subtract B−A") | alta | bajo | Actualizar `tests/e2e` en la misma tarea A3 |
| La portada rompe el arranque con `?field=` desde el QR impreso | baja | alto | La portada solo aparece sin parámetros; probar las 5 URLs del pitch |
| Las capas (B2) rompen el 390 px | media | alto | Por eso B2 no entra en A. Si entra, probar las 6 capturas v3 de nuevo |
| El narrador afirma algo que un juez refuta | baja si se sigue la sección 13 | alto | Horacio aprueba los 35 textos (5 objetivos × 7 pasos) antes de compilar |
| "250–300 K" sin fuente en `fuentes.md` | media | medio | No mostrarlo hasta que esté en `fuentes.md` |
| Tiempo: A6 (narrador) se alarga | media | medio | A1 a A5 ya cambian la demo; A6 se puede entregar solo con Barnard y sin animaciones |
| Red de la UTH sin CDS ni jsDelivr | conocida | bajo | Contexto del cielo queda en "mide"; nada del recorrido depende de internet |

---

## Decisiones que necesito de Joaquín

1. **¿Nivel A ahora y B1 (WISE 0855) solo si sobra tiempo el viernes?** Recomendación por defecto: sí. Nada de B2 (capas) antes del evento.
2. **¿La app abre en portada o directo en Barnard?** Recomendación: portada cuando la URL no trae parámetros; con parámetros, directo al campo (las URLs del pitch no cambian). En el escenario se abre `?field=barnard&story=1&step=1`.
3. **¿Mostrar "entre 250 y 300 kelvin, medido por el Webb" en el bloque de frío de WISE 0855?** Recomendación: sí, solo si Horacio lo agrega a `fuentes.md` hoy con las dos referencias de `AUDITORIA.md` G1. Si no, el bloque termina en "no es una temperatura".
4. **¿Nombres de los modos por efecto ("Restar: qué cambió") en todas las capas, con el nombre técnico entre paréntesis solo en "mide"?** Recomendación: sí. En nivel A, sin capas, el nombre va como "Restar: qué cambió (B−A)".
5. **¿Quién aprueba los textos del narrador?** Recomendación: Horacio los 35 textos de ciencia (ES), Carlos la traducción EN, antes de las 12:00 del viernes; después de esa hora no se cambia ningún texto.
