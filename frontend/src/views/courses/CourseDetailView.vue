<template>
  <div class="course-detail-view container mx-auto px-4 py-8 max-w-5xl animate-fade-in">
    <router-link to="/courses" class="text-sm font-semibold text-accent hover:text-accent transition-colors flex items-center gap-2 mb-6">
      <BaseIcon name="arrow-left" class="w-4 h-4" /> Quay lại danh sách khóa học
    </router-link>

    <div v-if="loading" class="text-center py-20">
      <div class="inline-block w-8 h-8 border-4 border-accent/20 border-t-indigo-500 rounded-full animate-spin"></div>
      <p class="text-text-muted mt-4">Đang tải thông tin khóa học...</p>
    </div>

    <div v-else-if="error" class="text-center py-20 bg-bg-secondary/40 rounded-3xl border border-border-subtle">
      <div class="text-5xl mb-4"><BaseIcon name="warning" class="w-14 h-14 text-accent-red mx-auto" /></div>
      <h3 class="text-xl font-bold text-text-secondary">{{ error }}</h3>
      <p class="text-text-muted mt-2">Vui lòng thử lại sau hoặc liên hệ hỗ trợ.</p>
    </div>

    <div v-else-if="course" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <div class="lg:col-span-2 flex flex-col gap-6">
        <section class="p-8 rounded-3xl border border-border-subtle bg-bg-secondary backdrop-blur-md">
          <div class="flex items-center gap-3">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20">
              {{ getCategoryLabel(course.category) }}
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-bg-surface text-text-muted border border-border-subtle">
              {{ getDifficultyLabel(course.difficulty) }}
            </span>
          </div>

          <h1 class="text-3xl font-extrabold text-text-primary mt-4">{{ course.title }}</h1>
          <p class="text-text-secondary mt-4 leading-relaxed whitespace-pre-line">{{ course.description }}</p>
        </section>

        
        <section class="p-8 rounded-3xl border border-border-subtle bg-bg-secondary backdrop-blur-md">
          <h2 class="text-2xl font-bold text-text-primary mb-6">Nội dung bài học</h2>

          <div class="lessons-timeline flex flex-col gap-4">
            <div
              v-for="(lesson, idx) in course.lessons"
              :key="lesson.id"
              class="lesson-item p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4"
              :class="lesson.status === 'Completed'
                ? 'border-accent-green/20 bg-accent-green/5 hover:border-accent-green/40'
                : 'border-border-subtle bg-bg-hover hover:border-border-default'"
            >
              <div class="flex items-center gap-4">
                
                <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm">
                  <span v-if="lesson.status === 'Completed'" class="text-accent-green text-lg"><BaseIcon name="check" class="w-4 h-4" /></span>
                  <span v-else class="text-text-muted">{{ idx + 1 }}</span>
                </div>

                <div>
                  <h3 class="text-base font-bold text-text-primary leading-tight group-hover:text-accent">{{ lesson.title }}</h3>
                  <div class="flex items-center gap-3 mt-1 text-xs text-text-muted">
                    <span class="flex items-center gap-1"><BaseIcon name="zap" class="w-3 h-3" /> +{{ lesson.xpReward }} XP</span>
                    <span v-if="lesson.sandboxType" class="text-accent font-semibold uppercase text-[10px] tracking-wider bg-accent/10 px-2 py-0.5 rounded">
                      {{ lesson.sandboxType }}
                    </span>
                    <span v-if="lesson.quizId" class="text-accent-purple font-semibold uppercase text-[10px] tracking-wider bg-accent-purple/10 px-2 py-0.5 rounded">
                      Có trắc nghiệm
                    </span>
                  </div>
                </div>
              </div>

              
              <button
                @click="startLesson(lesson)"
                class="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                :class="lesson.status === 'Completed'
                  ? 'bg-accent-green/10 text-accent-green hover:bg-accent-green/20'
                  : 'bg-accent text-white hover:bg-accent'"
              >
                {{ lesson.status === 'Completed' ? 'Học lại' : 'Bắt đầu' }}
              </button>
            </div>
          </div>
        </section>
      </div>

      
      <div class="lg:col-span-1 flex flex-col gap-6">
        
        <div
          v-if="course.isPremium && !authStore.currentUser?.isPremium"
          class="p-6 rounded-3xl border border-accent-yellow/30 bg-gradient-to-br from-accent-yellow/10 via-accent-yellow/5 to-transparent backdrop-blur"
        >
          <div class="text-3xl mb-2"><BaseIcon name="crown" class="w-9 h-9 text-accent-yellow" /></div>
          <h3 class="text-lg font-black text-accent-yellow uppercase tracking-wider">Mở khóa Premium</h3>
          <p class="text-text-secondary text-sm mt-2 leading-relaxed">
            Đây là khóa học Premium nâng cao. Vui lòng đăng ký gói Premium để xem đầy đủ các bài giảng và làm bài trắc nghiệm chứng nhận.
          </p>
          <router-link
            to="/checkout"
            class="mt-6 w-full block text-center py-3 bg-gradient-to-r from-accent-yellow to-accent-yellow hover:from-accent-yellow hover:to-accent-yellow text-slate-950 font-bold rounded-2xl transition-all duration-300 shadow-lg shadow-accent-yellow/20"
          >
            Nâng cấp ngay
          </router-link>
        </div>

        
        <div class="p-6 rounded-3xl border border-border-subtle bg-bg-secondary backdrop-blur-md flex flex-col gap-4">
          <div class="w-full h-40 rounded-2xl border border-border-subtle overflow-hidden shrink-0">
            <CourseCover :course="course" class="w-full h-full" />
          </div>
          <div class="w-full h-[1px] bg-bg-hover my-2"></div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-text-muted">Số bài giảng:</span>
            <span class="font-bold text-text-primary">{{ course.lessons.length }}</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-text-muted">Tổng điểm thưởng:</span>
            <span class="font-bold text-accent">{{ totalXp }} XP</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-text-muted">Yêu cầu:</span>
            <span class="font-bold text-accent-yellow">{{ course.isPremium ? 'Tài khoản Premium' : 'Tài khoản thường' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { courseApi } from '../../services/courseApi';
import CourseCover from '../../features/courses/components/CourseCover.vue';

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

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const loading = ref(true);
const error = ref<string | null>(null);
const course = ref<CourseDetailDto | null>(null);

const totalXp = computed(() => {
  return course.value?.lessons.reduce((acc, l) => acc + l.xpReward, 0) ?? 0;
});

const categoryMap: Record<string, string> = {
  DataStructure: 'Cấu trúc dữ liệu',
  Algorithm: 'Giải thuật',
  OOP: 'Hướng đối tượng (OOP)',
  SystemDesign: 'Thiết kế hệ thống'
};

const difficultyMap: Record<string, string> = {
  Beginner: 'Cơ bản',
  Intermediate: 'Trung cấp',
  Advanced: 'Nâng cao'
};

function getCategoryLabel(val: string) { return categoryMap[val] || val; }
function getDifficultyLabel(val: string) { return difficultyMap[val] || val; }

async function loadCourseDetail() {
  loading.value = true;
  error.value = null;
  const courseId = route.params.id as string;

  try {
    const data = await courseApi.getCourseById(courseId);
    course.value = {
      ...data,
      coverImage: data.coverImageUrl ?? data.coverImage,
    } as unknown as CourseDetailDto;
  } catch (err) {
    console.error('Failed to load course detail:', err);
    error.value = 'Không thể kết nối đến máy chủ.';
  } finally {
    loading.value = false;
  }
}

function startLesson(lesson: LessonDto) {
  // Chặn mọi user chưa đăng nhập hoặc chưa có Premium khi khóa học là premium
  // (trước đây chỉ check role==='Student' → user vô danh đi thẳng vào).
  const hasPremium = authStore.currentUser?.isPremium === true;
  if (course.value?.isPremium && !hasPremium) {
    router.push({ name: 'checkout' });
    return;
  }
  router.push({ name: 'lesson-study', params: { id: lesson.id }, query: { courseId: course.value?.id } });
}

onMounted(() => {
  loadCourseDetail();
});

// Chuyển course A→B (cùng component, chỉ đổi param) phải load lại — trước đây hiển thị dữ liệu cũ.
watch(
  () => route.params.id,
  () => loadCourseDetail(),
);
</script>

<style scoped>
@import "./CourseDetailView.css";
</style>
