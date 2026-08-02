import { api } from './apiClient';

export interface DailyQuestDto {
  id: string;
  type: string;
  title: string;
  description: string;
  targetCount: number;
  currentProgress: number;
  xpReward: number;
  gemsReward: number;
  isCompleted: boolean;
  isRewardClaimed: boolean;
}

export const dailyQuestsApi = {
  getMyDailyQuests: () =>
    api.get<DailyQuestDto[]>('/dailyquests/me'),

  claimQuestReward: (questId: string) =>
    api.post<DailyQuestDto>(`/dailyquests/${questId}/claim`),
};
