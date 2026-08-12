<template>
  <div class="courses-list-view container mx-auto px-4 py-8 max-w-7xl animate-fade-in">

    <header class="mb-10 text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div class="flex-1">
        <h1 class="text-4xl font-extrabold text-text-primary m-0 tracking-tight">
          Lộ trình học DSA
        </h1>
        <p class="text-text-secondary mt-2 text-lg">
          Ba lộ trình trực quan theo trình độ — Cơ bản, Trung cấp và Nâng cao — giúp bạn làm chủ cấu trúc dữ liệu và giải thuật từng bước.
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

    <CourseFilter
      :categories="courseStore.categories"
      :difficulties="courseStore.difficulties"
      :selected-category="courseStore.selectedCategory"
      :selected-difficulty="courseStore.selectedDifficulty"
      :search-query="courseStore.searchQuery"
      @update:category="courseStore.setCategory"
      @update:difficulty="courseStore.setDifficulty"
      @update:searchQuery="courseStore.setSearchQuery"
    />

    <div class="flex items-center gap-3 mt-4 relative">
      <label for="course-sort" class="text-xs text-text-muted font-semibold uppercase tracking-wider">Sắp xếp</label>
      <div class="relative flex-1 sm:w-auto">
        <select
          id="course-sort"
          v-model="selectedSort"
          class="appearance-none w-full sm:w-auto bg-bg-surface text-text-primary border border-border-strong rounded-full pl-4 pr-10 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all cursor-pointer"
          aria-label="Sắp xếp khóa học"
        >
          <option value="default">Mặc định</option>
          <option value="difficulty">Độ khó</option>
          <option value="title">Tiêu đề A-Z</option>
          <option value="xp">XP giảm dần</option>
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-text-secondary" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
      </div>
    </div>

    <div v-if="courseStore.isLoading" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-6" role="status" aria-label="Đang tải khóa học">
      <div v-for="i in 4" :key="i" class="rounded-2xl overflow-hidden border border-border-subtle bg-bg-surface">
        <div class="h-36 bg-bg-active animate-pulse"></div>
        <div class="p-4 space-y-3">
          <div class="h-4 bg-bg-active rounded w-3/4 animate-pulse"></div>
          <div class="h-3 bg-bg-active rounded w-1/2 animate-pulse"></div>
          <div class="h-1.5 bg-bg-active rounded w-full animate-pulse mt-4"></div>
          <div class="h-8 bg-bg-active rounded animate-pulse mt-2"></div>
        </div>
      </div>
    </div>

    <div v-else-if="!errorMessage && sortedCourses.length === 0" class="empty-state text-center py-20 bg-bg-surface rounded-lg border border-border-default mt-6" role="status">
      <div class="text-5xl mb-4" aria-hidden="true"><BaseIcon name="search" class="w-14 h-14 text-text-muted mx-auto" /></div>
      <h3 class="text-xl font-bold text-text-primary">Không tìm thấy khóa học phù hợp</h3>
      <p class="text-text-secondary mt-2">Vui lòng thay đổi bộ lọc hoặc quay lại sau.</p>
    </div>

    <!-- LM-038: error state THAY THẾ empty state (không hiện cả hai cùng lúc). -->
    <div v-else-if="errorMessage" class="mt-6 text-center py-10 bg-bg-surface rounded-lg border border-border-default">
      <div class="text-5xl mb-4"><BaseIcon name="warning" class="w-14 h-14 text-accent-red mx-auto" /></div>
      <h3 class="text-xl font-bold text-text-primary">Không thể tải khóa học</h3>
      <p class="text-text-secondary mt-2">{{ errorMessage }}</p>
      <button
        @click="loadCourses"
        class="mt-4 px-6 py-2.5 bg-accent text-white font-semibold rounded-xl hover:bg-accent-dark transition-colors"
      >
        Thử lại
      </button>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-6" role="list" aria-label="Danh sách khóa học">
      <router-link
        v-for="course in paginatedCourses"
        :key="course.id"
        :to="{ name: 'course-detail', params: { id: course.id } }"
        class="course-card-link block"
        :aria-label="`Xem chi tiết khóa học ${course.title}`"
        role="listitem"
      >
        <CourseCard :course="course" />
      </router-link>
    </div>

    <div v-if="hasMore" class="mt-8 text-center">
      <button
        @click="page++"
        class="px-8 py-3 bg-bg-surface border border-border-default text-text-primary font-semibold rounded-xl hover:bg-bg-hover hover:border-accent/30 transition-all"
      >
        Xem thêm
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { useCourseStore } from '../../features/courses/store/useCourseStore';
import { courseApi } from '../../services/courseApi';
import CourseCard from '../../features/courses/components/CourseCard.vue';
import CourseFilter from '../../features/courses/components/CourseFilter.vue';

const authStore = useAuthStore();
const courseStore = useCourseStore();

const errorMessage = ref<string | null>(null);
const selectedSort = ref('default');
const page = ref(1);
const pageSize = 8;

const paginatedCourses = computed(() => {
  return sortedCourses.value.slice(0, page.value * pageSize);
});

const hasMore = computed(() => {
  return paginatedCourses.value.length < sortedCourses.value.length;
});

const sortedCourses = computed(() => {
  const courses = courseStore.filteredCourses;
  switch (selectedSort.value) {
    case 'difficulty': {
      const order: Record<string, number> = { Easy: 0, Beginner: 0, Medium: 1, Intermediate: 1, Hard: 2, Advanced: 2 };
      return [...courses].sort((a, b) => (order[a.difficulty] ?? 0) - (order[b.difficulty] ?? 0));
    }
    case 'title':
      return [...courses].sort((a, b) => a.title.localeCompare(b.title, 'vi'));
    case 'xp':
      return [...courses].sort((a, b) => (b.xpReward ?? 0) - (a.xpReward ?? 0));
    default:
      return courses;
  }
});

watch([selectedSort, () => courseStore.filteredCourses], () => {
  page.value = 1;
});

// Race-token chống request cũ ghi đè danh sách mới (LM-032).
let loadRequestId = 0;

async function loadCourses() {
  const requestId = ++loadRequestId;
  errorMessage.value = null;
  courseStore.isLoading = true;
  try {
    const courses = await courseApi.getCourses();
    if (requestId !== loadRequestId) return;
    const mapped = courses.map(c => ({
      ...c,
      coverImage: c.coverImageUrl ?? c.coverImage,
    }));
    courseStore.courses = mapped.filter(c => c.isPublished);
  } catch (err) {
    if (requestId !== loadRequestId) return;
    console.error('Failed to load courses:', err);
    errorMessage.value = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối và thử lại.';
  } finally {
    if (requestId === loadRequestId) courseStore.isLoading = false;
  }
}

onMounted(() => {
  loadCourses();
});

// Reload danh sách khi đổi tài khoản (mỗi user có tiến độ khác nhau — LM-032).
watch(() => authStore.currentUser?.id, (newId, oldId) => {
  if (newId !== undefined && newId !== oldId) void loadCourses();
});
</script>

<style scoped>
.courses-list-view {
  min-height: calc(100vh - 80px);
}

.course-card-link {
  text-decoration: none;
  color: inherit;
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
</style>