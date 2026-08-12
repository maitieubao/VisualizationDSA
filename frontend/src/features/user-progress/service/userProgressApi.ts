





const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';
// Chỉ dùng stateless mode khi được cấu hình tường minh (trước đây luôn true → mọi nhánh JWT chết).
const isStateless = import.meta.env.VITE_STATELESS_MODE === 'true';



export interface UserProgressDto {
  totalXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  levelProgressPercent: number;
  badgesEarned: number;
  modulesCompleted: number;
  currentStreak: number;
  completedModuleIds: string[];
  // PR-009 (GM-008): streak là trách nhiệm server — ngày hoạt động THẬT từ DB (UTC),
  // mirror StatelessUserProgressDto.LastActiveDate của backend.
  lastActiveDate?: string;
  badges: {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    earnedAt: string;
  }[];
}

export interface XPSyncPayload {
  amount: number;
  reason: string;
}

export interface XPSyncResult {
  message: string;
  totalXP: number;
  currentLevel: number;
}



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
    const msg = body?.message ?? `HTTP ${response.status}: ${response.statusText}`;
    throw new ApiError(msg, response.status);
  }
  return response.json() as Promise<T>;
}




function getAuthHeaders(token: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}








export async function fetchUserProgress(token: string, userId?: string): Promise<UserProgressDto> {
  if (isStateless) {
    // Người dùng được xác định từ token — userId query không còn được backend tin cậy.
    const response = await fetch(`${API_BASE}/api/v1/concepts/auth/progress`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse<UserProgressDto>(response);
  }
  const response = await fetch(`${API_BASE}/api/v1/users/me/progress`, {
    headers: getAuthHeaders(token),
  });
  return handleResponse<UserProgressDto>(response);
}





export async function syncXPToServer(
  token: string,
  payload: XPSyncPayload,
  userId?: string,
): Promise<XPSyncResult> {
  if (isStateless) {
    const response = await fetch(`${API_BASE}/api/v1/concepts/auth/award-xp`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ amount: payload.amount, reason: payload.reason }),
    });
    return handleResponse<XPSyncResult>(response);
  }
  const response = await fetch(`${API_BASE}/api/v1/users/me/xp`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleResponse<XPSyncResult>(response);
}





export async function markModuleComplete(
  token: string,
  moduleId: string,
): Promise<void> {
  // Luôn persist qua endpoint JWT (UsersController.CompleteModule) —
  // trước đây nhánh stateless return sớm → module không bao giờ được lưu.
  const response = await fetch(`${API_BASE}/api/v1/users/me/modules/${encodeURIComponent(moduleId)}`, {
    method: 'POST',
    headers: getAuthHeaders(token),
  });
  if (!response.ok && response.status !== 204) {
    const body = await response.json().catch(() => null);
    throw new ApiError(body?.message ?? `HTTP ${response.status}`, response.status);
  }
}
