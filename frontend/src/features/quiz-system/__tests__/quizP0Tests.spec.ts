// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mount, type VueWrapper } from '@vue/test-utils';
import { useQuizStore } from '../store/useQuizStore';
import { statelessQuizApi } from '../service/statelessQuizApi';
import type { StatelessQuizSummary, StatelessQuizDetail, StatelessAttemptResult } from '../service/statelessQuizApi';
import QuizOptionsList from '../components/QuizOptionsList.vue';

vi.mock('../service/statelessQuizApi', () => ({
  statelessQuizApi: {
    getAllQuizzes: vi.fn(),
    getQuizById: vi.fn(),
    submitAttempt: vi.fn(),
  },
}));

const mockSummary: StatelessQuizSummary = {
  id: 'quiz-1',
  title: 'Bubble Sort',
  topic: 'Sorting',
  difficulty: 'Easy',
  xpReward: 100,
  questionCount: 3,
};

const mockDetail: StatelessQuizDetail = {
  id: 'quiz-1',
  title: 'Bubble Sort',
  topic: 'Sorting',
  difficulty: 'Easy',
  xpReward: 100,
  questions: [
    { id: 'q1', text: 'Câu 1?', options: ['A', 'B', 'C'], correctIndex: 1, explanation: 'Giải thích 1' },
    { id: 'q2', text: 'Câu 2?', options: ['A', 'B'], correctIndex: 0, explanation: 'Giải thích 2' },
    { id: 'q3', text: 'Câu 3?', options: ['A', 'B', 'C', 'D'], correctIndex: 3, explanation: 'Giải thích 3' },
  ],
};

const mockResult: StatelessAttemptResult = {
  score: 2,
  maxScore: 3,
  passed: true,
  xpAwarded: 100,
  questionResults: [
    { questionId: 'q1', isCorrect: true, correctIndex: 1, explanation: 'Chính xác!' },
    { questionId: 'q2', isCorrect: false, correctIndex: 0, explanation: 'Sai rồi!' },
    { questionId: 'q3', isCorrect: true, correctIndex: 3, explanation: 'Chính xác!' },
  ],
};

describe('Quiz System — P0/P1 User Stories', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('US-QS-004 (P0): Chọn đáp án', () => {
    it('selectBackendAnswer() ghi đáp án vào đúng vị trí câu hỏi hiện tại', async () => {
      vi.mocked(statelessQuizApi.getQuizById).mockResolvedValueOnce(mockDetail);
      const store = useQuizStore();
      await store.startBackendQuiz('quiz-1');

      store.selectBackendAnswer(2);
      expect(store.backendAnswers[0]).toBe(2);
      expect(store.backendAnswers[1]).toBeNull();

      store.nextBackendQuestion();
      store.selectBackendAnswer(0);
      expect(store.backendAnswers[1]).toBe(0);
      expect(store.backendAnswers[0]).toBe(2);
    });
  });

  describe('US-QS-005 (P0): Điều hướng câu', () => {
    it('nextBackendQuestion() tăng backendQuizIndex', async () => {
      vi.mocked(statelessQuizApi.getQuizById).mockResolvedValueOnce(mockDetail);
      const store = useQuizStore();
      await store.startBackendQuiz('quiz-1');

      expect(store.backendQuizIndex).toBe(0);
      store.nextBackendQuestion();
      expect(store.backendQuizIndex).toBe(1);
      store.nextBackendQuestion();
      expect(store.backendQuizIndex).toBe(2);
    });

    it('nextBackendQuestion() không vượt quá câu cuối (clamping)', async () => {
      vi.mocked(statelessQuizApi.getQuizById).mockResolvedValueOnce(mockDetail);
      const store = useQuizStore();
      await store.startBackendQuiz('quiz-1');

      store.nextBackendQuestion();
      store.nextBackendQuestion();
      store.nextBackendQuestion();
      store.nextBackendQuestion();
      expect(store.backendQuizIndex).toBe(2);
    });

    it('prevBackendQuestion() giảm backendQuizIndex', async () => {
      vi.mocked(statelessQuizApi.getQuizById).mockResolvedValueOnce(mockDetail);
      const store = useQuizStore();
      await store.startBackendQuiz('quiz-1');

      store.nextBackendQuestion();
      store.nextBackendQuestion();
      store.prevBackendQuestion();
      expect(store.backendQuizIndex).toBe(1);
    });

    it('prevBackendQuestion() không lùi trước câu đầu (clamping)', async () => {
      vi.mocked(statelessQuizApi.getQuizById).mockResolvedValueOnce(mockDetail);
      const store = useQuizStore();
      await store.startBackendQuiz('quiz-1');

      store.prevBackendQuestion();
      expect(store.backendQuizIndex).toBe(0);
    });
  });

  describe('US-QS-007 (P0): Nộp bài', () => {
    it('submitBackendQuiz() gửi đáp án và nhận kết quả passed boolean', async () => {
      vi.mocked(statelessQuizApi.getQuizById).mockResolvedValueOnce(mockDetail);
      vi.mocked(statelessQuizApi.submitAttempt).mockResolvedValueOnce(mockResult);
      const store = useQuizStore();
      await store.startBackendQuiz('quiz-1');

      store.selectBackendAnswer(1);
      store.nextBackendQuestion();
      store.selectBackendAnswer(0);
      store.nextBackendQuestion();
      store.selectBackendAnswer(3);

      await store.submitBackendQuiz();

      expect(statelessQuizApi.submitAttempt).toHaveBeenCalledWith('quiz-1', [1, 0, 3], null);
      expect(store.backendResult).not.toBeNull();
      expect(typeof store.backendResult?.passed).toBe('boolean');
      expect(store.backendResult?.passed).toBe(true);
    });

    it('submitBackendQuiz() ghi lỗi khi API thất bại', async () => {
      vi.mocked(statelessQuizApi.getQuizById).mockResolvedValueOnce(mockDetail);
      vi.mocked(statelessQuizApi.submitAttempt).mockRejectedValueOnce(new Error('HTTP 500'));
      const store = useQuizStore();
      await store.startBackendQuiz('quiz-1');

      await store.submitBackendQuiz();
      expect(store.backendQuizError).toContain('HTTP 500');
      expect(store.backendResult).toBeNull();
    });
  });

  describe('US-QS-008 (P0): Xem kết quả', () => {
    it('backendResult có score, maxScore, xpAwarded', async () => {
      vi.mocked(statelessQuizApi.getQuizById).mockResolvedValueOnce(mockDetail);
      vi.mocked(statelessQuizApi.submitAttempt).mockResolvedValueOnce(mockResult);
      const store = useQuizStore();
      await store.startBackendQuiz('quiz-1');

      await store.submitBackendQuiz();

      expect(store.backendResult?.score).toBe(2);
      expect(store.backendResult?.maxScore).toBe(3);
      expect(store.backendResult?.xpAwarded).toBe(100);
      expect(store.backendResult?.questionResults).toHaveLength(3);
    });
  });

  describe('US-QS-009 (P1): Cảnh báo XP tối đa', () => {
    it('khi đã nhận XP max → không tăng XP thêm', async () => {
      const maxXpResult: StatelessAttemptResult = {
        ...mockResult,
        xpAwarded: 100,
      };
      vi.mocked(statelessQuizApi.getQuizById).mockResolvedValueOnce(mockDetail);
      vi.mocked(statelessQuizApi.submitAttempt).mockResolvedValueOnce(maxXpResult);
      const store = useQuizStore();
      await store.startBackendQuiz('quiz-1');

      await store.submitBackendQuiz();

      expect(store.backendResult?.xpAwarded).toBe(100);
      expect(store.backendResult?.xpAwarded).toBeLessThanOrEqual(100);
    });
  });

  describe('US-QS-011 (P1): Thoát quiz', () => {
    it('exitBackendQuiz() reset toàn bộ state về mặc định', async () => {
      vi.mocked(statelessQuizApi.getQuizById).mockResolvedValueOnce(mockDetail);
      const store = useQuizStore();
      await store.startBackendQuiz('quiz-1');
      store.selectBackendAnswer(0);
      store.nextBackendQuestion();

      store.exitBackendQuiz();

      expect(store.isBackendQuizMode).toBe(false);
      expect(store.activeBackendQuiz).toBeNull();
      expect(store.backendResult).toBeNull();
      expect(store.backendQuizIndex).toBe(0);
      expect(store.backendAnswers).toEqual([]);
      expect(store.backendQuizError).toBeNull();
      expect(store.isBackendQuizSubmitting).toBe(false);
    });
  });

  describe('US-QS-017 (P1): Phản hồi đúng/sai', () => {
    it('QuizOptionsList hiển thị option-correct khi chọn đúng đáp án', () => {
      const wrapper = mount(QuizOptionsList, {
        props: {
          options: ['A', 'B', 'C'],
          type: 'MULTIPLE_CHOICE',
          selectedIndex: 1,
          isSubmitted: true,
          correctIndex: 1,
        },
      });

      const buttons = wrapper.findAll('button');
      expect(buttons[1].classes()).toContain('option-correct');
    });

    it('QuizOptionsList hiển thị option-incorrect khi chọn sai đáp án', () => {
      const wrapper = mount(QuizOptionsList, {
        props: {
          options: ['A', 'B', 'C'],
          type: 'MULTIPLE_CHOICE',
          selectedIndex: 0,
          isSubmitted: true,
          correctIndex: 1,
        },
      });

      const buttons = wrapper.findAll('button');
      expect(buttons[0].classes()).toContain('option-incorrect');
      expect(buttons[1].classes()).toContain('option-correct');
    });

    it('QuizOptionsList không hiển thị correct/incorrect khi chưa submit', () => {
      const wrapper = mount(QuizOptionsList, {
        props: {
          options: ['A', 'B', 'C'],
          type: 'MULTIPLE_CHOICE',
          selectedIndex: 0,
          isSubmitted: false,
          correctIndex: 1,
        },
      });

      const buttons = wrapper.findAll('button');
      expect(buttons[0].classes()).toContain('option-selected');
      expect(buttons[0].classes()).not.toContain('option-correct');
      expect(buttons[0].classes()).not.toContain('option-incorrect');
    });
  });
});
