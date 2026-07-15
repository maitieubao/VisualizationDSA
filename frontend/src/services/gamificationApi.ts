import { api } from './apiClient';

export interface UserProgressResponse {
  totalXP: number;
  currentLevel: number;
  streakDays: number;
  badges: Array<{
    badgeId: string;
    earnedAt: string;
  }>;
  completedModules: Array<{
    moduleId: string;
    completedAt: string;
  }>;
}

export interface XPAwardResponse {
  message: string;
  totalXP: number;
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
    api.get<UserProgressResponse>('/users/progress'),

  awardXP: (amount: number, reason: string) =>
    api.post<XPAwardResponse>('/users/xp', { amount, reason }),

  getAllBadges: () =>
    api.get<BadgeResponse[]>('/badges'),

  getMyBadges: () =>
    api.get<BadgeResponse[]>('/badges/my'),

  checkNewBadges: () =>
    api.post<BadgeResponse[]>('/badges/check'),
};
