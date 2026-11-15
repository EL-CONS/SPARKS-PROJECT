# Lista de verificación QA manual · Sparks

Lista de pruebas para ejecutar sobre la rama integrada con `app/` (`origin/cons` o `main` tras fusionar) antes de la entrega del domingo.

**Cómo iniciar localmente (en la rama con `app/`):**

```bash
cd app
npm install
npm run dev
```

Abrir la URL local (`http://localhost:5173`) en el navegador. Anotar cualquier fallo con captura, URL exacta, resolución y mensaje de consola.

---

## 1. Resoluciones y diseño adaptable (`390 px` y `1440 px`)

- [ ] **Escritorio (`1440 × 900`):**
  - El encabezado muestra logotipo, pestañas (`Inicio` / `Explorar`), selector de idioma (`ES`/`EN`), interruptor de tema y distintivo `NASA Space Apps Challenge 2026` sin superposiciones.
  - No existe desplazamiento horizontal (`scrollWidth <= innerWidth`) en `Inicio` ni en los 3 pasos de `Explorar`.
  - La mira polar (`SkyScope`) y el escenario de 6 detectores (`D1`–`D6`) muestran etiquetas legibles sin cortarse ni montarse unas sobre otras.
- [ ] **Móvil (`390 × 844`):**
  - El distintivo de Space Apps cambia a la variante compacta sin desbordar el encabezado.
  - Los pines de objetivos en la mira polar, el campo de coordenadas `#q`, los botones de modo (`Blink` / `Stack` / `Subtract`), los controles de reproducción (`1/2/3 Hz`) y las gráficas de `Insights` caben dentro del ancho de `390 px` sin scroll horizontal.
  - El pie de página y la navegación entre pasos (`Atrás` / `Siguiente`) siguen siendo táctiles y accesibles.

---

## 2. Modo oscuro y modo claro

- [ ] **Modo oscuro (predeterminado):** fondo espacial `#06080C`, texto legible con alto contraste, estrella de fondo (`Starfield`) atenuada en modo `explorar` (`quiet`), icono lunar/solar coherente y logotipo claro (`symbol.svg`, `spaceapps-color-white.svg`).
- [ ] **Modo claro:** pulsar el interruptor de tema (`role="switch"` en el encabezado):
  - Cambia `aria-checked` a `"true"` y actualiza la paleta de fondo, texto, bordes y paneles.
  - El logotipo y el distintivo de Space Apps cambian a sus variantes oscuras (`symbol-flat-light.svg`, `spaceapps-color-black.svg`) para mantener contraste.
  - En los paneles `Subtract B−A`, los marcadores azul (**antes**) y ámbar (**ahora**) siguen distinguiéndose con claridad.

---

## 3. Navegación por teclado y accesibilidad

- [ ] **Enlace de salto:** al pulsar `Tab` al cargar, aparece el enlace `skip` hacia `#cielo` y al activarlo con `Enter` mueve el foco al contenido principal.
- [ ] **Orden de tabulación y foco visible:** recorrer con `Tab` / `Shift+Tab` encabezado, pestañas, mira de objetivos, formulario `#q`, modos (`blink`, `stack`, `diff`), selector de detector (`All`, `D1`–`D6`) y botones `Atrás`/`Siguiente`. Todos tienen anillo de foco visible.
- [ ] **Atajos entre pasos:** en la pestaña `Explorar`, pulsar `ArrowRight` y `ArrowLeft` cambia entre pasos (`1 -> 2 -> 3`) cuando el paso siguiente está habilitado.
- [ ] **Seguridad fotosensible (WCAG 2.3.1):**
  - Al abrir un campo, el parpadeo inicia **pausado** (`playing = false`).
  - Al activar reproducción/parpadeo por primera vez aparece el diálogo `role="alertdialog"` (`askFlash`); se puede confirmar o cancelar con teclado.
  - Con `prefers-reduced-motion: reduce` activado en el sistema/navegador, no inicia reproducción automática.
- [ ] **Idioma (`ES` / `EN`):** pulsar el botón de idioma actualiza textos de interfaz, títulos de pasos, notas de objetivos, etiquetas `aria-label` y la URL (`?lang=es` / `?lang=en`).

---

## 4. Los cinco objetivos del reto

Probar cada objetivo seleccionándolo desde `SkyScope` (paso 1) y avanzando a paso 2 (`Ver`) y paso 3 (`Analizar`):

- [ ] **1. Barnard's Star (`269.4485 / +4.7394`):**
  - Carga inmediatamente con fotos (`con fotos`).
  - En `Subtract`, se observa el par azul/ámbar y la flecha de movimiento propio (`10.23 ± 0.43″/año` en `data-sample/results.json` frente a `10.39″/año` en Gaia DR3).
  - La URL refleja coordenadas y parámetros sin errores en consola.
- [ ] **2. ε Indi B (`331.0441 / −56.7828`, J2000):**
  - Verificar que las coordenadas mostradas correspondan a **ε Indi B** (`331.044 / −56.783`) y **no** a ε Indi A (`330.84 / −56.786`).
  - Si `data-new/` está integrado, comprobar que carga las 4 temporadas (`DR1 + QR3`, `4.21 ± 0.28″/año` en `data-new/results.json`) o, si aún falta en el paquete activo, verificar que muestra el estado honesto correspondiente sin inventar datos.
- [ ] **3. WISE 0855 (`133.7951 / −7.2451`):**
  - Muestra la etiqueta **"Not in Gaia DR3"** (o equivalente en español).
  - En `D5` y `D6` (ampliando el panel), se aprecia la fuente infrarroja y en paso 3 se muestra la huella de 102 colores apagada en longitudes cortas y encendida en `4–5 µm` (`D6/D2 >= 10.09` en `data-new/results.json`).
- [ ] **4. RW Aurigae (`76.9561 / +30.4012`):**
  - Se presenta como estrella **variable** (sin vector de movimiento significativo; en `data-new/results.json` reporta `status: "parcial"`, movimiento consistente con cero a 3σ).
- [ ] **5. R Draconis (`248.1674 / +66.7550`):**
  - Muestra el aviso/limitación por **saturación** (`534/534` cuadros saturados en `entrega-horacio.md`; `status: "parcial"` con `0 < 3` detecciones utilizables en `data-new/results.json`), sin mostrar un movimiento propio falso de núcleo.

---

## 5. Coordenada inventada y casos límite de búsqueda (`#q`)

- [ ] **Entrada inválida (ej. `hola mundo` o `400 10`):** al enviar el formulario `#q`, aparece un mensaje de error claro con `role="alert"` y no se rompe la app.
- [ ] **Coordenada inventada lejana (`> 0.2°`, ej. `210.8023 54.3488` o `150.0000 -25.0000`):**
  - Muestra el aviso `far-box` indicando la distancia al campo precargado más cercano y el botón para ir al más cercano.
  - Si el flujo en vivo está disponible (`Consultar campo en vivo`), verificar transiciones honestas de estado (`en_cola` → `procesando` con barra de progreso → `listo` con botón `Inspeccionar campo` o `fallo` con mensaje de error).
- [ ] **Persistencia de URL compartible:** copiar la URL generada con `?ra=...&dec=...&mode=...&det=...&lang=...`, abrirla en una pestaña nueva y confirmar que abre directamente en `explorar` con el mismo modo, detector e idioma.

---

## 6. Registro de ejecución (llenar al correr el QA)

| Fecha / hora | Rama / commit probado | Navegador | Resultado (`390 px` / `1440 px` / teclado / 5 objetivos / coordenada) | Fallos encontrados |
|---|---|---|---|---|
| `[[PENDIENTE]]` | `[[PENDIENTE]]` | `[[PENDIENTE]]` | `[SIN VERIFICAR EN APP INTEGRADA]` | `[[NINGUNO / DETALLAR]]` |
