/**
 * VCR Timeline Playback Types
 * Defines PlaybackFrame, PlaybackStatus, speed presets and scrubber math types.
 */

export type PlaybackStatus = 'PLAYING' | 'PAUSED' | 'STOPPED';

export interface PlaybackFrame {
  stepIndex: number;
  canvasStateSnapshot: CanvasStateSnapshot;
  lineNumber: number;
  description: string;
}

export interface CanvasStateSnapshot {
  array: number[];
  highlights?: HighlightedIndex[];
  pointers?: Record<string, number>;
}

export interface HighlightedIndex {
  index: number;
  color: string;
}

export interface ScrubberPosition {
  percent: number;
  stepIndex: number;
}

export interface SpeedPreset {
  label: string;
  value: number;
}

export const SPEED_PRESETS: SpeedPreset[] = [
  { label: '0.1x', value: 0.1 },
  { label: '0.25x', value: 0.25 },
  { label: '0.5x', value: 0.5 },
  { label: '1x', value: 1.0 },
  { label: '1.5x', value: 1.5 },
  { label: '2x', value: 2.0 },
  { label: '5x', value: 5.0 },
];

export const SPEED_MIN = 0.1;
export const SPEED_MAX = 5.0;
export const STEP_DEBOUNCE_MS = 100;
export const DEFAULT_STEP_INTERVAL_MS = 1000;
