<template>
  <div class="course-detail-view min-h-[calc(100vh-48px)] bg-bg-primary font-sans">
    <!-- Breadcrumb -->
    <div class="px-6 py-2 border-b border-border-subtle bg-bg-secondary">
      <BreadcrumbsBar :items="[{ label: 'Khóa học', path: '/courses' }, { label: course?.title ?? '...', path: `/courses/${route.params.id}` }]" />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <div class="inline-block w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
      <p class="text-text-muted mt-4 text-sm">Đang tải thông tin khóa học...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="flex flex-col items-center justify-center py-20 text-center px-6">
      <BaseIcon name="warning" class="w-12 h-12 text-accent-red mx-auto mb-4" />
      <h3 class="text-lg font-bold text-text-secondary">{{ error }}</h3>
      <p class="text-text-muted mt-2 text-sm">Vui lòng thử lại sau hoặc liên hệ hỗ trợ.</p>
      <!-- LM-069: nút Thử lại khi tải chi tiết khóa học thất bại. -->
      <button
        @click="loadCourseDetail"
        class="mt-4 px-5 py-2 bg-accent text-white font-semibold rounded-xl hover:bg-accent-dark transition-colors text-sm cursor-pointer"
      >
        Thử lại
      </button>
    </div>

    <!-- Content -->
    <div v-else-if="course" class="flex flex-col lg:flex-row max-w-7xl mx-auto">
      <!-- Main Content (Left) -->
      <div class="flex-1 min-w-0 px-6 py-6 flex flex-col gap-6">
        <!-- Course Header -->
        <section>
          <div class="flex items-center gap-2 mb-3">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20">
              {{ getCategoryLabel(course.category) }}
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-bg-surface text-text-muted border border-border-subtle">
              {{ getDifficultyLabel(course.difficulty) }}
            </span>
            <span v-if="course.isPremium" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/20">
              Premium
            </span>
          </div>
          <h1 class="text-2xl lg:text-3xl font-black text-text-primary tracking-tight">{{ course.title }}</h1>
          <p class="text-sm text-text-secondary mt-3 leading-relaxed whitespace-pre-line">{{ course.description }}</p>
        </section>

        <!-- What you'll learn -->
        <section class="p-5 rounded-2xl border border-border-subtle bg-bg-secondary">
          <h2 class="text-base font-bold text-text-primary mb-3 flex items-center gap-2">
            <BaseIcon name="bulb" class="w-4 h-4 text-accent" />
            Bạn sẽ học được gì
          </h2>
          <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li v-for="(item, i) in learningOutcomes" :key="i" class="flex items-start gap-2 text-xs text-text-secondary">
              <BaseIcon name="check" class="w-3.5 h-3.5 text-accent-green mt-0.5 shrink-0" />
              <span>{{ item }}</span>
            </li>
          </ul>
        </section>

        <!-- Course Content / Lessons -->
        <section>
          <h2 class="text-lg font-bold text-text-primary mb-4">Nội dung khóa học</h2>
          <div class="text-xs text-text-muted mb-4">
            {{ course.lessons.length }} bài giảng • {{ totalXp }} XP tổng cộng
          </div>

          <!-- Module grouping (accordion) -->
          <div class="flex flex-col gap-3">
            <div
              v-for="(module, mIdx) in modules"
              :key="mIdx"
              class="rounded-xl border border-border-subtle overflow-hidden"
            >
              <!-- Module header -->
              <button
                @click="toggleModule(mIdx)"
                class="w-full flex items-center justify-between px-4 py-3 bg-bg-secondary hover:bg-bg-hover transition-colors cursor-pointer"
              >
                <div class="flex items-center gap-3">
                  <BaseIcon name="folder" class="w-4 h-4 text-accent" />
                  <span class="text-sm font-bold text-text-primary">{{ module.title }}</span>
                  <span class="text-[10px] text-text-muted">{{ module.lessons.length }} bài</span>
                </div>
                <BaseIcon
                  :name="expandedModules.has(mIdx) ? 'arrow-up' : 'arrow-down'"
                  class="w-4 h-4 text-text-muted transition-transform"
                />
              </button>

              <!-- Lessons list -->
              <Transition name="expand">
                <div v-if="expandedModules.has(mIdx)" class="border-t border-border-subtle">
                  <router-link
                    v-for="(lesson, lIdx) in module.lessons"
                    :key="lesson.id"
                    :to="startLesson(lesson)"
                    class="flex items-center gap-3 px-4 py-3 transition-all border-b border-border-subtle last:border-b-0 hover:bg-bg-hover group"
                  >
                    <!-- Status icon -->
                    <div class="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                      :class="getLessonStatusClass(lesson.id)"
                    >
                      <BaseIcon v-if="getLessonStatus(lesson.id) === 'completed'" name="check" class="w-3 h-3" />
                      <span v-else-if="getLessonStatus(lesson.id) === 'in-progress'" class="w-2 h-2 rounded-full bg-accent-yellow" />
                      <!-- LM-063: đánh số toàn cục (không reset theo chặng). -->
                      <span v-else>{{ mIdx * MODULE_SIZE + lIdx + 1 }}</span>
                    </div>

                    <!-- Lesson info -->
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-semibold text-text-primary truncate">{{ lesson.title }}</p>
                      <div class="flex items-center gap-2 mt-0.5">
                        <span v-if="lesson.sandboxType" class="text-[9px] font-bold uppercase tracking-wider text-accent">
                          {{ lesson.sandboxType }}
                        </span>
                        <span v-if="lesson.quizId" class="text-[9px] font-bold uppercase tracking-wider text-accent-purple">
                          Quiz
                        </span>
                        <span class="text-[9px] text-text-muted">+{{ lesson.xpReward }} XP</span>
                      </div>
                    </div>

                    <!-- Arrow -->
                    <BaseIcon name="chevron-right" class="w-4 h-4 text-text-disabled group-hover:text-text-secondary transition-colors shrink-0" />
                  </router-link>
                </div>
              </Transition>
            </div>
          </div>
        </section>
      </div>

      <!-- Sidebar Right -->
      <div class="w-full lg:w-80 shrink-0 px-6 pb-6 lg:pl-0 lg:py-6">
        <div class="lg:sticky lg:top-4 flex flex-col gap-4">
          <!-- Cover Image -->
          <div class="w-full h-44 rounded-2xl border border-border-subtle overflow-hidden">
            <CourseCover :course="course" class="w-full h-full" />
          </div>

          <!-- Progress (if logged in) -->
          <div v-if="authStore.isAuthenticated" class="p-4 rounded-2xl border border-border-subtle bg-bg-secondary">
            <CourseProgressBar :percent="courseProgress.progressPercent" label="Tiến trình của bạn" />
            <p v-if="courseProgress.isCompleted" class="text-[11px] text-accent-green font-bold mt-2 flex items-center gap-1">
              <BaseIcon name="check-circle" class="w-3.5 h-3.5" />
              Bạn đã hoàn thành khóa học này!
            </p>
          </div>

          <!-- Stats -->
          <div class="p-4 rounded-2xl border border-border-subtle bg-bg-secondary flex flex-col gap-3">
            <div class="flex justify-between items-center text-xs">
              <span class="text-text-muted">Số bài giảng:</span>
              <span class="font-bold text-text-primary">{{ course.lessons.length }}</span>
            </div>
            <div class="flex justify-between items-center text-xs">
              <span class="text-text-muted">Tổng điểm thưởng:</span>
              <span class="font-bold text-accent">{{ totalXp }} XP</span>
            </div>
            <div class="flex justify-between items-center text-xs">
              <span class="text-text-muted">Yêu cầu:</span>
              <span class="font-bold text-accent-yellow">{{ course.isPremium ? 'Premium' : 'Miễn phí' }}</span>
            </div>
          </div>

          <!-- CTA Button -->
          <router-link
            v-if="authStore.isAuthenticated"
            :to="startCourseUrl"
            class="block text-center py-3 rounded-2xl font-bold text-sm transition-all shadow-lg"
            :class="courseProgress.progressPercent === 100
              ? 'bg-accent-green text-white shadow-accent-green/20 hover:bg-accent-green/90'
              : 'bg-accent text-white shadow-accent/20 hover:bg-accent/90'"
          >
            {{ courseProgress.progressPercent === 100 ? 'Ôn tập lại' : courseProgress.progressPercent > 0 ? 'Tiếp tục học' : 'Bắt đầu học' }}
          </router-link>
          <router-link
            v-else
            to="/"
            class="block text-center py-3 rounded-2xl font-bold text-sm bg-accent text-white shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all"
          >
            Đăng nhập để bắt đầu
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { useCourseStore } from '../../features/courses/store/useCourseStore';
import { courseApi } from '../../services/courseApi';
import CourseCover from '../../features/courses/components/CourseCover.vue';
import CourseProgressBar from '../../features/courses/components/CourseProgressBar.vue';
import BreadcrumbsBar from '../../features/courses/components/BreadcrumbsBar.vue';
import { resolveLessonRoute, resolveStartCourseUrl } from '../../features/courses/utils/courseAccess';

interface LessonDto {
  id: string;
  title: string;
  contentMd: string;
  sandboxType: string;
  sandboxConfig: string;
  quizId: string | null;
  xpReward: number;
  orderIndex: number;
  status: 'NotStarted' | 'InProgress' | 'Completed';
}

interface CourseDetailDto {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  isPremium: boolean;
  coverImage: string;
  isPublished: boolean;
  lessons: LessonDto[];
}

interface ModuleGroup {
  title: string;
  lessons: LessonDto[];
}

const authStore = useAuthStore();
const courseStore = useCourseStore();
const route = useRoute();

const loading = ref(true);
const error = ref<string | null>(null);
const course = ref<CourseDetailDto | null>(null);
const expandedModules = reactive(new Set<number>([0]));

const totalXp = computed(() => {
  return course.value?.lessons.reduce((acc, l) => acc + l.xpReward, 0) ?? 0;
});

const courseProgress = computed(() => {
  if (!course.value) return { progressPercent: 0, isCompleted: false, completedLessonIds: [] as string[] };
  // Truyền lessonIds từ detail để đếm progress không phụ thuộc list API (LM-014).
  return courseStore.getCourseProgress(
    course.value.id,
    course.value.lessons.map(l => l.id),
  );
});

// Group lessons into modules (every 5 lessons = 1 module)
const MODULE_SIZE = 5;
const modules = computed<ModuleGroup[]>(() => {
  if (!course.value) return [];
  const lessons = course.value.lessons;
  const result: ModuleGroup[] = [];
  for (let i = 0; i < lessons.length; i += MODULE_SIZE) {
    const chunk = lessons.slice(i, i + MODULE_SIZE);
    const moduleNum = result.length + 1;
    result.push({
      title: `Chặng ${moduleNum}`,
      lessons: chunk,
    });
  }
  return result;
});

const startCourseUrl = computed(() => {
  if (!course.value) return '/courses';
  const firstUncompleted = courseStore.getFirstUncompletedLesson(course.value.id);
  const hasPremium = authStore.currentUser?.isPremium === true;
  // Gating Premium dùng chung (LM-037): không Premium → /checkout.
  return resolveStartCourseUrl(course.value, firstUncompleted, hasPremium);
});

const categoryMap: Record<string, string> = {
  DataStructure: 'Cấu trúc dữ liệu',
  Algorithm: 'Giải thuật',
  OOP: 'Hướng đối tượng (OOP)',
  SystemDesign: 'Thiết kế hệ thống',
  Sorting: 'Sắp xếp',
  Searching: 'Tìm kiếm',
  'Tree/Graph': 'Cây & Đồ thị',
  SOLID: 'SOLID',
  'Design Patterns': 'Design Patterns',
  'DI/IoC': 'DI/IoC',
};

const difficultyMap: Record<string, string> = {
  Beginner: 'Cơ bản',
  Intermediate: 'Trung cấp',
  Advanced: 'Nâng cao',
  Easy: 'Dễ',
  Medium: 'Trung bình',
  Hard: 'Khó',
};

const learningOutcomes = computed(() => {
  if (!course.value) return [];
  const outcomes: string[] = [];
  outcomes.push(`Hiểu sâu về ${getCategoryLabel(course.value.category).toLowerCase()}`);
  outcomes.push('Trực quan hóa thuật toán với minh họa động');
  outcomes.push('Thực hành viết code với Code Lab');
  outcomes.push('Kiểm tra kiến thức qua bài Quiz trắc nghiệm');
  if (course.value.isPremium) outcomes.push('Nội dung Premium chất lượng cao');
  return outcomes;
});

function getCategoryLabel(val: string) { return categoryMap[val] || val; }
function getDifficultyLabel(val: string) { return difficultyMap[val] || val; }

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

function toggleModule(idx: number) {
  if (expandedModules.has(idx)) {
    expandedModules.delete(idx);
  } else {
    expandedModules.add(idx);
  }
}

function startLesson(lesson: LessonDto): string {
  const hasPremium = authStore.currentUser?.isPremium === true;
  // Gating Premium dùng chung (LM-037): khóa học Premium + user thường → /checkout.
  return resolveLessonRoute(course.value, lesson.id, hasPremium);
}

// Race-token chống request cũ ghi đè khi đổi khóa học nhanh.
let detailRequestId = 0;

async function loadCourseDetail() {
  const requestId = ++detailRequestId;
  loading.value = true;
  error.value = null;
  const courseId = route.params.id as string;

  try {
    const data = await courseApi.getCourseById(courseId);
    if (requestId !== detailRequestId) return;
    course.value = {
      ...data,
      coverImage: data.coverImageUrl ?? data.coverImage,
    } as unknown as CourseDetailDto;
  } catch (err) {
    if (requestId !== detailRequestId) return;
    console.error('Failed to load course detail:', err);
    error.value = 'Không thể kết nối đến máy chủ.';
  } finally {
    if (requestId === detailRequestId) loading.value = false;
  }
}

onMounted(() => {
  loadCourseDetail();
});

watch(
  () => route.params.id,
  () => loadCourseDetail(),
);
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}
.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 1000px;
}
</style>
