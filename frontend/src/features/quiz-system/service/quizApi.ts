
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

// QZ-036: submit cần timeout dài hơn — 5000ms abort giữa chừng làm mất XP âm thầm.
const SUBMIT_TIMEOUT_MS = 15000;
const HISTORY_TIMEOUT_MS = 5000;

/**
 * Payload khớp StatelessQuizAttemptRequest (QuizFrameDto.cs) của endpoint
 * `/api/v1/concepts/quiz/submit` — `answers` là bắt buộc (QZ-006, QZ-017).
 */
export interface QuizAttemptPayload {
  quizId: string;
  answers: number[];
}

/**
 * Response khớp StatelessQuizAttemptResult — backend tự chấm điểm (threshold 70%)
 * và cấp XP theo chính sách first-pass/improvement, client KHÔNG tự tính.
 */
export interface QuizAttemptResponse {
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

/** Một dòng lịch sử attempt từ GET `/api/v1/concepts/quiz/history`. */
export interface QuizHistoryEntry {
  id: string;
  quizId: string;
  quizTitle: string;
  quizTopic: string;
  score: number;
  maxScore: number;
  passed: boolean;
  attemptedAt: string;
  answers: number[];
}

/**
 * Nộp bài quiz lên server thật (QZ-006): trước đây POST sai URL
 * `/api/v1/quizzes/attempt` → 404 → XP mất âm thầm.
 * - Lỗi HTTP/mạng/timeout: throw kèm thông điệp rõ ràng (QZ-031 — không console.warn rồi trả null).
 * - Retry 1 lần cho lỗi mạng/timeout/5xx; 4xx là lỗi client cố định nên không retry.
 */
export async function submitQuizAttempt(
  payload: QuizAttemptPayload,
  token: string | null,
  retries = 1,
): Promise<QuizAttemptResponse> {
  if (!token) throw new Error('Chưa đăng nhập — không thể đồng bộ điểm quiz lên máy chủ.');

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/concepts/quiz/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          quizId: payload.quizId,
          answers: payload.answers,
        }),
        signal: AbortSignal.timeout(SUBMIT_TIMEOUT_MS),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return (await response.json()) as QuizAttemptResponse;
    } catch (err) {
      lastError = err;
      const message = err instanceof Error ? err.message : '';
      const isClientError = /^HTTP 4\d\d/.test(message);
      if (attempt < retries && !isClientError) continue;
      throw err;
    }
  }
  throw lastError;
}

/**
 * Lịch sử quiz — QZ-035: URL sai cũ `/quizzes/history` → sửa thành
 * `/concepts/quiz/history` (backend có sẵn, StatelessQuizController.GetHistory).
 */
export async function fetchQuizHistory(token: string): Promise<QuizHistoryEntry[] | null> {
  if (!token) return null;
  try {
    const response = await fetch(`${BASE_URL}/api/v1/concepts/quiz/history`, {
      headers: { 'Authorization': `Bearer ${token}` },
      signal: AbortSignal.timeout(HISTORY_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    if (!Array.isArray(data)) return null;
    return data as QuizHistoryEntry[];
  } catch {
    return null;
  }
}
