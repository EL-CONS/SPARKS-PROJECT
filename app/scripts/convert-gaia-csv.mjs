#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(process.cwd(), '..');
const csvPath = path.join(repoRoot, 'docs', 'sprint-13-30', 'gaia-fotometria.csv');
const outJsonPath = path.resolve(process.cwd(), 'src', 'data', 'gaiaPhotometry.json');

if (!fs.existsSync(csvPath)) {
  console.error(`Error: No se encontró el archivo ${csvPath}`);
  process.exit(1);
}

const raw = fs.readFileSync(csvPath, 'utf-8');
const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
if (lines.length === 0) process.exit(1);

const headers = lines[0].split(',');
const records = {};

for (let i = 1; i < lines.length; i++) {
  // Manejar comas dentro de comillas si las hay
  const row = lines[i];
  // Simple regex parser para campos CSV
  const match = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || row.split(',');
  
  // Usar split cuidadoso
  const cols = [];
  let current = '';
  let inQuotes = false;
  for (let c = 0; c < row.length; c++) {
    const ch = row[c];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      cols.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  cols.push(current);

  const id_campo = cols[0]?.trim();
  if (!id_campo) continue;

  const parseNum = (val) => {
    if (!val) return null;
    const clean = val.trim();
    if (!clean || clean.toLowerCase().startsWith('sin')) return null;
    const n = parseFloat(clean);
    return isNaN(n) ? null : n;
  };

  records[id_campo] = {
    id_campo,
    nombre: cols[1]?.trim() || '',
    gaia_source_id: cols[2]?.trim() || '',
    ra_deg: parseNum(cols[3]),
    dec_deg: parseNum(cols[4]),
    phot_g_mean_mag: parseNum(cols[5]),
    bp_rp: parseNum(cols[6]),
    parallax_mas: parseNum(cols[7]),
    pmra_mas_yr: parseNum(cols[8]),
    pmdec_mas_yr: parseNum(cols[9]),
    ruwe: parseNum(cols[10]),
    mg_gaia: parseNum(cols[11]),
    nota: cols[12]?.trim() || ''
  };
}

fs.writeFileSync(outJsonPath, JSON.stringify(records, null, 2), 'utf-8');
console.log(`Convertido gaia-fotometria.csv a ${outJsonPath} (${Object.keys(records).length} registros)`);
