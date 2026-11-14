import { describe, it, expect } from 'vitest';
import { parseSkyQuery } from '../src/core/coords';

describe('parseSkyQuery', () => {
  it('parses WISE 0855 in HMS/DMS with letters', () => {
    const res = parseSkyQuery('08h55m10.831s -7d14m42.53s');
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.ra).toBeCloseTo(133.795, 3);
      expect(res.dec).toBeCloseTo(-7.245, 3);
    }
  });

  it('parses colon-separated HMS/DMS', () => {
    const res = parseSkyQuery('08:55:10.831 -07:14:42.53');
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.ra).toBeCloseTo(133.795, 3);
      expect(res.dec).toBeCloseTo(-7.245, 3);
    }
  });

  it('parses decimal degrees', () => {
    const res = parseSkyQuery('133.7951 -7.2451');
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.ra).toBeCloseTo(133.7951, 4);
      expect(res.dec).toBeCloseTo(-7.2451, 4);
    }
  });

  it('resolves all 5 mandatory challenge target names', () => {
    const names = ["Barnard's Star", 'Epsilon Indi B', 'WISE 0855', 'RW Aurigae', 'R Draconis'];
    for (const name of names) {
      const res = parseSkyQuery(name);
      expect(res.ok).toBe(true);
      if (res.ok) expect(res.source).toBe('target');
    }
  });

  it('returns typed errors for empty, bad format, and out-of-range', () => {
    const empty = parseSkyQuery('   ');
    expect(empty).toMatchObject({ ok: false, error: 'empty' });

    const bad = parseSkyQuery('not a coordinate');
    expect(bad).toMatchObject({ ok: false, error: 'unknown_format' });

    const range = parseSkyQuery('400.0 -95.0');
    expect(range).toMatchObject({ ok: false, error: 'out_of_range' });
  });
});
