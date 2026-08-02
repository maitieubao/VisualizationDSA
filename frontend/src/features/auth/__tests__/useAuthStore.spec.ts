import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../store/useAuthStore';
import type { StatelessAuthResponse } from '../services/statelessAuthApi';

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

describe('useAuthStore - Impersonation Unit Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should initialize with isImpersonating as false', () => {
    const store = useAuthStore();
    expect(store.isImpersonating).toBe(false);
  });

  it('should save admin session and apply impersonated session', () => {
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
    
    store.accessToken = 'admin_access_token_xyz';
    localStorage.setItem('vdsa_stateless_user_id', 'admin-123');
    localStorage.setItem('vdsa_refresh_token', 'admin_refresh_token_xyz');

    
    const impersonateResponse: StatelessAuthResponse = {
      accessToken: 'impersonated_access_token_123',
      refreshToken: 'impersonated_refresh_token_123',
      expiresIn: 900,
      user: {
        id: 'student-456',
        email: 'student@dsa.com',
        username: 'student_user',
        totalXP: 200,
        currentLevel: 2,
        streakDays: 1,
        createdAt: '2024-02-02',
        badges: [],
        isPremium: false,
        role: 'Student',
        nickname: 'Student Nick',
        bio: 'Hello',
        university: 'FPT University',
        hearts: 5,
        maxHearts: 5,
        gemsCount: 0,
        teacherAppStatus: 'pending'
      }
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
    localStorage.setItem('vdsa_admin_user_data', JSON.stringify({
      id: 'admin-123',
      email: 'admin@dsa.com',
      username: 'admin_user',
      role: 'Admin',
      isPremium: true
    }));

    
    store.currentUser = {
      id: 'student-456',
      email: 'student@dsa.com',
      username: 'student_user',
      role: 'Student'
    } as any;

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
