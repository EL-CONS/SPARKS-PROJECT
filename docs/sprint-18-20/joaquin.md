# Sprint 18:00 a 20:00 · Joaquín · último sprint en el lugar

Sábado 14 de noviembre de 2026. El hackatón cierra a las 20:00; la entrega local es el domingo de 8:00 a 12:00. Tú coordinas; esto es lo que depende de ti.

## Quién hace qué (resumen)

| Persona | Rama | Trabajo |
|---|---|---|
| Cons | `cons` | Fusiona tu front (`iter/01-constelacion`), conecta el veredicto, el contrato y los estados en vivo, y prueba el modelo con datos nuevos (o hace una canalización de respaldo) |
| Horacio | `Horacio` | Sube `pipeline/`, procesa WISE 0855 y ε Indi B, escribe el método y revisa el pitch con ojos de astrofísico |
| Carlos | `carlos` | Recortes de los cuatro campos y cómo compartirlos, prueba de lectura desde el navegador, página del equipo, guion del video y de las diapositivas |

Todos con tope de subida a las 19:40 y pull request a `main`.

## Tu sprint

| Hora | Qué |
|---|---|
| 18:00 a 18:15 | Arrancar al equipo; confirmar que cada quien subió su archivo de sprint |
| 18:15 | Decidir si Cons arma la canalización de respaldo (si Horacio no ha subido `pipeline/`) |
| 18:15 a 19:30 | Tu front y la publicación |
| 19:30 a 20:00 | Revisar pull requests, fusionar lo que esté listo, lista de pendientes para la noche |

### Decisiones tuyas
1. **¿Entra `data-sample/` a `main`?** Cons lo metió en su rama; `main` no lo tiene. Lo necesita cualquiera que corra el front.
2. **Qué rama de diseño es la final.** Hoy `iter/01-constelacion` es la más reciente (17:23). Cons la integra; confirma que es la correcta antes de que él se ponga.
3. **El modelo de ML en el pitch.** El resultado de Barnard cambió el umbral tras ver el primer resultado (3 de 6 con 0.60; 5 de 6 con 0.50). Si Cons no lo corrige ni reprueba con datos nuevos, en el pitch se presenta como "segunda opinión experimental" y no como un resultado.

### Publicación (la entrega exige una app desplegada)
1. Con la rama integrada por Cons (o la tuya), decide dónde se publica y prueba el build real: `npm ci`, `npm run build` y `npm run preview`.
2. Dónde se publica (GitHub Pages u otro gratuito) y si funciona con repositorio privado: está en `docs/backend/publicacion.md` de Cons, pero **no está verificado con una prueba real**. Compruébalo antes de depender de eso.
3. La entrega del domingo pide también el repositorio documentado: `README.md` con cómo correrlo, qué es cada carpeta y qué datos usa.

### Pendientes tuyos de siempre
- La sección de pitch: decide quién narra y qué entra del trabajo de Horacio y de Carlos.
- Cuando Cons y tú terminen de integrar, captura nuevas pantallas para el respaldo del pitch (las anteriores son de la versión vieja).
