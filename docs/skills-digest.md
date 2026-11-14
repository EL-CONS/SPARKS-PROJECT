# skills-digest · reglas útiles para app-v2 (resumen de CLAUDE para HYDROGEN)

Fuente: skills locales frontend-design, dataviz, ux-copy, accessibility-review, design-taste-frontend (solo el checker) y webapp-testing. Solo lo que aplica a Sparks. Las reglas del BRIEF (tokens, honestidad) ganan sobre cualquier línea de aquí.

## 1. frontend-design · dirección y texto de interfaz
- El héroe abre con lo más característico del tema. Para Sparks: el cielo y el parpadeo, no un número grande con etiqueta chica y degradado (ese es el tratamiento por defecto, evitarlo).
- Tipografía = personalidad. Dos familias claramente distintas (Archivo display, Plex texto). Escala tipográfica deliberada (Bringhurst), pesos y anchos intencionales. Líneas < 80 caracteres.
- Tics de página generada que NO usamos: una sola palabra resaltada en el titular; MAYÚSCULAS espaciadas en etiquetas; etiqueta-ceja encima de cada título; cadenas "A · B · C" como metadatos decorativos; "PALABRA — fragmento"; monoespaciada para datos chicos; "→" pegado a botones; tarjetas idénticas redondeadas con la misma sombra gris; numeración 01/02/03 si el contenido no es secuencia (el recorrido de 7 pasos SÍ es secuencia).
- Estructura visual = información: bordes, numeración, divisores solo si codifican algo.
- Movimiento no disparado por el usuario: escaso, un solo momento orquestado. Nada de fundido+subida en cada sección ni hover en cada tarjeta. El movimiento que responde a una acción (abrir, confirmar) sí, cuando muestra qué cambió.
- Gastar la audacia en UN lugar (el comparador de parpadeo); todo lo demás callado. Quitar un accesorio antes de salir.
- Piso de calidad sin anunciarlo: responsivo a móvil, foco visible, reducir movimiento, contraste.
- Proceso: plan de tokens (4–6 hex, tipos, layout en ASCII, principios) → revisar contra el brief → construir → criticar con capturas.
- CSS: cuidar especificidad para que clases no se anulen (padding/margin entre secciones).

### Texto de interfaz (frontend-design §writing)
- Las palabras están para entender y usar, no para decorar. Mínimas.
- Desde el usuario: nombrar por lo que entiende ("Restar: qué cambió"), no por cómo está hecho ("B−A").
- Voz activa. Un botón dice exactamente qué pasa ("Ver ese cielo", no "Enviar"). Una acción conserva su nombre en todo el flujo.
- Errores y vacíos = dirección, no ánimo: qué pasó y cómo seguir. Los errores no se disculpan ni son vagos. Un vacío invita a actuar.
- Tono conversacional, verbos llanos, mayúscula solo inicial, sin relleno. Cada elemento escrito hace un solo trabajo.

## 2. ux-copy
- Claro, conciso, consistente (mismo término para lo mismo: "Antes"/"Ahora", nunca A/B en mira/explora), útil, humano.
- CTA: empieza con verbo y es específico ("Mira la estrella que más se mueve").
- Error: qué pasó + por qué + cómo arreglar ("No pudimos abrir este cielo. Vuelve a intentar o abre otro.").
- Vacío: qué es + por qué está vacío + cómo empezar.
- Confirmación: la acción en la pregunta, botones con la acción.
- Tooltips: breves, nunca obvios. Carga: poner expectativas ("cerca de {s} segundos").
- Onboarding: divulgación progresiva, un concepto a la vez (= las 3 capas).
- Localización: evitar modismos, prever ~30 % más largo en ES que en EN.
- TODO texto vive en app-v2/src/i18n/ (lo escribe CLAUDE). HYDROGEN pide claves por COMMS; no escribe texto fijo en componentes.

## 3. dataviz · gráficas (espectro, curva de luz, huella, rango de error, dial)
- Forma: si la historia es UN número, es una cifra/rango, no una gráfica de una barra.
- Marcas: línea 2 px con remate redondo; puntos r ≥ 4 px con anillo de 2 px del color de fondo; relleno de área ~10 % de opacidad; barras ≤ 24 px.
- Rejilla y ejes: línea fina 1 px, sólida (nunca punteada), un paso arriba del fondo, recesiva. Punteado se lee como "proyección/umbral": úsenlo solo cuando sí es eso (p. ej., "no lo vimos" entre temporadas, catálogo).
- Separación por hueco de 2 px del color de fondo, nunca contorno alrededor de la marca.
- Leyenda siempre con ≥ 2 series; etiquetas directas selectivas (extremo, el punto que importa), nunca un número en cada punto.
- El texto NUNCA lleva el color del dato: la identidad la da una marca junto al texto (punto ámbar, aro azul). Etiquetas y ejes con tokens de texto. (Importante: "Antes"/"Ahora" como texto en azul/ámbar debe pasar contraste AA; si no, color en la marca y texto neutro.)
- Divergente: dos tonos opuestos (azul↔ámbar, cálido/frío) con punto medio neutro oscuro. Es nuestro mapa de la resta: no se toca.
- Secuencial: un solo tono claro→oscuro. Nada de arcoíris (excepción: la huella usa tono = longitud de onda, lleva leyenda de escala).
- Tooltips mejoran, nunca esconden: todo valor también alcanzable sin hover (tabla o etiqueta). Mismo detalle con foco de teclado. Zona de toque ≥ 24 px en puntos (44 px en controles). Valor primero, etiqueta después. Insertar etiquetas con textContent.
- Prohibido: doble eje Y; recolorear al filtrar; > 7 clases de color con significado.
- Ticks: números redondos; nunca más decimales que el error (10.2 ± 0.4 en mira/explora).

## 4. accessibility-review · WCAG 2.1 AA (compuerta G12 y G6)
- 1.1.1 texto alternativo en imágenes con significado (cada panel del cielo: "Foto de SPHEREx, D6, agosto 2025").
- 1.3.1 estructura semántica (landmarks: header, main, nav del recorrido; h1 único).
- 1.4.3 contraste texto ≥ 4.5:1 (≥ 3:1 si ≥ 24 px o 18.7 px negrita). 1.4.11 no-texto (bordes de controles, marcas) ≥ 3:1.
- 2.1.1 todo por teclado; 2.4.3 orden lógico; 2.4.7 foco visible; sin trampas de foco en diálogos (Compartir) y Escape cierra.
- 2.5.5 objetivos táctiles ≥ 44×44 px (BRIEF lo exige).
- 3.2.1 nada cambia solo al recibir foco. 3.3.1/3.3.2 errores descritos, entradas con etiqueta (campo de coordenadas).
- 4.1.2 nombre, rol, valor en todo control (conmutador de capa = radiogroup; barra de 7 puntos = lista de botones con aria-current="step").
- Narrador: aria-live="polite" por paso. Medios que se mueven solos (parpadeo) con pausa visible; > 5 s exige botón de pausa.
- Probar: teclado solo; zoom 200 % sin romper; contraste calculado.

## 5. design-taste-frontend · solo el checker (lo que nos sirve)
- La skill tiene scripts Node con Chrome headless (consistency.mjs, check.mjs, shoot.mjs, perf.mjs) en .claude/skills/design-taste-frontend/. Sirven el HTML por http en 127.0.0.1; para un build con rutas absolutas se pasa `--root dist`. Su checklist está pensada para sitios de empresa: aplicamos solo los puntos de abajo, el resto no corresponde.
- Puntos que sí adoptamos como revisión:
  - Bordes iguales: todo bloque sobre las mismas líneas de la retícula; nada se sale a un lado; sin scroll horizontal (390).
  - Todo visual dibuja a 1440, 1024, 768 y 390; un efecto rechazado (sin WebGL) muestra su respaldo quieto.
  - Movimiento: todo botón responde al puntero; nada se inclina (tilt); nada se mueve por scroll salvo UN momento dedicado; lo que se mueve > 5 s tiene pausa; con reducir movimiento todo queda quieto y nada queda oculto; máximo 4 contextos WebGL vivos.
  - Un sistema: un par de botones, un estilo de tarjeta, una escala de radios, un estilo de enlace; máximo dos cajas de profundidad; una escala de títulos con sus fuentes cargadas; contraste de texto.
  - Texto: títulos nombran cosas, botones verbo + objeto, máx. dos acciones en el héroe; un hecho, una redacción (el mismo número dicho igual en todas partes).
  - Rápido: sin filas FAIL en perf (peso de imagen, contextos, layout shift).
  - Nunca: tarjetas que se animan al hacer scroll, reveal/fade-in/parallax, parpadeo aleatorio; violeta/lavanda en el diseño propio; copiar código, texto o efecto firma de una referencia.
- Comando útil (perf y capturas) sobre el build de app-v2, si el entorno los soporta:
  `node .claude/skills/design-taste-frontend/scripts/perf.mjs app-v2/dist/index.html --root app-v2/dist`
  `node .claude/skills/design-taste-frontend/scripts/shoot.mjs --url app-v2/dist/index.html --w 1440 --out agents/shots/x-1440.png`
  (si fallan, usar Playwright de §6; CLAUDE no garantiza estos scripts).

## 6. webapp-testing · servir y capturar
- Python Playwright, Chromium headless. El repo ya tiene `.venv/bin/python` con Playwright (lo usa tests/e2e/run_e2e.py).
- Servir + correr en un comando:
  `.venv/bin/python .claude/skills/webapp-testing/scripts/with_server.py --server "npm --prefix app-v2 run preview -- --port 5180 --strictPort" --port 5180 -- .venv/bin/python mi_script.py`
- Patrón de script:
  ```python
  from playwright.sync_api import sync_playwright
  with sync_playwright() as p:
      b = p.chromium.launch(headless=True)
      pg = b.new_page(viewport={"width": 390, "height": 844})
      pg.goto("http://localhost:5180/?field=barnard&story=1&step=3")
      pg.wait_for_load_state("networkidle")   # SIEMPRE antes de inspeccionar
      pg.screenshot(path="agents/shots/barnard-step3-390.png", full_page=True)
      b.close()
  ```
- Reconocer y luego actuar: captura o `pg.content()` → elegir selectores (role=, text=, ids) → actuar.
- Consola: `pg.on("console", lambda m: print(m.type, m.text))` y `pg.on("pageerror", ...)`.
- Reducir movimiento: `b.new_page(reduced_motion="reduce")`. Sin internet: `ctx.route("**/*", lambda r: r.abort() if not r.request.url.startswith("http://localhost") else r.continue_())`.
- CPU 6x/4G: CDP `Emulation.setCPUThrottlingRate {rate: 6}` y `Network.emulateNetworkConditions` (latencia 150 ms, ~1.6 Mbps bajada).
- Nombres de captura: agents/shots/{pantalla}-{390|1440}.png (G13).
