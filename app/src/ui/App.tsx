// Iteración 3 · Planetario. Cosmos's infinite sky + the Club's characters.
// The start tab is a dome: the logo at the centre and the five challenge
// bodies on an orbit around it. The tool puts the sky in the middle with a
// round console under it; the charts are chapters, answer left, chart right.
import { useMemo, useState } from 'react';
import { useSparks, SPEEDS, type Sparks } from './kit/useSparks';
import { Starfield } from './kit/Starfield';
import { Insights } from './kit/Insights';
import { useTheme } from './useTheme';
import { Stage } from './components/Stage';
import { Term } from './components/Term';
import { AstroArt } from './components/Astros';
import { IconMoon, IconNext, IconPause, IconPlay, IconPrev, IconSearch, IconSun } from './components/Icons';
import { seasonLabel, toDms, toHms } from './sky';
import symbol from './assets/symbol.svg';
import symbolLight from './assets/symbol-flat-light.svg';
import type { ViewMode } from '../core/urlState';

const KIND: Record<string, 'nearStar' | 'brownDwarf' | 'variable'> = {
  barnard: 'nearStar',
  wise0855: 'brownDwarf',
  epsindib: 'brownDwarf',
  rwaur: 'variable',
  rdra: 'variable',
};

/** Round console button: a circle with its label underneath. */
function Dial({ label, children, on, big, className, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; on?: boolean; big?: boolean }) {
  return (
    <button type="button" {...rest} className={`dial${on ? ' is-on' : ''}${big ? ' dial--big' : ''}${className ? ` ${className}` : ''}`}>
      <span className="dial__ring" aria-hidden="true">{children}</span>
      <span className="dial__label">{label}</span>
    </button>
  );
}

function ModeIcon({ mode }: { mode: ViewMode }) {
  if (mode === 'blink')
    return (
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
        <circle cx="8" cy="15" r="4" fill="var(--before)" />
        <circle cx="16" cy="9" r="4.5" fill="var(--now)" />
      </svg>
    );
  if (mode === 'stack')
    return (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 4 L21 9 L12 14 L3 9 Z" />
        <path d="M3 13 L12 18 L21 13" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <circle cx="9" cy="12" r="6" fill="var(--before)" opacity="0.9" />
      <circle cx="15" cy="12" r="6" fill="var(--now)" opacity="0.9" />
      <rect x="6" y="11" width="12" height="2" rx="1" fill="currentColor" />
    </svg>
  );
}

export default function App() {
  const s = useSparks();
  const { theme, toggle } = useTheme();
  const labels = useMemo(() => {
    const out: Record<string, string> = {};
    for (const id of Object.keys(KIND)) out[id] = s.t.targets[id]?.short ?? id;
    return out;
  }, [s.t]);
  const es = s.url.lang === 'es';
  return (
    <div className="pl">
      <Starfield theme={theme} labels={labels} quiet />
      <a className="skip" href="#domo">{s.t.skip}</a>
      <header className="pl-top">
        <button type="button" className="pl-brand" onClick={() => s.setTab('inicio')}>
          <img src={theme === 'light' ? symbolLight : symbol} alt="" width={36} height={36} />
          Sparks
        </button>
        <nav className="pl-nav" aria-label={es ? 'Secciones' : 'Sections'}>
          <button type="button" aria-current={s.tab === 'inicio' ? 'page' : undefined} onClick={() => s.setTab('inicio')}>{s.intro.tabs.start}</button>
          <button type="button" aria-current={s.tab === 'explorar' ? 'page' : undefined} onClick={() => s.setTab('explorar')}>{s.intro.tabs.explore}</button>
        </nav>
        <span className="pl-tools">
          <button type="button" onClick={() => s.setLang(es ? 'en' : 'es')} lang={es ? 'en' : 'es'} aria-label={`${s.t.nav.lang}: ${s.t.nav.langName}`}>{es ? 'EN' : 'ES'}</button>
          <button type="button" role="switch" aria-checked={theme === 'light'} aria-label={`${s.t.nav.theme}: ${theme === 'light' ? s.t.nav.themeLight : s.t.nav.themeDark}`} onClick={toggle}>
            {theme === 'light' ? <IconSun /> : <IconMoon />}
          </button>
        </span>
      </header>
      <main id="domo">{s.tab === 'inicio' ? <Dome s={s} theme={theme} /> : <Show s={s} />}</main>
      <footer className="pl-foot">
        <p>{s.t.footer.honest}</p>
        <p>{es ? 'Los astros en órbita y en el fondo son ilustraciones de los objetivos del reto.' : 'The orbiting and background bodies are illustrations of the challenge targets.'} {s.t.footer.data} {s.t.footer.team}</p>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ dome */

function Dome({ s, theme }: { s: Sparks; theme: string }) {
  const i = s.intro;
  const ids = Object.keys(KIND);
  return (
    <section className="dome" aria-labelledby="dome-t">
      <div className="orbit">
        <div className="orbit__ring" aria-hidden="true" />
        <ul className="orbit__bodies" aria-label={s.url.lang === 'es' ? 'Los cinco objetivos del reto (ilustración)' : 'The five challenge targets (illustration)'}>
          {ids.map((id, k) => (
            <li key={id} style={{ ['--a' as string]: `${(k / ids.length) * 360}deg` }}>
              <button type="button" className="orbit__body" onClick={() => s.startWithField((s.fields ?? []).find(f => f.id === id))}>
                <AstroArt kind={KIND[id]} />
                <span>{s.t.targets[id]?.short}</span>
              </button>
            </li>
          ))}
        </ul>
        <img className="orbit__logo" src={theme === 'light' ? symbolLight : symbol} alt="" width={300} height={300} />
      </div>
      <h1 id="dome-t" className="dome__name">Sparks</h1>
      <p className="dome__motto">{i.motto}</p>
      <p className="dome__alt" lang={s.url.lang === 'es' ? 'en' : 'es'}>{i.mottoAlt}</p>
      <p className="dome__what">{i.what}</p>
      <dl className="dome__how" aria-label={i.how.title}>
        <div>
          <dt><span className="lamp lamp--before" aria-hidden="true" />{i.how.before}</dt>
          <dd>{i.how.beforeText}</dd>
        </div>
        <div>
          <dt><span className="lamp lamp--now" aria-hidden="true" />{i.how.now}</dt>
          <dd>{i.how.nowText}</dd>
        </div>
        <div>
          <dt>
            <svg className="lamp-arrow" viewBox="0 0 48 20" aria-hidden="true">
              <circle cx="6" cy="14" r="5" fill="var(--before)" />
              <path d="M12 12 L36 6 M30 2 L38 6 L31 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="42" cy="6" r="5" fill="var(--now)" />
            </svg>
            {i.how.arrow}
          </dt>
          <dd>{i.how.arrowText}</dd>
        </div>
      </dl>
      <Dial big on label={i.cta} onClick={() => s.startWithField(s.barnard)}>
        <IconPlay />
      </Dial>
      <p className="dome__pluto">{i.pluto}</p>
      <p className="dome__ill">{s.t.astros.illustration}: {s.url.lang === 'es' ? 'los astros en órbita son dibujos de los cinco objetivos; tócalos para ir a cada uno.' : 'the orbiting bodies are drawings of the five targets; tap one to go there.'}</p>
    </section>
  );
}

/* ------------------------------------------------------------------ show */

function Show({ s }: { s: Sparks }) {
  const { t, player } = s;
  const es = s.url.lang === 'es';
  const [gaia, setGaia] = useState(false);
  const f = s.selected;
  return (
    <div className="show">
      <section className="tour" aria-labelledby="tour-t">
        <h2 id="tour-t" className="tour__t">{es ? '¿A dónde miramos?' : 'Where do we look?'}</h2>
        <ul className="tour__row">
          {(s.fields ?? []).slice(0, 5).map(fl => {
            const on = s.selected?.id === fl.id;
            return (
              <li key={fl.id}>
                <button type="button" className={`avatar${on ? ' is-on' : ''}`} aria-pressed={on} onClick={() => s.pickField(fl)}>
                  <span className="avatar__disc"><AstroArt kind={KIND[fl.id] ?? 'nearStar'} /></span>
                  <span className="avatar__name">{t.targets[fl.id]?.short ?? fl.name}</span>
                  <span className="avatar__tag">{fl.id === 'barnard' ? (es ? 'con fotos' : 'with photos') : t.search.soonTag}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <form
          className="seek"
          role="search"
          onSubmit={e => {
            e.preventDefault();
            s.submitSearch();
          }}
        >
          <label htmlFor="q" className="sr-only">{t.search.label}</label>
          <IconSearch />
          <input id="q" value={s.query} onChange={e => s.setQuery(e.target.value)} placeholder={es ? 'O escribe RA y Dec: 269.4486 4.7672' : 'Or type RA and Dec: 269.4486 4.7672'} aria-describedby="q-hint" autoComplete="off" spellCheck={false} />
          <button type="submit">{t.search.submit}</button>
        </form>
        <p id="q-hint" className="hint">{t.search.hint} <Term id="radec" t={t} /></p>
        {s.searchError && <p className="err" role="alert">{s.searchError}</p>}
        {s.far && (
          <p className="hint" role="status">
            {t.search.noField(t.targets[s.far.field.id]?.short ?? s.far.field.name, s.far.deg.toFixed(1))}{' '}
            <button type="button" className="tlink" onClick={() => s.pickField(s.far!.field)}>{t.search.nearest}</button>
          </p>
        )}
        <p className="hint">{t.astros.illustration}: {t.astros.intro}</p>
      </section>

      {s.indexError && (
        <div className="callout" role="alert">
          <p>{s.core.loadError}</p>
          <button type="button" className="pill" onClick={s.retryIndex}>{t.stage.retry}</button>
        </div>
      )}

      {f && (
        <header className="title">
          <h1 className="title__name">{f.id === 'barnard' ? (es ? 'Estrella de Barnard' : 'Barnard’s Star') : f.name}</h1>
          <p className="title__note">{t.targets[f.id]?.note ?? f.note}</p>
          <p className="title__coords">RA {toHms(f.ra)} · Dec {toDms(f.dec)}</p>
        </header>
      )}

      {f && s.data.status === 'loading' && (
        <div className="loading" role="status">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="50" className="loading__track" />
            <circle cx="60" cy="60" r="50" className="loading__fill" style={{ strokeDasharray: `${(s.data.total ? s.data.done / s.data.total : 0) * 314} 314` }} />
          </svg>
          <p>{t.stage.loading(s.data.done, s.data.total || 18)}</p>
        </div>
      )}
      {s.data.status === 'error' && (
        <div className="callout" role="alert">
          <p>{t.stage.loadFailed}</p>
          <button type="button" className="pill" onClick={s.retryField}>{t.stage.retry}</button>
        </div>
      )}
      {s.data.status === 'soon' && f && (
        <div className="callout callout--soon">
          <span className="callout__art"><AstroArt kind={KIND[f.id] ?? 'brownDwarf'} /></span>
          <div>
            <p className="callout__t">{t.soon.title}</p>
            <p>{t.soon.body}</p>
            {f.mu_measured !== null && f.mu_err !== null ? (
              <p><Term id="properMotion" t={t} />: <b className="num">{f.mu_measured.toFixed(2)} ± {f.mu_err.toFixed(2)}</b> {t.log.perYear}</p>
            ) : (
              <p>{t.soon.noMotion}</p>
            )}
            {s.barnard && <button type="button" className="pill pill--now" onClick={() => s.pickField(s.barnard!)}>{t.soon.open}</button>}
          </div>
        </div>
      )}

      {s.data.status === 'ready' && (
        <>
          <p className="lede">{t.layer1.generic}</p>
          <div className="dome-view">
            <Stage t={t} manifest={s.data.manifest} plates={s.data.plates} cubes={s.cubes} mode={s.mode} frame={player.frame} pair={s.pair} det={s.det} onDet={s.setDet} showMarks showGaia={gaia} gaia={s.gaia} />
          </div>

          {s.askFlash && (
            <div className="callout" role="alertdialog" aria-labelledby="fl-t" aria-describedby="fl-b">
              <p id="fl-t" className="callout__t">{t.flash.title}</p>
              <p id="fl-b">{t.flash.body}</p>
              <div className="callout__row">
                <button type="button" className="pill pill--now" onClick={s.acceptFlash} autoFocus>{t.flash.ok}</button>
                <button type="button" className="pill" onClick={s.declineFlash}>{t.flash.step}</button>
              </div>
            </div>
          )}

          <div className="console" role="group" aria-label={t.modes.label}>
            <div className="console__group">
              {(['blink', 'stack', 'diff'] as const).map(mo => (
                <Dial key={mo} on={s.mode === mo} aria-pressed={s.mode === mo} label={mo === 'blink' ? t.modes.blink : mo === 'stack' ? t.modes.stack : t.modes.diff} onClick={() => s.setMode(mo)}>
                  <ModeIcon mode={mo} />
                </Dial>
              ))}
            </div>
            {s.mode === 'blink' && (
              <div className="console__group console__group--main">
                <Dial label={es ? 'Atrás' : 'Back'} onClick={player.prev} aria-label={t.transport.prev}><IconPrev /></Dial>
                <Dial big on={player.playing} aria-pressed={player.playing} label={player.playing ? t.transport.pause : t.transport.play} onClick={s.togglePlay}>
                  {player.playing ? <IconPause /> : <IconPlay />}
                </Dial>
                <Dial label={es ? 'Adelante' : 'Forward'} onClick={player.next} aria-label={t.transport.next}><IconNext /></Dial>
              </div>
            )}
            <div className="console__group console__group--side">
              {s.mode === 'blink' &&
                SPEEDS.map((hz, k) => (
                  <Dial key={hz} on={player.fps === hz} aria-pressed={player.fps === hz} label={t.transport.speeds[k]} onClick={() => player.setSpeed(hz)}>
                    <span className="hz">{hz}<small>Hz</small></span>
                  </Dial>
                ))}
            </div>
          </div>

          <div className="when">
            {s.mode === 'diff' ? (
              <span className="when__row" role="group" aria-label={t.transport.pairLabel}>
                {s.data.manifest.diffs.filter(d => d.det === 1).map(d => (
                  <button key={`${d.a}${d.b}`} type="button" className="pill" aria-pressed={s.pair[0] === d.a && s.pair[1] === d.b} onClick={() => s.setPair([d.a, d.b])}>
                    <i className="d d--b" />{seasonLabel(s.data.status === 'ready' ? s.data.manifest.seasons[d.a].start : '', t.months)} → <i className="d d--a" />{seasonLabel(s.data.status === 'ready' ? s.data.manifest.seasons[d.b].start : '', t.months)}
                  </button>
                ))}
              </span>
            ) : (
              <ol className="when__row" aria-label={t.log.title}>
                {s.data.manifest.seasons.map((se, i) => {
                  const now = s.mode === 'blink' && i === player.frame;
                  return (
                    <li key={se.id}>
                      <button type="button" className={`pill${now ? ' is-now' : ''}`} disabled={s.mode === 'stack'} onClick={() => s.pickSeason(i)} aria-current={now ? 'step' : undefined}>
                        <i className={`d${now ? ' d--a' : s.mode === 'blink' && player.frame > 0 && i === 0 ? ' d--b' : ''}`}>{now && <span key={s.flashKey} className="lens" />}</i>
                        {seasonLabel(se.start, t.months)}
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}
            <label className="check">
              <input type="checkbox" checked={gaia} onChange={e => setGaia(e.target.checked)} /> {t.stage.gaiaLayer}
            </label>
          </div>
          <p className="hint hint--c">{s.mode === 'stack' ? t.transport.stackIdle : t.transport.speedNote}</p>

          <div className="chapters">
            <Insights lang={s.url.lang} t={t} manifest={s.data.manifest} field={f!} det={s.det === 'all' ? 6 : s.det} season={s.mode === 'diff' ? s.pair[1] : player.frame} />
          </div>
        </>
      )}
    </div>
  );
}
