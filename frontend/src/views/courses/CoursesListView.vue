<template>
  <div class="courses-list-view container mx-auto px-4 py-8 max-w-7xl animate-fade-in">
    
    <header class="mb-10 text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div class="flex-1">
        <h1 class="text-4xl font-extrabold text-text-primary m-0 tracking-tight">
          Học Viện DSA & Thiết Kế
        </h1>
        <p class="text-text-secondary mt-2 text-lg">
          Khám phá các khóa học trực quan sinh động giúp bạn làm chủ cấu trúc dữ liệu, giải thuật và thiết kế hệ thống.
        </p>
      </div>
      <div v-if="authStore.currentUser" class="stats-glass px-6 py-3 rounded-xl flex items-center gap-4 glass-panel">
        <div class="text-left">
          <div class="text-xs text-text-muted uppercase font-semibold tracking-wider">Cấp độ của bạn</div>
          <div class="text-xl font-bold text-accent">Cấp {{ authStore.currentUser.currentLevel ?? 1 }}</div>
        </div>
        <div class="w-[1px] h-8 bg-bg-surface"></div>
        <div class="text-left">
          <div class="text-xs text-text-muted uppercase font-semibold tracking-wider">Tích lũy</div>
          <div class="text-xl font-bold text-accent-warm">{{ authStore.currentUser.totalXP ?? 0 }} XP</div>
        </div>
      </div>
    </header>

    
    <section class="filters-bar mb-8 flex flex-col sm:flex-row items-center gap-4 w-full">
      <div class="flex flex-wrap gap-2">
        <button 
          v-for="cat in categories" 
          :key="cat.value" 
          @click="selectedCategory = cat.value"
          class="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border"
          :class="selectedCategory === cat.value 
            ? 'bg-accent text-text-primary border-border-accent shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
            : 'bg-bg-surface text-text-secondary border-border-default hover:bg-bg-hover/50 hover:border-border-default'"
        >
          {{ cat.label }}
        </button>
      </div>

      <div class="w-px h-8 bg-bg-surface mx-2 hidden sm:block"></div>

      <div class="flex flex-wrap gap-2">
        <button 
          v-for="diff in difficulties" 
          :key="diff.value" 
          @click="selectedDifficulty = diff.value"
          class="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border"
          :class="selectedDifficulty === diff.value 
            ? 'bg-accent-green text-text-primary border-accent-green shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
            : 'bg-bg-surface text-text-secondary border-border-default hover:bg-bg-hover/50 hover:border-border-default'"
        >
          {{ diff.label }}
        </button>
      </div>
    </section>

    
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="i in 4" :key="i" class="card-skeleton rounded-lg h-[300px] bg-bg-surface border border-border-default animate-pulse"></div>
    </div>

    <div v-else-if="filteredCourses.length === 0" class="empty-state text-center py-20 bg-bg-surface rounded-lg border border-border-default">
      <LottiePlayer path="https://lottie.host/8c067882-abcf-4d92-bf3f-bdff6a24683d/v2p60HlPib.json" size="150px" />
      <h3 class="text-xl font-bold text-text-primary">Không tìm thấy khóa học phù hợp</h3>
      <p class="text-text-secondary mt-2">Vui lòng thay đổi bộ lọc hoặc quay lại sau.</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      <router-link
        v-for="course in filteredCourses"
        :key="course.id"
        :to="{ name: 'course-detail', params: { id: course.id } }"
        class="course-card glass-panel spring-hover flex flex-col rounded-2xl overflow-hidden cursor-pointer h-full relative"
        data-aos="fade-up"
      >
        <!-- Premium lock overlay (Blur effect) -->
        <div v-if="course.isPremium && !authStore.currentUser?.isPremium" class="absolute inset-0 z-20 backdrop-blur-[2px] bg-black/40 flex items-center justify-center transition-all group-hover:backdrop-blur-sm">
          <div class="bg-accent-warm/20 border border-accent-warm/50 text-accent-warm w-12 h-12 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
        </div>

        <div class="relative w-full aspect-video overflow-hidden border-b border-border-default flex items-center justify-center transition-all duration-500"
             :class="getCategoryGradient(course.category)">
          <!-- Icon instead of image -->
          <div class="text-6xl drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] group-hover:scale-125 transition-transform duration-500 z-10">
            {{ getCategoryIcon(course.category) }}
          </div>
          <!-- Dark mesh overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-bg-primary to-transparent z-0 opacity-80 group-hover:opacity-60 transition-opacity"></div>
          
          <div class="absolute top-2 left-2 flex gap-1.5">
            <span
              v-if="course.isPremium"
              class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-accent-yellow text-black shadow-sm"
            >
              Premium
            </span>
            <span class="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider shadow-md backdrop-blur border"
                  :class="getDifficultyStyle(course.difficulty)">
              {{ course.difficulty }}
            </span>
          </div>
        </div>

        <div class="p-5 flex flex-col flex-1 relative z-10">
          <h3 class="text-lg font-bold text-text-primary group-hover:text-accent transition-colors line-clamp-2 leading-tight mb-2">
            {{ course.title }}
          </h3>
          <p class="text-[11px] text-text-secondary font-medium uppercase tracking-wider mb-4">
            {{ categories.find(c => c.value === course.category)?.label || course.category }}
          </p>
          
          <div class="flex-1"></div>

          <div class="flex justify-between items-center text-xs text-text-secondary font-medium mb-4">
            <span class="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg> {{ course.totalLessons || 12 }} Trạm</span>
            <span class="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> ~{{ (course.totalLessons || 12) * 15 }}m</span>
          </div>

          <div v-if="authStore.currentUser" class="mt-auto border-t border-border-default pt-4">
            <div class="flex justify-between items-end mb-1">
              <span class="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Tiến độ</span>
              <span class="text-xs font-bold text-accent">{{ course.progressPercent }}%</span>
            </div>
            <div class="w-full h-1.5 bg-bg-hover rounded-full overflow-hidden border border-border-default">
              <div
                class="h-full bg-gradient-to-r from-accent to-accent-purple transition-all duration-700 shadow-[0_0_10px_rgba(99,102,241,0.5)] relative"
                :style="{ width: course.progressPercent + '%' }"
              >
                <div class="absolute inset-0 bg-bg-surface animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import LottiePlayer from '@/shared/components/LottiePlayer.vue';

interface CourseDto {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  isPremium: boolean;
  coverImageUrl: string;
  isPublished: boolean;
  createdAt: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
}

const authStore = useAuthStore();
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

const loading = ref(true);
const courses = ref<CourseDto[]>([]);

const selectedCategory = ref('all');
const selectedDifficulty = ref('all');

const categories = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Cấu trúc dữ liệu', value: 'DataStructure' },
  { label: 'Giải thuật', value: 'Algorithm' },
  { label: 'Hướng đối tượng (OOP)', value: 'OOP' },
  { label: 'Thiết kế hệ thống', value: 'SystemDesign' },
];

const difficulties = [
  { label: 'Tất cả độ khó', value: 'all' },
  { label: 'Cơ bản', value: 'Beginner' },
  { label: 'Trung cấp', value: 'Intermediate' },
  { label: 'Nâng cao', value: 'Advanced' },
];

const filteredCourses = computed(() => {
  return courses.value.filter(c => {
    const matchesCategory = selectedCategory.value === 'all' || c.category.toLowerCase() === selectedCategory.value.toLowerCase();
    const matchesDifficulty = selectedDifficulty.value === 'all' || c.difficulty.toLowerCase() === selectedDifficulty.value.toLowerCase();
    return matchesCategory && matchesDifficulty;
  });
});

const getCategoryGradient = (category: string) => {
  const map: Record<string, string> = {
    DataStructure: 'bg-gradient-to-br from-accent to-blue-800',
    Algorithm: 'bg-gradient-to-br from-emerald-600 to-teal-800',
    OOP: 'bg-gradient-to-br from-accent-purple to-violet-800',
    SystemDesign: 'bg-gradient-to-br from-accent-warm to-red-800'
  };
  return map[category] || 'bg-gradient-to-br from-slate-600 to-slate-800';
};

const getCategoryIcon = (category: string) => {
  const map: Record<string, string> = {
    DataStructure: '🔗',
    Algorithm: '⚡',
    OOP: '🧱',
    SystemDesign: '🏗️'
  };
  return map[category] || '📚';
};

const getDifficultyStyle = (difficulty: string) => {
  const map: Record<string, string> = {
    Beginner: 'bg-accent-green/20 text-accent-green border-accent-green/30',
    Intermediate: 'bg-accent-warm/20 text-accent-warm border-accent-warm/30',
    Advanced: 'bg-accent-red/20 text-accent-red border-accent-red/30'
  };
  return map[difficulty] || 'bg-slate-500/20 text-text-secondary border-slate-500/30';
};

async function loadCourses() {
  loading.value = true;
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = authStore.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}/api/v1/concepts/courses`, { headers });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        courses.value = data;
      }
    } else {
      console.error('API failed:', await res.text());
    }
  } catch (err) {
    console.error('Failed to load courses:', err);
  } finally {
    loading.value = false;
  }
}


onMounted(() => {
  loadCourses();
});
</script>

<style scoped>
.courses-list-view {
  min-height: calc(100vh - 80px);
}

.hide-scrollbar {
  -ms-overflow-style: none;  
  scrollbar-width: none;  
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.animate-fade-in {
  animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
