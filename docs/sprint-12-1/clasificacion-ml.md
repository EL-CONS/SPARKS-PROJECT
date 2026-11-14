# Clasificación de cuerpos celestes por movimiento con ML en SPHEREx

> **Sprint 12-1** · Asignación de Horacio · Rama: `Horacio`  
> **Pregunta de fondo:** ¿Se puede, con aprendizaje automático (ML), clasificar un cuerpo celeste según cómo se mueve (exoplaneta, estrella, enana café, asteroide, cometa, variable, etcétera)?

---

## Veredicto ejecutivo

**Respuesta corta:** **Parcial y estrictamente condicionado.** El movimiento cinemático puro en SPHEREx (desplazamiento en píxeles y dirección con base temporal de ~1 año y píxel de 6.15″) permite separar con claridad **tres grandes regímenes dinámicos**: (1) objetos del sistema solar rápido (asteroides y cometas intra-temporada, decenas de píxeles/día), (2) objetos de alto movimiento propio en el vecindario solar (enanas marrones frías y estrellas cercanas inter-temporada, 1–2 píxeles/año), y (3) objetos estáticos o variables (desplazamiento nulo, residuo simétrico). Sin embargo, el movimiento cinemático por sí solo **no** puede distinguir una estrella M cercana de una enana marrón tipo Y, ni clasificar subtipos espectrales. Para clasificar con rigor la naturaleza del cuerpo celeste, **el movimiento debe combinarse obligatoriamente con la firma espectroscópica en las 102 bandas de SPHEREx (0.75–5.0 µm)** y cruces de catálogos (e.g. Gaia DR3 para descartar óptico). Además, **clasificar exoplanetas por su movimiento directo en imágenes de SPHEREx es físicamente imposible** debido al tamaño de píxel (6.15″), la separación orbital angular (alrededor de 0.5″ para un análogo de Júpiter a 10 pc) y el enorme contraste estelar. Nuestra recomendación para Sparks es no intentar un modelo de ML multiclasificador de caja negra antes de la entrega; la regla física transparente combinada con índices espectrales ya resuelve la separación con 0 movedores adicionales sin verificar, y el ML (LightGBM) debe mantenerse como segunda opinión experimental.

---

## 1. ¿Es posible?

### 1.1. Información de movimiento disponible en SPHEREx
SPHEREx no es un telescopio de alta resolución espacial (como Hubble o JWST), sino una encuesta de cielo completo con resolución gruesa y muestreo espectral denso:
- **Escala de píxel:** $6.15''$ por píxel (FWHM óptico de $\sim 6.6''$ en Detector 6).
- **Base temporal (QR2 a QR3):** De 6 meses a 1.5 años entre visitas del mismo punto del cielo (en Barnard: 0.98 años; en WISE 0855: 0.99 años; en $\epsilon$ Indi B: 1.39 años).
- **Muestreo espectral:** 102 bandas continuas entre $0.75\,\mu\text{m}$ y $5.0\,\mu\text{m}$ repartidas en 6 detectores (D1 a D6).
- **Señal en la resta de imágenes:**
  - *Mover (objeto móvil):* Produce un **dipolo** (lóbulo negativo donde estaba antes, lóbulo positivo donde está ahora). En estrellas saturadas brillantes, genera lóbulos simétricos en las alas de la PSF a través del núcleo enmascarado.
  - *Variable:* Produce un residuo **monopolar simétrico** (aumento o disminución de flujo centrado en el mismo píxel, sin salto de centroide).
  - *Artefacto / Ruido:* Residuos aislados en un solo detector, bordes o halos de estrellas brillantes (banderas `GHOST`, `OVERFLOW`).

### 1.2. Qué clases sí, cuáles apenas y cuáles no

| Clase celeste | Régimen de movimiento | Desplazamiento en SPHEREx | ¿Separable por ML/Física? | Justificación y límites |
|---|---|---|---|---|
| **Asteroides del Cinturón Principal / NEOs** | Muy rápido ($35\text{--}40''/\text{h} \approx 0.25^\circ/\text{día}$) | Decenas de píxeles en horas; traza en exposiciones largas | **SÍ (Cinemática pura)** | Salto enorme dentro de una misma temporada. Cruce directo con efemérides (JPL Horizons / Minor Planet Center). |
| **Enanas Marrones Frías (T / Y)** | Medio ($\mu \sim 1\text{--}8''/\text{año}$) | $0.2\text{--}1.5\text{ px}$ entre temporadas | **SÍ (Cinemática + Espectro)** | En WISE 0855 el catálogo CatWISE2020 da $\mu = 8.09''/\text{año}$ ($1.30\text{ px}$ en $0.99\text{ años}$); Sparks midió $7.91 \pm 1.35''/\text{año} \rightarrow 1.27\text{ px}$ (coincidencia a $0.1\sigma$). El movimiento las aísla como dipolos de $\sim 1.3\text{ px}$. El clasificador **requiere** las bandas de SPHEREx: cociente de flujo frío $F_{\text{D6}}/F_{\text{D2}} \ge 10.88$ (límite inferior medido), absorción de $\text{CH}_4$ en $3.3\,\mu\text{m}$ y ausencia en Gaia DR3. |
| **Estrellas de Alto Movimiento Propio (HPM)** | Medio ($\mu > 1''/\text{año}$) | $0.2\text{--}2\text{ px}$ entre temporadas (e.g. Barnard $\mu = 10.39''/\text{año}$ da $1.66\text{ px}$ en $0.98\text{ años}$; Sparks midió $10.23''/\text{año} \rightarrow 1.63\text{ px}$) | **SÍ (Cinemática + Óptico)** | Dipolos claros en múltiples detectores. Se separan de enanas marrones porque sí tienen contraparte óptica visible y brillante en Gaia DR3 con paralaje concordante. |
| **Estrellas Variables (Miras, T Tauri)** | Nulo ($\mu \ll 0.1''/\text{año}$) | Desplazamiento $\ll 0.05\text{ px}$ | **SÍ (Separación de clase)** | No son movers. La resta arroja un residuo sin dipolo. En SPHEREx se identifican comparando el centroide de la diferencia contra el centroide estático y analizando curvas de luz. |
| **Cometas activos** | Rápido a medio | Varios píxeles/día + coma extendida | **APENAS (Límite)** | La cinemática los agrupa con asteroides; la separación requiere detectar morfología extendida (coma) o bandas volátiles ($\text{H}_2\text{O}$ en $1.9\,\mu\text{m}$, $\text{CO}_2$ en $4.26\,\mu\text{m}$). |
| **TNOs / Hipotético Planeta X** | Lento ($\sim 3''/\text{h}$ a $\sim 7''/\text{día}$ a $\sim 500\text{ UA}$) | $\sim 1\text{ px}$ en días (dominado por la paralaje terrestre) | **APENAS (Límite)** | Difícil de distinguir de asteroides distantes o ruido tenue con solo 2 o 3 épocas sin un seguimiento temporal de arco largo (*tracklets*). |
| **Exoplanetas** | Orbital estelar | Físicamente inobservable en píxeles de $6.15''$ | **NO (Físicamente imposible)** | Un análogo de Júpiter a $10\,\text{pc}$ tiene una separación máxima de $\sim 0.5''$ (y planetas más cercanos a su estrella mucho menos), quedando confinado en una doceava parte de un píxel y sepultado bajo un contraste estelar de $10^6\text{--}10^9$. No genera dipolo detectable independiente en SPHEREx. |

---

## 2. ¿Ya existe? (Estado del arte y trabajo previo)

La astronomía de objetos móviles en grandes censos ha desarrollado múltiples aproximaciones de detección y clasificación:

| Proyecto / Herramienta | Qué clasifica / detecta | Datos de entrada | Precisión / Rendimiento reportado | Licencia y Acceso al Código | Enlace |
|---|---|---|---|---|---|
| **Backyard Worlds: Planet 9 & Cool Neighbors** | Enanas marrones (T/Y), enanas blancas frías, objetos submóviles | Flipbooks de diferencias temporales en unWISE (W1/W2 a $3.4$ y $4.6\,\mu\text{m}$) | Inspección visual humana asistida por catálogos CatWISE2020; miles de enanas marrones confirmadas espectroscópicamente | Abierto (Zooniverse / WiseView libre) | [Backyard Worlds](https://backyardworlds.org/) · [WiseView](http://byw.tools/wiseview) |
| **ZTF DeepStreaks & Tail-Finder** | Asteroides con traza (NEOs) y cometas con cola | Recortes de imágenes de diferencia en Zwicky Transient Facility (óptico) | DeepStreaks: $>95\%$ de eficiencia en NEOs [sin verificar: tomado de abstract]; Tail-Finder: CNN binaria para actividad cometaria | Código público en GitHub (BSD-3-Clause); Duev et al. 2019 | [Duev et al. 2019 (MNRAS)](https://arxiv.org/abs/1904.05920) · [GitHub DeepStreaks](https://github.com/dmitryduev/deepstreaks) |
| **WMOPS (WISE Moving Object Pipeline)** | Asteroides y cometas del Sistema Solar | Detecciones transitorias en exposiciones individuales de NEOWISE | Vinculación de $4+$ detecciones en órbitas preliminares; base de datos NEOWISE Asteroid Catalog | Algoritmo institucional del IPAC/JPL (datos públicos en IRSA) | [IPAC NEOWISE WMOPS](https://wise2.ipac.caltech.edu/docs/release/neowise/) |
| **Gaia DR3 (CU7 Variability & Astrometry)** | Estrellas variables, binarias, astrometría de estrellas HPM | Series temporales fotométricas y astrométricas de alta resolución (milisegundos de arco) | Random Forest y redes neuronales clasificando $>10$ millones de fuentes variables con pureza $>90\%$ | Pipeline del consorcio DPAC; datos y modelos documentados en STScI / ESA | [Gaia DR3 Documentation](https://archive.stsci.edu/missions-and-data/gaia) |
| **HelioLinx / LSST Solar System Pipeline** | Enlace de tracklets de asteroides y TNOs | Coordenadas astrométricas y tiempos de encuestas ópticas | Enlace robusto sin asumir órbitas keplerianas previas; base del Rubin Observatory [sin verificar: citado por referencia] | Código abierto en GitHub (Holman et al. 2018) | [Holman et al. 2018 (AJ)](https://arxiv.org/abs/1806.07920) |

---

## 3. ¿Lo podemos implementar mejor o más claro?

### 3.1. Comparación con lo que ya tiene Sparks
Sparks cuenta actualmente con dos motores evaluados en la prueba final congelada (`models/report/final_test.md`):
1. **Regla física transparente (`candidates.py`):**
   - Evalúa dipolos de diferencia ($S/N \ge 5\sigma$ en $\ge 2$ detectores), balance de flujo, lóbulos simétricos en saturación a través del núcleo enmascarado, y diferencia monopolar para variables ($\ge 3$ detectores).
   - **Resultado en prueba final ciega (9 estrellas de Gaia DR3):** Recuperó **8 de 9 estrellas conocidas con 0 movedores adicionales sin verificar** sobre 541 candidatos.
2. **Spark Detector ML experimental (`ml.py` / LightGBM):**
   - Árboles de gradiente (LightGBM) con 21 variables, entrenado con fuentes inyectadas sintéticas con ruido real.
   - **Resultado en prueba final ciega:** Recuperó **6 de 9 estrellas conocidas con 10 movedores adicionales sin verificar**.

### 3.2. ¿Qué haría nuestra versión distinto o más explicable?
- **Fusión física + espectroscópica:** En lugar de dejar que un clasificador de ML decida a ciegas basándose en coordenadas espaciales, la ventaja única de SPHEREx frente a WISE o Gaia son sus **102 canales espectrales**. 
- Podemos clasificar con una jerarquía de dos pasos completamente interpretable:
  1. *Paso 1 (Cinemático):* ¿Hay desplazamiento medible de centroide o dipolo entre temporadas? $\rightarrow$ Sí: candidato a mover; No: candidato a variable o residuo estático.
  2. *Paso 2 (Espectroscópico y Físico):*
     - Si la fuente emite en D5/D6 ($4\text{--}5\,\mu\text{m}$), presenta cociente $F_{\text{D6}}/F_{\text{D2}} \ge 10.88$, pozo de absorción en $3.3\,\mu\text{m}$ ($\text{CH}_4$) y no tiene contraparte en Gaia DR3 $\rightarrow$ **Candidato a Enana Marrón Fría (T/Y)**.
     - Si la fuente tiene contraparte en Gaia DR3 con $\mu > 100\,\text{mas/año}$ $\rightarrow$ **Estrella cercana conocida (HPM)**.
     - Si el movimiento es de varios píxeles en horas dentro de la misma temporada y sigue el plano de la eclíptica $\rightarrow$ **Candidato a Asteroide / Objeto del Sistema Solar**.

### 3.3. Datos faltantes y esfuerzo técnico
- **Datos faltantes:**
  - Etiquetas verificadas de asteroides cruzadas con efemérides (IRSA MOST / JPL Horizons) en los campos de prueba de SPHEREx.
  - Mayor volumen de estrellas conocidas de Gaia DR3 con $\mu > 0.5''/\text{año}$ para evaluar sin sesgos de muestra pequeña ($N=9$).
- **Esfuerzo y viabilidad para el domingo:**
  - Entrenar un modelo de ML multiclasificador nuevo (deep learning o Random Forest multiclase) con validación honesta requeriría semanas de curación de datos y rompería la congelación de pruebas (`frozen.json`).
  - **No cabe antes del domingo.** La decisión honesta y rigurosa es mantener la regla física como decisor principal en la aplicación web, respaldada por la tarjeta de índice espectral.

---

## 4. Veredicto y Recomendaciones

### 4.1. Respuestas directas a las preguntas
1. **¿Se puede clasificar un cuerpo celeste solo por cómo se mueve con ML?**  
   *Parcial:* Se pueden clasificar regímenes cinemáticos (asteroide rápido vs estrella/enana lenta vs variable fija), pero **no** se puede deducir la naturaleza física del objeto sin su firma espectral y catálogos de apoyo.
2. **¿Se pueden detectar exoplanetas por movimiento en SPHEREx?**  
   *No:* Con una escala de $6.15''/\text{px}$ y separación típica de $\sim 0.5''$, el movimiento orbital de un exoplaneta alrededor de su estrella es físicamente inobservable.
3. **¿Conviene reemplazar la regla actual por un modelo de ML multiclase en este hackatón?**  
   *No:* La regla física transparente demostró mayor pureza (0 movedores adicionales sin verificar vs 10 del ML en la prueba congelada de 9 estrellas).

### 4.2. Recomendación concreta para el equipo y el jurado
- **En la herramienta web (Sparks):**
  - Mantener las etiquetas de candidatos asignadas por la **regla física transparente** (`mover`, `variable`, `static`, `artifact`).
  - Mostrar la probabilidad del **Spark Detector (LightGBM)** como una "segunda opinión experimental".
  - En la vista detallada del candidato, mostrar el **vector de movimiento medido contra el vector predicho por Gaia o CatWISE**, junto con la curva de flujo en los 6 detectores (espectro).
- **Mensaje ante el jurado (Reglas de Honestidad):**
  - Hablar siempre de *"candidatos a verificar"* y nunca de *"descubrimientos"*.
  - Explicar con franqueza: *"Probamos Machine Learning y una regla física congelada sobre 9 estrellas reales de Gaia DR3 nunca vistas durante el ajuste: la regla acertó 8/9 con 0 movedores adicionales sin verificar; el ML acertó 6/9 con 10 movedores adicionales sin verificar. Por honestidad con el usuario, la app usa la regla física y dejamos el modelo como segunda opinión."*
  - Destacar que la verdadera potencia de SPHEREx no es inventar cajas negras, sino **extraer la firma espectral de 102 bandas de cada chispa que se mueve**.

---

## Para el pitch

1. Por movimiento puro clasificamos regímenes de velocidad: asteroides rápidos que cruzan en horas, estrellas y enanas marrones cercanas que avanzan uno o dos píxeles por año, y estrellas variables fijas que solo cambian de brillo.
2. No clasificamos exoplanetas porque su separación típica de 0.5 segundos de arco queda sepultada en una doceava parte de un píxel de SPHEREx frente al brillo abrumador de su estrella.
3. Probamos nuestra regla física y el modelo de Machine Learning sobre nueve estrellas veloces de Gaia nunca vistas durante el ajuste: la regla recuperó ocho con cero movedores adicionales sin verificar, mientras el modelo recuperó seis con diez movedores adicionales sin verificar, por lo que la aplicación clasifica con la regla física y muestra el modelo como segunda opinión.
