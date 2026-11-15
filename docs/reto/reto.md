# El reto: Planet X and SPHEREx

Fuente: página del reto en `spaceappschallenge.org` (NASA Space Apps Challenge 2026), pestaña "Details". Texto del reto, tal como lo publica NASA, con su estructura. Es la fuente de verdad de lo que se pide: si algo de este archivo choca con la memoria de alguien, gana este archivo.

## Resumen del reto

Desde 2025, la misión SPHEREx de NASA mapea todo el cielo cada seis meses en 102 bandas de luz infrarroja cercana y devuelve imágenes de más de mil millones de objetos. Cometas, asteroides, estrellas, enanas marrones e incluso planetas nuevos se delatan al cambiar de posición entre imágenes, pero ninguna persona puede revisar todo eso sola. **El reto es crear una herramienta web pública que muestre imágenes del cielo de SPHEREx y facilite que cualquiera vea rápido cómo cambian en el tiempo.**

## Antecedentes (según el reto)

- Los asteroides y los cometas orbitan alrededor del Sol. Las estrellas cercanas se desplazan en el cielo mientras orbitan la Galaxia. La Tierra también orbita el Sol, y eso hace que los objetos cercanos cambien su posición aparente.
- Observar esos movimientos ayuda a descubrir objetos astronómicos nuevos y a medir distancias.
- Plutón se descubrió cuando un astrónomo comparó dos imágenes del cielo tomadas en momentos distintos y notó que un punto de luz se había movido.
- Cientos de miles de voluntarios han usado esta técnica para descubrir asteroides, cometas, estrellas y enanas marrones (bolas de gas demasiado masivas para ser planetas pero sin masa suficiente para arder como estrellas). La mayoría de los cometas y de las enanas marrones conocidos se descubrieron así, en proyectos como backyardworlds.org.
- Desde mayo de 2025, SPHEREx devuelve datos únicos. Mapea todo el cielo una vez cada seis meses en 102 bandas de infrarrojo cercano, por lo que es especialmente sensible a objetos ricos en hidrógeno, agua, dióxido de carbono, monóxido de carbono y muchas otras moléculas.
- Habrá demasiados datos para una persona, o incluso para un programa, que los comprenda del todo. Habrá imágenes de más de mil millones de objetos (enanas marrones, cuásares, cometas, asteroides, estrellas, supernovas y galaxias) que a menudo se superponen o varían en brillo. NASA pide herramientas creativas nuevas y que ayuden a que la mayor cantidad de gente participe en los descubrimientos.

## Objetivo (lo obligatorio)

1. Crear una **herramienta web pública** que muestre imágenes del cielo de la misión SPHEREx y facilite que cualquiera vea rápido cómo cambian en el tiempo.
2. La persona **introduce las coordenadas de un parche de cielo (ascensión recta y declinación)**.
3. La herramienta **muestra una serie de imágenes de ese parche como un pequeño video**, para que sea fácil detectar objetos que se mueven.
4. **Probarla** con estos cinco objetivos:

| Objetivo | Qué es, según el reto |
|---|---|
| Estrella de Barnard | Estrella cercana de movimiento propio muy alto |
| Epsilon Indi B | Una pareja de enanas marrones que orbita una estrella |
| WISE 0855 | Una enana marrón de movimiento rápido. Ascensión recta 08h55m10.831s, declinación −7d14m42.53s |
| RW Aurigae | Estrella variable |
| R Draconis | Estrella variable |

## Consideraciones potenciales (opcionales: "puedes, pero no estás obligado")

- **Actualizable.** Llegan datos nuevos de SPHEREx rápido: diseñar una herramienta fácil de actualizar con los lanzamientos más recientes.
- **Las 102 bandas.** Pensar con creatividad cómo mostrarlas para que los usuarios las aprovechen para descubrir cosas. Ejemplo del reto: sumar por separado todos los datos tomados por cada uno de los seis arreglos de detectores para mejorar la relación señal-ruido de las imágenes. Puntos extra si la herramienta genera **espectros al vuelo**.
- **Suma y resta.** Dar la opción de sumar o restar imágenes tomadas en momentos distintos, lo que puede ayudar a descubrir objetos en movimiento.
- **Campo de visión elegible.** Campos mayores permiten seguir fuentes más rápidas, a costa de transferencias de datos más largas.
- **Superposición.** Superponer datos de otros telescopios, como la misión Gaia o la misión WISE.
- **Coordenadas en la URL.** Si se puede consultar la herramienta incluyendo las coordenadas en la URL, los usuarios pueden incrustarla fácilmente en otros sitios y proyectos.
- **Metadatos.** Puede ser útil mostrar metadatos, como las banderas de contaminación.
- **Herramientas públicas.** Buscar herramientas públicas para manejar datos astronómicos (como Astropy) y para mostrarlos (como Aladin, del Centro de Datos Astronómicos de Estrasburgo, CDS).

## Qué significa esto para Sparks

Todo lo que dice "Objetivo" arriba es **obligatorio** para nosotros. Lo de "Consideraciones potenciales" suma, pero no se exige. El reto pide una **herramienta**, no un estudio científico: lo que se evalúa es qué tan bien ayuda a cualquiera a ver cómo cambia el cielo.
