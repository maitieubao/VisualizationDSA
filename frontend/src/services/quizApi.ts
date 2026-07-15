import { api } from './apiClient';

export interface QuizDto {
  id: string;
  title: string;
  topic: string;
  questions: QuizQuestionDto[];
  passingScore: number;
  xpReward: number;
}

export interface QuizQuestionDto {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface QuizAttemptRequest {
  quizId: string;
  answers: number[];
}

export interface QuizAttemptResult {
  score: number;
  maxScore: number;
  passed: boolean;
  xpAwarded: number;
  correctAnswers: number[];
}

export interface QuizHistoryEntry {
  quizId: string;
  quizTitle: string;
  score: number;
  maxScore: number;
  passed: boolean;
  attemptedAt: string;
}

export const quizApi = {
  getAll: () =>
    api.get<QuizDto[]>('/quizzes'),

  getById: (id: string) =>
    api.get<QuizDto>(`/quizzes/${id}`),

  getByTopic: (topic: string) =>
    api.get<QuizDto[]>(`/quizzes/topic/${encodeURIComponent(topic)}`),

  submitAttempt: (request: QuizAttemptRequest) =>
    api.post<QuizAttemptResult>('/quizzes/attempt', request),

  getHistory: () =>
    api.get<QuizHistoryEntry[]>('/quizzes/history'),
};
