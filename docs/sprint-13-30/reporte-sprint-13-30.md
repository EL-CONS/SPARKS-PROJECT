# Reporte de cierre · Sprint 13:30 a 14:30

> **Rama:** `Horacio` · **Fecha:** 2026-11-14  
> **Commit de esta entrega:** `223c2c8` (`fix(sprint-13-30): derive white dwarf verdict from Gaia photometry and verified ground truth`)  
> **Alcance:** reglas de veredicto, catálogo de verdad de terreno y prototipo evaluado solo en el split de desarrollo.

---

## 1. Resumen

En este sprint se reemplazó la lógica de enana blanca basada en el nombre del objeto por una regla física construida con fotometría y astrometría reales de Gaia DR3. Además se armó un catálogo de 36 objetos con clase respaldada por SIMBAD o por un artículo, y se reescribió el prototipo para que lea esa información desde una tabla verificable.

Resultado principal: **10/10 en el split de desarrollo**, con la advertencia de que las reglas se ajustaron sobre esos mismos 10 objetos. Como control adicional, la regla física de enana blanca se aplicó a cuatro enanas blancas del catálogo que no están entre esos 10 campos: **3/4**. La que falla es Procyon B, porque Gaia DR3 no ofrece fotometría ni paralaje utilizables en esa región.

No se tocó el split de prueba congelado: `t452800`, `t744064` y `t605760` no se evaluaron y sus etiquetas no se usaron para elegir umbrales.

---

## 2. Qué se corrigió respecto de la versión anterior

1. **Se eliminó el reconocimiento por nombre.** La condición `nombre_campo == "vanmaanen"` ya no existe. La decisión sale de `source_id`, `G`, `BP-RP`, paralaje y las features de SPHEREx.
2. **Se consultó Gaia DR3 por TAP** (`gaiadr3.gaia_source`) para cada objeto con contraparte. La tabla resultante es `docs/sprint-13-30/gaia-fotometria.csv`.
3. **Se corrigieron cuatro `source_id` equivocados.** Los dos más graves pertenecían al split de prueba:

   | Objeto | `source_id` anterior | `source_id` verificado |
   |---|---|---|
   | Barnard's Star | 4472832130942585856 | 4472832130942575872 |
   | Kapteyn's Star | 4758925345759714432 | 4810594479418041856 |
   | Lacaille 9352 (`t452800`) | 6553614215268105472 | 6553614253923452800 |
   | Gliese 1 (`t744064`) | 2306962213267266688 | 2306965202564744064 |

   Los dos últimos apuntaban a fuentes débiles de fondo. La corrección es de datos, no de regla: no se calcularon veredictos para esos objetos ni se usaron para ajustar nada.
4. **Se eliminó un duplicado del catálogo.** `LP 145-141` y `Gliese 440` son el mismo objeto; quedó una sola fila.
5. **Se agregó la columna `aislado`** para marcar compañeros que no se separarán a la escala de SPHEREx (6.15″ por píxel) y priorizar objetos aislados.
6. **Se documentó la regla del split y la semilla.** El split es determinista, no aleatorio y sin semilla.

---

## 3. Regla de enana blanca

Para cada objeto con contraparte Gaia DR3 se calcula:

$$M_G = G + 5 + 5\log_{10}\left(\frac{\varpi}{1000}\right)$$

con $\varpi$ en milisegundos de arco. Se clasifica como `enana blanca` si y solo si:

$$M_G \ge 10.0 \quad \text{y} \quad G_{BP}-G_{RP} \le 0.8$$

Las dos condiciones son obligatorias:

- **Van Maanen's Star:** $M_G = 14.12$ y $BP-RP = 0.598$ → `enana blanca`.
- **Kapteyn's Star:** $M_G = 10.09$ y $BP-RP = 2.027$ → `estrella`. Supera el corte de luminosidad, pero el color rojo descarta la enana blanca. Este contraejemplo justifica el segundo corte.

Si falta `G`, `BP-RP` o paralaje, el prototipo devuelve `estrella` con una razón explícita. No se inventa $M_G$ ni se usa el nombre como atajo.

---

## 4. Enanas marrones

- La absorción de metano a 3.3 μm ($\mathrm{CH}_4 \ge 0.5$) se evalúa antes del cruce con Gaia, porque una enana T puede tener contraparte o estar ligada a una estrella.
- WISE 0855−0714: $\mathrm{CH}_4 = 1.03$, cociente $F_{D6}/F_{D2} = 10.88$, sin contraparte Gaia.
- Epsilon Indi B: $\mathrm{CH}_4 = 0.81$, cociente 1.73. Gaia resuelve a ε Indi A, no a la enana T. Exigir "ausente en Gaia" habría fallado; el metano es el criterio correcto.
- Luhman 16: Gaia detecta una componente, pero con paralaje y movimiento propio nulos; no hay $M_G$. Su clase viene de la literatura.

---

## 5. Catálogo de verdad de terreno

`docs/sprint-13-30/verdad-terreno.csv` contiene **36 objetos**, por encima del mínimo de 30:

| Clase | Cantidad |
|---|---|
| `estrella` | 17 |
| `enana marron` | 8 |
| `enana blanca` | 5 |
| `variable` | 6 |

- **28** tienen `gaia_source_id`.
- **26** tienen $M_G$ calculable.
- **8** no tienen contraparte Gaia: ε Indi B, Gl 229 B, Procyon B y las cinco WISE.
- Cada fila tiene fuente de clase y enlace: SIMBAD con su `otype`, artículo de arXiv o DOI, o la ficha directa de la fuente en Gaia.
- La columna `mu_total_arcsec_yr` se calcula desde `pmra` y `pmdec` de Gaia. Cuando no hay Gaia, dice `sin verificar`.
- Las coordenadas de objetos con Gaia son de Gaia DR3 (época 2016.0); las demás son J2000 de Sesame/SIMBAD o de literatura, indicado en `epoca_coords`.

### Columna `aislado`

`aislado = no` para Sirius B, Procyon B, Stein 2051 B, Gliese 229 B, Luhman 16 y Gliese 725 A, por ser compañeros que no se separan a 6.15″/píxel o por tener una fuente vecina comparable a pocos segundos de arco.

`aislado = si` para ε Indi B (6.7′ de ε Indi A) y 61 Cyg A (~30″ de 61 Cyg B), aunque en este último se anota la contaminación.

---

## 6. Split `desarrollo` / `prueba`

Regla exacta, determinista y sin semilla:

- **`prueba` (3 objetos):** los campos de `data-sample/index.json` cuyo `id` empieza con `t`:
  - `t452800` = Lacaille 9352
  - `t744064` = Gliese 1
  - `t605760` = Gaia DR3 3713594960831605760
- **`desarrollo` (33 objetos):** todos los demás del catálogo, incluidos los 10 campos con features de SPHEREx en `results.json`:
  `barnard`, `teegarden`, `wolf359`, `kapteyn`, `t503424`, `vanmaanen`, `wise0855`, `epsindib`, `rwaur`, `rdra`.

No se usó ninguna semilla. Los tres objetos de prueba ya estaban separados y congelados antes de ajustar la regla; el prefijo `t` es solo la forma reproducible de describirlos. El prototipo no los evalúa.

---

## 7. Resultados

### 7.1 Split de desarrollo

| Campo | Verdad | Veredicto | Razón |
|---|---|---|---|
| `barnard` | estrella | estrella | $M_G=11.88$, $BP-RP=2.83$ |
| `teegarden` | estrella | estrella | $M_G=14.35$, $BP-RP=4.53$ |
| `wolf359` | estrella | estrella | $M_G=14.13$, $BP-RP=4.18$ |
| `kapteyn` | estrella | estrella | $M_G=10.09$, $BP-RP=2.03$ |
| `t503424` | estrella | estrella | $M_G=15.45$, $BP-RP=5.21$ |
| `vanmaanen` | enana blanca | enana blanca | $M_G=14.12$, $BP-RP=0.60$ |
| `wise0855` | enana marron | enana marron | $\mathrm{CH}_4=1.03$ |
| `epsindib` | enana marron | enana marron | $\mathrm{CH}_4=0.81$ |
| `rwaur` | variable | variable | residuo sin dipolo |
| `rdra` | variable | variable | residuo sin dipolo |

**Acierto: 10/10 (100 %).**

Advertencia: las reglas se ajustaron sobre este mismo conjunto (n=10), que contiene una sola enana blanca. No es una validación independiente; es una prueba de consistencia.

### 7.2 Control externo de enanas blancas

Se aplicó la misma regla física a cuatro enanas blancas del catálogo que no están entre los 10 campos evaluados:

| Objeto | Verdad | Veredicto | Razón |
|---|---|---|---|
| Sirius B | enana blanca | enana blanca | $M_G=11.39$, $BP-RP=-0.28$ |
| Stein 2051 B | enana blanca | enana blanca | $M_G=13.63$, $BP-RP=0.44$ |
| Gliese 440 | enana blanca | enana blanca | $M_G=13.09$, $BP-RP=0.29$ |
| Procyon B | enana blanca | estrella | sin fotometría Gaia verificable |

**Control externo: 3/4.** Procyon B falla porque Procyon A satura la región y Gaia DR3 no entrega fotometría ni paralaje utilizables. La regla prefiere decir `estrella` con una razón explícita antes que inventar una enana blanca.

---

## 8. Verificación realizada

Se ejecutó un validador de consistencia sobre ambas tablas con **0 errores**:

- 36 filas en `verdad-terreno.csv` y 36 en `gaia-fotometria.csv`.
- Sin nombres duplicados.
- `split = prueba` exactamente en `t452800`, `t744064` y `t605760`.
- `gaia_source_id` idéntico entre ambas tablas para cada objeto.
- $M_G$ recalculado desde $G$ y paralaje: coincide con la tabla dentro de 0.002 mag.
- Movimiento propio total recalculado desde `pmra` y `pmdec`: coincide dentro de 0.002 arcsec/año.
- Clases válidas, fuentes y enlaces presentes, valores de `en_gaia` y `aislado` válidos.
- Los 10 campos evaluados existen en `data-sample/results.json`.

El prototipo se ejecutó desde la raíz del repo y leyó `data-sample/results.json` y `docs/sprint-13-30/gaia-fotometria.csv` sin conexión a red.

---

## 9. Limitaciones y pendientes

1. **Procyon B:** sin fotometría Gaia DR3 verificable en este entorno. Si se consigue un `source_id` o fotometría de otra fuente, se completa el control externo.
2. **IRSA/CatWISE:** no respondió (timeout y 502 Proxy Error). Las coordenadas y los movimientos propios de los objetos WISE quedan como `sin verificar`; la clase sí está respaldada por los artículos.
3. **SIMBAD TAP:** devolvió HTTP 404. Las coordenadas y los `otype` se obtuvieron por Sesame; los enlaces de SIMBAD del CSV son para verificación humana.
4. **Tamaño del conjunto:** solo hay 10 objetos con features de SPHEREx y una enana blanca en desarrollo. Para una validación real hacen falta más objetos y un split aleatorio declarado antes de mirar resultados.
5. **Asteroide:** la clase está definida y JPL Horizons responde (HTTP 200), pero no hay ningún caso evaluable en los datos actuales. No se incluyó ningún asteroide en el catálogo.
6. **Luhman 16:** tiene `source_id` pero paralaje y movimiento propio nulos, así que no hay $M_G$.

---

## 10. Archivos entregados

| Archivo | Contenido |
|---|---|
| `docs/sprint-13-30/reglas-veredicto.md` | Tabla de decisión, regla física, ejemplos, split, resultados y limitaciones |
| `docs/sprint-13-30/verdad-terreno.csv` | 36 objetos con clase, coordenadas, fuente, `source_id`, `aislado`, split y verificación |
| `docs/sprint-13-30/gaia-fotometria.csv` | Fotometría y astrometría Gaia DR3 ($G$, $BP-RP$, paralaje, PM, `ruwe`, $M_G$) |
| `prototipo/veredicto.py` | Clasificador que lee la tabla Gaia y evalúa solo el split de desarrollo |
| `docs/sprint-13-30/reporte-sprint-13-30.md` | Este reporte |

---

## 11. Estado de git

- Rama: `Horacio`.
- Commit de la entrega anterior: `223c2c8`, publicado en `origin/Horacio`.
- `data-sample/` permanece sin trackear y no forma parte de los commits. Solo se usó en local para correr el prototipo.
- No se hizo push a `main`.

### Reproducir

```bash
python prototipo/veredicto.py
```

El script no necesita red. Imprime la evaluación de desarrollo, el control externo de enanas blancas y una nota sobre el split de prueba congelado.

---

## 12. Conclusión

La entrega cumple lo pedido: la clase de enana blanca ya no depende del nombre, el catálogo supera los 30 objetos con fuente verificable y `source_id`, el split está documentado sin semilla y el prototipo informa sus propios límites. El 10/10 debe leerse como consistencia sobre un conjunto pequeño, no como validación independiente. La deuda principal es ampliar el conjunto con features de SPHEREx y repetir la prueba con un split declarado de antemano.
