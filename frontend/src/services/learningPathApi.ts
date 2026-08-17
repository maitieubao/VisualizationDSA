import { api } from './apiClient';

/** F9 (FR-2.10, FR-10.1) — Learning Path + Tim: contract LearningPathController. */

/** 0 = khóa, 1 = mở (đang học), 2 = đã pass (khớp UserNodeProgress.Status). */
export type NodeStatus = 0 | 1 | 2;

export interface LearningPathSummaryDto {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  nodeCount: number;
}

export interface NodeSessionDto {
  startedAt: string;
  expiresAt: string;
  isActive: boolean;
}

export interface LearningPathNodeDto {
  id: string;
  learningPathId: string;
  orderIndex: number;
  title: string;
  lessonId: string | null;
  status: NodeStatus;
  stars: number;
  nodeScore: number | null;
  unlockedAt: string | null;
  passedAt: string | null;
  session: NodeSessionDto | null;
}

export interface LearningPathMapDto {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  hearts: number;
  heartsMax: number;
  nextHeartAt: string | null;
  nodes: LearningPathNodeDto[];
}

export interface EnterNodeResponse {
  message: string;
  resumed: boolean;
  hearts: number;
  heartsMax: number;
  session: { startedAt: string; expiresAt: string };
}

export interface PassNodeResponse {
  message: string;
  nodeId: string;
  status: number;
  stars: number;
  nodeScore: number | null;
  passedAt: string | null;
  nextNodeUnlocked: string | null;
  xpAwarded: number;
  totalXp: number;
}

export interface PassNodePayload {
  stars?: number;
  nodeScore?: number;
}

export const learningPathApi = {
  getLearningPaths: () =>
    api.get<LearningPathSummaryDto[]>('/learning-paths'),
  getLearningPath: (pathId: string) =>
    api.get<LearningPathMapDto>(`/learning-paths/${encodeURIComponent(pathId)}`),
  enterNode: (pathId: string, nodeId: string) =>
    api.post<EnterNodeResponse>(
      `/learning-paths/${encodeURIComponent(pathId)}/nodes/${encodeURIComponent(nodeId)}/enter`,
    ),
  passNode: (pathId: string, nodeId: string, payload?: PassNodePayload) =>
    api.post<PassNodeResponse>(
      `/learning-paths/${encodeURIComponent(pathId)}/nodes/${encodeURIComponent(nodeId)}/pass`,
      payload ?? {},
    ),
};
