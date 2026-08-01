







const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';


export interface QuizAttemptPayload {
  /** ID của quiz câu hỏi (từ QuizQuestion.id) */
  quizId: string;
  /** Đáp án đã chọn cho từng câu hỏi (dựa trên chỉ số options) */
  answers: number[];
  

  
  score:     number;
  
  maxScore:  number;
  
  passed:    boolean;
}


export interface QuizAttemptResponse {
  success: boolean;
  xpAwarded?: number;
  message?: string;
}

/**
 * Gửi kết quả quiz session lên server.
 * Gọi sau khi user hoàn thành một checkpoint quiz.
 *
 * @param quizId — ID của quiz
 * @param answers — Mảng chỉ số đáp án đã chọn cho từng câu hỏi trong session
 * @param token — JWT access token (lấy từ useAuthStore)
 * @returns QuizAttemptResponse nếu thành công, null nếu offline/unauthenticated
 */








export async function submitQuizAttempt(
  quizId: string,
  answers: number[],
  token: string | null,
): Promise<QuizAttemptResponse | null> {
  
  if (!token) return null;

  try {
    const response = await fetch(`${BASE_URL}/api/v1/quizzes/attempt`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        quizId,
        answers,
      }),
      
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.warn(`[quizApi] submitQuizAttempt: HTTP ${response.status}`);
      return null;
    }

    return (await response.json()) as QuizAttemptResponse;
  } catch (err) {
    
    console.warn('[quizApi] submitQuizAttempt failed (offline?):', err);
    return null;
  }
}





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
