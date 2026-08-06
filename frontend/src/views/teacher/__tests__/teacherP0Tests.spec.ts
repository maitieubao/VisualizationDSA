// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import BaseIcon from '../../../shared/components/BaseIcon.vue';

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('../../../features/auth/store/useAuthStore', () => ({
  useAuthStore: () => ({
    getAccessToken: () => 'fake-token',
    impersonate: vi.fn(),
  }),
}));

vi.mock('./useTeacherApi', () => ({
  useTeacherApi: () => ({
    BASE_URL: 'http://localhost:5055',
    getAuthHeaders: () => ({ 'Content-Type': 'application/json', 'Authorization': 'Bearer fake-token' }),
    formatTopic: (t: string) => ({ 'sorting': 'Sắp xếp', 'graph': 'Đồ thị', 'oop': 'Hướng đối tượng', 'solid': 'Nguyên lý SOLID', 'di': 'DI/IoC', 'array': 'Mảng', 'linked-list': 'Danh sách liên kết', 'design-patterns': 'Mẫu thiết kế' }[t] || t),
    formatDifficulty: (d: string) => ({ 'easy': 'Dễ', 'medium': 'Trung bình', 'hard': 'Khó' }[d] || d),
    formatDate: (d: string) => d,
    formatAttemptDate: (d: string) => d,
  }),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

import TeacherPanelView from '../TeacherPanelView.vue';

let wrapper: VueWrapper | null = null;

async function mountTeacherPanel(): Promise<VueWrapper> {
  setActivePinia(createPinia());
  wrapper = mount(TeacherPanelView, {
    attachTo: document.body,
    global: {
      components: { BaseIcon },
      stubs: { RouterLink: { template: '<a class="rl-stub"><slot /></a>' } },
    },
  });
  await flushPromises();
  await nextTick();
  return wrapper;
}

describe('TeacherPanelView — P0 Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockFetch.mockReset();
    mockFetch.mockImplementation(async (url: string) => {
      if (url.includes('/analytics/quizzes')) {
        return { ok: true, json: async () => ({ totalQuizzes: 0, totalQuestionsInBank: 0, totalUsers: 0, premiumUsers: 0 }) };
      }
      if (url.includes('/quizzes') || url.includes('/quiz/all')) {
        return { ok: true, json: async () => [] };
      }
      if (url.includes('/quiz/analytics')) {
        return { ok: true, json: async () => ({ perQuizStats: [] }) };
      }
      if (url.includes('/admin/users') || url.includes('/concepts/admin/users')) {
        return { ok: true, json: async () => ({ users: [], total: 0 }) };
      }
      if (url.includes('/concepts/courses')) {
        return { ok: true, json: async () => [] };
      }
      if (url.includes('/quiz/history')) {
        return { ok: true, json: async () => [] };
      }
      return { ok: true, json: async () => ({}) };
    });
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
  });

  describe('Tab Navigation', () => {
    it('renders all teacher panel tabs', async () => {
      const w = await mountTeacherPanel();
      const tabTexts = w.findAll('.pb-3').map((el) => el.text());
      expect(tabTexts).toContain('Quản lý Trắc nghiệm');
      expect(tabTexts).toContain('Quản lý Khóa học & Bài giảng');
      expect(tabTexts).toContain('Chương trình học (Curriculum)');
      expect(tabTexts).toContain('Thư viện Lý thuyết');
      expect(tabTexts).toContain('Công cụ Tạo Quiz');
      expect(tabTexts).toContain('Công cụ Tạo Codelab');
      expect(tabTexts).toContain('Quản lý Học viên');
      expect(tabTexts).toContain('Báo cáo & Phân tích');
    });

    it('defaults to "courses" tab on mount', async () => {
      const w = await mountTeacherPanel();
      expect(w.text()).toContain('Quản lý Khóa học & Bài giảng');
    });

    it('switches to students tab when clicked', async () => {
      const w = await mountTeacherPanel();
      const studentTab = w.findAll('.pb-3').find((el) => el.text() === 'Quản lý Học viên');
      expect(studentTab).toBeTruthy();
      await studentTab!.trigger('click');
      await nextTick();
      await flushPromises();
      expect(w.text()).toContain('Quản lý & Theo dõi tiến trình học viên');
    });

    it('switches to analytics tab when clicked', async () => {
      const w = await mountTeacherPanel();
      const analyticsTab = w.findAll('.pb-3').find((el) => el.text() === 'Báo cáo & Phân tích');
      expect(analyticsTab).toBeTruthy();
      await analyticsTab!.trigger('click');
      await nextTick();
      await flushPromises();
      expect(w.text()).toContain('Thống kê & Phân tích chi tiết lớp học');
    });
  });

  describe('Quiz Creation Form', () => {
    it('shows quiz form when "Tạo trắc nghiệm thủ công" is clicked', async () => {
      const w = await mountTeacherPanel();
      const quizTab = w.findAll('.pb-3').find((el) => el.text() === 'Quản lý Trắc nghiệm');
      await quizTab!.trigger('click');
      await nextTick();
      await flushPromises();

      const createBtn = w.find('.btn-toggle-form');
      expect(createBtn).toBeTruthy();
      await createBtn.trigger('click');
      await nextTick();

      expect(w.text()).toContain('Thêm câu hỏi trắc nghiệm mới');
    });

    it('adds a new question when "Thêm câu" is clicked', async () => {
      const w = await mountTeacherPanel();
      const quizTab = w.findAll('.pb-3').find((el) => el.text() === 'Quản lý Trắc nghiệm');
      await quizTab!.trigger('click');
      await nextTick();
      await flushPromises();

      const createBtn = w.find('.btn-toggle-form');
      await createBtn.trigger('click');
      await nextTick();

      const addQBtn = w.find('.btn-add-q');
      expect(addQBtn).toBeTruthy();
      await addQBtn.trigger('click');
      await nextTick();

      const questionBlocks = w.findAll('.question-block');
      expect(questionBlocks.length).toBe(2);
    });

    it('removes a question when remove button is clicked', async () => {
      const w = await mountTeacherPanel();
      const quizTab = w.findAll('.pb-3').find((el) => el.text() === 'Quản lý Trắc nghiệm');
      await quizTab!.trigger('click');
      await nextTick();
      await flushPromises();

      const createBtn = w.find('.btn-toggle-form');
      await createBtn.trigger('click');
      await nextTick();

      await w.find('.btn-add-q').trigger('click');
      await nextTick();
      expect(w.findAll('.question-block').length).toBe(2);

      const removeBtns = w.findAll('.btn-remove');
      await removeBtns[0].trigger('click');
      await nextTick();
      expect(w.findAll('.question-block').length).toBe(1);
    });

    it('radio buttons exist for correct answer selection', async () => {
      const w = await mountTeacherPanel();
      const quizTab = w.findAll('.pb-3').find((el) => el.text() === 'Quản lý Trắc nghiệm');
      await quizTab!.trigger('click');
      await nextTick();
      await flushPromises();

      await w.find('.btn-toggle-form').trigger('click');
      await nextTick();

      const radios = w.findAll('input[type="radio"]');
      expect(radios.length).toBe(4);
    });
  });

  describe('Quiz CRUD', () => {
    beforeEach(() => {
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/analytics/quizzes')) {
          return { ok: true, json: async () => ({ totalQuizzes: 5, totalQuestionsInBank: 50, totalUsers: 20, premiumUsers: 5 }) };
        }
        if (url.includes('/quiz/all')) {
          return { ok: true, json: async () => [
            { id: 'q1', title: 'Sorting Basics', topic: 'sorting', difficulty: 'easy', xpReward: 50, questionCount: 5 },
            { id: 'q2', title: 'Graph Theory', topic: 'graph', difficulty: 'hard', xpReward: 100, questionCount: 8 },
          ] };
        }
        if (url.includes('/quizzes')) {
          return { ok: true, json: async () => ({ quizzes: [
            { id: 'q1', title: 'Sorting Basics', topic: 'sorting', difficulty: 'easy', xpReward: 50, questionCount: 5 },
            { id: 'q2', title: 'Graph Theory', topic: 'graph', difficulty: 'hard', xpReward: 100, questionCount: 8 },
          ]}) };
        }
        if (url.includes('/quiz/analytics')) {
          return { ok: true, json: async () => ({ perQuizStats: [] }) };
        }
        if (url.includes('/concepts/quiz/') && !url.includes('all') && !url.includes('analytics') && !url.includes('manage') && !url.includes('history')) {
          return { ok: true, json: async () => ({ title: 'Test', topic: 'sorting', difficulty: 'easy', xpReward: 50, questions: [] }) };
        }
        if (url.includes('/admin/users') || url.includes('/concepts/admin/users')) {
          return { ok: true, json: async () => ({ users: [], total: 0 }) };
        }
        return { ok: true, json: async () => ({}) };
      });
    });

    it('calls API on quiz submit', async () => {
      const w = await mountTeacherPanel();
      const quizTab = w.findAll('.pb-3').find((el) => el.text() === 'Quản lý Trắc nghiệm');
      await quizTab!.trigger('click');
      await nextTick();
      await flushPromises();

      await w.find('.btn-toggle-form').trigger('click');
      await nextTick();

      const titleInput = w.find('input[placeholder*="Cơ bản về danh sách liên kết"]');
      await titleInput.setValue('Test Quiz Title');

      const topicSelect = w.find('.form-select');
      await topicSelect.setValue('sorting');

      const questionTextInputs = w.findAll('input[placeholder*="Nội dung câu hỏi"]');
      await questionTextInputs[0].setValue('What is sorting?');

      const optionInputs = w.findAll('.options-grid input[placeholder*="Đáp án"]');
      await optionInputs[0].setValue('Option A');
      await optionInputs[1].setValue('Option B');
      await optionInputs[2].setValue('Option C');
      await optionInputs[3].setValue('Option D');

      const submitBtn = w.find('.btn-submit');

      await submitBtn.trigger('click');
      await flushPromises();
      await nextTick();

      const postCalls = mockFetch.mock.calls.filter(
        (call) => call[1] && (call[1] as RequestInit).method === 'POST'
      );
      expect(postCalls.length).toBeGreaterThan(0);
    });

    it('shows quizzes list when API returns data', async () => {
      const w = await mountTeacherPanel();
      const quizTab = w.findAll('.pb-3').find((el) => el.text() === 'Quản lý Trắc nghiệm');
      await quizTab!.trigger('click');
      await flushPromises();
      await nextTick();

      expect(w.text()).toContain('Sorting Basics');
      expect(w.text()).toContain('Graph Theory');
    });
  });

  describe('Student List Render', () => {
    const mockStudents = [
      { id: 's1', username: 'alice', email: 'alice@test.com', currentLevel: 5, totalXP: 320, streakDays: 12, createdAt: '2024-03-15' },
      { id: 's2', username: 'bob', email: 'bob@test.com', currentLevel: 2, totalXP: 80, streakDays: 3, createdAt: '2024-06-20' },
    ];

    beforeEach(() => {
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/analytics/quizzes')) {
          return { ok: true, json: async () => ({ totalQuizzes: 0, totalQuestionsInBank: 0, totalUsers: 0, premiumUsers: 0 }) };
        }
        if (url.includes('/admin/users') || url.includes('/concepts/admin/users')) {
          return { ok: true, json: async () => ({ users: mockStudents, total: 2 }) };
        }
        if (url.includes('/concepts/courses')) {
          return { ok: true, json: async () => [] };
        }
        if (url.includes('/quiz/history')) {
          return { ok: true, json: async () => [] };
        }
        return { ok: true, json: async () => ({}) };
      });
    });

    it('renders student list table headers', async () => {
      const w = await mountTeacherPanel();
      const studentTab = w.findAll('.pb-3').find((el) => el.text() === 'Quản lý Học viên');
      await studentTab!.trigger('click');
      await flushPromises();
      await nextTick();

      expect(w.text()).toContain('Học viên');
      expect(w.text()).toContain('Cấp độ');
      expect(w.text()).toContain('Tích lũy XP');
    });

    it('displays student data in table', async () => {
      const w = await mountTeacherPanel();
      const studentTab = w.findAll('.pb-3').find((el) => el.text() === 'Quản lý Học viên');
      await studentTab!.trigger('click');
      await flushPromises();
      await nextTick();

      expect(w.text()).toContain('alice');
      expect(w.text()).toContain('bob');
      expect(w.text()).toContain('Hiển thị 2 học viên');
    });

    it('shows empty state when no students found', async () => {
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/analytics/quizzes')) {
          return { ok: true, json: async () => ({ totalQuizzes: 0, totalQuestionsInBank: 0, totalUsers: 0, premiumUsers: 0 }) };
        }
        if (url.includes('/admin/users') || url.includes('/concepts/admin/users')) {
          return { ok: true, json: async () => ({ users: [], total: 0 }) };
        }
        return { ok: true, json: async () => ({}) };
      });

      const w = await mountTeacherPanel();
      const studentTab = w.findAll('.pb-3').find((el) => el.text() === 'Quản lý Học viên');
      await studentTab!.trigger('click');
      await flushPromises();
      await nextTick();

      expect(w.text()).toContain('Không tìm thấy học viên nào');
    });
  });

  describe('Analytics View Render', () => {
    it('renders analytics section with classroom selector', async () => {
      const w = await mountTeacherPanel();
      const analyticsTab = w.findAll('.pb-3').find((el) => el.text() === 'Báo cáo & Phân tích');
      await analyticsTab!.trigger('click');
      await flushPromises();
      await nextTick();

      expect(w.text()).toContain('Thống kê & Phân tích chi tiết lớp học');
      expect(w.text()).toContain('Chọn lớp học');
    });

    it('shows empty state when no classroom selected', async () => {
      const w = await mountTeacherPanel();
      const analyticsTab = w.findAll('.pb-3').find((el) => el.text() === 'Báo cáo & Phân tích');
      await analyticsTab!.trigger('click');
      await flushPromises();
      await nextTick();

      expect(w.text()).toContain('Vui lòng chọn một lớp học');
    });
  });
});
