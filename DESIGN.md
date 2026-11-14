# DESIGN · Sparks

`DESIGN.md` manda. Si dos skills se contradicen, gana este archivo. Cambios: se anotan aquí y en `DECISIONS.md`.

## 1. Concepto: el comparador de parpadeo, otra vez

En 1930 Clyde Tombaugh encontró Plutón con un **comparador de parpadeo**: dos placas de vidrio del mismo cielo, una luz que alterna entre ellas y un ojo que espera que algo salte. Sparks es ese instrumento, rehecho para un telescopio que ve en 102 colores.

- **El cielo es el protagonista.** Las imágenes SPHEREx ocupan el centro y la mayor superficie. La interfaz es el bastidor del instrumento: oscura, quieta, con poco contraste propio, para que el ojo vaya primero al cielo y después a la chispa.
- **Una sola chispa de color.** El ámbar es la única acción de color. Marca lo que se mueve, lo que es "ahora" y lo que el usuario puede tocar. Todo lo demás es neutro.
- **El gesto de la marca es el salto.** Cuando el flipbook cambia de cuadro, la marca de la chispa da un destello breve (160 ms). Es el único movimiento que no pidió el usuario.
- **Honestidad científica visible.** Las imágenes no se filtran por estética. Cada escala de color tiene leyenda con unidades. Lo que no está medido se dice.

Tipo de producto (design-taste-frontend §1): **software** (herramienta científica). Se adopta su regla central: *la interfaz real del producto es el héroe* (no hay landing aparte: la app abre directo en el instrumento).

### Lo que se descartó y por qué
| Propuesta | Origen | Por qué no |
|---|---|---|
| "Cyberpunk UI", verde Matrix #00FF41 + rojo, glitch, scanlines | ui-ux-pro-max `--design-system` | Es el cliché "negro + acento ácido" que frontend-design marca como plantilla; los glitch/scanlines inventan señal sobre imágenes científicas |
| Fira Code + Fira Sans | ui-ux-pro-max | Monoespaciada para datos chicos = tell de plantilla; Fira se lee genérica |
| Fondo de estrellas de stock, degradados morados | — | Prohibido por el brief; violeta prohibido por design-taste-frontend |
| Tarjetas con sombra por todas partes | — | Prohibido por el brief. Superficies planas separadas por filetes y espacio |

## 2. Tokens

### Color (definidos en `app/src/styles/tokens.css`)
| Token | Hex | Uso |
|---|---|---|
| `--night` | `#06080C` | Fondo de la página y del lienzo del cielo |
| `--chassis` | `#0D1117` | Superficies del instrumento (barras, paneles laterales) |
| `--chassis-2` | `#141A23` | Superficie elevada: controles, campos, celdas activas |
| `--rule` | `#232B37` | Filetes de 1 px y bordes |
| `--plate` | `#ECE7DC` | Texto principal: el blanco cálido de la emulsión de una placa |
| `--plate-dim` | `#A3A9B4` | Texto secundario, etiquetas (8.5:1 sobre `--night`) |
| `--plate-faint` | `#858D9B` | Ejes, marcas de escala (≥ 4.5:1 sobre las tres superficies) |
| `--spark` | `#FFB238` | **La chispa.** Objetivo, "ahora", flecha medida, foco, botón principal |
| `--spark-ink` | `#1A1205` | Texto sobre `--spark` |
| `--then` | `#62B6E8` | "Antes": el polo negativo de una resta, la posición anterior, la flecha esperada (catálogo) |
| `--ok` | `#7FD1A8` | Validación (medido coincide con esperado) |
| `--warn` | `#F07A6B` | Saturación, banderas, errores |

Escalas de datos (siempre con leyenda):
- **Imágenes de cielo:** gris lineal-asinh, negro = fondo, blanco = brillante. Mismo rango por detector en todas las temporadas (si no, el parpadeo mentiría).
- **Resta (después − antes):** divergente `--then` (azul, negativo) → `--night` (cero) → `--spark` (ámbar, positivo), en unidades de σ. Azul/ámbar es seguro para daltonismo.
- **Longitud de onda (huella de 102 celdas, espectro):** *cividis* (azul marino → amarillo), perceptualmente uniforme y sin violeta. Corto = azul, largo = amarillo.
- **Máscara de banderas:** `--warn` al 55 % para pixeles excluidos, `--then` rayado para GHOST.

### Tipografía
| Rol | Familia | Notas |
|---|---|---|
| Marca y titulares | **Archivo** expandida (`wdth` 112–125), 600–700 | Rotulación de instrumento; ancha, grabada |
| Texto y datos | **IBM Plex Sans** 400/500/600, `font-variant-numeric: tabular-nums` en todo número | Legible en proyector y teléfono; cifras tabulares |

Escala (razón 1.25, base 16 px): 12 · 13 · 14 · 16 · 20 · 25 · 31 · 39. Interlineado 1.45 texto, 1.1 titulares. Etiquetas en *sentence case* (sin mayúsculas sostenidas). Coordenadas y números siempre en Plex Sans tabular, nunca monoespaciada.

### Espacio, radios, sombras
- Espaciado en múltiplos de 4: `--s1` 4 · `--s2` 8 · `--s3` 12 · `--s4` 16 · `--s5` 24 · `--s6` 32 · `--s7` 48.
- Radios: `--r-sm` 3 px (controles), `--r-md` 6 px (paneles). Las imágenes del cielo: radio 0 (son placas).
- Sombras: ninguna en superficies. Solo `--glow-spark: 0 0 0 1px var(--spark), 0 0 18px rgba(255,178,56,.35)` en el destello y el foco.

### Movimiento
| Nombre | Duración | Curva | Dónde |
|---|---|---|---|
| `--t-fast` | 120 ms | `cubic-bezier(.2,.7,.2,1)` | Hover, presión de botón (paso de 1 px) |
| `--t-base` | 200 ms | igual | Abrir paneles, cambiar pestaña |
| **destello** | 160 ms in + 360 ms out | `ease-out` | La chispa al cambiar de cuadro |
| flipbook | 2–12 cuadros/s (por defecto 3) | — | Controlado por el usuario |

Nada se mueve por hacer scroll. Sin entradas con fundido. `prefers-reduced-motion`: sin destello (solo cambio de borde), flipbook en pausa al cargar.

## 3. Ajustes fijos de design-taste-frontend (variante principal)
- Tipo: **software**; radio **sharp/soft** (3–6 px); botones con paso de 1 px al hover y presión al click; subrayados que se dibujan.
- Sin violeta. Sin captions bajo imágenes (los créditos van en una línea del pie).
- Bordes izquierdo y derecho iguales; sin scroll horizontal a 390 px.
- **No aplica** (es una app, no una landing): "una sección por pantalla", fotografías, shaders, escenas. Anotado en `DECISIONS.md`.
- Diales (ui-ux-pro-max): variación 6, movimiento 3, densidad 7.

## 4. Componentes base
- **Barra superior:** marca · campo de coordenadas (acepta `08h55m10.831s −7d14m42.53s`, `133.7951 -7.2451`, nombres de los 5 objetivos) · botón "Go" · selector EN/ES · "Share/Embed".
- **Selector de objetivos:** 5 botones con nombre y una línea ("fastest star", "coldest brown dwarf"…).
- **Escenario (stage):** 6 paneles 64×64 px reescalados por múltiplos enteros (sin suavizado: `image-rendering: pixelated`), con D#, λ y fecha. Marca de la chispa: retícula ámbar abierta (no tapa el píxel).
- **Transporte:** play/pausa, cuadro anterior/siguiente, velocidad, línea de tiempo con temporadas.
- **Modos:** segmento Blink · Stack (A+B) · Subtract (B−A) · −Median · Frames.
- **Tarjeta de la chispa:** nombre, veredicto en una frase, flecha medida vs esperada (dial), números con barra de error, huella de 102 celdas, espectro, índice de frío, curva de luz si es variable.
- **Panel inferior (pestañas):** Context (Aladin + catálogos) · Frame (metadatos + banderas) · Candidates · About data.
- **Estados vacíos y error:** frase directa de qué pasó y qué hacer ("IRSA is slow right now. The 5 targets still work offline.").

## 5. Accesibilidad
- Contraste AA mínimo: texto normal ≥ 4.5:1, grande ≥ 3:1. `--plate` sobre `--night` = 16.3:1; `--spark` sobre `--night` = 11.1:1; `--spark-ink` sobre `--spark` = 10.3:1; `--plate-faint` sobre `--chassis-2` ≥ 4.5:1 (medidos con la fórmula WCAG 2.x).
- Foco visible siempre: anillo de 2 px `--spark` con 2 px de separación.
- Objetivos táctiles ≥ 44×44 px en móvil.
- Todo control con texto o `aria-label`. Atajos de teclado: espacio (play), ←/→ (cuadro), 1–6 (detector), B/S/D/M (modo).
- El color nunca es la única señal: el dipolo tiene signos (−/+) y la flecha tiene leyenda escrita.
- Idioma: inglés por defecto, alternancia a español (`?lang=es`).
