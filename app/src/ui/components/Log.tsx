// The field log: one entry per season on a rising rail, the live entry lit
// amber with the logo's lens flash on change, its comparison entry in blue.
// Then the reading: measured motion against the catalog, with error.
import type { ViewMode } from '../../core/urlState';
import type { IndexField } from '../../data/loader';
import type { UiDict } from '../../i18n/ui';
import { formatDate } from '../sky';
import type { FullManifest } from '../sky';
import { Term } from './Term';

interface LogProps {
  t: UiDict;
  manifest: FullManifest;
  field: IndexField;
  mode: ViewMode;
  frame: number;
  pair: [number, number];
  flashKey: number;
  onPick: (season: number) => void;
}

export function Log({ t, manifest, field, mode, frame, pair, flashKey, onPick }: LogProps) {
  const seasons = manifest.seasons;
  const nowIdx = mode === 'diff' ? pair[1] : mode === 'stack' ? -1 : frame;
  const beforeIdx = mode === 'diff' ? pair[0] : mode === 'blink' && frame > 0 ? 0 : -1;
  const releases = (s: (typeof seasons)[number]) => s.releases.map(r => r.toUpperCase()).join(' + ');

  return (
    <section className="log" aria-labelledby="log-title">
      <h2 id="log-title" className="h-section">{t.log.title}</h2>
      <p className="log__intro">
        {t.log.intro.split(/(temporada|season)/i).map((part, i) =>
          /^(temporada|season)$/i.test(part) ? <Term key={i} id="season" t={t}>{part}</Term> : part,
        )}
      </p>
      <ol className="log__rail" style={{ ['--steps' as string]: seasons.length - 1 }}>
        {seasons.map((s, i) => ({ s, i })).reverse().map(({ s, i }) => {
          const state = i === nowIdx ? 'now' : i === beforeIdx ? 'before' : mode === 'stack' ? 'all' : 'idle';
          return (
            <li key={s.id} className={`entry entry--${state}`} style={{ ['--step' as string]: i }}>
              <button
                type="button"
                className="entry__btn"
                onClick={() => onPick(i)}
                aria-current={state === 'now' ? 'step' : undefined}
                disabled={mode === 'stack'}
              >
                <span className="entry__dot" aria-hidden="true">
                  {state === 'now' && <span key={flashKey} className="entry__lens" />}
                </span>
                <span className="entry__when">
                  {formatDate(s.start, t.months)} – {formatDate(s.end, t.months)}
                  {state === 'now' && <span className="entry__badge entry__badge--now">{t.log.now}</span>}
                  {state === 'before' && <span className="entry__badge entry__badge--before">{t.log.before}</span>}
                </span>
                <span className="entry__kid">{t.log.entryKid(i)}</span>
                <span className="entry__data">
                  {t.log.images(s.n_frames)} · {releases(s)}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <Reading t={t} manifest={manifest} field={field} />
    </section>
  );
}

function Reading({ t, manifest, field }: { t: UiDict; manifest: FullManifest; field: IndexField }) {
  const m = manifest.target.measured;
  const e = manifest.target.expected;
  if (!m || field.mu_measured === null) return null;
  const px = (m.mu / manifest.field.pixel_arcsec).toFixed(1);
  const diffSigma = e ? Math.abs(m.mu - e.mu) / m.mu_err : null;
  return (
    <div className="reading">
      <h3 className="reading__title">{t.log.readingTitle}</h3>
      <p className="reading__kid">{t.log.readingKid(px)}</p>
      <div className="reading__grid">
        <MotionDial t={t} mu={m.mu} pa={m.pa_deg} paErr={m.pa_err_deg} expectedPa={e?.pa_deg ?? null} />
        <dl className="reading__nums">
          <div>
            <dt>{t.log.measured}</dt>
            <dd>
              <span className="num num--big">{m.mu.toFixed(2)}</span>
              <span className="num"> ± {m.mu_err.toFixed(2)}</span> <span className="unit">{t.log.perYear}</span>
            </dd>
          </div>
          {e && (
            <div>
              <dt>{t.log.expected(e.catalog)}</dt>
              <dd>
                <span className="num">{e.mu.toFixed(2)}</span> <span className="unit">{t.log.perYear}</span>
              </dd>
            </div>
          )}
          {diffSigma !== null && <p className="reading__agree">{t.log.agreement(diffSigma.toFixed(1))}</p>}
        </dl>
      </div>
      <ErrorBar measured={m.mu} err={m.mu_err} expected={e?.mu ?? null} t={t} />
    </div>
  );
}

/** Sky compass: north up, east left (as seen on the sky). */
function MotionDial({ t, mu, pa, paErr, expectedPa }: { t: UiDict; mu: number; pa: number; paErr: number; expectedPa: number | null }) {
  const c = 60;
  const R = 44;
  // PA counts from north through east; east is to the left on the sky.
  const pt = (deg: number, r: number) => {
    const a = (deg * Math.PI) / 180;
    return [c - r * Math.sin(a), c - r * Math.cos(a)] as const;
  };
  const [hx, hy] = pt(pa, R);
  const [tx, ty] = pt(pa + 180, 14);
  const w1 = pt(pa - paErr, R + 6);
  const w2 = pt(pa + paErr, R + 6);
  const ex = expectedPa !== null ? pt(expectedPa, R + 8) : null;
  const desc = t.log.dialDesc(mu.toFixed(2), pa.toFixed(1));
  return (
    <figure className="dial">
      <svg viewBox="0 0 120 120" role="img" aria-label={desc}>
        <title>{t.log.dialTitle}</title>
        <circle cx={c} cy={c} r={R + 10} className="dial__ring" />
        <circle cx={c} cy={c} r={R / 2} className="dial__ring dial__ring--in" />
        <text x={c} y={9} className="dial__card">N</text>
        <text x={6} y={c + 3} className="dial__card">E</text>
        <path d={`M${c} ${c} L${w1[0]} ${w1[1]} A${R + 6} ${R + 6} 0 0 ${paErr > 0 ? 1 : 0} ${w2[0]} ${w2[1]} Z`} className="dial__wedge" />
        {ex && <line x1={c} y1={c} x2={ex[0]} y2={ex[1]} className="dial__expected" />}
        <line x1={tx} y1={ty} x2={hx} y2={hy} className="dial__arrow" />
        <circle cx={tx} cy={ty} r={5} className="dial__then" />
        <circle cx={hx} cy={hy} r={6.5} className="dial__now" />
      </svg>
      <figcaption className="dial__legend">
        <span><i className="sw sw--arrow" />{t.log.measuredLegend} {pa.toFixed(1)}° ± {paErr.toFixed(1)}°</span>
        {expectedPa !== null && <span><i className="sw sw--expected" />{t.log.expectedLegend} {expectedPa.toFixed(1)}°</span>}
        <span><Term id="positionAngle" t={t} /></span>
      </figcaption>
    </figure>
  );
}

function ErrorBar({ measured, err, expected, t }: { measured: number; err: number; expected: number | null; t: UiDict }) {
  const lo = Math.min(measured - 3 * err, expected ?? Infinity);
  const hi = Math.max(measured + 3 * err, expected ?? -Infinity);
  const span = hi - lo || 1;
  const x = (v: number) => 8 + ((v - lo) / span) * 284;
  const ticks = [lo, (lo + hi) / 2, hi];
  return (
    <figure className="errbar">
      <svg viewBox="0 0 300 52" role="img" aria-label={`${t.log.measured}: ${measured.toFixed(2)} ± ${err.toFixed(2)}; ${expected !== null ? `${t.log.expectedLegend}: ${expected.toFixed(2)}` : ''}`}>
        <line x1="8" x2="292" y1="22" y2="22" className="errbar__axis" />
        <rect x={x(measured - err)} y="15" width={x(measured + err) - x(measured - err)} height="14" rx="7" className="errbar__band" />
        <circle cx={x(measured)} cy="22" r="5.5" className="errbar__dot" />
        {expected !== null && <line x1={x(expected)} x2={x(expected)} y1="8" y2="36" className="errbar__expected" />}
        {ticks.map((v, i) => (
          <text key={i} x={x(v)} y="49" className="errbar__tick" textAnchor={i === 0 ? 'start' : i === 2 ? 'end' : 'middle'}>
            {v.toFixed(1)}
          </text>
        ))}
      </svg>
      <figcaption className="errbar__legend">
        <span><i className="sw sw--band" />{t.log.errorLegend} ±1σ</span>
        {expected !== null && <span><i className="sw sw--expected" />{t.log.expectedLegend}</span>}
        <span>{t.log.perYear} · <Term id="properMotion" t={t} /></span>
      </figcaption>
    </figure>
  );
}
