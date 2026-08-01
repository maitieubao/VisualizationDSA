import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { languageApi } from '@/features/dsa/dsa-modules/services/languageApi';

export const useLanguageStore = defineStore('language', () => {
    // Lưu roadmapId hiện tại để lấy đúng ngôn ngữ
    const currentRoadmapId = ref<string | null>(null);
    
    // Ngôn ngữ hiện tại của roadmap đang học
    const currentLanguage = ref<string | null>(null);
    
    // Đánh dấu xem đang trong trạng thái loading hay không
    const isLoading = ref<boolean>(false);
    
    // Đánh dấu xem modal chọn ngôn ngữ có đang hiện không
    const isModalOpen = ref<boolean>(false);
    
    // Map lưu cache client side: Record<roadmapId, language>
    const preferences = ref<Record<string, string>>({});

    const setRoadmap = async (roadmapId: string) => {
        currentRoadmapId.value = roadmapId;
        
        // Check cache
        if (preferences.value[roadmapId]) {
            currentLanguage.value = preferences.value[roadmapId];
            return;
        }

        try {
            isLoading.value = true;
            const lang = await languageApi.getRoadmapLanguage(roadmapId);
            
            if (lang) {
                currentLanguage.value = lang;
                preferences.value[roadmapId] = lang;
                isModalOpen.value = false;
            } else {
                currentLanguage.value = null;
                // Force open modal vì chưa có ngôn ngữ
                isModalOpen.value = true;
            }
        } catch (error) {
            console.error('Lỗi khi lấy ngôn ngữ:', error);
        } finally {
            isLoading.value = false;
        }
    };

    const updateLanguage = async (language: string) => {
        if (!currentRoadmapId.value) return;

        // Cập nhật optimistic
        currentLanguage.value = language;
        preferences.value[currentRoadmapId.value] = language;
        isModalOpen.value = false;

        try {
            await languageApi.setRoadmapLanguage(currentRoadmapId.value, language);
        } catch (error) {
            console.error('Lỗi khi lưu ngôn ngữ:', error);
        }
    };

    return {
        currentRoadmapId,
        currentLanguage,
        isLoading,
        isModalOpen,
        setRoadmap,
        updateLanguage
    };
});
