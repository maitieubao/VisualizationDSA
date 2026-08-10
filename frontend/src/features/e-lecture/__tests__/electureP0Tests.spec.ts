// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useLectureStore } from '../store/useLectureStore';
import { useAnimationStore } from '../../animation-engine/store/useAnimationStore';
import type { LectureScript } from '../types/lecture.types';
import type { AlgorithmResult } from '../../animation-engine/types/animation.types';

function createMockLecture(): LectureScript {
  return {
    lectureId: 'lec-001',
    algorithmId: 'bubble-sort',
    title: 'Bubble Sort Lecture',
    slides: [
      { slideId: 1, type: 'theory', content: '<h2>Slide 1: Giới thiệu</h2><p>Nội dung lý thuyết</p>', action: { command: 'RESET_CANVAS', targetFrame: 0 } },
      { slideId: 2, type: 'guided-animation', content: '<h2>Slide 2: Minh họa</h2><p>Bắt đầu chạy animation</p>', action: { command: 'PLAY_UNTIL', targetFrame: 3 } },
      { slideId: 3, type: 'interactive-check', content: '<h2>Slide 3: Kiểm tra</h2><p>Interactive check</p>', action: { command: 'PAUSE', targetFrame: 3 } },
      { slideId: 4, type: 'theory', content: '<h2>Slide 4: Kết luận</h2><p>Tổng kết</p>', action: { command: 'PAUSE', targetFrame: 3 } },
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

describe('EL-006 (P0): Lecture navigation — next/prev/goToSlide', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('nextSlide chuyển slide tiếp theo', async () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());
    store.startLecture(createMockLecture());

    expect(store.currentSlideIndex).toBe(0);

    const promise = store.nextSlide();
    vi.advanceTimersByTime(10000);
    await promise;

    expect(store.currentSlideIndex).toBe(1);
  });

  it('prevSlide quay lại slide trước', async () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());
    store.startLecture(createMockLecture());

    const p1 = store.nextSlide();
    vi.advanceTimersByTime(10000);
    await p1;

    expect(store.currentSlideIndex).toBe(1);

    await store.prevSlide();
    expect(store.currentSlideIndex).toBe(0);
  });

  it('goToSlide nhảy đến slide cụ thể', async () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());
    store.startLecture(createMockLecture());

    await store.goToSlide(2);
    expect(store.currentSlideIndex).toBe(2);
    expect(store.activeSlide?.slideId).toBe(3);
  });

  it('goToSlide từ chối index ngoài phạm vi', async () => {
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

describe('EL-008 (P0): Slide content — HTML + badge type', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('activeSlide trả về nội dung HTML đúng', () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());
    store.startLecture(createMockLecture());

    expect(store.activeSlide?.content).toContain('<h2>Slide 1: Giới thiệu</h2>');
  });

  it('slide type hiển thị đúng badge', () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());
    store.startLecture(createMockLecture());

    expect(store.activeSlide?.type).toBe('theory');
  });

  it('slideProgress hiển thị đúng format', () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());
    store.startLecture(createMockLecture());

    expect(store.slideProgress).toBe('1 / 4');
  });
});

describe('EL-012 (P0): Thoát — exitLecture', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('exitLecture reset state và unlock interaction', () => {
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
    expect(animStore.interactionLocked).toBe(false);
  });

  it('exitLecture dừng waiting animation', () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());
    store.startLecture(createMockLecture());

    store.isWaitingForAnimation = true;
    store.exitLecture();

    expect(store.isWaitingForAnimation).toBe(false);
  });
});
