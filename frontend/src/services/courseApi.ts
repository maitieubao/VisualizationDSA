import { api } from './apiClient';

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

export const courseApi = {
  createCourse: (data: CreateCourseDto) => api.post('/concepts/courses', data),
  addModule: (courseId: string, data: AddModuleDto) => api.post(`/concepts/courses/${courseId}/modules`, data),
  addModuleItem: (moduleId: string, data: AddModuleItemDto) => api.post(`/concepts/modules/${moduleId}/items`, data),
  getCourseById: (id: string) => api.get(`/courses/${id}`),
};
