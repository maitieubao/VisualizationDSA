<template>
  <div class="profile-view p-4 md:p-8 max-w-6xl mx-auto min-h-screen text-white">
    <!-- Header -->
    <header class="flex items-center gap-4 mb-8">
      <button @click="router.push('/dashboard')" class="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>
      <h1 class="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
        Hồ Sơ Của Tôi
      </h1>
    </header>

    <!-- Tabs -->
    <div class="flex border-b border-white/10 mb-8 overflow-x-auto scrollbar-none">
      <button 
        @click="activeTab = 'profile'"
        class="px-6 py-3 font-semibold whitespace-nowrap transition-colors border-b-2"
        :class="activeTab === 'profile' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-white'"
      >
        Thông tin cá nhân
      </button>
      <button 
        v-if="!authStore.isTeacher && !authStore.isAdmin"
        @click="activeTab = 'teacher-app'"
        class="px-6 py-3 font-semibold whitespace-nowrap transition-colors border-b-2"
        :class="activeTab === 'teacher-app' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-white'"
      >
        Đăng ký Giảng Viên
      </button>
    </div>

    <!-- TAB 1: PROFILE -->
    <ProfilePersonalTab v-if="activeTab === 'profile'" />

    <!-- TAB 2: TEACHER APPLICATION -->
    <ProfileTeacherTab v-else-if="activeTab === 'teacher-app'" />

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import ProfilePersonalTab from '@/features/profile/components/ProfilePersonalTab.vue';
import ProfileTeacherTab from '@/features/profile/components/ProfileTeacherTab.vue';

const router = useRouter();
const authStore = useAuthStore();
const activeTab = ref('profile');

</script>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
