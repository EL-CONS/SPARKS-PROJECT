# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
Vite + React 18 + TypeScript en `/app` (actualizado el 2026-11-14 por el encargo del frontend; reemplaza la decisión de TS vanilla del 2026-11-05). Cons es dueño de `app/src/core/`, `app/src/data/`, `app/src/i18n/` y `app/tests/`; el diseño vive en `app/src/ui/`, `app/src/styles/` y `app/index.html`. Datos de ejemplo servidos desde `data-sample/` en `/data-sample/`. Sin dependencias de pago.

## Users
Público general. Sparks existe para hacer accesibles al gran público los temas de cuerpos espaciales (objetos que se mueven, enanas marrones y frías) sin perder rigor científico. Quien llega escribe una posición del cielo (RA/Dec) o pulsa un objetivo de prueba, y debe entender en segundos qué se mueve. Audiencia secundaria: el jurado local del NASA Space Apps 2026 en Hermosillo (mentores de Mexsat, físicos e ingenieros no astrónomos), que evalúa Impact, Creativity, Validity, Relevance y Presentation.

## Product Purpose
Herramienta web pública para el reto "Planet X and SPHEREx". Convierte el archivo del telescopio SPHEREx (NASA/IPAC, 102 colores infrarrojos, 6 detectores) en un flipbook del cielo: se alterna lo observado en distintas épocas, como el comparador de parpadeo con el que Tombaugh halló Plutón en 1930, para ver qué se mueve. Además mide movimiento propio con barra de error y ofrece una huella espectral de 102 colores con un índice de frío. Éxito: alguien sin formación astronómica ve moverse un objeto (p. ej. la estrella de Barnard), entiende por qué, y puede verificar la cifra.

## Positioning
Hace con SPHEREx lo que Tombaugh hizo con placas fotográficas: parpadeo de imágenes para cualquier punto del cielo, con medida honesta (movimiento propio contra Gaia/CatWISE, con error) y ciencia reproducible, no un visor de imágenes ni un buscador de "descubrimientos". Lema: "Every spark that moves has a fingerprint." (pendiente de confirmación final del equipo).

## Operating Context
Se usa en un navegador, en escritorio y en teléfono (hay QR). El estado completo viaja en la URL (`?ra=&dec=...`), la herramienta es incrustable (`<iframe>`, `embed=1`), bilingüe EN/ES. Se presenta en vivo en un hackatón presencial (Hermosillo, UTC−7; hackatón sáb 14 nov, entrega local dom 15 nov, límite duro 12:00 hasta confirmar). Entregables: app desplegada, repo documentado, página del equipo en inglés, video de 30 s o menos en inglés, presentación en Canva, pitch de 3 a 5 minutos.

## Capabilities and Constraints
- Entrada RA/Dec (sexagesimal y decimal) y cinco objetivos de prueba obligatorios: Barnard's Star, ε Indi B, WISE 0855−0714, RW Aurigae, R Draconis.
- Flipbook de seis paneles (uno por detector) con play/pausa/paso/velocidad; modos parpadeo, suma, resta, resta de mediana; selector de temporadas y de campo de visión.
- Azul = dónde estaba, ámbar = dónde está, flecha = hacia dónde va.
- Huella de 102 celdas (6 × 17), espectros al vuelo, panel de metadatos y banderas de contaminación, catálogos Gaia/WISE superpuestos, Aladin Lite 3.8.2, Astropy.
- Las imágenes de píxel enorme (6.15″) y pocas épocas limitan lo medible: paralaje no se mide (se resta con valor publicado); Barnard, RW Aur y R Dra saturan.
- Fuente de verdad de números: `results/results.json`. Ningún número sin fuente o corrida real; lo no medido se marca pendiente.
- Terminología: "candidatos para revisar", nunca "descubrimientos". El índice de frío es un índice, no una temperatura (corregir la presentación actual en kelvin, ver B2).
- La estética nunca altera los datos científicos.
- Abierto: R1 desplegada sin URL; campo de visión grande solo en vivo; fondo HiPS de Aladin depende de CDS.

## Brand Commitments
- Lema "Every spark that moves has a fingerprint." y el código de color azul (antes) / ámbar (ahora) / flecha (destino).
- Logo existente en `Logo/` (símbolo de chispa, horizontal, mono, animado, favicons): se conserva.
- Tono humilde, frases cortas, sin jerga ni relleno; "candidatos", nunca "descubrimientos".
- Concepto central: el comparador de parpadeo de Tombaugh (1930).
- El diseño manda para el equipo: la estética es prioridad, siempre dentro del rigor científico.

## Evidence on Hand
Datos reales de ejemplo en `data-sample/`, resultados en `results/results.json`, modelos en `models/`, documentación en `docs/` (methods.md, compliance.md, design-audit.md), investigación en `research/`, branding explorado en `branding/sparks/`. Pruebas: `make test` (17 pytest, parser de coordenadas, `check_numbers.py`) y 33 checks e2e no reverificados. No existen testimonios ni clientes; no inventarlos. Falta un campo con asteroide.

## Product Principles
1. Rigor visible: cada cifra trae fuente y barra de error; lo no medido se declara.
2. Primero ver, luego entender: el parpadeo es el héroe; la explicación llega cuando se pide.
3. Accesible sin simplificar mal: lenguaje de humano para el público general, profundidad científica a un paso.
4. Candidatos, no descubrimientos: humildad como postura.
5. El producto real es la prueba: datos reales, no ilustraciones.

## Accessibility & Inclusion
Bilingüe EN/ES. Funciona en teléfono (390 px) y escritorio (1440 px). El parpadeo exige control de pausa y velocidad; fechas en ISO/UTC por rigor. Otros estándares no establecidos todavía.
