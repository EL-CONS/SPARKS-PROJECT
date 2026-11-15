import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  MODELO_ML,
  predecir,
  featuresDeCampo,
  useClase,
  ModeloBosque,
} from '../src/core/clasificador';
import type { IndexField } from '../src/data/loader';

const PARIDAD_PATH = path.resolve(__dirname, '../../ml-clasificador/paridad_v2.json');

describe('ML Random Forest Classifier v2', () => {
  it('achieves exact parity with scikit-learn across all 69 test objects in paridad_v2.json', () => {
    const raw = JSON.parse(fs.readFileSync(PARIDAD_PATH, 'utf-8'));
    const { clases, ejemplos } = raw as {
      clases: string[];
      ejemplos: Array<{
        nombre: string;
        x: number[];
        clase_sklearn: string;
        prob: number[];
      }>;
    };

    expect(ejemplos.length).toBe(69);

    let mismatches = 0;
    let maxDiff = 0;

    for (const eg of ejemplos) {
      const pred = predecir(MODELO_ML, eg.x);
      if (pred.clase !== eg.clase_sklearn) {
        mismatches += 1;
      }
      clases.forEach((c, j) => {
        const diff = Math.abs(pred.probabilidad[c] - eg.prob[j]);
        if (diff > maxDiff) maxDiff = diff;
      });
    }

    expect(mismatches).toBe(0);
    expect(maxDiff).toBeLessThan(1e-6);
  });

  it('correctly constructs feature vector for a real field', () => {
    const barnardField: IndexField = {
      id: 'barnard',
      name: "Barnard's Star",
      ra: 269.4486,
      dec: 4.7672,
      kind: 'mover',
      note: 'M4V',
      n_frames: 355,
      seasons: 3,
      releases: ['QR2', 'QR3'],
      mu_measured: 10.23,
      mu_err: 0.43,
      pa: 354.79,
      mu_expected: 10.39,
      in_gaia: true,
    };

    const feats = featuresDeCampo(barnardField);
    expect(feats).toHaveLength(4);
    expect(feats[0]).toBe(1.0); // en_gaia
    expect(feats[1]).toBe(1.0); // tiene_fotometria
    expect(feats[2]).toBeCloseTo(11.884, 1); // mg_gaia
    expect(feats[3]).toBeCloseTo(2.8337, 2); // bp_rp

    const claseRes = useClase(barnardField, 'es');
    expect(claseRes).not.toBeNull();
    expect(claseRes!.decididoPorImagen).toBe(false);
    expect(claseRes!.claseML).toBe('estrella');
    expect(claseRes!.coinciden).toBe(true);
    expect(Object.keys(claseRes!.probabilidades)).toEqual(['estrella', 'enana marron', 'enana blanca']);
    expect(claseRes!.disclaimer).toBe('candidato a clase; acierta 75 % en 69 objetos con clase verificada; separa mal las variables');
  });

  it('decides variable from the image (kind) while ML only separates non-variable classes', () => {
    const mockVar: IndexField = {
      id: 'rdra',
      name: 'R Draconis',
      ra: 248.1675,
      dec: 66.755,
      kind: 'variable',
      note: 'Mira',
      n_frames: 62,
      seasons: 2,
      releases: ['DR1', 'QR3'],
      mu_measured: null,
      mu_err: null,
      pa: null,
      mu_expected: 0.0215,
      in_gaia: true,
    };

    const res = useClase(mockVar, 'es');
    expect(res).not.toBeNull();
    expect(res!.decididoPorImagen).toBe(true);
    expect(res!.claseRegla).toBe('variable');
    expect(res!.claseML).toBe('variable');
    expect(res!.coinciden).toBe(true);
    expect(Object.keys(res!.probabilidades)).toEqual(['estrella', 'enana marron', 'enana blanca']);
  });
});
