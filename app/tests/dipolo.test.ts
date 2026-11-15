import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { balanceDipoloCampo, UMBRAL_INDICIO } from '../src/core/dipolo';

// Medianas de dipole_balance de Horacio (docs/ml/revision-ciencia-clasificador.md,
// sección 5, tabla; rama Horacio f7878e4). Barnard 0.746 y epsindib 0.790 vienen de la
// tabla; para las demás se comprueba solo el lado de la brecha.
const root = path.resolve(__dirname, '../..');
function campo(rel: string) {
  const dir = path.join(root, rel);
  const m = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf-8'));
  const f32 = (f: string) => {
    const b = fs.readFileSync(path.join(dir, f));
    return new Float32Array(b.buffer, b.byteOffset, b.byteLength / 4);
  };
  return balanceDipoloCampo(f32('diffs.bin'), f32('diffs_sig.bin'), m.diffs.length);
}

describe('balance de dipolo (indicio de Horacio, 5 campos)', () => {
  it('reproduce las medianas publicadas de Barnard y ε Indi B', () => {
    expect(campo('data-sample/barnard')!.mediana).toBeCloseTo(0.746, 3);
    expect(campo('data-new/epsindib')!.mediana).toBeCloseTo(0.79, 2);
  });
  it('los que se mueven quedan arriba del umbral de indicio y las variables abajo', () => {
    for (const rel of ['data-sample/barnard', 'data-new/epsindib', 'data-new/wise0855']) expect(campo(rel)!.mediana).toBeGreaterThan(UMBRAL_INDICIO);
    for (const rel of ['data-new/rwaur', 'data-new/rdra']) expect(campo(rel)!.mediana).toBeLessThan(UMBRAL_INDICIO);
  });
});
