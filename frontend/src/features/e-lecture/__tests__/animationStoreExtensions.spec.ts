import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAnimationStore } from '../../animation-engine/store/useAnimationStore';
import type { AlgorithmResult } from '../../animation-engine/types/animation.types';

function createTestResult(): AlgorithmResult {
  return {
    algorithmId: 'bubble-sort',
    pseudoCode: ['line1', 'line2'],
    frames: Array.from({ length: 10 }, (_, i) => ({
      stepId: i + 1,
      activeLine: 0,
      explanation: `Step ${i + 1}`,
      dataState: [5, 3, 8],
      highlights: { compare: [], swap: [], sorted: [] },
    })),
  };
}

describe('useAnimationStore — E-Lecture Extensions', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('goToFrame moves to specific frame index', () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());

    store.goToFrame(5);
    expect(store.currentIndex).toBe(5);
    expect(store.isPlaying).toBe(false);
  });

  it('goToFrame rejects out-of-bounds index', () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());

    store.goToFrame(-1);
    expect(store.currentIndex).toBe(0);

    store.goToFrame(999);
    expect(store.currentIndex).toBe(0);
  });

  it('setInteractionLocked toggles lock state', () => {
    const store = useAnimationStore();
    expect(store.interactionLocked).toBe(false);

    store.setInteractionLocked(true);
    expect(store.interactionLocked).toBe(true);

    store.setInteractionLocked(false);
    expect(store.interactionLocked).toBe(false);
  });

  it('playUntilFrame resolves when target reached', async () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());

    const promise = store.playUntilFrame(3);
    expect(store.isPlaying).toBe(true);

    vi.advanceTimersByTime(5000);
    await promise;

    expect(store.currentIndex).toBe(3);
    expect(store.isPlaying).toBe(false);
  });

  it('playUntilFrame resolves immediately if already past target', async () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());
    store.goToFrame(5);

    await store.playUntilFrame(3);
    expect(store.currentIndex).toBe(3);
  });

  it('playUntilFrame resolves immediately for empty frames', async () => {
    const store = useAnimationStore();
    await store.playUntilFrame(5);
    expect(store.currentIndex).toBe(0);
  });

  it('cancelPlayUntil snaps to target and resolves', async () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());

    let resolved = false;
    const promise = store.playUntilFrame(7).then(() => { resolved = true; });

    vi.advanceTimersByTime(1500);
    expect(store.isPlaying).toBe(true);

    store.cancelPlayUntil();
    await promise;

    expect(resolved).toBe(true);
    expect(store.currentIndex).toBe(7);
    expect(store.isPlaying).toBe(false);
  });
});
