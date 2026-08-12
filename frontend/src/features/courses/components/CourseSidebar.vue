<template>
  <aside class="course-sidebar flex flex-col h-full bg-bg-secondary border-r border-border-subtle overflow-hidden">
    <div class="sidebar-header px-4 py-3 border-b border-border-subtle shrink-0">
      <div class="flex items-center justify-between mb-2">
        <router-link
          v-if="courseId"
          :to="`/courses/${courseId}`"
          class="text-[11px] font-semibold text-accent hover:text-accent transition-colors flex items-center gap-1"
        >
          <BaseIcon name="arrow-left" class="w-3 h-3" />
          <span class="truncate max-w-[180px]">{{ courseTitle }}</span>
        </router-link>
        <button
          @click="$emit('toggle')"
          class="p-1 rounded-md hover:bg-bg-hover text-text-muted transition-colors lg:hidden cursor-pointer"
        >
          <BaseIcon name="x" class="w-4 h-4" />
        </button>
      </div>
      <CourseProgressBar :percent="progressPercent" :show-label="false" />
      <p class="text-[10px] text-text-muted mt-1 font-medium tabular-nums">
        {{ completedCount }}/{{ totalLessons }} bài đã hoàn thành
      </p>
    </div>

    <div class="sidebar-lessons flex-1 overflow-y-auto py-2" ref="lessonsContainer">
      <div
        v-for="(lesson, idx) in lessons"
        :key="lesson.id"
        class="lesson-entry"
      >
        <router-link
          :to="lessonRoute(lesson.id)"
          class="flex items-center gap-3 px-4 py-2.5 transition-all duration-150 border-l-2 group"
          :class="[
            lesson.id === currentLessonId
              ? 'bg-accent/10 border-l-accent text-text-primary'
              : 'border-l-transparent hover:bg-bg-hover text-text-secondary hover:text-text-primary'
          ]"
          :aria-current="lesson.id === currentLessonId ? 'page' : undefined"
          :aria-label="(isLessonLocked(lesson) ? 'Khóa: ' : 'Mở bài: ') + lesson.title"
          @click="$emit('selectLesson', lesson.id)"
        >
          <div class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
            :class="isLessonLocked(lesson) ? 'bg-bg-surface text-text-muted' : getLessonStatusClass(lesson.id)"
          >
            <BaseIcon v-if="isLessonLocked(lesson)" name="lock" class="w-3 h-3" />
            <BaseIcon v-else-if="getLessonStatus(lesson.id) === 'completed'" name="check" class="w-3 h-3" />
            <span v-else-if="getLessonStatus(lesson.id) === 'in-progress'" class="w-2 h-2 rounded-full bg-accent-yellow" />
            <span v-else>{{ idx + 1 }}</span>
          </div>

          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium truncate leading-tight"
              :class="lesson.id === currentLessonId ? 'text-text-primary font-bold' : 'text-text-secondary'"
            >
              {{ lesson.title }}
            </p>
            <div class="flex items-center gap-2 mt-0.5">
              <span v-if="isLessonLocked(lesson)" class="text-[9px] font-bold uppercase tracking-wider text-accent-yellow">
                Premium
              </span>
              <span v-else-if="lesson.sandboxType" class="text-[9px] font-bold uppercase tracking-wider text-accent">
                {{ lesson.sandboxType }}
              </span>
              <span v-if="lesson.quizId" class="text-[9px] font-bold uppercase tracking-wider text-accent-purple">
                Quiz
              </span>
              <span class="text-[9px] text-text-muted">+{{ lesson.xpReward }} XP</span>
            </div>
          </div>
        </router-link>
      </div>

      <!-- LS-037: tách riêng trạng thái đang tải và trạng thái rỗng. -->
      <div v-if="loading" class="px-4 py-8 text-center">
        <p class="text-xs text-text-muted">Đang tải danh sách bài học...</p>
      </div>
      <div v-else-if="lessons.length === 0" class="px-4 py-8 text-center">
        <p class="text-xs text-text-muted">Chưa có bài học nào trong khóa học này.</p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, watch, nextTick, ref } from 'vue';
import { useCourseStore } from '../store/useCourseStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { resolveLessonRoute } from '../utils/courseAccess';
import CourseProgressBar from './CourseProgressBar.vue';

interface LessonItem {
  id: string;
  title: string;
  xpReward: number;
  sandboxType?: string;
  quizId?: string | null;
}

const props = withDefaults(defineProps<{
  courseId: string;
  courseTitle: string;
  lessons: LessonItem[];
  currentLessonId?: string;
  /** Khóa học có yêu cầu Premium không (gating chung LM-037). */
  isCoursePremium?: boolean;
  /** Đang tải danh sách bài (tách riêng empty state — LS-037). */
  loading?: boolean;
}>(), {
  isCoursePremium: false,
  loading: false,
});

defineEmits<{
  (e: 'toggle'): void;
  (e: 'selectLesson', lessonId: string): void;
}>();

const courseStore = useCourseStore();
const authStore = useAuthStore();
const lessonsContainer = ref<HTMLElement | null>(null);

const totalLessons = computed(() => props.lessons?.length ?? 0);

const hasPremium = computed(() => authStore.currentUser?.isPremium === true);

// LS-031: bài khóa Premium bị khóa icon + nhãn khi user chưa mua Premium
// (link vẫn dẫn /checkout qua resolveLessonRoute — nhưng người dùng biết trước khi click).
function isLessonLocked(lesson: LessonItem): boolean {
  return props.isCoursePremium && !hasPremium.value;
}

/** Đi qua helper gating Premium chung — user không Premium → /checkout (LM-037). */
function lessonRoute(lessonId: string): string {
  const course = { id: props.courseId, isPremium: props.isCoursePremium };
  return resolveLessonRoute(course, lessonId, hasPremium.value);
}

const completedCount = computed(() => {
  return (props.lessons ?? []).filter(l => getLessonStatus(l.id) === 'completed').length;
});

const progressPercent = computed(() => {
  if (totalLessons.value === 0) return 0;
  return Math.round((completedCount.value / totalLessons.value) * 100);
});

function getLessonStatus(lessonId: string): 'not-started' | 'in-progress' | 'completed' {
  return courseStore.getLessonStatus(lessonId);
}

function getLessonStatusClass(lessonId: string): string {
  const status = getLessonStatus(lessonId);
  switch (status) {
    case 'completed': return 'bg-accent-green/20 text-accent-green';
    case 'in-progress': return 'bg-accent-yellow/20 text-accent-yellow';
    default: return 'bg-bg-surface text-text-muted';
  }
}

watch(() => props.currentLessonId, async () => {
  await nextTick();
  const container = lessonsContainer.value;
  if (!container) return;
  const activeEl = container.querySelector('.border-l-accent') as HTMLElement | null;
  if (activeEl) {
    activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
});
</script>

<style scoped>
.course-sidebar {
  width: 300px;
  min-width: 260px;
}

@media (max-width: 1023px) {
  .course-sidebar {
    width: 280px;
    min-width: 260px;
  }
}
</style>
