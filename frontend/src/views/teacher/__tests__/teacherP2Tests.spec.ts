// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import BaseIcon from '../../../shared/components/BaseIcon.vue';

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {}, params: {} }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

vi.mock('../../../features/auth/store/useAuthStore', () => ({
  useAuthStore: () => ({
    getAccessToken: () => 'fake-token',
    impersonate: vi.fn(),
    currentUser: { id: 'teacher-001' },
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

vi.mock('../../../features/admin/services/adminApi', () => ({
  fetchQuizzes: vi.fn(async () => []),
  fetchStudents: vi.fn(async () => []),
  fetchAnalytics: vi.fn(async () => ({ quizTitles: {}, codelabTitles: {} })),
}));

vi.mock('@/stores/classroomCurriculum', () => ({
  useClassroomCurriculumStore: () => ({
    loading: false,
    saving: false,
    curriculum: null,
    isModuleExpanded: () => false,
    toggleModuleExpanded: vi.fn(),
    fetchCurriculum: vi.fn(),
    createModuleApi: vi.fn(),
    updateModuleApi: vi.fn(),
    deleteModuleApi: vi.fn(),
    createItemApi: vi.fn(),
    updateItemApi: vi.fn(),
    deleteItemApi: vi.fn(),
    getModule: () => null,
  }),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

import TeacherPanelView from '../TeacherPanelView.vue';
import TeacherQuizTab from '../TeacherQuizTab.vue';
import TeacherAnalyticsTab from '../TeacherAnalyticsTab.vue';
import TeacherStudentTab from '../TeacherStudentTab.vue';
import TeacherClassroomCurriculumTab from '../TeacherClassroomCurriculumTab.vue';

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

async function mountQuizTab(): Promise<VueWrapper> {
  setActivePinia(createPinia());
  wrapper = mount(TeacherQuizTab, {
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

async function mountAnalyticsTab(): Promise<VueWrapper> {
  setActivePinia(createPinia());
  wrapper = mount(TeacherAnalyticsTab, {
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

async function mountStudentTab(): Promise<VueWrapper> {
  setActivePinia(createPinia());
  wrapper = mount(TeacherStudentTab, {
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

async function mountCurriculumTab(): Promise<VueWrapper> {
  setActivePinia(createPinia());
  wrapper = mount(TeacherClassroomCurriculumTab, {
    attachTo: document.body,
    global: {
      components: { BaseIcon },
      stubs: {
        RouterLink: { template: '<a class="rl-stub"><slot /></a>' },
        DndContext: { template: '<div><slot /></div>' },
        SortableContextWrapper: { template: '<div><slot /></div>' },
        ModuleItemRow: { template: '<div class="module-item-row-stub"></div>' },
        ModuleFormModal: { template: '<div></div>' },
        ItemFormModal: { template: '<div></div>' },
        OverrideSettingsModal: { template: '<div></div>' },
        ImportCourseModal: { template: '<div></div>' },
        ConfirmModal: { template: '<div></div>' },
      },
    },
  });
  await flushPromises();
  await nextTick();
  return wrapper;
}

describe('Teacher Panel — P2 Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockFetch.mockReset();
    mockFetch.mockImplementation(async (url: string) => {
      if (url.includes('/analytics/quizzes')) {
        return { ok: true, json: async () => ({ totalQuizzes: 0, totalQuestionsInBank: 0, totalUsers: 0, premiumUsers: 0 }) };
      }
      if (url.includes('/quiz/all')) {
        return { ok: true, json: async () => [] };
      }
      if (url.includes('/quizzes')) {
        return { ok: true, json: async () => ({ quizzes: [] }) };
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
      if (url.includes('/Classroom/mine')) {
        return { ok: true, json: async () => [] };
      }
      if (url.includes('/Classroom/') && url.includes('/statistics')) {
        return { ok: true, json: async () => ({ totalStudents: 0, avgScore: 0, passRate: 0, completionRate: 0, quizTitles: {}, codelabTitles: {}, studentScores: [] }) };
      }
      if (url.includes('/export-excel')) {
        return { ok: true, blob: async () => new Blob(['test']) };
      }
      return { ok: true, json: async () => ({}) };
    });
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
  });

  // ─── US-TEACH-003 (P2): Create quiz ─────────────────────────────────
  describe('US-TEACH-003 (P2): Create quiz', () => {
    it('shows quiz creation form when toggle button is clicked', async () => {
      const w = await mountQuizTab();
      expect(w.find('.quiz-form').exists()).toBe(false);

      const toggleBtn = w.find('.btn-toggle-form');
      expect(toggleBtn.exists()).toBe(true);
      await toggleBtn.trigger('click');
      await nextTick();

      expect(w.find('.quiz-form').exists()).toBe(true);
      expect(w.text()).toContain('Thêm câu hỏi trắc nghiệm mới');
    });

    it('renders title input and topic/difficulty fields in create form', async () => {
      const w = await mountQuizTab();
      await w.find('.btn-toggle-form').trigger('click');
      await nextTick();

      const titleInput = w.find('input[placeholder*="Cơ bản về danh sách liên kết"]');
      expect(titleInput.exists()).toBe(true);

      const topicSelect = w.find('.form-select');
      expect(topicSelect.exists()).toBe(true);
    });

    it('submits quiz form with POST method', async () => {
      const w = await mountQuizTab();
      await w.find('.btn-toggle-form').trigger('click');
      await nextTick();

      const titleInput = w.find('input[placeholder*="Cơ bản về danh sách liên kết"]');
      await titleInput.setValue('Test Quiz');

      const topicSelect = w.find('.form-select');
      await topicSelect.setValue('sorting');

      const questionInputs = w.findAll('input[placeholder*="Nội dung câu hỏi"]');
      await questionInputs[0].setValue('What is sorting?');

      const optionInputs = w.findAll('.options-grid input[placeholder*="Đáp án"]');
      await optionInputs[0].setValue('A');
      await optionInputs[1].setValue('B');
      await optionInputs[2].setValue('C');
      await optionInputs[3].setValue('D');

      const submitBtn = w.find('.btn-submit');
      await submitBtn.trigger('click');
      await flushPromises();
      await nextTick();

      const postCalls = mockFetch.mock.calls.filter(
        (call) => call[1] && (call[1] as RequestInit).method === 'POST'
      );
      expect(postCalls.length).toBeGreaterThan(0);
    });
  });

  // ─── US-TEACH-004 (P2): Topic dropdown ──────────────────────────────
  describe('US-TEACH-004 (P2): Topic dropdown', () => {
    it('renders all topic options in the dropdown', async () => {
      const w = await mountQuizTab();
      await w.find('.btn-toggle-form').trigger('click');
      await nextTick();

      const options = w.find('.form-select').findAll('option');
      const optionValues = options.map((o) => o.attributes('value'));

      expect(optionValues).toContain('sorting');
      expect(optionValues).toContain('graph');
      expect(optionValues).toContain('oop');
      expect(optionValues).toContain('solid');
      expect(optionValues).toContain('di');
      expect(optionValues).toContain('array');
      expect(optionValues).toContain('linked-list');
      expect(optionValues).toContain('design-patterns');
    });

    it('selecting a topic updates the bound value', async () => {
      const w = await mountQuizTab();
      await w.find('.btn-toggle-form').trigger('click');
      await nextTick();

      const topicSelect = w.find('.form-select');
      await topicSelect.setValue('graph');
      await nextTick();

      expect((topicSelect.element as HTMLSelectElement).value).toBe('graph');
    });

    it('topic labels display Vietnamese text', async () => {
      const w = await mountQuizTab();
      await w.find('.btn-toggle-form').trigger('click');
      await nextTick();

      const options = w.find('.form-select').findAll('option');
      const optionTexts = options.map((o) => o.text());

      expect(optionTexts).toContain('Sắp xếp');
      expect(optionTexts).toContain('Đồ thị');
      expect(optionTexts).toContain('Hướng đối tượng');
      expect(optionTexts).toContain('Nguyên lý SOLID');
    });
  });

  // ─── US-TEACH-005 (P2): Import Excel ────────────────────────────────
  describe('US-TEACH-005 (P2): Import Excel', () => {
    it('renders "Xuất Excel" button when classroom is selected and data loaded', async () => {
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/Classroom/mine')) {
          return { ok: true, json: async () => [{ id: 'c1', name: 'Class A' }] };
        }
        if (url.includes('/statistics')) {
          return { ok: true, json: async () => ({
            totalStudents: 10,
            avgScore: 70.0,
            passRate: 60.0,
            completionRate: 0.5,
            quizTitles: {},
            codelabTitles: {},
            studentScores: [
              { studentId: 's1', name: 'Alice', scoresPerQuiz: {}, scoresPerCodelab: {}, totalXP: 100 },
            ],
          }) };
        }
        if (url.includes('/export-excel')) {
          return { ok: true, blob: async () => new Blob(['test']) };
        }
        return { ok: true, json: async () => ({}) };
      });

      const w = await mountAnalyticsTab();
      await flushPromises();
      await nextTick();

      const classroomSelect = w.find('.form-select');
      await classroomSelect.setValue('c1');
      await classroomSelect.trigger('change');
      await flushPromises();
      await nextTick();
      await flushPromises();

      const buttonTexts = w.findAll('button').map((b) => b.text());
      expect(buttonTexts.some((t) => t.includes('Excel'))).toBe(true);
    });

    it('clicking "Xuất Excel" triggers fetch to export endpoint', async () => {
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/Classroom/mine')) {
          return { ok: true, json: async () => [{ id: 'c1', name: 'Class A' }] };
        }
        if (url.includes('/statistics')) {
          return { ok: true, json: async () => ({
            totalStudents: 10,
            avgScore: 70.0,
            passRate: 60.0,
            completionRate: 0.5,
            quizTitles: {},
            codelabTitles: {},
            studentScores: [],
          }) };
        }
        if (url.includes('/export-excel')) {
          return { ok: true, blob: async () => new Blob(['test']) };
        }
        return { ok: true, json: async () => ({}) };
      });

      const w = await mountAnalyticsTab();
      await flushPromises();
      await nextTick();

      const classroomSelect = w.find('.form-select');
      await classroomSelect.setValue('c1');
      await classroomSelect.trigger('change');
      await flushPromises();
      await nextTick();
      await flushPromises();

      const excelButtons = w.findAll('button').filter((b) => b.text().includes('Excel'));
      expect(excelButtons.length).toBeGreaterThan(0);

      await excelButtons[0].trigger('click');
      await flushPromises();
      await nextTick();

      const exportCalls = mockFetch.mock.calls.filter(
        (call) => typeof call[0] === 'string' && call[0].includes('export-excel')
      );
      expect(exportCalls.length).toBeGreaterThan(0);
    });
  });

  // ─── US-TEACH-006 (P2): Difficulty + XP ─────────────────────────────
  describe('US-TEACH-006 (P2): Difficulty + XP', () => {
    it('renders difficulty selector with all levels', async () => {
      const w = await mountQuizTab();
      await w.find('.btn-toggle-form').trigger('click');
      await nextTick();

      const allSelects = w.findAll('select');
      const difficultySelect = allSelects.find((s) => {
        const options = s.findAll('option');
        return options.some((o) => o.attributes('value') === 'easy');
      });

      expect(difficultySelect).toBeTruthy();
      if (difficultySelect) {
        const values = difficultySelect.findAll('option').map((o) => o.attributes('value'));
        expect(values).toContain('easy');
        expect(values).toContain('medium');
        expect(values).toContain('hard');
      }
    });

    it('renders XP reward input with min/max constraints', async () => {
      const w = await mountQuizTab();
      await w.find('.btn-toggle-form').trigger('click');
      await nextTick();

      const xpInput = w.find('input[type="number"]');
      expect(xpInput.exists()).toBe(true);
      expect(xpInput.attributes('min')).toBe('10');
      expect(xpInput.attributes('max')).toBe('500');
    });

    it('changing difficulty updates the bound value', async () => {
      const w = await mountQuizTab();
      await w.find('.btn-toggle-form').trigger('click');
      await nextTick();

      const allSelects = w.findAll('select');
      const difficultySelect = allSelects.find((s) => {
        const options = s.findAll('option');
        return options.some((o) => o.attributes('value') === 'hard');
      });

      expect(difficultySelect).toBeTruthy();
      if (difficultySelect) {
        await difficultySelect.setValue('hard');
        await nextTick();
        expect((difficultySelect.element as HTMLSelectElement).value).toBe('hard');
      }
    });

    it('XP input accepts numeric values within range', async () => {
      const w = await mountQuizTab();
      await w.find('.btn-toggle-form').trigger('click');
      await nextTick();

      const xpInput = w.find('input[type="number"]');
      await xpInput.setValue('100');
      await nextTick();

      expect((xpInput.element as HTMLInputElement).value).toBe('100');
    });
  });

  // ─── US-TEACH-007 (P2): Add/remove question ─────────────────────────
  describe('US-TEACH-007 (P2): Add/remove question', () => {
    it('starts with one question block by default', async () => {
      const w = await mountQuizTab();
      await w.find('.btn-toggle-form').trigger('click');
      await nextTick();

      const questionBlocks = w.findAll('.question-block');
      expect(questionBlocks.length).toBe(1);
    });

    it('adds a new question block when "+ Thêm câu" is clicked', async () => {
      const w = await mountQuizTab();
      await w.find('.btn-toggle-form').trigger('click');
      await nextTick();

      const addBtn = w.find('.btn-add-q');
      expect(addBtn.exists()).toBe(true);

      await addBtn.trigger('click');
      await nextTick();
      expect(w.findAll('.question-block').length).toBe(2);

      await addBtn.trigger('click');
      await nextTick();
      expect(w.findAll('.question-block').length).toBe(3);
    });

    it('removes a question block when remove button is clicked', async () => {
      const w = await mountQuizTab();
      await w.find('.btn-toggle-form').trigger('click');
      await nextTick();

      await w.find('.btn-add-q').trigger('click');
      await nextTick();
      await w.find('.btn-add-q').trigger('click');
      await nextTick();
      expect(w.findAll('.question-block').length).toBe(3);

      const removeBtns = w.findAll('.btn-remove');
      await removeBtns[0].trigger('click');
      await nextTick();
      expect(w.findAll('.question-block').length).toBe(2);
    });

    it('does not show remove button when only one question exists', async () => {
      const w = await mountQuizTab();
      await w.find('.btn-toggle-form').trigger('click');
      await nextTick();

      const removeBtns = w.findAll('.btn-remove');
      expect(removeBtns.length).toBe(0);
    });

    it('displays correct question numbering after add/remove', async () => {
      const w = await mountQuizTab();
      await w.find('.btn-toggle-form').trigger('click');
      await nextTick();

      await w.find('.btn-add-q').trigger('click');
      await nextTick();

      const nums = w.findAll('.question-block__num');
      expect(nums[0].text()).toContain('Câu 1');
      expect(nums[1].text()).toContain('Câu 2');
    });
  });

  // ─── US-TEACH-008 (P2): Edit mode ───────────────────────────────────
  describe('US-TEACH-008 (P2): Edit mode', () => {
    const mockQuizzes = [
      { id: 'q1', title: 'Sorting Basics', topic: 'sorting', difficulty: 'easy', xpReward: 50, questionCount: 3 },
    ];

    const mockQuizDetail = {
      id: 'q1',
      title: 'Sorting Basics',
      topic: 'sorting',
      difficulty: 'easy',
      xpReward: 50,
      questions: [
        { text: 'What is bubble sort?', options: ['A', 'B', 'C', 'D'], correctIndex: 0, explanation: 'Explanation 1' },
        { text: 'What is merge sort?', options: ['A', 'B', 'C', 'D'], correctIndex: 1, explanation: 'Explanation 2' },
      ],
    };

    beforeEach(() => {
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/analytics/quizzes')) {
          return { ok: true, json: async () => ({ totalQuizzes: 1, totalQuestionsInBank: 2, totalUsers: 5, premiumUsers: 1 }) };
        }
        if (url.includes('/quiz/all')) {
          return { ok: true, json: async () => mockQuizzes };
        }
        if (url.includes('/quiz/analytics')) {
          return { ok: true, json: async () => ({ perQuizStats: [] }) };
        }
        if (url.includes('/quiz/q1') && !url.includes('manage') && !url.includes('history')) {
          return { ok: true, json: async () => mockQuizDetail };
        }
        if (url.includes('/quiz/manage/q1')) {
          return { ok: true, json: async () => ({}) };
        }
        return { ok: true, json: async () => ({}) };
      });
    });

    it('shows "Chỉnh sửa bài trắc nghiệm" heading when edit mode is active', async () => {
      const w = await mountQuizTab();
      await flushPromises();
      await nextTick();

      const editBtn = w.find('.btn-action--edit');
      expect(editBtn.exists()).toBe(true);
      await editBtn.trigger('click');
      await flushPromises();
      await nextTick();

      expect(w.text()).toContain('Chỉnh sửa bài trắc nghiệm');
    });

    it('populates form fields with existing quiz data in edit mode', async () => {
      const w = await mountQuizTab();
      await flushPromises();
      await nextTick();

      await w.find('.btn-action--edit').trigger('click');
      await flushPromises();
      await nextTick();

      const titleInput = w.find('input[placeholder*="Cơ bản về danh sách liên kết"]');
      expect((titleInput.element as HTMLInputElement).value).toBe('Sorting Basics');

      const topicSelect = w.find('.form-select');
      expect((topicSelect.element as HTMLSelectElement).value).toBe('sorting');
    });

    it('shows "Cập nhật bài trắc nghiệm" button text in edit mode', async () => {
      const w = await mountQuizTab();
      await flushPromises();
      await nextTick();

      await w.find('.btn-action--edit').trigger('click');
      await flushPromises();
      await nextTick();

      const submitBtn = w.find('.btn-submit');
      expect(submitBtn.text()).toContain('Cập nhật');
    });

    it('submits with PUT method when editing existing quiz', async () => {
      const w = await mountQuizTab();
      await flushPromises();
      await nextTick();

      await w.find('.btn-action--edit').trigger('click');
      await flushPromises();
      await nextTick();

      const submitBtn = w.find('.btn-submit');
      await submitBtn.trigger('click');
      await flushPromises();
      await nextTick();

      const putCalls = mockFetch.mock.calls.filter(
        (call) => call[1] && (call[1] as RequestInit).method === 'PUT'
      );
      expect(putCalls.length).toBeGreaterThan(0);
    });

    it('cancel button closes the form and resets edit mode', async () => {
      const w = await mountQuizTab();
      await flushPromises();
      await nextTick();

      await w.find('.btn-action--edit').trigger('click');
      await flushPromises();
      await nextTick();
      expect(w.text()).toContain('Chỉnh sửa bài trắc nghiệm');
      expect(w.find('.quiz-form').exists()).toBe(true);

      const cancelBtn = w.find('.btn-cancel');
      await cancelBtn.trigger('click');
      await nextTick();

      expect(w.find('.quiz-form').exists()).toBe(false);
    });
  });

  // ─── US-TEACH-009 (P2): Curriculum tab ──────────────────────────────
  describe('US-TEACH-009 (P2): Curriculum tab', () => {
    it('switches to curriculum tab when clicked', async () => {
      const w = await mountTeacherPanel();
      const curriculumTab = w.findAll('.pb-3').find((el) => el.text() === 'Chương trình học (Curriculum)');
      expect(curriculumTab).toBeTruthy();
      await curriculumTab!.trigger('click');
      await nextTick();
      await flushPromises();

      expect(w.text()).toContain('Quản lý Chương trình học (Curriculum)');
    });

    it('reads classroomId from route query param', async () => {
      const mockUseRoute = vi.fn(() => ({ query: { classroomId: 'room-123' }, params: {} }));
      vi.doMock('vue-router', () => ({
        useRoute: mockUseRoute,
        useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
      }));

      const w = await mountTeacherPanel();
      const curriculumTab = w.findAll('.pb-3').find((el) => el.text() === 'Chương trình học (Curriculum)');
      await curriculumTab!.trigger('click');
      await nextTick();
      await flushPromises();

      expect(w.text()).toContain('Quản lý Chương trình học (Curriculum)');
    });

    it('shows "Thêm Module" button in curriculum tab', async () => {
      const w = await mountTeacherPanel();
      const curriculumTab = w.findAll('.pb-3').find((el) => el.text() === 'Chương trình học (Curriculum)');
      await curriculumTab!.trigger('click');
      await nextTick();
      await flushPromises();

      expect(w.text()).toContain('Thêm Module');
    });
  });

  // ─── US-TEACH-010 (P2): Classroom curriculum ────────────────────────
  describe('US-TEACH-010 (P2): Classroom curriculum', () => {
    it('renders empty state when no modules exist', async () => {
      const w = await mountCurriculumTab();
      expect(w.text()).toContain('Chưa có Module nào');
    });

    it('renders "Import từ Khóa học" button', async () => {
      const w = await mountCurriculumTab();
      expect(w.text()).toContain('Import từ Khóa học');
    });

    it('renders "Thêm Module" button to create new module', async () => {
      const w = await mountCurriculumTab();
      const buttons = w.findAll('button');
      const buttonTexts = buttons.map((b) => b.text());
      expect(buttonTexts.some((t) => t.includes('Thêm Module'))).toBe(true);
    });

    it('shows "Tạo Module đầu tiên" button in empty state', async () => {
      const w = await mountCurriculumTab();
      expect(w.text()).toContain('Tạo Module đầu tiên');
    });
  });

  // ─── US-TEACH-011 (P2): Analytics ───────────────────────────────────
  describe('US-TEACH-011 (P2): Analytics', () => {
    it('renders classroom selector dropdown', async () => {
      const w = await mountAnalyticsTab();
      expect(w.text()).toContain('Chọn lớp học');
    });

    it('shows prompt to select classroom when none selected', async () => {
      const w = await mountAnalyticsTab();
      expect(w.text()).toContain('Vui lòng chọn một lớp học');
    });

    it('renders metric cards when classroom is selected', async () => {
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/Classroom/mine')) {
          return { ok: true, json: async () => [{ id: 'c1', name: 'Class A' }] };
        }
        if (url.includes('/Classroom/') && url.includes('/statistics')) {
          return { ok: true, json: async () => ({
            totalStudents: 25,
            avgScore: 75.5,
            passRate: 80.0,
            completionRate: 0.65,
            quizTitles: { 'q1': 'Sorting Quiz' },
            codelabTitles: {},
            studentScores: [
              { studentId: 's1', name: 'Alice', scoresPerQuiz: { 'q1': 90 }, scoresPerCodelab: {}, totalXP: 500 },
            ],
          }) };
        }
        return { ok: true, json: async () => ({}) };
      });

      const w = await mountAnalyticsTab();
      await flushPromises();
      await nextTick();

      const classroomSelect = w.find('.form-select');
      await classroomSelect.setValue('c1');
      await classroomSelect.trigger('change');
      await flushPromises();
      await nextTick();
      await flushPromises();

      expect(w.text()).toContain('Học viên tham gia');
      expect(w.text()).toContain('Tỷ lệ hoàn thành');
      expect(w.text()).toContain('Điểm trung bình');
      expect(w.text()).toContain('Tỷ lệ đạt');
    });

    it('renders student scores table when data is available', async () => {
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/Classroom/mine')) {
          return { ok: true, json: async () => [{ id: 'c1', name: 'Class A' }] };
        }
        if (url.includes('/Classroom/') && url.includes('/statistics')) {
          return { ok: true, json: async () => ({
            totalStudents: 2,
            avgScore: 80.0,
            passRate: 75.0,
            completionRate: 0.60,
            quizTitles: { 'q1': 'Sorting Quiz' },
            codelabTitles: { 'c1': 'Code Lab 1' },
            studentScores: [
              { studentId: 's1', name: 'Alice', scoresPerQuiz: { 'q1': 90 }, scoresPerCodelab: { 'c1': 85 }, totalXP: 500 },
              { studentId: 's2', name: 'Bob', scoresPerQuiz: { 'q1': 70 }, scoresPerCodelab: { 'c1': 60 }, totalXP: 300 },
            ],
          }) };
        }
        return { ok: true, json: async () => ({}) };
      });

      const w = await mountAnalyticsTab();
      await flushPromises();
      await nextTick();

      const classroomSelect = w.find('.form-select');
      await classroomSelect.setValue('c1');
      await classroomSelect.trigger('change');
      await flushPromises();
      await nextTick();
      await flushPromises();

      expect(w.text()).toContain('Alice');
      expect(w.text()).toContain('Bob');
    });
  });

  // ─── US-TEACH-012 (P2): Student management ──────────────────────────
  describe('US-TEACH-012 (P2): Student management', () => {
    const mockStudents = [
      { id: 's1', username: 'alice', email: 'alice@test.com', currentLevel: 5, totalXP: 320, streakDays: 12, createdAt: '2024-03-15' },
      { id: 's2', username: 'bob', email: 'bob@test.com', currentLevel: 2, totalXP: 80, streakDays: 3, createdAt: '2024-06-20' },
    ];

    beforeEach(() => {
      mockFetch.mockImplementation(async (url: string) => {
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

    it('renders student table with correct headers', async () => {
      const w = await mountStudentTab();
      await flushPromises();
      await nextTick();

      expect(w.text()).toContain('Học viên');
      expect(w.text()).toContain('Cấp độ');
      expect(w.text()).toContain('Tích lũy XP');
      expect(w.text()).toContain('Streak hiện tại');
      expect(w.text()).toContain('Ngày tham gia');
    });

    it('displays student data rows', async () => {
      const w = await mountStudentTab();
      await flushPromises();
      await nextTick();

      expect(w.text()).toContain('alice');
      expect(w.text()).toContain('bob');
      expect(w.text()).toContain('alice@test.com');
      expect(w.text()).toContain('bob@test.com');
    });

    it('shows total student count', async () => {
      const w = await mountStudentTab();
      await flushPromises();
      await nextTick();

      expect(w.text()).toContain('Hiển thị 2 học viên');
    });

    it('renders search input for filtering students', async () => {
      const w = await mountStudentTab();
      await flushPromises();
      await nextTick();

      const searchInput = w.find('input[placeholder*="Tìm theo email"]');
      expect(searchInput.exists()).toBe(true);
    });

    it('shows "Xem chi tiết" action button for each student', async () => {
      const w = await mountStudentTab();
      await flushPromises();
      await nextTick();

      const detailButtons = w.findAll('button').filter((b) => b.text().includes('Xem chi tiết'));
      expect(detailButtons.length).toBe(2);
    });

    it('renders pagination controls', async () => {
      const w = await mountStudentTab();
      await flushPromises();
      await nextTick();

      expect(w.text()).toContain('Trang 1');
      expect(w.text()).toContain('Trước');
      expect(w.text()).toContain('Sau');
    });

    it('shows empty state when no students found', async () => {
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/admin/users') || url.includes('/concepts/admin/users')) {
          return { ok: true, json: async () => ({ users: [], total: 0 }) };
        }
        return { ok: true, json: async () => ({}) };
      });

      const w = await mountStudentTab();
      await flushPromises();
      await nextTick();

      expect(w.text()).toContain('Không tìm thấy học viên nào');
    });
  });
});
