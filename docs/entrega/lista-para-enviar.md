# Lista para enviar el proyecto (E3)

El proyecto se envía en la página del equipo en `spaceappschallenge.org`, antes de la hora de cierre del Evento Local (domingo 15 de noviembre, entrega local de 8:00 a 12:00). El formato exacto lo dice la **Project Submission Guide**, que no tenemos: hay que leerla antes de pegar nada. No consta en nuestros documentos qué campos tiene el formulario.

| Qué se pega | Estado | Dónde está o qué falta |
|---|---|---|
| URL pública de la app | **Falta** (Cons, AWS) | `app/dist/` sale completo y probado con `curl` y en el navegador (`docs/backend/publicacion.md`). Instrucciones de despliegue: `docs/backend/despliegue-aws.md`. Probar la URL en un teléfono |
| URL del repositorio | Existe: `https://github.com/EL-CONS/SPARKS-PROJECT` | Confirmar que es público. `main` tendrá el producto cuando se suba `joako-integracion` |
| Descripción del proyecto (inglés) | Borrador de Carlos | `docs/entrega/pagina-equipo-en.md` (Carlos, `3f77eec`). Corregir la cifra del clasificador (75.4 % → 78.3 %, 54 de 69) y lo de la tabla de cifras de `docs/integracion/estado.md` |
| Declaración de uso de SI | Borrador | `docs/entrega/uso-de-si.md`, con versión en inglés. Carlos tiene otra versión en `origin/carlos`: debe fundirla en esta. Faltan las respuestas de Cons y Horacio |
| Video de 30 segundos en inglés | Solo guion | `docs/entrega/video-30s-guion-en.md` (Carlos). No hay video grabado. Usa el contador 1 607 473, que no está en `data-new/results.json` (ver tabla de cifras) |
| Presentación | Solo esquema | `docs/entrega/diapositivas-outline.md` (Carlos). No hay diapositivas en el repositorio |
| Pitch de 3 a 5 minutos | Texto en español | `docs/pitch/pitch-3min-es.md` y `pitch-5min-es.md` (rama `joako`) |
| Integrantes del equipo | Sin confirmar | Ver E5 en `docs/auditoria/requisitos.md` |

## Antes de enviar

1. Leer la Project Submission Guide y la Judging and Awards Guide.
2. Decidir qué se hace con el material anterior al 14 de noviembre (`docs/auditoria/procedencia.md`).
3. Confirmar que nadie menor de 18 años aparece en foto, video o voz en la página del equipo, el video y las diapositivas. En el repositorio no hay fotos de personas, audio ni video (revisado en todas las ramas el 14 de noviembre); las edades de los integrantes no constan en ningún documento.
4. Publicar la app (Cons, AWS) y abrir la URL pública desde un teléfono con datos móviles.
5. Revisar la app con `docs/entrega/checklist-qa.md` (Carlos) quitando la sección de modo claro, que ya no existe.
