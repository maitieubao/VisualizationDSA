import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useLectureStore } from '../store/useLectureStore';
import { useAnimationStore } from '../../animation-engine/store/useAnimationStore';
import type { LectureScript } from '../types/lecture.types';
import type { AlgorithmResult } from '../../animation-engine/types/animation.types';

function createMockLecture(): LectureScript {
  return {
    lectureId: 'test-lecture-001',
    algorithmId: 'bubble-sort',
    title: 'Test Lecture: Bubble Sort',
    slides: [
      {
        slideId: 1,
        type: 'theory',
        content: '<p>Slide 1 theory content</p>',
        action: { command: 'RESET_CANVAS', targetFrame: 0 },
      },
      {
        slideId: 2,
        type: 'guided-animation',
        content: '<p>Slide 2 animation content</p>',
        action: { command: 'PLAY_UNTIL', targetFrame: 3 },
      },
      {
        slideId: 3,
        type: 'interactive-check',
        content: '<p>Slide 3 check content</p>',
        action: { command: 'PAUSE', targetFrame: 3 },
      },
    ],
  };
}

function createMockAnimResult(): AlgorithmResult {
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

describe('useLectureStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts in inactive state', () => {
    const store = useLectureStore();
    expect(store.isActive).toBe(false);
    expect(store.currentLecture).toBeNull();
    expect(store.activeSlide).toBeNull();
    expect(store.currentSlideIndex).toBe(0);
    expect(store.isWaitingForAnimation).toBe(false);
  });

  it('startLecture activates lecture and sets first slide', () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());

    store.startLecture(createMockLecture());

    expect(store.isActive).toBe(true);
    expect(store.currentLecture).not.toBeNull();
    expect(store.currentSlideIndex).toBe(0);
    expect(store.activeSlide?.slideId).toBe(1);
    expect(store.activeSlide?.type).toBe('theory');
    expect(animStore.interactionLocked).toBe(true);
  });

  it('slideProgress returns correct format', () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());

    store.startLecture(createMockLecture());
    expect(store.slideProgress).toBe('1 / 3');
  });

  it('isFirstSlide and isLastSlide are correct', () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());

    store.startLecture(createMockLecture());

    expect(store.isFirstSlide).toBe(true);
    expect(store.isLastSlide).toBe(false);
  });

  it('nextSlide advances to next slide for theory type', async () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());

    store.startLecture(createMockLecture());
    expect(store.currentSlideIndex).toBe(0);

    const promise = store.nextSlide();
    vi.advanceTimersByTime(10000);
    await promise;

    expect(store.currentSlideIndex).toBe(1);
    expect(store.activeSlide?.slideId).toBe(2);
  });

  it('prevSlide goes back to previous slide', async () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());

    store.startLecture(createMockLecture());

    const p1 = store.nextSlide();
    vi.advanceTimersByTime(10000);
    await p1;

    await store.prevSlide();
    expect(store.currentSlideIndex).toBe(0);
    expect(store.activeSlide?.slideId).toBe(1);
  });

  it('prevSlide does nothing on first slide', async () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());

    store.startLecture(createMockLecture());

    await store.prevSlide();
    expect(store.currentSlideIndex).toBe(0);
  });

  it('nextSlide does nothing on last slide', async () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());

    const lecture = createMockLecture();
    store.startLecture(lecture);

    for (let i = 0; i < lecture.slides.length; i++) {
      const p = store.nextSlide();
      vi.advanceTimersByTime(10000);
      await p;
    }

    const lastIndex = lecture.slides.length - 1;
    expect(store.currentSlideIndex).toBe(lastIndex);
    expect(store.isLastSlide).toBe(true);
  });

  it('exitLecture resets all state and unlocks interaction', () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());

    store.startLecture(createMockLecture());
    expect(store.isActive).toBe(true);
    expect(animStore.interactionLocked).toBe(true);

    store.exitLecture();

    expect(store.isActive).toBe(false);
    expect(store.currentLecture).toBeNull();
    expect(store.currentSlideIndex).toBe(0);
    expect(store.isWaitingForAnimation).toBe(false);
    expect(animStore.interactionLocked).toBe(false);
  });

  it('totalSlides returns correct count', () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());

    store.startLecture(createMockLecture());
    expect(store.totalSlides).toBe(3);
  });

  it('RESET_CANVAS action calls goToFrame', () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());

    store.startLecture(createMockLecture());

    expect(animStore.currentIndex).toBe(0);
  });

  it('goToSlide navigates to specific slide', async () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());

    store.startLecture(createMockLecture());

    await store.goToSlide(2);
    expect(store.currentSlideIndex).toBe(2);
    expect(store.activeSlide?.slideId).toBe(3);
  });

  it('goToSlide rejects out-of-bounds index', async () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());

    store.startLecture(createMockLecture());

    await store.goToSlide(-1);
    expect(store.currentSlideIndex).toBe(0);

    await store.goToSlide(100);
    expect(store.currentSlideIndex).toBe(0);
  });
});
