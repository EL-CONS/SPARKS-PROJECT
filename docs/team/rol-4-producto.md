# Rol 4 · Producto, diseño y pitch

## 1. Qué te toca
Eres dueño de **lo que ve el jurado**: la app, su despliegue, el pitch, el video y la página del equipo.
Tu trabajo es que la ciencia de los roles 2 y 3 se entienda en 3 minutos sin decir una sola palabra de jerga.
También eres dueño del **plan de respaldo**: si falla el Wi-Fi, la demo sigue.
Narras el pitch (o coordinas a quien lo narre) y diriges los ensayos.
Tu frase para el jurado: "las imágenes científicas no se retocan; cada color tiene su leyenda".

## 2. Conceptos que debes dominar
| Concepto | Lecturas |
|---|---|
| Sistema visual de Sparks | `DESIGN.md` (manda sobre cualquier skill o gusto) |
| Accesibilidad | WCAG 2.2 quick reference https://www.w3.org/WAI/WCAG22/quickref/ · Web Interface Guidelines https://github.com/vercel-labs/web-interface-guidelines · `docs/design-audit.md` |
| Visualización honesta y mapas de color | Crameri, Shephard & Heron 2020, "The misuse of colour in science communication" https://www.nature.com/articles/s41467-020-19160-7 · Nuñez et al. 2018, cividis https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0199239 |
| UX de herramientas científicas | ✔ SPHEREx Data Explorer de IRSA https://irsa.ipac.caltech.edu/applications/spherex · Aladin Lite https://aladin.cds.unistra.fr/AladinLite/doc/API |
| Frontend y pruebas | Vite https://vite.dev/guide/ · Playwright Python https://playwright.dev/python/ |
| Despliegue | GitHub Pages https://docs.github.com/pages · FastAPI deployment https://fastapi.tiangolo.com/deployment/ |
| Reglas de Space Apps (video ≤ 30 s, envío, jueceo) | ✔ Judging & Awards Guide 2025 https://web.archive.org/web/20251013144403/https://www.spaceappschallenge.org/resources/judging-awards-guide/ · ✔ Project Submission Guide 2025 https://web.archive.org/web/20251013154045/https://www.spaceappschallenge.org/resources/project-submission-guide/ |
| Storytelling | `docs/pitch/pitch-3min-es.md` (estructura de viaje del héroe) · `research/planetx/07-skills-y-recursos.md` |

## 3. Archivos del repo a leer, en orden
1. `DESIGN.md`: colores, tipografía, reglas para imágenes científicas.
2. `app/src/main.ts`: estado ⇄ URL, botones, diálogos (Share, Embed, QR), teclado.
3. `app/src/stage.ts`: el flipbook (dos pasadas para la escala asinh compartida), marcas SVG, tocar un panel para ampliarlo.
4. `app/src/card.ts` y `app/src/panes.ts`: tarjeta y pestañas; la columna "ML (experimental)".
5. `app/src/i18n.ts`: textos EN/ES.
6. `tests/e2e/run_e2e.py`, `tests/e2e/shots.py`, `tests/e2e/record_demo.py`: pruebas, capturas y video de respaldo.
7. `docs/pitch/` completo, empezando por `fuentes.md`.
8. `.github/workflows/pages.yml`, `app/vercel.json`, `api/Dockerfile`.

## 4. Ejercicios de replicación
1. **Recorrido (30 min).** Haz el recorrido de `00-onboarding.md` §4 en tu teléfono (levanta la app con `cd app && npm run dev -- --host` y usa el QR).
2. **Un cambio de texto (30 min).** Cambia una etiqueta en `i18n.ts` (EN y ES), corre `make build && make e2e`.
3. **Una prueba nueva (1 h).** Agrega a `run_e2e.py` una comprobación: con `?field=epsindib&mode=frames&flags=1` se ve la capa de banderas.
4. **Despliegue de prueba (1 h).** En un fork o repo de prueba del equipo, activa GitHub Pages con `pages.yml` y abre la URL en un teléfono.
5. **Rehacer desde cero (2–3 h): el parpadeo.** En `notebooks/rol4_flipbook_desde_cero.ipynb`: lee `coadds.bin` de Barnard con el `manifest.json`, arma la resta B−A con escala asinh y una leyenda, y anima el parpadeo (matplotlib). Compárala con la vista "Subtract B−A" de la app: misma escala, mismo sentido de colores.

## 5. Preguntas del jurado sobre tu parte
- **¿Quién la usaría?**
  - *Corta:* voluntarios de ciencia ciudadana, clubes, escuelas, y astrónomos que quieren un primer vistazo antes de bajar datos.
- **¿Funciona sin internet?**
  - *Corta:* sí para los objetivos precalculados (build estática); las posiciones nuevas necesitan la API.
- **¿Qué tan rápido es una posición nueva?**
  - *Corta:* uno o dos minutos en frío (M101: 59 s medidos); en caché, menos de un segundo. Los objetivos del reto abren al instante.
- **¿Por qué esos colores?**
  - *Corta:* azul = antes, ámbar = ahora; la escala de la resta es la misma en todos los paneles y tiene leyenda. No retocamos las imágenes.
- **¿Es accesible?**
  - *Corta:* contraste AA medido, teclado completo, movimiento reducido, funciona a 390 px.

## 6. Antes del 14 y durante el hackatón
**Antes del 14:**
- [ ] Desplegar (GitHub Pages o Vercel) y probar la URL en 3 teléfonos distintos.
- [ ] Ensayar el pitch de 3 min con cronómetro, 5 veces; grabar uno y verlo en equipo.
- [ ] Preparar Canva con `docs/pitch/slides-outline.md`; revisar créditos de las placas de 1930.
- [ ] Ver `docs/pitch/demo-backup.webm`; tenerlo en el escritorio y en un USB.
- [ ] Revisar con el equipo la frase "nos quedamos callados" (`fuentes.md`): que sea verdad para los cuatro.

**Durante el hackatón:** video de 30 s, página del equipo, envío, ensayos. En la presentación: narras (o coordinas) y respondes preguntas de producto.

## 7. Hoja de ruta de mejoras
1. **Despliegue público con API** (bajo–medio): el modo en vivo en la demo.
2. **Galería ampliada** con las estrellas de la prueba final bien medidas (bajo).
3. **Modo "clase"**: recorrido guiado para escuelas (medio).
4. **Comparar con imágenes de WISE** lado a lado (medio).
5. **Notificaciones de lote nuevo** en la app (bajo).
