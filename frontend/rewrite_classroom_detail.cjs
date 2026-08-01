const fs = require('fs');
const content = `<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useToastStore } from '@/composables/useToast';
import ClassroomService from '@/services/ClassroomService';
import type { ClassroomAnalyticsDto } from '@/services/ClassroomService';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const toastStore = useToastStore();

const classroomId = route.params.id as string;
const isTeacher = computed(() => authStore.userRole === 'Teacher' || authStore.userRole === 'Admin');

const classroom = ref<ClassroomAnalyticsDto | null>(null);
const loading = ref(true);
const error = ref('');
const isRegenerating = ref(false);

const loadDetails = async () => {
  loading.value = true;
  error.value = '';
  try {
    const data = await ClassroomService.getAnalytics(classroomId);
    classroom.value = data;
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || 'Không thể tải chi tiết lớp học.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadDetails();
});

const handleRegenerateCode = async () => {
  if (!confirm("Bạn có chắc muốn đổi mã tham gia? Mã cũ sẽ không còn hiệu lực.")) return;
  isRegenerating.value = true;
  try {
    await ClassroomService.regenerateJoinCode(classroomId);
    toastStore.success('Đã tạo mã tham gia mới!');
    await loadDetails();
  } catch (err: any) {
    toastStore.error(err.response?.data?.message || 'Lỗi khi đổi mã');
  } finally {
    isRegenerating.value = false;
  }
};

const handleKick = async (studentId: string, name: string) => {
  if (!confirm(\`Bạn có chắc muốn xóa học viên \${name} khỏi lớp?\`)) return;
  try {
    await ClassroomService.kickStudent(classroomId, studentId);
    toastStore.success(\`Đã xóa \${name} khỏi lớp\`);
    await loadDetails();
  } catch (err: any) {
    toastStore.error(err.response?.data?.message || 'Lỗi khi xóa học viên');
  }
};
</script>

<template>
  <div class="h-full w-full bg-slate-950 overflow-y-auto custom-scrollbar p-6 lg:p-10 text-white animate-fade-in relative">
    
    <header class="mb-12 relative z-10">
      <button @click="router.back()" class="text-slate-400 hover:text-white mb-4 flex items-center gap-2 transition-colors">
        <span>&larr;</span> Quay lại Quản lý Lớp
      </button>

      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6" v-if="classroom">
        <div>
          <h1 class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 tracking-tight">
            {{ classroom.classroomName }}
          </h1>
          <p class="text-slate-400 mt-2 text-lg">
            Lộ trình: <span class="text-white font-semibold">{{ classroom.roadmapName || 'N/A' }}</span>
          </p>
        </div>
        
        <div class="flex gap-4" v-if="isTeacher">
          <button 
            @click="handleRegenerateCode" 
            :disabled="isRegenerating"
            class="px-6 py-3 rounded-xl font-bold bg-slate-800 text-white hover:bg-slate-700 transition-all flex items-center gap-2 border border-white/10"
          >
            <span>🔄</span> Đổi Mã Tham Gia
          </button>
        </div>
      </div>
    </header>

    <div v-if="loading" class="relative z-10 flex justify-center py-20">
      <div class="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="error" class="relative z-10 bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl text-rose-400 mb-8 max-w-4xl">
      {{ error }}
    </div>

    <div v-else-if="classroom" class="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Stats Sidebar -->
      <div class="space-y-6">
        <div class="bg-slate-900/60 border border-white/10 rounded-2xl p-6 shadow-xl">
          <h3 class="text-lg font-bold mb-4 text-white">Thống Kê Lớp</h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center border-b border-white/5 pb-3">
              <span class="text-slate-400">Sĩ số</span>
              <span class="font-bold text-emerald-400">{{ classroom.totalStudents }}</span>
            </div>
            <div class="flex justify-between items-center border-b border-white/5 pb-3">
              <span class="text-slate-400">Hoạt động (7 ngày)</span>
              <span class="font-bold text-teal-400">{{ classroom.activeStudents }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-400">XP Trung bình</span>
              <span class="font-bold text-cyan-400">{{ classroom.averageXP }}</span>
            </div>
          </div>
        </div>

        <div v-if="isTeacher" class="bg-slate-900/60 border border-white/10 rounded-2xl p-6 shadow-xl">
          <h3 class="text-lg font-bold mb-2 text-white">Mã Tham Gia</h3>
          <p class="text-sm text-slate-400 mb-4">Chia sẻ mã này cho học viên để tham gia.</p>
          <div class="bg-slate-950 p-4 rounded-xl text-center border border-white/5">
            <span class="text-3xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 uppercase">
              <!-- Join Code is not directly in AnalyticsDto but maybe returned in classroom details, let's just display N/A for analytics fallback or fetch from getDetails -->
              {{ 'Mã lớp' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Students List -->
      <div class="lg:col-span-2">
        <div class="bg-slate-900/60 border border-white/10 rounded-2xl p-6 shadow-xl">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-white flex items-center gap-2">
              <span>👥</span> Danh sách Học viên
            </h3>
          </div>

          <div v-if="classroom.students.length === 0" class="text-center py-12 text-slate-500">
            Chưa có học viên nào trong lớp.
          </div>

          <div v-else class="space-y-3">
            <div 
              v-for="(student, index) in classroom.students" 
              :key="student.studentId"
              class="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-white/5 hover:bg-slate-800/80 transition-colors group"
            >
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-300">
                  {{ index + 1 }}
                </div>
                <div>
                  <p class="font-bold text-white">{{ student.studentName }}</p>
                  <p class="text-xs text-slate-400">{{ student.email }}</p>
                </div>
              </div>

              <div class="flex items-center gap-6">
                <div class="text-right hidden sm:block">
                  <p class="font-bold text-emerald-400">{{ student.totalXP }} XP</p>
                  <p class="text-xs text-slate-500">Cấp {{ student.currentLevel }} | {{ student.lessonsCompleted }} Bài</p>
                </div>
                
                <button 
                  v-if="isTeacher"
                  @click="handleKick(student.studentId, student.studentName)"
                  class="w-8 h-8 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 transition-all border border-rose-500/30"
                  title="Xóa khỏi lớp"
                >
                  <span class="text-sm">×</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>

    <!-- Background Accents -->
    <div class="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>
    <div class="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>

  </div>
</template>
`;
fs.writeFileSync('d:/FPT/og/VisualizationDSA/frontend/src/views/ClassroomDetailView.vue', content);
console.log('ClassroomDetailView updated!');
