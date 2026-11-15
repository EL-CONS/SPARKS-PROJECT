# Estado de la integración (`joako-integracion`)

Rama de trabajo: `joako-integracion` (worktree `sparks-integracion/`, parte de `origin/frontend-del-cons`). Se actualiza después de cada paso. Hora local (MST, Hermosillo).

## Ramas al empezar (sábado 14 de noviembre, 22:52, tras `git fetch --all --prune`)

| Rama | Último commit | Novedad desde las 22:10 |
|---|---|---|
| `origin/main` | `dbdfc97` 14:47 | ninguna |
| `origin/frontend-del-cons` | `cbef27d` 22:49 (Cons) | v2 de `da9bb1c` en la app (texto "75 %" escrito a mano), "variable" por `kind`, `docs/backend/publicacion.md`, `docs/qa/cons-navegador.md` con 4 capturas; se borró `useTheme.ts` |
| `origin/joako` | `da9bb1c` 22:04 | ninguna |
| `origin/Horacio` | `f7878e4` 22:10 | ninguna |
| `origin/carlos` | `3f77eec` 22:29 | `docs/entrega/` con 6 piezas (README-borrador, checklist-qa, diapositivas, página del equipo, uso-de-si, guion del video) |
| `origin/cons` | `abda4fa` 22:04 | ninguna |
| `joako-requisitos` (local) | `de9eea8` 22:04 | ninguna |

Clasificador: el reentrenamiento existe en `joako-integracion` (`3174434`, Wolf 489 como enana blanca): exactitud LOO 0.7826 (54 de 69), `ml-clasificador/resultados_v2.json`.

## Entregables

Fuente: `docs/reto/reto.md` y `docs/reto/normas.md` (rama `joako`) y los planes `docs/sprint-noche-2/*.md`.

| # | Entregable | Origen | Dueño | Estado | Evidencia |
|---|---|---|---|---|---|
| R1 | Herramienta web pública con imágenes SPHEREx | reto, obligatorio | Cons / Joaquín | pendiente de despliegue (AWS, Cons) | — |
| R2 | Entrada de coordenadas AR/Dec | reto, obligatorio | Cons | por verificar en navegador | — |
| R3 | Serie de imágenes como video (parpadeo) | reto, obligatorio | Cons | por verificar en navegador | — |
| R4 | Probada con los cinco objetivos | reto, obligatorio | Joaquín | por verificar (paso D) | — |
| R5 | Suma y resta | reto, opcional | Cons | por verificar | — |
| R6 | Campo de visión elegible | reto, opcional | Joaquín (`joako-requisitos`) | por unir (paso B) | — |
| R7 | Superposición Gaia / WISE (CatWISE) | reto, opcional | Joaquín | por unir (paso B) | — |
| R8 | Espectro al vuelo | reto, opcional | Joaquín | por unir (paso B) | — |
| R9 | Coordenadas en la URL | reto, opcional | Cons | por verificar | — |
| R10 | Metadatos / banderas | reto, opcional | Cons | por verificar | — |
| N1 | Entrega por el sitio oficial | normas | Joaquín | pendiente (domingo) | — |
| N2 | Declaración de uso de SI | normas | Carlos / Joaquín | existe en dos versiones (`joako-requisitos` y `origin/carlos`) | — |
| N3 | Sin fotos, voces ni imagen de menores | normas | Carlos | por revisar | — |
| N4 | Procedencia de material previo al 14 de noviembre | normas, regla 5 | Joaquín decide | pendiente de decisión | `docs/auditoria/procedencia.md` |
| P1 | `npm ci` en limpio | plan Cons | Joaquín (paso B) | falla en `frontend-del-cons` | — |
| P2 | Clasificador v2 en la interfaz, cifras del archivo | plan Cons | Joaquín (paso E) | Cons lo puso con cifras a mano y sin reentrenar | — |
| P3 | Variable por la imagen | plan Cons | Joaquín (paso F) | Cons solo usa `kind` | — |
| P4 | Publicación comprobada | plan Cons | Joaquín (paso G) | — | — |
| P5 | QA de navegador 390 y 1440 px | plan Cons | Joaquín (paso D) | Cons hizo 4 capturas solo de inicio y explorar | `docs/qa/cons-navegador.md` |
| P6 | Wolf 489 corregido y revisión v2 | plan Horacio | Horacio | hecho (`f7878e4`) | — |
| P7 | Métricas de dipolo | plan Horacio | Horacio | hecho (`pipeline/dipole_features.py`) | `docs/ml/revision-ciencia-clasificador.md` sec. 5 |
| P8 | `docs/pitch/revision-ciencia.md` | plan Horacio | Horacio | hecho, falta traerlo | — |
| P9 | Piezas de `docs/entrega/` | plan Carlos | Carlos | subidas (`3f77eec`), falta traerlas | — |
| P10 | `docs/backend/despliegue-aws.md` | este prompt, fase 3 | Joaquín | pendiente | — |

## Bitácora

- 22:55 `dff3c68`: unión de `joako-requisitos`; `npm ci` en limpio pasa.
- 23:05 `93f88fc`, `5261b36`: tres fallos vistos en el navegador, arreglados con prueba.
- 23:12 `0d5eb3b`: QA de los cinco objetivos (`docs/qa/navegador-cinco-objetivos.md`).
- 23:20 `0d87293`: tema solo oscuro (opción b, provisional; sin respuesta en el paso C).
- 23:25 `74e6f5e`: clasificador v2 reentrenado en la app, cifras de `resultados_v2.json`.
- 23:35 `587fe9e`: "variable" por la imagen (kind o indicio de dipolo).
- 23:40 `8c39463`: publicación comprobada con `curl`.

- 22:52 `1cf9546`: se une `origin/frontend-del-cons` (`cbef27d`); en `ml-clasificador/` se conserva la v2 reentrenada.

## Cifras de los textos que no coinciden con los archivos de resultados

Referencia: `data-new/results.json` (Horacio, generado 2026-11-15 02:39 UTC) y `ml-clasificador/resultados_v2.json` (reentrenado, `3174434`). Barnard no está en `data-new/`: su cifra solo existe en `data-sample/results.json` (corrida del 5 de noviembre, ver `docs/auditoria/procedencia.md`). La revisión de cada cifra del guion está en `docs/pitch/revision-ciencia.md` (Horacio, traído de `origin/Horacio`).

| Archivo | Línea | Cifra del texto | Cifra del archivo de resultados | Quién avisa |
|---|---|---|---|---|
| `docs/pitch/team-page-en.md` (`origin/joako`) | 13 | "real runs, 5 Nov 2026" | `data-new/results.json` es del 15 nov 02:39 UTC (14 nov, hora local) | Joaquín a Carlos |
| `docs/pitch/team-page-en.md` (`origin/joako`) | 15 | ε Indi B 4.54 ± 0.11″/yr vs 4.68 | 4.21 ± 0.28″/yr, PA 124.9°, catálogo 4.684, 1.7σ | Joaquín a Carlos |
| `docs/pitch/team-page-en.md` (`origin/joako`) | 16 | WISE 0855 7.91 ± 1.35″/yr vs 8.09 | 6.04 ± 0.76″/yr, PA 289.1°, catálogo 8.088, 2.7σ | Joaquín a Carlos |
| `docs/pitch/team-page-en.md` (`origin/joako`) | 14 | Barnard 10.23 ± 0.43 vs 10.39 | No está en `data-new/`; coincide con `data-sample/results.json` (procedencia pendiente) | Joaquín decide (E4) |
| `docs/pitch/team-page-en.md` (`origin/joako`) | 21 | "8 of 9 […] 10 false alarms" | No está en `data-new/results.json`; viene de `data-sample/results.json` (`final_test`) y solo vale para la regla (revisión de Horacio) | Horacio a Carlos |
| `docs/pitch/team-page-en.md` (`origin/joako`) | 24 | "Quick Release 2 and 3 (IRSA652, IRSA662)", "Aladin Lite", "LightGBM" | `data-new/` usa DR1 (`spherex_dr1`, 338 cuadros; DOI 10.26131/IRSA678 según el manifiesto) y QR3 (74); Aladin no se usa (B8) | Joaquín a Carlos |
| `docs/pitch/video-30s-en.md` (`origin/joako`) | 8 | "over 1.6 million images", contador 1,607,473 | `data-new/results.json` `archive.n_science_images` = 470 (solo los cuatro campos, otra definición); 1 607 473 es el censo de QR2+QR3 de `data-sample/results.json` | Horacio a Carlos |
| `docs/pitch/pitch-3min-es.md` (esta rama, igual a `origin/joako`) | 60 | WISE 0855 "7.9 por año; el catálogo infrarrojo, 8.1" | 6.04 ± 0.76 contra 8.088 (2.7σ) | Joaquín a Carlos |
| `docs/pitch/pitch-3min-es.md` | 45 | Barnard "10.2" | Solo en `data-sample/results.json` | Joaquín decide (E4) |
| `docs/entrega/pagina-equipo-en.md` (Carlos, `3f77eec`) | 29 | v2 "75.4% (52/69)" | `resultados_v2.json`: 0.7826 (54 de 69) tras corregir Wolf 489 | Joaquín a Carlos |
| `docs/entrega/README-borrador.md` (`origin/carlos`) | 66 | "75.4% LOO en 69 objetos" | 0.7826 (54 de 69) | Joaquín a Carlos |
| `docs/entrega/video-30s-guion-en.md` (Carlos) | 12 | contador 1,607,473 | igual que arriba: no está en `data-new/results.json` | Horacio a Carlos |
| `docs/entrega/diapositivas-outline.md` (Carlos) | 14 | "8/9 con 0 falsas alarmas sobre 541 candidatos" | Solo en `data-sample/results.json` | Horacio a Carlos |

La interfaz ya no tiene cifras escritas a mano del clasificador (`74e6f5e`). Las notas de cada objetivo en `app/src/i18n/ui.ts` (1.8 pársecs, 250 K, 246 días, 150 pársecs) no salen de ningún archivo de resultados; no se contradicen con ellos, pero no tienen fuente al lado (D1, Horacio).

## Aviso para Carlos

> Carlos: en `joako-integracion` (la rama que va a `main`) ya hay un `README.md` y un `docs/entrega/uso-de-si.md` de Joaquín. Por favor no los dupliques: toma tu `docs/entrega/README-borrador.md` y tu `uso-de-si.md` de `origin/carlos` y pasa lo que les falte a esos dos archivos, y luego borra tus copias. Tus otras cuatro piezas (página del equipo, guion, diapositivas, checklist) ya están en la rama tal cual. Corrige en ellas las cifras de la tabla "Cifras de los textos" de `docs/integracion/estado.md` (v2: 78.3 %, 54 de 69; WISE 0855 6.04 ± 0.76) y la sección 2 de `checklist-qa.md`: ya no hay modo claro.
