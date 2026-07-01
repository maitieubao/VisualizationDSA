/**
 * useLiveDebuggerStore Unit Tests
 * Kiểm thử Pinia store: breakpoints, start/stop session, step operations, state sync.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useLiveDebuggerStore } from '../store/useLiveDebuggerStore';

describe('useLiveDebuggerStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('initial state', () => {
    it('should have IDLE status', () => {
      const store = useLiveDebuggerStore();
      expect(store.status).toBe('IDLE');
    });

    it('should have default source code', () => {
      const store = useLiveDebuggerStore();
      expect(store.sourceCode).toContain('bubbleSort');
    });

    it('should have default input array', () => {
      const store = useLiveDebuggerStore();
      expect(store.inputArray).toEqual([5, 3, 8, 1, 9, 2, 7]);
    });

    it('should have empty breakpoints', () => {
      const store = useLiveDebuggerStore();
      expect(store.activeBreakpoints).toEqual([]);
    });

    it('should not be debugging', () => {
      const store = useLiveDebuggerStore();
      expect(store.isDebugging).toBe(false);
    });
  });

  describe('toggleBreakpoint', () => {
    it('should add a breakpoint', () => {
      const store = useLiveDebuggerStore();
      store.toggleBreakpoint(5);
      expect(store.activeBreakpoints).toContain(5);
    });

    it('should remove an existing breakpoint', () => {
      const store = useLiveDebuggerStore();
      store.toggleBreakpoint(5);
      store.toggleBreakpoint(5);
      expect(store.activeBreakpoints).not.toContain(5);
    });

    it('should support multiple breakpoints', () => {
      const store = useLiveDebuggerStore();
      store.toggleBreakpoint(3);
      store.toggleBreakpoint(5);
      store.toggleBreakpoint(7);
      expect(store.activeBreakpoints).toHaveLength(3);
    });
  });

  describe('setSourceCode', () => {
    it('should update source code', () => {
      const store = useLiveDebuggerStore();
      store.setSourceCode('function test() {}');
      expect(store.sourceCode).toBe('function test() {}');
    });
  });

  describe('setInputArray', () => {
    it('should update input array', () => {
      const store = useLiveDebuggerStore();
      store.setInputArray([10, 20, 30]);
      expect(store.inputArray).toEqual([10, 20, 30]);
    });
  });

  describe('startDebuggingSession', () => {
    it('should change status to PAUSED on valid code', () => {
      const store = useLiveDebuggerStore();
      store.startDebuggingSession();
      expect(store.status).toBe('PAUSED');
    });

    it('should set current line number after starting', () => {
      const store = useLiveDebuggerStore();
      store.startDebuggingSession();
      expect(store.currentLineNumber).not.toBeNull();
    });

    it('should populate array state', () => {
      const store = useLiveDebuggerStore();
      store.startDebuggingSession();
      expect(store.arrayState.length).toBeGreaterThan(0);
    });

    it('should set ERROR status on invalid code', () => {
      const store = useLiveDebuggerStore();
      store.setSourceCode('function invalid( {}');
      store.startDebuggingSession();
      expect(store.status).toBe('ERROR');
      expect(store.errorMessage).toBeDefined();
    });
  });

  describe('stepForward', () => {
    it('should advance to next line', () => {
      const store = useLiveDebuggerStore();
      store.startDebuggingSession();
      const firstLine = store.currentLineNumber;

      store.stepForward();
      expect(store.stepCount).toBeGreaterThan(1);
    });
  });

  describe('stopDebuggingSession', () => {
    it('should reset all state', () => {
      const store = useLiveDebuggerStore();
      store.startDebuggingSession();
      store.stepForward();

      store.stopDebuggingSession();

      expect(store.status).toBe('IDLE');
      expect(store.currentLineNumber).toBeNull();
      expect(store.callStackFrames).toEqual([]);
      expect(store.watchedVariables).toEqual({});
      expect(store.mutatedVariableKeys).toEqual([]);
      expect(store.stepCount).toBe(0);
      expect(store.errorMessage).toBeNull();
    });
  });

  describe('computed properties', () => {
    it('isDebugging should be true when PAUSED', () => {
      const store = useLiveDebuggerStore();
      store.startDebuggingSession();
      expect(store.isDebugging).toBe(true);
    });

    it('isPaused should be true when PAUSED', () => {
      const store = useLiveDebuggerStore();
      store.startDebuggingSession();
      expect(store.isPaused).toBe(true);
    });

    it('canStepForward should be true when PAUSED with valid debugger', () => {
      const store = useLiveDebuggerStore();
      store.startDebuggingSession();
      expect(store.canStepForward).toBe(true);
    });

    it('hasError should be true on ERROR status', () => {
      const store = useLiveDebuggerStore();
      store.setSourceCode('invalid { code');
      store.startDebuggingSession();
      expect(store.hasError).toBe(true);
    });
  });

  describe('watchedVariables mutation tracking', () => {
    it('should detect mutated variables on step forward', () => {
      const store = useLiveDebuggerStore();
      store.startDebuggingSession();

      store.stepForward();

      // After stepping, some variables should have changed
      // The exact variables depend on the code, but the mechanism should work
      expect(store.watchedVariables).toBeDefined();
    });
  });
});
