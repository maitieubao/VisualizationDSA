<template>
  <div class="lesson-study-view flex flex-col min-h-[calc(100vh-64px)] w-full overflow-auto bg-bg-secondary font-sans">
    <header class="px-6 py-3 border-b border-border-subtle bg-bg-secondary backdrop-blur-md flex items-center justify-between shrink-0 shadow-lg z-20 flex-wrap gap-2">
      <div class="flex items-center gap-3 min-w-0">
        <router-link :to="courseId ? `/courses/${courseId}` : '/courses'" class="text-xs font-semibold text-text-muted hover:text-text-primary transition-colors flex items-center gap-1 shrink-0">
          <BaseIcon name="arrow-left" class="w-3.5 h-3.5" /> Quay lại
        </router-link>
        <span class="text-text-disabled">|</span>
        <h2 class="text-sm font-extrabold text-text-primary line-clamp-1" v-if="lessonStore.currentLesson">
          {{ lessonStore.currentLesson.title }}
        </h2>
        <h2 class="text-sm font-extrabold text-text-muted line-clamp-1" v-else-if="lessonStore.isLoading">Đang tải bài học...</h2>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-for="step in steps"
          :key="step.number"
          @click="lessonStore.goToStep(step.number)"
          class="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
          :class="lessonStore.activeStep === step.number
            ? 'bg-accent text-white shadow-md shadow-accent/30'
            : 'bg-bg-secondary text-text-muted hover:text-text-primary border border-border-subtle'"
        >
          <span class="w-4 h-4 rounded-full flex items-center justify-center text-[10px]" :class="lessonStore.activeStep === step.number ? 'bg-bg-hover text-text-primary' : 'bg-bg-surface text-text-muted'">
            {{ step.number }}
          </span>
          <span>{{ step.label }}</span>
        </button>
      </div>

      <div class="flex items-center gap-2 font-mono text-xs">
        <span class="px-2.5 py-1 rounded-lg bg-accent-yellow/50 text-accent-yellow border border-accent-yellow/30 font-bold flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 text-accent-yellow" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <span>+{{ lessonStore.currentLesson?.xpReward ?? 0 }} XP</span>
        </span>
      </div>
    </header>

    <div v-if="lessonStore.isOfflineFallback" class="px-6 py-2 bg-accent-yellow/10 border-b border-accent-yellow/30 text-xs text-accent-yellow flex items-center gap-2" role="alert">
      <BaseIcon name="warning" class="w-3.5 h-3.5 flex-shrink-0" />
      <span>Không kết nối được máy chủ — đang hiển thị nội dung bài học cục bộ.</span>
    </div>

    <main class="flex-1 min-h-0 relative w-full h-full overflow-hidden">
      <!-- Loading -->
      <div v-if="lessonStore.isLoading && !lessonStore.currentLesson" class="w-full h-full flex flex-col items-center justify-center text-center">
        <div class="inline-block w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
        <p class="text-text-muted mt-4">Đang tải bài học...</p>
      </div>

      <!-- Error -->
      <div v-else-if="lessonStore.error && !lessonStore.currentLesson" class="w-full h-full flex flex-col items-center justify-center text-center px-6">
        <div class="text-5xl mb-4"><BaseIcon name="warning" class="w-14 h-14 text-accent-red mx-auto" /></div>
        <h3 class="text-xl font-bold text-text-secondary">{{ lessonStore.error }}</h3>
        <p class="text-text-muted mt-2">Vui lòng quay lại khóa học và thử lại.</p>
        <router-link :to="courseId ? `/courses/${courseId}` : '/courses'" class="mt-6 px-6 py-2.5 bg-accent text-white font-semibold rounded-xl hover:bg-accent-dark transition-colors">
          Quay lại khóa học
        </router-link>
      </div>

      <!-- Content -->
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
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LessonStepTheory from './components/LessonStepTheory.vue';
import LessonStepViz from './components/LessonStepViz.vue';
import LessonStepQuiz from './components/LessonStepQuiz.vue';
import LessonStepCodeLab from './components/LessonStepCodeLab.vue';
import LessonCompletionModal from './LessonCompletionModal.vue';
import { useLessonStore } from '../../features/lesson/store/useLessonStore';
import { courseApi } from '../../services/courseApi';

const route = useRoute();
const router = useRouter();
const lessonStore = useLessonStore();

const showCompletionModal = ref(false);
const nextLessonId = ref<string | null>(null);

const lessonId = computed(() => route.params.id as string);
const courseId = computed(() => {
  const fromQuery = route.query.courseId;
  if (typeof fromQuery === 'string' && fromQuery.length > 0) return fromQuery;
  return lessonStore.lessonMeta?.courseId ?? null;
});

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

function onVizWatched(): void {
  lessonStore.markVisualizerWatched();
}

async function onQuizSubmit(answers: Record<string, number>): Promise<void> {
  await lessonStore.submitQuiz(answers);
}

function onQuizComplete(): void {
  if (lessonStore.currentLesson?.codelabTask) {
    lessonStore.goToStep(4);
  } else {
    void finishLesson();
  }
}

async function onLessonComplete(): Promise<void> {
  await lessonStore.completeCodelab();
  void finishLesson();
}

async function finishLesson(): Promise<void> {
  nextLessonId.value = await resolveNextLessonId();
  showCompletionModal.value = true;
}

/** Tìm bài kế tiếp trong cùng roadmap. API đã trả lessons theo đúng thứ tự
 *  (module → item) nên KHÔNG sort lại — sort theo orderIndex sẽ trộn giữa các chặng. */
async function resolveNextLessonId(): Promise<string | null> {
  const courseIdValue = courseId.value;
  const currentId = lessonId.value;
  if (!courseIdValue || !currentId) return null;
  try {
    const data = await courseApi.getCourseById(courseIdValue) as unknown as {
      lessons?: Array<{ id: string }>;
    };
    const lessons = data.lessons ?? [];
    const currentIdx = lessons.findIndex(l => l.id === currentId);
    if (currentIdx === -1 || currentIdx >= lessons.length - 1) return null;
    return lessons[currentIdx + 1].id;
  } catch (err) {
    console.warn('Không tải được danh sách bài kế tiếp:', err);
    return null;
  }
}

function goToQuiz(quizId: string): void {
  showCompletionModal.value = false;
  router.push({ name: 'quiz', query: { quizId } });
}

function goToNextLesson(nextId: string): void {
  showCompletionModal.value = false;
  router.push({ name: 'lesson-study', params: { id: nextId }, query: courseId.value ? { courseId: courseId.value } : {} });
}

function goBackToCourse(): void {
  showCompletionModal.value = false;
  router.push(courseId.value ? `/courses/${courseId.value}` : '/courses');
}

watch(lessonId, (id) => {
  if (id) void lessonStore.loadLesson(id);
}, { immediate: true });
</script>
