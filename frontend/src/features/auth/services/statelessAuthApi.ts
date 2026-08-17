




const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

import { useAuthStore } from '../store/useAuthStore';



export interface StatelessUserDto {
  id:           string;
  email:        string;
  username:     string;
  totalXP:      number;
  currentLevel: number;
  streakDays:   number;
  createdAt:    string;
  badges:       StatelessBadgeInfo[];
  isPremium:    boolean;
  role:         'Student' | 'Teacher' | 'Admin';
  nickname?:    string;
  bio?:         string;
  university?:  string;
  // PR-005: avatar upload (PB-103) — URL ảnh đã lưu, null nếu chưa có.
  avatarUrl?:   string;
}

// PR-005: key lưu avatar cục bộ — dùng khi upload xong mà backend chưa persist avatarUrl
// (UpdateProfile store chưa nhận avatarUrl) — loadStatelessProfile sẽ overlay giá trị này.
export const AVATAR_URL_STORAGE_KEY = 'avatar_url';

export interface StatelessBadgeInfo {
  id:          string;
  name:        string;
  description: string;
  icon:        string;
  color:       string;
  earnedAt:    string;
}

export interface StatelessAuthResponse {
  accessToken:  string;
  refreshToken: string;
  expiresIn:    number;
  user:         StatelessUserDto;
}

export interface StatelessUserProgress {
  totalXP:              number;
  currentLevel:         number;
  xpToNextLevel:        number;
  levelProgressPercent: number;
  badgesEarned:         number;
  modulesCompleted:     number;
  currentStreak:        number;
  completedModuleIds:   string[];
  badges:               StatelessBadgeInfo[];
  isPremium:            boolean;
  // PR-009 (GM-008): ngày hoạt động THẬT từ server (UTC) — mirror StatelessUserProgressDto.
  lastActiveDate?:      string;
}



async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body: { message?: string } | null = await response.json().catch(() => null);
    const error = new Error(body?.message ?? `HTTP ${response.status}: ${response.statusText}`);
    // Gắn HTTP status để caller phân biệt lỗi auth (401/403) với lỗi mạng/5xx.
    (error as { status?: number }).status = response.status;
    throw error;
  }
  return response.json() as Promise<T>;
}

const JSON_HEADERS: HeadersInit = { 'Content-Type': 'application/json' };

/**
 * Lấy access token đang hoạt động để gắn vào request cần xác thực.
 * Backend xác định người dùng từ token (KHÔNG tin userId client gửi — chống IDOR).
 */
function getAuthToken(): string | null {
  try {
    const fromStore = useAuthStore().getAccessToken();
    if (fromStore) return fromStore;
  } catch {
    // Pinia chưa active (test edge)
  }
  // AU-045: bỏ fallback localStorage 'token' — token chỉ tồn tại trong store (getAccessToken).
  return null;
}

function authHeaders(): HeadersInit {
  const token = getAuthToken();
  return token ? { ...JSON_HEADERS, 'Authorization': `Bearer ${token}` } : JSON_HEADERS;
}



export const statelessAuthApi = {
  async register(email: string, username: string, password: string, isTeacher = false): Promise<StatelessAuthResponse> {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/auth/register`, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ email, username, password, isTeacher }),
    });
    return handleResponse<StatelessAuthResponse>(res);
  },

  async login(email: string, password: string): Promise<StatelessAuthResponse> {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/auth/login`, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<StatelessAuthResponse>(res);
  },

  // AU-055: backend xác định user từ token — body CHỈ chứa {refreshToken}, KHÔNG gửi userId.
  async refresh(refreshToken: string): Promise<StatelessAuthResponse> {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/auth/refresh`, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ refreshToken }),
    });
    return handleResponse<StatelessAuthResponse>(res);
  },

  async logout(refreshToken: string): Promise<void> {
    await fetch(`${BASE_URL}/api/v1/concepts/auth/logout`, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {  });
  },

  async getMe(): Promise<StatelessUserDto> {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/auth/me`, { headers: authHeaders() });
    return handleResponse<StatelessUserDto>(res);
  },

  async getProgress(): Promise<StatelessUserProgress> {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/auth/progress`, { headers: authHeaders() });
    return handleResponse<StatelessUserProgress>(res);
  },

  async updateProfile(username: string, nickname?: string, bio?: string, university?: string): Promise<StatelessUserDto> {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/auth/profile`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ username, nickname, bio, university }),
    });
    return handleResponse<StatelessUserDto>(res);
  },

  async getDemoCredentials(): Promise<{ email: string; password: string; message: string }> {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/auth/demo-credentials`);
    return handleResponse<{ email: string; password: string; message: string }>(res);
  },

  async impersonateUser(userId: string, adminToken: string): Promise<StatelessAuthResponse> {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/admin/users/${encodeURIComponent(userId)}/impersonate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
    });
    return handleResponse<StatelessAuthResponse>(res);
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/auth/change-password`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return handleResponse<{ message: string }>(res);
  },
};
