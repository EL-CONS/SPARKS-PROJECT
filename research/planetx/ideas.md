# Fábrica de ideas · Sparks × SPHEREx

Las restricciones salen de la investigación (`02`–`05`): **movimientos de 1–2 px entre temporadas** para las enanas marrones, **asteroides muy visibles dentro de una temporada**, **cada cuadro a una λ distinta**, **5 MB por cutout** si no se quita el PSF, **587 equipos rivales** con blink, resta y JPL ya resueltos.

Factibilidad: 1 = imposible en 13.5 h, 5 = trivial. "ML" = dónde aprende algo de datos de verdad. Si no hay, se dice.

## A. Visualización del tiempo

| # | Nombre | Una frase | Qué ve el usuario | ML | Momento "wow" | Fact. | Riesgo principal |
|---|---|---|---|---|---|---|---|
| 1 | **Blink×6** | Flipbook de coadds por detector y temporada | 6 mini-flipbooks (uno por detector) sincronizados; cada uno alterna temporadas | No | La misma estrella "salta" igual en los 6 detectores: no es ruido | 4 | Con 1–2 px, el salto se ve poco sin resta |
| 2 | **Dipole Hunter** | La resta entre temporadas convierte el movimiento en un par blanco-negro | Mapa de resta con los dipolos resaltados y una flecha | Opcional | Barnard aparece como un "imán" blanco/negro perfecto, alineado con la flecha de Gaia | 4 | Residuos de estrellas brillantes y fantasmas imitan dipolos |
| 3 | **Chromatic Trail** | Rastro de luz coloreado por fecha | Imagen única: lo que se mueve deja un arcoíris; lo fijo queda blanco | No | Un asteroide pinta una línea de colores | 4 | Ya lo hace SPHEREx Time-Lapse |
| 4 | **Two Clocks** | Dos escalas de tiempo: "horas" (asteroides) y "meses" (estrellas) | Selector de reloj; en modo horas corre el video dentro de una temporada | No | Cambiar de reloj y ver aparecer asteroides que antes no se veían | 4 | Mezcla de λ dentro de una temporada (cada cuadro, otro canal) |
| 5 | **Follow the Arrow** (shift-and-stack) | Sumar imágenes corriéndolas al ritmo de una hipótesis de movimiento | Deslizador de velocidad y dirección; el objeto débil "se enfoca" cuando aciertas | Búsqueda en malla + score (no ML entrenado) | Un objeto invisible en cada cuadro aparece al apilar con la flecha correcta | 3 | Costoso en el modo en vivo; pocas épocas |

## B. Espectros y las 102 bandas

| # | Nombre | Una frase | Qué ve el usuario | ML | Momento "wow" | Fact. | Riesgo principal |
|---|---|---|---|---|---|---|---|
| 6 | **Infrared Rainbow** | Las 102 bandas mapeadas a un arcoíris falso | Imagen en falso color donde lo frío se ve "rojo profundo" y lo caliente "azul" | No | WISE 0855 sale de un color que ninguna estrella tiene | 4 | Color arbitrario: hay que explicar la escala |
| 7 | **Sky Chord** (sonificación) | Cada espectro suena como un acorde de 102 notas | Botón ▶ en cada fuente; las bandas de metano son "notas que faltan" | No | El jurado **oye** la diferencia entre una estrella y una enana marrón | 3 | Puede verse como truco; hay que anclarlo en la física |
| 8 | **Spectral Barcode** | Huella de 102 celdas por fuente | Tira de colores por fuente, comparada con plantillas (estrella, enana T/Y, galaxia) | Vecino más cercano contra plantillas | Dos objetos que se ven iguales en la imagen tienen códigos opuestos | 3 | Las plantillas tienen que salir de datos citables |
| 9 | **Click-to-Spectrum** | Espectro al vuelo por fotometría forzada en cada imagen | Clic en una fuente → espectro con barras de error y λ de cada punto | No | RW Aur: dos espectros de dos fechas se separan a 3–5 µm | 3 | Latencia en vivo: ~100 cutouts por fuente |
| 10 | **Gaia-Blind** | Encuentra lo que Gaia no ve | Capa que marca fuentes brillantes en D6 sin contraparte en Gaia | Score simple | WISE 0855: el catálogo de Gaia está vacío ahí y SPHEREx lo ve brillar | 3 | Hay que confirmar que WISE 0855 no está en Gaia; muchas galaxias rojas también "faltan" |

## C. ML

| # | Nombre | Una frase | Qué ve el usuario | ML | Momento "wow" | Fact. | Riesgo principal |
|---|---|---|---|---|---|---|---|
| 11 | **Spark Detector** (real/bogus) | Clasificador de residuos: se mueve / varía / artefacto / residuo de resta | Círculos con etiqueta y probabilidad sobre la resta | Gradient boosting (o CNN chica) entrenado con **inyecciones ePSF** + banderas SPHEREx como etiquetas débiles | Curva de completitud: "recupera X% de objetos inyectados a S/N 5" | 3 | Tiempo para generar el set de inyecciones y validar |
| 12 | **Cold Classifier** | Clasifica el tipo de objeto por su espectro SPHEREx | Etiqueta "enana T/Y probable" con confianza | Clasificador entrenado con fuentes conocidas cruzadas (catálogos de enanas, Gaia) | La herramienta adivina "Y dwarf" para WISE 0855 sin que se lo digan | 2 | Hay que bajar cientos de espectros para entrenar: no cabe |
| 13 | **Variability Radar** | Detector de variabilidad a λ fija | Curva de luz por detector y un score de variabilidad | Detección de anomalías (p. ej. isolation forest sobre la dispersión) | R Dra traza su ciclo de 246 d | 3 | Saturación de R Dra; poca muestra |
| 14 | **Weirdness Rank** | Ranking de rarezas espectrales del campo | Lista "lo más raro de este parche" | Autoencoder o PCA sobre espectros del campo | Lo más raro del campo resulta ser algo conocido e interesante | 2 | Necesita espectros de todas las fuentes del campo |
| 15 | **Spark Score** (fusión) | Un veredicto por fuente: movimiento medido + forma espectral + variabilidad | Tarjeta por candidato: flecha, código espectral, curva y un número | Detector (#11) + índices espectrales físicos + reglas explicables | "Se mueve 8″/año **y** su espectro tiene metano → candidata a enana marrón" | 3 | Mucho alcance; hay que cortar a lo esencial |
| 16 | **Narrador IA** | Un LLM explica cada cuadro | Chat lateral | LLM (no aprende de los datos) | — | 4 | **"IA decorativa"**: la astrónoma la mata |

## D. Público y ciencia ciudadana

| # | Nombre | Una frase | Qué ve el usuario | ML | Momento "wow" | Fact. | Riesgo principal |
|---|---|---|---|---|---|---|---|
| 17 | **Spark Academy** | Entrenamiento con movers falsos plantados | 10 rondas de práctica con retroalimentación | Usa las inyecciones del #11 | El usuario pasa de 40% a 90% de aciertos en 2 min | 4 | SkyShift ya tiene algo parecido |
| 18 | **Adopt a Patch** | Cada usuario adopta un parche del cielo | Mapa de parches adoptados y revisados | No | "Este pedazo del cielo es tuyo" | 3 | Necesita una base de datos y usuarios reales |
| 19 | **Spark Card** | Tarjeta para compartir un hallazgo | Imagen + GIF + URL con coordenadas | No | La tarjeta llega al teléfono del jurado | 5 | Poco diferenciador sola |
| 20 | **Human-in-the-loop** | Los votos del público reentrenan el detector | Botón "¿real o artefacto?" y la precisión del modelo sube en vivo | Aprendizaje activo | El modelo mejora durante el pitch | 2 | Pocos votos = ruido; demasiado frágil para un pitch |

## E. Experiencia en vivo para el pitch

| # | Nombre | Una frase | Qué ve el usuario | ML | Momento "wow" | Fact. | Riesgo principal |
|---|---|---|---|---|---|---|---|
| 21 | **Scan the Sky** (QR) | El jurado escanea un QR y su teléfono abre un parche real | En cada teléfono, un flipbook; en el proyector, los votos de la sala | Opcional (#11 preordena) | 30 teléfonos parpadeando a la vez | 3 | La red de la sede; hay que precalcular los parches |
| 22 | **Zenith UTH** | "El cielo justo encima de nosotros, ahora" | Botón que calcula la RA/Dec del cenit de Hermosillo en este instante | No | Lo que SPHEREx vio exactamente sobre el auditorio | 5 | Campo aleatorio que puede salir aburrido (hay que tener uno preparado) |
| 23 | **Coordinate Roulette** | El público dicta coordenadas y la app responde en vivo | Teclado gigante en pantalla | No | Funciona con coordenadas que nadie preparó | 3 | Latencia en vivo de 30–60 s: mata el ritmo |

## F. Conexión local

| # | Nombre | Una frase | Qué ve el usuario | ML | Momento "wow" | Fact. | Riesgo principal |
|---|---|---|---|---|---|---|---|
| 24 | **Cielos de Sonora** | Versión en español con guías para clubes y escuelas | Modo "clase" con 5 misiones guiadas | No | Un estudiante de prepa encuentra a Barnard solo | 4 | Impacto difícil de demostrar en 2 días |
| 25 | **Tu cielo de cumpleaños** | El cenit de Hermosillo el día que naciste | Fecha → parche → flipbook | No | Personal y memorable | 5 | Trivial científicamente |

## G. Ideas raras

| # | Nombre | Una frase | Qué ve el usuario | ML | Momento "wow" | Fact. | Riesgo principal |
|---|---|---|---|---|---|---|---|
| 26 | **Sky Depth** (paralaje) | Medir distancias con el bamboleo de la Tierra | Elipse de paralaje ajustada | Ajuste de mínimos cuadrados | "Esta estrella está a 1.8 pc" medido en vivo | 2 | 0.5″ de paralaje = 0.08 px: no se mide con 3 épocas |
| 27 | **Operator Console** | La vista de "operador de satélite": dónde apuntaba SPHEREx en cada cuadro | Globo con la huella (`s_region`) de cada exposición sobre el cielo y su hora | No | Los jueces de Mexsat ven la geometría de apuntado que operan a diario | 4 | Bonito pero no ayuda a descubrir |
| 28 | **Embeddable Spark** | Widget `<iframe>` para blogs, Wikipedia o planetarios | Snippet "copiar embed" | No | El flipbook dentro de otra página en vivo | 5 | Ya lo pide C8; no es una idea por sí sola |
| 29 | **Comet Chaser** (MOST) | Seguir un objeto conocido usando MOST de IRSA | El objeto queda fijo y las estrellas corren | No | 3I/ATLAS quieto en el centro mientras las estrellas pasan | 3 | Ya lo hace SPHEREx Time-Lapse |
| 30 | **Planet X Grid** | Shift-and-stack sobre una malla de órbitas lejanas en la región de Planet Nine | Mapa de score sobre la región propuesta | Búsqueda en malla | "Barrimos N órbitas; aquí está el límite de lo que podemos descartar" | 2 | Promesa imposible si se vende como "buscamos Planet X" |

## Adaptación de la identidad Sparks

| # | Lectura | Lema (EN) | Metáfora visual | Cómo se ve en pantalla |
|---|---|---|---|---|
| S1 | **Cada punto que se mueve es una chispa por descubrir** | "Every moving point of light is a spark waiting to be found." | Un punto que deja una chispa corta al saltar entre cuadros | Candidatos con un destello animado de 300 ms en cada salto; los fijos quedan grises |
| S2 | **Chispa = el par blanco-negro de la resta** | "Where the sky changes, it sparks." | El dipolo de la resta como el polo + y − de una chispa eléctrica | Mapa de resta con dipolos azul eléctrico/ámbar; "spark" = dipolo confirmado |
| S3 | **Chispa = huella espectral** | "Every spark has a fingerprint." | La tira de 102 colores como el espectro de una flama | Cada tarjeta lleva su barra de 102 celdas como firma |
| S4 | **Chispa de la ciencia ciudadana** | "One spark from you, one discovery for everyone." | Una chispa que pasa de un teléfono a otro | En el demo QR, cada voto lanza una chispa que vuela al mapa del proyector |
| S5 | **Del desierto al infrarrojo** (conexión con Sonora) | "From the Sonoran dark sky to the infrared sky." | Silueta de sahuaro con el cielo IR detrás | Landing con el cielo SPHEREx sobre un horizonte desértico; modo oscuro por defecto |
| S6 | **Chispa = calor** (continuidad con la versión de incendios) | "The coldest sparks glow in infrared." | Escala térmica invertida: lo más frío brilla | WISE 0855 (250 K) como la "chispa más fría": brilla solo a 5 µm |
