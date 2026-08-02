import { describe, it, expect } from 'vitest';
import {
  PseudocodeSyncEngine,
  type AnimationFrameForSync,
} from '../engine/PseudocodeSyncEngine';
import type { LanguageCode, CodeLine } from '../types/pseudocode.types';

const mockCodeLanguages: LanguageCode[] = [
  {
    language: 'cpp',
    lines: [
      { lineNumber: 1, text: 'void bubbleSort(int arr[], int n) {', logicalId: 'FUNC_DECL' },
      { lineNumber: 2, text: '  for (int i = 0; i < n-1; i++) {', logicalId: 'OUTER_LOOP' },
      { lineNumber: 3, text: '    for (int j = 0; j < n-i-1; j++) {', logicalId: 'INNER_LOOP' },
      { lineNumber: 4, text: '      if (arr[j] > arr[j+1]) {', logicalId: 'COMPARE_STEP' },
      { lineNumber: 5, text: '        swap(arr[j], arr[j+1]);', logicalId: 'SWAP_STEP' },
    ],
  },
  {
    language: 'python',
    lines: [
      { lineNumber: 1, text: 'def bubble_sort(arr):', logicalId: 'FUNC_DECL' },
      { lineNumber: 2, text: '    n = len(arr)', logicalId: 'FUNC_DECL' },
      { lineNumber: 3, text: '    for i in range(n - 1):', logicalId: 'OUTER_LOOP' },
      { lineNumber: 4, text: '        for j in range(n - i - 1):', logicalId: 'INNER_LOOP' },
      { lineNumber: 5, text: '            if arr[j] > arr[j + 1]:', logicalId: 'COMPARE_STEP' },
      { lineNumber: 6, text: '                arr[j], arr[j+1] = arr[j+1], arr[j]', logicalId: 'SWAP_STEP' },
    ],
  },
  {
    language: 'java',
    lines: [
      { lineNumber: 1, text: 'void bubbleSort(int[] arr, int n) {', logicalId: 'FUNC_DECL' },
      { lineNumber: 2, text: '  for (int i = 0; i < n-1; i++) {', logicalId: 'OUTER_LOOP' },
      { lineNumber: 3, text: '    for (int j = 0; j < n-i-1; j++) {', logicalId: 'INNER_LOOP' },
      { lineNumber: 4, text: '      if (arr[j] > arr[j+1]) {', logicalId: 'COMPARE_STEP' },
      { lineNumber: 5, text: '        int temp = arr[j];', logicalId: 'SWAP_STEP' },
    ],
  },
];

const mockFrames: AnimationFrameForSync[] = [
  { frameIndex: 0, activeLogicalLineId: 'FUNC_DECL', variables: { n: 5 } },
  { frameIndex: 1, activeLogicalLineId: 'OUTER_LOOP', variables: { i: 0, n: 5 } },
  { frameIndex: 2, activeLogicalLineId: 'COMPARE_STEP', variables: { i: 0, j: 0, n: 5 } },
  { frameIndex: 3, activeLogicalLineId: 'SWAP_STEP', variables: { i: 0, j: 0, n: 5, temp: 8 } },
  { frameIndex: 4, activeLogicalLineId: 'COMPARE_STEP', variables: { i: 0, j: 1, n: 5 } },
  { frameIndex: 5, activeLogicalLineId: 'SWAP_STEP', variables: { i: 0, j: 1, n: 5, temp: 3 } },
  { frameIndex: 6, activeLogicalLineId: 'OUTER_LOOP', variables: { i: 1, n: 5 } },
  { frameIndex: 7, activeLogicalLineId: 'COMPARE_STEP', variables: { i: 1, j: 0, n: 5 } },
];

describe('PseudocodeSyncEngine', () => {
  describe('getPhysicalLineNumber', () => {
    it('maps logicalId to correct C++ physical line', () => {
      const line = PseudocodeSyncEngine.getPhysicalLineNumber('SWAP_STEP', 'cpp', mockCodeLanguages);
      expect(line).toBe(5);
    });

    it('maps logicalId to correct Python physical line', () => {
      const line = PseudocodeSyncEngine.getPhysicalLineNumber('SWAP_STEP', 'python', mockCodeLanguages);
      expect(line).toBe(6);
    });

    it('maps logicalId to correct Java physical line', () => {
      const line = PseudocodeSyncEngine.getPhysicalLineNumber('COMPARE_STEP', 'java', mockCodeLanguages);
      expect(line).toBe(4);
    });

    it('returns null for unknown language', () => {
      const line = PseudocodeSyncEngine.getPhysicalLineNumber('SWAP_STEP', 'rust', mockCodeLanguages);
      expect(line).toBeNull();
    });

    it('returns null for unknown logicalId', () => {
      const line = PseudocodeSyncEngine.getPhysicalLineNumber('UNKNOWN_STEP', 'cpp', mockCodeLanguages);
      expect(line).toBeNull();
    });

    it('maps FUNC_DECL consistently across languages', () => {
      const cppLine = PseudocodeSyncEngine.getPhysicalLineNumber('FUNC_DECL', 'cpp', mockCodeLanguages);
      const pyLine = PseudocodeSyncEngine.getPhysicalLineNumber('FUNC_DECL', 'python', mockCodeLanguages);
      const javaLine = PseudocodeSyncEngine.getPhysicalLineNumber('FUNC_DECL', 'java', mockCodeLanguages);
      expect(cppLine).toBe(1);
      expect(pyLine).toBe(1);
      expect(javaLine).toBe(1);
    });
  });

  describe('findFirstFrameIndexForLogicalLine', () => {
    it('finds first SWAP_STEP frame', () => {
      const idx = PseudocodeSyncEngine.findFirstFrameIndexForLogicalLine('SWAP_STEP', mockFrames);
      expect(idx).toBe(3);
    });

    it('finds first COMPARE_STEP frame', () => {
      const idx = PseudocodeSyncEngine.findFirstFrameIndexForLogicalLine('COMPARE_STEP', mockFrames);
      expect(idx).toBe(2);
    });

    it('returns -1 for non-existent logicalId', () => {
      const idx = PseudocodeSyncEngine.findFirstFrameIndexForLogicalLine('UNKNOWN', mockFrames);
      expect(idx).toBe(-1);
    });

    it('finds FUNC_DECL at frame 0', () => {
      const idx = PseudocodeSyncEngine.findFirstFrameIndexForLogicalLine('FUNC_DECL', mockFrames);
      expect(idx).toBe(0);
    });
  });

  describe('findAllFrameIndicesForLogicalLine', () => {
    it('finds all COMPARE_STEP occurrences', () => {
      const indices = PseudocodeSyncEngine.findAllFrameIndicesForLogicalLine('COMPARE_STEP', mockFrames);
      expect(indices).toEqual([2, 4, 7]);
    });

    it('finds all SWAP_STEP occurrences', () => {
      const indices = PseudocodeSyncEngine.findAllFrameIndicesForLogicalLine('SWAP_STEP', mockFrames);
      expect(indices).toEqual([3, 5]);
    });

    it('returns empty array for non-existent logicalId', () => {
      const indices = PseudocodeSyncEngine.findAllFrameIndicesForLogicalLine('UNKNOWN', mockFrames);
      expect(indices).toEqual([]);
    });
  });

  describe('transformVariablesForWatch', () => {
    it('converts Record to VariableState array', () => {
      const result = PseudocodeSyncEngine.transformVariablesForWatch({ i: 0, j: 1, n: 5 });
      expect(result).toEqual([
        { name: 'i', value: 0 },
        { name: 'j', value: 1 },
        { name: 'n', value: 5 },
      ]);
    });

    it('rounds floating point numbers to 2 decimal places', () => {
      const result = PseudocodeSyncEngine.transformVariablesForWatch({ ratio: 3.14159 });
      expect(result).toEqual([{ name: 'ratio', value: 3.14 }]);
    });

    it('handles empty variables', () => {
      const result = PseudocodeSyncEngine.transformVariablesForWatch({});
      expect(result).toEqual([]);
    });

    it('preserves string values', () => {
      const result = PseudocodeSyncEngine.transformVariablesForWatch({ status: 'sorting' });
      expect(result).toEqual([{ name: 'status', value: 'sorting' }]);
    });

    it('keeps integer values unchanged', () => {
      const result = PseudocodeSyncEngine.transformVariablesForWatch({ count: 42 });
      expect(result).toEqual([{ name: 'count', value: 42 }]);
    });
  });

  describe('getOccurrenceCount', () => {
    it('counts COMPARE_STEP occurrences correctly', () => {
      const count = PseudocodeSyncEngine.getOccurrenceCount('COMPARE_STEP', mockFrames);
      expect(count).toBe(3);
    });

    it('counts SWAP_STEP occurrences correctly', () => {
      const count = PseudocodeSyncEngine.getOccurrenceCount('SWAP_STEP', mockFrames);
      expect(count).toBe(2);
    });

    it('returns 0 for non-existent logicalId', () => {
      const count = PseudocodeSyncEngine.getOccurrenceCount('UNKNOWN', mockFrames);
      expect(count).toBe(0);
    });
  });

  describe('getNextCycleFrameIndex', () => {
    it('returns next occurrence after current frame', () => {
      const idx = PseudocodeSyncEngine.getNextCycleFrameIndex('COMPARE_STEP', 2, mockFrames);
      expect(idx).toBe(4);
    });

    it('wraps around to first occurrence when at last', () => {
      const idx = PseudocodeSyncEngine.getNextCycleFrameIndex('COMPARE_STEP', 7, mockFrames);
      expect(idx).toBe(2);
    });

    it('returns first occurrence when current is before any', () => {
      const idx = PseudocodeSyncEngine.getNextCycleFrameIndex('SWAP_STEP', 0, mockFrames);
      expect(idx).toBe(3);
    });

    it('returns -1 for non-existent logicalId', () => {
      const idx = PseudocodeSyncEngine.getNextCycleFrameIndex('UNKNOWN', 0, mockFrames);
      expect(idx).toBe(-1);
    });
  });

  describe('findCodeLineByLogicalId', () => {
    const lines: CodeLine[] = [
      { lineNumber: 1, text: 'void fn() {', logicalId: 'FUNC_DECL' },
      { lineNumber: 2, text: '  swap(a, b);', logicalId: 'SWAP_STEP' },
    ];

    it('finds matching CodeLine', () => {
      const result = PseudocodeSyncEngine.findCodeLineByLogicalId('SWAP_STEP', lines);
      expect(result).toEqual({ lineNumber: 2, text: '  swap(a, b);', logicalId: 'SWAP_STEP' });
    });

    it('returns null for non-existent logicalId', () => {
      const result = PseudocodeSyncEngine.findCodeLineByLogicalId('UNKNOWN', lines);
      expect(result).toBeNull();
    });
  });
});
