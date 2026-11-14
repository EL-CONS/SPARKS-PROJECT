Tarea: diseñar y construir la interfaz de Sparks, una herramienta web pública del reto "Planet X and SPHEREx" (NASA Space Apps Challenge 2026), con una identidad visual propia y una dirección artística nueva.

**La vara de calidad.** Quiero un diseño impecable, al nivel de la ciencia que muestra. Dos personas tienen que salir asombradas de la misma página:
- **Una niña o un niño de 8 años** que la abre, se maravilla con los colores y los astros, entiende qué hace sin que nadie le explique y quiere seguir tocando.
- **Una astrofísica o un astrofísico** que se asombra por lo mismo, y además por lo accesible y lo fiable que es la plataforma: cada número con su unidad, su incertidumbre y su fuente.

Ninguna de las dos lecturas se sacrifica por la otra. Todo debe ser entendible.

## 1. Qué es Sparks (tu fuente de verdad)

Sparks muestra imágenes del telescopio SPHEREx de la NASA, que mapea todo el cielo en 102 colores de infrarrojo. La persona escribe una posición del cielo y ve las fotos de esa zona parpadeando como un video corto, para notar qué se mueve. La idea viene de Clyde Tombaugh, que en 1930 encontró Plutón alternando dos fotos del mismo cielo. Azul: dónde estaba. Ámbar: dónde está. Flecha: hacia dónde va.

Lee solo estos archivos del repo:
- `sparks-en-breve.md`: la propuesta en una pantalla.
- `CONTEXTO.md`: contexto del proyecto y del reto. Ignora en él cualquier mención de archivos de diseño.
- `sprint-12-1.md`: las secciones "El reto" y "Recursos del reto".
- `sprint-13-30-a-14-30.md`: el reparto del trabajo y de las carpetas.
- `data-sample/README.md`: datos reales de ejemplo.
- La carpeta `Logo/`: ábrela y mírala bien.

## 2. Instrucción explícita sobre diseño

**No te bases en pautas de diseño anteriores del proyecto. No abras `DESIGN.md`, `ESQUELETO-UX.md`, `SKILLS-UX.md` ni `docs/skills-digest.md`, ni busques copias de ellos en otras carpetas del disco.** Quiero que pruebes una línea visual nueva, que explores sin esas restricciones y que no llegues a los mismos tokens, paleta ni composición por otro camino. Si por casualidad los viste, ignóralos.

Tu punto de partida, y nada más:
- El **logo** (símbolo, horizontal, versiones de una tinta, símbolo animado, favicon): su forma, su color y su luz.
- El **glow**: la luz que emana de una chispa en la oscuridad.
- El **espacio**: profundidad, escala, silencio, mucho cielo bien compuesto.
- La **elegancia**: contención, tipografía cuidada, jerarquía clara, pocas cosas con mucho peso cada una.

## 3. Cómo se reparte el trabajo en el repo

Cons construye la capa lógica sin diseño. Tú haces el diseño encima, sin pisarlo.

| Carpeta | Quién la toca |
|---|---|
| `app/src/ui/`, `app/src/styles/`, `app/index.html` | Tú |
| `app/src/core/`, `app/src/data/`, `app/src/i18n/`, `app/tests/` | Cons |

El proyecto base llega a la rama `cons`. Cuando exista, tráelo a tu rama con `git merge origin/cons`. Hasta entonces, haz la exploración visual (Fase B) en archivos HTML sueltos dentro de `design-proto/`. Usa lo que Cons entrega (lector de coordenadas, estado en la URL, carga de datos, reproductor, textos) sin cambiar sus firmas. Si necesitas claves de texto nuevas, agrégalas en `app/src/i18n/` en un commit aparte y avísale.

## 4. Doble lectura: un niño de 8 años y una astrofísica

La interfaz funciona en capas. Cada cosa se entiende a primera vista y se puede profundizar hasta el dato exacto.

- **Capa 1, una frase:** qué es y qué pasa, con palabras de un niño de 8 años. Ejemplo de tono: "Dos fotos del mismo cielo, tomadas con meses de diferencia. Lo que salta, se movió."
- **Capa 2, un párrafo:** qué mide Sparks y cómo.
- **Capa 3, los números:** valor, unidad, incertidumbre, fuente, versión de los datos (lanzamiento y DOI), banderas de calidad y de dónde sale cada cifra.

Reglas:
- Todo término técnico tiene una explicación corta al alcance de un toque o un clic (qué es una enana café, un movimiento propio, un detector). Un glosario vivo, no un PDF.
- Cada pantalla tiene una acción obvia para quien no sabe nada: por ejemplo, "Mira qué se mueve en la estrella de Barnard".
- Lo que es un dibujo se ve como dibujo y lo que es un dato real se ve como dato. Las ilustraciones de astros (estrellas, enanas, cometas, asteroides) llevan una marca clara de "ilustración". Nunca se mezclan con las imágenes de SPHEREx de forma que parezcan datos.
- Hablamos de "candidatos a revisar", nunca de "descubrimientos". Lo que no está medido, se dice.
- Cuando haya un veredicto de clase (estrella cercana, candidata a enana fría, variable), se muestra con su razón en una frase y con su incertidumbre. Si falta algún dato, el veredicto lo dice.

## 5. Asombro y rigor a la vez

- **Color que maravilla, color que significa.** Hay dos usos distintos y no se mezclan. El color de asombro (nebulosas, resplandor, fondos, ilustraciones, la marca) puede ser rico, vivo y emocionante. El color de datos (escalas, leyendas, azul "antes" y ámbar "ahora") es sobrio, consistente, accesible para daltonismo y siempre lleva leyenda con unidades.
- **Las imágenes de SPHEREx son datos científicos:** no las filtres, no las retoques ni les pongas efectos encima. El glow y la magia viven en el marco, la marca, los controles y las ilustraciones, nunca dentro del cielo.
- **Astros con personalidad:** busca una forma de que estrellas, enanas, cometas y asteroides sean personajes visuales reconocibles que un niño quiera tocar, sin caricaturizar la ciencia.
- **Confianza visible:** de dónde vienen los datos, qué versión, cuándo se actualizaron, cuál es la incertidumbre. La fiabilidad se ve, no solo se dice.

## 6. Funcionalidad: se conserva todo lo del alcance

Obligatoria, no se sacrifica por estética:
1. Campo de coordenadas (RA y Dec) y botones para los cinco objetivos de prueba: Barnard, Epsilon Indi B, WISE 0855, RW Aurigae, R Draconis.
2. Escenario del cielo con seis paneles, uno por detector.
3. Controles de transporte: reproducir, pausar, cuadro anterior y siguiente, velocidad.
4. Modos: parpadeo, suma, resta.
5. Las coordenadas viajan en la URL (por ejemplo `?ra=...&dec=...`) para poder incrustar la herramienta.
6. Idioma inglés y español.
7. Estados de error, carga y vacío con texto claro, útil y amable.

Profundidad, si el tiempo lo permite: flecha medida contra esperada con barra de error, huella de 102 colores o espectro, metadatos y banderas, capa de catálogos (Gaia) y campo de visión elegible.

Con `data-sample/` tienes imágenes reales solo de Barnard. Los otros cuatro objetivos aparecen en `index.json` sin carpeta: muéstralos como "pronto", sin inventar imágenes.

## 7. Accesibilidad y fiabilidad

- WCAG 2.2 AA, todo por teclado, foco visible, objetivos táctiles generosos y `prefers-reduced-motion`.
- **El parpadeo es el corazón del producto y es un riesgo:** respeta el criterio de WCAG 2.3.1 (no más de tres destellos por segundo en un área grande). La velocidad por defecto es baja, hay botón de pausa siempre visible y avisa de forma amable a quien pueda ser sensible.
- Cada imagen del cielo tiene texto alternativo ("Foto de SPHEREx, detector 6, agosto de 2025") y los gráficos se pueden leer sin ver el color.
- Texto legible: tamaño cómodo, contraste alto, líneas cortas, vocabulario simple, sin abreviaturas sin explicar.
- Que funcione en un teléfono modesto y con conexión lenta: los datos se cargan por campo, con estados de carga que dicen cuánto falta.

## 8. Ideas y límites de diseño

- Libertad total en composición, navegación, tipografía, paleta, ilustración, tratamiento de las imágenes y microinteracciones. Evita lo genérico: héroe centrado con tres botones, tarjetas idénticas, gradientes sin propósito, estilo dashboard administrativo, "IA genérica".
- Dos temas, oscuro y claro, cada uno diseñado por separado y no por inversión. El oscuro será probablemente el predeterminado por el tema espacial; justifica tu decisión. El cambio funciona sin recargar, recuerda la preferencia y no parpadea al cargar.
- Diseña móvil y escritorio a la vez. Valida 390 px, tablet y 1440 px.
- Movimiento con propósito: que explique algo (qué cambió, qué se movió), nunca solo decore.

## 9. Recursos y licencias

Puedes usar tipografías de Google Fonts y recursos con licencia abierta, y buscar imágenes o texturas de espacio en Wikimedia Commons, Openverse y los archivos públicos de NASA. Las ilustraciones pueden ser dibujos propios (SVG hechos a mano), que no tienen problema de licencia. Comprueba la licencia de cada recurso antes de usarlo y anota fuente, licencia y atribución en `ASSETS_CREDITS.md`. Nada de servicios de pago.

## 10. Stack

Vite, React 18 y TypeScript. Sin dependencias de pago ni innecesarias.

## 11. Skills

Úsalas según las necesites, sin cargarlas todas. Se cargan al abrir una sesión nueva; si alguna no aparece, dímelo.
- Dirección y diseño: `impeccable` (crítica, jerarquía, tipografía, composición, pulido), `design-taste-frontend`, `frontend-design`, `ui-ux-pro-max`.
- Textos: `ux-copy` (microtextos, errores, estados vacíos).
- Calidad: `web-design-guidelines`, `accessibility-review`, `webapp-testing` (capturas y pruebas en navegador), `fixing-motion-performance` (animación).
- Gráficas y ciencia: `dataviz` (leyendas, color de datos), `astropy` (nombres, unidades y coordenadas).

## 12. Metodología

- **Fase A:** lee los archivos de la sección 1 y revisa `data-sample/`.
- **Fase B:** explora tres direcciones artísticas basadas en logo, glow, espacio y elegancia, pensadas para la doble lectura (niño y astrofísica). Para cada una describe concepto, referencias, paleta, tipografía, composición, tratamiento de ilustración e imágenes, y navegación en móvil. Elige una y justifica.
- **Fase C:** define el sistema visual de ambos temas y el lenguaje de las capas de lectura.
- **Fase D:** construye el escenario del cielo, la barra de coordenadas y la portada como prototipo. Comprueba que se siente diferente a lo genérico.
- **Fase E:** extiende a todo el alcance.
- **Fase F:** valida en navegador, en ambos temas, en móvil y escritorio. Revisa con `impeccable`, `accessibility-review` y `web-design-guidelines`. No declares una validación visual como hecha si no viste el resultado.

## 13. Reglas del repo

- Trabaja en la rama `joako`. Puedes hacer commits en ella.
- No hagas push a `main` ni despliegues nada. Pregúntame antes de cualquier push.
- No modifiques `data-sample/`, `Logo/`, ni las carpetas de Cons (`core/`, `data/`, `tests/`) salvo lo indicado arriba.

## 14. Entrega

Al final dime: la dirección elegida y por qué, las referencias, cómo se resuelve la doble lectura, los recursos con su licencia, las funciones conservadas, cómo funcionan el tema oscuro y el claro, los resultados responsive, el resultado de build y lint, qué revisaste de accesibilidad (incluido el parpadeo), con capturas de lo que viste, y qué problemas quedan pendientes.
