/**
 * statelessGamificationApi.ts — Frontend service for stateless gamification backend endpoints.
 * Calls /api/v1/concepts/gamification/* which works WITHOUT database.
 * Manages demo XP, badges, and mock leaderboard.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

export interface StatelessUserProfile {
  userId: string;
  username: string;
  totalXp: number;
  currentLevel: number;
  levelName: string;
  streakDays: number;
  earnedBadges: StatelessBadge[];
  recentActivity: StatelessXpEvent[];
}

export interface StatelessBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: string;
}

export interface StatelessXpEvent {
  type: string;
  amount: number;
  description: string;
  timestamp: string;
}

export interface StatelessLeaderboardEntry {
  rank: number;
  username: string;
  totalXp: number;
  level: number;
  levelName: string;
  badgeCount: number;
  streakDays: number;
}

export const statelessGamificationApi = {
  /** Fetch user profile (XP, level, badges, activity) */
  async getProfile(): Promise<StatelessUserProfile> {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/gamification/profile`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  /** Award XP to demo user */
  async awardXp(amount: number, reason: string): Promise<StatelessUserProfile> {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/gamification/award-xp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, reason }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  /** Fetch all badges (with earned status) */
  async getBadges(): Promise<StatelessBadge[]> {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/gamification/badges`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  /** Fetch mock leaderboard */
  async getLeaderboard(limit: number = 10): Promise<StatelessLeaderboardEntry[]> {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/gamification/leaderboard?limit=${limit}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  /** Fetch gamification config (levels, badges, XP events) */
  async getConfig(): Promise<Record<string, unknown>> {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/gamification/config`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
};
