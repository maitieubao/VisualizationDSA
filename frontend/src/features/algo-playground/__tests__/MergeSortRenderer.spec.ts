// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { MergeSortRenderer } from '../engine/renderers/MergeSortRenderer';
import type { CanvasStateSnapshot } from '../../../core/CompilerStepExecutor';

function makeCtx(): Record<string, unknown> {
  const ctx: Record<string, unknown> = {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arcTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    setLineDash: vi.fn(),
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

describe('MergeSortRenderer', () => {
  it('canHandle only accepts snapshots carrying mergeState', () => {
    expect(MergeSortRenderer.canHandle(makeMergeSnap())).toBe(true);
    expect(MergeSortRenderer.canHandle({ array: [1, 2, 3] })).toBe(false);
  });

  it('draw renders divide and merge phases without throwing', () => {
    const engine = MergeSortRenderer.instance();
    const ctx = makeCtx() as unknown as CanvasRenderingContext2D;

    const merge = makeMergeSnap();
    expect(() => engine.render(ctx, 400, 300, merge)).not.toThrow();
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
    expect(() => engine.render(ctx, 400, 300, divide)).not.toThrow();
  });

  it('draw tolerates empty subarrays and single-element output', () => {
    const engine = MergeSortRenderer.instance();
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
    expect(() => engine.render(ctx, 400, 300, snap)).not.toThrow();
  });

  it('captionFor returns Vietnamese description for divide and merge phases', () => {
    const divideSnap = makeMergeSnap({
      mergeState: {
        phase: 'divide', left: [38, 27], right: [43, 3], leftIdx: 0, rightIdx: 0,
        output: [], low: 0, mid: 1, high: 3, width: 2, pass: 0,
      },
    });
    expect(MergeSortRenderer.captionFor(divideSnap)).toContain('Chia đoạn');

    const mergeSnap = makeMergeSnap({
      mergeState: {
        phase: 'merge', left: [27, 38], right: [3, 43], leftIdx: 1, rightIdx: 1,
        output: [3, 27], low: 0, mid: 1, high: 3, width: 2, pass: 0,
      },
    });
    expect(MergeSortRenderer.captionFor(mergeSnap)).toContain('Trộn');
  });

  it('captionFor returns empty string when no mergeState', () => {
    expect(MergeSortRenderer.captionFor({ array: [1, 2, 3] })).toBe('');
  });

  it('draw renders divide phase with split arrows and L/R labels', () => {
    const engine = MergeSortRenderer.instance();
    const ctx = makeCtx() as unknown as CanvasRenderingContext2D;
    const snap = makeMergeSnap({
      mergeState: {
        phase: 'divide', left: [38, 27], right: [43, 3], leftIdx: 0, rightIdx: 0,
        output: [], low: 0, mid: 1, high: 3, width: 2, pass: 0,
      },
    });
    expect(() => engine.render(ctx, 400, 300, snap)).not.toThrow();

    const texts = (ctx.fillText as unknown as ReturnType<typeof vi.fn>).mock.calls.map(c => String(c[0]));
    // Should have L and R labels in the divide workspace
    expect(texts.some(t => t === 'L')).toBe(true);
    expect(texts.some(t => t === 'R')).toBe(true);
    // Should have CHIA in header
    expect(texts.some(t => t.includes('CHIA'))).toBe(true);
  });

  it('draw merge phase shows output row and chip column labels', () => {
    const engine = MergeSortRenderer.instance();
    const ctx = makeCtx() as unknown as CanvasRenderingContext2D;
    const snap = makeMergeSnap();
    engine.render(ctx, 400, 300, snap);

    const texts = (ctx.fillText as unknown as ReturnType<typeof vi.fn>).mock.calls.map(c => String(c[0]));
    // Should have OUT label in output row
    expect(texts.some(t => t === 'OUT')).toBe(true);
    // Should have L and R column labels
    expect(texts.some(t => t === 'L')).toBe(true);
    expect(texts.some(t => t === 'R')).toBe(true);
    // Should have comparison indicator with ⚡
    expect(texts.some(t => t.includes('⚡'))).toBe(true);
  });

  it('AL-032: draw vẽ zone 1 (main array) + zone 2 (merge workspace) — fillRect + fillText', () => {
    const engine = MergeSortRenderer.instance();
    const ctx = makeCtx() as unknown as CanvasRenderingContext2D;
    const snap = makeMergeSnap(); // 7 phần tử, merge phase

    engine.render(ctx, 400, 300, snap);

    const fillRectMock = ctx.fillRect as unknown as ReturnType<typeof vi.fn>;
    const fillTextMock = ctx.fillText as unknown as ReturnType<typeof vi.fn>;
    const clearRectMock = ctx.clearRect as unknown as ReturnType<typeof vi.fn>;

    // Zone 1: segment background (fillRect) + bars (roundRect+fill)
    // fillRect is used for segment highlight; roundRect+fill for bars
    expect(fillRectMock.mock.calls.length).toBeGreaterThanOrEqual(1);

    // Zone 1 bars + Zone 2 L/R labels + chips + output + header + caption
    // fillText covers: bar values, bar indices, L/R labels, chip values, OUT label, output values, header, caption
    expect(fillTextMock.mock.calls.length).toBeGreaterThanOrEqual(10);

    // Pha merge có nhãn "TRỘN" xuất hiện
    const texts = fillTextMock.mock.calls.map(c => String(c[0]));
    expect(texts.some(t => t.includes('TRỘN'))).toBe(true);

    // clearRect được gọi đúng 1 lần đầu draw
    expect(clearRectMock.mock.calls.length).toBe(1);
  });
});
