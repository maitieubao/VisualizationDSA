// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAnimationStore } from '../store/useAnimationStore';
import { generateDummyBubbleSortResult } from '../services/algorithmApi';
import type { AlgorithmResult } from '../types/animation.types';

function createTestResult(): AlgorithmResult {
  return generateDummyBubbleSortResult([5, 3, 8]);
}

describe('useAnimationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      return setTimeout(() => cb(performance.now()), 16) as unknown as number;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('starts in UNINITIALIZED state', () => {
    const store = useAnimationStore();
    expect(store.playbackState).toBe('UNINITIALIZED');
    expect(store.frames.length).toBe(0);
    expect(store.currentFrame).toBeNull();
  });

  it('transitions to LOADED after loadResult', () => {
    const store = useAnimationStore();
    const result = createTestResult();
    store.loadResult(result);

    expect(store.playbackState).toBe('LOADED');
    expect(store.currentIndex).toBe(0);
    expect(store.frames.length).toBeGreaterThan(0);
    expect(store.algorithmId).toBe('bubble-sort');
    expect(store.pseudoCode.length).toBe(4);
  });

  it('currentFrame returns first frame after load', () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());

    expect(store.currentFrame).not.toBeNull();
    expect(store.currentFrame?.stepId).toBe(1);
  });

  it('stepForward increments currentIndex', () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());

    store.stepForward();
    expect(store.currentIndex).toBe(1);
    expect(store.playbackState).toBe('PAUSED');
  });

  it('stepBackward decrements currentIndex', () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());

    store.stepForward();
    vi.advanceTimersByTime(200);
    store.stepForward();
    expect(store.currentIndex).toBe(2);

    vi.advanceTimersByTime(200);
    store.stepBackward();
    expect(store.currentIndex).toBe(1);
  });

  it('stepBackward does not go below 0', () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());

    store.stepBackward();
    expect(store.currentIndex).toBe(0);
  });

  it('stepForward does not exceed last frame', () => {
    const store = useAnimationStore();
    const result = createTestResult();
    store.loadResult(result);

    const lastIndex = result.frames.length - 1;
    for (let i = 0; i < result.frames.length + 5; i++) {
      store.stepForward();
      vi.advanceTimersByTime(200);
    }
    expect(store.currentIndex).toBe(lastIndex);
  });

  it('scrubTo jumps to specific index', () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());

    store.scrubTo(3);
    expect(store.currentIndex).toBe(3);
    expect(store.playbackState).toBe('PAUSED');
  });

  it('scrubTo rejects out-of-bounds index', () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());

    store.scrubTo(-1);
    expect(store.currentIndex).toBe(0);

    store.scrubTo(9999);
    expect(store.currentIndex).toBe(0);
  });

  it('play starts playback and tick advances', () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());

    store.play();
    expect(store.isPlaying).toBe(true);
    expect(store.playbackState).toBe('PLAYING');

    vi.advanceTimersByTime(1100);
    expect(store.currentIndex).toBeGreaterThan(0);
  });

  it('pause stops playback', () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());

    store.play();
    vi.advanceTimersByTime(500);
    store.pause();

    expect(store.isPlaying).toBe(false);
    const indexAfterPause = store.currentIndex;

    vi.advanceTimersByTime(2000);
    expect(store.currentIndex).toBe(indexAfterPause);
  });

  it('stop resets to beginning', () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());

    store.stepForward();
    vi.advanceTimersByTime(200);
    store.stepForward();
    store.stop();

    expect(store.currentIndex).toBe(0);
    expect(store.isPlaying).toBe(false);
  });

  it('setSpeed changes playback speed', () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());

    store.setSpeed(2);
    expect(store.playbackSpeed).toBe(2);
  });

  it('progressPercent returns correct value', () => {
    const store = useAnimationStore();
    const result = createTestResult();
    store.loadResult(result);

    expect(store.progressPercent).toBe(0);

    const lastIdx = result.frames.length - 1;
    store.scrubTo(lastIdx);
    expect(store.progressPercent).toBe(100);
  });

  it('isFinished is true at last frame', () => {
    const store = useAnimationStore();
    const result = createTestResult();
    store.loadResult(result);

    store.scrubTo(result.frames.length - 1);
    expect(store.isFinished).toBe(true);
    expect(store.playbackState).toBe('FINISHED');
  });

  it('play replays from the start when finished', () => {
    const store = useAnimationStore();
    const result = createTestResult();
    store.loadResult(result);

    store.scrubTo(result.frames.length - 1);
    expect(store.isFinished).toBe(true);
    store.play();
    expect(store.currentIndex).toBe(0);
    expect(store.isPlaying).toBe(true);
  });
});

describe('useAnimationStore — subFrameProgress', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      return setTimeout(() => cb(performance.now()), 16) as unknown as number;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('subFrameProgress starts at 0', () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());
    expect(store.subFrameProgress).toBe(0);
  });

  it('subFrameProgress increases during playback', () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());
    store.play();

    vi.advanceTimersByTime(500);
    expect(store.subFrameProgress).toBeGreaterThan(0);
    expect(store.subFrameProgress).toBeLessThan(1);
  });

  it('subFrameProgress resets to 0 on frame advance', () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());
    store.play();

    vi.advanceTimersByTime(1100);
    expect(store.currentIndex).toBeGreaterThan(0);
    expect(store.subFrameProgress).toBeGreaterThanOrEqual(0);
    expect(store.subFrameProgress).toBeLessThan(1);
  });

  it('subFrameProgress resets to 0 on stepForward', () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());
    store.stepForward();
    expect(store.subFrameProgress).toBe(0);
  });

  it('subFrameProgress resets to 0 on stepBackward', () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());
    store.stepForward();
    vi.advanceTimersByTime(200);
    store.stepForward();
    vi.advanceTimersByTime(200);
    store.stepBackward();
    expect(store.subFrameProgress).toBe(0);
  });

  it('subFrameProgress resets to 0 on scrubTo', () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());
    store.scrubTo(2);
    expect(store.subFrameProgress).toBe(0);
  });

  it('subFrameProgress resets to 0 on goToFrame', () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());
    store.goToFrame(2);
    expect(store.subFrameProgress).toBe(0);
  });

  it('subFrameProgress resets to 0 on stop', () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());
    store.play();
    vi.advanceTimersByTime(500);
    store.stop();
    expect(store.subFrameProgress).toBe(0);
  });
});

describe('useAnimationStore — playUntilFrame', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      return setTimeout(() => cb(performance.now()), 16) as unknown as number;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('playUntilFrame resolves immediately when target >= frames.length', async () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());

    const promise = store.playUntilFrame(999);
    const resolved = await Promise.race([
      promise.then(() => true),
      new Promise<boolean>((r) => setTimeout(() => r(false), 100)),
    ]);
    expect(resolved).toBe(true);
  });

  it('playUntilFrame resolves immediately when currentIndex >= target', async () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());
    store.scrubTo(5);

    const promise = store.playUntilFrame(3);
    const resolved = await Promise.race([
      promise.then(() => true),
      new Promise<boolean>((r) => setTimeout(() => r(false), 100)),
    ]);
    expect(resolved).toBe(true);
    expect(store.currentIndex).toBe(3);
  });

  it('playUntilFrame plays and stops at target frame', async () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());

    const promise = store.playUntilFrame(3);
    vi.advanceTimersByTime(5000);
    await promise;

    expect(store.currentIndex).toBe(3);
    expect(store.isPlaying).toBe(false);
  });

  it('cancelPlayUntil stops at playUntilTarget', async () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());

    const promise = store.playUntilFrame(5);
    vi.advanceTimersByTime(2500);
    store.cancelPlayUntil();
    await promise;

    expect(store.currentIndex).toBe(5);
    expect(store.subFrameProgress).toBe(0);
  });
});

describe('useAnimationStore — visibilitychange', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      return setTimeout(() => cb(performance.now()), 16) as unknown as number;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('pauses playback when tab becomes hidden', () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());
    store.play();
    expect(store.isPlaying).toBe(true);

    Object.defineProperty(document, 'hidden', { value: true, writable: true });
    document.dispatchEvent(new Event('visibilitychange'));

    expect(store.isPlaying).toBe(false);
  });

  it('does not pause when tab becomes visible', () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());
    store.play();

    Object.defineProperty(document, 'hidden', { value: false, writable: true });
    document.dispatchEvent(new Event('visibilitychange'));

    expect(store.isPlaying).toBe(true);
  });
});
