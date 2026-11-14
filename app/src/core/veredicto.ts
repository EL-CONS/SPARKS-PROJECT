export type VeredictoClass =
  | 'estrella'
  | 'enana marron'
  | 'enana blanca'
  | 'variable'
  | 'sin clasificar';

export interface VeredictoThresholds {
  ch4Min: number;
  ratioMin: number;
}

export const VEREDICTO_THRESHOLDS: VeredictoThresholds = {
  ch4Min: 0.5,
  ratioMin: 10.0,
};

export interface VeredictoFieldInput {
  kind?: string;
  in_gaia?: boolean;
  cold?: {
    ratio?: number | null;
    methane_depth?: number | null;
  } | null;
}

export interface VeredictoResult {
  clase: VeredictoClass;
  razon: string;
}

/**
 * Rule-based candidate classifier ported from prototipo/veredicto.py (origin/joako).
 * Thresholds live in VEREDICTO_THRESHOLDS so Horacio's updates are one-line edits.
 */
export function classifyCandidate(
  field: VeredictoFieldInput,
  thresholds: VeredictoThresholds = VEREDICTO_THRESHOLDS
): VeredictoResult {
  if (field.kind === 'variable') {
    return {
      clase: 'variable',
      razon: 'residuo sin dipolo: cambia de brillo, no de posicion',
    };
  }

  const cold = field.cold ?? {};
  const ratio = cold.ratio ?? null;
  const ch4 = cold.methane_depth ?? null;
  const inGaia = Boolean(field.in_gaia);

  if (ratio !== null && ratio >= thresholds.ratioMin && !inGaia) {
    return {
      clase: 'enana marron',
      razon: `se mueve, no esta en Gaia, cociente >= ${ratio}`,
    };
  }

  if (ch4 !== null && ch4 >= thresholds.ch4Min) {
    return {
      clase: 'enana marron',
      razon: `se mueve y el metano es profundo (${ch4})`,
    };
  }

  if (inGaia) {
    return {
      clase: 'estrella',
      razon: 'se mueve y tiene contraparte en Gaia',
    };
  }

  return {
    clase: 'sin clasificar',
    razon: 'se mueve, sin contraparte ni firma fria clara',
  };
}
