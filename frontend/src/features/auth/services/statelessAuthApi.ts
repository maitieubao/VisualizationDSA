/**
 * statelessAuthApi.ts — Centralized HTTP client for Stateless Auth endpoints.
 * Uses apiClient.ts for consistent error handling, token injection, and base URL.
 * Giao tiếp với: /api/v1/concepts/auth/* (in-memory, không cần PostgreSQL)
 */





import { api } from '@/services/apiClient';
import type { ApiError } from '@/services/apiClient';




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
  hearts:       number;
  maxHearts:    number;
  gemsCount:    number;
  teacherAppStatus: string;
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

// ── API ───────────────────────────────────────────────────────────────────────


async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body: { message?: string } | null = await response.json().catch(() => null);
    throw new Error(body?.message ?? `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

const JSON_HEADERS: HeadersInit = { 'Content-Type': 'application/json' };



function handleError(err: unknown, fallback: string): Error {
    const error = err as ApiError;
  return new Error(error.detail ?? fallback);
}

export const statelessAuthApi = {
  async register(email: string, username: string, password: string): Promise<StatelessAuthResponse> {
    try {
      return await api.post<StatelessAuthResponse>('/concepts/auth/register', { email, username, password });
    } catch (err) {
      throw handleError(err, 'Registration failed');
    }
  },

  async login(email: string, password: string): Promise<StatelessAuthResponse> {
    try {
      return await api.post<StatelessAuthResponse>('/concepts/auth/login', { email, password });
    } catch (err) {
      throw handleError(err, 'Login failed');
    }
  },

  async refresh(refreshToken: string, userId?: string): Promise<StatelessAuthResponse> {
    try {
      return await api.post<StatelessAuthResponse>('/concepts/auth/refresh', { refreshToken, userId });
    } catch (err) {
      throw handleError(err, 'Token refresh failed');
    }
  },

  async logout(refreshToken: string): Promise<void> {
    try {
      await api.post('/concepts/auth/logout', { refreshToken });
    } catch {
      // Logout always succeeds on client
    }
    const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';
    await fetch(`${BASE_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {  });
  },

  async getMe(userId?: string): Promise<StatelessUserDto> {
    try {
      const params = userId ? `?userId=${encodeURIComponent(userId)}` : '';
      return await api.get<StatelessUserDto>(`/concepts/auth/me${params}`);
    } catch (err) {
      throw handleError(err, 'Failed to fetch profile');
    }
  },

  async getProgress(userId?: string): Promise<StatelessUserProgress> {
    try {
      const params = userId ? `?userId=${encodeURIComponent(userId)}` : '';
      return await api.get<StatelessUserProgress>(`/concepts/auth/progress${params}`);
    } catch (err) {
      throw handleError(err, 'Failed to fetch progress');
    }
  },

  async updateProfile(userId: string, username: string, nickname?: string, bio?: string, university?: string): Promise<StatelessUserDto> {
    try {
      return await api.put<StatelessUserDto>('/concepts/auth/profile', { userId, username, nickname, bio, university });
    } catch (err) {
      throw handleError(err, 'Profile update failed');
    }
  },

  async getDemoCredentials(): Promise<{ email: string; password: string; message: string }> {
    try {
      return await api.get<{ email: string; password: string; message: string }>('/concepts/auth/demo-credentials');
    } catch (err) {
      throw handleError(err, 'Failed to fetch demo credentials');
    }
  },

  async impersonateUser(userId: string, adminToken: string): Promise<StatelessAuthResponse> {
    try {
      return await api.post<StatelessAuthResponse>(
        `/concepts/admin/users/${encodeURIComponent(userId)}/impersonate`,
        {},
      );
    } catch (err) {
      throw handleError(err, 'Impersonation failed');
    }
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
    try {
      return await api.put<{ message: string }>('/concepts/auth/change-password', { userId, currentPassword, newPassword });
    } catch (err) {
      throw handleError(err, 'Password change failed');
    }
  },
};