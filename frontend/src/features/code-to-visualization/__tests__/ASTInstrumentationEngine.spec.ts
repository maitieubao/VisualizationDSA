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

  it('should prepend per-loop counter declarations at the top', () => {
    const code = `for (let i = 0; i < 3; i++) { console.log(i); }`;
    const result = compileAndInstrument(code);

    expect(result.success).toBe(true);
    expect(result.instrumentedCode!.startsWith('let __loopCounter0 = 0;')).toBe(true);
  });

  it('should give each loop its own counter (nested loops)', () => {
    const code = `for (var i = 0; i < 10; i++) { for (var j = 0; j < 10; j++) {} }`;
    const result = compileAndInstrument(code);

    expect(result.success).toBe(true);
    expect(result.instrumentedCode).toContain('__loopCounter0');
    expect(result.instrumentedCode).toContain('__loopCounter1');
    expect(result.instrumentedCode).not.toContain('__loopCounter2');
  });

  it('should NOT throw for valid nested loops (100x100) — per-loop counter, no false positive', () => {
    const code = `function countPairs(arr) { var c = 0; for (var i = 0; i < 100; i++) { for (var j = 0; j < 100; j++) { c++; } } return c; }`;
    const result = compileAndInstrument(code);

    expect(result.success).toBe(true);

    const fn = new Function('arr', 'traceCompare', 'traceAssign', result.instrumentedCode!);
    const traceCompare = () => true;
    const traceAssign = () => undefined;

    expect(() => fn([1, 2, 3], traceCompare, traceAssign)).not.toThrow();
  });

  it('should throw for a true infinite loop (single loop exceeds limit)', () => {
    const code = `function forever(arr) { while (true) { var x = 1; } }`;
    const result = compileAndInstrument(code);

    expect(result.success).toBe(true);

    const fn = new Function('arr', 'traceCompare', 'traceAssign', result.instrumentedCode!);
    expect(() => fn([1], () => true, () => undefined)).toThrow(/lặp vô hạn/);
  });

  it('should auto-invoke the entry function, not the first helper', () => {
    const code = [
      `function swap(arr, i, j) { var t = arr[i]; arr[i] = arr[j]; arr[j] = t; }`,
      `function bubbleSort(arr) { for (var i = 0; i < arr.length; i++) { for (var j = i + 1; j < arr.length; j++) { if (arr[i] > arr[j]) { swap(arr, i, j); } } } }`,
    ].join('\n');
    const result = compileAndInstrument(code);

    expect(result.success).toBe(true);
    expect(result.instrumentedCode).toContain('bubbleSort(arr);');
    expect(result.instrumentedCode).not.toContain('swap(arr);');
  });

  it('should pass arr.length as second argument for multi-param entry functions', () => {
    const code = `function bubbleSort(arr, n) { for (var i = 0; i < n; i++) {} }`;
    const result = compileAndInstrument(code);

    expect(result.success).toBe(true);
    expect(result.instrumentedCode).toContain('bubbleSort(arr, arr.length);');
  });

  it('should pass the source line number to traceCompare and traceAssign', () => {
    const code = `if (arr[0] > arr[1]) {\n  arr[1] = arr[0];\n}`;
    const result = compileAndInstrument(code);

    expect(result.success).toBe(true);

    const calls: Array<{ kind: string; args: unknown[] }> = [];
    const fn = new Function(
      'arr',
      'traceCompare',
      'traceAssign',
      result.instrumentedCode!,
    );
    fn(
      [1, 2],
      (...args: unknown[]) => { calls.push({ kind: 'compare', args }); return true; },
      (...args: unknown[]) => { calls.push({ kind: 'assign', args }); return undefined; },
    );

    const compareCall = calls.find((c) => c.kind === 'compare');
    const assignCall = calls.find((c) => c.kind === 'assign');

    expect(compareCall).toBeDefined();
    expect(typeof compareCall!.args[compareCall!.args.length - 1]).toBe('number');
    expect(compareCall!.args[compareCall!.args.length - 1]).toBe(1);

    expect(assignCall).toBeDefined();
    expect(typeof assignCall!.args[assignCall!.args.length - 1]).toBe('number');
    expect(assignCall!.args[assignCall!.args.length - 1]).toBe(2);
  });

  it('should pass the real target variable name to traceAssign (CV-143)', () => {
    const code = `function assignDemo(arr) { var k = 1; arr[k] = 42; }`;
    const result = compileAndInstrument(code);

    expect(result.success).toBe(true);

    const calls: Array<{ kind: string; args: unknown[] }> = [];
    const fn = new Function(
      'arr',
      'traceCompare',
      'traceAssign',
      result.instrumentedCode!,
    );
    fn(
      [1, 2, 3],
      () => true,
      (...args: unknown[]) => { calls.push({ kind: 'assign', args }); return undefined; },
    );

    const assignCall = calls.find((c) => c.kind === 'assign');
    expect(assignCall).toBeDefined();
    // args: [arr, index, value, vars-pairs, line] — pairs mang tên biến thật 'k',
    // không còn hardcode 'i' như worker cũ.
    expect(assignCall!.args[3]).toEqual([['k', 1]]);
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
