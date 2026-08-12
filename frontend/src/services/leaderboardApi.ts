import { api } from './apiClient';

// GM-002: backend route thật là /leaderboard/top?limit= (LeaderboardController.cs:36-43).
export interface LeaderboardEntryDto {
  rank: number;
  userId: string;
  username: string;
  totalXP: number;
  level: number;
  streakDays: number;
  badgeCount: number;
}

export const leaderboardApi = {
  getTopPlayers: (top: number = 10) =>
    api.get<LeaderboardEntryDto[]>(`/leaderboard/top?limit=${top}`),
};
