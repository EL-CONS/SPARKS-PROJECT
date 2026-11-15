// Rendering helpers for the sky stage. Reads the extra manifest fields and the
// raw .bin cubes that Cons's loader does not type yet. Pixels are drawn as
// data: a fixed linear/asinh stretch or a diverging blue/amber map with a
// legend. Nothing here retouches, smooths or decorates the image.
import type { FieldManifest } from '../data/loader';

export const N = 64; // cutout side in pixels (manifest.field.n)

export interface DiffEntry {
  i: number;
  det: number;
  a: number;
  b: number;
  lam_lo: number;
  lam_hi: number;
  lambda_matched: boolean;
  n_a: number;
  n_b: number;
  sigma: number;
}

export interface FrameEntry {
  i: number;
  obs_id: string;
  det: number;
  season: number;
  mjd: number;
  date: string;
  lam: number;
  dlam: number;
  release: string;
  version: string;
  sigma?: number;
  flag_pixels: Record<string, number>;
  pix_total: number;
  png: string;
}

export interface MotionFit {
  mu: number;
  mu_err: number;
  pa_deg: number;
  pa_err_deg: number;
  baseline_yr: number;
  n_points: number;
  detectors: number[];
  parallax_removed_mas: number | null;
}

export interface TargetPoint {
  det: number;
  season: number;
  x: number;
  y: number;
  use: boolean;
}

export interface SpectrumPoint {
  lam: number;
  det: number;
  season: number;
  sat: boolean;
  good: boolean;
  flux: number | null;
}

export interface FullManifest extends FieldManifest {
  generated_utc: string;
  releases: { collection: string; release: string; doi: string; n_frames: number; versions: string[] }[];
  scales: Record<string, { lo: number; hi: number; noise: number }>;
  diffs: DiffEntry[];
  frames: FrameEntry[];
  flag_bits: Record<string, string>;
  target: {
    source: { id: string; catalog: string };
    expected: { mu: number; pa_deg: number; catalog: string; source_id: string } | null;
    measured: MotionFit | null;
    points: TargetPoint[];
    spectrum: SpectrumPoint[];
  };
  candidates: { id: string; x: number; y: number; rule_label: string; rule_why: string }[];
}

export interface GaiaSource {
  id: string;
  x: number;
  y: number;
  g: number;
}

export interface Cubes {
  coadds: Float32Array;
  coaddsSig: Float32Array;
  diffs: Float32Array;
  diffsSig: Float32Array;
}

async function fetchF32(url: string): Promise<Float32Array> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return new Float32Array(await res.arrayBuffer());
}

export async function loadCubes(base: string, fieldId: string, folder: 'data-sample' | 'data-new' = 'data-sample'): Promise<Cubes> {
  const root = `${base}${folder}/${fieldId}/`;
  const [coadds, coaddsSig, diffs, diffsSig] = await Promise.all([
    fetchF32(`${root}coadds.bin`),
    fetchF32(`${root}coadds_sig.bin`),
    fetchF32(`${root}diffs.bin`),
    fetchF32(`${root}diffs_sig.bin`),
  ]);
  return { coadds, coaddsSig, diffs, diffsSig };
}

export async function loadFullManifest(base: string, fieldId: string, folder: 'data-sample' | 'data-new' = 'data-sample'): Promise<FullManifest> {
  const res = await fetch(`${base}${folder}/${fieldId}/manifest.json`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as FullManifest;
}

export async function loadGaia(base: string, fieldId: string, folder: 'data-sample' | 'data-new' = 'data-sample'): Promise<GaiaSource[]> {
  try {
    const res = await fetch(`${base}${folder}/${fieldId}/catalogs.json`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.gaia?.sources ?? []) as GaiaSource[];
  } catch {
    return [];
  }
}

export interface WiseSource {
  id: string;
  x: number;
  y: number;
  /** W1 magnitude (3.4 µm) */
  w1?: number;
}

export interface Catalogs {
  gaia: GaiaSource[];
  catwise: WiseSource[];
}

/** Gaia DR3 and CatWISE2020 sources of the field, with their pixel positions. */
export async function loadCatalogs(base: string, fieldId: string, folder: 'data-sample' | 'data-new' = 'data-sample'): Promise<Catalogs> {
  try {
    const res = await fetch(`${base}${folder}/${fieldId}/catalogs.json`);
    if (!res.ok) return { gaia: [], catwise: [] };
    const data = await res.json();
    // keep only the sources that fall inside the cutout
    const inside = (g: { x: number; y: number }) => g.x >= 0 && g.x < N && g.y >= 0 && g.y < N;
    return {
      gaia: ((data?.gaia?.sources ?? []) as GaiaSource[]).filter(inside),
      catwise: ((data?.catwise?.sources ?? []) as WiseSource[]).filter(inside),
    };
  } catch {
    return { gaia: [], catwise: [] };
  }
}

export interface FrameCubes {
  frames: Int16Array;
  masks: Uint8Array | null;
}

/** Every single exposure of the field (int16, see core/spectrum.ts) and its flag masks. */
export async function loadFrames(base: string, fieldId: string, folder: 'data-sample' | 'data-new' = 'data-sample'): Promise<FrameCubes> {
  const root = `${base}${folder}/${fieldId}/`;
  const res = await fetch(`${root}frames.bin`);
  if (!res.ok || (res.headers.get('content-type') ?? '').includes('html')) throw new Error(`HTTP ${res.status} for frames.bin`);
  const frames = new Int16Array(await res.arrayBuffer());
  let masks: Uint8Array | null = null;
  try {
    const mr = await fetch(`${root}masks.bin`);
    if (mr.ok && !(mr.headers.get('content-type') ?? '').includes('html')) {
      const m = new Uint8Array(await mr.arrayBuffer());
      if (m.length === frames.length) masks = m;
    }
  } catch {
    masks = null;
  }
  return { frames, masks };
}

/** Inverse-variance weighted mean of every season for one detector. */
export function stackDetector(m: FullManifest, cubes: Cubes, det: number): Float32Array {
  const out = new Float32Array(N * N);
  const wsum = new Float32Array(N * N);
  for (const c of m.coadds) {
    if (c.det !== det) continue;
    const off = c.i * N * N;
    for (let p = 0; p < N * N; p++) {
      const v = cubes.coadds[off + p];
      const s = cubes.coaddsSig[off + p];
      if (!Number.isFinite(v) || !Number.isFinite(s) || s <= 0) continue;
      const w = 1 / (s * s);
      out[p] += v * w;
      wsum[p] += w;
    }
  }
  for (let p = 0; p < N * N; p++) out[p] = wsum[p] > 0 ? out[p] / wsum[p] : Number.NaN;
  return out;
}

/** Grayscale asinh stretch between the manifest's lo/hi for that detector. */
export function paintGray(ctx: CanvasRenderingContext2D, data: Float32Array, lo: number, hi: number) {
  const img = ctx.createImageData(N, N);
  const soft = (hi - lo) * 0.04;
  const norm = Math.asinh((hi - lo) / soft);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      // Row 0 of the cube is the southern edge: flip so north is up.
      const v = data[(N - 1 - y) * N + x];
      const o = (y * N + x) * 4;
      if (!Number.isFinite(v)) {
        img.data[o] = img.data[o + 1] = img.data[o + 2] = 0;
      } else {
        const t = Math.max(0, Math.min(1, Math.asinh(Math.max(0, v - lo) / soft) / norm));
        const g = Math.round(t * 255);
        img.data[o] = img.data[o + 1] = img.data[o + 2] = g;
      }
      img.data[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

// Diverging map anchored on the logo's colours: blue (before) to night to amber (now).
const BEFORE = [98, 182, 232];
const NIGHT = [14, 17, 22];
const NOW = [255, 178, 56];
export const DIFF_CLIP = 8; // σ at full colour

export function diffColor(t: number): [number, number, number] {
  // t in [-1, 1]
  const a = Math.min(1, Math.abs(t));
  // Steeper than linear so pixel noise (~1σ) stays near night and real
  // changes (≥ 4σ) carry the colour. The legend is drawn from this same map.
  const e = Math.pow(a, 1.5);
  const to = t < 0 ? BEFORE : NOW;
  return [0, 1, 2].map(k => Math.round(NIGHT[k] + (to[k] - NIGHT[k]) * e)) as [number, number, number];
}

export function paintDiff(ctx: CanvasRenderingContext2D, diff: Float32Array, sig: Float32Array, off: number) {
  const img = ctx.createImageData(N, N);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const p = off + (N - 1 - y) * N + x;
      const v = diff[p];
      const s = sig[p];
      const o = (y * N + x) * 4;
      if (!Number.isFinite(v) || !Number.isFinite(s) || s <= 0) {
        img.data[o] = img.data[o + 1] = img.data[o + 2] = 0;
      } else {
        const [r, g, b] = diffColor(Math.max(-1, Math.min(1, v / s / DIFF_CLIP)));
        img.data[o] = r;
        img.data[o + 1] = g;
        img.data[o + 2] = b;
      }
      img.data[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

export function formatDate(iso: string, months: string[]): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return `${d} ${months[m - 1]} ${y}`;
}

export function seasonLabel(start: string, months: string[]): string {
  const [y, m] = start.split('-').map(Number);
  return `${months[m - 1]} ${y}`;
}

/** Sexagesimal formatting, for display only (parsing stays in core/coords). */
export function toHms(raDeg: number): string {
  const h = (((raDeg % 360) + 360) % 360) / 15;
  const hh = Math.floor(h);
  const mm = Math.floor((h - hh) * 60);
  const ss = ((h - hh) * 60 - mm) * 60;
  return `${String(hh).padStart(2, '0')}h${String(mm).padStart(2, '0')}m${ss.toFixed(1).padStart(4, '0')}s`;
}

export function toDms(decDeg: number): string {
  const sign = decDeg < 0 ? '−' : '+';
  const a = Math.abs(decDeg);
  const dd = Math.floor(a);
  const mm = Math.floor((a - dd) * 60);
  const ss = ((a - dd) * 60 - mm) * 60;
  return `${sign}${String(dd).padStart(2, '0')}°${String(mm).padStart(2, '0')}′${ss.toFixed(0).padStart(2, '0')}″`;
}

export function angularDistanceDeg(ra1: number, dec1: number, ra2: number, dec2: number): number {
  const r = Math.PI / 180;
  const c =
    Math.sin(dec1 * r) * Math.sin(dec2 * r) + Math.cos(dec1 * r) * Math.cos(dec2 * r) * Math.cos((ra1 - ra2) * r);
  return Math.acos(Math.max(-1, Math.min(1, c))) / r;
}
