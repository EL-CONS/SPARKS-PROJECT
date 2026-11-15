import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

const DATA_SAMPLE_DIR = path.resolve(__dirname, '../data-sample');
const DATA_NEW_DIR = path.resolve(__dirname, '../data-new');

const MIME: Record<string, string> = {
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.bin': 'application/octet-stream',
  '.md': 'text/markdown; charset=utf-8',
};

function createStaticDirHandler(baseDir: string) {
  return (req: any, res: any, next: any) => {
    const rawPath = (req.url || '/').split('?')[0];
    const safeRel = path.normalize(rawPath).replace(/^(\.\.(\/|\\|$))+/, '');
    const fullPath = path.join(baseDir, safeRel);
    if (!fullPath.startsWith(baseDir) || !fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
      next();
      return;
    }
    const ext = path.extname(fullPath).toLowerCase();
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
    fs.createReadStream(fullPath).pipe(res);
  };
}

// Carpetas con datos del cielo: se sirven en dev y preview y se copian junto a
// index.html al terminar `vite build`, para que el sitio publicado traiga sus datos.
const DATA_FOLDERS: Array<[string, string]> = [
  ['data-sample', DATA_SAMPLE_DIR],
  ['data-new', DATA_NEW_DIR],
];

function serveDataStatic(base: string): Plugin {
  const sampleHandler = createStaticDirHandler(DATA_SAMPLE_DIR);
  const newHandler = createStaticDirHandler(DATA_NEW_DIR);
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const sampleMount = `${normalizedBase}/data-sample`;
  const newMount = `${normalizedBase}/data-new`;

  let outDir = '';
  return {
    name: 'serve-data-static',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      if (!outDir || !fs.existsSync(outDir)) return;
      for (const [name, dir] of DATA_FOLDERS) {
        if (fs.existsSync(dir)) fs.cpSync(dir, path.join(outDir, name), { recursive: true });
      }
    },
    configureServer(server) {
      server.middlewares.use('/data-sample', sampleHandler);
      server.middlewares.use('/data-new', newHandler);
      if (normalizedBase) {
        server.middlewares.use(sampleMount, sampleHandler);
        server.middlewares.use(newMount, newHandler);
      }
    },
    configurePreviewServer(server) {
      server.middlewares.use('/data-sample', sampleHandler);
      server.middlewares.use('/data-new', newHandler);
      if (normalizedBase) {
        server.middlewares.use(sampleMount, sampleHandler);
        server.middlewares.use(newMount, newHandler);
      }
    },
  };
}

const BASE = process.env.VITE_BASE || '/';

export default defineConfig({
  base: BASE,
  plugins: [react(), serveDataStatic(BASE)],
  server: {
    port: 5173,
    host: true,
  },
});
