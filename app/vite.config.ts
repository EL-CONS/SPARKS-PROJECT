import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

// Folders with processed sky data, served at /<name>/ in dev and preview and
// copied next to the built app so a static host (GitHub Pages, Netlify,
// Cloudflare Pages) can serve them. data-sample: Barnard. data-new: the other
// four challenge targets.
const DATA_FOLDERS = ['data-sample', 'data-new'];
const dataDir = (name: string) => path.resolve(__dirname, '..', name);

const MIME: Record<string, string> = {
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.bin': 'application/octet-stream',
  '.md': 'text/markdown; charset=utf-8',
};

function serveSkyData(): Plugin {
  const handlerFor = (root: string) => (req: any, res: any, next: any) => {
    const rawPath = decodeURIComponent((req.url || '/').split('?')[0]);
    const fullPath = path.join(root, path.normalize(rawPath).replace(/^(\.\.(\/|\\|$))+/, ''));
    if (!fullPath.startsWith(root) || !fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
      next();
      return;
    }
    const ext = path.extname(fullPath).toLowerCase();
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
    fs.createReadStream(fullPath).pipe(res);
  };
  const mount = (server: { middlewares: { use: (route: string, fn: any) => void } }) => {
    for (const name of DATA_FOLDERS) {
      if (fs.existsSync(dataDir(name))) server.middlewares.use(`/${name}`, handlerFor(dataDir(name)));
    }
  };
  let outDir = '';
  return {
    name: 'serve-sky-data',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    configureServer: mount,
    configurePreviewServer: mount,
    // `vite build`: copy the data next to index.html so the deployed site is self-contained.
    closeBundle() {
      if (!outDir || !fs.existsSync(outDir)) return;
      for (const name of DATA_FOLDERS) {
        if (fs.existsSync(dataDir(name))) fs.cpSync(dataDir(name), path.join(outDir, name), { recursive: true });
      }
    },
  };
}

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react(), serveSkyData()],
  server: {
    port: 5173,
    host: true,
  },
});
