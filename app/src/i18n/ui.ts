// UI copy for the design layer (app/src/ui). Added by Joaquín; kept apart from
// Cons's index.ts so neither file steps on the other. Every scientific number
// shown in the UI comes from data files, never from this module.
import type { Lang } from '../core/urlState';

export type TermId =
  | 'spherex'
  | 'detector'
  | 'season'
  | 'infrared'
  | 'properMotion'
  | 'arcsec'
  | 'parallax'
  | 'gaia'
  | 'catwise'
  | 'brownDwarf'
  | 'redDwarf'
  | 'variable'
  | 'saturated'
  | 'sigma'
  | 'stack'
  | 'subtract'
  | 'radec'
  | 'positionAngle'
  | 'doi'
  | 'release'
  | 'pixel'
  | 'wavelength'
  | 'candidate'
  | 'flags';

export interface Term {
  label: string;
  short: string;
}

export interface AstroCopy {
  name: string;
  line: string;
  inSparks: string;
}

export interface UiDict {
  skip: string;
  nav: { glossary: string; lang: string; langName: string; share: string; copied: string };
  search: { label: string; placeholder: string; submit: string; hint: string; tryLabel: string; soonTag: string; noField: (name: string, deg: string) => string; nearest: string };
  layer1: { generic: string; cta: string; ctaPlaying: string };
  stage: {
    title: string;
    detector: (d: number) => string;
    alt: (d: number, when: string, mode: string) => string;
    blinkLegend: string;
    stackLegend: string;
    diffLegend: (a: string, b: string) => string;
    diffScaleLow: string;
    diffScaleMid: string;
    diffScaleHigh: string;
    diffUnit: string;
    noData: string;
    focusAll: string;
    focusOne: (d: number) => string;
    marks: string;
    gaiaLayer: string;
    marksNote: string;
    northEast: string;
    fov: (arcmin: string, px: string) => string;
    loading: (done: number, total: number) => string;
    loadFailed: string;
    retry: string;
  };
  modes: { label: string; blink: string; stack: string; diff: string; blinkHelp: string; stackHelp: string; diffHelp: string };
  transport: {
    play: string;
    pause: string;
    prev: string;
    next: string;
    speed: string;
    speeds: string[];
    speedNote: string;
    frameOf: (n: number, total: number) => string;
    stackIdle: string;
    pairLabel: string;
  };
  flash: { title: string; body: string; ok: string; step: string };
  log: {
    title: string;
    intro: string;
    entryKid: (i: number) => string;
    images: (n: number) => string;
    now: string;
    before: string;
    readingTitle: string;
    perYear: string;
    readingKid: (pxPerYear: string) => string;
    measured: string;
    expected: (cat: string) => string;
    agreement: (sigma: string) => string;
    direction: string;
    dialTitle: string;
    dialDesc: (mu: string, pa: string) => string;
    expectedLegend: string;
    measuredLegend: string;
    errorLegend: string;
  };
  verdict: { title: string; mover: string; moverWhy: string; coldMissing: string; ruleNote: string };
  layers: {
    title: string;
    l2Title: string;
    l2: string;
    l3Title: string;
    l3Intro: string;
    source: string;
    rows: {
      mu: string;
      pa: string;
      gaia: string;
      agreement: string;
      fit: string;
      parallax: string;
      images: string;
      seasons: string;
      pixel: string;
      fov: string;
      pipeline: string;
      generated: string;
    };
    fitValue: (n: number, dets: string, yr: string) => string;
    parallaxValue: (mas: string) => string;
    releasesTitle: string;
    releaseRow: (rel: string, n: number, versions: string) => string;
    noiseTitle: string;
    noiseIntro: string;
    noiseCols: string[];
    flagsTitle: string;
    flagsIntro: (det: number, season: string) => string;
    flagsNote: string;
    fingerprintTitle: string;
    fingerprintIntro: string;
    fingerprintSat: (sat: number, total: number) => string;
    fingerprintLegendSat: string;
    fingerprintLegendGood: string;
    fingerprintLegendEmpty: string;
    fingerprintAria: (det: number, ch: number, lam: string, state: string) => string;
  };
  soon: { title: string; body: string; measuredSoFar: string; noMotion: string; open: string; kind: Record<string, string> };
  astros: { title: string; intro: string; illustration: string; items: Record<'nearStar' | 'brownDwarf' | 'variable' | 'comet' | 'asteroid', AstroCopy> };
  story: { title: string; body: string };
  footer: { data: string; built: string; team: string; honest: string };
  glossary: { title: string; close: string; open: string };
  terms: Record<TermId, Term>;
  targets: Record<string, { short: string; note: string }>;
  months: string[];
}

export const UI: Record<Lang, UiDict> = {
  es: {
    skip: 'Saltar al cielo',
    nav: {
      glossary: 'Glosario',
      lang: 'Idioma',
      langName: 'Español',
      share: 'Copiar enlace',
      copied: 'Enlace copiado',
    },
    search: {
      label: 'Busca un punto del cielo',
      placeholder: '17h57m48.5s +4d41m36s · 269.4486 4.7672 · Barnard',
      submit: 'Buscar',
      hint: 'Acepta grados, horas y grados (HMS/DMS) o el nombre de un objetivo.',
      tryLabel: 'Prueba con',
      soonTag: 'pronto',
      noField: (name, deg) => `Ese punto está lejos de los campos que tenemos. El más cercano es ${name}, a ${deg}° de distancia.`,
      nearest: 'Ir al más cercano',
    },
    layer1: {
      generic: 'Dos fotos del mismo cielo, tomadas con meses de diferencia. Lo que salta, se movió.',
      cta: 'Mira qué se mueve',
      ctaPlaying: 'Mirando…',
    },
    stage: {
      title: 'El cielo, en seis detectores',
      detector: d => `Detector ${d}`,
      alt: (d, when, mode) => `Foto de SPHEREx, detector ${d}, ${when}. Vista: ${mode}.`,
      blinkLegend: 'Brillo de cada píxel. Negro en el centro: la estrella satura el detector y ese núcleo se tapa.',
      stackLegend: 'Promedio de las 3 temporadas, pesado por el ruido de cada una. Menos ruido, nada se mueve.',
      diffLegend: (a, b) => `Resta: ${b} menos ${a}. Azul: donde estaba. Ámbar: donde está ahora.`,
      diffScaleLow: 'azul: aquí estaba',
      diffScaleMid: 'oscuro: no cambió',
      diffScaleHigh: 'ámbar: aquí está ahora',
      diffUnit: 'en veces el ruido (σ)',
      noData: 'Negro: sin dato (píxel saturado o tapado).',
      focusAll: 'Ver los seis detectores',
      focusOne: d => `Ampliar detector ${d}`,
      marks: 'Marcas de posición',
      gaiaLayer: 'Estrellas de Gaia',
      marksNote: 'Las marcas son dibujos de Sparks encima de la imagen, no parte de ella.',
      northEast: 'Norte arriba, este a la izquierda',
      fov: (arcmin, px) => `Campo de ${arcmin}′ · píxel de ${px}″`,
      loading: (done, total) => `Trayendo imágenes del campo: ${done} de ${total}`,
      loadFailed: 'No pudimos traer las imágenes de este campo. Revisa tu conexión y vuelve a intentar.',
      retry: 'Intentar de nuevo',
    },
    modes: {
      label: 'Cómo ver el cielo',
      blink: 'Parpadeo',
      stack: 'Suma',
      diff: 'Resta',
      blinkHelp: 'Alterna las temporadas, como Tombaugh.',
      stackHelp: 'Junta todo: imagen más limpia.',
      diffHelp: 'Borra lo quieto, deja lo que cambió.',
    },
    transport: {
      play: 'Reproducir',
      pause: 'Pausar',
      prev: 'Temporada anterior',
      next: 'Temporada siguiente',
      speed: 'Velocidad',
      speeds: ['Lento', 'Medio', 'Rápido'],
      speedNote: 'Máximo 3 cambios por segundo, el límite seguro para destellos.',
      frameOf: (n, total) => `Temporada ${n} de ${total}`,
      stackIdle: 'La suma junta las tres temporadas en una sola imagen: no hay nada que reproducir.',
      pairLabel: 'Comparar',
    },
    flash: {
      title: 'Esta vista parpadea',
      body: 'Alterna imágenes una vez por segundo. Si los destellos te molestan, avanza paso a paso con las flechas.',
      ok: 'Entendido, reproducir',
      step: 'Prefiero paso a paso',
    },
    log: {
      title: 'Bitácora del campo',
      intro: 'Cada entrada es una temporada: varias noches en que SPHEREx volvió a mirar aquí.',
      entryKid: i => ['Miramos aquí por primera vez.', 'Volvimos a mirar.', 'Otra vez. ¿Algo saltó?', 'Una vez más.'][i] ?? 'Volvimos a mirar.',
      images: n => `${n} imágenes`,
      now: 'ahora',
      before: 'antes',
      readingTitle: 'Lectura',
      perYear: '″/año',
      readingKid: px => `En un año avanzó ${px} cuadritos de la foto. Para una estrella, eso es correr.`,
      measured: 'Medido por Sparks',
      expected: cat => `Esperado por ${cat}`,
      agreement: s => `Coinciden: la diferencia es ${s} veces el error.`,
      direction: 'Dirección',
      dialTitle: 'Hacia dónde va',
      dialDesc: (mu, pa) => `Flecha de movimiento: ${mu} segundos de arco por año, ángulo ${pa} grados desde el norte hacia el este.`,
      expectedLegend: 'Catálogo',
      measuredLegend: 'Sparks',
      errorLegend: 'Incertidumbre',
    },
    verdict: {
      title: 'Veredicto',
      mover: 'Estrella cercana que se mueve',
      moverWhy: 'Deja una mancha azul y una ámbar a los lados de su centro, y su movimiento coincide con el catálogo.',
      coldMissing: 'Falta un dato: no medimos su índice de frío porque satura el detector en luz corta.',
      ruleNote: 'Clasificado con reglas físicas. Es un candidato a revisar, no un descubrimiento.',
    },
    layers: {
      title: 'Profundiza',
      l2Title: 'Qué mide Sparks',
      l2: 'SPHEREx, un telescopio de la NASA, fotografía todo el cielo cada seis meses en 102 colores de luz infrarroja, repartidos en seis detectores. Sparks junta las fotos de cada detector y temporada para bajar el ruido, las alinea contra estrellas del catálogo Gaia y resta una temporada de otra. Lo quieto se borra; lo que se movió deja una mancha azul donde estaba y una ámbar donde está. Con la posición de la estrella en cada temporada se ajusta una recta: su pendiente es el movimiento propio, con su barra de error.',
      l3Title: 'Los números',
      l3Intro: 'Cada cifra con su unidad, su incertidumbre y de dónde sale.',
      source: 'Fuente',
      rows: {
        mu: 'Movimiento propio',
        pa: 'Ángulo de posición',
        gaia: 'Referencia de catálogo',
        agreement: 'Acuerdo',
        fit: 'Ajuste',
        parallax: 'Paralaje restada',
        images: 'Imágenes',
        seasons: 'Temporadas',
        pixel: 'Tamaño de píxel',
        fov: 'Campo de visión',
        pipeline: 'Versión del proceso',
        generated: 'Generado',
      },
      fitValue: (n, dets, yr) => `recta con ${n} puntos · detectores ${dets} · ${yr} años de línea base`,
      parallaxValue: mas => `${mas} mas (valor de Gaia DR3; no se mide con píxeles de 6″)`,
      releasesTitle: 'Datos de SPHEREx usados',
      releaseRow: (rel, n, versions) => `${rel} · ${n} imágenes · versiones ${versions}`,
      noiseTitle: 'Ruido antes y después de sumar',
      noiseIntro: 'Sumar las fotos de una temporada baja el ruido del píxel. En MJy/sr.',
      noiseCols: ['Detector', 'Temporada', 'Fotos', 'σ una foto', 'σ suma', 'Mejora'],
      flagsTitle: 'Banderas de calidad',
      flagsIntro: (det, season) => `Píxeles marcados por la NASA en las fotos del detector ${det}, ${season}.`,
      flagsNote: 'SOURCE solo dice que el píxel cae sobre una estrella. Las demás banderas avisan de problemas.',
      fingerprintTitle: 'Huella de 102 colores',
      fingerprintIntro: 'Seis detectores por diecisiete canales. Cada celda es un color de luz infrarroja, de 0.75 a 5 µm.',
      fingerprintSat: (sat, total) => `${sat} de ${total} mediciones salieron saturadas: Barnard es demasiado brillante para medir su espectro con SPHEREx. No lo inventamos.`,
      fingerprintLegendSat: 'saturado',
      fingerprintLegendGood: 'medido',
      fingerprintLegendEmpty: 'sin foto',
      fingerprintAria: (det, ch, lam, state) => `Detector ${det}, canal ${ch}, ${lam} µm: ${state}`,
    },
    soon: {
      title: 'Sus imágenes llegan pronto',
      body: 'Este objetivo ya está en la lista, pero sus fotos no vienen en este paquete de datos. No las inventamos.',
      measuredSoFar: 'Lo que ya midió Sparks',
      noMotion: 'No se mueve lo suficiente para medirlo: es una estrella variable, cambia de brillo en el mismo lugar.',
      open: 'Mira la estrella de Barnard',
      kind: { mover: 'Se mueve', variable: 'Variable' },
    },
    astros: {
      title: 'Qué puede saltar en el cielo',
      intro: 'Personajes que Sparks sabe distinguir. Son dibujos para explicar, no fotos.',
      illustration: 'Ilustración',
      items: {
        nearStar: { name: 'Estrella cercana', line: 'Está tan cerca que su paso se nota en meses.', inSparks: 'En la resta: azul y ámbar pegados.' },
        brownDwarf: { name: 'Enana café', line: 'Muy fría para ser estrella, muy grande para ser planeta. Casi solo brilla en infrarrojo.', inSparks: 'Brilla en los detectores 5 y 6 y casi nada en el 1.' },
        variable: { name: 'Estrella variable', line: 'No se mueve: se enciende y se apaga despacio.', inSparks: 'En la resta: una sola mancha en el mismo lugar.' },
        comet: { name: 'Cometa', line: 'Hielo y polvo que cruza rápido, con cola.', inSparks: 'Cambia de lugar entre noches de la misma temporada.' },
        asteroid: { name: 'Asteroide', line: 'Roca del sistema solar. Se mueve tanto que en cada foto está en otro sitio.', inSparks: 'Aún no hay un campo con asteroide en Sparks.' },
      },
    },
    story: {
      title: 'De dónde viene la idea',
      body: 'En 1930, Clyde Tombaugh tomó dos fotos del mismo cielo con seis días de diferencia y las alternó en un comparador de parpadeo. Las estrellas se quedaban quietas; un puntito saltaba. Era Plutón. Sparks hace lo mismo con SPHEREx, en 102 colores y para cualquier punto del cielo.',
    },
    footer: {
      data: 'Datos públicos de SPHEREx (NASA/IPAC, IRSA) y Gaia DR3 (ESA).',
      built: 'Hecho con Astropy y Aladin Lite.',
      team: 'Sparks · Cosmonautas · NASA Space Apps Challenge 2026, Hermosillo',
      honest: 'Mostramos candidatos a revisar, nunca descubrimientos. Lo que no medimos, lo decimos.',
    },
    glossary: { title: 'Glosario', close: 'Cerrar', open: 'Qué es' },
    terms: {
      spherex: { label: 'SPHEREx', short: 'Telescopio espacial de la NASA, lanzado en 2025. Fotografía todo el cielo cada seis meses en 102 colores de luz infrarroja.' },
      detector: { label: 'detector', short: 'La cámara de SPHEREx tiene seis. Cada uno ve una franja de colores infrarrojos: el 1 los más cortos, el 6 los más largos.' },
      season: { label: 'temporada', short: 'Unas semanas en que SPHEREx vuelve a pasar por el mismo punto del cielo. Ocurre más o menos cada seis meses.' },
      infrared: { label: 'infrarrojo', short: 'Luz que nuestros ojos no ven, con más longitud de onda que el rojo. Las cosas frías brillan sobre todo en infrarrojo.' },
      properMotion: { label: 'movimiento propio', short: 'Cuánto se desplaza una estrella en el cielo en un año. Se mide en segundos de arco por año (″/año).' },
      arcsec: { label: 'segundo de arco', short: 'Un ángulo muy pequeño: la 3600-ava parte de un grado. La Luna llena mide unos 1800″.' },
      parallax: { label: 'paralaje', short: 'Bamboleo aparente de una estrella cercana porque la Tierra gira alrededor del Sol. Sparks no la mide: resta el valor publicado.' },
      gaia: { label: 'Gaia', short: 'Misión de la ESA que midió la posición y el movimiento de más de mil millones de estrellas. Sparks la usa como referencia.' },
      catwise: { label: 'CatWISE', short: 'Catálogo infrarrojo hecho con los telescopios WISE y NEOWISE. Sirve para objetos fríos que Gaia no ve.' },
      brownDwarf: { label: 'enana café', short: 'Objeto muy frío para ser estrella y muy grande para ser planeta. También se llama enana marrón.' },
      redDwarf: { label: 'enana roja', short: 'La estrella más común: pequeña, fría y de luz rojiza. Barnard es una.' },
      variable: { label: 'estrella variable', short: 'Estrella que cambia de brillo con el tiempo, sin moverse de lugar.' },
      saturated: { label: 'saturado', short: 'Cuando una estrella es tan brillante que llena el píxel y ya no se puede medir cuánto brilla.' },
      sigma: { label: 'σ (sigma)', short: 'El tamaño del ruido o del error. "3σ" significa tres veces más grande que el ruido.' },
      stack: { label: 'suma', short: 'Promediar varias fotos del mismo lugar. El ruido baja y lo débil aparece.' },
      subtract: { label: 'resta', short: 'Quitar una foto de otra. Lo que no cambió desaparece; lo que cambió queda.' },
      radec: { label: 'RA y Dec', short: 'Ascensión recta y declinación: la longitud y la latitud del cielo.' },
      positionAngle: { label: 'ángulo de posición', short: 'Hacia dónde apunta un movimiento, en grados: 0° es el norte y 90° el este.' },
      doi: { label: 'DOI', short: 'Identificador permanente de un conjunto de datos, para citarlo y volver a encontrarlo.' },
      release: { label: 'lanzamiento', short: 'Cada vez que la NASA publica un paquete de imágenes de SPHEREx (QR2, QR3…).' },
      pixel: { label: 'píxel', short: 'Cada cuadrito de la foto. En SPHEREx mide 6.15″ de cielo: es grande.' },
      wavelength: { label: 'longitud de onda (λ)', short: 'El "color" de la luz, en micras (µm). SPHEREx ve de 0.75 a 5 µm.' },
      candidate: { label: 'candidato a revisar', short: 'Algo que Sparks señala para que una persona lo revise. No es un descubrimiento hasta que se confirme.' },
      flags: { label: 'banderas', short: 'Marcas que la NASA pone en cada píxel para avisar de problemas: rayos cósmicos, saturación, píxeles calientes…' },
    },
    targets: {
      barnard: { short: 'Barnard', note: 'Enana roja a 1.8 pársecs. La estrella que más rápido cruza nuestro cielo.' },
      wise0855: { short: 'WISE 0855', note: 'La enana café más fría conocida (unos 250 K), a 2.3 pársecs. Gaia no la ve.' },
      epsindib: { short: 'ε Indi B', note: 'Pareja de enanas café que gira alrededor de ε Indi A, a 3.6 pársecs. SPHEREx la ve como un solo punto.' },
      rwaur: { short: 'RW Aurigae', note: 'Pareja de estrellas jóvenes que se oscurece a ratos, a unos 150 pársecs.' },
      rdra: { short: 'R Draconis', note: 'Estrella variable tipo Mira: pulsa con un periodo de 246 días.' },
    },
    months: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
  },
  en: {
    skip: 'Skip to the sky',
    nav: {
      glossary: 'Glossary',
      lang: 'Language',
      langName: 'English',
      share: 'Copy link',
      copied: 'Link copied',
    },
    search: {
      label: 'Find a spot in the sky',
      placeholder: '17h57m48.5s +4d41m36s · 269.4486 4.7672 · Barnard',
      submit: 'Search',
      hint: 'Takes degrees, hours and degrees (HMS/DMS) or a target name.',
      tryLabel: 'Try',
      soonTag: 'soon',
      noField: (name, deg) => `That spot is far from the fields we have. The nearest is ${name}, ${deg}° away.`,
      nearest: 'Go to the nearest',
    },
    layer1: {
      generic: 'Two photos of the same sky, taken months apart. Whatever jumps, moved.',
      cta: 'See what moves',
      ctaPlaying: 'Watching…',
    },
    stage: {
      title: 'The sky, in six detectors',
      detector: d => `Detector ${d}`,
      alt: (d, when, mode) => `SPHEREx photo, detector ${d}, ${when}. View: ${mode}.`,
      blinkLegend: 'Brightness of each pixel. Black at the centre: the star saturates the detector and that core is masked.',
      stackLegend: 'Average of the 3 seasons, weighted by each one’s noise. Less noise; nothing moves.',
      diffLegend: (a, b) => `Subtraction: ${b} minus ${a}. Blue: where it was. Amber: where it is now.`,
      diffScaleLow: 'blue: it was here',
      diffScaleMid: 'dark: no change',
      diffScaleHigh: 'amber: it is here now',
      diffUnit: 'in multiples of the noise (σ)',
      noData: 'Black: no data (saturated or masked pixel).',
      focusAll: 'Show all six detectors',
      focusOne: d => `Enlarge detector ${d}`,
      marks: 'Position marks',
      gaiaLayer: 'Gaia stars',
      marksNote: 'Marks are drawn by Sparks on top of the image, not part of it.',
      northEast: 'North up, east left',
      fov: (arcmin, px) => `${arcmin}′ field · ${px}″ pixel`,
      loading: (done, total) => `Fetching this field’s images: ${done} of ${total}`,
      loadFailed: 'We couldn’t fetch this field’s images. Check your connection and try again.',
      retry: 'Try again',
    },
    modes: {
      label: 'How to see the sky',
      blink: 'Blink',
      stack: 'Stack',
      diff: 'Subtract',
      blinkHelp: 'Alternates the seasons, like Tombaugh.',
      stackHelp: 'Combines everything: a cleaner image.',
      diffHelp: 'Erases what stayed, keeps what changed.',
    },
    transport: {
      play: 'Play',
      pause: 'Pause',
      prev: 'Previous season',
      next: 'Next season',
      speed: 'Speed',
      speeds: ['Slow', 'Medium', 'Fast'],
      speedNote: 'At most 3 changes per second, the safe limit for flashing.',
      frameOf: (n, total) => `Season ${n} of ${total}`,
      stackIdle: 'Stack combines all three seasons into one image: there is nothing to play.',
      pairLabel: 'Compare',
    },
    flash: {
      title: 'This view blinks',
      body: 'It switches images once per second. If flashing bothers you, step through with the arrows instead.',
      ok: 'Got it, play',
      step: 'I’ll step through',
    },
    log: {
      title: 'Field log',
      intro: 'Each entry is a season: a few weeks when SPHEREx came back to look here.',
      entryKid: i => ['We looked here for the first time.', 'We looked again.', 'Again. Did something jump?', 'Once more.'][i] ?? 'We looked again.',
      images: n => `${n} images`,
      now: 'now',
      before: 'before',
      readingTitle: 'Reading',
      perYear: '″/yr',
      readingKid: px => `In one year it moved ${px} squares of the photo. For a star, that is running.`,
      measured: 'Measured by Sparks',
      expected: cat => `Expected by ${cat}`,
      agreement: s => `They agree: the difference is ${s} times the error.`,
      direction: 'Direction',
      dialTitle: 'Where it is heading',
      dialDesc: (mu, pa) => `Motion arrow: ${mu} arcseconds per year, angle ${pa} degrees from north towards east.`,
      expectedLegend: 'Catalog',
      measuredLegend: 'Sparks',
      errorLegend: 'Uncertainty',
    },
    verdict: {
      title: 'Verdict',
      mover: 'Nearby star on the move',
      moverWhy: 'It leaves a blue and an amber patch on either side of its centre, and its motion matches the catalog.',
      coldMissing: 'One value is missing: we did not measure its coldness index because it saturates the detector in short light.',
      ruleNote: 'Classified with physical rules. A candidate to review, not a discovery.',
    },
    layers: {
      title: 'Dig deeper',
      l2Title: 'What Sparks measures',
      l2: 'SPHEREx, a NASA telescope, photographs the whole sky every six months in 102 colours of infrared light, split across six detectors. Sparks combines the photos of each detector and season to lower the noise, aligns them against stars from the Gaia catalog, and subtracts one season from another. What stayed still disappears; what moved leaves a blue patch where it was and an amber one where it is. A straight line through the star’s position in each season gives its slope: the proper motion, with its error bar.',
      l3Title: 'The numbers',
      l3Intro: 'Every figure with its unit, its uncertainty and where it comes from.',
      source: 'Source',
      rows: {
        mu: 'Proper motion',
        pa: 'Position angle',
        gaia: 'Catalog reference',
        agreement: 'Agreement',
        fit: 'Fit',
        parallax: 'Parallax removed',
        images: 'Images',
        seasons: 'Seasons',
        pixel: 'Pixel size',
        fov: 'Field of view',
        pipeline: 'Pipeline version',
        generated: 'Generated',
      },
      fitValue: (n, dets, yr) => `line through ${n} points · detectors ${dets} · ${yr}-year baseline`,
      parallaxValue: mas => `${mas} mas (Gaia DR3 value; not measurable with 6″ pixels)`,
      releasesTitle: 'SPHEREx data used',
      releaseRow: (rel, n, versions) => `${rel} · ${n} images · versions ${versions}`,
      noiseTitle: 'Noise before and after stacking',
      noiseIntro: 'Stacking a season’s photos lowers the pixel noise. In MJy/sr.',
      noiseCols: ['Detector', 'Season', 'Photos', 'σ one photo', 'σ stack', 'Gain'],
      flagsTitle: 'Quality flags',
      flagsIntro: (det, season) => `Pixels flagged by NASA in detector ${det} photos, ${season}.`,
      flagsNote: 'SOURCE only says the pixel lies on a star. The other flags warn about problems.',
      fingerprintTitle: '102-colour fingerprint',
      fingerprintIntro: 'Six detectors by seventeen channels. Each cell is one colour of infrared light, from 0.75 to 5 µm.',
      fingerprintSat: (sat, total) => `${sat} of ${total} measurements came back saturated: Barnard is too bright to measure its spectrum with SPHEREx. We don’t make it up.`,
      fingerprintLegendSat: 'saturated',
      fingerprintLegendGood: 'measured',
      fingerprintLegendEmpty: 'no photo',
      fingerprintAria: (det, ch, lam, state) => `Detector ${det}, channel ${ch}, ${lam} µm: ${state}`,
    },
    soon: {
      title: 'Its images are coming soon',
      body: 'This target is on the list, but its photos are not in this data bundle. We don’t make them up.',
      measuredSoFar: 'What Sparks has measured',
      noMotion: 'It doesn’t move enough to measure: it is a variable star that changes brightness in place.',
      open: 'See Barnard’s Star',
      kind: { mover: 'Moves', variable: 'Variable' },
    },
    astros: {
      title: 'What can jump in the sky',
      intro: 'Characters Sparks can tell apart. They are drawings to explain, not photos.',
      illustration: 'Illustration',
      items: {
        nearStar: { name: 'Nearby star', line: 'So close that its drift shows in months.', inSparks: 'In Subtract: blue and amber side by side.' },
        brownDwarf: { name: 'Brown dwarf', line: 'Too cold to be a star, too big to be a planet. Shines almost only in infrared.', inSparks: 'Bright in detectors 5 and 6, almost dark in 1.' },
        variable: { name: 'Variable star', line: 'It doesn’t move: it slowly brightens and dims.', inSparks: 'In Subtract: a single patch in the same spot.' },
        comet: { name: 'Comet', line: 'Ice and dust crossing fast, with a tail.', inSparks: 'Changes place between nights of the same season.' },
        asteroid: { name: 'Asteroid', line: 'A rock of the solar system. It moves so much it is somewhere else in every photo.', inSparks: 'Sparks has no asteroid field yet.' },
      },
    },
    story: {
      title: 'Where the idea comes from',
      body: 'In 1930, Clyde Tombaugh took two photos of the same sky six days apart and switched between them in a blink comparator. The stars stayed still; one dot jumped. It was Pluto. Sparks does the same with SPHEREx, in 102 colours and for any point in the sky.',
    },
    footer: {
      data: 'Public data from SPHEREx (NASA/IPAC, IRSA) and Gaia DR3 (ESA).',
      built: 'Built with Astropy and Aladin Lite.',
      team: 'Sparks · Cosmonautas · NASA Space Apps Challenge 2026, Hermosillo',
      honest: 'We show candidates to review, never discoveries. What we did not measure, we say.',
    },
    glossary: { title: 'Glossary', close: 'Close', open: 'What is' },
    terms: {
      spherex: { label: 'SPHEREx', short: 'NASA space telescope launched in 2025. It photographs the whole sky every six months in 102 colours of infrared light.' },
      detector: { label: 'detector', short: 'SPHEREx’s camera has six. Each sees a band of infrared colours: 1 the shortest, 6 the longest.' },
      season: { label: 'season', short: 'A few weeks when SPHEREx passes over the same spot again. It happens about every six months.' },
      infrared: { label: 'infrared', short: 'Light our eyes can’t see, with longer wavelengths than red. Cold things shine mostly in infrared.' },
      properMotion: { label: 'proper motion', short: 'How far a star drifts across the sky in one year. Measured in arcseconds per year (″/yr).' },
      arcsec: { label: 'arcsecond', short: 'A tiny angle: one 3600th of a degree. The full Moon is about 1800″ across.' },
      parallax: { label: 'parallax', short: 'The apparent wobble of a nearby star as Earth orbits the Sun. Sparks doesn’t measure it: it removes the published value.' },
      gaia: { label: 'Gaia', short: 'ESA mission that measured the position and motion of over a billion stars. Sparks uses it as reference.' },
      catwise: { label: 'CatWISE', short: 'Infrared catalog built from the WISE and NEOWISE telescopes. Useful for cold objects Gaia can’t see.' },
      brownDwarf: { label: 'brown dwarf', short: 'An object too cold to be a star and too big to be a planet.' },
      redDwarf: { label: 'red dwarf', short: 'The most common star: small, cool and reddish. Barnard is one.' },
      variable: { label: 'variable star', short: 'A star whose brightness changes over time, without moving.' },
      saturated: { label: 'saturated', short: 'When a star is so bright it fills the pixel and its brightness can no longer be measured.' },
      sigma: { label: 'σ (sigma)', short: 'The size of the noise or error. "3σ" means three times bigger than the noise.' },
      stack: { label: 'stack', short: 'Averaging several photos of the same spot. Noise drops and faint things appear.' },
      subtract: { label: 'subtract', short: 'Removing one photo from another. What didn’t change vanishes; what changed remains.' },
      radec: { label: 'RA and Dec', short: 'Right ascension and declination: the longitude and latitude of the sky.' },
      positionAngle: { label: 'position angle', short: 'Where a motion points, in degrees: 0° is north and 90° is east.' },
      doi: { label: 'DOI', short: 'A permanent identifier for a dataset, so it can be cited and found again.' },
      release: { label: 'release', short: 'Each time NASA publishes a batch of SPHEREx images (QR2, QR3…).' },
      pixel: { label: 'pixel', short: 'Each little square of the photo. In SPHEREx it covers 6.15″ of sky: that’s big.' },
      wavelength: { label: 'wavelength (λ)', short: 'The "colour" of light, in microns (µm). SPHEREx sees from 0.75 to 5 µm.' },
      candidate: { label: 'candidate to review', short: 'Something Sparks points out for a person to check. Not a discovery until confirmed.' },
      flags: { label: 'flags', short: 'Marks NASA puts on each pixel to warn about problems: cosmic rays, saturation, hot pixels…' },
    },
    targets: {
      barnard: { short: 'Barnard', note: 'Red dwarf 1.8 parsecs away. The fastest-moving star in our sky.' },
      wise0855: { short: 'WISE 0855', note: 'The coldest known brown dwarf (about 250 K), 2.3 parsecs away. Gaia can’t see it.' },
      epsindib: { short: 'ε Indi B', note: 'A pair of brown dwarfs orbiting ε Indi A, 3.6 parsecs away. SPHEREx sees them as one dot.' },
      rwaur: { short: 'RW Aurigae', note: 'A pair of young stars that dims at times, about 150 parsecs away.' },
      rdra: { short: 'R Draconis', note: 'Mira-type variable star: it pulses with a 246-day period.' },
    },
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },
};
