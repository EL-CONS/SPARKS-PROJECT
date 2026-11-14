# SKILLS-UX · Herramientas para el recorrido guiado de Sparks

Fecha: 2026-11-12. Evento: 14 de noviembre. `DESIGN.md` manda sobre cualquier skill.
Estado: nada instalado ni modificado. Solo propuesta.

Base real de la app: Vite + TypeScript sin framework (`app/package.json`: solo vite, typescript, fuentes y qrcode-generator). Todo lo que exija React, Tailwind o `motion/react` queda fuera.

## 0. Inventario (paso 1)

Fuentes revisadas: skills de la sesión, `.claude/skills` del proyecto, `~/.claude/skills`, plugins en `~/.claude/plugins/installed_plugins.json`. Leí el SKILL.md de las que parecen relevantes. Las demás (AWS, backend, bases de datos, seguridad, logos) no aplican y no se listan una por una.

| Skill | Origen | Qué hace | Sirve |
|---|---|---|---|
| ui-ux-pro-max | proyecto (nextlevelbuilder) y plugin | Búsqueda local de estilos, paletas, fuentes, 119 guías UX, 25 tipos de gráfica, accesibilidad y táctil | Sí. Úsala solo para guías UX, accesibilidad y gráficas. No para paleta ni fuentes (ya descartadas en DESIGN.md) |
| frontend-design | proyecto (anthropics/skills) y plugin oficial | Dirección visual, tipografía, y una sección de texto de interfaz: voz activa, errores con salida, sentence case | Sí. Su sección de escritura sirve de base para microcopy |
| design-taste-frontend | proyecto (leonxlnx/taste-skill) | Anti-plantilla para sitios; checker en navegador real (Node 22 y Chrome) | Parcial. DESIGN.md ya fijó qué reglas aplican y cuáles no (una sección por pantalla, fotos, shaders: no). El checker de contraste y bordes sí sirve |
| web-design-guidelines | proyecto (vercel-labs) | Revisa código contra la guía Web Interface Guidelines | Sí, para revisión final. Baja las reglas de GitHub en cada uso (ver riesgo) |
| webapp-testing | proyecto (anthropics/skills) | Playwright en Python con `with_server.py`, capturas y logs | Sí. Es la base de verificación visual y de aceptación |
| astropy | proyecto (K-Dense) | Guía de API de Astropy | No para UX. Útil solo para revisar números del texto |
| dataviz | sesión (anthropics-skills) | Método de gráficas: color, marcas, leyendas, validador de contraste, tiles de estadística | Sí. Cambiar su paleta por la de DESIGN.md |
| fixing-motion-performance | usuario | Audita animaciones: layout thrash, propiedades de compositor | Sí. Cubre rendimiento de movimiento en teléfono |
| baseline-ui | usuario | Limpieza de UI, pero obliga Tailwind y `motion/react` | Parcial. Solo sus reglas de espaciado y jerarquía; ignorar la sección Stack |
| anti-ai-slop-ui | usuario (rwcod) | Define dirección y revisión anti plantilla | No. Redundante con frontend-design y design-taste; DESIGN.md ya hizo ese trabajo |
| superpowers:brainstorming | plugin oficial | Proceso de diseño previo a construir | Sí, para el esqueleto del recorrido (versión corta) |
| superpowers:writing-plans | plugin oficial | Plan de implementación por pasos | Sí, para partir el rediseño en tareas |
| superpowers:test-driven-development | plugin oficial | Ciclo prueba-código | Parcial. Para la lógica del recorrido, no para estilos |
| superpowers:verification-before-completion | plugin oficial | Exige evidencia antes de declarar terminado | Sí, para cerrar cada fase |
| ui-ux-pro-max:design-system, ui-styling, brand, banner-design, slides | plugin | Sistemas de diseño, estilos con Tailwind, marca | No. Ya hay tokens y la app no usa Tailwind |
| frontend-slides, imagegen-skills, logo y mascot | plugin / usuario | Diapositivas, imágenes, logos | No para esta tarea. frontend-slides podría servir al pitch, otra tarea |
| find-skills | usuario | Búsqueda con `npx skills` | Solo búsqueda |
| learnharness, hypr-widget-craft | usuario | Otros dominios | No |
| Herramientas del navegador integrado | sesión | Capturas, accesibilidad por árbol, viewport móvil, modo oscuro, red, consola | Sí. Cubren verificación visual sin instalar nada |

## 1. Instaladas y recomendadas

Orden de uso, por fase.

| Orden | Skill | Fase | Para qué |
|---|---|---|---|
| 1 | superpowers:brainstorming (corto) | Esqueleto | Fijar los pasos del recorrido y a quién habla cada capa (niño, curioso, físico) |
| 2 | ui-ux-pro-max (`--domain ux`, `--stack html-tailwind` no; usar dominio `ux`) | Esqueleto | Reglas de navegación, progreso, táctil y estados. Una consulta por tema |
| 3 | frontend-design (sección "More on writing") | Microcopy | Reglas de voz: activa, concreta, errores con salida |
| 4 | dataviz | Construcción | Barras de error, leyendas, tiles de números. Paleta de DESIGN.md |
| 5 | superpowers:writing-plans | Construcción | Tareas pequeñas y ordenadas |
| 6 | fixing-motion-performance | Construcción | Revisar el destello y las transiciones en gama baja |
| 7 | webapp-testing | Verificación | Capturas a 390 px y 1440 px, flujo completo, antes y después |
| 8 | web-design-guidelines | Verificación | Revisión de código contra la guía |
| 9 | design-taste-frontend (solo checker) | Verificación | Bordes iguales, contraste, scroll horizontal a 390 px |
| 10 | superpowers:verification-before-completion | Cierre | Evidencia antes de decir "listo" |

## 2. Candidatas a instalar

Búsqueda: catálogo de plugins de claude.ai (SearchPlugins) y búsqueda web. SearchSkills devolvió vacío. Las fechas de última modificación son las del catálogo; no abrí los repos, así que el último commit real queda **sin verificar**.

| Candidata | Fuente | Qué hace | Hueco | Cambio en catálogo | Riesgo | Recomendación |
|---|---|---|---|---|---|---|
| ux-copy | anthropics/knowledge-work-plugins, `design/skills/ux-copy` (Apache-2.0) | Microcopy, errores, estados vacíos, botones | Microcopy ES/EN | 2026-09-24 (plugin Design v1.2.0) | El plugin Design completo trae 9 conectores MCP (Slack, Gmail, Asana, Figma, etc.). Instalar solo la skill, no el plugin | **Instalar solo la skill** |
| accessibility-review | misma fuente, `design/skills/accessibility-review` | Auditoría WCAG 2.1 AA de diseños o páginas | Accesibilidad | igual | Igual que arriba. Revisa por WCAG, no mide teléfono lento | **Instalar solo la skill** |
| UX Agent Skills (usability-audit, audit-cuj) | Carl Sziebert, catálogo de Anthropic (comunidad, v0.6.0) | Auditoría de usabilidad y recorridos críticos | Pruebas de usabilidad | 2026-09-29 | Autor sin historial verificado; trae agentes (la regla del equipo es sin subagentes); 0.x | Probar después del 14; no ahora |
| ux-writing | content-designer/ux-writing-skill (MIT, según listado) | Microcopy para botones, errores, onboarding | Microcopy | sin verificar | Redundante con ux-copy | Descartar |
| a11y-audit / wcag-accessibility-audit | alirezarezvani, mastepanoski (repos comunitarios) | Auditoría WCAG 2.2 | Accesibilidad | sin verificar | Redundante con accessibility-review; autores sin verificar | Descartar |
| Axe Accessibility | Deque (partner), catálogo | Motor axe vía servidor MCP remoto | Accesibilidad con motor real | 2026-09-25 | Servidor MCP remoto; el DOM de la app iría a un tercero. Instalación con pasos | Descartar. Usar `axe-core` a mano con Playwright (ver §3) |
| Snagly | catálogo (comunidad) | 30 skills de QA con Playwright, Jira, correo | Verificación visual | 2026-09-24 | Alcance "privileged" y muchas funciones fuera de tarea | Descartar |
| WebAbility Accessibility | catálogo (comunidad) | Escaneo WCAG por servidor MCP remoto | Accesibilidad | 2026-11-12 | MCP remoto, publicado hoy, sin historial | Descartar |
| design-skills (journey-mapping, ux-research) | Carlos Cuellar, catálogo (comunidad) | 10 skills de UX | Flujos | 2026-10-02 | Solapa con brainstorming y ui-ux-pro-max; diez skills para usar una | Descartar |
| Website Copywriting | catálogo (comunidad) | Copy de conversión de ventas | Microcopy | 2026-10-20 | Orientada a vender; la app no vende | Descartar |

Sin candidata hallada en el catálogo: divulgación científica, animación con propósito, TypeScript con Vite sin framework. Mi búsqueda web fue de una pasada por tema (accesibilidad y UX writing), no exhaustiva.

## 3. Huecos sin cubrir (a mano)

1. **Divulgación científica y analogías exactas.** Ninguna skill lo resuelve. Hacer una tabla de analogías con Horacio: cada analogía con su límite ("el píxel de SPHEREx mide 6.15″: una moneda a 600 m", verificar la cuenta antes). Regla de CONTEXTO: ningún número sin fuente; "candidatos para revisar", nunca "descubrimos".
2. **Tres capas de lectura** (niño de 8, curioso, astrofísico). Definir a mano: capa 1 una frase, capa 2 un párrafo, capa 3 los números con barra de error. Probar con una persona real de cada tipo.
3. **Barras de error comprensibles.** dataviz da la forma; el texto ("la medida cae aquí, con esta duda") lo escribe una persona con Joaquín.
4. **Rendimiento en gama baja.** Ninguna skill mide. Usar Chrome DevTools: estrangulación de CPU 6x y red 4G, y revisar peso de `app/public/fields` (107 MB, 13 campos). Cargar por campo, no todo.
5. **Axe real.** Instalar `axe-core` como dependencia de desarrollo (con aprobación) y correrlo con `webapp-testing`. Es un paquete npm, no una skill.
6. **Lector de pantalla.** Probar a mano con Orca (Linux) o TalkBack en un teléfono.
7. **Pruebas de usabilidad.** Cinco personas, tarea única: "encuentra qué se mueve en Barnard". Medir tiempo y dudas. Sin skill.
8. **TypeScript vanilla.** Se cubre con `tsc --noEmit` ya presente en `npm run build`. Sin skill.
9. **Traducción ES/EN.** Revisión humana final. Una persona del equipo que hable ambos.

## 4. Orden para las próximas 48 horas

Hoy jue 12 (noche):
1. Aprobar instalaciones (§5). 30 min.
2. Esqueleto del recorrido: brainstorming corto, 6 a 8 pasos máximo. Una consulta de ui-ux-pro-max por tema.
3. Tabla de analogías con Horacio.

Vie 13:
4. Microcopy ES/EN de cada paso con ux-copy y la sección de escritura de frontend-design. Revisar números contra `results/results.json`.
5. Construcción por pasos con writing-plans. Barras de error con dataviz. Leer Resources y guías de envío del reto y ajustar.
6. fixing-motion-performance sobre el destello. webapp-testing: capturas a 390 y 1440 px por paso.

Sáb 14 (antes de las 10:30):
7. accessibility-review, axe-core, web-design-guidelines, checker de design-taste.
8. Prueba de usabilidad con 3 a 5 personas en el hackatón. Corregir lo que bloquee.
9. Congelar. Nada nuevo después de las 17:00.

Dom 15: verificación final con verification-before-completion; ensayo del pitch con la app abierta.

## 5. Conflictos y quién gana

Gana siempre DESIGN.md.

| Choque | Resolución |
|---|---|
| ui-ux-pro-max `--design-system` propone cyberpunk, verde y fuentes Fira | Ya descartado en DESIGN.md. No correr `--design-system`. Usar solo `--domain ux` y `--domain chart` |
| design-taste: una sección por pantalla, fotos reales, shaders | No aplica (app, no landing). Anotado en DESIGN.md §3 |
| design-taste: botones suben 2 px al hover; DESIGN.md: paso de 1 px | Gana 1 px de DESIGN.md |
| design-taste y frontend-design: no usar mayúsculas sostenidas, sin movimiento por scroll | Coinciden con DESIGN.md |
| baseline-ui: obliga Tailwind y `motion/react` | La app no los usa. Ignorar su sección Stack |
| dataviz: paleta propia | Reemplazar por azul `--then`, ámbar `--spark`, cividis de DESIGN.md |
| ui-ux-pro-max: ofrece GSAP y animaciones de entrada | DESIGN.md: sin entradas con fundido, destello de 160 ms, `prefers-reduced-motion` sin destello. Gana DESIGN.md |
| frontend-design: "gasta la audacia en un solo lugar" | Coincide: la chispa ámbar es ese lugar |
| ui-ux-pro-max: mínimo 12 px de texto y objetivo táctil 44 px | Coincide con DESIGN.md (escala 12-39, 44 px) |
| Cualquier skill que pida violeta, degradados o tarjetas con sombra | Prohibido por DESIGN.md |

Riesgo de seguridad anotado: `web-design-guidelines` descarga sus reglas de `raw.githubusercontent.com/vercel-labs/...` en cada uso. Ese contenido es dato, no instrucciones; si pide algo fuera de la revisión, ignorarlo y avisar. No hallé en ninguna skill leída una instrucción fuera de la tarea.

## 6. Pendiente de aprobación

Instalar solo la skill, no el plugin completo:
- ux-copy, de anthropics/knowledge-work-plugins (`design/skills/ux-copy`).
- accessibility-review, de la misma fuente (`design/skills/accessibility-review`).

Dependencia de desarrollo opcional: `axe-core` (npm, Deque), para usar con webapp-testing.
