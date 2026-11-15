// Design-neutral state for every Sparks interface: URL state, field index,
// field data (PNGs, cubes, Gaia), the player, the subtraction pair, the
// flash-safety consent and the intro/explorer tab. Interfaces only render.
import { useCallback, useEffect, useRef, useState } from 'react';
import { parseSkyQuery } from '../../core/coords';
import { parseUrlState, writeUrlState, type UrlAppState, type ViewMode, type DetectorSelection } from '../../core/urlState';
import { usePlayer } from '../../core/player';
import { fetchFieldIndex, buildPlatesFromManifest, type IndexField, type PlateAsset } from '../../data/loader';
import { I18N } from '../../i18n';
import { UI } from '../../i18n/ui';
import { INTRO } from '../../i18n/intro';
import { readFlag, writeFlag } from '../useTheme';
import { angularDistanceDeg, loadCubes, loadGaia, type Cubes, type FullManifest, type GaiaSource } from '../sky';

export const BASE = import.meta.env.BASE_URL;
const FLASH_KEY = 'sparks-flash-ok';
export const SPEEDS = [1, 2, 3]; // Hz; 3 is the WCAG 2.3.1 ceiling
const FAR_DEG = 0.2;

export type Tab = 'inicio' | 'explorar';

export type FieldData =
  | { status: 'loading'; done: number; total: number }
  | { status: 'ready'; manifest: FullManifest; plates: PlateAsset[] }
  | { status: 'soon' }
  | { status: 'error' };

export function nearestField(fields: IndexField[], ra: number, dec: number) {
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

function readTab(): Tab {
  const h = window.location.hash.replace('#', '');
  if (h === 'inicio' || h === 'explorar') return h;
  // A shared link with coordinates opens straight on the tool.
  return new URLSearchParams(window.location.search).has('ra') ? 'explorar' : 'inicio';
}

export function useSparks() {
  const [url, setUrl] = useState<UrlAppState>(() => parseUrlState(window.location.search));
  const [tab, setTabState] = useState<Tab>(readTab);
  const [fields, setFields] = useState<IndexField[] | null>(null);
  const [indexError, setIndexError] = useState(false);
  const [selected, setSelected] = useState<IndexField | null>(null);
  const [data, setData] = useState<FieldData>({ status: 'loading', done: 0, total: 0 });
  const [attempt, setAttempt] = useState(0);
  const [cubes, setCubes] = useState<Cubes | null>(null);
  const [gaia, setGaia] = useState<GaiaSource[]>([]);
  const [pair, setPair] = useState<[number, number]>([0, 2]);
  const [askFlash, setAskFlash] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const [query, setQuery] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [far, setFar] = useState<{ field: IndexField; deg: number } | null>(null);

  const t = UI[url.lang];
  const core = I18N[url.lang];
  const intro = INTRO[url.lang];
  const player = usePlayer({ totalFrames: 3, initialFps: 1, loop: true });
  const paused = useRef(false);

  // Nothing blinks until someone asks for it.
  useEffect(() => {
    if (!paused.current) {
      paused.current = true;
      player.pause();
    }
  }, [player]);
  useEffect(() => setFlashKey(k => k + 1), [player.frame]);

  const updateUrl = useCallback((patch: Partial<UrlAppState>) => {
    setUrl(prev => {
      const next = { ...prev, ...patch };
      writeUrlState(next);
      if (window.location.hash !== `#${readTab()}`) window.history.replaceState({}, '', `${window.location.pathname}${window.location.search}#${tabRef.current}`);
      return next;
    });
  }, []);

  const tabRef = useRef<Tab>(tab);
  const setTab = useCallback((next: Tab) => {
    tabRef.current = next;
    setTabState(next);
    window.history.replaceState({}, '', `${window.location.pathname}${window.location.search}#${next}`);
    window.scrollTo({ top: 0 });
  }, []);
  useEffect(() => {
    const onHash = () => {
      const n = readTab();
      tabRef.current = n;
      setTabState(n);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
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
        const u = parseUrlState(window.location.search);
        setSelected(nearestField(list, u.ra, u.dec).field ?? list[0] ?? null);
      })
      .catch(() => setIndexError(true));
  }, []);
  useEffect(loadIndex, [loadIndex]);

  useEffect(() => {
    if (!selected) return;
    let alive = true;
    setData({ status: 'loading', done: 0, total: 0 });
    setCubes(null);
    setGaia([]);
    player.setFrame(0);
    (async () => {
      const head = await fetch(`${BASE}data-sample/${selected.id}/manifest.json`).catch(() => null);
      if (!alive) return;
      if (!head) return setData({ status: 'error' });
      // A missing folder is a 404, or Vite's SPA fallback (HTML with 200) in dev.
      const isJson = (head.headers.get('content-type') ?? '').includes('json');
      if (head.status === 404 || (head.ok && !isJson)) return setData({ status: 'soon' });
      if (!head.ok) return setData({ status: 'error' });
      const manifest = (await head.json()) as FullManifest;
      const plates = buildPlatesFromManifest(selected.id, manifest, BASE);
      let done = 0;
      const total = plates.length;
      setData({ status: 'loading', done, total });
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
      setPair([0, manifest.seasons.length - 1]);
      setData({ status: 'ready', manifest, plates });
      loadCubes(BASE, selected.id).then(c => alive && setCubes(c)).catch(() => undefined);
      loadGaia(BASE, selected.id).then(g => alive && setGaia(g));
    })().catch(() => alive && setData({ status: 'error' }));
    return () => {
      alive = false;
    };
    // player.setFrame is stable in behaviour; re-running on it would loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, attempt]);

  const pickField = useCallback(
    (f: IndexField) => {
      setSelected(f);
      setFar(null);
      setSearchError(null);
      updateUrl({ ra: f.ra, dec: f.dec });
    },
    [updateUrl],
  );

  const submitSearch = useCallback(() => {
    setFar(null);
    const r = parseSkyQuery(query);
    if (!r.ok) {
      setSearchError(r.error === 'empty' ? core.coordErrorEmpty : r.error === 'out_of_range' ? core.coordErrorRange : core.coordErrorFormat);
      return;
    }
    setSearchError(null);
    if (!fields) return;
    const byId = r.targetId ? fields.find(f => f.id === r.targetId) : undefined;
    if (byId) return pickField(byId);
    const n = nearestField(fields, r.ra, r.dec);
    if (!n.field) return;
    if (n.deg > FAR_DEG) {
      updateUrl({ ra: r.ra, dec: r.dec });
      setFar({ field: n.field, deg: n.deg });
      return;
    }
    pickField(n.field);
  }, [query, fields, core, pickField, updateUrl]);

  const setMode = useCallback(
    (m: ViewMode) => {
      if (m !== 'blink') player.pause();
      updateUrl({ mode: m });
    },
    [player, updateUrl],
  );

  const play = useCallback(() => {
    if (!readFlag(FLASH_KEY)) {
      setAskFlash(true);
      return;
    }
    if (url.mode !== 'blink') updateUrl({ mode: 'blink' });
    player.play();
  }, [player, url.mode, updateUrl]);

  const acceptFlash = useCallback(() => {
    writeFlag(FLASH_KEY);
    setAskFlash(false);
    if (url.mode !== 'blink') updateUrl({ mode: 'blink' });
    player.play();
  }, [player, url.mode, updateUrl]);

  const declineFlash = useCallback(() => {
    setAskFlash(false);
    player.next();
  }, [player]);

  const togglePlay = useCallback(() => (player.playing ? player.pause() : play()), [player, play]);

  /** From the intro: open the tool on a field and start watching. */
  const startWithField = useCallback(
    (f: IndexField | undefined) => {
      if (f) pickField(f);
      setTab('explorar');
    },
    [pickField, setTab],
  );

  const pickSeason = useCallback(
    (s: number) => {
      if (url.mode === 'diff') {
        if (s === pair[0] || s === pair[1]) return;
        setPair(s > pair[1] ? [pair[1], s] : s < pair[0] ? [s, pair[1]] : [pair[0], s]);
      } else player.setFrame(s);
    },
    [url.mode, pair, player],
  );

  return {
    url,
    t,
    core,
    intro,
    tab,
    setTab,
    fields,
    indexError,
    retryIndex: loadIndex,
    selected,
    pickField,
    data,
    retryField: () => setAttempt(a => a + 1),
    cubes,
    gaia,
    player,
    pair,
    setPair,
    pickSeason,
    mode: url.mode,
    setMode,
    det: url.det,
    setDet: (d: DetectorSelection) => updateUrl({ det: d }),
    setLang: (lang: 'es' | 'en') => updateUrl({ lang }),
    askFlash,
    acceptFlash,
    declineFlash,
    togglePlay,
    flashKey,
    query,
    setQuery,
    submitSearch,
    searchError,
    far,
    startWithField,
    barnard: fields?.find(f => f.id === 'barnard'),
  };
}

export type Sparks = ReturnType<typeof useSparks>;
