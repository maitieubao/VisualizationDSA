import { api } from './apiClient';

export interface CustomNodeDto {
  id: string;
  roadmapId: string;
  name: string;
  description: string;
  difficulty: string;
  contentJson: string;
  videoUrl?: string;
  visualizerId?: string;
  quizId?: string;
  labId?: string;
  leetCodeId?: string;
  sortOrder: number;
  isComplete: boolean;
  officialApproach?: string;
  officialSolution?: string;
  complexityNote?: string;
}

export interface CustomRoadmapDto {
  id: string;
  teacherId: string;
  name: string;
  description: string;
  tags: string;
  thumbnailUrl?: string;
  visibility: string;
  status: string;
  adminRejectReason?: string;
  createdAt: string;
  nodes: CustomNodeDto[];
}

export const teacherStudioService = {
  // Roadmaps
  getMyRoadmaps(): Promise<CustomRoadmapDto[]> {
    return api.get('/teacher-studio/roadmaps');
  },
  
  createRoadmap(data: { name: string; description: string; tags: string; thumbnailUrl?: string; visibility: string }): Promise<CustomRoadmapDto> {
    return api.post('/teacher-studio/roadmaps', data);
  },
  
  updateRoadmap(id: string, data: { name: string; description: string; tags: string; thumbnailUrl?: string; visibility: string }): Promise<CustomRoadmapDto> {
    return api.put(`/teacher-studio/roadmaps/${id}`, data);
  },
  
  deleteRoadmap(id: string): Promise<void> {
    return api.delete(`/teacher-studio/roadmaps/${id}`);
  },
  
  publishRoadmap(id: string, visibility: string): Promise<CustomRoadmapDto> {
    return api.post(`/teacher-studio/roadmaps/${id}/publish`, { visibility });
  },

  // Nodes
  addNode(roadmapId: string, data: { name: string; description: string; difficulty: string; sortOrder: number }): Promise<CustomNodeDto> {
    return api.post(`/teacher-studio/roadmaps/${roadmapId}/nodes`, data);
  },
  
  updateNodeContent(roadmapId: string, nodeId: string, data: { contentJson: string; videoUrl?: string; visualizerId?: string }): Promise<CustomNodeDto> {
    return api.put(`/teacher-studio/roadmaps/${roadmapId}/nodes/${nodeId}/content`, data);
  },
  
  updateNodePractice(roadmapId: string, nodeId: string, data: { quizId?: string; labId?: string; leetCodeId?: string }): Promise<CustomNodeDto> {
    return api.put(`/teacher-studio/roadmaps/${roadmapId}/nodes/${nodeId}/practice`, data);
  },
  
  deleteNode(roadmapId: string, nodeId: string): Promise<void> {
    return api.delete(`/teacher-studio/roadmaps/${roadmapId}/nodes/${nodeId}`);
  }
};
