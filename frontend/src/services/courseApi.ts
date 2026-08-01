import apiClient from './apiClient';

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
  createCourse: (data: CreateCourseDto) => apiClient.post('/concepts/courses', data),
  addModule: (courseId: string, data: AddModuleDto) => apiClient.post(`/concepts/courses/${courseId}/modules`, data),
  addModuleItem: (moduleId: string, data: AddModuleItemDto) => apiClient.post(`/concepts/modules/${moduleId}/items`, data),
};
