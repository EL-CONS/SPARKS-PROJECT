import { describe, it, expect, vi, afterEach } from 'vitest';
import { loadFieldAssets, buildPlatesFromManifest, IndexField, FieldManifest } from '../src/data/loader';

const SAMPLE_FIELD: IndexField = {
  id: 'wise0855',
  name: 'WISE 0855-0714',
  ra: 133.795129,
  dec: -7.245147,
  kind: 'mover',
  note: 'Brown dwarf',
  n_frames: 255,
  seasons: 3,
  releases: ['QR2'],
  mu_measured: 7.91,
  mu_err: 1.35,
  pa: 275.5,
  mu_expected: 8.09,
  in_gaia: false,
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('data loader', () => {
  it('returns typed "soon" status when manifest returns 404', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 404, ok: false }));
    const res = await loadFieldAssets(SAMPLE_FIELD, '/');
    expect(res).toEqual({ status: 'soon', field: SAMPLE_FIELD });
  });

  it('builds plate asset URLs from manifest coadds', () => {
    const manifest: FieldManifest = {
      schema: 1,
      pipeline_version: '0.3.0',
      field: { id: 'barnard', name: "Barnard's Star", ra: 269.4486, dec: 4.7672, n: 64, pixel_arcsec: 6.15, fov_arcmin: 6.56 },
      seasons: [],
      detectors: [1],
      coadds: [
        { i: 0, det: 1, season: 0, n_frames: 24, lam_mean: 0.91, lam_min: 0.75, lam_max: 1.1, sigma_single: 0.02, sigma_coadd: 0.004, snr_gain: 4.8, png: 'png/coadd_D1_S0.png' },
      ],
    };
    const plates = buildPlatesFromManifest('barnard', manifest, '/');
    expect(plates).toEqual([
      { det: 1, season: 0, pngUrl: '/data-sample/barnard/png/coadd_D1_S0.png', lamMean: 0.91, snrGain: 4.8 },
    ]);

    const platesNew = buildPlatesFromManifest('wise0855', manifest, '/', 'data-new');
    expect(platesNew).toEqual([
      { det: 1, season: 0, pngUrl: '/data-new/wise0855/png/coadd_D1_S0.png', lamMean: 0.91, snrGain: 4.8 },
    ]);
  });

  it('fetchFieldIndex loads both data-sample and data-new, prioritizing data-new and tagging folder', async () => {
    const mockSampleIndex = {
      fields: [
        { id: 'barnard', name: "Barnard's Star", ra: 269.4, dec: 4.7, kind: 'mover', note: 'M4V', n_frames: 355, seasons: 3, releases: ['QR2'], in_gaia: true, mu_measured: 10.2, mu_err: 0.4, pa: 355 },
        { id: 'wise0855', name: 'WISE 0855 Old', ra: 133.7, dec: -7.2, kind: 'mover', note: 'Old', n_frames: 200, seasons: 2, releases: ['QR2'], in_gaia: false, mu_measured: 7.9, mu_err: 1.3, pa: 275 },
        { id: 'teegarden', name: "Teegarden", ra: 43.2, dec: 16.8, kind: 'mover', note: 'M7', n_frames: 300, seasons: 3, releases: ['QR2'], in_gaia: true, mu_measured: 5.0, mu_err: 0.2, pa: 137 },
      ]
    };
    const mockNewIndex = {
      fields: [
        { id: 'wise0855', name: 'WISE 0855-0714', ra: 133.76, dec: -7.24, kind: 'mover', note: 'New', n_frames: 153, seasons: 3, releases: ['DR1'], in_gaia: false, mu_measured: 6.04, mu_err: 0.76, pa: 289.1, status: 'ok', reason: '' },
        { id: 'epsindib', name: 'epsilon Indi B', ra: 331.09, dec: -56.8, kind: 'mover', note: 'T1+T6', n_frames: 116, seasons: 4, releases: ['DR1'], in_gaia: false, mu_measured: 4.21, mu_err: 0.28, pa: 124.9, status: 'ok', reason: '' },
        { id: 'rwaur', name: 'RW Aurigae', ra: 76.95, dec: 30.4, kind: 'variable', note: 'T Tauri', n_frames: 101, seasons: 3, releases: ['DR1'], in_gaia: true, mu_measured: 1.32, mu_err: 0.57, pa: 81.5, status: 'parcial', reason: 'cota superior' },
        { id: 'rdra', name: 'R Draconis', ra: 248.16, dec: 66.75, kind: 'variable', note: 'Mira', n_frames: 62, seasons: 2, releases: ['DR1'], in_gaia: true, mu_measured: null, mu_err: null, pa: null, status: 'parcial', reason: 'detecciones 0' },
      ]
    };

    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('data-sample/index.json')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockSampleIndex) });
      }
      if (url.includes('data-new/index.json')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockNewIndex) });
      }
      return Promise.resolve({ ok: false, status: 404 });
    }));

    const { fetchFieldIndex } = await import('../src/data/loader');
    const fields = await fetchFieldIndex('/');

    // Check that the 5 main fields appear first in correct order
    expect(fields.slice(0, 5).map(f => f.id)).toEqual(['barnard', 'wise0855', 'epsindib', 'rwaur', 'rdra']);

    // Check folder attribution
    expect(fields.find(f => f.id === 'barnard')?.folder).toBe('data-sample');
    expect(fields.find(f => f.id === 'wise0855')?.folder).toBe('data-new');
    expect(fields.find(f => f.id === 'wise0855')?.mu_measured).toBeCloseTo(6.04, 2);
    expect(fields.find(f => f.id === 'epsindib')?.folder).toBe('data-new');
    expect(fields.find(f => f.id === 'rwaur')?.status).toBe('parcial');
    expect(fields.find(f => f.id === 'rdra')?.status).toBe('parcial');
    expect(fields.find(f => f.id === 'teegarden')?.folder).toBe('data-sample');
  });
});
