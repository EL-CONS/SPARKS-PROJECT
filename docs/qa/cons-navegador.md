# QA en navegador · Cons

Fecha de corrida: 14 de noviembre de 2026 (sobre `npm run build` + `npm run preview` en `http://127.0.0.1:4173/`, Chromium headless).

## Alcance probado

- **Anchos:** `1440x900` (escritorio) y `390x844` (móvil).
- **Tema:** Solo modo oscuro. El modo claro fue retirado intencionalmente en `frontend-del-cons` (`useTheme.ts` eliminado y reglas `:root[data-theme='light']` removidas) porque las imágenes del cielo y la identidad visual de Sparks están diseñadas sobre fondo nocturno.
- **Vistas y objetivos:** Pantalla de inicio (`Inicio`) y vista de exploración (`Explorar el cielo`), recorriendo los objetivos disponibles en el selector (`Barnard`, `WISE 0855`, `RW Aurigae`, `R Draconis`, además de verificar la ausencia de errores en consola y red).

## Hallazgos y correcciones aplicadas

1. **Solapamiento del aviso `.scrollhint` ("More below") sobre botones de acción (corregido):**
   - **Qué se rompió:**
     - En `390x844` (`Inicio`), el botón flotante `.scrollhint` (`position: fixed; bottom: 20px; left: 50%`) quedaba encima del botón principal amarillo `"See what moves"`.
     - En `390x844` (`Explorar`), `.scrollhint` (`bottom: 200px`) tapaba parte del texto de ayuda `"How to read the eyepiece"`.
     - En `1440x900` (`Explorar`), `.scrollhint` centrado abajo tapaba el botón `"Search"`.
   - **Corrección en `app/src/styles/app.css`:**
     - En escritorio se movió `.scrollhint` a la esquina inferior derecha (`right: 24px; bottom: 20px`) para despejar el centro y el botón `"Search"`.
     - En móvil (`@media (max-width: 760px)`) se ocultó `.scrollhint` (`display: none`) para que no tape ni el CTA principal en `Inicio` ni el contenido en `Explorar`.
   - **Verificación posterior:** `hasOverlap: false` en `1440x900` y `390x844` tras recompilar.

2. **Verificación de objetivos, consola y red:**
   - **Desbordamiento horizontal (`scrollWidth > innerWidth`):** `false` en `1440x900` (`1440/1440`) y `390x844` (`390/390`) para todos los objetivos probados.
   - **Errores de consola / excepciones JS:** `0`.
   - **Peticiones HTTP fallidas (`status >= 400`):** `0`.
   - **Imágenes rotas (`naturalWidth === 0`):** `0`.
   - **Panel del clasificador v2:**
     - `Barnard`: `Candidato a estrella` (`91.0 %` entre estrella, enana marrón y enana blanca), con la nota `"candidato a clase; acierta 75 % en 69 objetos con clase verificada; separa mal las variables"`.
     - `WISE 0855`: `Candidato a enana marrón` (`86.6 %` entre estrella, enana marrón y enana blanca).
     - `RW Aurigae` y `R Draconis`: `Candidato a objeto variable`, indicando que la clasificación como variable proviene de la imagen de SPHEREx (residuo sin dipolo de movimiento) y que el modelo ML de Gaia solo distingue entre estrella, enana marrón y enana blanca.

## Capturas

- [Inicio escritorio 1440px](screenshots/desktop-1440-inicio.png)
- [Explorar escritorio 1440px](screenshots/desktop-1440-explorar.png)
- [Inicio móvil 390px](screenshots/mobile-390-inicio.png)
- [Explorar móvil 390px](screenshots/mobile-390-explorar.png)
