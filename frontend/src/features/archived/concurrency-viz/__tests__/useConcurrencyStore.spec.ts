import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useConcurrencyStore } from '../store/useConcurrencyStore';

describe('useConcurrencyStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  it('should initialize with default state', () => {
    const store = useConcurrencyStore();
    expect(store.threads).toHaveLength(0);
    expect(store.isPlaying).toBe(false);
    expect(store.playbackMode).toBe('IDLE');
    expect(store.sharedCounter).toBe(0);
    expect(store.selectedScenarioId).toBe('race-condition');
  });

  it('should initialize race-condition scenario', () => {
    const store = useConcurrencyStore();
    store.initializeScenario('race-condition');

    expect(store.threads).toHaveLength(2);
    expect(store.threads[0].id).toBe('T1');
    expect(store.threads[1].id).toBe('T2');
    expect(store.threads[0].state).toBe('READY');
    expect(store.totalSteps).toBeGreaterThan(0);
    expect(store.playbackMode).toBe('IDLE');
  });

  it('should initialize deadlock-demo scenario', () => {
    const store = useConcurrencyStore();
    store.initializeScenario('deadlock-demo');

    expect(store.threads).toHaveLength(2);
    expect(Object.keys(store.locks)).toContain('L1');
    expect(Object.keys(store.locks)).toContain('L2');
  });

  it('should initialize dining-philosophers scenario', () => {
    const store = useConcurrencyStore();
    store.initializeScenario('dining-philosophers');

    expect(store.threads).toHaveLength(5);
    expect(Object.keys(store.locks)).toHaveLength(5);
  });

  it('should step forward correctly', () => {
    const store = useConcurrencyStore();
    store.initializeScenario('race-condition');

    const initialStep = store.currentStepIndex;
    store.stepForward();

    expect(store.currentStepIndex).toBe(initialStep + 1);
  });

  it('should step backward correctly', () => {
    const store = useConcurrencyStore();
    store.initializeScenario('race-condition');

    store.stepForward();
    store.stepForward();
    store.stepForward();
    const afterThreeSteps = store.currentStepIndex;

    store.stepBackward();
    expect(store.currentStepIndex).toBe(afterThreeSteps - 1);
  });

  it('should not step backward past zero', () => {
    const store = useConcurrencyStore();
    store.initializeScenario('race-condition');

    store.stepBackward();
    expect(store.currentStepIndex).toBe(0);
  });

  it('should detect deadlock in deadlock-demo scenario', () => {
    const store = useConcurrencyStore();
    store.initializeScenario('deadlock-demo');

    while (store.currentStepIndex < store.totalSteps && !store.isDeadlocked) {
      store.stepForward();
    }

    expect(store.isDeadlocked).toBe(true);
    expect(store.deadlockedThreadIds.length).toBeGreaterThan(0);
    expect(store.playbackMode).toBe('DEADLOCKED');
  });

  it('should not step forward when deadlocked', () => {
    const store = useConcurrencyStore();
    store.initializeScenario('deadlock-demo');

    while (store.currentStepIndex < store.totalSteps && !store.isDeadlocked) {
      store.stepForward();
    }

    const stepAtDeadlock = store.currentStepIndex;
    store.stepForward();
    expect(store.currentStepIndex).toBe(stepAtDeadlock);
  });

  it('should toggle play/pause', () => {
    const store = useConcurrencyStore();
    store.initializeScenario('race-condition');

    store.togglePlayPause();
    expect(store.isPlaying).toBe(true);
    expect(store.playbackMode).toBe('PLAYING');

    store.togglePlayPause();
    expect(store.isPlaying).toBe(false);
    expect(store.playbackMode).toBe('PAUSED');
  });

  it('should stop and reset simulation', () => {
    const store = useConcurrencyStore();
    store.initializeScenario('race-condition');

    store.stepForward();
    store.stepForward();
    store.stopSimulation();

    expect(store.currentStepIndex).toBe(0);
    expect(store.isPlaying).toBe(false);
    expect(store.playbackMode).toBe('IDLE');
  });

  it('should set speed within bounds', () => {
    const store = useConcurrencyStore();
    store.setSpeed(2);
    expect(store.playSpeed).toBe(2);

    store.setSpeed(0.1);
    expect(store.playSpeed).toBe(0.25);

    store.setSpeed(10);
    expect(store.playSpeed).toBe(4);
  });

  it('should scrub to specific step', () => {
    const store = useConcurrencyStore();
    store.initializeScenario('race-condition');

    store.scrubToStep(5);
    expect(store.currentStepIndex).toBe(5);
  });

  it('should scrub backward via history', () => {
    const store = useConcurrencyStore();
    store.initializeScenario('race-condition');

    store.scrubToStep(8);
    store.scrubToStep(3);
    expect(store.currentStepIndex).toBe(3);
  });

  it('should toggle mutex and reinitialize', () => {
    const store = useConcurrencyStore();
    store.initializeScenario('race-condition');

    store.setMutexEnabled(false);
    expect(store.mutexEnabled).toBe(false);
    expect(store.currentStepIndex).toBe(0);
  });

  it('should compute progress percent', () => {
    const store = useConcurrencyStore();
    store.initializeScenario('race-condition');

    expect(store.progressPercent).toBe(0);

    const halfSteps = Math.floor(store.totalSteps / 2);
    store.scrubToStep(halfSteps);
    expect(store.progressPercent).toBeGreaterThan(0);
  });

  it('should list all scenario options', () => {
    const store = useConcurrencyStore();
    expect(store.scenarioList.length).toBe(4);
    expect(store.scenarioList.map(s => s.id)).toContain('race-condition');
    expect(store.scenarioList.map(s => s.id)).toContain('deadlock-demo');
    expect(store.scenarioList.map(s => s.id)).toContain('producer-consumer');
    expect(store.scenarioList.map(s => s.id)).toContain('dining-philosophers');
  });

  it('should finish race-condition scenario without deadlock', () => {
    const store = useConcurrencyStore();
    store.initializeScenario('race-condition');

    while (store.currentStepIndex < store.totalSteps && !store.isDeadlocked) {
      store.stepForward();
    }

    expect(store.isDeadlocked).toBe(false);
    expect(store.sharedCounter).toBeGreaterThan(0);
  });

  it('should cleanup resources', () => {
    const store = useConcurrencyStore();
    store.initializeScenario('race-condition');
    store.stepForward();
    store.cleanup();

    expect(store.threads).toHaveLength(0);
    expect(store.playbackMode).toBe('IDLE');
  });
});
