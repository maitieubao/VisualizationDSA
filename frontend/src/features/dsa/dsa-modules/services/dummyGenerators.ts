import type { AlgorithmResult, HighlightIndices } from '@/features/dsa/dsa-modules/types/algorithm.types';
import {
  generateLinearSearch,
  generateBinarySearch,
  generateBubbleSort,
  generateSelectionSort,
  generateInsertionSort,
  generateQuickSort,
  generateMergeSort,
  generateHeapSort,
  generateRadixSort,
  generateCountingSort,
  generateBucketSort,
} from './sortingGenerators';
import { generateStack, generateQueue, generateBST } from './dataStructureGenerators';
import { generateBFS, generateDFS, generateDijkstra, generateSlidingWindow, generateMonotonicStack } from './premiumGenerators';
import { LOCAL_METADATA } from '../store/algorithmLocalMetadata';

function defaultHighlights(overrides?: Partial<HighlightIndices>): HighlightIndices {
  return { compare: [], swap: [], sorted: [], dimmed: [], active: [], ...overrides };
}

const GENERATORS: Record<string, (input: number[]) => AlgorithmResult> = {
  'linear-search':   generateLinearSearch,
  'binary-search':   generateBinarySearch,
  'bubble-sort':     generateBubbleSort,
  'selection-sort':  generateSelectionSort,
  'insertion-sort':  generateInsertionSort,
  'quick-sort':      generateQuickSort,
  'merge-sort':      generateMergeSort,
  'heap-sort':       generateHeapSort,
  'radix-sort':      generateRadixSort,
  'counting-sort':   generateCountingSort,
  'bucket-sort':     generateBucketSort,
  'sliding-window':  generateSlidingWindow,
  stack:             generateStack,
  queue:             generateQueue,
  'monotonic-stack': generateMonotonicStack,
  bst:               generateBST,
  bfs:               generateBFS,
  dfs:               generateDFS,
  dijkstra:          generateDijkstra,
};

export function generateDummyResult(algorithmId: string, inputData: number[]): AlgorithmResult {
  const generator = GENERATORS[algorithmId];
  if (!generator) {
    return {
      algorithmId,
      pseudoCode: LOCAL_METADATA[algorithmId]?.pseudoCode || ['// Không có mã giả cho thuật toán này'],
      frames: [{ stepId: 1, activeLine: 0, explanation: `Thuật toán '${algorithmId}' chưa có logic sinh frame động.`, dataState: [...inputData], highlights: defaultHighlights() }],
    };
  }
  return generator(inputData);
}
