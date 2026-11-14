// Copy for the start tab, shared by every interface. Plain words first.
import type { Lang } from '../core/urlState';

export interface IntroDict {
  tabs: { start: string; explore: string };
  motto: string;
  mottoAlt: string;
  what: string;
  how: { title: string; before: string; beforeText: string; now: string; nowText: string; arrow: string; arrowText: string };
  pluto: string;
  cta: string;
  ctaAlt: string;
  facts: { colors: string; detectors: string; sky: string };
}

export const INTRO: Record<Lang, IntroDict> = {
  es: {
    tabs: { start: 'Inicio', explore: 'Explorar el cielo' },
    motto: 'Cada chispa que se mueve tiene una huella.',
    mottoAlt: 'Every spark that moves has a fingerprint.',
    what: 'Sparks junta fotos del mismo pedazo de cielo, tomadas con meses de diferencia por el telescopio SPHEREx de la NASA, y las hace parpadear. Las estrellas lejanas se quedan quietas. Lo que salta, se movió.',
    how: {
      title: 'Cómo se lee',
      before: 'Luz azul',
      beforeText: 'Donde estaba antes.',
      now: 'Luz ámbar',
      nowText: 'Donde está ahora.',
      arrow: 'La flecha',
      arrowText: 'Hacia dónde va.',
    },
    pluto: 'Así encontró Clyde Tombaugh a Plutón en 1930: alternando dos fotos del mismo cielo.',
    cta: 'Mira qué se mueve',
    ctaAlt: 'Empezar con la estrella de Barnard',
    facts: { colors: '102 colores de luz infrarroja', detectors: '6 detectores', sky: 'Todo el cielo cada 6 meses' },
  },
  en: {
    tabs: { start: 'Start', explore: 'Explore the sky' },
    motto: 'Every spark that moves has a fingerprint.',
    mottoAlt: 'Cada chispa que se mueve tiene una huella.',
    what: 'Sparks gathers photos of the same patch of sky, taken months apart by NASA’s SPHEREx telescope, and makes them blink. Faraway stars stay still. Whatever jumps, moved.',
    how: {
      title: 'How to read it',
      before: 'Blue light',
      beforeText: 'Where it was before.',
      now: 'Amber light',
      nowText: 'Where it is now.',
      arrow: 'The arrow',
      arrowText: 'Where it is heading.',
    },
    pluto: 'That is how Clyde Tombaugh found Pluto in 1930: switching between two photos of the same sky.',
    cta: 'See what moves',
    ctaAlt: 'Start with Barnard’s Star',
    facts: { colors: '102 colours of infrared light', detectors: '6 detectors', sky: 'The whole sky every 6 months' },
  },
};
