<script setup lang="ts">
import { computed } from 'vue';
import { useLanguageStore } from '../store/languageStore';

const languageStore = useLanguageStore();

const isOpen = computed(() => languageStore.isModalOpen);

const selectLanguage = async (lang: string) => {
    await languageStore.updateLanguage(lang);
};

const languages = [
    { id: 'cpp', name: 'C++', icon: 'cplusplus' },
    { id: 'java', name: 'Java', icon: 'java' },
    { id: 'python', name: 'Python', icon: 'python' },
    { id: 'javascript', name: 'JavaScript', icon: 'javascript' }
];
</script>

<template>
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div class="bg-bg-hover border border-border-default rounded-xl p-8 max-w-lg w-full mx-4 shadow-2xl relative overflow-hidden">
            <!-- Decorative gradient -->
            <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-accent to-accent-purple"></div>
            
            <div class="text-center mb-8">
                <h2 class="text-3xl font-bold text-text-primary mb-3">Chọn ngôn ngữ lập trình</h2>
                <p class="text-text-secondary">
                    Bạn có thể thay đổi lại ngôn ngữ bất kỳ lúc nào trong quá trình học.
                </p>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <button 
                    v-for="lang in languages" 
                    :key="lang.id"
                    @click="selectLanguage(lang.id)"
                    class="group relative flex flex-col items-center justify-center p-6 bg-bg-hover/50 border border-border-default rounded-xl hover:bg-bg-hover hover:border-accent transition-all duration-300"
                >
                    <div class="absolute inset-0 bg-blue-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <!-- Icon placeholder (thay bằng icon thật nếu có) -->
                    <div class="w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-bg-hover border border-border-default group-hover:border-accent/50 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all">
                        <span class="text-2xl font-bold text-text-secondary group-hover:text-blue-400">{{ lang.name[0] }}</span>
                    </div>
                    <span class="text-lg font-medium text-text-primary group-hover:text-text-primary">{{ lang.name }}</span>
                </button>
            </div>
            
            <div v-if="languageStore.isLoading" class="absolute inset-0 bg-bg-secondary/50 flex items-center justify-center rounded-xl">
                <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent"></div>
            </div>
        </div>
    </div>
</template>
