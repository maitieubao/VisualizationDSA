// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { leaderboardApi } from '../../../services/leaderboardApi';

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055') + '/api/v1';

const fetchMock = vi.fn();

function lastFetchCall(): [string, RequestInit] {
  const call = fetchMock.mock.calls[fetchMock.mock.calls.length - 1] as [string, RequestInit];
  return call;
}

function okResponse(body: unknown) {
  return { ok: true, status: 200, json: async () => body } as unknown as Response;
}

describe('leaderboardApi — contract LeaderboardController (GM-031, GM-002)', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('GM-002: getTopPlayers(10) → GET /api/v1/leaderboard/top?limit=10', async () => {
    const entries = [
      { rank: 1, username: 'alice', totalXP: 1500, currentLevel: 4, badgeCount: 3 },
      { rank: 2, username: 'bob', totalXP: 1200, currentLevel: 3, badgeCount: 2 },
    ];
    fetchMock.mockResolvedValueOnce(okResponse(entries));

    const result = await leaderboardApi.getTopPlayers(10);

    const [url, init] = lastFetchCall();
    expect(url).toBe(`${API_BASE}/leaderboard/top?limit=10`);
    expect(init.method ?? 'GET').toBe('GET');
    expect(result).toEqual(entries);
    expect(result[0].username).toBe('alice');
  });

  it('getTopPlayers() mặc định limit=10', async () => {
    fetchMock.mockResolvedValueOnce(okResponse([]));

    await leaderboardApi.getTopPlayers();

    const [url] = lastFetchCall();
    expect(url).toBe(`${API_BASE}/leaderboard/top?limit=10`);
  });

  it('getTopPlayers(5) truyền đúng limit 5', async () => {
    fetchMock.mockResolvedValueOnce(okResponse([]));

    await leaderboardApi.getTopPlayers(5);

    const [url] = lastFetchCall();
    expect(url).toBe(`${API_BASE}/leaderboard/top?limit=5`);
  });

  it('403 → throw ApiError giữ status', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      json: async () => ({ status: 403, title: 'Forbidden', detail: 'Forbidden' }),
    } as unknown as Response);

    await expect(leaderboardApi.getTopPlayers()).rejects.toMatchObject({ status: 403 });
  });
});
