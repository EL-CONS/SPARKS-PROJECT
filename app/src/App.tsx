import { useEffect, useState } from 'react';
import { parseSkyQuery } from './core/coords';
import { parseUrlState, writeUrlState, UrlAppState } from './core/urlState';
import { usePlayer } from './core/player';
import { fetchFieldIndex, loadFieldAssets, IndexField, FieldAssetsResult } from './data/loader';
import { I18N } from './i18n';

function findNearestField(fields: IndexField[], ra: number, dec: number): IndexField | null {
  let best: IndexField | null = null;
  let minDist = Infinity;
  for (const f of fields) {
    const cosD = Math.cos((dec * Math.PI) / 180);
    const dRa = (((f.ra - ra + 540) % 360) - 180) * cosD;
    const dDec = f.dec - dec;
    const d = Math.hypot(dRa, dDec);
    if (d < minDist) {
      minDist = d;
      best = f;
    }
  }
  return best;
}

export default function App() {
  const [urlState, setUrlState] = useState<UrlAppState>(() =>
    parseUrlState(typeof window !== 'undefined' ? window.location.search : '')
  );
  const [fields, setFields] = useState<IndexField[]>([]);
  const [selected, setSelected] = useState<IndexField | null>(null);
  const [assets, setAssets] = useState<FieldAssetsResult | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [query, setQuery] = useState('');
  const [coordError, setCoordError] = useState<string | null>(null);

  const t = I18N[urlState.lang];
  const player = usePlayer({ totalFrames: 3, initialFps: 2, loop: true });

  useEffect(() => {
    document.documentElement.lang = urlState.lang;
    document.title = t.appTitle;
  }, [urlState.lang, t.appTitle]);

  useEffect(() => {
    let active = true;
    fetchFieldIndex(import.meta.env.BASE_URL)
      .then(list => {
        if (!active) return;
        setFields(list);
        const match = findNearestField(list, urlState.ra, urlState.dec) || list[0] || null;
        setSelected(match);
        setStatus('ready');
      })
      .catch(() => {
        if (active) setStatus('error');
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selected) return;
    let active = true;
    loadFieldAssets(selected, import.meta.env.BASE_URL)
      .then(res => {
        if (active) setAssets(res);
      })
      .catch(() => {
        if (active) setAssets({ status: 'soon', field: selected });
      });
    return () => {
      active = false;
    };
  }, [selected]);

  const updateUrl = (patch: Partial<UrlAppState>) => {
    const next = { ...urlState, ...patch };
    setUrlState(next);
    writeUrlState(next);
  };

  const selectTarget = (field: IndexField) => {
    setSelected(field);
    setCoordError(null);
    updateUrl({ ra: field.ra, dec: field.dec });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const res = parseSkyQuery(query);
    if (!res.ok) {
      setCoordError(
        res.error === 'empty'
          ? t.coordErrorEmpty
          : res.error === 'out_of_range'
            ? t.coordErrorRange
            : t.coordErrorFormat
      );
      return;
    }
    setCoordError(null);
    const match =
      (res.targetId && fields.find(f => f.id === res.targetId)) ||
      findNearestField(fields, res.ra, res.dec);
    if (match) setSelected(match);
    updateUrl({ ra: res.ra, dec: res.dec });
  };

  if (status === 'loading') return <main>{t.loading}</main>;
  if (status === 'error') return <main role="alert">{t.loadError}</main>;
  if (!selected) return <main>{t.emptyTitle}</main>;

  return (
    <main>
      <header>
        <h1>sparks</h1>
        <form onSubmit={handleSearch}>
          <label>
            {t.searchLabel}
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
            />
          </label>
          <button type="submit">{t.searchSubmit}</button>
        </form>
        {coordError && <p role="alert">{coordError}</p>}
        <button
          type="button"
          onClick={() => updateUrl({ lang: urlState.lang === 'en' ? 'es' : 'en' })}
        >
          {urlState.lang === 'en' ? 'ES' : 'EN'}
        </button>
      </header>

      <nav aria-label="Targets">
        {fields.slice(0, 5).map(f => (
          <button key={f.id} type="button" onClick={() => selectTarget(f)}>
            {f.name}
          </button>
        ))}
      </nav>

      <section>
        <div role="radiogroup" aria-label="Mode">
          {(['blink', 'stack', 'diff'] as const).map(m => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={urlState.mode === m}
              onClick={() => updateUrl({ mode: m })}
            >
              {m === 'blink' ? t.modeBlink : m === 'stack' ? t.modeStack : t.modeDiff}
            </button>
          ))}
        </div>

        {assets?.status === 'ready' ? (
          <div>
            {[1, 2, 3, 4, 5, 6].map(det => {
              const plate = assets.plates.find(p => p.det === det && p.season === player.frame);
              return (
                <figure key={det}>
                  <figcaption>D{det}</figcaption>
                  {plate && <img src={plate.pngUrl} alt={`D${det} S${player.frame}`} />}
                </figure>
              );
            })}
          </div>
        ) : (
          <div>
            <h2>{t.soonTitle}</h2>
            <p>{t.soonBody}</p>
            {fields[0] && (
              <button type="button" onClick={() => selectTarget(fields[0])}>
                {t.soonAction}
              </button>
            )}
          </div>
        )}

        <div>
          <button type="button" onClick={player.prev}>{t.prevFrame}</button>
          <button type="button" onClick={player.toggle}>
            {player.playing ? t.pause : t.play}
          </button>
          <button type="button" onClick={player.next}>{t.nextFrame}</button>
          <span>S{player.frame}</span>
          {[2, 4].map(fps => (
            <button key={fps} type="button" onClick={() => player.setSpeed(fps)}>
              {fps} Hz
            </button>
          ))}
        </div>
      </section>

      <aside>
        <h2>{selected.name}</h2>
        <p>{t.candidateLabel}</p>
        {selected.mu_measured !== null && (
          <p>
            {t.measuredMotion}: {selected.mu_measured.toFixed(2)} ± {(selected.mu_err ?? 0).toFixed(2)}
          </p>
        )}
        {selected.mu_expected !== null && (
          <p>
            {t.expectedCatalog}: {selected.mu_expected.toFixed(2)}
          </p>
        )}
        <p>{t.framesCombined}: {selected.n_frames}</p>
        <p>{t.seasonsCount(selected.seasons)}</p>
      </aside>
    </main>
  );
}
