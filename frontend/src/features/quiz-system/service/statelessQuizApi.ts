
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

import { useAuthStore } from '../../auth/store/useAuthStore';

// QZ-008: mọi request đều có AbortSignal.timeout — backend treo không kẹt skeleton vĩnh viễn.
const REQUEST_TIMEOUT_MS = 10000;

/** Lấy access token đang hoạt động từ authStore (QZ-032: bỏ fallback localStorage 'token' vô dụng). */
function getAuthToken(): string | null {
  try {
    return useAuthStore().getAccessToken();
  } catch {
    // Pinia chưa active (test edge) — không có nguồn token nào khác.
    return null;
  }
}

/** Refresh token 1 lần (QZ-025) — thất bại trả null, lỗi gốc giữ nguyên cho caller. */
async function refreshAccessTokenOnce(): Promise<string | null> {
  try {
    return await useAuthStore().refreshAccessToken();
  } catch {
    return null;
  }
}

/** Fetch có timeout — lỗi timeout → Error('timeout') để store hiển thị backendQuizError (QZ-008). */
async function fetchWithTimeout(url: string, init: RequestInit = {}): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(url, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  } catch (err) {
    if (err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError')) {
      throw new Error('timeout');
    }
    throw err;
  }

  // QZ-025: token hết hạn → refreshAccessToken() → retry 1 lần; vẫn fail → báo lỗi HTTP rõ.
  if (response.status === 401) {
    const newToken = await refreshAccessTokenOnce();
    if (newToken) {
      const headers: Record<string, string> = { ...(init.headers as Record<string, string> | undefined) };
      headers['Authorization'] = `Bearer ${newToken}`;
      try {
        response = await fetch(url, { ...init, headers, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
      } catch (err) {
        if (err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError')) {
          throw new Error('timeout');
        }
        throw err;
      }
    }
  }
  return response;
}

/** Fetch → check HTTP status → parse JSON → validate runtime shape (QZ-030). */
async function requestJson<T>(
  url: string,
  init: RequestInit,
  validate: (data: unknown) => T,
): Promise<T> {
  const response = await fetchWithTimeout(url, init);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data: unknown = await response.json();
  return validate(data);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isQuizSummary(value: unknown): value is StatelessQuizSummary {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.title === 'string'
    && typeof value.topic === 'string'
    && typeof value.difficulty === 'string'
    && typeof value.xpReward === 'number'
    && typeof value.questionCount === 'number';
}

function isQuizDetail(value: unknown): value is StatelessQuizDetail {
  if (!isRecord(value)) return false;
  if (typeof value.id !== 'string' || typeof value.title !== 'string') return false;
  if (!Array.isArray(value.questions)) return false;
  return value.questions.every((q) => (
    isRecord(q)
    && typeof q.id === 'string'
    && typeof q.text === 'string'
    && Array.isArray(q.options)
  ));
}

function isAttemptResult(value: unknown): value is StatelessAttemptResult {
  if (!isRecord(value)) return false;
  if (typeof value.score !== 'number' || typeof value.maxScore !== 'number') return false;
  if (typeof value.passed !== 'boolean' || typeof value.xpAwarded !== 'number') return false;
  return Array.isArray(value.questionResults);
}

export interface StatelessQuizSummary {
  id: string;
  title: string;
  topic: string;
  difficulty: string;
  xpReward: number;
  questionCount: number;
}

export interface StatelessQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface StatelessQuizDetail {
  id: string;
  title: string;
  topic: string;
  difficulty: string;
  xpReward: number;
  questions: StatelessQuestion[];
}

export interface StatelessAttemptResult {
  score: number;
  maxScore: number;
  passed: boolean;
  xpAwarded: number;
  questionResults: Array<{
    questionId: string;
    isCorrect: boolean;
    correctIndex: number;
    explanation: string;
  }>;
}

export const statelessQuizApi = {
  async getAllQuizzes(): Promise<StatelessQuizSummary[]> {
    return requestJson(`${BASE_URL}/api/v1/concepts/quiz/all`, {}, (raw) => {
      if (!Array.isArray(raw) || !raw.every(isQuizSummary)) {
        throw new Error('Dữ liệu danh sách quiz không hợp lệ từ máy chủ.');
      }
      return raw;
    });
  },

  async getTopics(): Promise<string[]> {
    return requestJson(`${BASE_URL}/api/v1/concepts/quiz/topics`, {}, (raw) => {
      if (!Array.isArray(raw) || !raw.every((t) => typeof t === 'string')) {
        throw new Error('Dữ liệu danh sách chủ đề không hợp lệ từ máy chủ.');
      }
      return raw;
    });
  },

  async getQuizById(quizId: string, withAnswers = false): Promise<StatelessQuizDetail> {
    // QZ-003: backend mặc định KHÔNG trả đáp án (anti-cheat) — lesson/teacher/admin
    // flow chấm client-side phải yêu cầu `?withAnswers=true` mới nhận correctIndex.
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const query = withAnswers ? '?withAnswers=true' : '';
    return requestJson(
      `${BASE_URL}/api/v1/concepts/quiz/${encodeURIComponent(quizId)}${query}`,
      { headers },
      (raw) => {
        if (!isQuizDetail(raw)) {
          throw new Error('Dữ liệu quiz không hợp lệ từ máy chủ.');
        }
        return raw;
      },
    );
  },

  async getQuizzesByTopic(topic: string): Promise<StatelessQuizDetail[]> {
    return requestJson(
      `${BASE_URL}/api/v1/concepts/quiz/topic/${encodeURIComponent(topic)}`,
      {},
      (raw) => {
        if (!Array.isArray(raw) || !raw.every(isQuizDetail)) {
          throw new Error('Dữ liệu quiz theo chủ đề không hợp lệ từ máy chủ.');
        }
        return raw;
      },
    );
  },

  async submitAttempt(quizId: string, answers: number[], token?: string | null): Promise<StatelessAttemptResult> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return requestJson(
      `${BASE_URL}/api/v1/concepts/quiz/submit`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ quizId, answers }),
      },
      (raw) => {
        if (!isAttemptResult(raw)) {
          throw new Error('Dữ liệu kết quả chấm điểm không hợp lệ từ máy chủ.');
        }
        return raw;
      },
    );
  },
};
