// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SortingAnimationEngine } from '../engine/SortingAnimationEngine';

type CtxMock = {
  setTransform: ReturnType<typeof vi.fn>;
  clearRect: ReturnType<typeof vi.fn>;
  beginPath: ReturnType<typeof vi.fn>;
  moveTo: ReturnType<typeof vi.fn>;
  lineTo: ReturnType<typeof vi.fn>;
  quadraticCurveTo: ReturnType<typeof vi.fn>;
  stroke: ReturnType<typeof vi.fn>;
  fill: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
  restore: ReturnType<typeof vi.fn>;
  translate: ReturnType<typeof vi.fn>;
  scale: ReturnType<typeof vi.fn>;
  setLineDash: ReturnType<typeof vi.fn>;
  fillText: ReturnType<typeof vi.fn>;
  strokeText: ReturnType<typeof vi.fn>;
  closePath: ReturnType<typeof vi.fn>;
  arc: ReturnType<typeof vi.fn>;
  arcTo: ReturnType<typeof vi.fn>;
  fillRect: ReturnType<typeof vi.fn>;
  strokeRect: ReturnType<typeof vi.fn>;
  measureText: ReturnType<typeof vi.fn>;
  [key: string]: unknown;
};

function makeCtx(): CtxMock {
  const ctx: CtxMock = {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    setLineDash: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    closePath: vi.fn(),
    arc: vi.fn(),
    arcTo: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
  };
  return ctx;
}

let rafCb: ((ts: number) => void) | null = null;

describe('SortingAnimationEngine', () => {
  beforeEach(() => {
    rafCb = null;
    vi.stubGlobal('requestAnimationFrame', (cb: (ts: number) => void) => { rafCb = cb; return 1; });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('clears the canvas on EVERY interpolated draw during auto-play (no ghosting)', () => {
    const ctx = makeCtx();
    const canvas = {
      width: 0,
      height: 0,
      clientWidth: 400,
      clientHeight: 300,
      getContext: () => ctx,
    };
    const engine = new SortingAnimationEngine();
    engine.start(canvas as unknown as HTMLCanvasElement, vi.fn());

    const prev = { array: [5, 3, 8, 4, 2], highlightedIndices: [] };
    const curr = { array: [3, 5, 8, 4, 2], swappingIndices: [0, 1] as [number, number], highlightedIndices: [] };
    engine.setSnapshots(prev as never, curr as never); // !playing → vẽ tĩnh 1 lần
    const callsAfterStatic = ctx.clearRect.mock.calls.length;
    expect(callsAfterStatic).toBeGreaterThan(0);

    engine.play(); // chuyển sang auto-play
    // Thúc một RAF tick: progress vào (0,1) → đi nhánh drawSwap (không tự clear)
    rafCb?.(100);
    rafCb?.(116);

    // Regression: trước fix, nhánh transition KHÔNG clear → callCount không tăng
    expect(ctx.clearRect.mock.calls.length).toBeGreaterThan(callsAfterStatic);
    engine.destroy();
  });

  it('clears once per interpolated frame, not multiple times per draw', () => {
    const ctx = makeCtx();
    const canvas = {
      width: 0,
      height: 0,
      clientWidth: 400,
      clientHeight: 300,
      getContext: () => ctx,
    };
    const engine = new SortingAnimationEngine();
    engine.start(canvas as unknown as HTMLCanvasElement, vi.fn());
    const prev = { array: [5, 3, 8, 4, 2], highlightedIndices: [] };
    const curr = { array: [3, 5, 8, 4, 2], swappingIndices: [0, 1] as [number, number], highlightedIndices: [] };
    engine.setSnapshots(prev as never, curr as never);
    engine.play();
    ctx.clearRect.mockClear();
    rafCb?.(1_000_000); // 1 tick duy nhất → đúng 1 lần vẽ transition → đúng 1 lần clear
    expect(ctx.clearRect).toHaveBeenCalledTimes(1);
    engine.destroy();
  });

  it('advance tick skips drawing; next transition starts cleanly from progress 0', () => {
    const ctx = makeCtx();
    const canvas = {
      width: 0,
      height: 0,
      clientWidth: 400,
      clientHeight: 300,
      getContext: () => ctx,
    };
    const onAdvance = vi.fn();
    const engine = new SortingAnimationEngine();
    engine.start(canvas as unknown as HTMLCanvasElement, onAdvance);
    const s1 = { array: [5, 3, 8, 4, 2], highlightedIndices: [] };
    const s2 = { array: [3, 5, 8, 4, 2], swappingIndices: [0, 1] as [number, number], highlightedIndices: [] };
    const s3 = { array: [3, 5, 2, 4, 8], swappingIndices: [2, 4] as [number, number], highlightedIndices: [] };
    engine.setSnapshots(null as never, s1 as never);
    engine.setSnapshots(s1 as never, s2 as never);
    engine.play();
    (engine as unknown as { progress: number }).progress = 0.99;

    ctx.fill.mockClear();
    ctx.clearRect.mockClear();
    const t0 = performance.now() + 1000; // ts luôn LỚN hơn lastTimestamp (chống delta âm/0)
    rafCb?.(t0); // progress vượt 1 → advance → KHÔNG vẽ tick này
    expect(onAdvance).toHaveBeenCalledTimes(1);
    expect(ctx.fill).not.toHaveBeenCalled();
    expect(ctx.clearRect).not.toHaveBeenCalled();

    engine.setSnapshots(s2 as never, s3 as never); // đang play → progress reset về 0
    expect((engine as unknown as { progress: number }).progress).toBe(0);

    rafCb?.(t0 + 32); // tick kế tiếp vẽ transition mới sạch từ 0
    expect(ctx.clearRect).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
    engine.destroy();
  });

  it('setSnapshots while not playing snaps to full static frame (progress = 1)', () => {
    const ctx = makeCtx();
    const canvas = {
      width: 0,
      height: 0,
      clientWidth: 400,
      clientHeight: 300,
      getContext: () => ctx,
    };
    const engine = new SortingAnimationEngine();
    engine.start(canvas as unknown as HTMLCanvasElement, vi.fn());
    const prev = { array: [5, 3, 8, 4, 2], highlightedIndices: [] };
    const curr = { array: [3, 5, 8, 4, 2], swappingIndices: [0, 1] as [number, number], highlightedIndices: [] };
    engine.setSnapshots(prev as never, curr as never);
    expect((engine as unknown as { progress: number }).progress).toBe(1);
    expect(ctx.clearRect).toHaveBeenCalled(); // đã vẽ frame tĩnh
    engine.destroy();
  });

  it('play advances immediately even at step 0 (prev === curr from composable fix)', () => {
    const ctx = makeCtx();
    const canvas = {
      width: 0,
      height: 0,
      clientWidth: 400,
      clientHeight: 300,
      getContext: () => ctx,
    };
    const onAdvance = vi.fn();
    const engine = new SortingAnimationEngine();
    engine.start(canvas as unknown as HTMLCanvasElement, onAdvance);
    const s1 = { array: [5, 3, 8, 4, 2], highlightedIndices: [] };
    // Trước fix, composable truyền prev=null ở bước 0 → loop không advance.
    // Sau fix: prev=curr (frame 0) → engine phải advance ngay khi bấm play.
    engine.setSnapshots(null as never, s1 as never);
    engine.setSnapshots(s1 as never, s1 as never);
    engine.play();
    (engine as unknown as { progress: number }).progress = 0.99;
    rafCb?.(500_000);
    expect(onAdvance).toHaveBeenCalledTimes(1);
    engine.destroy();
  });
});
