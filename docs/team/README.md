# Equipo Cosmonautas · cómo dominar, replicar y mejorar Sparks

Este directorio es para que los cuatro puedan **explicar, replicar y mejorar** Sparks sin el agente.

| Archivo | Para quién |
|---|---|
| [`00-onboarding.md`](00-onboarding.md) | Los cuatro, primero (~1 hora) |
| [`rol-1-datos.md`](rol-1-datos.md) | Datos y pipeline |
| [`rol-2-ciencia.md`](rol-2-ciencia.md) | Ciencia: movimiento y luz |
| [`rol-3-ml.md`](rol-3-ml.md) | ML y validación |
| [`rol-4-producto.md`](rol-4-producto.md) | Producto, diseño y pitch |
| [`yuca.md`](yuca.md) | Qué correr en Yuca (Unison) y cómo |
| [`yuca-queue.md`](yuca-queue.md) | Trabajos pendientes para Yuca, con comando exacto |
| [`notebooks/`](notebooks/) | Un notebook de arranque por rol (enunciados, sin soluciones) |

## Reparto
Asignen nombres aquí: **[[PENDIENTE: el equipo decide quién toma cada rol]]**.

| Rol | Persona | Investiga | Construye |
|---|---|---|---|
| 1 · Datos y pipeline | — | SPHEREx, IRSA, FITS, WCS, banderas, releases | `discover`, `remote_fits`, `frames`, `coadd`, `precompute`, `check_releases`, Yuca |
| 2 · Ciencia | — | Movimiento propio, paralaje, PSF, espectros, enanas cafés, variables | `astrometry`, `photometry`, `field`, ePSF |
| 3 · ML y validación | — | Candidatos, features, LightGBM, inyecciones, protocolos sin fuga | `candidates`, `ml`, `train_ml`, protocolo de prueba |
| 4 · Producto y pitch | — | UX científica, `DESIGN.md`, accesibilidad, storytelling | `app/`, despliegue, e2e, pitch, video, Canva |

## Cómo se conectan los roles
```
Rol 1 (datos) ──► Rol 2 (números científicos) ──► Rol 4 (app y pitch)
      │                                                ▲
      └──────────► Rol 3 (candidatos y validación) ─────┘
```
- **Rol 1 → todos:** si cambian los datos (lote nuevo, ePSF, campo nuevo), avisa; luego `scripts/collect_results.py` regenera `results/results.json`.
- **Rol 2 → Rol 4:** cada número que se dice en voz alta lo aprueba el rol 2 (`docs/pitch/fuentes.md`).
- **Rol 3 → Rol 4:** la frase de "cómo sabemos que no es ruido" sale de `models/report/final_test.md`, no de memoria.
- **Rol 4 → todos:** los ensayos; quien no pueda responder una pregunta de su parte en 20 s, la practica.
- **Regla de oro:** `make test` corre `check_numbers.py`. Si un documento cita un número que no está en `results/results.json`, falla.

## Calendario de estudio sugerido (1–2 h diarias por persona)
| Día | Todos | Rol 1 | Rol 2 | Rol 3 | Rol 4 |
|---|---|---|---|---|---|
| Vie 6 nov | `00-onboarding.md` juntos (1 h) | — | — | — | — |
| Sáb 7 | — | Lecturas §2 (SPHEREx, IRSA) | Lecturas §2 (movimiento, paralaje) | Lecturas §2 (fuga, métricas) | `DESIGN.md`, accesibilidad |
| Dom 8 | — | Ejercicios 1–2 | Ejercicios 1–2 | Ejercicios 1–2 | Ejercicios 1–2 |
| Lun 9 | — | Ejercicio 3 | Ejercicio 3 | Ejercicio 3 | Despliegue de prueba (ej. 4) |
| Mar 10 | 30 min: cada uno explica su parte a los otros tres | Ejercicio 4 | Ejercicio 4 | Ejercicio 4 | Canva + primer ensayo |
| Mié 11 | — | Notebook (ej. 5) | Notebook (ej. 5) | Notebook (ej. 5) | Notebook (ej. 5) |
| Jue 12 | Simulacro de preguntas del jurado (1 h, rotando) | Confirmar datos de Yuca | Revisar `fuentes.md` | Repasar protocolo | Ensayo cronometrado ×3 |
| Vie 13 | Ensayo completo con demo y con el video de respaldo | `make check-releases`; red de la UTH | Números finales | `make test` en verde | Despliegue final, QR impreso |

## Quién presenta qué en el pitch
- **Narra:** una sola persona (propuesta: rol 4, o quien mejor cuente la historia en los ensayos). Sigue `docs/pitch/pitch-3min-es.md` palabra por palabra.
- **Maneja la demo:** otra persona (propuesta: rol 1), con las pestañas listas y el video de respaldo a un clic.
- **Preguntas del jurado:** responde quien es dueño del tema, en ≤ 20 s, con la "respuesta corta" de su guía; si el jurado pide más, la "larga".
  - Datos, IRSA, lotes nuevos, rendimiento → rol 1.
  - Movimientos, espectros, enanas cafés, variables, barras de error → rol 2.
  - "¿Cómo saben que no es ruido?", ML, validación → rol 3.
  - Usuarios, diseño, accesibilidad, despliegue → rol 4.
- Si nadie sabe: "No lo medimos; es la siguiente prueba que haríamos". Nunca inventar.
