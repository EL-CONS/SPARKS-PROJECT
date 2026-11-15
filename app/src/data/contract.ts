export const EXPECTED_MANIFEST_SCHEMA = 1;

export interface ValidationIssue {
  path: string;
  message: string;
}

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; issues: ValidationIssue[] };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isFiniteNum(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function isString(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0;
}

export function validateIndexJson(raw: unknown): ValidationResult<{ fields: Record<string, unknown>[] }> {
  const issues: ValidationIssue[] = [];
  if (!isRecord(raw) || !Array.isArray(raw.fields)) {
    return { ok: false, issues: [{ path: 'fields', message: 'Expected object with array property "fields"' }] };
  }
  if (raw.fields.length === 0) {
    issues.push({ path: 'fields', message: 'Expected at least 1 field entry' });
  }
  raw.fields.forEach((f, idx) => {
    const p = `fields[${idx}]`;
    if (!isRecord(f)) {
      issues.push({ path: p, message: 'Expected object' });
      return;
    }
    if (!isString(f.id)) issues.push({ path: `${p}.id`, message: 'Required non-empty string' });
    if (!isString(f.name)) issues.push({ path: `${p}.name`, message: 'Required non-empty string' });
    if (!isFiniteNum(f.ra) || f.ra < 0 || f.ra > 360) {
      issues.push({ path: `${p}.ra`, message: 'Required number in [0, 360]' });
    }
    if (!isFiniteNum(f.dec) || f.dec < -90 || f.dec > 90) {
      issues.push({ path: `${p}.dec`, message: 'Required number in [-90, 90]' });
    }
    if (!isString(f.kind)) issues.push({ path: `${p}.kind`, message: 'Required non-empty string' });
    if (!isString(f.note)) issues.push({ path: `${p}.note`, message: 'Required non-empty string' });
    if (!isFiniteNum(f.n_frames) || f.n_frames < 0) {
      issues.push({ path: `${p}.n_frames`, message: 'Required non-negative number' });
    }
    if (!isFiniteNum(f.seasons) || f.seasons < 1) {
      issues.push({ path: `${p}.seasons`, message: 'Required number >= 1' });
    }
    if (!Array.isArray(f.releases) || !f.releases.every(isString)) {
      issues.push({ path: `${p}.releases`, message: 'Required array of non-empty strings' });
    }
    if (typeof f.in_gaia !== 'boolean') {
      issues.push({ path: `${p}.in_gaia`, message: 'Required boolean' });
    }
    for (const optNum of ['mu_measured', 'mu_err', 'pa', 'mu_expected', 'pa_expected']) {
      const val = f[optNum];
      if (val !== undefined && val !== null && !isFiniteNum(val)) {
        issues.push({ path: `${p}.${optNum}`, message: 'Optional field must be finite number or null' });
      }
    }
  });
  return issues.length === 0 ? { ok: true, data: raw as { fields: Record<string, unknown>[] } } : { ok: false, issues };
}

export function validateManifestJson(raw: unknown): ValidationResult<Record<string, unknown>> {
  const issues: ValidationIssue[] = [];
  if (!isRecord(raw)) {
    return { ok: false, issues: [{ path: '$', message: 'Expected JSON object' }] };
  }
  if (raw.schema !== EXPECTED_MANIFEST_SCHEMA) {
    issues.push({ path: 'schema', message: `Expected schema === ${EXPECTED_MANIFEST_SCHEMA}` });
  }
  if (!isString(raw.pipeline_version)) {
    issues.push({ path: 'pipeline_version', message: 'Required non-empty string' });
  }
  if (!isRecord(raw.field) || !isString(raw.field.id) || !isFiniteNum(raw.field.n)) {
    issues.push({ path: 'field', message: 'Required object with field.id (string) and field.n (number)' });
  }
  if (!Array.isArray(raw.seasons) || raw.seasons.length === 0) {
    issues.push({ path: 'seasons', message: 'Required non-empty array' });
  }
  if (!Array.isArray(raw.detectors) || !raw.detectors.every(d => Number.isInteger(d) && (d as number) >= 1 && (d as number) <= 6)) {
    issues.push({ path: 'detectors', message: 'Required array of detector IDs (1..6)' });
  }
  if (!Array.isArray(raw.coadds) || raw.coadds.length === 0) {
    issues.push({ path: 'coadds', message: 'Required non-empty array' });
  } else {
    raw.coadds.forEach((c, idx) => {
      const p = `coadds[${idx}]`;
      if (!isRecord(c)) {
        issues.push({ path: p, message: 'Expected object' });
        return;
      }
      if (!Number.isInteger(c.det) || !Number.isInteger(c.season)) {
        issues.push({ path: p, message: 'Required integer det and season' });
      }
      if (!isString(c.png)) {
        issues.push({ path: `${p}.png`, message: 'Required non-empty PNG path string' });
      }
    });
  }
  return issues.length === 0 ? { ok: true, data: raw } : { ok: false, issues };
}

export function validateResultsJson(raw: unknown): ValidationResult<Record<string, unknown>> {
  const issues: ValidationIssue[] = [];
  if (!isRecord(raw)) {
    return { ok: false, issues: [{ path: '$', message: 'Expected JSON object' }] };
  }
  if (!isString(raw.generated_utc)) {
    issues.push({ path: 'generated_utc', message: 'Required non-empty string' });
  }
  if (!isRecord(raw.archive) || !isFiniteNum(raw.archive.n_science_images) || !isRecord(raw.archive.by_collection)) {
    issues.push({ path: 'archive', message: 'Required object with n_science_images (number) and by_collection (object)' });
  }
  if (!isRecord(raw.fields) || Object.keys(raw.fields).length === 0) {
    issues.push({ path: 'fields', message: 'Required non-empty fields record' });
  } else {
    for (const [key, val] of Object.entries(raw.fields)) {
      const p = `fields.${key}`;
      if (!isRecord(val)) {
        issues.push({ path: p, message: 'Expected object' });
        continue;
      }
      if (!isString(val.name)) issues.push({ path: `${p}.name`, message: 'Required non-empty string' });
      if (!isString(val.kind)) issues.push({ path: `${p}.kind`, message: 'Required non-empty string' });
      if (typeof val.in_gaia !== 'boolean') issues.push({ path: `${p}.in_gaia`, message: 'Required boolean' });
    }
  }
  return issues.length === 0 ? { ok: true, data: raw } : { ok: false, issues };
}
