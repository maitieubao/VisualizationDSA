<template>
  <div class="courses-list-view container mx-auto px-4 py-8 max-w-7xl animate-fade-in">
    <!-- Header -->
    <header class="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <h1 class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 m-0 tracking-tight">
          Học Viện DSA & Thiết Kế
        </h1>
        <p class="text-slate-400 mt-2 text-lg">
          Khám phá các khóa học trực quan sinh động giúp bạn làm chủ cấu trúc dữ liệu, giải thuật và thiết kế hệ thống.
        </p>
      </div>
      <div v-if="authStore.currentUser" class="stats-glass px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-4 bg-slate-900/40 backdrop-blur">
        <div class="text-left">
          <div class="text-xs text-slate-400 uppercase font-semibold tracking-wider">Cấp độ của bạn</div>
          <div class="text-xl font-bold text-indigo-300">Cấp {{ authStore.currentUser.currentLevel ?? 1 }}</div>
        </div>
        <div class="w-[1px] h-8 bg-white/10"></div>
        <div class="text-left">
          <div class="text-xs text-slate-400 uppercase font-semibold tracking-wider">Tích lũy</div>
          <div class="text-xl font-bold text-purple-300">{{ authStore.currentUser.totalXP ?? 0 }} XP</div>
        </div>
      </div>
    </header>

    <!-- Filter Toolbar -->
    <section class="filters-bar mb-8 p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md flex flex-wrap items-center justify-between gap-6">
      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="cat in categories"
          :key="cat.value"
          @click="selectedCategory = cat.value"
          class="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 border"
          :class="selectedCategory === cat.value
            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-lg shadow-indigo-500/5'
            : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10'"
        >
          {{ cat.label }}
        </button>
      </div>

      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
          <button
            v-for="diff in difficulties"
            :key="diff.value"
            @click="selectedDifficulty = diff.value"
            class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200"
            :class="selectedDifficulty === diff.value
              ? 'bg-purple-500/30 text-purple-300 shadow'
              : 'text-slate-400 hover:text-slate-200'"
          >
            {{ diff.label }}
          </button>
        </div>
      </div>
    </section>

    <!-- Course Cards Grid -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-for="i in 3" :key="i" class="card-skeleton rounded-2xl h-[380px] bg-slate-800/40 animate-pulse border border-white/5"></div>
    </div>

    <div v-else-if="filteredCourses.length === 0" class="empty-state text-center py-20 bg-slate-900/40 rounded-3xl border border-white/5">
      <div class="text-5xl mb-4">🔍</div>
      <h3 class="text-xl font-bold text-slate-300">Không tìm thấy khóa học phù hợp</h3>
      <p class="text-slate-500 mt-2">Vui lòng thay đổi bộ lọc hoặc quay lại sau.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <article
        v-for="course in filteredCourses"
        :key="course.id"
        class="course-card group relative rounded-3xl overflow-hidden border transition-all duration-500 flex flex-col"
        :class="course.isPremium
          ? 'border-amber-500/20 bg-slate-900/80 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/5'
          : 'border-white/10 bg-slate-900/50 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5'"
      >
        <!-- Card Image -->
        <div class="relative h-48 w-full overflow-hidden">
          <img
            :src="course.coverImageUrl || 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=500&q=80'"
            :alt="course.title"
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

          <!-- Badges -->
          <div class="absolute top-4 left-4 flex gap-2">
            <span
              v-if="course.isPremium"
              class="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20"
            >
              Premium
            </span>
            <span
              class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-slate-300 border border-white/10"
            >
              {{ course.difficulty }}
            </span>
          </div>

          <span class="absolute bottom-4 right-4 text-xs font-semibold text-slate-400">
            {{ course.totalLessons }} bài giảng
          </span>
        </div>

        <!-- Card Body -->
        <div class="p-6 flex-1 flex flex-col justify-between">
          <div>
            <span class="text-xs font-semibold text-indigo-400 uppercase tracking-widest">{{ course.category }}</span>
            <h3 class="text-xl font-bold text-white mt-1 group-hover:text-indigo-300 transition-colors line-clamp-1">
              {{ course.title }}
            </h3>
            <p class="text-slate-400 text-sm mt-3 line-clamp-3 leading-relaxed">
              {{ course.description }}
            </p>
          </div>

          <!-- Progress Bar or Unlock Call to action -->
          <div class="mt-6 pt-4 border-t border-white/5">
            <div v-if="authStore.currentUser" class="flex flex-col gap-2">
              <div class="flex justify-between items-center text-xs">
                <span class="text-slate-400">Tiến độ hoàn thành</span>
                <span class="font-bold text-indigo-300">{{ course.progressPercent }}%</span>
              </div>
              <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                  :style="{ width: course.progressPercent + '%' }"
                ></div>
              </div>
            </div>

            <div class="mt-4 flex items-center justify-between">
              <router-link
                :to="{ name: 'course-detail', params: { id: course.id } }"
                class="w-full text-center py-3 rounded-xl font-semibold text-sm transition-all duration-300"
                :class="course.isPremium && !authStore.currentUser?.isPremium
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                  : 'bg-white/5 hover:bg-indigo-600 text-white border border-white/5 hover:border-indigo-600'"
              >
                {{ course.isPremium && !authStore.currentUser?.isPremium ? 'Mở khóa Premium' : 'Xem khóa học' }}
              </router-link>
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../features/auth/store/useAuthStore';

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
  { label: 'Cấu trúc dữ liệu', value: 'dsa' },
  { label: 'Sắp xếp', value: 'sorting' },
  { label: 'Đồ thị', value: 'graph' },
  { label: 'Hướng đối tượng', value: 'oop' },
  { label: 'Nguyên lý SOLID', value: 'solid' },
  { label: 'Mẫu thiết kế', value: 'patterns' },
  { label: 'Hệ thống', value: 'system' },
];

const difficulties = [
  { label: 'Tất cả độ khó', value: 'all' },
  { label: 'Dễ', value: 'easy' },
  { label: 'Trung bình', value: 'medium' },
  { label: 'Khó', value: 'hard' },
];

const filteredCourses = computed(() => {
  return courses.value.filter(c => {
    const matchesCategory = selectedCategory.value === 'all' || c.category.toLowerCase() === selectedCategory.value.toLowerCase();
    const matchesDifficulty = selectedDifficulty.value === 'all' || c.difficulty.toLowerCase() === selectedDifficulty.value.toLowerCase();
    return matchesCategory && matchesDifficulty;
  });
});

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
      if (Array.isArray(data) && data.length > 0) {
        courses.value = data;
        return;
      }
    }
    // Fallback Mock 11 Courses across 3 Levels
    courses.value = MOCK_COURSES;
  } catch (err) {
    console.error('Failed to load courses:', err);
    courses.value = MOCK_COURSES;
  } finally {
    loading.value = false;
  }
}

const MOCK_COURSES: CourseDto[] = [
  // 🟢 Level 1: Easy
  {
    id: 'c1',
    title: 'Nhập môn Cấu trúc dữ liệu & Giải thuật',
    description: 'Làm quen với giao diện AlgoLens, hiểu bản chất chỉ số Big-O, thao tác mảng và chuỗi cơ bản.',
    category: 'dsa',
    difficulty: 'Easy',
    isPremium: false,
    coverImageUrl: 'https://images.unsplash.com/photo-1516116211223-48a122638c59?w=500&q=80',
    isPublished: true,
    createdAt: new Date().toISOString(),
    totalLessons: 1,
    completedLessons: 0,
    progressPercent: 0
  },
  {
    id: 'c2',
    title: 'Làm chủ Danh sách liên kết (Linked List)',
    description: 'Nắm vững con trỏ, Node, Singly vs Doubly Linked List, cơ chế quản lý bộ nhớ và cắt nối con trỏ.',
    category: 'dsa',
    difficulty: 'Easy',
    isPremium: false,
    coverImageUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500&q=80',
    isPublished: true,
    createdAt: new Date().toISOString(),
    totalLessons: 1,
    completedLessons: 0,
    progressPercent: 0
  },
  {
    id: 'c3',
    title: 'Ngăn xếp & Hàng đợi (Stack & Queue)',
    description: 'Hiểu rõ nguyên lý LIFO vs FIFO, ứng dụng Stack trong Undo/Redo và Queue trong xử lý hàng chờ.',
    category: 'dsa',
    difficulty: 'Easy',
    isPremium: false,
    coverImageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&q=80',
    isPublished: true,
    createdAt: new Date().toISOString(),
    totalLessons: 1,
    completedLessons: 0,
    progressPercent: 0
  },
  // 🟡 Level 2: Medium
  {
    id: 'c4',
    title: 'Sắp xếp & Tìm kiếm hiệu quả',
    description: 'Làm chủ tư duy Divide & Conquer, so sánh side-by-side tốc độ Bubble vs Quick vs Merge Sort.',
    category: 'sorting',
    difficulty: 'Medium',
    isPremium: false,
    coverImageUrl: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=500&q=80',
    isPublished: true,
    createdAt: new Date().toISOString(),
    totalLessons: 2,
    completedLessons: 0,
    progressPercent: 0
  },
  {
    id: 'c5',
    title: 'Cây nhị phân & Duyệt cây (Binary Trees)',
    description: 'Khảo sát tư duy đệ quy, duyệt cây DFS (Pre/In/Post order) và duyệt BFS theo tầng (Level Order).',
    category: 'dsa',
    difficulty: 'Medium',
    isPremium: false,
    coverImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80',
    isPublished: true,
    createdAt: new Date().toISOString(),
    totalLessons: 1,
    completedLessons: 0,
    progressPercent: 0
  },
  {
    id: 'c6',
    title: 'Tư duy Hướng đối tượng (OOP Mastery)',
    description: 'Visual hóa 4 trụ cột OOP, bảng VTable, cơ chế Dynamic Binding và Access Control dưới bộ nhớ.',
    category: 'oop',
    difficulty: 'Medium',
    isPremium: false,
    coverImageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&q=80',
    isPublished: true,
    createdAt: new Date().toISOString(),
    totalLessons: 1,
    completedLessons: 0,
    progressPercent: 0
  },
  {
    id: 'c7',
    title: 'Design Patterns cơ bản',
    description: 'Học cách thiết kế phần mềm linh hoạt bằng Singleton, Factory, Observer và Strategy Pattern.',
    category: 'patterns',
    difficulty: 'Medium',
    isPremium: false,
    coverImageUrl: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=500&q=80',
    isPublished: true,
    createdAt: new Date().toISOString(),
    totalLessons: 1,
    completedLessons: 0,
    progressPercent: 0
  },
  // 🔴 Level 3: Hard
  {
    id: 'c8',
    title: 'Đồ thị & Bài toán tối ưu đường đi',
    description: 'Khảo sát biểu diễn đồ thị, Dijkstra tô màu node realtime, Topological Sort và TSP.',
    category: 'graph',
    difficulty: 'Hard',
    isPremium: true,
    coverImageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&q=80',
    isPublished: true,
    createdAt: new Date().toISOString(),
    totalLessons: 1,
    completedLessons: 0,
    progressPercent: 0
  },
  {
    id: 'c9',
    title: 'Nguyên lý SOLID & Tái cấu trúc code',
    description: 'Tối ưu kiến trúc phần mềm với 5 nguyên lý SOLID, chỉ số LCOM4 và kỹ thuật Refactoring God Class.',
    category: 'solid',
    difficulty: 'Hard',
    isPremium: true,
    coverImageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80',
    isPublished: true,
    createdAt: new Date().toISOString(),
    totalLessons: 1,
    completedLessons: 0,
    progressPercent: 0
  },
  {
    id: 'c10',
    title: 'Quy hoạch động (Dynamic Programming)',
    description: 'Bản chất Memoization vs Tabulation, bài toán Knapsack 0/1, LIS và kỹ thuật Traceback.',
    category: 'dsa',
    difficulty: 'Hard',
    isPremium: true,
    coverImageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&q=80',
    isPublished: true,
    createdAt: new Date().toISOString(),
    totalLessons: 1,
    completedLessons: 0,
    progressPercent: 0
  },
  {
    id: 'c11',
    title: 'System Design nhập môn & Concurrency',
    description: 'Mô phỏng Packet Routing, Load Balancing bốc khói, Race Condition, Lock & Thread-safe Singleton.',
    category: 'system',
    difficulty: 'Hard',
    isPremium: true,
    coverImageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&q=80',
    isPublished: true,
    createdAt: new Date().toISOString(),
    totalLessons: 1,
    completedLessons: 0,
    progressPercent: 0
  }
];

onMounted(() => {
  loadCourses();
});
</script>

<style scoped>
.courses-list-view {
  min-height: calc(100vh - 80px);
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
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
