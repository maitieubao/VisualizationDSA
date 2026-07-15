// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAnimationStore } from '../store/useAnimationStore';
import { generateDummyBubbleSortResult } from '../services/algorithmApi';
import {
  useSpeedPreferences,
  SPEED_PRESETS,
  DSA_PREFERENCES_KEY,
} from '../composables/useSpeedPreferences';
import { useThrottledScrub } from '../composables/useThrottledScrub';
import { usePlaybackHotkeys } from '../composables/usePlaybackHotkeys';
import { truncateText } from '../composables/useSliderTooltip';
import type { AlgorithmResult } from '../types/animation.types';

function createTestResult(): AlgorithmResult {
  return generateDummyBubbleSortResult([5, 3, 8, 1, 9]);
}

describe('Execution Control — Speed Presets', () => {
  it('SPEED_PRESETS contains plan-specified values', () => {
    expect(SPEED_PRESETS).toEqual([0.25, 0.5, 1.0, 2.0, 4.0]);
  });
});

describe('Execution Control — Speed Preferences (localStorage)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('returns default speed 1.0 when no saved preference', () => {
    const prefs = useSpeedPreferences();
    expect(prefs.loadSpeed()).toBe(1.0);
  });

  it('saves speed to localStorage', () => {
    const prefs = useSpeedPreferences();
    prefs.saveSpeed(2.0);
    const raw = localStorage.getItem(DSA_PREFERENCES_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.defaultSpeed).toBe(2.0);
  });

  it('loads previously saved speed', () => {
    const prefs = useSpeedPreferences();
    prefs.saveSpeed(4.0);
    expect(prefs.loadSpeed()).toBe(4.0);
  });

  it('returns default on corrupted localStorage', () => {
    localStorage.setItem(DSA_PREFERENCES_KEY, 'not-json');
    const prefs = useSpeedPreferences();
    expect(prefs.loadSpeed()).toBe(1.0);
  });

  it('returns default when speed value is invalid', () => {
    localStorage.setItem(DSA_PREFERENCES_KEY, JSON.stringify({ defaultSpeed: -5 }));
    const prefs = useSpeedPreferences();
    expect(prefs.loadSpeed()).toBe(1.0);
  });
});

describe('Execution Control — Throttled Scrubbing', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('scrubs to target frame index', () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());
    const scrub = useThrottledScrub();

    scrub.startScrub();
    scrub.updateScrubPosition(3);
    vi.advanceTimersByTime(50);

    expect(store.currentIndex).toBe(3);
    expect(store.isPlaying).toBe(false);
  });

  it('pauses playback when scrubbing starts', () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());
    store.play();
    expect(store.isPlaying).toBe(true);

    const scrub = useThrottledScrub();
    scrub.startScrub();
    expect(store.isPlaying).toBe(false);
  });

  it('isScrubbing flag tracks state', () => {
    const scrub = useThrottledScrub();
    expect(scrub.isScrubbing.value).toBe(false);

    scrub.startScrub();
    expect(scrub.isScrubbing.value).toBe(true);

    scrub.endScrub();
    expect(scrub.isScrubbing.value).toBe(false);
  });
});

describe('Execution Control — Replay Logic', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('goToFrame(0) then play starts from 0', () => {
    const store = useAnimationStore();
    const result = createTestResult();
    store.loadResult(result);

    store.scrubTo(result.frames.length - 1);
    expect(store.isFinished).toBe(true);

    store.goToFrame(0);
    expect(store.currentIndex).toBe(0);
    expect(store.isFinished).toBe(false);

    store.play();
    expect(store.isPlaying).toBe(true);
  });

  it('isFinished shows FINISHED state at last frame', () => {
    const store = useAnimationStore();
    const result = createTestResult();
    store.loadResult(result);

    store.scrubTo(result.frames.length - 1);
    expect(store.playbackState).toBe('FINISHED');
  });

  it('togglePlay works for play and pause', () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());

    store.togglePlay();
    expect(store.isPlaying).toBe(true);

    store.togglePlay();
    expect(store.isPlaying).toBe(false);
  });
});

describe('Execution Control — Keyboard Hotkeys', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('createHotkeyHandler returns a function', () => {
    const { createHotkeyHandler } = usePlaybackHotkeys();
    const handler = createHotkeyHandler();
    expect(typeof handler).toBe('function');
  });

  it('Space toggles play/pause', () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());

    const { createHotkeyHandler } = usePlaybackHotkeys();
    const handler = createHotkeyHandler();

    const event = new KeyboardEvent('keydown', { code: 'Space' });
    Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
    handler(event);
    expect(store.isPlaying).toBe(true);

    const event2 = new KeyboardEvent('keydown', { code: 'Space' });
    Object.defineProperty(event2, 'preventDefault', { value: vi.fn() });
    handler(event2);
    expect(store.isPlaying).toBe(false);
  });

  it('ArrowRight calls stepForward', () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());

    const { createHotkeyHandler } = usePlaybackHotkeys();
    const handler = createHotkeyHandler();

    const event = new KeyboardEvent('keydown', { code: 'ArrowRight' });
    Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
    handler(event);

    expect(store.currentIndex).toBe(1);
  });

  it('ArrowLeft calls stepBackward', () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());
    store.stepForward();
    store.stepForward();

    const { createHotkeyHandler } = usePlaybackHotkeys();
    const handler = createHotkeyHandler();

    const event = new KeyboardEvent('keydown', { code: 'ArrowLeft' });
    Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
    handler(event);

    expect(store.currentIndex).toBe(1);
  });

  it('Shift+ArrowLeft goes to first frame', () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());
    store.scrubTo(5);

    const { createHotkeyHandler } = usePlaybackHotkeys();
    const handler = createHotkeyHandler();

    const event = new KeyboardEvent('keydown', { code: 'ArrowLeft', shiftKey: true });
    Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
    handler(event);

    expect(store.currentIndex).toBe(0);
  });

  it('Shift+ArrowRight goes to last frame', () => {
    const store = useAnimationStore();
    const result = createTestResult();
    store.loadResult(result);

    const { createHotkeyHandler } = usePlaybackHotkeys();
    const handler = createHotkeyHandler();

    const event = new KeyboardEvent('keydown', { code: 'ArrowRight', shiftKey: true });
    Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
    handler(event);

    expect(store.currentIndex).toBe(result.frames.length - 1);
  });

  it('ignores hotkeys when interactionLocked', () => {
    const store = useAnimationStore();
    store.loadResult(createTestResult());
    store.setInteractionLocked(true);

    const { createHotkeyHandler } = usePlaybackHotkeys();
    const handler = createHotkeyHandler();

    const event = new KeyboardEvent('keydown', { code: 'Space' });
    Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
    handler(event);

    expect(store.isPlaying).toBe(false);
  });

  it('ignores hotkeys when UNINITIALIZED', () => {
    const store = useAnimationStore();

    const { createHotkeyHandler } = usePlaybackHotkeys();
    const handler = createHotkeyHandler();

    const event = new KeyboardEvent('keydown', { code: 'Space' });
    Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
    handler(event);

    expect(store.isPlaying).toBe(false);
  });

  it('Space replays from start when FINISHED', () => {
    const store = useAnimationStore();
    const result = createTestResult();
    store.loadResult(result);
    store.scrubTo(result.frames.length - 1);
    expect(store.isFinished).toBe(true);

    const { createHotkeyHandler } = usePlaybackHotkeys();
    const handler = createHotkeyHandler();

    const event = new KeyboardEvent('keydown', { code: 'Space' });
    Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
    handler(event);

    // After replay: goToFrame(0) resets, play() calls tick() which immediately advances to 1
    expect(store.isPlaying).toBe(true);
    expect(store.currentIndex).toBeLessThanOrEqual(1);
  });
});

describe('Execution Control — Tooltip Logic', () => {
  it('truncateText truncates strings longer than maxLength', () => {
    expect(truncateText('Hello World', 20)).toBe('Hello World');
    expect(truncateText('This is a very long explanation text for a frame', 20)).toBe('This is a very long ...');
  });

  it('truncateText handles empty string', () => {
    expect(truncateText('', 10)).toBe('');
  });
});
