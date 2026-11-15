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

- 22:52 `1cf9546`: se une `origin/frontend-del-cons` (`cbef27d`); en `ml-clasificador/` se conserva la v2 reentrenada.
