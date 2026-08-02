







const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';


export interface QuizAttemptPayload {
  
  quizId:    string;
  
  score:     number;
  
  maxScore:  number;
  
  passed:    boolean;
}


export interface QuizAttemptResponse {
  success:  boolean;
  xpAwarded?: number;
  message?: string;
}









export async function submitQuizAttempt(
  payload:   QuizAttemptPayload,
  token:     string | null,
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
        quizId:   payload.quizId,
        score:    payload.score,
        maxScore: payload.maxScore,
        passed:   payload.passed,
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
