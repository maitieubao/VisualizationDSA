<template>
  <div class="lesson-study-view flex h-[calc(100vh-48px)] w-full overflow-hidden bg-bg-primary font-sans">
    <!-- Sidebar toggle button (mobile) -->
    <button
      @click="nav.toggleSidebar()"
      class="fixed bottom-4 left-4 z-50 lg:hidden p-3 rounded-full bg-accent text-white shadow-lg shadow-accent/30 cursor-pointer"
    >
      <BaseIcon name="list" class="w-5 h-5" />
    </button>

    <!-- Mobile sidebar overlay -->
    <Transition name="fade">
      <div
        v-if="nav.isSidebarOpen.value"
        class="fixed inset-0 bg-black/50 z-40 lg:hidden"
        @click="nav.closeSidebar()"
      />
    </Transition>

    <!-- Left Sidebar -->
    <Transition name="slide-left">
      <div
        v-if="nav.isSidebarOpen.value || !isMobile"
        class="shrink-0 z-50 lg:z-auto"
        :class="isMobile ? 'fixed inset-y-0 left-0' : 'relative'"
      >
        <CourseSidebar
          v-if="courseId"
          :course-id="courseId"
          :course-title="lessonStore.currentCourse?.title ?? lessonStore.lessonMeta?.courseTitle ?? 'Khóa học'"
          :lessons="courseLessons"
          :current-lesson-id="lessonId"
          @toggle="nav.closeSidebar()"
          @select-lesson="nav.closeSidebar()"
        />
      </div>
    </Transition>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
      <!-- Breadcrumbs -->
      <div v-if="courseId" class="px-4 py-2 border-b border-border-subtle bg-bg-secondary shrink-0">
        <BreadcrumbsBar :items="breadcrumbItems" />
      </div>

      <!-- Lesson Header -->
      <header class="px-4 py-2.5 border-b border-border-subtle bg-bg-secondary flex items-center justify-between shrink-0">
        <div class="flex items-center gap-3 min-w-0">
          <h1 class="text-sm font-bold text-text-primary truncate" v-if="lessonStore.currentLesson">
            {{ lessonStore.currentLesson.title }}
          </h1>
          <h1 class="text-sm font-bold text-text-muted" v-else-if="lessonStore.isLoading">
            Đang tải bài học...
          </h1>
          <span v-if="lessonStore.currentLesson" class="px-2 py-0.5 rounded-lg bg-accent-yellow/50 text-accent-yellow border border-accent-yellow/30 text-[10px] font-bold flex items-center gap-1 shrink-0">
            <BaseIcon name="zap" class="w-3 h-3" />
            +{{ lessonStore.currentLesson.xpReward }} XP
          </span>
        </div>

        <!-- Step Tabs -->
        <StepTabs
          :steps="steps"
          :active-step="lessonStore.activeStep"
          @navigate="lessonStore.goToStep"
        />
      </header>

      <!-- Offline warning -->
      <div v-if="lessonStore.isOfflineFallback" class="px-4 py-1.5 bg-accent-yellow/10 border-b border-accent-yellow/30 text-[11px] text-accent-yellow flex items-center gap-2 shrink-0">
        <BaseIcon name="warning" class="w-3 h-3 flex-shrink-0" />
        <span>Không kết nối máy chủ — hiển thị nội dung cục bộ.</span>
      </div>

      <!-- Content -->
      <main class="flex-1 min-h-0 relative w-full overflow-hidden">
        <!-- Loading -->
        <div v-if="lessonStore.isLoading && !lessonStore.currentLesson" class="w-full h-full flex flex-col items-center justify-center text-center">
          <div class="inline-block w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
          <p class="text-text-muted mt-4 text-sm">Đang tải bài học...</p>
        </div>

        <!-- Error -->
        <div v-else-if="lessonStore.error && !lessonStore.currentLesson" class="w-full h-full flex flex-col items-center justify-center text-center px-6">
          <BaseIcon name="warning" class="w-12 h-12 text-accent-red mx-auto mb-4" />
          <h3 class="text-lg font-bold text-text-secondary">{{ lessonStore.error }}</h3>
          <p class="text-text-muted mt-2 text-sm">Vui lòng quay lại khóa học và thử lại.</p>
          <router-link
            :to="courseId ? `/courses/${courseId}` : '/courses'"
            class="mt-4 px-5 py-2 bg-accent text-white font-semibold rounded-xl hover:bg-accent-dark transition-colors text-sm"
          >
            Quay lại khóa học
          </router-link>
        </div>

        <!-- Step Content -->
        <template v-else-if="lessonStore.currentLesson">
          <LessonStepTheory
            v-if="lessonStore.activeStep === 1"
            :title="lessonStore.currentLesson.title"
            :content="lessonStore.currentLesson.theoryContent"
            @completeStep="lessonStore.goToStep(2)"
          />

          <LessonStepViz
            v-else-if="lessonStore.activeStep === 2"
            :viz-title="lessonStore.currentLesson.title"
            :sandbox-type="lessonStore.lessonMeta?.sandboxType ?? ''"
            :sandbox-config="lessonStore.lessonMeta?.sandboxConfig ?? ''"
            @watched="onVizWatched"
            @completeStep="lessonStore.goToStep(3)"
          />

          <LessonStepQuiz
            v-else-if="lessonStore.activeStep === 3"
            :questions="lessonStore.currentLesson.quizQuestions ?? []"
            @submit="onQuizSubmit"
            @completeStep="onQuizComplete"
          />

          <LessonStepCodeLab
            v-else-if="lessonStore.activeStep === 4 && lessonStore.currentLesson.codelabTask"
            :problem-title="`Thực hành: ${lessonStore.currentLesson.title}`"
            :codelab-task="lessonStore.currentLesson.codelabTask"
            @completeLesson="onLessonComplete"
          />
        </template>
      </main>

      <!-- Bottom Navigation Bar -->
      <div class="px-4 py-2.5 border-t border-border-subtle bg-bg-secondary flex items-center justify-between shrink-0">
        <button
          @click="goToPreviousLesson"
          :disabled="!previousLessonId"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          :class="previousLessonId ? 'text-text-secondary hover:text-text-primary hover:bg-bg-hover' : 'text-text-disabled cursor-not-allowed'"
        >
          <BaseIcon name="arrow-left" class="w-3.5 h-3.5" />
          <span>Bài trước</span>
        </button>

        <div class="flex items-center gap-2">
          <button
            v-if="!isLastStep"
            @click="goToNextStep"
            class="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-accent text-white hover:bg-accent-dark transition-all shadow-md shadow-accent/20 cursor-pointer"
          >
            <span>{{ nextStepLabel }}</span>
            <BaseIcon name="arrow-right" class="w-3.5 h-3.5" />
          </button>
          <button
            v-else
            @click="goToNextLesson"
            :disabled="!nextLessonId"
            class="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
            :class="nextLessonId ? 'bg-accent-green text-white hover:bg-accent-green shadow-md shadow-accent-green/20' : 'bg-bg-surface text-text-muted cursor-not-allowed'"
          >
            <span>{{ nextLessonId ? 'Bài tiếp theo' : 'Hoàn thành' }}</span>
            <BaseIcon name="arrow-right" class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Completion Modal -->
    <LessonCompletionModal
      :show="showCompletionModal"
      :xp-reward="lessonStore.currentLesson?.xpReward ?? 0"
      :quiz-id="lessonStore.lessonMeta?.quizId"
      :next-lesson-id="nextLessonId"
      @go-quiz="goToQuiz"
      @go-next="goToNextLesson"
      @close="goBackToCourse"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CourseSidebar from '../../features/courses/components/CourseSidebar.vue';
import BreadcrumbsBar from '../../features/courses/components/BreadcrumbsBar.vue';
import StepTabs from '../../features/lesson/components/StepTabs.vue';
import LessonStepTheory from './components/LessonStepTheory.vue';
import LessonStepViz from './components/LessonStepViz.vue';
import LessonStepQuiz from './components/LessonStepQuiz.vue';
import LessonStepCodeLab from './components/LessonStepCodeLab.vue';
import LessonCompletionModal from './LessonCompletionModal.vue';
import { useLessonStore } from '../../features/lesson/store/useLessonStore';
import { useCourseNavigation } from '../../features/courses/composables/useCourseNavigation';

const route = useRoute();
const router = useRouter();
const lessonStore = useLessonStore();
const nav = useCourseNavigation();

const showCompletionModal = ref(false);
const nextLessonId = ref<string | null>(null);
const isMobile = ref(window.innerWidth < 1024);

const lessonId = computed(() => route.params.id as string);
const courseId = computed(() => {
  const fromQuery = route.query.courseId;
  if (typeof fromQuery === 'string' && fromQuery.length > 0) return fromQuery;
  return lessonStore.lessonMeta?.courseId ?? null;
});

// ── Course lessons for sidebar ──
const courseLessons = computed(() => {
  return (lessonStore.currentCourse?.lessons ?? []) as Array<{
    id: string;
    title: string;
    xpReward?: number;
    sandboxType?: string;
    quizId?: string | null;
  }>;
});

// ── Navigation helpers ──
const currentLessonIndex = computed(() => {
  return courseLessons.value.findIndex(l => l.id === lessonId.value);
});

const previousLessonId = computed(() => {
  const idx = currentLessonIndex.value;
  if (idx <= 0) return null;
  return courseLessons.value[idx - 1]?.id ?? null;
});

const nextLessonIdFromCourse = computed(() => {
  const idx = currentLessonIndex.value;
  if (idx === -1 || idx >= courseLessons.value.length - 1) return null;
  return courseLessons.value[idx + 1]?.id ?? null;
});

// ── Steps ──
const FULL_STEPS = [
  { number: 1, label: 'Lý Thuyết' },
  { number: 2, label: 'Trực Quan Hóa' },
  { number: 3, label: 'Quiz' },
  { number: 4, label: 'Code Lab' },
];

const steps = computed(() => {
  const hasCodelab = !!lessonStore.currentLesson?.codelabTask;
  return hasCodelab ? FULL_STEPS : FULL_STEPS.slice(0, 3);
});

const isLastStep = computed(() => {
  const lastStep = steps.value[steps.value.length - 1];
  return lessonStore.activeStep === lastStep?.number;
});

const nextStepLabel = computed(() => {
  const nextNum = lessonStore.activeStep + 1;
  const nextStep = steps.value.find(s => s.number === nextNum);
  return nextStep?.label ?? 'Tiếp theo';
});

// ── Breadcrumbs ──
const breadcrumbItems = computed(() => {
  const items = [
    { label: 'Khóa học', path: '/courses' },
    { label: lessonStore.currentCourse?.title ?? lessonStore.lessonMeta?.courseTitle ?? 'Khóa học', path: courseId.value ? `/courses/${courseId.value}` : '/courses' },
  ];
  if (lessonStore.currentLesson) {
    items.push({ label: lessonStore.currentLesson.title, path: `/lessons/${lessonId.value}` });
  }
  return items;
});

// ── Navigation functions ──
function goToNextStep() {
  const nextNum = lessonStore.activeStep + 1;
  if (steps.value.some(s => s.number === nextNum)) {
    lessonStore.goToStep(nextNum);
  }
}

function goToPreviousLesson() {
  if (previousLessonId.value) {
    router.push({ name: 'lesson-study', params: { id: previousLessonId.value }, query: courseId.value ? { courseId: courseId.value } : {} });
  }
}

function goToNextLesson() {
  if (nextLessonIdFromCourse.value) {
    router.push({ name: 'lesson-study', params: { id: nextLessonIdFromCourse.value }, query: courseId.value ? { courseId: courseId.value } : {} });
  }
}

function goToQuiz(quizId: string) {
  showCompletionModal.value = false;
  router.push({ name: 'quiz', query: { quizId } });
}

function goBackToCourse() {
  showCompletionModal.value = false;
  router.push(courseId.value ? `/courses/${courseId.value}` : '/courses');
}

// ── Handlers ──
function onVizWatched() {
  lessonStore.markVisualizerWatched();
}

async function onQuizSubmit(answers: Record<string, number>) {
  await lessonStore.submitQuiz(answers);
}

function onQuizComplete() {
  if (lessonStore.currentLesson?.codelabTask) {
    lessonStore.goToStep(4);
  } else {
    void finishLesson();
  }
}

async function onLessonComplete() {
  await lessonStore.completeCodelab();
  void finishLesson();
}

async function finishLesson() {
  nextLessonId.value = nextLessonIdFromCourse.value;
  showCompletionModal.value = true;
}

// ── Responsive ──
function handleResize() {
  isMobile.value = window.innerWidth < 1024;
}

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

// ── Watchers ──
watch(lessonId, (id) => {
  if (id) void lessonStore.loadLesson(id);
}, { immediate: true });

watch(courseId, (id) => {
  if (id) void lessonStore.loadCourseDetail(id);
}, { immediate: true });
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}
</style>
