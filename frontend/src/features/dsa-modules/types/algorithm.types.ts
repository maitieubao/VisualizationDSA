export interface Algorithm {
  id: string;
  name: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeComplexity: string;
  spaceComplexity: string;
}

export interface AlgorithmMetadata {
  timeComplexity: string;
  spaceComplexity: string;
  description: string;
  pseudoCode: string[];
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

export interface HighlightIndices {
  compare: number[];
  swap: number[];
  sorted: number[];
  pivot?: number | null;
  found?: number | null;
  low?: number | null;
  mid?: number | null;
  high?: number | null;
  dimmed: number[];
  active: number[];
  target?: number;
}

export interface FrameDTO {
  stepId: number;
  activeLine: number;
  explanation: string;
  dataState: number[];
  highlights: HighlightIndices;
  treeNodes?: TreeNodeDTO[] | null;
  graphNodes?: GraphNodeDTO[] | null;
  graphEdges?: GraphEdgeDTO[] | null;
  distances?: Record<string, number>;
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

export type RendererCategory = 'sorting' | 'searching' | 'stack-queue' | 'tree' | 'graph';