<script setup lang="ts">
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
const classroomDetails = ref<any>(null);
const loading = ref(true);
const error = ref('');
const isRegenerating = ref(false);

const loadDetails = async () => {
  loading.value = true;
  error.value = '';
  try {
    const [analyticsData, detailsData] = await Promise.all([
      ClassroomService.getAnalytics(classroomId),
      ClassroomService.getDetails(classroomId)
    ]);
    classroom.value = analyticsData;
    classroomDetails.value = detailsData;
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
  if (!confirm(`Bạn có chắc muốn xóa học viên ${name} khỏi lớp?`)) return;
  try {
    await ClassroomService.kickStudent(classroomId, studentId);
    toastStore.success(`Đã xóa ${name} khỏi lớp`);
    await loadDetails();
  } catch (err: any) {
    toastStore.error(err.response?.data?.message || 'Lỗi khi xóa học viên');
  }
};
</script>

<template>
  <div class="h-full w-full bg-bg-primary overflow-y-auto custom-scrollbar p-6 lg:p-10 text-text-primary animate-fade-in relative">
    
    <header class="mb-12 relative z-10">
      <button @click="router.back()" class="text-text-secondary hover:text-text-primary mb-4 flex items-center gap-2 transition-colors">
        <span>&larr;</span> Quay lại Quản lý Lớp
      </button>

      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6" v-if="classroom">
        <div>
          <h1 class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-green via-accent-cyan to-accent-cyan tracking-tight">
            {{ classroom.classroomName }}
          </h1>
          <p class="text-text-secondary mt-2 text-lg">
            Lộ trình: <span class="text-text-primary font-semibold">{{ classroom.roadmapName || 'N/A' }}</span>
          </p>
        </div>
        
        <div class="flex gap-4" v-if="isTeacher">
          <button 
            @click="handleRegenerateCode" 
            :disabled="isRegenerating"
            class="px-6 py-3 rounded-xl font-bold bg-bg-hover text-text-primary hover:bg-bg-hover transition-all flex items-center gap-2 border border-border-default"
          >
            <BaseIcon name="refresh" class="w-4 h-4" /> Đổi Mã Tham Gia
          </button>
        </div>
      </div>
    </header>

    <div v-if="loading" class="relative z-10 flex justify-center py-20">
      <div class="w-10 h-10 border-4 border-accent-green border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="error" class="relative z-10 bg-accent-red/10 border border-accent-red/30 p-4 rounded-xl text-accent-red mb-8 max-w-4xl">
      {{ error }}
    </div>

    <div v-else-if="classroom" class="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Stats Sidebar -->
      <div class="space-y-6">
        <div class="glass-panel p-6 rounded-2xl">
          <h3 class="text-lg font-bold mb-4 text-text-primary">Thống Kê Lớp</h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center border-b border-border-default pb-3">
              <span class="text-text-secondary">Sĩ số</span>
              <span class="font-bold text-accent-green">{{ classroom.totalStudents }}</span>
            </div>
            <div class="flex justify-between items-center border-b border-border-default pb-3">
              <span class="text-text-secondary">Hoạt động (7 ngày)</span>
              <span class="font-bold text-accent-cyan">{{ classroom.activeStudents }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-text-secondary">XP Trung bình</span>
              <span class="font-bold text-accent-cyan">{{ classroom.averageXP }}</span>
            </div>
          </div>
        </div>

        <div v-if="isTeacher" class="glass-panel p-6 rounded-2xl mt-6">
          <h3 class="text-lg font-bold mb-2 text-text-primary">Mã Tham Gia</h3>
          <p class="text-sm text-text-secondary mb-4">Chia sẻ mã này cho học viên để tham gia.</p>
          <div class="bg-bg-primary p-4 rounded-xl text-center border border-border-default">
            <span class="text-3xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-accent-light to-accent-purple uppercase">
              {{ classroomDetails?.joinCode || 'N/A' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Students List -->
      <div class="lg:col-span-2">
        <div class="glass-panel p-6 rounded-2xl">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-text-primary flex items-center gap-2">
              <BaseIcon name="users" class="w-5 h-5" /> Danh sách Học viên
            </h3>
          </div>

          <div v-if="classroom.students.length === 0" class="text-center py-12 text-text-muted">
            Chưa có học viên nào trong lớp.
          </div>

          <div v-else class="space-y-3">
            <div 
              v-for="(student, index) in classroom.students" 
              :key="student.studentId"
              class="flex items-center justify-between p-4 rounded-xl bg-bg-hover/40 border border-border-default hover:bg-bg-surface transition-colors group"
            >
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full bg-bg-hover flex items-center justify-center font-bold text-text-secondary">
                  {{ index + 1 }}
                </div>
                <div>
                  <p class="font-bold text-text-primary">{{ student.studentName }}</p>
                  <p class="text-xs text-text-secondary">{{ student.email }}</p>
                </div>
              </div>

              <div class="flex items-center gap-6">
                <div class="text-right hidden sm:block">
                  <p class="font-bold text-accent-green">{{ student.totalXP }} XP</p>
                  <p class="text-xs text-text-muted">Cấp {{ student.currentLevel }} | {{ student.lessonsCompleted }} Bài</p>
                </div>
                
                <button 
                  v-if="isTeacher"
                  @click="handleKick(student.studentId, student.studentName)"
                  class="w-8 h-8 rounded-full bg-accent-red/10 text-accent-red flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-accent-red/20 transition-all border border-accent-red/30"
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
    <div class="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-accent-green/10 blur-[120px] rounded-full pointer-events-none"></div>
    <div class="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-accent/10 blur-[120px] rounded-full pointer-events-none"></div>

  </div>
</template>
