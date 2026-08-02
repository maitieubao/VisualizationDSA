<template>
  <div class="teacher-classroom-analytics min-h-screen bg-bg-secondary p-6">
    <header class="mb-8">
      <button type="button" class="text-text-muted hover:text-white transition-colors mb-4 flex items-center gap-2" @click="$router.back()">
        <BaseIcon name="arrow-left" class="w-4 h-4" />
        <span class="text-sm">Quay lại</span>
      </button>
      <h1 class="text-2xl font-bold text-white">Phân tích lớp học</h1>
      <p class="text-text-muted mt-1">Thống kê tiến độ và kết quả học tập</p>
    </header>

    
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
    </div>

    <template v-else-if="stats">
      
      <div class="grid grid-cols-4 gap-4 mb-8">
        <div class="bg-bg-secondary border border-border-subtle rounded-2xl p-5">
          <div class="text-sm text-text-muted mb-1">Tổng học viên</div>
          <div class="text-3xl font-bold text-white">{{ stats.totalStudents }}</div>
        </div>
        <div class="bg-bg-secondary border border-border-subtle rounded-2xl p-5">
          <div class="text-sm text-text-muted mb-1">Điểm trung bình</div>
          <div class="text-3xl font-bold text-accent-cyan">{{ stats.avgScore }}%</div>
        </div>
        <div class="bg-bg-secondary border border-border-subtle rounded-2xl p-5">
          <div class="text-sm text-text-muted mb-1">Tỷ lệ đạt</div>
          <div class="text-3xl font-bold text-accent-green">{{ stats.passRate }}%</div>
        </div>
        <div class="bg-bg-secondary border border-border-subtle rounded-2xl p-5">
          <div class="text-sm text-text-muted mb-1">Hoàn thành</div>
          <div class="text-3xl font-bold text-accent-yellow">{{ (stats.completionRate * 100).toFixed(1) }}%</div>
        </div>
      </div>

      
      <div class="bg-bg-secondary border border-border-subtle rounded-2xl overflow-hidden">
        <div class="p-5 border-b border-border-subtle">
          <h2 class="text-lg font-bold text-white">Chi tiết điểm số</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border-subtle text-text-muted">
                <th class="text-left p-4 font-medium">Học viên</th>
                <th v-for="(title, id) in stats.quizTitles" :key="id" class="text-center p-4 font-medium">{{ title }}</th>
                <th class="text-center p-4 font-medium">XP</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in stats.studentScores" :key="student.studentId" class="border-b border-border-subtle hover:bg-bg-hover">
                <td class="p-4 text-white font-medium">{{ student.name }}</td>
                <td v-for="(title, id) in stats.quizTitles" :key="id" class="text-center p-4">
                  <span class="font-mono" :class="getScoreClass(student.scoresPerQuiz[id])">{{ student.scoresPerQuiz[id] ?? '-' }}%</span>
                </td>
                <td class="text-center p-4 font-mono text-accent-yellow">{{ student.totalXP }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <div v-else class="text-center py-20 text-text-muted">
      Không có dữ liệu phân tích
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import BaseIcon from '@/shared/components/BaseIcon.vue';

const route = useRoute();
const classroomId = route.params.id as string;
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

const loading = ref(true);
const stats = ref<any>(null);

function getAuthHeaders() {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

function getScoreClass(score: number | undefined | null): string {
  if (score == null) return 'text-text-muted';
  if (score >= 80) return 'text-accent-green';
  if (score >= 50) return 'text-accent-yellow';
  return 'text-accent-red';
}

async function loadAnalytics() {
  try {
    const headers = getAuthHeaders();
    const res = await fetch(`${BASE_URL}/api/v1/classrooms/${classroomId}/analytics`, { headers });
    if (res.ok) {
      stats.value = await res.json();
    }
  } catch (err) {
    console.error('Failed to load analytics:', err);
  } finally {
    loading.value = false;
  }
}

onMounted(loadAnalytics);
</script>

<style scoped>
.teacher-classroom-analytics {
  background: #020617;
}
</style>
