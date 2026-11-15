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
  gallery?: boolean;
  status?: string;
  reason?: string;
  folder?: 'data-sample' | 'data-new';
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
  status?: string;
  blockers?: string[];
  caveats?: string[];
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
  const [resSample, resNew] = await Promise.allSettled([
    fetch(`${baseUrl}data-sample/index.json`),
    fetch(`${baseUrl}data-new/index.json`),
  ]);

  const sampleFields: IndexField[] = [];
  if (resSample.status === 'fulfilled' && resSample.value.ok) {
    try {
      const raw = await resSample.value.json();
      const checked = validateIndexJson(raw);
      if (checked.ok) {
        for (const f of checked.data.fields as unknown as IndexField[]) {
          sampleFields.push({ ...f, folder: 'data-sample' });
        }
      }
    } catch {
      // Ignore sample parsing failure
    }
  }

  const newFields: IndexField[] = [];
  if (resNew.status === 'fulfilled' && resNew.value.ok) {
    try {
      const raw = await resNew.value.json();
      const checked = validateIndexJson(raw);
      if (checked.ok) {
        for (const f of checked.data.fields as unknown as IndexField[]) {
          newFields.push({ ...f, folder: 'data-new' });
        }
      }
    } catch {
      // Ignore new parsing failure
    }
  }

  if (sampleFields.length === 0 && newFields.length === 0) {
    throw new Error('Failed to load index.json (no accessible data in data-sample or data-new)');
  }

  const map = new Map<string, IndexField>();
  for (const f of sampleFields) {
    map.set(f.id, f);
  }
  for (const f of newFields) {
    map.set(f.id, f);
  }

  const MAIN_5 = ['barnard', 'wise0855', 'epsindib', 'rwaur', 'rdra'];
  const ordered: IndexField[] = [];

  for (const id of MAIN_5) {
    const f = map.get(id);
    if (f) {
      ordered.push(f);
      map.delete(id);
    }
  }

  for (const f of map.values()) {
    ordered.push(f);
  }

  return ordered;
}

export function buildPlatesFromManifest(
  fieldId: string,
  manifest: FieldManifest,
  baseUrl = '/',
  folder: 'data-sample' | 'data-new' = 'data-sample'
): PlateAsset[] {
  return manifest.coadds.map(c => ({
    det: c.det,
    season: c.season,
    pngUrl: `${baseUrl}${folder}/${fieldId}/${c.png}`,
    lamMean: c.lam_mean,
    snrGain: c.snr_gain,
  }));
}

export async function loadFieldAssets(
  field: IndexField,
  baseUrl = '/'
): Promise<FieldAssetsResult> {
  const folder = field.folder || 'data-sample';
  const res = await fetch(`${baseUrl}${folder}/${field.id}/manifest.json`);
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
    plates: buildPlatesFromManifest(field.id, manifest, baseUrl, folder),
  };
}

export type LiveFieldStatus = 'en_cola' | 'procesando' | 'listo' | 'fallo';

export interface LiveFieldResponse {
  status: LiveFieldStatus;
  job_id?: string;
  field_id?: string;
  ra?: number;
  dec?: number;
  posicion_en_cola?: number;
  progreso_porcentaje?: number;
  etapa_actual?: string;
  estimado_segundos?: number;
  estimado_segundos_restantes?: number;
  manifest_url?: string;
  data_base_url?: string;
  error_code?: string;
  mensaje?: string;
}

export async function fetchLiveFieldStatus(
  ra: number,
  dec: number,
  apiBaseUrl = 'http://localhost:3001'
): Promise<LiveFieldResponse> {
  const url = `${apiBaseUrl}/api/campo?ra=${encodeURIComponent(ra)}&dec=${encodeURIComponent(dec)}`;
  const res = await fetch(url);
  const data = (await res.json()) as LiveFieldResponse;
  return data;
}

/**
 * Un objetivo tiene fotos si el índice lo trae desde una carpeta y con estado
 * `ok` o `parcial`. Los índices sin campo `status` (data-sample) cuentan como
 * con fotos solo si traen miniatura (`thumb`), que apunta a su carpeta.
 */
export function tieneFotos(f: IndexField): boolean {
  if (!f.folder) return false;
  if (f.status !== undefined) return f.status === 'ok' || f.status === 'parcial';
  return typeof f.thumb === 'string' && f.thumb.length > 0;
}
