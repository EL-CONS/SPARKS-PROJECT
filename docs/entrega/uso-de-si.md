# Declaración de uso de herramientas de Superinteligencia (SI)

**Marco normativo:** regla 2 de `docs/reto/normas.md` (en `origin/joako`, basada en *NASA Space Apps Challenge 2026 Participant FAQs*, versión del 13 de noviembre de 2026). El reglamento oficial denomina **Superinteligencia (SI)** a los modelos de lenguaje, asistentes de código, generación de texto/imágenes y agentes de desarrollo, y exige describir honestamente cómo se utilizaron durante el hackatón.

---

## 1. Registro verificable en el repositorio (`git log` y `skills-lock.json`)

Una inspección directa de `git log --all` muestra los siguientes rastros objetivos de asistentes de SI en commits del repositorio:

| Evidencia en Git / Repo | Alcance registrado en el historial |
|---|---|
| `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` | **16 commits** (todos bajo el autor Git `Joaco2025`): planes por sprint, reglas del reto, diseño e iteraciones visuales (`Constelacion`, `Escotilla`, `Planetario`), `ml-clasificador/` y prompts de coordinación. |
| `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` | **34 commits** (todos bajo el autor Git `Joaco2025`): capa de copia e interfaz, `Starfield`, `Insights`, hook de estado, clasificador Random Forest v1/v2 (`ml-clasificador/`) y documentación. |
| `skills-lock.json` | Paquetes de habilidades cargados en el entorno de agentes: `astropy`, `design-taste-frontend`, `frontend-design`, `ui-ux-pro-max`, `web-design-guidelines`, `webapp-testing`. |

En las ramas de **Cons** (`EL-CONS`), **Horacio** (`NeruX`) y **Carlos** (`ComputerChemistry`) los commits no llevan trailer `Co-Authored-By`. Durante el trabajo de la rama `carlos` el sábado 14 de noviembre sí se utilizaron asistentes/agentes de programación en terminal e IDE (incluidos modelos de lenguaje como Gemini / Antigravity y agentes de terminal) para redactar scripts, pruebas en navegador y documentación.

> **Dato pendiente de confirmar antes de enviar en `spaceappschallenge.org`:** `[CONFIRMAR CON CONS Y HORACIO]` la lista exacta de herramientas/editores de SI que usaron en sus sesiones locales (`cons` y `Horacio`), para no omitir ni inventar herramientas no registradas en los trailers de Git.

---

## 2. Para qué se usaron herramientas de SI

1. **Código y scripts auxiliares:**
   - Redacción y refactorización de componentes React/TypeScript de la aplicación (`app/`), pruebas unitarias y cargadores (`origin/cons`, `origin/joako`).
   - Scripts de entrenamiento y paridad del clasificador de clase (`ml-clasificador/entrenar.py`, `entrenar_v2.py`, `predecir.mjs`, `probar-paridad-v2.mjs` en `origin/joako`).
   - Scripts en Python estándar para verificación de acceso/cobertura (`docs/sprint-13-30/cobertura.py`) y descarga de recortes sin `EPSF` (`docs/sprint-13-30/recortes.py`), más la página mínima de prueba CORS/Range en navegador (`docs/sprint-13-30/s3-range-test.html`) en `carlos`.
2. **Investigación y verificación técnica:**
   - Estructuración de consultas SIA/TAP de IRSA, Gaia DR3 y SIMBAD (espejo de Harvard), y diagnóstico de fallos reales (HTTP `503` intermitentes, `/SIA2` → `404`, `spherex_qr2` → `0` filas en SIA, `Content-Range` oculto por CORS en S3, orden big-endian en FITS `BITPIX = -32`).
3. **Diseño e interfaz:**
   - Iteraciones visuales (`Constelacion`, `Escotilla`, `Planetario`), soporte de modo oscuro/claro, bilingüe ES/EN, gráfica polar de mira telescópica y controles accesibles por teclado.
4. **Documentación y piezas de entrega:**
   - Redacción y edición de reportes por sprint, guion de video, esquema de diapositivas, página del equipo, este documento y la lista de QA.

---

## 3. Qué revisó, probó y corrigió una persona

Las salidas generadas con apoyo de SI no se aceptaron a ciegas; las personas del equipo ejecutaron verificaciones independientes y corrigieron errores concretos:

- **Revisión científica del clasificador ML (Horacio, documentado en `ml-clasificador/README.md`):** Horacio detectó que la versión v1 (`91.7%` en 36 objetos) estaba inflada por fuga de sesgo de distancia en tres variables (`movimiento propio`, `paralaje`, `magnitud G`) y porque los valores faltantes se interpretaban como enana marrón. Con esa corrección humana se construyó la v2 con solo 4 variables de luminosidad/color y banderas de disponibilidad sobre 69 objetos (`75.4%` LOO, `p = 0.032`), y además Horacio identificó el error de etiqueta de `Wolf 489` (`Gaia DR3 3713594960831605760`) en el CSV de entrada.
- **Corrección de coordenadas y saturación (Horacio y Carlos, `docs/sprint-13-30/entrega-horacio.md`):** se detectaron y corrigieron coordenadas mezcladas entre `ε Indi A` (`330.8404 / −56.7869`) y `ε Indi B` (`331.0441 / −56.7828`), la posición de `R Draconis` (`248.1674 / +66.7550`), la falta de cobertura de `WISE 0855` en `QR3` y la saturación de `R Draconis` en `534/534` cuadros.
- **Pruebas reales contra IRSA y S3 (Carlos):**
  - Ejecución en vivo de `109` consultas SIA sobre `36` objetos (`0` celdas sin verificar en `docs/sprint-13-30/cobertura.csv`).
  - Descarga real y validación de cabeceras FITS sobre los `578` recortes en disco (`0/578` con `EPSF`).
  - Ejecución en vivo en Firefox headless de `s3-range-test.html` (`14-nov-2026`, `22:08–22:15 MST`): corrigió el corte fijo inicial de `23,040 B` en cabeceras, el manejo de `Content-Range=null` por CORS, la lectura big-endian y la inversión `TAN + SIP`, verificando igualdad exacta contra Python (`fnv1a=1bc318be`).
- **Reglas de honestidad, pruebas automáticas y cumplimiento:** Cons ejecutó las pruebas unitarias en `app/tests/` y la verificación de paridad JS/Python (`probar-paridad-v2.mjs`); Joaquín revisó el reglamento oficial (`docs/reto/normas.md`), aplicó el protocolo de prueba congelada una sola vez y auditó que ninguna cifra se publicara sin fuente o con afirmaciones de "descubrimiento".
