import { describe, it, expect } from 'vitest';
import { compileAndInstrument } from '../engine/ASTInstrumentationEngine';

describe('ASTInstrumentationEngine', () => {
  it('should successfully instrument array comparison (BinaryExpression)', () => {
    const rawCode = `if (arr[i] > arr[j]) { swap(arr, i, j); }`;
    const result = compileAndInstrument(rawCode);

    expect(result.success).toBe(true);
    expect(result.instrumentedCode).toBeDefined();
    expect(result.instrumentedCode).toContain('traceCompare');
  });

  it('should successfully instrument array assignment (AssignmentExpression)', () => {
    const rawCode = `arr[i] = temp;`;
    const result = compileAndInstrument(rawCode);

    expect(result.success).toBe(true);
    expect(result.instrumentedCode).toBeDefined();
    expect(result.instrumentedCode).toContain('traceAssign');
  });

  it('should inject loop guard into while blocks', () => {
    const rawCode = `while (i < n) { i++; }`;
    const result = compileAndInstrument(rawCode);

    expect(result.success).toBe(true);
    expect(result.instrumentedCode).toContain('__loopCounter');
  });

  it('should inject loop guard into for blocks', () => {
    const rawCode = `for (let i = 0; i < n; i++) { console.log(i); }`;
    const result = compileAndInstrument(rawCode);

    expect(result.success).toBe(true);
    expect(result.instrumentedCode).toContain('__loopCounter');
  });

  it('should return syntax error for invalid javascript code', () => {
    const brokenCode = `function broken( { if(arr[i] ) }`;
    const result = compileAndInstrument(brokenCode);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should handle full bubble sort code with comparisons and assignments', () => {
    const bubbleSort = `
      function bubbleSort(arr) {
        let n = arr.length;
        for (let i = 0; i < n - 1; i++) {
          for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
              let temp = arr[j];
              arr[j] = arr[j + 1];
              arr[j + 1] = temp;
            }
          }
        }
      }
    `;
    const result = compileAndInstrument(bubbleSort);

    expect(result.success).toBe(true);
    expect(result.instrumentedCode).toContain('traceCompare');
    expect(result.instrumentedCode).toContain('traceAssign');
    expect(result.instrumentedCode).toContain('__loopCounter');
  });

  it('should handle empty function body without errors', () => {
    const emptyFunc = `function doNothing(arr) { }`;
    const result = compileAndInstrument(emptyFunc);

    expect(result.success).toBe(true);
    expect(result.instrumentedCode).toBeDefined();
  });

  it('should preserve non-array comparisons without instrumentation', () => {
    const simpleComparison = `if (x > y) { z = 1; }`;
    const result = compileAndInstrument(simpleComparison);

    expect(result.success).toBe(true);
    expect(result.instrumentedCode).not.toContain('traceCompare');
  });

  it('should instrument <= comparison operator', () => {
    const code = `if (arr[i] <= arr[j]) { swap(); }`;
    const result = compileAndInstrument(code);

    expect(result.success).toBe(true);
    expect(result.instrumentedCode).toContain('traceCompare');
  });

  it('should instrument < comparison operator', () => {
    const code = `if (arr[i] < arr[j]) { swap(); }`;
    const result = compileAndInstrument(code);

    expect(result.success).toBe(true);
    expect(result.instrumentedCode).toContain('traceCompare');
  });

  it('should prepend __loopCounter declaration at the top', () => {
    const code = `let x = 1;`;
    const result = compileAndInstrument(code);

    expect(result.success).toBe(true);
    expect(result.instrumentedCode!.startsWith('let __loopCounter = 0;')).toBe(true);
  });

  it('should handle selection sort pattern with multiple assignments', () => {
    const selectionSort = `
      function selectionSort(arr) {
        let n = arr.length;
        for (let i = 0; i < n - 1; i++) {
          let minIdx = i;
          for (let j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
              minIdx = j;
            }
          }
          let temp = arr[minIdx];
          arr[minIdx] = arr[i];
          arr[i] = temp;
        }
      }
    `;
    const result = compileAndInstrument(selectionSort);

    expect(result.success).toBe(true);
    expect(result.instrumentedCode).toContain('traceCompare');
    expect(result.instrumentedCode).toContain('traceAssign');
  });

  it('should provide error line number for syntax errors when available', () => {
    const code = `function test() {\n  let x = \n}`;
    const result = compileAndInstrument(code);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should handle do-while loops', () => {
    const code = `let i = 0; do { i++; } while (i < 10);`;
    const result = compileAndInstrument(code);

    expect(result.success).toBe(true);
    expect(result.instrumentedCode).toContain('__loopCounter');
  });
});
