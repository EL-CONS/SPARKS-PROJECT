// Spectrum on the fly: forced aperture photometry at one sky position on
// every single exposure of a field. Each SPHEREx exposure sees that position
// through a different wavelength, so the list of exposures is a spectrum.
//
// Input cubes (frames.bin, masks.bin) are the pipeline's: int16 pixels encoded
// as round((image - background) / sigma * 1000), and one mask byte per pixel
// (non-zero = flagged by the SPHEREx pipeline, excluding the SOURCE flag).

export interface SpectrumFrame {
  /** Index of the exposure inside frames.bin */
  i: number;
  det: number;
  season: number;
  /** Wavelength at the field centre, µm */
  lam: number;
  /** Per-exposure noise used by the int16 encoding, MJy/sr */
  sigma: number;
}

export type SpectrumReason = 'ok' | 'saturated' | 'flagged' | 'edge';

export interface SpectrumSample {
  lam: number;
  det: number;
  season: number;
  /** Background-subtracted flux in the aperture, mJy. null when not measurable. */
  flux: number | null;
  /** 1σ error from the exposure noise, mJy */
  err: number | null;
  reason: SpectrumReason;
}

/** int16 values at or above this are the encoder's ceiling: a saturated or clipped pixel. */
export const CLIP_CODE = 32000;
export const APERTURE_HALF = 1; // 3 x 3 pixel box
export const ANNULUS_IN = 4;
export const ANNULUS_OUT = 7;
const MIN_ANNULUS_PIXELS = 24;

/** Solid angle of a square pixel, in steradians. */
export function pixelSolidAngleSr(pixelArcsec: number): number {
  const rad = (pixelArcsec * Math.PI) / 648000;
  return rad * rad;
}

function median(values: number[]): number {
  const s = values.slice().sort((a, b) => a - b);
  const mid = s.length >> 1;
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function apertureSpectrum(
  frames: Int16Array,
  masks: Uint8Array | null,
  meta: SpectrumFrame[],
  n: number,
  x: number,
  y: number,
  pixelArcsec: number,
): SpectrumSample[] {
  const cx = Math.round(x);
  const cy = Math.round(y);
  // MJy/sr summed over pixels -> mJy
  const toMjy = pixelSolidAngleSr(pixelArcsec) * 1e9;
  const nAp = (2 * APERTURE_HALF + 1) ** 2;
  const out: SpectrumSample[] = [];

  for (const f of meta) {
    const base = { lam: f.lam, det: f.det, season: f.season };
    const off = f.i * n * n;
    if (off + n * n > frames.length) continue;
    if (cx - APERTURE_HALF < 0 || cy - APERTURE_HALF < 0 || cx + APERTURE_HALF >= n || cy + APERTURE_HALF >= n) {
      out.push({ ...base, flux: null, err: null, reason: 'edge' });
      continue;
    }

    let sum = 0;
    let reason: SpectrumReason = 'ok';
    for (let dy = -APERTURE_HALF; dy <= APERTURE_HALF && reason === 'ok'; dy++) {
      for (let dx = -APERTURE_HALF; dx <= APERTURE_HALF; dx++) {
        const p = off + (cy + dy) * n + (cx + dx);
        const v = frames[p];
        if (v >= CLIP_CODE) {
          reason = 'saturated';
          break;
        }
        if (masks && masks[p] !== 0) {
          reason = 'flagged';
          break;
        }
        sum += v;
      }
    }
    if (reason !== 'ok') {
      out.push({ ...base, flux: null, err: null, reason });
      continue;
    }

    const ring: number[] = [];
    for (let dy = -ANNULUS_OUT; dy <= ANNULUS_OUT; dy++) {
      for (let dx = -ANNULUS_OUT; dx <= ANNULUS_OUT; dx++) {
        const r = Math.hypot(dx, dy);
        if (r < ANNULUS_IN || r > ANNULUS_OUT) continue;
        const px = cx + dx;
        const py = cy + dy;
        if (px < 0 || py < 0 || px >= n || py >= n) continue;
        const p = off + py * n + px;
        const v = frames[p];
        if (v >= CLIP_CODE || (masks && masks[p] !== 0)) continue;
        ring.push(v);
      }
    }
    if (ring.length < MIN_ANNULUS_PIXELS) {
      out.push({ ...base, flux: null, err: null, reason: 'edge' });
      continue;
    }

    const scale = (f.sigma / 1000) * toMjy;
    out.push({
      ...base,
      flux: (sum - nAp * median(ring)) * scale,
      // encoded noise is 1000 per pixel; background error is small next to it
      err: Math.sqrt(nAp) * 1000 * scale,
      reason: 'ok',
    });
  }
  return out.sort((a, b) => a.lam - b.lam);
}

export interface SpectrumSummary {
  total: number;
  ok: number;
  saturated: number;
  flagged: number;
  edge: number;
  /** Median flux per detector (mJy), only detectors with measurable exposures */
  byDetector: { det: number; lamMin: number; lamMax: number; n: number; median: number }[];
}

export function summarizeSpectrum(samples: SpectrumSample[]): SpectrumSummary {
  const count = (r: SpectrumReason) => samples.filter(s => s.reason === r).length;
  const byDetector: SpectrumSummary['byDetector'] = [];
  for (const det of Array.from(new Set(samples.map(s => s.det))).sort((a, b) => a - b)) {
    const good = samples.filter(s => s.det === det && s.flux !== null);
    if (!good.length) continue;
    byDetector.push({
      det,
      lamMin: Math.min(...good.map(s => s.lam)),
      lamMax: Math.max(...good.map(s => s.lam)),
      n: good.length,
      median: median(good.map(s => s.flux as number)),
    });
  }
  return { total: samples.length, ok: count('ok'), saturated: count('saturated'), flagged: count('flagged'), edge: count('edge'), byDetector };
}
