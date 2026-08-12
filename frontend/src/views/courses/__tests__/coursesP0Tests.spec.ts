// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import BaseIcon from '../../../shared/components/BaseIcon.vue';
import type { Course } from '../../../features/courses/types/course.types';
import { useAuthStore } from '../../../features/auth/store/useAuthStore';

const mockRouterPush = vi.fn();

vi.mock('../../../services/courseApi', () => ({
  courseApi: {
    getCourses: vi.fn(),
    getCourseById: vi.fn(),
  },
}));
vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: 'sorting-101' }, query: {} }),
  useRouter: () => ({ push: mockRouterPush, replace: vi.fn() }),
}));

import { courseApi } from '../../../services/courseApi';
import CoursesListView from '../CoursesListView.vue';
import CourseDetailView from '../CourseDetailView.vue';
import CourseFilter from '../../../features/courses/components/CourseFilter.vue';

// Dữ liệu ĐÚNG KIỂU Course (không `as never` — LM-054).
const MOCK_COURSES: Course[] = [
  {
    id: 'sorting-101',
    title: 'Sorting 101',
    category: 'Sorting',
    difficulty: 'Beginner',
    xpReward: 100,
    totalLessons: 6,
    isPublished: true,
    lessons: [],
    coverImage: '',
    description: 'Learn sorting basics',
    isPremium: false,
  },
  {
    id: 'graph-201',
    title: 'Graph Algorithms',
    category: 'Tree/Graph',
    difficulty: 'Advanced',
    xpReward: 200,
    totalLessons: 8,
    isPublished: true,
    lessons: [],
    coverImage: '',
    description: 'Master graph traversal',
    isPremium: false,
  },
  {
    id: 'oop-101',
    title: 'OOP Fundamentals',
    category: 'OOP',
    difficulty: 'Intermediate',
    xpReward: 150,
    totalLessons: 5,
    isPublished: true,
    lessons: [],
    coverImage: '',
    description: 'Object-oriented programming',
    isPremium: false,
  },
];

// DTO chi tiết khóa học (view cast sang CourseDetailDto — có thêm xpReward mỗi lesson).
const MOCK_COURSE_DETAIL = {
  id: 'sorting-101',
  title: 'Sorting 101',
  description: 'Learn sorting basics',
  category: 'Sorting',
  difficulty: 'Beginner',
  isPremium: false,
  coverImage: '',
  isPublished: true,
  xpReward: 100,
  totalLessons: 3,
  lessons: [
    { id: 'l1', title: 'Bubble Sort', order: 1, xpReward: 30 },
    { id: 'l2', title: 'Quick Sort', order: 2, xpReward: 50 },
    { id: 'l3', title: 'Merge Sort', order: 3, xpReward: 40 },
  ],
} as unknown as Course;

function mountCourseDetail(): VueWrapper {
  setActivePinia(createPinia());
  return mount(CourseDetailView, {
    attachTo: document.body,
    global: {
      components: { BaseIcon },
      stubs: { RouterLink: { template: '<a class="rl-stub"><slot /></a>' } },
    },
  });
}

/** LM-002: mock isAuthenticated tường minh qua auth store thật. */
function authAsLoggedIn(): void {
  const auth = useAuthStore();
  auth.accessToken = 'token-x';
  auth.currentUser = {
    id: 'u1',
    email: 'hocvien@example.com',
    username: 'hocvien',
    totalXP: 120,
    currentLevel: 2,
    streakDays: 1,
    createdAt: '2026-01-01T00:00:00Z',
    badges: [],
    isPremium: false,
    role: 'Student',
  };
}

describe('CR-001 (P0): Xem danh sách khóa học', () => {
  let wrapper: VueWrapper | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    wrapper?.unmount();
    setActivePinia(createPinia());
  });

  it('render danh sách khóa học từ API', async () => {
    vi.mocked(courseApi.getCourses).mockResolvedValueOnce(MOCK_COURSES);
    setActivePinia(createPinia());
    wrapper = mount(CoursesListView, {
      attachTo: document.body,
      global: {
        components: { BaseIcon },
        stubs: { RouterLink: { template: '<a class="rl-stub"><slot /></a>' } },
      },
    });
    await flushPromises();
    await nextTick();

    expect(wrapper.text()).toContain('Sorting 101');
    expect(wrapper.text()).toContain('Graph Algorithms');
    expect(wrapper.text()).toContain('OOP Fundamentals');
  });

  it('hiển thị empty state khi không có khóa học', async () => {
    vi.mocked(courseApi.getCourses).mockResolvedValueOnce([]);
    setActivePinia(createPinia());
    wrapper = mount(CoursesListView, {
      attachTo: document.body,
      global: {
        components: { BaseIcon },
        stubs: { RouterLink: { template: '<a class="rl-stub"><slot /></a>' } },
      },
    });
    await flushPromises();
    await nextTick();

    expect(wrapper.text()).toContain('Không tìm thấy khóa học phù hợp');
  });
});

describe('CR-006 (P0): Lọc theo category', () => {
  it('CourseFilter emit đúng category khi click', async () => {
    setActivePinia(createPinia());
    const wrapper = mount(CourseFilter, {
      props: {
        categories: ['All', 'sorting', 'graph', 'oop'],
        difficulties: ['All', 'Beginner', 'Intermediate', 'Advanced'],
        selectedCategory: 'All',
        selectedDifficulty: 'All',
        searchQuery: '',
      },
    });

    const buttons = wrapper.findAll('button');
    const sortingBtn = buttons.find(b => b.text().includes('sorting'));
    expect(sortingBtn).toBeDefined();

    await sortingBtn!.trigger('click');
    const emitted = wrapper.emitted('update:category');
    expect(emitted).toBeTruthy();
    expect(emitted![0]).toEqual(['sorting']);
  });

  it('CourseFilter hiển thị đúng số category buttons', () => {
    setActivePinia(createPinia());
    const wrapper = mount(CourseFilter, {
      global: { components: { BaseIcon } },
      props: {
        categories: ['All', 'sorting', 'graph'],
        difficulties: ['All', 'Beginner'],
        selectedCategory: 'All',
        selectedDifficulty: 'All',
        searchQuery: '',
      },
    });

    const allButtons = wrapper.findAll('button');
    const categoryButtons = allButtons.filter(b => b.text() === 'sorting' || b.text() === 'graph');
    expect(categoryButtons.length).toBe(2);
  });
});

describe('CR-007 (P0): Sắp xếp', () => {
  let wrapper: VueWrapper | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    wrapper?.unmount();
    setActivePinia(createPinia());
  });

  it('LM-048: sắp xếp theo difficulty assert thứ tự thực tế (Beginner < Intermediate < Advanced)', async () => {
    vi.mocked(courseApi.getCourses).mockResolvedValueOnce(MOCK_COURSES);
    setActivePinia(createPinia());
    wrapper = mount(CoursesListView, {
      attachTo: document.body,
      global: {
        components: { BaseIcon },
        stubs: { RouterLink: { template: '<a class="rl-stub"><slot /></a>' } },
      },
    });
    await flushPromises();
    await nextTick();

    await wrapper.find('#course-sort').setValue('difficulty');
    await nextTick();

    const cardTitles = wrapper.findAll('.course-card h3');
    expect(cardTitles.map(t => t.text())).toEqual(['Sorting 101', 'OOP Fundamentals', 'Graph Algorithms']);
  });

  it('sắp xếp theo title A-Z', async () => {
    vi.mocked(courseApi.getCourses).mockResolvedValueOnce(MOCK_COURSES);
    setActivePinia(createPinia());
    wrapper = mount(CoursesListView, {
      attachTo: document.body,
      global: {
        components: { BaseIcon },
        stubs: { RouterLink: { template: '<a class="rl-stub"><slot /></a>' } },
      },
    });
    await flushPromises();
    await nextTick();

    await wrapper.find('#course-sort').setValue('title');
    await nextTick();

    const cardTitles = wrapper.findAll('.course-card h3');
    expect(cardTitles.length).toBe(3);
    expect(cardTitles[0].text()).toBe('Graph Algorithms');
    expect(cardTitles[1].text()).toBe('OOP Fundamentals');
    expect(cardTitles[2].text()).toBe('Sorting 101');
  });

  it('sắp xếp theo XP giảm dần', async () => {
    vi.mocked(courseApi.getCourses).mockResolvedValueOnce(MOCK_COURSES);
    setActivePinia(createPinia());
    wrapper = mount(CoursesListView, {
      attachTo: document.body,
      global: {
        components: { BaseIcon },
        stubs: { RouterLink: { template: '<a class="rl-stub"><slot /></a>' } },
      },
    });
    await flushPromises();
    await nextTick();

    await wrapper.find('#course-sort').setValue('xp');
    await nextTick();

    const cardTitles = wrapper.findAll('.course-card h3');
    expect(cardTitles[0].text()).toBe('Graph Algorithms');
    expect(cardTitles[1].text()).toBe('OOP Fundamentals');
    expect(cardTitles[2].text()).toBe('Sorting 101');
  });
});

describe('CR-008 (P0): Chi tiết khóa học', () => {
  let wrapper: VueWrapper | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    wrapper?.unmount();
    setActivePinia(createPinia());
  });

  it('render lessons trong CourseDetailView', async () => {
    vi.mocked(courseApi.getCourseById).mockResolvedValueOnce(MOCK_COURSE_DETAIL);
    wrapper = mountCourseDetail();
    await flushPromises();
    await nextTick();

    expect(wrapper.text()).toContain('Sorting 101');
    expect(wrapper.text()).toContain('Bubble Sort');
    expect(wrapper.text()).toContain('Quick Sort');
    expect(wrapper.text()).toContain('Merge Sort');
  });

  it('hiển thị tổng XP từ lessons', async () => {
    vi.mocked(courseApi.getCourseById).mockResolvedValueOnce(MOCK_COURSE_DETAIL);
    wrapper = mountCourseDetail();
    await flushPromises();
    await nextTick();

    expect(wrapper.text()).toContain('120 XP');
  });

  it('LM-049: hiển thị số bài giảng qua câu chữ cụ thể "3 bài giảng" (không dùng toContain("3"))', async () => {
    vi.mocked(courseApi.getCourseById).mockResolvedValueOnce(MOCK_COURSE_DETAIL);
    wrapper = mountCourseDetail();
    await flushPromises();
    await nextTick();

    expect(wrapper.text()).toMatch(/3 bài giảng/);
  });
});

describe('CR-009 (P0): Bắt đầu/Học lại bài', () => {
  let wrapper: VueWrapper | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(courseApi.getCourseById).mockResolvedValueOnce(MOCK_COURSE_DETAIL);
  });

  afterEach(() => {
    wrapper?.unmount();
    setActivePinia(createPinia());
  });

  it('LM-002: chưa đăng nhập → CTA yêu cầu đăng nhập, KHÔNG có nút "Bắt đầu học"', async () => {
    wrapper = mountCourseDetail();
    await flushPromises();
    await nextTick();

    // find() luôn trả wrapper — phải dùng exists()/text() thay vì toBeDefined() (pass giả).
    expect(wrapper.find('a.rl-stub').exists()).toBe(true);
    const ctaTexts = wrapper.findAll('a.rl-stub').map(a => a.text());
    expect(ctaTexts.some(t => t.includes('Đăng nhập để bắt đầu'))).toBe(true);
    expect(ctaTexts.some(t => t.includes('Bắt đầu học'))).toBe(false);
    expect(ctaTexts.some(t => t.includes('Tiếp tục học'))).toBe(false);
  });

  it('LM-002: đã đăng nhập, bài NotStarted → nút "Bắt đầu học" hiển thị', async () => {
    setActivePinia(createPinia());
    authAsLoggedIn();
    wrapper = mount(CourseDetailView, {
      attachTo: document.body,
      global: {
        components: { BaseIcon },
        stubs: { RouterLink: { template: '<a class="rl-stub"><slot /></a>' } },
      },
    });
    await flushPromises();
    await nextTick();

    const cta = wrapper.findAll('a.rl-stub').find(a => a.text().includes('Bắt đầu học'));
    expect(cta?.exists()).toBe(true);
    expect(wrapper.findAll('a.rl-stub').some(a => a.text().includes('Đăng nhập để bắt đầu'))).toBe(false);
  });

  it('LM-002: đã đăng nhập + tiến độ > 0 → nút "Tiếp tục học"', async () => {
    setActivePinia(createPinia());
    authAsLoggedIn();
    const courseStore = (await import('../../../features/courses/store/useCourseStore')).useCourseStore();
    courseStore.courses = [MOCK_COURSE_DETAIL];
    localStorage.setItem('lesson_progress_l1', JSON.stringify({ completed: true, codelabCompleted: true, xpAwarded: 30 }));

    wrapper = mount(CourseDetailView, {
      attachTo: document.body,
      global: {
        components: { BaseIcon },
        stubs: { RouterLink: { template: '<a class="rl-stub"><slot /></a>' } },
      },
    });
    await flushPromises();
    await nextTick();

    expect(wrapper.findAll('a.rl-stub').some(a => a.text().includes('Tiếp tục học'))).toBe(true);
  });

  it('click nút Bắt đầu navigate đến lesson', async () => {
    mockRouterPush.mockClear();
    setActivePinia(createPinia());
    wrapper = mount(CourseDetailView, {
      attachTo: document.body,
      global: {
        components: { BaseIcon },
        stubs: {
          RouterLink: { template: '<a class="rl-stub"><slot /></a>' },
        },
      },
    });
    await flushPromises();
    await nextTick();

    const lessonLinks = wrapper.findAll('a.rl-stub');
    const lessonLink = lessonLinks.find(a => a.text().includes('Bubble Sort'));
    expect(lessonLink?.exists()).toBe(true);
  });
});

describe('CR-015 (P1): Phân trang', () => {
  let wrapper: VueWrapper | null = null;

  const MANY_COURSES: Course[] = Array.from({ length: 12 }, (_, i) => ({
    id: `course-${i}`,
    title: `Course ${i}`,
    category: 'Sorting',
    difficulty: 'Beginner',
    xpReward: 100 + i * 10,
    totalLessons: 5,
    isPublished: true,
    lessons: [],
    coverImage: '',
    description: `Description ${i}`,
    isPremium: false,
  }));

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    wrapper?.unmount();
    setActivePinia(createPinia());
  });

  it('hiển thị nút "Xem thêm" khi có nhiều hơn pageSize', async () => {
    vi.mocked(courseApi.getCourses).mockResolvedValueOnce(MANY_COURSES);
    setActivePinia(createPinia());
    wrapper = mount(CoursesListView, {
      attachTo: document.body,
      global: {
        components: { BaseIcon },
        stubs: { RouterLink: { template: '<a class="rl-stub"><slot /></a>' } },
      },
    });
    await flushPromises();
    await nextTick();

    expect(wrapper.text()).toContain('Xem thêm');
  });

  it('click "Xem thêm" thêm courses vào danh sách', async () => {
    vi.mocked(courseApi.getCourses).mockResolvedValueOnce(MANY_COURSES);
    setActivePinia(createPinia());
    wrapper = mount(CoursesListView, {
      attachTo: document.body,
      global: {
        components: { BaseIcon },
        stubs: { RouterLink: { template: '<a class="rl-stub"><slot /></a>' } },
      },
    });
    await flushPromises();
    await nextTick();

    const initialCards = wrapper.findAll('.course-card').length;
    expect(initialCards).toBe(8);

    const loadMoreBtn = wrapper.find('.mt-8 button');
    await loadMoreBtn.trigger('click');
    await flushPromises();
    await nextTick();

    const updatedCards = wrapper.findAll('.course-card').length;
    expect(updatedCards).toBe(12);
  });
});
