import { api } from './apiClient';

export interface ClassroomDto {
    id: string;
    name: string;
    roadmapId: string;
    teacherId: string;
    joinCode: string;
    createdAt: string;
}

export interface StudentAnalyticsDto {
    studentId: string;
    studentName: string;
    email: string;
    joinedAt: string;
    totalXP: number;
    currentLevel: number;
    lessonsCompleted: number;
    lastActiveDate: string | null;
    isInactive: boolean;
}

export interface ClassroomAnalyticsDto {
    classroomId: string;
    classroomName: string;
    roadmapName: string;
    totalStudents: number;
    activeStudents: number;
    averageXP: number;
    students: StudentAnalyticsDto[];
}

import { useAuthStore } from '@/features/auth/store/useAuthStore';

class ClassroomService {
    async createClassroom(name: string, roadmapId: string): Promise<ClassroomDto> {
        return await api.post<ClassroomDto>('/classrooms', { name, roadmapId });
    }

    async joinClassroom(joinCode: string): Promise<ClassroomDto> {
        return await api.post<ClassroomDto>('/classrooms/join', { joinCode });
    }

    async getMyClassrooms(): Promise<ClassroomDto[]> {
        return await api.get<ClassroomDto[]>('/classrooms');
    }

    async getDetails(classroomId: string): Promise<ClassroomDto> {
        return await api.get<ClassroomDto>(`/classrooms/${classroomId}`);
    }

    async deleteClassroom(classroomId: string): Promise<void> {
        return await api.delete(`/classrooms/${classroomId}`);
    }

    async kickStudent(classroomId: string, studentId: string): Promise<void> {
        return await api.delete(`/classrooms/${classroomId}/members/${studentId}`);
    }

    async regenerateJoinCode(classroomId: string): Promise<{ joinCode: string }> {
        return await api.post<{ joinCode: string }>(`/classrooms/${classroomId}/regenerate-code`);
    }

    async getAnalytics(classroomId: string): Promise<ClassroomAnalyticsDto> {
        return await api.get<ClassroomAnalyticsDto>(`/classrooms/${classroomId}/analytics`);
    }

    async exportAnalytics(classroomId: string): Promise<Blob> {
        const authStore = useAuthStore();
        const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055') + '/api/v1';
        const response = await fetch(`${API_BASE_URL}/classrooms/${classroomId}/export`, {
            headers: { 'Authorization': `Bearer ${authStore.accessToken}` }
        });
        return await response.blob();
    }
}

export default new ClassroomService();
