import { validateIndexJson, validateManifestJson } from './contract';

export interface IndexField {
  id: string;
  name: string;
  ra: number;
  dec: number;
  kind: string;
  note: string;
  n_frames: number;
  seasons: number;
  releases: string[];
  mu_measured: number | null;
  mu_err: number | null;
  pa: number | null;
  mu_expected: number | null;
  pa_expected?: number | null;
  in_gaia: boolean;
  thumb?: string;
}

export interface IndexData {
  fields: IndexField[];
}

export interface CoaddEntry {
  i: number;
  det: number;
  season: number;
  n_frames: number;
  lam_mean: number;
  lam_min: number;
  lam_max: number;
  sigma_single: number;
  sigma_coadd: number;
  snr_gain: number;
  png: string;
}

export interface SeasonMeta {
  id: number;
  start: string;
  end: string;
  n_frames: number;
  releases: string[];
}

export interface FieldManifest {
  schema: number;
  pipeline_version: string;
  field: {
    id: string;
    name: string;
    ra: number;
    dec: number;
    n: number;
    pixel_arcsec: number;
    fov_arcmin: number;
  };
  seasons: SeasonMeta[];
  detectors: number[];
  coadds: CoaddEntry[];
}

export interface PlateAsset {
  det: number;
  season: number;
  pngUrl: string;
  lamMean: number;
  snrGain: number;
}

export type FieldAssetsResult =
  | {
      status: 'ready';
      field: IndexField;
      manifest: FieldManifest;
      plates: PlateAsset[];
    }
  | {
      status: 'soon';
      field: IndexField;
    };

export async function fetchFieldIndex(baseUrl = '/'): Promise<IndexField[]> {
  const res = await fetch(`${baseUrl}data-sample/index.json`);
  if (!res.ok) {
    throw new Error(`Failed to load index.json (HTTP ${res.status})`);
  }
  const raw = await res.json();
  const checked = validateIndexJson(raw);
  if (!checked.ok) {
    const first = checked.issues[0];
    throw new Error(`Invalid index.json at ${first.path}: ${first.message}`);
  }
  return checked.data.fields as unknown as IndexField[];
}

export function buildPlatesFromManifest(
  fieldId: string,
  manifest: FieldManifest,
  baseUrl = '/'
): PlateAsset[] {
  return manifest.coadds.map(c => ({
    det: c.det,
    season: c.season,
    pngUrl: `${baseUrl}data-sample/${fieldId}/${c.png}`,
    lamMean: c.lam_mean,
    snrGain: c.snr_gain,
  }));
}

export async function loadFieldAssets(
  field: IndexField,
  baseUrl = '/'
): Promise<FieldAssetsResult> {
  const res = await fetch(`${baseUrl}data-sample/${field.id}/manifest.json`);
  if (res.status === 404) {
    return { status: 'soon', field };
  }
  if (!res.ok) {
    throw new Error(`Failed to load manifest for ${field.id} (HTTP ${res.status})`);
  }
  const raw = await res.json();
  const checked = validateManifestJson(raw);
  if (!checked.ok) {
    const first = checked.issues[0];
    throw new Error(`Invalid manifest.json for ${field.id} at ${first.path}: ${first.message}`);
  }
  const manifest = checked.data as unknown as FieldManifest;
  return {
    status: 'ready',
    field,
    manifest,
    plates: buildPlatesFromManifest(field.id, manifest, baseUrl),
  };
}
