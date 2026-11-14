# 03 · Ciencia: qué se debe ver y qué no

Consulta: 2026-11-05. Las escalas de SPHEREx (píxel de 6.15″, FWHM de ~6.6″ en D6, temporadas cada ~6 meses) vienen de `02-spherex-datos.md`.

## 1. Movimiento propio y paralaje de los objetivos de prueba

Desplazamiento esperado = μ × base de tiempo disponible en QR2+QR3 (medida en la SIA). En píxeles: ÷ 6.15″.

| Objetivo | μ (″/año) | Paralaje | Base SPHEREx hoy | Desplazamiento | ¿Se ve? |
|---|---|---|---|---|---|
| **Barnard's Star** (M4V, 1.8 pc) | ~10.4 | ~0.55″ | ago-2025 → sep-2026 (~1.1 año) | ~11″ ≈ **1.8 px** | Sí en blink o resta (dipolo); apenas en video. Es brillante: **riesgo de saturación** |
| **WISE 0855−0714** (Y4, ~250 K, 2.2 pc) | 8.08 ± 0.05 | 0.449 ± 0.008″ | may-2025 → may-2026 (1.0 año) | ~8″ ≈ **1.3 px**; el paralaje suma oscilaciones de ±0.45″ (0.07 px) | Sí en resta, si el S/N alcanza en D5 y D6. Casi invisible bajo 3 µm |
| **ε Indi Ba/Bb** (T1+T6, 3.6 pc) | ~4.7 (común con ε Ind A) | ~0.27″ | abr-2025 → oct-2026 (~1.45 años) | ~6.8″ ≈ **1.1 px** | En el límite; la pareja (0.73″) **no se resuelve**. ε Ind A (K4V) a ~6.7′ meterá fantasmas (bandera GHOST) |
| **RW Aurigae** (T Tauri, ~150 pc) | ~0.03 [INFERENCIA por distancia] | ~7 mas | — | ≪ 1 px | No se mueve: es la prueba de **variabilidad** |
| **R Draconis** (Mira) | pequeño | — | may-2025 → jul-2026, ~25 bloques | ≪ 1 px | No se mueve: **curva de luz** |

Fuentes: WISE 0855 μ y paralaje [SECUNDARIO: resumen de búsqueda de Luhman 2014, arXiv 1405.7350, y Wright et al. 2014; Luhman & Esplin 2016 vía compilación] https://web3.arxiv.org/pdf/1405.7350 · https://skyandtelescope.org/astronomy-news/suns-new-chilly-neighbor/ · ε Indi B tipos T1/T6, separación 0.732″, μ 4.7″/año [SECUNDARIO: resumen de búsqueda de McCaughrean et al. 2004 y Cardoso] https://arxiv.org/abs/astro-ph/0309256 · Barnard μ ≈ 10.4″/año y paralaje ≈ 0.55″ [INFERENCIA: valores de libro, sin verificar hoy porque SIMBAD/Gaia no respondieron → preguntas abiertas] · Divisiones y bases [INFERENCIA: cálculo propio con datos VERIFICADOS de cobertura]

**Conclusión [INFERENCIA]:** con la base de hoy (~1–1.5 años) los movimientos son de **1–2 píxeles**. Un flipbook crudo no lo vuelve obvio. Lo vuelve visible:
1. coadds por detector y temporada (más S/N, menos ruido de un solo cuadro);
2. resta entre temporadas, donde aparece un **dipolo** positivo/negativo alineado con el vector de Gaia o CatWISE;
3. centroide PSF (o ePSF) por temporada, con precisión subpíxel (fracciones de píxel con S/N alto), y una flecha medida contra la esperada.

Prometer "verás moverse a WISE 0855 como un asteroide" sería un error científico que la astrónoma del jurado detectaría de inmediato.

## 2. Enanas marrones en el infrarrojo cercano

- SPHEREx ya midió espectros R~40–100 de **miles** de enanas marrones cercanas. Su rango captura bandas moleculares anchas y más del 80% de la luminosidad bolométrica. Un artículo de 2026 (Rustamkulov et al.) muestra 37 enanas de L0 a Y4 y las compara con modelos (Sonora Diamondback, Elf Owl, BT-Settl, ATMO2020). Los modelos fallan en los picos J/H/K, en la ventana de 4 µm y en los rasgos de CO₂ y CO. [VERIFICADO: abstract] https://arxiv.org/abs/2607.00543
- La prensa del mismo trabajo resalta agua, metano, CO y CO₂. [SECUNDARIO] https://astrobiology.com/2026/10/09/spherex-telescope-sees-menagerie-of-brown-dwarfs/
- Por qué SPHEREx es bueno para esto [INFERENCIA, física estándar de atmósferas frías]: absorción de H₂O en ~1.4 y ~1.9 µm, CH₄ en ~1.6, ~2.2 y ~3.3 µm, CO₂ ~4.3 µm, CO ~4.6 µm, más el "pico" de emisión de 4–5 µm en las T e Y. Un objeto frío casi no brilla en D1–D3 y sí mucho en D5–D6. WISE solo ve el color W1−W2; SPHEREx da la forma completa. **Un espectro de 102 puntos clasifica el tipo espectral; un color de dos bandas solo lo sugiere.**
- Consecuencia de producto: el "momento wow" de WISE 0855 no es el movimiento. Es que **Gaia no lo ve** (es demasiado frío para el óptico) y el espectro SPHEREx sube a 5 µm. [INFERENCIA; que no esté en Gaia hay que verificarlo → preguntas abiertas]

## 3. Estrellas variables

- **R Draconis**: Mira de periodo **246 días** en V, de mag 6.7 a 13.2. Las Miras cambian muchísimo en el visible y mucho menos en el IR, porque la energía se desplaza entre visible e infrarrojo. [SECUNDARIO: tabla de Wikipedia, "Mira variable"] https://en.wikipedia.org/wiki/Mira_variable
  - Con SPHEREx hay unos 25 bloques entre may-2025 y jul-2026 (~430 días, ~1.7 ciclos) [VERIFICADO: cobertura]. Una curva de luz por detector (al mismo λ) debería mostrar el ciclo. [INFERENCIA] **Riesgo:** las Miras son muy brillantes en K y pueden saturar (banderas OVERFLOW/NONLINEAR). [INFERENCIA]
- **RW Aurigae**: binaria de T Tauri clásicas. RW Aur A tuvo tres grandes oscurecimientos desde 2010: el primero de ~180 días y 1.5–2 mag en V; el de 2014–2016, ΔV ≳ 2 mag. Durante los oscurecimientos aparece emisión IR extra de polvo a 500–700 K. El origen sigue en debate (disco interno deformado, borde inflado, posible compañero). Hay variabilidad de líneas con periodo de 2.77 d. [SECUNDARIO: resúmenes de búsqueda de arXiv 1511.01688 y 1903.06423] https://arxiv.org/abs/1511.01688 · https://arxiv.org/abs/1903.06423
  - Qué esperar en SPHEREx: cambios de flujo entre las 3 temporadas (sep-2025, feb–mar-2026, sep-2026) y quizá un cambio de **forma** espectral (más exceso a 3–5 µm si hay polvo caliente). Es un caso ideal para **comparar espectros de dos fechas**. [INFERENCIA]
- La variabilidad complica la resta: una variable deja un residuo **simétrico** (positivo o negativo en el mismo lugar), no un dipolo. Ese es el rasgo que el clasificador debe distinguir de un objeto que se mueve. [INFERENCIA]

## 4. Asteroides y cometas: cuánto se mueven

[INFERENCIA, cálculo con la velocidad orbital de la Tierra, ~30 km/s, que a 1 UA de distancia aparente da ~148″/h para un objeto fijo]
| Objeto | Movimiento aparente típico | En 113.6 s | Entre exposiciones de una temporada (horas–días) |
|---|---|---|---|
| NEO cercano | decenas a cientos de ″/min | puede dejar traza | sale del campo chico |
| Cinturón principal en oposición | ~0.25°/día ≈ 35–40″/h | ~1″ (puntual) | decenas de píxeles en horas → **se ve muy bien en video** |
| Objeto transneptuniano (~40 UA) | ~3″/h | puntual | pocos píxeles por día |
| "Planeta X" a ~500 UA | ~0.3″/h ≈ 7″/día (dominado por la paralaje de la Tierra) | puntual | ~1 px/día |

- Un repo rival reporta haber encontrado a Plutón a 8.7″/día en 4 visitas. [SECUNDARIO] https://github.com/ShivenKhurana1/spherex-timelapse
- Consecuencia [INFERENCIA]: los asteroides son **el objetivo más visual** del flipbook (se mueven mucho dentro de una temporada). Las enanas marrones son **el objetivo más científico** (se mueven poco entre temporadas). La herramienta necesita dos escalas de tiempo: "dentro de la temporada" y "entre temporadas".
- MOST de IRSA da las imágenes donde estuvo un objeto conocido: sirve como verdad de terreno. [VERIFICADO] https://irsa.ipac.caltech.edu/Missions/spherex.html

## 5. Ciencia ciudadana: qué funciona con el público

- **Backyard Worlds: Planet 9** (Zooniverse, financiado por NASA): los voluntarios ven **flipbooks** de unos pocos cuadros de unWISE (coadds de WISE/NEOWISE, más profundos), parpadeando años de datos; buscan enanas marrones y, de paso, el Planeta 9. Los voluntarios crearon **WiseView**, un visor web de animaciones. Primer hallazgo oficial: WISEA 1101+5400 (T5.5) en junio de 2017. Su sucesor es **Backyard Worlds: Cool Neighbors** (junio de 2023). [SECUNDARIO: Wikipedia y prensa] https://en.wikipedia.org/wiki/Backyard_Worlds
- El enunciado dice que la mayoría de los cometas y enanas marrones conocidos los descubrieron voluntarios con este método. [VERIFICADO: texto del reto]
- Lo que funciona [INFERENCIA, a partir del diseño de esos proyectos]: (1) cuadros pocos y coadd profundo, no cientos de cuadros ruidosos; (2) una tarea binaria ("¿se mueve algo?"); (3) retroalimentación con objetos conocidos (práctica); (4) crédito visible al descubridor; (5) un foro o canal para el seguimiento experto.
- Lo que les falta y SPHEREx puede dar [INFERENCIA]: **el espectro**. Un voluntario de Backyard Worlds ve un punto rojo que se mueve; un usuario de SPHEREx puede ver además que tiene metano.

## Fuentes
- https://arxiv.org/abs/2607.00543 (abstract leído)
- https://astrobiology.com/2026/10/09/spherex-telescope-sees-menagerie-of-brown-dwarfs/
- https://web3.arxiv.org/pdf/1405.7350 · https://skyandtelescope.org/astronomy-news/suns-new-chilly-neighbor/
- https://arxiv.org/abs/astro-ph/0309256
- https://en.wikipedia.org/wiki/Mira_variable
- https://arxiv.org/abs/1511.01688 · https://arxiv.org/abs/1903.06423
- https://en.wikipedia.org/wiki/Backyard_Worlds
- https://github.com/ShivenKhurana1/spherex-timelapse
