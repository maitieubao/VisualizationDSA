// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { watch, nextTick } from 'vue';
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

  describe('PLAY_UNTIL command', () => {
    it('bật isWaitingForAnimation + isMinimized và tự kết thúc khi đạt target frame', async () => {
      const store = useLectureStore();
      const animStore = useAnimationStore();
      animStore.loadResult(createMockAnimResult());
      store.startLecture(createMockLecture());

      const promise = store.nextSlide();

      expect(store.isWaitingForAnimation).toBe(true);
      expect(store.isMinimized).toBe(true);

      vi.advanceTimersByTime(10000);
      await promise;

      expect(store.isWaitingForAnimation).toBe(false);
      expect(store.isMinimized).toBe(false);
      expect(animStore.currentIndex).toBe(3);
    });

    it('skip PLAY_UNTIL bằng nextSlide: continuation cũ không ghi đè trạng thái slide mới', async () => {
      const store = useLectureStore();
      const animStore = useAnimationStore();
      animStore.loadResult(createMockAnimResult());
      store.startLecture(createMockLecture());

      const p1 = store.nextSlide();
      expect(store.isWaitingForAnimation).toBe(true);

      const p2 = store.nextSlide();
      expect(store.currentSlideIndex).toBe(2);

      vi.advanceTimersByTime(10000);
      await Promise.all([p1, p2]);

      expect(store.currentSlideIndex).toBe(2);
      expect(store.activeSlide?.type).toBe('interactive-check');
      expect(store.isWaitingForAnimation).toBe(false);
      expect(store.isMinimized).toBe(false);
    });
  });

  describe('PAUSE command', () => {
    it('dừng animation đang phát', async () => {
      const store = useLectureStore();
      const animStore = useAnimationStore();
      animStore.loadResult(createMockAnimResult());
      store.startLecture(createMockLecture());

      const p1 = store.nextSlide();
      vi.advanceTimersByTime(10000);
      await p1;
      expect(animStore.isPlaying).toBe(false);

      animStore.play();
      expect(animStore.isPlaying).toBe(true);

      await store.goToSlide(2);
      expect(store.activeSlide?.type).toBe('interactive-check');
      expect(animStore.isPlaying).toBe(false);
    });
  });

  describe('Interaction lock ownership', () => {
    it('exitLecture không phá lock của owner khác (quiz)', () => {
      const store = useLectureStore();
      const animStore = useAnimationStore();
      animStore.loadResult(createMockAnimResult());
      store.startLecture(createMockLecture());

      store.lockLectureInteraction('quiz');
      store.exitLecture();

      expect(animStore.interactionLocked).toBe(true);

      store.unlockLectureInteraction('quiz');
      expect(animStore.interactionLocked).toBe(false);
    });

    it('unlock một owner khi còn owner khác giữ lock', () => {
      const store = useLectureStore();
      const animStore = useAnimationStore();
      animStore.loadResult(createMockAnimResult());

      store.lockLectureInteraction('lecture');
      store.lockLectureInteraction('quiz');

      store.unlockLectureInteraction('lecture');

      expect(animStore.interactionLocked).toBe(true);

      store.unlockLectureInteraction('quiz');
      expect(animStore.interactionLocked).toBe(false);
    });

    it('lock thay đổi được reactive detect (không còn bug ref<Set> mutation)', async () => {
      const store = useLectureStore();
      const animStore = useAnimationStore();
      animStore.loadResult(createMockAnimResult());

      const observed: boolean[] = [];
      const stopWatch = watch(() => animStore.interactionLocked, (v) => { observed.push(v); });

      store.lockLectureInteraction('quiz');
      await nextTick();
      expect(observed).toContain(true);

      store.unlockLectureInteraction('quiz');
      await nextTick();
      expect(observed).toContain(false);

      stopWatch();
    });

    it('lock cùng owner nhiều lần không nhân đôi token', () => {
      const store = useLectureStore();
      const animStore = useAnimationStore();
      animStore.loadResult(createMockAnimResult());

      store.lockLectureInteraction('quiz');
      store.lockLectureInteraction('quiz');

      expect(animStore.interactionLocked).toBe(true);

      store.unlockLectureInteraction('quiz');
      expect(animStore.interactionLocked).toBe(false);
    });
  });

  describe('Transition guards', () => {
    it('goToSlide bị chặn khi đang chờ animation', async () => {
      const store = useLectureStore();
      const animStore = useAnimationStore();
      animStore.loadResult(createMockAnimResult());
      store.startLecture(createMockLecture());

      const promise = store.nextSlide();
      expect(store.isWaitingForAnimation).toBe(true);

      await store.goToSlide(2);

      expect(store.currentSlideIndex).toBe(1);

      vi.advanceTimersByTime(10000);
      await promise;
    });
  });
});
