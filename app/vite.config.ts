import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.resolve(__dirname, '../data-sample');

const MIME: Record<string, string> = {
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.bin': 'application/octet-stream',
  '.md': 'text/markdown; charset=utf-8',
};

function serveDataSample(): Plugin {
  const handler = (req: any, res: any, next: any) => {
    const rawPath = (req.url || '/').split('?')[0];
    const safeRel = path.normalize(rawPath).replace(/^(\.\.(\/|\\|$))+/, '');
    const fullPath = path.join(DATA_DIR, safeRel);
    if (!fullPath.startsWith(DATA_DIR) || !fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
      next();
      return;
    }
    const ext = path.extname(fullPath).toLowerCase();
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
    fs.createReadStream(fullPath).pipe(res);
  };

  return {
    name: 'serve-data-sample',
    configureServer(server) {
      server.middlewares.use('/data-sample', handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/data-sample', handler);
    },
  };
}

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react(), serveDataSample()],
  server: {
    port: 5173,
    host: true,
  },
});
