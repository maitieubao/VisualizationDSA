import { describe, it, expect } from 'vitest';
import { loadPseudocodeScript, hasPseudocodeScript } from '../scripts/scriptLoader';

describe('scriptLoader', () => {
  it('loads bubble-sort script', () => {
    const script = loadPseudocodeScript('bubble-sort');
    expect(script).not.toBeNull();
    expect(script!.algorithmId).toBe('bubble-sort');
  });

  it('returns 4 languages for bubble-sort', () => {
    const script = loadPseudocodeScript('bubble-sort');
    expect(script!.languages).toHaveLength(4);
    expect(script!.languages.map((l) => l.language)).toEqual(['cpp', 'java', 'python', 'javascript']);
  });

  it('each language has lines with logicalId', () => {
    const script = loadPseudocodeScript('bubble-sort');
    for (const lang of script!.languages) {
      expect(lang.lines.length).toBeGreaterThan(0);
      for (const line of lang.lines) {
        expect(line.lineNumber).toBeGreaterThan(0);
        expect(line.text).toBeTruthy();
        expect(line.logicalId).toBeTruthy();
      }
    }
  });

  it('all languages share same set of executable logicalIds', () => {
    const script = loadPseudocodeScript('bubble-sort');
    const getExecutableIds = (langIdx: number) =>
      new Set(
        script!.languages[langIdx].lines
          .filter((l) => l.logicalId !== 'NO_ACTION')
          .map((l) => l.logicalId),
      );

    const cppIds = getExecutableIds(0);
    const javaIds = getExecutableIds(1);
    const pyIds = getExecutableIds(2);
    const jsIds = getExecutableIds(3);

    expect([...cppIds].sort()).toEqual([...javaIds].sort());
    expect([...cppIds].sort()).toEqual([...pyIds].sort());
    expect([...cppIds].sort()).toEqual([...jsIds].sort());
  });

  it('returns null for unknown algorithm', () => {
    const script = loadPseudocodeScript('unknown-algo');
    expect(script).toBeNull();
  });

  it('hasPseudocodeScript returns true for bubble-sort', () => {
    expect(hasPseudocodeScript('bubble-sort')).toBe(true);
  });

  it('hasPseudocodeScript returns false for unknown', () => {
    expect(hasPseudocodeScript('unknown')).toBe(false);
  });
});
