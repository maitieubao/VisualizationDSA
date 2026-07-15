import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useMultiViewStore } from '../store/useMultiViewStore';
import { MultiViewEventBus } from '../engine/MultiViewEventBus';
import type { TimelineStep } from '../types/multi-view.types';

function createSteps(count: number): TimelineStep[] {
  return Array.from({ length: count }, (_, i) => ({
    stepIndex: i,
    activeLineNumber: i + 1,
    activeFlowchartNodeId: `node-${i}`,
    memoryStateSnapshot: { array: [i] },
  }));
}

describe('useMultiViewStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    MultiViewEventBus.unsubscribeAll();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should have default active panels (code-editor, svg-visualizer)', () => {
      const store = useMultiViewStore();
      expect(store.activePanels).toEqual(['code-editor', 'svg-visualizer']);
    });

    it('should start with two-panel layout', () => {
      const store = useMultiViewStore();
      expect(store.paneLayout).toBe('two-panel');
    });

    it('should start with 50% left pane', () => {
      const store = useMultiViewStore();
      expect(store.leftPanePercent).toBe(50);
    });

    it('should start with playback speed 1x', () => {
      const store = useMultiViewStore();
      expect(store.playbackSpeed).toBe(1);
    });

    it('should not be playing initially', () => {
      const store = useMultiViewStore();
      expect(store.isPlaying).toBe(false);
    });

    it('should have zero steps initially', () => {
      const store = useMultiViewStore();
      expect(store.totalStepsCount).toBe(0);
      expect(store.currentStepIndex).toBe(0);
    });

    it('should have 0% progress initially', () => {
      const store = useMultiViewStore();
      expect(store.progressPercent).toBe(0);
    });

    it('should have null currentStep initially', () => {
      const store = useMultiViewStore();
      expect(store.currentStep).toBeNull();
    });

    it('should not be dragging splitter initially', () => {
      const store = useMultiViewStore();
      expect(store.isDraggingSplitter).toBe(false);
    });
  });

  describe('initializeTimeline', () => {
    it('should load steps and set totalStepsCount', () => {
      const store = useMultiViewStore();
      const steps = createSteps(10);
      store.initializeTimeline(steps);
      expect(store.totalStepsCount).toBe(10);
      expect(store.loadedTimelineSteps).toHaveLength(10);
    });

    it('should reset currentStepIndex to 0', () => {
      const store = useMultiViewStore();
      store.initializeTimeline(createSteps(5));
      store.seekToStep(3);
      store.initializeTimeline(createSteps(8));
      expect(store.currentStepIndex).toBe(0);
    });

    it('should update currentStep computed', () => {
      const store = useMultiViewStore();
      const steps = createSteps(5);
      store.initializeTimeline(steps);
      expect(store.currentStep).toEqual(steps[0]);
    });
  });

  describe('initializeDemoTimeline', () => {
    it('should load demo Bubble Sort steps', () => {
      const store = useMultiViewStore();
      store.initializeDemoTimeline();
      expect(store.totalStepsCount).toBeGreaterThan(0);
      expect(store.loadedTimelineSteps.length).toBeGreaterThan(0);
    });

    it('should start at step 0 after demo init', () => {
      const store = useMultiViewStore();
      store.initializeDemoTimeline();
      expect(store.currentStepIndex).toBe(0);
    });
  });

  describe('seekToStep', () => {
    it('should update currentStepIndex on valid seek', () => {
      const store = useMultiViewStore();
      store.initializeTimeline(createSteps(10));
      store.seekToStep(5);
      expect(store.currentStepIndex).toBe(5);
    });

    it('should not change index on out-of-bounds seek', () => {
      const store = useMultiViewStore();
      store.initializeTimeline(createSteps(5));
      store.seekToStep(2);
      store.seekToStep(-1);
      expect(store.currentStepIndex).toBe(2);
    });

    it('should not change index when seeking beyond total', () => {
      const store = useMultiViewStore();
      store.initializeTimeline(createSteps(5));
      store.seekToStep(2);
      store.seekToStep(100);
      expect(store.currentStepIndex).toBe(2);
    });

    it('should update currentStep computed after seek', () => {
      const store = useMultiViewStore();
      const steps = createSteps(5);
      store.initializeTimeline(steps);
      store.seekToStep(3);
      expect(store.currentStep).toEqual(steps[3]);
    });

    it('should do nothing when timeline not initialized', () => {
      const store = useMultiViewStore();
      store.seekToStep(5);
      expect(store.currentStepIndex).toBe(0);
    });
  });

  describe('stepNext / stepPrev', () => {
    it('should advance one step with stepNext', () => {
      const store = useMultiViewStore();
      store.initializeTimeline(createSteps(5));
      store.stepNext();
      expect(store.currentStepIndex).toBe(1);
    });

    it('should go back one step with stepPrev', () => {
      const store = useMultiViewStore();
      store.initializeTimeline(createSteps(5));
      store.seekToStep(3);
      store.stepPrev();
      expect(store.currentStepIndex).toBe(2);
    });

    it('should not go below 0 with stepPrev', () => {
      const store = useMultiViewStore();
      store.initializeTimeline(createSteps(5));
      store.stepPrev();
      expect(store.currentStepIndex).toBe(0);
    });

    it('should not go past end with stepNext', () => {
      const store = useMultiViewStore();
      store.initializeTimeline(createSteps(3));
      store.seekToStep(2);
      store.stepNext();
      expect(store.currentStepIndex).toBe(2);
    });
  });

  describe('progressPercent computed', () => {
    it('should be 0% at first step', () => {
      const store = useMultiViewStore();
      store.initializeTimeline(createSteps(10));
      expect(store.progressPercent).toBe(0);
    });

    it('should be 100% at last step', () => {
      const store = useMultiViewStore();
      store.initializeTimeline(createSteps(10));
      store.seekToStep(9);
      expect(store.progressPercent).toBe(100);
    });

    it('should be 50% at middle step', () => {
      const store = useMultiViewStore();
      store.initializeTimeline(createSteps(11));
      store.seekToStep(5);
      expect(store.progressPercent).toBe(50);
    });
  });

  describe('isAtStart / isAtEnd computed', () => {
    it('isAtStart should be true at index 0', () => {
      const store = useMultiViewStore();
      store.initializeTimeline(createSteps(5));
      expect(store.isAtStart).toBe(true);
    });

    it('isAtStart should be false after step forward', () => {
      const store = useMultiViewStore();
      store.initializeTimeline(createSteps(5));
      store.stepNext();
      expect(store.isAtStart).toBe(false);
    });

    it('isAtEnd should be true at last step', () => {
      const store = useMultiViewStore();
      store.initializeTimeline(createSteps(5));
      store.seekToStep(4);
      expect(store.isAtEnd).toBe(true);
    });

    it('isAtEnd should be false at first step with multiple steps', () => {
      const store = useMultiViewStore();
      store.initializeTimeline(createSteps(5));
      expect(store.isAtEnd).toBe(false);
    });
  });

  describe('playback', () => {
    it('should toggle isPlaying on togglePlayback', () => {
      const store = useMultiViewStore();
      store.initializeTimeline(createSteps(5));
      expect(store.isPlaying).toBe(false);
      store.togglePlayback();
      expect(store.isPlaying).toBe(true);
      store.togglePlayback();
      expect(store.isPlaying).toBe(false);
    });

    it('should advance steps automatically when playing at 1x', () => {
      const store = useMultiViewStore();
      store.initializeTimeline(createSteps(5));
      store.togglePlayback();

      vi.advanceTimersByTime(1000);
      expect(store.currentStepIndex).toBe(1);

      vi.advanceTimersByTime(1000);
      expect(store.currentStepIndex).toBe(2);
    });

    it('should auto-stop when reaching the last step', () => {
      const store = useMultiViewStore();
      store.initializeTimeline(createSteps(3));
      store.togglePlayback();

      vi.advanceTimersByTime(1000);
      expect(store.currentStepIndex).toBe(1);

      vi.advanceTimersByTime(1000);
      expect(store.currentStepIndex).toBe(2);

      vi.advanceTimersByTime(1000);
      expect(store.isPlaying).toBe(false);
    });

    it('should advance at 2x speed (500ms intervals)', () => {
      const store = useMultiViewStore();
      store.initializeTimeline(createSteps(5));
      store.setPlaybackSpeed(2);
      store.togglePlayback();

      vi.advanceTimersByTime(500);
      expect(store.currentStepIndex).toBe(1);

      vi.advanceTimersByTime(500);
      expect(store.currentStepIndex).toBe(2);
    });

    it('should advance at 0.5x speed (2000ms intervals)', () => {
      const store = useMultiViewStore();
      store.initializeTimeline(createSteps(5));
      store.setPlaybackSpeed(0.5);
      store.togglePlayback();

      vi.advanceTimersByTime(2000);
      expect(store.currentStepIndex).toBe(1);
    });
  });

  describe('setPlaybackSpeed', () => {
    it('should update playback speed', () => {
      const store = useMultiViewStore();
      store.setPlaybackSpeed(4);
      expect(store.playbackSpeed).toBe(4);
    });

    it('should restart playback loop with new speed while playing', () => {
      const store = useMultiViewStore();
      store.initializeTimeline(createSteps(10));
      store.togglePlayback();

      vi.advanceTimersByTime(500);
      store.setPlaybackSpeed(4);
      vi.advanceTimersByTime(250);
      expect(store.currentStepIndex).toBeGreaterThanOrEqual(1);
    });
  });

  describe('pane layout', () => {
    it('should set left pane percent', () => {
      const store = useMultiViewStore();
      store.setLeftPanePercent(30);
      expect(store.leftPanePercent).toBe(30);
      expect(store.rightPanePercent).toBe(70);
    });

    it('should compute right pane as complement of left', () => {
      const store = useMultiViewStore();
      store.setLeftPanePercent(25);
      expect(store.rightPanePercent).toBe(75);
    });

    it('should toggle between two-panel and three-panel', () => {
      const store = useMultiViewStore();
      expect(store.paneLayout).toBe('two-panel');
      store.toggleLayout();
      expect(store.paneLayout).toBe('three-panel');
      expect(store.activePanels).toContain('flowchart-view');
      store.toggleLayout();
      expect(store.paneLayout).toBe('two-panel');
      expect(store.activePanels).not.toContain('flowchart-view');
    });

    it('should reset left pane to 50% when toggling layout', () => {
      const store = useMultiViewStore();
      store.setLeftPanePercent(30);
      store.toggleLayout();
      expect(store.leftPanePercent).toBe(50);
    });

    it('should set dragging splitter state', () => {
      const store = useMultiViewStore();
      store.setDraggingSplitter(true);
      expect(store.isDraggingSplitter).toBe(true);
      store.setDraggingSplitter(false);
      expect(store.isDraggingSplitter).toBe(false);
    });
  });

  describe('resetToDefaults', () => {
    it('should reset all state to initial values', () => {
      const store = useMultiViewStore();
      store.initializeTimeline(createSteps(10));
      store.seekToStep(5);
      store.setPlaybackSpeed(4);
      store.setLeftPanePercent(30);
      store.toggleLayout();

      store.resetToDefaults();

      expect(store.currentStepIndex).toBe(0);
      expect(store.playbackSpeed).toBe(1);
      expect(store.isPlaying).toBe(false);
      expect(store.leftPanePercent).toBe(50);
      expect(store.paneLayout).toBe('two-panel');
    });

    it('should stop playback on reset', () => {
      const store = useMultiViewStore();
      store.initializeTimeline(createSteps(5));
      store.togglePlayback();
      expect(store.isPlaying).toBe(true);
      store.resetToDefaults();
      expect(store.isPlaying).toBe(false);
    });
  });

  describe('destroyStore', () => {
    it('should stop playback and clear event bus', () => {
      const store = useMultiViewStore();
      MultiViewEventBus.subscribe('test', vi.fn());
      store.initializeTimeline(createSteps(5));
      store.togglePlayback();

      store.destroyStore();

      expect(store.isPlaying).toBe(false);
      expect(MultiViewEventBus.getListenerCount()).toBe(0);
    });
  });

  describe('PLAYBACK_SPEEDS constant', () => {
    it('should expose standard speed values', () => {
      const store = useMultiViewStore();
      expect(store.PLAYBACK_SPEEDS).toEqual([0.25, 0.5, 1, 2, 4]);
    });
  });
});
