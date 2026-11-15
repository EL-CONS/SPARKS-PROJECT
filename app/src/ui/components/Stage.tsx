// The sky stage: six detector panels (or one enlarged). Blink shows the
// season coadd PNGs as rendered by the pipeline; Stack and Subtract are drawn
// from the raw cubes on a canvas. Marks live in an SVG layer above the pixels.
import { useEffect, useMemo, useRef } from 'react';
import type { ViewMode, DetectorSelection } from '../../core/urlState';
import type { PlateAsset } from '../../data/loader';
import type { UiDict } from '../../i18n/ui';
import { IconExpand, IconGrid } from './Icons';
import { Term } from './Term';
import {
  N,
  type Cubes,
  type FullManifest,
  type GaiaSource,
  DIFF_CLIP,
  diffColor,
  paintDiff,
  paintGray,
  stackDetector,
  seasonLabel,
} from '../sky';

interface StageProps {
  t: UiDict;
  manifest: FullManifest;
  plates: PlateAsset[];
  cubes: Cubes | null;
  mode: ViewMode;
  frame: number;
  pair: [number, number];
  det: DetectorSelection;
  onDet: (d: DetectorSelection) => void;
  showMarks: boolean;
  showGaia: boolean;
  gaia: GaiaSource[];
}

const DETS = [1, 2, 3, 4, 5, 6];

function CanvasPanel({ draw, label }: { draw: (ctx: CanvasRenderingContext2D) => void; label: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (ctx) draw(ctx);
  }, [draw]);
  return <canvas ref={ref} width={N} height={N} className="panel__pixels" role="img" aria-label={label} />;
}

function Marks({ manifest, det, mode, frame, pair, showGaia, gaia }: Pick<StageProps, 'manifest' | 'mode' | 'frame' | 'pair' | 'showGaia' | 'gaia'> & { det: number }) {
  const pts = manifest.target.points.filter(p => p.det === det);
  const at = (s: number) => pts.find(p => p.season === s);
  // In blink the live season is "now"; the first season is the "before" reference.
  const nowSeason = mode === 'diff' ? pair[1] : frame;
  const beforeSeason = mode === 'diff' ? pair[0] : 0;
  const now = at(nowSeason);
  const before = at(beforeSeason);
  const sx = (x: number) => x + 0.5;
  const sy = (y: number) => N - 0.5 - y;
  return (
    <svg className="panel__marks" viewBox={`0 0 ${N} ${N}`} aria-hidden="true">
      {showGaia &&
        gaia
          .filter(g => g.x >= 0 && g.x < N && g.y >= 0 && g.y < N)
          .map(g => <circle key={g.id} cx={sx(g.x)} cy={sy(g.y)} r={1.6} className="mark-gaia" />)}
      {mode !== 'stack' && before && now && before.season !== now.season && (
        <circle cx={sx(before.x)} cy={sy(before.y)} r={7} className="mark-before" />
      )}
      {mode !== 'stack' && now && <circle cx={sx(now.x)} cy={sy(now.y)} r={7} className="mark-now" />}
    </svg>
  );
}

export function Stage(props: StageProps) {
  const { t, manifest, plates, cubes, mode, frame, pair, det, onDet, showMarks, showGaia, gaia } = props;
  const seasons = manifest.seasons;
  const months = t.months;
  const modeName = mode === 'blink' ? t.modes.blink : mode === 'stack' ? t.modes.stack : t.modes.diff;

  const stacks = useMemo(() => {
    if (!cubes) return null;
    const out: Record<number, Float32Array> = {};
    for (const d of DETS) out[d] = stackDetector(manifest, cubes, d);
    return out;
  }, [cubes, manifest]);

  const visible = det === 'all' ? DETS : [det];
  const when =
    mode === 'blink'
      ? seasonLabel(seasons[frame]?.start ?? '', months)
      : mode === 'stack'
        ? `${seasonLabel(seasons[0].start, months)} – ${seasonLabel(seasons[seasons.length - 1].start, months)}`
        : `${seasonLabel(seasons[pair[1]].start, months)} − ${seasonLabel(seasons[pair[0]].start, months)}`;

  return (
    <div className={`stage stage--${mode}${det === 'all' ? '' : ' stage--single'}`}>
      <ol className="stage__grid">
        {visible.map(d => {
          const coadd = manifest.coadds.find(c => c.det === d && c.season === frame);
          const plate = plates.find(p => p.det === d && p.season === frame);
          const lam = coadd ? `${coadd.lam_min.toFixed(2)}–${coadd.lam_max.toFixed(2)} µm` : '';
          const alt = t.stage.alt(d, when, modeName);
          let pixels: React.ReactNode = null;
          if (mode === 'blink') {
            pixels = plate ? (
              <img className="panel__pixels" src={plate.pngUrl} alt={alt} width={N * 4} height={N * 4} draggable={false} />
            ) : null;
          } else if (mode === 'stack' && stacks && cubes) {
            const sc = manifest.scales[String(d)];
            pixels = <CanvasPanel key={`s${d}`} label={alt} draw={ctx => paintGray(ctx, stacks[d], sc.lo, sc.hi)} />;
          } else if (mode === 'diff' && cubes) {
            const entry = manifest.diffs.find(x => x.det === d && x.a === pair[0] && x.b === pair[1]);
            if (entry) {
              const off = entry.i * N * N;
              pixels = (
                <CanvasPanel
                  key={`d${d}-${pair.join('-')}`}
                  label={alt}
                  draw={ctx => paintDiff(ctx, cubes.diffs, cubes.diffsSig, off)}
                />
              );
            }
          }
          return (
            <li key={d} className="panel">
              <div className="panel__frame">
                {pixels ?? <div className="panel__pixels panel__pixels--wait" aria-hidden="true" />}
                {showMarks && <Marks manifest={manifest} det={d} mode={mode} frame={frame} pair={pair} showGaia={showGaia} gaia={gaia} />}
                {!showMarks && showGaia && <Marks manifest={manifest} det={d} mode="stack" frame={frame} pair={pair} showGaia gaia={gaia} />}
                <button
                  type="button"
                  className="panel__zoom"
                  onClick={() => onDet(det === 'all' ? (d as DetectorSelection) : 'all')}
                  aria-label={det === 'all' ? t.stage.focusOne(d) : t.stage.focusAll}
                >
                  {det === 'all' ? <IconExpand /> : <IconGrid />}
                </button>
              </div>
              <p className="panel__cap">
                <span className="panel__det">D{d}</span>
                <span className="panel__lam">{lam}</span>
              </p>
            </li>
          );
        })}
      </ol>

      <div className="stage__legend">
        {mode === 'diff' ? (
          <figure className="scale" aria-label={`${t.stage.diffScaleLow} · ${t.stage.diffScaleMid} · ${t.stage.diffScaleHigh}, ${t.stage.diffUnit}`}>
            <div
              className="scale__bar"
              style={{
                background: `linear-gradient(90deg, ${Array.from({ length: 9 }, (_, i) => {
                  const [r, g, b] = diffColor(-1 + i / 4);
                  return `rgb(${r} ${g} ${b}) ${(i / 8) * 100}%`;
                }).join(', ')})`,
              }}
            />
            <figcaption className="scale__ticks">
              <span>−{DIFF_CLIP}σ · {t.stage.diffScaleLow}</span>
              <span>0 · {t.stage.diffScaleMid}</span>
              <span>+{DIFF_CLIP}σ · {t.stage.diffScaleHigh}</span>
            </figcaption>
          </figure>
        ) : null}
        <p className="stage__note">
          {mode === 'blink' && t.stage.blinkLegend}
          {mode === 'stack' && t.stage.stackLegend}
          {mode === 'diff' && (
            <>
              {t.stage.diffLegend(seasonLabel(seasons[pair[0]].start, months), seasonLabel(seasons[pair[1]].start, months))}{' '}
              {t.stage.noData}
            </>
          )}{' '}
          <span className="stage__meta">
            {t.stage.northEast} · {t.stage.fov(manifest.field.fov_arcmin.toFixed(2), manifest.field.pixel_arcsec.toFixed(2))} ·{' '}
            <Term id="detector" t={t} />
          </span>
        </p>
      </div>
    </div>
  );
}
