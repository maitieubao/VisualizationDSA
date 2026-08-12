export interface HighlightIndices {
  compare: number[];
  swap: number[];
  sorted: number[];
  /** CV-144: GÁN mới cho 1 phần tử (khác hoán vị 2 phần tử) — renderer có thể tô màu riêng */
  assign?: number[];
  pivot?: number | null;
  found?: number | null;
  low?: number | null;
  mid?: number | null;
  high?: number | null;
  dimmed?: number[];
  active?: number[];
  target?: number;
}

export interface TreeNodeDTO {
  id: number;
  value: number;
  leftNodeId: number | null;
  rightNodeId: number | null;
}

export interface GraphNodeDTO {
  id: number;
  value: number;
  x: number;
  y: number;
  label?: string;
}

export interface GraphEdgeDTO {
  from: number;
  to: number;
  weight?: number;
  directed?: boolean;
  highlighted?: boolean;
  inMST?: boolean;
}

export interface FrameDTO {
  stepId: number;
  activeLine: number;
  explanation: string;
  dataState?: number[];
  highlights?: HighlightIndices;
  activeLogicalLineId?: string;
  variables?: Record<string, string | number>;

  visitedNodes?: string[];
  activeNodes?: string[];
  visitedEdges?: string[];
  distances?: Record<string, number>;
  queueStack?: string[];

  treeNodes?: TreeNodeDTO[] | null;
  graphNodes?: GraphNodeDTO[] | null;
  graphEdges?: GraphEdgeDTO[] | null;
  predecessors?: Record<number, number> | null;
  queueState?: number[] | null;
  visitedSet?: number[] | null;
  currentPath?: number[] | null;
  openSet?: number[] | null;
  closedSet?: number[] | null;
  balanceFactors?: Record<number, number> | null;
  rotationInfo?: string;
  heapArray?: number[] | null;
  heapSize?: number | null;
}

export interface AlgorithmResult {
  algorithmId: string;
  pseudoCode: string[];
  frames: FrameDTO[];
}

export interface AlgorithmRequest {
  algorithmId: string;
  dataType: string;
  inputData: number[];
}

export type PlaybackState = 'UNINITIALIZED' | 'LOADED' | 'PLAYING' | 'PAUSED' | 'FINISHED';
