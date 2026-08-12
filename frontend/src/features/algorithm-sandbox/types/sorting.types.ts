




export type BarStatus = "IDLE" | "COMPARING" | "PIVOT" | "SWAPPED" | "SORTED";

/** CC-009: bản đồ highlight chuẩn hóa theo hợp đồng chung (tương thích FrameDTO.highlights của dsa-modules) */
export interface SortHighlights {
  compare: number[];
  swap: number[];
  sorted: number[];
  /** Gán đơn 1 phần tử (VD phép ghi đè arr[k] trong Merge) — khác hoán vị 2 phần tử */
  assign?: number[];
  pivot?: number | null;
  dimmed?: number[];
  active?: number[];
}

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
  /** Trace Table: giá trị các biến điều khiển tại bước này (i, j, low, high, pivot, swaps...) */
  variables?: Record<string, string | number>;
  
  
  subArrays?: SubArray[];
  
  
  partitions?: Partition[];

  
  heapSize?: number;

  
  radixBuckets?: number[][]; 
  
  radixBucketsWithIds?: Array<Array<{ id: number; value: number }>>;
  activeDigitPlace?: number; 
  radixStep?: "distribute" | "collect";

  
  countArray?: number[];
  countingStep?: "count" | "accumulate" | "output";
  inputArray?: number[];
  inputArrayWithIds?: Array<{ id: number; value: number }>;
  outputArray?: Array<number | null>;
  outputArrayWithIds?: Array<{ id: number; value: number } | null>;

  
  bucketSortBuckets?: number[][];
  bucketSortBucketsWithIds?: Array<Array<{ id: number; value: number }>>;
  bucketRangeLabels?: string[];
  bucketStep?: "distribute" | "sort" | "collect";
  bucketSortActiveIdx?: number | null;
  bucketSortComparingBucketIndices?: [number, number] | null;
  bucketSortOutputWithIds?: Array<{ id: number; value: number } | null>;

  /** CC-009: dòng vật lý trong Monaco/pseudocode panel tương ứng bước này (≥ 1; 0/undefined = chưa ánh xạ) */
  lineNumber?: number;
  /** CC-009: logicalId chuẩn của pseudocode script tương ứng bước này (VD OUTER_LOOP, COMPARE_STEP...) */
  activeLogicalLineId?: string;
  /** CC-009: highlight chuẩn hóa cho renderer chung — KHÔNG thay thế comparingIndices/swappedIndices cũ */
  highlights?: SortHighlights;
}

export type SortAlgorithm = "bubble" | "quick" | "merge" | "heap" | "radix" | "counting" | "bucket";
