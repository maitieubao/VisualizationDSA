// @vitest-environment jsdom

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCourseStore } from '../store/useCourseStore';
import { COURSES } from '../../../data/courses';
import { courseApi } from '../../../services/courseApi';

// loadCourses giờ gọi API (API-first, fallback local) — mock để test hành vi local.
vi.mock('../../../services/courseApi', () => ({
  courseApi: { getCourses: vi.fn() },
}));

describe('useCourseStore — Khóa học', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.useFakeTimers();
    vi.mocked(courseApi.getCourses).mockResolvedValue(COURSES as never);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('loadCourses', () => {
    it('chỉ nạp các khóa học đã xuất bản (isPublished = true)', async () => {
      const store = useCourseStore();

      store.loadCourses();
      expect(store.isLoading).toBe(true);

      await vi.advanceTimersByTimeAsync(300);

      const expected = COURSES.filter(c => c.isPublished);
      expect(store.courses).toHaveLength(expected.length);
      expect(store.courses.every(c => c.isPublished)).toBe(true);
      expect(store.isLoading).toBe(false);
    });

    it('không nạp các khóa học chưa xuất bản', async () => {
      const store = useCourseStore();

      store.loadCourses();
      await vi.advanceTimersByTimeAsync(300);

      const unpublished = COURSES.filter(c => !c.isPublished);
      for (const course of unpublished) {
        expect(store.getCourseById(course.id)).toBeUndefined();
      }
    });
  });

  describe('filteredCourses', () => {
    beforeEach(async () => {
      const store = useCourseStore();
      store.loadCourses();
      await vi.advanceTimersByTimeAsync(300);
    });

    it('lọc theo category', () => {
      const store = useCourseStore();
      store.setCategory('Sorting');

      const expected = COURSES.filter(c => c.isPublished && c.category === 'Sorting');
      expect(store.filteredCourses).toHaveLength(expected.length);
      expect(store.filteredCourses.every(c => c.category === 'Sorting')).toBe(true);
    });

    it('lọc theo difficulty', () => {
      const store = useCourseStore();
      store.setDifficulty('Hard');

      const expected = COURSES.filter(c => c.isPublished && c.difficulty === 'Hard');
      expect(store.filteredCourses).toHaveLength(expected.length);
      expect(store.filteredCourses.every(c => c.difficulty === 'Hard')).toBe(true);
    });

    it('lọc theo searchQuery không phân biệt hoa thường (tìm theo title/description/category)', () => {
      const store = useCourseStore();
      store.setSearchQuery('cây');

      const expected = COURSES.filter(c =>
        c.isPublished &&
        (c.title.toLowerCase().includes('cây') ||
          c.description.toLowerCase().includes('cây') ||
          c.category.toLowerCase().includes('cây')),
      );
      expect(store.filteredCourses).toHaveLength(expected.length);
      expect(store.filteredCourses.every(c => c.id === expected[0]?.id)).toBe(true);
    });

    it('kết hợp nhiều bộ lọc cùng lúc (category + difficulty)', () => {
      const store = useCourseStore();
      store.setCategory('Sorting');
      store.setDifficulty('Easy');

      const expected = COURSES.filter(c =>
        c.isPublished && c.category === 'Sorting' && c.difficulty === 'Easy',
      );
      expect(store.filteredCourses).toHaveLength(expected.length);
      expect(store.filteredCourses[0]?.id).toBe(expected[0]?.id);
    });

    it('trả danh sách rỗng khi không có khóa học khớp', () => {
      const store = useCourseStore();
      store.setSearchQuery('không tồn tại từ khóa này');
      expect(store.filteredCourses).toHaveLength(0);
    });
  });

  describe('categories & difficulties', () => {
    it('luôn có "All" đầu tiên và danh sách unique từ khóa học đã xuất bản', async () => {
      const store = useCourseStore();
      store.loadCourses();
      await vi.advanceTimersByTimeAsync(300);

      expect(store.categories[0]).toBe('All');
      expect(store.difficulties[0]).toBe('All');

      const expectedCats = COURSES.filter(c => c.isPublished).map(c => c.category);
      const uniqueCats = Array.from(new Set(expectedCats));
      expect(store.categories.slice(1).sort()).toEqual(uniqueCats.sort());

      const expectedDiffs = COURSES.filter(c => c.isPublished).map(c => c.difficulty);
      const uniqueDiffs = Array.from(new Set(expectedDiffs));
      expect(store.difficulties.slice(1).sort()).toEqual(uniqueDiffs.sort());
    });
  });

  describe('getCourseById', () => {
    it('trả đúng khóa học theo id', async () => {
      const store = useCourseStore();
      store.loadCourses();
      await vi.advanceTimersByTimeAsync(300);

      const course = store.getCourseById('sorting-101');
      expect(course).toBeDefined();
      expect(course?.title).toContain('Sắp xếp');
      expect(course?.totalLessons).toBe(3);
    });

    it('trả undefined khi id không tồn tại', () => {
      const store = useCourseStore();
      expect(store.getCourseById('unknown-course')).toBeUndefined();
    });
  });

  describe('getCourseProgress', () => {
    beforeEach(async () => {
      const store = useCourseStore();
      store.loadCourses();
      await vi.advanceTimersByTimeAsync(300);
    });

    it('trả 0% khi chưa hoàn thành lesson nào', () => {
      const progress = useCourseStore().getCourseProgress('sorting-101');
      expect(progress.progressPercent).toBe(0);
      expect(progress.completedLessonIds).toHaveLength(0);
      expect(progress.isCompleted).toBe(false);
      expect(progress.totalLessons).toBe(3);
    });

    it('tính phần trăm tiến trình dựa trên lesson đã hoàn thành', () => {
      localStorage.setItem(
        'lesson_progress_bubble-sort',
        JSON.stringify({ codelabCompleted: true, xpAwarded: 100 }),
      );

      const progress = useCourseStore().getCourseProgress('sorting-101');
      expect(progress.completedLessonIds).toEqual(['bubble-sort']);
      expect(progress.progressPercent).toBe(33);
      expect(progress.xpEarned).toBe(100);
      expect(progress.isCompleted).toBe(false);
    });

    it('đánh dấu hoàn thành khóa học khi đạt 100%', () => {
      localStorage.setItem('lesson_progress_bubble-sort', JSON.stringify({ codelabCompleted: true, xpAwarded: 100 }));
      localStorage.setItem('lesson_progress_selection-sort', JSON.stringify({ codelabCompleted: true, xpAwarded: 100 }));
      localStorage.setItem('lesson_progress_insertion-sort', JSON.stringify({ codelabCompleted: true, xpAwarded: 100 }));

      const progress = useCourseStore().getCourseProgress('sorting-101');
      expect(progress.progressPercent).toBe(100);
      expect(progress.completedLessonIds).toHaveLength(3);
      expect(progress.isCompleted).toBe(true);
    });

    it('bỏ qua localStorage bị hỏng (JSON không hợp lệ)', () => {
      localStorage.setItem('lesson_progress_bubble-sort', 'not-valid-json{');

      const progress = useCourseStore().getCourseProgress('sorting-101');
      expect(progress.completedLessonIds).toHaveLength(0);
      expect(progress.progressPercent).toBe(0);
    });

    it('trả giá trị mặc định khi khóa học không tồn tại', () => {
      const progress = useCourseStore().getCourseProgress('unknown-course');
      expect(progress).toEqual({
        courseId: 'unknown-course',
        completedLessonIds: [],
        totalLessons: 0,
        progressPercent: 0,
        xpEarned: 0,
        isCompleted: false,
      });
    });
  });

  describe('getLessonStatus', () => {
    it('trả "not-started" khi chưa có tiến trình', () => {
      expect(useCourseStore().getLessonStatus('bubble-sort')).toBe('not-started');
    });

    it('trả "completed" khi lesson đã hoàn thành codelab', () => {
      localStorage.setItem('lesson_progress_bubble-sort', JSON.stringify({ codelabCompleted: true }));
      expect(useCourseStore().getLessonStatus('bubble-sort')).toBe('completed');
    });

    it('trả "in-progress" khi đã xem visualizer', () => {
      localStorage.setItem('lesson_progress_bubble-sort', JSON.stringify({ hasWatchedVisualizer: true }));
      expect(useCourseStore().getLessonStatus('bubble-sort')).toBe('in-progress');
    });

    it('trả "in-progress" khi có quizScore', () => {
      localStorage.setItem('lesson_progress_bubble-sort', JSON.stringify({ quizScore: 8 }));
      expect(useCourseStore().getLessonStatus('bubble-sort')).toBe('in-progress');
    });

    it('trả "not-started" khi JSON hỏng', () => {
      localStorage.setItem('lesson_progress_bubble-sort', 'broken{');
      expect(useCourseStore().getLessonStatus('bubble-sort')).toBe('not-started');
    });
  });

  describe('getLessonQuizScore & getLessonXpEarned', () => {
    it('trả điểm quiz đã lưu', () => {
      localStorage.setItem('lesson_progress_bubble-sort', JSON.stringify({ quizScore: 9 }));
      expect(useCourseStore().getLessonQuizScore('bubble-sort')).toBe(9);
    });

    it('trả null khi chưa có điểm quiz', () => {
      expect(useCourseStore().getLessonQuizScore('bubble-sort')).toBeNull();
    });

    it('trả xp đã tích lũy cho lesson', () => {
      localStorage.setItem('lesson_progress_bubble-sort', JSON.stringify({ xpAwarded: 120 }));
      expect(useCourseStore().getLessonXpEarned('bubble-sort')).toBe(120);
    });

    it('trả 0 khi chưa có xp', () => {
      expect(useCourseStore().getLessonXpEarned('bubble-sort')).toBe(0);
    });
  });

  describe('getFirstUncompletedLesson', () => {
    beforeEach(async () => {
      const store = useCourseStore();
      store.loadCourses();
      await vi.advanceTimersByTimeAsync(300);
    });

    it('trả lesson đầu tiên khi chưa bắt đầu khóa học', () => {
      expect(useCourseStore().getFirstUncompletedLesson('sorting-101')).toBe('bubble-sort');
    });

    it('ưu tiên lesson đang dở dang (in-progress) hơn lesson chưa bắt đầu', () => {
      localStorage.setItem('lesson_progress_selection-sort', JSON.stringify({ hasWatchedVisualizer: true }));
      expect(useCourseStore().getFirstUncompletedLesson('sorting-101')).toBe('selection-sort');
    });

    it('trả null khi khóa học không tồn tại hoặc không có lesson', () => {
      expect(useCourseStore().getFirstUncompletedLesson('unknown-course')).toBeNull();
    });
  });

  describe('bộ lọc (setters & reset)', () => {
    it('setCategory / setDifficulty / setSearchQuery cập nhật state tương ứng', () => {
      const store = useCourseStore();
      store.setCategory('OOP');
      store.setDifficulty('Medium');
      store.setSearchQuery('  thuật toán  ');

      expect(store.selectedCategory).toBe('OOP');
      expect(store.selectedDifficulty).toBe('Medium');
      expect(store.searchQuery).toBe('  thuật toán  ');
    });

    it('resetFilters khôi phục toàn bộ bộ lọc về mặc định', () => {
      const store = useCourseStore();
      store.setCategory('OOP');
      store.setDifficulty('Hard');
      store.setSearchQuery('abc');
      store.resetFilters();

      expect(store.selectedCategory).toBe('All');
      expect(store.selectedDifficulty).toBe('All');
      expect(store.searchQuery).toBe('');
    });
  });
});
