import type { Lang } from '../core/urlState';

export interface I18nDict {
  appTitle: string;
  searchLabel: string;
  searchPlaceholder: string;
  searchSubmit: string;
  coordErrorEmpty: string;
  coordErrorFormat: string;
  coordErrorRange: string;
  modeBlink: string;
  modeStack: string;
  modeDiff: string;
  play: string;
  pause: string;
  prevFrame: string;
  nextFrame: string;
  speedLabel: string;
  loading: string;
  loadError: string;
  emptyTitle: string;
  soonTitle: string;
  soonBody: string;
  soonAction: string;
  candidateLabel: string;
  measuredMotion: string;
  expectedCatalog: string;
  framesCombined: string;
  seasonsCount: (n: number) => string;
}

export const I18N: Record<Lang, I18nDict> = {
  en: {
    appTitle: 'Sparks · SPHEREx Sky Comparator',
    searchLabel: 'Sky coordinates or target',
    searchPlaceholder: 'e.g. 08h55m10.831s -7d14m42.53s or Barnard',
    searchSubmit: 'Inspect sky',
    coordErrorEmpty: 'Enter RA and Dec or a target name to inspect.',
    coordErrorFormat: 'Use decimal degrees (133.795 -7.245), HMS/DMS (08h55m10.831s -7d14m42.53s), or a target name.',
    coordErrorRange: 'Coordinates out of range: RA must be 0–360° (0–24h) and Dec −90° to +90°.',
    modeBlink: 'Blink',
    modeStack: 'Stack',
    modeDiff: 'Subtract',
    play: 'Play',
    pause: 'Pause',
    prevFrame: 'Previous season',
    nextFrame: 'Next season',
    speedLabel: 'Blink speed',
    loading: 'Loading SPHEREx field index…',
    loadError: 'Could not load the field index. Check the /data-sample/ route and try again.',
    emptyTitle: 'No targets available in index.',
    soonTitle: 'Cutouts coming soon',
    soonBody: 'This candidate target is indexed, but its SPHEREx cutouts are not in this bundle yet. Switch to Barnard’s Star to inspect real frames.',
    soonAction: 'Open Barnard’s Star',
    candidateLabel: 'Candidate to review',
    measuredMotion: 'Measured proper motion',
    expectedCatalog: 'Catalog reference',
    framesCombined: 'Frames combined',
    seasonsCount: (n: number) => `${n} seasons`,
  },
  es: {
    appTitle: 'Sparks · Comparador del cielo SPHEREx',
    searchLabel: 'Coordenadas u objetivo',
    searchPlaceholder: 'ej. 08h55m10.831s -7d14m42.53s o Barnard',
    searchSubmit: 'Ver cielo',
    coordErrorEmpty: 'Escribe RA y Dec o el nombre de un objetivo para empezar.',
    coordErrorFormat: 'Usa grados decimales (133.795 -7.245), HMS/DMS (08h55m10.831s -7d14m42.53s) o un nombre del reto.',
    coordErrorRange: 'Coordenadas fuera de rango: RA debe estar entre 0–360° (0–24h) y Dec entre −90° y +90°.',
    modeBlink: 'Parpadeo',
    modeStack: 'Suma',
    modeDiff: 'Resta',
    play: 'Reproducir',
    pause: 'Pausar',
    prevFrame: 'Temporada anterior',
    nextFrame: 'Temporada siguiente',
    speedLabel: 'Velocidad',
    loading: 'Cargando índice de SPHEREx…',
    loadError: 'No pudimos cargar el índice de campos. Verifica la ruta /data-sample/ e intenta de nuevo.',
    emptyTitle: 'No hay objetivos disponibles en el índice.',
    soonTitle: 'Recortes disponibles pronto',
    soonBody: 'Este candidato ya está en el índice, pero sus recortes de SPHEREx aún no están en este paquete. Vuelve a la estrella de Barnard para revisar cuadros reales.',
    soonAction: 'Abrir estrella de Barnard',
    candidateLabel: 'Candidato a revisar',
    measuredMotion: 'Movimiento propio medido',
    expectedCatalog: 'Referencia de catálogo',
    framesCombined: 'Cuadros combinados',
    seasonsCount: (n: number) => `${n} temporadas`,
  },
};
