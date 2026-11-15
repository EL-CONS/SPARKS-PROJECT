import { describe, expect, it } from 'vitest';
import { isMeasured, targetPixel, N, type TargetPoint } from '../src/ui/sky';

// R Draconis (data-new, estado parcial) trae puntos del objetivo con x e y nulos:
// la app no debe romperse ni inventar una posición medida.
const sinMedir: TargetPoint[] = [
  { det: 1, season: 0, x: null, y: null, use: false },
  { det: 1, season: 1, x: null, y: null, use: false },
];

describe('posición del objetivo', () => {
  it('descarta puntos sin posición medida', () => {
    expect(sinMedir.filter(isMeasured)).toHaveLength(0);
    expect(isMeasured({ det: 1, season: 0, x: 31.6, y: 31.4, use: true })).toBe(true);
  });

  it('sin ninguna posición medida usa el centro del recorte y lo dice', () => {
    expect(targetPixel(sinMedir, 0)).toEqual({ x: (N - 1) / 2, y: (N - 1) / 2, measured: false });
  });

  it('usa la temporada pedida y, si falta, otra medida', () => {
    const pts: TargetPoint[] = [
      { det: 1, season: 0, x: 10, y: 11, use: true },
      { det: 1, season: 1, x: null, y: null, use: false },
    ];
    expect(targetPixel(pts, 0)).toEqual({ x: 10, y: 11, measured: true });
    expect(targetPixel(pts, 1)).toEqual({ x: 10, y: 11, measured: true });
  });
});
