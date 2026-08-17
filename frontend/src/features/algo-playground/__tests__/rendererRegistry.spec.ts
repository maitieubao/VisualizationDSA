// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { getRenderer } from '../engine/rendererRegistry';
import { ArraySortingRenderer } from '../engine/renderers/ArraySortingRenderer';
import { BucketSortRenderer } from '../engine/renderers/BucketSortRenderer';
import { CountingSortRenderer } from '../engine/renderers/CountingSortRenderer';
import { GraphRenderer } from '../engine/renderers/GraphRenderer';
import { HeapSortRenderer } from '../engine/renderers/HeapSortRenderer';
import { MergeSortRenderer } from '../engine/renderers/MergeSortRenderer';
import { RadixSortRenderer } from '../engine/renderers/RadixSortRenderer';
import { SearchingRenderer } from '../engine/renderers/SearchingRenderer';
import { StackQueueRenderer } from '../engine/renderers/StackQueueRenderer';
import { TreeRenderer } from '../engine/renderers/TreeRenderer';
import { TwoPointersRenderer } from '../engine/renderers/TwoPointersRenderer';
import type { CanvasStateSnapshot } from '../../../core/CompilerStepExecutor';

describe('rendererRegistry', () => {
  it('mỗi nhóm thuật toán map đúng renderer riêng', () => {
    const snap = { array: [1, 2, 3] } as CanvasStateSnapshot;
    expect(getRenderer('bubble-sort', snap)).toBeInstanceOf(ArraySortingRenderer);
    expect(getRenderer('selection-sort', snap)).toBeInstanceOf(ArraySortingRenderer);
    expect(getRenderer('insertion-sort', snap)).toBeInstanceOf(ArraySortingRenderer);
    expect(getRenderer('quick-sort', snap)).toBeInstanceOf(ArraySortingRenderer);
    expect(getRenderer('counting-sort', snap)).toBeInstanceOf(CountingSortRenderer);
    expect(getRenderer('radix-sort', snap)).toBeInstanceOf(RadixSortRenderer);
    expect(getRenderer('bucket-sort', snap)).toBeInstanceOf(BucketSortRenderer);
    expect(getRenderer('linear-search', snap)).toBeInstanceOf(SearchingRenderer);
    expect(getRenderer('binary-search', snap)).toBeInstanceOf(SearchingRenderer);
    expect(getRenderer('two-pointers', snap)).toBeInstanceOf(TwoPointersRenderer);
    expect(getRenderer('sliding-window', snap)).toBeInstanceOf(TwoPointersRenderer);
    expect(getRenderer('stack', snap)).toBeInstanceOf(StackQueueRenderer);
    expect(getRenderer('queue', snap)).toBeInstanceOf(StackQueueRenderer);
    expect(getRenderer('monotonic-stack', snap)).toBeInstanceOf(StackQueueRenderer);
    expect(getRenderer('bst', snap)).toBeInstanceOf(TreeRenderer);
    expect(getRenderer('tree-traversal', snap)).toBeInstanceOf(TreeRenderer);
    expect(getRenderer('bfs', snap)).toBeInstanceOf(GraphRenderer);
    expect(getRenderer('dfs', snap)).toBeInstanceOf(GraphRenderer);
    expect(getRenderer('dijkstra', snap)).toBeInstanceOf(GraphRenderer);
  });

  it('merge/heap sort ưu tiên theo state snapshot (data-driven)', () => {
    const mergeSnap = { array: [1], mergeState: { phase: 'merge', left: [], right: [], leftIdx: 0, rightIdx: 0, output: [], low: 0, mid: 0, high: 0, width: 1, pass: 0 } } as CanvasStateSnapshot;
    expect(getRenderer('merge-sort', mergeSnap)).toBeInstanceOf(MergeSortRenderer);

    const heapSnap = { array: [1], heapState: { phase: 'build', heapSize: 1, activeIdx: 0, siftPath: [] } } as CanvasStateSnapshot;
    expect(getRenderer('heap-sort', heapSnap)).toBeInstanceOf(HeapSortRenderer);
  });

  it('thuật toán không rõ → fallback ArraySortingRenderer (không crash)', () => {
    const snap = { array: [1] } as CanvasStateSnapshot;
    expect(getRenderer('unknown-algo', snap)).toBeInstanceOf(ArraySortingRenderer);
  });
});
