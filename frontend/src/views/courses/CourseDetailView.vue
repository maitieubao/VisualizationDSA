<template>
  <div class="course-detail-view h-[calc(100vh-64px)] w-full overflow-hidden relative animate-fade-in text-text-primary pb-0">
    
    <!-- Hero Banner Background -->
    <div class="absolute top-0 left-0 w-full h-[40vh] z-0 overflow-hidden" :class="getCategoryGradient(course?.category || '')">
      <div class="absolute inset-0 flex items-center justify-center opacity-30">
        <BaseIcon :name="getCategoryIcon(course?.category || '')" class="w-48 h-48" />
      </div>
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-bg-primary/80 to-bg-primary"></div>
      <!-- Grid pattern -->
      <div class="absolute inset-0" style="background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px); background-size: 30px 30px; mask-image: linear-gradient(to bottom, white 30%, transparent 90%);"></div>
    </div>

    <!-- Main Content Container -->
    <div class="container mx-auto px-6 py-6 lg:py-12 max-w-5xl relative z-10 flex flex-col h-full">
      
      <!-- Top Navigation -->
      <router-link to="/courses" class="inline-flex items-center gap-2 text-sm font-bold text-accent hover:text-accent transition-colors mb-8 bg-bg-surface px-4 py-2 rounded-xl backdrop-blur-md border border-border-accent">
        <BaseIcon name="chevron-left" class="w-4 h-4" /> Quay lại bản đồ Lộ trình
      </router-link>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-32">
        <div class="inline-block w-12 h-12 border-4 border-border-accent border-t-indigo-500 rounded-full animate-spin"></div>
        <p class="text-text-secondary mt-6 font-medium">Đang thiết lập Roadmap...</p>
      </div>
      <div v-else-if="error" class="text-center py-32 glass-panel rounded-3xl">
        <BaseIcon name="warning" class="w-14 h-14 mx-auto mb-6 text-accent-warm" />
        <h3 class="text-2xl font-bold text-text-primary">{{ error }}</h3>
        <p class="text-text-muted mt-3">Vui lòng thử lại sau hoặc liên hệ hỗ trợ.</p>
      </div>

      <!-- Course Content -->
      <div v-else-if="course" class="grid grid-cols-1 lg:grid-cols-12 gap-10 h-full">
        
        <!-- Left Column: Info & Timeline (Takes 8 columns on large screens) -->
        <div class="lg:col-span-8 flex flex-col gap-8 h-full overflow-y-auto custom-scrollbar pr-2 md:pr-4 pb-32">
          
          <!-- Hero Info -->
          <section class="flex flex-col gap-4">
            <div class="flex items-center gap-3">
              <span class="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-accent text-text-primary shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-border-accent">
                {{ getCategoryLabel(course.category) }}
              </span>
              <span class="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-bg-hover text-text-secondary border border-border-default">
                {{ getDifficultyLabel(course.difficulty) }}
              </span>
            </div>

            <h1 class="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-light via-bg-surface to-accent-purple mt-2 leading-tight">
              {{ course.title }}
            </h1>
            
            <p class="text-text-secondary text-lg leading-relaxed mt-2 opacity-90">
              {{ course.description }}
            </p>
          </section>

          <!-- Header removed per redesign plan -->
        <section class="p-8 rounded-3xl glass-panel">
          <h2 class="text-2xl font-bold text-text-primary mb-6">Nội dung bài học</h2>

          <div class="lessons-timeline relative flex flex-col gap-6 ml-4 md:ml-6 pl-6 md:pl-8 border-l-2 border-border-default">
            <div
              v-for="(lesson, idx) in course.lessons"
              :key="lesson.id"
              class="lesson-item relative transition-all duration-300 animate-fade-in group w-full"
              :style="{ animationDelay: `${idx * 0.1}s` }"
            >
              <!-- Timeline Dot -->
              <div class="absolute -left-[33px] md:-left-[41px] top-6 w-4 h-4 rounded-full border-4 border-border-default z-20 shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover:scale-125"
                :class="[
                  getLessonState(lesson, idx, course) === 'completed' ? 'bg-accent-green shadow-emerald-500/50' : '',
                  getLessonState(lesson, idx, course) === 'active' ? 'bg-accent-warm shadow-amber-400/50 animate-pulse' : '',
                  getLessonState(lesson, idx, course) === 'available' ? 'bg-bg-hover' : '',
                  getLessonState(lesson, idx, course) === 'locked' ? 'bg-bg-hover border-border-default' : ''
                ]"
              ></div>

              <!-- Lesson Card -->
              <div 
                class="group relative flex flex-col md:flex-row items-start md:items-center p-6 md:p-8 rounded-[2rem] border transition-all duration-500 cursor-pointer overflow-hidden backdrop-blur-md"
                :class="[
                  getLessonState(lesson, idx, course) === 'completed' ? 'bg-emerald-900/10 border-accent-green/20 hover:border-accent-green/40 hover:bg-emerald-900/20' : '',
                  getLessonState(lesson, idx, course) === 'active' ? 'bg-accent-dark/20 border-border-accent shadow-[0_0_30px_rgba(99,102,241,0.15)] hover:bg-accent-dark/30' : '',
                  getLessonState(lesson, idx, course) === 'available' ? 'bg-bg-surface border-border-default/50 hover:bg-bg-surface hover:border-border-default' : '',
                  ['locked', 'locked_sequence'].includes(getLessonState(lesson, idx, course)) ? 'bg-bg-secondary/20 border-border-default opacity-60' : ''
                ]"
                @click="!['locked', 'locked_sequence'].includes(getLessonState(lesson, idx, course)) && startLesson(lesson, idx, course)"
              >
                  <!-- Glassmorphism shine effect -->
                  <div v-if="!['locked', 'locked_sequence'].includes(getLessonState(lesson, idx, course))" class="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-bg-surface/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                  <div class="flex-1 z-10">
                    <div class="flex items-center gap-3 mb-2">
                      <span class="text-xs font-black text-text-muted tracking-wider">TRẠM {{ idx + 1 }}</span>
                      <span v-if="lesson.sandboxType" class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-accent/20 text-accent border border-border-accent">
                        {{ lesson.sandboxType }}
                      </span>
                      <span v-if="lesson.quizId" class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-accent-purple/20 text-accent-purple border border-accent-purple/30">
                        Quiz
                      </span>
                    </div>
                    <h3 class="text-lg font-bold text-text-primary transition-colors"
                        :class="!['locked', 'locked_sequence'].includes(getLessonState(lesson, idx, course)) ? 'group-hover:text-accent-light' : 'text-text-secondary'">
                      <BaseIcon v-if="['locked', 'locked_sequence'].includes(getLessonState(lesson, idx, course))" name="lock" class="w-4 h-4 inline-block mr-2 align-text-bottom text-accent-warm" />
                      {{ lesson.title }}
                    </h3>
                  </div>

                  <div class="flex items-center justify-between md:justify-end gap-4 z-10 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-none border-border-default">
                    <div class="flex flex-col md:items-end">
                      <span class="text-[10px] text-text-secondary font-medium uppercase tracking-wider">Phần thưởng</span>
                      <span class="text-accent-green font-bold text-sm"><BaseIcon name="zap" class="w-3.5 h-3.5 inline-block mr-0.5 align-text-bottom" /> +{{ lesson.xpReward }} XP</span>
                    </div>
                    
                    <button
                      class="px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2"
                      :class="[
                        getLessonState(lesson, idx, course) === 'completed' ? 'bg-accent-green/10 text-accent-green border border-accent-green/20 hover:bg-accent-green/20 shadow-lg hover:shadow-emerald-500/20' : '',
                        getLessonState(lesson, idx, course) === 'active' ? 'bg-accent text-text-primary hover:bg-accent shadow-lg shadow-indigo-600/30' : '',
                        getLessonState(lesson, idx, course) === 'available' ? 'bg-bg-hover text-text-secondary hover:bg-bg-hover shadow-lg' : '',
                        getLessonState(lesson, idx, course) === 'locked' ? 'bg-bg-surface text-text-muted cursor-not-allowed border border-border-default' : '',
                        getLessonState(lesson, idx, course) === 'locked_sequence' ? 'bg-bg-secondary text-text-muted cursor-not-allowed border border-border-default' : ''
                      ]"
                      :disabled="['locked', 'locked_sequence'].includes(getLessonState(lesson, idx, course))"
                      @click.stop="startLesson(lesson, idx, course)"
                    >
                      {{ getLessonState(lesson, idx, course) === 'completed' ? 'Học lại' : 
                         getLessonState(lesson, idx, course) === 'active' ? 'Tiếp tục' : 
                         getLessonState(lesson, idx, course) === 'locked' ? 'Premium' : 
                         getLessonState(lesson, idx, course) === 'locked_sequence' ? 'Chưa mở khóa' : 'Bắt đầu' }}
                      
                      <svg v-if="!['completed', 'locked', 'locked_sequence'].includes(getLessonState(lesson, idx, course))" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                      <svg v-if="['locked', 'locked_sequence'].includes(getLessonState(lesson, idx, course))" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </button>
                  </div>
              </div>
            </div>
          </div>
        </section>

        </div>

        <!-- Right Column: Sidebar (Takes 4 columns) -->
        <div class="lg:col-span-4 h-full overflow-y-auto custom-scrollbar pb-32 hidden lg:block">
          <!-- Sticky Wrapper -->
          <div class="flex flex-col gap-6 pt-0">
            
            <!-- Premium Gate Card -->
            <div
              v-if="course.isPremium && !authStore.currentUser?.isPremium"
              class="p-6 rounded-3xl border border-accent-warm/40 bg-gradient-to-br from-accent-warm/20 to-bg-secondary backdrop-blur-xl relative overflow-hidden group"
            >
              <div class="absolute top-0 right-0 w-32 h-32 bg-accent-warm/10 rounded-full blur-3xl group-hover:bg-accent-warm/20 transition-all"></div>
              
              <BaseIcon name="crown" class="w-10 h-10 mb-4 text-accent-warm drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
              <h3 class="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-warm-light to-accent-warm uppercase tracking-widest mb-2">
                Lộ Trình VIP
              </h3>
              <p class="text-text-secondary text-sm leading-relaxed mb-6">
                Mở khóa giới hạn! Đăng ký Premium để truy cập toàn bộ lộ trình nâng cao và nhận chứng chỉ hoàn thành.
              </p>
              <router-link
                to="/checkout"
                class="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-accent-warm to-accent-warm hover:from-accent-warm-light hover:to-accent-warm text-text-primary font-black rounded-xl transition-all duration-300 shadow-accent hover:shadow-accent"
              >
                Nâng cấp Premium
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                </svg>
              </router-link>
            </div>

            <!-- Stats Card -->
            <div class="p-6 rounded-3xl glass-panel flex flex-col gap-5">
              <h3 class="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2 border-b border-border-default pb-4">
                Tổng quan Lộ trình
              </h3>
              
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-accent/10 border border-border-accent flex items-center justify-center">
                  <BaseIcon name="book" class="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div class="text-[10px] font-bold text-text-muted uppercase tracking-wider">Số chặng (Nodes)</div>
                  <div class="text-lg font-black text-text-primary">{{ course.lessons.length }} Trạm</div>
                </div>
              </div>

              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center">
                  <BaseIcon name="zap" class="w-5 h-5 text-accent-green" />
                </div>
                <div>
                  <div class="text-[10px] font-bold text-text-muted uppercase tracking-wider">Tổng phần thưởng</div>
                  <div class="text-lg font-black text-accent-green">{{ totalXp }} XP</div>
                </div>
              </div>

              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center">
                  <BaseIcon name="target" class="w-5 h-5 text-accent-purple" />
                </div>
                <div>
                  <div class="text-[10px] font-bold text-text-muted uppercase tracking-wider">Tiến độ của bạn</div>
                  <div class="text-lg font-black text-text-primary">
                    {{ course.lessons.filter(l => l.status === 'Completed').length }} / {{ course.lessons.length }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../features/auth/store/useAuthStore';

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
  coverImageUrl: string;
  isPublished: boolean;
  lessons: LessonDto[];
}

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

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

function getCategoryGradient(category: string) {
  const map: Record<string, string> = {
    DataStructure: 'bg-gradient-to-br from-accent to-blue-800',
    Algorithm: 'bg-gradient-to-br from-emerald-600 to-teal-800',
    OOP: 'bg-gradient-to-br from-accent-purple to-violet-800',
    SystemDesign: 'bg-gradient-to-br from-accent-warm to-red-800'
  };
  return map[category] || 'bg-gradient-to-br from-slate-600 to-slate-800';
}

function getCategoryIcon(category: string) {
  const map: Record<string, string> = {
    DataStructure: 'link',
    Algorithm: 'zap',
    OOP: 'oop',
    SystemDesign: 'system-architect'
  };
  return map[category] || 'book';
}

function getLessonState(lesson: LessonDto, idx: number, courseRef: CourseDetailDto | null) {
  // Check if course is premium and user is not premium
  if (courseRef?.isPremium && !authStore.currentUser?.isPremium) {
    return 'locked';
  }
  
  if (lesson.status === 'Completed') return 'completed';
  if (lesson.status === 'InProgress') return 'active';
  
  // Sequential locking: NotStarted lessons are locked unless they are the first or the previous one is completed.
  if (lesson.status === 'NotStarted') {
    if (idx === 0) return 'active';
    const prevLesson = courseRef?.lessons[idx - 1];
    if (prevLesson?.status === 'Completed') return 'active';
    return 'locked_sequence';
  }
  
  return 'available';
}



async function loadCourseDetail() {
  loading.value = true;
  error.value = null;
  const courseId = route.params.id as string;

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = authStore.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}/api/v1/concepts/courses/${courseId}`, { headers });
    if (res.ok) {
      course.value = await res.json();
    } else {
      const errData = await res.json();
      error.value = errData.message ?? 'Lỗi khi tải thông tin lộ trình.';
    }
  } catch (err) {
    console.error('Failed to load course detail:', err);
    error.value = 'Không thể kết nối đến máy chủ.';
  } finally {
    loading.value = false;
  }
}


function startLesson(lesson: LessonDto, idx: number, courseRef: CourseDetailDto | null) {
  const state = getLessonState(lesson, idx, courseRef);
  if (state === 'locked' || state === 'locked_sequence') {
    if (state === 'locked') {
      router.push({ name: 'checkout' });
    }
    return;
  }
  // Sửa URL cho ngắn gọn, chỉ dùng /lessons/:id theo cấu hình router
  router.push({ name: 'lesson-study', params: { id: lesson.id } });
}

onMounted(() => {
  loadCourseDetail();
});
</script>

<style scoped>
@import "./CourseDetailView.css";
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

.animate-fade-in {
  animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
