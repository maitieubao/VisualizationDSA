import type {
  HighlightIndices,
  TreeNodeDTO,
  GraphNodeDTO,
  GraphEdgeDTO,
  FrameDTO,
  AlgorithmResult,
} from '../../animation-engine/types/animation.types';

export type {
  HighlightIndices,
  TreeNodeDTO,
  GraphNodeDTO,
  GraphEdgeDTO,
  FrameDTO,
  AlgorithmResult,
};

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

export type RendererCategory = 'sorting' | 'searching' | 'stack-queue' | 'tree' | 'graph';
