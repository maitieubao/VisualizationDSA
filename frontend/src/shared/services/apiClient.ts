/**
 * Secure HTTP API Client — JWT-authenticated fetch wrapper
 * Integrated directly with useAuthStore's memory-only secure token strategy
 */

import { useAuthStore } from '../../features/auth/store/useAuthStore';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055') + '/api/v1';

export interface ApiError {
  status: number;
  title: string;
  detail: string;
  errors?: Record<string, string[]>;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const authStore = useAuthStore();
  const token = authStore.getAccessToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorBody: ApiError;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = {
        status: response.status,
        title: response.statusText,
        detail: `HTTP ${response.status}`,
      };
    }
    throw errorBody;
  }

  if (response.status === 204) return undefined as T;

  return response.json();
}

export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint),
  post: <T>(endpoint: string, body?: unknown) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(endpoint: string, body?: unknown) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: 'DELETE' }),
};
