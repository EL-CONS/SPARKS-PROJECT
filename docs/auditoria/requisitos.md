# Auditoría de requisitos de Sparks

Sábado 14 de noviembre de 2026, 19:40–21:00 (Hermosillo). Rama auditada: `joako-requisitos`, que parte de `origin/frontend-del-cons` (`f5b2e9e`) con `data-new/` de `Horacio` y `data-sample/` y `ml-clasificador/` de `joako`. Fuentes de lo que "pide el reto": `docs/reto/reto.md`, `recursos.md` y `normas.md`.

**Cómo se verificó.** `npm ci`, `npm run typecheck`, `npm test` (22 pruebas), `npm run check-data`, `npm run build` y `npm run preview` corridos en esta máquina. La app se abrió en el navegador integrado de la sesión a 1440 px, 768 px y 390 px, en tema oscuro y claro, en español e inglés, con ratón y con teclado. Capturas en `docs/auditoria/capturas/`.

**Lo que no se pudo verificar**, dicho de una vez:
- El navegador de la sesión corre en segundo plano y atrasa las animaciones; varias capturas salieron a media transición y se repitieron. `prefers-reduced-motion` no se pudo emular: se comprobó que las reglas CSS existen (4 bloques), no que se vean bien.
- El contraste de color no se midió con una herramienta; se revisó a ojo y por los colores declarados.
- No se probó con lector de pantalla ni en un teléfono real.
- Solo el campo de Barnard tiene fotos en la app, así que suma, resta, campo de visión, catálogos y espectro se vieron funcionar **solo en Barnard**.

## Lo más importante

1. **Cuatro de los cinco objetivos no muestran fotos**, aunque sus datos ya existen en `data-new/`. La app solo lee `data-sample/`. Es trabajo de Cons y a las 20:55 no estaba en `origin/cons`.
2. **La app no está publicada.** El build ya sale completo, con datos, y está probado; falta que alguien lo suba.
3. **Los textos de entrega (`docs/pitch/`) están desfasados**: citan corridas del 5 de noviembre, cifras que ya no coinciden con los datos nuevos y funciones que la app no tiene.
4. **Procedencia**: lo único que la app muestra hoy (Barnard) se generó el 5 de noviembre. Decisión de Joaquín (`procedencia.md`).

## A. Requisitos del reto

| | Estado | Evidencia | Qué falta |
|---|---|---|---|
| **A1** Herramienta web pública que muestra SPHEREx y deja ver cambios | **Parcial** | Funciona en local (capturas 01 y 02). No hay URL pública | Publicarla (C1) |
| **A2** Coordenadas RA/Dec, serie de imágenes como video; grados y HMS | **Cumple** | Probado en el navegador: `08h55m10.831s -7d14m42.53s` apunta a WISE 0855; `17:57:48.5 +04:41:36` y `269.4486 4.7672` a Barnard; `400 10` y `hola` dan error claro. Parpadeo a 1, 2 y 3 cambios por segundo (`app/src/core/player.ts`, `app/tests/coords.test.ts`) | — |
| **A3** Probada con los cinco objetivos | **Parcial** | Barnard abre con 18 imágenes (3 temporadas × 6 detectores). WISE 0855, ε Indi B, RW Aurigae y R Draconis abren con el estado "Sus imágenes llegan pronto" (captura 09). `data-new/` tiene los cuatro (`npm run check-data` pasa), pero `useSparks.ts`, `loader.ts` y `sky.ts` solo leen `data-sample/`, y `App.tsx` marca "con fotos" solo a Barnard por nombre | **Pendiente de Cons**: cargador de dos carpetas y estados `parcial` (R Draconis y RW Aurigae vienen como `parcial` en `data-new/index.json`). Cuando llegue, el texto "sus fotos no vienen en este paquete" deja de ser cierto |

## B. Consideraciones opcionales

| | Estado | Evidencia | Qué falta |
|---|---|---|---|
| **B1** Fácil de actualizar | **Parcial** | Formato en `data-sample/README.md`; proceso para sumar un campo en `README.md`; `check-data` valida los dos paquetes. La canalización y su método están en la rama `Horacio` | Unir `pipeline/` a la rama de entrega; que la app lea `data-new/` |
| **B2** Las 102 bandas: suma por detector y espectro | **Cumple** (en Barnard) | Suma por detector pesada por ruido, con la ganancia medida (×4.1 a ×4.8, captura 04). **Espectro al vuelo, implementado en esta auditoría**: un clic mide ese punto en las 355 fotos sueltas (captura 03: 250 medidas, forma de espectro estelar continuo entre detectores). `app/src/core/spectrum.ts`, 5 pruebas | Medida rápida sin calibrar, y lo dice en pantalla. La longitud de onda es la del centro del campo |
| **B3** Sumar o restar épocas | **Cumple** | Modos Suma y Resta vistos; la resta deja elegir el par de temporadas (captura 02) | — |
| **B4** Campo de visión elegible | **Cumple, con límite** | **Implementado**: 6.56′, 3.28′ y 1.64′, guardado en `?fov=`; las marcas siguen el recorte (captura 02). `app/src/core/fov.ts`, 4 pruebas | No hay campos mayores que el recorte de 6.56′: piden bajar más datos. La app lo dice |
| **B5** Superponer Gaia y WISE | **Cumple** | Gaia DR3 ya estaba; **se añadió CatWISE2020**. Se dibujan las 40 más brillantes de cada catálogo dentro del campo visible, con leyenda (captura 02) | En `data-new/` los catálogos traen 0 o 1 fuente de Gaia y nada de CatWISE: revisar con Horacio |
| **B6** Coordenadas en la URL | **Cumple** | `?ra=&dec=&fov=&mode=&det=&lang=` más `?theme=`; un enlace con coordenadas abre directo en la herramienta. **Corregido**: unas coordenadas que no caen en ningún campo abrían el campo más cercano sin avisar; ahora lo dicen (captura 08) | — |
| **B7** Metadatos y banderas | **Cumple** | Paso "¿Qué pasó?": porcentaje de píxeles marcados por tipo de bandera, por detector y temporada; lanzamientos con DOI; tabla "Todas las cifras, con su fuente" (captura 04) | No hay capa de banderas píxel a píxel sobre la foto |
| **B8** Astropy y Aladin | **Parcial** | Astropy 8.0.2 en `pipeline/requirements.txt` (rama `Horacio`). **Aladin no se usa en ninguna rama.** El pie de página decía "Herramientas: Astropy, Aladin Lite (CDS)": se quitó Aladin | Si se quiere Aladin, hay que integrarlo; si no, no mencionarlo en el pitch |

## C. Entregables del domingo

| | Estado | Evidencia | Qué falta |
|---|---|---|---|
| **C1** App desplegada | **Parcial** | `npm ci`, `npm run build` y `npm run preview` probados. **Corregido**: el build no incluía los datos (un sitio publicado habría salido vacío) y `npm test` no corría (faltaba `vitest`). Con `VITE_BASE=/SPARKS-PROJECT/` se sirvieron bien la página, `data-sample/` y `data-new/` (HTTP 200). `dist/` pesa 21 MB | **Publicar**: necesita la cuenta y el visto bueno de Joaquín o Cons. Gratis: GitHub Pages (base `/SPARKS-PROJECT/`, repositorio público), Netlify o Cloudflare Pages (base `/`) |
| **C2** Repositorio documentado | **Cumple** en esta rama | `README.md` nuevo: cómo correrlo, carpetas, origen de los datos, cómo publicar y cómo sumar un campo | Llevarlo a `main`, que hoy no tiene `app/` |
| **C3** Página del equipo, video, presentación, pitch | **Parcial** (solo se verificó) | En la rama `joako`: `docs/pitch/team-page-en.md`, `video-30s-en.md` (guion), `slides-outline.md`, `pitch-3min-es.md`, `pitch-5min-es.md` | De Carlos: no hay video grabado ni diapositivas; la página del equipo y el guion citan cifras y funciones viejas (ver `lista-para-enviar.md`) |

## D. Requisitos propios

| | Estado | Evidencia | Qué falta |
|---|---|---|---|
| **D1** Honestidad científica | **Parcial** | No aparece "descubrimos" en ningún texto; el pie dice "candidatos a revisar, nunca descubrimientos". Las cifras de movimiento, ruido, banderas y fechas salen del manifiesto. Barnard dice que no se pudo medir su color (354 de 355 fotos saturadas). **Corregido**: leyendas que daban por hecho "3 temporadas" y "la estrella satura" para cualquier campo; mención a Aladin | Las notas de cada objetivo en `app/src/i18n/ui.ts` llevan cifras escritas a mano y sin fuente al lado (1.8 pársecs, 250 K, 246 días, 150 pársecs). "Con fotos" depende del nombre `barnard`, no de los datos |
| **D2** Imágenes sin retocar; leyendas con unidades | **Cumple** | Los píxeles no llevan `filter` (comprobado en el navegador: `filter: none`, `image-rendering: pixelated`). La resta tenía leyenda en σ. **Añadido**: leyenda de gris con MJy/sr y los límites de cada detector | Que el PNG del parpadeo usa esos mismos límites lo afirma `data-sample/README.md`; no se comprobó contra el código de la canalización 0.3.0, que no está en el repositorio |
| **D3** Accesibilidad | **Parcial** | Visto: enlace "saltar al cielo", foco visible (contorno ámbar de 2 px), los pasos ocultos quedan `inert`, ninguna imagen sin `alt`, cada panel con texto alternativo, ningún botón sin nombre, aviso de destellos antes de reproducir, tope de 3 cambios por segundo, el reproductor queda fijo abajo en teléfono. El espectro se puede manejar sin ratón (botones para medir y mover el punto) | Sin medir: contraste con herramienta, lector de pantalla, `prefers-reduced-motion` en vivo. Las casillas de catálogo miden 20 px (su etiqueta, 44 px) |
| **D4** Dos temas | **Cumple** | El interruptor cambia sin recargar, guarda `sparks-theme` y al recargar se mantiene; `index.html` fija el tema antes de pintar. El escenario del cielo sigue oscuro en tema claro (capturas 05 y 07) | — |
| **D5** Responsive | **Cumple** | Sin scroll horizontal a 390, 768 y 1440 px. **Corregido**: el aviso "Más abajo" tapaba el reproductor en teléfono | Las flechas laterales quedan encima de las fotos en teléfono |
| **D6** Español e inglés | **Cumple** | **Corregido**: 25 textos fijos de `App.tsx` pasaron a `app/src/i18n/shell.ts` | El título de la pestaña sigue escrito dentro de `useSparks.ts` (en los dos idiomas) |
| **D7** Clasificador en la interfaz | **No cumple** | `ml-clasificador/` está en la rama (91.7 %, 33 de 36, dejando uno fuera, según `ml-clasificador/README.md` y `resultados.json`), pero ningún componente lo usa. `cons` tiene otro modelo (movimiento), no este | **Pendiente de Cons** |
| **D8** Rendimiento | **Cumple** | JavaScript 251 kB (83 kB comprimido), CSS 37 kB. Los datos se piden por campo; la carga dice "N de 18"; las fotos sueltas (2.9 MB) solo se bajan si alguien pide un espectro | Las fuentes vienen de Google Fonts (necesitan red) |

## E. Normas del evento

| | Estado | Evidencia | Qué falta |
|---|---|---|---|
| **E1** Declaración de uso de SI | **Borrador escrito** | `docs/entrega/uso-de-si.md`, con versión en inglés. 47 de 90 commits llevan `Co-Authored-By: Claude`, todos de la cuenta de Joaquín | Que Cons, Horacio y Carlos digan si usaron SI y para qué |
| **E2** Menores de 18 | **Sin hallazgos; una duda** | En ninguna rama hay fotos de personas, audio ni video: solo el logo, tableros de marca y capturas de la app (revisados por nombre; se abrieron `mockups.png` y `pitch.png`). La app no muestra personas | **Duda**: las edades de los integrantes no constan. Aplica al video y a la página del equipo cuando se hagan |
| **E3** Entrega por el sitio oficial | **Preparado en parte** | `docs/entrega/lista-para-enviar.md` | URL pública, descripción corregida, video. Leer la Project Submission Guide |
| **E4** No empezar antes | **Inventario entregado** | `docs/auditoria/procedencia.md` | **Decisión de Joaquín** |
| **E5** Equipo | **Sin confirmar** | `CONTEXTO.md` lista a Gabriel, Carlos, Joaquín y Horacio; Git tiene cuatro cuentas (Joaco2025, EL-CONS, NeruX, ComputerChemistry). Cuatro personas caben en el máximo de seis. `team-page-en.md` no lista integrantes. `branding/.../pitch.png` dice "Universidad de Sonora" y `CONTEXTO.md` dice sede UTH | Joaquín: cuántos son, quiénes, y si Cons y Gabriel son la misma persona |

## Lo que falta, por prioridad

| # | Qué | Quién | Minutos |
|---|---|---|---|
| 1 | Cargador que lea `data-new/` y estados `parcial` (A3, B1) | Cons | 60–90 |
| 2 | Unir ramas en una de entrega y publicar la app (A1, C1) | Joaquín y Cons | 30–45 |
| 3 | Decidir procedencia de Barnard (E4) | Joaquín; si se regenera, Horacio | 5 para decidir; la corrida, lo que tarde la canalización |
| 4 | Corregir página del equipo y guion; grabar video; diapositivas (C3, E3) | Carlos | 90–120 |
| 5 | Completar la declaración de SI (E1) y confirmar equipo y edades (E2, E5) | Todos | 10 |
| 6 | Clasificador en la interfaz con sus límites (D7) | Cons | 45–60 |
| 7 | Fuente al lado de las cifras de las notas de objetivos (D1) | Horacio da las fuentes | 20 |
| 8 | Medir contraste y probar con movimiento reducido en un navegador normal (D3) | Quien tenga 15 minutos | 15 |

## Para Cons, al unir esta rama con la suya

- `app/vite.config.ts` cambió: ahora sirve y copia `data-sample/` y `data-new/`. Sustituye a su versión con `configurePreviewServer`.
- `app/src/ui/kit/useSparks.ts`: se añadieron el estado `none`, `catwise`, `shell` y `setFov`; chocará en pocas líneas con sus cambios de mensajes de error.
- `app/src/ui/sky.ts` tiene dos lectores nuevos con la ruta `data-sample/` fija: `loadCatalogs` y `loadFrames`. El cargador de dos carpetas tiene que cubrirlos.
- Las fotos sueltas de `data-new/` usan la misma codificación int16 que Barnard (`frames_encoding` del manifiesto), así que el espectro debería servir sin cambios; no se pudo probar.
