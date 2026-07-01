import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useOOPVisualizerStore } from '../store/useOOPVisualizerStore';

describe('useOOPVisualizerStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initializeDemoClasses', () => {
    it('should register BankAccount when activePillar is encapsulation', () => {
      const store = useOOPVisualizerStore();
      store.activePillar = 'encapsulation';
      store.initializeDemoClasses();
      expect(store.registeredClasses).toHaveLength(1);
      expect(store.availableClassNames).toEqual(['BankAccount']);
    });

    it('should register Animal, Dog, Cat when activePillar is inheritance', () => {
      const store = useOOPVisualizerStore();
      store.activePillar = 'inheritance';
      store.initializeDemoClasses();
      expect(store.registeredClasses).toHaveLength(3);
      expect(store.availableClassNames).toEqual(['Animal', 'Dog', 'Cat']);
    });
  });

  describe('Scenario Playback', () => {
    it('should set pillar and load corresponding scenario', () => {
      const store = useOOPVisualizerStore();
      store.setPillar('inheritance');
      expect(store.activePillar).toBe('inheritance');
      expect(store.selectedScenarioId).toBe('inheritance');
      expect(store.isPlayingScenario).toBe(true);
    });

    it('should advance scenario steps', () => {
      const store = useOOPVisualizerStore();
      store.setPillar('encapsulation');
      expect(store.scenarioStepIndex).toBe(0);

      store.nextScenarioStep();
      expect(store.scenarioStepIndex).toBe(1);

      store.prevScenarioStep();
      expect(store.scenarioStepIndex).toBe(0);
    });

    it('should reset scenario', () => {
      const store = useOOPVisualizerStore();
      store.setPillar('encapsulation');
      store.nextScenarioStep();
      expect(store.scenarioStepIndex).toBe(1);

      store.resetScenario();
      expect(store.scenarioStepIndex).toBe(0);
    });

    it('should exit scenario', () => {
      const store = useOOPVisualizerStore();
      store.setPillar('encapsulation');
      expect(store.isPlayingScenario).toBe(true);

      store.exitScenario();
      expect(store.isPlayingScenario).toBe(false);
      expect(store.selectedScenarioId).toBeNull();
    });
  });

  describe('Autoplay', () => {
    it('should start and pause autoplay', () => {
      const store = useOOPVisualizerStore();
      store.setPillar('encapsulation');
      expect(store.isAutoplayRunning).toBe(false);

      store.startAutoplay();
      expect(store.isAutoplayRunning).toBe(true);

      store.pauseAutoplay();
      expect(store.isAutoplayRunning).toBe(false);
    });

    it('should auto-advance step in autoplay', () => {
      const store = useOOPVisualizerStore();
      store.setPillar('encapsulation');
      store.startAutoplay();

      vi.advanceTimersByTime(3500);
      expect(store.scenarioStepIndex).toBe(1);
    });

    it('should change autoplay playback speed', () => {
      const store = useOOPVisualizerStore();
      store.setPillar('encapsulation');
      store.startAutoplay();

      store.changePlaybackSpeed(2); // 2x speed -> delay is 1750ms
      vi.advanceTimersByTime(1750);
      expect(store.scenarioStepIndex).toBe(1);
    });
  });
});
