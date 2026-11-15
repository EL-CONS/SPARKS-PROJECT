// Design-neutral state for every Sparks interface: URL state, field index,
// field data (PNGs, cubes, Gaia), the player, the subtraction pair, the
// flash-safety consent and the intro/explorer tab. Interfaces only render.
import { useCallback, useEffect, useRef, useState } from 'react';
import { parseSkyQuery } from '../../core/coords';
import { parseUrlState, writeUrlState, type UrlAppState, type ViewMode, type DetectorSelection } from '../../core/urlState';
import { usePlayer } from '../../core/player';
import {
  fetchFieldIndex,
  buildPlatesFromManifest,
  fetchLiveFieldStatus,
  type IndexField,
  type PlateAsset,
  type LiveFieldResponse,
} from '../../data/loader';
import { validateManifestJson } from '../../data/contract';
import { I18N } from '../../i18n';
import { UI } from '../../i18n/ui';
import { INTRO } from '../../i18n/intro';
import { angularDistanceDeg, loadCatalogs, loadCubes, type Cubes, type FullManifest, type GaiaSource, type WiseSource } from '../sky';
import { SHELL } from '../../i18n/shell';

function writeFlag(key: string) {
  try {
    localStorage.setItem(key, '1');
  } catch {
    /* ignore */
  }
}

export const BASE = import.meta.env.BASE_URL;
const FLASH_KEY = 'sparks-flash-ok';
export const SPEEDS = [1, 2, 3]; // Hz; 3 is the WCAG 2.3.1 ceiling
const FAR_DEG = 0.2;

export type Tab = 'inicio' | 'explorar';

export type FieldData =
  | { status: 'loading'; done: number; total: number }
  | { status: 'ready'; manifest: FullManifest; plates: PlateAsset[] }
  | { status: 'soon' }
  | { status: 'none' }
  | { status: 'error'; message?: string };

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
  const [indexError, setIndexError] = useState<string | null>(null);
  const [selected, setSelected] = useState<IndexField | null>(null);
  const [data, setData] = useState<FieldData>({ status: 'loading', done: 0, total: 0 });
  const [attempt, setAttempt] = useState(0);
  const [cubes, setCubes] = useState<Cubes | null>(null);
  const [gaia, setGaia] = useState<GaiaSource[]>([]);
  const [catwise, setCatwise] = useState<WiseSource[]>([]);
  const [pair, setPair] = useState<[number, number]>([0, 2]);
  const [askFlash, setAskFlash] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const [query, setQuery] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [far, setFar] = useState<{ field: IndexField; deg: number } | null>(null);
  const [liveField, setLiveField] = useState<LiveFieldResponse | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);

  const t = UI[url.lang];
  const core = I18N[url.lang];
  const intro = INTRO[url.lang];
  const shell = SHELL[url.lang];
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
    setIndexError(null);
    fetchFieldIndex(BASE)
      .then(list => {
        setFields(list);
        const u = parseUrlState(window.location.search);
        const near = nearestField(list, u.ra, u.dec);
        // Coordinates in a shared link that fall on no processed field: say so
        // instead of opening the nearest field as if it were that point.
        if (near.field && near.deg > FAR_DEG && new URLSearchParams(window.location.search).has('ra')) {
          setFar({ field: near.field, deg: near.deg });
          setSelected(null);
          return;
        }
        setSelected(near.field ?? list[0] ?? null);
      })
      .catch((err) => setIndexError(err instanceof Error ? err.message : 'Error desconocido al cargar index.json'));
  }, []);
  useEffect(loadIndex, [loadIndex]);

  useEffect(() => {
    if (!selected) {
      setData({ status: 'none' });
      setCubes(null);
      setGaia([]);
      setCatwise([]);
      return;
    }
    let alive = true;
    setData({ status: 'loading', done: 0, total: 0 });
    setCubes(null);
    setGaia([]);
    setCatwise([]);
    player.setFrame(0);
    (async () => {
      const folder = selected.folder || 'data-sample';
      const head = await fetch(`${BASE}${folder}/${selected.id}/manifest.json`).catch(() => null);
      if (!alive) return;
      if (!head) return setData({ status: 'error', message: 'No se pudo conectar para obtener manifest.json' });
      // A missing folder is a 404, or Vite's SPA fallback (HTML with 200) in dev.
      const isJson = (head.headers.get('content-type') ?? '').includes('json');
      if (head.status === 404 || (head.ok && !isJson)) return setData({ status: 'soon' });
      if (!head.ok) return setData({ status: 'error', message: `HTTP ${head.status} al descargar manifest.json` });
      const raw = await head.json();
      const check = validateManifestJson(raw);
      if (!check.ok) {
        const first = check.issues[0];
        return setData({
          status: 'error',
          message: `Error de contrato en manifest.json (${first.path}): ${first.message}`,
        });
      }
      const manifest = check.data as unknown as FullManifest;
      const plates = buildPlatesFromManifest(selected.id, manifest, BASE, folder);
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
      loadCubes(BASE, selected.id, folder).then(c => alive && setCubes(c)).catch(() => undefined);
      loadCatalogs(BASE, selected.id, folder).then(c => {
        if (!alive) return;
        setGaia(c.gaia);
        setCatwise(c.catwise);
      });
    })().catch((err) => {
      if (!alive) return;
      const message = err instanceof Error ? err.message : undefined;
      setData({ status: 'error', message });
    });
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
      setSelected(null);
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

  const queryLiveField = useCallback(
    async (ra: number, dec: number, apiBaseUrl = 'http://localhost:3001') => {
      setLiveLoading(true);
      try {
        const initial = await fetchLiveFieldStatus(ra, dec, apiBaseUrl);
        setLiveField(initial);
        if (initial.status === 'en_cola' || initial.status === 'procesando') {
          let current = initial;
          const start = Date.now();
          while (
            (current.status === 'en_cola' || current.status === 'procesando') &&
            Date.now() - start < 15000
          ) {
            await new Promise(r => setTimeout(r, 1000));
            current = await fetchLiveFieldStatus(ra, dec, apiBaseUrl);
            setLiveField(current);
          }
        }
      } catch (err) {
        setLiveField({
          status: 'fallo',
          error_code: 'ERROR_CONEXION',
          mensaje: err instanceof Error ? err.message : 'No se pudo conectar con el servidor de campos en vivo',
        });
      } finally {
        setLiveLoading(false);
      }
    },
    []
  );

  const clearLiveField = useCallback(() => {
    setLiveField(null);
  }, []);

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
    catwise,
    shell,
    setFov: (fov: number) => updateUrl({ fov }),
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
    liveField,
    liveLoading,
    queryLiveField,
    clearLiveField,
    startWithField,
    barnard: fields?.find(f => f.id === 'barnard'),
  };
}

export type Sparks = ReturnType<typeof useSparks>;
