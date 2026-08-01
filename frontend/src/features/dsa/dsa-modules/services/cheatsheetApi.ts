import { api } from '@/services/apiClient';

export interface CheatSheetSnippet {
    language: string;
    dataStructure: string;
    codeSnippet: string;
    explanation?: string;
}

export const cheatsheetApi = {
    getSnippet: async (lang: string, structure: string): Promise<CheatSheetSnippet> => {
        const response = await api.get<CheatSheetSnippet>(`/cheatsheet?lang=${encodeURIComponent(lang)}&structure=${encodeURIComponent(structure)}`);
        return response;
    }
};
