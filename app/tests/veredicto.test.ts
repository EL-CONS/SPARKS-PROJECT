import { describe, it, expect } from 'vitest';
import { veredicto, calcularMg, FieldFeatures } from '../src/core/veredicto';
import resultsData from '../../data-sample/results.json';

describe('Veredicto Físico con Gaia DR3 (Jerarquía de Horacio en TypeScript)', () => {
  const fields = resultsData.fields as Record<string, FieldFeatures>;

  const SPLIT_DESARROLLO: Record<string, string> = {
    barnard: 'estrella',
    teegarden: 'estrella',
    wolf359: 'estrella',
    kapteyn: 'estrella',
    t503424: 'estrella',
    vanmaanen: 'enana blanca',
    wise0855: 'enana marron',
    epsindib: 'enana marron',
    rwaur: 'variable',
    rdra: 'variable',
  };

  it('debe calcular M_G correctamente con la fórmula Pogson/paralaje', () => {
    // Barnard: G=8.194, plx=546.9759 -> M_G = 8.194 + 5 + 5*log10(0.5469759) = 11.884
    const mg = calcularMg(8.194, 546.9759);
    expect(mg).not.toBeNull();
    expect(mg!).toBeCloseTo(11.884, 2);

    expect(calcularMg(null, 100)).toBeNull();
    expect(calcularMg(10, 0)).toBeNull();
    expect(calcularMg(10, -5)).toBeNull();
  });

  it('debe coincidir exactamente 10/10 con el script de Python sobre el split de desarrollo', () => {
    let ok = 0;
    for (const [fid, verdad] of Object.entries(SPLIT_DESARROLLO)) {
      const f = fields[fid];
      expect(f).toBeDefined();

      const { clase, razon } = veredicto(f, fid);
      expect(clase).toBe(verdad);
      expect(razon.length).toBeGreaterThan(5);
      ok++;
    }
    expect(ok).toBe(10);
  });

  it('debe reconocer a Van Maanen como enana blanca mediante M_G y BP-RP', () => {
    const res = veredicto(fields['vanmaanen'], 'vanmaanen');
    expect(res.clase).toBe('enana blanca');
    expect(res.razon).toContain('M_G=14.12');
    expect(res.razon).toContain('BP-RP=0.60');
  });

  it('debe reportar estrella con razón explícita cuando in_gaia es true pero falta fotometría', () => {
    const mockField: FieldFeatures = {
      kind: 'mover',
      in_gaia: true,
      cold: {},
    };
    const res = veredicto(mockField, 'campo_desconocido_sin_gaia');
    expect(res.clase).toBe('estrella');
    expect(res.razon).toContain('no trae fotometria/paralaje verificable');
  });
});
