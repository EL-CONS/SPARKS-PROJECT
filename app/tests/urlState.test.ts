import { describe, it, expect } from 'vitest';
import { parseUrlState, serializeUrlState, DEFAULT_URL_STATE } from '../src/core/urlState';

describe('urlState', () => {
  it('parses valid query parameters', () => {
    const s = parseUrlState('?ra=133.7951&dec=-7.2451&fov=10&mode=diff&det=6&lang=es');
    expect(s).toEqual({
      ra: 133.7951,
      dec: -7.2451,
      fov: 10,
      mode: 'diff',
      det: 6,
      lang: 'es',
    });
  });

  it('falls back safely on invalid values without throwing', () => {
    const s = parseUrlState('?ra=999&dec=abc&fov=-5&mode=bogus&det=99&lang=fr');
    expect(s).toEqual(DEFAULT_URL_STATE);
  });

  it('round-trips serialized URL state', () => {
    const input = {
      ra: 269.4486,
      dec: 4.7672,
      fov: 6.6,
      mode: 'stack' as const,
      det: 'all' as const,
      lang: 'en' as const,
    };
    const qs = serializeUrlState(input);
    expect(parseUrlState(qs)).toEqual(input);
  });
});
