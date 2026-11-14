# ¿Hace falta un servidor? · Prueba real de CORS

Se probó con `curl` enviando la cabecera `Origin: https://el-cons.github.io` el **2026-11-14** contra los endpoints públicos de IRSA (SPHEREx) y ESA (Gaia).

## 1. Evidencia medida

| Servicio | URL probada | Respuesta HTTP | Cabecera `Access-Control-Allow-Origin` | ¿Permite llamadas directas desde navegador? |
|---|---|---|---|---|
| **IRSA SIA** | `https://irsa.ipac.caltech.edu/SIA?COLLECTION=spherex_qr2&POS=circle+269.45+4.77+0.05` | `HTTP/2 200` | **Ausente** | **No** (el navegador bloquea la lectura por CORS) |
| **IRSA TAP** | `https://irsa.ipac.caltech.edu/TAP/sync?QUERY=SELECT+TOP+1+schema_name+FROM+TAP_SCHEMA.schemas&FORMAT=json` | `HTTP/2 200` | **Ausente** | **No** (bloqueado por CORS) |
| **Gaia ESA TAP** | `https://gea.esac.esa.int/tap-server/tap/capabilities` | `HTTP/1.1 200` (`HEAD` en `/sync` dio `500`) | **Ausente** | **No** (bloqueado por CORS) |

## 2. Conclusión técnica

- **Para los campos precalculados (`data-sample/`):** **No hace falta servidor.** Todo se sirve como archivos estáticos desde el mismo origen que la app.
- **Para consultas en vivo desde el navegador a IRSA o Gaia:** **Sí hace falta un proxy pequeño**, porque ninguno de los tres endpoints devuelve `Access-Control-Allow-Origin`. Un `fetch()` directo desde `https://...` fallará en Chrome/Firefox aunque el servidor responda `200`.

## 3. Opción más barata (sin servicios de pago)

- **Cloudflare Workers (plan Free):**
  - **Límites gratuitos:** 100,000 peticiones/día, 10 ms de CPU por petición (suficiente para reenviar una consulta SIA/TAP y añadir `Access-Control-Allow-Origin: *`). No requiere tarjeta de crédito para el plan Free.
  - **Alcance:** solo reenvía `GET` a `irsa.ipac.caltech.edu` y `gea.esac.esa.int` con caché corto y cabeceras CORS, sin almacenar datos ni base de datos.
- **Alternativa sin proxy (gratis total para el hackatón):** mantener los campos precalculados en estático (como `data-sample/`), que hoy no necesitan servidor ni proxy.
