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
      <div v-if="authStore.currentUser" class="stats-glass px-6 py-3 rounded-lg border border-border-default flex items-center gap-4 bg-bg-surface backdrop-blur">
        <div class="text-left">
          <div class="text-xs text-text-muted uppercase font-semibold tracking-wider">Cấp độ của bạn</div>
          <div class="text-xl font-bold text-text-primary">Cấp {{ authStore.currentUser.currentLevel ?? 1 }}</div>
        </div>
        <div class="w-[1px] h-8 bg-border-default"></div>
        <div class="text-left">
          <div class="text-xs text-text-muted uppercase font-semibold tracking-wider">Tích lũy</div>
          <div class="text-xl font-bold text-text-primary">{{ authStore.currentUser.totalXP ?? 0 }} XP</div>
        </div>
      </div>
    </header>

    
    <section class="filters-bar mb-8 flex flex-col sm:flex-row items-center gap-4 w-full">
      
      <div class="relative w-full sm:w-64">
        <select 
          v-model="selectedCategory"
          class="appearance-none w-full bg-bg-surface text-text-primary border border-border-strong rounded-full pl-4 pr-10 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all cursor-pointer"
        >
          <option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-text-secondary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
      </div>

      
      <div class="relative w-full sm:w-48">
        <select 
          v-model="selectedDifficulty"
          class="appearance-none w-full bg-bg-surface text-text-primary border border-border-strong rounded-full pl-4 pr-10 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all cursor-pointer"
        >
          <option v-for="diff in difficulties" :key="diff.value" :value="diff.value">{{ diff.label }}</option>
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-text-secondary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
      </div>
    </section>

    
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="i in 4" :key="i" class="card-skeleton rounded-lg h-[300px] bg-bg-surface border border-border-default animate-pulse"></div>
    </div>

    <div v-else-if="filteredCourses.length === 0" class="empty-state text-center py-20 bg-bg-surface rounded-lg border border-border-default">
      <div class="text-5xl mb-4">🔍</div>
      <h3 class="text-xl font-bold text-text-primary">Không tìm thấy khóa học phù hợp</h3>
      <p class="text-text-secondary mt-2">Vui lòng thay đổi bộ lọc hoặc quay lại sau.</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      <router-link
        v-for="course in filteredCourses"
        :key="course.id"
        :to="{ name: 'course-detail', params: { id: course.id } }"
        class="course-card group flex flex-col bg-bg-surface rounded-lg overflow-hidden border border-border-default hover:shadow-lg transition-all duration-300 cursor-pointer h-full"
      >
        
        <div class="relative w-full aspect-video overflow-hidden border-b border-border-subtle">
          <img
            :src="course.coverImageUrl || 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=500&q=80'"
            :alt="course.title"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          <div class="absolute top-2 left-2 flex gap-1.5">
            <span
              v-if="course.isPremium"
              class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-400 text-black shadow-sm"
            >
              Premium
            </span>
          </div>
        </div>

        
        <div class="p-4 flex flex-col flex-1">
          <h3 class="text-base font-bold text-text-primary group-hover:text-accent transition-colors line-clamp-2 leading-tight">
            {{ course.title }}
          </h3>
          <p class="text-xs text-text-muted mt-1.5 font-medium uppercase tracking-wide">
            {{ categories.find(c => c.value === course.category)?.label || course.category }}
          </p>
          
          <div class="flex-1"></div>

          
          <div v-if="authStore.currentUser" class="mt-4">
            <div class="w-full h-1 bg-bg-active rounded-full overflow-hidden">
              <div
                class="h-full bg-accent transition-all duration-500"
                :style="{ width: course.progressPercent + '%' }"
              ></div>
            </div>
            <div class="text-[10px] font-semibold text-text-muted mt-1">
              Đã học {{ course.progressPercent }}%
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
    
    courses.value = MOCK_COURSES;
  } catch (err) {
    console.error('Failed to load courses:', err);
    courses.value = MOCK_COURSES;
  } finally {
    loading.value = false;
  }
}

const MOCK_COURSES: CourseDto[] = [
  
  {
    id: 'c1',
    title: 'Nhập môn Cấu trúc dữ liệu & Giải thuật',
    description: 'Làm quen với giao diện AlgoLens, hiểu bản chất chỉ số Big-O, thao tác mảng và chuỗi cơ bản.',
    category: 'DataStructure',
    difficulty: 'Beginner',
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
    category: 'DataStructure',
    difficulty: 'Beginner',
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
    category: 'DataStructure',
    difficulty: 'Beginner',
    isPremium: false,
    coverImageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&q=80',
    isPublished: true,
    createdAt: new Date().toISOString(),
    totalLessons: 1,
    completedLessons: 0,
    progressPercent: 0
  },
  
  {
    id: 'c4',
    title: 'Sắp xếp & Tìm kiếm hiệu quả',
    description: 'Làm chủ tư duy Divide & Conquer, so sánh side-by-side tốc độ Bubble vs Quick vs Merge Sort.',
    category: 'Algorithm',
    difficulty: 'Intermediate',
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
    category: 'DataStructure',
    difficulty: 'Intermediate',
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
    category: 'OOP',
    difficulty: 'Intermediate',
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
    category: 'OOP',
    difficulty: 'Intermediate',
    isPremium: false,
    coverImageUrl: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=500&q=80',
    isPublished: true,
    createdAt: new Date().toISOString(),
    totalLessons: 1,
    completedLessons: 0,
    progressPercent: 0
  },
  
  {
    id: 'c8',
    title: 'Đồ thị & Bài toán tối ưu đường đi',
    description: 'Khảo sát biểu diễn đồ thị, Dijkstra tô màu node realtime, Topological Sort và TSP.',
    category: 'Algorithm',
    difficulty: 'Advanced',
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
    category: 'OOP',
    difficulty: 'Advanced',
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
    category: 'Algorithm',
    difficulty: 'Advanced',
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
    category: 'SystemDesign',
    difficulty: 'Advanced',
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
