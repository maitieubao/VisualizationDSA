import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MultiViewEventBus } from '../engine/MultiViewEventBus';
import type { TimelineStep } from '../types/multi-view.types';

function createMockStep(overrides: Partial<TimelineStep> = {}): TimelineStep {
  return {
    stepIndex: 0,
    activeLineNumber: 1,
    activeFlowchartNodeId: 'start-node',
    memoryStateSnapshot: { array: [1, 2, 3] },
    ...overrides,
  };
}

describe('MultiViewEventBus', () => {
  beforeEach(() => {
    MultiViewEventBus.unsubscribeAll();
  });

  describe('subscribe', () => {
    it('should register a listener for a given viewId', () => {
      const callback = vi.fn();
      MultiViewEventBus.subscribe('monaco-editor', callback);
      expect(MultiViewEventBus.getListenerCount()).toBe(1);
    });

    it('should register multiple listeners for the same viewId', () => {
      const cb1 = vi.fn();
      const cb2 = vi.fn();
      MultiViewEventBus.subscribe('monaco-editor', cb1);
      MultiViewEventBus.subscribe('monaco-editor', cb2);
      expect(MultiViewEventBus.getListenerCount()).toBe(2);
    });

    it('should register listeners for different viewIds', () => {
      MultiViewEventBus.subscribe('monaco-editor', vi.fn());
      MultiViewEventBus.subscribe('flowchart-view', vi.fn());
      MultiViewEventBus.subscribe('svg-visualizer', vi.fn());
      expect(MultiViewEventBus.getListenerCount()).toBe(3);
    });

    it('should track registered view IDs', () => {
      MultiViewEventBus.subscribe('panel-a', vi.fn());
      MultiViewEventBus.subscribe('panel-b', vi.fn());
      const ids = MultiViewEventBus.getRegisteredViewIds();
      expect(ids).toContain('panel-a');
      expect(ids).toContain('panel-b');
      expect(ids).toHaveLength(2);
    });
  });

  describe('dispatch', () => {
    it('should call all registered callbacks with the correct step', () => {
      const cb1 = vi.fn();
      const cb2 = vi.fn();
      MultiViewEventBus.subscribe('monaco', cb1);
      MultiViewEventBus.subscribe('flowchart', cb2);

      const step = createMockStep({ stepIndex: 5, activeLineNumber: 10 });
      MultiViewEventBus.dispatch(step);

      expect(cb1).toHaveBeenCalledWith(step);
      expect(cb2).toHaveBeenCalledWith(step);
    });

    it('should dispatch to multiple callbacks on the same viewId', () => {
      const cb1 = vi.fn();
      const cb2 = vi.fn();
      MultiViewEventBus.subscribe('panel', cb1);
      MultiViewEventBus.subscribe('panel', cb2);

      const step = createMockStep();
      MultiViewEventBus.dispatch(step);

      expect(cb1).toHaveBeenCalledOnce();
      expect(cb2).toHaveBeenCalledOnce();
    });

    it('should dispatch to 2+ panels below 1ms latency', () => {
      const receivedSteps: TimelineStep[] = [];
      MultiViewEventBus.subscribe('panel-1', (s) => receivedSteps.push(s));
      MultiViewEventBus.subscribe('panel-2', (s) => receivedSteps.push(s));
      MultiViewEventBus.subscribe('panel-3', (s) => receivedSteps.push(s));

      const step = createMockStep({ stepIndex: 7 });
      const elapsed = MultiViewEventBus.dispatch(step);

      expect(elapsed).toBeLessThan(1.0);
      expect(receivedSteps).toHaveLength(3);
      receivedSteps.forEach((s) => expect(s.stepIndex).toBe(7));
    });

    it('should return elapsed time as a number', () => {
      MultiViewEventBus.subscribe('view', vi.fn());
      const elapsed = MultiViewEventBus.dispatch(createMockStep());
      expect(typeof elapsed).toBe('number');
      expect(elapsed).toBeGreaterThanOrEqual(0);
    });

    it('should return 0-like elapsed when no listeners are registered', () => {
      const elapsed = MultiViewEventBus.dispatch(createMockStep());
      expect(elapsed).toBeGreaterThanOrEqual(0);
      expect(elapsed).toBeLessThan(1.0);
    });

    it('should dispatch with correct memoryStateSnapshot data', () => {
      const cb = vi.fn();
      MultiViewEventBus.subscribe('svg', cb);
      const snapshot = { array: [10, 20, 30], pivot: 20 };
      const step = createMockStep({ memoryStateSnapshot: snapshot });
      MultiViewEventBus.dispatch(step);
      expect(cb).toHaveBeenCalledWith(expect.objectContaining({ memoryStateSnapshot: snapshot }));
    });

    it('should dispatch with correct activeFlowchartNodeId', () => {
      const cb = vi.fn();
      MultiViewEventBus.subscribe('flowchart', cb);
      const step = createMockStep({ activeFlowchartNodeId: 'pivot-node' });
      MultiViewEventBus.dispatch(step);
      expect(cb).toHaveBeenCalledWith(expect.objectContaining({ activeFlowchartNodeId: 'pivot-node' }));
    });
  });

  describe('unsubscribe', () => {
    it('should remove listeners for a specific viewId', () => {
      MultiViewEventBus.subscribe('panel-a', vi.fn());
      MultiViewEventBus.subscribe('panel-b', vi.fn());
      expect(MultiViewEventBus.getListenerCount()).toBe(2);

      MultiViewEventBus.unsubscribe('panel-a');
      expect(MultiViewEventBus.getListenerCount()).toBe(1);
      expect(MultiViewEventBus.getRegisteredViewIds()).toEqual(['panel-b']);
    });

    it('should not throw when unsubscribing a non-existent viewId', () => {
      expect(() => MultiViewEventBus.unsubscribe('nonexistent')).not.toThrow();
    });
  });

  describe('unsubscribeAll', () => {
    it('should clear all listeners', () => {
      MultiViewEventBus.subscribe('a', vi.fn());
      MultiViewEventBus.subscribe('b', vi.fn());
      MultiViewEventBus.subscribe('c', vi.fn());
      expect(MultiViewEventBus.getListenerCount()).toBe(3);

      MultiViewEventBus.unsubscribeAll();
      expect(MultiViewEventBus.getListenerCount()).toBe(0);
      expect(MultiViewEventBus.getRegisteredViewIds()).toHaveLength(0);
    });

    it('should not affect future subscriptions after clearing', () => {
      MultiViewEventBus.subscribe('old', vi.fn());
      MultiViewEventBus.unsubscribeAll();
      MultiViewEventBus.subscribe('new', vi.fn());
      expect(MultiViewEventBus.getListenerCount()).toBe(1);
    });
  });

  describe('getListenerCount', () => {
    it('should return 0 when no listeners exist', () => {
      expect(MultiViewEventBus.getListenerCount()).toBe(0);
    });

    it('should count across multiple viewIds', () => {
      MultiViewEventBus.subscribe('a', vi.fn());
      MultiViewEventBus.subscribe('a', vi.fn());
      MultiViewEventBus.subscribe('b', vi.fn());
      expect(MultiViewEventBus.getListenerCount()).toBe(3);
    });
  });

  describe('performance: rapid sequential dispatches', () => {
    it('should handle 100 rapid dispatches all below 5ms each', () => {
      MultiViewEventBus.subscribe('panel-1', vi.fn());
      MultiViewEventBus.subscribe('panel-2', vi.fn());

      for (let i = 0; i < 100; i++) {
        const step = createMockStep({ stepIndex: i });
        const elapsed = MultiViewEventBus.dispatch(step);
        expect(elapsed).toBeLessThan(5.0);
      }
    });
  });
});
