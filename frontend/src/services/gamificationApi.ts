import { api } from './apiClient';

// GM-002: đồng bộ endpoint với backend — UserProgressDto có CurrentStreak + Badges {Id,...}
// (UsersController.cs:70-91), endpoint thật là /users/me/progress và /users/me/xp.
export interface UserProgressResponse {
  totalXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  levelProgressPercent: number;
  badgesEarned: number;
  modulesCompleted: number;
  currentStreak: number;
  /** GM-008: lastActiveDate thật từ server (UTC yyyy-MM-dd) — streak server là source of truth. */
  lastActiveDate?: string | null;
  completedModuleIds: string[];
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    earnedAt: string;
  }>;
  isPremium: boolean;
}

export interface XPAwardResponse {
  message: string;
  totalXP: number;
  currentLevel: number;
}

export interface BadgeResponse {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  xpRequired: number;
}

export const gamificationApi = {
  getUserProgress: () =>
    api.get<UserProgressResponse>('/users/me/progress'),

  awardXP: (amount: number, reason: string) =>
    api.post<XPAwardResponse>('/users/me/xp', { amount, reason }),

  getAllBadges: () =>
    api.get<BadgeResponse[]>('/badges'),

  getMyBadges: () =>
    api.get<BadgeResponse[]>('/badges/my'),

  checkNewBadges: () =>
    api.post<BadgeResponse[]>('/badges/check'),
};
