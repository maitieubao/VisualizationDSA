import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../store/useAuthStore';

class LocalStorageMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}

const localStorageMock = new LocalStorageMock();
global.localStorage = localStorageMock as unknown as Storage;

vi.mock('../services/authApi', () => ({
  login: vi.fn(async () => ({
    accessToken: 'fake-token',
    refreshToken: 'fake-refresh',
    expiresIn: 3600,
    user: {
      id: '1',
      email: 'test@dsa.com',
      username: 'test',
      totalXP: 0,
      currentLevel: 1,
      streakDays: 0,
      createdAt: '2024-01-01',
      badges: [],
      isPremium: false,
      role: 'Student',
    },
  })),
  logout: vi.fn(async () => undefined),
  register: vi.fn(async () => ({
    accessToken: 'fake-token',
    refreshToken: 'fake-refresh',
    expiresIn: 3600,
    user: {
      id: '1',
      email: 'test@dsa.com',
      username: 'test',
      totalXP: 0,
      currentLevel: 1,
      streakDays: 0,
      createdAt: '2024-01-01',
      badges: [],
      isPremium: false,
      role: 'Student',
    },
  })),
  refreshAccessToken: vi.fn(async () => ({
    accessToken: 'new-fake-token',
    refreshToken: 'new-fake-refresh',
    expiresIn: 3600,
    user: {
      id: '1',
      email: 'test@dsa.com',
      username: 'test',
      totalXP: 0,
      currentLevel: 1,
      streakDays: 0,
      createdAt: '2024-01-01',
      badges: [],
      isPremium: false,
      role: 'Student',
    },
  })),
  getMe: vi.fn(async () => ({
    id: '1',
    email: 'test@dsa.com',
    username: 'test',
    totalXP: 0,
    currentLevel: 1,
    streakDays: 0,
    createdAt: '2024-01-01',
    badges: [],
    isPremium: false,
    role: 'Student',
  })),
}));

vi.mock('../services/statelessAuthApi', () => ({
  statelessAuthApi: {
    login: vi.fn(async () => ({
      accessToken: 'fake-token',
      refreshToken: 'fake-refresh',
      expiresIn: 3600,
      user: {
        id: '1',
        email: 'test@dsa.com',
        username: 'test',
        totalXP: 100,
        currentLevel: 2,
        streakDays: 5,
        createdAt: '2024-01-01',
        badges: [],
        isPremium: false,
        role: 'Student',
        nickname: 'TestNick',
        bio: 'Hello',
        university: 'FPT',
      },
    })),
    register: vi.fn(async () => ({
      accessToken: 'fake-token',
      refreshToken: 'fake-refresh',
      expiresIn: 3600,
      user: {
        id: '1',
        email: 'test@dsa.com',
        username: 'test',
        totalXP: 0,
        currentLevel: 1,
        streakDays: 0,
        createdAt: '2024-01-01',
        badges: [],
        isPremium: false,
        role: 'Student',
      },
    })),
    refresh: vi.fn(async () => ({
      accessToken: 'new-fake-token',
      refreshToken: 'new-fake-refresh',
      expiresIn: 3600,
      user: {
        id: '1',
        email: 'test@dsa.com',
        username: 'test',
        totalXP: 100,
        currentLevel: 2,
        streakDays: 5,
        createdAt: '2024-01-01',
        badges: [],
        isPremium: false,
        role: 'Student',
      },
    })),
    logout: vi.fn(async () => undefined),
    getMe: vi.fn(async () => ({
      id: '1',
      email: 'test@dsa.com',
      username: 'test',
      totalXP: 100,
      currentLevel: 2,
      streakDays: 5,
      createdAt: '2024-01-01',
      badges: [],
      isPremium: false,
      role: 'Student',
    })),
    updateProfile: vi.fn(async () => ({
      id: '1',
      email: 'test@dsa.com',
      username: 'test',
      totalXP: 100,
      currentLevel: 2,
      streakDays: 5,
      createdAt: '2024-01-01',
      badges: [],
      isPremium: false,
      role: 'Student',
    })),
    impersonateUser: vi.fn(async () => ({
      accessToken: 'impersonated-token',
      refreshToken: 'impersonated-refresh',
      expiresIn: 3600,
      user: {
        id: 'student-456',
        email: 'student@dsa.com',
        username: 'student_user',
        totalXP: 200,
        currentLevel: 3,
        streakDays: 1,
        createdAt: '2024-02-02',
        badges: [],
        isPremium: false,
        role: 'Student',
        nickname: 'StudentNick',
        bio: 'Hi',
        university: 'FPT',
      },
    })),
    changePassword: vi.fn(async () => ({ message: 'Password changed successfully' })),
  },
}));

describe('useAuthStore - P0/P1 Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('US-AU-002 (P0): Đăng nhập email + password', () => {
    it('should login with valid credentials and save token', async () => {
      const store = useAuthStore();
      await store.logIn('test@dsa.com', 'password123');

      expect(store.getAccessToken()).toBe('fake-token');
      expect(store.isAuthenticated).toBe(true);
      expect(store.currentUser).not.toBeNull();
      expect(store.currentUser?.username).toBe('test');
    });

    it('should set isAuthenticated to true after login', async () => {
      const store = useAuthStore();
      expect(store.isAuthenticated).toBe(false);

      await store.logIn('test@dsa.com', 'password123');

      expect(store.isAuthenticated).toBe(true);
    });
  });

  describe('US-AU-008 (P0): Đăng xuất', () => {
    it('should clear token and user after logout', async () => {
      const store = useAuthStore();
      await store.logIn('test@dsa.com', 'password123');
      expect(store.isAuthenticated).toBe(true);

      await store.logOut();

      expect(store.getAccessToken()).toBeNull();
      expect(store.currentUser).toBeNull();
      expect(store.isAuthenticated).toBe(false);
    });

    it('should clear refresh token from localStorage on logout', async () => {
      const store = useAuthStore();
      await store.logIn('test@dsa.com', 'password123');
      expect(localStorage.getItem('vdsa_refresh_token')).not.toBeNull();

      await store.logOut();

      expect(localStorage.getItem('vdsa_refresh_token')).toBeNull();
    });
  });

  describe('US-AU-009 (P1): Xem thông tin cá nhân', () => {
    it('should have currentUser with name, level, and xp after login', async () => {
      const store = useAuthStore();
      await store.logIn('test@dsa.com', 'password123');

      expect(store.currentUser).not.toBeNull();
      expect(store.currentUser?.username).toBe('test');
    });

    it('should expose userLevel and userXP computed properties', async () => {
      const store = useAuthStore();
      await store.logIn('test@dsa.com', 'password123');

      expect(store.userLevel).toBeGreaterThanOrEqual(1);
      expect(store.userXP).toBeGreaterThanOrEqual(0);
    });

    it('should return correct userName from currentUser', async () => {
      const store = useAuthStore();
      await store.logIn('test@dsa.com', 'password123');

      expect(store.userName).toBe('test');
    });
  });

  describe('US-AU-011 (P1): Impersonate', () => {
    it('should set isImpersonating to true when impersonate is called', () => {
      const store = useAuthStore();

      store.currentUser = {
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
      store.accessToken = 'admin_token';
      localStorage.setItem('vdsa_stateless_user_id', 'admin-123');
      localStorage.setItem('vdsa_refresh_token', 'admin_refresh');

      expect(store.isImpersonating).toBe(false);

      store.impersonate({
        accessToken: 'impersonated-token',
        refreshToken: 'impersonated-refresh',
        expiresIn: 3600,
        user: {
          id: 'student-456',
          email: 'student@dsa.com',
          username: 'student_user',
          totalXP: 200,
          currentLevel: 3,
          streakDays: 1,
          createdAt: '2024-02-02',
          badges: [],
          isPremium: false,
          role: 'Student',
        },
      });

      expect(store.isImpersonating).toBe(true);
      expect(store.currentUser?.id).toBe('student-456');
      expect(store.currentUser?.username).toBe('student_user');
    });
  });

  describe('US-AU-014 (P1): Đổi mật khẩu', () => {
    it('should call changePassword API', async () => {
      const store = useAuthStore();

      await store.changePassword('oldPass123', 'newPass456');

      const { statelessAuthApi } = await import('../services/statelessAuthApi');
      expect(statelessAuthApi.changePassword).toHaveBeenCalledWith('oldPass123', 'newPass456');
    });

    it('should clear authError when changePassword succeeds', async () => {
      const store = useAuthStore();

      await store.changePassword('oldPass123', 'newPass456');

      expect(store.authError).toBeNull();
    });
  });
});
