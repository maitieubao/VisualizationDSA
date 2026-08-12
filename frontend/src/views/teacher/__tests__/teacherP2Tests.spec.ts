// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import BaseIcon from '../../../shared/components/BaseIcon.vue';

// LS-020: route có thể đổi giữa các test → dùng vi.hoisted object
// (vi.doMock sau import không bao giờ có hiệu lực).
const routeState = vi.hoisted(() => ({
  route: { query: {}, params: {} },
}));

vi.mock('vue-router', () => ({
  useRoute: () => routeState.route,
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
    // TC-013: mock teacherRequest — đi qua global.fetch để mockFetch chặn được URL/method/body.
    teacherRequest: async (url: string, init: RequestInit = {}) => {
      const base = { 'Content-Type': 'application/json', 'Authorization': 'Bearer fake-token' };
      const extra = (init.headers ?? {}) as Record<string, string>;
      return globalThis.fetch(url, { ...init, headers: { ...base, ...extra } });
    },
    formatTopic: (t: string) => ({ 'sorting': 'Sắp xếp', 'graph': 'Đồ thị', 'oop': 'Hướng đối tượng', 'solid': 'Nguyên lý SOLID', 'di': 'DI/IoC', 'array': 'Mảng', 'linked-list': 'Danh sách liên kết', 'design-patterns': 'Mẫu thiết kế', 'DataStructure': 'Cấu trúc dữ liệu', 'Algorithm': 'Thuật toán', 'Sorting': 'Sắp xếp', 'Patterns': 'Mẫu thiết kế', 'SystemDesign': 'Thiết kế hệ thống' }[t] || t),
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

// LS-020: store curriculum dùng state hoisted — test có thể nạp data thật
// (không mock curriculum:null cố định) và assert call args của fetchCurriculum.
const curriculumStoreState = vi.hoisted(() => ({
  curriculum: null as unknown,
  loading: false,
  saving: false,
  expanded: true,
  fetchCurriculum: vi.fn(),
  createModuleApi: vi.fn(),
  updateModuleApi: vi.fn(),
  deleteModuleApi: vi.fn(),
  createItemApi: vi.fn(),
  updateItemApi: vi.fn(),
  deleteItemApi: vi.fn(),
  getModule: vi.fn(() => null),
}));

vi.mock('@/stores/classroomCurriculum', () => ({
  useClassroomCurriculumStore: () => ({
    loading: curriculumStoreState.loading,
    saving: curriculumStoreState.saving,
    curriculum: curriculumStoreState.curriculum,
    isModuleExpanded: () => curriculumStoreState.expanded,
    toggleModuleExpanded: vi.fn(),
    fetchCurriculum: curriculumStoreState.fetchCurriculum,
    createModuleApi: curriculumStoreState.createModuleApi,
    updateModuleApi: curriculumStoreState.updateModuleApi,
    deleteModuleApi: curriculumStoreState.deleteModuleApi,
    createItemApi: curriculumStoreState.createItemApi,
    updateItemApi: curriculumStoreState.updateItemApi,
    deleteItemApi: curriculumStoreState.deleteItemApi,
    getModule: curriculumStoreState.getModule,
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
    routeState.route = { query: {}, params: {} };
    curriculumStoreState.curriculum = null;
    curriculumStoreState.loading = false;
    curriculumStoreState.saving = false;
    // TC-038: stub confirm/alert global để test xóa không văng native dialog.
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});
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
    vi.restoreAllMocks();
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

    // TC-035: assert URL + method + body deep-equal (không chỉ đếm POST calls).
    // contract: POST /api/v1/concepts/quiz/manage + payload {title, topic, questions[{text, options, correctIndex}]}.
    it('submits quiz form with exact URL, method and payload (TC-035)', async () => {
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

      const manageCalls = mockFetch.mock.calls.filter(
        (call) => typeof call[0] === 'string' && call[0].endsWith('/api/v1/concepts/quiz/manage') && call[1]?.method === 'POST'
      );
      expect(manageCalls).toHaveLength(1);
      const [url, init] = manageCalls[0] as [string, RequestInit];
      expect(url).toBe('http://localhost:5055/api/v1/concepts/quiz/manage');
      expect(init.method).toBe('POST');
      const body = JSON.parse(String(init.body)) as Record<string, unknown>;
      expect(body).toEqual({
        id: '',
        title: 'Test Quiz',
        topic: 'sorting',
        difficulty: 'medium',
        xpReward: 50,
        questions: [
          { id: 'custom-q1', text: 'What is sorting?', options: ['A', 'B', 'C', 'D'], correctIndex: 0, explanation: '' },
        ],
      });
    });

    it('double-submit: 2 lần bấm submit khi đang gửi chỉ tạo 1 POST (TC-038)', async () => {
      let resolveSlow: ((r: Response) => void) | undefined;
      mockFetch.mockImplementation(async (url: string, init?: RequestInit) => {
        if (init?.method === 'POST') {
          await new Promise<Response>((resolve) => { resolveSlow = resolve; });
          return { ok: true, json: async () => ({}) };
        }
        if (url.includes('/quiz/all')) return { ok: true, json: async () => [] };
        return { ok: true, json: async () => ({}) };
      });

      const w = await mountQuizTab();
      await w.find('.btn-toggle-form').trigger('click');
      await nextTick();

      await w.find('input[placeholder*="Cơ bản về danh sách liên kết"]').setValue('Slow Quiz');
      await w.find('.form-select').setValue('sorting');
      await w.findAll('input[placeholder*="Nội dung câu hỏi"]')[0].setValue('Q?');
      const optionInputs = w.findAll('.options-grid input[placeholder*="Đáp án"]');
      await optionInputs[0].setValue('A');
      await optionInputs[1].setValue('B');
      await optionInputs[2].setValue('C');
      await optionInputs[3].setValue('D');

      const firstClick = w.find('.btn-submit').trigger('click');
      const secondClick = w.find('.btn-submit').trigger('click');
      await nextTick();

      resolveSlow?.({ ok: true, json: async () => ({}) } as unknown as Response);
      await Promise.all([firstClick, secondClick]);
      await flushPromises();
      await nextTick();

      const postCalls = mockFetch.mock.calls.filter((call) => call[1]?.method === 'POST');
      expect(postCalls).toHaveLength(1);
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

  // ─── US-TEACH-005 (P2): Export Excel (TC-006t — import đã gỡ, đổi tên) ──
  // TC-005t: mọi URL analytics phải là /api/v1/classrooms/* (có segment v1)
  describe('US-TEACH-005 (P2): Export Excel', () => {
    it('renders "Xuất Excel" button when classroom is selected and data loaded', async () => {
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/api/v1/classrooms/mine')) {
          return { ok: true, json: async () => [{ id: 'c1', name: 'Class A' }] };
        }
        if (url.includes('/api/v1/classrooms/') && url.includes('/statistics')) {
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
        if (url.includes('/api/v1/classrooms/') && url.includes('/export-excel')) {
          return { ok: true, blob: async () => new Blob(['test']) };
        }
        return { ok: false, status: 404, json: async () => ({}) };
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

    it('clicking "Xuất Excel" fetches exact /api/v1/classrooms/{id}/export-excel (TC-005t)', async () => {
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/api/v1/classrooms/mine')) {
          return { ok: true, json: async () => [{ id: 'c1', name: 'Class A' }] };
        }
        if (url.includes('/api/v1/classrooms/') && url.includes('/statistics')) {
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
        if (url.includes('/api/v1/classrooms/') && url.includes('/export-excel')) {
          return { ok: true, blob: async () => new Blob(['test']) };
        }
        return { ok: false, status: 404, json: async () => ({}) };
      });

      const originalCreate = window.URL.createObjectURL;
      const originalRevoke = window.URL.revokeObjectURL;
      window.URL.createObjectURL = vi.fn(() => 'blob:mock') as unknown as typeof URL.createObjectURL;
      window.URL.revokeObjectURL = vi.fn() as unknown as typeof URL.revokeObjectURL;
      try {
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
        const [url] = exportCalls[0] as [string];
        expect(url).toBe('http://localhost:5055/api/v1/classrooms/c1/export-excel');
        expect(url).not.toContain('/api/Classroom');
      } finally {
        window.URL.createObjectURL = originalCreate;
        window.URL.revokeObjectURL = originalRevoke;
      }
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

    // TC-035: assert URL + method + body deep-equal cho PUT edit quiz.
    it('submits with PUT /api/v1/concepts/quiz/manage/{id} and full payload when editing (TC-035)', async () => {
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
        (call) => typeof call[0] === 'string' && call[0].endsWith('/api/v1/concepts/quiz/manage/q1') && call[1]?.method === 'PUT'
      );
      expect(putCalls).toHaveLength(1);
      const [url, init] = putCalls[0] as [string, RequestInit];
      expect(url).toBe('http://localhost:5055/api/v1/concepts/quiz/manage/q1');
      expect(init.method).toBe('PUT');
      const body = JSON.parse(String(init.body)) as Record<string, unknown>;
      expect(body).toEqual({
        id: 'q1',
        title: 'Sorting Basics',
        topic: 'sorting',
        difficulty: 'easy',
        xpReward: 50,
        questions: [
          { id: 'q1', text: 'What is bubble sort?', options: ['A', 'B', 'C', 'D'], correctIndex: 0, explanation: 'Explanation 1' },
          { id: 'q2', text: 'What is merge sort?', options: ['A', 'B', 'C', 'D'], correctIndex: 1, explanation: 'Explanation 2' },
        ],
      });
    });

    // TC-038/TC-018: xóa quiz qua ConfirmModal → confirm → DELETE manage/{id};
    // hủy → không fetch.
    it('delete quiz: ConfirmModal confirm → DELETE /api/v1/concepts/quiz/manage/{id}; cancel → không gọi (TC-018/TC-038)', async () => {
      const w = await mountQuizTab();
      await flushPromises();
      await nextTick();

      await w.find('.btn-action--delete').trigger('click');
      await nextTick();

      const modal = w.find('.modal-overlay');
      expect(modal.exists()).toBe(true);
      expect(modal.text()).toContain('Xóa bài trắc nghiệm');

      const confirmBtn = modal.findAll('button').find((b) => b.text().trim() === 'Xóa');
      expect(confirmBtn).toBeTruthy();
      await confirmBtn!.trigger('click');
      await flushPromises();
      await nextTick();

      const deleteCalls = mockFetch.mock.calls.filter((call) => call[1]?.method === 'DELETE');
      expect(deleteCalls).toHaveLength(1);
      const [url] = deleteCalls[0] as [string];
      expect(url).toBe('http://localhost:5055/api/v1/concepts/quiz/manage/q1');

      // Hủy: click Xóa lần nữa → bấm nút "Hủy" trong modal → không gọi DELETE.
      mockFetch.mockClear();
      await w.find('.btn-action--delete').trigger('click');
      await nextTick();
      const cancelBtn = w.find('.modal-overlay').findAll('button').find((b) => b.text().trim() === 'Hủy');
      await cancelBtn!.trigger('click');
      await nextTick();
      await flushPromises();
      expect(mockFetch.mock.calls.some((call) => call[1]?.method === 'DELETE')).toBe(false);
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

    it('reads classroomId từ route query param và gọi fetchCurriculum(classroomId, teacherId) (LS-020)', async () => {
      routeState.route = { query: { classroomId: 'room-123' }, params: {} };

      const w = await mountTeacherPanel();
      await flushPromises();
      await nextTick();

      expect(w.text()).toContain('Quản lý Chương trình học (Curriculum)');
      expect(curriculumStoreState.fetchCurriculum).toHaveBeenCalled();
      const [classroomId, teacherId] = curriculumStoreState.fetchCurriculum.mock.calls[0] as [string, string];
      expect(classroomId).toBe('room-123');
      expect(teacherId).toBe('teacher-001');
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

    it('renders non-empty branch khi store có modules (LS-020 — không mock null cố định)', async () => {
      curriculumStoreState.curriculum = {
        classroomId: 'room-123',
        classroomName: 'Lớp 12A1',
        modules: [
          {
            id: 'mod-1',
            classroomId: 'room-123',
            title: 'Module Khởi Tạo',
            description: 'Mô tả module',
            orderIndex: 1,
            isHidden: false,
            unlockAt: null,
            items: [],
          },
        ],
      };
      const w = await mountCurriculumTab();

      expect(w.text()).toContain('Module Khởi Tạo');
      expect(w.text()).not.toContain('Chưa có Module nào');
      expect(w.text()).toContain('0 bài');
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

    // TC-005t: analytics phải dùng /api/v1/classrooms (URL cũ /api/Classroom 404).
    it('loads classrooms via GET /api/v1/classrooms/mine (TC-005t)', async () => {
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/api/v1/classrooms/mine')) {
          return { ok: true, json: async () => [{ id: 'c1', name: 'Class A' }] };
        }
        if (url.includes('/api/v1/classrooms/') && url.includes('/statistics')) {
          return { ok: true, json: async () => ({
            totalStudents: 25, avgScore: 75.5, passRate: 80.0, completionRate: 0.65,
            quizTitles: { q1: 'Sorting Quiz' }, codelabTitles: {}, studentScores: [],
          }) };
        }
        return { ok: false, status: 404, json: async () => ({}) };
      });

      const w = await mountAnalyticsTab();
      await flushPromises();
      await nextTick();

      const mineCall = mockFetch.mock.calls.find((call) => String(call[0]).includes('classrooms/mine'));
      expect(mineCall).toBeTruthy();
      expect(String(mineCall![0])).toBe('http://localhost:5055/api/v1/classrooms/mine');
      expect(String(mineCall![0])).not.toContain('/api/Classroom');
    });

    it('renders metric cards when classroom is selected + completionRate ×100 (TC-007t)', async () => {
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/api/v1/classrooms/mine')) {
          return { ok: true, json: async () => [{ id: 'c1', name: 'Class A' }] };
        }
        if (url.includes('/api/v1/classrooms/') && url.includes('/statistics')) {
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
        return { ok: false, status: 404, json: async () => ({}) };
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

      // TC-007t: completionRate mock 0.65 (thang 0-1) → UI phải ×100 → "65.0%".
      expect(w.text()).toContain('65.0%');

      const statsCall = mockFetch.mock.calls.find((call) => String(call[0]).includes('/statistics'));
      expect(String(statsCall![0])).toBe('http://localhost:5055/api/v1/classrooms/c1/statistics');
    });

    it('renders student scores table when data is available', async () => {
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/api/v1/classrooms/mine')) {
          return { ok: true, json: async () => [{ id: 'c1', name: 'Class A' }] };
        }
        if (url.includes('/api/v1/classrooms/') && url.includes('/statistics')) {
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
        return { ok: false, status: 404, json: async () => ({}) };
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

      expect(w.text()).toContain('Chưa có học viên nào trong hệ thống');
    });

    // TC-038: Student role bị backend từ chối (403) → tab hiện empty state, không crash.
    it('handles 403 from users endpoint gracefully (empty state, no crash) (TC-038)', async () => {
      mockFetch.mockImplementation(async () => ({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => ({ message: 'Forbidden' }),
      }));

      const w = await mountStudentTab();
      await flushPromises();
      await nextTick();

      expect(w.text()).toContain('Chưa có học viên nào trong hệ thống');
    });

    // TC-037: click "Xem chi tiết" → 2 fetch đúng contract
    // (/concepts/courses?userId= + /concepts/quiz/history?userId=) + render attempts/passed.
    it('opens student detail modal with 2 contract fetches and renders attempts (TC-037)', async () => {
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/admin/users') || url.includes('/concepts/admin/users')) {
          return { ok: true, json: async () => ({ users: mockStudents, total: 2 }) };
        }
        if (url.includes('/api/v1/concepts/courses?userId=s1')) {
          return { ok: true, json: async () => [
            { id: 'c1', title: 'Sorting Course', progressPercent: 40, difficulty: 'Trung bình', completedLessons: 2, totalLessons: 5 },
          ] };
        }
        if (url.includes('/api/v1/concepts/quiz/history?userId=s1')) {
          return { ok: true, json: async () => [
            { id: 'a1', quizTitle: 'Sorting Basics', attemptedAt: '2024-07-01T10:00:00Z', score: 8, maxScore: 10, passed: true },
            { id: 'a2', quizTitle: 'Graph Theory', attemptedAt: '2024-07-02T10:00:00Z', score: 3, maxScore: 10, passed: false },
          ] };
        }
        return { ok: true, json: async () => ({}) };
      });

      const w = await mountStudentTab();
      await flushPromises();
      await nextTick();

      const detailBtn = w.findAll('button').find((b) => b.text().includes('Xem chi tiết'));
      expect(detailBtn).toBeTruthy();
      await detailBtn!.trigger('click');
      await flushPromises();
      await nextTick();

      const courseCall = mockFetch.mock.calls.find((call) => String(call[0]).includes('/api/v1/concepts/courses?userId=s1'));
      const historyCall = mockFetch.mock.calls.find((call) => String(call[0]).includes('/api/v1/concepts/quiz/history?userId=s1'));
      expect(courseCall).toBeTruthy();
      expect(historyCall).toBeTruthy();
      expect(String(courseCall![0])).toBe('http://localhost:5055/api/v1/concepts/courses?userId=s1');
      expect(String(historyCall![0])).toBe('http://localhost:5055/api/v1/concepts/quiz/history?userId=s1');

      expect(w.text()).toContain('Chi tiết tiến trình: alice');
      expect(w.text()).toContain('Sorting Course');
      expect(w.text()).toContain('Sorting Basics');
      expect(w.text()).toContain('Graph Theory');
      expect(w.text()).toContain('8 / 10');
      expect(w.text()).toContain('ĐẠT');
      expect(w.text()).toContain('HỎNG');
    });

    // TC-037: debounce tìm kiếm 400ms (fake timers) trước khi gọi loadStudents.
    it('debounces search input 400ms before refetching students (TC-037)', async () => {
      vi.useFakeTimers();
      try {
        const w = await mountStudentTab();
        await flushPromises();
        await nextTick();

        mockFetch.mockClear();
        const searchInput = w.find('input[placeholder*="Tìm theo email"]');
        await searchInput.setValue('ali');
        await nextTick();

        const hasSearchCall = () => mockFetch.mock.calls.some((call) => String(call[0]).includes('search='));
        expect(hasSearchCall()).toBe(false);

        await vi.advanceTimersByTimeAsync(399);
        expect(hasSearchCall()).toBe(false);

        await vi.advanceTimersByTimeAsync(1);
        const searchCall = mockFetch.mock.calls.find((call) => String(call[0]).includes('search='));
        expect(searchCall).toBeTruthy();
        expect(String(searchCall![0])).toBe('http://localhost:5055/api/v1/concepts/admin/users?page=1&pageSize=10&search=ali');
      } finally {
        vi.useRealTimers();
      }
    });

    // TC-037: pagination — "Sau" gọi loadStudents với page=2.
    it('paginates: clicking "Sau" refetches with page=2 (TC-037)', async () => {
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/admin/users') || url.includes('/concepts/admin/users')) {
          const page = new URL(String(url)).searchParams.get('page') ?? '1';
          if (page === '2') {
            return { ok: true, json: async () => ({ users: [mockStudents[0]], total: 15 }) };
          }
          return { ok: true, json: async () => ({ users: mockStudents, total: 15 }) };
        }
        return { ok: true, json: async () => ({}) };
      });

      const w = await mountStudentTab();
      await flushPromises();
      await nextTick();

      const nextBtn = w.findAll('button').find((b) => b.text().trim() === 'Sau');
      expect(nextBtn).toBeTruthy();
      await nextBtn!.trigger('click');
      await flushPromises();
      await nextTick();

      const page2Call = mockFetch.mock.calls.find((call) => String(call[0]).includes('page=2'));
      expect(page2Call).toBeTruthy();
      expect(String(page2Call![0])).toContain('/api/v1/concepts/admin/users?page=2&pageSize=10');
    });
  });
});
