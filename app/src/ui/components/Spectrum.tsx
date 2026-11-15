// Spectrum on the fly. The person picks a point on the stage (click, or the
// buttons here for keyboard) and this panel measures it on every single
// exposure of the field. The single exposures are fetched only when asked for.
import { useEffect, useMemo, useState } from 'react';
import type { ShellDict } from '../../i18n/shell';
import { apertureSpectrum, summarizeSpectrum, type SpectrumFrame } from '../../core/spectrum';
import { N, loadFrames, type FrameCubes, type FullManifest } from '../sky';

interface Props {
  shell: ShellDict;
  base: string;
  fieldId: string;
  /** Carpeta del índice que trae el campo (data-sample o data-new) */
  folder: 'data-sample' | 'data-new';
  manifest: FullManifest;
  /** Season shown on the stage: the target's position is taken from it */
  season: number;
  pick: { x: number; y: number } | null;
  onPick: (p: { x: number; y: number } | null) => void;
}

type Load = { status: 'idle' } | { status: 'loading' } | { status: 'ready'; cubes: FrameCubes } | { status: 'error' };

const W = 640;
const H = 250;
const M = { l: 58, r: 12, t: 22, b: 38 };

function quantile(sorted: number[], q: number) {
  if (!sorted.length) return 0;
  const i = Math.min(sorted.length - 1, Math.max(0, Math.round(q * (sorted.length - 1))));
  return sorted[i];
}

function niceStep(span: number, target: number) {
  const raw = span / target;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = raw / pow;
  return (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * pow;
}

export function Spectrum({ shell, base, fieldId, folder, manifest, season, pick, onPick }: Props) {
  const L = shell.spec;
  const [load, setLoad] = useState<Load>({ status: 'idle' });

  // a new field starts clean
  useEffect(() => setLoad({ status: 'idle' }), [fieldId, folder]);

  useEffect(() => {
    if (!pick || load.status !== 'idle') return;
    let alive = true;
    setLoad({ status: 'loading' });
    loadFrames(base, fieldId, folder)
      .then(cubes => alive && setLoad({ status: 'ready', cubes }))
      .catch(() => alive && setLoad({ status: 'error' }));
    return () => {
      alive = false;
    };
    // load.status is read, not a trigger: the fetch starts once per field
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pick, base, fieldId, folder]);

  const meta = useMemo<SpectrumFrame[]>(
    () =>
      manifest.frames
        .filter(f => typeof f.sigma === 'number' && Number.isFinite(f.sigma) && f.sigma > 0)
        .map(f => ({ i: f.i, det: f.det, season: f.season, lam: f.lam, sigma: f.sigma as number })),
    [manifest],
  );

  const samples = useMemo(() => {
    if (!pick || load.status !== 'ready') return null;
    return apertureSpectrum(load.cubes.frames, load.cubes.masks, meta, N, pick.x, pick.y, manifest.field.pixel_arcsec);
  }, [pick, load, meta, manifest]);
  const summary = useMemo(() => (samples ? summarizeSpectrum(samples) : null), [samples]);

  const targetNow = manifest.target.points.find(p => p.season === season) ?? manifest.target.points[0];
  const centre = { x: (N - 1) / 2, y: (N - 1) / 2 };
  const nudge = (dx: number, dy: number) => {
    if (!pick) return;
    onPick({ x: Math.max(0, Math.min(N - 1, Math.round(pick.x) + dx)), y: Math.max(0, Math.min(N - 1, Math.round(pick.y) + dy)) });
  };

  let chart: React.ReactNode = null;
  if (samples && summary && summary.ok > 0) {
    const good = samples.filter(s => s.flux !== null) as (typeof samples[number] & { flux: number })[];
    const lams = samples.map(s => s.lam);
    const x0 = Math.min(...lams);
    const x1 = Math.max(...lams);
    const sorted = good.map(s => s.flux).sort((a, b) => a - b);
    const lo = Math.min(0, quantile(sorted, 0.02));
    const hiRaw = quantile(sorted, 0.98);
    const hi = hiRaw > lo ? hiRaw + (hiRaw - lo) * 0.12 : lo + 1;
    const px = (lam: number) => M.l + ((lam - x0) / (x1 - x0 || 1)) * (W - M.l - M.r);
    const py = (v: number) => H - M.b - ((Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo)) * (H - M.t - M.b);
    const step = niceStep(hi - lo, 4);
    const yTicks: number[] = [];
    for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) yTicks.push(Number(v.toPrecision(10)));
    const xTicks: number[] = [];
    for (let v = Math.ceil(x0); v <= x1; v += 1) xTicks.push(v);
    const digits = step >= 1 ? 0 : Math.min(4, Math.ceil(-Math.log10(step)));
    const dets = Array.from(new Set(samples.map(s => s.det))).sort((a, b) => a - b);
    chart = (
      <svg className="spec__chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={L.chartLabel(summary.ok, x0.toFixed(2), x1.toFixed(2))}>
        {dets.map((d, k) => {
          const ls = samples.filter(s => s.det === d).map(s => s.lam);
          const a = px(Math.min(...ls));
          const b = px(Math.max(...ls));
          return (
            <g key={d}>
              {k % 2 === 0 && <rect x={a} y={M.t} width={Math.max(1, b - a)} height={H - M.t - M.b} className="spec__band" />}
              <text x={(a + b) / 2} y={M.t - 7} className="spec__det">D{d}</text>
            </g>
          );
        })}
        {yTicks.map(v => (
          <g key={v}>
            <line x1={M.l} x2={W - M.r} y1={py(v)} y2={py(v)} className={v === 0 ? 'spec__zero' : 'spec__grid'} />
            <text x={M.l - 8} y={py(v) + 4} className="spec__tick spec__tick--y">{v.toFixed(digits)}</text>
          </g>
        ))}
        {xTicks.map(v => (
          <g key={v}>
            <line x1={px(v)} x2={px(v)} y1={H - M.b} y2={H - M.b + 5} className="spec__axis" />
            <text x={px(v)} y={H - M.b + 18} className="spec__tick">{v}</text>
          </g>
        ))}
        <line x1={M.l} x2={W - M.r} y1={H - M.b} y2={H - M.b} className="spec__axis" />
        <line x1={M.l} x2={M.l} y1={M.t} y2={H - M.b} className="spec__axis" />
        {good.map((s, i) => (
          <circle key={i} cx={px(s.lam)} cy={py(s.flux)} r={2.2} className="spec__dot" />
        ))}
        <text x={(M.l + W - M.r) / 2} y={H - 4} className="spec__label">{L.axisX}</text>
        <text x={14} y={(M.t + H - M.b) / 2} className="spec__label" transform={`rotate(-90 14 ${(M.t + H - M.b) / 2})`}>{L.axisY}</text>
      </svg>
    );
  }

  return (
    <section className="spec" aria-labelledby="spec-t">
      <h3 id="spec-t" className="spec__title">{L.title}</h3>
      <p className="spec__lead">{L.lead}</p>
      <div className="spec__row">
        {targetNow && (
          <button type="button" className="chip" onClick={() => onPick({ x: targetNow.x, y: targetNow.y })}>{L.measureTarget}</button>
        )}
        <button type="button" className="chip" onClick={() => onPick(centre)}>{L.measureCentre}</button>
        {pick && (
          <>
            <span className="spec__nudge" role="group" aria-label={L.nudge}>
              <button type="button" className="chip" onClick={() => nudge(-1, 0)} aria-label={`${L.nudge}: ${L.nudgeDir.left}`}>←</button>
              <button type="button" className="chip" onClick={() => nudge(0, 1)} aria-label={`${L.nudge}: ${L.nudgeDir.up}`}>↑</button>
              <button type="button" className="chip" onClick={() => nudge(0, -1)} aria-label={`${L.nudge}: ${L.nudgeDir.down}`}>↓</button>
              <button type="button" className="chip" onClick={() => nudge(1, 0)} aria-label={`${L.nudge}: ${L.nudgeDir.right}`}>→</button>
            </span>
            <button type="button" className="chip" onClick={() => onPick(null)}>{L.clear}</button>
          </>
        )}
      </div>
      <div aria-live="polite">
        {pick && load.status === 'loading' && <p className="hint">{L.loading(manifest.frames.length)}</p>}
        {pick && load.status === 'error' && <p className="err" role="alert">{L.failed}</p>}
        {pick && summary && (
          <p className="spec__counts">
            <span className="num">{L.at(pick.x.toFixed(1), pick.y.toFixed(1))}</span> · {L.counts(summary.ok, summary.total)}{' '}
            {summary.ok < summary.total && L.lost(summary.saturated, summary.flagged, summary.edge)}
          </p>
        )}
        {pick && summary && summary.ok === 0 && <p className="hint">{L.none}</p>}
      </div>
      {chart}
      {summary && summary.byDetector.length > 0 && (
        <details className="spec__table">
          <summary>{L.table}</summary>
          <table className="numtable">
            <thead>
              <tr>{L.tableCols.map(c => <th key={c} scope="col">{c}</th>)}</tr>
            </thead>
            <tbody>
              {summary.byDetector.map(d => (
                <tr key={d.det}>
                  <th scope="row">D{d.det}</th>
                  <td className="num">{d.lamMin.toFixed(2)} – {d.lamMax.toFixed(2)}</td>
                  <td className="num">{d.n}</td>
                  <td className="num">{d.median.toPrecision(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}
      {pick && summary && <p className="hint spec__caveat">{L.caveat}</p>}
    </section>
  );
}
