// Copy for the "what does this tell me" charts. Each title is the answer,
// readable in a second; the detail line is for whoever wants more.
import type { Lang } from '../core/urlState';

export interface InsightsDict {
  title: string;
  motion: { say: (mu: string, err: string, cat: string, exp: string) => string; agree: string; disagree: string; kid: (px: string) => string; sparks: string; perYear: string; band: string };
  direction: { say: (dir: string, pa: string) => string; kid: string; dirs: string[] };
  noise: { say: (x: string) => string; kid: string; one: string; stack: string; unit: string };
  color: { say: (sat: number, total: number) => string; kid: string; sat: string; ok: string; none: string };
  quality: { say: (src: string, bad: string) => string; kid: string; star: string; problems: string; names: Record<string, string> };
  data: { say: (n: number, seasons: number, rel: string) => string };
  classifier: {
    title: string;
    candidate: (clase: string) => string;
    probability: (p: string) => string;
    agreement: string;
    discrepancy: (ml: string, rule: string) => string;
    disclaimer: string;
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
      kid: 'Es tan brillante que la cámara se "encandila", como una foto contra el sol.',
      sat: 'saturadas',
      ok: 'medibles',
      none: 'sin dato',
    },
    quality: {
      say: (src, bad) => `${src} de los píxeles marcados son la estrella misma; problemas reales: ${bad}.`,
      kid: 'La NASA marca cada píxel dudoso. Aquí casi todo está bien.',
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
      title: 'Clasificador de aprendizaje automático (Bosque aleatorio)',
      candidate: (c) => `Candidato a ${c}`,
      probability: (p) => `${p} % de probabilidad del ensamble`,
      agreement: 'Coincide con el veredicto de la regla física de dos pasos.',
      discrepancy: (ml, rule) => `Discrepancia metodológica: el modelo ML predice "${ml}", mientras que la regla astrofísica deduce "${rule}".`,
      disclaimer: 'candidato a clase, entrenado con 36 objetos (33 de 36 al dejar uno fuera)',
      breakdown: 'Distribución de probabilidades por clase',
      limitNote: 'Son candidatos a revisar a partir de variables de Gaia DR3; no constituyen una identificación definitiva.',
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
      kid: 'It is so bright the camera is "dazzled", like a photo against the Sun.',
      sat: 'saturated',
      ok: 'measurable',
      none: 'no data',
    },
    quality: {
      say: (src, bad) => `${src} of the flagged pixels are the star itself; real problems: ${bad}.`,
      kid: 'NASA flags every doubtful pixel. Here almost everything is fine.',
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
      title: 'Machine learning classifier (Random forest)',
      candidate: (c) => `Candidate ${c}`,
      probability: (p) => `${p}% ensemble probability`,
      agreement: 'Agrees with the two-step physical rule verdict.',
      discrepancy: (ml, rule) => `Methodological discrepancy: ML model predicts "${ml}", while physical rule deduces "${rule}".`,
      disclaimer: 'candidate class, trained on 36 objects (33 of 36 leave-one-out)',
      breakdown: 'Probability breakdown by class',
      limitNote: 'These are candidate classifications from Gaia DR3 features; they are not definitive identifications.',
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
