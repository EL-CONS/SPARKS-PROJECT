import { useMemo } from 'react';
import type { IndexField } from '../../data/loader';
import type { Lang } from '../../core/urlState';
import {
  veredicto,
  FieldFeatures,
  GAIA_PHOTOMETRY,
  calcularMg,
  CH4_MIN,
  RATIO_MIN,
  MG_WD_MIN,
  BPRP_WD_MAX,
} from '../../core/veredicto';
import resultsData from '../../../../data-sample/results.json';

export type VeredictoClaseKey =
  | 'estrella'
  | 'enana_blanca'
  | 'enana_marron'
  | 'variable'
  | 'sin_clasificar';

export interface VeredictoOutput {
  clase: string;
  claseKey: VeredictoClaseKey;
  razon: string;
  faltan: string[];
}

export function computeVeredicto(
  field: IndexField | null | undefined,
  lang: Lang = 'es'
): VeredictoOutput | null {
  if (!field) return null;

  const rf = ((resultsData as { fields?: Record<string, Record<string, unknown>> }).fields?.[field.id] || {}) as {
    kind?: string;
    in_gaia?: boolean;
    cold?: { ratio?: number; methane_depth?: number };
  };

  const cold = rf.cold || {};
  const inGaia = rf.in_gaia !== undefined ? Boolean(rf.in_gaia) : Boolean(field.in_gaia);
  const kind = rf.kind || field.kind;

  const f: FieldFeatures = {
    id: field.id,
    kind,
    in_gaia: inGaia,
    cold,
  };

  const raw = veredicto(f, field.id);

  let claseKey: VeredictoClaseKey = 'sin_clasificar';
  if (raw.clase === 'variable') claseKey = 'variable';
  else if (raw.clase === 'enana marron') claseKey = 'enana_marron';
  else if (raw.clase === 'enana blanca') claseKey = 'enana_blanca';
  else if (raw.clase === 'estrella') claseKey = 'estrella';

  const es = lang === 'es';

  // Determinación de razones traducidas y sin texto fijo
  let clase = es ? 'Sin clasificar' : 'Unclassified';
  let razon = '';

  const ch4 = cold.methane_depth;
  const ratio = cold.ratio;

  if (claseKey === 'variable') {
    clase = es ? 'Estrella variable' : 'Variable star';
    razon = es
      ? 'Residuo monopolar sin dipolo: el astro cambia de brillo entre temporadas, no de posición.'
      : 'Monopolar residual without dipole: the object changes in brightness between seasons, not in position.';
  } else if (claseKey === 'enana_marron') {
    clase = es ? 'Enana marrón' : 'Brown dwarf';
    if (ch4 !== undefined && ch4 !== null && ch4 >= CH4_MIN) {
      razon = es
        ? `Se mueve y presenta absorción diagnóstica de metano en 3.3 µm (CH₄=${ch4.toFixed(2)} ≥ ${CH4_MIN}), característica de enanas ultrafrías T/Y.`
        : `Moving source with diagnostic 3.3 µm methane absorption (CH₄=${ch4.toFixed(2)} ≥ ${CH4_MIN}), characteristic of ultra-cool T/Y dwarfs.`;
    } else if (ratio !== undefined && ratio !== null && ratio >= RATIO_MIN && !inGaia) {
      razon = es
        ? `Se mueve, ausente en Gaia DR3 y con cociente infrarrojo extremo D6/D2=${ratio.toFixed(2)} ≥ ${RATIO_MIN}.`
        : `Moving source, absent in Gaia DR3 with extreme infrared flux ratio D6/D2=${ratio.toFixed(2)} ≥ ${RATIO_MIN}.`;
    } else {
      razon = es ? 'Firma física de objeto ultrafrío de baja masa.' : 'Physical signature of ultra-cool low-mass body.';
    }
  } else if (claseKey === 'enana_blanca') {
    clase = es ? 'Enana blanca' : 'White dwarf';
    const rec = GAIA_PHOTOMETRY[field.id];
    const sid = rec?.gaia_source_id ? `(${rec.gaia_source_id})` : '';
    const mg = calcularMg(rec?.phot_g_mean_mag, rec?.parallax_mas);
    const bpRp = rec?.bp_rp;
    razon = es
      ? `Contraparte óptica en Gaia DR3 ${sid}: magnitud absoluta M_G=${mg !== null ? mg.toFixed(2) : '—'} ≥ ${MG_WD_MIN} y color azul BP-RP=${bpRp !== undefined && bpRp !== null ? bpRp.toFixed(2) : '—'} ≤ ${BPRP_WD_MAX} (secuencia de enanas blancas).`
      : `Optical counterpart in Gaia DR3 ${sid}: absolute magnitude M_G=${mg !== null ? mg.toFixed(2) : '—'} ≥ ${MG_WD_MIN} and blue color BP-RP=${bpRp !== undefined && bpRp !== null ? bpRp.toFixed(2) : '—'} ≤ ${BPRP_WD_MAX} (white dwarf sequence).`;
  } else if (claseKey === 'estrella') {
    clase = es ? 'Estrella cercana' : 'Nearby star';
    const rec = GAIA_PHOTOMETRY[field.id];
    const sid = rec?.gaia_source_id ? `(${rec.gaia_source_id})` : '';
    const mg = calcularMg(rec?.phot_g_mean_mag, rec?.parallax_mas);
    const bpRp = rec?.bp_rp;
    if (mg !== null && bpRp !== undefined && bpRp !== null) {
      razon = es
        ? `Contraparte óptica en Gaia DR3 ${sid}: M_G=${mg.toFixed(2)} y BP-RP=${bpRp.toFixed(2)}; coincide con la secuencia principal estelar.`
        : `Optical counterpart in Gaia DR3 ${sid}: M_G=${mg.toFixed(2)} and BP-RP=${bpRp.toFixed(2)}; consistent with standard main-sequence stars.`;
    } else {
      razon = es
        ? 'Se mueve y posee contraparte en Gaia DR3, pero la fotometría o paralaje no están completos para calcular M_G.'
        : 'Moving source with Gaia DR3 counterpart, but lacking full photometry or parallax to calculate M_G.';
    }
  } else {
    clase = es ? 'Candidato sin clasificar' : 'Unclassified candidate';
    razon = es
      ? 'Se mueve, pero no tiene contraparte óptica en Gaia ni firma infrarroja concluyente.'
      : 'Moving source without optical Gaia counterpart or conclusive infrared signature.';
  }

  // Detección de qué datos faltan
  const faltan: string[] = [];
  if (!inGaia) {
    faltan.push(es ? 'Sin contraparte óptica en catálogo Gaia DR3' : 'No optical counterpart in Gaia DR3 catalog');
  } else {
    const rec = GAIA_PHOTOMETRY[field.id];
    if (!rec || rec.phot_g_mean_mag === null || rec.parallax_mas === null || rec.bp_rp === null) {
      faltan.push(
        es
          ? 'Falta paralaje trigonométrico o color BP-RP en Gaia para ubicar en diagrama H-R'
          : 'Missing trigonometric parallax or BP-RP color in Gaia for H-R diagram'
      );
    }
  }

  if (cold.ratio === undefined || cold.ratio === null) {
    faltan.push(
      es
        ? 'Falta cociente infrarrojo D6/D2 (luz larga vs luz corta)'
        : 'Missing infrared ratio D6/D2 (long vs short light)'
    );
  }

  if (cold.methane_depth === undefined || cold.methane_depth === null) {
    faltan.push(
      es
        ? 'Falta índice de absorción de metano en 3.3 µm (banda D4 SPHEREx)'
        : 'Missing 3.3 µm methane absorption index (SPHEREx band D4)'
    );
  }

  return {
    clase,
    claseKey,
    razon,
    faltan,
  };
}

export function useVeredicto(
  field: IndexField | null | undefined,
  lang: Lang = 'es'
): VeredictoOutput | null {
  return useMemo(() => computeVeredicto(field, lang), [field, lang]);
}
