<template>
  <div class="lesson-study-view flex h-[calc(100vh-48px)] w-full overflow-hidden bg-bg-primary font-sans">
    <!-- Sidebar toggle button (mobile) — LS-036: z-30 thấp hơn overlay (z-40)
         và sidebar mở (z-40) để không đè lên nhau. -->
    <button
      @click="nav.toggleSidebar()"
      aria-label="Mở danh sách bài học"
      class="fixed bottom-20 left-4 z-30 lg:hidden p-3 rounded-full bg-accent text-white shadow-lg shadow-accent/30 cursor-pointer"
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

    <!-- Left Sidebar — LS-036: mobile z-40 (dưới overlay vẫn đè toggle z-30). -->
    <Transition name="slide-left">
      <div
        v-if="nav.isSidebarOpen.value || !isMobile"
        class="shrink-0 z-40 lg:z-auto"
        :class="isMobile ? 'fixed inset-y-0 left-0' : 'relative'"
      >
        <CourseSidebar
          v-if="courseId"
          :course-id="courseId"
          :course-title="lessonStore.currentCourse?.title ?? lessonStore.lessonMeta?.courseTitle ?? 'Khóa học'"
          :lessons="courseLessons"
          :current-lesson-id="lessonId"
          :is-course-premium="lessonStore.currentCourse?.isPremium === true"
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
          :locked-steps="lockedSteps"
          @navigate="lessonStore.goToStep"
        />
      </header>

      <!-- Offline warning -->
      <div v-if="lessonStore.isOfflineFallback" class="px-4 py-1.5 bg-accent-yellow/10 border-b border-accent-yellow/30 text-[11px] text-accent-yellow flex items-center gap-2 shrink-0">
        <BaseIcon name="warning" class="w-3 h-3 flex-shrink-0" />
        <span>Không kết nối máy chủ — hiển thị nội dung cục bộ.</span>
      </div>

      <!-- Content — role=tabpanel khớp aria-controls của StepTabs (LS-038). -->
      <main
        class="flex-1 min-h-0 relative w-full overflow-hidden"
        role="tabpanel"
        :id="'step-panel-' + lessonStore.activeStep"
        :aria-labelledby="'step-tab-' + lessonStore.activeStep"
      >
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
            @completeStep="onTheoryComplete"
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
            :has-codelab="!!lessonStore.currentLesson.codelabTask"
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

        <!-- Thảo luận bài học (tích hợp nhẹ — LM-045) -->
        <button
          @click="showDiscussion = true"
          aria-label="Mở thảo luận bài học"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-all cursor-pointer"
        >
          <BaseIcon name="message-circle" class="w-3.5 h-3.5" />
          <span>Thảo luận</span>
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
          <!-- LM-036: bài cuối vẫn cho bấm "Hoàn thành" → finishLesson() -->
          <button
            v-else
            @click="goToNextLesson"
            :class="nextLessonId ? 'bg-accent-green text-white hover:bg-accent-green shadow-md shadow-accent-green/20' : 'bg-accent text-white hover:bg-accent-dark shadow-md shadow-accent/20'"
            class="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <span>{{ nextLessonId ? 'Bài tiếp theo' : 'Hoàn thành bài học' }}</span>
            <BaseIcon name="arrow-right" class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Discussion panel (LM-045: side panel mở theo yêu cầu) —
         LS-035: panel nằm bên PHẢI nên trượt từ phải (slide-right), không phải slide-left. -->
    <Transition name="slide-right">
      <div
        v-if="showDiscussion && lessonStore.currentLesson"
        class="fixed inset-y-0 right-0 z-40 w-[92vw] sm:w-96 bg-bg-secondary border-l border-border-subtle shadow-2xl flex flex-col"
        role="complementary"
        aria-label="Thảo luận bài học"
      >
        <div class="flex items-center justify-between px-4 py-3 border-b border-border-subtle shrink-0">
          <span class="text-xs font-bold text-text-primary flex items-center gap-2">
            <BaseIcon name="message-circle" class="w-4 h-4 text-accent" />
            Thảo luận bài học
          </span>
          <button
            @click="showDiscussion = false"
            aria-label="Đóng thảo luận"
            class="p-1 rounded-md hover:bg-bg-hover text-text-muted transition-colors cursor-pointer"
          >
            <BaseIcon name="x" class="w-4 h-4" />
          </button>
        </div>
        <div class="flex-1 min-h-0">
          <LessonDiscussionPanel :lesson-id="lessonId" />
        </div>
      </div>
    </Transition>

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
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import CourseSidebar from '../../features/courses/components/CourseSidebar.vue';
import BreadcrumbsBar from '../../features/courses/components/BreadcrumbsBar.vue';
import StepTabs from '../../features/lesson/components/StepTabs.vue';
import LessonStepTheory from './components/LessonStepTheory.vue';
import LessonStepViz from './components/LessonStepViz.vue';
import LessonStepQuiz from './components/LessonStepQuiz.vue';
import LessonStepCodeLab from './components/LessonStepCodeLab.vue';
import LessonCompletionModal from './LessonCompletionModal.vue';
import LessonDiscussionPanel from './LessonDiscussionPanel.vue';
import { resolveLessonRoute } from '../../features/courses/utils/courseAccess';
import { useLessonStore } from '../../features/lesson/store/useLessonStore';
import { useCourseNavigation } from '../../features/courses/composables/useCourseNavigation';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const lessonStore = useLessonStore();
const nav = useCourseNavigation();

const showCompletionModal = ref(false);
const showDiscussion = ref(false);
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
  const raw = (lessonStore.currentCourse?.lessons ?? []) as Array<{
    id: string;
    title: string;
    xpReward?: number;
    sandboxType?: string;
    quizId?: string | null;
  }>;
  return raw.map((l) => ({
    id: l.id,
    title: l.title,
    xpReward: l.xpReward ?? 0,
    sandboxType: l.sandboxType,
    quizId: l.quizId ?? null,
  }));
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

// Các bước đang khóa cho StepTabs (mờ + ổ khóa — LM-040/LM-015).
const lockedSteps = computed(() => {
  const locked: number[] = [];
  for (const step of steps.value) {
    if (!lessonStore.canAccessStep(step.number)) locked.push(step.number);
  }
  return locked;
});

// ── Breadcrumbs ──
// LS-039: breadcrumb bài học giữ ?courseId để mất context khi vào thẳng /lessons/:id.
const breadcrumbItems = computed(() => {
  const items = [
    { label: 'Khóa học', path: '/courses' },
    { label: lessonStore.currentCourse?.title ?? lessonStore.lessonMeta?.courseTitle ?? 'Khóa học', path: courseId.value ? `/courses/${courseId.value}` : '/courses' },
  ];
  if (lessonStore.currentLesson) {
    items.push({
      label: lessonStore.currentLesson.title,
      path: courseId.value ? `/lessons/${lessonId.value}?courseId=${encodeURIComponent(courseId.value)}` : `/lessons/${lessonId.value}`
    });
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
  if (!previousLessonId.value) return;
  showCompletionModal.value = false;
  router.push(lessonRouteFor(previousLessonId.value));
}

function goToNextLesson() {
  // LM-012: luôn đóng modal completion TRƯỚC khi chuyển bài.
  showCompletionModal.value = false;
  // LM-036: bài cuối (không còn bài sau) → mở modal hoàn thành thay vì dead button.
  if (!nextLessonIdFromCourse.value) {
    void finishLesson();
    return;
  }
  router.push(lessonRouteFor(nextLessonIdFromCourse.value));
}

/** Đi qua helper gating Premium chung — bài khóa học Premium → /checkout (LM-037). */
function lessonRouteFor(targetLessonId: string): string {
  const hasPremium = authStore.currentUser?.isPremium === true;
  return resolveLessonRoute(lessonStore.currentCourse, targetLessonId, hasPremium);
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
function onTheoryComplete() {
  // LM-015: đánh dấu đã đọc Lý Thuyết trước khi mở khóa bước Trực Quan Hóa.
  lessonStore.markTheoryRead();
  lessonStore.goToStep(2);
}

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
  // LM-012: đổi bài → đóng modal completion + panel thảo luận để không dính lên bài mới.
  showCompletionModal.value = false;
  nextLessonId.value = null;
  showDiscussion.value = false;
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

/* LS-035: panel thảo luận bên phải — trượt từ phải sang trái khi đóng. */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
