# Sparks · cinco rediseños comparados

Todas las ramas salen del commit base `4a50241` (kit lógico neutro sobre `joako` `a44a30e`). El kit comparte:
- el estado de la app (`app/src/ui/kit/useSparks.ts`);
- el canvas del cielo, el glosario y las capas de cifras;
- los textos de la pestaña de inicio (`app/src/i18n/intro.ts`).

Composición, tipografía, paleta, forma, navegación, pestaña de inicio y gesto propio son de cada rama. Cada carpeta `design-proto/0N-*/` de su rama trae su ficha (`README.md`) y siete capturas: inicio y exploración en escritorio y móvil, en oscuro y en claro.

| # | Rama | Concepto en una línea | Tipografía | Gesto propio |
|---|---|---|---|---|
| 1 | `design/01-carta-celeste` | Atlas estelar: láminas numeradas, marco grabado, frontispicio con esfera celeste | Spectral · Karla · Fira Mono | Marco con N/E y barra de escala de 1′ real |
| 2 | `design/02-club-exploradores` | Misión para niños en tres pasos, personajes grandes, formas redondas | Baloo 2 · Nunito · JetBrains Mono | Regla de "cuadritos": la estrella avanzó 1.7 píxeles |
| 3 | `design/03-cronica` | Revista científica con relato por scroll: el cielo fijo cambia por capítulo | Bricolage Grotesque · Literata · Red Hat Mono | El scroll cambia parpadeo, suma y resta |
| 4 | `design/04-cosmos` | Inmersivo: campo de estrellas vivo, luna, dock flotante, cielo de día | Unbounded · Manrope · Martian Mono | Estrellas con paralaje y temporadas como lunitas |
| 5 | `design/05-instrumento` | Precisión suiza: retícula de 12 columnas, monocromo, tabla de objetivos | Geist · Geist Mono | La medida (10.23 ± 0.43) como objeto tipográfico |

## Evaluación (1 a 10)

| Criterio | 1 Carta celeste | 2 Club | 3 Crónica | 4 Cosmos | 5 Instrumento |
|---|---|---|---|---|---|
| Originalidad visual | 8 | 7 | 8 | 7 | 7 |
| Calidad estética | 8 | 7 | 8 | 9 | 8 |
| Facilidad de uso | 8 | 9 | 7 | 7 | 8 |
| Legibilidad | 8 | 9 | 9 | 7 | 8 |
| Experiencia móvil | 7 | 8 | 7 | 7 | 7 |
| Coherencia del sistema | 8 | 7 | 8 | 7 | 9 |
| Calidad de interacciones | 7 | 8 | 8 | 8 | 7 |
| Calidad técnica | 8 | 8 | 8 | 7 | 8 |
| Fidelidad funcional | 9 | 8 | 8 | 9 | 9 |
| **Total** | **71** | **71** | **71** | **68** | **71** |

Notas de la puntuación:
- **Club (fidelidad 8):** los números completos quedan detrás de "Para curiosos".
- **Crónica (fidelidad 8):** en el teléfono, el cielo fijo muestra 3 de 6 detectores.
- **Cosmos (legibilidad y técnica 7):** la tipografía ancha y la animación continua pesan más.
- **Instrumento (coherencia 9):** es la más disciplinada, pero la menos mágica para un niño.

## Validación común
- Typecheck estricto, Vitest 13/13 y `vite build` correctos en las cinco ramas.
- ESLint no está configurado en el proyecto.
- El detector de Impeccable quedó en 0 hallazgos en las ramas 3, 4 y 5. Quedan avisos no bloqueantes y justificados en la 1 (marcas del marco) y en la 2 (rebote infantil).
- Interacciones probadas en Chromium real por el protocolo de depuración, porque el panel del navegador estaba oculto y no pintaba:
  - pestaña de inicio → exploración;
  - aviso de destellos, reproducir y pausa;
  - suma y resta con canvas;
  - objetivo "pronto" y búsqueda.

## Pendientes comunes
- Las referencias visuales se citaron de memoria; no se navegaron en esta sesión.
- No hay medición de rendimiento en un teléfono real.
- No se hizo revisión con lector de pantalla.
