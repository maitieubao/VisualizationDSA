import { api } from './apiClient';

export interface LeaderboardEntryDto {
  rank: number;
  username: string;
  totalXP: number;
  currentLevel: number;
  badgeCount: number;
}

export const leaderboardApi = {
  getTopPlayers: (top: number = 10) =>
    api.get<LeaderboardEntryDto[]>(`/leaderboard?top=${top}`),
};
