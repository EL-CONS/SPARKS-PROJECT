// Captura la app real de Sparks para la presentación: fotos a 1920×1080, una en
// teléfono (390×844) y un video corto del recorrido, en español y en inglés.
// Usa Chromium sin interfaz por el protocolo DevTools (WebSocket nativo de Node)
// y ffmpeg para armar el video. No toca la app: solo la abre y hace clic.
//
// Uso (con la app corriendo, por ejemplo `npm run dev` en app/ o la URL de AWS):
//   node docs/pitch/presentacion/capturar-app.mjs http://localhost:5190/
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const BASE = (process.argv[2] || 'http://localhost:5190/').replace(/\/?$/, '/');
const OUT = path.join(path.dirname(new URL(import.meta.url).pathname), 'assets', 'app');
fs.mkdirSync(OUT, { recursive: true });
const PORT = 9333;
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'sparks-cap-'));
const sleep = ms => new Promise(r => setTimeout(r, ms));

const chrome = spawn('chromium', [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--hide-scrollbars', '--force-color-profile=srgb', '--window-size=1920,1080', 'about:blank',
], { stdio: 'ignore' });

async function target() {
  for (let k = 0; k < 50; k++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      const page = list.find(t => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch { /* todavía arranca */ }
    await sleep(200);
  }
  throw new Error('Chromium no respondió');
}

const ws = new WebSocket(await target());
await new Promise(r => ws.addEventListener('open', r, { once: true }));
let seq = 0;
const pending = new Map();
ws.addEventListener('message', ev => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});
const cdp = (method, params = {}) => new Promise((res, rej) => {
  const id = ++seq;
  pending.set(id, m => (m.error ? rej(new Error(`${method}: ${m.error.message}`)) : res(m.result)));
  ws.send(JSON.stringify({ id, method, params }));
});
const js = async expr => (await cdp('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result.value;

async function viewport(w, h, mobile = false) {
  await cdp('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: mobile ? 2 : 1, mobile });
}
async function open(url) {
  await cdp('Page.navigate', { url });
  await sleep(2500);
}
async function shot(name) {
  const { data } = await cdp('Page.captureScreenshot', { format: 'jpeg', quality: 88 });
  fs.writeFileSync(path.join(OUT, name), Buffer.from(data, 'base64'));
  console.log('foto', name);
}
// Clic en el primer botón cuyo texto o etiqueta cumpla la expresión
const click = re => js(`(() => { const b = [...document.querySelectorAll('button')].find(b => ${re}.test((b.innerText||'') + ' ' + (b.getAttribute('aria-label')||''))); if (b) b.click(); return !!b; })()`);
const scrollTo = sel => js(`(() => { const e = document.querySelector('${sel}'); if (e) e.scrollIntoView({ block: 'center' }); return !!e; })()`);

const L = {
  es: { step2: /^2\s*Mira/, step3: /^3\s*¿Qué/, diff: /^Resta/, blink: /^Parpadeo/, play: /Reproducir/, target: /^Medir el objetivo/ },
  en: { step2: /^2\s*(Watch|Look)/, step3: /^3\s*What/, diff: /^(Subtract|Difference)/, blink: /^Blink/, play: /\bPlay\b/, target: /^Measure the target/ },
};

await cdp('Page.enable');
await cdp('Runtime.enable');

for (const lang of ['es', 'en']) {
  const t = L[lang];
  await viewport(1920, 1080);
  // 1 · Portada de la app
  await open(`${BASE}?lang=${lang}#inicio`);
  await sleep(1500);
  await shot(`${lang}-inicio.jpg`);
  // 2 · La mira con los cinco objetivos
  await open(`${BASE}?ra=269.4486&dec=4.7672&lang=${lang}#explorar`);
  await sleep(1500);
  await shot(`${lang}-mira.jpg`);
  // 3 · Barnard en resta, seis detectores
  await click(t.step2); await sleep(2500);
  await click(t.diff); await sleep(1500);
  await scrollTo('.stage'); await sleep(800);
  await shot(`${lang}-barnard-resta.jpg`);
  // 4 · ¿Qué pasó? con la flecha medida
  await click(t.step3); await sleep(2500);
  await js(`(() => { const f = [...document.querySelectorAll('figcaption')].find(f => /10\\.23/.test(f.innerText)); if (f) f.scrollIntoView({ block: 'center' }); return !!f; })()`);
  await sleep(1200);
  await shot(`${lang}-barnard-que-paso.jpg`);
  // 5 · WISE 0855: espectro al vuelo
  await open(`${BASE}?ra=133.7602&dec=-7.2407&mode=diff&lang=${lang}#explorar`);
  await sleep(1500);
  await click(t.step2); await sleep(2500);
  await click(t.target); await sleep(4000);
  await scrollTo('.spec'); await sleep(1000);
  await shot(`${lang}-wise0855-espectro.jpg`);
  // 6 · Teléfono
  await viewport(390, 844, true);
  await open(`${BASE}?ra=269.4486&dec=4.7672&mode=blink&lang=${lang}#explorar`);
  await sleep(1200);
  await click(t.step2); await sleep(2500);
  await scrollTo('.stage'); await sleep(800);
  await shot(`${lang}-telefono.jpg`);

  // Video del recorrido (1280×720, 12 cuadros por segundo)
  await viewport(1280, 720);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `sparks-vid-${lang}-`));
  let n = 0;
  const rec = async ms => {
    const end = Date.now() + ms;
    while (Date.now() < end) {
      const t0 = Date.now();
      const { data } = await cdp('Page.captureScreenshot', { format: 'jpeg', quality: 85 });
      fs.writeFileSync(path.join(dir, `f${String(n++).padStart(5, '0')}.jpg`), Buffer.from(data, 'base64'));
      await sleep(Math.max(0, 83 - (Date.now() - t0)));
    }
  };
  await open(`${BASE}?ra=269.4486&dec=4.7672&lang=${lang}#explorar`);
  await rec(2200);
  await click(t.step2); await rec(2000);
  await scrollTo('.stage'); await click(t.blink); await click(t.play); await rec(4500);
  await click(t.diff); await rec(2500);
  await click(t.step3); await rec(1800);
  await js(`(() => { const f = [...document.querySelectorAll('figcaption')].find(f => /10\\.23/.test(f.innerText)); if (f) f.scrollIntoView({ behavior: 'smooth', block: 'center' }); })()`);
  await rec(3000);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '12', '-i', path.join(dir, 'f%05d.jpg'),
    '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '36', '-pix_fmt', 'yuv420p', path.join(OUT, `${lang}-recorrido.webm`)]);
  console.log('video', `${lang}-recorrido.webm`, n, 'cuadros');
  fs.rmSync(dir, { recursive: true, force: true });
}

ws.close();
chrome.kill();
await new Promise(r => chrome.once('exit', r));
try { fs.rmSync(profile, { recursive: true, force: true }); } catch { /* Chromium aún suelta archivos: se queda en /tmp */ }
