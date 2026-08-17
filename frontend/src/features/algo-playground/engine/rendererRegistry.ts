import type { CanvasStateSnapshot } from '../../../core/CompilerStepExecutor';
import { ArraySortingRenderer } from './renderers/ArraySortingRenderer';
import { BucketSortRenderer } from './renderers/BucketSortRenderer';
import { CountingSortRenderer } from './renderers/CountingSortRenderer';
import { GraphRenderer } from './renderers/GraphRenderer';
import { HeapSortRenderer } from './renderers/HeapSortRenderer';
import { MergeSortRenderer } from './renderers/MergeSortRenderer';
import { RadixSortRenderer } from './renderers/RadixSortRenderer';
import { SearchingRenderer } from './renderers/SearchingRenderer';
import { StackQueueRenderer } from './renderers/StackQueueRenderer';
import { TreeRenderer } from './renderers/TreeRenderer';
import { TwoPointersRenderer } from './renderers/TwoPointersRenderer';
import type { AlgoRenderer } from './renderers/types';

/**
 * Registry renderer theo nhóm thuật toán (Open-Closed — AGENTS.md Quy tắc 1):
 * thêm nhóm render mới = đăng ký 1 dòng ở đây, không sửa lõi engine.
 */
const arraySortingRenderer = new ArraySortingRenderer();
const mergeSortRenderer = MergeSortRenderer.instance();
const heapSortRenderer = HeapSortRenderer.instance();
const countingSortRenderer = new CountingSortRenderer();
const radixSortRenderer = new RadixSortRenderer();
const bucketSortRenderer = new BucketSortRenderer();
const searchingRenderer = new SearchingRenderer();
const twoPointersRenderer = new TwoPointersRenderer();
const stackQueueRenderer = new StackQueueRenderer();
const treeRenderer = new TreeRenderer();
const graphRenderer = new GraphRenderer();

/** Chọn renderer theo snapshot trước (data-driven), sau đó theo algorithmId. */
export function getRenderer(algorithmId: string, snap: CanvasStateSnapshot): AlgoRenderer {
  // Data-driven: snapshot mang state đặc thù thì ưu tiên renderer tương ứng
  if (MergeSortRenderer.canHandle(snap)) return mergeSortRenderer;
  if (HeapSortRenderer.canHandle(snap)) return heapSortRenderer;

  switch (algorithmId) {
    case 'counting-sort': return countingSortRenderer;
    case 'radix-sort': return radixSortRenderer;
    case 'bucket-sort': return bucketSortRenderer;
    case 'linear-search':
    case 'binary-search':
      return searchingRenderer;
    case 'two-pointers':
    case 'sliding-window':
      return twoPointersRenderer;
    case 'stack':
    case 'queue':
    case 'monotonic-stack':
      return stackQueueRenderer;
    case 'bst':
    case 'tree-traversal':
      return treeRenderer;
    case 'bfs':
    case 'dfs':
    case 'dijkstra':
      return graphRenderer;
    default:
      return arraySortingRenderer;
  }
}
