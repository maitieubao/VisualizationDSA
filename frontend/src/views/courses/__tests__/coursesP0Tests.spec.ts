// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import BaseIcon from '../../../shared/components/BaseIcon.vue';

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

const MOCK_COURSES = [
  {
    id: 'sorting-101',
    title: 'Sorting 101',
    category: 'sorting',
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
    category: 'graph',
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
    category: 'oop',
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

const MOCK_COURSE_DETAIL = {
  id: 'sorting-101',
  title: 'Sorting 101',
  description: 'Learn sorting basics',
  category: 'sorting',
  difficulty: 'Beginner',
  isPremium: false,
  coverImage: '',
  isPublished: true,
  lessons: [
    { id: 'l1', title: 'Bubble Sort', status: 'NotStarted', xpReward: 30, contentMd: '', sandboxType: '', sandboxConfig: '', quizId: null, orderIndex: 1 },
    { id: 'l2', title: 'Quick Sort', status: 'Completed', xpReward: 50, contentMd: '', sandboxType: '', sandboxConfig: '', quizId: null, orderIndex: 2 },
    { id: 'l3', title: 'Merge Sort', status: 'InProgress', xpReward: 40, contentMd: '', sandboxType: '', sandboxConfig: '', quizId: 'q1', orderIndex: 3 },
  ],
};

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
    vi.mocked(courseApi.getCourses).mockResolvedValueOnce(MOCK_COURSES as never);
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
    vi.mocked(courseApi.getCourses).mockResolvedValueOnce([] as never);
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

  it('sắp xếp theo difficulty', async () => {
    vi.mocked(courseApi.getCourses).mockResolvedValueOnce(MOCK_COURSES as never);
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
    expect(cardTitles.length).toBe(3);
  });

  it('sắp xếp theo title A-Z', async () => {
    vi.mocked(courseApi.getCourses).mockResolvedValueOnce(MOCK_COURSES as never);
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
    vi.mocked(courseApi.getCourses).mockResolvedValueOnce(MOCK_COURSES as never);
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
    vi.mocked(courseApi.getCourseById).mockResolvedValueOnce(MOCK_COURSE_DETAIL as never);
    setActivePinia(createPinia());
    wrapper = mount(CourseDetailView, {
      attachTo: document.body,
      global: {
        components: { BaseIcon },
        stubs: { RouterLink: { template: '<a class="rl-stub"><slot /></a>' } },
      },
    });
    await flushPromises();
    await nextTick();

    expect(wrapper.text()).toContain('Sorting 101');
    expect(wrapper.text()).toContain('Bubble Sort');
    expect(wrapper.text()).toContain('Quick Sort');
    expect(wrapper.text()).toContain('Merge Sort');
  });

  it('hiển thị tổng XP từ lessons', async () => {
    vi.mocked(courseApi.getCourseById).mockResolvedValueOnce(MOCK_COURSE_DETAIL as never);
    setActivePinia(createPinia());
    wrapper = mount(CourseDetailView, {
      attachTo: document.body,
      global: {
        components: { BaseIcon },
        stubs: { RouterLink: { template: '<a class="rl-stub"><slot /></a>' } },
      },
    });
    await flushPromises();
    await nextTick();

    expect(wrapper.text()).toContain('120 XP');
  });

  it('hiển thị số bài giảng', async () => {
    vi.mocked(courseApi.getCourseById).mockResolvedValueOnce(MOCK_COURSE_DETAIL as never);
    setActivePinia(createPinia());
    wrapper = mount(CourseDetailView, {
      attachTo: document.body,
      global: {
        components: { BaseIcon },
        stubs: { RouterLink: { template: '<a class="rl-stub"><slot /></a>' } },
      },
    });
    await flushPromises();
    await nextTick();

    expect(wrapper.text()).toContain('3');
  });
});

describe('CR-009 (P0): Bắt đầu/Học lại bài', () => {
  let wrapper: VueWrapper | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    wrapper?.unmount();
    setActivePinia(createPinia());
  });

  it('hiển thị nút Bắt đầu cho lesson NotStarted', async () => {
    vi.mocked(courseApi.getCourseById).mockResolvedValueOnce(MOCK_COURSE_DETAIL as never);
    setActivePinia(createPinia());
    wrapper = mount(CourseDetailView, {
      attachTo: document.body,
      global: {
        components: { BaseIcon },
        stubs: { RouterLink: { template: '<a class="rl-stub"><slot /></a>' } },
      },
    });
    await flushPromises();
    await nextTick();

    const buttons = wrapper.findAll('.lesson-item button');
    const startBtn = buttons.find(b => b.text() === 'Bắt đầu');
    expect(startBtn).toBeDefined();
  });

  it('hiển thị nút Học lại cho lesson Completed', async () => {
    vi.mocked(courseApi.getCourseById).mockResolvedValueOnce(MOCK_COURSE_DETAIL as never);
    setActivePinia(createPinia());
    wrapper = mount(CourseDetailView, {
      attachTo: document.body,
      global: {
        components: { BaseIcon },
        stubs: { RouterLink: { template: '<a class="rl-stub"><slot /></a>' } },
      },
    });
    await flushPromises();
    await nextTick();

    const buttons = wrapper.findAll('.lesson-item button');
    const reviewBtn = buttons.find(b => b.text() === 'Học lại');
    expect(reviewBtn).toBeDefined();
  });

  it('click nút Bắt đầu navigate đến lesson', async () => {
    mockRouterPush.mockClear();
    vi.mocked(courseApi.getCourseById).mockResolvedValueOnce(MOCK_COURSE_DETAIL as never);
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

    const buttons = wrapper.findAll('.lesson-item button');
    const startBtn = buttons.find(b => b.text() === 'Bắt đầu');
    await startBtn!.trigger('click');
    await nextTick();

    expect(mockRouterPush).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'lesson-study' })
    );
  });
});

describe('CR-015 (P1): Phân trang', () => {
  let wrapper: VueWrapper | null = null;

  const MANY_COURSES = Array.from({ length: 12 }, (_, i) => ({
    id: `course-${i}`,
    title: `Course ${i}`,
    category: 'sorting',
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
    vi.mocked(courseApi.getCourses).mockResolvedValueOnce(MANY_COURSES as never);
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
    vi.mocked(courseApi.getCourses).mockResolvedValueOnce(MANY_COURSES as never);
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
