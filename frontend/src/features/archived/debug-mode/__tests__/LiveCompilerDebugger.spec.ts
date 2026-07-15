/**
 * LiveCompilerDebugger Unit Tests
 * Kiểm thử Step Forward, Continue to Breakpoint, Step Out, Step Backward, history.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { LiveCompilerDebugger } from '../engine/LiveCompilerDebugger';
import type { DebugStepPayload } from '../types/debug.types';

function* mockBubbleSortGenerator(): Generator<DebugStepPayload, void, unknown> {
  yield { lineNumber: 2, arrayState: [5, 3], variables: { n: 2 }, callStack: ['bubbleSort(arr)'] };
  yield { lineNumber: 3, arrayState: [5, 3], variables: { n: 2, i: 0 }, callStack: ['bubbleSort(arr)'] };
  yield { lineNumber: 4, arrayState: [5, 3], variables: { n: 2, i: 0, j: 0 }, callStack: ['bubbleSort(arr)'] };
  yield { lineNumber: 5, arrayState: [5, 3], variables: { n: 2, i: 0, j: 0 }, callStack: ['bubbleSort(arr)'] };
  yield { lineNumber: 6, arrayState: [5, 3], variables: { n: 2, i: 0, j: 0, temp: 5 }, callStack: ['bubbleSort(arr)'] };
  yield { lineNumber: 7, arrayState: [3, 5], variables: { n: 2, i: 0, j: 0, temp: 5 }, callStack: ['bubbleSort(arr)'] };
}

function* mockQuickSortGenerator(): Generator<DebugStepPayload, void, unknown> {
  yield { lineNumber: 2, arrayState: [4, 2], variables: { left: 0 }, callStack: ['quickSort(0,1)'] };
  yield { lineNumber: 5, arrayState: [4, 2], variables: { pivot: 4 }, callStack: ['quickSort(0,1)', 'partition(0,1)'] };
  yield { lineNumber: 8, arrayState: [2, 4], variables: { pivot: 4 }, callStack: ['quickSort(0,1)', 'partition(0,1)'] };
  yield { lineNumber: 10, arrayState: [2, 4], variables: {}, callStack: ['quickSort(0,1)'] };
}

describe('LiveCompilerDebugger', () => {
  describe('stepForward', () => {
    it('should step forward through generator yields', () => {
      const debugger_ = new LiveCompilerDebugger(mockBubbleSortGenerator);

      const step1 = debugger_.stepForward();
      expect(step1).not.toBeNull();
      expect(step1?.lineNumber).toBe(2);
      expect(step1?.variables.n).toBe(2);
      expect(step1?.callStack).toEqual(['bubbleSort(arr)']);

      const step2 = debugger_.stepForward();
      expect(step2?.lineNumber).toBe(3);
      expect(step2?.variables.i).toBe(0);
    });

    it('should return null when generator is exhausted', () => {
      const debugger_ = new LiveCompilerDebugger(mockBubbleSortGenerator);

      for (let i = 0; i < 6; i++) {
        debugger_.stepForward();
      }
      const finalStep = debugger_.stepForward();
      expect(finalStep).toBeNull();
      expect(debugger_.isFinished()).toBe(true);
    });

    it('should track step count', () => {
      const debugger_ = new LiveCompilerDebugger(mockBubbleSortGenerator);
      expect(debugger_.getStepCount()).toBe(0);

      debugger_.stepForward();
      expect(debugger_.getStepCount()).toBe(1);

      debugger_.stepForward();
      expect(debugger_.getStepCount()).toBe(2);
    });
  });

  describe('continueToNextBreakpoint', () => {
    it('should halt exactly on registered breakpoint', () => {
      const debugger_ = new LiveCompilerDebugger(mockBubbleSortGenerator);
      debugger_.setBreakpoints([5]);

      const result = debugger_.continueToNextBreakpoint();
      expect(result).not.toBeNull();
      expect(result?.lineNumber).toBe(5);
    });

    it('should skip non-breakpoint lines', () => {
      const debugger_ = new LiveCompilerDebugger(mockBubbleSortGenerator);
      debugger_.setBreakpoints([7]);

      const result = debugger_.continueToNextBreakpoint();
      expect(result).not.toBeNull();
      expect(result?.lineNumber).toBe(7);
      expect(result?.arrayState).toEqual([3, 5]);
    });

    it('should return null if generator finishes without hitting breakpoint', () => {
      const debugger_ = new LiveCompilerDebugger(mockBubbleSortGenerator);
      debugger_.setBreakpoints([99]);

      const result = debugger_.continueToNextBreakpoint();
      expect(result).toBeNull();
    });
  });

  describe('stepBackward', () => {
    it('should restore previous step from history', () => {
      const debugger_ = new LiveCompilerDebugger(mockBubbleSortGenerator);
      debugger_.stepForward();
      debugger_.stepForward();
      debugger_.stepForward();

      const current = debugger_.getCurrentStep();
      expect(current?.lineNumber).toBe(4);

      const prev = debugger_.stepBackward();
      expect(prev?.lineNumber).toBe(3);
    });

    it('should return null at the first step', () => {
      const debugger_ = new LiveCompilerDebugger(mockBubbleSortGenerator);
      debugger_.stepForward();

      const result = debugger_.stepBackward();
      expect(result).toBeNull();
    });
  });

  describe('stepOut', () => {
    it('should advance until callStack depth decreases', () => {
      const debugger_ = new LiveCompilerDebugger(mockQuickSortGenerator);

      debugger_.stepForward();
      debugger_.stepForward();
      expect(debugger_.getCurrentStep()?.callStack.length).toBe(2);

      const result = debugger_.stepOut();
      expect(result).not.toBeNull();
      expect(result?.callStack.length).toBe(1);
      expect(result?.lineNumber).toBe(10);
    });
  });

  describe('callStack tracking', () => {
    it('should track recursive call stack correctly', () => {
      const debugger_ = new LiveCompilerDebugger(mockQuickSortGenerator);

      const step1 = debugger_.stepForward();
      expect(step1?.callStack).toEqual(['quickSort(0,1)']);

      const step2 = debugger_.stepForward();
      expect(step2?.callStack).toEqual(['quickSort(0,1)', 'partition(0,1)']);
    });
  });

  describe('breakpoint management', () => {
    it('should set and get breakpoints', () => {
      const debugger_ = new LiveCompilerDebugger(mockBubbleSortGenerator);
      debugger_.setBreakpoints([3, 5, 7]);

      expect(debugger_.getActiveBreakpoints()).toEqual([3, 5, 7]);
    });
  });

  describe('history', () => {
    it('should record all steps in history', () => {
      const debugger_ = new LiveCompilerDebugger(mockBubbleSortGenerator);
      debugger_.stepForward();
      debugger_.stepForward();
      debugger_.stepForward();

      const history = debugger_.getHistory();
      expect(history).toHaveLength(3);
      expect(history[0].lineNumber).toBe(2);
      expect(history[1].lineNumber).toBe(3);
      expect(history[2].lineNumber).toBe(4);
    });
  });

  describe('reset', () => {
    it('should clear all state', () => {
      const debugger_ = new LiveCompilerDebugger(mockBubbleSortGenerator);
      debugger_.setBreakpoints([3]);
      debugger_.stepForward();
      debugger_.stepForward();

      debugger_.reset();

      expect(debugger_.getCurrentStep()).toBeNull();
      expect(debugger_.getStepCount()).toBe(0);
      expect(debugger_.getHistory()).toHaveLength(0);
      expect(debugger_.getActiveBreakpoints()).toHaveLength(0);
      expect(debugger_.isFinished()).toBe(true);
    });
  });
});
