# Sparks · sistema visual "Bitácora de la noche"

Escrito el 2026-11-14 a partir de lo construido en `app/src/ui/` y `app/src/styles/`. Reemplaza cualquier pauta anterior. Los tokens viven en `app/src/styles/tokens.css`; este archivo explica las reglas.

## Idea

Sparks es la bitácora de un pedazo de cielo: cada temporada es una entrada, y parpadear es pasar las páginas. El logo manda: dos chispas, azul antes y ámbar ahora, que se tocan en una lente crema.

## Color

| Token | Noche (predeterminado) | Día | Uso |
|---|---|---|---|
| `--bg` | `#06080C` | `#FAF8F3` | Suelo. Es el mismo del logo, así el lockup no muestra caja |
| `--surface` / `--surface-2` | `#0E141D` / `#141C27` | `#F3EFE6` / `#EBE5D8` | Controles, veredicto, superficies elevadas |
| `--text` / `-2` / `-3` | `#ECE7DC` / `#BDB7AB` / `#918C82` | `#0D1117` / `#3B3F46` / `#5C5F66` | Todos ≥ 4.5:1 sobre su suelo |
| `--before` | `#62B6E8` | `#2F8BCB` | **Solo** "antes" |
| `--now` | `#FFB238` | `#F09A0C` | **Solo** "ahora" y la acción principal |
| `--now-ink` | `#FFC56A` | `#8A5200` | Texto ámbar y foco (6:1 en papel) |
| `--lens` | `#FFF4DC` | `#FFFFFF` | Solo el destello del cambio de época |
| `--sky` | `#06080C` | `#06080C` | El escenario del cielo es de noche en los dos temas |
| asombro | `--wonder-plum`, `--wonder-dusk`, `--astro-*` | versiones de papel | Atmósfera e ilustración, nunca datos |

Reglas:
- Azul y ámbar nunca se usan para otra cosa. Las ilustraciones usan coral, malva, rosa, menta y piedra.
- La resta se pinta con un mapa divergente azul → noche → ámbar en múltiplos del ruido (±8σ, curva ^1.5). La leyenda se dibuja con la misma función.
- Las imágenes de SPHEREx no llevan filtros ni efectos. Las marcas (anillos, estrellas de Gaia) van en una capa SVG aparte y se declaran como dibujo.

## Luz (glow)

- Siempre es un `radial-gradient` que cae a cero, nunca una sombra de color ni un `filter: blur`.
- Halo ámbar: acción principal (`.btn--now`) y entrada viva de la bitácora. Halo azul más tenue (75 %): la entrada "antes".
- Intensidad por tema: `--halo-now` 0.55 en noche, 0.38 en papel.
- Destello crema (`.entry__lens`, 700 ms) en cada cambio de época, como en `symbol-animated.svg`. Desaparece con `prefers-reduced-motion`.

## Tipografía

- Archivo (eje `wdth` 100–125): títulos. Es la letra del logotipo.
- Atkinson Hyperlegible Next: texto, 17 px de base.
- Atkinson Hyperlegible Mono: toda cifra, coordenada y fecha, con números tabulares.
- Escala: `--step--1` 14 px · `--step-0` 17 px · `--step-1` 20 px · `--step-2` 22–28 px · `--step-3` 30–44 px.

## Forma

- Radios: 8 px (chicos), 14 px (superficies), píldora para controles. Los paneles del cielo, 10 px.
- Sin tarjetas con borde para el contenido: la bitácora son filas, los números son filas con la fuente colgada al margen.
- La bitácora va de la más nueva arriba a la derecha a la más vieja abajo a la izquierda, con la misma diagonal ↗ del logo.
- Íconos SVG propios, trazo 1.75 en retícula de 24.

## Lectura en capas

1. Una frase para un niño de 8 años (`lede`, `entry__kid`, `reading__kid`).
2. Un párrafo de método ("Qué mide Sparks").
3. Números con unidad, incertidumbre y fuente al margen, más DOI, ruido, banderas y huella de 102 colores.
Todo término técnico es un `<Term>`: se abre con toque, clic o teclado, y se cierra con Esc.

## Movimiento y seguridad

- El parpadeo arranca en pausa. La primera vez avisa de los destellos antes de reproducir.
- Velocidades de 1, 2 y 3 Hz; 3 Hz es el máximo de WCAG 2.3.1.
- En teléfono, el transporte queda fijo abajo con la pausa siempre visible.

## Temas

La noche es el tema predeterminado: los datos del cielo son oscuros y la luz del logo se lee sobre noche. El día es papel con las tintas de `logo-light.svg`, con halos más finos y el escenario todavía de noche. La elección se guarda en `localStorage` (`sparks-theme`), se aplica antes de pintar (script en `index.html`) y acepta `?theme=light|dark` para incrustar.
