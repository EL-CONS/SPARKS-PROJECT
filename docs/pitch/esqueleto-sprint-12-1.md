# Esqueleto del pitch · sprint 12-1

Base: `pitch-3min-es.md` (guion completo) y `sparks-en-breve.md` (la propuesta en una pantalla). Este archivo solo marca qué se conserva, qué hay que verificar y dónde entran los hallazgos de hoy.

## Hilo de la historia (no cambia)
1. Tombaugh y el comparador de parpadeo (1930): lo que salta, se movió.
2. Sparks hace lo mismo con SPHEREx en 102 colores. Azul: dónde estaba. Ámbar: dónde está. Flecha: hacia dónde va.
3. Prueba 1, Barnard: nuestra flecha coincide con Gaia.
4. Prueba 2, WISE 0855: Gaia no la tiene, nosotros la vemos y su huella dice que es fría.
5. Para cualquiera: coordenadas o enlace; datos nuevos entran solos.
6. Cierre: "Every spark that moves has a fingerprint."

## Lugares donde entra lo de este sprint
| Lugar en el guion | Entra | De quién | Estado |
|---|---|---|---|
| 2:20, "Sparks es para cualquiera" | Una frase sobre qué recursos del reto usamos y cuáles no | Carlos (`recursos.md`) | Pendiente |
| 2:20, después de la prueba con nueve estrellas | Una frase sobre si un modelo puede clasificar por movimiento y qué tan lejos llegamos, sin exagerar | Horacio (`clasificacion-ml.md`) | Pendiente |
| 0:45 a 1:15 y 2:45 | Pantalla de la interfaz nueva | Cons | Pendiente |

Regla: si el hallazgo no está verificado en el archivo de la persona, no entra al guion.

## Números del guion contra `data-sample/results.json` y `index.json`
| Dicho en el guion | Dato | Coincide |
|---|---|---|
| 1,607,473 imágenes | `archive.n_science_images` = 1607473 | Sí |
| Barnard: 10.2 nuestra, 10.4 Gaia | 10.23 medida, 10.39 esperada | Sí |
| WISE 0855: 7.9 nuestra, 8.1 catálogo infrarrojo | 7.91 medida, 8.09 esperada; `in_gaia` es falso | Sí |
| Nueve estrellas veloces, "encontró ocho" | `final_test`: n = 9, regla marca 8 como movedor | Sí con la regla; el ML marca 6 |
| "sin falsas alarmas" | La regla tiene 0 falsas (`rule_other_mover`); el ML marca 10 movedores más (`ml_other_mover`) | **Revisar**: es cierto solo para la regla. Decir "la regla" o quitar la frase |

## Pendientes de Joaquín para el pitch
- Decidir quién narra (el guion dice que se decide en llamada).
- Resolver la frase de "sin falsas alarmas" arriba.
- Reemplazar las capturas del respaldo cuando Cons tenga la interfaz nueva (el video `demo-backup.webm` y las capturas son de la versión anterior).
- Alinear el guion con `sparks-en-breve.md`: ya usa azul, ámbar y flecha, el mismo lenguaje.
