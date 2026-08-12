// @vitest-environment jsdom
// PR-009t (P1): Contract dịch vụ User Progress — userProgressApi fetch layer
// (features/user-progress/service/userProgressApi.ts) + syncProgressFromServer
// (useGamificationStore) phải lấy lastActiveDate TỪ SERVER, không đoán ngày hôm nay
// (trước đây GM-008/PR-009: set StreakCalculator.getAdjustedDate(new Date())).
// Ghi chú: vi.mock(authApi/statelessAuthApi) không cần — dùng module mock riêng.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

vi.mock('../gamificationApi', () => ({
  gamificationApi: { getUserProgress: vi.fn() },
}));

vi.mock('../../features/auth/store/useAuthStore', () => {
  const mockAuthStore = {
    getAccessToken: vi.fn(() => 'token-abc'),
    statelessUser: { id: 'user-1' },
  };
  return { useAuthStore: () => mockAuthStore };
});

import {
  fetchUserProgress,
  syncXPToServer,
  markModuleComplete,
  ApiError,
  type UserProgressDto,
} from '../../features/user-progress/service/userProgressApi';
import { useGamificationStore } from '../../features/gamification-engine/store/useGamificationStore';
import { gamificationApi } from '../gamificationApi';

describe('PR-009t: interface userProgressApi', () => {
  it('UserProgressDto khai báo trường lastActiveDate (contract compile-time — vue-tsc fail nếu source thiếu)', () => {
    const dto: UserProgressDto = {} as UserProgressDto;
    const lastActive: string | undefined = dto.lastActiveDate;
    expect(lastActive === undefined || typeof lastActive === 'string').toBe(true);
  });
});

describe('userProgressApi — fetch layer', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetchUserProgress: GET /users/me/progress với Bearer header', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({ totalXP: 750 }) }));
    vi.stubGlobal('fetch', fetchMock);
    const data = await fetchUserProgress('token-1');
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:5055/api/v1/users/me/progress',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer token-1' }),
      }),
    );
    expect(data.totalXP).toBe(750);
  });

  it('fetchUserProgress: 401 → ném ApiError có status 401 + message', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
    })));
    await expect(fetchUserProgress('token-1')).rejects.toBeInstanceOf(ApiError);
    await expect(fetchUserProgress('token-1')).rejects.toMatchObject({ status: 401, message: 'Unauthorized' });
  });

  it('syncXPToServer: POST /users/me/xp với body {amount, reason} + Bearer', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ message: 'OK', totalXP: 100, currentLevel: 2 }),
    }));
    vi.stubGlobal('fetch', fetchMock);
    const result = await syncXPToServer('token-1', { amount: 100, reason: 'quiz-complete' });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:5055/api/v1/users/me/xp',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ amount: 100, reason: 'quiz-complete' }),
      }),
    );
    expect(result.totalXP).toBe(100);
  });

  it('markModuleComplete: POST /users/me/modules/{id}, 204 → resolve undefined', async () => {
    const fetchMock = vi.fn(async () => ({ ok: false, status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(markModuleComplete('token-1', 'mod-1')).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:5055/api/v1/users/me/modules/mod-1',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('markModuleComplete: 500 → ném ApiError status 500', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: false,
      status: 500,
      json: async () => ({ message: 'boom' }),
    })));
    await expect(markModuleComplete('token-1', 'mod-1')).rejects.toMatchObject({ status: 500 });
  });
});

describe('PR-009t: syncProgressFromServer dùng lastActiveDate SERVER', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-10T12:00:00'));
    vi.mocked(gamificationApi.getUserProgress).mockReset();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('streak > 0 + server gửi lastActiveDate → giữ NGUYÊN ngày server (không đoán hôm nay)', async () => {
    vi.mocked(gamificationApi.getUserProgress).mockResolvedValue({
      totalXP: 600,
      currentLevel: 3,
      xpToNextLevel: 100,
      levelProgressPercent: 40,
      badgesEarned: 1,
      modulesCompleted: 2,
      currentStreak: 5,
      completedModuleIds: [],
      badges: [],
      isPremium: false,
      lastActiveDate: '2026-08-05',
    });
    const store = useGamificationStore();
    await store.syncProgressFromServer();
    expect(store.lastActiveDate).toBe('2026-08-05');
    expect(store.lastActiveDate).not.toBe('2026-08-10');
  });

  it('server không gửi lastActiveDate + streak 0 → chuỗi rỗng (không đặt bừa hôm nay)', async () => {
    vi.mocked(gamificationApi.getUserProgress).mockResolvedValue({
      totalXP: 0,
      currentLevel: 1,
      xpToNextLevel: 100,
      levelProgressPercent: 0,
      badgesEarned: 0,
      modulesCompleted: 0,
      currentStreak: 0,
      completedModuleIds: [],
      badges: [],
      isPremium: false,
    });
    const store = useGamificationStore();
    await store.syncProgressFromServer();
    expect(store.lastActiveDate).toBe('');
  });
});
