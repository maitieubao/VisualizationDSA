<template>
  <div class="teacher-panel">
    <h1 class="panel-title">
      <BaseIcon name="academic" class="w-6 h-6 text-accent inline-block mr-2 align-bottom" />
      Bảng điều khiển Giảng viên
      <span class="panel-title__badge">Giảng viên</span>
    </h1>

    <!-- TC-045: 4 thẻ thống kê — có banner lỗi + nút Retry, không hiện "—" mãi mãi -->
    <section class="analytics-section">
      <h2 class="section-heading">Thống kê lớp học</h2>
      <div v-if="analyticsError" class="error-banner mb-4 flex items-center justify-between gap-3 rounded-xl border border-accent-red/30 bg-accent-red/10 px-4 py-3">
        <span class="text-sm text-accent-red"><BaseIcon name="alert-circle" class="w-4 h-4 inline mr-1 align-middle" />{{ analyticsError }}</span>
        <button type="button" class="btn-secondary text-xs px-3 py-1.5" @click="loadAnalyticsCards">Thử lại</button>
      </div>
      <div class="analytics-grid">
        <div v-for="metric in analyticsCards" :key="metric.label" class="metric-card">
          <span class="metric-card__value">{{ metric.value }}</span>
          <span class="metric-card__label">{{ metric.label }}</span>
        </div>
      </div>
    </section>

    <!-- TC-027: ARIA tablist/tab + aria-selected + điều hướng phím mũi tên -->
    <div
      class="panel-tabs flex border-b border-border-subtle gap-6 mb-8 mt-2 flex-wrap"
      role="tablist"
      aria-label="Các mục quản lý giảng viên"
      @keydown="onTablistKeydown"
    >
      <button
        v-for="tab in tabs" :key="tab.id"
        type="button"
        role="tab"
        :id="`teacher-tab-${tab.id}`"
        :aria-selected="activeTab === tab.id"
        :aria-controls="`teacher-panel-${tab.id}`"
        :tabindex="activeTab === tab.id ? 0 : -1"
        class="pb-3 text-lg font-bold transition-all relative cursor-pointer whitespace-nowrap"
        :class="activeTab === tab.id ? 'text-accent border-b-2 border-accent' : 'text-text-muted hover:text-text-primary'"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- TC-027: KeepAlive giữ state từng tab (không mất scroll/dữ liệu khi đổi tab) -->
    <KeepAlive>
      <TeacherQuizTab v-if="activeTab === 'quizzes'" :key="'quizzes'" id="teacher-panel-quizzes" />
      <TeacherCourseTab v-else-if="activeTab === 'courses'" :key="'courses'" id="teacher-panel-courses" />
      <TeacherClassroomCurriculumTab v-else-if="activeTab === 'curriculum'" :key="'curriculum'" :classroom-id="selectedClassroomId" id="teacher-panel-curriculum" />
      <TheoryArticleLibraryTab v-else-if="activeTab === 'theory'" :key="'theory'" id="teacher-panel-theory" />
      <QuizBuilderTab v-else-if="activeTab === 'quiz-builder'" :key="'quiz-builder'" id="teacher-panel-quiz-builder" />
      <CodelabBuilderTab v-else-if="activeTab === 'codelab-builder'" :key="'codelab-builder'" id="teacher-panel-codelab-builder" />
      <TeacherStudentTab v-else-if="activeTab === 'students'" :key="'students'" id="teacher-panel-students" />
      <TeacherAnalyticsTab v-else-if="activeTab === 'analytics'" :key="'analytics'" id="teacher-panel-analytics" />
    </KeepAlive>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
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
const { BASE_URL, teacherRequest } = useTeacherApi();

type TabId = 'quizzes' | 'courses' | 'curriculum' | 'theory' | 'quiz-builder' | 'codelab-builder' | 'students' | 'analytics';

const activeTab = ref<TabId>('courses');
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
// TC-045: lỗi thống kê hiển thị banner + nút Retry.
const analyticsError = ref('');

// TC-027: điều hướng tab bằng phím mũi tên (ARIA tabs pattern).
function onTablistKeydown(e: KeyboardEvent): void {
  const idx = tabs.findIndex((t) => t.id === activeTab.value);
  let next = idx;
  if (e.key === 'ArrowRight') next = (idx + 1) % tabs.length;
  else if (e.key === 'ArrowLeft') next = (idx - 1 + tabs.length) % tabs.length;
  else if (e.key === 'Home') next = 0;
  else if (e.key === 'End') next = tabs.length - 1;
  else return;
  e.preventDefault();
  activeTab.value = tabs[next].id;
}

async function loadAnalyticsCards(): Promise<void> {
  analyticsError.value = '';
  try {
    const res = await teacherRequest(`${BASE_URL}/api/v1/analytics/quizzes`);
    if (!res.ok) throw new Error('Không thể tải thống kê.');
    const data = await res.json();
    analyticsCards.value = [
      { label: 'Tổng số bài trắc nghiệm', value: data.totalQuizzes ?? '—' },
      { label: 'Tổng số câu hỏi', value: data.totalQuestionsInBank ?? '—' },
      { label: 'Tổng số người dùng', value: data.totalUsers ?? '—' },
      { label: 'Thành viên Premium', value: data.premiumUsers ?? '—' },
    ];
  } catch (err) {
    analyticsError.value = err instanceof Error ? err.message : 'Lỗi khi tải thống kê.';
  }
}

onMounted(async () => {
  // TC-016: TeacherCourseTab tự fetch quiz riêng — không cần ref qua TeacherQuizTab nữa.
  if (route.query.classroomId) {
    selectedClassroomId.value = route.query.classroomId as string;
    activeTab.value = 'curriculum';
  }

  loadAnalyticsCards();
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
