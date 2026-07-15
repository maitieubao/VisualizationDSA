/**
 * DebuggerYieldEngine Unit Tests
 * Kiểm thử AST compilation, Generator yield injection, loop guard, recursion guard.
 */
import { describe, it, expect } from 'vitest';
import { compileToDebugGenerator } from '../engine/DebuggerYieldEngine';

describe('DebuggerYieldEngine', () => {
  describe('compileToDebugGenerator', () => {
    it('should compile valid Bubble Sort code successfully', () => {
      const code = `function bubbleSort(arr) {
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
}`;

      const result = compileToDebugGenerator(code);
      expect(result.success).toBe(true);
      expect(result.generatorCode).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should convert function to generator (function*)', () => {
      const code = `function sort(arr) {
  let n = arr.length;
}`;

      const result = compileToDebugGenerator(code);
      expect(result.success).toBe(true);
      expect(result.generatorCode).toContain('function*');
    });

    it('should inject yield statements', () => {
      const code = `function sort(arr) {
  let n = arr.length;
}`;

      const result = compileToDebugGenerator(code);
      expect(result.success).toBe(true);
      expect(result.generatorCode).toContain('yield');
    });

    it('should inject __loopCounter guard', () => {
      const code = `function sort(arr) {
  for (let i = 0; i < arr.length; i++) {
    let x = arr[i];
  }
}`;

      const result = compileToDebugGenerator(code);
      expect(result.success).toBe(true);
      expect(result.generatorCode).toContain('__loopCounter');
    });

    it('should inject __recursionDepth guard', () => {
      const code = `function quickSort(arr) {
  let pivot = arr[0];
}`;

      const result = compileToDebugGenerator(code);
      expect(result.success).toBe(true);
      expect(result.generatorCode).toContain('__recursionDepth');
    });

    it('should inject __callStack management', () => {
      const code = `function sort(arr) {
  let n = arr.length;
}`;

      const result = compileToDebugGenerator(code);
      expect(result.success).toBe(true);
      expect(result.generatorCode).toContain('__callStack');
    });

    it('should create __debugMain wrapper function', () => {
      const code = `function sort(arr) {
  let n = arr.length;
}`;

      const result = compileToDebugGenerator(code);
      expect(result.success).toBe(true);
      expect(result.generatorCode).toContain('__debugMain');
    });

    it('should return error for invalid syntax', () => {
      const code = `function sort(arr {
  let n = arr.length;
}`;

      const result = compileToDebugGenerator(code);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should extract error line number from syntax error', () => {
      const code = `function sort(arr) {
  let n = arr.length;
  let x = ;
}`;

      const result = compileToDebugGenerator(code);
      expect(result.success).toBe(false);
      expect(result.errorLine).toBeDefined();
    });

    it('should handle empty function body', () => {
      const code = `function empty(arr) {
}`;

      const result = compileToDebugGenerator(code);
      expect(result.success).toBe(true);
      expect(result.generatorCode).toBeDefined();
    });

    it('should handle while loops', () => {
      const code = `function sort(arr) {
  let i = 0;
  while (i < arr.length) {
    let x = arr[i];
    i = i + 1;
  }
}`;

      const result = compileToDebugGenerator(code);
      expect(result.success).toBe(true);
      expect(result.generatorCode).toContain('__loopCounter');
    });

    it('should include lineNumber in yield payload', () => {
      const code = `function sort(arr) {
  let n = arr.length;
}`;

      const result = compileToDebugGenerator(code);
      expect(result.success).toBe(true);
      expect(result.generatorCode).toContain('lineNumber');
    });

    it('should include arrayState in yield payload', () => {
      const code = `function sort(arr) {
  let n = arr.length;
}`;

      const result = compileToDebugGenerator(code);
      expect(result.success).toBe(true);
      expect(result.generatorCode).toContain('arrayState');
    });

    it('should include callStack in yield payload', () => {
      const code = `function sort(arr) {
  let n = arr.length;
}`;

      const result = compileToDebugGenerator(code);
      expect(result.success).toBe(true);
      expect(result.generatorCode).toContain('callStack');
    });

    it('should include inline variable capture IIFE in yield payload', () => {
      const code = `function sort(arr) {
  let n = arr.length;
}`;

      const result = compileToDebugGenerator(code);
      expect(result.success).toBe(true);
      expect(result.generatorCode).toContain("typeof n !== 'undefined'");
      expect(result.generatorCode).toContain('v.n = n');
    });
  });
});
