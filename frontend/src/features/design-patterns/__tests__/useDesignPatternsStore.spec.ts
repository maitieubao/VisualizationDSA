import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useDesignPatternsStore } from '../store/useDesignPatternsStore';

describe('useDesignPatternsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initializeScenario', () => {
    it('should load Strategy Pattern scenario with correct nodes and links', () => {
      const store = useDesignPatternsStore();
      store.initializeScenario('strategy-pattern');

      expect(store.activePatternId).toBe('strategy-pattern');
      expect(store.nodes.length).toBeGreaterThan(0);
      expect(store.links.length).toBeGreaterThan(0);
      expect(store.activeScenarioTitle).toBe('Strategy Pattern');
    });

    it('should load Observer Pattern scenario correctly', () => {
      const store = useDesignPatternsStore();
      store.initializeScenario('observer-pattern');

      expect(store.activePatternId).toBe('observer-pattern');
      expect(store.nodes.length).toBeGreaterThan(0);
      expect(store.links.length).toBeGreaterThan(0);
      expect(store.activeScenarioTitle).toBe('Observer Pattern');
    });
  });

  describe('playback controls', () => {
    it('should advance and reverse step index with vcrNext and vcrPrev', () => {
      const store = useDesignPatternsStore();
      store.initializeScenario('strategy-pattern');

      expect(store.scenarioStepIndex).toBe(0);

      store.vcrNext();
      expect(store.scenarioStepIndex).toBe(1);

      store.vcrPrev();
      expect(store.scenarioStepIndex).toBe(0);
    });

    it('should reset step index with vcrReset', () => {
      const store = useDesignPatternsStore();
      store.initializeScenario('strategy-pattern');

      store.vcrNext();
      store.vcrNext();
      expect(store.scenarioStepIndex).toBe(2);

      store.vcrReset();
      expect(store.scenarioStepIndex).toBe(0);
    });

    it('should toggle autoplay and run loop', () => {
      const store = useDesignPatternsStore();
      store.initializeScenario('strategy-pattern');

      expect(store.isAutoplay).toBe(false);

      store.toggleAutoplay();
      expect(store.isAutoplay).toBe(true);

      vi.advanceTimersByTime(3500);
      expect(store.scenarioStepIndex).toBe(1);

      store.toggleAutoplay();
      expect(store.isAutoplay).toBe(false);
    });

    it('should adjust speed and loop intervals', () => {
      const store = useDesignPatternsStore();
      store.initializeScenario('strategy-pattern');

      store.setSpeed(2); // 2x speed
      expect(store.playbackSpeed).toBe(2);

      store.toggleAutoplay();
      vi.advanceTimersByTime(1750); // 3500 / 2
      expect(store.scenarioStepIndex).toBe(1);
    });
  });

  describe('cleanup', () => {
    it('should reset state on cleanup', () => {
      const store = useDesignPatternsStore();
      store.initializeScenario('strategy-pattern');

      store.cleanup();
      expect(store.nodes.length).toBe(0);
      expect(store.links.length).toBe(0);
      expect(store.isAutoplay).toBe(false);
    });
  });
});
