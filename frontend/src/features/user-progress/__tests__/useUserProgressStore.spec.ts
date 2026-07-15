import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUserProgressStore } from '../store/useUserProgressStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { fetchUserProgress } from '../service/userProgressApi';

vi.mock('../service/userProgressApi', () => ({
  fetchUserProgress: vi.fn(),
  syncXPToServer: vi.fn(),
  markModuleComplete: vi.fn(),
}));

vi.mock('../../auth/store/useAuthStore', () => {
  const mockAuthStore = {
    getAccessToken: vi.fn(),
    refreshAccessToken: vi.fn(),
  };
  return {
    useAuthStore: () => mockAuthStore,
  };
});

describe('useUserProgressStore', () => {
  let authStore: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    authStore = useAuthStore();
    authStore.getAccessToken.mockReturnValue('mock-token');
    authStore.refreshAccessToken.mockReset();
    vi.mocked(fetchUserProgress).mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should have initial isSyncError as false', () => {
    const store = useUserProgressStore();
    expect(store.isSyncError).toBe(false);
  });

  it('should load progress successfully and set state', async () => {
    const mockProgress = {
      totalXP: 500,
      currentLevel: 5,
      xpToNextLevel: 100,
      levelProgressPercent: 50,
      badgesEarned: 0,
      modulesCompleted: 1,
      currentStreak: 3,
      completedModuleIds: ['module-1'],
      badges: [],
    };

    vi.mocked(fetchUserProgress).mockResolvedValue(mockProgress);

    const store = useUserProgressStore();
    await store.loadProgress();

    expect(store.totalXP).toBe(500);
    expect(store.currentLevel).toBe(5);
    expect(store.completedModuleIds).toEqual(['module-1']);
    expect(store.isSyncError).toBe(false);
  });

  it('should set isSyncError to true and NOT call refreshAccessToken when 401 error occurs (interceptor owns retry)', async () => {
    // Since the global fetch interceptor handles 401 retry/refresh,
    // loadProgress must NOT duplicate that logic to avoid race conditions.
    vi.mocked(fetchUserProgress).mockRejectedValue({ status: 401, message: 'Unauthorized' });

    const store = useUserProgressStore();
    await expect(store.loadProgress()).resolves.toBeUndefined();

    // isSyncError should be true because interceptor already retried and failed
    expect(store.isSyncError).toBe(true);
    // loadProgress must NOT call refreshAccessToken — that is the interceptor's job
    expect(authStore.refreshAccessToken).not.toHaveBeenCalled();
  });

  it('should set isSyncError to true and not throw when non-401 error occurs', async () => {
    vi.mocked(fetchUserProgress).mockRejectedValue(new Error('Network Error'));

    const store = useUserProgressStore();
    
    // Should resolve, not reject/throw
    await expect(store.loadProgress()).resolves.toBeUndefined();
    expect(store.isSyncError).toBe(true);
  });

  it('should set isSyncError to true and not throw when 401 error occurs and token refresh fails', async () => {
    vi.mocked(fetchUserProgress).mockRejectedValue({ status: 401, message: 'Unauthorized' });
    authStore.refreshAccessToken.mockRejectedValue(new Error('Refresh failed'));

    const store = useUserProgressStore();
    
    await expect(store.loadProgress()).resolves.toBeUndefined();
    expect(authStore.refreshAccessToken).not.toHaveBeenCalled();
    expect(store.isSyncError).toBe(true);
  });

  it('should reset isSyncError to false when loadProgress is called again and succeeds', async () => {
    const store = useUserProgressStore();

    // Trigger initial error to set isSyncError to true
    vi.mocked(fetchUserProgress).mockRejectedValue(new Error('Network Error'));
    await store.loadProgress();
    expect(store.isSyncError).toBe(true);

    // Now make it succeed
    const mockProgress = {
      totalXP: 100,
      currentLevel: 1,
      xpToNextLevel: 100,
      levelProgressPercent: 0,
      badgesEarned: 0,
      modulesCompleted: 0,
      currentStreak: 0,
      completedModuleIds: [],
      badges: [],
    };
    vi.mocked(fetchUserProgress).mockResolvedValue(mockProgress);
    await store.loadProgress();
    
    expect(store.isSyncError).toBe(false);
  });
});
