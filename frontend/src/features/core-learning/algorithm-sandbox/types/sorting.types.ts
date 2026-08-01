/**
 * sorting.types.ts — Type definitions cho Sorting Algorithms.
 * [TYPES] — Dùng bởi tất cả frame generators và visualizers.
 */

export type BarStatus = "IDLE" | "COMPARING" | "PIVOT" | "SWAPPED" | "SORTED";

export interface SubArray {
  start: number;
  end: number;
  level: number;
  isActive: boolean;
}

export interface Partition {
  low: number;
  high: number;
  isActive: boolean;
  isSorted: boolean;
}

export interface SortFrame {
  stepIndex: number;
  arrayState: number[];
  arrayStateWithIds?: Array<{ id: number; value: number }>;
  comparingIndices: [number, number] | null;
  pivotIndex: number | null;
  swappedIndices: [number, number] | null;
  sortedIndices: number[];
  description: string;
  algorithm: SortAlgorithm;
  
  // Merge sort properties
  subArrays?: SubArray[];
  
  // Quick sort partitions
  partitions?: Partition[];

  // Heap sort properties
  heapSize?: number;

  // Radix sort properties
  radixBuckets?: number[][]; // 10 buckets, each holds numbers
  /** Same buckets but with stable IDs for :key binding in transition-group */
  radixBucketsWithIds?: Array<Array<{ id: number; value: number }>>;
  activeDigitPlace?: number; // 1, 10, 100, etc.
  radixStep?: "distribute" | "collect";

  // Counting sort properties
  countArray?: number[];
  countingStep?: "count" | "accumulate" | "output";
  inputArray?: number[];
  outputArray?: Array<number | null>;
  outputArrayWithIds?: Array<{ id: number; value: number } | null>;

  // Bucket sort properties
  bucketSortBuckets?: number[][];
  bucketSortBucketsWithIds?: Array<Array<{ id: number; value: number }>>;
  bucketStep?: "distribute" | "sort" | "collect";
  bucketSortActiveIdx?: number | null;
  bucketSortComparingBucketIndices?: [number, number] | null;
  bucketSortOutputWithIds?: Array<{ id: number; value: number } | null>;
}

export type SortAlgorithm = "bubble" | "quick" | "merge" | "heap" | "radix" | "counting" | "bucket";
