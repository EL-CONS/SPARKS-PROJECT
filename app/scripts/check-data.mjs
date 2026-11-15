#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const targetDir = path.resolve(process.cwd(), process.argv[2] || '../data-sample');
let errors = 0;

function fail(file, msg) {
  console.error(`FAIL [${file}]: ${msg}`);
  errors += 1;
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    fail(filePath, 'File not found');
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    fail(filePath, `Invalid JSON: ${err.message}`);
    return null;
  }
}

console.log(`Checking data directory: ${targetDir}`);

const indexPath = path.join(targetDir, 'index.json');
const indexData = readJson(indexPath);
if (indexData) {
  if (!Array.isArray(indexData.fields) || indexData.fields.length === 0) {
    fail(indexPath, 'fields must be a non-empty array');
  } else {
    for (const [i, f] of indexData.fields.entries()) {
      for (const k of ['id', 'name', 'kind', 'note']) {
        if (typeof f[k] !== 'string' || !f[k]) fail(indexPath, `fields[${i}].${k} missing or empty`);
      }
      if (typeof f.ra !== 'number' || f.ra < 0 || f.ra > 360) fail(indexPath, `fields[${i}].ra out of [0,360]`);
      if (typeof f.dec !== 'number' || f.dec < -90 || f.dec > 90) fail(indexPath, `fields[${i}].dec out of [-90,90]`);
      if (typeof f.in_gaia !== 'boolean') fail(indexPath, `fields[${i}].in_gaia must be boolean`);
      if (!Array.isArray(f.releases) || f.releases.length === 0) fail(indexPath, `fields[${i}].releases must be non-empty array`);

      const fieldDir = path.join(targetDir, String(f.id || ''));
      const manifestPath = path.join(fieldDir, 'manifest.json');
      if (fs.existsSync(fieldDir)) {
        const m = readJson(manifestPath);
        if (m) {
          if (m.schema !== 1) fail(manifestPath, `schema must be 1 (got ${m.schema})`);
          if (!Array.isArray(m.coadds) || m.coadds.length === 0) {
            fail(manifestPath, 'coadds must be non-empty array');
          } else {
            for (const c of m.coadds) {
              const pngAbs = path.join(fieldDir, c.png || '');
              if (!fs.existsSync(pngAbs)) fail(manifestPath, `Missing PNG referenced in coadds: ${c.png}`);
            }
          }
        }
      }
    }
    console.log(`OK index.json (${indexData.fields.length} fields)`);
  }
}

const resultsPath = path.join(targetDir, 'results.json');
if (fs.existsSync(resultsPath)) {
  const resultsData = readJson(resultsPath);
  if (resultsData) {
    if (typeof resultsData.generated_utc !== 'string' || !resultsData.generated_utc) {
      fail(resultsPath, 'generated_utc missing');
    }
    if (!resultsData.archive || typeof resultsData.archive.n_science_images !== 'number') {
      fail(resultsPath, 'archive.n_science_images missing');
    }
    if (!resultsData.fields || Object.keys(resultsData.fields).length === 0) {
      fail(resultsPath, 'fields record empty');
    }
    console.log(`OK results.json (${Object.keys(resultsData.fields || {}).length} fields)`);
  }
} else {
  console.log('INFO results.json not present (optional)');
}

if (errors > 0) {
  console.error(`\ncheck-data failed with ${errors} error(s).`);
  process.exit(1);
}
console.log('\ncheck-data passed with 0 errors.');
