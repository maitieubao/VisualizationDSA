// @vitest-environment jsdom
// LS-019 (P1): CONTRACT SPEC — ModuleItemRow + ItemFormModal + OverrideSettingsModal.
//  - displayTitle fallback (CustomLesson — LS-030), type badge, prerequisite index
//  - emit edit/delete/toggle/duplicate/override-settings/drop
//  - ItemFormModal: linkedContentOptions nạp thật (LS-005), prerequisite không chứa item đang edit (LS-032)
//  - OverrideSettingsModal: emit field `isHidden` đúng contract (LS-016)
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import BaseIcon from '../../../shared/components/BaseIcon.vue';
import ModuleItemRow from '../components/ModuleItemRow.vue';
import TeacherClassroomCurriculumTab from '../TeacherClassroomCurriculumTab.vue';

// ── Mocks dùng chung cho phần integration tab ──
const storeState = vi.hoisted(() => ({
  curriculum: null as Record<string, unknown> | null,
  allItems: [] as Record<string, unknown>[],
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
  reorderItems: vi.fn(),
  reorderItemsApi: vi.fn(),
  reorderModulesApi: vi.fn(),
  moveItemToModule: vi.fn(),
  getModule: vi.fn<(moduleId: string) => Record<string, unknown> | null>(() => null),
}));

const routeState = vi.hoisted(() => ({
  route: { query: {}, params: { id: 'room-123' } },
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

vi.mock('@/stores/classroomCurriculum', () => ({
  useClassroomCurriculumStore: () => ({
    loading: storeState.loading,
    saving: storeState.saving,
    curriculum: storeState.curriculum,
    error: null,
    isModuleExpanded: () => storeState.expanded,
    toggleModuleExpanded: vi.fn(),
    fetchCurriculum: storeState.fetchCurriculum,
    createModuleApi: storeState.createModuleApi,
    updateModuleApi: storeState.updateModuleApi,
    deleteModuleApi: storeState.deleteModuleApi,
    createItemApi: storeState.createItemApi,
    updateItemApi: storeState.updateItemApi,
    deleteItemApi: storeState.deleteItemApi,
    reorderItems: storeState.reorderItems,
    reorderItemsApi: storeState.reorderItemsApi,
    reorderModulesApi: storeState.reorderModulesApi,
    moveItemToModule: storeState.moveItemToModule,
    allItems: storeState.allItems,
    getModule: storeState.getModule,
  }),
}));

function setMockCurriculum(modules: Record<string, unknown>[]): void {
  storeState.curriculum = {
    classroomId: 'room-123',
    classroomName: 'Lớp A',
    modules,
  };
  storeState.allItems = modules.flatMap((m) => (m.items as Record<string, unknown>[]) ?? []);
  storeState.getModule = vi.fn<(moduleId: string) => Record<string, unknown> | null>(
    (moduleId) => {
      const modules = storeState.curriculum?.modules as Record<string, unknown>[] | undefined;
      return modules?.find((m) => m.id === moduleId) ?? null;
    },
  );
}

function makeItem(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'i1',
    moduleId: 'm1',
    itemType: 'Lesson',
    overrideTitle: 'Bài học 1',
    overrideDescription: '',
    orderIndex: 1,
    isRequired: true,
    isHidden: false,
    unlockAt: null,
    dueAt: null,
    maxAttempts: null,
    isSequential: false,
    prerequisiteItemId: null,
    lessonId: 'lesson-1',
    quizId: null,
    codelabId: null,
    lessonTitle: 'Lesson 1',
    quizTitle: null,
    codelabTitle: null,
    ...overrides,
  };
}

function makeModule(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'm1',
    classroomId: 'room-123',
    title: 'Module 1',
    description: 'Mô tả',
    orderIndex: 1,
    isHidden: false,
    unlockAt: null,
    items: [makeItem()],
    ...overrides,
  };
}

let wrapper: VueWrapper | null = null;

// TC-039: theo dõi MỌI wrapper đã mount → unmount từng cái trong afterEach.
// Trước đây chỉ unmount `wrapper` cuối cùng → 4 DOM node rò rỉ giữa các test.
const mountedWrappers: VueWrapper[] = [];

describe('ModuleItemRow — Unit (LS-019)', () => {
  afterEach(() => {
    mountedWrappers.splice(0).forEach((w) => w.unmount());
    wrapper = null;
  });

  function mountRow(item: Record<string, unknown>, module: Record<string, unknown>, index = 0) {
    wrapper = mount(ModuleItemRow, {
      attachTo: document.body,
      global: { components: { BaseIcon } },
      props: { item, module, index, isDragging: false, isDragOver: false },
    });
    mountedWrappers.push(wrapper);
    return wrapper;
  }

  it('displayTitle: ưu tiên overrideTitle → lessonTitle → quizTitle → codelabTitle → customLessonTitle → Untitled (LS-030)', () => {
    const w = mountRow(
      makeItem({ itemType: 'CustomLesson', overrideTitle: 'Bài tự soạn', lessonTitle: 'Lesson gốc' }),
      makeModule()
    );
    expect(w.find('.item-title').text()).toBe('Bài tự soạn');

    const w2 = mountRow(
      makeItem({ itemType: 'Lesson', overrideTitle: '', lessonTitle: 'Lesson gốc' }),
      makeModule()
    );
    expect(w2.find('.item-title').text()).toBe('Lesson gốc');

    const w3 = mountRow(
      makeItem({ itemType: 'CustomLesson', overrideTitle: '', lessonTitle: '', quizTitle: '', codelabTitle: '', customLessonTitle: 'Bài tự soạn gốc' }),
      makeModule()
    );
    expect(w3.find('.item-title').text()).toBe('Bài tự soạn gốc');

    const w4 = mountRow(
      makeItem({ itemType: 'Lesson', overrideTitle: '', lessonTitle: '', quizTitle: '', codelabTitle: '' }),
      makeModule()
    );
    expect(w4.find('.item-title').text()).toBe('Untitled');
  });

  it('type badge: nhãn tiếng Việt + class đúng loại (Lesson/Quiz/Codelab/CustomLesson — LS-030)', () => {
    const w = mountRow(makeItem({ itemType: 'Lesson' }), makeModule());
    expect(w.find('.type-badge').classes()).toContain('badge-lesson');
    expect(w.find('.type-badge').text()).toBe('Bài học');
    wrapper?.unmount();

    const w2 = mountRow(makeItem({ id: 'q1', itemType: 'Quiz', quizTitle: 'Quiz 1' }), makeModule());
    expect(w2.find('.type-badge').classes()).toContain('badge-quiz');
    expect(w2.find('.type-badge').text()).toBe('Trắc nghiệm');
    wrapper?.unmount();

    const w3 = mountRow(makeItem({ id: 'c1', itemType: 'Codelab', codelabTitle: 'Lab 1' }), makeModule());
    expect(w3.find('.type-badge').classes()).toContain('badge-codelab');
    expect(w3.find('.type-badge').text()).toBe('Codelab');
    wrapper?.unmount();

    const w4 = mountRow(makeItem({ id: 'cl1', itemType: 'CustomLesson', overrideTitle: 'Bài tự soạn' }), makeModule());
    expect(w4.find('.type-badge').classes()).toContain('badge-custom-lesson');
    expect(w4.find('.type-badge').text()).toBe('Tự soạn');
  });

  it('prerequisite indicator: hiển thị "sau #N" theo index trong module', () => {
    const module = makeModule({
      items: [
        makeItem({ id: 'i1', orderIndex: 1 }),
        makeItem({ id: 'i2', orderIndex: 2, overrideTitle: 'Bài 2' }),
        makeItem({ id: 'i3', orderIndex: 3, overrideTitle: 'Bài 3' }),
      ],
    });
    const w = mountRow(
      makeItem({ id: 'i3', overrideTitle: 'Bài 3', isSequential: true, prerequisiteItemId: 'i2' }),
      module,
      2
    );
    expect(w.text()).toContain('sau #2');
  });

  it('emit edit/delete/duplicate/toggle-hidden/toggle-required/override-settings với item', async () => {
    const item = makeItem();
    const w = mountRow(item, makeModule());

    await w.find('[title="Chỉnh sửa"]').trigger('click');
    expect(w.emitted('edit')?.[0]).toEqual([item]);

    await w.find('[title="Xóa"]').trigger('click');
    expect(w.emitted('delete')?.[0]).toEqual([item]);

    await w.find('[title="Nhân bản"]').trigger('click');
    expect(w.emitted('duplicate')?.[0]).toEqual([item]);

    await w.find('[title="Ẩn khỏi học viên"]').trigger('click');
    expect(w.emitted('toggle-hidden')?.[0]).toEqual([item]);

    await w.find('[title="Đặt là tùy chọn"]').trigger('click');
    expect(w.emitted('toggle-required')?.[0]).toEqual([item]);

    await w.find('[title="Cài đặt nâng cao"]').trigger('click');
    expect(w.emitted('override-settings')?.[0]).toEqual([item]);
  });

  it('duplicate bị disable với CustomLesson (LS-013 guard)', async () => {
    const w = mountRow(makeItem({ itemType: 'CustomLesson' }), makeModule());
    const dupBtn = w.find('[title="Chưa hỗ trợ nhân bản bài tự soạn"]');
    expect(dupBtn.exists()).toBe(true);
    expect(dupBtn.attributes('disabled')).toBeDefined();
  });

  it('drag events: drag-start emit (item, module) từ handle; drop emit {draggedId, targetId}', async () => {
    const item = makeItem({ id: 'i1' });
    const module = makeModule();
    const w = mountRow(item, module);
    const setData = vi.fn();

    const handle = w.find('.drag-handle');
    await handle.trigger('dragstart', {
      dataTransfer: { setData, effectAllowed: '' },
    });
    expect(w.emitted('drag-start')?.[0]).toEqual([expect.objectContaining({ id: 'i1' }), module]);

    await w.trigger('drop', {
      dataTransfer: { getData: vi.fn(() => 'i2') },
    });
    expect(w.emitted('drop')?.[0]).toEqual([{ draggedId: 'i2', targetId: 'i1' }]);
  });

  it('drop cùng item (drag chính mình) → không emit', async () => {
    const w = mountRow(makeItem({ id: 'i1' }), makeModule());
    await w.trigger('drop', {
      dataTransfer: { getData: vi.fn(() => 'i1') },
    });
    expect(w.emitted('drop')).toBeUndefined();
  });
});

// ════════════════════════════════════════════════════════════════
// Integration: modals qua TeacherClassroomCurriculumTab (LS-005/032/016)
// ════════════════════════════════════════════════════════════════
describe('TeacherClassroomCurriculumTab — modals contract (LS-019)', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
    storeState.curriculum = null;
    storeState.allItems = [];
    storeState.loading = false;
    storeState.saving = false;
    routeState.route = { query: {}, params: { id: 'room-123' } };

    fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      const u = String(url);
      // LS-005: ItemFormModal nạp thật — GET courses → detail course → lessons.
      if (u.includes('/api/v1/concepts/courses/course-1')) {
        return { ok: true, status: 200, json: async () => ({ lessons: [{ id: 'lesson-1', title: 'Lesson A', sandboxType: 'sorting' }] }) };
      }
      if (u.includes('/api/v1/concepts/courses')) {
        return { ok: true, status: 200, json: async () => [{ id: 'course-1', title: 'Course 1', isPublished: true, isDeleted: false }] };
      }
      if (u.includes('/api/v1/quizzes')) {
        return { ok: true, status: 200, json: async () => ({ quizzes: [{ id: 'quiz-1', title: 'Quiz A' }] }) };
      }
      if (u.includes('/api/v1/codelabs')) {
        return { ok: true, status: 200, json: async () => [{ id: 'codelab-1', title: 'Codelab A' }] };
      }
      return { ok: true, status: 200, json: async () => [] };
    });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    vi.unstubAllGlobals();
  });

  async function mountTab(): Promise<VueWrapper> {
    wrapper = mount(TeacherClassroomCurriculumTab, {
      attachTo: document.body,
      global: {
        components: { BaseIcon },
        stubs: {
          RouterLink: { template: '<a class="rl-stub"><slot /></a>' },
          DndContext: { template: '<div><slot /></div>' },
          SortableContextWrapper: { template: '<div><slot /></div>' },
          ModuleFormModal: { template: '<div></div>' },
          ImportCourseModal: { template: '<div></div>' },
          ConfirmModal: { template: '<div></div>' },
          CustomMarkdownEditor: { template: '<textarea class="md-stub"></textarea>' },
        },
      },
    });
    await flushPromises();
    await nextTick();
    return wrapper;
  }

  it('ItemFormModal: linkedContentOptions nạp thật từ nguồn dữ liệu → chọn được + submit gọi createItemApi (LS-005)', async () => {
    setMockCurriculum([makeModule({ items: [] })]);
    const w = await mountTab();
    await w.find('.btn-add-item').trigger('click');
    await flushPromises();
    await nextTick();

    // Select linked content (Lesson default) phải có option từ dữ liệu thật.
    const linkedSelect = w.find('.linked-content-selector select');
    expect(linkedSelect.exists()).toBe(true);
    const options = linkedSelect.findAll('option');
    const optionValues = options.map(o => o.attributes('value'));
    expect(optionValues).toContain('lesson-1');
    expect(w.text()).toContain('Lesson A');

    await linkedSelect.setValue('lesson-1');
    const titleInput = w.find('input[placeholder="Để trống để dùng tiêu đề gốc"]');
    await titleInput.setValue('Bài tùy chỉnh cho lớp');
    await nextTick();

    const submitBtn = w.findAll('button').find(b => b.text().includes('Tạo Bài học'));
    expect(submitBtn?.attributes('disabled')).toBeUndefined();
    await submitBtn!.trigger('click');
    await flushPromises();
    await nextTick();

    expect(storeState.createItemApi).toHaveBeenCalledWith(
      'm1',
      expect.objectContaining({
        itemType: 'Lesson',
        lessonId: 'lesson-1',
        overrideTitle: 'Bài tùy chỉnh cho lớp',
      })
    );
  });

  it('ItemFormModal: edit item → prerequisite select KHÔNG chứa item đang edit (LS-032)', async () => {
    setMockCurriculum([makeModule({
      items: [
        makeItem({ id: 'i1', overrideTitle: 'Bài 1' }),
        makeItem({ id: 'i2', overrideTitle: 'Bài 2' }),
        makeItem({ id: 'i3', overrideTitle: 'Bài 3' }),
      ],
    })]);
    const w = await mountTab();

    const editBtn = w.find('[title="Chỉnh sửa"]');
    await editBtn.trigger('click');
    await flushPromises();
    await nextTick();

    const selects = w.findAll('select');
    expect(selects.length).toBeGreaterThanOrEqual(2);
    const prerequisiteSelect = selects[1];
    const values = prerequisiteSelect.findAll('option').map(o => o.attributes('value'));
    expect(values).toContain('i2');
    expect(values).toContain('i3');
    expect(values).not.toContain('i1');
  });

  it('OverrideSettingsModal: toggle "Ẩn khỏi học viên" → save payload có isHidden đúng (LS-016)', async () => {
    setMockCurriculum([makeModule({
      items: [
        makeItem({ id: 'i1', overrideTitle: 'Bài 1', isHidden: false }),
        makeItem({ id: 'i2', overrideTitle: 'Bài 2' }),
      ],
    })]);
    const w = await mountTab();

    await w.find('[title="Cài đặt nâng cao"]').trigger('click');
    await flushPromises();
    await nextTick();

    const hiddenLabel = w.findAll('label').find(l => l.text().includes('Ẩn khỏi học viên'));
    expect(hiddenLabel).toBeTruthy();
    const checkbox = hiddenLabel!.find('input[type="checkbox"]');
    expect(checkbox.exists()).toBe(true);
    await checkbox.setValue(true);
    await nextTick();

    const saveBtn = w.findAll('button').find(b => b.text().includes('Lưu cài đặt'));
    await saveBtn!.trigger('click');
    await flushPromises();
    await nextTick();

    expect(storeState.updateItemApi).toHaveBeenCalledWith(
      'm1',
      'i1',
      expect.objectContaining({ isHidden: true })
    );
    const payload = storeState.updateItemApi.mock.calls[0][2] as Record<string, unknown>;
    // Contract mới: override dùng field `isHidden` — không được gửi nhầm `isHiddenForStudent`.
    expect('isHiddenForStudent' in payload).toBe(false);
  });

  it('LS-003t: drop bài lên bài khác → reorderItemsApi gọi với body {teacherId, itemOrders}', async () => {
    setMockCurriculum([makeModule({
      items: [
        makeItem({ id: 'i1', overrideTitle: 'Bài 1' }),
        makeItem({ id: 'i2', overrideTitle: 'Bài 2' }),
      ],
    })]);
    const w = await mountTab();

    // Kéo i2 thả lên i1 → thứ tự mới [i2, i1].
    const rows = w.findAllComponents(ModuleItemRow);
    expect(rows.length).toBe(2);
    await rows[0].vm.$emit('drop', { draggedId: 'i2', targetId: 'i1' });
    await flushPromises();
    await nextTick();

    expect(storeState.reorderItemsApi).toHaveBeenCalledTimes(1);
    const [moduleId, teacherId, itemOrders] = storeState.reorderItemsApi.mock.calls[0] as [string, string, { itemId: string; orderIndex: number }[]];
    expect(moduleId).toBe('m1');
    expect(teacherId).toBe('teacher-001');
    expect(itemOrders).toEqual([
      { itemId: 'i2', orderIndex: 0 },
      { itemId: 'i1', orderIndex: 1 },
    ]);
  });

  it('LS-026: phím mũi tên trên handle → move → reorderItemsApi (keyboard reorder)', async () => {
    setMockCurriculum([makeModule({
      items: [
        makeItem({ id: 'i1', overrideTitle: 'Bài 1' }),
        makeItem({ id: 'i2', overrideTitle: 'Bài 2' }),
      ],
    })]);
    const w = await mountTab();

    const rows = w.findAllComponents(ModuleItemRow);
    await rows[0].vm.$emit('move', { id: 'i1' }, 1);
    await flushPromises();
    await nextTick();

    expect(storeState.reorderItemsApi).toHaveBeenCalledWith(
      'm1',
      'teacher-001',
      [
        { itemId: 'i2', orderIndex: 0 },
        { itemId: 'i1', orderIndex: 1 },
      ]
    );
  });
});
