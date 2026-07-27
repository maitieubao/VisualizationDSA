import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { COURSES } from '../../../data/courses';
import type { Course, CourseProgress } from '../types/course.types';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useLessonStore } from '../../lesson/store/useLessonStore';

export const useCourseStore = defineStore('course', () => {
  const authStore = useAuthStore();
  const lessonStore = useLessonStore();

  // State
  const courses = ref<Course[]>([]);
  const isLoading = ref<boolean>(false);
  const selectedCategory = ref<string>('All');
  const selectedDifficulty = ref<string>('All');
  const searchQuery = ref<string>('');

  // Computed
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

  // ─── Actions ──────────────────────────────────────────────────────────

  function loadCourses() {
    isLoading.value = true;
    // Giả lập loading từ API
    setTimeout(() => {
      courses.value = COURSES.filter(c => c.isPublished);
      isLoading.value = false;
    }, 300);
  }

  function getCourseById(id: string): Course | undefined {
    return courses.value.find(c => c.id === id);
  }

  function getCourseProgress(courseId: string): CourseProgress {
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

    // Lấy tiến độ từ lessonStore (localStorage)
    let completedCount = 0;
    const completedLessonIds: string[] = [];
    let xpEarned = 0;

    for (const lesson of course.lessons) {
      // Kiểm tra từng lesson đã hoàn thành chưa
      const key = `lesson_progress_${lesson.id}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          if (data.codelabCompleted && data.xpAwarded >= course.xpReward / course.totalLessons) {
            completedCount++;
            completedLessonIds.push(lesson.id);
            xpEarned += data.xpAwarded;
          }
        } catch (e) { /* ignore */ }
      }
    }

    const progressPercent = course.totalLessons > 0
      ? Math.round((completedCount / course.totalLessons) * 100)
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
      if (data.codelabCompleted) return 'completed';
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
    if (!course || course.lessons.length === 0) return null;

    for (const lesson of course.lessons) {
      const status = getLessonStatus(lesson.id);
      if (status === 'in-progress') return lesson.id;
    }

    for (const lesson of course.lessons) {
      const status = getLessonStatus(lesson.id);
      if (status === 'not-started') return lesson.id;
    }

    return course.lessons[0]?.id ?? null;
  }

  return {
    courses,
    isLoading,
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
