Tarea: auditar Sparks contra los requisitos del reto y de la entrega, decir qué se cumple y qué no con evidencia, y **implementar lo que falte**. Trabaja por ciclos hasta que todo lo alcanzable esté cumplido y verificado.

Sparks es nuestra herramienta web del reto "Planet X and SPHEREx" (NASA Space Apps Challenge 2026, sede Hermosillo). Hoy es sábado 14 de noviembre de 2026; la entrega local es el domingo de 8:00 a 12:00. Lee `sparks-en-breve.md` y `CONTEXTO.md` para el contexto.

## 1. Dónde trabajar

- Crea un worktree de Git con una rama nueva `joako/requisitos` que parta de **`origin/frontend-del-cons`** (el front más reciente: diseño "Constelación" más el modo claro de Cons). No trabajes sobre `frontend-del-cons` ni sobre `cons`, porque Cons las está usando.
- Trae los datos y el clasificador a esa rama: `git checkout origin/Horacio -- data-new` y `git checkout origin/joako -- data-sample ml-clasificador`.
- **Cons está implementando esto en paralelo, así que solo verifica y no lo implementes:** el cargador con las dos carpetas `data-sample/` y `data-new/`, los estados `parcial` de los manifiestos, y el hook del clasificador de ML. Si al terminar no está, lo reportas como "pendiente de Cons".
- No hagas push ni pull request sin preguntarme. Haz commits locales pequeños en tu rama.

## 2. Los requisitos

Para cada uno, anota **estado** (cumple, parcial o no cumple), **evidencia** (archivo y línea, captura o salida de un comando) y, si no cumple, **qué falta**.

### A. Requisitos del reto (del enunciado oficial)
- **A1.** Es una herramienta web pública que muestra imágenes del cielo de SPHEREx y permite ver rápido cómo cambian en el tiempo.
- **A2.** La persona escribe coordenadas (ascensión recta y declinación) de un parche de cielo y la herramienta muestra una serie de imágenes de ese parche **como un pequeño video**, para detectar objetos que se mueven. Acepta coordenadas en grados y en horas, minutos y segundos.
- **A3.** Probada con los cinco objetivos: la estrella de Barnard, Epsilon Indi B, WISE 0855 (RA 08h55m10.831s, Dec −7d14m42.53s), RW Aurigae y R Draconis. Cada uno abre con datos o con un estado claro si no los hay.

### B. Consideraciones opcionales del reto (cada una suma)
- **B1.** Fácil de actualizar con datos nuevos (formato de datos documentado, proceso para sumar un campo o un lanzamiento nuevo).
- **B2.** Las 102 bandas aprovechadas: suma de los datos de cada uno de los seis detectores y, si se puede, espectro o huella al vuelo.
- **B3.** Poder sumar o restar imágenes de distintas épocas (modos de suma y resta).
- **B4.** Campo de visión elegible.
- **B5.** Superponer datos de otros telescopios (Gaia, WISE).
- **B6.** Las coordenadas viajan en la URL, para poder incrustar la herramienta.
- **B7.** Metadatos visibles, como las banderas de contaminación.
- **B8.** Uso de herramientas como Astropy y Aladin.

### C. Entregables del domingo
- **C1.** App desplegada y accesible por URL pública. Verifica con una prueba real que `npm ci`, `npm run build` y `npm run preview` funcionan, qué configuración de Vite (`base`) hace falta y dónde se puede publicar gratis.
- **C2.** Repositorio documentado: `README.md` con cómo correrlo, qué es cada carpeta y de dónde salen los datos.
- **C3.** Página del equipo en inglés, video de 30 segundos en inglés, presentación y pitch de 3 a 5 minutos. De esto solo verifica qué existe en `docs/` y qué falta; no lo escribas, lo hace Carlos.

### D. Requisitos propios del proyecto
- **D1. Honestidad científica.** Nada de "descubrimos": se habla de candidatos. Cada cifra visible sale de un archivo de datos, no está escrita a mano en un componente. Lo que no está medido se dice (por ejemplo, R Draconis saturada, WISE 0855 con índice de frío dudoso). Revisa `app/src/i18n/` y los componentes con `grep`.
- **D2. Las imágenes de SPHEREx no se retocan:** sin filtros ni efectos encima del cielo. Cada escala de color tiene leyenda con unidades.
- **D3. Accesibilidad (WCAG 2.2 AA):** todo por teclado, foco visible, contraste, texto alternativo en cada imagen del cielo, `prefers-reduced-motion`, y el parpadeo respeta el límite de 3 destellos por segundo, con botón de pausa siempre visible.
- **D4. Dos temas, oscuro y claro,** que cambian sin recargar, con la preferencia recordada y sin parpadeo al cargar.
- **D5. Responsive:** sin scroll horizontal ni controles rotos a 390 px, a tablet y a 1440 px.
- **D6. Idioma:** español e inglés completos; ningún texto fijo dentro de componentes.
- **D7. Clasificación:** el clasificador de ML (`ml-clasificador/`, 91.7 % dejando uno fuera con 36 objetos) aparece en la interfaz con sus límites a la vista ("candidato a clase, entrenado con 36 objetos"). Es trabajo de Cons: solo verifica.
- **D8. Rendimiento:** el build pesa poco, los datos se cargan por campo y hay estados de carga que dicen cuánto falta.

## 3. Método (por ciclos)

1. **Auditoría.** Lee el código y los datos reales de la rama. Corre el build, las pruebas y el verificador de datos (`npm run typecheck`, `npm test`, `npm run build`, `npm run check-data`). Levanta la app y **míralo en un navegador real** (skill `webapp-testing`, o las herramientas de navegador de la sesión): cada objetivo, cada modo, a 390 px y a 1440 px, en oscuro y claro, con teclado. No declares un requisito cumplido por haber leído el código: tiene que haberse visto funcionar.
2. **Informe.** Escribe `docs/auditoria/requisitos.md` con una tabla por sección (estado, evidencia, qué falta) y una lista priorizada de lo que falta, con una estimación de esfuerzo en minutos.
3. **Prioridad de implementación.** A1 a A3 primero. Luego B6 (URL), B3 (suma y resta), B4 (campo de visión) y B7 (banderas visibles), que son los que más suman con menos esfuerzo. Después B2 (espectro o huella), B5 (Gaia, con los catálogos que ya vienen en `catalogs.json`) y D3 a D6. Deja C1 (despliegue y su configuración) y C2 (README) para que no se queden fuera.
4. **Implementación.** Implementa lo que falte en `app/src/ui/` y `app/src/styles/` si es de interfaz, o en `app/src/core/` si es lógica nueva que Cons no esté tocando. Respeta el diseño existente (lee el `DESIGN.md` de la rama, que es el vigente) y el logo (`Logo/`): azul siempre es "antes", ámbar siempre es "ahora". Cada cambio con su prueba cuando sea lógica.
5. **Reverificación.** Después de cada bloque de cambios, vuelve a correr la verificación y actualiza el informe. Termina cuando los requisitos alcanzables estén en "cumple" con evidencia, o cuando lo que quede dependa de otras personas, y entonces dilo con nombre.

## 4. Reglas

- Español en todo lo que escribas para el equipo; los textos de interfaz, en las claves de `i18n` en español e inglés.
- Cada afirmación científica con su fuente o "sin verificar". "Candidatos", no "descubrimientos".
- Nada del proyecto anterior. No uses `DESIGN.md`, `ESQUELETO-UX.md` ni otras pautas viejas: el único diseño vigente es el `DESIGN.md` de la rama del front.
- No modifiques `Logo/` ni `data-sample/` ni `data-new/` (son datos de otras personas).
- No gastes dinero ni servicios de pago.
- Si no puedes ejecutar algo (por ejemplo, un navegador), dilo explícitamente en el informe; no lo des por hecho.

## 5. Entrega

Al final, dime: la tabla de requisitos con su estado final, lo que implementaste (con commits), lo que quedó pendiente y de quién depende, las capturas de lo que viste en el navegador y qué comando exacto uso para subir tu rama cuando quiera.
