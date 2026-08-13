import { useAuthStore } from '../../auth/store/useAuthStore';
import type { CodeLabTask } from '../types/lesson.types';

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
  /** Thang 0..100 (percent) — backend clamp 0..100 và hiểu là % (LM-021). */
  quizScore: number | null;
  bestScore: number;
  quizPassed: boolean;
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
  /** Id codelab teacher gắn (A1.1) — null khi chưa gắn. */
  codelabId?: string | null;
  /** Payload codelab đầy đủ (title/task/testcases) do backend trả kèm (A1.2) — bài không gắn sẽ là null. */
  codelabTask?: CodeLabTask | null;
  /** Trạng thái xuất bản bài học (A1.2). */
  publishStatus?: string;
}

/**
 * A2: chuẩn hoá payload codelab BACKEND (field `codelab` — PascalCase từ lesson GET)
 * về shape `CodeLabTask` chuẩn mà bước 4 Lesson Step dùng:
 * • testCases → camelCase (input/expectedOutput/isHidden)
 * • hints (objects {content,...}) → string[]
 * • difficulty int (1..3) → nhãn VN ("Cơ bản"/"Trung bình"/"Nâng cao")
 * • entryFunction null → bỏ qua để caller fallback "solution"
 */
function normalizeBackendCodelab(raw: unknown): CodeLabTask | null {
  if (!raw || typeof raw !== 'object') return null;
  const c = raw as Record<string, unknown>;

  const testCasesRaw = Array.isArray(c.testCases) ? c.testCases : [];
  const testCases = testCasesRaw.map((tc) => {
    const t = tc as Record<string, unknown>;
    return {
      input: String(t.input ?? t.Input ?? ''),
      expectedOutput: String(t.expectedOutput ?? t.ExpectedOutput ?? ''),
      isHidden: Boolean(t.isHidden ?? t.IsHidden ?? false),
    };
  });

  const hintsRaw = Array.isArray(c.hints) ? c.hints : [];
  const hints = hintsRaw
    .map((h) => {
      const o = h as Record<string, unknown>;
      return String(o.content ?? '');
    })
    .filter((s) => s.length > 0);

  const difficultyNum = typeof c.difficulty === 'number' ? c.difficulty : -1;
  const difficulty =
    difficultyNum >= 3 ? 'Nâng cao' : difficultyNum === 2 ? 'Trung bình' : 'Cơ bản';

  return {
    description: String(c.description ?? c.Description ?? ''),
    initialCode: String(c.initialCode ?? c.InitialCode ?? ''),
    solution: '',
    testCases,
    entryFunction: typeof c.entryFunction === 'string' && c.entryFunction ? c.entryFunction : undefined,
    hints,
    difficulty,
    timeLimitMs: typeof c.timeLimitMs === 'number' ? c.timeLimitMs : undefined,
  };
}

/** Tải chi tiết bài học từ backend (nội dung, sandbox, quiz liên kết). */
export async function fetchLessonDetail(lessonId: string): Promise<LessonDetailResponse> {
  const token = getLessonAuthToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api/v1/concepts/lessons/${encodeURIComponent(lessonId)}`, { headers });
  if (!res.ok) {
    const error = new Error(`Failed to fetch lesson detail: ${res.status}`);
    // Gắn status để store phân biệt 403 Premium với lỗi mạng.
    (error as { status?: number }).status = res.status;
    throw error;
  }
  const data = await res.json() as LessonDetailResponse & { codelab?: unknown };
  // A1.2: chuẩn hoá field codelab — bài không gắn luôn trả null (không undefined)
  // để store phân biệt "không gắn" với "backend chưa hỗ trợ".
  // A2: backend trả field `codelab` (PascalCase shape) → map sang codelabTask chuẩn FE.
  return {
    ...data,
    codelabId: data.codelabId ?? null,
    codelabTask: data.codelabTask ?? normalizeBackendCodelab(data.codelab) ?? null,
  };
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
      // quizPassed giúp server đánh dấu Completed đúng rule 70% (không chỉ quizScore>=1).
      quizPassed: payload.quizPassed,
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
