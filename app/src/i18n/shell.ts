// Copy for the app shell (header, steps, eyepiece, footer) and for the tools
// added by the requirements audit: field of view, brightness legend, catalogue
// layers and the spectrum on the fly. No scientific number lives here: counts,
// fluxes and limits are passed in from the data files.
import type { Lang } from '../core/urlState';

export interface ShellDict {
  sections: string;
  langButton: string;
  steps: [string, string, string];
  stepsLabel: string;
  stepPrev: string;
  stepNext: string;
  trailHint: string;
  back: string;
  next: string;
  coordsLabel: string;
  needTarget: string;
  scrollMore: string;
  scrollMoreShort: string;
  barnardName: string;
  footer: { who: string; credits: string; illustrations: string };
  scope: {
    how: string;
    centre: string;
    centreValue: string;
    ring: string;
    ringValue: string;
    edge: string;
    edgeValue: string;
    hours: string;
    hoursValue: string;
    aimed: string;
    withPhotos: string;
  };
  far: { title: (ra: string, dec: string) => string; body: (name: string, deg: string) => string; go: (name: string) => string };
  fov: { label: string; option: (arcmin: string) => string; full: string; note: (arcmin: string) => string };
  gray: { low: string; high: string; unit: string; blink: string; stack: (n: number) => string; perDetector: string };
  /** Panel de resta sin datos: ese detector no tiene alguna de las dos temporadas del par */
  noDiff: (det: number) => string;
  layers: { label: string; gaia: (n: number) => string; catwise: (n: number) => string; key: (max: number) => string; none: string };
  spec: {
    title: string;
    lead: string;
    measureTarget: string;
    measureCentre: string;
    clear: string;
    loading: (n: number) => string;
    failed: string;
    at: (x: string, y: string) => string;
    counts: (ok: number, total: number) => string;
    lost: (sat: number, flagged: number, edge: number) => string;
    none: string;
    axisX: string;
    axisY: string;
    chartLabel: (ok: number, lo: string, hi: string) => string;
    caveat: string;
    nudge: string;
    nudgeDir: { left: string; right: string; up: string; down: string };
    table: string;
    tableCols: [string, string, string, string];
    pickMark: string;
  };
}

export const SHELL: Record<Lang, ShellDict> = {
  es: {
    sections: 'Secciones',
    langButton: 'ES',
    steps: ['Apunta el telescopio', 'Mira el cielo', '¿Qué pasó?'],
    stepsLabel: 'Pasos',
    stepPrev: 'Paso anterior',
    stepNext: 'Paso siguiente',
    trailHint: 'Desliza o usa las flechas ← →',
    back: 'Atrás',
    next: 'Siguiente',
    coordsLabel: '¿O tienes coordenadas?',
    needTarget: 'Primero apunta a un astro que tenga fotos.',
    scrollMore: 'Bajar para ver más',
    scrollMoreShort: 'Más abajo',
    barnardName: 'Estrella de Barnard',
    footer: {
      who: 'Equipo Cosmonautas · NASA Space Apps Challenge 2026, Hermosillo · reto “Planet X and SPHEREx”.',
      credits:
        'Proyecto independiente, no afiliado ni respaldado por la NASA. Datos: SPHEREx, NASA/IPAC IRSA, CatWISE2020, ESA/Gaia/DPAC. Herramientas: Astropy.',
      illustrations:
        'Los astros que cruzan el fondo son ilustraciones de los objetivos del reto; las fotos de SPHEREx están solo en el escenario.',
    },
    scope: {
      how: 'Cómo leer la mira',
      centre: 'Centro',
      centreValue: 'polo norte del cielo (+90°)',
      ring: 'Anillo punteado',
      ringValue: 'ecuador del cielo (0°)',
      edge: 'Borde',
      edgeValue: 'hacia el polo sur (−90°)',
      hours: 'Horas alrededor',
      hoursValue: 'ascensión recta',
      aimed: 'Apuntando a',
      withPhotos: 'con fotos',
    },
    far: {
      title: (ra, dec) => `No tenemos fotos de RA ${ra}, Dec ${dec}`,
      body: (name, deg) =>
        `Sparks muestra campos ya procesados, y ese punto no cae en ninguno. El más cercano es ${name}, a ${deg}° de distancia. No mostramos otro campo como si fuera el tuyo.`,
      go: name => `Ver ${name}`,
    },
    fov: {
      label: 'Campo de visión',
      option: arcmin => `${arcmin}′`,
      full: 'completo',
      note: arcmin =>
        `El recorte que bajamos mide ${arcmin}′ de lado. Los campos menores son su parte central, ampliada sin suavizar. Un campo mayor pide bajar más datos de IRSA.`,
    },
    noDiff: det => `D${det} no tiene fotos en una de las dos temporadas de este par: no hay resta.`,
    gray: {
      low: 'negro',
      high: 'blanco',
      unit: 'MJy/sr',
      blink: 'Brillo de cada píxel, del más débil (negro) al más brillante (blanco).',
      stack: n => `Promedio de las ${n} temporadas, pesado por el ruido de cada una; escala asinh.`,
      perDetector: 'Límites de la escala por detector',
    },
    layers: {
      label: 'Catálogos encima de la foto',
      gaia: n => `Gaia DR3 (${n})`,
      catwise: n => `CatWISE2020 (${n})`,
      key: max => `Círculo: estrella de Gaia. Rombo: fuente de WISE (CatWISE2020). Se dibujan las ${max} más brillantes de cada catálogo dentro del campo visible. Son dibujos de Sparks encima de la foto, no parte de ella.`,
      none: 'sin fuentes en este campo',
    },
    spec: {
      title: 'Espectro al vuelo',
      lead: 'Toca cualquier punto de una foto y Sparks mide su brillo en cada foto suelta. Como cada foto lo ve en un color distinto, el resultado es su espectro.',
      measureTarget: 'Medir el objetivo',
      measureCentre: 'Medir el centro',
      clear: 'Quitar',
      loading: n => `Trayendo las ${n} fotos sueltas de este campo…`,
      failed: 'No pudimos traer las fotos sueltas de este campo.',
      at: (x, y) => `Punto medido: píxel x ${x}, y ${y}`,
      counts: (ok, total) => `${ok} de ${total} fotos se pudieron medir.`,
      lost: (sat, flagged, edge) => `Descartadas: ${sat} demasiado brillantes (saturadas o fuera del rango del archivo de fotos), ${flagged} con banderas de la NASA, ${edge} demasiado cerca del borde.`,
      none: 'Ninguna foto se pudo medir en este punto. Prueba con una estrella más débil, lejos del núcleo tapado.',
      axisX: 'longitud de onda (µm)',
      axisY: 'brillo (mJy)',
      chartLabel: (ok, lo, hi) => `Espectro del punto elegido: ${ok} medidas entre ${lo} y ${hi} micras.`,
      caveat:
        'Medida rápida, no calibrada: apertura de 3 × 3 píxeles menos el fondo de un anillo, sin corrección de apertura. La longitud de onda es la del centro del campo; lejos del centro puede diferir en cerca de un canal.',
      nudge: 'Mover el punto un píxel',
      nudgeDir: { left: 'al este', right: 'al oeste', up: 'al norte', down: 'al sur' },
      table: 'Ver los valores por detector',
      tableCols: ['Detector', 'Rango (µm)', 'Fotos', 'Mediana (mJy)'],
      pickMark: 'cruz: punto medido',
    },
  },
  en: {
    sections: 'Sections',
    langButton: 'EN',
    steps: ['Aim the telescope', 'Watch the sky', 'What happened?'],
    stepsLabel: 'Steps',
    stepPrev: 'Previous step',
    stepNext: 'Next step',
    trailHint: 'Swipe or use the ← → keys',
    back: 'Back',
    next: 'Next',
    coordsLabel: 'Or got coordinates?',
    needTarget: 'First aim at a target that has photos.',
    scrollMore: 'Scroll down for more',
    scrollMoreShort: 'More below',
    barnardName: 'Barnard’s Star',
    footer: {
      who: 'Team Cosmonautas · NASA Space Apps Challenge 2026, Hermosillo · “Planet X and SPHEREx” challenge.',
      credits:
        'Independent project, not affiliated with or endorsed by NASA. Data: SPHEREx, NASA/IPAC IRSA, CatWISE2020, ESA/Gaia/DPAC. Tools: Astropy.',
      illustrations:
        'The bodies crossing the background are illustrations of the challenge targets; SPHEREx photos appear only on the stage.',
    },
    scope: {
      how: 'How to read the eyepiece',
      centre: 'Centre',
      centreValue: 'north celestial pole (+90°)',
      ring: 'Dotted ring',
      ringValue: 'celestial equator (0°)',
      edge: 'Edge',
      edgeValue: 'towards the south pole (−90°)',
      hours: 'Hours around',
      hoursValue: 'right ascension',
      aimed: 'Aimed at',
      withPhotos: 'with photos',
    },
    far: {
      title: (ra, dec) => `We have no photos of RA ${ra}, Dec ${dec}`,
      body: (name, deg) =>
        `Sparks shows fields that are already processed, and that point is in none of them. The nearest is ${name}, ${deg}° away. We do not show another field as if it were yours.`,
      go: name => `See ${name}`,
    },
    fov: {
      label: 'Field of view',
      option: arcmin => `${arcmin}′`,
      full: 'full',
      note: arcmin =>
        `The cutout we downloaded is ${arcmin}′ on a side. Smaller fields are its central part, enlarged without smoothing. A larger field means downloading more data from IRSA.`,
    },
    noDiff: det => `D${det} has no photos in one of the two seasons of this pair: no difference.`,
    gray: {
      low: 'black',
      high: 'white',
      unit: 'MJy/sr',
      blink: 'Brightness of each pixel, from faintest (black) to brightest (white).',
      stack: n => `Average of the ${n} seasons, weighted by each one’s noise; asinh scale.`,
      perDetector: 'Scale limits per detector',
    },
    layers: {
      label: 'Catalogues over the photo',
      gaia: n => `Gaia DR3 (${n})`,
      catwise: n => `CatWISE2020 (${n})`,
      key: max => `Circle: Gaia star. Diamond: WISE source (CatWISE2020). The ${max} brightest of each catalogue inside the visible field are drawn. They are Sparks drawings over the photo, not part of it.`,
      none: 'no sources in this field',
    },
    spec: {
      title: 'Spectrum on the fly',
      lead: 'Tap any point of a photo and Sparks measures its brightness on every single exposure. Each exposure sees it in a different colour, so the result is its spectrum.',
      measureTarget: 'Measure the target',
      measureCentre: 'Measure the centre',
      clear: 'Remove',
      loading: n => `Fetching the ${n} single exposures of this field…`,
      failed: 'We could not fetch the single exposures of this field.',
      at: (x, y) => `Measured point: pixel x ${x}, y ${y}`,
      counts: (ok, total) => `${ok} of ${total} exposures could be measured.`,
      lost: (sat, flagged, edge) => `Dropped: ${sat} too bright (saturated or beyond the range of the exposure file), ${flagged} with NASA flags, ${edge} too close to the edge.`,
      none: 'No exposure could be measured at this point. Try a fainter star, away from the masked core.',
      axisX: 'wavelength (µm)',
      axisY: 'brightness (mJy)',
      chartLabel: (ok, lo, hi) => `Spectrum of the chosen point: ${ok} measurements between ${lo} and ${hi} microns.`,
      caveat:
        'Quick, uncalibrated measurement: 3 × 3 pixel aperture minus the background from a ring, with no aperture correction. The wavelength is that of the field centre; away from the centre it can differ by about one channel.',
      nudge: 'Move the point by one pixel',
      nudgeDir: { left: 'east', right: 'west', up: 'north', down: 'south' },
      table: 'See the values per detector',
      tableCols: ['Detector', 'Range (µm)', 'Exposures', 'Median (mJy)'],
      pickMark: 'cross: measured point',
    },
  },
};
