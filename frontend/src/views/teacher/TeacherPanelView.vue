<template>
  <div class="teacher-studio">
    <!-- Sidebar Navigation -->
    <aside class="studio-sidebar" :class="{ 'is-collapsed': isSidebarCollapsed }">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <BaseIcon name="academic" class="w-8 h-8 text-accent flex-shrink-0" />
          <span class="logo-text" v-if="!isSidebarCollapsed">Bento Studio</span>
        </div>
        <button class="sidebar-toggle" @click="isSidebarCollapsed = !isSidebarCollapsed">
          <BaseIcon :name="isSidebarCollapsed ? 'chevron-right' : 'chevron-left'" class="w-4 h-4" />
        </button>
      </div>

      <nav class="sidebar-nav">
        <!-- Main Core -->
        <div class="nav-group">
          <div class="nav-group-label" v-if="!isSidebarCollapsed">Quản lý Học tập</div>
          <button 
            v-for="tab in learningTabs" :key="tab.id"
            class="nav-item"
            :class="{ 'is-active': activeTab === tab.id }"
            @click="activeTab = tab.id"
            :title="isSidebarCollapsed ? tab.label : ''"
          >
            <BaseIcon :name="tab.icon" class="nav-icon" />
            <span class="nav-label" v-if="!isSidebarCollapsed">{{ tab.label }}</span>
          </button>
        </div>

        <!-- Content Builders -->
        <div class="nav-group">
          <div class="nav-group-label" v-if="!isSidebarCollapsed">Công cụ Tạo & Học liệu</div>
          <button 
            v-for="tab in builderTabs" :key="tab.id"
            class="nav-item"
            :class="{ 'is-active': activeTab === tab.id }"
            @click="activeTab = tab.id"
            :title="isSidebarCollapsed ? tab.label : ''"
          >
            <BaseIcon :name="tab.icon" class="nav-icon" />
            <span class="nav-label" v-if="!isSidebarCollapsed">{{ tab.label }}</span>
          </button>
        </div>

        <!-- Admin -->
        <div class="nav-group">
          <div class="nav-group-label" v-if="!isSidebarCollapsed">Hệ thống & Báo cáo</div>
          <button 
            v-for="tab in adminTabs" :key="tab.id"
            class="nav-item"
            :class="{ 'is-active': activeTab === tab.id }"
            @click="activeTab = tab.id"
            :title="isSidebarCollapsed ? tab.label : ''"
          >
            <BaseIcon :name="tab.icon" class="nav-icon" />
            <span class="nav-label" v-if="!isSidebarCollapsed">{{ tab.label }}</span>
          </button>
        </div>
      </nav>
      
      <div class="sidebar-footer" v-if="!isSidebarCollapsed">
        <div class="role-badge">
          <span class="pulse-dot"></span> Giảng viên
        </div>
      </div>
    </aside>

    
    <main class="studio-main">
    <div class="panel-tabs flex border-b border-border-subtle gap-6 mb-8 mt-2 flex-wrap">
      <button 
        v-for="tab in allTabs" :key="tab.id"
        type="button" 
        class="pb-3 text-lg font-bold transition-all relative cursor-pointer whitespace-nowrap"
        :class="activeTab === tab.id ? 'text-accent border-b-2 border-accent' : 'text-text-muted hover:text-text-primary'"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

      <!-- Dashboard Stats Bento -->
      <div class="stats-bento">
        <div v-for="metric in analyticsCards" :key="metric.label" class="stat-card">
          <div class="stat-icon-wrapper" :class="metric.colorClass">
            <BaseIcon :name="metric.icon" class="w-6 h-6" />
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ metric.value }}</span>
            <span class="stat-label">{{ metric.label }}</span>
          </div>
        </div>
      </div>

      <!-- Tab Content Area -->
      <div class="content-area">
        <TeacherQuizTab v-if="activeTab === 'quizzes'" ref="quizTabRef" />
        <TeacherCourseTab v-else-if="activeTab === 'courses'" ref="courseTabRef" :quizzes-list="quizTabQuizzesList" />
        <TeacherClassroomCurriculumTab v-else-if="activeTab === 'curriculum'" :classroom-id="selectedClassroomId" ref="curriculumTabRef" />
        <TheoryArticleLibraryTab v-else-if="activeTab === 'theory'" ref="theoryTabRef" />
        <QuizBuilderTab v-else-if="activeTab === 'quiz-builder'" ref="quizBuilderTabRef" />
        <CodelabBuilderTab v-else-if="activeTab === 'codelab-builder'" ref="codelabBuilderTabRef" />
        <TeacherStudentTab v-else-if="activeTab === 'students'" />
        <TeacherAnalyticsTab v-else-if="activeTab === 'analytics'" />
      </div>
    </main>
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
import BaseIcon from '@/shared/components/BaseIcon.vue';

const route = useRoute();
const router = useRouter();
const { BASE_URL, getAuthHeaders } = useTeacherApi();

const activeTab = ref<'quizzes' | 'courses' | 'curriculum' | 'theory' | 'quiz-builder' | 'codelab-builder' | 'students' | 'analytics'>('courses');
const selectedClassroomId = ref<string | null>(null);
const isSidebarCollapsed = ref(false);

const learningTabs = [
  { id: 'courses' as const, label: 'Khóa học & Bài giảng', icon: 'learning-path' },
  { id: 'curriculum' as const, label: 'Chương trình học', icon: 'map' },
  { id: 'quizzes' as const, label: 'Quản lý Bài tập', icon: 'puzzle' },
];

const builderTabs = [
  { id: 'theory' as const, label: 'Thư viện Lý thuyết', icon: 'book-open' },
  { id: 'quiz-builder' as const, label: 'Quiz Builder', icon: 'pencil-alt' },
  { id: 'codelab-builder' as const, label: 'Codelab Builder', icon: 'code' },
];

const adminTabs = [
  { id: 'students' as const, label: 'Quản lý Học viên', icon: 'users' },
  { id: 'analytics' as const, label: 'Báo cáo & Phân tích', icon: 'chart-bar' },
];

const allTabs = [...learningTabs, ...builderTabs, ...adminTabs];
const activeTabLabel = computed(() => allTabs.find(t => t.id === activeTab.value)?.label ?? 'Dashboard');

interface AnalyticsMetric { label: string; value: string | number; icon: string; colorClass: string; }

const analyticsCards = ref<AnalyticsMetric[]>([
  { label: 'Bài tập', value: '—', icon: 'puzzle', colorClass: 'text-accent bg-accent/10' },
  { label: 'Câu hỏi', value: '—', icon: 'collection', colorClass: 'text-accent-warm bg-orange-500/10' },
  { label: 'Học viên', value: '—', icon: 'users', colorClass: 'text-green-400 bg-green-500/10' },
  { label: 'Premium', value: '—', icon: 'diamond', colorClass: 'text-accent-purple bg-accent-purple/10' },
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
      analyticsCards.value[0].value = data.totalQuizzes;
      analyticsCards.value[1].value = data.totalQuestionsInBank;
      analyticsCards.value[2].value = data.totalUsers;
      analyticsCards.value[3].value = data.premiumUsers;
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