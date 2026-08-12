// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../store/useAuthStore';
import LoginModal from '../components/LoginModal.vue';
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

function parseBody(init: RequestInit | undefined): Record<string, unknown> {
  return JSON.parse(init?.body as string) as Record<string, unknown>;
}

function makeStatelessUser() {
  return {
    id: 'u-1',
    email: 'test@dsa.com',
    username: 'testuser',
    totalXP: 100,
    currentLevel: 2,
    streakDays: 3,
    createdAt: '2024-01-01',
    badges: [] as unknown[],
    isPremium: false,
    role: 'Student' as const,
    nickname: 'Test Nick',
    bio: 'Hello',
    university: 'FPT University',
  };
}

function makeStatelessResponse(user: ReturnType<typeof makeStatelessUser> = makeStatelessUser()) {
  return {
    accessToken: 'st-access-token',
    refreshToken: 'st-refresh-token',
    expiresIn: 3600,
    user,
  };
}

const classicLoginResponse = {
  accessToken: 'classic-access-token',
  refreshToken: 'classic-refresh-token',
  expiresIn: 3600,
  user: {
    id: 'c-1',
    email: 'test@dsa.com',
    username: 'test',
    totalXP: 150,
    currentLevel: 4,
    streakDays: 0,
    createdAt: '2024-01-01',
    badges: [],
    isPremium: false,
    role: 'Student' as const,
  },
};

function mountLoginModal() {
  return mount(LoginModal, {
    props: { visible: true },
    global: { stubs: { teleport: true, BaseIcon: true } },
  });
}

describe('LoginModal — Register UI (AU-003)', () => {
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

  it('register thành công qua modal → set session + emit close', async () => {
    const fetchMock = stubFetch(mockFetchResponse(makeStatelessResponse()));
    vi.stubGlobal('fetch', fetchMock);
    const store = useAuthStore();
    const wrapper = mountLoginModal();

    await wrapper.find('.toggle-link').trigger('click');
    await wrapper.find('#auth-email').setValue('new@dsa.com');
    await wrapper.find('#auth-username').setValue('newuser');
    await wrapper.find('#auth-password').setValue('password123');
    await wrapper.find('#auth-confirm-password').setValue('password123');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    const [input, init] = fetchMock.mock.calls[0] ?? [];
    expect(String(input)).toBe('http://localhost:5055/api/v1/concepts/auth/register');
    expect(parseBody(init)).toEqual({ email: 'new@dsa.com', username: 'newuser', password: 'password123' });

    expect(store.isAuthenticated).toBe(true);
    expect(store.currentUser?.username).toBe('testuser');
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('register trùng email → 400 → hiển thị authError trong modal, không emit close', async () => {
    const fetchMock = stubFetch(mockFetchResponse({ message: 'Email đã được sử dụng.' }, false, 400));
    vi.stubGlobal('fetch', fetchMock);
    const store = useAuthStore();
    const wrapper = mountLoginModal();

    await wrapper.find('.toggle-link').trigger('click');
    await wrapper.find('#auth-email').setValue('dup@dsa.com');
    await wrapper.find('#auth-username').setValue('dupuser');
    await wrapper.find('#auth-password').setValue('password123');
    await wrapper.find('#auth-confirm-password').setValue('password123');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(store.authError).toBe('Email đã được sử dụng.');
    expect(wrapper.find('.modal-error').exists()).toBe(true);
    expect(wrapper.find('.modal-error').text()).toContain('Email đã được sử dụng.');
    expect(wrapper.emitted('close')).toBeFalsy();
  });

  it('register password < 8 ký tự: input cấu hình minlength=8 + submit bị chặn bởi backend policy (400 → hiển thị lỗi)', async () => {
    const fetchMock = stubFetch(mockFetchResponse({ message: 'Mật khẩu phải có ít nhất 8 ký tự.' }, false, 400));
    vi.stubGlobal('fetch', fetchMock);
    const store = useAuthStore();
    const wrapper = mountLoginModal();

    await wrapper.find('.toggle-link').trigger('click');
    await wrapper.find('#auth-email').setValue('test@dsa.com');
    await wrapper.find('#auth-username').setValue('testuser');
    const passwordInput = wrapper.find('#auth-password').element as HTMLInputElement;
    await wrapper.find('#auth-password').setValue('short');
    await wrapper.find('#auth-confirm-password').setValue('short');

    expect(passwordInput.minLength).toBe(8);
    expect(passwordInput.value).toBe('short');

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(store.authError).toBe('Mật khẩu phải có ít nhất 8 ký tự.');
    expect(wrapper.find('.modal-error').text()).toContain('Mật khẩu phải có ít nhất 8 ký tự.');
    expect(store.isAuthenticated).toBe(false);
    expect(wrapper.emitted('close')).toBeFalsy();
  });

  it('register xác nhận mật khẩu không khớp → chặn submit (AU-018), API không được gọi', async () => {
    const fetchMock = stubFetch(mockFetchResponse(makeStatelessResponse()));
    vi.stubGlobal('fetch', fetchMock);
    const store = useAuthStore();
    const wrapper = mountLoginModal();

    await wrapper.find('.toggle-link').trigger('click');
    await wrapper.find('#auth-email').setValue('test@dsa.com');
    await wrapper.find('#auth-username').setValue('testuser');
    await wrapper.find('#auth-password').setValue('password123');
    await wrapper.find('#auth-confirm-password').setValue('khac123456');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(wrapper.find('.form-field-error').exists()).toBe(true);
    expect(wrapper.find('.form-field-error').text()).toContain('Xác nhận mật khẩu không khớp');
    expect(store.isAuthenticated).toBe(false);
    expect(wrapper.emitted('close')).toBeFalsy();
  });

  it('login thành công qua modal → set session + emit close', async () => {
    const fetchMock = stubFetch(mockFetchResponse(makeStatelessResponse()));
    vi.stubGlobal('fetch', fetchMock);
    const store = useAuthStore();
    const wrapper = mountLoginModal();

    await wrapper.find('#auth-email').setValue('test@dsa.com');
    await wrapper.find('#auth-password').setValue('password123');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    const [input] = fetchMock.mock.calls[0] ?? [];
    expect(String(input)).toBe('http://localhost:5055/api/v1/concepts/auth/login');
    expect(store.isAuthenticated).toBe(true);
    expect(wrapper.emitted('close')).toBeTruthy();
  });
});

describe('useAuthStore - P0/P1 Tests', () => {
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

  describe('US-AU-002 (P0): Đăng nhập email + password', () => {
    it('should login with valid credentials and save token', async () => {
      const fetchMock = stubFetch(mockFetchResponse(classicLoginResponse));
      vi.stubGlobal('fetch', fetchMock);
      const store = useAuthStore();

      await store.logIn('test@dsa.com', 'password123');

      expect(store.getAccessToken()).toBe('classic-access-token');
      expect(store.isAuthenticated).toBe(true);
      expect(store.currentUser).not.toBeNull();
      expect(store.currentUser?.username).toBe('test');
      expect(localStorage.getItem('vdsa_refresh_token')).toBe('classic-refresh-token');
    });

    it('should set isAuthenticated to true after login', async () => {
      const fetchMock = stubFetch(mockFetchResponse(classicLoginResponse));
      vi.stubGlobal('fetch', fetchMock);
      const store = useAuthStore();
      expect(store.isAuthenticated).toBe(false);

      await store.logIn('test@dsa.com', 'password123');

      expect(store.isAuthenticated).toBe(true);
    });
  });

  describe('US-AU-008 (P0): Đăng xuất (AU-027)', () => {
    it('should clear token and user after logout', async () => {
      const fetchMock = vi
        .fn<FetchCall>()
        .mockResolvedValueOnce(mockFetchResponse(classicLoginResponse))
        .mockResolvedValueOnce(mockFetchResponse({}));
      vi.stubGlobal('fetch', fetchMock);
      const store = useAuthStore();
      await store.logIn('test@dsa.com', 'password123');
      expect(store.isAuthenticated).toBe(true);

      await store.logOut();

      expect(store.getAccessToken()).toBeNull();
      expect(store.currentUser).toBeNull();
      expect(store.isAuthenticated).toBe(false);
    });

    it('should clear refresh token from localStorage on logout', async () => {
      const fetchMock = vi
        .fn<FetchCall>()
        .mockResolvedValueOnce(mockFetchResponse(classicLoginResponse))
        .mockResolvedValueOnce(mockFetchResponse({}));
      vi.stubGlobal('fetch', fetchMock);
      const store = useAuthStore();
      await store.logIn('test@dsa.com', 'password123');
      expect(localStorage.getItem('vdsa_refresh_token')).not.toBeNull();

      await store.logOut();

      expect(localStorage.getItem('vdsa_refresh_token')).toBeNull();
    });

    it('AU-027: logout gọi authApi.logout(accessToken, refreshToken) đúng args', async () => {
      const fetchMock = vi
        .fn<FetchCall>()
        .mockResolvedValueOnce(mockFetchResponse(classicLoginResponse))
        .mockResolvedValueOnce(mockFetchResponse({}));
      vi.stubGlobal('fetch', fetchMock);
      const store = useAuthStore();
      await store.logIn('test@dsa.com', 'password123');
      expect(store.getAccessToken()).toBe('classic-access-token');

      await store.logOut();

      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        'http://localhost:5055/api/v1/auth/logout',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer classic-access-token',
          }),
          body: JSON.stringify({ refreshToken: 'classic-refresh-token' }),
        }),
      );
    });
  });

  describe('US-AU-009 (P1): Xem thông tin cá nhân', () => {
    it('should have currentUser with name, level, and xp after login', async () => {
      const fetchMock = stubFetch(mockFetchResponse(classicLoginResponse));
      vi.stubGlobal('fetch', fetchMock);
      const store = useAuthStore();
      await store.logIn('test@dsa.com', 'password123');

      expect(store.currentUser).not.toBeNull();
      expect(store.currentUser?.username).toBe('test');
    });

    it('AU-029: userLevel/userXP phải khớp giá trị cụ thể từ mock (level 4, XP 150)', async () => {
      const fetchMock = stubFetch(mockFetchResponse(classicLoginResponse));
      vi.stubGlobal('fetch', fetchMock);
      const store = useAuthStore();
      await store.logIn('test@dsa.com', 'password123');

      expect(store.userLevel).toBe(4);
      expect(store.userXP).toBe(150);
    });

    it('should return correct userName from currentUser', async () => {
      const fetchMock = stubFetch(mockFetchResponse(classicLoginResponse));
      vi.stubGlobal('fetch', fetchMock);
      const store = useAuthStore();
      await store.logIn('test@dsa.com', 'password123');

      expect(store.userName).toBe('test');
    });
  });

  describe('US-AU-014 (P1): Đổi mật khẩu', () => {
    it('should call changePassword API with Bearer token', async () => {
      const fetchMock = stubFetch(mockFetchResponse({ message: 'Password changed successfully' }));
      vi.stubGlobal('fetch', fetchMock);
      const store = useAuthStore();
      store.accessToken = 'svc-token';

      await store.changePassword('oldPass123', 'newPass456');

      const [input, init] = fetchMock.mock.calls[0] ?? [];
      expect(String(input)).toBe('http://localhost:5055/api/v1/concepts/auth/change-password');
      expect(init?.method).toBe('PUT');
      const headers = init?.headers as Record<string, string> | undefined;
      expect(headers?.Authorization).toBe('Bearer svc-token');
      expect(parseBody(init)).toEqual({ currentPassword: 'oldPass123', newPassword: 'newPass456' });
    });

    it('should clear authError when changePassword succeeds', async () => {
      const fetchMock = stubFetch(mockFetchResponse({ message: 'Password changed successfully' }));
      vi.stubGlobal('fetch', fetchMock);
      const store = useAuthStore();
      store.accessToken = 'svc-token';
      store.authError = 'lỗi cũ';

      await store.changePassword('oldPass123', 'newPass456');

      expect(store.authError).toBeNull();
    });
  });
});
