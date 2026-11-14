// Geometric characters drawn with the logo's grammar (solid core + radial
// halo that falls to zero). They never use the before-blue or now-amber, so
// they can't be confused with data, and every one is labelled "illustration".
import { useState } from 'react';
import type { UiDict } from '../../i18n/ui';

type Kind = 'nearStar' | 'brownDwarf' | 'variable' | 'comet' | 'asteroid';
const KINDS: Kind[] = ['nearStar', 'brownDwarf', 'variable', 'comet', 'asteroid'];

function Halo({ id, color, r, cx = 60, cy = 60, peak = 0.6 }: { id: string; color: string; r: number; cx?: number; cy?: number; peak?: number }) {
  return (
    <>
      <defs>
        <radialGradient id={id} cx={cx} cy={cy} r={r} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={color} stopOpacity={peak} />
          <stop offset="0.35" stopColor={color} stopOpacity={peak * 0.55} />
          <stop offset="0.6" stopColor={color} stopOpacity={peak * 0.15} />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} />
    </>
  );
}

export function AstroArt({ kind }: { kind: Kind }) {
  switch (kind) {
    case 'nearStar':
      return (
        <svg viewBox="0 0 120 120" className="astro__svg" aria-hidden="true">
          <Halo id="h-ns" color="var(--astro-coral)" r={52} cx={68} cy={52} />
          <circle cx="30" cy="90" r="5" fill="var(--astro-coral)" opacity="0.18" />
          <circle cx="42" cy="78" r="7" fill="var(--astro-coral)" opacity="0.3" />
          <circle cx="54" cy="66" r="9" fill="var(--astro-coral)" opacity="0.45" />
          <circle cx="68" cy="52" r="17" fill="var(--astro-coral)" />
          <circle cx="64" cy="48" r="7" fill="var(--astro-lens)" opacity="0.35" />
        </svg>
      );
    case 'brownDwarf':
      return (
        <svg viewBox="0 0 120 120" className="astro__svg" aria-hidden="true">
          <Halo id="h-bd" color="var(--astro-mauve)" r={50} peak={0.45} />
          <defs>
            <clipPath id="c-bd">
              <circle cx="60" cy="60" r="22" />
            </clipPath>
          </defs>
          <g clipPath="url(#c-bd)">
            <rect x="30" y="30" width="60" height="60" fill="var(--astro-mauve-deep)" />
            <rect x="30" y="47" width="60" height="5" fill="var(--astro-mauve)" />
            <rect x="30" y="58" width="60" height="8" fill="var(--astro-mauve)" opacity="0.8" />
            <rect x="30" y="71" width="60" height="4" fill="var(--astro-mauve)" opacity="0.7" />
          </g>
        </svg>
      );
    case 'variable':
      return (
        <svg viewBox="0 0 120 120" className="astro__svg astro__svg--pulse" aria-hidden="true">
          <Halo id="h-va" color="var(--astro-rose)" r={54} />
          <circle className="astro__ring" cx="60" cy="60" r="30" fill="none" stroke="var(--astro-rose)" strokeOpacity="0.35" strokeWidth="1.5" />
          <circle className="astro__core" cx="60" cy="60" r="19" fill="var(--astro-rose)" />
        </svg>
      );
    case 'comet':
      return (
        <svg viewBox="0 0 120 120" className="astro__svg" aria-hidden="true">
          <defs>
            <linearGradient id="g-co" x1="78" y1="42" x2="14" y2="106" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="var(--astro-mint)" stopOpacity="0.75" />
              <stop offset="1" stopColor="var(--astro-mint)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M84 36 L16 96 L28 104 L92 46 Z" fill="url(#g-co)" />
          <Halo id="h-co" color="var(--astro-mint)" r={30} cx={86} cy={40} />
          <circle cx="86" cy="40" r="8" fill="var(--astro-mint)" />
        </svg>
      );
    case 'asteroid':
      return (
        <svg viewBox="0 0 120 120" className="astro__svg" aria-hidden="true">
          <Halo id="h-as" color="var(--astro-stone)" r={44} peak={0.25} />
          <path d="M42 50 L56 38 L74 41 L84 56 L80 74 L64 84 L46 80 L37 66 Z" fill="var(--astro-stone)" />
          <circle cx="60" cy="56" r="5" fill="var(--astro-stone-deep)" />
          <circle cx="71" cy="70" r="3.5" fill="var(--astro-stone-deep)" />
          <circle cx="50" cy="69" r="2.5" fill="var(--astro-stone-deep)" />
        </svg>
      );
  }
}

export function Astros({ t }: { t: UiDict }) {
  const [open, setOpen] = useState<Kind | null>(null);
  return (
    <section className="astros" aria-labelledby="astros-title">
      <div className="astros__head">
        <h2 id="astros-title" className="h-section">{t.astros.title}</h2>
        <p className="astros__intro">{t.astros.intro}</p>
      </div>
      <ul className="astros__row">
        {KINDS.map(k => {
          const item = t.astros.items[k];
          const isOpen = open === k;
          return (
            <li key={k} className={`astro${isOpen ? ' is-open' : ''}`}>
              <button
                type="button"
                className="astro__btn"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : k)}
              >
                <span className="astro__figure">
                  <AstroArt kind={k} />
                  <span className="astro__tag">{t.astros.illustration}</span>
                </span>
                <span className="astro__name">{item.name}</span>
              </button>
              <div className="astro__body" hidden={!isOpen}>
                <p>{item.line}</p>
                <p className="astro__insparks">{item.inSparks}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
