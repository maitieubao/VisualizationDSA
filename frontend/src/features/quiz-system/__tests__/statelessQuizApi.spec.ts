import { describe, it, expect, vi, afterEach } from 'vitest';
import { statelessQuizApi } from '../service/statelessQuizApi';
import type { StatelessQuizSummary, StatelessQuizDetail, StatelessAttemptResult } from '../service/statelessQuizApi';

const BASE_URL = 'http://localhost:5055/api/v1';

function mockFetchResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body,
  } as unknown as Response;
}

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
    {
      id: 'q1',
      text: 'Độ phức tạp worst-case của Bubble Sort?',
      options: ['O(n)', 'O(n²)', 'O(log n)'],
      correctIndex: 1,
      explanation: 'Worst case là O(n²).',
    },
  ],
};

const mockResult: StatelessAttemptResult = {
  score: 1,
  maxScore: 1,
  passed: true,
  xpAwarded: 100,
  questionResults: [
    { questionId: 'q1', isCorrect: true, correctIndex: 1, explanation: 'Chính xác!' },
  ],
};

describe('statelessQuizApi — Quiz Không Trạng Thái (Backend)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getAllQuizzes', () => {
    it('gọi GET /concepts/quiz/all và trả danh sách quiz', async () => {
      const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse([mockSummary]));
      vi.stubGlobal('fetch', fetchMock);

      const result = await statelessQuizApi.getAllQuizzes();

      expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/concepts/quiz/all`, expect.anything());
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockSummary);
    });

    it('ném lỗi chứa mã HTTP khi server trả về 500', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockFetchResponse({}, false, 500)));

      await expect(statelessQuizApi.getAllQuizzes()).rejects.toThrow('HTTP 500');
    });
  });

  describe('getTopics', () => {
    it('gọi GET /concepts/quiz/topics và trả danh sách chủ đề', async () => {
      const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(['Sorting', 'Searching']));
      vi.stubGlobal('fetch', fetchMock);

      const result = await statelessQuizApi.getTopics();

      expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/concepts/quiz/topics`, expect.anything());
      expect(result).toEqual(['Sorting', 'Searching']);
    });
  });

  describe('getQuizById', () => {
    it('gọi GET /concepts/quiz/{id} và trả chi tiết quiz', async () => {
      const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(mockDetail));
      vi.stubGlobal('fetch', fetchMock);

      const result = await statelessQuizApi.getQuizById('quiz-1');

      // Fetch giờ kèm options headers (gửi token để nhận đáp án khi đã đăng nhập).
      expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/concepts/quiz/quiz-1`, expect.objectContaining({ headers: expect.anything() }));
      expect(result.questions).toHaveLength(1);
    });

    it('encode quizId chứa ký tự đặc biệt trước khi gọi', async () => {
      const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(mockDetail));
      vi.stubGlobal('fetch', fetchMock);

      await statelessQuizApi.getQuizById('quiz id/1');

      expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/concepts/quiz/quiz%20id%2F1`, expect.objectContaining({ headers: expect.anything() }));
    });
  });

  describe('getQuizzesByTopic', () => {
    it('gọi GET /concepts/quiz/topic/{topic} và trả danh sách quiz', async () => {
      const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse([mockDetail]));
      vi.stubGlobal('fetch', fetchMock);

      const result = await statelessQuizApi.getQuizzesByTopic('Sorting');

      expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/concepts/quiz/topic/Sorting`, expect.anything());
      expect(result).toHaveLength(1);
    });
  });

  describe('submitAttempt', () => {
    it('POST /concepts/quiz/submit với payload { quizId, answers }', async () => {
      const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(mockResult));
      vi.stubGlobal('fetch', fetchMock);

      const result = await statelessQuizApi.submitAttempt('quiz-1', [1]);

      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE_URL}/concepts/quiz/submit`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ quizId: 'quiz-1', answers: [1] }),
        }),
      );
      expect(result.passed).toBe(true);
      expect(result.xpAwarded).toBe(100);
    });

    it('đính kèm Authorization header khi có token', async () => {
      const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(mockResult));
      vi.stubGlobal('fetch', fetchMock);

      await statelessQuizApi.submitAttempt('quiz-1', [1], 'jwt-token');

      const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(init.headers).toEqual({
        'Content-Type': 'application/json',
        Authorization: 'Bearer jwt-token',
      });
    });

    it('không đính kèm Authorization header khi thiếu token', async () => {
      const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(mockResult));
      vi.stubGlobal('fetch', fetchMock);

      await statelessQuizApi.submitAttempt('quiz-1', [1], null);

      const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
    });

    it('ném lỗi khi backend từ chối bài làm (401)', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockFetchResponse({}, false, 401)));

      await expect(statelessQuizApi.submitAttempt('quiz-1', [1])).rejects.toThrow('HTTP 401');
    });
  });
});
