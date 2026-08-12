<template>
  <div class="teacher-classroom-analytics min-h-screen bg-bg-secondary p-6">
    <header class="mb-8">
      <!-- CR-047: "Quay lại" dùng router-link về /teacher (không phụ thuộc history). -->
      <router-link
        to="/teacher"
        class="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-4 text-sm"
      >
        <BaseIcon name="arrow-left" class="w-4 h-4" />
        <span>Quay lại</span>
      </router-link>
      <h1 class="text-2xl font-bold text-text-primary">Phân tích lớp học</h1>
      <p class="text-text-muted mt-1">Thống kê tiến độ và kết quả học tập</p>
    </header>

    
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- TC-020: banner lỗi tách khỏi empty state -->
    <div v-else-if="loadError" class="text-center py-20 text-accent-red flex flex-col items-center gap-3">
      <span>{{ loadError }}</span>
      <button type="button" class="btn-secondary px-4 py-1.5 text-sm" @click="retry">Thử lại</button>
    </div>

    <template v-else-if="stats">
      
      <!-- CR-028: grid responsive (1 → 2 → 4 cột) + đơn vị % nhất quán với TeacherAnalyticsTab. -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <div class="bg-bg-secondary border border-border-subtle rounded-2xl p-5">
          <div class="text-sm text-text-muted mb-1">Tổng học viên</div>
          <div class="text-3xl font-bold text-text-primary">{{ stats.totalStudents }}</div>
        </div>
        <div class="bg-bg-secondary border border-border-subtle rounded-2xl p-5">
          <div class="text-sm text-text-muted mb-1">Điểm trung bình</div>
          <div class="text-3xl font-bold text-accent-cyan">{{ (stats.avgScore ?? 0).toFixed(1) }}</div>
        </div>
        <div class="bg-bg-secondary border border-border-subtle rounded-2xl p-5">
          <div class="text-sm text-text-muted mb-1">Tỷ lệ đạt</div>
          <div class="text-3xl font-bold text-accent-green">{{ (stats.passRate ?? 0).toFixed(1) }}%</div>
        </div>
        <div class="bg-bg-secondary border border-border-subtle rounded-2xl p-5">
          <div class="text-sm text-text-muted mb-1">Hoàn thành</div>
          <!-- CR-048: completionRate là 0..1 → ×100, guard `?? 0` hết NaN%. -->
          <div class="text-3xl font-bold text-accent-yellow">{{ ((stats.completionRate ?? 0) * 100).toFixed(1) }}%</div>
        </div>
      </div>

      
      <div class="bg-bg-secondary border border-border-subtle rounded-2xl overflow-hidden">
        <div class="p-5 border-b border-border-subtle">
          <h2 class="text-lg font-bold text-text-primary">Chi tiết điểm số</h2>
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
                <td class="p-4 text-text-primary font-medium">{{ student.name }}</td>
                <td v-for="(title, id) in stats.quizTitles" :key="id" class="text-center p-4">
                  <span class="font-mono" :class="getScoreClass(student.scoresPerQuiz[id])">{{ student.scoresPerQuiz[id] ?? '-' }}%</span>
                </td>
                <td class="text-center p-4 font-mono text-accent-yellow">{{ student.totalXP }}</td>
              </tr>
              <!-- CR-029: empty row colspan khi chưa có dữ liệu học viên. -->
              <tr v-if="stats.studentScores.length === 0">
                <td :colspan="1 + Object.keys(stats.quizTitles ?? {}).length + 1" class="py-8 text-center text-text-muted">
                  Lớp học này chưa có học viên nào tham gia làm bài.
                </td>
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
import { useTeacherApi } from './useTeacherApi';

const route = useRoute();
const classroomId = route.params.id as string;
const { BASE_URL, teacherRequest } = useTeacherApi();

const loading = ref(true);
const stats = ref<any>(null);
// TC-020: tách lỗi khỏi empty state
const loadError = ref('');

function getScoreClass(score: number | undefined | null): string {
  if (score == null) return 'text-text-muted';
  if (score >= 80) return 'text-accent-green';
  if (score >= 50) return 'text-accent-yellow';
  return 'text-accent-red';
}

async function loadAnalytics() {
  loading.value = true;
  loadError.value = '';
  try {
    const res = await teacherRequest(`${BASE_URL}/api/v1/classrooms/${classroomId}/analytics`);
    if (!res.ok) throw new Error('Không thể tải dữ liệu phân tích lớp học.');
    stats.value = await res.json();
  } catch (err) {
    loadError.value = err instanceof Error ? err.message : 'Lỗi khi tải phân tích.';
  } finally {
    loading.value = false;
  }
}

function retry(): void {
  loadAnalytics();
}

onMounted(loadAnalytics);
</script>

<style scoped>
.teacher-classroom-analytics {
  background: var(--color-bg-primary);
}
</style>
