import type { IndexField } from '../data/loader';
import { GAIA_PHOTOMETRY, veredicto, FieldFeatures } from './veredicto';
import modeloJson from './modelo.json';
import resultadosJson from './resultados_v2.json';
import { INSIGHTS } from '../i18n/insights';
import { decidirVariable, type DecisionVariable } from './variable';

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

export const CLASES_ESTELARES = ['estrella', 'enana marron', 'enana blanca'] as const;

export interface ClaseResultado {
  claseML: string;
  claseRegla: string;
  coinciden: boolean;
  decididoPorImagen: boolean;
  /** De dónde sale "variable o no": kind del manifiesto, indicio de dipolo o ninguno */
  variable: DecisionVariable;
  probabilidades: Record<string, number>;
  mejorProbabilidad: number;
  features: number[];
  discrepanciaNota?: string;
  disclaimer: string;
}

export const MODELO_ML: ModeloBosque = modeloJson as ModeloBosque;

/** Lo que el panel necesita de ml-clasificador/resultados_v2.json (copiado en core/). */
export interface ResultadosModelo {
  n_objetos: number;
  exactitud_ml_loo: number;
  recall_por_clase: Record<string, number>;
}

export const RESULTADOS_ML: ResultadosModelo = resultadosJson as ResultadosModelo;

/** Debajo de este recall, el panel dice que el modelo separa mal las variables. */
export const RECALL_VARIABLE_ACEPTABLE = 0.7;

/**
 * Texto del panel con las cifras del archivo de resultados, nunca escritas a mano:
 * exactitud dejando uno fuera, número de objetos con clase verificada y si el
 * recall de "variable" queda por debajo de RECALL_VARIABLE_ACEPTABLE.
 */
export function resumenModelo(res: ResultadosModelo, lang: 'es' | 'en'): string {
  const pct = (res.exactitud_ml_loo * 100).toFixed(0);
  const variablesMal = (res.recall_por_clase.variable ?? 0) < RECALL_VARIABLE_ACEPTABLE;
  return INSIGHTS[lang].classifier.disclaimer(pct, res.n_objetos, variablesMal);
}

/**
 * Inferencia pura de Random Forest (árboles de decisión en ensamble).
 * x = [en_gaia, tiene_fotometria, mg_gaia, bp_rp]
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
 * Extrae el vector de 4 variables para el modelo v2 de ML:
 * [en_gaia, tiene_fotometria, mg_gaia, bp_rp]
 * con valor FALTA = -999.0 donde falte mg_gaia o bp_rp.
 */
export function featuresDeCampo(campo: IndexField): number[] {
  const slug = (campo.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const rec = GAIA_PHOTOMETRY[campo.id] || GAIA_PHOTOMETRY[slug] || GAIA_PHOTOMETRY[campo.name];

  const inGaia = Boolean(campo.in_gaia || (rec && rec.phot_g_mean_mag !== null && rec.phot_g_mean_mag !== undefined));
  const en_gaia = inGaia ? 1.0 : 0.0;

  const plx = rec?.parallax_mas;
  let mg = rec?.mg_gaia;
  if ((mg === null || mg === undefined) && rec?.phot_g_mean_mag && plx && plx > 0) {
    mg = rec.phot_g_mean_mag + 5.0 + 5.0 * Math.log10(plx / 1000.0);
  }
  const mg_gaia = mg !== null && mg !== undefined && Number.isFinite(mg) ? mg : FALTA;

  const bprp = rec?.bp_rp;
  const bp_rp = bprp !== null && bprp !== undefined && Number.isFinite(bprp) ? bprp : FALTA;

  const tiene_fotometria = mg_gaia !== FALTA && bp_rp !== FALTA ? 1.0 : 0.0;

  return [en_gaia, tiene_fotometria, mg_gaia, bp_rp];
}

/**
 * Hook/función de clasificación:
 * - La decisión de "variable" sale de la imagen (campo `kind` / dipolo en el manifiesto),
 *   porque el modelo ML con Gaia separa mal las variables.
 * - Cuando la imagen indica movimiento (no variable), el ML decide solo entre
 *   estrella, enana marrón y enana blanca.
 */
export function useClase(
  campo: IndexField | null | undefined,
  lang: 'es' | 'en' = 'es',
  imagen?: { kind?: string | null; dipolo?: { mediana: number; n: number } | null }
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

  // kind del manifiesto si se pasa; si no, el del índice; si no, el indicio de dipolo.
  const variable = decidirVariable(imagen?.kind ?? campo.kind, imagen?.dipolo);
  const decididoPorImagen = variable.esVariable === true;

  // Filtrar probabilidades a las 3 clases no variables cuando la imagen no es variable
  const sumaNoVar = CLASES_ESTELARES.reduce((acc, c) => acc + (pred.probabilidad[c] ?? 0), 0);
  const probabilidades: Record<string, number> = {};
  for (const c of CLASES_ESTELARES) {
    const raw = pred.probabilidad[c] ?? 0;
    probabilidades[c] = sumaNoVar > 0 ? raw / sumaNoVar : 1 / CLASES_ESTELARES.length;
  }

  let claseML: string;
  let mejorProbabilidad: number;
  if (decididoPorImagen) {
    claseML = 'variable';
    mejorProbabilidad = 1.0;
  } else {
    claseML = CLASES_ESTELARES[0];
    mejorProbabilidad = probabilidades[claseML];
    for (const c of CLASES_ESTELARES) {
      if (probabilidades[c] > mejorProbabilidad) {
        claseML = c;
        mejorProbabilidad = probabilidades[c];
      }
    }
  }

  const coinciden = claseML === claseRegla;

  const es = lang === 'es';
  const disclaimer = resumenModelo(RESULTADOS_ML, lang);

  let discrepanciaNota: string | undefined;
  if (!coinciden) {
    discrepanciaNota = es
      ? `Discrepancia metodológica: el clasificador ML predice "${claseML}" (${(mejorProbabilidad * 100).toFixed(1)}%), mientras que la regla física deduce "${claseRegla}".`
      : `Methodological discrepancy: ML classifier predicts "${claseML}" (${(mejorProbabilidad * 100).toFixed(1)}%), while physical rule deduces "${claseRegla}".`;
  }

  return {
    claseML,
    claseRegla,
    coinciden,
    decididoPorImagen,
    variable,
    probabilidades,
    mejorProbabilidad,
    features,
    discrepanciaNota,
    disclaimer,
  };
}
