export type CoordParseErrorKind = 'empty' | 'unknown_format' | 'out_of_range';

export type CoordParseResult =
  | {
      ok: true;
      ra: number;
      dec: number;
      source: 'coords' | 'target';
      targetId?: string;
    }
  | {
      ok: false;
      error: CoordParseErrorKind;
      detail: string;
    };

export interface KnownTarget {
  id: string;
  aliases: string[];
  ra: number;
  dec: number;
}

export const CHALLENGE_TARGETS: KnownTarget[] = [
  {
    id: 'barnard',
    aliases: ['barnard', "barnard's star", 'estrella de barnard'],
    ra: 269.4486,
    dec: 4.7672,
  },
  {
    id: 'wise0855',
    aliases: ['wise 0855', 'wise0855', 'wise 0855-0714', 'wise 0855−0714'],
    ra: 133.795129,
    dec: -7.245147,
  },
  {
    id: 'epsindib',
    aliases: ['epsilon indi b', 'eps indi b', 'ε indi b', 'epsindib'],
    ra: 331.0438,
    dec: -56.7828,
  },
  {
    id: 'rwaur',
    aliases: ['rw aurigae', 'rw aur', 'rwaur'],
    ra: 76.9564,
    dec: 30.4014,
  },
  {
    id: 'rdra',
    aliases: ['r draconis', 'r dra', 'rdra'],
    ra: 248.1675,
    dec: 66.755,
  },
];

function normalizeText(s: string): string {
  return s.trim().toLowerCase().replace(/\u2212/g, '-').replace(/\s+/g, ' ');
}

function parseSexagesimalRa(token: string): number | null {
  const m = token.match(/^(\d{1,2})[h:](\d{1,2})[m:](\d{1,2}(?:\.\d+)?)s?$/i);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  const sec = Number(m[3]);
  if (h < 0 || h >= 24 || min < 0 || min >= 60 || sec < 0 || sec >= 60) return Number.NaN;
  return (h + min / 60 + sec / 3600) * 15;
}

function parseSexagesimalDec(token: string): number | null {
  const m = token.match(/^([+-]?)(\d{1,2})[d°:](\d{1,2})[m'′:](\d{1,2}(?:\.\d+)?)[s"″]?$/i);
  if (!m) return null;
  const sign = m[1] === '-' ? -1 : 1;
  const deg = Number(m[2]);
  const min = Number(m[3]);
  const sec = Number(m[4]);
  if (deg > 90 || min < 0 || min >= 60 || sec < 0 || sec >= 60) return Number.NaN;
  const val = sign * (deg + min / 60 + sec / 3600);
  return Math.abs(val) > 90 ? Number.NaN : val;
}

/**
 * Parse sky coordinates (decimal degrees, HMS/DMS with letters or colons)
 * or one of the 5 mandatory Space Apps challenge target names.
 */
export function parseSkyQuery(raw: string): CoordParseResult {
  const norm = normalizeText(raw);
  if (!norm) {
    return { ok: false, error: 'empty', detail: 'Empty query' };
  }

  for (const target of CHALLENGE_TARGETS) {
    if (target.aliases.some(a => norm === a || norm.includes(a))) {
      return {
        ok: true,
        ra: target.ra,
        dec: target.dec,
        source: 'target',
        targetId: target.id,
      };
    }
  }

  const parts = norm.replace(/,/g, ' ').split(/\s+/).filter(Boolean);
  if (parts.length !== 2) {
    return { ok: false, error: 'unknown_format', detail: raw };
  }

  const [raTok, decTok] = parts;

  const raSex = parseSexagesimalRa(raTok);
  const decSex = parseSexagesimalDec(decTok);
  if (raSex !== null || decSex !== null) {
    if (raSex === null || decSex === null) {
      return { ok: false, error: 'unknown_format', detail: raw };
    }
    if (!Number.isFinite(raSex) || !Number.isFinite(decSex)) {
      return { ok: false, error: 'out_of_range', detail: raw };
    }
    return { ok: true, ra: raSex, dec: decSex, source: 'coords' };
  }

  if (!/^[+-]?\d+(?:\.\d+)?$/.test(raTok) || !/^[+-]?\d+(?:\.\d+)?$/.test(decTok)) {
    return { ok: false, error: 'unknown_format', detail: raw };
  }

  const ra = Number(raTok);
  const dec = Number(decTok);
  if (!Number.isFinite(ra) || !Number.isFinite(dec) || ra < 0 || ra > 360 || dec < -90 || dec > 90) {
    return { ok: false, error: 'out_of_range', detail: raw };
  }

  return { ok: true, ra, dec, source: 'coords' };
}
