/**
 * Inferencia ligera y sin dependencias del detector de movimiento en el navegador.
 * Ejecuta el árbol de decisión exportado desde Python (ml/train.py).
 */

export interface MotionFeatures {
  pos_flux: number;
  neg_flux: number;
  flux_asymmetry: number;
  dipole_balance: number;
  centroid_separation: number;
  peak_pos_snr: number;
  peak_neg_snr: number;
  min_peak_snr: number;
  total_abs_flux: number;
  net_flux: number;
  border_dist: number;
  [key: string]: number;
}

export type MotionClass = 'static' | 'motion' | 'variable';

export interface MotionDecisionNode {
  type: 'split' | 'leaf';
  feature?: string;
  threshold?: number;
  left?: MotionDecisionNode;
  right?: MotionDecisionNode;
  probabilities?: number[];
  class?: number;
  counts?: number[];
}

export interface MotionModelData {
  features: string[];
  classes: MotionClass[];
  root: MotionDecisionNode;
}

export interface MotionVerdict {
  predictedClass: MotionClass;
  probabilities: {
    static: number;
    motion: number;
    variable: number;
  };
  reason: string;
}

/**
 * Evalúa recursivamente el árbol de decisión con las variables físicas del candidato.
 */
export function evaluateMotionTree(
  node: MotionDecisionNode,
  features: MotionFeatures,
  classes: MotionClass[]
): { probabilities: number[]; classIndex: number } {
  if (node.type === 'leaf' || !node.feature || node.threshold === undefined) {
    return {
      probabilities: node.probabilities ?? [1, 0, 0],
      classIndex: node.class ?? 0,
    };
  }

  const val = features[node.feature] ?? 0;
  if (val <= node.threshold) {
    if (!node.left) throw new Error(`Missing left child in node for ${node.feature}`);
    return evaluateMotionTree(node.left, features, classes);
  } else {
    if (!node.right) throw new Error(`Missing right child in node for ${node.feature}`);
    return evaluateMotionTree(node.right, features, classes);
  }
}

/**
 * Emite veredicto y explicación en lenguaje natural a partir del modelo exportado.
 */
export function predictMotion(
  model: MotionModelData,
  features: MotionFeatures
): MotionVerdict {
  const result = evaluateMotionTree(model.root, features, model.classes);
  const probs = result.probabilities;
  const pStatic = probs[0] ?? 0;
  const pMotion = probs[1] ?? 0;
  const pVar = probs[2] ?? 0;

  const predictedClass = model.classes[result.classIndex] ?? 'static';

  let reason = '';
  if (predictedClass === 'motion') {
    reason = `Dipolo de movimiento detectado con p=${(pMotion * 100).toFixed(1)}% (balance=${features.dipole_balance.toFixed(2)}, sep=${features.centroid_separation.toFixed(1)} px)`;
  } else if (predictedClass === 'variable') {
    reason = `Variabilidad fotométrica sin desplazamiento centroidal con p=${(pVar * 100).toFixed(1)}%`;
  } else {
    reason = `Fondo estático o residuo instrumental insignificante (p_static=${(pStatic * 100).toFixed(1)}%)`;
  }

  return {
    predictedClass,
    probabilities: {
      static: pStatic,
      motion: pMotion,
      variable: pVar,
    },
    reason,
  };
}
