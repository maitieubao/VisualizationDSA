import { api } from './apiClient';

export interface LearningProgressDto {
  moduleId: string;
  completedAt: string;
  timeSpentMinutes: number;
}

export interface CompleteModuleResponse {
  message: string;
  moduleId: string;
}

export const learningProgressApi = {
  getMyProgress: () =>
    api.get<LearningProgressDto[]>('/learning-progress'),

  completeModule: (moduleId: string) =>
    api.post<CompleteModuleResponse>('/learning-progress/complete', { moduleId }),
};
