import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useQuizStore } from '../store/useQuizStore';
import { statelessQuizApi } from '../service/statelessQuizApi';
import type { StatelessQuizSummary, StatelessQuizDetail, StatelessAttemptResult } from '../service/statelessQuizApi';

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

describe('useQuizStore — Chế độ Quiz Backend (Không trạng thái)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('loadQuizCatalog', () => {
    it('nạp danh sách quiz vào quizCatalog', async () => {
      vi.mocked(statelessQuizApi.getAllQuizzes).mockResolvedValueOnce([mockSummary]);
      const store = useQuizStore();

      await store.loadQuizCatalog();

      expect(store.quizCatalog).toHaveLength(1);
      expect(store.quizCatalog[0].title).toBe('Bubble Sort');
      expect(store.isBackendQuizLoading).toBe(false);
      expect(store.backendQuizError).toBeNull();
    });

    it('lưu thông báo lỗi và KHÔNG ném exception khi API lỗi', async () => {
      vi.mocked(statelessQuizApi.getAllQuizzes).mockRejectedValueOnce(new Error('HTTP 500'));
      const store = useQuizStore();

      await expect(store.loadQuizCatalog()).resolves.toBeUndefined();

      expect(store.quizCatalog).toHaveLength(0);
      expect(store.backendQuizError).toContain('HTTP 500');
      expect(store.isBackendQuizLoading).toBe(false);
    });
  });

  describe('startBackendQuiz', () => {
    it('tải quiz chi tiết và khởi tạo mảng câu trả lời rỗng theo số câu hỏi', async () => {
      vi.mocked(statelessQuizApi.getQuizById).mockResolvedValueOnce(mockDetail);
      const store = useQuizStore();

      await store.startBackendQuiz('quiz-1');

      expect(statelessQuizApi.getQuizById).toHaveBeenCalledWith('quiz-1');
      expect(store.activeBackendQuiz?.questions).toHaveLength(3);
      expect(store.backendAnswers).toEqual([null, null, null]);
      expect(store.backendQuizIndex).toBe(0);
      expect(store.isBackendQuizMode).toBe(true);
      expect(store.backendResult).toBeNull();
    });

    it('ghi lỗi khi tải quiz thất bại và KHÔNG bật chế độ quiz', async () => {
      vi.mocked(statelessQuizApi.getQuizById).mockRejectedValueOnce(new Error('HTTP 404'));
      const store = useQuizStore();

      await store.startBackendQuiz('quiz-1');

      expect(store.isBackendQuizMode).toBe(false);
      expect(store.backendQuizError).toContain('HTTP 404');
    });
  });

  describe('currentBackendQuestion & backendQuizProgress', () => {
    it('trả câu hỏi hiện tại theo backendQuizIndex', async () => {
      vi.mocked(statelessQuizApi.getQuizById).mockResolvedValueOnce(mockDetail);
      const store = useQuizStore();
      await store.startBackendQuiz('quiz-1');

      expect(store.currentBackendQuestion?.id).toBe('q1');

      store.nextBackendQuestion();
      expect(store.currentBackendQuestion?.id).toBe('q2');
    });

    it('hiển thị tiến độ "số hiện tại / tổng số"', async () => {
      vi.mocked(statelessQuizApi.getQuizById).mockResolvedValueOnce(mockDetail);
      const store = useQuizStore();
      await store.startBackendQuiz('quiz-1');

      expect(store.backendQuizProgress).toBe('1 / 3');

      store.nextBackendQuestion();
      expect(store.backendQuizProgress).toBe('2 / 3');
    });

    it('trả chuỗi rỗng khi chưa có quiz đang hoạt động', () => {
      const store = useQuizStore();
      expect(store.currentBackendQuestion).toBeNull();
      expect(store.backendQuizProgress).toBe('');
    });
  });

  describe('selectBackendAnswer', () => {
    it('ghi đáp án vào đúng vị trí câu hỏi hiện tại', async () => {
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

  describe('nextBackendQuestion / prevBackendQuestion', () => {
    it('tiến tới câu hỏi kế tiếp', async () => {
      vi.mocked(statelessQuizApi.getQuizById).mockResolvedValueOnce(mockDetail);
      const store = useQuizStore();
      await store.startBackendQuiz('quiz-1');

      store.nextBackendQuestion();
      expect(store.backendQuizIndex).toBe(1);
    });

    it('không vượt quá câu hỏi cuối cùng (clamping an toàn)', async () => {
      vi.mocked(statelessQuizApi.getQuizById).mockResolvedValueOnce(mockDetail);
      const store = useQuizStore();
      await store.startBackendQuiz('quiz-1');

      store.nextBackendQuestion();
      store.nextBackendQuestion();
      store.nextBackendQuestion();

      expect(store.backendQuizIndex).toBe(2);
    });

    it('quay lại câu hỏi trước đó', async () => {
      vi.mocked(statelessQuizApi.getQuizById).mockResolvedValueOnce(mockDetail);
      const store = useQuizStore();
      await store.startBackendQuiz('quiz-1');

      store.nextBackendQuestion();
      store.prevBackendQuestion();

      expect(store.backendQuizIndex).toBe(0);
    });

    it('không lùi trước câu hỏi đầu tiên (clamping an toàn)', async () => {
      vi.mocked(statelessQuizApi.getQuizById).mockResolvedValueOnce(mockDetail);
      const store = useQuizStore();
      await store.startBackendQuiz('quiz-1');

      store.prevBackendQuestion();
      expect(store.backendQuizIndex).toBe(0);
    });
  });

  describe('submitBackendQuiz', () => {
    it('gửi đáp án với câu chưa chọn được đánh dấu -1', async () => {
      vi.mocked(statelessQuizApi.getQuizById).mockResolvedValueOnce(mockDetail);
      vi.mocked(statelessQuizApi.submitAttempt).mockResolvedValueOnce(mockResult);
      const store = useQuizStore();
      await store.startBackendQuiz('quiz-1');

      store.selectBackendAnswer(1);
      store.nextBackendQuestion();
      store.nextBackendQuestion();
      store.selectBackendAnswer(3);

      await store.submitBackendQuiz();

      expect(statelessQuizApi.submitAttempt).toHaveBeenCalledWith('quiz-1', [1, -1, 3], null);
    });

    it('lưu kết quả chấm điểm từ backend', async () => {
      vi.mocked(statelessQuizApi.getQuizById).mockResolvedValueOnce(mockDetail);
      vi.mocked(statelessQuizApi.submitAttempt).mockResolvedValueOnce(mockResult);
      const store = useQuizStore();
      await store.startBackendQuiz('quiz-1');

      await store.submitBackendQuiz();

      expect(store.backendResult?.score).toBe(2);
      expect(store.backendResult?.passed).toBe(true);
      expect(store.backendResult?.questionResults).toHaveLength(3);
    });

    it('ghi lỗi khi submit thất bại và KHÔNG ghi đè kết quả cũ', async () => {
      vi.mocked(statelessQuizApi.getQuizById).mockResolvedValueOnce(mockDetail);
      const store = useQuizStore();
      await store.startBackendQuiz('quiz-1');

      vi.mocked(statelessQuizApi.submitAttempt).mockRejectedValueOnce(new Error('HTTP 400'));
      await store.submitBackendQuiz();

      expect(store.backendQuizError).toContain('HTTP 400');
      expect(store.backendResult).toBeNull();
    });

    it('không làm gì khi chưa có quiz đang hoạt động', async () => {
      const store = useQuizStore();

      await store.submitBackendQuiz();

      expect(statelessQuizApi.submitAttempt).not.toHaveBeenCalled();
    });
  });

  describe('exitBackendQuiz', () => {
    it('khôi phục toàn bộ trạng thái quiz backend về mặc định', async () => {
      vi.mocked(statelessQuizApi.getQuizById).mockResolvedValueOnce(mockDetail);
      const store = useQuizStore();
      await store.startBackendQuiz('quiz-1');
      store.selectBackendAnswer(0);

      store.exitBackendQuiz();

      expect(store.isBackendQuizMode).toBe(false);
      expect(store.activeBackendQuiz).toBeNull();
      expect(store.backendResult).toBeNull();
      expect(store.backendQuizIndex).toBe(0);
      expect(store.backendAnswers).toEqual([]);
      expect(store.backendQuizError).toBeNull();
    });
  });
});
