// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import {
  fetchLessonDetail,
  fetchLessonProgress,
  saveLessonProgress,
  awardXp,
  type LessonProgressPayload,
} from '../services/lessonApi';

const fetchMock = vi.fn();

function lastFetchCall(): [string, RequestInit] {
  const call = fetchMock.mock.calls[fetchMock.mock.calls.length - 1] as [string, RequestInit];
  return call;
}

describe('lessonApi — contract giao tiếp backend lessons (LM-018)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    localStorage.setItem('token', 'token-abc');
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetchLessonDetail: URL đúng /api/v1/concepts/lessons/{id} + Bearer header', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'lesson-1', title: 'T' }) });

    const detail = await fetchLessonDetail('lesson-1');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = lastFetchCall();
    expect(url).toContain('/api/v1/concepts/lessons/lesson-1');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer token-abc');
    expect(detail.id).toBe('lesson-1');
  });

  it('fetchLessonDetail: encodeURIComponent cho id chứa ký tự đặc biệt', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    await fetchLessonDetail('a b/c');

    const [url] = lastFetchCall();
    expect(url).toContain('/api/v1/concepts/lessons/a%20b%2Fc');
  });

  it('fetchLessonDetail: 403 lan truyền kèm status để store phân biệt Premium', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 403 });

    await expect(fetchLessonDetail('premium-lesson')).rejects.toMatchObject({ status: 403 });
  });

  it('fetchLessonDetail: 404 lan truyền kèm status', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 404 });

    await expect(fetchLessonDetail('missing-lesson')).rejects.toMatchObject({ status: 404 });
  });

  it('fetchLessonDetail: giữ nguyên codelabId + codelabTask từ payload backend (A1.2)', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({
      id: 'lesson-cl-1',
      title: 'Bubble Sort',
      codelabId: 'cl-abc',
      codelabTask: { description: 'Task gắn thật', initialCode: 'x', solution: 'x', testCases: [] },
    }) });

    const detail = await fetchLessonDetail('lesson-cl-1') as unknown as {
      codelabId: string;
      codelabTask: { description: string } | null;
    };
    expect(detail.codelabId).toBe('cl-abc');
    expect(detail.codelabTask?.description).toBe('Task gắn thật');
  });

  it('fetchLessonDetail: bài không gắn codelab → chuẩn hoá codelabId null + codelabTask null (A1.2)', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'plain-lesson', title: 'Lý thuyết' }) });

    const detail = await fetchLessonDetail('plain-lesson') as unknown as {
      codelabId: string | null;
      codelabTask: unknown;
    };
    expect(detail.codelabId).toBeNull();
    expect(detail.codelabTask).toBeNull();
  });

  it('fetchLessonDetail: backend trả field `codelab` (PascalCase) → map sang codelabTask chuẩn FE (A2.3)', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({
      id: 'lesson-cl-2',
      title: 'Bubble Sort',
      codelabId: 'cl-2',
      codelab: {
        codelabId: 'cl-2',
        Title: 'Bubble Sort',
        Description: 'Sắp xếp nổi bọt',
        InitialCode: 'function solution(arr) { return arr; }',
        entryFunction: null,
        timeLimitMs: 1500,
        Difficulty: 1,
        testCases: [
          { Input: '[[5, 2, 9]]', ExpectedOutput: '[2, 5, 9]', IsHidden: false },
          { Input: '[[1]]', ExpectedOutput: '[1]', IsHidden: true },
        ],
        templates: [{ language: 'javascript', starterCode: 'function solution(arr) {}' }],
        hints: [
          { content: 'Dùng hai vòng lặp', isTiered: true, xpCost: 0 },
          { content: 'Đổi chỗ nếu cặp liền kề', isTiered: true, xpCost: 0 },
        ],
      },
    }) });

    const detail = await fetchLessonDetail('lesson-cl-2') as unknown as {
      codelabId: string;
      codelabTask: {
        description: string;
        initialCode: string;
        difficulty: string;
        testCases: { input: string; expectedOutput: string; isHidden: boolean }[];
        hints: string[];
      };
    };
    expect(detail.codelabId).toBe('cl-2');
    expect(detail.codelabTask).not.toBeNull();
    expect(detail.codelabTask.description).toBe('Sắp xếp nổi bọt');
    expect(detail.codelabTask.initialCode).toContain('function solution');
    expect(detail.codelabTask.difficulty).toBe('Cơ bản');
    expect(detail.codelabTask.testCases[0]).toEqual({ input: '[[5, 2, 9]]', expectedOutput: '[2, 5, 9]', isHidden: false });
    expect(detail.codelabTask.testCases[1].isHidden).toBe(true);
    expect(detail.codelabTask.hints).toEqual(['Dùng hai vòng lặp', 'Đổi chỗ nếu cặp liền kề']);
  });

  it('saveLessonProgress: POST auth/progress/{lessonId} + payload quizPassed/bestScore/quizScore', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true });

    const payload: LessonProgressPayload = {
      lessonId: 'lesson-1',
      hasWatchedVisualizer: true,
      // LM-021: quizScore truyền theo thang 0..100 (percent) — khớp backend clamp.
      quizScore: 80,
      bestScore: 80,
      quizPassed: true,
      codelabCompleted: false,
      xpAwarded: 50,
    };
    const result = await saveLessonProgress(payload);

    expect(result).toBe(true);
    const [url, init] = lastFetchCall();
    expect(url).toContain('/api/v1/concepts/auth/progress/lesson-1');
    expect(init.method).toBe('POST');
    const headers = init.headers as Record<string, string>;
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['Authorization']).toBe('Bearer token-abc');
    const body = JSON.parse(init.body as string);
    expect(body).toMatchObject({
      hasWatchedVisualizer: true,
      quizScore: 80,
      bestScore: 80,
      quizPassed: true,
      codelabCompleted: false,
      xpAwarded: 50,
    });
  });

  it('saveLessonProgress: payload giữ bestScore cao nhất (không phải quizScore hiện tại)', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true });

    const payload: LessonProgressPayload = {
      lessonId: 'lesson-1',
      hasWatchedVisualizer: true,
      quizScore: 40,
      bestScore: 90,
      quizPassed: false,
      codelabCompleted: true,
      xpAwarded: 100,
    };
    await saveLessonProgress(payload);

    const [, init] = lastFetchCall();
    const body = JSON.parse(init.body as string);
    expect(body.bestScore).toBe(90);
    expect(body.quizScore).toBe(40);
  });

  it('saveLessonProgress: 403 lan truyền lỗi', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 403 });

    const payload: LessonProgressPayload = {
      lessonId: 'lesson-1',
      hasWatchedVisualizer: false,
      quizScore: null,
      bestScore: 0,
      quizPassed: false,
      codelabCompleted: false,
      xpAwarded: 0,
    };
    await expect(saveLessonProgress(payload)).rejects.toThrow();
  });

  it('awardXp: POST auth/award-xp với amount + reason', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ xp: 30 }) });

    await awardXp(30, 'Hoàn thành Quiz: Quick Sort');

    const [url, init] = lastFetchCall();
    expect(url).toContain('/api/v1/concepts/auth/award-xp');
    expect(init.method).toBe('POST');
    const body = JSON.parse(init.body as string);
    expect(body).toMatchObject({ amount: 30, reason: 'Hoàn thành Quiz: Quick Sort' });
  });

  it('fetchLessonProgress: gọi đúng URL auth/progress khi có token', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ hasWatchedVisualizer: true }) });

    const progress = await fetchLessonProgress('lesson-1');

    const [url, init] = lastFetchCall();
    expect(url).toContain('/api/v1/concepts/auth/progress/lesson-1');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer token-abc');
    expect(progress).toMatchObject({ hasWatchedVisualizer: true });
  });
});
