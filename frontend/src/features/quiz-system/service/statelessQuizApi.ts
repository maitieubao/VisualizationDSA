/**
 * statelessQuizApi.ts — Frontend service for stateless quiz backend endpoints.
 * Calls /api/v1/concepts/quiz/* which works WITHOUT database.
 * Vietnamese quiz bank with DSA/OOP/SOLID/Patterns/DI topics.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

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
  /** Fetch all quizzes (summary only, no questions) */
  async getAllQuizzes(): Promise<StatelessQuizSummary[]> {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/quiz/all`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  /** Fetch available topics */
  async getTopics(): Promise<string[]> {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/quiz/topics`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  /** Fetch quiz by ID (includes questions with correct answers) */
  async getQuizById(quizId: string): Promise<StatelessQuizDetail> {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/quiz/${encodeURIComponent(quizId)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  /** Fetch quizzes by topic */
  async getQuizzesByTopic(topic: string): Promise<StatelessQuizDetail[]> {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/quiz/topic/${encodeURIComponent(topic)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  /** Submit quiz answers and get graded result */
  async submitAttempt(quizId: string, answers: number[], token?: string | null): Promise<StatelessAttemptResult> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${BASE_URL}/api/v1/concepts/quiz/submit`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ quizId, answers }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
};
