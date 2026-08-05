import { describe, it, expect } from 'vitest';
import { CompilerStepExecutor } from '../CompilerStepExecutor';

const compile = (code: string, array?: number[]) =>
  CompilerStepExecutor.compileAlgorithm(code, [], { array, fallbackToRegex: false });

describe('CompilerStepExecutor instrumentation (Babel AST)', () => {
  it('single-line infinite loop is caught by the step guard', () => {
    const code = `let i = 0;\nwhile (true) { i++; }`;
    expect(() => compile(code, [1, 2, 3])).toThrow(/giới hạn thực thi/);
  });

  it('empty-body infinite loop is caught by the loop guard', () => {
    const code = `while (true) {}`;
    expect(() => compile(code, [1, 2, 3])).toThrow(/giới hạn lặp/);
  });

  it('single-statement loop body wrapped in a block stays attached', () => {
    const code = `let s = 0;\nfor (let i = 0; i < 3; i++) s = s + i;\nlog("done " + s);`;
    const frames = compile(code, [1, 2, 3]);
    const lastVars = frames[frames.length - 1].canvasStateSnapshot.loopVariables;
    expect(lastVars?.s).toBe(3);
  });

  it('multi-variable declarations track every name', () => {
    const code = `let a = 1, b = 2, c = 3;\ncompare(0, 1);`;
    const frames = compile(code, [2, 1]);
    const names = new Set<string>();
    for (const f of frames) {
      for (const k of Object.keys(f.canvasStateSnapshot.loopVariables ?? {})) names.add(k);
    }
    expect(names.has('a')).toBe(true);
    expect(names.has('b')).toBe(true);
    expect(names.has('c')).toBe(true);
  });

  it('statements before declarations do not crash (TDZ-safe via safeVars)', () => {
    const code = `foo();\nfunction foo() {\n  const x = 1;\n  compare(0, 0);\n}`;
    expect(() => compile(code, [5, 3])).not.toThrow();
  });

  it('recursive functions keep per-call local state (closure intact)', () => {
    // factorial-style recursion: depth must not corrupt outer call frames
    const code = `let visits = 0;\nfunction count(n) {\n  visits = visits + 1;\n  const next = n - 1;\n  if (next > 0) {\n    count(next);\n  }\n  log("n=" + n);\n}\ncount(4);`;
    const frames = compile(code, [1, 2, 3]);
    const lastVars = frames[frames.length - 1].canvasStateSnapshot.loopVariables;
    expect(lastVars?.visits).toBe(4);
  });

  it('nested if/else branches preserve semantics', () => {
    const code = `let r = 0;\nconst v = 5;\nif (v > 10) {\n  r = 1;\n} else {\n  r = 2;\n}\nlog("r=" + r);`;
    const frames = compile(code, [1, 2]);
    const lastVars = frames[frames.length - 1].canvasStateSnapshot.loopVariables;
    expect(lastVars?.r).toBe(2);
  });

  it('else-if chains keep correct branching', () => {
    const code = `let r = 0;\nconst v = 5;\nif (v > 10) {\n  r = 1;\n} else if (v > 3) {\n  r = 2;\n} else {\n  r = 3;\n}\nlog("r=" + r);`;
    const frames = compile(code, [1, 2]);
    const lastVars = frames[frames.length - 1].canvasStateSnapshot.loopVariables;
    expect(lastVars?.r).toBe(2);
  });

  it('loop variables are captured per iteration', () => {
    const code = `for (let i = 0; i < 3; i++) {\n  log("it " + i);\n}`;
    const frames = compile(code, [1, 2, 3]);
    const iValues = new Set<number>();
    for (const f of frames) {
      const i = f.canvasStateSnapshot.loopVariables?.i;
      if (typeof i === 'number') iValues.add(i);
    }
    expect(iValues.has(0)).toBe(true);
    expect(iValues.has(1)).toBe(true);
    expect(iValues.has(2)).toBe(true);
  });

  it('try/catch blocks still compile and run', () => {
    const code = `let caught = 0;\ntry {\n  const a = 1;\n  throw new Error("x");\n} catch (err) {\n  caught = 1;\n}\nlog("caught=" + caught);`;
    const frames = compile(code, [1, 2]);
    const lastVars = frames[frames.length - 1].canvasStateSnapshot.loopVariables;
    expect(lastVars?.caught).toBe(1);
  });
});
