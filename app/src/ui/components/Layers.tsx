// Reading layers 2 and 3. Layer 3 sets every number with its unit and
// uncertainty, and hangs its source in the margin beside it.
import type { IndexField } from '../../data/loader';
import type { UiDict } from '../../i18n/ui';
import type { FullManifest } from '../sky';
import { formatDate, seasonLabel } from '../sky';
import { Term } from './Term';

interface Props {
  t: UiDict;
  manifest: FullManifest;
  field: IndexField;
  det: number;
  season: number;
}

function Row({ label, value, source }: { label: React.ReactNode; value: React.ReactNode; source: React.ReactNode }) {
  return (
    <div className="nrow">
      <dt className="nrow__label">{label}</dt>
      <dd className="nrow__value">{value}</dd>
      <dd className="nrow__source">{source}</dd>
    </div>
  );
}

export function Layers({ t, manifest, field, det, season }: Props) {
  const m = manifest.target.measured;
  const e = manifest.target.expected;
  const L = t.layers;
  const pipe = `Sparks ${manifest.pipeline_version}`;
  const gen = `${manifest.generated_utc.replace('T', ' ').replace('Z', '')} UTC`;
  return (
    <section className="layers" aria-labelledby="layers-title">
      <h2 id="layers-title" className="h-section">{L.title}</h2>

      <div className="layer layer--2">
        <h3 className="h-layer">{L.l2Title}</h3>
        <p className="layer__prose">
          {L.l2}{' '}
          <span className="layer__terms">
            <Term id="spherex" t={t} /> · <Term id="infrared" t={t} /> · <Term id="stack" t={t} /> · <Term id="subtract" t={t} /> · <Term id="gaia" t={t} /> · <Term id="properMotion" t={t} />
          </span>
        </p>
      </div>

      <div className="layer layer--3">
        <h3 className="h-layer">{L.l3Title}</h3>
        <p className="layer__lead">{L.l3Intro}</p>
        <dl className="numbers">
          <div className="nrow nrow--head" aria-hidden="true">
            <span />
            <span />
            <span>{L.source}</span>
          </div>
          {m && (
            <>
              <Row
                label={<Term id="properMotion" t={t}>{L.rows.mu}</Term>}
                value={<><b className="num">{m.mu.toFixed(2)} ± {m.mu_err.toFixed(2)}</b> <span className="unit">{t.log.perYear}</span></>}
                source={`${pipe} · manifest.target.measured`}
              />
              <Row
                label={<Term id="positionAngle" t={t}>{L.rows.pa}</Term>}
                value={<><b className="num">{m.pa_deg.toFixed(1)} ± {m.pa_err_deg.toFixed(1)}</b> <span className="unit">°</span></>}
                source={`${pipe} · manifest.target.measured`}
              />
              <Row label={L.rows.fit} value={L.fitValue(m.n_points, m.detectors.join(', '), m.baseline_yr.toFixed(2))} source={pipe} />
              {m.parallax_removed_mas !== null && (
                <Row label={<Term id="parallax" t={t}>{L.rows.parallax}</Term>} value={L.parallaxValue(m.parallax_removed_mas.toFixed(0))} source={`Gaia DR3 ${manifest.target.source.id}`} />
              )}
            </>
          )}
          {e && (
            <>
              <Row
                label={<Term id="gaia" t={t}>{L.rows.gaia}</Term>}
                value={<><b className="num">{e.mu.toFixed(2)}</b> <span className="unit">{t.log.perYear}</span> · <b className="num">{e.pa_deg.toFixed(1)}</b><span className="unit">°</span></>}
                source={`${e.catalog} ${e.source_id}`}
              />
              {m && (
                <Row
                  label={<Term id="sigma" t={t}>{L.rows.agreement}</Term>}
                  value={<><b className="num">{(Math.abs(m.mu - e.mu) / m.mu_err).toFixed(1)}</b> <span className="unit">σ</span></>}
                  source="|μ − μ_cat| / σ_μ"
                />
              )}
            </>
          )}
          <Row label={L.rows.images} value={<b className="num">{field.n_frames}</b>} source="IRSA ObsTAP · index.json" />
          <Row label={<Term id="season" t={t}>{L.rows.seasons}</Term>} value={<b className="num">{manifest.seasons.length}</b>} source="manifest.seasons" />
          <Row label={<Term id="pixel" t={t}>{L.rows.pixel}</Term>} value={<><b className="num">{manifest.field.pixel_arcsec.toFixed(2)}</b> <span className="unit">″</span></>} source="SPHEREx L2" />
          <Row label={L.rows.fov} value={<><b className="num">{manifest.field.fov_arcmin.toFixed(2)}</b> <span className="unit">′</span></>} source="manifest.field" />
          <Row label={L.rows.pipeline} value={<span className="num">{manifest.pipeline_version}</span>} source="manifest.pipeline_version" />
          <Row label={L.rows.generated} value={<span className="num">{gen}</span>} source="manifest.generated_utc" />
        </dl>

        <h4 className="h-sub">
          {L.releasesTitle} · <Term id="release" t={t} /> · <Term id="doi" t={t} />
        </h4>
        <ul className="releases">
          {manifest.releases.map(r => (
            <li key={r.collection}>
              <span className="num">{L.releaseRow(r.release, r.n_frames, r.versions.join(', '))}</span>
              <a className="releases__doi" href={`https://doi.org/${r.doi}`} target="_blank" rel="noreferrer">
                DOI {r.doi}
              </a>
            </li>
          ))}
        </ul>

        <NoiseTable t={t} manifest={manifest} />
        <Flags t={t} manifest={manifest} det={det} season={season} />
        <Fingerprint t={t} manifest={manifest} />
      </div>
    </section>
  );
}

function NoiseTable({ t, manifest }: { t: UiDict; manifest: FullManifest }) {
  const L = t.layers;
  const rows = manifest.coadds.filter(c => c.season === 0);
  return (
    <>
      <h4 className="h-sub">{L.noiseTitle}</h4>
      <p className="layer__lead">{L.noiseIntro} <Term id="sigma" t={t} /></p>
      <div className="table-scroll" tabIndex={0} role="region" aria-label={L.noiseTitle}>
        <table className="ntable">
          <caption className="sr-only">{L.noiseTitle} · {seasonLabel(manifest.seasons[0].start, t.months)}</caption>
          <thead>
            <tr>{L.noiseCols.map(c => <th key={c} scope="col">{c}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map(c => (
              <tr key={c.i}>
                <th scope="row">D{c.det}</th>
                <td>{seasonLabel(manifest.seasons[c.season].start, t.months)}</td>
                <td>{c.n_frames}</td>
                <td>{c.sigma_single.toFixed(4)}</td>
                <td>{c.sigma_coadd.toFixed(4)}</td>
                <td>×{c.snr_gain.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Flags({ t, manifest, det, season }: { t: UiDict; manifest: FullManifest; det: number; season: number }) {
  const L = t.layers;
  const frames = manifest.frames.filter(f => f.det === det && f.season === season);
  const totals: Record<string, number> = {};
  let pix = 0;
  for (const f of frames) {
    pix += f.pix_total;
    for (const [k, v] of Object.entries(f.flag_pixels)) totals[k] = (totals[k] ?? 0) + v;
  }
  const list = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const s = manifest.seasons[season];
  return (
    <>
      <h4 className="h-sub">
        {L.flagsTitle} · <Term id="flags" t={t} />
      </h4>
      <p className="layer__lead">
        {L.flagsIntro(det, `${formatDate(s.start, t.months)} – ${formatDate(s.end, t.months)}`)} {L.flagsNote}
      </p>
      <ul className="flags">
        {list.map(([k, v]) => {
          const pct = pix ? (v / pix) * 100 : 0;
          return (
            <li key={k} className={k === 'SOURCE' ? 'flags__benign' : undefined}>
              <span className="flags__name">{k}</span>
              <span className="flags__bar" aria-hidden="true">
                <span style={{ width: `${Math.max(0.6, Math.min(100, pct))}%` }} />
              </span>
              <span className="flags__pct num">{pct < 0.1 ? '<0.1' : pct.toFixed(1)}%</span>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function Fingerprint({ t, manifest }: { t: UiDict; manifest: FullManifest }) {
  const L = t.layers;
  const spec = manifest.target.spectrum;
  // 17 channels per detector, binned by wavelength across that detector's range.
  const cells: { det: number; ch: number; lam: number; state: 'sat' | 'good' | 'empty' }[] = [];
  for (let det = 1; det <= 6; det++) {
    const pts = spec.filter(p => p.det === det);
    if (!pts.length) {
      for (let ch = 1; ch <= 17; ch++) cells.push({ det, ch, lam: Number.NaN, state: 'empty' });
      continue;
    }
    const lo = Math.min(...pts.map(p => p.lam));
    const hi = Math.max(...pts.map(p => p.lam));
    for (let ch = 1; ch <= 17; ch++) {
      const a = lo + ((hi - lo) * (ch - 1)) / 17;
      const b = lo + ((hi - lo) * ch) / 17;
      const inBin = pts.filter(p => p.lam >= a && (ch === 17 ? p.lam <= b : p.lam < b));
      const state = !inBin.length ? 'empty' : inBin.some(p => p.good) ? 'good' : 'sat';
      cells.push({ det, ch, lam: (a + b) / 2, state });
    }
  }
  const sat = spec.filter(p => p.sat).length;
  const stateLabel = (s: string) => (s === 'sat' ? L.fingerprintLegendSat : s === 'good' ? L.fingerprintLegendGood : L.fingerprintLegendEmpty);
  return (
    <>
      <h4 className="h-sub">
        {L.fingerprintTitle} · <Term id="wavelength" t={t} />
      </h4>
      <p className="layer__lead">{L.fingerprintIntro}</p>
      <div className="fp" role="img" aria-label={`${L.fingerprintTitle}. ${L.fingerprintSat(sat, spec.length)}`}>
        {[1, 2, 3, 4, 5, 6].map(det => (
          <div key={det} className="fp__row">
            <span className="fp__det" title={(() => { const c = manifest.coadds.find(x => x.det === det); return c ? `${c.lam_min.toFixed(2)}–${c.lam_max.toFixed(2)} µm` : ''; })()}>D{det}</span>
            {cells
              .filter(c => c.det === det)
              .map(c => (
                <span
                  key={c.ch}
                  className={`fp__cell fp__cell--${c.state}`}
                  title={L.fingerprintAria(c.det, c.ch, Number.isFinite(c.lam) ? c.lam.toFixed(2) : '–', stateLabel(c.state))}
                />
              ))}
          </div>
        ))}
        <div className="fp__axis" aria-hidden="true">
          <span>← λ</span>
          <span>λ →</span>
        </div>
      </div>
      <p className="fp__legend">
        <span><i className="fp__cell fp__cell--sat" />{L.fingerprintLegendSat}</span>
        <span><i className="fp__cell fp__cell--good" />{L.fingerprintLegendGood}</span>
        <span><i className="fp__cell fp__cell--empty" />{L.fingerprintLegendEmpty}</span>
      </p>
      <p className="layer__honest">{L.fingerprintSat(sat, spec.length)} <Term id="saturated" t={t} /></p>
    </>
  );
}
