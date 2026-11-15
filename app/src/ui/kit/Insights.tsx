// Charts that answer one question each. The heading IS the answer; the chart
// shows it with labels on the marks (no legend hunting); a kid line follows.
import { estadoMovimiento } from '../../core/movimiento';
import type { Lang } from '../../core/urlState';
import type { IndexField } from '../../data/loader';
import type { UiDict } from '../../i18n/ui';
import { INSIGHTS } from '../../i18n/insights';
import { Term } from '../components/Term';
import type { FullManifest } from '../sky';
import { useVeredicto } from './useVeredicto';
import { useClase } from '../../core/clasificador';

interface Props {
  lang: Lang;
  t: UiDict;
  manifest: FullManifest;
  field: IndexField;
  det: number;
  season: number;
}

function compassWord(pa: number, dirs: string[]) {
  return dirs[Math.round((((pa % 360) + 360) % 360) / 45) % 8];
}

export function Insights({ lang, t, manifest: m, field, det, season }: Props) {
  const L = INSIGHTS[lang];
  const fit = m.target.measured;
  const exp = m.target.expected;
  const mov = estadoMovimiento(fit, field?.status);
  return (
    <section className="insights" aria-labelledby="ins-title">
      <h2 id="ins-title" className="insights__title">{L.title}</h2>
      <div className="insights__grid">
        <ManifestNotice field={field} manifest={m} L={L} />
        <Verdict field={field} lang={lang} t={t} />
        <ClassifierPanel field={field} lang={lang} L={L} />
        {fit && exp && mov === 'detectado' && <Motion L={L} mu={fit.mu} err={fit.mu_err} exp={exp.mu} cat={exp.catalog} px={fit.mu / m.field.pixel_arcsec} t={t} />}
        {fit && mov === 'detectado' && <Direction L={L} pa={fit.pa_deg} paErr={fit.pa_err_deg} t={t} />}
        {fit && mov === 'cota' && (
          <figure className="insight insight--wide">
            <figcaption className="insight__say">{L.motion.bound(fit.mu.toFixed(2), fit.mu_err.toFixed(2), exp?.catalog ?? '', exp ? exp.mu.toFixed(2) : '')}</figcaption>
          </figure>
        )}
        <Noise L={L} m={m} t={t} />
        <Color L={L} m={m} t={t} />
        <Quality L={L} m={m} det={det} season={season} t={t} />
        <figure className="insight insight--data">
          <figcaption className="insight__say">{L.data.say(field.n_frames, m.seasons.length, m.releases.map(r => r.release).join(' + '))}</figcaption>
          <ul className="doi-list">
            {m.releases.map(r => (
              <li key={r.collection}>
                <b>{r.release}</b> · {r.n_frames} · {r.versions.join(', ')} ·{' '}
                <a href={`https://doi.org/${r.doi}`} target="_blank" rel="noreferrer">DOI {r.doi}</a>
              </li>
            ))}
          </ul>
          <p className="insight__src">{L.sourceLine(`NASA/IPAC IRSA · Sparks ${m.pipeline_version} · ${m.generated_utc.slice(0, 10)}`)}</p>
        </figure>
      </div>
      <details className="allnums">
        <summary>{L.all}</summary>
        <AllNumbers L={L} m={m} field={field} t={t} />
      </details>
    </section>
  );
}

type L = (typeof INSIGHTS)['es'];

function Verdict({ field, lang, t }: { field: IndexField; lang: Lang; t: UiDict }) {
  const v = useVeredicto(field, lang);
  if (!v) return null;
  const es = lang === 'es';
  return (
    <figure className="insight insight--wide insight--verdict">
      <figcaption className="insight__say">
        <span>{t.verdict.title}:</span> <b>{v.clase}</b>
      </figcaption>
      <p className="insight__body" style={{ marginTop: '0.4rem', lineHeight: '1.4' }}>
        {v.razon}
      </p>
      {v.faltan.length > 0 && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.88rem', opacity: 0.9 }}>
          <span style={{ fontWeight: 600 }}>{es ? 'Datos pendientes:' : 'Pending data:'}</span>
          <ul style={{ margin: '0.25rem 0 0 1.2rem', padding: 0 }}>
            {v.faltan.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="insight__src">{t.verdict.ruleNote}</p>
    </figure>
  );
}

function ManifestNotice({
  field,
  manifest: m,
  L,
}: {
  field: IndexField;
  manifest: FullManifest;
  L: L;
}) {
  const isParcial = field.status === 'parcial' || m.status === 'parcial';
  const caveats = m.caveats ?? [];
  const blockers = m.blockers ?? [];
  const hasCaveats = caveats.length > 0;
  const hasBlockers = blockers.length > 0;

  if (!isParcial && !hasCaveats && !hasBlockers) return null;

  return (
    <figure
      className={`insight insight--wide insight--caveat ${isParcial ? 'is-parcial' : ''}`}
      style={{
        borderColor: isParcial ? '#ffb238' : undefined,
        background: isParcial ? 'rgba(255, 178, 56, 0.05)' : undefined,
      }}
    >
      <figcaption className="insight__say" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, color: isParcial ? 'var(--now-ink)' : 'inherit' }}>
          {isParcial ? `[${L.manifestStatus.partialBadge.toUpperCase()}]` : `[${L.manifestStatus.okBadge.toUpperCase()}]`}
        </span>
        {field.reason && <span>{field.reason}</span>}
      </figcaption>

      {isParcial && (
        <p className="insight__body" style={{ marginTop: '0.4rem', fontStyle: 'italic', opacity: 0.9 }}>
          {L.manifestStatus.partialNotice}
        </p>
      )}

      {hasCaveats && (
        <div style={{ marginTop: '0.6rem' }}>
          <b style={{ fontSize: '0.9rem', color: 'var(--now-ink)' }}>{L.manifestStatus.caveatsTitle}:</b>
          <ul style={{ margin: '0.3rem 0 0 1.2rem', padding: 0, fontSize: '0.88rem', lineHeight: '1.45' }}>
            {caveats.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {hasBlockers && (
        <div style={{ marginTop: '0.6rem' }}>
          <b style={{ fontSize: '0.9rem', opacity: 0.85 }}>{L.manifestStatus.blockersTitle}:</b>
          <ul style={{ margin: '0.3rem 0 0 1.2rem', padding: 0, fontSize: '0.88rem', lineHeight: '1.4' }}>
            {blockers.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      )}
    </figure>
  );
}

function ClassifierPanel({ field, lang, L }: { field: IndexField; lang: Lang; L: L }) {
  const c = useClase(field, lang);
  if (!c) return null;
  const es = lang === 'es';

  const classNames: Record<string, string> = {
    estrella: es ? 'estrella' : 'star',
    'enana marron': es ? 'enana marrón' : 'brown dwarf',
    'enana blanca': es ? 'enana blanca' : 'white dwarf',
    variable: es ? 'objeto variable' : 'variable object',
  };

  const candidateText = L.classifier.candidate(classNames[c.claseML] ?? c.claseML);
  const probPct = (c.mejorProbabilidad * 100).toFixed(1);

  return (
    <figure className="insight insight--wide insight--classifier">
      <figcaption className="insight__say">
        <span>{L.classifier.title}:</span> <b>{candidateText}</b>
        {!c.decididoPorImagen && (
          <span style={{ marginLeft: '0.5rem', fontWeight: 400, opacity: 0.9 }}>
            ({L.classifier.probability(probPct)})
          </span>
        )}
      </figcaption>

      <p className="insight__body" style={{ marginTop: '0.4rem', lineHeight: '1.4' }}>
        {c.decididoPorImagen ? (
          <span>{L.classifier.imageVariable}</span>
        ) : c.coinciden ? (
          <span style={{ color: 'var(--ok)' }}>{L.classifier.agreement}</span>
        ) : (
          <span style={{ color: 'var(--now-ink)' }}>{c.discrepanciaNota}</span>
        )}
      </p>

      {/* Mandatory visible disclaimer */}
      <div
        style={{
          marginTop: '0.5rem',
          padding: '0.35rem 0.6rem',
          background: 'rgba(255, 178, 56, 0.08)',
          borderRadius: '4px',
          borderLeft: '3px solid #ffb238',
        }}
      >
        <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.02em' }}>
          "{c.disclaimer}"
        </span>
      </div>

      {/* Probabilities breakdown */}
      <div style={{ marginTop: '0.6rem', fontSize: '0.85rem' }}>
        <span style={{ fontWeight: 600, opacity: 0.85 }}>{L.classifier.breakdown}:</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.4rem', marginTop: '0.3rem' }}>
          {Object.entries(c.probabilidades).map(([clase, prob]) => (
            <div key={clase} style={{ padding: '0.25rem 0.4rem', background: 'rgba(255,255,255,0.04)', borderRadius: '3px' }}>
              <span style={{ opacity: 0.75 }}>{classNames[clase] ?? clase}:</span>{' '}
              <b>{(prob * 100).toFixed(1)}%</b>
            </div>
          ))}
        </div>
      </div>

      <p className="insight__src" style={{ marginTop: '0.5rem' }}>
        {L.classifier.limitNote}
      </p>
    </figure>
  );
}

function Motion({ L, mu, err, exp, cat, px, t }: { L: L; mu: number; err: number; exp: number; cat: string; px: number; t: UiDict }) {
  const max = Math.ceil(Math.max(mu + err, exp) + 1);
  const x = (v: number) => 20 + (v / max) * 560;
  const agree = Math.abs(mu - exp) <= 2 * err;
  return (
    <figure className="insight insight--wide">
      <figcaption className="insight__say">
        {L.motion.say(mu.toFixed(2), err.toFixed(2), cat, exp.toFixed(2))} <span className={agree ? 'ok' : 'warn'}>{agree ? L.motion.agree : L.motion.disagree}</span>
      </figcaption>
      <svg className="chart" viewBox="0 0 600 120" role="img" aria-label={L.motion.say(mu.toFixed(2), err.toFixed(2), cat, exp.toFixed(2))}>
        <line x1="20" x2="580" y1="70" y2="70" className="c-axis" />
        {Array.from({ length: max + 1 }, (_, v) => (
          <g key={v}>
            <line x1={x(v)} x2={x(v)} y1="66" y2="74" className="c-axis" />
            <text x={x(v)} y="94" className="c-tick">{v}</text>
          </g>
        ))}
        <text x="20" y="116" className="c-tick" style={{ textAnchor: 'start' }}>{L.motion.perYear}</text>
        <rect x={x(mu - err)} y="58" width={x(mu + err) - x(mu - err)} height="24" rx="12" className="c-band" />
        <circle cx={x(mu)} cy="70" r="9" className="c-now" />
        <line x1={x(exp)} x2={x(exp)} y1="40" y2="86" className="c-ref" />
        <text x={x(mu)} y="46" className="c-lbl c-lbl--now" textAnchor="end" dx="-14">{L.motion.sparks} {mu.toFixed(2)}</text>
        <text x={x(exp)} y="22" className="c-lbl" textAnchor={x(exp) > 460 ? 'end' : 'start'} dx={x(exp) > 460 ? -8 : 8}>{cat} {exp.toFixed(2)}</text>
      </svg>
      <p className="insight__kid">
        <span className="swatch swatch--band" aria-hidden="true" /> ± {err.toFixed(2)} = {L.motion.band}. {L.motion.kid(px.toFixed(1))} <Term id="properMotion" t={t} />
      </p>
    </figure>
  );
}

function Direction({ L, pa, paErr, t }: { L: L; pa: number; paErr: number; t: UiDict }) {
  const c = 80;
  const R = 56;
  const pt = (d: number, r: number) => [c - r * Math.sin((d * Math.PI) / 180), c - r * Math.cos((d * Math.PI) / 180)] as const;
  const [hx, hy] = pt(pa, R);
  const [bx, by] = pt(pa + 180, 22);
  const w1 = pt(pa - paErr, R + 8);
  const w2 = pt(pa + paErr, R + 8);
  return (
    <figure className="insight insight--dir">
      <figcaption className="insight__say">{L.direction.say(compassWord(pa, L.direction.dirs), pa.toFixed(0))}</figcaption>
      <svg className="chart chart--compass" viewBox="0 0 160 160" role="img" aria-label={L.direction.say(compassWord(pa, L.direction.dirs), pa.toFixed(1))}>
        <circle cx={c} cy={c} r={R + 14} className="c-ring" />
        <text x={c} y="10" className="c-card">N</text>
        <text x={c} y="158" className="c-card">S</text>
        <text x="6" y={c + 4} className="c-card">E</text>
        <text x="154" y={c + 4} className="c-card">{L.direction.dirs[6][0].toUpperCase()}</text>
        <path d={`M${c} ${c} L${w1[0]} ${w1[1]} A${R + 8} ${R + 8} 0 0 1 ${w2[0]} ${w2[1]} Z`} className="c-wedge" />
        <line x1={bx} y1={by} x2={hx} y2={hy} className="c-arrow" />
        <circle cx={bx} cy={by} r="7" className="c-before" />
        <circle cx={hx} cy={hy} r="9" className="c-now" />
      </svg>
      <p className="insight__kid">{L.direction.kid} <Term id="positionAngle" t={t} /></p>
    </figure>
  );
}

function Noise({ L, m, t }: { L: L; m: FullManifest; t: UiDict }) {
  const rows = m.coadds.filter(c => c.season === 0);
  const max = Math.max(...rows.map(r => r.sigma_single));
  const best = Math.max(...rows.map(r => r.snr_gain));
  return (
    <figure className="insight">
      <figcaption className="insight__say">{L.noise.say(best.toFixed(1))}</figcaption>
      <div className="bars" role="img" aria-label={L.noise.say(best.toFixed(1))}>
        <div className="bars__key" aria-hidden="true">
          <span><i className="k k--one" />{L.noise.one}</span>
          <span><i className="k k--stack" />{L.noise.stack}</span>
        </div>
        {rows.map(r => (
          <div key={r.i} className="bars__row">
            <span className="bars__det">D{r.det}</span>
            <span className="bars__pair">
              <span className="bar bar--one" style={{ width: `${(r.sigma_single / max) * 100}%` }} />
              <span className="bar bar--stack" style={{ width: `${(r.sigma_coadd / max) * 100}%` }} />
            </span>
            <span className="bars__x">×{r.snr_gain.toFixed(1)}</span>
          </div>
        ))}
      </div>
      <p className="insight__kid">{L.noise.kid} <Term id="stack" t={t} /></p>
    </figure>
  );
}

function Color({ L, m, t }: { L: L; m: FullManifest; t: UiDict }) {
  const sp = m.target.spectrum;
  const sat = sp.filter(p => p.sat).length;
  const ok = sp.filter(p => p.good).length;
  const none = sp.length - sat - ok;
  const pct = (n: number) => (n / sp.length) * 100;
  return (
    <figure className="insight">
      <figcaption className="insight__say">{L.color.say(sat, sp.length)}</figcaption>
      <div className="stack" role="img" aria-label={`${sat} ${L.color.sat}, ${ok} ${L.color.ok}, ${none} ${L.color.none}`}>
        <span className="stack__seg stack__seg--sat" style={{ width: `${pct(sat)}%` }}>{sat} {L.color.sat}</span>
        {ok > 0 && <span className="stack__seg stack__seg--ok" style={{ width: `${pct(ok)}%` }} />}
        {none > 0 && <span className="stack__seg stack__seg--none" style={{ width: `${Math.max(1.5, pct(none))}%` }} />}
      </div>
      <p className="stack__legend">
        <span>{ok} {L.color.ok}</span> · <span>{none} {L.color.none}</span>
      </p>
      <p className="insight__kid">{L.color.kid} <Term id="saturated" t={t} /></p>
    </figure>
  );
}

function Quality({ L, m, det, season, t }: { L: L; m: FullManifest; det: number; season: number; t: UiDict }) {
  const frames = m.frames.filter(f => f.det === det && f.season === season);
  const tot: Record<string, number> = {};
  let flagged = 0;
  for (const f of frames) for (const [k, v] of Object.entries(f.flag_pixels)) {
    tot[k] = (tot[k] ?? 0) + v;
    flagged += v;
  }
  const src = tot.SOURCE ?? 0;
  const problems = Object.entries(tot)
    .filter(([k]) => k !== 'SOURCE')
    .sort((a, b) => b[1] - a[1]);
  const bad = problems.reduce((a, [, v]) => a + v, 0);
  const pc = (v: number) => (flagged ? (v / flagged) * 100 : 0);
  const fmt = (v: number) => `${pc(v) < 1 ? pc(v).toFixed(1) : Math.round(pc(v))}%`;
  return (
    <figure className="insight">
      <figcaption className="insight__say">{L.quality.say(fmt(src), fmt(bad))}</figcaption>
      <div className="stack" role="img" aria-label={L.quality.say(fmt(src), fmt(bad))}>
        <span className="stack__seg stack__seg--star" style={{ width: `${pc(src)}%` }}>{fmt(src)} {L.quality.star}</span>
        <span className="stack__seg stack__seg--bad" style={{ width: `${Math.max(2, pc(bad))}%` }} />
      </div>
      <ul className="probs">
        {problems.slice(0, 4).map(([k, v]) => (
          <li key={k}>
            <span>{L.quality.names[k] ?? k}</span>
            <b>{fmt(v)}</b>
          </li>
        ))}
      </ul>
      <p className="insight__kid">{L.quality.kid} <Term id="flags" t={t} /> · D{det}</p>
    </figure>
  );
}

function AllNumbers({ L, m, field, t }: { L: L; m: FullManifest; field: IndexField; t: UiDict }) {
  const fit = m.target.measured;
  const exp = m.target.expected;
  const pipe = `Sparks ${m.pipeline_version}`;
  const rows: [string, string, string][] = [];
  if (fit) {
    rows.push([t.layers.rows.mu, `${fit.mu.toFixed(2)} ± ${fit.mu_err.toFixed(2)} ${t.log.perYear}`, pipe]);
    rows.push([t.layers.rows.pa, `${fit.pa_deg.toFixed(1)} ± ${fit.pa_err_deg.toFixed(1)}°`, pipe]);
    rows.push([t.layers.rows.fit, t.layers.fitValue(fit.n_points, fit.detectors.join(', '), fit.baseline_yr.toFixed(2)), pipe]);
    if (fit.parallax_removed_mas !== null) rows.push([t.layers.rows.parallax, t.layers.parallaxValue(fit.parallax_removed_mas.toFixed(0)), `Gaia DR3 ${m.target.source.id}`]);
  }
  if (exp) rows.push([t.layers.rows.gaia, `${exp.mu.toFixed(2)} ${t.log.perYear} · ${exp.pa_deg.toFixed(1)}°`, `${exp.catalog} ${exp.source_id}`]);
  rows.push([t.layers.rows.images, String(field.n_frames), 'IRSA ObsTAP']);
  rows.push([t.layers.rows.pixel, `${m.field.pixel_arcsec.toFixed(2)}″`, 'SPHEREx L2']);
  rows.push([t.layers.rows.fov, `${m.field.fov_arcmin.toFixed(2)}′`, 'manifest.field']);
  rows.push([t.layers.rows.generated, `${m.generated_utc.replace('T', ' ').replace('Z', '')} UTC`, pipe]);
  return (
    <table className="numtable">
      <thead>
        <tr>
          <th scope="col" />
          <th scope="col" />
          <th scope="col">{L.source}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([a, b, c]) => (
          <tr key={a}>
            <th scope="row">{a}</th>
            <td className="num">{b}</td>
            <td className="src">{c}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
