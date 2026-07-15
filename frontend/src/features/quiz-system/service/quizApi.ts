/**
 * quizApi.ts — Bridge giữa quiz-system frontend và QuizzesController backend.
 *
 * ✅ A1 FIX: useQuizStore không còn lưu kết quả chỉ trong localStorage.
 * Sau mỗi quiz session, kết quả được sync lên server qua endpoint này.
 * Nếu user chưa đăng nhập hoặc offline, silently skip (không báo lỗi người dùng).
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

/** Payload gửi lên server khi hoàn thành một checkpoint quiz */
export interface QuizAttemptPayload {
  /** ID của quiz câu hỏi (từ QuizQuestion.id) */
  quizId:    string;
  /** Số câu trả lời đúng trong session */
  score:     number;
  /** Tổng số câu đã trả lời */
  maxScore:  number;
  /** Có vượt qua session không (đúng >= 60%) */
  passed:    boolean;
}

/** Response từ server sau khi submit attempt */
export interface QuizAttemptResponse {
  success:  boolean;
  xpAwarded?: number;
  message?: string;
}

/**
 * Gửi kết quả quiz session lên server.
 * Gọi sau khi user hoàn thành tất cả checkpoints của một bài giảng.
 *
 * @param payload — Kết quả session
 * @param token — JWT access token (lấy từ useAuthStore)
 * @returns QuizAttemptResponse nếu thành công, null nếu offline/unauthenticated
 */
export async function submitQuizAttempt(
  payload:   QuizAttemptPayload,
  token:     string | null,
): Promise<QuizAttemptResponse | null> {
  // Nếu chưa đăng nhập → skip silently (offline-first design)
  if (!token) return null;

  try {
    const response = await fetch(`${BASE_URL}/api/v1/quizzes/attempt`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        quizId:   payload.quizId,
        score:    payload.score,
        maxScore: payload.maxScore,
        passed:   payload.passed,
      }),
      // Timeout 5 giây — không block UX nếu server chậm
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.warn(`[quizApi] submitQuizAttempt: HTTP ${response.status}`);
      return null;
    }

    return (await response.json()) as QuizAttemptResponse;
  } catch (err) {
    // Network lỗi / timeout → silent fail, không làm gián đoạn UX
    console.warn('[quizApi] submitQuizAttempt failed (offline?):', err);
    return null;
  }
}

/**
 * Lấy lịch sử quiz của user hiện tại.
 * @param token — JWT access token
 */
export async function fetchQuizHistory(token: string): Promise<unknown[] | null> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/quizzes/history`, {
      headers: { 'Authorization': `Bearer ${token}` },
      signal:  AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    return (await response.json()) as unknown[];
  } catch {
    return null;
  }
}
