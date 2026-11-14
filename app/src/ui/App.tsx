// Cosmos: Sparks as an immersive view of space. A living starfield behind
// everything, the sky data floating in it, a dock for navigation, and a
// daytime sky (with a pale moon) for the light theme.
import { useEffect, useRef, useState } from 'react';
import { useSparks, SPEEDS, type Sparks } from './kit/useSparks';
import { useTheme } from './useTheme';
import { Stage } from './components/Stage';
import { Layers } from './components/Layers';
import { Term } from './components/Term';
import { AstroArt } from './components/Astros';
import { IconMoon, IconNext, IconPause, IconPlay, IconPrev, IconSearch, IconSun } from './components/Icons';
import { seasonLabel, toDms, toHms } from './sky';
import symbol from './assets/symbol.svg';
import symbolLight from './assets/symbol-flat-light.svg';

export default function App() {
  const s = useSparks();
  const { theme, toggle } = useTheme();
  const es = s.url.lang === 'es';
  return (
    <div className="cosmos">
      <Starfield theme={theme} />
      <a className="skip" href="#vista">{s.t.skip}</a>
      <header className="corner">
        <span className="corner__mark">
          <img src={theme === 'light' ? symbolLight : symbol} alt="" width={36} height={36} />
          Sparks
        </span>
        <span className="corner__tools">
          <button type="button" className="orb-btn" onClick={() => s.setLang(es ? 'en' : 'es')} lang={es ? 'en' : 'es'} aria-label={`${s.t.nav.lang}: ${s.t.nav.langName}`}>{es ? 'EN' : 'ES'}</button>
          <button type="button" className="orb-btn" role="switch" aria-checked={theme === 'light'} aria-label={`${s.t.nav.theme}: ${theme === 'light' ? s.t.nav.themeLight : s.t.nav.themeDark}`} onClick={toggle}>
            {theme === 'light' ? <IconSun /> : <IconMoon />}
          </button>
        </span>
      </header>
      <main id="vista">{s.tab === 'inicio' ? <Arrival s={s} theme={theme} /> : <Observatory s={s} />}</main>
      <nav className="dock" aria-label={es ? 'Secciones' : 'Sections'}>
        <button type="button" aria-current={s.tab === 'inicio' ? 'page' : undefined} onClick={() => s.setTab('inicio')}>
          <span className="dock__dot dock__dot--before" aria-hidden="true" />
          {s.intro.tabs.start}
        </button>
        <button type="button" aria-current={s.tab === 'explorar' ? 'page' : undefined} onClick={() => s.setTab('explorar')}>
          <span className="dock__dot dock__dot--now" aria-hidden="true" />
          {s.intro.tabs.explore}
        </button>
      </nav>
      <footer className="far-text">
        <p>{s.t.footer.honest}</p>
        <p>{s.t.footer.data} {s.t.footer.built} · {s.t.footer.team}</p>
      </footer>
    </div>
  );
}

/* ---------------------------------------------------------------- starfield */

function Starfield({ theme }: { theme: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext('2d')!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    let px = 0;
    let py = 0;
    let seed = 1930;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) % 100000) / 100000;
    const stars = Array.from({ length: 420 }, () => ({ x: rnd(), y: rnd(), z: 0.2 + rnd() * 0.8, p: rnd() * Math.PI * 2, warm: rnd() < 0.18 }));
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h);
      if (theme === 'light') return;
      for (const st of stars) {
        const tw = reduce ? 1 : 0.65 + 0.35 * Math.sin(time / 1400 + st.p);
        const x = st.x * w + px * st.z * 14;
        const y = st.y * h + py * st.z * 14;
        ctx.globalAlpha = st.z * 0.85 * tw;
        ctx.fillStyle = st.warm ? '#ffe6c4' : '#e8f1ff';
        ctx.beginPath();
        ctx.arc(x, y, st.z * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    const loop = (time: number) => {
      draw(time);
      raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      px = e.clientX / window.innerWidth - 0.5;
      py = e.clientY / window.innerHeight - 0.5;
    };
    resize();
    window.addEventListener('resize', resize);
    if (reduce) draw(0);
    else {
      window.addEventListener('pointermove', onMove);
      raf = requestAnimationFrame(loop);
    }
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduce) raf = requestAnimationFrame(loop);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [theme]);
  return (
    <div className="space" aria-hidden="true">
      <canvas ref={ref} className="space__stars" />
      <svg className="space__moon" viewBox="0 0 200 200">
        <defs>
          <radialGradient id="mg" cx="78" cy="70" r="120" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="var(--moon-hi)" />
            <stop offset="1" stopColor="var(--moon-lo)" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="80" fill="url(#mg)" />
        <circle cx="74" cy="82" r="12" className="crater" />
        <circle cx="122" cy="118" r="18" className="crater" />
        <circle cx="112" cy="66" r="7" className="crater" />
        <circle cx="70" cy="128" r="8" className="crater" />
      </svg>
    </div>
  );
}

/* ---------------------------------------------------------------- arrival */

function Arrival({ s, theme }: { s: Sparks; theme: string }) {
  const i = s.intro;
  return (
    <section className="arrival" aria-labelledby="ar-t">
      <div className="arrival__logo">
        <svg className="orbit" viewBox="0 0 400 400" aria-hidden="true">
          <ellipse cx="200" cy="200" rx="190" ry="70" className="orbit__path" transform="rotate(-28 200 200)" />
          <ellipse cx="200" cy="200" rx="150" ry="150" className="orbit__path orbit__path--faint" />
        </svg>
        <img src={theme === 'light' ? symbolLight : symbol} alt="" width={340} height={340} />
      </div>
      <h1 id="ar-t" className="arrival__name">Sparks</h1>
      <p className="arrival__motto">{i.motto}</p>
      <p className="arrival__alt" lang={s.url.lang === 'es' ? 'en' : 'es'}>{i.mottoAlt}</p>
      <p className="arrival__what">{i.what}</p>
      <div className="lights" aria-label={i.how.title} role="group">
        <div className="light">
          <span className="light__orb light__orb--before" aria-hidden="true" />
          <b>{i.how.before}</b>
          <span>{i.how.beforeText}</span>
        </div>
        <svg className="light__arrow" viewBox="0 0 120 40" aria-hidden="true">
          <path d="M6 30 C 40 6, 80 6, 108 18" className="arrow-draw" />
          <path d="M98 9 L110 18 L97 25" className="arrow-draw" />
        </svg>
        <div className="light">
          <span className="light__orb light__orb--now" aria-hidden="true" />
          <b>{i.how.now}</b>
          <span>{i.how.nowText}</span>
        </div>
      </div>
      <p className="arrival__arrow"><b>{i.how.arrow}:</b> {i.how.arrowText}</p>
      <button type="button" className="launch" onClick={() => s.startWithField(s.barnard)}>
        <IconPlay /> {i.cta}
      </button>
      <p className="arrival__pluto">{i.pluto}</p>
      <p className="arrival__facts">{i.facts.colors} · {i.facts.detectors} · {i.facts.sky}</p>
    </section>
  );
}

/* ---------------------------------------------------------------- observatory */

function Observatory({ s }: { s: Sparks }) {
  const { t } = s;
  const es = s.url.lang === 'es';
  return (
    <div className="obs">
      <aside className="panel-l" aria-label={es ? 'Destinos' : 'Destinations'}>
        <form
          className="probe"
          role="search"
          onSubmit={e => {
            e.preventDefault();
            s.submitSearch();
          }}
        >
          <label htmlFor="q" className="probe__label">{t.search.label}</label>
          <div className="probe__row">
            <IconSearch />
            <input id="q" value={s.query} onChange={e => s.setQuery(e.target.value)} placeholder="269.4486 4.7672" aria-describedby="q-hint" autoComplete="off" spellCheck={false} />
            <button type="submit">{t.search.submit}</button>
          </div>
          <p id="q-hint" className="probe__hint">{t.search.hint} <Term id="radec" t={t} /></p>
          {s.searchError && <p className="probe__err" role="alert">{s.searchError}</p>}
          {s.far && (
            <p className="probe__hint" role="status">
              {t.search.noField(t.targets[s.far.field.id]?.short ?? s.far.field.name, s.far.deg.toFixed(1))}{' '}
              <button type="button" className="txt" onClick={() => s.pickField(s.far!.field)}>{t.search.nearest}</button>
            </p>
          )}
        </form>
        <ul className="dest">
          {(s.fields ?? []).slice(0, 5).map(f => {
            const on = s.selected?.id === f.id;
            const kind = f.kind === 'variable' ? 'variable' : f.id === 'barnard' ? 'nearStar' : 'brownDwarf';
            return (
              <li key={f.id}>
                <button type="button" className={`dest__b${on ? ' is-on' : ''}`} aria-pressed={on} onClick={() => s.pickField(f)}>
                  <span className="dest__art"><AstroArt kind={kind} /></span>
                  <span className="dest__name">{t.targets[f.id]?.short ?? f.name}</span>
                  <span className="dest__meta">{f.id === 'barnard' ? `${toHms(f.ra).slice(0, 6)} ${toDms(f.dec).slice(0, 4)}` : t.search.soonTag}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="dest__note">{t.astros.illustration} · {t.astros.intro}</p>
      </aside>

      <section className="center" aria-labelledby="center-t">
        {s.indexError && (
          <div className="glass glass--err" role="alert">
            <p>{s.core.loadError}</p>
            <button type="button" className="soft" onClick={s.retryIndex}>{t.stage.retry}</button>
          </div>
        )}
        {s.selected && (
          <header className="center__head">
            <h1 id="center-t" className="center__title">{s.selected.id === 'barnard' ? (es ? 'Estrella de Barnard' : 'Barnard’s Star') : s.selected.name}</h1>
            <p className="center__note">{t.targets[s.selected.id]?.note ?? s.selected.note}</p>
            <p className="center__coords">RA {toHms(s.selected.ra)} · Dec {toDms(s.selected.dec)}</p>
          </header>
        )}
        {s.data.status === 'loading' && <Scan s={s} />}
        {s.data.status === 'error' && (
          <div className="glass glass--err" role="alert">
            <p>{t.stage.loadFailed}</p>
            <button type="button" className="soft" onClick={s.retryField}>{t.stage.retry}</button>
          </div>
        )}
        {s.data.status === 'soon' && <Soon s={s} />}
        {s.data.status === 'ready' && <View s={s} />}
      </section>
    </div>
  );
}

function Scan({ s }: { s: Sparks }) {
  if (s.data.status !== 'loading') return null;
  const pct = s.data.total ? s.data.done / s.data.total : 0;
  return (
    <div className="scan" role="status">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r="52" className="scan__track" />
        <circle cx="60" cy="60" r="52" className="scan__fill" style={{ strokeDasharray: `${pct * 327} 327` }} />
      </svg>
      <p>{s.t.stage.loading(s.data.done, s.data.total || 18)}</p>
    </div>
  );
}

function View({ s }: { s: Sparks }) {
  const { t, player } = s;
  const [gaia, setGaia] = useState(false);
  if (s.data.status !== 'ready') return null;
  const m = s.data.manifest;
  const fit = m.target.measured;
  const exp = m.target.expected;
  return (
    <>
      <p className="center__lede">{t.layer1.generic}</p>
      <div className="seg" role="group" aria-label={t.modes.label}>
        {(['blink', 'stack', 'diff'] as const).map(mo => (
          <button key={mo} type="button" aria-pressed={s.mode === mo} onClick={() => s.setMode(mo)}>
            {mo === 'blink' ? t.modes.blink : mo === 'stack' ? t.modes.stack : t.modes.diff}
          </button>
        ))}
      </div>
      {s.askFlash && (
        <div className="glass" role="alertdialog" aria-labelledby="fl-t" aria-describedby="fl-b">
          <p id="fl-t" className="glass__title">{t.flash.title}</p>
          <p id="fl-b">{t.flash.body}</p>
          <div className="glass__row">
            <button type="button" className="launch launch--sm" onClick={s.acceptFlash} autoFocus><IconPlay /> {t.flash.ok}</button>
            <button type="button" className="soft" onClick={s.declineFlash}>{t.flash.step}</button>
          </div>
        </div>
      )}
      <div className="viewport">
        <Stage t={t} manifest={m} plates={s.data.plates} cubes={s.cubes} mode={s.mode} frame={player.frame} pair={s.pair} det={s.det} onDet={s.setDet} showMarks showGaia={gaia} gaia={s.gaia} />
      </div>
      <div className="console">
        {s.mode === 'blink' ? (
          <>
            <button type="button" className="orb-btn" onClick={player.prev} aria-label={t.transport.prev}><IconPrev /></button>
            <button type="button" className={`orb-btn orb-btn--play${player.playing ? ' is-on' : ''}`} onClick={s.togglePlay} aria-pressed={player.playing} aria-label={player.playing ? t.transport.pause : t.transport.play}>
              {player.playing ? <IconPause /> : <IconPlay />}
            </button>
            <button type="button" className="orb-btn" onClick={player.next} aria-label={t.transport.next}><IconNext /></button>
            <Orbit s={s} />
            <span className="console__speed" role="group" aria-label={t.transport.speed}>
              {SPEEDS.map((hz, k) => (
                <button key={hz} type="button" aria-pressed={player.fps === hz} onClick={() => player.setSpeed(hz)}>{t.transport.speeds[k]}</button>
              ))}
            </span>
          </>
        ) : s.mode === 'diff' ? (
          <span className="console__pairs" role="group" aria-label={t.transport.pairLabel}>
            {m.diffs.filter(d => d.det === 1).map(d => (
              <button key={`${d.a}${d.b}`} type="button" aria-pressed={s.pair[0] === d.a && s.pair[1] === d.b} onClick={() => s.setPair([d.a, d.b])}>
                <i className="pd pd--before" />{seasonLabel(m.seasons[d.a].start, t.months)} → <i className="pd pd--now" />{seasonLabel(m.seasons[d.b].start, t.months)}
              </button>
            ))}
          </span>
        ) : (
          <span className="console__idle">{t.transport.stackIdle}</span>
        )}
        <label className="console__gaia">
          <input type="checkbox" checked={gaia} onChange={e => setGaia(e.target.checked)} /> {t.stage.gaiaLayer}
        </label>
      </div>
      <p className="center__fine">{t.transport.speedNote}</p>

      {fit && (
        <section className="hud" aria-labelledby="hud-t">
          <h2 id="hud-t" className="hud__title">{t.log.readingTitle}</h2>
          <p className="hud__kid">{t.log.readingKid((fit.mu / m.field.pixel_arcsec).toFixed(1))}</p>
          <div className="hud__row">
            <div className="hud__big">
              <span className="hud__num">{fit.mu.toFixed(2)}</span>
              <span className="hud__err">± {fit.mu_err.toFixed(2)} {t.log.perYear}</span>
              <span className="hud__lbl">{t.log.measured}</span>
            </div>
            {exp && (
              <div className="hud__big hud__big--ref">
                <span className="hud__num">{exp.mu.toFixed(2)}</span>
                <span className="hud__err">{t.log.perYear}</span>
                <span className="hud__lbl">{t.log.expected(exp.catalog)}</span>
              </div>
            )}
            <div className="hud__big hud__big--ref">
              <span className="hud__num">{fit.pa_deg.toFixed(1)}°</span>
              <span className="hud__err">± {fit.pa_err_deg.toFixed(1)}°</span>
              <span className="hud__lbl"><Term id="positionAngle" t={t} /></span>
            </div>
          </div>
          {exp && <p className="hud__agree">{t.log.agreement((Math.abs(fit.mu - exp.mu) / fit.mu_err).toFixed(1))}</p>}
          <p className="hud__verdict"><b>{t.verdict.mover}.</b> {t.verdict.moverWhy} {t.verdict.coldMissing} {t.verdict.ruleNote}</p>
        </section>
      )}
      <Layers t={t} manifest={m} field={s.selected!} det={s.det === 'all' ? 6 : s.det} season={s.mode === 'diff' ? s.pair[1] : player.frame} />
    </>
  );
}

/** Seasons as moons on an orbit: the live one glows amber. */
function Orbit({ s }: { s: Sparks }) {
  if (s.data.status !== 'ready') return null;
  const seasons = s.data.manifest.seasons;
  return (
    <ol className="orbit-sel" aria-label={s.t.log.title}>
      {seasons.map((se, i) => {
        const now = i === s.player.frame;
        const before = s.player.frame > 0 && i === 0;
        return (
          <li key={se.id}>
            <button type="button" className={`moonlet${now ? ' is-now' : ''}${before ? ' is-before' : ''}`} onClick={() => s.pickSeason(i)} aria-current={now ? 'step' : undefined}>
              <span className="moonlet__dot" aria-hidden="true">{now && <span key={s.flashKey} className="moonlet__flash" />}</span>
              {seasonLabel(se.start, s.t.months)}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function Soon({ s }: { s: Sparks }) {
  const f = s.selected!;
  const { t } = s;
  return (
    <div className="glass soon">
      <div className="soon__art">
        <AstroArt kind={f.kind === 'variable' ? 'variable' : 'brownDwarf'} />
        <span>{t.astros.illustration}</span>
      </div>
      <div>
        <p className="glass__title">{t.soon.title}</p>
        <p>{t.soon.body}</p>
        {f.mu_measured !== null && f.mu_err !== null ? (
          <p className="soon__num"><span className="hud__num">{f.mu_measured.toFixed(2)}</span> ± {f.mu_err.toFixed(2)} {t.log.perYear}</p>
        ) : (
          <p>{t.soon.noMotion}</p>
        )}
        {s.barnard && <button type="button" className="launch launch--sm" onClick={() => s.pickField(s.barnard!)}><IconPlay /> {t.soon.open}</button>}
      </div>
    </div>
  );
}
