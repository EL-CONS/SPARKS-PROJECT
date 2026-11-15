import { describe, expect, it } from 'vitest';
import { fovOptions, fovParam, panelToPixel, zoomForFov } from '../src/core/fov';
import { apertureSpectrum, pixelSolidAngleSr, summarizeSpectrum, type SpectrumFrame } from '../src/core/spectrum';

describe('field of view', () => {
  it('offers the full cutout, a half and a quarter', () => {
    expect(fovOptions(6.56).map(o => Number(o.arcmin.toFixed(2)))).toEqual([6.56, 3.28, 1.64]);
  });

  it('snaps the URL value to the nearest option', () => {
    expect(zoomForFov(6.6, 6.56)).toBe(1);
    expect(zoomForFov(60, 6.56)).toBe(1);
    expect(zoomForFov(3.28, 6.56)).toBe(2);
    expect(zoomForFov(2, 6.56)).toBe(4);
    expect(zoomForFov(0.5, 6.56)).toBe(4);
    expect(zoomForFov(Number.NaN, 6.56)).toBe(1);
  });

  it('round-trips through the URL parameter', () => {
    for (const z of [1, 2, 4] as const) expect(zoomForFov(fovParam(6.56, z), 6.56)).toBe(z);
  });

  it('maps a click to cube pixels with north up', () => {
    // centre of the panel is the centre of the cube at any zoom
    expect(panelToPixel(0.5, 0.5, 1, 64)).toEqual({ x: 31.5, y: 31.5 });
    expect(panelToPixel(0.5, 0.5, 4, 64)).toEqual({ x: 31.5, y: 31.5 });
    // top-left corner is the northern edge (highest row), first column
    const tl = panelToPixel(0, 0, 1, 64);
    expect(tl.x).toBe(0);
    expect(tl.y).toBe(63);
    // at 2x the top-left corner is a quarter of the way in
    const z = panelToPixel(0, 0, 2, 64);
    expect(z.x).toBeCloseTo(15.5);
    expect(z.y).toBeCloseTo(47.5);
  });
});

describe('spectrum on the fly', () => {
  const N = 32;
  const meta: SpectrumFrame[] = [
    { i: 0, det: 1, season: 0, lam: 1.0, sigma: 0.1 },
    { i: 1, det: 2, season: 0, lam: 2.0, sigma: 0.2 },
    { i: 2, det: 3, season: 0, lam: 3.0, sigma: 0.1 },
    { i: 3, det: 4, season: 0, lam: 4.0, sigma: 0.1 },
  ];
  const frames = new Int16Array(4 * N * N);
  const masks = new Uint8Array(4 * N * N);
  // frame 0: flat background 500 plus a 3x3 source of +2000 per pixel at (16, 16)
  // frame 1: background only
  // frame 2: same source, but one aperture pixel is saturated
  // frame 3: same source, but one aperture pixel is flagged
  for (let f = 0; f < 4; f++) {
    for (let p = 0; p < N * N; p++) frames[f * N * N + p] = 500;
    if (f !== 1) {
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) frames[f * N * N + (16 + dy) * N + 16 + dx] = 2500;
    }
  }
  frames[2 * N * N + 16 * N + 16] = 32256;
  masks[3 * N * N + 16 * N + 17] = 1;

  const mjyPerUnit = pixelSolidAngleSr(6.15) * 1e9;
  const s = apertureSpectrum(frames, masks, meta, N, 16, 16, 6.15);

  it('converts one pixel of 1 MJy/sr to about 0.889 mJy', () => {
    expect(mjyPerUnit).toBeCloseTo(0.889, 3);
  });

  it('subtracts the local background and scales by the exposure noise', () => {
    // 9 px * 2000 codes * (0.1 / 1000) MJy/sr = 1.8 MJy/sr px
    expect(s[0].reason).toBe('ok');
    expect(s[0].flux).toBeCloseTo(1.8 * mjyPerUnit, 6);
    expect(s[1].flux).toBeCloseTo(0, 6);
  });

  it('refuses saturated and flagged apertures instead of inventing a value', () => {
    expect(s[2]).toMatchObject({ flux: null, reason: 'saturated' });
    expect(s[3]).toMatchObject({ flux: null, reason: 'flagged' });
  });

  it('refuses positions too close to the edge', () => {
    const edge = apertureSpectrum(frames, masks, meta, N, 0, 0, 6.15);
    expect(edge.every(p => p.reason === 'edge')).toBe(true);
  });

  it('summarises counts and per-detector medians', () => {
    const sum = summarizeSpectrum(s);
    expect(sum).toMatchObject({ total: 4, ok: 2, saturated: 1, flagged: 1, edge: 0 });
    expect(sum.byDetector.map(d => d.det)).toEqual([1, 2]);
  });
});
