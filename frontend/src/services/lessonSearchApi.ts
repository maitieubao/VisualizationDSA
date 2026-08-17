import { api } from '../apiClient';

export interface LessonSearchResult {
  id: string;
  title: string;
  sandboxType?: string;
  xpReward?: number;
  publishStatus?: number;
  createdAt?: string;
}

// F4 (FR-2.5): tìm kiếm bài học — backend lọc Title chứa từ khóa (case-insensitive).
export const lessonSearchApi = {
  async search(query: string): Promise<LessonSearchResult[]> {
    const encoded = encodeURIComponent(query.trim());
    return api.get<LessonSearchResult[]>(`/concepts/lessons?search=${encoded}`);
  },
};
