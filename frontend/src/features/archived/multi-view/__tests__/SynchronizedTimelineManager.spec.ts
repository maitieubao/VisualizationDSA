import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SynchronizedTimelineManager } from '../engine/SynchronizedTimelineManager';
import { MultiViewEventBus } from '../engine/MultiViewEventBus';
import type { TimelineStep } from '../types/multi-view.types';

function createSteps(count: number): TimelineStep[] {
  return Array.from({ length: count }, (_, i) => ({
    stepIndex: i,
    activeLineNumber: i + 1,
    activeFlowchartNodeId: `node-${i}`,
    memoryStateSnapshot: { array: [i, i + 1, i + 2] },
  }));
}

describe('SynchronizedTimelineManager', () => {
  beforeEach(() => {
    MultiViewEventBus.unsubscribeAll();
  });

  describe('constructor', () => {
    it('should initialize with step index 0', () => {
      const manager = new SynchronizedTimelineManager(createSteps(5));
      expect(manager.getCurrentStepIndex()).toBe(0);
    });

    it('should store the total number of steps', () => {
      const manager = new SynchronizedTimelineManager(createSteps(10));
      expect(manager.getTotalSteps()).toBe(10);
    });

    it('should handle empty steps array', () => {
      const manager = new SynchronizedTimelineManager([]);
      expect(manager.getTotalSteps()).toBe(0);
      expect(manager.getCurrentStep()).toBeNull();
    });
  });

  describe('seekToStep', () => {
    it('should seek to a valid step index and return success', () => {
      const manager = new SynchronizedTimelineManager(createSteps(5));
      const result = manager.seekToStep(3);
      expect(result.success).toBe(true);
      expect(result.elapsedMs).toBeGreaterThanOrEqual(0);
      expect(manager.getCurrentStepIndex()).toBe(3);
    });

    it('should dispatch the correct step through EventBus', () => {
      const cb = vi.fn();
      MultiViewEventBus.subscribe('test-panel', cb);

      const steps = createSteps(5);
      const manager = new SynchronizedTimelineManager(steps);
      manager.seekToStep(2);

      expect(cb).toHaveBeenCalledWith(steps[2]);
    });

    it('should return elapsed time below 1ms for seek to 2+ panels', () => {
      MultiViewEventBus.subscribe('panel-1', vi.fn());
      MultiViewEventBus.subscribe('panel-2', vi.fn());

      const manager = new SynchronizedTimelineManager(createSteps(10));
      const result = manager.seekToStep(5);

      expect(result.success).toBe(true);
      expect(result.elapsedMs).toBeLessThan(1.0);
    });

    it('should prevent seeking to negative index', () => {
      const manager = new SynchronizedTimelineManager(createSteps(5));
      const result = manager.seekToStep(-1);
      expect(result.success).toBe(false);
      expect(result.elapsedMs).toBe(0);
      expect(manager.getCurrentStepIndex()).toBe(0);
    });

    it('should prevent seeking beyond total steps', () => {
      const steps = createSteps(5);
      const manager = new SynchronizedTimelineManager(steps);
      const result = manager.seekToStep(5);
      expect(result.success).toBe(false);
      expect(result.elapsedMs).toBe(0);
      expect(manager.getCurrentStepIndex()).toBe(0);
    });

    it('should prevent seeking to large out-of-bounds index', () => {
      const manager = new SynchronizedTimelineManager(createSteps(3));
      const result = manager.seekToStep(999);
      expect(result.success).toBe(false);
      expect(manager.getCurrentStepIndex()).toBe(0);
    });

    it('should seek to index 0 (first step)', () => {
      const manager = new SynchronizedTimelineManager(createSteps(5));
      manager.seekToStep(3);
      const result = manager.seekToStep(0);
      expect(result.success).toBe(true);
      expect(manager.getCurrentStepIndex()).toBe(0);
    });

    it('should seek to last valid index', () => {
      const manager = new SynchronizedTimelineManager(createSteps(5));
      const result = manager.seekToStep(4);
      expect(result.success).toBe(true);
      expect(manager.getCurrentStepIndex()).toBe(4);
    });

    it('should not change position on failed seek', () => {
      const manager = new SynchronizedTimelineManager(createSteps(5));
      manager.seekToStep(2);
      expect(manager.getCurrentStepIndex()).toBe(2);

      manager.seekToStep(-1);
      expect(manager.getCurrentStepIndex()).toBe(2);

      manager.seekToStep(100);
      expect(manager.getCurrentStepIndex()).toBe(2);
    });
  });

  describe('stepNext', () => {
    it('should advance by one step', () => {
      const manager = new SynchronizedTimelineManager(createSteps(5));
      const result = manager.stepNext();
      expect(result.success).toBe(true);
      expect(manager.getCurrentStepIndex()).toBe(1);
    });

    it('should fail when at the last step', () => {
      const manager = new SynchronizedTimelineManager(createSteps(3));
      manager.seekToStep(2);
      const result = manager.stepNext();
      expect(result.success).toBe(false);
      expect(manager.getCurrentStepIndex()).toBe(2);
    });

    it('should advance sequentially through all steps', () => {
      const manager = new SynchronizedTimelineManager(createSteps(4));
      for (let i = 0; i < 3; i++) {
        expect(manager.stepNext().success).toBe(true);
      }
      expect(manager.getCurrentStepIndex()).toBe(3);
      expect(manager.stepNext().success).toBe(false);
    });
  });

  describe('stepPrev', () => {
    it('should go back by one step', () => {
      const manager = new SynchronizedTimelineManager(createSteps(5));
      manager.seekToStep(3);
      const result = manager.stepPrev();
      expect(result.success).toBe(true);
      expect(manager.getCurrentStepIndex()).toBe(2);
    });

    it('should fail when at the first step', () => {
      const manager = new SynchronizedTimelineManager(createSteps(5));
      const result = manager.stepPrev();
      expect(result.success).toBe(false);
      expect(manager.getCurrentStepIndex()).toBe(0);
    });
  });

  describe('getCurrentStep', () => {
    it('should return the step data for the current index', () => {
      const steps = createSteps(5);
      const manager = new SynchronizedTimelineManager(steps);
      manager.seekToStep(2);
      expect(manager.getCurrentStep()).toEqual(steps[2]);
    });

    it('should return null for empty steps', () => {
      const manager = new SynchronizedTimelineManager([]);
      expect(manager.getCurrentStep()).toBeNull();
    });
  });

  describe('boundary helpers', () => {
    it('isAtStart should be true at index 0', () => {
      const manager = new SynchronizedTimelineManager(createSteps(5));
      expect(manager.isAtStart()).toBe(true);
    });

    it('isAtStart should be false after stepping forward', () => {
      const manager = new SynchronizedTimelineManager(createSteps(5));
      manager.stepNext();
      expect(manager.isAtStart()).toBe(false);
    });

    it('isAtEnd should be true at last index', () => {
      const manager = new SynchronizedTimelineManager(createSteps(3));
      manager.seekToStep(2);
      expect(manager.isAtEnd()).toBe(true);
    });

    it('isAtEnd should be false at index 0 with multiple steps', () => {
      const manager = new SynchronizedTimelineManager(createSteps(5));
      expect(manager.isAtEnd()).toBe(false);
    });
  });
});
