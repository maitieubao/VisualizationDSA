import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { COURSES } from '../../../data/courses';
import { courseApi, type CourseQueryParams } from '../../../services/courseApi';
import type { Course, CourseProgress } from '../types/course.types';
import { useAuthStore } from '../../auth/store/useAuthStore';

export const useCourseStore = defineStore('course', () => {
  const authStore = useAuthStore();

  
  const courses = ref<Course[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string>('');
  const selectedCategory = ref<string>('All');
  const selectedDifficulty = ref<string>('All');
  const searchQuery = ref<string>('');

  
  const filteredCourses = computed(() => {
    let result = courses.value;
    if (selectedCategory.value !== 'All') {
      result = result.filter(c => c.category === selectedCategory.value);
    }
    if (selectedDifficulty.value !== 'All') {
      result = result.filter(c => c.difficulty === selectedDifficulty.value);
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim();
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    }
    return result;
  });

  const categories = computed(() => {
    const cats = new Set(courses.value.map(c => c.category));
    return ['All', ...Array.from(cats)];
  });

  const difficulties = computed(() => {
    const diffs = new Set(courses.value.map(c => c.difficulty));
    return ['All', ...Array.from(diffs)];
  });

  

  // ── Load courses ──
  // Race-token: request cũ trả sau bị bỏ qua (LM-032).
  let coursesLoadRequestId = 0;
  // User mà danh sách hiện tại đã được load cho — reload khi đổi user (LM-032).
  let loadedForUserId: string | undefined = undefined;

  async function loadCourses(params?: CourseQueryParams) {
    const requestId = ++coursesLoadRequestId;
    isLoading.value = true;
    error.value = '';
    try {
      const apiCourses = await courseApi.getCourses(params);
      if (requestId !== coursesLoadRequestId) return;
      const mapped = apiCourses.map(c => ({
        ...c,
        coverImage: c.coverImageUrl ?? c.coverImage,
      }));
      courses.value = mapped.filter(c => c.isPublished);
      loadedForUserId = authStore.currentUser?.id;
    } catch (err) {
      if (requestId !== coursesLoadRequestId) return;
      console.warn('Không tải được khóa học từ máy chủ, dùng dữ liệu cục bộ:', err);
      error.value = 'Không kết nối được máy chủ — đang hiển thị danh sách khóa học cục bộ.';
      courses.value = COURSES.filter(c => c.isPublished);
      loadedForUserId = authStore.currentUser?.id;
    } finally {
      if (requestId === coursesLoadRequestId) isLoading.value = false;
    }
  }

  // Reload danh sách khi chuyển tài khoản (mỗi user có bộ tiến độ riêng).
  watch(() => authStore.currentUser?.id, (newId) => {
    if (newId !== undefined && newId !== loadedForUserId) {
      void loadCourses();
    }
  });

  function getCourseById(id: string): Course | undefined {
    return courses.value.find(c => c.id === id);
  }

  /** Quét toàn bộ localStorage tìm các bài học đã hoàn thành (fallback LM-014). */
  function scanCompletedLessonIds(): string[] {
    const completed: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('lesson_progress_')) continue;
      const lessonId = key.slice('lesson_progress_'.length);
      if (isLessonDone(lessonId)) completed.push(lessonId);
    }
    return completed;
  }

  function isLessonDone(lessonId: string): boolean {
    const saved = localStorage.getItem(`lesson_progress_${lessonId}`);
    if (!saved) return false;
    try {
      const data = JSON.parse(saved);
      // Bài được coi là hoàn thành khi: cờ completed (lưu bởi lesson flow — bao gồm
      // cả bài không có codelab) HOẶC codelabCompleted (dữ liệu cũ).
      return data.completed === true || data.codelabCompleted === true;
    } catch {
      return false;
    }
  }

  function getCourseProgress(courseId: string, lessonIds?: string[]): CourseProgress {
    const course = getCourseById(courseId);
    if (!course) {
      return {
        courseId,
        completedLessonIds: [],
        totalLessons: 0,
        progressPercent: 0,
        xpEarned: 0,
        isCompleted: false,
      };
    }

    // API list `/concepts/courses` KHÔNG trả lessons (chỉ totalLessons) — LM-014:
    // ưu tiên lessonIds từ chi tiết khóa học, fallback dữ liệu local, cuối cùng
    // quét localStorage `lesson_progress_*` để không phụ thuộc course.lessons.
    let ids: string[] = [];
    if (lessonIds && lessonIds.length > 0) {
      ids = lessonIds;
    } else if (course.lessons && course.lessons.length > 0) {
      ids = course.lessons.map(l => l.id);
    } else {
      const localCourse = COURSES.find(c => c.id === courseId);
      ids = localCourse?.lessons.map(l => l.id) ?? [];
    }

    const lessonKeys = ids.length > 0 ? ids : scanCompletedLessonIds();
    let completedCount = 0;
    const completedLessonIds: string[] = [];
    let xpEarned = 0;

    for (const lessonId of lessonKeys) {
      const key = `lesson_progress_${lessonId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          if (isLessonDone(lessonId)) {
            completedCount++;
            completedLessonIds.push(lessonId);
            xpEarned += data.xpAwarded ?? 0;
          }
        } catch (e) {
          console.warn(`Không đọc được dữ liệu tiến độ lesson "${lessonId}" từ localStorage:`, e);
        }
      }
    }

    const denominator = course.totalLessons > 0 ? course.totalLessons : ids.length;
    const progressPercent = denominator > 0
      ? Math.round((completedCount / denominator) * 100)
      : 0;

    return {
      courseId,
      completedLessonIds,
      totalLessons: course.totalLessons,
      progressPercent,
      xpEarned,
      isCompleted: progressPercent === 100,
    };
  }

  function setCategory(category: string) {
    selectedCategory.value = category;
  }

  function setDifficulty(difficulty: string) {
    selectedDifficulty.value = difficulty;
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query;
  }

  function resetFilters() {
    selectedCategory.value = 'All';
    selectedDifficulty.value = 'All';
    searchQuery.value = '';
  }

  function getLessonStatus(lessonId: string): 'not-started' | 'in-progress' | 'completed' {
    const key = `lesson_progress_${lessonId}`;
    const saved = localStorage.getItem(key);
    if (!saved) return 'not-started';
    try {
      const data = JSON.parse(saved);
      if (data.completed === true || data.codelabCompleted === true) return 'completed';
      if (data.hasWatchedVisualizer || data.quizScore !== null) return 'in-progress';
      return 'not-started';
    } catch {
      return 'not-started';
    }
  }

  function getLessonQuizScore(lessonId: string): number | null {
    const key = `lesson_progress_${lessonId}`;
    const saved = localStorage.getItem(key);
    if (!saved) return null;
    try {
      const data = JSON.parse(saved);
      return data.quizScore ?? null;
    } catch {
      return null;
    }
  }

  function getLessonXpEarned(lessonId: string): number {
    const key = `lesson_progress_${lessonId}`;
    const saved = localStorage.getItem(key);
    if (!saved) return 0;
    try {
      const data = JSON.parse(saved);
      return data.xpAwarded ?? 0;
    } catch {
      return 0;
    }
  }

  function getFirstUncompletedLesson(courseId: string): string | null {
    const course = getCourseById(courseId);
    const lessons = course?.lessons ?? [];
    if (lessons.length === 0) return null;

    for (const lesson of lessons) {
      const status = getLessonStatus(lesson.id);
      if (status === 'in-progress') return lesson.id;
    }

    for (const lesson of lessons) {
      const status = getLessonStatus(lesson.id);
      if (status === 'not-started') return lesson.id;
    }

    return lessons[0]?.id ?? null;
  }

  return {
    courses,
    isLoading,
    error,
    selectedCategory,
    selectedDifficulty,
    searchQuery,
    filteredCourses,
    categories,
    difficulties,
    loadCourses,
    getCourseById,
    getCourseProgress,
    setCategory,
    setDifficulty,
    setSearchQuery,
    resetFilters,
    getLessonStatus,
    getLessonQuizScore,
    getLessonXpEarned,
    getFirstUncompletedLesson,
  };
});
