const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

export interface LessonProgressPayload {
  lessonId: string;
  hasWatchedVisualizer: boolean;
  quizScore: number | null;
  codelabCompleted: boolean;
  xpAwarded: number;
}

export interface LessonProgressResponse {
  success: boolean;
  progress: {
    hasWatchedVisualizer: boolean;
    quizScore: number | null;
    codelabCompleted: boolean;
    xpAwarded: number;
    totalXp: number;
  };
}




export async function fetchLessonProgress(lessonId: string) {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  const res = await fetch(`${API_BASE}/api/v1/concepts/auth/progress/${lessonId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error(`Failed to fetch progress: ${res.status}`);
  return res.json();
}




export async function saveLessonProgress(payload: LessonProgressPayload) {
  const token = localStorage.getItem('token');
  if (!token) return null;

  const res = await fetch(`${API_BASE}/api/v1/concepts/auth/progress/${payload.lessonId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      hasWatchedVisualizer: payload.hasWatchedVisualizer,
      quizScore: payload.quizScore,
      bestScore: payload.quizScore, 
      codelabCompleted: payload.codelabCompleted,
      xpAwarded: payload.xpAwarded
    }),
  });
  if (!res.ok) throw new Error(`Failed to save progress: ${res.status}`);
  return true;
}




export async function awardXp(amount: number, reason: string = 'Hoàn thành nhiệm vụ bài học') {
  const token = localStorage.getItem('token');
  if (!token) return null;

  const res = await fetch(`${API_BASE}/api/v1/concepts/auth/award-xp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ amount, reason }),
  });
  if (!res.ok) throw new Error(`Failed to award XP: ${res.status}`);
  return res.json();
}
