import gaiaData from '../data/gaiaPhotometry.json';

export interface ColdFeatures {
  ratio?: number;
  methane_depth?: number;
}

export interface FieldFeatures {
  id?: string;
  kind?: string;
  in_gaia?: boolean;
  cold?: ColdFeatures;
}

export interface GaiaRecord {
  id_campo: string;
  nombre?: string;
  gaia_source_id?: string;
  phot_g_mean_mag?: number | null;
  bp_rp?: number | null;
  parallax_mas?: number | null;
  mg_gaia?: number | null;
}

export const GAIA_PHOTOMETRY: Record<string, GaiaRecord> = gaiaData as Record<string, GaiaRecord>;

export const CH4_MIN = 0.5; // Absorción diagnóstica de metano en 3.3 µm (banda D4 SPHEREx)
export const RATIO_MIN = 10.0; // F_D6/F_D2 mínimo para objetos ultra-fríos sin contraparte óptico
export const MG_WD_MIN = 10.0; // Magnitud absoluta óptica mínima para secuencia de enanas blancas
export const BPRP_WD_MAX = 0.8; // Color óptico azul máximo para enana blanca

/**
 * Calcula la magnitud absoluta óptica en la banda G:
 * M_G = G + 5 + 5 * log10(plx / 1000)
 */
export function calcularMg(g: number | null | undefined, plxMas: number | null | undefined): number | null {
  if (g === null || g === undefined || plxMas === null || plxMas === undefined || plxMas <= 0) {
    return null;
  }
  return g + 5.0 + 5.0 * Math.log10(plxMas / 1000.0);
}

/**
 * Clasificador basado en física astrofísica estricta (jerarquía de dos pasos de Horacio).
 * Evalúa fotometría infrarroja de SPHEREx y fotometría/paralaje de Gaia DR3.
 */
export function veredicto(f: FieldFeatures, fid?: string): { clase: string; razon: string } {
  // 1. Separación cinemática: residuo dipolar (movimiento) vs monopolar (variable)
  if (f.kind === 'variable') {
    return { clase: 'variable', razon: 'residuo sin dipolo: cambia de brillo, no de posicion' };
  }

  const cold = f.cold || {};
  const ratio = cold.ratio;
  const ch4 = cold.methane_depth;
  const inGaia = Boolean(f.in_gaia);

  // 2. Metano profundo: firma diagnóstica molecular de atmósferas T/Y
  if (ch4 !== undefined && ch4 !== null && ch4 >= CH4_MIN) {
    return {
      clase: 'enana marron',
      razon: `se mueve y presenta absorcion profunda de metano (CH4=${ch4.toFixed(2)} >= ${CH4_MIN})`
    };
  }

  // 3. Exceso infrarrojo medio extremo sin contraparte visible en Gaia DR3
  if (ratio !== undefined && ratio !== null && ratio >= RATIO_MIN && !inGaia) {
    return {
      clase: 'enana marron',
      razon: `se mueve, ausente en Gaia y cociente infrarrojo D6/D2=${ratio.toFixed(2)} >= ${RATIO_MIN}`
    };
  }

  // 4. Clasificación astrofísica con Gaia DR3
  if (inGaia) {
    const record = fid ? GAIA_PHOTOMETRY[fid] : undefined;
    const g = record?.phot_g_mean_mag;
    const bpRp = record?.bp_rp;
    const plx = record?.parallax_mas;
    const mg = calcularMg(g, plx);
    const sid = record?.gaia_source_id || '';

    if (mg !== null && bpRp !== null && bpRp !== undefined) {
      if (mg >= MG_WD_MIN && bpRp <= BPRP_WD_MAX) {
        return {
          clase: 'enana blanca',
          razon: `Gaia DR3 ${sid}: M_G=${mg.toFixed(2)} >= ${MG_WD_MIN} y BP-RP=${bpRp.toFixed(2)} <= ${BPRP_WD_MAX}`
        };
      }
      return {
        clase: 'estrella',
        razon: `Gaia DR3 ${sid}: M_G=${mg.toFixed(2)}, BP-RP=${bpRp.toFixed(2)}; no cumple el criterio de enana blanca`
      };
    }

    return {
      clase: 'estrella',
      razon: 'se mueve y tiene contraparte en Gaia, pero la tabla no trae fotometria/paralaje verificable; no se puede calcular M_G'
    };
  }

  return {
    clase: 'sin clasificar',
    razon: 'se mueve, sin contraparte Gaia ni firma fria concluyente'
  };
}
