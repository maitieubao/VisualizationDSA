// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mount, flushPromises } from '@vue/test-utils';

vi.mock('../../custom-input/store/useInputStore', () => {
  const { reactive } = require('vue');
  return {
    useInputStore: () => reactive({
      isLoading: false,
      rawText: '',
      isValidFormat: true,
      isWithinLimit: true,
      apiErrorMessage: '',
      parsedArray: [],
      elementCount: 0,
      maxLimit: 15,
      generationType: 'array',
      startGeneration: vi.fn(),
      validateAndSubmit: vi.fn(),
      clearError: vi.fn(),
      setGenerationType: vi.fn(),
    }),
  };
});

vi.mock('../../e-lecture', () => ({
  LectureOverlay: { template: '<div class="lecture-overlay" />' },
  useLectureStore: () => ({ isActive: false }),
  loadLecture: vi.fn(),
  hasLecture: () => false,
}));

vi.mock('../../quiz-system', () => ({
  QuizCardOverlay: { template: '<div class="quiz-overlay" />' },
  QuizSummaryCard: { template: '<div class="quiz-summary" />' },
  useQuizStore: () => ({
    sessionCorrect: 0,
    sessionTotal: 0,
    checkpoints: [],
    allCheckpointsCompleted: false,
    checkFrameForQuiz: vi.fn(),
    resetQuizStore: vi.fn(),
    loadCheckpoints: vi.fn(),
  }),
  loadQuizScript: vi.fn(),
}));

vi.mock('../../pseudocode-sync', () => ({
  MultilingualCodePanel: { template: '<div class="code-panel" />' },
  usePseudocodeStore: () => ({
    resetStore: vi.fn(),
    loadPseudocodeScript: vi.fn(),
  }),
  loadPseudocodeScript: vi.fn(),
}));

import VisualizationCanvas from '../components/VisualizationCanvas.vue';
import ExplanationPanel from '../components/ExplanationPanel.vue';
import BaseIcon from '../../../shared/components/BaseIcon.vue';

describe('Animation Sandbox Components — P0 Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    class MockResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    global.ResizeObserver = MockResizeObserver as never;
  });

  it('Anim-001 (P0): ExplanationPanel renders in Animation Sandbox', async () => {
    const wrapper = mount(ExplanationPanel, {
      global: { components: { BaseIcon } },
    });
    await flushPromises();

    expect(wrapper.find('.explanation-panel').exists()).toBe(true);
    expect(wrapper.find('.explanation-panel__label').text()).toBe('Explanation');
  });

  it('Anim-002 (P0): VisualizationCanvas renders canvas element', async () => {
    const wrapper = mount(VisualizationCanvas, {
      props: {
        isLoading: false,
        showQuizSummary: false,
        sessionCorrect: 0,
        sessionTotal: 0,
        showLectureBtn: false,
      },
      global: { components: { BaseIcon } },
    });
    await flushPromises();

    expect(wrapper.find('canvas').exists()).toBe(true);
    expect(wrapper.find('.canvas-wrapper').exists()).toBe(true);
  });

  it('Anim-003 (P0): ExplanationPanel renders empty state when no frame', async () => {
    const wrapper = mount(ExplanationPanel, {
      global: { components: { BaseIcon } },
    });
    await flushPromises();

    expect(wrapper.find('.explanation-panel__empty').exists()).toBe(true);
    expect(wrapper.text()).toContain('Chưa có dữ liệu hoạt ảnh');
  });
});
