// ¿Variable o no? Sale de la imagen, no del modelo con Gaia (que separa mal las
// variables). Orden: 1) el campo `kind` del manifiesto; 2) si no está, el indicio de
// dipolo medido en las restas (core/dipolo.ts; umbral de 5 campos, no validado);
// 3) si no hay ninguno, no se decide.
import { UMBRAL_INDICIO } from './dipolo';

export type OrigenVariable = 'kind' | 'dipolo' | 'ninguno';

export interface DecisionVariable {
  /** true: variable; false: no variable; null: la imagen no permite decidir */
  esVariable: boolean | null;
  origen: OrigenVariable;
  kind?: string;
  balance?: number;
  nRestas?: number;
}

export function decidirVariable(kind: string | null | undefined, dipolo: { mediana: number; n: number } | null | undefined): DecisionVariable {
  if (typeof kind === 'string' && kind.trim()) return { esVariable: kind === 'variable', origen: 'kind', kind };
  if (dipolo && Number.isFinite(dipolo.mediana)) {
    return { esVariable: dipolo.mediana < UMBRAL_INDICIO, origen: 'dipolo', balance: dipolo.mediana, nRestas: dipolo.n };
  }
  return { esVariable: null, origen: 'ninguno' };
}
