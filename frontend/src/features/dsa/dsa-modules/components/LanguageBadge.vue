<script setup lang="ts">
import { computed, ref } from 'vue';
import { useLanguageStore } from '../store/languageStore';

const languageStore = useLanguageStore();

const languages = [
    { id: 'cpp', name: 'C++' },
    { id: 'java', name: 'Java' },
    { id: 'python', name: 'Python' },
    { id: 'javascript', name: 'JavaScript' }
];

const currentLangName = computed(() => {
    if (!languageStore.currentLanguage) return 'Chưa chọn';
    const lang = languages.find(l => l.id === languageStore.currentLanguage);
    return lang ? lang.name : languageStore.currentLanguage;
});

const isDropdownOpen = ref(false);

const toggleDropdown = () => {
    isDropdownOpen.value = !isDropdownOpen.value;
};

const selectLanguage = async (langId: string) => {
    if (languageStore.currentLanguage !== langId) {
        await languageStore.updateLanguage(langId);
    }
    isDropdownOpen.value = false;
};
</script>

<template>
    <div class="relative">
        <button 
            @click="toggleDropdown"
            class="flex items-center space-x-2 px-3 py-1.5 bg-bg-hover border border-border-default rounded-lg hover:bg-bg-hover hover:border-accent transition-colors"
        >
            <span class="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold border border-blue-500/30">
                {{ currentLangName[0] }}
            </span>
            <span class="text-sm font-medium text-text-primary">{{ currentLangName }}</span>
            <svg class="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
        </button>

        <!-- Dropdown menu -->
        <div 
            v-if="isDropdownOpen" 
            class="absolute right-0 mt-2 w-48 bg-bg-hover border border-border-default rounded-xl shadow-xl z-50 overflow-hidden"
        >
            <div class="p-1">
                <button
                    v-for="lang in languages"
                    :key="lang.id"
                    @click="selectLanguage(lang.id)"
                    class="w-full text-left px-4 py-2 text-sm rounded-lg transition-colors flex items-center space-x-3"
                    :class="languageStore.currentLanguage === lang.id ? 'bg-blue-500/10 text-blue-400' : 'text-text-secondary hover:bg-bg-hover'"
                >
                    <div 
                        class="w-2 h-2 rounded-full" 
                        :class="languageStore.currentLanguage === lang.id ? 'bg-blue-400' : 'bg-transparent'"
                    ></div>
                    <span>{{ lang.name }}</span>
                </button>
            </div>
        </div>
        
        <!-- Backdrop để đóng dropdown khi click ra ngoài -->
        <div 
            v-if="isDropdownOpen" 
            @click="isDropdownOpen = false" 
            class="fixed inset-0 z-40"
        ></div>
    </div>
</template>
