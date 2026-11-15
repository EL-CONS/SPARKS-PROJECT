import { describe, expect, it } from 'vitest';
import { estadoMovimiento } from '../src/core/movimiento';

describe('estadoMovimiento', () => {
  it('Barnard (10.23 ± 0.43, sin estado) es detección', () => {
    expect(estadoMovimiento({ mu: 10.23, mu_err: 0.43 })).toBe('detectado');
  });
  it('RW Aurigae (1.32 ± 0.57, parcial) es cota superior', () => {
    expect(estadoMovimiento({ mu: 1.32, mu_err: 0.57 }, 'parcial')).toBe('cota');
  });
  it('menos de 3 sigma es cota aunque el estado sea ok', () => {
    expect(estadoMovimiento({ mu: 1, mu_err: 0.5 }, 'ok')).toBe('cota');
  });
  it('sin ajuste no hay medida', () => {
    expect(estadoMovimiento(null, 'parcial')).toBe('sin-medida');
  });
});
