import { describe, it, expect } from 'vitest';
import { computeVeredicto } from '../src/ui/kit/useVeredicto';
import type { IndexField } from '../src/data/loader';

describe('Hook y Evaluador useVeredicto', () => {
  const makeField = (id: string, name: string, kind = 'mover', in_gaia = true): IndexField => ({
    id,
    name,
    ra: 100,
    dec: 10,
    kind,
    note: '',
    n_frames: 100,
    seasons: 3,
    releases: ['QR2'],
    mu_measured: 5.0,
    mu_err: 0.2,
    pa: 180,
    mu_expected: 5.0,
    in_gaia,
  });

  it('clasifica Barnard como estrella y reporta datos faltantes', () => {
    const resEs = computeVeredicto(makeField('barnard', "Barnard's Star", 'mover', true), 'es');
    expect(resEs).not.toBeNull();
    expect(resEs!.claseKey).toBe('estrella');
    expect(resEs!.clase).toBe('Estrella cercana');
    expect(resEs!.razon).toContain('secuencia principal');
    expect(resEs!.faltan).toContain('Falta cociente infrarrojo D6/D2 (luz larga vs luz corta)');

    const resEn = computeVeredicto(makeField('barnard', "Barnard's Star", 'mover', true), 'en');
    expect(resEn!.clase).toBe('Nearby star');
    expect(resEn!.razon).toContain('main-sequence');
  });

  it('clasifica WISE 0855 como enana marrón sin contraparte en Gaia', () => {
    const res = computeVeredicto(makeField('wise0855', 'WISE 0855', 'mover', false), 'es');
    expect(res).not.toBeNull();
    expect(res!.claseKey).toBe('enana_marron');
    expect(res!.clase).toBe('Enana marrón');
    expect(res!.razon).toContain('metano');
    expect(res!.faltan).toContain('Sin contraparte óptica en catálogo Gaia DR3');
  });

  it('clasifica RW Aurigae como variable', () => {
    const res = computeVeredicto(makeField('rwaur', 'RW Aurigae', 'variable', true), 'es');
    expect(res).not.toBeNull();
    expect(res!.claseKey).toBe('variable');
    expect(res!.clase).toBe('Estrella variable');
    expect(res!.razon).toContain('cambia de brillo');
  });

  it('clasifica Van Maanen como enana blanca en inglés y español', () => {
    const resEs = computeVeredicto(makeField('vanmaanen', 'Van Maanen 2', 'mover', true), 'es');
    expect(resEs!.claseKey).toBe('enana_blanca');
    expect(resEs!.clase).toBe('Enana blanca');
    expect(resEs!.razon).toContain('M_G=14.12');

    const resEn = computeVeredicto(makeField('vanmaanen', 'Van Maanen 2', 'mover', true), 'en');
    expect(resEn!.clase).toBe('White dwarf');
    expect(resEn!.razon).toContain('white dwarf');
  });
});
