<template>
  <div class="teacher-panel">
    <h1 class="panel-title">
      <BaseIcon name="academic" class="w-6 h-6 text-accent inline-block mr-2 align-bottom" />
      Bảng điều khiển Giảng viên
      <span class="panel-title__badge">Giảng viên</span>
    </h1>

    
    <section class="analytics-section">
      <h2 class="section-heading">Thống kê lớp học</h2>
      <div class="analytics-grid">
        <div v-for="metric in analyticsCards" :key="metric.label" class="metric-card">
          <span class="metric-card__value">{{ metric.value }}</span>
          <span class="metric-card__label">{{ metric.label }}</span>
        </div>
      </div>
    </section>

    
    <div class="panel-tabs flex border-b border-white/10 gap-6 mb-8 mt-2 flex-wrap">
      <button 
        v-for="tab in tabs" :key="tab.id"
        type="button" 
        class="pb-3 text-lg font-bold transition-all relative cursor-pointer whitespace-nowrap"
        :class="activeTab === tab.id ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    
    <TeacherQuizTab v-if="activeTab === 'quizzes'" ref="quizTabRef" />
    <TeacherCourseTab v-else-if="activeTab === 'courses'" ref="courseTabRef" :quizzes-list="quizTabQuizzesList" />
    <TeacherClassroomCurriculumTab v-else-if="activeTab === 'curriculum'" :classroom-id="selectedClassroomId" ref="curriculumTabRef" />
    <TheoryArticleLibraryTab v-else-if="activeTab === 'theory'" ref="theoryTabRef" />
    <QuizBuilderTab v-else-if="activeTab === 'quiz-builder'" ref="quizBuilderTabRef" />
    <CodelabBuilderTab v-else-if="activeTab === 'codelab-builder'" ref="codelabBuilderTabRef" />
    <TeacherStudentTab v-else-if="activeTab === 'students'" />
    <TeacherAnalyticsTab v-else-if="activeTab === 'analytics'" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTeacherApi } from './useTeacherApi';
import TeacherQuizTab from './TeacherQuizTab.vue';
import TeacherCourseTab from './TeacherCourseTab.vue';
import TeacherClassroomCurriculumTab from './TeacherClassroomCurriculumTab.vue';
import TeacherStudentTab from './TeacherStudentTab.vue';
import TeacherAnalyticsTab from './TeacherAnalyticsTab.vue';
import TheoryArticleLibraryTab from './TheoryArticleLibraryTab.vue';
import QuizBuilderTab from './QuizBuilderTab.vue';
import CodelabBuilderTab from './CodelabBuilderTab.vue';

const route = useRoute();
const router = useRouter();
const { BASE_URL, getAuthHeaders } = useTeacherApi();

const activeTab = ref<'quizzes' | 'courses' | 'curriculum' | 'theory' | 'quiz-builder' | 'codelab-builder' | 'students' | 'analytics'>('courses');
const selectedClassroomId = ref<string | null>(null);

const tabs = [
  { id: 'quizzes' as const, label: 'Quản lý Trắc nghiệm' },
  { id: 'courses' as const, label: 'Quản lý Khóa học & Bài giảng' },
  { id: 'curriculum' as const, label: 'Chương trình học (Curriculum)' },
  { id: 'theory' as const, label: 'Thư viện Lý thuyết' },
  { id: 'quiz-builder' as const, label: 'Công cụ Tạo Quiz' },
  { id: 'codelab-builder' as const, label: 'Công cụ Tạo Codelab' },
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
const curriculumTabRef = ref<InstanceType<typeof TeacherClassroomCurriculumTab> | null>(null);
const theoryTabRef = ref<InstanceType<typeof TheoryArticleLibraryTab> | null>(null);
const quizBuilderTabRef = ref<InstanceType<typeof QuizBuilderTab> | null>(null);
const codelabBuilderTabRef = ref<InstanceType<typeof CodelabBuilderTab> | null>(null);

const quizTabQuizzesList = computed(() => quizTabRef.value?.quizzesList ?? []);

onMounted(async () => {
  
  if (route.query.classroomId) {
    selectedClassroomId.value = route.query.classroomId as string;
    activeTab.value = 'curriculum';
  }

  try {
    const res = await fetch(`${BASE_URL}/api/v1/analytics/quizzes`, { headers: getAuthHeaders() });
    if (res.ok) {
      const data = await res.json();
      analyticsCards.value = [
        { label: 'Tổng số bài trắc nghiệm', value: data.totalQuizzes },
        { label: 'Tổng số câu hỏi', value: data.totalQuestionsInBank },
        { label: 'Tổng số người dùng', value: data.totalUsers },
        { label: 'Thành viên Premium', value: data.premiumUsers },
      ];
    }
  } catch {  }
});

watch(() => route.query.classroomId, (newId) => {
  if (newId) {
    selectedClassroomId.value = newId as string;
    activeTab.value = 'curriculum';
  }
});


defineExpose({
  setClassroom: (classroomId: string) => {
    selectedClassroomId.value = classroomId;
    activeTab.value = 'curriculum';
    router.push({ query: { classroomId } });
  }
});
</script>

<style>
@import "./TeacherPanelView.css";
</style>