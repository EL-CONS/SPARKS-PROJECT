import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { classifyCandidate, VeredictoClass, VeredictoFieldInput } from '../src/core/veredicto';

const TRUTH: Record<string, VeredictoClass> = {
  barnard: 'estrella',
  teegarden: 'estrella',
  wolf359: 'estrella',
  kapteyn: 'estrella',
  t452800: 'estrella',
  t744064: 'estrella',
  t605760: 'estrella',
  t503424: 'estrella',
  vanmaanen: 'enana blanca',
  wise0855: 'enana marron',
  epsindib: 'enana marron',
  rwaur: 'variable',
  rdra: 'variable',
};

describe('classifyCandidate against data-sample/results.json', () => {
  const resultsPath = path.resolve(__dirname, '../../data-sample/results.json');
  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8')) as {
    fields: Record<string, VeredictoFieldInput>;
  };

  it('matches 12 of 13 fields (same as prototipo/veredicto.py)', () => {
    let matches = 0;
    for (const [id, expected] of Object.entries(TRUTH)) {
      const res = classifyCandidate(results.fields[id]);
      if (res.clase === expected) matches += 1;
    }
    expect(matches).toBe(12);
  });

  it('classifies WISE 0855 and Epsilon Indi B as enana marron and variables as variable', () => {
    expect(classifyCandidate(results.fields.wise0855).clase).toBe('enana marron');
    expect(classifyCandidate(results.fields.epsindib).clase).toBe('enana marron');
    expect(classifyCandidate(results.fields.rwaur).clase).toBe('variable');
    expect(classifyCandidate(results.fields.rdra).clase).toBe('variable');
  });
});
