/**
 * animation.types.ts — Type-safe interfaces khớp với Backend C# DTOs.
 * Đảm bảo đồng bộ tuyệt đối giữa JSON payload API và Frontend TypeScript.
 */

export interface HighlightIndices {
  compare: number[];
  swap: number[];
  sorted: number[];
}

export interface FrameDTO {
  stepId: number;
  activeLine: number;
  explanation: string;
  dataState?: number[];
  highlights?: HighlightIndices;
  activeLogicalLineId?: string;
  variables?: Record<string, string | number>;

  // Optional Graph Animation properties
  visitedNodes?: string[];
  activeNodes?: string[];
  visitedEdges?: string[];
  distances?: Record<string, number>;
  queueStack?: string[];
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
