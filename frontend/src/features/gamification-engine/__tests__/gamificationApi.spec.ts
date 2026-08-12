// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { gamificationApi } from '../../../services/gamificationApi';

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055') + '/api/v1';

const fetchMock = vi.fn();

function lastFetchCall(): [string, RequestInit] {
  const call = fetchMock.mock.calls[fetchMock.mock.calls.length - 1] as [string, RequestInit];
  return call;
}

function okResponse(body: unknown) {
  return { ok: true, status: 200, json: async () => body } as unknown as Response;
}

describe('gamificationApi — contract giao tiếp UsersController/BadgesController (GM-031, GM-002, GM-003)', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('GM-002: getUserProgress → GET /api/v1/users/me/progress (không /users/progress)', async () => {
    const dto = {
      totalXP: 600,
      currentLevel: 3,
      xpToNextLevel: 100,
      levelProgressPercent: 40,
      badgesEarned: 1,
      isPremium: false,
      modulesCompleted: 2,
      currentStreak: 5,
      completedModuleIds: [],
      badges: [
        { id: 'recursion-master', name: 'Recursion Master', description: 'd', icon: 'i', color: '#fff', earnedAt: '2026-08-10T00:00:00Z' },
      ],
    };
    fetchMock.mockResolvedValueOnce(okResponse(dto));

    const progress = await gamificationApi.getUserProgress();

    const [url, init] = lastFetchCall();
    expect(url).toBe(`${API_BASE}/users/me/progress`);
    expect(init.method ?? 'GET').toBe('GET');
    expect(progress).toEqual(dto);
  });

  it('GM-002: awardXP → POST /api/v1/users/me/xp với body {amount, reason}', async () => {
    fetchMock.mockResolvedValueOnce(okResponse({ message: 'Đã cộng 50 XP.', totalXP: 650, currentLevel: 3 }));

    const result = await gamificationApi.awardXP(50, 'lesson-completed');

    const [url, init] = lastFetchCall();
    expect(url).toBe(`${API_BASE}/users/me/xp`);
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
    expect(JSON.parse(init.body as string)).toEqual({ amount: 50, reason: 'lesson-completed' });
    expect(result.totalXP).toBe(650);
  });

  it('getAllBadges → GET /api/v1/badges', async () => {
    fetchMock.mockResolvedValueOnce(okResponse([{ id: 'sorting-champion', name: 'Sorting Champion', description: 'd', icon: 'zap', color: '#F59E0B', xpRequired: 300 }]));

    const badges = await gamificationApi.getAllBadges();

    const [url] = lastFetchCall();
    expect(url).toBe(`${API_BASE}/badges`);
    expect(badges).toHaveLength(1);
    expect(badges[0].id).toBe('sorting-champion');
  });

  it('getMyBadges → GET /api/v1/badges/my', async () => {
    fetchMock.mockResolvedValueOnce(okResponse([]));

    await gamificationApi.getMyBadges();

    const [url] = lastFetchCall();
    expect(url).toBe(`${API_BASE}/badges/my`);
  });

  it('checkNewBadges → POST /api/v1/badges/check (không body)', async () => {
    fetchMock.mockResolvedValueOnce(okResponse([{ id: 'streak-warrior', name: 'Streak Warrior', description: 'd', icon: 'fire', color: '#FF007F', xpRequired: 200 }]));

    const newBadges = await gamificationApi.checkNewBadges();

    const [url, init] = lastFetchCall();
    expect(url).toBe(`${API_BASE}/badges/check`);
    expect(init.method).toBe('POST');
    expect(init.body).toBeUndefined();
    expect(newBadges[0].id).toBe('streak-warrior');
  });

  it('403 → throw ApiError giữ status (để store phân biệt lỗi auth)', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      json: async () => ({ status: 403, title: 'Forbidden', detail: 'Forbidden' }),
    } as unknown as Response);

    await expect(gamificationApi.getUserProgress()).rejects.toMatchObject({ status: 403 });
  });
});
