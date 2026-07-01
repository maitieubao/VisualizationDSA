export { default as MultiViewWorkspace } from './components/MultiViewWorkspace.vue';
export { useMultiViewStore } from './store/useMultiViewStore';
export { MultiViewEventBus } from './engine/MultiViewEventBus';
export { SynchronizedTimelineManager } from './engine/SynchronizedTimelineManager';
export { ThrottledDragCoordinator } from './engine/ThrottledDragCoordinator';
export type {
  TimelineStep,
  StepChangedCallback,
  PlaybackSpeed,
  PaneLayout,
  PanelId,
  PaneConfig,
  SeekResult,
  DragState,
} from './types/multi-view.types';
export {
  PANE_MIN_PERCENT,
  PANE_MAX_PERCENT,
  PLAYBACK_SPEEDS,
  PLAYBACK_INTERVAL_BASE_MS,
} from './types/multi-view.types';
