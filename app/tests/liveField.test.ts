import { describe, it, expect, vi } from 'vitest';
import { fetchLiveFieldStatus, LiveFieldResponse } from '../src/data/loader';

describe('Cliente de API de Campos en Vivo (GET /api/campo)', () => {
  it('debe entender el estado "en_cola"', async () => {
    const mockResponse: LiveFieldResponse = {
      status: 'en_cola',
      job_id: 'job_123',
      posicion_en_cola: 1,
      estimado_segundos: 60,
      mensaje: 'Encolado',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 202,
      json: async () => mockResponse,
    });

    const res = await fetchLiveFieldStatus(269.448, 4.767, 'http://mock-api');
    expect(res.status).toBe('en_cola');
    expect(res.posicion_en_cola).toBe(1);
    expect(res.estimado_segundos).toBe(60);
  });

  it('debe entender el estado "procesando" con porcentaje y etapa', async () => {
    const mockResponse: LiveFieldResponse = {
      status: 'procesando',
      job_id: 'job_123',
      progreso_porcentaje: 65,
      etapa_actual: 'Generando coadds',
      estimado_segundos_restantes: 20,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 202,
      json: async () => mockResponse,
    });

    const res = await fetchLiveFieldStatus(269.448, 4.767, 'http://mock-api');
    expect(res.status).toBe('procesando');
    expect(res.progreso_porcentaje).toBe(65);
    expect(res.etapa_actual).toBe('Generando coadds');
  });

  it('debe entender el estado "listo" con URLs de manifiesto y datos', async () => {
    const mockResponse: LiveFieldResponse = {
      status: 'listo',
      field_id: 'barnard',
      manifest_url: '/data-sample/barnard/manifest.json',
      data_base_url: '/data-sample/barnard/',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const res = await fetchLiveFieldStatus(269.448, 4.767, 'http://mock-api');
    expect(res.status).toBe('listo');
    expect(res.manifest_url).toBe('/data-sample/barnard/manifest.json');
    expect(res.field_id).toBe('barnard');
  });

  it('debe entender el estado "fallo" con código de error y razón', async () => {
    const mockResponse: LiveFieldResponse = {
      status: 'fallo',
      error_code: 'COBERTURA_INSUFICIENTE',
      mensaje: 'Menos de 2 temporadas en SPHEREx QR2/QR3',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => mockResponse,
    });

    const res = await fetchLiveFieldStatus(269.448, 4.767, 'http://mock-api');
    expect(res.status).toBe('fallo');
    expect(res.error_code).toBe('COBERTURA_INSUFICIENTE');
  });
});
