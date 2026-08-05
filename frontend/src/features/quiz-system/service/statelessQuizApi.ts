





const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

import { useAuthStore } from '../../auth/store/useAuthStore';

/** Lấy access token đang hoạt động. */
function getAuthToken(): string | null {
  try {
    const fromStore = useAuthStore().getAccessToken();
    if (fromStore) return fromStore;
  } catch {
    // Pinia chưa active (test edge)
  }
  return localStorage.getItem('token');
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
    const res = await fetch(`${BASE_URL}/api/v1/concepts/quiz/all`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  
  async getTopics(): Promise<string[]> {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/quiz/topics`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  
  async getQuizById(quizId: string): Promise<StatelessQuizDetail> {
    // Gửi token để nhận đầy đủ đáp án (lesson flow chấm điểm client-side);
    // không có token → backend chỉ trả câu hỏi (ẩn đáp án).
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}/api/v1/concepts/quiz/${encodeURIComponent(quizId)}`, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  
  async getQuizzesByTopic(topic: string): Promise<StatelessQuizDetail[]> {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/quiz/topic/${encodeURIComponent(topic)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  
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
