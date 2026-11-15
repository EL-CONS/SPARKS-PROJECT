import { describe, it, expect } from 'vitest';
import modelData from '../src/core/motion_model.json';
import { predictMotion, MotionModelData, MotionFeatures } from '../src/core/motionModel';
import fixtures from './motion_fixtures.json';

describe('Detector de Movimiento en TypeScript (Paridad con Python)', () => {
  const model = modelData as unknown as MotionModelData;

  it('debe cargar la estructura del modelo con clases válidas', () => {
    expect(model.classes).toEqual(['static', 'motion', 'variable']);
    expect(model.root).toBeDefined();
    expect(model.features.length).toBeGreaterThan(0);
  });

  it('debe coincidir exactamente con las predicciones de Python en los 250 casos de prueba', () => {
    expect(fixtures.length).toBe(250);

    let matchCount = 0;
    for (const item of fixtures) {
      const feats = item.features as unknown as MotionFeatures;
      const verdict = predictMotion(model, feats);

      expect(verdict.predictedClass).toBe(item.class_name);
      // Comprobar probabilidades con tolerancia numérica mínima
      expect(Math.abs(verdict.probabilities.static - item.probabilities[0])).toBeLessThan(1e-4);
      expect(Math.abs(verdict.probabilities.motion - item.probabilities[1])).toBeLessThan(1e-4);
      expect(Math.abs(verdict.probabilities.variable - item.probabilities[2])).toBeLessThan(1e-4);

      matchCount++;
    }

    expect(matchCount).toBe(250);
  });

  it('debe generar explicaciones legibles y con razón explícita', () => {
    const motionExample = fixtures.find(f => f.class_name === 'motion');
    expect(motionExample).toBeDefined();
    if (motionExample) {
      const verdict = predictMotion(model, motionExample.features as unknown as MotionFeatures);
      expect(verdict.reason).toContain('Dipolo de movimiento detectado');
    }
  });
});
