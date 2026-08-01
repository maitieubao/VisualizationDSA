/**
 * authApi.ts — Centralized HTTP client for Auth endpoints.
 * Uses apiClient.ts for consistent error handling, token injection, and base URL.
 * Tương ứng backend: POST /api/v1/auth/login|register|refresh|logout
 */

import { api } from '@/services/apiClient';
import type { ApiError } from '@/services/apiClient';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuthUserDto {
  id:           string;
  email:        string;
  username:     string;
  totalXP:      number;
  currentLevel: number;
  streakDays:   number;
  createdAt:    string;
  badges:       unknown[];
  isPremium:    boolean;
  role?:        'Student' | 'Teacher' | 'Admin';
  nickname?:    string;
  bio?:         string;
  university?:  string;
  hearts?:      number;
  maxHearts?:   number;
  gemsCount?:   number;
  teacherAppStatus?: string;
  avatarFrameType?: string;
  xpBoostExpiresAt?: string;
}

export interface AuthResponse {
  accessToken:  string;
  refreshToken: string;
  expiresIn:    number;
  user:         AuthUserDto;
}

export interface RegisterPayload {
  email:    string;
  username: string;
  password: string;
}

export interface LoginPayload {
  email:    string;
  password: string;
}

// ── Endpoints ─────────────────────────────────────────────────────────────────

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  try {
    return await api.post<AuthResponse>('/auth/register', payload);
  } catch (err) {
    const error = err as ApiError;
    throw new Error(error.detail ?? 'Registration failed');
  }
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  try {
    return await api.post<AuthResponse>('/auth/login', payload);
  } catch (err) {
    const error = err as ApiError;
    throw new Error(error.detail ?? 'Login failed');
  }
}

export async function refreshAccessToken(refreshToken: string): Promise<AuthResponse> {
  try {
    return await api.post<AuthResponse>('/auth/refresh', { refreshToken });
  } catch (err) {
    const error = err as ApiError;
    throw new Error(error.detail ?? 'Token refresh failed');
  }
}

export async function logout(accessToken: string, refreshToken: string): Promise<void> {
  try {
    await api.post('/auth/logout', { refreshToken });
  } catch {
    // Logout always succeeds on client even if server errors
  }
}

export async function getMe(accessToken: string): Promise<AuthUserDto> {
  try {
    return await api.get<AuthUserDto>('/auth/me');
  } catch (err) {
    const error = err as ApiError;
    throw new Error(error.detail ?? 'Failed to fetch user profile');
  }
}