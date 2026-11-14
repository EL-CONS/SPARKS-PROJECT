// Iteración 2 · Escotilla. Cosmos's infinite sky + the Club's mission, as a
// one-step-at-a-time guide. Buttons are chunky "keys" that press in; panels
// are "hatches": deep, borderless, lit along the top edge.
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

type Step = 1 | 2 | 3;

/** A chunky key: an icon tile on the left, the action on the right. */
function Key({ icon, children, tone = 'plain', className, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { icon?: React.ReactNode; tone?: 'plain' | 'now' }) {
  return (
    <button type="button" {...rest} className={`key key--${tone}${className ? ` ${className}` : ''}`}>
      {icon && <span className="key__tile" aria-hidden="true">{icon}</span>}
      <span className="key__label">{children}</span>
    </button>
  );
}

export default function App() {
  const s = useSparks();
  const { theme, toggle } = useTheme();
  const [step, setStep] = useState<Step>(1);
  const labels = useMemo(() => {
    const out: Record<string, string> = {};
    for (const id of ['barnard', 'wise0855', 'epsindib', 'rwaur', 'rdra']) out[id] = s.t.targets[id]?.short ?? id;
    return out;
  }, [s.t]);
  const es = s.url.lang === 'es';
  return (
    <div className="hx">
      <Starfield theme={theme} labels={labels} quiet={s.tab === 'explorar'} />
      <a className="skip" href="#mision">{s.t.skip}</a>
      <header className="hx-top">
        <button type="button" className="hx-brand" onClick={() => s.setTab('inicio')}>
          <img src={theme === 'light' ? symbolLight : symbol} alt="" width={40} height={40} />
          Sparks
        </button>
        <nav className="hx-tabs" aria-label={es ? 'Secciones' : 'Sections'}>
          <button type="button" aria-current={s.tab === 'inicio' ? 'page' : undefined} onClick={() => s.setTab('inicio')}>{s.intro.tabs.start}</button>
          <button type="button" aria-current={s.tab === 'explorar' ? 'page' : undefined} onClick={() => s.setTab('explorar')}>{s.intro.tabs.explore}</button>
        </nav>
        <span className="hx-tools">
          <button type="button" onClick={() => s.setLang(es ? 'en' : 'es')} lang={es ? 'en' : 'es'} aria-label={`${s.t.nav.lang}: ${s.t.nav.langName}`}>{es ? 'EN' : 'ES'}</button>
          <button type="button" role="switch" aria-checked={theme === 'light'} aria-label={`${s.t.nav.theme}: ${theme === 'light' ? s.t.nav.themeLight : s.t.nav.themeDark}`} onClick={toggle}>
            {theme === 'light' ? <IconSun /> : <IconMoon />}
          </button>
        </span>
      </header>
      <main id="mision">
        {s.tab === 'inicio' ? (
          <Welcome s={s} theme={theme} onGo={() => { setStep(2); s.startWithField(s.barnard); }} />
        ) : (
          <Guide s={s} step={step} setStep={setStep} />
        )}
      </main>
      <footer className="hx-foot">
        <p>{s.t.footer.honest}</p>
        <p>{es ? 'Los astros del fondo son ilustraciones de los objetivos del reto.' : 'The bodies in the background are illustrations of the challenge targets.'} {s.t.footer.data} {s.t.footer.team}</p>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ inicio */

function Welcome({ s, theme, onGo }: { s: Sparks; theme: string; onGo: () => void }) {
  const i = s.intro;
  return (
    <section className="wel" aria-labelledby="wel-t">
      <img className="wel__logo" src={theme === 'light' ? symbolLight : symbol} alt="" width={320} height={320} />
      <h1 id="wel-t" className="wel__name">Sparks</h1>
      <p className="wel__motto">{i.motto}</p>
      <p className="wel__alt" lang={s.url.lang === 'es' ? 'en' : 'es'}>{i.mottoAlt}</p>
      <p className="wel__what">{i.what}</p>
      <ol className="wel__how" aria-label={i.how.title}>
        <li className="hatch hatch--sm">
          <span className="orb orb--before" aria-hidden="true" />
          <b>{i.how.before}</b>
          <span>{i.how.beforeText}</span>
        </li>
        <li className="hatch hatch--sm">
          <span className="orb orb--now" aria-hidden="true" />
          <b>{i.how.now}</b>
          <span>{i.how.nowText}</span>
        </li>
        <li className="hatch hatch--sm">
          <svg className="mini-arrow" viewBox="0 0 120 56" aria-hidden="true">
            <circle cx="16" cy="42" r="10" className="c-before" />
            <path d="M30 36 C 56 18, 78 14, 96 18" className="mini-arrow__p" />
            <path d="M86 9 L98 18 L86 27" className="mini-arrow__p" />
            <circle cx="106" cy="18" r="12" className="c-now" />
          </svg>
          <b>{i.how.arrow}</b>
          <span>{i.how.arrowText}</span>
        </li>
      </ol>
      <Key tone="now" icon={<IconPlay />} onClick={onGo} className="key--xl">{i.cta}</Key>
      <p className="wel__pluto">{i.pluto}</p>
    </section>
  );
}

/* ------------------------------------------------------------------ guide */

function Guide({ s, step, setStep }: { s: Sparks; step: Step; setStep: (n: Step) => void }) {
  const { t } = s;
  const es = s.url.lang === 'es';
  const ready = s.data.status === 'ready';
  const titles: Record<Step, string> = {
    1: es ? 'Elige un astro' : 'Pick a sky object',
    2: es ? 'Mira el cielo' : 'Watch the sky',
    3: es ? '¿Qué pasó?' : 'What happened?',
  };
  return (
    <div className="guide">
      <ol className="stepper" aria-label={es ? 'Pasos de la misión' : 'Mission steps'}>
        {([1, 2, 3] as Step[]).map(n => (
          <li key={n}>
            <button type="button" className={`stepper__b${step === n ? ' is-on' : ''}${step > n ? ' is-done' : ''}`} aria-current={step === n ? 'step' : undefined} disabled={n === 3 && !ready} onClick={() => setStep(n)}>
              <span className="stepper__n">{n}</span>
              <span className="stepper__t">{titles[n]}</span>
            </button>
          </li>
        ))}
      </ol>

      <section className="hatch hatch--main" aria-labelledby="step-t">
        <h1 id="step-t" className="step-title">{titles[step]}</h1>
        {s.indexError && (
          <div className="alert" role="alert">
            <p>{s.core.loadError}</p>
            <Key onClick={s.retryIndex}>{t.stage.retry}</Key>
          </div>
        )}
        {step === 1 && <Pick s={s} onNext={() => setStep(2)} />}
        {step === 2 && <Watch s={s} />}
        {step === 3 && s.data.status === 'ready' && (
          <Insights lang={s.url.lang} t={t} manifest={s.data.manifest} field={s.selected!} det={s.det === 'all' ? 6 : s.det} season={s.mode === 'diff' ? s.pair[1] : s.player.frame} />
        )}
      </section>

      <nav className="guide__nav" aria-label={es ? 'Navegar pasos' : 'Step navigation'}>
        {step > 1 ? (
          <Key icon={<IconPrev />} onClick={() => setStep((step - 1) as Step)}>{es ? 'Atrás' : 'Back'}</Key>
        ) : (
          <span />
        )}
        {step < 3 && (
          <Key tone="now" icon={<IconNext />} onClick={() => setStep((step + 1) as Step)} disabled={step === 2 && !ready}>
            {step === 1 ? (es ? 'Siguiente: mira el cielo' : 'Next: watch the sky') : es ? 'Siguiente: ¿qué pasó?' : 'Next: what happened?'}
          </Key>
        )}
      </nav>
    </div>
  );
}

function Pick({ s, onNext }: { s: Sparks; onNext: () => void }) {
  const { t } = s;
  const es = s.url.lang === 'es';
  return (
    <>
      <ul className="bodies">
        {(s.fields ?? []).slice(0, 5).map(f => {
          const on = s.selected?.id === f.id;
          const kind = f.kind === 'variable' ? 'variable' : f.id === 'barnard' ? 'nearStar' : 'brownDwarf';
          return (
            <li key={f.id}>
              <button
                type="button"
                className={`body${on ? ' is-on' : ''}`}
                aria-pressed={on}
                onClick={() => {
                  s.pickField(f);
                  if (f.id === 'barnard') onNext();
                }}
              >
                <span className="body__art"><AstroArt kind={kind} /></span>
                <span className="body__name">{t.targets[f.id]?.short ?? f.name}</span>
                <span className="body__note">{t.targets[f.id]?.note ?? f.note}</span>
                <span className={`body__tag${f.id === 'barnard' ? ' body__tag--ready' : ''}`}>{f.id === 'barnard' ? (es ? 'fotos listas' : 'photos ready') : t.search.soonTag}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="tiny">{t.astros.illustration}: {t.astros.intro}</p>
      <form
        className="find"
        role="search"
        onSubmit={e => {
          e.preventDefault();
          s.submitSearch();
        }}
      >
        <label htmlFor="q">{es ? '¿O tienes coordenadas?' : 'Or got coordinates?'}</label>
        <div className="find__row">
          <input id="q" value={s.query} onChange={e => s.setQuery(e.target.value)} placeholder="269.4486 4.7672" aria-describedby="q-hint" autoComplete="off" spellCheck={false} />
          <Key type="submit" icon={<IconSearch />}>{t.search.submit}</Key>
        </div>
        <p id="q-hint" className="tiny">{t.search.hint} <Term id="radec" t={t} /></p>
        {s.searchError && <p className="err" role="alert">{s.searchError}</p>}
        {s.far && (
          <p className="tiny" role="status">
            {t.search.noField(t.targets[s.far.field.id]?.short ?? s.far.field.name, s.far.deg.toFixed(1))}{' '}
            <button type="button" className="tlink" onClick={() => s.pickField(s.far!.field)}>{t.search.nearest}</button>
          </p>
        )}
      </form>
    </>
  );
}

function Watch({ s }: { s: Sparks }) {
  const { t, player } = s;
  const es = s.url.lang === 'es';
  const [gaia, setGaia] = useState(false);
  const f = s.selected;
  return (
    <>
      {f && (
        <div className="who">
          <p className="who__name">{f.id === 'barnard' ? (es ? 'Estrella de Barnard' : 'Barnard’s Star') : f.name}</p>
          <p className="who__coords">RA {toHms(f.ra)} · Dec {toDms(f.dec)}</p>
        </div>
      )}
      {s.data.status === 'loading' && f && (
        <div className="loading" role="status">
          <span className="loading__bar"><span style={{ width: `${s.data.total ? (s.data.done / s.data.total) * 100 : 0}%` }} /></span>
          {t.stage.loading(s.data.done, s.data.total || 18)}
        </div>
      )}
      {s.data.status === 'error' && (
        <div className="alert" role="alert">
          <p>{t.stage.loadFailed}</p>
          <Key onClick={s.retryField}>{t.stage.retry}</Key>
        </div>
      )}
      {s.data.status === 'soon' && f && (
        <div className="soon">
          <span className="soon__art"><AstroArt kind={f.kind === 'variable' ? 'variable' : 'brownDwarf'} /></span>
          <div>
            <p className="soon__t">{t.soon.title}</p>
            <p>{t.soon.body}</p>
            {f.mu_measured !== null && f.mu_err !== null ? (
              <p><Term id="properMotion" t={t} />: <b className="num">{f.mu_measured.toFixed(2)} ± {f.mu_err.toFixed(2)}</b> {t.log.perYear}</p>
            ) : (
              <p>{t.soon.noMotion}</p>
            )}
            {s.barnard && <Key tone="now" icon={<IconPlay />} onClick={() => s.pickField(s.barnard!)}>{t.soon.open}</Key>}
          </div>
        </div>
      )}
      {s.data.status === 'ready' && (
        <>
          <p className="say">{t.layer1.generic}</p>
          <div className="seg" role="group" aria-label={t.modes.label}>
            {(['blink', 'stack', 'diff'] as const).map(mo => (
              <button key={mo} type="button" aria-pressed={s.mode === mo} onClick={() => s.setMode(mo)}>
                <b>{mo === 'blink' ? t.modes.blink : mo === 'stack' ? t.modes.stack : t.modes.diff}</b>
                <span>{mo === 'blink' ? t.modes.blinkHelp : mo === 'stack' ? t.modes.stackHelp : t.modes.diffHelp}</span>
              </button>
            ))}
          </div>
          {s.askFlash && (
            <div className="alert" role="alertdialog" aria-labelledby="fl-t" aria-describedby="fl-b">
              <p id="fl-t" className="alert__t">{t.flash.title}</p>
              <p id="fl-b">{t.flash.body}</p>
              <div className="alert__row">
                <Key tone="now" icon={<IconPlay />} onClick={s.acceptFlash} autoFocus>{t.flash.ok}</Key>
                <Key icon={<IconNext />} onClick={s.declineFlash}>{t.flash.step}</Key>
              </div>
            </div>
          )}
          <div className="viewport">
            <Stage t={t} manifest={s.data.manifest} plates={s.data.plates} cubes={s.cubes} mode={s.mode} frame={player.frame} pair={s.pair} det={s.det} onDet={s.setDet} showMarks showGaia={gaia} gaia={s.gaia} />
          </div>
          <div className="panel-row">
            {s.mode === 'blink' && (
              <span className="pad">
                <button type="button" className="pad__b" onClick={player.prev} aria-label={t.transport.prev}><IconPrev /></button>
                <button type="button" className={`pad__b pad__b--play${player.playing ? ' is-on' : ''}`} onClick={s.togglePlay} aria-pressed={player.playing} aria-label={player.playing ? t.transport.pause : t.transport.play}>
                  {player.playing ? <IconPause /> : <IconPlay />}
                </button>
                <button type="button" className="pad__b" onClick={player.next} aria-label={t.transport.next}><IconNext /></button>
              </span>
            )}
            {s.mode === 'diff' ? (
              <span className="toggles" role="group" aria-label={t.transport.pairLabel}>
                {s.data.manifest.diffs.filter(d => d.det === 1).map(d => (
                  <button key={`${d.a}${d.b}`} type="button" aria-pressed={s.pair[0] === d.a && s.pair[1] === d.b} onClick={() => s.setPair([d.a, d.b])}>
                    <i className="d d--b" />{seasonLabel(s.data.status === 'ready' ? s.data.manifest.seasons[d.a].start : '', t.months)} → <i className="d d--a" />{seasonLabel(s.data.status === 'ready' ? s.data.manifest.seasons[d.b].start : '', t.months)}
                  </button>
                ))}
              </span>
            ) : (
              <ol className="toggles" aria-label={t.log.title}>
                {s.data.manifest.seasons.map((se, i) => {
                  const now = s.mode === 'blink' && i === player.frame;
                  return (
                    <li key={se.id}>
                      <button type="button" className={now ? 'is-now' : undefined} disabled={s.mode === 'stack'} onClick={() => s.pickSeason(i)} aria-current={now ? 'step' : undefined}>
                        <i className={`d${now ? ' d--a' : s.mode === 'blink' && player.frame > 0 && i === 0 ? ' d--b' : ''}`}>{now && <span key={s.flashKey} className="lens" />}</i>
                        {seasonLabel(se.start, t.months)}
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}
            {s.mode === 'blink' && (
              <span className="toggles" role="group" aria-label={t.transport.speed}>
                {SPEEDS.map((hz, k) => (
                  <button key={hz} type="button" aria-pressed={player.fps === hz} onClick={() => player.setSpeed(hz)}>{t.transport.speeds[k]}</button>
                ))}
              </span>
            )}
            <label className="check">
              <input type="checkbox" checked={gaia} onChange={e => setGaia(e.target.checked)} /> {t.stage.gaiaLayer}
            </label>
          </div>
          <p className="tiny">{s.mode === 'stack' ? t.transport.stackIdle : t.transport.speedNote}</p>
        </>
      )}
    </>
  );
}
