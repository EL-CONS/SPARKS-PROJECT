# Stack y ejecución actual · Sparks

**Estado del backend:** Hoy no hay backend. Sparks es una aplicación estática en el navegador que consume archivos JSON e imágenes pregeneradas de `data-sample/`.

## 1. Stack completo (versiones verificadas en `app/package.json` y entorno)

| Capa | Herramienta | Versión |
|---|---|---|
| Runtime local | Node.js | `v25.2.1` |
| Gestor de paquetes | npm | `11.6.2` |
| Bundler / Dev server | Vite | `^5.4.2` |
| UI library | React / React DOM | `^18.3.1` |
| Lenguaje | TypeScript | `^5.5.3` |
| Pruebas unitarias | Vitest | `^4.1.12` (devDependency) |

## 2. Cómo corre la página hoy

- **Desarrollo (`npm run dev` en `app/`):**
  - Levanta Vite en `http://localhost:5173` (con `host: true`, accesible en red local).
  - El plugin `serveDataSample` en `app/vite.config.ts` intercepta `/data-sample/*` y sirve directamente desde `../data-sample/` en disco, sin copiar los ~8 MB a `app/public/`.
  - **Qué necesita estar corriendo:** únicamente `npm run dev` dentro de `app/`. No requiere API en Python, base de datos ni servidor externo.
- **Comprobación de tipos:** `npm run typecheck` ejecuta `tsc --noEmit`.
- **Pruebas:** `npm test` ejecuta `vitest run` sobre `app/tests/`.
- **Validación de datos:** `npm run check-data` ejecuta `node scripts/check-data.mjs` sobre `../data-sample` (o la ruta pasada como argumento).
- **Build de producción (`npm run build`):**
  - Ejecuta `tsc && vite build`.
  - Genera `app/dist/` (`index.html` + `assets/*.js`).
  - Para servir `app/dist/` en producción con datos estáticos, el servidor estático debe incluir `data-sample/` junto a `dist/` en `/data-sample/`.
