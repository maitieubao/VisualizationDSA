import { useAuthStore } from '../../auth/store/useAuthStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

export interface StatelessUserProfile {
  userId: string;
  username: string;
  totalXp: number;
  currentLevel: number;
  levelName: string;
  streakDays: number;
  /** Số lượt Streak Freeze còn lại — GM-023: nếu backend không gửi, store dùng MAX_STREAK_FREEZES. */
  streakFreezes?: number;
  /** Ngày hoạt động gần nhất (YYYY-MM-DD, giờ UTC) — GM-014: ưu tiên dữ liệu thật từ server. */
  lastActiveDate?: string;
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

/** Lấy access token đang hoạt động (backend xác định user từ token). */
function getAuthToken(): string | null {
  try {
    const fromStore = useAuthStore().getAccessToken();
    if (fromStore) return fromStore;
  } catch {
    // Pinia chưa active (test edge)
  }
  return localStorage.getItem('token');
}

export const statelessGamificationApi = {
  async getProfile(): Promise<StatelessUserProfile> {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/gamification/profile`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  async awardXp(amount: number, reason: string): Promise<StatelessUserProfile> {
    // Endpoint yêu cầu Teacher/Admin (chống tự cày XP) — phải gửi token.
    const token = getAuthToken();
    const res = await fetch(`${BASE_URL}/api/v1/concepts/gamification/award-xp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ amount, reason }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  async getBadges(): Promise<StatelessBadge[]> {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/gamification/badges`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  async getLeaderboard(limit: number = 10): Promise<StatelessLeaderboardEntry[]> {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/gamification/leaderboard?limit=${limit}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  async getConfig(): Promise<Record<string, unknown>> {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/gamification/config`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
};
