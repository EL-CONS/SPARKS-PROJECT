#!/usr/bin/env node
/**
 * Servidor de demostración de API en vivo para SPARKS (GET /api/campo).
 * Simula la máquina de estados: en_cola -> procesando -> listo | fallo
 * Entrega datos precalculados de data-sample/ bajo el contrato asíncrono.
 */

import http from 'node:http';
import url from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const PORT = process.env.PORT || 3001;
const repoRoot = path.resolve(process.cwd(), '..');
const dataSampleDir = path.join(repoRoot, 'data-sample');

// Memoria de trabajos simulados: key -> { status, startTime, ra, dec }
const JOBS = new Map();

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (parsed.pathname === '/api/campo') {
    const ra = parseFloat(parsed.query.ra);
    const dec = parseFloat(parsed.query.dec);

    if (isNaN(ra) || isNaN(dec) || ra < 0 || ra > 360 || dec < -90 || dec > 90) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'fallo',
        error_code: 'COORDENADAS_INVALIDAS',
        mensaje: 'ra debe estar en [0, 360] y dec en [-90, 90]'
      }));
      return;
    }

    const key = `${ra.toFixed(3)}_${dec.toFixed(3)}`;
    const now = Date.now();

    if (!JOBS.has(key)) {
      // Inicia en cola
      JOBS.set(key, {
        status: 'en_cola',
        startTime: now,
        ra,
        dec
      });
    }

    const job = JOBS.get(key);
    const elapsedSec = (now - job.startTime) / 1000;

    // Transición de estados:
    // 0 a 3s: en_cola
    // 3s a 8s: procesando
    // > 8s: listo
    if (elapsedSec < 3.0) {
      res.writeHead(202, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'en_cola',
        job_id: `job_${key}`,
        ra,
        dec,
        posicion_en_cola: 1,
        estimado_segundos: Math.max(1, Math.round(8 - elapsedSec)),
        mensaje: 'Coordenadas encoladas para procesamiento de recortes SPHEREx.'
      }));
    } else if (elapsedSec < 8.0) {
      const progress = Math.min(95, Math.round(((elapsedSec - 3.0) / 5.0) * 100));
      res.writeHead(202, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'procesando',
        job_id: `job_${key}`,
        progreso_porcentaje: progress,
        etapa_actual: 'Descargando y reevaluando recortes de IRSA',
        estimado_segundos_restantes: Math.max(1, Math.round(8 - elapsedSec))
      }));
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'listo',
        field_id: 'barnard',
        cached: true,
        manifest_url: '/data-sample/barnard/manifest.json',
        data_base_url: '/data-sample/barnard/',
        resumen: {
          cobertura_temporadas: [0, 1, 2],
          detectores: [1, 2, 3, 4, 5, 6],
          veredicto_movimiento: 'candidato_confirmado'
        }
      }));
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint no encontrado' }));
});

if (process.argv[1] === url.fileURLToPath(import.meta.url)) {
  server.listen(PORT, () => {
    console.log(`Demo Live Field Server corriendo en http://localhost:${PORT}/api/campo`);
  });
}

export { server };
