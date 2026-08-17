// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { HeapSortRenderer } from '../engine/renderers/HeapSortRenderer';
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
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
  };
  return ctx;
}

function makeHeapSnap(overrides: Partial<CanvasStateSnapshot> = {}): CanvasStateSnapshot {
  return {
    array: [12, 11, 13, 5, 6, 7],
    heapState: { phase: 'extract', heapSize: 4, activeIdx: 0, siftPath: [0, 1, 3] },
    highlightedIndices: [5],
    comparingIndices: [1, 2],
    ...overrides,
  };
}

describe('HeapSortRenderer', () => {
  it('canHandle only accepts snapshots carrying heapState', () => {
    expect(HeapSortRenderer.canHandle(makeHeapSnap())).toBe(true);
    expect(HeapSortRenderer.canHandle({ array: [1, 2, 3] })).toBe(false);
  });

  it('draw renders build and extract phases without throwing', () => {
    const engine = HeapSortRenderer.instance();
    const ctx = makeCtx() as unknown as CanvasRenderingContext2D;

    const extract = makeHeapSnap();
    expect(() => engine.render(ctx, 400, 300, extract)).not.toThrow();
    expect(ctx.clearRect).toHaveBeenCalled();

    const build = makeHeapSnap({
      heapState: { phase: 'build', heapSize: 6, activeIdx: 2, siftPath: [2, 5] },
      highlightedIndices: [],
      comparingIndices: [5, 2],
    });
    expect(() => engine.render(ctx, 400, 300, build)).not.toThrow();
  });

  it('draw animates swap frames with prev snapshot without throwing', () => {
    const engine = HeapSortRenderer.instance();
    const ctx = makeCtx() as unknown as CanvasRenderingContext2D;
    const prev = makeHeapSnap({
      array: [13, 11, 12, 5, 6, 7],
      heapState: { phase: 'build', heapSize: 6, activeIdx: 0, siftPath: [0, 2] },
      swappingIndices: [0, 2],
    });
    const curr = makeHeapSnap({
      array: [12, 11, 13, 5, 6, 7],
      heapState: { phase: 'build', heapSize: 6, activeIdx: 2, siftPath: [0, 2] },
      swappingIndices: [0, 2],
    });
    expect(() => engine.render(ctx, 400, 300, curr, prev, 0.5)).not.toThrow();
  });

  it('AL-030: isSiftSwap — swap cha↔con vẽ 2 node bay cung (giá trị trao đổi)', () => {
    const engine = HeapSortRenderer.instance();
    const ctx = makeCtx() as unknown as CanvasRenderingContext2D;
    // activeIdx = 0 (cha), swappingIndices [0,1] (cha ↔ con trái) → isSiftSwap = true
    const prev = makeHeapSnap({
      array: [13, 11, 12, 5, 6, 7],
      heapState: { phase: 'build', heapSize: 6, activeIdx: 0, siftPath: [0, 1] },
      swappingIndices: [0, 1],
      comparingIndices: undefined,
    });
    const curr = makeHeapSnap({
      array: [11, 13, 12, 5, 6, 7],
      heapState: { phase: 'build', heapSize: 6, activeIdx: 1, siftPath: [0, 1] },
      swappingIndices: [0, 1],
      comparingIndices: undefined,
    });
    expect(() => engine.render(ctx, 400, 300, curr, prev, 0.5)).not.toThrow();

    // Nhánh isSiftSwap: 2 giá trị bay (arr[1]=13 và arr[0]=11) được vẽ label qua fillText
    const fillTextMock = ctx.fillText as unknown as ReturnType<typeof vi.fn>;
    const labels = fillTextMock.mock.calls.map(c => c[0]);
    expect(labels).toContain('13');
    expect(labels).toContain('11');
    expect(labels).toContain('12'); // con phải không swap vẫn vẽ ở vị trí cũ
  });

  it('draw tolerates single-element and full-heap states', () => {
    const engine = HeapSortRenderer.instance();
    const ctx = makeCtx() as unknown as CanvasRenderingContext2D;
    const snap = makeHeapSnap({
      array: [42],
      heapState: { phase: 'build', heapSize: 1, activeIdx: 0, siftPath: [0] },
      highlightedIndices: [],
      comparingIndices: undefined,
    });
    expect(() => engine.render(ctx, 400, 300, snap)).not.toThrow();
  });

  it('captionFor narrates compare, swap and phase actions in Vietnamese', () => {
    // Compare
    const cmp = makeHeapSnap({ comparingIndices: [1, 0] });
    expect(HeapSortRenderer.captionFor(cmp)).toContain('So sánh 11');
    expect(HeapSortRenderer.captionFor(cmp)).toContain('giữ 12');

    // Swap extract (root → cuối)
    const sw = makeHeapSnap({
      heapState: { phase: 'extract', heapSize: 4, activeIdx: 0, siftPath: [0] },
      swappingIndices: [0, 4],
    });
    const swCaption = HeapSortRenderer.captionFor(sw);
    expect(swCaption).toContain('Đổi chỗ 12 và 6');
    expect(swCaption).toContain('root về cuối mảng');

    // Build phase
    const build = makeHeapSnap({
      heapState: { phase: 'build', heapSize: 6, activeIdx: 2, siftPath: [2] },
      comparingIndices: undefined,
    });
    expect(HeapSortRenderer.captionFor(build)).toContain('Vun đống tại node 2');
  });
});
