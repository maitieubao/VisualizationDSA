/**
 * statelessAuthApi.ts — HTTP client cho Stateless Auth endpoints.
 * Giao tiếp với: /api/v1/concepts/auth/* (in-memory, không cần PostgreSQL)
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

// ── Types ─────────────────────────────────────────────────────────────────────

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
}

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
}

// ── Helper ────────────────────────────────────────────────────────────────────

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body: { message?: string } | null = await response.json().catch(() => null);
    throw new Error(body?.message ?? `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

const JSON_HEADERS: HeadersInit = { 'Content-Type': 'application/json' };

// ── API ───────────────────────────────────────────────────────────────────────

export const statelessAuthApi = {
  async register(email: string, username: string, password: string): Promise<StatelessAuthResponse> {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/auth/register`, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ email, username, password }),
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

  async refresh(refreshToken: string, userId?: string): Promise<StatelessAuthResponse> {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/auth/refresh`, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ refreshToken, userId }),
    });
    return handleResponse<StatelessAuthResponse>(res);
  },

  async logout(refreshToken: string): Promise<void> {
    await fetch(`${BASE_URL}/api/v1/concepts/auth/logout`, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ refreshToken }),
    }).catch(() => { /* logout luôn success ở client */ });
  },

  async getMe(userId?: string): Promise<StatelessUserDto> {
    const params = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const res = await fetch(`${BASE_URL}/api/v1/concepts/auth/me${params}`);
    return handleResponse<StatelessUserDto>(res);
  },

  async getProgress(userId?: string): Promise<StatelessUserProgress> {
    const params = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const res = await fetch(`${BASE_URL}/api/v1/concepts/auth/progress${params}`);
    return handleResponse<StatelessUserProgress>(res);
  },

  async updateProfile(userId: string, username: string, nickname?: string, bio?: string, university?: string): Promise<StatelessUserDto> {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/auth/profile`, {
      method: 'PUT',
      headers: JSON_HEADERS,
      body: JSON.stringify({ userId, username, nickname, bio, university }),
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

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/auth/change-password`, {
      method: 'PUT',
      headers: JSON_HEADERS,
      body: JSON.stringify({ userId, currentPassword, newPassword }),
    });
    return handleResponse<{ message: string }>(res);
  },
};
