import { describe, it, expect, beforeEach } from 'vitest';
import { PseudocodeSyncer, type LineMapping } from '../engine/PseudocodeSyncer';
import { CompilerStepExecutor } from '../../../core/CompilerStepExecutor';

describe('Sprint 3 Pseudocode Synchronization Unit Tests', () => {
  let syncer: PseudocodeSyncer;
  let mockMappings: LineMapping[];

  beforeEach(() => {
    mockMappings = [
      { stepIndex: 0, lineNumber: 5, codeSnippet: 'let pivot = arr[high]' },
      { stepIndex: 1, lineNumber: 8, codeSnippet: 'swap(arr, i, j)' },
      { stepIndex: 2, lineNumber: 12, codeSnippet: 'return i + 1' }
    ];
    syncer = new PseudocodeSyncer(mockMappings);
  });

  it('Should correctly find matching line number for current playback step index', () => {
    const line = syncer.getLineForStep(1);

    expect(line).toBe(8); // Bước 1 ứng với dòng 8 hoán vị
  });

  it('Should successfully seek to first algorithm step when clicking line number', () => {
    const step = syncer.getFirstStepForLine(12);

    expect(step).toBe(2); // Dòng 12 ứng với bước kết thúc 2
  });

  it('Should return null for non-existent step indices or line bounds', () => {
    const line = syncer.getLineForStep(99);
    expect(line).toBeNull();

    const step = syncer.getFirstStepForLine(99);
    expect(step).toBeNull();
  });
});

describe('CompilerStepExecutor.generateStepToLineMapping Unit Tests', () => {
  it('Should generate clean StepToLineMapping from frames and sourceCode', () => {
    const sourceCode = `let a = 1;\nlet b = 2;\nreturn a + b;`;
    const frames = [
      { stepIndex: 0, lineNumber: 1, canvasStateSnapshot: { array: [] }, description: '' },
      { stepIndex: 1, lineNumber: 3, canvasStateSnapshot: { array: [] }, description: '' }
    ];
    const mappings = CompilerStepExecutor.generateStepToLineMapping(sourceCode, frames);
    expect(mappings.length).toBe(2);
    expect(mappings[0]).toEqual({
      stepIndex: 0,
      lineNumber: 1,
      codeSnippet: 'let a = 1;'
    });
    expect(mappings[1]).toEqual({
      stepIndex: 1,
      lineNumber: 3,
      codeSnippet: 'return a + b;'
    });
  });
});

