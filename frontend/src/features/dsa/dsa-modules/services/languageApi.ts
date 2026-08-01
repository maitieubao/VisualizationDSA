import { api } from '@/services/apiClient';

export interface LanguageSelectionRequest {
    language: string;
}

export const languageApi = {
    getRoadmapLanguage: async (roadmapId: string): Promise<string | null> => {
        const response = await api.get<{ language: string }>(`/roadmaps/${roadmapId}/language`);
        return response.language;
    },
    
    setRoadmapLanguage: async (roadmapId: string, language: string): Promise<void> => {
        await api.put(`/roadmaps/${roadmapId}/language`, { language } as LanguageSelectionRequest);
    }
};
