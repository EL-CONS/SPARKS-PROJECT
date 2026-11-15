// Iteración 1 · Constelación. Cosmos's infinite sky + the Club's three-step
// mission. No cards: content floats on the sky. Targets are picked on a map
// of the whole sky at their real RA/Dec. Buttons carry a spark dot.
import { useEffect, useMemo, useRef, useState } from 'react';
import { parseSkyQuery } from '../core/coords';
import { useSparks, SPEEDS, type Sparks } from './kit/useSparks';
import { Starfield } from './kit/Starfield';
import { Insights } from './kit/Insights';
import { Stage, MAX_CATALOG_MARKS } from './components/Stage';
import { Term } from './components/Term';
import { IconNext, IconPause, IconPlay, IconPrev } from './components/Icons';
import { diffPairs, seasonLabel, toDms, toHms } from './sky';
import { Spectrum } from './components/Spectrum';
import { tieneFotos } from '../data/loader';
import { INSIGHTS } from '../i18n/insights';
import { BASE } from './kit/useSparks';
import { fovOptions, fovParam, zoomForFov } from '../core/fov';
import type { ShellDict } from '../i18n/shell';
import symbol from './assets/symbol.svg';
import spaceAppsWhite from './assets/spaceapps/spaceapps-color-white.svg';
import spaceAppsSmallWhite from './assets/spaceapps/spaceapps-small-white.svg';

function useBodyLabels(s: Sparks) {
  return useMemo(() => {
    const out: Record<string, string> = {};
    for (const id of ['barnard', 'wise0855', 'epsindib', 'rwaur', 'rdra']) out[id] = s.t.targets[id]?.short ?? id;
    return out;
  }, [s.t]);
}

/** A button that carries the logo's light: a dot that goes blue → amber. */
function Spark({ children, primary, className, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean }) {
  return (
    <button type="button" {...rest} className={`spark${primary ? ' spark--primary' : ''}${className ? ` ${className}` : ''}`}>
      <span className="spark__dot" aria-hidden="true" />
      <span className="spark__label">{children}</span>
    </button>
  );
}

const TEAM_INSTAGRAM = [
  { handle: '@jqnx.24', url: 'https://www.instagram.com/jqnx.24/' },
  { handle: '@el_cons', url: 'https://www.instagram.com/el_cons/' },
  { handle: '@nerux23', url: 'https://www.instagram.com/nerux23/' },
  { handle: '@carlos.notok', url: 'https://www.instagram.com/carlos.notok/' },
];

function IconInstagram() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export default function App() {
  const s = useSparks();
  const labels = useBodyLabels(s);
  const [step, setStep] = useState(0);
  const es = s.url.lang === 'es';
  const sh = s.shell;
  return (
    <div className="cn">
      <Starfield labels={labels} quiet={s.tab === 'explorar'} />
      <a className="skip" href="#cielo">{s.t.skip}</a>
      <header className="band band--top">
        <div className="cn-top">
        <button type="button" className="cn-brand" onClick={() => s.setTab('inicio')}>
          <img src={symbol} alt="" width={34} height={34} />
          <span className="cn-brand__name">Sparks</span>
        </button>
        <nav className="cn-nav" aria-label={sh.sections}>
          <button type="button" aria-current={s.tab === 'inicio' ? 'page' : undefined} onClick={() => s.setTab('inicio')}>{s.intro.tabs.start}</button>
          <button type="button" aria-current={s.tab === 'explorar' ? 'page' : undefined} onClick={() => s.setTab('explorar')}>{s.intro.tabs.explore}</button>
        </nav>
        <span className="cn-tools">
          <button type="button" onClick={() => s.setLang(es ? 'en' : 'es')} lang={s.url.lang} aria-label={`${s.t.nav.lang}: ${s.t.nav.langName}`}>{sh.langButton}</button>
        </span>
        <a className="cn-spaceapps" href="https://www.spaceappschallenge.org/" target="_blank" rel="noreferrer" aria-label="NASA Space Apps Challenge 2026">
          <img className="cn-spaceapps__full" src={spaceAppsWhite} alt="NASA Space Apps Challenge" width={112} height={44} />
          <img className="cn-spaceapps__small" src={spaceAppsSmallWhite} alt="" width={34} height={34} />
        </a>
        </div>
      </header>
      <main id="cielo">{s.tab === 'inicio' ? <Start s={s} onGo={() => setStep(0)} /> : <Route s={s} step={step} setStep={setStep} />}</main>
      <footer className="band band--foot">
        <div className="foot">
          <a className="foot__logo" href="https://www.spaceappschallenge.org/" target="_blank" rel="noreferrer">
            <img src={spaceAppsWhite} alt="NASA Space Apps Challenge" width={224} height={88} />
          </a>
          <div className="foot__text">
            <p className="foot__who">
              <b>Sparks</b> · {sh.footer.who}
            </p>
            <p className="foot__honest">{s.t.footer.honest}</p>
            <p>
              {sh.footer.credits}
            </p>
            <p className="foot__fine">
              {sh.footer.illustrations}
            </p>
          </div>
          <nav className="foot__social" aria-label="Instagram">
            {TEAM_INSTAGRAM.map(m => (
              <a key={m.handle} href={m.url} target="_blank" rel="noreferrer">
                <IconInstagram />
                <span>{m.handle}</span>
              </a>
            ))}
          </nav>
        </div>
      </footer>
      <ScrollHint sh={sh} />
    </div>
  );
}

/** A round button at the bottom centre while there is more page below. */
function ScrollHint({ sh }: { sh: ShellDict }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const check = () => setShow(window.scrollY + window.innerHeight < document.documentElement.scrollHeight - 160);
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    const ro = new ResizeObserver(check);
    ro.observe(document.body);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
      ro.disconnect();
    };
  }, []);
  return (
    <button
      type="button"
      className={`scrollhint${show ? ' is-on' : ''}`}
      aria-label={sh.scrollMore}
      tabIndex={show ? 0 : -1}
      aria-hidden={!show}
      onClick={() => window.scrollBy({ top: window.innerHeight * 0.75, behavior: 'smooth' })}
    >
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 9l6 6 6-6" />
      </svg>
      <span>{sh.scrollMoreShort}</span>
    </button>
  );
}

/* ------------------------------------------------------------------ inicio */

function Start({ s, onGo }: { s: Sparks; onGo: () => void }) {
  const i = s.intro;
  return (
    <section className="st" aria-labelledby="st-t">
      <div className="st__logo">
        <img src={symbol} alt="" width={360} height={360} />
      </div>
      <h1 id="st-t" className="st__name">Sparks</h1>
      <p className="st__motto">{i.motto}</p>
      <p className="st__alt" lang={s.url.lang === 'es' ? 'en' : 'es'}>{i.mottoAlt}</p>
      <p className="st__what">{i.what}</p>
      <svg className="st__lights" viewBox="0 0 640 200" role="img" aria-label={`${i.how.before}: ${i.how.beforeText} ${i.how.now}: ${i.how.nowText} ${i.how.arrow}: ${i.how.arrowText}`}>
        <defs>
          <radialGradient id="gb"><stop offset="0" stopColor="#62b6e8" stopOpacity="0.8" /><stop offset="1" stopColor="#62b6e8" stopOpacity="0" /></radialGradient>
          <radialGradient id="ga"><stop offset="0" stopColor="#ffb238" stopOpacity="0.85" /><stop offset="1" stopColor="#ffb238" stopOpacity="0" /></radialGradient>
        </defs>
        <circle cx="130" cy="130" r="56" fill="url(#gb)" />
        <circle cx="130" cy="130" r="20" className="c-before" />
        <circle cx="510" cy="70" r="64" fill="url(#ga)" />
        <circle cx="510" cy="70" r="24" className="c-now" />
        <path d="M156 122 C 260 90, 360 80, 478 74" className="st__path" />
        <path d="M462 62 L482 74 L462 86" className="st__path" />
        <text x="130" y="186" className="st__t">{i.how.before} · {i.how.beforeText}</text>
        <text x="510" y="140" className="st__t">{i.how.now} · {i.how.nowText}</text>
        <text x="320" y="60" className="st__t st__t--arrow">{i.how.arrow} · {i.how.arrowText}</text>
      </svg>
      <Spark primary onClick={() => { onGo(); s.startWithField(s.barnard); }}>{i.cta}</Spark>
      <p className="st__pluto">{i.pluto}</p>
      <p className="st__facts">{i.facts.colors} · {i.facts.detectors} · {i.facts.sky}</p>
    </section>
  );
}

/* ------------------------------------------------------------------ route */

function Leg({ n, title, children, id, active, panelRef }: { n: number; title: string; children: React.ReactNode; id: string; active: boolean; panelRef: (el: HTMLElement | null) => void }) {
  return (
    <section
      ref={el => {
        panelRef(el);
        // only the visible step can be reached by keyboard or screen reader
        if (el) {
          if (active) el.removeAttribute('inert');
          else el.setAttribute('inert', '');
        }
      }}
      className={`leg${active ? ' is-active' : ''}`}
      aria-labelledby={id}
      aria-hidden={!active}
      role="group"
    >
      <h2 id={id} className="leg__title">
        <span className="leg__n" aria-hidden="true">{n}</span>
        {title}
      </h2>
      <div className="leg__body">{children}</div>
    </section>
  );
}

const STEPS = 3;

function Route({ s, step, setStep }: { s: Sparks; step: number; setStep: (n: number) => void }) {
  const { t } = s;
  const ready = s.data.status === 'ready';
  const panels = useRef<(HTMLElement | null)[]>([]);
  const top = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const sh = s.shell;
  const es = s.url.lang === 'es';
  const titles = sh.steps;

  const canGo = (n: number) => n >= 0 && n < STEPS && (n < 2 || ready);
  const go = (n: number) => {
    if (!canGo(n) || n === step) return;
    setStep(n);
    const y = (top.current?.getBoundingClientRect().top ?? 0) + window.scrollY - 12;
    if (window.scrollY > y) window.scrollTo({ top: y, behavior: 'smooth' });
  };

  // the viewport takes the height of the visible step, so nothing sits empty
  useEffect(() => {
    const el = panels.current[step];
    if (!el) return;
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight));
    ro.observe(el);
    setHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, [step]);

  // arrow keys move between steps (not while typing)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === 'ArrowRight') go(step + 1);
      if (e.key === 'ArrowLeft') go(step - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const onTouchStart = (e: React.TouchEvent) => {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const t0 = touch.current;
    touch.current = null;
    if (!t0) return;
    const dx = e.changedTouches[0].clientX - t0.x;
    const dy = e.changedTouches[0].clientY - t0.y;
    // a clear sideways swipe: left moves on, right goes back
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) go(step + (dx < 0 ? 1 : -1));
  };

  return (
    <div className="route" ref={top}>
      <div className="edges">
        <button type="button" className={`edge edge--prev${canGo(step - 1) ? ' is-on' : ''}`} onClick={() => go(step - 1)} disabled={!canGo(step - 1)} aria-label={canGo(step - 1) ? `${sh.stepPrev}: ${titles[step - 1]}` : undefined}>
          <IconPrev />
          {canGo(step - 1) && <span className="edge__tip">{titles[step - 1]}</span>}
        </button>
        <button type="button" className={`edge edge--next${canGo(step + 1) ? ' is-on' : ''}`} onClick={() => go(step + 1)} disabled={!canGo(step + 1)} aria-label={canGo(step + 1) ? `${sh.stepNext}: ${titles[step + 1]}` : undefined}>
          <IconNext />
          {canGo(step + 1) && <span className="edge__tip">{titles[step + 1]}</span>}
        </button>
      </div>
      <nav className="trail" aria-label={sh.stepsLabel}>
        <ol className="trail__list" style={{ ['--progress' as string]: step / (STEPS - 1) }}>
          {titles.map((title, n) => (
            <li key={n}>
              <button
                type="button"
                className={`trail__star${n === step ? ' is-on' : ''}${n < step ? ' is-done' : ''}`}
                aria-current={n === step ? 'step' : undefined}
                disabled={!canGo(n)}
                onClick={() => go(n)}
              >
                <span className="trail__dot" aria-hidden="true">{n + 1}</span>
                <span className="trail__name">{title}</span>
              </button>
            </li>
          ))}
        </ol>
        <p className="trail__hint" aria-hidden="true">{sh.trailHint}</p>
      </nav>

      <div className="steps" style={{ height }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="steps__track" style={{ transform: `translateX(${-step * 100}%)` }}>
          <Leg n={1} id="l1" title={titles[0]} active={step === 0} panelRef={el => (panels.current[0] = el)}>
            <SkyScope s={s} />
            <form
              className="seek"
              role="search"
              onSubmit={e => {
                e.preventDefault();
                s.submitSearch();
              }}
            >
              <label htmlFor="q">{sh.coordsLabel}</label>
              <div className="seek__row">
                <input id="q" value={s.query} onChange={e => s.setQuery(e.target.value)} placeholder="269.4486 4.7672" aria-describedby="q-hint" autoComplete="off" spellCheck={false} />
                <Spark type="submit">{t.search.submit}</Spark>
              </div>
              <p id="q-hint" className="hint">{t.search.hint} <Term id="radec" t={t} /></p>
              {s.searchError && <p className="err" role="alert">{s.searchError}</p>}
              {s.far && (
                <div className="far-box" style={{ marginTop: '0.75rem' }}>
                  <p className="hint" role="status">
                    {t.search.noField(t.targets[s.far.field.id]?.short ?? s.far.field.name, s.far.deg.toFixed(1))}{' '}
                    <button type="button" className="tlink" onClick={() => s.pickField(s.far!.field)}>{t.search.nearest}</button>
                  </p>
                  {!s.liveField && (
                    <Spark
                      style={{ marginTop: '0.5rem' }}
                      disabled={s.liveLoading}
                      onClick={() => {
                        const parsed = parseSkyQuery(s.query);
                        if (parsed.ok) s.queryLiveField(parsed.ra, parsed.dec);
                      }}
                    >
                      {s.liveLoading ? (es ? 'Consultando…' : 'Querying…') : (es ? 'Consultar campo en vivo' : 'Query live field')}
                    </Spark>
                  )}
                </div>
              )}
              {s.liveField && (
                <div style={{ marginTop: '0.75rem' }}>
                  {s.liveField.status === 'en_cola' && (
                    <div className="note" role="status">
                      <p><b>{es ? 'En cola' : 'Queued'}:</b> {s.core.statusQueued}</p>
                      <p className="hint" style={{ marginTop: '0.25rem' }}>
                        {es
                          ? `Posición #${s.liveField.posicion_en_cola ?? 1} · Estimado: ~${s.liveField.estimado_segundos ?? 8} s`
                          : `Queue position #${s.liveField.posicion_en_cola ?? 1} · Est: ~${s.liveField.estimado_segundos ?? 8} s`}
                      </p>
                    </div>
                  )}
                  {s.liveField.status === 'procesando' && (
                    <div className="note" role="status">
                      <p><b>{es ? 'Procesando' : 'Processing'}:</b> {s.core.statusProcessing}</p>
                      <span className="meter" aria-hidden="true" style={{ marginTop: '0.4rem' }}>
                        <span style={{ width: `${s.liveField.progreso_porcentaje ?? 45}%` }} />
                      </span>
                      <p className="hint" style={{ marginTop: '0.25rem' }}>
                        {s.liveField.etapa_actual || (es ? 'Descargando y reevaluando recortes de IRSA' : 'Downloading and evaluating IRSA cutouts')} ({s.liveField.progreso_porcentaje ?? 0}%)
                      </p>
                    </div>
                  )}
                  {s.liveField.status === 'listo' && (
                    <div className="note" role="status">
                      <p><b>{es ? 'Listo' : 'Ready'}:</b> {s.core.statusReady}</p>
                      {s.liveField.field_id && s.fields?.find(f => f.id === s.liveField!.field_id) && (
                        <Spark
                          primary
                          style={{ marginTop: '0.4rem' }}
                          onClick={() => {
                            const found = s.fields!.find(f => f.id === s.liveField!.field_id);
                            if (found) s.pickField(found);
                          }}
                        >
                          {es ? 'Inspeccionar campo' : 'Inspect field'}
                        </Spark>
                      )}
                    </div>
                  )}
                  {s.liveField.status === 'fallo' && (
                    <div className="note note--err" role="alert">
                      <p><b>{es ? 'Fallo' : 'Failed'}:</b> {s.liveField.mensaje || s.core.statusFailed}</p>
                      {s.liveField.error_code && <p className="hint">{s.liveField.error_code}</p>}
                    </div>
                  )}
                </div>
              )}
            </form>
          </Leg>

          <Leg n={2} id="l2" title={titles[1]} active={step === 1} panelRef={el => (panels.current[1] = el)}>
            {s.indexError && (
              <div className="note note--err" role="alert">
                <p>{s.indexError || s.core.loadError}</p>
                <Spark onClick={s.retryIndex}>{t.stage.retry}</Spark>
              </div>
            )}
            {s.selected && (
              <div className="who">
                <p className="who__name">
                  {s.selected.id === 'barnard' ? sh.barnardName : s.selected.name}
                  {s.selected.status === 'parcial' && (
                    <span
                      style={{
                        marginLeft: '0.6rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        background: 'rgba(255, 178, 56, 0.15)',
                        color: 'var(--now-ink)',
                        border: '1px solid rgba(255, 178, 56, 0.3)',
                        verticalAlign: 'middle',
                      }}
                    >
                      {INSIGHTS[s.url.lang].manifestStatus.partialBadge}
                    </span>
                  )}
                </p>
                <p className="who__note">{t.targets[s.selected.id]?.note ?? s.selected.note}</p>
                {s.selected.status === 'parcial' && s.selected.reason && (
                  <p className="hint" style={{ marginTop: '0.25rem', color: 'var(--now-ink)', fontStyle: 'italic' }}>
                    {s.selected.reason}
                  </p>
                )}
              </div>
            )}
            {s.selected && s.data.status === 'loading' && (
              <p className="note" role="status">
                <span className="meter" aria-hidden="true"><span style={{ width: `${s.data.total ? (s.data.done / s.data.total) * 100 : 0}%` }} /></span>
                {t.stage.loading(s.data.done, s.data.total || 18)}
              </p>
            )}
            {s.data.status === 'error' && (
              <div className="note note--err" role="alert">
                <p>{s.data.message || t.stage.loadFailed}</p>
                <Spark onClick={s.retryField}>{t.stage.retry}</Spark>
              </div>
            )}
            {!s.selected && s.far && (
              <div className="note" role="status">
                <p className="note__title">{sh.far.title(toHms(s.url.ra), toDms(s.url.dec))}</p>
                <p>{sh.far.body(t.targets[s.far.field.id]?.short ?? s.far.field.name, s.far.deg.toFixed(1))}</p>
                <Spark primary onClick={() => s.pickField(s.far!.field)}>{sh.far.go(t.targets[s.far.field.id]?.short ?? s.far.field.name)}</Spark>
              </div>
            )}
            {s.data.status === 'soon' && <Soon s={s} />}
            {s.data.status === 'ready' && <Watch key={s.selected?.id} s={s} />}
          </Leg>

          <Leg n={3} id="l3" title={titles[2]} active={step === 2} panelRef={el => (panels.current[2] = el)}>
            {s.data.status === 'ready' ? (
              <Insights lang={s.url.lang} t={t} manifest={s.data.manifest} cubes={s.cubes} field={s.selected!} det={s.det === 'all' ? 6 : s.det} season={s.mode === 'diff' ? s.pair[1] : s.player.frame} />
            ) : (
              <p className="note">{sh.needTarget}</p>
            )}
          </Leg>
        </div>
      </div>

      <div className="stepnav">
        {step > 0 ? (
          <Spark className="stepnav__back" onClick={() => go(step - 1)}>
            <span aria-hidden="true">← </span>{sh.back}<span className="stepnav__where">: {titles[step - 1]}</span>
          </Spark>
        ) : (
          <span />
        )}
        {step < STEPS - 1 && (
          <Spark primary className="stepnav__next" onClick={() => go(step + 1)} disabled={!canGo(step + 1)}>
            {sh.next}<span className="stepnav__where">: {titles[step + 1]}</span><span aria-hidden="true"> →</span>
          </Spark>
        )}
      </div>
    </div>
  );
}

/**
 * The five targets seen through a telescope eyepiece: a polar view of the
 * whole sky, north celestial pole at the centre, the equator as a ring, the
 * south pole on the rim; right ascension runs around the edge in hours.
 * Picking a target slews the reticle onto it.
 */
function SkyScope({ s }: { s: Sparks }) {
  const { t } = s;
  const sh = s.shell;
  const fields = (s.fields ?? []).slice(0, 5);
  const lensRef = useRef<HTMLDivElement>(null);
  const selIdx = fields.findIndex(f => f.id === s.selected?.id);
  const selIdxRef = useRef(selIdx);
  selIdxRef.current = selIdx;

  useEffect(() => {
    const lens = lensRef.current;
    if (!lens || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    let last = performance.now();
    let tx = 0;
    let ty = 0;
    let px = 0;
    let py = 0;
    const onMove = (e: PointerEvent) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
    };
    const frame = (now: number) => {
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      px += (tx - px) * Math.min(1, dt * 3);
      py += (ty - py) * Math.min(1, dt * 3);
      const items = lens.querySelectorAll<HTMLLIElement>('.scope__pins > li');
      const aim = lens.querySelector<HTMLElement>('.scope__aim');
      items.forEach((li, i) => {
        const depth = 8 + (i % 3) * 2;
        const dx = px * depth + Math.sin(now * 0.0008 + i * 1.4) * 2.5;
        const dy = py * depth + Math.cos(now * 0.0007 + i * 1.9) * 2.5;
        li.style.setProperty('--tx', `${dx.toFixed(2)}px`);
        li.style.setProperty('--ty', `${dy.toFixed(2)}px`);
        if (aim && i === selIdxRef.current) {
          aim.style.setProperty('--tx', `${dx.toFixed(2)}px`);
          aim.style.setProperty('--ty', `${dy.toFixed(2)}px`);
        }
      });
      if (aim && selIdxRef.current < 0) {
        aim.style.setProperty('--tx', '0px');
        aim.style.setProperty('--ty', '0px');
      }
      raf = requestAnimationFrame(frame);
    };
    const onVis = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      if (!document.hidden) raf = requestAnimationFrame(frame);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('visibilitychange', onVis);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [fields.length]);

  const C = 300; // centre of a 600 x 600 view
  const R = 270; // radius where Dec = -90 sits
  const pos = (ra: number, dec: number) => {
    const r = ((90 - dec) / 180) * R;
    const a = (ra * Math.PI) / 180; // 0h at the top, growing anticlockwise (east)
    return { x: C - r * Math.sin(a), y: C - r * Math.cos(a) };
  };
  const pct = (v: number) => `${(v / 600) * 100}%`;
  const sel = s.selected ? pos(s.selected.ra, s.selected.dec) : { x: C, y: C };
  const ring = (dec: number) => ((90 - dec) / 180) * R;
  return (
    <figure className="scope">
      <div className="scope__lens" ref={lensRef}>
        <svg viewBox="0 0 600 600" className="scope__svg" aria-hidden="true">
          {/* declination rings */}
          {[60, 30, -30, -60].map(d => (
            <circle key={d} cx={C} cy={C} r={ring(d)} className="scope__ring" />
          ))}
          <circle cx={C} cy={C} r={ring(0)} className="scope__eq" />
          <circle cx={C} cy={C} r={R} className="scope__rim" />
          {/* reticle */}
          <line x1={C - R} x2={C + R} y1={C} y2={C} className="scope__cross" />
          <line x1={C} x2={C} y1={C - R} y2={C + R} className="scope__cross" />
          <circle cx={C} cy={C} r="5" className="scope__pole" />
          {/* hour ticks on the rim */}
          {Array.from({ length: 24 }, (_, h) => {
            const a = (h * 15 * Math.PI) / 180;
            const r1 = R;
            const r2 = R - (h % 6 === 0 ? 14 : 7);
            return (
              <line key={h} x1={C - r1 * Math.sin(a)} y1={C - r1 * Math.cos(a)} x2={C - r2 * Math.sin(a)} y2={C - r2 * Math.cos(a)} className="scope__tick" />
            );
          })}
          {[0, 3, 6, 9, 12, 15, 18, 21].map(h => {
            const a = (h * 15 * Math.PI) / 180;
            const r = R + 18;
            return (
              <text key={h} x={C - r * Math.sin(a)} y={C - r * Math.cos(a) + 4} className="scope__hour">{h}h</text>
            );
          })}
          {[60, 30, 0, -30, -60].map(d => (
            <text key={d} x={C + 6} y={C - ring(d) - 5} className="scope__dec">{d > 0 ? `+${d}` : d === 0 ? '0' : `−${-d}`}°</text>
          ))}
        </svg>
        <span className="scope__vignette" aria-hidden="true" />
        <span className="scope__aim" style={{ left: pct(sel.x), top: pct(sel.y) }} aria-hidden="true" />
        <ul className="scope__pins">
          {fields.map(f => {
            const on = s.selected?.id === f.id;
            const ready = tieneFotos(f);
            const p = pos(f.ra, f.dec);
            // labels point away from the centre, and switch sides when
            // another target sits in the way
            let right = p.x >= C;
            // room on each side: distance to the nearest target in the way
            const room = (toRight: boolean) =>
              Math.min(
                170,
                ...fields
                  .filter(o => o.id !== f.id)
                  .map(o => pos(o.ra, o.dec))
                  .filter(q => Math.abs(q.y - p.y) < 34 && (toRight ? q.x > p.x : q.x < p.x))
                  .map(q => Math.abs(q.x - p.x)),
              );
            if (room(right) < 170 && room(!right) > room(right)) right = !right;
            const flip = !right;
            return (
              <li key={f.id} style={{ left: pct(p.x), top: pct(p.y) }}>
                <button type="button" className={`pin${on ? ' is-on' : ''}${ready ? ' is-ready' : ''}${flip ? ' pin--flip' : ''}`} aria-pressed={on} onClick={() => s.pickField(f)}>
                  <span className="pin__star" aria-hidden="true" />
                  <span className="pin__text">
                    <span className="pin__name">{t.targets[f.id]?.short ?? f.name}</span>
                    <span className="pin__meta">{ready ? sh.scope.withPhotos : t.search.soonTag}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <figcaption className="scope__key">
        <p className="scope__key-t">{sh.scope.how}</p>
        <dl>
          <div><dt>{sh.scope.centre}</dt><dd>{sh.scope.centreValue}</dd></div>
          <div><dt>{sh.scope.ring}</dt><dd>{sh.scope.ringValue}</dd></div>
          <div><dt>{sh.scope.edge}</dt><dd>{sh.scope.edgeValue}</dd></div>
          <div><dt>{sh.scope.hours}</dt><dd><Term id="radec" t={t}>{sh.scope.hoursValue}</Term></dd></div>
        </dl>
        {s.selected && (
          <p className="scope__aimed">
            <span className="scope__aimed-dot" aria-hidden="true" />
            {sh.scope.aimed} <b>{t.targets[s.selected.id]?.short ?? s.selected.name}</b>
            <span className="scope__coords">RA {toHms(s.selected.ra)} · Dec {toDms(s.selected.dec)}</span>
          </p>
        )}
      </figcaption>
    </figure>
  );
}

function Watch({ s }: { s: Sparks }) {
  const { t, player } = s;
  const sh = s.shell;
  const [gaia, setGaia] = useState(false);
  const [wise, setWise] = useState(false);
  const [pick, setPick] = useState<{ x: number; y: number } | null>(null);
  if (s.data.status !== 'ready') return null;
  const m = s.data.manifest;
  const full = m.field.fov_arcmin;
  const zoom = zoomForFov(s.url.fov, full);
  return (
    <>
      <p className="say">{t.layer1.generic}</p>
      <div className="modes" role="group" aria-label={t.modes.label}>
        {(['blink', 'stack', 'diff'] as const).map(mo => (
          <button key={mo} type="button" aria-pressed={s.mode === mo} onClick={() => s.setMode(mo)}>
            <b>{mo === 'blink' ? t.modes.blink : mo === 'stack' ? t.modes.stack : t.modes.diff}</b>
            <span>{mo === 'blink' ? t.modes.blinkHelp : mo === 'stack' ? t.modes.stackHelp : t.modes.diffHelp}</span>
          </button>
        ))}
      </div>
      {s.askFlash && (
        <div className="note" role="alertdialog" aria-labelledby="fl-t" aria-describedby="fl-b">
          <p id="fl-t" className="note__title">{t.flash.title}</p>
          <p id="fl-b">{t.flash.body}</p>
          <div className="note__row">
            <Spark primary onClick={s.acceptFlash} autoFocus>{t.flash.ok}</Spark>
            <Spark onClick={s.declineFlash}>{t.flash.step}</Spark>
          </div>
        </div>
      )}
      <div className="window">
        <Stage t={t} manifest={m} plates={s.data.plates} cubes={s.cubes} mode={s.mode} frame={player.frame} pair={s.pair} det={s.det} onDet={s.setDet} showMarks showGaia={gaia} gaia={s.gaia} shell={sh} zoom={zoom} showWise={wise} catwise={s.catwise} pick={pick} onPick={setPick} />
      </div>
      <div className="deck">
        {s.mode === 'blink' && (
          <span className="deck__keys">
            <button type="button" className="round" onClick={player.prev} aria-label={t.transport.prev}><IconPrev /></button>
            <button type="button" className={`round round--play${player.playing ? ' is-on' : ''}`} onClick={s.togglePlay} aria-pressed={player.playing} aria-label={player.playing ? t.transport.pause : t.transport.play}>
              {player.playing ? <IconPause /> : <IconPlay />}
            </button>
            <button type="button" className="round" onClick={player.next} aria-label={t.transport.next}><IconNext /></button>
          </span>
        )}
        {s.mode === 'diff' ? (
          <span className="chips" role="group" aria-label={t.transport.pairLabel}>
            {diffPairs(m.diffs).map(([a, b]) => (
              <button key={`${a}-${b}`} type="button" className="chip" aria-pressed={s.pair[0] === a && s.pair[1] === b} onClick={() => s.setPair([a, b])}>
                <i className="dot dot--b" />{seasonLabel(m.seasons[a].start, t.months)} → <i className="dot dot--a" />{seasonLabel(m.seasons[b].start, t.months)}
              </button>
            ))}
          </span>
        ) : (
          <ol className="chips" aria-label={t.log.title}>
            {m.seasons.map((se, i) => {
              const now = s.mode === 'blink' && i === player.frame;
              return (
                <li key={se.id}>
                  <button type="button" className={`chip${now ? ' is-now' : ''}`} disabled={s.mode === 'stack'} onClick={() => s.pickSeason(i)} aria-current={now ? 'step' : undefined}>
                    <i className={`dot${now ? ' dot--a' : s.mode === 'blink' && player.frame > 0 && i === 0 ? ' dot--b' : ''}`}>{now && <span key={s.flashKey} className="lens" />}</i>
                    {seasonLabel(se.start, t.months)}
                  </button>
                </li>
              );
            })}
          </ol>
        )}
        {s.mode === 'blink' && (
          <span className="chips chips--speed" role="group" aria-label={t.transport.speed}>
            {SPEEDS.map((hz, k) => (
              <button key={hz} type="button" className="chip" aria-pressed={player.fps === hz} onClick={() => player.setSpeed(hz)}>{t.transport.speeds[k]}</button>
            ))}
          </span>
        )}
      </div>
      <p className="hint">{s.mode === 'stack' ? t.transport.stackIdle : t.transport.speedNote}</p>
      <div className="tools">
        <div className="tools__group" role="group" aria-label={sh.fov.label}>
          <span className="tools__label">{sh.fov.label}</span>
          <span className="chips">
            {fovOptions(full).map(o => (
              <button key={o.zoom} type="button" className="chip" aria-pressed={zoom === o.zoom} onClick={() => s.setFov(fovParam(full, o.zoom))}>
                {sh.fov.option(o.arcmin.toFixed(2))}{o.zoom === 1 ? ` · ${sh.fov.full}` : ''}
              </button>
            ))}
          </span>
        </div>
        <div className="tools__group" role="group" aria-label={sh.layers.label}>
          <span className="tools__label">{sh.layers.label}</span>
          <label className="check">
            <input type="checkbox" checked={gaia} disabled={!s.gaia.length} onChange={e => setGaia(e.target.checked)} /> {sh.layers.gaia(s.gaia.length)}
          </label>
          <label className="check">
            <input type="checkbox" checked={wise} disabled={!s.catwise.length} onChange={e => setWise(e.target.checked)} /> {sh.layers.catwise(s.catwise.length)}
          </label>
        </div>
      </div>
      <p className="hint">{sh.fov.note(full.toFixed(2))} {(gaia || wise) && sh.layers.key(MAX_CATALOG_MARKS)}</p>
      <Spectrum shell={sh} base={BASE} fieldId={m.field.id} folder={s.selected?.folder ?? 'data-sample'} manifest={m} season={s.mode === 'diff' ? s.pair[1] : player.frame} pick={pick} onPick={setPick} />
    </>
  );
}

function Soon({ s }: { s: Sparks }) {
  const f = s.selected!;
  const { t } = s;
  return (
    <div className="note">
      <p className="note__title">{t.soon.title}</p>
      <p>{t.soon.body}</p>
      {f.mu_measured !== null && f.mu_err !== null ? (
        <p>
          <Term id="properMotion" t={t} />: <b className="num">{f.mu_measured.toFixed(2)} ± {f.mu_err.toFixed(2)}</b> {t.log.perYear}
        </p>
      ) : (
        <p>{t.soon.noMotion}</p>
      )}
      {s.barnard && <Spark primary onClick={() => s.pickField(s.barnard!)}>{t.soon.open}</Spark>}
    </div>
  );
}
