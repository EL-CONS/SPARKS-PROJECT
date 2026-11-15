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

function serveDataStatic(): Plugin {
  const sampleHandler = createStaticDirHandler(DATA_SAMPLE_DIR);
  const newHandler = createStaticDirHandler(DATA_NEW_DIR);

  return {
    name: 'serve-data-static',
    configureServer(server) {
      server.middlewares.use('/data-sample', sampleHandler);
      server.middlewares.use('/data-new', newHandler);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/data-sample', sampleHandler);
      server.middlewares.use('/data-new', newHandler);
    },
  };
}

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react(), serveDataStatic()],
  server: {
    port: 5173,
    host: true,
  },
});
