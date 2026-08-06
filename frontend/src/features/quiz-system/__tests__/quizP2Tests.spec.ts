// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import { useQuizStore } from '../store/useQuizStore';
import { statelessQuizApi } from '../service/statelessQuizApi';
import type { StatelessQuizSummary, StatelessQuizDetail, StatelessAttemptResult } from '../service/statelessQuizApi';

vi.mock('../service/statelessQuizApi', () => ({
  statelessQuizApi: {
    getAllQuizzes: vi.fn(async () => []),
    getQuizById: vi.fn(async () => null),
    submitAttempt: vi.fn(async () => ({ passed: true, score: 3, maxScore: 4, xpAwarded: 30, questionResults: [] })),
    getTopics: vi.fn(async () => []),
    getQuizzesByTopic: vi.fn(async () => []),
  },
}));

vi.mock('../../../../shared/components/BaseIcon.vue', () => ({
  default: { name: 'BaseIcon', props: ['name', 'class'], template: '<svg class="base-icon"><title>{{ name }}</title></svg>' },
}));

vi.mock('../../../../components/SkeletonLoader.vue', () => ({
  default: { name: 'SkeletonLoader', props: ['variant', 'width', 'height', 'rounded'], template: '<div class="skeleton-loader"></div>' },
}));

vi.mock('../../../composables/useConfetti', () => ({
  useConfetti: () => ({ fireQuizPass: vi.fn() }),
}));

import BackendQuizWorkspace from '../components/BackendQuizWorkspace.vue';
import QuizCardOverlay from '../components/QuizCardOverlay.vue';

const mockSummary: StatelessQuizSummary = {
  id: 'quiz-1',
  title: 'Bubble Sort',
  topic: 'DSA',
  difficulty: 'easy',
  xpReward: 100,
  questionCount: 3,
};

const mockDetail: StatelessQuizDetail = {
  id: 'quiz-1',
  title: 'Bubble Sort',
  topic: 'DSA',
  difficulty: 'easy',
  xpReward: 100,
  questions: [
    { id: 'q1', text: 'Câu 1?', options: ['A', 'B', 'C'], correctIndex: 1, explanation: 'Giải thích 1' },
    { id: 'q2', text: 'Câu 2?', options: ['A', 'B'], correctIndex: 0, explanation: 'Giải thích 2' },
    { id: 'q3', text: 'Câu 3?', options: ['A', 'B', 'C', 'D'], correctIndex: 3, explanation: 'Giải thích 3' },
  ],
};

const mockResult: StatelessAttemptResult = {
  score: 3,
  maxScore: 4,
  passed: true,
  xpAwarded: 100,
  questionResults: [
    { questionId: 'q1', isCorrect: true, correctIndex: 1, explanation: 'Chính xác!' },
    { questionId: 'q2', isCorrect: false, correctIndex: 0, explanation: 'Sai rồi!' },
    { questionId: 'q3', isCorrect: true, correctIndex: 3, explanation: 'Chính xác!' },
    { questionId: 'q4', isCorrect: true, correctIndex: 2, explanation: 'Chính xác!' },
  ],
};

describe('Quiz System — P2 User Stories', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('US-QS-001 (P2): Quiz list', () => {
    it('renders quiz catalog from API', async () => {
      vi.mocked(statelessQuizApi.getAllQuizzes).mockResolvedValue([mockSummary]);
      const store = useQuizStore();
      await store.loadQuizCatalog();
      expect(store.quizCatalog).toHaveLength(1);
      expect(store.quizCatalog[0].title).toBe('Bubble Sort');
    });

    it('BackendQuizWorkspace mounts without errors', async () => {
      vi.mocked(statelessQuizApi.getAllQuizzes).mockResolvedValue([]);
      const wrapper = mount(BackendQuizWorkspace);
      await flushPromises();
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.text()).toContain('Ngân Hàng Trắc Nghiệm');
    });
  });

  describe('US-QS-002 (P2): Quiz card — difficulty/topic/XP', () => {
    it('quiz card displays difficulty badge from API data', async () => {
      vi.mocked(statelessQuizApi.getAllQuizzes).mockResolvedValue([mockSummary]);
      const wrapper = mount(BackendQuizWorkspace);
      await flushPromises();
      await nextTick();
      expect(wrapper.text()).toContain('easy');
    });

    it('quiz card displays XP reward from API data', async () => {
      vi.mocked(statelessQuizApi.getAllQuizzes).mockResolvedValue([mockSummary]);
      const wrapper = mount(BackendQuizWorkspace);
      await flushPromises();
      await nextTick();
      expect(wrapper.text()).toContain('+100 XP');
    });

    it('quiz card displays question count from API data', async () => {
      vi.mocked(statelessQuizApi.getAllQuizzes).mockResolvedValue([mockSummary]);
      const wrapper = mount(BackendQuizWorkspace);
      await flushPromises();
      await nextTick();
      expect(wrapper.text()).toContain('3 câu hỏi');
    });
  });

  describe('US-QS-003 (P2): Start quiz — click card loads quiz', () => {
    it('clicking quiz card calls startBackendQuiz when not fallback', async () => {
      vi.mocked(statelessQuizApi.getAllQuizzes).mockResolvedValue([mockSummary]);
      vi.mocked(statelessQuizApi.getQuizById).mockResolvedValue(mockDetail);
      const wrapper = mount(BackendQuizWorkspace);
      await flushPromises();
      await nextTick();
      const card = wrapper.find('.quiz-card');
      expect(card.exists()).toBe(true);
      await card.trigger('click');
      await flushPromises();
      const store = useQuizStore();
      expect(store.isBackendQuizMode).toBe(true);
      expect(store.activeBackendQuiz).not.toBeNull();
    });
  });

  describe('US-QS-006 (P2): Progress — "X / Y"', () => {
    it('backendQuizProgress shows "1 / 3" on first question', async () => {
      vi.mocked(statelessQuizApi.getQuizById).mockResolvedValue(mockDetail);
      const store = useQuizStore();
      await store.startBackendQuiz('quiz-1');
      expect(store.backendQuizProgress).toBe('1 / 3');
    });

    it('backendQuizProgress updates to "2 / 3" after next', async () => {
      vi.mocked(statelessQuizApi.getQuizById).mockResolvedValue(mockDetail);
      const store = useQuizStore();
      await store.startBackendQuiz('quiz-1');
      store.nextBackendQuestion();
      expect(store.backendQuizProgress).toBe('2 / 3');
    });

    it('workspace renders progress badge during quiz', async () => {
      vi.mocked(statelessQuizApi.getAllQuizzes).mockResolvedValue([mockSummary]);
      vi.mocked(statelessQuizApi.getQuizById).mockResolvedValue(mockDetail);
      const wrapper = mount(BackendQuizWorkspace);
      await flushPromises();
      await nextTick();
      await wrapper.find('.quiz-card').trigger('click');
      await flushPromises();
      await nextTick();
      expect(wrapper.text()).toContain('1 / 3');
    });
  });

  describe('US-QS-010 (P2): Retry/Return buttons after submit', () => {
    it('shows "Quay lại danh sách" and "Làm lại" buttons after result', async () => {
      vi.mocked(statelessQuizApi.getQuizById).mockResolvedValue(mockDetail);
      vi.mocked(statelessQuizApi.submitAttempt).mockResolvedValue(mockResult);
      const store = useQuizStore();
      await store.startBackendQuiz('quiz-1');
      store.selectBackendAnswer(1);
      store.nextBackendQuestion();
      store.selectBackendAnswer(0);
      store.nextBackendQuestion();
      store.selectBackendAnswer(3);
      await store.submitBackendQuiz();
      expect(store.backendResult).not.toBeNull();
      const wrapper = mount(BackendQuizWorkspace);
      await flushPromises();
      expect(wrapper.text()).toContain('Quay lại danh sách');
      expect(wrapper.text()).toContain('Làm lại');
    });
  });

  describe('US-QS-012 (P2): Fallback quizzes when offline', () => {
    it('displays fallback quizzes when API returns empty', async () => {
      vi.mocked(statelessQuizApi.getAllQuizzes).mockResolvedValue([]);
      const store = useQuizStore();
      await store.loadQuizCatalog();
      expect(store.quizCatalog).toHaveLength(0);
      const wrapper = mount(BackendQuizWorkspace);
      await flushPromises();
      expect(wrapper.text()).toContain('Thuật toán Sắp xếp cơ bản');
    });

    it('shows fallback notice when using offline data', async () => {
      vi.mocked(statelessQuizApi.getAllQuizzes).mockResolvedValue([]);
      const wrapper = mount(BackendQuizWorkspace);
      await flushPromises();
      expect(wrapper.text()).toContain('Đang hiển thị quiz mẫu');
    });
  });

  describe('US-QS-013 (P2): Error + retry button', () => {
    it('shows error message and retry button when API fails', async () => {
      vi.mocked(statelessQuizApi.getAllQuizzes).mockRejectedValue(new Error('Network error'));
      const store = useQuizStore();
      await store.loadQuizCatalog();
      expect(store.backendQuizError).toContain('Network error');
      const wrapper = mount(BackendQuizWorkspace);
      await flushPromises();
      expect(wrapper.text()).toContain('Network error');
      expect(wrapper.text()).toContain('Thử lại');
    });
  });

  describe('US-QS-014 (P2): Skeleton loading', () => {
    it('renders skeleton cards while loading', async () => {
      vi.mocked(statelessQuizApi.getAllQuizzes).mockReturnValue(new Promise(() => {}));
      const wrapper = mount(BackendQuizWorkspace);
      await nextTick();
      expect(wrapper.findAll('.skeleton-card')).toHaveLength(6);
    });
  });

  describe('US-QS-026 (P2): Question type label', () => {
    it('QuizCardOverlay shows "Nhiều lựa chọn" for MULTIPLE_CHOICE', () => {
      const store = useQuizStore();
      store.activeQuestion = {
        id: 'q1',
        type: 'MULTIPLE_CHOICE',
        prompt: 'Test?',
        options: ['A', 'B', 'C'],
        correctOptionIndex: 1,
        explanation: 'Test',
      };
      store.isQuizActive = true;
      const wrapper = mount(QuizCardOverlay);
      expect(wrapper.text()).toContain('Nhiều lựa chọn');
    });

    it('QuizCardOverlay shows "Đúng / Sai" for TRUE_FALSE', () => {
      const store = useQuizStore();
      store.activeQuestion = {
        id: 'q1',
        type: 'TRUE_FALSE',
        prompt: 'Test?',
        options: ['True', 'False'],
        correctOptionIndex: 0,
        explanation: 'Test',
      };
      store.isQuizActive = true;
      const wrapper = mount(QuizCardOverlay);
      expect(wrapper.text()).toContain('Đúng / Sai');
    });
  });

  describe('US-QS-027 (P2): Topic emoji/icon', () => {
    it('workspace renders topic tabs with icons', async () => {
      vi.mocked(statelessQuizApi.getAllQuizzes).mockResolvedValue([]);
      const wrapper = mount(BackendQuizWorkspace);
      await flushPromises();
      expect(wrapper.text()).toContain('Tất cả');
      expect(wrapper.text()).toContain('DSA');
      expect(wrapper.text()).toContain('OOP');
    });
  });
});
