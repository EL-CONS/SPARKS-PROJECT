Tarea: construir el frontend de Sparks, una herramienta web pública del reto "Planet X and SPHEREx" (NASA Space Apps Challenge 2026), con una identidad visual propia y una dirección artística nueva.

## 1. Qué es Sparks (esto sí es tu fuente de verdad)

Sparks muestra imágenes del telescopio SPHEREx de la NASA, que mapea todo el cielo en 102 colores de infrarrojo. La persona escribe una posición del cielo y ve las fotos de esa zona parpadeando como un video corto, para notar qué se mueve. La idea viene de Clyde Tombaugh, que en 1930 encontró Plutón alternando dos fotos del mismo cielo. Azul: dónde estaba. Ámbar: dónde está. Flecha: hacia dónde va.

Lee solo estos archivos del repo:
- `sparks-en-breve.md`: la propuesta en una pantalla.
- `CONTEXTO.md`: contexto del proyecto y del reto.
- `sprint-12-1.md`: solo las secciones "El reto", "Recursos del reto" y el alcance de tu tarea (la lista de lo que debe lograr). **Ignora la sección "Pauta" y la lista de "Material que se le entrega" que habla de diseño.**
- `data-sample/README.md`: datos reales de ejemplo (rama `joako`).
- La carpeta `Logo/`: ábrela y mírala bien.

## 2. Instrucción explícita sobre diseño

**No te bases en las pautas de diseño existentes del proyecto. No leas `DESIGN.md`, `ESQUELETO-UX.md`, `SKILLS-UX.md` ni `docs/skills-digest.md`.** Quiero que pruebes una línea visual nueva, que explores sin esas restricciones y que no llegues a los mismos tokens, paleta ni layout por otro camino. Si por casualidad los abriste, ignora lo que viste.

Lo que sí es tu punto de partida, y nada más:
- El **logo** (símbolo, horizontal, versiones de una tinta, símbolo animado, favicon): su forma, su color y su luz.
- El **glow**: la luz que emana de una chispa en la oscuridad.
- El **espacio**: profundidad, escala, silencio, mucho cielo vacío bien compuesto.
- La **elegancia**: contención, tipografía cuidada, jerarquía clara, pocas cosas con mucho peso cada una.

## 3. Funcionalidad: se conserva todo lo del alcance

Esto es obligatorio y no se sacrifica por estética:
1. Campo de coordenadas (RA y Dec) y botones para los cinco objetivos de prueba: Barnard, Epsilon Indi B, WISE 0855, RW Aurigae, R Draconis.
2. Escenario del cielo con seis paneles, uno por detector.
3. Controles de transporte: reproducir, pausar, cuadro anterior y siguiente, velocidad.
4. Modos: parpadeo, suma, resta.
5. Las coordenadas viajan en la URL (por ejemplo `?ra=...&dec=...`) para poder incrustar la herramienta.
6. Idioma inglés y español.
7. Estados de error, carga y vacío con texto claro.

Con los datos de `data-sample/` tienes imágenes reales solo de Barnard. Los otros cuatro objetivos aparecen en `index.json` sin carpeta: muéstralos como "pronto", sin inventar imágenes.

## 4. Ideas y límites

- Libertad total en composición, navegación, tipografía, paleta, tratamiento de las imágenes y microinteracciones. Evita lo genérico: héroe centrado con tres botones, tarjetas idénticas, gradientes sin propósito, estilo dashboard administrativo.
- Las imágenes del cielo son datos científicos: no las filtres, no las retoques ni les pongas efectos encima. El glow y la elegancia viven en el marco, la marca y los controles, nunca en el cielo. Cada escala de color lleva leyenda con unidades. Lo que no está medido, se dice.
- Hablamos de "candidatos a revisar", nunca de "descubrimientos".
- Dos temas, oscuro y claro, cada uno diseñado por separado y no por inversión. El oscuro será probablemente el predeterminado por el tema espacial; justifica tu decisión. El cambio funciona sin recargar y recuerda la preferencia, sin parpadeo al cargar.
- Diseña móvil y escritorio a la vez. Valida 390 px, tablet y 1440 px.
- Accesibilidad: WCAG 2.2 AA, todo por teclado, foco visible y soporte de `prefers-reduced-motion`.

## 5. Recursos y licencias

Puedes usar tipografías de Google Fonts y recursos con licencia abierta, y puedes buscar fotografía o textura de espacio en fuentes como Wikimedia Commons, Openverse y los archivos públicos de NASA. Comprueba la licencia de cada recurso antes de usarlo. Anota fuente, licencia y atribución en `ASSETS_CREDITS.md`. Nada de servicios de pago.

## 6. Stack

Vite, React 18 y TypeScript. Sin dependencias de pago ni innecesarias.

## 7. Skills

Usa las que tengas instaladas y necesites, sin cargarlas todas: `frontend-design`, `ui-ux-pro-max`, `design-taste-frontend`, `web-design-guidelines`, `webapp-testing`, `accessibility-review`, `ux-copy`, y también `impeccable` o `emil-design-eng` si las tienes. Si alguna no está instalada, dímelo.

## 8. Metodología

- **Fase A:** lee los archivos de la sección 1 y revisa `data-sample/`.
- **Fase B:** explora tres direcciones artísticas basadas en logo, glow, espacio y elegancia. Para cada una describe concepto, referencias, paleta, tipografía, composición, tratamiento de imágenes y navegación en móvil. Elige una y justifica.
- **Fase C:** define el sistema visual de ambos temas.
- **Fase D:** construye el escenario del cielo y la barra de coordenadas como prototipo.
- **Fase E:** extiende a todo el alcance.
- **Fase F:** valida en navegador, en ambos temas y en móvil y escritorio. No declares una validación visual como hecha si no viste el resultado.

## 9. Reglas del repo

- Trabaja en la rama `cons`. Puedes hacer commits en ella.
- No hagas push a `main` ni despliegues nada. Cuando termines, abre un pull request a `main`.
- No modifiques `data-sample/` ni `Logo/`.

## 10. Entrega

Al final dime: la dirección elegida y por qué, las referencias, los recursos con su licencia, las funciones conservadas, cómo funciona el tema oscuro y claro, los resultados responsive, el resultado de build y lint, qué revisaste de accesibilidad y qué problemas quedan pendientes.
