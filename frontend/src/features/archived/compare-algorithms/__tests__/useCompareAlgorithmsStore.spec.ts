import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCompareAlgorithmsStore } from '../store/useCompareAlgorithmsStore';

describe('useCompareAlgorithmsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should initialize with default algorithm IDs', () => {
    const store = useCompareAlgorithmsStore();

    expect(store.leftAlgorithmId).toBe('bubble-sort');
    expect(store.rightAlgorithmId).toBe('selection-sort');
    expect(store.playbackState).toBe('UNINITIALIZED');
  });

  it('should load compare session with frames from dummy generators', () => {
    const store = useCompareAlgorithmsStore();

    store.loadCompareSession('bubble-sort', 'selection-sort');

    expect(store.leftFrames.length).toBeGreaterThan(0);
    expect(store.rightFrames.length).toBeGreaterThan(0);
    expect(store.leftCurrentIndex).toBe(0);
    expect(store.rightCurrentIndex).toBe(0);
    expect(store.playbackState).toBe('LOADED');
  });

  it('should generate random input array', () => {
    const store = useCompareAlgorithmsStore();
    const oldArray = [...store.inputArray];

    store.generateRandomInput(15);

    expect(store.inputArray.length).toBe(15);
    expect(store.inputArray).not.toEqual(oldArray);
    store.inputArray.forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(99);
    });
  });

  it('should use same input array for both algorithms (fair comparison)', () => {
    const store = useCompareAlgorithmsStore();
    store.inputArray = [5, 3, 8, 1, 9];

    store.loadCompareSession('bubble-sort', 'selection-sort');

    const leftFirst = store.leftFrames[0];
    const rightFirst = store.rightFrames[0];
    expect(leftFirst.dataState).toEqual(rightFirst.dataState);
  });

  it('should step forward on both sides simultaneously', () => {
    const store = useCompareAlgorithmsStore();
    store.loadCompareSession('bubble-sort', 'selection-sort');

    store.stepForward();

    expect(store.leftCurrentIndex).toBe(1);
    expect(store.rightCurrentIndex).toBe(1);
  });

  it('should step backward on both sides simultaneously', () => {
    const store = useCompareAlgorithmsStore();
    store.loadCompareSession('bubble-sort', 'selection-sort');

    store.stepForward();
    store.stepForward();
    store.stepBackward();

    expect(store.leftCurrentIndex).toBe(1);
    expect(store.rightCurrentIndex).toBe(1);
  });

  it('should not step backward below 0', () => {
    const store = useCompareAlgorithmsStore();
    store.loadCompareSession('bubble-sort', 'selection-sort');

    store.stepBackward();

    expect(store.leftCurrentIndex).toBe(0);
    expect(store.rightCurrentIndex).toBe(0);
  });

  it('should scrub to percent — sync both sides proportionally', () => {
    const store = useCompareAlgorithmsStore();
    store.loadCompareSession('bubble-sort', 'selection-sort');

    store.scrubToPercent(50);

    const leftExpected = Math.round(
      (50 / 100) * (store.leftFrames.length - 1),
    );
    const rightExpected = Math.round(
      (50 / 100) * (store.rightFrames.length - 1),
    );

    expect(store.leftCurrentIndex).toBe(leftExpected);
    expect(store.rightCurrentIndex).toBe(rightExpected);
  });

  it('should clamp scrub percent to 0-100', () => {
    const store = useCompareAlgorithmsStore();
    store.loadCompareSession('bubble-sort', 'selection-sort');

    store.scrubToPercent(-10);
    expect(store.leftCurrentIndex).toBe(0);
    expect(store.rightCurrentIndex).toBe(0);

    store.scrubToPercent(200);
    expect(store.leftCurrentIndex).toBe(store.leftFrames.length - 1);
    expect(store.rightCurrentIndex).toBe(store.rightFrames.length - 1);
  });

  it('should stop playback and reset to frame 0', () => {
    const store = useCompareAlgorithmsStore();
    store.loadCompareSession('bubble-sort', 'selection-sort');
    store.stepForward();
    store.stepForward();

    store.stopPlayback();

    expect(store.leftCurrentIndex).toBe(0);
    expect(store.rightCurrentIndex).toBe(0);
    expect(store.isPlaying).toBe(false);
  });

  it('should compute left stats (comparisons and swaps count)', () => {
    const store = useCompareAlgorithmsStore();
    store.loadCompareSession('bubble-sort', 'selection-sort');

    store.scrubToPercent(50);

    expect(store.leftStats.comparisons).toBeGreaterThanOrEqual(0);
    expect(store.leftStats.swaps).toBeGreaterThanOrEqual(0);
    expect(store.leftStats.totalFrames).toBe(store.leftFrames.length);
  });

  it('should compute efficiency ratio', () => {
    const store = useCompareAlgorithmsStore();
    store.loadCompareSession('bubble-sort', 'selection-sort');

    store.scrubToPercent(100);

    expect(store.efficiencyRatio).toBeGreaterThan(0);
  });

  it('should resolve algorithm names from catalog', () => {
    const store = useCompareAlgorithmsStore();

    expect(store.leftAlgorithmName).toContain('Bubble Sort');
    expect(store.rightAlgorithmName).toContain('Selection Sort');
  });

  it('should change playback speed', () => {
    const store = useCompareAlgorithmsStore();

    store.setSpeed(2.0);

    expect(store.globalPlaySpeed).toBe(2.0);
  });

  it('should toggle playback mode between independent and normalized', () => {
    const store = useCompareAlgorithmsStore();

    expect(store.playbackMode).toBe('independent');
    store.setPlaybackMode('normalized');
    expect(store.playbackMode).toBe('normalized');
    store.setPlaybackMode('independent');
    expect(store.playbackMode).toBe('independent');
  });

  it('should cleanup all state', () => {
    const store = useCompareAlgorithmsStore();
    store.loadCompareSession('bubble-sort', 'selection-sort');

    store.cleanup();

    expect(store.leftFrames.length).toBe(0);
    expect(store.rightFrames.length).toBe(0);
    expect(store.isPlaying).toBe(false);
    expect(store.playbackState).toBe('UNINITIALIZED');
  });

  it('should compute progress percentages', () => {
    const store = useCompareAlgorithmsStore();
    store.loadCompareSession('bubble-sort', 'selection-sort');

    store.scrubToPercent(0);
    expect(store.leftProgressPercent).toBe(0);
    expect(store.rightProgressPercent).toBe(0);

    store.scrubToPercent(100);
    expect(store.leftProgressPercent).toBe(100);
    expect(store.rightProgressPercent).toBe(100);
  });

  it('should detect FINISHED state when both sides reach last frame', () => {
    const store = useCompareAlgorithmsStore();
    store.loadCompareSession('bubble-sort', 'selection-sort');

    store.scrubToPercent(100);

    expect(store.leftIsFinished).toBe(true);
    expect(store.rightIsFinished).toBe(true);
    expect(store.bothFinished).toBe(true);
    expect(store.playbackState).toBe('FINISHED');
  });

  it('should resolve time complexity from catalog', () => {
    const store = useCompareAlgorithmsStore();

    expect(store.leftTimeComplexity).toBe('O(N²)');
    expect(store.rightTimeComplexity).toBe('O(N²)');
  });
});
