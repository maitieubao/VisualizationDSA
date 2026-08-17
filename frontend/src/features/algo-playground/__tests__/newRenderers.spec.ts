// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { StackQueueRenderer } from '../engine/renderers/StackQueueRenderer';
import { SearchingRenderer } from '../engine/renderers/SearchingRenderer';
import { TwoPointersRenderer } from '../engine/renderers/TwoPointersRenderer';
import { GraphRenderer } from '../engine/renderers/GraphRenderer';
import { MergeSortRenderer } from '../engine/renderers/MergeSortRenderer';
import { CountingSortRenderer } from '../engine/renderers/CountingSortRenderer';
import type { CanvasStateSnapshot } from '../../../core/CompilerStepExecutor';
import type { PlaybackContext } from '../engine/renderers/types';

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
    translate: vi.fn(),
    scale: vi.fn(),
    setLineDash: vi.fn(),
    setTransform: vi.fn(),
    measureText: vi.fn(() => ({ width: 10 })),
    shadowColor: '',
    shadowBlur: 0,
    lineWidth: 1,
    globalAlpha: 1,
    fillStyle: '',
    strokeStyle: '',
    font: '',
    textAlign: '',
    textBaseline: '',
  };
  return ctx;
}

const PB = (algorithmId: string): PlaybackContext => ({
  algorithmId,
  transition: 'move',
  swapPair: null,
  comparePair: null,
  highlightIdx: -1,
  prevArray: [],
});

function snap(overrides: Partial<CanvasStateSnapshot> = {}): CanvasStateSnapshot {
  return { array: [73, 74, 75, 71], ...overrides };
}

describe('StackQueueRenderer — visual cấu trúc LIFO/FIFO', () => {
  const renderer = new StackQueueRenderer();

  it('stack vẽ ô dọc từ state.stackIds và không throw khi push/pop transition', () => {
    const ctx = makeCtx() as unknown as CanvasRenderingContext2D;
    const curr = snap({ stackIds: ['0', '1'] });

    expect(() => renderer.draw(ctx, 400, 300, null, curr, 1, PB('stack'))).not.toThrow();

    // Push: 1 → 2 phần tử → animation path
    const prev1 = snap({ stackIds: ['0'] });
    const curr1 = snap({ stackIds: ['0', '1'] });
    expect(() => renderer.draw(ctx, 400, 300, prev1, curr1, 0.5, PB('stack'))).not.toThrow();

    // Pop: 2 → 1 phần tử
    expect(() => renderer.draw(ctx, 400, 300, curr1, prev1, 0.5, PB('stack'))).not.toThrow();
  });

  it('queue vẽ hàng ngang FIFO và không throw khi enqueue/dequeue transition', () => {
    const ctx = makeCtx() as unknown as CanvasRenderingContext2D;
    const curr = snap({ queueIds: ['10', '20'] });

    expect(() => renderer.draw(ctx, 400, 300, null, curr, 1, PB('queue'))).not.toThrow();

    const prev1 = snap({ queueIds: ['10'] });
    expect(() => renderer.draw(ctx, 400, 300, prev1, curr, 0.5, PB('queue'))).not.toThrow();
    expect(() => renderer.draw(ctx, 400, 300, curr, prev1, 0.5, PB('queue'))).not.toThrow();
  });

  it('monotonic-stack vẽ nhãn pha riêng', () => {
    const ctx = makeCtx() as unknown as CanvasRenderingContext2D;
    const curr = snap({ stackIds: ['0'] });
    renderer.draw(ctx, 400, 300, null, curr, 1, PB('monotonic-stack'));
    const texts = (ctx.fillText as ReturnType<typeof vi.fn>).mock.calls.map((c: unknown[]) => String(c[0]));
    expect(texts.some(t => t.includes('ĐƠN ĐIỆU'))).toBe(true);
  });
});

describe('SearchingRenderer — pointer lerp + vùng dim', () => {
  const renderer = new SearchingRenderer();

  it('linear-search dim vùng đã quét (bên trái con trỏ)', () => {
    const ctx = makeCtx() as unknown as CanvasRenderingContext2D;
    const curr = snap({
      array: [5, 3, 8, 4],
      comparingIndices: [2, 2],
      pointers: [{ index: 2, label: 'I', color: '#06b6d4' }],
      searchTarget: 8,
    });
    expect(() => renderer.draw(ctx, 400, 300, null, curr, 1, PB('linear-search'))).not.toThrow();
    // Có vẽ mũi tên + label "I" + target badge
    const texts = (ctx.fillText as ReturnType<typeof vi.fn>).mock.calls.map((c: unknown[]) => String(c[0]));
    expect(texts).toContain('I');
    expect(texts.some(t => t.includes('Target'))).toBe(true);
  });

  it('binary-search pointer trượt khi prev có cùng label', () => {
    const ctx = makeCtx() as unknown as CanvasRenderingContext2D;
    const prev = snap({
      array: [1, 2, 3, 4, 5],
      comparingIndices: [2, 2],
      pointers: [{ index: 2, label: 'M', color: '#3d9970' }],
      searchRange: { low: 0, high: 4 },
    });
    const curr = snap({
      array: [1, 2, 3, 4, 5],
      comparingIndices: [3, 3],
      pointers: [{ index: 3, label: 'M', color: '#3d9970' }],
      searchRange: { low: 3, high: 4 },
    });
    expect(() => renderer.draw(ctx, 400, 300, prev, curr, 0.5, PB('binary-search'))).not.toThrow();
  });
});

describe('TwoPointersRenderer — cửa sổ + 2 pointer', () => {
  const renderer = new TwoPointersRenderer();

  it('vẽ vùng giữa L..R và 2 pointer không throw', () => {
    const ctx = makeCtx() as unknown as CanvasRenderingContext2D;
    const curr = snap({
      array: [1, 2, 3, 4, 5],
      comparingIndices: [1, 3],
      pointers: [
        { index: 1, label: 'L', color: '#06b6d4' },
        { index: 3, label: 'R', color: '#ef4444' },
      ],
      searchTarget: 6,
    });
    expect(() => renderer.draw(ctx, 400, 300, null, curr, 1, PB('two-pointers'))).not.toThrow();
  });

  it('sliding-window dùng searchRange làm cửa sổ', () => {
    const ctx = makeCtx() as unknown as CanvasRenderingContext2D;
    const curr = snap({
      array: [2, 1, 5, 1, 3, 2],
      comparingIndices: [3, 3],
      pointers: [{ index: 3, label: 'W', color: '#06b6d4' }],
      searchRange: { low: 1, high: 3 },
    });
    expect(() => renderer.draw(ctx, 400, 300, null, curr, 1, PB('sliding-window'))).not.toThrow();
  });
});

describe('GraphRenderer — chip hàng đợi/ngăn xếp duyệt', () => {
  const renderer = new GraphRenderer();

  it('bfs vẽ chip HÀNG ĐỢI, dfs vẽ chip NGĂN XẾP', () => {
    const ctx = makeCtx() as unknown as CanvasRenderingContext2D;
    const graph = {
      graphNodes: [
        { id: 'A', label: 'A', x: 0.2, y: 0.5 },
        { id: 'B', label: 'B', x: 0.8, y: 0.5 },
      ],
      graphEdges: [{ from: 'A', to: 'B', weight: 1, directed: false }],
    };
    const bfsSnap = snap({ ...graph, queueIds: ['A', 'B'], visitedIds: ['A'], activeIds: ['A'] });
    expect(() => renderer.draw(ctx, 400, 300, null, bfsSnap, 1, PB('bfs'))).not.toThrow();
    const texts = (ctx.fillText as ReturnType<typeof vi.fn>).mock.calls.map((c: unknown[]) => String(c[0]));
    expect(texts.some(t => t.includes('HÀNG ĐỢI'))).toBe(true);

    ctx.fillText = vi.fn() as never;
    const dfsSnap = snap({ ...graph, stackIds: ['A', 'B'], visitedIds: ['A'], activeIds: ['A'] });
    expect(() => renderer.draw(ctx, 400, 300, null, dfsSnap, 1, PB('dfs'))).not.toThrow();
    const texts2 = (ctx.fillText as ReturnType<typeof vi.fn>).mock.calls.map((c: unknown[]) => String(c[0]));
    expect(texts2.some(t => t.includes('NGĂN XẾP'))).toBe(true);
  });
});

describe('MergeSortRenderer — chip bay khi trộn', () => {
  const renderer = MergeSortRenderer.instance();

  it('output tăng 1 phần tử giữa prev→curr → animation chip bay không throw', () => {
    const ctx = makeCtx() as unknown as CanvasRenderingContext2D;
    const mergeState = (output: number[], leftIdx: number, rightIdx: number) => ({
      phase: 'merge' as const,
      left: [27, 38],
      right: [3, 43],
      leftIdx,
      rightIdx,
      output,
      low: 0,
      mid: 1,
      high: 3,
      width: 2,
      pass: 0,
    });
    const prev = { array: [38, 27, 43, 3, 9, 82, 10], mergeState: mergeState([3], 0, 0) };
    const curr = { array: [38, 27, 43, 3, 9, 82, 10], mergeState: mergeState([3, 27], 1, 0) };
    expect(() => renderer.draw(ctx, 400, 300, prev as CanvasStateSnapshot, curr as CanvasStateSnapshot, 0.5, PB('merge-sort'))).not.toThrow();
  });

  it('frame tĩnh render() giữ nguyên hành vi 3 tầng', () => {
    const ctx = makeCtx() as unknown as CanvasRenderingContext2D;
    const snap = {
      array: [38, 27, 43, 3, 9, 82, 10],
      mergeState: { phase: 'merge', left: [27, 38], right: [3, 43], leftIdx: 1, rightIdx: 1, output: [3, 27], low: 0, mid: 1, high: 3, width: 2, pass: 0 },
    };
    expect(() => renderer.render(ctx, 400, 300, snap as CanvasStateSnapshot)).not.toThrow();
    expect((ctx.fillText as ReturnType<typeof vi.fn>).mock.calls.map((c: unknown[]) => String(c[0])).some(t => t.includes('TRỘN'))).toBe(true);
  });
});

describe('CountingSortRenderer — ghost bay input→count→output', () => {
  const renderer = new CountingSortRenderer();

  it('phase count: comparing[0] đổi → ghost bay không throw', () => {
    const ctx = makeCtx() as unknown as CanvasRenderingContext2D;
    const prev = { array: [2, 5, 3, 0, 2, 3, 0, 3], countArray: [0, 0, 0, 0], countingStep: 'count', comparingIndices: [0, 2], outputArray: [] };
    const curr = { array: [2, 5, 3, 0, 2, 3, 0, 3], countArray: [0, 0, 1, 0], countingStep: 'count', comparingIndices: [1, 5], outputArray: [] };
    expect(() => renderer.draw(ctx, 400, 300, prev as CanvasStateSnapshot, curr as CanvasStateSnapshot, 0.5, PB('counting-sort'))).not.toThrow();
  });

  it('phase output: output tăng → ghost bay từ ô đếm sang slot', () => {
    const ctx = makeCtx() as unknown as CanvasRenderingContext2D;
    const prev = { array: [2, 5, 3, 0], countArray: [1, 0, 1, 0], countingStep: 'output', comparingIndices: [0, 0], outputArray: [0] };
    const curr = { array: [2, 5, 3, 0], countArray: [1, 0, 0, 0], countingStep: 'output', comparingIndices: [0, 2], outputArray: [0, 2] };
    expect(() => renderer.draw(ctx, 400, 300, prev as CanvasStateSnapshot, curr as CanvasStateSnapshot, 0.5, PB('counting-sort'))).not.toThrow();
  });
});
