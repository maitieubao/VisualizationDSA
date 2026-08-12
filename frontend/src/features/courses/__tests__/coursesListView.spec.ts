// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import BaseIcon from '../../../shared/components/BaseIcon.vue';
import type { Course } from '../types/course.types';

vi.mock('../../../services/courseApi', () => ({
  courseApi: {
    getCourses: vi.fn(),
  },
}));
vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

import { courseApi } from '../../../services/courseApi';
import CoursesListView from '../../../views/courses/CoursesListView.vue';

// Dữ liệu ĐÚNG KIỂU Course (không `as never` — LM-054).
const API_COURSES: Course[] = [
  {
    id: '61ee2ff5-c462-45d0-8849-f700a13927d5',
    title: 'Nhập môn Cấu trúc dữ liệu & Giải thuật',
    description: 'Lộ trình nhập môn hoàn chỉnh: Big-O & mảng, đệ quy, sắp xếp cơ bản...',
    category: 'Sorting',
    difficulty: 'Beginner',
    isPremium: true,
    coverImageUrl: 'https://images.unsplash.com/photo-1516116211223-48a122638c59?w=500&q=80',
    coverImage: 'https://images.unsplash.com/photo-1516116211223-48a122638c59?w=500&q=80',
    isPublished: true,
    totalLessons: 6,
    xpReward: 100,
    lessons: [],
  },
  {
    id: 'cc34c52f-366f-4d63-98e4-26ef1bbc8e7e',
    title: 'Làm chủ Danh sách liên kết (Linked List)',
    description: 'Nắm vững con trỏ, Node, Singly vs Doubly Linked List.',
    category: 'Sorting',
    difficulty: 'Beginner',
    isPremium: true,
    coverImage: '',
    isPublished: true,
    totalLessons: 3,
    xpReward: 80,
    lessons: [],
  },
];

let wrapper: VueWrapper | null = null;

async function mountView(): Promise<VueWrapper> {
  setActivePinia(createPinia());
  wrapper = mount(CoursesListView, {
    attachTo: document.body,
    global: {
      components: { BaseIcon },
      // Stub tường minh: auto-stub (true) không render slot trong test-utils
      stubs: { RouterLink: { template: '<a class="rl-stub"><slot /></a>' } },
    },
  });
  await flushPromises();
  await nextTick();
  return wrapper;
}

describe('CoursesListView.vue — render từ dữ liệu API thật', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  it('hiển thị danh sách khóa học khi API trả dữ liệu published', async () => {
    vi.mocked(courseApi.getCourses).mockResolvedValueOnce(API_COURSES);
    const w = await mountView();

    expect(w.text()).toContain('Nhập môn Cấu trúc dữ liệu & Giải thuật');
    expect(w.text()).toContain('Làm chủ Danh sách liên kết (Linked List)');
    expect(w.text()).not.toContain('Không tìm thấy khóa học phù hợp');
  });

  it('hiển thị empty state khi API trả rỗng', async () => {
    vi.mocked(courseApi.getCourses).mockResolvedValueOnce([]);
    const w = await mountView();

    expect(w.text()).toContain('Không tìm thấy khóa học phù hợp');
  });

  it('hiển thị error state kèm nút Thử lại khi API fail', async () => {
    vi.mocked(courseApi.getCourses).mockRejectedValueOnce(new Error('network down'));
    const w = await mountView();

    expect(w.text()).toContain('Không thể tải khóa học');
    expect(w.text()).toContain('Thử lại');
  });

  it('lọc bỏ khóa học chưa publish', async () => {
    const mixed: Course[] = [
      ...API_COURSES,
      { ...API_COURSES[0], id: 'unpublished-1', title: 'Khóa ẩn', isPublished: false },
    ];
    vi.mocked(courseApi.getCourses).mockResolvedValueOnce(mixed);
    const w = await mountView();

    expect(w.text()).toContain('Nhập môn Cấu trúc dữ liệu & Giải thuật');
    expect(w.text()).not.toContain('Khóa ẩn');
  });
});
