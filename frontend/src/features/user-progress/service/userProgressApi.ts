/**
 * userProgressApi.ts — Client HTTP duy nhất giao tiếp với backend về tiến trình học tập.
 * Thiết kế: Frontend tính XP local (XPEngine) → sync lên server định kỳ
 * Backend là nguồn truth duy nhất cho multi-device persistence.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

// ── Types (mirror backend DTOs) ──────────────────────────────────────────────

export interface UserProgressDto {
  totalXP:             number;
  currentLevel:        number;
  xpToNextLevel:       number;
  levelProgressPercent: number;
  badgesEarned:        number;
  modulesCompleted:    number;
  currentStreak:       number;
  completedModuleIds:  string[];
  badges: {
    id:          string;
    name:        string;
    description: string;
    icon:        string;
    color:       string;
    earnedAt:    string;
  }[];
}

export interface XPSyncPayload {
  amount: number;
  reason: string;
}

export interface XPSyncResult {
  message:      string;
  totalXP:      number;
  currentLevel: number;
}

// ── Custom Error with HTTP status ────────────────────────────────────────────

export class ApiError extends Error {
  public readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const msg  = body?.message ?? `HTTP ${response.status}: ${response.statusText}`;
    throw new ApiError(msg, response.status);
  }
  return response.json() as Promise<T>;
}


// ── Helper ───────────────────────────────────────────────────────────────────

function getAuthHeaders(token: string): HeadersInit {
  return {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

// ── API Calls ─────────────────────────────────────────────────────────────────


/**
 * Lấy tiến trình đầy đủ từ server khi đăng nhập.
 * Dùng để hydrate XPEngine local với data từ DB.
 */
export async function fetchUserProgress(token: string): Promise<UserProgressDto> {
  const response = await fetch(`${API_BASE}/api/v1/users/me/progress`, {
    headers: getAuthHeaders(token),
  });
  return handleResponse<UserProgressDto>(response);
}

/**
 * Sync XP event lên server sau khi tính local.
 * Gọi sau mỗi sự kiện: hoàn thành quiz, xem lecture xong, v.v.
 */
export async function syncXPToServer(
  token:   string,
  payload: XPSyncPayload,
): Promise<XPSyncResult> {
  const response = await fetch(`${API_BASE}/api/v1/users/me/xp`, {
    method:  'POST',
    headers: getAuthHeaders(token),
    body:    JSON.stringify(payload),
  });
  return handleResponse<XPSyncResult>(response);
}

/**
 * Đánh dấu một module đã hoàn thành.
 * Gọi khi user hoàn thành một bài giảng hoặc module DSA.
 */
export async function markModuleComplete(
  token:    string,
  moduleId: string,
): Promise<void> {
  const response = await fetch(`${API_BASE}/api/v1/users/me/modules/${encodeURIComponent(moduleId)}`, {
    method:  'POST',
    headers: getAuthHeaders(token),
  });
  if (!response.ok && response.status !== 204) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `HTTP ${response.status}`);
  }
}
