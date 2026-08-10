import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  loadPseudocodeScript,
  hasPseudocodeScript,
  validatePseudocodeScript,
  registerPseudocodeScript,
} from '../scripts/scriptLoader';
import { generateDummyBubbleSortResult } from '../../animation-engine/services/algorithmApi';
import { PseudocodeSyncEngine } from '../engine/PseudocodeSyncEngine';

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

  it('hasPseudocodeScript("toString") returns false (PS-017)', () => {
    expect(hasPseudocodeScript('toString')).toBe(false);
  });

  it('loadPseudocodeScript("constructor") returns null instead of Object.prototype.constructor (PS-017)', () => {
    expect(loadPseudocodeScript('constructor')).toBeNull();
  });
});

describe('scriptLoader: PS-010 script <-> generator consistency', () => {
  it('every language declares an executable INNER_LOOP line', () => {
    const script = loadPseudocodeScript('bubble-sort')!;
    for (const lang of script.languages) {
      expect(lang.lines.some((l) => l.logicalId === 'INNER_LOOP')).toBe(true);
    }
  });

  it('dummy bubble-sort generator emits every executable logicalId declared by the script', () => {
    const script = loadPseudocodeScript('bubble-sort')!;
    const executableIds = new Set(
      script.languages.flatMap((lang) =>
        lang.lines.filter((l) => l.logicalId !== 'NO_ACTION').map((l) => l.logicalId),
      ),
    );
    const result = generateDummyBubbleSortResult([5, 3, 8, 1, 9]);
    const emittedIds = new Set(
      result.frames.map((f) => f.activeLogicalLineId).filter((id): id is string => Boolean(id)),
    );
    for (const id of executableIds) {
      expect(emittedIds.has(id), `generator must emit '${id}'`).toBe(true);
    }
  });

  it('logicalIds may repeat across lines; engine maps a logicalId to ALL matching lines (PS-011)', () => {
    // Thiết kế PS-011: khối code nhiều dòng cùng một logicalId (Java swap 3 dòng
    // SWAP_STEP) phải highlight CẢ BLOCK — engine trả danh sách line, không ép
    // logicalId phải duy nhất trong từng ngôn ngữ.
    const script = loadPseudocodeScript('bubble-sort')!;
    const java = script.languages.find((l) => l.language === 'java')!;
    const swapLines = java.lines.filter((l) => l.logicalId === 'SWAP_STEP').map((l) => l.lineNumber);
    expect(swapLines.length).toBeGreaterThanOrEqual(3);

    const matched = PseudocodeSyncEngine.getPhysicalLineNumbers('SWAP_STEP', 'java', script.languages);
    expect(matched).toEqual(swapLines);
  });
});

describe('scriptLoader: PS-023 script validation', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('validates the shipped bubble-sort script without errors', () => {
    const script = loadPseudocodeScript('bubble-sort')!;
    expect(validatePseudocodeScript(script)).toEqual([]);
  });

  it('rejects a script with empty algorithmId', () => {
    expect(
      validatePseudocodeScript({ algorithmId: '  ', languages: [{ language: 'cpp', lines: [{ lineNumber: 1, text: 'x', logicalId: 'STEP' }] }] }),
    ).toEqual([expect.stringContaining('algorithmId')]);
  });

  it('rejects an unsupported language', () => {
    expect(
      validatePseudocodeScript({
        algorithmId: 'a',
        languages: [{ language: 'rust' as 'cpp', lines: [{ lineNumber: 1, text: 'x', logicalId: 'STEP' }] }],
      }),
    ).toEqual([expect.stringContaining('rust')]);
  });

  it('rejects duplicate lineNumber within a language', () => {
    expect(
      validatePseudocodeScript({
        algorithmId: 'a',
        languages: [
          {
            language: 'cpp',
            lines: [
              { lineNumber: 1, text: 'x', logicalId: 'STEP' },
              { lineNumber: 1, text: 'y', logicalId: 'STEP_2' },
            ],
          },
        ],
      }),
    ).toEqual([expect.stringContaining('duplicate lineNumber 1')]);
  });

  it('rejects a line with empty logicalId', () => {
    expect(
      validatePseudocodeScript({
        algorithmId: 'a',
        languages: [{ language: 'cpp', lines: [{ lineNumber: 1, text: 'x', logicalId: '  ' }] }],
      }),
    ).toEqual([expect.stringContaining('logicalId')]);
  });

  it('registerPseudocodeScript throws for invalid scripts and keeps them out of the registry', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() =>
      registerPseudocodeScript({ algorithmId: 'bad-script', languages: [] }),
    ).toThrow('Invalid pseudocode script');
    expect(hasPseudocodeScript('bad-script')).toBe(false);
    errorSpy.mockRestore();
  });

  it('registerPseudocodeScript registers a valid script for lookup', () => {
    registerPseudocodeScript({
      algorithmId: 'custom-script',
      languages: [{ language: 'cpp', lines: [{ lineNumber: 1, text: 'x', logicalId: 'STEP' }] }],
    });
    expect(hasPseudocodeScript('custom-script')).toBe(true);
    expect(loadPseudocodeScript('custom-script')?.algorithmId).toBe('custom-script');
  });
});
