# Sparks

Herramienta web del equipo Cosmonautas para el reto **Planet X and SPHEREx** del NASA Space Apps Challenge 2026 (sede Hermosillo).

Escribes una posición del cielo y Sparks pone a parpadear las fotos que el telescopio SPHEREx de la NASA tomó de ese lugar en fechas distintas. Lo que salta, se movió. Azul es dónde estaba; ámbar, dónde está ahora.

Sparks muestra **candidatos para revisar**, nunca descubrimientos. Es un proyecto independiente, no afiliado ni respaldado por la NASA.

## Qué hace

- Acepta coordenadas en grados (`269.4486 4.7672`), en horas y grados (`08h55m10.831s -7d14m42.53s`, `17:57:48.5 +04:41:36`) o el nombre de un objetivo del reto.
- Muestra el parche en los seis detectores de SPHEREx, en tres vistas: **parpadeo** (alterna las temporadas, a 1, 2 o 3 cambios por segundo), **suma** (promedio de las temporadas, con menos ruido) y **resta** (una temporada menos otra, en múltiplos del ruido).
- **Campo de visión elegible**: el recorte completo, la mitad o la cuarta parte.
- **Espectro al vuelo**: tocas un punto y Sparks lo mide en cada foto suelta.
- Capas de **Gaia DR3** y **CatWISE2020** encima de la foto.
- Banderas de calidad de la NASA, ruido por detector, y cada cifra con su fuente.
- Todo el estado viaja en la URL, para compartir o incrustar: `?ra=269.4486&dec=4.7672&fov=3.28&mode=diff&det=all&lang=es#explorar`.
- Español e inglés. Un solo tema, oscuro (decisión provisional del 14 de noviembre: ver `docs/integracion/estado.md`).

Qué requisitos del reto se cumplen y cuáles no, con evidencia: [`docs/auditoria/requisitos.md`](docs/auditoria/requisitos.md).

## Cómo correrlo

Probado con Node 26; Vite 5 pide Node 18 o más reciente.

```bash
cd app
npm ci
npm run dev        # abre http://localhost:5173
```

Otros comandos, también dentro de `app/`:

| Comando | Qué hace |
|---|---|
| `npm test` | Pruebas de la lógica (coordenadas, URL, reproductor, campo de visión, espectro) |
| `npm run typecheck` | Revisión de tipos |
| `npm run check-data` | Revisa que `data-sample/` y `data-new/` cumplan el formato |
| `npm run build` | Genera el sitio en `app/dist/`, con los datos incluidos |
| `npm run preview` | Sirve `app/dist/` en http://localhost:4173 para probarlo antes de publicar |

## Cómo publicarlo

`npm run build` deja en `app/dist/` un sitio estático completo (unos 21 MB con los datos). Sirve en cualquier alojamiento de archivos estáticos gratuito.

- **En la raíz de un dominio** (Netlify, Cloudflare Pages, Vercel): `npm run build` y publicar `app/dist/`.
- **En una subcarpeta**, como GitHub Pages en `https://<usuario>.github.io/SPARKS-PROJECT/`: la base tiene que llevar el nombre del repositorio.

```bash
VITE_BASE=/SPARKS-PROJECT/ npm run build
```

Para GitHub Pages el repositorio tiene que ser público (o la cuenta, de pago).

## Qué es cada carpeta

| Carpeta | Qué es |
|---|---|
| `app/` | La aplicación web (Vite, React, TypeScript). `src/core/` es lógica pura con pruebas; `src/data/` lee los datos; `src/ui/` es la interfaz; `src/i18n/` son los textos en español e inglés; `src/styles/` son los estilos |
| `data-sample/` | Campo de la estrella de Barnard ya procesado, más el índice de objetivos. Formato en [`data-sample/README.md`](data-sample/README.md) |
| `data-new/` | Campos de WISE 0855, ε Indi B, RW Aurigae y R Draconis, procesados durante el hackatón con `pipeline/` |
| `ml-clasificador/` | Clasificador de tipo de objeto: v2, bosque aleatorio con 69 objetos de clase verificada; cifras en `resultados_v2.json` (la v1 queda como historia) |
| `docs/reto/` | El enunciado del reto, sus recursos y las normas del evento |
| `docs/auditoria/` | Auditoría de requisitos, mapa de ramas, procedencia del material y capturas |
| `docs/entrega/` | Lo que se pega en el sitio de Space Apps: declaración de uso de SI y lista de entrega |
| `Logo/`, `branding/` | Identidad de Sparks |
| `design-proto/` | Prototipos de diseño descartados y el elegido |

La canalización que baja y procesa las imágenes (`pipeline/`) y su método (`docs/pipeline/`) están en la rama `Horacio`. Quién tiene qué en cada rama: [`docs/auditoria/mapa-de-ramas.md`](docs/auditoria/mapa-de-ramas.md).

## De dónde salen los datos

- **Imágenes**: misión SPHEREx de la NASA, del archivo NASA/IPAC Infrared Science Archive (IRSA). Lanzamientos QR2 (DOI 10.26131/IRSA652), QR3 (DOI 10.26131/IRSA662) y DR1, según el campo; cada manifiesto dice cuáles usó.
- **Posiciones y movimientos de referencia**: Gaia DR3 (ESA/Gaia/DPAC) y CatWISE2020.
- **Procesado**: recortes de 64 × 64 píxeles (6.56′ de lado, 6.15″ por píxel), alineados y sumados por detector y temporada. La app no retoca las imágenes: solo las amplía sin suavizar y dibuja marcas en una capa aparte.

## Cómo sumar un campo o un lanzamiento nuevo

1. Procesar el campo con `pipeline/` (rama `Horacio`; pasos en `docs/pipeline/`). Sale una carpeta con `manifest.json`, `catalogs.json`, los cubos `.bin` y `png/`.
2. Copiar la carpeta a `data-new/<id>/` y añadir el campo a `data-new/index.json`.
3. Correr `npm run check-data` dentro de `app/`.
4. `npm run build` y publicar.

Aviso: hoy la app solo lee `data-sample/`. El cargador que también lee `data-new/` está en curso (ver la auditoría).

## Equipo

Cosmonautas, Hermosillo, Sonora. Uso de herramientas de SI durante el desarrollo: [`docs/entrega/uso-de-si.md`](docs/entrega/uso-de-si.md).
