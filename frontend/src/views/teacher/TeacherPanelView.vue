<template>
  <div class="teacher-panel">
    <h1 class="panel-title">
      <BaseIcon name="academic" class="w-6 h-6 text-accent inline-block mr-2 align-bottom" />
      Bảng điều khiển Giảng viên
      <span class="panel-title__badge">Giảng viên</span>
    </h1>

    <!-- Analytics Grid -->
    <section class="analytics-section">
      <h2 class="section-heading">Thống kê lớp học</h2>
      <div class="analytics-grid">
        <div v-for="metric in analyticsCards" :key="metric.label" class="metric-card">
          <span class="metric-card__value">{{ metric.value }}</span>
          <span class="metric-card__label">{{ metric.label }}</span>
        </div>
      </div>
    </section>

    <!-- Navigation Tabs -->
    <div class="panel-tabs flex border-b border-white/10 gap-6 mb-8 mt-2">
      <button 
        v-for="tab in tabs" :key="tab.id"
        type="button" 
        class="pb-3 text-lg font-bold transition-all relative cursor-pointer"
        :class="activeTab === tab.id ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab Content -->
    <TeacherQuizTab v-if="activeTab === 'quizzes'" ref="quizTabRef" />
    <TeacherCourseTab v-else-if="activeTab === 'courses'" ref="courseTabRef" :quizzes-list="quizTabQuizzesList" />
    <TeacherStudentTab v-else-if="activeTab === 'students'" />
    <TeacherAnalyticsTab v-else-if="activeTab === 'analytics'" :courses-list="courseTabCoursesList" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTeacherApi } from './useTeacherApi';
import TeacherQuizTab from './TeacherQuizTab.vue';
import TeacherCourseTab from './TeacherCourseTab.vue';
import TeacherStudentTab from './TeacherStudentTab.vue';
import TeacherAnalyticsTab from './TeacherAnalyticsTab.vue';

const { BASE_URL, getAuthHeaders } = useTeacherApi();

const activeTab = ref<'quizzes' | 'courses' | 'students' | 'analytics'>('quizzes');

const tabs = [
  { id: 'quizzes' as const, label: 'Quản lý Trắc nghiệm' },
  { id: 'courses' as const, label: 'Quản lý Khóa học & Bài giảng' },
  { id: 'students' as const, label: 'Quản lý Học viên' },
  { id: 'analytics' as const, label: 'Báo cáo & Phân tích' },
];

interface AnalyticsMetric { label: string; value: string | number; }

const analyticsCards = ref<AnalyticsMetric[]>([
  { label: 'Tổng số bài trắc nghiệm', value: '—' },
  { label: 'Tổng số câu hỏi', value: '—' },
  { label: 'Tổng số người dùng', value: '—' },
  { label: 'Thành viên Premium', value: '—' },
]);

const quizTabRef = ref<InstanceType<typeof TeacherQuizTab> | null>(null);
const courseTabRef = ref<InstanceType<typeof TeacherCourseTab> | null>(null);

const quizTabQuizzesList = computed(() => quizTabRef.value?.quizzesList ?? []);
const courseTabCoursesList = computed(() => courseTabRef.value?.coursesList ?? []);

onMounted(async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/quiz/analytics`, { headers: getAuthHeaders() });
    if (res.ok) {
      const data = await res.json();
      analyticsCards.value = [
        { label: 'Tổng số bài trắc nghiệm', value: data.totalQuizzes },
        { label: 'Tổng số câu hỏi', value: data.totalQuestionsInBank },
        { label: 'Tổng số người dùng', value: data.totalUsers },
        { label: 'Thành viên Premium', value: data.premiumUsers },
      ];
    }
  } catch { /* analytics is optional */ }
});
</script>

<style>
@import "./TeacherPanelView.css";
</style>
