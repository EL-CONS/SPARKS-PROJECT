# 05 · Competencia 2026

Consulta: 2026-11-05. Método: búsqueda web, `gh search repos spherex --created ">2026-08-01"` (60 resultados, unos 45 relevantes) y lectura del inicio del README de 14 repos. Todo lo que se dice de los repos es [SECUNDARIO: README], no probado. Space Apps Connect no se revisó (requiere sesión) → preguntas abiertas.

## Contexto
- **587 equipos** inscritos en el reto en todo el mundo. [VERIFICADO] https://www.spaceappschallenge.org/2026/challenges/planet-x-and-spherex/?tab=teams
- Hay al menos **15 repos con app o pipeline funcional** desde septiembre u octubre: varios equipos ya están muy avanzados aunque la FAQ diga que no se empiece antes. [SECUNDARIO: fechas de los repos] Para el jurado global, nuestro proyecto competirá contra proyectos de **semanas**, no de 13.5 h. [INFERENCIA]
- En Hermosillo no hay ningún otro equipo en este reto. [VERIFICADO] ?tab=teams de la sede

## Tabla

| Proyecto (repo) | Qué hace | Datos | Interfaz | ML | Fortalezas | Huecos |
|---|---|---|---|---|---|---|
| SPHEREx Time-Lapse (ShivenKhurana1/spherex-timelapse) | Video, blink, resta contra la mediana, rastro coloreado por fecha, stack profundo; seguir objetos conocidos; buscar cambios y tracklets | SIA/cutouts, JPL Horizons, IMCCE Miriade | Todo en el navegador, desplegado | No (reglas) | El más completo en lo visual; encontró a Plutón | Sin espectros ni clasificación; sin validación cuantitativa en el README |
| SPHEREx Explorer (minhaz-42) | Línea de tiempo QR2+QR3, comparación (blink, lado a lado, resta) **solo si λ coincide**, espectro y curva de luz al mismo λ, JPL, "Ask assistant" | QR2+QR3, Sesame, JPL | Web | Asistente (LLM) | El más riguroso con λ | El ML es un chat; sin detector entrenado |
| SPHEREx Planet X Explorer (epsretriever) | Pipeline offline: fuentes → rechazar estrellas → enlazar tracks → score → WebP; "leads" sin explicar; **página de límites con objetos simulados** | S3, IRSA TAP, JPL SBIdent/Horizons | Next + Cloudflare Worker, desplegado | "AI search" | Mide completitud con inyección: el rival más serio en validez | Centrado en Planeta X; poca atención a enanas marrones y espectros |
| GhostShift (ahmedatta3322) | Resta dos barridos, detecta lo que aparece o desaparece, etiqueta con MPChecker, track de asteroides | SIA + cutouts, MPC | Visor estático | No | Pipeline claro y documentado | Solo dos épocas y asteroides |
| PlanetX × SPHEREx (gitmahin) | Aladin para elegir punto, slider/blink entre dos fechas, círculo rojo en lo nuevo, trazar ruta | IRSA | React + backend | Detección simple | Usa Aladin como pide el reto | Dos fechas; sin espectro |
| SkyShift (Mahadi5577) | "Zoom en el tiempo" (horas → año), juego "Hunt Planet X" con movers falsos plantados | IRSA, cache | Local (Python) + estático en Pages | No | **Gamificación con entrenamiento** | Hay que correrlo local; el demo en línea es limitado |
| spherex-moving-sky (shrestha-droid) | Objetos que se mueven validados contra asteroides de JPL; modo Planeta X probado con Makemake; espectro por asteroide | IRSA, JPL | Web | ? | Validación contra objetos conocidos | README no leído completo |
| spherex-prospector (MertAkm) | Objetos que se mueven + "IA" sobre el espectro de 102 bandas para composición de asteroides | IRSA | ? | Sí (composición) | **El único que usa el espectro con ML** | Sin detalle de validación |
| NOVAX (englszz, en español) | Dos FITS D1: resta ZODI, alinea, compatibilidad λ, DAOStarFinder 8σ, SkyBoT, ajuste de ePSF; 218 detecciones explicadas, "no hay Planeta X" | QR2, ePSF | Vercel | No | Honestidad y rigor de pipeline | Un solo detector y un par de épocas |
| planet-x (shengdynasty) | Lento-movedores, cruce con JPL, cielo 3D, revisión humana | Simulado por defecto; real con servidor local | Estático + Node | No | "Candidato para revisión, nunca detección" | El demo público es simulado |
| tracklet (lemoon01110) | Distancia por paralaje de objetos que se mueven | IRSA | Navegador | No | Idea física original | README vacío vía API |
| NoSleepClub Sky Lab (dakiemdarktharr) | Comparación temporal, astrometría de WISE 0855, revisión humana, controles de señal | IRSA, WISE | Vercel | No | Trabaja un objetivo del reto a fondo | En vietnamita |
| YLMA SPHEREx Explorer (ylmaspace, España) | Aladin + FastAPI, observaciones y preguntas educativas | IRSA | Web | No | Educativo | Sin movimiento propio claro |
| spherex-blink, SPHEREx-Blink, skyshift-spherex, spherex-explorer ×3, etc. | Variantes de blink o visor | IRSA | Web | No | — | Genéricos |

Fuentes: https://github.com/ShivenKhurana1/spherex-timelapse · https://github.com/minhaz-42/spherex-explorer · https://github.com/epsretriever/spherex-planet-x · https://github.com/ahmedatta3322/ghostshift · https://github.com/gitmahin/planetx-spherex · https://github.com/Mahadi5577/skyshift · https://github.com/shrestha-droid/spherex-moving-sky · https://github.com/MertAkm/spherex-prospector · https://github.com/englszz/novax-space-data-lab · https://github.com/shengdynasty/planet-x · https://github.com/lemoon01110/tracklet · https://github.com/dakiemdarktharr/nosleepclub_nasa_spherex · https://github.com/ylmaspace/spherex-project [todos SECUNDARIO: README]

## Patrones

**Lo que hace casi todo el mundo** [INFERENCIA a partir de la tabla]:
- Blink o slider de dos fechas, resta, círculo en "lo nuevo".
- Cruce con asteroides conocidos (JPL, MPC, SkyBoT).
- Aladin o un mapa del cielo para elegir coordenadas.
- La palabra "Planet X" en el título.

**Lo que hacen pocos:**
- Respetar la longitud de onda al comparar (minhaz-42, NOVAX).
- Medir límites o completitud con objetos inyectados (epsretriever).
- Espectro al vuelo (minhaz-42, prospector, spherex-moving-sky).
- Gamificación con práctica (SkyShift).
- Coadd por detector (C3) explícito: pocos lo dicen.

**Lo que no vi en nadie** (en los README que leí):
1. **Clasificar el objeto que se mueve con su propio espectro**: "se mueve **y** tiene metano → enana marrón", juntando movimiento propio medido y forma espectral en un solo veredicto.
2. **Un clasificador real/artefacto entrenado con las banderas de SPHEREx** (GHOST, TRANSIENT, OUTLIER, SOURCE) más inyecciones con la ePSF, con curva de completitud publicada.
3. **Comparar el movimiento medido de SPHEREx contra el esperado de Gaia/CatWISE** como prueba de validez en vivo (flecha medida vs flecha esperada).
4. **Participación en vivo del público** (el jurado escanea un QR y su teléfono se vuelve parte del demo).
5. **Conexión local o cultural** (Sonora, cielos oscuros) y una **experiencia en español** para público latinoamericano.
6. **Sonificación** de las 102 bandas.

## Implicación
Ganar "por features" contra SPHEREx Time-Lapse o SPHEREx Explorer en 13.5 h no es realista. Hay que ganar por una idea que ellos no tienen (los puntos 1–3) y por presentación (4–5). [INFERENCIA]
