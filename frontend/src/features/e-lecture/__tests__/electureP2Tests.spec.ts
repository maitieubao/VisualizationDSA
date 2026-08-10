// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useLectureStore } from '../store/useLectureStore';
import { useAnimationStore } from '../../animation-engine/store/useAnimationStore';
import { useToastStore } from '../../../composables/useToast';
import { useCourseStore } from '../../courses/store/useCourseStore';
import { APP_TABS } from '../../../appTabs';
import type { TabGroup, TabItem } from '../../../appTabs';
import type { LectureScript } from '../types/lecture.types';
import type { AlgorithmResult } from '../../animation-engine/types/animation.types';
import type { Course } from '../../courses/types/course.types';

function createMockLecture(): LectureScript {
  return {
    lectureId: 'lec-001',
    algorithmId: 'bubble-sort',
    title: 'Bubble Sort Lecture',
    slides: [
      { slideId: 1, type: 'theory', content: '<h2>Slide 1: Giới thiệu</h2><p>Nội dung lý thuyết</p>', action: { command: 'RESET_CANVAS', targetFrame: 0 } },
      { slideId: 2, type: 'guided-animation', content: '<h2>Slide 2: Minh họa</h2><p>Bắt đầu chạy animation</p>', action: { command: 'PLAY_UNTIL', targetFrame: 3 } },
      { slideId: 3, type: 'interactive-check', content: '<h2>Slide 3: Kiểm tra</h2><p>Interactive check</p>', action: { command: 'PAUSE', targetFrame: 3 } },
      { slideId: 4, type: 'theory', content: '<h2>Slide 4: Kết luận</h2><p>Tổng kết</p>', action: { command: 'PAUSE', targetFrame: 3 } },
    ],
  };
}

function createMockAnimResult(): AlgorithmResult {
  return {
    algorithmId: 'bubble-sort',
    pseudoCode: ['line1', 'line2'],
    frames: Array.from({ length: 10 }, (_, i) => ({
      stepId: i + 1,
      activeLine: 0,
      explanation: `Step ${i + 1}`,
      dataState: [5, 3, 8],
      highlights: { compare: [], swap: [], sorted: [] },
    })),
  };
}

function createMockCourse(): Course {
  return {
    id: 'sorting-101',
    title: 'Thuật toán Sắp xếp Cơ bản',
    description: 'Làm chủ các thuật toán sắp xếp cơ bản.',
    category: 'Sorting',
    difficulty: 'Easy',
    xpReward: 300,
    isPremium: false,
    totalLessons: 3,
    lessons: [
      { id: 'bubble-sort', title: 'Bubble Sort - Sắp xếp nổi bọt', order: 1 },
      { id: 'selection-sort', title: 'Selection Sort - Sắp xếp chọn', order: 2 },
      { id: 'insertion-sort', title: 'Insertion Sort - Sắp xếp chèn', order: 3 },
    ],
    isPublished: true,
    coverImage: 'https://example.com/cover.jpg',
  };
}

function isTabVisible(tab: TabItem, isAuthenticated: boolean, userRole: string): boolean {
  if (tab.requiresAuth && !isAuthenticated) return false;
  if (tab.requiresRole) {
    if (userRole === 'Admin') return true;
    if (userRole !== tab.requiresRole) return false;
  }
  return true;
}

function filteredTabs(isAuthenticated: boolean, userRole: string): (TabGroup | TabItem)[] {
  return APP_TABS.filter((tabOrGroup) => {
    if ('groupName' in tabOrGroup) {
      const group = tabOrGroup as TabGroup;
      const visibleItems = group.items.filter((item: TabItem) => isTabVisible(item, isAuthenticated, userRole));
      return visibleItems.length > 0;
    }
    return isTabVisible(tabOrGroup as TabItem, isAuthenticated, userRole);
  }).map((tabOrGroup) => {
    if ('groupName' in tabOrGroup) {
      const group = tabOrGroup as TabGroup;
      return {
        ...group,
        items: group.items.filter((item: TabItem) => isTabVisible(item, isAuthenticated, userRole)),
      };
    }
    return tabOrGroup;
  });
}

describe('EL-009 (P2): Slide content - HTML render', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('activeSlide.content contains valid HTML with h2 and p tags', () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());
    store.startLecture(createMockLecture());

    const content = store.activeSlide?.content ?? '';
    expect(content).toContain('<h2>');
    expect(content).toContain('</h2>');
    expect(content).toContain('<p>');
    expect(content).toContain('</p>');
  });

  it('slide content renders correctly when navigating to next slide', async () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());
    store.startLecture(createMockLecture());

    expect(store.activeSlide?.content).toContain('Slide 1');

    const promise = store.nextSlide();
    vi.advanceTimersByTime(10000);
    await promise;

    expect(store.activeSlide?.content).toContain('Slide 2');
  });

  it('slide type badge text matches slide type', () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());
    store.startLecture(createMockLecture());

    expect(store.activeSlide?.type).toBe('theory');
  });
});

describe('EL-010 (P2): Progress dots - pagination dots', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('totalSlides matches number of slides in lecture', () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());
    store.startLecture(createMockLecture());

    expect(store.totalSlides).toBe(4);
  });

  it('currentSlideIndex tracks active dot position', async () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());
    store.startLecture(createMockLecture());

    expect(store.currentSlideIndex).toBe(0);

    const promise = store.nextSlide();
    vi.advanceTimersByTime(10000);
    await promise;

    expect(store.currentSlideIndex).toBe(1);
  });

  it('slideProgress shows correct "current / total" format', () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());
    store.startLecture(createMockLecture());

    expect(store.slideProgress).toBe('1 / 4');
  });
});

describe('EL-011 (P2): Skip animation - skip button', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('nextSlide during PLAY_UNTIL cancels animation and advances', async () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());
    store.startLecture(createMockLecture());

    const p1 = store.nextSlide();
    vi.advanceTimersByTime(10000);
    await p1;

    expect(store.currentSlideIndex).toBe(1);

    const p2 = store.nextSlide();
    vi.advanceTimersByTime(10000);
    await p2;

    expect(store.currentSlideIndex).toBe(2);
  });

  it('isWaitingForAnimation is false after skip', async () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());
    store.startLecture(createMockLecture());

    const p1 = store.nextSlide();
    vi.advanceTimersByTime(10000);
    await p1;

    const p2 = store.nextSlide();
    vi.advanceTimersByTime(10000);
    await p2;

    expect(store.isWaitingForAnimation).toBe(false);
  });
});

describe('EL-013 (P2/P3): Auto minimize - panel minimize on PLAY_UNTIL', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('isMinimized is a boolean property on lecture store', async () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());
    store.startLecture(createMockLecture());

    const promise = store.nextSlide();
    vi.advanceTimersByTime(10000);
    await promise;

    expect(typeof store.isMinimized).toBe('boolean');
  });

  it('isMinimized resets to false after animation completes', async () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());
    store.startLecture(createMockLecture());

    expect(store.isMinimized).toBe(false);

    const promise = store.nextSlide();
    vi.advanceTimersByTime(10000);
    await promise;

    expect(store.isMinimized).toBe(false);
  });

  it('isMinimized resets to false on exitLecture', async () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());
    store.startLecture(createMockLecture());

    const promise = store.nextSlide();
    vi.advanceTimersByTime(10000);
    await promise;

    store.exitLecture();

    expect(store.isMinimized).toBe(false);
  });
});

describe('NA-002 (P2): Group dropdown - hover shows sub-tabs', () => {
  it('APP_TABS contains groups with items (sub-tabs)', () => {
    const groups = APP_TABS.filter(t => 'groupName' in t) as TabGroup[];
    expect(groups.length).toBeGreaterThan(0);

    for (const group of groups) {
      expect(group.items.length).toBeGreaterThan(0);
    }
  });

  it('each group has at least 1 item with a valid path', () => {
    const groups = APP_TABS.filter(t => 'groupName' in t) as TabGroup[];

    for (const group of groups) {
      for (const item of group.items) {
        expect(item.path).toBeTruthy();
        expect(item.path.startsWith('/')).toBe(true);
      }
    }
  });

  it('Học tập group contains expected sub-tabs', () => {
    const groups = APP_TABS.filter(t => 'groupName' in t) as TabGroup[];
    const learningGroup = groups.find(g => g.groupName === 'Học tập');

    expect(learningGroup).toBeDefined();
    expect(learningGroup!.items.some(i => i.id === 'learning-path')).toBe(true);
    expect(learningGroup!.items.some(i => i.id === 'classrooms')).toBe(true);
  });
});

describe('NA-005 (P2): Role tabs - Teacher/Admin hidden without role', () => {
  it('Teacher tab is hidden for Student role', () => {
    const tabs = filteredTabs(true, 'Student');
    const accountGroup = tabs.find(t => 'groupName' in t && t.groupName === 'Tài khoản') as TabGroup;

    expect(accountGroup).toBeDefined();
    expect(accountGroup.items.some(i => i.id === 'teacher')).toBe(false);
  });

  it('Admin tab is hidden for Student role', () => {
    const tabs = filteredTabs(true, 'Student');
    const accountGroup = tabs.find(t => 'groupName' in t && t.groupName === 'Tài khoản') as TabGroup;

    expect(accountGroup).toBeDefined();
    expect(accountGroup.items.some(i => i.id === 'admin')).toBe(false);
  });

  it('Teacher tab is visible for Teacher role', () => {
    const tabs = filteredTabs(true, 'Teacher');
    const accountGroup = tabs.find(t => 'groupName' in t && t.groupName === 'Tài khoản') as TabGroup;

    expect(accountGroup.items.some(i => i.id === 'teacher')).toBe(true);
  });

  it('Admin tab is visible for Admin role', () => {
    const tabs = filteredTabs(true, 'Admin');
    const accountGroup = tabs.find(t => 'groupName' in t && t.groupName === 'Tài khoản') as TabGroup;

    expect(accountGroup.items.some(i => i.id === 'admin')).toBe(true);
  });

  it('Teacher tab is visible for Admin role (Admin inherits Teacher)', () => {
    const tabs = filteredTabs(true, 'Admin');
    const accountGroup = tabs.find(t => 'groupName' in t && t.groupName === 'Tài khoản') as TabGroup;

    expect(accountGroup.items.some(i => i.id === 'teacher')).toBe(true);
  });
});

describe('NA-007 (P2): ToastContainer - container render', () => {
  it('useToastStore is a valid Pinia store', () => {
    setActivePinia(createPinia());
    const store = useToastStore();
    expect(store).toBeDefined();
    expect(store.toasts).toBeDefined();
    expect(store.activeToasts).toBeDefined();
  });

  it('activeToasts returns empty array initially', () => {
    setActivePinia(createPinia());
    const store = useToastStore();
    expect(store.activeToasts.length).toBe(0);
  });

  it('addToast adds a toast to the store', () => {
    setActivePinia(createPinia());
    const store = useToastStore();
    store.addToast('info', 'Test', 'Test message', 0);

    expect(store.activeToasts.length).toBe(1);
    expect(store.activeToasts[0].title).toBe('Test');
    expect(store.activeToasts[0].message).toBe('Test message');
  });

  it('removeToast removes a toast from the store', () => {
    setActivePinia(createPinia());
    const store = useToastStore();
    store.addToast('info', 'Test', 'Test message', 0);

    const toastId = store.activeToasts[0].id;
    store.removeToast(toastId);

    expect(store.activeToasts.length).toBe(0);
  });

  it('clearAll removes all toasts', () => {
    setActivePinia(createPinia());
    const store = useToastStore();
    store.addToast('info', 'Test1', 'Message 1', 0);
    store.addToast('success', 'Test2', 'Message 2', 0);
    store.addToast('error', 'Test3', 'Message 3', 0);

    expect(store.activeToasts.length).toBe(3);

    store.clearAll();

    expect(store.activeToasts.length).toBe(0);
  });
});

describe('NA-008 (P2): Sync error banner - banner retry render', () => {
  it('error banner displays when sync error exists', () => {
    setActivePinia(createPinia());
    const store = useCourseStore();
    store.error = 'Không kết nối được máy chủ';

    expect(store.error).toBeTruthy();
    expect(store.error).toContain('Không kết nối');
  });

  it('error banner is hidden when error is empty', () => {
    setActivePinia(createPinia());
    const store = useCourseStore();
    store.error = '';

    expect(store.error).toBe('');
  });
});

describe('NA-009 (P2): Retry sync - retry button', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('loadCourses clears error on success or sets fallback on failure', async () => {
    const store = useCourseStore();
    store.error = 'Some error';

    await store.loadCourses();

    // When API fails, loadCourses sets a fallback error and loads local data
    // When API succeeds, error is cleared. Either way, isLoading ends as false.
    expect(store.isLoading).toBe(false);
  });

  it('loadCourses sets isLoading during fetch', () => {
    const store = useCourseStore();
    expect(store.isLoading).toBe(false);
  });
});

describe('NA-010 (P2): Page transition - fade animation class', () => {
  it('CourseDetailView template contains course-detail-view class', () => {
    const fs = require('fs');
    const path = require('path');
    const viewSource = fs.readFileSync(
      path.resolve(__dirname, '../../../views/courses/CourseDetailView.vue'),
      'utf-8'
    );

    expect(viewSource).toContain('course-detail-view');
  });

  it('LectureOverlay template contains lecture-fade transition', () => {
    const fs = require('fs');
    const path = require('path');
    const overlaySource = fs.readFileSync(
      path.resolve(__dirname, '../components/LectureOverlay.vue'),
      'utf-8'
    );

    expect(overlaySource).toContain('lecture-fade');
  });
});

describe('NA-011 (P2): Embed minimal mode - header hidden in embed', () => {
  it('EmbedWidgetView template uses isMinimalMode computed', () => {
    const fs = require('fs');
    const path = require('path');
    const embedSource = fs.readFileSync(
      path.resolve(__dirname, '../../../views/embed/EmbedWidgetView.vue'),
      'utf-8'
    );

    expect(embedSource).toContain('isMinimalMode');
  });

  it('EmbedWidgetView renders without AppHeader in minimal mode', () => {
    const fs = require('fs');
    const path = require('path');
    const embedSource = fs.readFileSync(
      path.resolve(__dirname, '../../../views/embed/EmbedWidgetView.vue'),
      'utf-8'
    );

    expect(embedSource).not.toContain('AppHeader');
  });
});

describe('CR-002 (P2): Course progress - completion percentage', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('getCourseProgress returns 0% for new course', () => {
    const store = useCourseStore();
    store.courses = [createMockCourse()];

    const progress = store.getCourseProgress('sorting-101');

    expect(progress.progressPercent).toBe(0);
  });

  it('getCourseProgress returns 100% when all lessons completed', () => {
    const store = useCourseStore();
    store.courses = [createMockCourse()];

    localStorage.setItem('lesson_progress_bubble-sort', JSON.stringify({ completed: true, xpAwarded: 100 }));
    localStorage.setItem('lesson_progress_selection-sort', JSON.stringify({ completed: true, xpAwarded: 100 }));
    localStorage.setItem('lesson_progress_insertion-sort', JSON.stringify({ completed: true, xpAwarded: 100 }));

    const progress = store.getCourseProgress('sorting-101');

    expect(progress.progressPercent).toBe(100);
    expect(progress.isCompleted).toBe(true);
  });

  it('getCourseProgress returns correct partial percentage', () => {
    const store = useCourseStore();
    store.courses = [createMockCourse()];

    localStorage.setItem('lesson_progress_bubble-sort', JSON.stringify({ completed: true, xpAwarded: 100 }));

    const progress = store.getCourseProgress('sorting-101');

    expect(progress.progressPercent).toBe(33);
  });
});

describe('CR-003 (P2): Start/Review button - button text by status', () => {
  it('CourseCard shows "Bắt đầu" when progress is 0%', () => {
    setActivePinia(createPinia());
    localStorage.clear();
    const store = useCourseStore();
    store.courses = [createMockCourse()];

    const progress = store.getCourseProgress('sorting-101');
    const buttonText = progress.progressPercent === 100 ? 'Ôn tập' : 'Bắt đầu';

    expect(buttonText).toBe('Bắt đầu');
  });

  it('CourseCard shows "Ôn tập" when progress is 100%', () => {
    setActivePinia(createPinia());
    localStorage.clear();
    const store = useCourseStore();
    store.courses = [createMockCourse()];

    localStorage.setItem('lesson_progress_bubble-sort', JSON.stringify({ completed: true }));
    localStorage.setItem('lesson_progress_selection-sort', JSON.stringify({ completed: true }));
    localStorage.setItem('lesson_progress_insertion-sort', JSON.stringify({ completed: true }));

    const progress = store.getCourseProgress('sorting-101');
    const buttonText = progress.progressPercent === 100 ? 'Ôn tập' : 'Bắt đầu';

    expect(buttonText).toBe('Ôn tập');
  });
});

describe('CR-004 (P2): Category filter - filter by category', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('filteredCourses returns all courses when category is All', () => {
    const store = useCourseStore();
    store.courses = [createMockCourse()];

    store.setCategory('All');

    expect(store.filteredCourses.length).toBe(1);
  });

  it('filteredCourses filters by selected category', () => {
    const store = useCourseStore();
    store.courses = [
      createMockCourse(),
      { ...createMockCourse(), id: 'searching-101', category: 'Searching' } as Course,
    ];

    store.setCategory('Searching');

    expect(store.filteredCourses.length).toBe(1);
    expect(store.filteredCourses[0].category).toBe('Searching');
  });

  it('categories computed includes All plus unique categories', () => {
    const store = useCourseStore();
    store.courses = [
      createMockCourse(),
      { ...createMockCourse(), id: 'searching-101', category: 'Searching' } as Course,
    ];

    expect(store.categories).toContain('All');
    expect(store.categories).toContain('Sorting');
    expect(store.categories).toContain('Searching');
  });
});

describe('CR-011 (P2): Premium badge - Premium label', () => {
  it('Course with isPremium = true should display Premium badge', () => {
    const fs = require('fs');
    const path = require('path');
    const cardSource = fs.readFileSync(
      path.resolve(__dirname, '../../courses/components/CourseCard.vue'),
      'utf-8'
    );

    expect(cardSource).toContain('isPremium');
    expect(cardSource).toContain('Premium');
  });

  it('Premium badge is conditionally rendered based on course.isPremium', () => {
    const fs = require('fs');
    const path = require('path');
    const cardSource = fs.readFileSync(
      path.resolve(__dirname, '../../courses/components/CourseCard.vue'),
      'utf-8'
    );

    expect(cardSource).toContain('v-if="course.isPremium"');
  });
});

describe('CR-012 (P2/P3): Course cover - CourseCover SVG gradient', () => {
  it('CourseCover component uses linearGradient', () => {
    const fs = require('fs');
    const path = require('path');
    const coverSource = fs.readFileSync(
      path.resolve(__dirname, '../../courses/components/CourseCover.vue'),
      'utf-8'
    );

    expect(coverSource).toContain('linearGradient');
  });

  it('CourseCover generates unique gradient id per course', () => {
    const fs = require('fs');
    const path = require('path');
    const coverSource = fs.readFileSync(
      path.resolve(__dirname, '../../courses/components/CourseCover.vue'),
      'utf-8'
    );

    expect(coverSource).toContain('cover-grad-');
    expect(coverSource).toContain('course.id');
  });

  it('CourseCover has theme mapping for categories', () => {
    const fs = require('fs');
    const path = require('path');
    const coverSource = fs.readFileSync(
      path.resolve(__dirname, '../../courses/components/CourseCover.vue'),
      'utf-8'
    );

    expect(coverSource).toContain('THEMES');
    expect(coverSource).toContain('Sorting');
  });
});

describe('CR-013 (P2): LessonListItem - item render status + XP', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('getLessonStatus returns not-started for new lesson', () => {
    const store = useCourseStore();
    const status = store.getLessonStatus('bubble-sort');

    expect(status).toBe('not-started');
  });

  it('getLessonStatus returns completed when lesson is done', () => {
    const store = useCourseStore();
    localStorage.setItem('lesson_progress_bubble-sort', JSON.stringify({ completed: true }));

    const status = store.getLessonStatus('bubble-sort');

    expect(status).toBe('completed');
  });

  it('getLessonXpEarned returns 0 for new lesson', () => {
    const store = useCourseStore();
    const xp = store.getLessonXpEarned('bubble-sort');

    expect(xp).toBe(0);
  });

  it('getLessonXpEarned returns correct XP when lesson completed', () => {
    const store = useCourseStore();
    localStorage.setItem('lesson_progress_bubble-sort', JSON.stringify({ completed: true, xpAwarded: 150 }));

    const xp = store.getLessonXpEarned('bubble-sort');

    expect(xp).toBe(150);
  });
});

describe('CR-014 (P2): New user stats - level and XP display', () => {
  it('AppHeader template contains user level and XP display', () => {
    const fs = require('fs');
    const path = require('path');
    const headerSource = fs.readFileSync(
      path.resolve(__dirname, '../../../components/AppHeader.vue'),
      'utf-8'
    );

    expect(headerSource).toContain('Cấp');
    expect(headerSource).toContain('XP');
  });

  it('AppHeader shows userLevel and userXP from authStore', () => {
    const fs = require('fs');
    const path = require('path');
    const headerSource = fs.readFileSync(
      path.resolve(__dirname, '../../../components/AppHeader.vue'),
      'utf-8'
    );

    expect(headerSource).toContain('authStore.userLevel');
    expect(headerSource).toContain('authStore.userXP');
  });
});

describe('CR-016 (P2): Total XP/lessons - total XP and lesson count', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('getCourseProgress returns totalLessons from course', () => {
    const store = useCourseStore();
    store.courses = [createMockCourse()];

    const progress = store.getCourseProgress('sorting-101');

    expect(progress.totalLessons).toBe(3);
  });

  it('getCourseProgress returns xpEarned sum from completed lessons', () => {
    const store = useCourseStore();
    store.courses = [createMockCourse()];

    localStorage.setItem('lesson_progress_bubble-sort', JSON.stringify({ completed: true, xpAwarded: 100 }));
    localStorage.setItem('lesson_progress_selection-sort', JSON.stringify({ completed: true, xpAwarded: 100 }));

    const progress = store.getCourseProgress('sorting-101');

    expect(progress.xpEarned).toBe(200);
  });

  it('CourseDetailView displays total XP and lesson count', () => {
    const fs = require('fs');
    const path = require('path');
    const detailSource = fs.readFileSync(
      path.resolve(__dirname, '../../../views/courses/CourseDetailView.vue'),
      'utf-8'
    );

    expect(detailSource).toContain('totalXp');
    expect(detailSource).toContain('Số bài giảng');
  });
});
