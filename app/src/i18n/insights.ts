// Copy for the "what does this tell me" charts. Each title is the answer,
// readable in a second; the detail line is for whoever wants more.
import type { Lang } from '../core/urlState';

export interface InsightsDict {
  title: string;
  motion: { say: (mu: string, err: string, cat: string, exp: string) => string; bound: (mu: string, err: string, cat: string, exp: string) => string; agree: string; disagree: string; kid: (px: string) => string; sparks: string; perYear: string; band: string };
  direction: { say: (dir: string, pa: string) => string; kid: string; dirs: string[] };
  noise: { say: (x: string) => string; kid: string; one: string; stack: string; unit: string };
  color: { say: (sat: number, total: number) => string; sayOk: (ok: number, total: number) => string; kid: string; sat: string; ok: string; none: string };
  quality: { say: (src: string, bad: string) => string; kid: string; kidBad: string; star: string; problems: string; names: Record<string, string> };
  data: { say: (n: number, seasons: number, rel: string) => string };
  classifier: {
    title: string;
    candidate: (clase: string) => string;
    probability: (p: string) => string;
    imageVariable: string;
    agreement: string;
    discrepancy: (ml: string, rule: string) => string;
    /** Resumen del modelo con cifras leídas de resultados_v2.json */
    disclaimer: (pct: string, n: number, variablesMal: boolean) => string;
    imageSource: string;
    modelSource: string;
    variableYes: string;
    variableNo: string;
    variableUnknown: string;
    fromKind: (kind: string) => string;
    fromDipole: (balance: string, n: number, umbral: string) => string;
    fromNothing: string;
    breakdown: string;
    limitNote: string;
  };
  manifestStatus: {
    partialBadge: string;
    okBadge: string;
    caveatsTitle: string;
    blockersTitle: string;
    partialNotice: string;
  };
  all: string;
  source: string;
  sourceLine: (s: string) => string;
}

export const INSIGHTS: Record<Lang, InsightsDict> = {
  es: {
    title: 'Qué nos dice cada cosa',
    motion: {
      say: (mu, err, cat, exp) => `Se mueve ${mu} ± ${err} ″ por año. ${cat} esperaba ${exp}.`,
      bound: (mu, err, cat, exp) => `Aquí no se midió movimiento: el ajuste da ${mu} ± ${err} ″ por año, que no llega a 3 veces su error, así que solo es una cota superior.${cat ? ` ${cat} esperaba ${exp}.` : ''}`,
      agree: 'Coinciden: la medida es buena.',
      disagree: 'No coinciden del todo: hay que revisarla.',
      kid: px => `Son ${px} cuadritos de la foto por año.`,
      sparks: 'Sparks',
      perYear: '″/año',
      band: 'margen de error',
    },
    direction: {
      say: (dir, pa) => `Va hacia el ${dir} (${pa}° desde el norte).`,
      kid: 'La flecha va de donde estaba (azul) a donde está (ámbar).',
      dirs: ['norte', 'noreste', 'este', 'sureste', 'sur', 'suroeste', 'oeste', 'noroeste'],
    },
    noise: {
      say: x => `Sumar las fotos limpia la imagen hasta ${x} veces.`,
      kid: 'Barra larga = más ruido. Más corta es mejor.',
      one: 'una foto',
      stack: 'fotos sumadas',
      unit: 'ruido (MJy/sr)',
    },
    color: {
      say: (sat, total) => `No pudimos medir su color: ${sat} de ${total} fotos salieron saturadas.`,
      sayOk: (ok, total) => `Su color se pudo medir en ${ok} de ${total} fotos.`,
      kid: 'Es tan brillante que la cámara se "encandila", como una foto contra el sol.',
      sat: 'saturadas',
      ok: 'medibles',
      none: 'sin dato',
    },
    quality: {
      say: (src, bad) => `${src} de los píxeles marcados son la estrella misma; problemas reales: ${bad}.`,
      kid: 'La NASA marca cada píxel dudoso. Aquí casi todo está bien.',
      kidBad: 'La NASA marca cada píxel dudoso. Aquí la mayoría de lo marcado son problemas reales.',
      star: 'es la estrella',
      problems: 'problemas',
      names: {
        SOURCE: 'parte de una estrella',
        TRANSIENT: 'destello pasajero (rayo cósmico)',
        OVERFLOW: 'demasiada luz',
        SUR_ERROR: 'error de lectura',
        NONFUNC: 'píxel que no funciona',
        COLD: 'píxel frío',
        HOT: 'píxel caliente',
        PERSIST: 'eco de una foto anterior',
        OUTLIER: 'valor raro',
        GHOST: 'reflejo fantasma',
        NONLINEAR: 'respuesta no lineal',
      },
    },
    data: {
      say: (n, s, rel) => `Usamos ${n} fotos de SPHEREx en ${s} temporadas (${rel}).`,
    },
    classifier: {
      title: 'Clasificador (imagen + bosque aleatorio Gaia DR3)',
      candidate: (c) => `Candidato a ${c}`,
      probability: (p) => `${p} % entre estrella, enana marrón y enana blanca`,
      imageVariable: 'Clasificado como variable por la imagen de SPHEREx (residuo sin dipolo de movimiento); el modelo ML de Gaia solo distingue entre estrella, enana marrón y enana blanca.',
      agreement: 'Coincide con el veredicto de la regla física de dos pasos.',
      discrepancy: (ml, rule) => `Discrepancia metodológica: el modelo ML predice "${ml}", mientras que la regla astrofísica deduce "${rule}".`,
      disclaimer: (pct, n, variablesMal) => `candidato a clase; acierta ${pct} % en ${n} objetos con clase verificada${variablesMal ? '; separa mal las variables' : ''}`,
      imageSource: 'variable: por la imagen',
      modelSource: 'clase: candidato del modelo',
      variableYes: 'sí',
      variableNo: 'no',
      variableUnknown: 'sin decidir',
      fromKind: k => `campo kind del manifiesto ("${k}")`,
      fromDipole: (b, n, u) => `indicio de dipolo: balance mediano ${b} en ${n} restas; debajo de ${u} se toma como variable. Es un indicio medido en solo 5 campos, no una regla validada`,
      fromNothing: 'el manifiesto no trae kind y las restas no dan señal suficiente: no se decide si es variable',
      breakdown: 'Probabilidades ML (solo entre clases no variables)',
      limitNote: 'La separación "variable" frente a objeto en movimiento sale de la imagen (dipolo / kind); el bosque aleatorio con Gaia DR3 solo decide entre estrella, enana marrón y enana blanca.',
    },
    manifestStatus: {
      partialBadge: 'Procesamiento parcial',
      okBadge: 'Procesamiento completo',
      caveatsTitle: 'Salvedades y advertencias del campo',
      blockersTitle: 'Bloqueos metodológicos declarados',
      partialNotice: 'Este campo tiene cobertura o detección parcial; no se declara movimiento medido definitivo.',
    },
    all: 'Todas las cifras, con su fuente',
    source: 'Fuente',
    sourceLine: s => `Fuente: ${s}`,
  },
  en: {
    title: 'What each thing tells us',
    motion: {
      say: (mu, err, cat, exp) => `It moves ${mu} ± ${err} ″ per year. ${cat} expected ${exp}.`,
      bound: (mu, err, cat, exp) => `No motion was measured here: the fit gives ${mu} ± ${err} ″ per year, less than 3 times its error, so it is only an upper limit.${cat ? ` ${cat} expected ${exp}.` : ''}`,
      agree: 'They agree: the measurement holds.',
      disagree: 'They don’t fully agree: it needs review.',
      kid: px => `That is ${px} squares of the photo per year.`,
      sparks: 'Sparks',
      perYear: '″/yr',
      band: 'error margin',
    },
    direction: {
      say: (dir, pa) => `It is heading ${dir} (${pa}° from north).`,
      kid: 'The arrow goes from where it was (blue) to where it is (amber).',
      dirs: ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'],
    },
    noise: {
      say: x => `Stacking the photos cleans the image up to ${x} times.`,
      kid: 'Longer bar = more noise. Shorter is better.',
      one: 'one photo',
      stack: 'stacked photos',
      unit: 'noise (MJy/sr)',
    },
    color: {
      say: (sat, total) => `We could not measure its colour: ${sat} of ${total} photos came back saturated.`,
      sayOk: (ok, total) => `Its colour could be measured in ${ok} of ${total} photos.`,
      kid: 'It is so bright the camera is "dazzled", like a photo against the Sun.',
      sat: 'saturated',
      ok: 'measurable',
      none: 'no data',
    },
    quality: {
      say: (src, bad) => `${src} of the flagged pixels are the star itself; real problems: ${bad}.`,
      kid: 'NASA flags every doubtful pixel. Here almost everything is fine.',
      kidBad: 'NASA flags every doubtful pixel. Here most of what is flagged are real problems.',
      star: 'is the star',
      problems: 'problems',
      names: {
        SOURCE: 'part of a star',
        TRANSIENT: 'passing flash (cosmic ray)',
        OVERFLOW: 'too much light',
        SUR_ERROR: 'readout error',
        NONFUNC: 'dead pixel',
        COLD: 'cold pixel',
        HOT: 'hot pixel',
        PERSIST: 'echo of an earlier photo',
        OUTLIER: 'odd value',
        GHOST: 'ghost reflection',
        NONLINEAR: 'non-linear response',
      },
    },
    data: {
      say: (n, s, rel) => `We used ${n} SPHEREx photos across ${s} seasons (${rel}).`,
    },
    classifier: {
      title: 'Classifier (image + Gaia DR3 random forest)',
      candidate: (c) => `Candidate ${c}`,
      probability: (p) => `${p}% among star, brown dwarf, and white dwarf`,
      imageVariable: 'Classified as variable from the SPHEREx image (residual without motion dipole); the Gaia ML model only distinguishes star, brown dwarf, and white dwarf.',
      agreement: 'Agrees with the two-step physical rule verdict.',
      discrepancy: (ml, rule) => `Methodological discrepancy: ML model predicts "${ml}", while physical rule deduces "${rule}".`,
      disclaimer: (pct, n, variablesMal) => `candidate class; right ${pct}% of the time on ${n} objects with a verified class${variablesMal ? '; separates variables poorly' : ''}`,
      imageSource: 'variable: from the image',
      modelSource: 'class: model candidate',
      variableYes: 'yes',
      variableNo: 'no',
      variableUnknown: 'undecided',
      fromKind: k => `manifest kind field ("${k}")`,
      fromDipole: (b, n, u) => `dipole hint: median balance ${b} over ${n} differences; below ${u} it is taken as variable. A hint measured on only 5 fields, not a validated rule`,
      fromNothing: 'the manifest has no kind and the differences carry too little signal: variability is not decided',
      breakdown: 'ML probabilities (non-variable classes only)',
      limitNote: 'The "variable" vs. moving decision comes from the image (dipole / kind); the Gaia DR3 random forest only decides among star, brown dwarf, and white dwarf.',
    },
    manifestStatus: {
      partialBadge: 'Partial processing',
      okBadge: 'Complete processing',
      caveatsTitle: 'Field caveats and warnings',
      blockersTitle: 'Declared pipeline blockers',
      partialNotice: 'This field has partial coverage or detection; no definitive measured motion is claimed.',
    },
    all: 'All the numbers, with their source',
    source: 'Source',
    sourceLine: s => `Source: ${s}`,
  },
};
