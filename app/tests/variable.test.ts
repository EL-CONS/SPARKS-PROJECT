import { describe, expect, it } from 'vitest';
import { decidirVariable } from '../src/core/variable';
import { UMBRAL_INDICIO } from '../src/core/dipolo';
import { useClase } from '../src/core/clasificador';
import type { IndexField } from '../src/data/loader';

describe('variable o no, por la imagen', () => {
  it('con kind en el manifiesto manda kind, aunque el dipolo diga otra cosa', () => {
    expect(decidirVariable('variable', { mediana: 0.9, n: 10 })).toEqual({ esVariable: true, origen: 'kind', kind: 'variable' });
    expect(decidirVariable('mover', { mediana: 0.05, n: 10 })).toMatchObject({ esVariable: false, origen: 'kind' });
  });

  it('sin kind usa el indicio de dipolo', () => {
    expect(decidirVariable(undefined, { mediana: 0.1, n: 12 })).toEqual({ esVariable: true, origen: 'dipolo', balance: 0.1, nRestas: 12 });
    expect(decidirVariable('', { mediana: UMBRAL_INDICIO + 0.2, n: 5 })).toMatchObject({ esVariable: false, origen: 'dipolo' });
  });

  it('sin kind ni dipolo no decide', () => {
    expect(decidirVariable(undefined, null)).toEqual({ esVariable: null, origen: 'ninguno' });
  });

  it('el panel: sin kind y con dipolo bajo, la clase es variable por la imagen; sin nada, decide el modelo entre tres', () => {
    const campo = { id: 'x', name: 'X', ra: 0, dec: 0, kind: '', note: 'n', n_frames: 1, seasons: 2, releases: [], mu_measured: null, mu_err: null, pa: null, mu_expected: null, in_gaia: false } as unknown as IndexField;
    const conDipolo = useClase(campo, 'es', { kind: null, dipolo: { mediana: 0.1, n: 8 } })!;
    expect(conDipolo.claseML).toBe('variable');
    expect(conDipolo.variable.origen).toBe('dipolo');
    const sinNada = useClase(campo, 'es', { kind: null, dipolo: null })!;
    expect(sinNada.variable.esVariable).toBeNull();
    expect(['estrella', 'enana marron', 'enana blanca']).toContain(sinNada.claseML);
  });
});
