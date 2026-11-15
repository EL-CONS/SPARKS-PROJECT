# Auditoría de requisitos de Sparks

Sábado 14 de noviembre de 2026, 19:40–21:00 (Hermosillo). Rama auditada: `joako-requisitos`, que parte de `origin/frontend-del-cons` (`f5b2e9e`) con `data-new/` de `Horacio` y `data-sample/` y `ml-clasificador/` de `joako`. Fuentes de lo que "pide el reto": `docs/reto/reto.md`, `recursos.md` y `normas.md`.

**Cómo se verificó.** `npm ci`, `npm run typecheck`, `npm test` (22 pruebas), `npm run check-data`, `npm run build` y `npm run preview` corridos en esta máquina. La app se abrió en el navegador integrado de la sesión a 1440 px, 768 px y 390 px, en tema oscuro y claro, en español e inglés, con ratón y con teclado. Capturas en `docs/auditoria/capturas/`. (Nota del 14 de noviembre, 23:10: el tema claro ya no existe en `joako-integracion`; ver D4.)

**Actualización del 14 de noviembre, 23:16, rama `joako-integracion`.** Se unieron `origin/frontend-del-cons` (`cbef27d`) y esta rama (`dff3c68`). Cambiaron A3, B5, C1, D1, D4, D7 y E1; cada fila dice qué y con qué evidencia. Revisión en el navegador de los cinco objetivos: `docs/qa/navegador-cinco-objetivos.md`. Estado de la integración: `docs/integracion/estado.md`.

**Lo que no se pudo verificar**, dicho de una vez:
- El navegador de la sesión corre en segundo plano y atrasa las animaciones; varias capturas salieron a media transición y se repitieron. `prefers-reduced-motion` no se pudo emular: se comprobó que las reglas CSS existen (4 bloques), no que se vean bien.
- El contraste de color no se midió con una herramienta; se revisó a ojo y por los colores declarados.
- No se probó con lector de pantalla ni en un teléfono real.
- (19:40–21:00) Solo el campo de Barnard tenía fotos en la app, así que suma, resta, campo de visión, catálogos y espectro se vieron funcionar **solo en Barnard**. Desde las 23:10 se vieron en los cinco (A3).

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
| **A3** Probada con los cinco objetivos | **Cumple** (23:10) | Cargador de dos carpetas de Cons (`b59f7e1`) unido en `dff3c68`; "con fotos" sale del índice (`tieneFotos`, `app/src/data/loader.ts`). Los cinco vistos a 1440 y 390 px con parpadeo, suma, resta, campo de visión, capas y espectro; R Draconis y RW Aurigae explican su estado `parcial`. Se arreglaron tres fallos vistos ahí: R Draconis tumbaba la app al medir el espectro, RW Aurigae daba su cota superior como movimiento (`93f88fc`), y ε Indi B solo ofrecía 3 de sus 6 pares de resta (`5261b36`). Evidencia: `docs/qa/navegador-cinco-objetivos.md` y `docs/qa/capturas/` (10 capturas) | Teclado y lector de pantalla solo se vieron en Barnard (19:40) |

## B. Consideraciones opcionales

| | Estado | Evidencia | Qué falta |
|---|---|---|---|
| **B1** Fácil de actualizar | **Parcial** | Formato en `data-sample/README.md`; proceso para sumar un campo en `README.md`; `check-data` valida los dos paquetes. La canalización y su método están en la rama `Horacio` | Unir `pipeline/` a la rama de entrega; que la app lea `data-new/` |
| **B2** Las 102 bandas: suma por detector y espectro | **Cumple** (en Barnard) | Suma por detector pesada por ruido, con la ganancia medida (×4.1 a ×4.8, captura 04). **Espectro al vuelo, implementado en esta auditoría**: un clic mide ese punto en las 355 fotos sueltas (captura 03: 250 medidas, forma de espectro estelar continuo entre detectores). `app/src/core/spectrum.ts`, 5 pruebas | Medida rápida sin calibrar, y lo dice en pantalla. La longitud de onda es la del centro del campo |
| **B3** Sumar o restar épocas | **Cumple** | Modos Suma y Resta vistos; la resta deja elegir el par de temporadas (captura 02) | — |
| **B4** Campo de visión elegible | **Cumple, con límite** | **Implementado**: 6.56′, 3.28′ y 1.64′, guardado en `?fov=`; las marcas siguen el recorte (captura 02). `app/src/core/fov.ts`, 4 pruebas | No hay campos mayores que el recorte de 6.56′: piden bajar más datos. La app lo dice |
| **B5** Superponer Gaia y WISE | **Cumple en Barnard** | Gaia DR3 ya estaba; **se añadió CatWISE2020**. Se dibujan las 40 más brillantes de cada catálogo dentro del campo visible, con leyenda (captura 02). En los cuatro campos de `data-new/` las dos casillas salen deshabilitadas con "(0)", sin error (23:10, `docs/qa/navegador-cinco-objetivos.md`) | Que `data-new/` traiga catálogos: Horacio |
| **B6** Coordenadas en la URL | **Cumple** | `?ra=&dec=&fov=&mode=&det=&lang=` (`?theme=` se retiró con el tema claro); un enlace con coordenadas abre directo en la herramienta. **Corregido**: unas coordenadas que no caen en ningún campo abrían el campo más cercano sin avisar; ahora lo dicen (captura 08) | — |
| **B7** Metadatos y banderas | **Cumple** | Paso "¿Qué pasó?": porcentaje de píxeles marcados por tipo de bandera, por detector y temporada; lanzamientos con DOI; tabla "Todas las cifras, con su fuente" (captura 04) | No hay capa de banderas píxel a píxel sobre la foto |
| **B8** Astropy y Aladin | **Parcial** | Astropy 8.0.2 en `pipeline/requirements.txt` (rama `Horacio`). **Aladin no se usa en ninguna rama.** El pie de página decía "Herramientas: Astropy, Aladin Lite (CDS)": se quitó Aladin | Si se quiere Aladin, hay que integrarlo; si no, no mencionarlo en el pitch |

## C. Entregables del domingo

| | Estado | Evidencia | Qué falta |
|---|---|---|---|
| **C1** App desplegada | **Parcial** | En `joako-integracion` (23:14): `npm ci` en limpio pasa (el lock de Cons no estaba sincronizado). `dist/` trae `data-sample/` y `data-new/`. Con `VITE_BASE=/SPARKS-PROJECT/`, tanto `preview` como un servidor estático simple sobre `dist/` responden 200 en la página, los dos `index.json` y los `frames.bin`, y la app carga WISE 0855 entero (`docs/backend/curl-preview.txt`, `docs/backend/publicacion.md`). `dist/` pesa 21 MB | **Desplegar en AWS**: Cons, con `docs/backend/despliegue-aws.md` |
| **C2** Repositorio documentado | **Cumple** en esta rama | `README.md` nuevo: cómo correrlo, carpetas, origen de los datos, cómo publicar y cómo sumar un campo | Llevarlo a `main`, que hoy no tiene `app/` |
| **C3** Página del equipo, video, presentación, pitch | **Parcial** (solo se verificó) | En la rama `joako`: `docs/pitch/team-page-en.md`, `video-30s-en.md` (guion), `slides-outline.md`, `pitch-3min-es.md`, `pitch-5min-es.md` | De Carlos: no hay video grabado ni diapositivas; la página del equipo y el guion citan cifras y funciones viejas (ver `lista-para-enviar.md`) |

## D. Requisitos propios

| | Estado | Evidencia | Qué falta |
|---|---|---|---|
| **D1** Honestidad científica | **Parcial** | No aparece "descubrimos" en ningún texto; el pie dice "candidatos a revisar, nunca descubrimientos". Las cifras de movimiento, ruido, banderas y fechas salen del manifiesto. Barnard dice que no se pudo medir su color (354 de 355 fotos saturadas). **Corregido**: leyendas que daban por hecho "3 temporadas" y "la estrella satura" para cualquier campo; mención a Aladin | Las notas de cada objetivo en `app/src/i18n/ui.ts` llevan cifras escritas a mano y sin fuente al lado (1.8 pársecs, 250 K, 246 días, 150 pársecs). ("Con fotos" ya sale del índice: `dff3c68`. RW Aurigae ya no da su cota superior como movimiento: `93f88fc`) |
| **D2** Imágenes sin retocar; leyendas con unidades | **Cumple** | Los píxeles no llevan `filter` (comprobado en el navegador: `filter: none`, `image-rendering: pixelated`). La resta tenía leyenda en σ. **Añadido**: leyenda de gris con MJy/sr y los límites de cada detector | Que el PNG del parpadeo usa esos mismos límites lo afirma `data-sample/README.md`; no se comprobó contra el código de la canalización 0.3.0, que no está en el repositorio |
| **D3** Accesibilidad | **Parcial** | Visto: enlace "saltar al cielo", foco visible (contorno ámbar de 2 px), los pasos ocultos quedan `inert`, ninguna imagen sin `alt`, cada panel con texto alternativo, ningún botón sin nombre, aviso de destellos antes de reproducir, tope de 3 cambios por segundo, el reproductor queda fijo abajo en teléfono. El espectro se puede manejar sin ratón (botones para medir y mover el punto) | Sin medir: contraste con herramienta, lector de pantalla, `prefers-reduced-motion` en vivo. Las casillas de catálogo miden 20 px (su etiqueta, 44 px) |
| **D4** Dos temas | **Retirado (decisión provisional, 14 nov 23:10)** | Cons quitó el tema claro en `881eb30`; en `joako-integracion` queda solo el oscuro. El reto y las normas no piden temas (no consta). Se corrigieron `DESIGN.md`, `README.md` y la fila B6. Las capturas 05 y 07 muestran el tema claro de `joako-requisitos` y ya no corresponden a la app | Joaquín confirma o pide restaurar |
| **D5** Responsive | **Cumple** | Sin scroll horizontal a 390, 768 y 1440 px. **Corregido**: el aviso "Más abajo" tapaba el reproductor en teléfono | Las flechas laterales quedan encima de las fotos en teléfono |
| **D6** Español e inglés | **Cumple** | **Corregido**: 25 textos fijos de `App.tsx` pasaron a `app/src/i18n/shell.ts` | El título de la pestaña sigue escrito dentro de `useSparks.ts` (en los dos idiomas) |
| **D7** Clasificador en la interfaz | **Cumple** (23:13) | Panel de Cons (`b59f7e1`, `cbef27d`) con la v2 **reentrenada** (`3174434`, Wolf 489 como enana blanca): `app/src/core/modelo.json` y `resultados_v2.json` son copias exactas de `ml-clasificador/` (prueba). El texto se arma con las cifras del archivo: "acierta 78 % en 69 objetos con clase verificada; separa mal las variables" (`74e6f5e`). "Variable" sale de la imagen: `kind` del manifiesto o, si falta, indicio de dipolo de Horacio rotulado como indicio (`587fe9e`). Paridad con scikit-learn en 69 casos. La v1 (inflada) ya no aparece en `app/` (grep vacío). Captura `docs/qa/capturas/1440-rwaur-clasificador-v2.jpg` | Fuga residual de la v2 descrita en `ml-clasificador/README.md` |
| **D8** Rendimiento | **Cumple** | JavaScript 251 kB (83 kB comprimido), CSS 37 kB. Los datos se piden por campo; la carga dice "N de 18"; las fotos sueltas (2.9 MB) solo se bajan si alguien pide un espectro | Las fuentes vienen de Google Fonts (necesitan red) |

## E. Normas del evento

| | Estado | Evidencia | Qué falta |
|---|---|---|---|
| **E1** Declaración de uso de SI | **Dos borradores** | `docs/entrega/uso-de-si.md` de esta rama (Joaquín, con versión en inglés; 47 de 90 commits con `Co-Authored-By: Claude` a las 21:00) y otro de Carlos en `origin/carlos` (`3f77eec`, mismo nombre de archivo) | Fundir en uno (Carlos, partiendo del de esta rama) y que Cons y Horacio digan si usaron SI |
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

## Para Cons, al unir esta rama con la suya (hecho en `joako-integracion`, 22:55)

- `app/vite.config.ts` cambió: ahora sirve y copia `data-sample/` y `data-new/`. Sustituye a su versión con `configurePreviewServer`.
- `app/src/ui/kit/useSparks.ts`: se añadieron el estado `none`, `catwise`, `shell` y `setFov`; chocará en pocas líneas con sus cambios de mensajes de error.
- `app/src/ui/sky.ts` tiene dos lectores nuevos con la ruta `data-sample/` fija: `loadCatalogs` y `loadFrames`. El cargador de dos carpetas tiene que cubrirlos.
- Las fotos sueltas de `data-new/` usan la misma codificación int16 que Barnard (`frames_encoding` del manifiesto). Comprobado a las 23:00: el espectro mide 126 de 153 fotos en WISE 0855.
