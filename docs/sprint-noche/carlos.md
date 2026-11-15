# Trabajo de la noche · Carlos

Sábado 14 de noviembre de 2026, 19:30 en adelante. El hackatón cierra a las 20:00 y la entrega local es el domingo de 8:00 a 12:00.

## Mensaje para ti

Carlos, no hay nada tuyo en GitHub desde las 16:45; tu último commit es de antes del sprint de las 18:00 y de lo que ahí te pedí no ha llegado nada. Tu trabajo anterior fue el que destrabó el proyecto y se necesita otra vez, pero ahora hace falta algo concreto y rápido. **Sube lo que tengas ya**, aunque esté a medias, en `docs/sprint-noche/` de tu rama, y escríbeme en el grupo qué te bloquea.

Un dato para que no repitas trabajo: Horacio ya descargó y procesó los cuatro campos con su propio pipeline, así que **los recortes de WISE 0855 y ε Indi B que te había pedido ya no hacen falta**. Lo que sigue pesa más.

## Tareas, en orden de prioridad

1. **Piezas de la entrega del domingo** (lo más importante). La entrega local es de 8:00 a 12:00, con pitch de 3 a 5 minutos. Basándote en `sparks-en-breve.md`, `CONTEXTO.md` y `docs/pitch/pitch-3min-es.md`:
   - `docs/entrega/pagina-equipo-en.md`: página del equipo en inglés, con qué hace cada uno y un párrafo honesto de qué funciona y qué no.
   - `docs/entrega/video-30s-guion-en.md`: guion del video de 30 segundos en inglés, plano por plano, con duración, texto y qué se ve. Que cuente la historia de Tombaugh y el parpadeo en azul y ámbar.
   - `docs/entrega/diapositivas-outline.md`: una diapositiva por idea, con título y una frase.
   Cada cifra con su fuente (`data-sample/results.json` y `data-new/results.json`). Lo no verificado, "sin verificar". "Candidatos", no "descubrimientos".
2. **README del repositorio** (la entrega lo pide documentado): `docs/entrega/README-borrador.md` con qué es Sparks, cómo correrlo (`npm install`, `npm run dev`), qué es cada carpeta (`app/`, `data-sample/`, `data-new/`, `pipeline/`, `ml-clasificador/`, `docs/`), de dónde salen los datos (IRSA, Gaia) y qué no hacemos. Léelo tal cual lo haría alguien que llega sin conocer el proyecto.
3. **Lista de pruebas a mano** (`docs/entrega/checklist-qa.md`): los pasos para revisar la app a 390 px y a 1440 px, en modo oscuro y claro, con teclado, con los cinco objetivos y con una coordenada inventada. Cuando Cons termine de integrar, la corres sobre su rama y anotas lo que falla.
4. **Prueba de lectura desde el navegador** (la que te había asignado): ¿se puede leer un recorte del bucket S3 `nasa-irsa-spherex` con peticiones por rango (`Range`) desde una página? Mide con hora y reporta en `docs/sprint-13-30/lectura-navegador.md`. Esta va al final: las otras tres pesan más.

## Reglas
Español (el video y la página del equipo, en inglés). Sin emojis. Nada del proyecto anterior. No toques `data-sample/` ni `Logo/`. Si algo te bloquea más de cinco minutos, avísame.
