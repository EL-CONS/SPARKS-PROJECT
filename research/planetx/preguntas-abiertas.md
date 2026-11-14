# Preguntas abiertas (Planet X × SPHEREx)

Actualizado: 2026-11-05. Formato: pregunta → por qué importa → a quién o cómo se resuelve.

## Reto y logística
1. ¿Qué publica la pestaña **Resources** del reto el 13 nov? ¿Recomienda datasets o herramientas concretas? → revisar el 13 nov.
2. ¿La guía de **envío 2026** mantiene video ≤ 30 s / ≤ 7 diapositivas y las reglas de IA ("SI")? ¿Y la de **jueceo 2026**, los 5 criterios? → guías del 13 nov.
3. **Cosmonautas sigue inscrito en *Harmonization***. ¿Hasta cuándo se puede cambiar de reto? → plataforma / líder local.
4. Rúbrica local, duración del pitch, formato (¿proyector? ¿demo en vivo?), entregables locales exactos (el brief menciona repo, app, página en inglés, video, Canva, 3 min; ninguna fuente pública lo confirma) → líder local.
5. ¿La sede está abierta de noche entre el sábado 20:00 y el domingo 8:00? → líder local.
6. ¿La red de la UTH llega a irsa.ipac.caltech.edu, cdn.jsdelivr.net y **aladin.cds.unistra.fr / alasky** (desde la red del equipo, CDS dio timeout)? ¿Bloquea algo? → líder local / prueba con teléfono.
7. ¿Se puede pedir al jurado que escanee un QR durante el pitch? → líder local.
8. Proyectos 2026 en **Space Apps Connect** (no revisado; requiere sesión) → revisar con la cuenta del equipo.

## Datos SPHEREx
9. **WISE 0855 y R Dra no tienen imágenes QR3** (sí QR2). ¿Falta ingerir la temporada de otoño 2026 o es rezago de la SIA? → volver a consultar el 13 nov; mirar los directorios navegables `qr3/level2/2026W4*`.
10. ¿QR2 y QR3 son **disjuntos en el tiempo** siempre (QR2 hasta ~jul-2026, QR3 desde ~ago-2026)? ¿QR3 va a reprocesar lo anterior? → IRSA helpdesk / Explanatory Supplement.
11. **Canales por detector**: la doc de "Spectral Channels" dice índices **0–18** (19) por detector, pero las 102 bandas implican 17. ¿Cambió en QR3? → Explanatory Supplement (PDF, no descargado por tamaño) / helpdesk.
12. ¿El servicio de **cutouts** permite **omitir el HDU PSF** (5 MB por cutout)? → doc IBE / helpdesk. Si no, recortar en el servidor.
13. **Límites de uso** de SIA y cutouts (peticiones por segundo o concurrencia) → helpdesk IRSA.
14. ¿Hay **CORS** en IRSA (SIA, IBE) para llamadas desde el navegador? → prueba el sábado.
15. **Magnitud de saturación** de SPHEREx por banda: ¿saturan Barnard, ε Indi A, R Dra? → Explanatory Supplement / artículo de instrumento (Korngut et al. 2026).
16. ¿La **colección deep** (`spherex_qr3_deep`) tarda siempre más de 20 min en la SIA o fue algo puntual? → reintentar.
17. ¿La lectura parcial de MEF en **S3** (`fsspec` + `Cutout2D`) es más rápida que IBE para nuestro caso? → prueba el sábado.
18. ¿Existe una **API de MOST** usable desde el backend? → doc de MOST.

## Ciencia
19. Coordenadas y movimiento propio de **Barnard** (μ ≈ 10.4″/año) y **ε Indi B** verificados con Gaia DR3 o SIMBAD: hoy no respondieron (CDS sin conexión, Gaia saturado o lento). → reintentar; usar VizieR o ESA TAP.
20. ¿**WISE 0855** está en Gaia DR3? (La frase "Gaia no la ve" depende de esto.) → consulta de cono en Gaia.
21. ¿El S/N de WISE 0855 en coadds D5/D6 por temporada alcanza para un centroide de ~0.3–0.5″? → medir el sábado (corte de las 14:30).
22. ¿Qué amplitud tiene R Dra en el IR cercano (no en V)? → literatura (AAVSO/2MASS) si sobra tiempo.
23. ¿RW Aur está en un estado oscuro o brillante en 2025–2026? → AAVSO.
24. ¿El espectro SPHEREx de WISE 0855 está publicado (Rustamkulov et al. 2026 incluye Y4)? Serviría para validar nuestro espectro al vuelo. → leer el artículo (arXiv 2607.00543).

## Producto y ML
25. ¿Qué host del backend aguanta astropy + reproject + LightGBM gratis sin un arranque en frío fatal? → probar el sábado temprano.
26. ¿Aladin Lite v3 tiene `displayFITS` o un equivalente para superponer nuestro coadd? (Solo vi la doc v2.) → doc API v3.
27. ID exacto de Gaia DR3 en VizieR para `catalogFromVizieR` (¿`I/355/gaiadr3`?) → doc VizieR.
