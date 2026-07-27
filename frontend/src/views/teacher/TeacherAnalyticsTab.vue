<template>
  <section class="analytics-manage-section animate-fade-in mt-6">
    <div class="flex justify-between items-center mb-6 flex-wrap gap-3">
      <h2 class="section-heading m-0 text-white">Thống kê & Phân tích chi tiết khóa học</h2>
      <div class="flex items-center gap-2">
        <label class="text-xs font-bold text-slate-400 uppercase">Chọn khóa học:</label>
        <select v-model="selectedCourseIdForAnalytics" @change="loadCourseAnalytics" class="form-select bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 w-64">
          <option value="" disabled>-- Chọn khóa học --</option>
          <option v-for="c in coursesList" :key="c.id" :value="c.id">{{ c.title }}</option>
        </select>
      </div>
    </div>

    <div v-if="loadingAnalyticsData" class="loading-state py-12 flex flex-col items-center justify-center gap-3">
      <div class="spinner inline-block w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      <span class="text-slate-400 text-xs">Đang tải số liệu thống kê...</span>
    </div>

    <div v-else-if="!selectedCourseIdForAnalytics" class="empty-state py-12 text-center text-slate-500 text-xs bg-slate-900/20 border border-white/5 border-dashed rounded-3xl">
      Vui lòng chọn một khóa học ở trên để xem phân tích chi tiết.
    </div>

    <div v-else class="space-y-8 animate-fade-in">
      <!-- Metric Cards -->
      <div class="analytics-grid">
        <div class="metric-card bg-indigo-950/20 border border-indigo-500/10 rounded-3xl p-6 flex flex-col items-center justify-center">
          <span class="metric-card__value text-3xl font-black text-indigo-400">{{ analyticsData.totalStudents }}</span>
          <span class="metric-card__label text-xs font-bold text-slate-400 mt-1">Học viên tham gia</span>
        </div>
        <div class="metric-card bg-emerald-950/20 border border-emerald-500/10 rounded-3xl p-6 flex flex-col items-center justify-center">
          <span class="metric-card__value text-3xl font-black text-emerald-400">{{ analyticsData.averageCompletionRate }}%</span>
          <span class="metric-card__label text-xs font-bold text-slate-400 mt-1">Tỷ lệ hoàn thành TB</span>
        </div>
        <div class="metric-card bg-amber-950/20 border border-amber-500/10 rounded-3xl p-6 flex flex-col items-center justify-center">
          <span class="metric-card__value text-3xl font-black text-amber-400">{{ analyticsData.averageQuizScore }}</span>
          <span class="metric-card__label text-xs font-bold text-slate-400 mt-1">Điểm Quiz TB (100)</span>
        </div>
      </div>

      <!-- Lesson Distribution Detail -->
      <div class="quizzes-list-container p-6 bg-slate-900/40 border border-white/5 rounded-3xl">
        <h3 class="text-sm font-bold text-white mb-4">Phân bổ tiến độ học viên theo bài học</h3>
        <div class="table-responsive overflow-x-auto">
          <table class="quizzes-table w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-white/10 text-slate-400 text-xs">
                <th class="pb-3">Tên bài học</th>
                <th class="pb-3 text-center">Thứ tự</th>
                <th class="pb-3 text-center">Đang học (InProgress)</th>
                <th class="pb-3 text-center">Hoàn thành (Completed)</th>
                <th class="pb-3" style="width: 40%">Biểu đồ trực quan (Tỷ lệ hoàn thành)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="l in analyticsData.lessonDistribution" :key="l.lessonId" class="border-b border-white/5 text-xs hover:bg-white/[0.02] transition-colors">
                <td class="py-4 font-bold text-white">{{ l.title }}</td>
                <td class="py-4 text-center font-mono text-slate-400">#{{ l.orderIndex }}</td>
                <td class="py-4 text-center font-mono text-amber-400 font-bold">{{ l.started }}</td>
                <td class="py-4 text-center font-mono text-emerald-400 font-bold">{{ l.completed }}</td>
                <td class="py-4">
                  <div class="flex items-center gap-3">
                    <div class="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div class="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full" :style="{ width: getCompletionPercent(l.completed) + '%' }"></div>
                    </div>
                    <span class="font-mono text-[10px] text-slate-400 w-12 text-right">{{ getCompletionPercent(l.completed) }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useTeacherApi } from './useTeacherApi';

const props = defineProps<{ coursesList: any[] }>();

const { BASE_URL, getAuthHeaders } = useTeacherApi();

const selectedCourseIdForAnalytics = ref<string>('');
const loadingAnalyticsData = ref(false);
const analyticsData = ref({
  totalStudents: 0,
  averageCompletionRate: 0.0,
  averageQuizScore: 0.0,
  lessonDistribution: [] as any[]
});

function getCompletionPercent(completedCount: number): number {
  if (analyticsData.value.totalStudents === 0) return 0;
  return Math.round((completedCount / analyticsData.value.totalStudents) * 100);
}

async function loadCourseAnalytics() {
  if (!selectedCourseIdForAnalytics.value) return;
  loadingAnalyticsData.value = true;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/teacher/courses/${selectedCourseIdForAnalytics.value}/analytics`, { headers: getAuthHeaders() });
    if (res.ok) analyticsData.value = await res.json();
    else alert('Không thể tải dữ liệu thống kê của khóa học.');
  } catch (err) { console.error('Failed to load course analytics:', err); }
  finally { loadingAnalyticsData.value = false; }
}
</script>
