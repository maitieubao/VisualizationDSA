<template>
  <div class="p-4">
    <!-- D4: analytics học tập — chứng minh hiệu quả (xem visualizer → làm quiz) -->
    <div v-if="isLoading" class="flex items-center gap-2 text-xs text-text-secondary py-8 justify-center">
      <span class="w-3.5 h-3.5 border-2 border-text-secondary/30 border-t-text-secondary rounded-full animate-spin"></span>
      Đang tải dữ liệu học tập…
    </div>

    <div v-else-if="error" class="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
      {{ error }}
    </div>

    <template v-else-if="data">
      <!-- Tổng quan -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        <div class="p-3 rounded-xl bg-bg-secondary border border-border-subtle">
          <p class="text-[10px] font-semibold text-text-secondary uppercase tracking-wide">Học viên đã học</p>
          <p class="text-2xl font-bold text-text-primary mt-1">{{ data.overall.totalLearners }}</p>
        </div>
        <div class="p-3 rounded-xl bg-bg-secondary border border-border-subtle">
          <p class="text-[10px] font-semibold text-text-secondary uppercase tracking-wide">Bản ghi tiến độ</p>
          <p class="text-2xl font-bold text-text-primary mt-1">{{ data.overall.totalProgressRecords }}</p>
        </div>
        <div class="p-3 rounded-xl bg-bg-secondary border border-border-subtle">
          <p class="text-[10px] font-semibold text-text-secondary uppercase tracking-wide">Tỷ lệ xem visualizer</p>
          <p class="text-2xl font-bold text-accent-cyan-light mt-1">{{ data.overall.avgVisualizerWatchRate }}%</p>
        </div>
        <div class="p-3 rounded-xl bg-bg-secondary border border-border-subtle">
          <p class="text-[10px] font-semibold text-text-secondary uppercase tracking-wide">Tỷ lệ pass quiz TB</p>
          <p class="text-2xl font-bold text-accent-emerald-light mt-1">{{ data.overall.avgQuizPassRate }}%</p>
        </div>
        <div class="p-3 rounded-xl bg-bg-secondary border border-border-subtle">
          <p class="text-[10px] font-semibold text-text-secondary uppercase tracking-wide">Pass quiz khi KHÔNG xem viz</p>
          <p class="text-2xl font-bold text-text-secondary mt-1">{{ data.overall.avgPassRateWithoutVisualizer }}%</p>
        </div>
      </div>

      <!-- Tương quan xem viz → pass quiz -->
      <div class="mb-5 p-4 rounded-xl bg-bg-secondary border border-border-subtle">
        <p class="text-xs font-bold text-text-primary mb-1">📊 Tương quan: Xem visualizer trước → tỷ lệ pass quiz</p>
        <p class="text-[11px] text-text-secondary mb-3">
          Tỷ lệ pass quiz trung bình của nhóm <span class="text-accent-cyan-light font-semibold">CÓ xem visualizer</span> so với nhóm
          <span class="text-text-primary font-semibold">KHÔNG xem</span> — bằng chứng hiệu quả học tập của tính năng trực quan hóa.
        </p>
        <div class="flex items-end gap-6 flex-wrap">
          <div class="text-center">
            <div class="w-20 rounded-t-lg bg-accent-cyan/70" :style="{ height: vizBarHeight + 'px' }"></div>
            <p class="text-sm font-bold text-accent-cyan-light mt-1">{{ data.overall.avgPassRateWithVisualizer }}%</p>
            <p class="text-[10px] text-text-secondary">Có xem viz</p>
          </div>
          <div class="text-center">
            <div class="w-20 rounded-t-lg bg-text-secondary/40" :style="{ height: noVizBarHeight + 'px' }"></div>
            <p class="text-sm font-bold text-text-secondary mt-1">{{ data.overall.avgPassRateWithoutVisualizer }}%</p>
            <p class="text-[10px] text-text-secondary">Không xem viz</p>
          </div>
        </div>
      </div>

      <!-- Chi tiết từng bài -->
      <div class="overflow-auto rounded-xl border border-border-subtle">
        <table class="w-full text-xs">
          <thead>
            <tr class="bg-bg-secondary text-left text-text-secondary uppercase tracking-wide text-[10px]">
              <th class="px-3 py-2 font-semibold">Bài học</th>
              <th class="px-3 py-2 font-semibold text-right">Học viên</th>
              <th class="px-3 py-2 font-semibold text-right">Xem viz</th>
              <th class="px-3 py-2 font-semibold text-right">Làm quiz</th>
              <th class="px-3 py-2 font-semibold text-right">Pass quiz</th>
              <th class="px-3 py-2 font-semibold text-right">Pass codelab</th>
              <th class="px-3 py-2 font-semibold text-right">Hoàn thành</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lesson in data.lessons" :key="lesson.lessonId" class="border-t border-border-subtle/60 hover:bg-bg-hover/40">
              <td class="px-3 py-2 text-text-primary max-w-[280px] truncate" :title="lesson.lessonTitle">{{ lesson.lessonTitle }}</td>
              <td class="px-3 py-2 text-right font-mono">{{ lesson.learners }}</td>
              <td class="px-3 py-2 text-right font-mono text-accent-cyan-light">{{ lesson.visualizerWatchRate }}%</td>
              <td class="px-3 py-2 text-right font-mono">{{ lesson.quizTakenRate }}%</td>
              <td class="px-3 py-2 text-right font-mono" :class="{ 'text-accent-emerald-light': lesson.quizPassRate >= 50, 'text-text-secondary': lesson.quizPassRate < 50 }">{{ lesson.quizPassRate }}%</td>
              <td class="px-3 py-2 text-right font-mono">{{ lesson.codelabCompletionRate }}%</td>
              <td class="px-3 py-2 text-right font-mono">{{ lesson.completionRate }}%</td>
            </tr>
            <tr v-if="data.lessons.length === 0">
              <td colspan="7" class="px-3 py-6 text-center text-text-secondary italic">
                Chưa có dữ liệu học tập — học viên bắt đầu học sẽ hiển thị tại đây.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useAdminApi } from './useAdminApi';

interface LessonLearningStats {
  lessonId: string;
  lessonTitle: string;
  learners: number;
  visualizerWatchRate: number;
  quizTakenRate: number;
  quizPassRate: number;
  codelabCompletionRate: number;
  completionRate: number;
  avgBestScore: number;
  passRateWithVisualizer: number;
  passRateWithoutVisualizer: number;
}

interface LearningAnalyticsResponse {
  overall: {
    totalLearners: number;
    totalProgressRecords: number;
    avgVisualizerWatchRate: number;
    avgQuizPassRate: number;
    avgPassRateWithVisualizer: number;
    avgPassRateWithoutVisualizer: number;
  };
  lessons: LessonLearningStats[];
}

const { BASE_URL, adminRequest } = useAdminApi();
const isLoading = ref(true);
const error = ref<string | null>(null);
const data = ref<LearningAnalyticsResponse | null>(null);

const vizBarHeight = computed(() => Math.max(8, Math.min(120, (data.value?.overall.avgPassRateWithVisualizer ?? 0) * 1.2)));
const noVizBarHeight = computed(() => Math.max(8, Math.min(120, (data.value?.overall.avgPassRateWithoutVisualizer ?? 0) * 1.2)));

onMounted(async () => {
  try {
    const res = await adminRequest(`${BASE_URL}/api/v1/concepts/admin/analytics/learning`);
    if (!res.ok) {
      error.value = `Không tải được dữ liệu học tập (${res.status}).`;
      return;
    }
    data.value = (await res.json()) as LearningAnalyticsResponse;
  } catch {
    error.value = 'Lỗi kết nối khi tải dữ liệu học tập.';
  } finally {
    isLoading.value = false;
  }
});
</script>
