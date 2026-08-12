import { api } from './apiClient';
import type { Course } from '../features/courses/types/course.types';

export interface CreateCourseDto {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  isPremium: boolean;
  coverImageUrl: string;
  isPublished: boolean;
}

export interface AddModuleDto {
  title: string;
  description: string;
  orderIndex: number;
}

export interface AddModuleItemDto {
  itemType: string;
  lessonId?: string | null;
  quizId?: string | null;
  codelabId?: string | null;
  overrideTitle: string;
  orderIndex: number;
  isRequired: boolean;
}

/** Query params mà backend `GET /concepts/courses` hỗ trợ (LM-032). */
export interface CourseQueryParams {
  category?: string;
  difficulty?: string;
}

export const courseApi = {
  getCourses: (params?: CourseQueryParams) => {
    // Chỉ nối query khi có giá trị thực — giữ URL gọn khi gọi không tham số.
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'All') query.set('category', params.category);
    if (params?.difficulty && params.difficulty !== 'All') query.set('difficulty', params.difficulty);
    const qs = query.toString();
    return api.get<Course[]>(`/concepts/courses${qs ? `?${qs}` : ''}`);
  },
  getCourseById: (id: string) => api.get<Course>(`/concepts/courses/${id}`),
  createCourse: (data: CreateCourseDto) => api.post<{ courseId: string; message: string }>('/concepts/courses', data),
  addModule: (courseId: string, data: AddModuleDto) => api.post<{ moduleId: string; message: string }>(`/concepts/courses/${courseId}/modules`, data),
  addModuleItem: (moduleId: string, data: AddModuleItemDto) => api.post<{ message: string }>(`/concepts/modules/${moduleId}/items`, data),
};
