// @vitest-environment jsdom
// AL-009 (P1): drawPlaybackFrame / drawPlaybackFrameTransition trên snapshot
// tree/graph — active/visited/markEdge, lerp màu giữa 2 frame.
import { describe, it, expect, vi } from 'vitest';
import {
  drawPlaybackFrame,
  drawPlaybackFrameTransition,
} from '../renderer/playbackFrame';
import { lerpColor } from '../renderer/geometry';
import { COLORS } from '../renderer/colors';
import type { CanvasStateSnapshot } from '../../../core/CompilerStepExecutor';

interface TrackedCtx {
  ctx: Record<string, unknown>;
  calls: Record<string, unknown[][]>;
}

function defineTrackedProperty(target: Record<string, unknown>, name: string, calls: Record<string, unknown[][]>): void {
  let value: unknown = undefined;
  Object.defineProperty(target, name, {
    get: () => value,
    set: (v: unknown) => { value = v; (calls[name] ??= []).push(v as never); },
    configurable: true,
  });
}

function makeCtx(): TrackedCtx {
  const calls: Record<string, unknown[][]> = {};
  const fn = (name: string) => (...args: unknown[]): void => { (calls[name] ??= []).push(args); };
  const ctx: Record<string, unknown> = {
    clearRect: fn('clearRect'),
    beginPath: fn('beginPath'),
    moveTo: fn('moveTo'),
    lineTo: fn('lineTo'),
    arc: fn('arc'),
    arcTo: fn('arcTo'),
    closePath: fn('closePath'),
    fill: fn('fill'),
    stroke: fn('stroke'),
    fillText: fn('fillText'),
    fillRect: fn('fillRect'),
    strokeRect: fn('strokeRect'),
    setLineDash: fn('setLineDash'),
    save: fn('save'),
    restore: fn('restore'),
    measureText: vi.fn(() => ({ width: 40 })),
  };
  for (const name of ['fillStyle', 'strokeStyle', 'lineWidth', 'font', 'textAlign', 'textBaseline', 'globalAlpha', 'shadowBlur', 'shadowColor']) {
    defineTrackedProperty(ctx, name, calls);
  }
  return { ctx, calls };
}

const W = 400;
const H = 300;

function makeTreeSnap(overrides: Partial<CanvasStateSnapshot> = {}): CanvasStateSnapshot {
  return {
    array: [],
    treeNodes: [
      { id: '10', value: 10, leftId: '5', rightId: '15' },
      { id: '5', value: 5, leftId: '3', rightId: null },
      { id: '3', value: 3, leftId: null, rightId: null },
      { id: '15', value: 15, leftId: null, rightId: null },
    ],
    ...overrides,
  };
}

function makeGraphSnap(overrides: Partial<CanvasStateSnapshot> = {}): CanvasStateSnapshot {
  return {
    array: [],
    graphNodes: [
      { id: 'A', label: 'A', x: 0.2, y: 0.3 },
      { id: 'B', label: 'B', x: 0.8, y: 0.7 },
    ],
    graphEdges: [{ from: 'A', to: 'B', weight: 4 }],
    ...overrides,
  };
}

describe('algoCanvasHelpers — drawPlaybackFrame (AL-009)', () => {
  it('tree: node active/visited/default vẽ đúng màu state', () => {
    const { ctx, calls } = makeCtx();
    const snap = makeTreeSnap({
      activeIds: ['5'],
      visitedIds: ['3'],
      prunedNodeIds: ['15'],
    });
    drawPlaybackFrame(ctx as unknown as CanvasRenderingContext2D, W, H, snap);

    const fillStyles = calls.fillStyle ?? [];
    expect(fillStyles).toContain(COLORS.nodeActive);   // node '5' đang active
    expect(fillStyles).toContain(COLORS.nodeVisited);  // node '3' đã visited
    expect(fillStyles).toContain(COLORS.nodeDefault);  // root '10'
    expect(fillStyles).toContain(COLORS.nodePruned);   // node '15' bị prune

    const strokeStyles = calls.strokeStyle ?? [];
    expect(strokeStyles).toContain(COLORS.nodePruned); // cạnh root→15 bị prune
    expect(strokeStyles).toContain(COLORS.edgeDefault); // cạnh root→5 bình thường

    // Cạnh pruned vẽ nét đứt [4,4]
    const dashes = (calls.setLineDash ?? []).map(c => c[0]);
    expect(dashes).toContainEqual([4, 4]);

    // Node circle được vẽ đủ (4 node) + nhãn giá trị
    const arcCalls = (calls.arc ?? []).filter(c => c.length >= 3);
    expect(arcCalls.length).toBeGreaterThanOrEqual(4);
    const texts = (calls.fillText ?? []).map(c => c[0]);
    for (const v of ['10', '5', '3', '15']) expect(texts).toContain(v);
  });

  it('graph: cạnh markEdge highlight đổi màu + nét đứt, node vẽ label + weight', () => {
    const { ctx, calls } = makeCtx();
    const snap = makeGraphSnap({
      highlightedEdges: [['A', 'B']],
    });
    drawPlaybackFrame(ctx as unknown as CanvasRenderingContext2D, W, H, snap);

    const strokeStyles = calls.strokeStyle ?? [];
    expect(strokeStyles).toContain(COLORS.edgeHighlight); // cạnh đang được duyệt
    expect(strokeStyles).toContain(COLORS.nodeBorder);

    const lineWidths = calls.lineWidth ?? [];
    expect(lineWidths).toContain(3); // cạnh highlight dày hơn

    const dashes = (calls.setLineDash ?? []).map(c => c[0]);
    expect(dashes).toContainEqual([6, 4]);

    const texts = (calls.fillText ?? []).map(c => c[0]);
    expect(texts).toContain('A');
    expect(texts).toContain('B');
    expect(texts).toContain('4'); // weight badge
  });

  it('graph: node visited → màu visited, node không visited → default', () => {
    const { ctx, calls } = makeCtx();
    const snap = makeGraphSnap({ visitedIds: ['A'] });
    drawPlaybackFrame(ctx as unknown as CanvasRenderingContext2D, W, H, snap);

    const fillStyles = calls.fillStyle ?? [];
    expect(fillStyles).toContain(COLORS.nodeVisited);
    expect(fillStyles).toContain(COLORS.nodeDefault);
    // nodeActive may equal nodeDefault in some design systems — skip uniqueness check
  });

  it('array: bar swap/compare/sorted/default đúng màu (nền tảng draw array)', () => {
    const { ctx, calls } = makeCtx();
    const snap: CanvasStateSnapshot = {
      array: [-5, 3, 8, -2, 7, 4],
      swappingIndices: [1, 2],
      comparingIndices: [0, 5],
      highlightedIndices: [3],
    };
    drawPlaybackFrame(ctx as unknown as CanvasRenderingContext2D, W, H, snap);

    const fillStyles = calls.fillStyle ?? [];
    expect(fillStyles).toContain(COLORS.barSwap);
    expect(fillStyles).toContain(COLORS.barCompare);
    expect(fillStyles).toContain(COLORS.barSorted);
    expect(fillStyles).toContain(COLORS.barDefault);
  });
});

describe('algoCanvasHelpers — drawPlaybackFrameTransition (AL-009): lerp màu', () => {
  it('tree: node active→visited lerp giữa 2 frame (t=0 / 0.5 / 1)', () => {
    const prev = makeTreeSnap({ activeIds: ['5'] });
    const curr = makeTreeSnap({ visitedIds: ['5'] });

    for (const [t, expected] of [
      [0, lerpColor(COLORS.nodeActive, COLORS.nodeVisited, 0)],
      [1, lerpColor(COLORS.nodeActive, COLORS.nodeVisited, 1)],
    ] as Array<[number, string]>) {
      const { ctx, calls } = makeCtx();
      const handled = drawPlaybackFrameTransition(ctx as unknown as CanvasRenderingContext2D, W, H, prev, curr, t);
      expect(handled).toBe(true);
      const fillStyles = calls.fillStyle ?? [];
      expect(fillStyles).toContain(expected);
    }

    // Midpoint: nội suy chính xác qua lerpColor
    const expectedMid = lerpColor(COLORS.nodeActive, COLORS.nodeVisited, 0.5);
    const { ctx, calls } = makeCtx();
    drawPlaybackFrameTransition(ctx as unknown as CanvasRenderingContext2D, W, H, prev, curr, 0.5);
    const fillStyles = calls.fillStyle ?? [];
    expect(fillStyles).toContain(expectedMid);
  });

  it('tree: cạnh pruned→normal lerp màu giữa 2 frame', () => {
    const prev = makeTreeSnap({ prunedNodeIds: ['15'] });
    const curr = makeTreeSnap({});
    const { ctx, calls } = makeCtx();
    drawPlaybackFrameTransition(ctx as unknown as CanvasRenderingContext2D, W, H, prev, curr, 0.5);

    const expected = lerpColor(COLORS.nodePruned, COLORS.edgeDefault, 0.5);
    const strokeStyles = calls.strokeStyle ?? [];
    expect(strokeStyles).toContain(expected);
  });

  it('graph: cạnh highlight lerp từ default → highlight giữa 2 frame', () => {
    const prev = makeGraphSnap({});
    const curr = makeGraphSnap({ highlightedEdges: [['A', 'B']] });
    const { ctx, calls } = makeCtx();
    drawPlaybackFrameTransition(ctx as unknown as CanvasRenderingContext2D, W, H, prev, curr, 0.5);

    const expected = lerpColor(COLORS.edgeDefault, COLORS.edgeHighlight, 0.5);
    const strokeStyles = calls.strokeStyle ?? [];
    expect(strokeStyles).toContain(expected);
  });

  it('graph: node visited→active lerp màu giữa 2 frame', () => {
    const prev = makeGraphSnap({ visitedIds: ['A'] });
    const curr = makeGraphSnap({ activeIds: ['A'] });
    const { ctx, calls } = makeCtx();
    drawPlaybackFrameTransition(ctx as unknown as CanvasRenderingContext2D, W, H, prev, curr, 0.5);

    const expected = lerpColor(COLORS.nodeVisited, COLORS.nodeActive, 0.5);
    const fillStyles = calls.fillStyle ?? [];
    expect(fillStyles).toContain(expected);
  });

  it('snapshot thuần array → trả false (engine fallback về pipeline array) + không clear', () => {
    const { ctx, calls } = makeCtx();
    const prev: CanvasStateSnapshot = { array: [5, 3, 8, 4, 2] };
    const curr: CanvasStateSnapshot = { array: [3, 5, 8, 4, 2], swappingIndices: [0, 1] };
    const handled = drawPlaybackFrameTransition(ctx as unknown as CanvasRenderingContext2D, W, H, prev, curr, 0.5);
    expect(handled).toBe(false);
    expect(calls.clearRect).toBeUndefined();
  });

  it('transition cũng vẽ overlay (target badge) cho tree/graph', () => {
    const prev = makeTreeSnap({});
    const curr = makeTreeSnap({ searchTarget: 5, searchFound: false });
    const { ctx, calls } = makeCtx();
    drawPlaybackFrameTransition(ctx as unknown as CanvasRenderingContext2D, W, H, prev, curr, 1);

    const texts = (calls.fillText ?? []).map(c => c[0]);
    expect(texts).toContain('Target: 5');
  });
});
