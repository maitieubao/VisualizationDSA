import { api } from './apiClient';

/** F8 (FR-4.11, FR-4.3) — Practice Ladder 3 bậc: contract LadderController. */
export const STAGE_QUIZ = 1;
export const STAGE_LAB = 2;
export const STAGE_CODE = 3;

/** 0 = khóa, 1 = mở, 2 = đã pass (khớp StageProgress.Status). */
export type StageStatus = 0 | 1 | 2;

export interface LabOperationDto {
  fromIndex: number;
  toIndex: number;
}

export interface PassStagePayload {
  quizAttemptId?: string;
  operations?: LabOperationDto[];
  finalArray?: number[];
  codelabSubmissionId?: string;
}

export interface LadderStageDto {
  stage: number;
  status: StageStatus;
  passed: boolean;
  bestScore: number | null;
  passedAt: string | null;
  quizId: string | null;
  codelabId: string | null;
  lab: { input: number[]; maxSwaps: number } | null;
}

export interface LadderResponse {
  lessonId: string;
  stages: LadderStageDto[];
}

export interface PassStageResponse {
  passed: boolean;
  stage: number;
  bestScore: number;
}

export const ladderApi = {
  getLadder: (lessonId: string) =>
    api.get<LadderResponse>(`/ladder/${encodeURIComponent(lessonId)}`),
  passStage: (lessonId: string, stage: number, payload: PassStagePayload) =>
    api.post<PassStageResponse>(
      `/ladder/${encodeURIComponent(lessonId)}/stage/${stage}/pass`,
      payload,
    ),
};
