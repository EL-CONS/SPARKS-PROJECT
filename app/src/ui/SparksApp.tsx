import { useCallback, useEffect, useRef, useState } from 'react';
import { parseSkyQuery } from '../core/coords';
import { parseUrlState, writeUrlState, type UrlAppState, type ViewMode, type DetectorSelection } from '../core/urlState';
import { usePlayer } from '../core/player';
import { fetchFieldIndex, buildPlatesFromManifest, type IndexField, type PlateAsset } from '../data/loader';
import { I18N } from '../i18n';
import { UI, type UiDict } from '../i18n/ui';
import { useTheme, readFlag, writeFlag } from './useTheme';
import { loadCubes, loadGaia, angularDistanceDeg, toHms, toDms, seasonLabel, type Cubes, type FullManifest, type GaiaSource } from './sky';
import { Stage } from './components/Stage';
import { Log } from './components/Log';
import { Layers } from './components/Layers';
import { Astros, AstroArt } from './components/Astros';
import { Term } from './components/Term';
import { IconBook, IconLink, IconMoon, IconNext, IconPause, IconPlay, IconPrev, IconSearch, IconSun } from './components/Icons';
import logoDark from './assets/logo-horizontal.svg';
import logoLight from './assets/logo-horizontal-light.svg';

const BASE = import.meta.env.BASE_URL;
const FLASH_KEY = 'sparks-flash-ok';
const SPEEDS = [1, 2, 3]; // Hz; 3 is the WCAG 2.3.1 ceiling
const FAR_DEG = 0.2; // a field covers ~0.11°; beyond this we say so

function nearest(fields: IndexField[], ra: number, dec: number) {
  let best: IndexField | null = null;
  let d = Infinity;
  for (const f of fields) {
    const x = angularDistanceDeg(ra, dec, f.ra, f.dec);
    if (x < d) {
      d = x;
      best = f;
    }
  }
  return { field: best, deg: d };
}

type FieldData =
  | { status: 'loading'; done: number; total: number }
  | { status: 'ready'; manifest: FullManifest; plates: PlateAsset[] }
  | { status: 'soon' }
  | { status: 'error' };

export default function SparksApp() {
  const [url, setUrl] = useState<UrlAppState>(() => parseUrlState(window.location.search));
  const t = UI[url.lang];
  const core = I18N[url.lang];
  const { theme, toggle: toggleTheme } = useTheme();
  const [fields, setFields] = useState<IndexField[] | null>(null);
  const [indexError, setIndexError] = useState(false);
  const [selected, setSelected] = useState<IndexField | null>(null);
  const [copied, setCopied] = useState(false);

  const updateUrl = useCallback((patch: Partial<UrlAppState>) => {
    setUrl(prev => {
      const next = { ...prev, ...patch };
      writeUrlState(next);
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.lang = url.lang;
    document.title = url.lang === 'es' ? 'Sparks · Mira qué se mueve en el cielo' : 'Sparks · See what moves in the sky';
  }, [url.lang]);

  const loadIndex = useCallback(() => {
    setIndexError(false);
    fetchFieldIndex(BASE)
      .then(list => {
        setFields(list);
        setSelected(nearest(list, url.ra, url.dec).field ?? list[0] ?? null);
      })
      .catch(() => setIndexError(true));
    // url is read once on boot on purpose
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(loadIndex, [loadIndex]);

  const pickField = (f: IndexField) => {
    setSelected(f);
    updateUrl({ ra: f.ra, dec: f.dec });
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard blocked: the URL bar already carries the state */
    }
  };

  return (
    <div className="app">
      <a className="skip" href="#cielo">{t.skip}</a>
      <header className="topbar">
        <a className="topbar__brand" href={`${window.location.pathname}?lang=${url.lang}`} aria-label="Sparks">
          <img src={theme === 'light' ? logoLight : logoDark} alt="Sparks" width={128} height={theme === 'light' ? 45 : 60} className={`topbar__logo topbar__logo--${theme}`} />
        </a>
        <nav className="topbar__nav" aria-label={url.lang === 'es' ? 'Herramientas' : 'Tools'}>
          <a className="tbtn" href="#glosario">
            <IconBook />
            <span>{t.nav.glossary}</span>
          </a>
          <button type="button" className="tbtn" onClick={share} aria-live="polite">
            <IconLink />
            <span>{copied ? t.nav.copied : t.nav.share}</span>
          </button>
          <button
            type="button"
            className="tbtn"
            onClick={() => updateUrl({ lang: url.lang === 'es' ? 'en' : 'es' })}
            lang={url.lang === 'es' ? 'en' : 'es'}
            aria-label={`${t.nav.lang}: ${t.nav.langName}`}
          >
            <span className="tbtn__code">{url.lang === 'es' ? 'EN' : 'ES'}</span>
            <span className="tbtn__long">{t.nav.langName}</span>
          </button>
          <button
            type="button"
            className="tbtn tbtn--theme"
            role="switch"
            aria-checked={theme === 'light'}
            aria-label={`${t.nav.theme}: ${theme === 'light' ? t.nav.themeLight : t.nav.themeDark}`}
            onClick={toggleTheme}
          >
            {theme === 'light' ? <IconSun /> : <IconMoon />}
            <span className="tbtn__long">{theme === 'light' ? t.nav.themeLight : t.nav.themeDark}</span>
          </button>
        </nav>
      </header>

      <main id="main">
        <SearchBar t={t} core={core} fields={fields} selected={selected} onPick={pickField} onCoords={(ra, dec) => updateUrl({ ra, dec })} />

        {indexError && (
          <div className="notice notice--error" role="alert">
            <p>{core.loadError}</p>
            <button type="button" className="btn" onClick={loadIndex}>{t.stage.retry}</button>
          </div>
        )}
        {!fields && !indexError && <p className="loading-line" role="status">{core.loading}</p>}
        {fields && !fields.length && <p className="notice">{core.emptyTitle}</p>}

        {selected && fields && (
          <FieldView
            key={selected.id}
            t={t}
            url={url}
            field={selected}
            barnard={fields.find(f => f.id === 'barnard') ?? fields[0]}
            onPickField={pickField}
            updateUrl={updateUrl}
          />
        )}

        <Astros t={t} />
        <section className="story" aria-labelledby="story-title">
          <h2 id="story-title" className="h-section">{t.story.title}</h2>
          <p className="story__body">{t.story.body}</p>
        </section>
        <Glossary t={t} />
      </main>

      <footer className="footer">
        <p className="footer__honest">{t.footer.honest}</p>
        <p>{t.footer.data} {t.footer.built}</p>
        <p className="footer__team">{t.footer.team}</p>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ search */

function SearchBar({
  t,
  core,
  fields,
  selected,
  onPick,
  onCoords,
}: {
  t: UiDict;
  core: (typeof I18N)['es'];
  fields: IndexField[] | null;
  selected: IndexField | null;
  onPick: (f: IndexField) => void;
  onCoords: (ra: number, dec: number) => void;
}) {
  const [q, setQ] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [far, setFar] = useState<{ field: IndexField; deg: number } | null>(null);
  const targets = (fields ?? []).slice(0, 5);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setFar(null);
    const r = parseSkyQuery(q);
    if (!r.ok) {
      setErr(r.error === 'empty' ? core.coordErrorEmpty : r.error === 'out_of_range' ? core.coordErrorRange : core.coordErrorFormat);
      return;
    }
    setErr(null);
    if (!fields) return;
    const byId = r.targetId ? fields.find(f => f.id === r.targetId) : undefined;
    if (byId) return onPick(byId);
    const n = nearest(fields, r.ra, r.dec);
    if (!n.field) return;
    if (n.deg > FAR_DEG) {
      onCoords(r.ra, r.dec);
      setFar({ field: n.field, deg: n.deg });
      return;
    }
    onPick(n.field);
  };

  return (
    <section className="search" aria-label={t.search.label}>
      <form className="search__form" onSubmit={submit} role="search">
        <label className="search__label" htmlFor="sky-q">
          {t.search.label}
          <span className="search__hint" id="sky-q-hint">
            {t.search.hint} <Term id="radec" t={t} />
          </span>
        </label>
        <div className="search__field">
          <IconSearch className="search__icon" />
          <input
            id="sky-q"
            className="search__input"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder={t.search.placeholder}
            aria-describedby={`sky-q-hint${err ? ' sky-q-err' : ''}`}
            aria-invalid={!!err}
            autoComplete="off"
            spellCheck={false}
          />
          <button type="submit" className="btn btn--ghost search__go">{t.search.submit}</button>
        </div>
        {err && <p id="sky-q-err" className="search__error" role="alert">{err}</p>}
        {far && (
          <p className="search__far" role="status">
            {t.search.noField(t.targets[far.field.id]?.short ?? far.field.name, far.deg.toFixed(1))}{' '}
            <button type="button" className="linkbtn" onClick={() => { onPick(far.field); setFar(null); }}>
              {t.search.nearest}
            </button>
          </p>
        )}
      </form>

      <div className="stamps" role="group" aria-labelledby="stamps-label">
        <span id="stamps-label" className="stamps__label">{t.search.tryLabel}</span>
        <ul className="stamps__grid">
          {targets.map(f => {
            const isSel = selected?.id === f.id;
            const real = f.id === 'barnard';
            const kind = f.kind === 'variable' ? 'variable' : f.id === 'barnard' ? 'nearStar' : 'brownDwarf';
            return (
              <li key={f.id}>
                <button type="button" className={`stamp${isSel ? ' is-current' : ''}${real ? '' : ' stamp--soon'}`} aria-pressed={isSel} onClick={() => onPick(f)}>
                  <span className="stamp__img" aria-hidden="true">
                    {real && f.thumb ? <img src={`${BASE}data-sample/${f.thumb}`} alt="" width={48} height={48} /> : <AstroArt kind={kind} />}
                  </span>
                  <span className="stamp__text">
                    <span className="stamp__name">{t.targets[f.id]?.short ?? f.name}</span>
                    <span className="stamp__code">{toHms(f.ra).slice(0, 6)} {toDms(f.dec).slice(0, 4)}</span>
                  </span>
                  {!real && <span className="stamp__soon">{t.search.soonTag}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- field view */

function FieldView({
  t,
  url,
  field,
  barnard,
  onPickField,
  updateUrl,
}: {
  t: UiDict;
  url: UrlAppState;
  field: IndexField;
  barnard: IndexField;
  onPickField: (f: IndexField) => void;
  updateUrl: (p: Partial<UrlAppState>) => void;
}) {
  const [data, setData] = useState<FieldData>({ status: 'loading', done: 0, total: 0 });
  const [attempt, setAttempt] = useState(0);
  const [cubes, setCubes] = useState<Cubes | null>(null);
  const [gaia, setGaia] = useState<GaiaSource[]>([]);
  const seasonsCount = field.seasons || 3;
  const player = usePlayer({ totalFrames: seasonsCount, initialFps: 1, loop: true });
  const [pair, setPair] = useState<[number, number]>([0, seasonsCount - 1]);
  const [showMarks, setShowMarks] = useState(true);
  const [showGaia, setShowGaia] = useState(false);
  const [askFlash, setAskFlash] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const pausedOnce = useRef(false);

  // The portada opens still: nothing blinks until someone asks for it.
  useEffect(() => {
    if (!pausedOnce.current) {
      pausedOnce.current = true;
      player.pause();
    }
  }, [player]);

  useEffect(() => setFlashKey(k => k + 1), [player.frame]);

  useEffect(() => {
    let alive = true;
    setData({ status: 'loading', done: 0, total: 0 });
    (async () => {
      const head = await fetch(`${BASE}data-sample/${field.id}/manifest.json`).catch(() => null);
      if (!alive) return;
      if (!head) return setData({ status: 'error' });
      // A missing field folder comes back as 404, or (Vite's SPA fallback in
      // dev) as the app's own HTML with 200: both mean "not in this bundle".
      const isJson = (head.headers.get('content-type') ?? '').includes('json');
      if (head.status === 404 || (head.ok && !isJson)) return setData({ status: 'soon' });
      if (!head.ok) return setData({ status: 'error' });
      const manifest = (await head.json()) as FullManifest;
      const plates = buildPlatesFromManifest(field.id, manifest, BASE);
      let done = 0;
      const total = plates.length;
      if (alive) setData({ status: 'loading', done, total });
      await Promise.all(
        plates.map(
          p =>
            new Promise<void>(res => {
              const img = new Image();
              img.onload = img.onerror = () => {
                done += 1;
                if (alive) setData({ status: 'loading', done, total });
                res();
              };
              img.src = p.pngUrl;
            }),
        ),
      );
      if (!alive) return;
      setData({ status: 'ready', manifest, plates });
      loadCubes(BASE, field.id).then(c => alive && setCubes(c)).catch(() => undefined);
      loadGaia(BASE, field.id).then(g => alive && setGaia(g));
    })().catch(() => alive && setData({ status: 'error' }));
    return () => {
      alive = false;
    };
  }, [field.id, attempt]);

  const mode = url.mode;
  const setMode = (m: ViewMode) => {
    if (m !== 'blink') player.pause();
    updateUrl({ mode: m });
  };

  const startWatching = () => {
    if (!readFlag(FLASH_KEY)) {
      setAskFlash(true);
      return;
    }
    if (mode !== 'blink') updateUrl({ mode: 'blink' });
    player.play();
  };
  const acceptFlash = () => {
    writeFlag(FLASH_KEY);
    setAskFlash(false);
    if (mode !== 'blink') updateUrl({ mode: 'blink' });
    player.play();
  };
  const togglePlay = () => {
    if (player.playing) return player.pause();
    startWatching();
  };

  const seasonsMeta = data.status === 'ready' ? data.manifest.seasons : [];
  const detNum = url.det === 'all' ? 6 : url.det;

  return (
    <div className="field" id="cielo">
      <div className="field__head">
        <div className="field__title">
          <h1 className="h-field">{field.id === 'barnard' ? (url.lang === 'es' ? 'Estrella de Barnard' : 'Barnard’s Star') : field.name}</h1>
          <p className="field__coords num">
            <span>RA {toHms(field.ra)}</span>
            <span>Dec {toDms(field.dec)}</span>
            <span className="field__deg">({field.ra.toFixed(4)}°, {field.dec.toFixed(4)}°)</span>
          </p>
          <p className="field__note">{t.targets[field.id]?.note ?? field.note}</p>
        </div>
        <div className="field__lede">
          <p className="lede">{t.layer1.generic}</p>
          {data.status === 'ready' && (
            <button type="button" className={`btn btn--now${player.playing ? ' is-on' : ''}`} onClick={togglePlay} aria-pressed={player.playing}>
              <span className="btn__glow" aria-hidden="true" />
              {player.playing ? <IconPause /> : <IconPlay />}
              <span>{player.playing ? t.transport.pause : t.layer1.cta}</span>
            </button>
          )}
        </div>
      </div>

      {askFlash && (
        <div className="notice notice--flash" role="alertdialog" aria-labelledby="flash-t" aria-describedby="flash-b">
          <p id="flash-t" className="notice__title">{t.flash.title}</p>
          <p id="flash-b">{t.flash.body}</p>
          <div className="notice__actions">
            <button type="button" className="btn btn--now" onClick={acceptFlash} autoFocus>
              <span className="btn__glow" aria-hidden="true" />
              <IconPlay />
              <span>{t.flash.ok}</span>
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => { setAskFlash(false); player.next(); }}>
              {t.flash.step}
            </button>
          </div>
        </div>
      )}

      {data.status === 'soon' && <Soon t={t} field={field} onBarnard={() => onPickField(barnard)} />}

      {data.status === 'error' && (
        <div className="notice notice--error" role="alert">
          <p>{t.stage.loadFailed}</p>
          <button type="button" className="btn" onClick={() => setAttempt(a => a + 1)}>{t.stage.retry}</button>
        </div>
      )}

      {data.status === 'loading' && (
        <div className="stage-wait" role="status" aria-live="polite">
          <div className="stage-wait__grid" aria-hidden="true">
            {Array.from({ length: 6 }, (_, i) => <span key={i} className={i < Math.round((data.done / Math.max(1, data.total)) * 6) ? 'is-in' : ''} />)}
          </div>
          <p>{data.total ? t.stage.loading(data.done, data.total) : t.stage.loading(0, 18)}</p>
        </div>
      )}

      {data.status === 'ready' && (
        <div className="field__body">
          <section className="sky" aria-labelledby="sky-title">
            <div className="sky__bar">
              <h2 id="sky-title" className="sr-only">{t.stage.title}</h2>
              <div className="modes" role="group" aria-label={t.modes.label}>
                {(['blink', 'stack', 'diff'] as const).map(m => (
                  <button key={m} type="button" aria-pressed={mode === m} className="modes__opt" onClick={() => setMode(m)}>
                    <span className="modes__name">{m === 'blink' ? t.modes.blink : m === 'stack' ? t.modes.stack : t.modes.diff}</span>
                    <span className="modes__help">{m === 'blink' ? t.modes.blinkHelp : m === 'stack' ? t.modes.stackHelp : t.modes.diffHelp}</span>
                  </button>
                ))}
              </div>
              <div className="toggles">
                <label className="chk">
                  <input type="checkbox" checked={showMarks} onChange={e => setShowMarks(e.target.checked)} />
                  <span>{t.stage.marks}</span>
                </label>
                <label className="chk">
                  <input type="checkbox" checked={showGaia} onChange={e => setShowGaia(e.target.checked)} />
                  <span>{t.stage.gaiaLayer}</span>
                </label>
              </div>
            </div>

            <div className="sky__plate">
              <Stage
                t={t}
                manifest={data.manifest}
                plates={data.plates}
                cubes={cubes}
                mode={mode}
                frame={player.frame}
                pair={pair}
                det={url.det}
                onDet={(d: DetectorSelection) => updateUrl({ det: d })}
                showMarks={showMarks}
                showGaia={showGaia}
                gaia={gaia}
              />
              {(showMarks || showGaia) && <p className="sky__marksnote">{t.stage.marksNote}</p>}
            </div>

            <div className="transport" role="group" aria-label={t.stage.title}>
              {mode === 'blink' && (
                <>
                  <button type="button" className="tbtn tbtn--round" onClick={player.prev} aria-label={t.transport.prev}>
                    <IconPrev />
                  </button>
                  <button type="button" className="tbtn tbtn--round tbtn--play" onClick={togglePlay} aria-label={player.playing ? t.transport.pause : t.transport.play} aria-pressed={player.playing}>
                    {player.playing ? <IconPause /> : <IconPlay />}
                  </button>
                  <button type="button" className="tbtn tbtn--round" onClick={player.next} aria-label={t.transport.next}>
                    <IconNext />
                  </button>
                  <div className="transport__pos" aria-live="polite">
                    <span className="transport__frame">{t.transport.frameOf(player.frame + 1, player.totalFrames)}</span>
                    <span className="transport__when num">{seasonLabel(seasonsMeta[player.frame]?.start ?? '', t.months)}</span>
                  </div>
                  <div className="speed" role="group" aria-label={t.transport.speed} aria-describedby="speed-note">
                    <span className="speed__label" aria-hidden="true">{t.transport.speed}</span>
                    {SPEEDS.map((hz, i) => (
                      <button key={hz} type="button" aria-pressed={player.fps === hz} className="speed__opt" onClick={() => player.setSpeed(hz)}>
                        {t.transport.speeds[i]} <span className="num">{hz} Hz</span>
                      </button>
                    ))}
                    <span id="speed-note" className="sr-only">{t.transport.speedNote}</span>
                  </div>
                </>
              )}
              {mode === 'stack' && <p className="transport__idle">{t.transport.stackIdle}</p>}
              {mode === 'diff' && (
                <div className="pairs" role="group" aria-label={t.transport.pairLabel}>
                  <span className="pairs__label">{t.transport.pairLabel}</span>
                  {data.manifest.diffs
                    .filter(d => d.det === 1)
                    .map(d => {
                      const on = pair[0] === d.a && pair[1] === d.b;
                      return (
                        <button key={`${d.a}-${d.b}`} type="button" aria-pressed={on} className="pairs__opt" onClick={() => setPair([d.a, d.b])}>
                          <i className="dot dot--before" aria-hidden="true" />
                          {seasonLabel(seasonsMeta[d.a].start, t.months)}
                          <span aria-hidden="true"> → </span>
                          <i className="dot dot--now" aria-hidden="true" />
                          {seasonLabel(seasonsMeta[d.b].start, t.months)}
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
            <p className="transport__safety">{t.transport.speedNote}</p>
          </section>

          <aside className="field__side">
            <Log
              t={t}
              manifest={data.manifest}
              field={field}
              mode={mode}
              frame={player.frame}
              pair={pair}
              flashKey={flashKey}
              onPick={s => {
                if (mode === 'diff') {
                  if (s === pair[1] || s === pair[0]) return;
                  setPair(s > pair[1] ? [pair[1], s] : s < pair[0] ? [s, pair[1]] : [pair[0], s]);
                } else player.setFrame(s);
              }}
            />
            {(data.manifest as FullManifest & { kind?: string }).kind === 'mover' && data.manifest.target.measured && <Verdict t={t} />}
          </aside>
        </div>
      )}

      {data.status === 'ready' && (
        <Layers t={t} manifest={data.manifest} field={field} det={detNum} season={mode === 'diff' ? pair[1] : player.frame} />
      )}
    </div>
  );
}

function Verdict({ t }: { t: UiDict }) {
  return (
    <section className="verdict" aria-labelledby="verdict-title">
      <h3 id="verdict-title" className="verdict__title">{t.verdict.title}</h3>
      <p className="verdict__class">{t.verdict.mover}</p>
      <p className="verdict__why">{t.verdict.moverWhy}</p>
      <p className="verdict__missing">{t.verdict.coldMissing}</p>
      <p className="verdict__rule">
        {t.verdict.ruleNote} <Term id="candidate" t={t} />
      </p>
    </section>
  );
}

function Soon({ t, field, onBarnard }: { t: UiDict; field: IndexField; onBarnard: () => void }) {
  const kind = field.kind === 'variable' ? 'variable' : 'brownDwarf';
  return (
    <section className="soon" aria-labelledby="soon-title">
      <div className="soon__art">
        <AstroArt kind={kind} />
        <span className="astro__tag">{t.astros.illustration}</span>
      </div>
      <div className="soon__text">
        <h2 id="soon-title" className="h-section">{t.soon.title}</h2>
        <p>{t.soon.body}</p>
        <h3 className="h-sub">{t.soon.measuredSoFar}</h3>
        {field.mu_measured !== null && field.mu_err !== null ? (
          <dl className="soon__nums">
            <div>
              <dt><Term id="properMotion" t={t} /></dt>
              <dd>
                <b className="num">{field.mu_measured.toFixed(2)} ± {field.mu_err.toFixed(2)}</b> <span className="unit">{t.log.perYear}</span>
              </dd>
            </div>
            {field.mu_expected !== null && (
              <div>
                <dt>{field.in_gaia ? 'Gaia DR3' : <Term id="catwise" t={t}>CatWISE2020</Term>}</dt>
                <dd>
                  <b className="num">{field.mu_expected.toFixed(2)}</b> <span className="unit">{t.log.perYear}</span>
                </dd>
              </div>
            )}
            <div>
              <dt>{t.layers.rows.images}</dt>
              <dd><b className="num">{field.n_frames}</b> · {field.releases.join(' + ')}</dd>
            </div>
          </dl>
        ) : (
          <p>
            {t.soon.noMotion} <Term id="variable" t={t} />
          </p>
        )}
        <button type="button" className="btn btn--now" onClick={onBarnard}>
          <span className="btn__glow" aria-hidden="true" />
          <IconPlay />
          <span>{t.soon.open}</span>
        </button>
      </div>
    </section>
  );
}

function Glossary({ t }: { t: UiDict }) {
  const entries = Object.values(t.terms).sort((a, b) => a.label.localeCompare(b.label));
  return (
    <section className="glossary" id="glosario" aria-labelledby="glossary-title" tabIndex={-1}>
      <h2 id="glossary-title" className="h-section">{t.glossary.title}</h2>
      <dl className="glossary__list">
        {entries.map(e => (
          <div key={e.label} className="glossary__item">
            <dt>{e.label}</dt>
            <dd>{e.short}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
