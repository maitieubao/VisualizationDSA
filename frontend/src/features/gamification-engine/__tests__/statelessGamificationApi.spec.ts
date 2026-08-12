// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { statelessGamificationApi } from '../service/statelessGamificationApi';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';
const GAMI_BASE = `${BASE_URL}/api/v1/concepts/gamification`;

const fetchMock = vi.fn();

function lastFetchCall(): [string, RequestInit | undefined] {
  const call = fetchMock.mock.calls[fetchMock.mock.calls.length - 1] as unknown as [string, RequestInit | undefined];
  return call;
}

function okResponse(body: unknown) {
  return { ok: true, status: 200, json: async () => body } as unknown as Response;
}

function headerOf(init: RequestInit | undefined, name: string): string | undefined {
  const headers = init?.headers as Record<string, string> | undefined;
  return headers?.[name];
}

const profileResponse = {
  userId: 'user-a',
  username: 'alice',
  totalXp: 1200,
  currentLevel: 3,
  levelName: 'Explorer',
  streakDays: 4,
  earnedBadges: [
    { id: 'sorting-champion', name: 'Sorting Champion', description: 'd', icon: 'zap', color: '#F59E0B', earnedAt: '2026-08-01T00:00:00Z' },
  ],
  recentActivity: [],
};

describe('statelessGamificationApi — contract StatelessGamificationController (GM-031)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('getProfile → GET /api/v1/concepts/gamification/profile + map response', async () => {
    fetchMock.mockResolvedValueOnce(okResponse(profileResponse));

    const profile = await statelessGamificationApi.getProfile();

    const [url, init] = lastFetchCall();
    expect(url).toBe(`${GAMI_BASE}/profile`);
    expect(init?.method ?? 'GET').toBe('GET');
    expect(profile.totalXp).toBe(1200);
    expect(profile.streakDays).toBe(4);
    expect(profile.earnedBadges[0].id).toBe('sorting-champion');
  });

  it('awardXp → POST /api/v1/concepts/gamification/award-xp + Bearer token + body {amount, reason}', async () => {
    const auth = useAuthStore();
    auth.accessToken = 'st-token-1';
    fetchMock.mockResolvedValueOnce(okResponse(profileResponse));

    const result = await statelessGamificationApi.awardXp(100, 'Hoàn thành Quiz: Quick Sort');

    const [url, init] = lastFetchCall();
    expect(url).toBe(`${GAMI_BASE}/award-xp`);
    expect(init?.method).toBe('POST');
    expect(headerOf(init, 'Content-Type')).toBe('application/json');
    expect(headerOf(init, 'Authorization')).toBe('Bearer st-token-1');
    expect(JSON.parse(init?.body as string)).toEqual({ amount: 100, reason: 'Hoàn thành Quiz: Quick Sort' });
    expect(result.totalXp).toBe(1200);
  });

  it('awardXp không có token → không gắn Authorization', async () => {
    fetchMock.mockResolvedValueOnce(okResponse(profileResponse));

    await statelessGamificationApi.awardXp(50, 'quiz-complete');

    const [, init] = lastFetchCall();
    expect(headerOf(init, 'Authorization')).toBeUndefined();
  });

  it('getBadges → GET /api/v1/concepts/gamification/badges', async () => {
    fetchMock.mockResolvedValueOnce(okResponse([]));

    const badges = await statelessGamificationApi.getBadges();

    const [url] = lastFetchCall();
    expect(url).toBe(`${GAMI_BASE}/badges`);
    expect(badges).toEqual([]);
  });

  it('getLeaderboard(5) → GET /api/v1/concepts/gamification/leaderboard?limit=5', async () => {
    fetchMock.mockResolvedValueOnce(okResponse([{ rank: 1, username: 'alice', totalXp: 1500, level: 4, levelName: 'Explorer', badgeCount: 3, streakDays: 7 }]));

    const entries = await statelessGamificationApi.getLeaderboard(5);

    const [url] = lastFetchCall();
    expect(url).toBe(`${GAMI_BASE}/leaderboard?limit=5`);
    expect(entries[0].username).toBe('alice');
  });

  it('getConfig → GET /api/v1/concepts/gamification/config', async () => {
    fetchMock.mockResolvedValueOnce(okResponse({ maxStreakFreezes: 3 }));

    const config = await statelessGamificationApi.getConfig();

    const [url] = lastFetchCall();
    expect(url).toBe(`${GAMI_BASE}/config`);
    expect(config).toMatchObject({ maxStreakFreezes: 3 });
  });

  it('403 → throw Error("HTTP 403")', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 403 } as unknown as Response);

    await expect(statelessGamificationApi.awardXp(50, 'quiz-complete')).rejects.toThrow('HTTP 403');
  });
});
