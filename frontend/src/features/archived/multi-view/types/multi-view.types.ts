/** Snapshot of algorithm state at a single timeline step */
export interface TimelineStep {
  stepIndex: number;
  activeLineNumber: number;
  activeFlowchartNodeId: string;
  memoryStateSnapshot: Record<string, unknown>;
}

/** Callback invoked when the active timeline step changes */
export type StepChangedCallback = (step: TimelineStep) => void;

/** Supported playback speed multipliers */
export type PlaybackSpeed = 0.25 | 0.5 | 1 | 2 | 4;

/** Layout mode for split panes */
export type PaneLayout = 'two-panel' | 'three-panel';

/** Identifier for each view panel */
export type PanelId = 'code-editor' | 'flowchart-view' | 'svg-visualizer';

/** Configuration for a single pane in the layout */
export interface PaneConfig {
  panelId: PanelId;
  widthPercent: number;
}

/** Result of a seek operation */
export interface SeekResult {
  success: boolean;
  elapsedMs: number;
}

/** Drag state for the resizable splitter */
export interface DragState {
  isDragging: boolean;
  currentPercentage: number;
}

/** Minimum and maximum pane width percentage (clamping bounds) */
export const PANE_MIN_PERCENT = 15;
export const PANE_MAX_PERCENT = 85;

/** Supported playback speed values */
export const PLAYBACK_SPEEDS: PlaybackSpeed[] = [0.25, 0.5, 1, 2, 4];

/** Default playback interval base (ms at 1x speed) */
export const PLAYBACK_INTERVAL_BASE_MS = 1000;
