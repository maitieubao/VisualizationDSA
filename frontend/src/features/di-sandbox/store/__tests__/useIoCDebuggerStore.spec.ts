import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useIoCDebuggerStore } from '../useIoCDebuggerStore';

describe('useIoCDebuggerStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with IDLE status', () => {
    const store = useIoCDebuggerStore();
    expect(store.status).toBe('IDLE');
    expect(store.currentStepIndex).toBe(-1);
    expect(store.totalSteps).toBe(0);
  });

  it('should load web-api-standard scenario', () => {
    const store = useIoCDebuggerStore();
    store.loadScenario('web-api-standard');
    expect(store.registrationList.length).toBe(4);
    expect(store.activeScenarioId).toBe('web-api-standard');
    expect(store.selectedServiceToResolve).toBe('IUserController');
  });

  it('should load circular-dependency scenario', () => {
    const store = useIoCDebuggerStore();
    store.loadScenario('circular-dependency');
    expect(store.registrationList.length).toBe(2);
    expect(store.selectedServiceToResolve).toBe('IServiceB');
  });

  it('should load captive-dependency scenario', () => {
    const store = useIoCDebuggerStore();
    store.loadScenario('captive-dependency');
    expect(store.registrationList.length).toBe(3);
  });

  it('should register a new service', () => {
    const store = useIoCDebuggerStore();
    store.registerService('ILogger', 'ConsoleLogger', 'SINGLETON', []);
    expect(store.registrationList).toHaveLength(1);
    expect(store.registrations['ILogger']).toBeDefined();
  });

  it('should remove a service', () => {
    const store = useIoCDebuggerStore();
    store.registerService('ILogger', 'ConsoleLogger', 'SINGLETON', []);
    store.registerService('IRepo', 'SqlRepo', 'TRANSIENT', []);
    expect(store.registrationList).toHaveLength(2);

    store.removeService('ILogger');
    expect(store.registrationList).toHaveLength(1);
    expect(store.registrations['ILogger']).toBeUndefined();
  });

  describe('startResolution', () => {
    it('should detect circular dependency and set ERROR_CIRCULAR', () => {
      const store = useIoCDebuggerStore();
      store.loadScenario('circular-dependency');
      store.selectedServiceToResolve = 'IServiceA';
      store.startResolution();

      expect(store.status).toBe('ERROR_CIRCULAR');
      expect(store.isCircularErrorDetected).toBe(true);
      expect(store.errorMessage).toContain('IServiceA');
      expect(store.cyclePath.length).toBeGreaterThan(0);
    });

    it('should resolve web-api scenario and start playback', () => {
      const store = useIoCDebuggerStore();
      store.loadScenario('web-api-standard');
      store.startResolution();

      expect(store.status).toBe('RESOLVING');
      expect(store.totalSteps).toBeGreaterThan(0);
      expect(store.currentStepIndex).toBe(0);
    });

    it('should advance steps with timer', () => {
      const store = useIoCDebuggerStore();
      store.loadScenario('web-api-standard');
      store.startResolution();

      const initialStep = store.currentStepIndex;
      vi.advanceTimersByTime(800);
      expect(store.currentStepIndex).toBe(initialStep + 1);
    });

    it('should complete playback after all steps', () => {
      const store = useIoCDebuggerStore();
      store.loadScenario('web-api-standard');
      store.startResolution();

      const total = store.totalSteps;
      vi.advanceTimersByTime(800 * total);
      expect(store.status).toBe('RESOLVED');
    });

    it('should detect captive dependency warning', () => {
      const store = useIoCDebuggerStore();
      store.loadScenario('captive-dependency');
      store.startResolution();

      expect(store.isCaptiveDependencyWarning).toBe(true);
      expect(store.captiveWarningMessage).toContain('CAPTIVE_DEPENDENCY');
    });

    it('should not start if no service selected', () => {
      const store = useIoCDebuggerStore();
      store.loadScenario('web-api-standard');
      store.selectedServiceToResolve = '';
      store.startResolution();
      expect(store.status).toBe('IDLE');
    });

    it('should populate singleton count after resolve', () => {
      const store = useIoCDebuggerStore();
      store.loadScenario('web-api-standard');
      store.startResolution();
      vi.advanceTimersByTime(800 * store.totalSteps);

      expect(store.singletonCount).toBe(2);
    });

    it('should build resolution tree after resolve', () => {
      const store = useIoCDebuggerStore();
      store.loadScenario('web-api-standard');
      store.startResolution();

      expect(store.resolutionTree).not.toBeNull();
      expect(store.resolutionTree!.serviceType).toBe('IUserController');
    });
  });

  describe('VCR controls', () => {
    it('should step forward', () => {
      const store = useIoCDebuggerStore();
      store.loadScenario('web-api-standard');
      store.startResolution();
      store.stopPlayback();

      const idx = store.currentStepIndex;
      store.stepForward();
      expect(store.currentStepIndex).toBe(idx + 1);
    });

    it('should step backward', () => {
      const store = useIoCDebuggerStore();
      store.loadScenario('web-api-standard');
      store.startResolution();
      store.stopPlayback();

      vi.advanceTimersByTime(0);
      store.stepForward();
      store.stepForward();
      const idx = store.currentStepIndex;
      store.stepBackward();
      expect(store.currentStepIndex).toBe(idx - 1);
    });

    it('should not step backward below 0', () => {
      const store = useIoCDebuggerStore();
      store.loadScenario('web-api-standard');
      store.startResolution();
      store.stopPlayback();

      store.jumpToStep(0);
      store.stepBackward();
      expect(store.currentStepIndex).toBe(0);
    });

    it('should not step forward beyond total', () => {
      const store = useIoCDebuggerStore();
      store.loadScenario('web-api-standard');
      store.startResolution();
      store.stopPlayback();

      store.jumpToStep(store.totalSteps - 1);
      store.stepForward();
      expect(store.currentStepIndex).toBe(store.totalSteps - 1);
      expect(store.status).toBe('RESOLVED');
    });

    it('should jump to specific step', () => {
      const store = useIoCDebuggerStore();
      store.loadScenario('web-api-standard');
      store.startResolution();
      store.stopPlayback();

      store.jumpToStep(3);
      expect(store.currentStepIndex).toBe(3);
    });
  });

  describe('computed properties', () => {
    it('should return current step', () => {
      const store = useIoCDebuggerStore();
      store.loadScenario('web-api-standard');
      store.startResolution();
      store.stopPlayback();

      expect(store.currentStep).not.toBeNull();
      expect(store.currentStep!.type).toBeDefined();
    });

    it('should return null currentStep when index is -1', () => {
      const store = useIoCDebuggerStore();
      expect(store.currentStep).toBeNull();
    });

    it('should compute isResolving correctly', () => {
      const store = useIoCDebuggerStore();
      expect(store.isResolving).toBe(false);

      store.loadScenario('web-api-standard');
      store.startResolution();
      store.stopPlayback();
      expect(store.isResolving).toBe(true);
    });

    it('should compute isError correctly', () => {
      const store = useIoCDebuggerStore();
      store.loadScenario('circular-dependency');
      store.selectedServiceToResolve = 'IServiceA';
      store.startResolution();
      expect(store.isError).toBe(true);
    });

    it('should compute activeScenario correctly', () => {
      const store = useIoCDebuggerStore();
      store.loadScenario('web-api-standard');
      expect(store.activeScenario).toBeDefined();
      expect(store.activeScenario!.title).toBe('Standard Web API (ASP.NET Core)');
    });
  });

  describe('resetState', () => {
    it('should reset all state to initial', () => {
      const store = useIoCDebuggerStore();
      store.loadScenario('web-api-standard');
      store.startResolution();
      vi.advanceTimersByTime(5000);

      store.resetState();
      expect(store.status).toBe('IDLE');
      expect(store.registrationList).toHaveLength(0);
      expect(store.currentStepIndex).toBe(-1);
      expect(store.resolutionTree).toBeNull();
      expect(store.isCircularErrorDetected).toBe(false);
    });
  });

  describe('scenario switching', () => {
    it('should reset state when switching scenarios', () => {
      const store = useIoCDebuggerStore();
      store.loadScenario('web-api-standard');
      store.startResolution();
      vi.advanceTimersByTime(5000);

      store.loadScenario('circular-dependency');
      expect(store.registrationList).toHaveLength(2);
      expect(store.currentStepIndex).toBe(-1);
      expect(store.status).toBe('IDLE');
    });

    it('should load clean-architecture scenario', () => {
      const store = useIoCDebuggerStore();
      store.loadScenario('clean-architecture');
      expect(store.registrationList).toHaveLength(5);
      expect(store.activeScenarioId).toBe('clean-architecture');
    });
  });
});
