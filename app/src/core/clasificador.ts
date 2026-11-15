import type { IndexField } from '../data/loader';
import { GAIA_PHOTOMETRY, veredicto, FieldFeatures } from './veredicto';
import modeloJson from './modelo.json';

export const FALTA = -999.0;

export interface NodoArbol {
  hoja: boolean;
  f?: number;
  t?: number;
  i?: number;
  d?: number;
  p?: number[];
}

export interface ModeloBosque {
  clases: string[];
  variables: string[];
  falta: number;
  arboles: NodoArbol[][];
}

export interface PrediccionML {
  clase: string;
  probabilidad: Record<string, number>;
  mejorProbabilidad: number;
}

export interface ClaseResultado {
  claseML: string;
  claseRegla: string;
  coinciden: boolean;
  probabilidades: Record<string, number>;
  mejorProbabilidad: number;
  features: number[];
  discrepanciaNota?: string;
  disclaimer: string;
}

export const MODELO_ML: ModeloBosque = modeloJson as ModeloBosque;

/**
 * Inferencia pura de Random Forest (árboles de decisión en ensamble).
 * x = [en_gaia, log10_paralaje, mg_gaia, bp_rp, g_mag, log10_mu]
 */
export function predecir(modelo: ModeloBosque, x: number[]): PrediccionML {
  const k = modelo.clases.length;
  const suma = new Array(k).fill(0);
  for (const nodos of modelo.arboles) {
    let i = 0;
    while (!nodos[i].hoja) {
      const nodo = nodos[i];
      i = x[nodo.f!] <= nodo.t! ? nodo.i! : nodo.d!;
    }
    const hoja = nodos[i];
    hoja.p!.forEach((p, j) => {
      suma[j] += p;
    });
  }
  const prob = suma.map((s) => s / modelo.arboles.length);
  const mejorIdx = prob.indexOf(Math.max(...prob));
  const probabilidad = Object.fromEntries(modelo.clases.map((c, j) => [c, prob[j]]));
  return {
    clase: modelo.clases[mejorIdx],
    probabilidad,
    mejorProbabilidad: prob[mejorIdx],
  };
}

/**
 * Extrae el vector de 6 variables normalizadas para el modelo de ML:
 * [en_gaia, log10_paralaje, mg_gaia, bp_rp, g_mag, log10_mu]
 * con valor FALTA = -999.0 donde no haya dato disponible.
 */
export function featuresDeCampo(campo: IndexField): number[] {
  const slug = (campo.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const rec = GAIA_PHOTOMETRY[campo.id] || GAIA_PHOTOMETRY[slug] || GAIA_PHOTOMETRY[campo.name];

  const inGaia = Boolean(campo.in_gaia || (rec && rec.phot_g_mean_mag !== null && rec.phot_g_mean_mag !== undefined));
  const en_gaia = inGaia ? 1.0 : 0.0;

  const plx = rec?.parallax_mas;
  const log10_paralaje = plx !== null && plx !== undefined && plx > 0 ? Math.log10(plx) : FALTA;

  let mg = rec?.mg_gaia;
  if ((mg === null || mg === undefined) && rec?.phot_g_mean_mag && plx && plx > 0) {
    mg = rec.phot_g_mean_mag + 5.0 + 5.0 * Math.log10(plx / 1000.0);
  }
  const mg_gaia = mg !== null && mg !== undefined && Number.isFinite(mg) ? mg : FALTA;

  const bprp = rec?.bp_rp;
  const bp_rp = bprp !== null && bprp !== undefined && Number.isFinite(bprp) ? bprp : FALTA;

  const gm = rec?.phot_g_mean_mag;
  const g_mag = gm !== null && gm !== undefined && Number.isFinite(gm) ? gm : FALTA;

  const mu = campo.mu_measured ?? campo.mu_expected ?? null;
  const log10_mu = mu !== null && mu !== undefined && Math.abs(mu) > 0 ? Math.log10(Math.abs(mu)) : FALTA;

  return [en_gaia, log10_paralaje, mg_gaia, bp_rp, g_mag, log10_mu];
}

/**
 * Hook/función de clasificación: devuelve la clase predicha por el bosque aleatorio,
 * sus probabilidades, y el veredicto de la regla física de dos pasos,
 * señalando discrepancias metodológicas.
 */
export function useClase(
  campo: IndexField | null | undefined,
  lang: 'es' | 'en' = 'es'
): ClaseResultado | null {
  if (!campo) return null;

  const features = featuresDeCampo(campo);
  const pred = predecir(MODELO_ML, features);

  const feat: FieldFeatures = {
    id: campo.id,
    kind: campo.kind,
    in_gaia: campo.in_gaia,
  };
  const reg = veredicto(feat, campo.id);
  const claseRegla = reg.clase;
  const claseML = pred.clase;
  const coinciden = claseML === claseRegla;

  const es = lang === 'es';
  const disclaimer = es
    ? 'candidato a clase, entrenado con 36 objetos (33 de 36 al dejar uno fuera)'
    : 'candidate class, trained on 36 objects (33 of 36 leave-one-out)';

  let discrepanciaNota: string | undefined;
  if (!coinciden) {
    discrepanciaNota = es
      ? `Discrepancia metodológica: el clasificador ML predice "${claseML}" (${(pred.mejorProbabilidad * 100).toFixed(1)}%), mientras que la regla física deduce "${claseRegla}".`
      : `Methodological discrepancy: ML classifier predicts "${claseML}" (${(pred.mejorProbabilidad * 100).toFixed(1)}%), while physical rule deduces "${claseRegla}".`;
  }

  return {
    claseML,
    claseRegla,
    coinciden,
    probabilidades: pred.probabilidad,
    mejorProbabilidad: pred.mejorProbabilidad,
    features,
    discrepanciaNota,
    disclaimer,
  };
}
