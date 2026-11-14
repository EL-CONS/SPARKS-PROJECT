# Reglas de Veredicto Físico · Sparks

> **Sprint 13:30 a 14:30** · Asignación de Horacio · Rama: `Horacio`  
> **Entrega:** `docs/sprint-13-30/reglas-veredicto.md` y `docs/sprint-13-30/verdad-terreno.csv`

---

## 1. Tabla de Decisión (Jerarquía de Dos Pasos)

El clasificador opera mediante una jerarquía física interpretable en dos etapas: primero evalúa la cinemática espacial (movimiento vs variabilidad vs estático) y posteriormente analiza las propiedades espectrofotométricas infrarrojas y los cruces astrométricos.

| Paso | Condición física | Clase asignada | Umbral y Justificación | Razón reportada al usuario |
|---|---|---|---|---|
| **1** | Residuo sin dipolo ($\Delta x < 0.1\text{ px}$) y cambio de flujo multitemporal | `variable` | Flujo residual neto $\int \Delta I \ne 0$ con centroide estático ($< 0.05\text{ px}$). Casos Mira (R Dra) y T Tauri (RW Aur). | "residuo sin dipolo: cambia de brillo, no de posición" |
| **2a** | Dipolo de movimiento ($\Delta x \ge 0.3\text{ px}$) + Absorción de Metano profunda | `enana marron` | **$\text{CH}_4 \ge 0.5$** (absorción en $3.3\,\mu\text{m}$, D4). Es diagnóstica de atmósferas moleculares frías ($T < 1400\,\text{K}$). Aplica incluso si tiene contraparte en Gaia (e.g. $\epsilon$ Indi B). | "se mueve y presenta absorción profunda de metano en 3.3 µm" |
| **2b** | Dipolo de movimiento ($\Delta x \ge 0.3\text{ px}$) + Cociente infrarrojo medio/cercano alto + Ausente en Gaia | `enana marron` | **$F_{\text{D6}} / F_{\text{D2}} \ge 10.0$** (límite inferior medido en WISE 0855 es 10.88) y **no detectada en Gaia DR3** ($G > 20.7$). | "se mueve, no está en Gaia y su cociente de flujo infrarrojo D6/D2 es alto" |
| **2c** | Dipolo de movimiento ($\Delta x \ge 0.3\text{ px}$) + Contraparte en Gaia DR3 + Color óptico/absoluto de enana blanca | `enana blanca` | En Gaia DR3: **$M_G > 10$** (donde $M_G = G + 5 + 5\log_{10}(\varpi/1000)$) y color azul **$G_{\text{BP}} - G_{\text{RP}} < 0.8$**. En SPHEREx: cociente frío bajo ($F_{\text{D6}}/F_{\text{D2}} < 0.3$) y sin metano. | "se mueve, tiene contraparte óptica en Gaia con alta temperatura y baja luminosidad (enana blanca)" |
| **2d** | Dipolo de movimiento ($\Delta x \ge 0.3\text{ px}$) + Contraparte en Gaia DR3 | `estrella` | Detección confirmada en Gaia DR3 con movimiento propio y paralaje estelar estándar, sin firma de metano. Aplica cuando falta dato de frío (e.g. Barnard). | "se mueve y tiene contraparte óptica en Gaia" |
| **3** | Salto ultra-rápido intra-temporada ($> 10''/\text{h}$) + Efemérides JPL Horizons | `asteroide` | Movimiento de decenas de píxeles en horas concordante con la eclíptica. Cruce positivo en API de JPL Horizons. | "movimiento rápido dentro de la temporada coincidente con el Sistema Solar" |
| **Defecto**| Se detecta residuo o dipolo pero sin cruce ni firma concluyente | `sin clasificar` | No cumple umbrales de metano, cociente frío ni entrada en catálogos de referencia. | "candidato a mover sin contraparte ni firma fría concluyente" |

---

## 2. Análisis de Casos Especiales

### 2.1. El caso de la Enana Blanca (Van Maanen's Star)
* **El problema:** En `prototipo/veredicto.py`, Van Maanen fallaba porque se clasificaba como `estrella`. En SPHEREx, Van Maanen presenta un cociente de flujo $F_{\text{D6}}/F_{\text{D2}} = 0.16$ y una profundidad de metano de $-0.34$.
* **¿Es separable de una estrella ordinaria solo con SPHEREx?**
  * **No con fotometría infrarroja pura:** Tanto las enanas blancas como las estrellas calientes ordinarias (tipos A, F, G tempranas e incluso enanas M en longitudes de onda largas) se encuentran en la cola de Rayleigh-Jeans en el infrarrojo medio ($F_\lambda \propto \lambda^{-4}$), arrojando cocientes $F_{\text{D6}}/F_{\text{D2}} < 0.3$ y ausencia total de absorción de metano. Por tanto, el espectro infrarrojo por sí solo no distingue una enana blanca de una estrella normal caliente.
  * **Sí al integrar Gaia DR3:** Van Maanen tiene paralaje $\varpi = 232.5\,\text{mas}$ y $G = 12.37$, lo que resulta en una magnitud absoluta $M_G \approx 14.2$. En el diagrama Hertzsprung-Russell de Gaia, se ubica más de 9 magnitudes por debajo de la secuencia principal.
  * **Regla adoptada:** Para clasificar como `enana blanca`, el motor debe consultar la magnitud absoluta de Gaia DR3 ($M_G > 10$) y su color óptico azul ($G_{\text{BP}} - G_{\text{RP}} < 0.8$). Si no se cuenta con la fotometría de Gaia en el pipeline, debe reportarse con honestidad como `estrella (subtipo enana blanca según catálogo externo)`.

### 2.2. El caso de Epsilon Indi B
* **El problema:** Epsilon Indi B es una enana marrón confirmada (binaria T1+T6). Sin embargo, tiene entrada en Gaia DR3 (debido a su proximidad y al sistema con $\epsilon$ Indi A), su cociente de flujo D6/D2 es $1.73$ (no supera el umbral estricto de $10.0$ de WISE 0855) y tiene metano medido en $0.81$.
* **Criterio correcto:** La absorción profunda de metano ($\text{CH}_4 \ge 0.5$ en la banda de $3.3\,\mu\text{m}$) es una firma molecular física inequívoca que solo existe en atmósferas frías ($T < 1400\,\text{K}$). Exigir que una enana marrón "no esté en Gaia" es un artefacto de los objetos ultrafríos tipo Y como WISE 0855, pero falla en enanas T tempranas o sistemas ligados.
* **Solución:** Evaluar primero la condición de metano ($\text{CH}_4 \ge 0.5$). Si se cumple, se clasifica como `enana marron`, independientemente de si tiene o no contraparte en Gaia.

### 2.3. Tratamiento de datos faltantes (e.g. Barnard's Star)
* En campos como Barnard's Star, Teegarden o Wolf 359, el campo `cold` es `None` en `results.json` (no se calculó el índice de frío).
* **Solución:** Si un objeto tiene dipolo de movimiento confirmado ($\Delta x \ge 0.3\text{ px}$) y contraparte en Gaia DR3, y no hay datos de absorción de metano ni exceso infrarrojo extremo, la regla por defecto asigna `estrella` con la razón *"se mueve y tiene contraparte óptica en Gaia"*.

---

## 3. Clase Asteroide y JPL Horizons

* **Factibilidad técnica:** La API de JPL Horizons responde con éxito (HTTP 200) y permite generar efemérides en segundos.
* **Situación con los datos actuales:** En los 5 campos precalculados de prueba (Barnard, WISE 0855, $\epsilon$ Indi B, RW Aurigae, R Draconis), las observaciones corresponden a parches fijos de $4'$ centrados en estrellas o enanas marrones específicas donde no hay asteroides brillantes conocidos cruzando durante las exposiciones.
* **Conclusión:** La clase `asteroide` se mantiene definida conceptual y algorítmicamente en la tabla de reglas (salto rápido intra-temporada $+ \text{JPL Horizons}$), pero se aclara que en el conjunto de prueba actual no hay ningún asteroide para evaluar directamente.

---

## 4. Prueba del Clasificador sobre el Split de Desarrollo

El archivo de verdad de terreno (`docs/sprint-13-30/verdad-terreno.csv`) divide los objetos de manera estricta entre `desarrollo` y `prueba`.

Evaluando la regla refinada sobre los objetos de desarrollo disponibles en `results.json`:
- **Objetos de desarrollo en `results.json`:**
  - `barnard`: verdad = `estrella` $\rightarrow$ veredicto = `estrella` (Acierto)
  - `teegarden`: verdad = `estrella` $\rightarrow$ veredicto = `estrella` (Acierto)
  - `wolf359`: verdad = `estrella` $\rightarrow$ veredicto = `estrella` (Acierto)
  - `kapteyn`: verdad = `estrella` $\rightarrow$ veredicto = `estrella` (Acierto)
  - `t503424`: verdad = `estrella` $\rightarrow$ veredicto = `estrella` (Acierto)
  - `wise0855`: verdad = `enana marron` $\rightarrow$ veredicto = `enana marron` (Acierto)
  - `epsindib`: verdad = `enana marron` $\rightarrow$ veredicto = `enana marron` (Acierto, capturado por metano $\ge 0.5$)
  - `vanmaanen`: verdad = `enana blanca` $\rightarrow$ veredicto = `enana blanca` (Acierto, integrando criterio Gaia $M_G > 10$)
  - `rwaur`: verdad = `variable` $\rightarrow$ veredicto = `variable` (Acierto)
  - `rdra`: verdad = `variable` $\rightarrow$ veredicto = `variable` (Acierto)
- **Acierto en desarrollo:** **10/10 (100%)**.
- **Conjunto de prueba congelado:** Los campos `lacaille9352` (t452800), `gliese1` (t744064) y `t605760` permanecen en el split de `prueba` y no fueron utilizados para calibrar los umbrales.
