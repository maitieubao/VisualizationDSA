<template>
  <div class="course-detail-view h-full w-full bg-slate-950 overflow-y-auto custom-scrollbar relative animate-fade-in text-white pb-20">
    
    <!-- Hero Banner Background -->
    <div class="absolute top-0 left-0 w-full h-[40vh] z-0 overflow-hidden">
      <img
        :src="course?.coverImageUrl || 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=1000&q=80'"
        alt="Course Cover"
        class="w-full h-full object-cover opacity-20"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/80 to-slate-950"></div>
    </div>

    <!-- Main Content Container -->
    <div class="container mx-auto px-6 py-12 max-w-5xl relative z-10">
      
      <!-- Top Navigation -->
      <router-link to="/courses" class="inline-flex items-center gap-2 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors mb-8 bg-indigo-950/40 px-4 py-2 rounded-xl backdrop-blur-md border border-indigo-500/20">
        <span>←</span> Quay lại bản đồ Lộ trình
      </router-link>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-32">
        <div class="inline-block w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p class="text-slate-400 mt-6 font-medium">Đang thiết lập Roadmap...</p>
      </div>
      <div v-else-if="error" class="text-center py-32 bg-slate-900/40 rounded-3xl border border-rose-500/10 backdrop-blur-md">
        <div class="text-6xl mb-6">⚠️</div>
        <h3 class="text-2xl font-bold text-slate-200">{{ error }}</h3>
        <p class="text-slate-500 mt-3">Vui lòng thử lại sau hoặc liên hệ hỗ trợ.</p>
      </div>

      <!-- Course Content -->
      <div v-else-if="course" class="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        <!-- Left Column: Info & Timeline (Takes 8 columns on large screens) -->
        <div class="lg:col-span-8 flex flex-col gap-8">
          
          <!-- Hero Info -->
          <section class="flex flex-col gap-4">
            <div class="flex items-center gap-3">
              <span class="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-indigo-400">
                {{ course.category }}
              </span>
              <span class="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                {{ course.difficulty }}
              </span>
            </div>

            <h1 class="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-purple-300 mt-2 leading-tight">
              {{ course.title }}
            </h1>
            
            <p class="text-slate-300 text-lg leading-relaxed mt-2 opacity-90">
              {{ course.description }}
            </p>
          </section>

          <!-- Timeline Section -->
          <section class="mt-8">
            <h2 class="text-2xl font-black text-white mb-10 flex items-center gap-3">
              <span class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">📍</span>
              Bản đồ Lộ trình (Roadmap)
            </h2>

          </section>
        <section class="p-8 rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-md">
          <h2 class="text-2xl font-bold text-white mb-6">Nội dung bài học</h2>

          <div class="lessons-timeline flex flex-col gap-4">
            <div
              v-for="(lesson, idx) in course.lessons"
              :key="lesson.id"
              class="lesson-item p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4"
              :class="lesson.status === 'Completed'
                ? 'border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40'
                : 'border-white/5 bg-white/5 hover:border-white/20'"
            >
              <div class="flex items-center gap-4">
                
                <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm">
                  <span v-if="lesson.status === 'Completed'" class="text-emerald-400 text-lg">✓</span>
                  <span v-else class="text-slate-400">{{ idx + 1 }}</span>
                </div>

                <!-- Lesson Card -->
                <div 
                  class="p-5 md:p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden"
                  :class="[
                    lesson.status === 'Completed'
                      ? 'border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-900/30 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)]'
                      : (lesson.status === 'InProgress' || (idx === 0 && lesson.status === 'NotStarted'))
                        ? 'border-amber-500/50 bg-amber-950/20 hover:bg-amber-900/30 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(245,158,11,0.15)]'
                        : 'border-white/5 bg-slate-900/40 hover:bg-slate-800/60 hover:-translate-y-1 hover:border-white/20'
                  ]"
                  @click="startLesson(lesson)"
                >
                  <!-- Glassmorphism shine effect -->
                  <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                  <div class="flex-1 z-10">
                    <div class="flex items-center gap-3 mb-2">
                      <span class="text-xs font-black text-slate-500 tracking-wider">TRẠM {{ idx + 1 }}</span>
                      <span v-if="lesson.sandboxType" class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {{ lesson.sandboxType }}
                      </span>
                      <span v-if="lesson.quizId" class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Quiz
                      </span>
                    </div>
                    <h3 class="text-lg font-bold text-white group-hover:text-indigo-200 transition-colors">
                      {{ lesson.title }}
                    </h3>
                  </div>

                  <div class="flex items-center justify-between md:justify-end gap-4 z-10 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-none border-white/5">
                    <div class="flex flex-col md:items-end">
                      <span class="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Phần thưởng</span>
                      <span class="text-emerald-400 font-bold text-sm">⚡ +{{ lesson.xpReward }} XP</span>
                    </div>
                    
                    <button
                      class="px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 shadow-lg"
                      :class="[
                        lesson.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:shadow-emerald-500/20'
                          : (lesson.status === 'InProgress' || (idx === 0 && lesson.status === 'NotStarted'))
                            ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/30'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      ]"
                    >
                      {{ lesson.status === 'Completed' ? 'Học lại' : (lesson.status === 'InProgress' ? 'Tiếp tục' : 'Bắt đầu') }}
                      <svg v-if="lesson.status !== 'Completed'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              
              <button
                @click="startLesson(lesson)"
                class="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                :class="lesson.status === 'Completed'
                  ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500'"
              >
                {{ lesson.status === 'Completed' ? 'Học lại' : 'Bắt đầu' }}
              </button>
            </div>
          </div>
        </section>

        </div>

        <!-- Right Column: Sidebar (Takes 4 columns) -->
        <div class="lg:col-span-4 flex flex-col gap-6 relative">
          <!-- Sticky Wrapper -->
          <div class="sticky top-8 flex flex-col gap-6">
            
            <!-- Premium Gate Card -->
            <div
              v-if="course.isPremium && !authStore.currentUser?.isPremium"
              class="p-6 rounded-3xl border border-amber-500/40 bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 backdrop-blur-xl relative overflow-hidden group"
            >
              <div class="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all"></div>
              
              <div class="text-4xl mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">👑</div>
              <h3 class="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500 uppercase tracking-widest mb-2">
                Lộ Trình VIP
              </h3>
              <p class="text-slate-300 text-sm leading-relaxed mb-6">
                Mở khóa giới hạn! Đăng ký Premium để truy cập toàn bộ lộ trình nâng cao và nhận chứng chỉ hoàn thành.
              </p>
              <router-link
                to="/checkout"
                class="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]"
              >
                Nâng cấp Premium
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                </svg>
              </router-link>
            </div>

            <!-- Stats Card -->
            <div class="p-6 rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-xl flex flex-col gap-5">
              <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-white/10 pb-4">
                Tổng quan Lộ trình
              </h3>
              
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <span class="text-indigo-400 text-lg">📚</span>
                </div>
                <div>
                  <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Số chặng (Nodes)</div>
                  <div class="text-lg font-black text-white">{{ course.lessons.length }} Trạm</div>
                </div>
              </div>

              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <span class="text-emerald-400 text-lg">⚡</span>
                </div>
                <div>
                  <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tổng phần thưởng</div>
                  <div class="text-lg font-black text-emerald-400">{{ totalXp }} XP</div>
                </div>
              </div>

              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <span class="text-purple-400 text-lg">🎯</span>
                </div>
                <div>
                  <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tiến độ của bạn</div>
                  <div class="text-lg font-black text-white">
                    {{ course.lessons.filter(l => l.status === 'Completed').length }} / {{ course.lessons.length }}
                  </div>
                </div>
              </div>

</div>

        </div>
      
      <div class="lg:col-span-1 flex flex-col gap-6">
        
        <div
          v-if="course.isPremium && !authStore.currentUser?.isPremium"
          class="p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-transparent backdrop-blur"
        >
          <div class="text-3xl mb-2">👑</div>
          <h3 class="text-lg font-black text-amber-300 uppercase tracking-wider">Mở khóa Premium</h3>
          <p class="text-slate-300 text-sm mt-2 leading-relaxed">
            Đây là khóa học Premium nâng cao. Vui lòng đăng ký gói Premium để xem đầy đủ các bài giảng và làm bài trắc nghiệm chứng nhận.
          </p>
          <router-link
            to="/checkout"
            class="mt-6 w-full block text-center py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-2xl transition-all duration-300 shadow-lg shadow-amber-500/20"
          >
            Nâng cấp ngay
          </router-link>
        </div>

        
        <div class="p-6 rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-md flex flex-col gap-4">
          <div class="flex items-center gap-3">
            <img
              :src="course.coverImageUrl || 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=500&q=80'"
              :alt="course.title"
              class="w-full h-40 object-cover rounded-2xl border border-white/10"
            />
          </div>
          <div class="w-full h-[1px] bg-white/10 my-2"></div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-slate-400">Số bài giảng:</span>
            <span class="font-bold text-white">{{ course.lessons.length }}</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-slate-400">Tổng điểm thưởng:</span>
            <span class="font-bold text-indigo-400">{{ totalXp }} XP</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-slate-400">Yêu cầu:</span>
            <span class="font-bold text-amber-400">{{ course.isPremium ? 'Tài khoản Premium' : 'Tài khoản thường' }}</span>
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

async function loadCourseDetail() {
  loading.value = true;
  error.value = null;
  const courseId = route.params.id;

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

function startLesson(lesson: LessonDto) {
  if (course.value?.isPremium && !authStore.currentUser?.isPremium && authStore.currentUser?.role === 'Student') {
    router.push({ name: 'checkout' });
    return;
  }
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
