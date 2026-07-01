import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  TimelineStep,
  PlaybackSpeed,
  PanelId,
  PaneLayout,
} from '../types/multi-view.types';
import { PLAYBACK_INTERVAL_BASE_MS, PLAYBACK_SPEEDS } from '../types/multi-view.types';
import { MultiViewEventBus } from '../engine/MultiViewEventBus';
import { SynchronizedTimelineManager } from '../engine/SynchronizedTimelineManager';

/**
 * Pinia Setup Store for Multi-View Synchronization.
 * Manages timeline playback, panel layout, and VCR controls.
 */
export const useMultiViewStore = defineStore('multiView', () => {
  // ==========================================
  // STATE
  // ==========================================
  const activePanels = ref<PanelId[]>(['code-editor', 'svg-visualizer']);
  const paneLayout = ref<PaneLayout>('two-panel');
  const leftPanePercent = ref(50);
  const currentStepIndex = ref(0);
  const totalStepsCount = ref(0);
  const playbackSpeed = ref<PlaybackSpeed>(1);
  const isPlaying = ref(false);
  const isDraggingSplitter = ref(false);

  let playbackIntervalId: ReturnType<typeof setInterval> | null = null;
  let timelineManager: SynchronizedTimelineManager | null = null;

  const loadedTimelineSteps = ref<TimelineStep[]>([]);

  // Demo timeline for Bubble Sort (pre-loaded)
  const DEMO_STEPS: TimelineStep[] = [
    { stepIndex: 0, activeLineNumber: 1, activeFlowchartNodeId: 'start', memoryStateSnapshot: { array: [45, 12, 85, 32, 9, 60], comparing: [] } },
    { stepIndex: 1, activeLineNumber: 3, activeFlowchartNodeId: 'outer-loop', memoryStateSnapshot: { array: [45, 12, 85, 32, 9, 60], comparing: [0, 1] } },
    { stepIndex: 2, activeLineNumber: 5, activeFlowchartNodeId: 'compare', memoryStateSnapshot: { array: [45, 12, 85, 32, 9, 60], comparing: [0, 1], result: 'gt' } },
    { stepIndex: 3, activeLineNumber: 7, activeFlowchartNodeId: 'swap', memoryStateSnapshot: { array: [12, 45, 85, 32, 9, 60], comparing: [0, 1], swapped: true } },
    { stepIndex: 4, activeLineNumber: 5, activeFlowchartNodeId: 'compare', memoryStateSnapshot: { array: [12, 45, 85, 32, 9, 60], comparing: [1, 2] } },
    { stepIndex: 5, activeLineNumber: 5, activeFlowchartNodeId: 'compare', memoryStateSnapshot: { array: [12, 45, 85, 32, 9, 60], comparing: [2, 3], result: 'gt' } },
    { stepIndex: 6, activeLineNumber: 7, activeFlowchartNodeId: 'swap', memoryStateSnapshot: { array: [12, 45, 32, 85, 9, 60], comparing: [2, 3], swapped: true } },
    { stepIndex: 7, activeLineNumber: 5, activeFlowchartNodeId: 'compare', memoryStateSnapshot: { array: [12, 45, 32, 85, 9, 60], comparing: [3, 4], result: 'gt' } },
    { stepIndex: 8, activeLineNumber: 7, activeFlowchartNodeId: 'swap', memoryStateSnapshot: { array: [12, 45, 32, 9, 85, 60], comparing: [3, 4], swapped: true } },
    { stepIndex: 9, activeLineNumber: 5, activeFlowchartNodeId: 'compare', memoryStateSnapshot: { array: [12, 45, 32, 9, 85, 60], comparing: [4, 5], result: 'gt' } },
    { stepIndex: 10, activeLineNumber: 7, activeFlowchartNodeId: 'swap', memoryStateSnapshot: { array: [12, 45, 32, 9, 60, 85], comparing: [4, 5], swapped: true } },
    { stepIndex: 11, activeLineNumber: 11, activeFlowchartNodeId: 'highlight', memoryStateSnapshot: { array: [12, 45, 32, 9, 60, 85], sorted: [5] } },
    { stepIndex: 12, activeLineNumber: 3, activeFlowchartNodeId: 'outer-loop', memoryStateSnapshot: { array: [12, 45, 32, 9, 60, 85], comparing: [0, 1], sorted: [5] } },
    { stepIndex: 13, activeLineNumber: 5, activeFlowchartNodeId: 'compare', memoryStateSnapshot: { array: [12, 45, 32, 9, 60, 85], comparing: [1, 2], result: 'gt' } },
    { stepIndex: 14, activeLineNumber: 7, activeFlowchartNodeId: 'swap', memoryStateSnapshot: { array: [12, 32, 45, 9, 60, 85], comparing: [1, 2], swapped: true } },
    { stepIndex: 15, activeLineNumber: 5, activeFlowchartNodeId: 'compare', memoryStateSnapshot: { array: [12, 32, 45, 9, 60, 85], comparing: [2, 3], result: 'gt' } },
    { stepIndex: 16, activeLineNumber: 7, activeFlowchartNodeId: 'swap', memoryStateSnapshot: { array: [12, 32, 9, 45, 60, 85], comparing: [2, 3], swapped: true } },
    { stepIndex: 17, activeLineNumber: 11, activeFlowchartNodeId: 'highlight', memoryStateSnapshot: { array: [12, 32, 9, 45, 60, 85], sorted: [4, 5] } },
    { stepIndex: 18, activeLineNumber: 14, activeFlowchartNodeId: 'end', memoryStateSnapshot: { array: [9, 12, 32, 45, 60, 85], sorted: [0, 1, 2, 3, 4, 5] } },
  ];

  // ==========================================
  // COMPUTED
  // ==========================================
  const progressPercent = computed(() => {
    if (totalStepsCount.value === 0) return 0;
    return Math.round((currentStepIndex.value / (totalStepsCount.value - 1)) * 100);
  });

  const currentStep = computed<TimelineStep | null>(() => {
    if (loadedTimelineSteps.value.length === 0) return null;
    return loadedTimelineSteps.value[currentStepIndex.value] ?? null;
  });

  const isAtStart = computed(() => currentStepIndex.value <= 0);
  const isAtEnd = computed(() => currentStepIndex.value >= totalStepsCount.value - 1);

  const rightPanePercent = computed(() => 100 - leftPanePercent.value);

  // ==========================================
  // ACTIONS
  // ==========================================

  function initializeTimeline(steps: TimelineStep[]): void {
    loadedTimelineSteps.value = steps;
    totalStepsCount.value = steps.length;
    currentStepIndex.value = 0;
    timelineManager = new SynchronizedTimelineManager(steps);
    timelineManager.seekToStep(0);
  }

  function initializeDemoTimeline(): void {
    initializeTimeline(DEMO_STEPS);
  }

  function seekToStep(index: number): void {
    if (!timelineManager) return;
    const result = timelineManager.seekToStep(index);
    if (result.success) {
      currentStepIndex.value = index;
    }
  }

  function stepNext(): void {
    if (!timelineManager) return;
    const result = timelineManager.stepNext();
    if (result.success) {
      currentStepIndex.value = timelineManager.getCurrentStepIndex();
    }
  }

  function stepPrev(): void {
    if (!timelineManager) return;
    const result = timelineManager.stepPrev();
    if (result.success) {
      currentStepIndex.value = timelineManager.getCurrentStepIndex();
    }
  }

  function togglePlayback(): void {
    isPlaying.value = !isPlaying.value;
    if (isPlaying.value) {
      startPlaybackLoop();
    } else {
      stopPlaybackLoop();
    }
  }

  function startPlaybackLoop(): void {
    stopPlaybackLoop();
    const intervalMs = PLAYBACK_INTERVAL_BASE_MS / playbackSpeed.value;
    playbackIntervalId = setInterval(() => {
      if (currentStepIndex.value < totalStepsCount.value - 1) {
        seekToStep(currentStepIndex.value + 1);
      } else {
        stopPlaybackLoop();
        isPlaying.value = false;
      }
    }, intervalMs);
  }

  function stopPlaybackLoop(): void {
    if (playbackIntervalId !== null) {
      clearInterval(playbackIntervalId);
      playbackIntervalId = null;
    }
  }

  function setPlaybackSpeed(speed: PlaybackSpeed): void {
    playbackSpeed.value = speed;
    if (isPlaying.value) {
      startPlaybackLoop();
    }
  }

  function setLeftPanePercent(percent: number): void {
    leftPanePercent.value = percent;
  }

  function setDraggingSplitter(dragging: boolean): void {
    isDraggingSplitter.value = dragging;
  }

  function toggleLayout(): void {
    if (paneLayout.value === 'two-panel') {
      paneLayout.value = 'three-panel';
      activePanels.value = ['code-editor', 'flowchart-view', 'svg-visualizer'];
    } else {
      paneLayout.value = 'two-panel';
      activePanels.value = ['code-editor', 'svg-visualizer'];
    }
    leftPanePercent.value = 50;
  }

  function resetToDefaults(): void {
    stopPlaybackLoop();
    isPlaying.value = false;
    currentStepIndex.value = 0;
    playbackSpeed.value = 1;
    leftPanePercent.value = 50;
    paneLayout.value = 'two-panel';
    activePanels.value = ['code-editor', 'svg-visualizer'];
    if (timelineManager) {
      timelineManager.seekToStep(0);
    }
  }

  function destroyStore(): void {
    stopPlaybackLoop();
    isPlaying.value = false;
    MultiViewEventBus.unsubscribeAll();
  }

  return {
    // State
    activePanels,
    paneLayout,
    leftPanePercent,
    currentStepIndex,
    totalStepsCount,
    playbackSpeed,
    isPlaying,
    isDraggingSplitter,
    loadedTimelineSteps,
    // Computed
    progressPercent,
    currentStep,
    isAtStart,
    isAtEnd,
    rightPanePercent,
    // Actions
    initializeTimeline,
    initializeDemoTimeline,
    seekToStep,
    stepNext,
    stepPrev,
    togglePlayback,
    setPlaybackSpeed,
    setLeftPanePercent,
    setDraggingSplitter,
    toggleLayout,
    resetToDefaults,
    destroyStore,
    // Constants for UI
    PLAYBACK_SPEEDS,
  };
});
