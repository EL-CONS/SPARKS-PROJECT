# Recursos del reto

Fuente: pestaña "Resources" del reto Planet X and SPHEREx en `spaceappschallenge.org`. Aviso oficial: NASA no respalda a entidades que no son del gobierno de EE. UU. y no es responsable de la información de sitios que no son del gobierno de EE. UU. Para esos sitios, hay que cumplir las reglas de uso de datos de cada sitio.

## Recursos de NASA

| Recurso | Para qué sirve | Enlace |
|---|---|---|
| NASA/IPAC Infrared Science Archive | Recursos de SPHEREx; el archivo oficial de los datos | https://irsa.ipac.caltech.edu/Missions/spherex.html |
| Cuadernos de tutoriales de SPHEREx | Notebooks de Jupyter de ejemplo para acceder a los datos de SPHEREx con Python | https://caltech-ipac.github.io/irsa-tutorials/spherex/ |
| WiseView | Herramienta parecida para ver datos de una misión anterior de NASA, WISE. El público la ha usado para hacer cientos de descubrimientos; el reto invita a usarla como modelo o inspiración | http://byw.tools/wiseview |
| Datos de la misión Gaia | Usar el último lanzamiento de datos (Data Release 3) | https://archive.stsci.edu/missions-and-data/gaia |

## Recursos de agencias espaciales socias: CSA (Agencia Espacial Canadiense)

| Recurso | Qué es | Enlace |
|---|---|---|
| NEOSSat: asteroides, basura espacial y exoplanetas | El primer telescopio espacial del mundo dedicado a detectar y rastrear asteroides, cometas, satélites y basura espacial | https://www.asc-csa.gc.ca/eng/satellites/neossat/ |
| Canadian Astronomy Data Centre (CADC) | Acceso a observaciones de telescopios y misiones canadienses e internacionales | https://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/en/ |
| Tutorial de datos de NEOSSat | Tutorial en Python para visualizar datos de NEOSSat | https://github.com/asc-csa/NEOSSAT_Tutorial |
| Dataset de NEOSSat | Observaciones de NEOSSat para detectar y rastrear asteroides, cometas, satélites y basura espacial | https://data.asc-csa.gc.ca/dataset/neossat |

## Notas de acceso del equipo (medidas el 14 de noviembre de 2026)

Esto no es del sitio del reto: son pruebas nuestras. Se detallan, con hora, en `docs/sprint-13-30/cobertura-y-acceso.md` (rama `carlos`).

- El dominio `caltech-ipac.github.io` no respondió desde la red del equipo; los mismos tutoriales se leen en https://github.com/Caltech-IPAC/irsa-tutorials/tree/main/tutorials/spherex.
- SIA de IRSA responde con un radio mínimo (0.0005°). Las colecciones útiles son `spherex_dr1` y `spherex_qr3`; `spherex_qr2` ya no se indexa en SIA.
- El archivo de Gaia (ESA) respondió bien hoy; IRSA TAP síncrono falla a menudo.
- El certificado SSL del dataset de NEOSSat (`data.asc-csa.gc.ca`) falló en las pruebas.
