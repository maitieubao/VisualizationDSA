import { useAuthStore } from '../../auth/store/useAuthStore';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

/**
 * Lấy token xác thực theo đúng cơ chế của app:
 * ưu tiên `useAuthStore().getAccessToken()` (UI login dùng statelessLogin → token trong ref),
 * fallback localStorage 'token' (tương thích dữ liệu cũ/test).
 * Lưu ý: app KHÔNG ghi key 'token' — dùng localStorage thuần sẽ luôn trả null.
 */
export function getLessonAuthToken(): string | null {
  try {
    const fromStore = useAuthStore().getAccessToken();
    if (fromStore) return fromStore;
  } catch {
    // Pinia chưa active (test edge) — fallback localStorage
  }
  return localStorage.getItem('token');
}

export interface LessonProgressPayload {
  lessonId: string;
  hasWatchedVisualizer: boolean;
  quizScore: number | null;
  bestScore: number;
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

export interface LessonDetailResponse {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  contentMd: string;
  sandboxType: string;
  sandboxConfig: string;
  quizId: string | null;
  xpReward: number;
  orderIndex: number;
  status: string;
  lastActiveFrameIndex: number;
  lastScrollPercent: number;
}

/** Tải chi tiết bài học từ backend (nội dung, sandbox, quiz liên kết). */
export async function fetchLessonDetail(lessonId: string): Promise<LessonDetailResponse> {
  const token = getLessonAuthToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api/v1/concepts/lessons/${encodeURIComponent(lessonId)}`, { headers });
  if (!res.ok) throw new Error(`Failed to fetch lesson detail: ${res.status}`);
  return res.json() as Promise<LessonDetailResponse>;
}




export async function fetchLessonProgress(lessonId: string) {
  const token = getLessonAuthToken();
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
  const token = getLessonAuthToken();
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
      // bestScore truyền từ store (giữ giá trị cao nhất) — KHÔNG ghi đè bằng điểm hiện tại.
      bestScore: payload.bestScore,
      codelabCompleted: payload.codelabCompleted,
      xpAwarded: payload.xpAwarded
    }),
  });
  if (!res.ok) throw new Error(`Failed to save progress: ${res.status}`);
  return true;
}




export async function awardXp(amount: number, reason: string = 'Hoàn thành nhiệm vụ bài học') {
  const token = getLessonAuthToken();
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
