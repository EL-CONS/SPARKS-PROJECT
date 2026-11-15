import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  validateIndexJson,
  validateManifestJson,
  validateResultsJson,
} from '../src/data/contract';

const DATA_ROOT = path.resolve(__dirname, '../../data-sample');
const DATA_NEW_ROOT = path.resolve(__dirname, '../../data-new');

describe('data contract validators', () => {
  it('validates real data-sample/index.json', () => {
    const raw = JSON.parse(fs.readFileSync(path.join(DATA_ROOT, 'index.json'), 'utf-8'));
    const res = validateIndexJson(raw);
    expect(res.ok).toBe(true);
  });

  it('validates real data-sample/barnard/manifest.json', () => {
    const raw = JSON.parse(fs.readFileSync(path.join(DATA_ROOT, 'barnard/manifest.json'), 'utf-8'));
    const res = validateManifestJson(raw);
    expect(res.ok).toBe(true);
  });

  it('validates real data-sample/results.json', () => {
    const raw = JSON.parse(fs.readFileSync(path.join(DATA_ROOT, 'results.json'), 'utf-8'));
    const res = validateResultsJson(raw);
    expect(res.ok).toBe(true);
  });

  it('validates real data-new/index.json and results.json', () => {
    const rawIndex = JSON.parse(fs.readFileSync(path.join(DATA_NEW_ROOT, 'index.json'), 'utf-8'));
    const resIndex = validateIndexJson(rawIndex);
    expect(resIndex.ok).toBe(true);

    const rawResults = JSON.parse(fs.readFileSync(path.join(DATA_NEW_ROOT, 'results.json'), 'utf-8'));
    const resResults = validateResultsJson(rawResults);
    expect(resResults.ok).toBe(true);
  });

  it('validates all manifests in data-new/', () => {
    for (const id of ['wise0855', 'epsindib', 'rdra', 'rwaur']) {
      const manifestPath = path.join(DATA_NEW_ROOT, id, 'manifest.json');
      const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      const res = validateManifestJson(raw);
      expect(res.ok).toBe(true);
    }
  });

  it('reports clear path issues on malformed index, manifest, and results', () => {
    const badIndex = validateIndexJson({ fields: [{ id: '', ra: 999, dec: -120 }] });
    expect(badIndex.ok).toBe(false);
    if (!badIndex.ok) {
      expect(badIndex.issues.some(i => i.path === 'fields[0].ra')).toBe(true);
      expect(badIndex.issues.some(i => i.path === 'fields[0].dec')).toBe(true);
    }

    const badManifest = validateManifestJson({ schema: 99, detectors: [7], coadds: [] });
    expect(badManifest.ok).toBe(false);
    if (!badManifest.ok) {
      expect(badManifest.issues.some(i => i.path === 'schema')).toBe(true);
      expect(badManifest.issues.some(i => i.path === 'detectors')).toBe(true);
    }

    const badResults = validateResultsJson({ generated_utc: '', archive: {}, fields: {} });
    expect(badResults.ok).toBe(false);
    if (!badResults.ok) {
      expect(badResults.issues.some(i => i.path === 'generated_utc')).toBe(true);
      expect(badResults.issues.some(i => i.path === 'fields')).toBe(true);
    }
  });
});
