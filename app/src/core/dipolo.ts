// Balance de dipolo en las imágenes de diferencia: separa "se movió" (dos
// lóbulos, positivo y negativo, de flujo parecido) de "cambió de brillo" (un solo
// signo). Es la métrica dipole_balance de Horacio (pipeline/dipole_features.py,
// rama Horacio f7878e4; docs/ml/revision-ciencia-clasificador.md, sección 5),
// portada sin cambios: apertura r <= 10 px en (31.5, 31.5), fondo = mediana del
// anillo 10..22 px, |D/sigma| >= 4 en algún píxel, lóbulos con |D/sigma| > 2.
//
// INDICIO, NO REGLA VALIDADA. Horacio lo midió en solo cinco campos: los tres que se
// mueven tienen mediana >= 0.746 y las dos variables <= 0.134. Con cinco ejemplos no
// se entrena nada ni se valida un umbral; UMBRAL_INDICIO es el punto medio de esa
// brecha y se presenta en la interfaz como indicio.

export const UMBRAL_INDICIO = 0.44; // indicio de 5 campos: (0.134 + 0.746) / 2 ≈ 0.44

const N = 64;
const RADIO = 10;
const FONDO_IN = 10;
const FONDO_OUT = 22;
const SNR_LOBULO = 2;
const SNR_MIN = 4;

function mediana(v: number[]): number {
  const s = [...v].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** dipole_balance de una diferencia (null si no hay señal a 4 sigma o faltan píxeles). */
export function balanceDipolo(diff: Float32Array, sig: Float32Array, offset: number): number | null {
  const anillo: number[] = [];
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const r2 = (x - 31.5) ** 2 + (y - 31.5) ** 2;
      const v = diff[offset + y * N + x];
      if (r2 >= FONDO_IN ** 2 && r2 <= FONDO_OUT ** 2 && Number.isFinite(v)) anillo.push(v);
    }
  const fondo = anillo.length >= 20 ? mediana(anillo) : 0;
  let n = 0;
  let maxPos = 0;
  let maxNeg = 0;
  let fPos = 0;
  let fNeg = 0;
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      if ((x - 31.5) ** 2 + (y - 31.5) ** 2 > RADIO ** 2) continue;
      const v = diff[offset + y * N + x] - fondo;
      const s = sig[offset + y * N + x];
      if (!Number.isFinite(v) || !Number.isFinite(s) || !(s > 0)) continue;
      n++;
      const snr = v / s;
      if (snr > maxPos) maxPos = snr;
      if (-snr > maxNeg) maxNeg = -snr;
      if (snr > SNR_LOBULO) fPos += v;
      if (snr < -SNR_LOBULO) fNeg += -v;
    }
  if (n < 8 || Math.max(maxPos, maxNeg) < SNR_MIN) return null;
  const tot = fPos + fNeg;
  return tot > 0 ? (2 * Math.min(fPos, fNeg)) / tot : 0;
}

/** Mediana de dipole_balance sobre todas las diferencias del campo con señal. */
export function balanceDipoloCampo(diffs: Float32Array, sigs: Float32Array, nDiffs: number): { mediana: number; n: number } | null {
  const vals: number[] = [];
  for (let k = 0; k < nDiffs; k++) {
    const b = balanceDipolo(diffs, sigs, k * N * N);
    if (b !== null) vals.push(b);
  }
  return vals.length ? { mediana: mediana(vals), n: vals.length } : null;
}
