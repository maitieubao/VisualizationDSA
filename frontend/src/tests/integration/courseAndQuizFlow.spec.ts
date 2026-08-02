// @vitest-environment jsdom

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCourseStore } from '../../features/courses/store/useCourseStore';
import { useQuizStore } from '../../features/quiz-system/store/useQuizStore';
import type { StatelessQuizSummary, StatelessQuizDetail, StatelessAttemptResult } from '../../features/quiz-system/service/statelessQuizApi';

const API_ROOT = 'http://localhost:5055/api/v1';

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

const quizSummary: StatelessQuizSummary = {
  id: 'quiz-1',
  title: 'Bubble Sort',
  topic: 'Sorting',
  difficulty: 'Easy',
  xpReward: 100,
  questionCount: 2,
};

const quizDetail: StatelessQuizDetail = {
  id: 'quiz-1',
  title: 'Bubble Sort',
  topic: 'Sorting',
  difficulty: 'Easy',
  xpReward: 100,
  questions: [
    { id: 'q1', text: 'Độ phức tạp worst-case?', options: ['O(n)', 'O(n²)'], correctIndex: 1, explanation: 'Worst case O(n²).' },
    { id: 'q2', text: 'Bubble Sort có ổn định không?', options: ['Có', 'Không'], correctIndex: 0, explanation: 'Bubble Sort là stable.' },
  ],
};

const attemptResult: StatelessAttemptResult = {
  score: 2,
  maxScore: 2,
  passed: true,
  xpAwarded: 100,
  questionResults: [
    { questionId: 'q1', isCorrect: true, correctIndex: 1, explanation: 'Chính xác!' },
    { questionId: 'q2', isCorrect: true, correctIndex: 0, explanation: 'Chính xác!' },
  ],
};

function createBackendMockFetch(): ReturnType<typeof vi.fn> {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);

    if (url.endsWith('/concepts/quiz/all')) {
      return jsonResponse([quizSummary]);
    }
    if (url.endsWith('/concepts/quiz/quiz-1')) {
      return jsonResponse(quizDetail);
    }
    if (url.endsWith('/concepts/quiz/submit')) {
      const body = JSON.parse(String(init?.body ?? '{}'));
      if (!Array.isArray(body.answers)) return jsonResponse({}, 400);
      return jsonResponse(attemptResult);
    }
    return jsonResponse({ message: 'Not Found' }, 404);
  });
}

describe('Integration — Luồng Học Viên: Khóa học + Quiz Backend (giả lập API thật)', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    fetchMock = createBackendMockFetch();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('Luồng Khóa học', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('nạp khóa học, lọc danh mục và theo dõi tiến trình hoàn thành lesson', async () => {
      const courseStore = useCourseStore();
      courseStore.loadCourses();
      await vi.advanceTimersByTimeAsync(300);

      expect(courseStore.courses.length).toBeGreaterThan(0);
      expect(courseStore.courses.every(c => c.isPublished)).toBe(true);

      courseStore.setCategory('Sorting');
      expect(courseStore.filteredCourses.every(c => c.category === 'Sorting')).toBe(true);

      const target = courseStore.getCourseById('sorting-101');
      expect(target).toBeDefined();

      expect(courseStore.getLessonStatus('bubble-sort')).toBe('not-started');
      expect(courseStore.getCourseProgress('sorting-101').progressPercent).toBe(0);

      localStorage.setItem(
        'lesson_progress_bubble-sort',
        JSON.stringify({ codelabCompleted: true, hasWatchedVisualizer: true, quizScore: 10, xpAwarded: 100 }),
      );

      expect(courseStore.getLessonStatus('bubble-sort')).toBe('completed');
      expect(courseStore.getLessonQuizScore('bubble-sort')).toBe(10);
      expect(courseStore.getLessonXpEarned('bubble-sort')).toBe(100);
      expect(courseStore.getCourseProgress('sorting-101').progressPercent).toBe(33);
      expect(courseStore.getFirstUncompletedLesson('sorting-101')).toBe('selection-sort');
    });
  });

  describe('Luồng Quiz Backend', () => {
    it('danh mục → bắt đầu quiz → trả lời từng câu → nộp bài → xem kết quả → thoát', async () => {
      const quizStore = useQuizStore();

      await quizStore.loadQuizCatalog();
      expect(quizStore.quizCatalog).toHaveLength(1);
      expect(quizStore.quizCatalog[0].title).toBe('Bubble Sort');
      expect(fetchMock).toHaveBeenCalledWith(`${API_ROOT}/concepts/quiz/all`);

      await quizStore.startBackendQuiz('quiz-1');
      expect(quizStore.isBackendQuizMode).toBe(true);
      expect(quizStore.backendAnswers).toEqual([null, null]);

      quizStore.selectBackendAnswer(1);
      quizStore.nextBackendQuestion();
      expect(quizStore.currentBackendQuestion?.id).toBe('q2');

      quizStore.selectBackendAnswer(0);
      await quizStore.submitBackendQuiz();

      expect(quizStore.backendResult?.passed).toBe(true);
      expect(quizStore.backendResult?.score).toBe(2);
      expect(fetchMock).toHaveBeenCalledWith(
        `${API_ROOT}/concepts/quiz/submit`,
        expect.objectContaining({ body: JSON.stringify({ quizId: 'quiz-1', answers: [1, 0] }) }),
      );

      quizStore.exitBackendQuiz();
      expect(quizStore.isBackendQuizMode).toBe(false);
      expect(quizStore.activeBackendQuiz).toBeNull();
      expect(quizStore.backendAnswers).toEqual([]);
    });

    it('nộp bài với câu bỏ trống → backend vẫn chấm điểm (bỏ trống = -1)', async () => {
      const quizStore = useQuizStore();
      await quizStore.loadQuizCatalog();
      await quizStore.startBackendQuiz('quiz-1');

      quizStore.selectBackendAnswer(1);
      await quizStore.submitBackendQuiz();

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_ROOT}/concepts/quiz/submit`,
        expect.objectContaining({ body: JSON.stringify({ quizId: 'quiz-1', answers: [1, -1] }) }),
      );
      expect(quizStore.backendResult).not.toBeNull();
    });

    it('backend trả 404 khi quiz không tồn tại → store hiển thị lỗi an toàn', async () => {
      fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.endsWith('/concepts/quiz/unknown-id')) return jsonResponse({}, 404);
        return jsonResponse([], 404);
      });

      const quizStore = useQuizStore();
      await quizStore.loadQuizCatalog();

      await quizStore.startBackendQuiz('unknown-id');

      expect(quizStore.isBackendQuizMode).toBe(false);
      expect(quizStore.backendQuizError).toContain('HTTP 404');
      expect(quizStore.activeBackendQuiz).toBeNull();
    });
  });
});
