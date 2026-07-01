import type { FrameDTO, AlgorithmResult } from '../../animation-engine/types/animation.types';

export interface CompareAlgorithmEntry {
  id: string;
  name: string;
  timeComplexity: string;
}

export interface CompareStats {
  comparisons: number;
  swaps: number;
  totalFrames: number;
  currentFrame: number;
  progressPercent: number;
}

export interface CompareSessionState {
  leftAlgorithmId: string;
  rightAlgorithmId: string;
  leftResult: AlgorithmResult | null;
  rightResult: AlgorithmResult | null;
  inputArray: number[];
}

export type ComparePlaybackMode = 'independent' | 'normalized';

export type ComparePlaybackState = 'UNINITIALIZED' | 'LOADED' | 'PLAYING' | 'PAUSED' | 'FINISHED';
