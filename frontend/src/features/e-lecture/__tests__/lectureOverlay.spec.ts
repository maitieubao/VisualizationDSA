// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import LectureOverlay from '../components/LectureOverlay.vue';
import { useLectureStore } from '../store/useLectureStore';
import { useAnimationStore } from '../../animation-engine/store/useAnimationStore';
import type { LectureScript } from '../types/lecture.types';
import type { AlgorithmResult } from '../../animation-engine/types/animation.types';

vi.mock('../../../shared/components/BaseIcon.vue', () => ({
  default: { template: '<i class="base-icon" />' },
}));

function createMockLecture(): LectureScript {
  return {
    lectureId: 'lec-001',
    algorithmId: 'bubble-sort',
    title: 'Bubble Sort Lecture',
    slides: [
      { slideId: 1, type: 'theory', content: '<h2>Slide 1: Giới thiệu</h2><p>Nội dung lý thuyết</p><script>alert("xss")<\/script>', action: { command: 'RESET_CANVAS', targetFrame: 0 } },
      { slideId: 2, type: 'guided-animation', content: '<p>Slide 2: Minh họa</p>', action: { command: 'PLAY_UNTIL', targetFrame: 3 } },
      { slideId: 3, type: 'interactive-check', content: '<p>Slide 3: Kiểm tra</p>', action: { command: 'PAUSE', targetFrame: 3 } },
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

function mountOverlay() {
  return mount(LectureOverlay, {
    attachTo: document.body,
    global: {
      stubs: {
        BaseIcon: { template: '<i class="base-icon" />' },
      },
    },
  });
}

describe('LectureOverlay', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('không render gì khi lecture chưa active', () => {
    const wrapper = mountOverlay();

    expect(wrapper.find('.lecture-panel').exists()).toBe(false);
  });

  it('render tiêu đề, progress và badge loại slide khi active', () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());
    store.startLecture(createMockLecture());

    const wrapper = mountOverlay();

    expect(wrapper.find('.lecture-panel').exists()).toBe(true);
    expect(wrapper.text()).toContain('Bubble Sort Lecture');
    expect(wrapper.text()).toContain('1 / 3');
    expect(wrapper.text()).toContain('Lý thuyết');
  });

  it('render nội dung slide dạng HTML', () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());
    store.startLecture(createMockLecture());

    const wrapper = mountOverlay();

    const contentHeadings = wrapper.findAll('h2');
    expect(contentHeadings.length).toBeGreaterThanOrEqual(2);
    expect(contentHeadings[1].text()).toBe('Slide 1: Giới thiệu');
  });

  it('sanitize nội dung slide: loại bỏ thẻ script (chống XSS)', () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());
    store.startLecture(createMockLecture());

    const wrapper = mountOverlay();

    expect(wrapper.find('script').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('alert');
  });

  it('hiện indicator đang chờ khi PLAY_UNTIL đang phát', async () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());
    store.startLecture(createMockLecture());

    const wrapper = mountOverlay();
    const promise = store.nextSlide();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Đang phát hoạt ảnh minh họa...');

    vi.advanceTimersByTime(10000);
    void promise;
  });

  it('áp class minimized khi isMinimized (panel thu nhỏ khi đang phát)', async () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());
    store.startLecture(createMockLecture());

    const wrapper = mountOverlay();
    const promise = store.nextSlide();

    await wrapper.vm.$nextTick();
    const panel = wrapper.find('.lecture-panel');
    expect(panel.classes()).toContain('opacity-15');
    expect(panel.classes()).toContain('pointer-events-none');

    vi.advanceTimersByTime(10000);
    await promise;

    await wrapper.vm.$nextTick();
    expect(wrapper.find('.lecture-panel').classes()).not.toContain('opacity-15');
  });

  it('phím ArrowRight chuyển slide tiếp theo', async () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());
    store.startLecture(createMockLecture());

    mountOverlay();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));

    await Promise.resolve();
    expect(store.currentSlideIndex).toBe(1);
  });

  it('phím ArrowLeft quay lại slide trước', async () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());
    store.startLecture(createMockLecture());

    mountOverlay();

    const p1 = store.nextSlide();
    vi.advanceTimersByTime(10000);
    await p1;

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));

    expect(store.currentSlideIndex).toBe(0);
  });

  it('phím Escape thoát lecture', () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());
    store.startLecture(createMockLecture());

    mountOverlay();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(store.isActive).toBe(false);
  });
});
