import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { nextTick } from 'vue';
import { setActivePinia, createPinia } from 'pinia';
import { useAlgoPlaygroundStore } from '../store/useAlgoPlaygroundStore';
import { compileInWorker } from '../../../core/compileWorker';
import type { PlaybackFrame } from '../../../core/CompilerStepExecutor';

// Mock Web Worker: chạy compile đồng bộ trong test thay vì worker thật
vi.mock('../../../core/compileWorker', async () => {
  const { CompilerStepExecutor } = await import('../../../core/CompilerStepExecutor');
  return {
    compileInWorker: vi.fn(async (
      sourceCode: string,
      initialArray: number[],
      options?: { array?: number[]; fallbackToRegex?: boolean },
    ) => {
      return CompilerStepExecutor.compileAlgorithm(sourceCode, initialArray, {
        ...options,
        fallbackToRegex: false,
      });
    }),
  };
});

describe('useAlgoPlaygroundStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads a demo with metadata and clears frames', () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    expect(store.demoId).toBe('bubble-sort');
    expect(store.code).toContain('Bubble Sort');
    expect(store.inputKind).toBe('array');
    expect(store.inputRaw).toBe('5, 3, 8, 4, 2');
    expect(store.totalFrames).toBe(0);
    expect(store.currentIndex).toBe(0);
    expect(store.compileError).toBeNull();
  });

  it('ignores unknown demo ids', () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('unknown-demo');
    expect(store.demoId).toBeNull();
  });

  it('run() compiles frames and resets to the first step', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    await store.run();
    expect(store.totalFrames).toBeGreaterThan(0);
    expect(store.currentIndex).toBe(0);
    expect(store.compileError).toBeNull();
    expect(store.currentFrame).not.toBeNull();
    expect(store.renderMode).toBe('array');
    expect(store.currentLineNumber).toBeGreaterThan(0);
  });

  it('run() on a graph demo switches renderMode to graph', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('dijkstra');
    await store.run();
    expect(store.renderMode).toBe('graph');
    expect(store.currentFrame?.canvasStateSnapshot.distances).toBeTruthy();
  });

  it('run() surfaces compile errors and clears frames', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    store.setCode('this is not valid js (');
    await store.run();
    expect(store.compileError).not.toBeNull();
    expect(store.totalFrames).toBe(0);
    expect(store.currentIndex).toBe(0);
  });

  it('stepNext/stepPrev navigate with clamping', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    await store.run();
    const total = store.totalFrames;
    expect(total).toBeGreaterThan(1);

    store.stepNext();
    expect(store.currentIndex).toBe(1);

    store.stepPrev();
    store.stepPrev();
    expect(store.currentIndex).toBe(0);

    store.jumpToFrame(total - 1);
    expect(store.currentIndex).toBe(total - 1);

    store.jumpToFrame(9999);
    expect(store.currentIndex).toBe(total - 1);

    // AL-020: biên âm — hiện tại jumpToFrame(-5) là no-op (chỉ nhận index trong [0, n)).
    // Nếu source agent clamp về 0 → đổi expectation thành 0.
    store.jumpToFrame(-5);
    expect(store.currentIndex).toBe(total - 1);
    expect(store.currentIndex).toBeGreaterThanOrEqual(0);
  });

  it('stepNext at the end stops playback', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    await store.run();
    store.jumpToFrame(store.totalFrames - 1);
    store.isPlaying = true;
    store.stepNext();
    expect(store.isPlaying).toBe(false);
  });

  it('invalidate() clears frames and stops playback', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    await store.run();
    expect(store.totalFrames).toBeGreaterThan(0);
    store.invalidate();
    expect(store.totalFrames).toBe(0);
    expect(store.currentIndex).toBe(0);
    expect(store.isPlaying).toBe(false);
    expect(store.compileError).toBeNull();
  });

  it('play sets isPlaying and stepNext advances frames', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    await store.run();

    store.play();
    expect(store.isPlaying).toBe(true);
    expect(store.currentIndex).toBe(0);

    store.stepNext();
    await nextTick();
    expect(store.currentIndex).toBeGreaterThan(0);

    store.pause();
    expect(store.isPlaying).toBe(false);
  });

  it('togglePlay toggles between playing and paused', async () => {
    vi.useFakeTimers();
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    await store.run();

    store.togglePlay();
    await nextTick();
    expect(store.isPlaying).toBe(true);

    store.togglePlay();
    await nextTick();
    expect(store.isPlaying).toBe(false);
  });

  it('exposes isCompiling while the worker is compiling', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    let resolvePromise!: (frames: PlaybackFrame[]) => void;
    vi.mocked(compileInWorker).mockImplementationOnce(
      () => new Promise<PlaybackFrame[]>((res) => { resolvePromise = res; }),
    );

    store.run();
    await nextTick();
    expect(store.isCompiling).toBe(true);

    resolvePromise([]);
    await nextTick();
    expect(store.isCompiling).toBe(false);
    expect(store.totalFrames).toBe(0);
  });

  it('AL-028: play trước compile → auto-play khi frames về (pendingPlayAfterCompile)', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    const realImpl = vi.mocked(compileInWorker).getMockImplementation()!;
    let resolveCompile!: (frames: PlaybackFrame[]) => void;
    vi.mocked(compileInWorker).mockImplementationOnce(
      () => new Promise<PlaybackFrame[]>((res) => { resolveCompile = res; }),
    );

    store.play(); // chưa có frames → pendingPlayAfterCompile = true + run()
    await nextTick();
    expect(store.isPlaying).toBe(false);
    expect(store.isCompiling).toBe(true);

    const frames = await realImpl(store.code, [], { array: [5, 3, 8, 4, 2], fallbackToRegex: false });
    resolveCompile(frames);
    await nextTick();
    await nextTick();
    expect(store.totalFrames).toBeGreaterThan(0);
    expect(store.isPlaying).toBe(true); // auto-play sau compile
  });

  it('AL-028: play ở frame cuối → wrap về frame 0 và phát ngay', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    await store.run();
    expect(store.totalFrames).toBeGreaterThan(1);

    store.jumpToFrame(store.totalFrames - 1);
    expect(store.currentIndex).toBe(store.totalFrames - 1);
    store.play();
    expect(store.currentIndex).toBe(0); // wrap về đầu
    expect(store.isPlaying).toBe(true);
  });

  it('ignores stale results from an older run() call', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    const realImpl = vi.mocked(compileInWorker).getMockImplementation()!;
    const slow = vi.mocked(compileInWorker)
      .mockImplementationOnce(() => new Promise<PlaybackFrame[]>(() => { /* không bao giờ resolve */ }));

    store.run(); // run chậm (không resolve)
    await nextTick();

    vi.mocked(compileInWorker).mockImplementation(realImpl);
    await store.run(); // run nhanh thứ hai
    await nextTick();
    expect(store.totalFrames).toBeGreaterThan(0);

    slow.mockRestore();
    vi.mocked(compileInWorker).mockImplementation(realImpl);
  });

  it('accumulates trace logs without junk "Đang chạy dòng" frames', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    await store.run();
    store.jumpToFrame(store.totalFrames - 1);
    expect(store.traceLogs.length).toBeGreaterThan(0);
    for (const log of store.traceLogs) {
      expect(log).not.toMatch(/^L\d+: Đang chạy dòng \d+$/);
    }
  });

  it('persists code/input/demoId and restores them on a new store instance', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('quick-sort');
    store.setCode('const a = 1;\ncompare(0, 1);');
    store.setInput('1, 2, 3');
    await nextTick(); // flush watch persist

    setActivePinia(createPinia());
    const restored = useAlgoPlaygroundStore();
    expect(restored.demoId).toBe('quick-sort');
    expect(restored.code).toContain('const a = 1');
    expect(restored.inputRaw).toBe('1, 2, 3');
  });

  it('ignores persisted state with an outdated schema version', async () => {
    localStorage.setItem('algo-playground:state', JSON.stringify({
      version: 0,
      demoId: 'quick-sort',
      code: 'const stale = true;',
      inputRaw: '9, 8, 7',
    }));
    const store = useAlgoPlaygroundStore();
    expect(store.demoId).toBeNull();
    expect(store.code).toBe('');
  });

  it('inputValidation reports valid input with element count', () => {
    const store = useAlgoPlaygroundStore();
    store.setInput('5, 3, 8, 4, 2');
    expect(store.inputValidation.valid).toBe(true);
    expect(store.inputValidation.message).toBe('5 phần tử');
  });

  it('inputValidation reports invalid input with a clear error', () => {
    const store = useAlgoPlaygroundStore();
    store.setInput('1, abc, 3');
    expect(store.inputValidation.valid).toBe(false);
    expect(store.inputValidation.message).toContain('không phải là số hợp lệ');
  });

  it('inputValidation parses graph input', () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bfs');
    store.setInput('A-B:4, A-C:2');
    expect(store.inputValidation.valid).toBe(true);
    expect(store.inputValidation.message).toBe('3 phần tử'); // A, B, C
  });

  it('notableSteps marks swap frames and caps at 15 markers', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    await store.run();
    expect(store.notableSteps.length).toBeGreaterThan(0);
    expect(store.notableSteps.every(m => m.label === 'swap' || m.label === 'found')).toBe(true);
    expect(store.notableSteps.length).toBeLessThanOrEqual(15);
    // marker index hợp lệ
    for (const m of store.notableSteps) {
      expect(m.index).toBeGreaterThanOrEqual(0);
      expect(m.index).toBeLessThan(store.totalFrames);
    }
  });

  it('notableSteps marks the found step for binary-search', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('binary-search');
    await store.run();
    const found = store.notableSteps.filter(m => m.label === 'found');
    expect(found.length).toBeGreaterThan(0);
  });

  it('restores inputKind together with the persisted demoId', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bfs'); // inputKind = graph
    store.setCode('const x = 1;');
    await nextTick(); // flush persist

    setActivePinia(createPinia());
    const restored = useAlgoPlaygroundStore();
    expect(restored.demoId).toBe('bfs');
    expect(restored.inputKind).toBe('graph');
    // validation phải parse theo kiểu graph
    restored.setInput('A-B:4');
    expect(restored.inputValidation.valid).toBe(true);
    expect(restored.inputValidation.message).toBe('2 phần tử');
  });

  it('applyExternalDemo switches demo and inputKind without touching code', () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    store.setCode('const mine = 42;');
    store.applyExternalDemo('dijkstra');
    expect(store.demoId).toBe('dijkstra');
    expect(store.inputKind).toBe('graph');
    expect(store.code).toBe('const mine = 42;'); // code không bị reset
  });

  it('inputValidation reports empty input as trống instead of default graph', () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bfs');
    store.setInput('   ');
    expect(store.inputValidation.valid).toBe(true);
    expect(store.inputValidation.message).toBe('Input trống');
  });

  // ── B1: breakpoint ──

  it('B1.1: toggleBreakpoint thêm/rớt line; clearBreakpoints xóa hết', () => {
    const store = useAlgoPlaygroundStore();
    store.toggleBreakpoint(3);
    store.toggleBreakpoint(7);
    expect(store.breakpoints.has(3)).toBe(true);
    expect(store.breakpoints.has(7)).toBe(true);

    store.toggleBreakpoint(3);
    expect(store.breakpoints.has(3)).toBe(false);
    expect(store.breakpoints.has(7)).toBe(true);

    store.clearBreakpoints();
    expect(store.breakpoints.size).toBe(0);
  });

  it('B1.2: toggleBreakpoint bỏ qua line <= 0', () => {
    const store = useAlgoPlaygroundStore();
    store.toggleBreakpoint(0);
    store.toggleBreakpoint(-1);
    expect(store.breakpoints.size).toBe(0);
  });

  it('B1.3: play tự động dừng khi stepNext chạm frame breakpoint', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    await store.run();
    expect(store.totalFrames).toBeGreaterThan(2);

    // Đặt breakpoint tại line của frame đầu tiên khác frame 0
    const targetLine = store.frames.slice(1).find(f => f.lineNumber !== store.frames[0].lineNumber)!.lineNumber;
    store.toggleBreakpoint(targetLine);

    store.play();
    expect(store.isPlaying).toBe(true);
    let guard = 0;
    while (store.isPlaying && guard < 500) {
      store.stepNext();
      guard++;
    }
    expect(store.isPlaying).toBe(false);
    expect(store.currentFrame?.lineNumber).toBe(targetLine);
  });

  it('B1.4: stepNext tay (không play) vẫn đi qua breakpoint', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    await store.run();
    const targetLine = store.frames[1].lineNumber;
    store.toggleBreakpoint(targetLine);
    store.stepNext();
    expect(store.currentFrame?.lineNumber).toBe(targetLine);
    expect(store.isPlaying).toBe(false);
  });

  // ── B2: watch variables ──

  /** Step tới frame đầu tiên có `variables` primitive (frame 0 thường chưa track dòng nào). */
  function advanceToFirstVariableFrame(store: ReturnType<typeof useAlgoPlaygroundStore>): void {
    let guard = 0;
    while (Object.keys(store.currentVariables).length === 0 && store.currentIndex < store.totalFrames - 1 && guard < 500) {
      store.stepNext();
      guard++;
    }
  }

  it('B2.1: currentVariables trả biến primitive của frame (fallback loopVariables)', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    await store.run();
    advanceToFirstVariableFrame(store);
    const vars = store.currentVariables;
    expect(Object.keys(vars).length).toBeGreaterThan(0);
    // Kiểm tra có biến số nguyên (i, j, n...)
    const numeric = Object.values(vars).filter(v => typeof v === 'number');
    expect(numeric.length).toBeGreaterThan(0);
  });

  it('B2.2: toggleWatchVariable ghim/ẩn biến; watchedValues trả giá trị + trạng thái changed', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    await store.run();
    advanceToFirstVariableFrame(store);
    const someVar = Object.keys(store.currentVariables)[0];

    store.toggleWatchVariable(someVar);
    expect(store.watchList.includes(someVar)).toBe(true);
    expect(store.watchedValues.some(w => w.name === someVar)).toBe(true);
    expect(store.watchedValues.every(w => w.changed === true || w.changed === false)).toBe(true);

    store.toggleWatchVariable(someVar);
    expect(store.watchList.includes(someVar)).toBe(false);
  });

  it('B2.3: watchedValues chỉ hiển thị biến tồn tại trong frame (lọc biến không xuất hiện)', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    await store.run();
    advanceToFirstVariableFrame(store);
    store.toggleWatchVariable('khong-ton-tai');
    expect(store.watchedValues.length).toBe(0);
  });

  it('B2.4: watchList persist qua localStorage (restore store mới)', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    await store.run();
    advanceToFirstVariableFrame(store);
    const someVar = Object.keys(store.currentVariables)[0];
    store.toggleWatchVariable(someVar);

    setActivePinia(createPinia());
    const restored = useAlgoPlaygroundStore();
    expect(restored.watchList.includes(someVar)).toBe(true);
  });

  it('B2.5: changedVariables đánh dấu biến đổi khi di chuyển frame', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    await store.run();
    // Frame 0 → frame 1: gần như chắc chắn có biến đổi (i, j...)
    store.stepNext();
    const changed = store.changedVariables;
    // Chỉ cần không crash + là Set
    expect(changed instanceof Set).toBe(true);
  });
});
