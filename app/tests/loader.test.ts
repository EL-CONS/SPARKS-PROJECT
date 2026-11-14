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
  });
});
