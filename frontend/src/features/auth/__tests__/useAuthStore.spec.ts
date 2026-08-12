import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../store/useAuthStore';
import type { StatelessAuthResponse, StatelessUserDto } from '../services/statelessAuthApi';
import type { AuthUserDto } from '../services/authApi';
import { installLocalStorageMock } from '../../../testUtils/localStorageMock';

installLocalStorageMock();

type FetchCall = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

function mockFetchResponse(body: unknown, ok = true, status = 200): Response {
  return { ok, status, json: async () => body } as unknown as Response;
}

function stubFetch(response: Response) {
  const fetchMock = vi.fn<FetchCall>().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function makeStatelessUser(overrides: Partial<StatelessUserDto> = {}): StatelessUserDto {
  return {
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
    ...overrides,
  };
}

function makeAuthResponse(user: StatelessUserDto = makeStatelessUser()): StatelessAuthResponse {
  return { accessToken: 'st-access-token', refreshToken: 'st-refresh-token', expiresIn: 3600, user };
}

function makeAdminUser(): AuthUserDto {
  return {
    id: 'admin-123',
    email: 'admin@dsa.com',
    username: 'admin_user',
    totalXP: 5000,
    currentLevel: 10,
    streakDays: 5,
    createdAt: '2024-01-01',
    badges: [],
    isPremium: true,
    role: 'Admin',
  };
}

describe('useAuthStore — Impersonation Unit Tests (AU-054: giữ tại đây)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.useFakeTimers();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should initialize with isImpersonating as false', () => {
    const store = useAuthStore();
    expect(store.isImpersonating).toBe(false);
  });

  it('should save admin session and apply impersonated session', () => {
    const store = useAuthStore();

    store.currentUser = makeAdminUser();
    store.accessToken = 'admin_access_token_xyz';
    localStorage.setItem('vdsa_stateless_user_id', 'admin-123');
    localStorage.setItem('vdsa_refresh_token', 'admin_refresh_token_xyz');

    const impersonateResponse: StatelessAuthResponse = {
      accessToken: 'impersonated_access_token_123',
      refreshToken: 'impersonated_refresh_token_123',
      expiresIn: 900,
      user: makeStatelessUser({
        id: 'student-456',
        email: 'student@dsa.com',
        username: 'student_user',
        totalXP: 200,
        currentLevel: 2,
        streakDays: 1,
        createdAt: '2024-02-02',
        role: 'Student',
        nickname: 'Student Nick',
      }),
    };

    store.impersonate(impersonateResponse);

    expect(store.isImpersonating).toBe(true);
    expect(store.currentUser?.id).toBe('student-456');
    expect(store.currentUser?.username).toBe('student_user');
    expect(store.currentUser?.role).toBe('Student');
    expect(store.getAccessToken()).toBe('impersonated_access_token_123');

    expect(localStorage.getItem('vdsa_admin_user_id')).toBe('admin-123');
    expect(localStorage.getItem('vdsa_admin_refresh_token')).toBe('admin_refresh_token_xyz');
  });

  it('should restore admin session and clear temp keys when stopImpersonating is called', () => {
    const store = useAuthStore();

    localStorage.setItem('vdsa_admin_access_token', 'admin_access_token_xyz');
    localStorage.setItem('vdsa_admin_refresh_token', 'admin_refresh_token_xyz');
    localStorage.setItem('vdsa_admin_user_id', 'admin-123');
    localStorage.setItem('vdsa_admin_user_data', JSON.stringify(makeAdminUser()));

    store.currentUser = makeStatelessUser({
      id: 'student-456',
      email: 'student@dsa.com',
      username: 'student_user',
      role: 'Student',
    });

    expect(store.isImpersonating).toBe(true);

    store.stopImpersonating();

    expect(store.isImpersonating).toBe(false);
    expect(store.currentUser?.id).toBe('admin-123');
    expect(store.currentUser?.role).toBe('Admin');
    expect(store.getAccessToken()).toBe('admin_access_token_xyz');

    expect(localStorage.getItem('vdsa_admin_access_token')).toBeNull();
    expect(localStorage.getItem('vdsa_admin_refresh_token')).toBeNull();
    expect(localStorage.getItem('vdsa_admin_user_id')).toBeNull();
    expect(localStorage.getItem('vdsa_admin_user_data')).toBeNull();
  });
});

describe('useAuthStore — stateless login/register (fake timers, AU-025)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.useFakeTimers();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('statelessLogin thành công → lưu session + gọi đúng URL/body contract', async () => {
    const fetchMock = stubFetch(mockFetchResponse(makeAuthResponse()));
    const store = useAuthStore();

    await store.statelessLogin('test@dsa.com', 'password123');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:5055/api/v1/concepts/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'test@dsa.com', password: 'password123' }),
      }),
    );
    expect(store.isAuthenticated).toBe(true);
    expect(store.getAccessToken()).toBe('st-access-token');
    expect(store.currentUser?.username).toBe('testuser');
    expect(localStorage.getItem('vdsa_refresh_token')).toBe('st-refresh-token');
    expect(localStorage.getItem('vdsa_stateless_user_id')).toBe('u-1');
  });

  it('statelessLogin thất bại → set authError, không đăng nhập', async () => {
    const fetchMock = stubFetch(mockFetchResponse({ message: 'Email hoặc mật khẩu sai.' }, false, 401));
    vi.stubGlobal('fetch', fetchMock);
    const store = useAuthStore();

    await expect(store.statelessLogin('test@dsa.com', 'wrong')).rejects.toThrow('Email hoặc mật khẩu sai.');

    expect(store.authError).toBe('Email hoặc mật khẩu sai.');
    expect(store.isAuthenticated).toBe(false);
  });

  it('AU-003: statelessRegister thành công → set session', async () => {
    const fetchMock = stubFetch(mockFetchResponse(makeAuthResponse()));
    vi.stubGlobal('fetch', fetchMock);
    const store = useAuthStore();

    await store.statelessRegister('new@dsa.com', 'newuser', 'password123');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:5055/api/v1/concepts/auth/register',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'new@dsa.com', username: 'newuser', password: 'password123' }),
      }),
    );
    expect(store.isAuthenticated).toBe(true);
    expect(store.currentUser?.email).toBe('test@dsa.com');
  });

  it('AU-003: register trùng email → API trả 400 → hiển thị authError', async () => {
    const fetchMock = stubFetch(mockFetchResponse({ message: 'Email đã được sử dụng.' }, false, 400));
    vi.stubGlobal('fetch', fetchMock);
    const store = useAuthStore();

    await expect(store.statelessRegister('dup@dsa.com', 'dupuser', 'password123')).rejects.toThrow(
      'Email đã được sử dụng.',
    );

    expect(store.authError).toBe('Email đã được sử dụng.');
    expect(store.isAuthenticated).toBe(false);
    expect(localStorage.getItem('vdsa_refresh_token')).toBeNull();
  });
});

describe('useAuthStore — refresh flow (AU-025)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.useFakeTimers();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('refresh trả 401 → xóa toàn bộ session (access token + keys stateless)', async () => {
    const fetchMock = vi
      .fn<FetchCall>()
      .mockResolvedValueOnce(mockFetchResponse(makeAuthResponse()))
      .mockResolvedValueOnce(mockFetchResponse({ message: 'Phiên đã hết hạn.' }, false, 401));
    vi.stubGlobal('fetch', fetchMock);
    const store = useAuthStore();

    await store.statelessLogin('test@dsa.com', 'password123');
    expect(store.isAuthenticated).toBe(true);

    await expect(store.refreshAccessToken()).rejects.toThrow('Phiên đã hết hạn.');

    expect(store.getAccessToken()).toBeNull();
    expect(store.isAuthenticated).toBe(false);
    expect(localStorage.getItem('vdsa_refresh_token')).toBeNull();
    expect(localStorage.getItem('vdsa_stateless_user_id')).toBeNull();
  });

  it('refresh fail do lỗi mạng (TypeError) → GIỮ session (không xóa oan)', async () => {
    const fetchMock = vi
      .fn<FetchCall>()
      .mockResolvedValueOnce(mockFetchResponse(makeAuthResponse()))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'));
    vi.stubGlobal('fetch', fetchMock);
    const store = useAuthStore();

    await store.statelessLogin('test@dsa.com', 'password123');

    await expect(store.refreshAccessToken()).rejects.toThrow('Failed to fetch');

    expect(store.isAuthenticated).toBe(true);
    expect(localStorage.getItem('vdsa_refresh_token')).toBe('st-refresh-token');
  });
});

describe('useAuthStore — startImpersonating (AU-028, AU-025)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.useFakeTimers();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('gọi API impersonate với URL đúng + Bearer admin token, lưu admin session', async () => {
    const impersonatedResponse: StatelessAuthResponse = {
      accessToken: 'impersonated-token',
      refreshToken: 'impersonated-refresh',
      expiresIn: 3600,
      user: makeStatelessUser({
        id: 'student-456',
        email: 'student@dsa.com',
        username: 'student_user',
        totalXP: 200,
        currentLevel: 3,
        role: 'Student',
      }),
    };
    const fetchMock = stubFetch(mockFetchResponse(impersonatedResponse));
    vi.stubGlobal('fetch', fetchMock);
    const store = useAuthStore();
    store.accessToken = 'admin-token-xyz';
    store.currentUser = makeAdminUser();
    localStorage.setItem('vdsa_stateless_user_id', 'admin-123');

    await store.startImpersonating('student-456');

    const [input, init] = fetchMock.mock.calls[0] ?? [];
    expect(String(input)).toBe('http://localhost:5055/api/v1/concepts/admin/users/student-456/impersonate');
    const headers = init?.headers as Record<string, string> | undefined;
    expect(headers?.Authorization).toBe('Bearer admin-token-xyz');

    expect(store.isImpersonating).toBe(true);
    expect(store.currentUser?.id).toBe('student-456');
    expect(store.currentUser?.username).toBe('student_user');
    expect(localStorage.getItem('vdsa_admin_access_token')).toBe('admin-token-xyz');
    expect(localStorage.getItem('vdsa_admin_user_id')).toBe('admin-123');
  });

  it('startImpersonating không có admin token → throw, không gọi fetch', async () => {
    const fetchMock = stubFetch(mockFetchResponse(makeAuthResponse()));
    vi.stubGlobal('fetch', fetchMock);
    const store = useAuthStore();

    await expect(store.startImpersonating('student-456')).rejects.toThrow('Không có token Admin.');

    expect(fetchMock).not.toHaveBeenCalled();
    expect(store.isImpersonating).toBe(false);
  });
});
