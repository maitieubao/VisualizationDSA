import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../store/useAuthStore';
import { statelessAuthApi } from '../services/statelessAuthApi';
import type { StatelessAuthResponse } from '../services/statelessAuthApi';

const BASE_URL = 'http://localhost:5055';
const AUTH_BASE = `${BASE_URL}/api/v1/concepts/auth`;

type FetchCall = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

function mockFetchResponse(body: unknown, ok = true, status = 200, statusText = 'OK'): Response {
  return { ok, status, statusText, json: async () => body } as unknown as Response;
}

function stubFetch(response: Response) {
  const fetchMock = vi.fn<FetchCall>().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function parseBody(init: RequestInit | undefined): Record<string, unknown> {
  return JSON.parse(init?.body as string) as Record<string, unknown>;
}

function headerOf(init: RequestInit | undefined, name: string): string | undefined {
  const headers = init?.headers as Record<string, string> | undefined;
  return headers?.[name];
}

const authResponse: StatelessAuthResponse = {
  accessToken: 'st-access-token',
  refreshToken: 'st-refresh-token',
  expiresIn: 3600,
  user: {
    id: 'u-1',
    email: 'test@dsa.com',
    username: 'testuser',
    totalXP: 100,
    currentLevel: 2,
    streakDays: 3,
    createdAt: '2024-01-01',
    badges: [],
    isPremium: false,
    role: 'Student',
    nickname: 'Test Nick',
    bio: 'Hello',
    university: 'FPT University',
  },
};

const userDto = {
  id: 'u-1',
  email: 'test@dsa.com',
  username: 'testuser',
  totalXP: 100,
  currentLevel: 2,
  streakDays: 3,
  createdAt: '2024-01-01',
  badges: [],
  isPremium: false,
  role: 'Student',
  nickname: 'Test Nick',
  bio: 'Hello',
  university: 'FPT University',
};

describe('statelessAuthApi — Contract Test (AU-001)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const store = useAuthStore();
    store.accessToken = 'svc-bearer-token';
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('login', () => {
    it('POST /api/v1/concepts/auth/login với body camelCase {email, password}', async () => {
      const fetchMock = stubFetch(mockFetchResponse(authResponse));

      const result = await statelessAuthApi.login('test@dsa.com', 'password123');

      const [input, init] = fetchMock.mock.calls[0] ?? [];
      expect(String(input)).toBe(`${AUTH_BASE}/login`);
      expect(init?.method).toBe('POST');
      expect(headerOf(init, 'Content-Type')).toBe('application/json');
      expect(parseBody(init)).toEqual({ email: 'test@dsa.com', password: 'password123' });
      expect(result).toEqual(authResponse);
    });
  });

  describe('register', () => {
    it('POST /api/v1/concepts/auth/register với body {email, username, password}', async () => {
      const fetchMock = stubFetch(mockFetchResponse(authResponse));

      const result = await statelessAuthApi.register('test@dsa.com', 'testuser', 'password123');

      const [input, init] = fetchMock.mock.calls[0] ?? [];
      expect(String(input)).toBe(`${AUTH_BASE}/register`);
      expect(init?.method).toBe('POST');
      expect(parseBody(init)).toEqual({ email: 'test@dsa.com', username: 'testuser', password: 'password123' });
      expect(result.accessToken).toBe('st-access-token');
    });
  });

  describe('refresh (AU-055)', () => {
    it('POST /api/v1/concepts/auth/refresh — body CHỈ chứa {refreshToken}, KHÔNG có userId', async () => {
      const fetchMock = stubFetch(mockFetchResponse(authResponse));

      await statelessAuthApi.refresh('rt-123');

      const [input, init] = fetchMock.mock.calls[0] ?? [];
      expect(String(input)).toBe(`${AUTH_BASE}/refresh`);
      expect(init?.method).toBe('POST');
      expect(parseBody(init)).toEqual({ refreshToken: 'rt-123' });
      expect(parseBody(init)).not.toHaveProperty('userId');
    });
  });

  describe('logout', () => {
    it('POST /api/v1/concepts/auth/logout với body {refreshToken}', async () => {
      const fetchMock = stubFetch(mockFetchResponse({}));

      await statelessAuthApi.logout('rt-456');

      const [input, init] = fetchMock.mock.calls[0] ?? [];
      expect(String(input)).toBe(`${AUTH_BASE}/logout`);
      expect(init?.method).toBe('POST');
      expect(parseBody(init)).toEqual({ refreshToken: 'rt-456' });
    });

    it('nuốt lỗi mạng (không throw) — không làm gãy luồng logout', async () => {
      const fetchMock = vi.fn<FetchCall>().mockRejectedValue(new TypeError('Failed to fetch'));
      vi.stubGlobal('fetch', fetchMock);

      await expect(statelessAuthApi.logout('rt-456')).resolves.toBeUndefined();
    });
  });

  describe('getMe / updateProfile / changePassword (gắn Authorization)', () => {
    it('GET /api/v1/concepts/auth/me kèm Bearer token từ store', async () => {
      const fetchMock = stubFetch(mockFetchResponse(userDto));

      const result = await statelessAuthApi.getMe();

      const [input, init] = fetchMock.mock.calls[0] ?? [];
      expect(String(input)).toBe(`${AUTH_BASE}/me`);
      expect(headerOf(init, 'Authorization')).toBe('Bearer svc-bearer-token');
      expect(result.username).toBe('testuser');
    });

    it('PUT /api/v1/concepts/auth/profile với body {username, nickname, bio, university}', async () => {
      const fetchMock = stubFetch(mockFetchResponse(userDto));

      await statelessAuthApi.updateProfile('newname', 'Nick', 'Bio', 'FPT');

      const [input, init] = fetchMock.mock.calls[0] ?? [];
      expect(String(input)).toBe(`${AUTH_BASE}/profile`);
      expect(init?.method).toBe('PUT');
      expect(headerOf(init, 'Authorization')).toBe('Bearer svc-bearer-token');
      expect(parseBody(init)).toEqual({ username: 'newname', nickname: 'Nick', bio: 'Bio', university: 'FPT' });
    });

    it('PUT /api/v1/concepts/auth/change-password với body {currentPassword, newPassword}', async () => {
      const fetchMock = stubFetch(mockFetchResponse({ message: 'Password changed successfully' }));

      const result = await statelessAuthApi.changePassword('oldPass123', 'newPass456');

      const [input, init] = fetchMock.mock.calls[0] ?? [];
      expect(String(input)).toBe(`${AUTH_BASE}/change-password`);
      expect(init?.method).toBe('PUT');
      expect(headerOf(init, 'Authorization')).toBe('Bearer svc-bearer-token');
      expect(parseBody(init)).toEqual({ currentPassword: 'oldPass123', newPassword: 'newPass456' });
      expect(result.message).toBe('Password changed successfully');
    });
  });

  describe('impersonateUser (AU-028)', () => {
    it('POST /api/v1/concepts/admin/users/{id}/impersonate với Authorization = Bearer admin token', async () => {
      const fetchMock = stubFetch(mockFetchResponse(authResponse));

      await statelessAuthApi.impersonateUser('student-456', 'admin-token-xyz');

      const [input, init] = fetchMock.mock.calls[0] ?? [];
      expect(String(input)).toBe(`${BASE_URL}/api/v1/concepts/admin/users/student-456/impersonate`);
      expect(init?.method).toBe('POST');
      expect(headerOf(init, 'Authorization')).toBe('Bearer admin-token-xyz');
    });

    it('encode userId trước khi ghép URL', async () => {
      const fetchMock = stubFetch(mockFetchResponse(authResponse));

      await statelessAuthApi.impersonateUser('u 1/2', 'admin-token');

      const [input] = fetchMock.mock.calls[0] ?? [];
      expect(String(input)).toBe(`${BASE_URL}/api/v1/concepts/admin/users/u%201%2F2/impersonate`);
    });
  });

  describe('parse lỗi theo status — error shape {message, status}', () => {
    it.each([
      [401, 'Phiên đã hết hạn.'],
      [400, 'Email đã được sử dụng.'],
      [429, 'Quá nhiều yêu cầu. Thử lại sau.'],
    ])('HTTP %i → throw Error(message) + error.status = %i', async (status, message) => {
      const fetchMock = stubFetch(mockFetchResponse({ message }, false, status));
      vi.stubGlobal('fetch', fetchMock);

      const err = await statelessAuthApi.login('test@dsa.com', 'password123').catch((e: unknown) => e);
      expect(err).toBeInstanceOf(Error);
      const error = err as Error & { status?: number };
      expect(error.message).toBe(message);
      expect(error.status).toBe(status);
    });

    it('body không phải JSON (HTTP 500) → fallback message "HTTP 500: Internal Server Error"', async () => {
      const fetchMock = stubFetch(mockFetchResponse(null, false, 500, 'Internal Server Error'));
      vi.stubGlobal('fetch', fetchMock);

      const err = await statelessAuthApi.login('test@dsa.com', 'password123').catch((e: unknown) => e);
      const error = err as Error & { status?: number };
      expect(error.message).toBe('HTTP 500: Internal Server Error');
      expect(error.status).toBe(500);
    });

    it('401 phải GIỮ NGUYÊN status 401 để caller phân biệt lỗi auth (không nhầm với 429)', async () => {
      const fetchMock = stubFetch(mockFetchResponse({ message: 'Unauthorized' }, false, 401));
      vi.stubGlobal('fetch', fetchMock);

      const err = await statelessAuthApi.getMe().catch((e: unknown) => e);
      const error = err as Error & { status?: number };
      expect(error.status).toBe(401);
    });
  });
});
