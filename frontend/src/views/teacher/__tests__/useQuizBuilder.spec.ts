// @vitest-environment jsdom
// TC-043t (P3): CONTRACT SPEC cho useQuizBuilder.
//  - QuizBuilder CRUD chuyển sang /api/v1/concepts/quiz/manage (TC-001) — không còn /api/v1/quizzes.
//  - Token từ auth store (TC-006) — không đọc localStorage.
//  - Typed 100% — không dùng `any`.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const authMocks = vi.hoisted(() => ({
  getAccessToken: () => 'teacher-token',
  refreshAccessToken: vi.fn(),
  impersonate: vi.fn(),
}));

vi.mock('../../../features/auth/store/useAuthStore', () => ({
  useAuthStore: () => ({
    getAccessToken: authMocks.getAccessToken,
    refreshAccessToken: authMocks.refreshAccessToken,
    impersonate: authMocks.impersonate,
  }),
}));

import { useQuizBuilder } from '../useQuizBuilder';

const BASE_URL = 'http://localhost:5055';

interface FetchCall {
  url: string;
  init?: RequestInit;
}

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return { ok, status, statusText: ok ? 'OK' : 'Error', json: async () => body } as unknown as Response;
}

function parseBody(init: RequestInit | undefined): Record<string, unknown> {
  return JSON.parse(String(init?.body)) as Record<string, unknown>;
}

function headersOf(init: RequestInit | undefined): Record<string, string> | undefined {
  return init?.headers as Record<string, string> | undefined;
}

function getCalls(fetchMock: ReturnType<typeof vi.fn>): FetchCall[] {
  return (fetchMock.mock.calls as [string, RequestInit?][]).map(([url, init]) => ({ url, init }));
}

let fetchMock: ReturnType<typeof vi.fn>;

function stubFetch(): void {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
}

describe('useQuizBuilder — Contract Spec (TC-043t)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    stubFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loadQuizzes: GET /api/v1/concepts/quiz/all + Bearer store + nạp quizzesList/topics (TC-001)', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ quizzes: [
      { id: 'q1', title: 'Sorting', topic: 'sorting', difficulty: 1 },
      { id: 'q2', title: 'Graph', topic: 'graph', difficulty: 2 },
      { id: 'q3', title: 'Sorting 2', topic: 'sorting', difficulty: 3 },
    ] }));

    const builder = useQuizBuilder();
    await builder.loadQuizzes();

    const calls = getCalls(fetchMock);
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe(`${BASE_URL}/api/v1/concepts/quiz/all`);
    expect(calls[0].init?.method ?? 'GET').toBe('GET');
    expect(headersOf(calls[0].init)?.['Authorization']).toBe('Bearer teacher-token');
    expect(builder.quizzesList.value).toHaveLength(3);
    expect(builder.topics.value).toEqual(['graph', 'sorting']);
  });

  it('loadQuizQuestions: GET /api/v1/concepts/quiz/{id}?withAnswers=true (TC-001)', async () => {
    fetchMock.mockResolvedValue(jsonResponse([
      { id: 'qs1', text: 'Q?', options: ['A', 'B'], correctIndex: 0 },
    ]));

    const builder = useQuizBuilder();
    await builder.loadQuizQuestions('q1');

    const calls = getCalls(fetchMock);
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe(`${BASE_URL}/api/v1/concepts/quiz/q1?withAnswers=true`);
    expect(headersOf(calls[0].init)?.['Authorization']).toBe('Bearer teacher-token');
    expect(builder.quizQuestions['q1']).toHaveLength(1);
    expect(builder.loadingQuizQuestions['q1']).toBe(false);
  });

  it('createQuiz: POST /api/v1/concepts/quiz/manage + payload deep-equal (TC-035)', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ message: 'Created' }))
      .mockResolvedValueOnce(jsonResponse({ quizzes: [] }));

    const payload = {
      title: 'Sorting Basics',
      topic: 'sorting',
      difficulty: 2,
      xpReward: 50,
      questions: [
        { id: 'custom-q1', text: 'Q?', options: ['A', 'B', 'C', 'D'], correctIndex: 2, explanation: '' },
      ],
    };

    const builder = useQuizBuilder();
    await builder.createQuiz(payload);

    const calls = getCalls(fetchMock);
    const postCall = calls.find((c) => c.init?.method === 'POST');
    expect(postCall).toBeTruthy();
    expect(postCall!.url).toBe(`${BASE_URL}/api/v1/concepts/quiz/manage`);
    expect(postCall!.init?.method).toBe('POST');
    expect(headersOf(postCall!.init)?.['Authorization']).toBe('Bearer teacher-token');
    expect(parseBody(postCall!.init)).toEqual(payload);
  });

  it('updateQuiz: PUT /api/v1/concepts/quiz/manage/{id} + payload', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ message: 'Updated' }))
      .mockResolvedValueOnce(jsonResponse({ quizzes: [] }));

    const payload = { title: 'Updated', topic: 'graph', questions: [] };

    const builder = useQuizBuilder();
    await builder.updateQuiz('q1', payload);

    const calls = getCalls(fetchMock);
    const putCall = calls.find((c) => c.init?.method === 'PUT');
    expect(putCall).toBeTruthy();
    expect(putCall!.url).toBe(`${BASE_URL}/api/v1/concepts/quiz/manage/q1`);
    expect(parseBody(putCall!.init)).toEqual(payload);
  });

  it('deleteQuiz: DELETE /api/v1/concepts/quiz/manage/{id} + xóa khỏi danh sách khi ok', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ success: true }));

    const builder = useQuizBuilder();
    builder.quizzesList.value = [
      { id: 'q1', title: 'A', topic: 'sorting' },
      { id: 'q2', title: 'B', topic: 'graph' },
    ];
    await builder.deleteQuiz('q1');

    const calls = getCalls(fetchMock);
    const deleteCall = calls.find((c) => c.init?.method === 'DELETE');
    expect(deleteCall).toBeTruthy();
    expect(deleteCall!.url).toBe(`${BASE_URL}/api/v1/concepts/quiz/manage/q1`);
    expect(builder.quizzesList.value.map((q: { id: string }) => q.id)).toEqual(['q2']);
  });

  it('addQuestionToQuiz: POST /api/v1/concepts/quiz/manage/{quizId}/questions + payload', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ success: true }))
      .mockResolvedValueOnce(jsonResponse([]));

    const questionData = { question: 'Q?', options: ['A', 'B'], correctIndex: 1, explanation: '' };

    const builder = useQuizBuilder();
    await builder.addQuestionToQuiz('q1', questionData);

    const calls = getCalls(fetchMock);
    const postCall = calls.find((c) => c.init?.method === 'POST');
    expect(postCall).toBeTruthy();
    expect(postCall!.url).toBe(`${BASE_URL}/api/v1/concepts/quiz/manage/q1/questions`);
    expect(parseBody(postCall!.init)).toEqual(questionData);
  });

  it('deleteQuestion: DELETE /api/v1/concepts/quiz/manage/{quizId}/questions/{questionId}', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ success: true }))
      .mockResolvedValueOnce(jsonResponse([]));

    const builder = useQuizBuilder();
    await builder.deleteQuestion('q1', 'qs1');

    const calls = getCalls(fetchMock);
    const deleteCall = calls.find((c) => c.init?.method === 'DELETE');
    expect(deleteCall).toBeTruthy();
    expect(deleteCall!.url).toBe(`${BASE_URL}/api/v1/concepts/quiz/manage/q1/questions/qs1`);
  });

  it('createQuiz 401 → refreshAccessToken → retry với Bearer mới (TC-013/TC-038)', async () => {
    authMocks.refreshAccessToken.mockResolvedValueOnce('fresh-token');
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ message: 'Token expired' }, false, 401))
      .mockResolvedValueOnce(jsonResponse({ message: 'Created' }))
      .mockResolvedValueOnce(jsonResponse({ quizzes: [] }));

    const builder = useQuizBuilder();
    await builder.createQuiz({ title: 'Retry Quiz', topic: 'sorting', questions: [] });

    const calls = getCalls(fetchMock);
    const postCalls = calls.filter((c) => c.init?.method === 'POST');
    expect(postCalls).toHaveLength(2);
    expect(headersOf(postCalls[1].init)?.['Authorization']).toBe('Bearer fresh-token');
    expect(authMocks.refreshAccessToken).toHaveBeenCalledTimes(1);
  });
});
