// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useDSAKeyboard } from '../composables/useDSAKeyboard';
import { useAnimationStore } from '../../animation-engine/store/useAnimationStore';
import { generateDummyResult } from '../services/dummyGenerators';

describe('useDSAKeyboard', () => {
  let animStore: ReturnType<typeof useAnimationStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      return setTimeout(() => cb(performance.now()), 16) as unknown as number;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));
    animStore = useAnimationStore();
    animStore.loadResult(generateDummyResult('bubble-sort', [5, 3, 8]));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('does not crash when called', () => {
    expect(() => useDSAKeyboard(() => true, animStore)).not.toThrow();
  });

  it('does not crash with false predicate', () => {
    expect(() => useDSAKeyboard(() => false, animStore)).not.toThrow();
  });

  it('store plays correctly after loading result', () => {
    expect(animStore.currentFrame).not.toBeNull();
    expect(animStore.totalSteps).toBeGreaterThan(0);
  });

  it('stepForward works on store', () => {
    animStore.stepForward();
    vi.advanceTimersByTime(200);
    expect(animStore.currentIndex).toBe(1);
  });

  it('stepBackward works on store', () => {
    animStore.stepForward();
    vi.advanceTimersByTime(200);
    animStore.stepBackward();
    expect(animStore.currentIndex).toBe(0);
  });

  it('stop works on store', () => {
    animStore.stepForward();
    vi.advanceTimersByTime(200);
    animStore.stop();
    expect(animStore.currentIndex).toBe(0);
    expect(animStore.isPlaying).toBe(false);
  });
});
