// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { MergeSortAnimationEngine } from '../engine/MergeSortAnimationEngine';
import type { CanvasStateSnapshot } from '../../../core/CompilerStepExecutor';

function makeCtx(): Record<string, unknown> {
  const ctx: Record<string, unknown> = {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    arcTo: vi.fn(),
    fill: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
  };
  return ctx;
}

function makeMergeSnap(overrides: Partial<CanvasStateSnapshot> = {}): CanvasStateSnapshot {
  return {
    array: [38, 27, 43, 3, 9, 82, 10],
    mergeState: {
      phase: 'merge',
      left: [27, 38],
      right: [3, 43],
      leftIdx: 1,
      rightIdx: 1,
      output: [3, 27],
      low: 0,
      mid: 1,
      high: 3,
      width: 2,
      pass: 0,
    },
    ...overrides,
  };
}

describe('MergeSortAnimationEngine', () => {
  it('canHandle only accepts snapshots carrying mergeState', () => {
    expect(MergeSortAnimationEngine.canHandle(makeMergeSnap())).toBe(true);
    expect(MergeSortAnimationEngine.canHandle({ array: [1, 2, 3] })).toBe(false);
  });

  it('draw renders divide and merge phases without throwing', () => {
    const engine = MergeSortAnimationEngine.instance();
    const ctx = makeCtx() as unknown as CanvasRenderingContext2D;

    const merge = makeMergeSnap();
    expect(() => engine.draw(ctx, 400, 300, merge)).not.toThrow();
    expect(ctx.clearRect).toHaveBeenCalled();

    const divide = makeMergeSnap({
      mergeState: {
        phase: 'divide',
        left: [38, 27],
        right: [43, 3],
        leftIdx: 0,
        rightIdx: 0,
        output: [],
        low: 0,
        mid: 1,
        high: 3,
        width: 2,
        pass: 0,
      },
    });
    expect(() => engine.draw(ctx, 400, 300, divide)).not.toThrow();
  });

  it('draw tolerates empty subarrays and single-element output', () => {
    const engine = MergeSortAnimationEngine.instance();
    const ctx = makeCtx() as unknown as CanvasRenderingContext2D;
    const snap = makeMergeSnap({
      mergeState: {
        phase: 'merge',
        left: [10],
        right: [],
        leftIdx: 1,
        rightIdx: 0,
        output: [10],
        low: 6,
        mid: 6,
        high: 6,
        width: 1,
        pass: 0,
      },
    });
    expect(() => engine.draw(ctx, 400, 300, snap)).not.toThrow();
  });

  it('AL-032: draw vẽ đủ 3 tầng — fillRect (vùng segment) + fillText (nhãn/giá trị/chip)', () => {
    const engine = MergeSortAnimationEngine.instance();
    const ctx = makeCtx() as unknown as CanvasRenderingContext2D;
    const snap = makeMergeSnap(); // 7 phần tử, merge phase

    engine.draw(ctx, 400, 300, snap);

    const fillRectMock = ctx.fillRect as unknown as ReturnType<typeof vi.fn>;
    const fillTextMock = ctx.fillText as unknown as ReturnType<typeof vi.fn>;
    const clearRectMock = ctx.clearRect as unknown as ReturnType<typeof vi.fn>;

    // Tier 1: vùng segment [low..high] + nửa phải sau mid → ít nhất 2 fillRect
    expect(fillRectMock.mock.calls.length).toBeGreaterThanOrEqual(2);

    // Tier 1 bars + Tier 2 L/R labels + chips + Tier 3 OUT + phase label
    expect(fillTextMock.mock.calls.length).toBeGreaterThanOrEqual(15);

    // Pha merge có nhãn "01 CHIA" không xuất hiện, "02 TRỘN" xuất hiện
    const texts = fillTextMock.mock.calls.map(c => String(c[0]));
    expect(texts.some(t => t.includes('TRỘN'))).toBe(true);
    expect(texts.some(t => t.includes('CHIA'))).toBe(false);

    // clearRect được gọi đúng 1 lần đầu draw (không nhân bản nền)
    expect(clearRectMock.mock.calls.length).toBe(1);
  });
});
