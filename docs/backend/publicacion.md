# Opciones gratuitas de publicación (app estática)

Sparks compila a archivos estáticos (`app/dist/` + `data-sample/`), por lo que no necesita servidor Node/Python en producción mientras use datos precalculados.

| Plataforma | Plan gratuito | ¿Funciona con repo **privado**? | Límites principales (plan gratis) | Notas para Sparks |
|---|---|---|---|---|
| **Cloudflare Pages** | Free (`$0`) | **Sí** | Builds ilimitados (1 a la vez, 500/mes en algunos límites antiguos; ancho de banda ilimitado en sitios estáticos; máx. 20,000 archivos y 25 MB por archivo) | Muy buena opción si el repo es privado; también permite montar el Worker CORS en la misma cuenta. |
| **Netlify** | Starter (`$0`) | **Sí** | 100 GB/mes de ancho de banda, 300 min/mes de build | Soporta repos privados de GitHub sin costo; `Base directory: app`, `Publish: app/dist`. |
| **Vercel** | Hobby (`$0`) | **Sí** (solo uso personal/no comercial) | 100 GB/mes de ancho de banda, 100 deploys/día | Si el repo pertenece a una **organización** de GitHub (no usuario personal), Vercel Hobby bloquea el deploy automático y pide plan Pro. |
| **Render** | Static Sites (`$0`) | **Sí** | 100 GB/mes de ancho de banda | Conecta directo a repo privado; build command `npm ci && npm run build`. |
| **GitHub Pages** | Free (`$0`) | **No** (solo repos **públicos** en cuenta gratuita) | 100 GB/mes suave, 1 GB de tamaño recomendado por sitio | Requiere `VITE_BASE=/SPARKS-PROJECT/` si no usa dominio propio y que el repo sea público (o GitHub Pro/Team). |

## Recomendación práctica

- Si el repo sigue **privado**: **Cloudflare Pages** o **Netlify Starter** (no bloquean organizaciones ni repos privados, sin tarjeta).
- Si el repo pasa a **público** (requisito habitual al entregar en Space Apps): **GitHub Pages** o **Cloudflare Pages**.
- **Cuidado con el tamaño de `data-sample/`:** hoy pesa ~8 MB (entra cómodo en cualquiera). Si se agregan muchos campos con `frames.bin` completos (~1.8 GB por campo), rebasará el límite por archivo/sitio de hosting estático; en ese caso hay que subir solo `index.json`, `manifest.json` y los PNG de coadds/diffs.
