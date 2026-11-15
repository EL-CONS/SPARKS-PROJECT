export type ViewMode = 'blink' | 'stack' | 'diff';
export type Lang = 'en' | 'es';
export type DetectorSelection = 'all' | 1 | 2 | 3 | 4 | 5 | 6;

export interface UrlAppState {
  ra: number;
  dec: number;
  fov: number;
  mode: ViewMode;
  det: DetectorSelection;
  lang: Lang;
}

export const DEFAULT_URL_STATE: UrlAppState = {
  ra: 269.4486,
  dec: 4.7672,
  fov: 6.6,
  mode: 'blink',
  det: 'all',
  lang: 'en',
};

function parseFiniteInRange(raw: string | null, min: number, max: number, fallback: number): number {
  if (raw === null || raw.trim() === '') return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < min || n > max) return fallback;
  return n;
}

export function parseUrlState(search: string, defaults: UrlAppState = DEFAULT_URL_STATE): UrlAppState {
  const p = new URLSearchParams(search);
  const ra = parseFiniteInRange(p.get('ra'), 0, 360, defaults.ra);
  const dec = parseFiniteInRange(p.get('dec'), -90, 90, defaults.dec);
  const fov = parseFiniteInRange(p.get('fov'), 0.5, 60, defaults.fov);

  const rawMode = p.get('mode');
  const mode: ViewMode = rawMode === 'blink' || rawMode === 'stack' || rawMode === 'diff' ? rawMode : defaults.mode;

  const rawDet = p.get('det');
  let det: DetectorSelection = defaults.det;
  if (rawDet === 'all') {
    det = 'all';
  } else if (rawDet !== null) {
    const d = Number(rawDet);
    if (Number.isInteger(d) && d >= 1 && d <= 6) det = d as DetectorSelection;
  }

  const rawLang = p.get('lang');
  const lang: Lang = rawLang === 'es' || rawLang === 'en' ? rawLang : defaults.lang;

  return { ra, dec, fov, mode, det, lang };
}

export function serializeUrlState(state: UrlAppState): string {
  const p = new URLSearchParams();
  p.set('ra', state.ra.toFixed(4));
  p.set('dec', state.dec.toFixed(4));
  p.set('fov', String(state.fov));
  p.set('mode', state.mode);
  p.set('det', String(state.det));
  p.set('lang', state.lang);
  return `?${p.toString()}`;
}

export function writeUrlState(state: UrlAppState): void {
  if (typeof window === 'undefined') return;
  const query = serializeUrlState(state);
  window.history.replaceState({}, '', `${window.location.pathname}${query}`);
}
