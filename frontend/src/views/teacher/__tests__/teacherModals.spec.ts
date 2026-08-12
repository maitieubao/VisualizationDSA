// @vitest-environment jsdom
// TC-039 (P2): SPEC RIÊNG cho ModuleFormModal + ImportCourseModal + ConfirmModal
// (thay vì giữ stub cứng trong teacherP2/moduleItemRow — coverage modal = 0 trước đây).
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import BaseIcon from '../../../shared/components/BaseIcon.vue';
import ModuleFormModal from '../components/ModuleFormModal.vue';
import ImportCourseModal from '../components/ImportCourseModal.vue';
import ConfirmModal from '../../../components/ui/ConfirmModal.vue';

interface FetchCall {
  url: string;
  init?: RequestInit;
}

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return { ok, status, statusText: ok ? 'OK' : 'Error', json: async () => body } as unknown as Response;
}

function parseBody(init: RequestInit | undefined): Record<string, unknown> {
  return JSON.parse(String(init?.body)) as Record<string, unknown>;
}

function getCalls(fetchMock: ReturnType<typeof vi.fn>): FetchCall[] {
  return (fetchMock.mock.calls as [string, RequestInit?][]).map(([url, init]) => ({ url, init }));
}

const BASE_URL = 'http://localhost:5055';

let wrapper: VueWrapper | null = null;
let fetchMock: ReturnType<typeof vi.fn>;

describe('ModuleFormModal — Contract (TC-039)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
  });

  it('create: submit emit save {title, description, orderIndex, unlockAt, isHidden} (TC-039)', async () => {
    wrapper = mount(ModuleFormModal, {
      attachTo: document.body,
      global: { components: { BaseIcon } },
      props: { show: true, editingModule: null },
    });
    await nextTick();

    await wrapper.find('input[type="text"]').setValue('Module A');
    await wrapper.find('textarea').setValue('Mô tả module');
    await wrapper.find('.btn-primary').trigger('click');
    await nextTick();

    expect(wrapper.emitted('save')).toHaveLength(1);
    expect(wrapper.emitted('save')![0]).toEqual([
      { title: 'Module A', description: 'Mô tả module', orderIndex: 1, unlockAt: '', isHidden: false },
    ]);
  });

  it('edit: prefill từ editingModule + save emit giá trị đã sửa (TC-039)', async () => {
    wrapper = mount(ModuleFormModal, {
      attachTo: document.body,
      global: { components: { BaseIcon } },
      props: {
        show: false,
        editingModule: { title: 'Module Cũ', description: 'Desc cũ', orderIndex: 3, isHidden: true },
      },
    });
    // Watch(props.show) chỉ chạy khi show THAY ĐỔI — mount show:false → setProps true.
    await wrapper.setProps({ show: true });
    await nextTick();

    const titleInput = wrapper.find('input[type="text"]');
    expect((titleInput.element as HTMLInputElement).value).toBe('Module Cũ');
    const hiddenCheckbox = wrapper.find('input[type="checkbox"]');
    expect((hiddenCheckbox.element as HTMLInputElement).checked).toBe(true);

    await titleInput.setValue('Module Mới');
    await wrapper.find('.btn-primary').trigger('click');
    await nextTick();

    expect(wrapper.emitted('save')![0]).toEqual([
      { title: 'Module Mới', description: 'Desc cũ', orderIndex: 3, unlockAt: '', isHidden: true },
    ]);
  });

  it('title trống → không emit save (TC-039)', async () => {
    wrapper = mount(ModuleFormModal, {
      attachTo: document.body,
      global: { components: { BaseIcon } },
      props: { show: true, editingModule: null },
    });
    await nextTick();

    await wrapper.find('.btn-primary').trigger('click');
    await nextTick();

    expect(wrapper.emitted('save')).toBeUndefined();
  });
});

describe('ImportCourseModal — Contract (TC-039)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('accessToken', 'teacher-token');
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    fetchMock = vi.fn(async (url: string) => {
      if (url.includes('/api/v1/concepts/courses/') && !url.includes('/import-course')) {
        return jsonResponse({ modules: [
          { id: 'm1', title: 'Module 1', isDeleted: false, items: [{ itemType: 'Lesson', isDeleted: false }] },
        ] });
      }
      if (url.includes('/api/v1/concepts/courses')) {
        return jsonResponse([
          { id: 'course-1', title: 'Sorting Course', category: 'Sorting', difficulty: 'Beginner', isPublished: true, isDeleted: false, totalLessons: 3 },
          { id: 'course-2', title: 'Draft Course', category: 'Other', difficulty: 'Beginner', isPublished: false, isDeleted: false, totalLessons: 0 },
        ]);
      }
      return jsonResponse({});
    });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('show → GET /api/v1/concepts/courses + chỉ render course published (TC-039)', async () => {
    wrapper = mount(ImportCourseModal, {
      attachTo: document.body,
      global: { components: { BaseIcon } },
      props: { show: false, classroomId: 'room-123' },
    });
    // Watch(props.show) chỉ chạy khi show THAY ĐỔI — mount show:false → setProps true.
    await wrapper.setProps({ show: true });
    await flushPromises();
    await nextTick();

    const calls = getCalls(fetchMock);
    const loadCall = calls.find((c) => c.url.endsWith('/api/v1/concepts/courses'));
    expect(loadCall).toBeTruthy();
    expect(String(loadCall!.url)).toBe(`${BASE_URL}/api/v1/concepts/courses`);

    expect(wrapper.text()).toContain('Sorting Course');
    expect(wrapper.text()).not.toContain('Draft Course');
  });

  it('import: chọn course → chọn module → POST /api/v1/classrooms/{id}/import-course body đúng + emit imported (TC-039)', async () => {
    wrapper = mount(ImportCourseModal, {
      attachTo: document.body,
      global: { components: { BaseIcon } },
      props: { show: false, classroomId: 'room-123' },
    });
    await wrapper.setProps({ show: true });
    await flushPromises();
    await nextTick();

    const courseSelect = wrapper.find('select');
    await courseSelect.setValue('course-1');
    await courseSelect.trigger('change');
    await flushPromises();
    await nextTick();
    // Step 1: preview course đã chọn.
    expect(wrapper.text()).toContain('Sorting Course');

    // Step 1 → 2: danh sách module hiện ra.
    await wrapper.find('.import-step .btn-primary').trigger('click');
    await nextTick();
    expect(wrapper.text()).toContain('Module 1');

    // Step 2 → 3 (module đã được chọn tự động khi vào step 2).
    await wrapper.find('.import-step .btn-primary').trigger('click');
    await nextTick();

    await wrapper.find('.import-step .btn-danger').trigger('click');
    await flushPromises();
    await nextTick();

    const calls = getCalls(fetchMock);
    const importCall = calls.find((c) => c.url.includes('/import-course'));
    expect(importCall).toBeTruthy();
    expect(String(importCall!.url)).toBe(`${BASE_URL}/api/v1/classrooms/room-123/import-course`);
    expect(importCall!.init?.method).toBe('POST');
    expect(parseBody(importCall!.init)).toEqual({
      courseId: 'course-1',
      includeAllModules: true,
      overrideExisting: false,
    });
    expect(wrapper.emitted('imported')).toHaveLength(1);
  });
});

describe('ConfirmModal — Contract (TC-039)', () => {
  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
  });

  it('render title/message/details + confirmText/cancelText (TC-039)', async () => {
    wrapper = mount(ConfirmModal, {
      attachTo: document.body,
      global: { components: { BaseIcon } },
      props: {
        show: true,
        title: 'Xóa Quiz',
        message: 'Hành động này không thể hoàn tác.',
        details: 'Quiz: Sorting Basics',
        confirmText: 'Xóa',
        cancelText: 'Hủy',
        variant: 'danger',
      },
    });
    await nextTick();

    expect(wrapper.text()).toContain('Xóa Quiz');
    expect(wrapper.text()).toContain('Hành động này không thể hoàn tác.');
    expect(wrapper.text()).toContain('Quiz: Sorting Basics');
    expect(wrapper.text()).toContain('Xóa');
    expect(wrapper.text()).toContain('Hủy');
  });

  it('click nút confirm → emit confirm (TC-039)', async () => {
    wrapper = mount(ConfirmModal, {
      attachTo: document.body,
      global: { components: { BaseIcon } },
      props: { show: true, title: 'Xóa', message: 'Chắc chưa?', confirmText: 'Xóa' },
    });
    await nextTick();

    const confirmBtn = wrapper.find('.modal-footer .btn-primary');
    await confirmBtn.trigger('click');

    expect(wrapper.emitted('confirm')).toHaveLength(1);
  });

  it('click nút cancel → emit update:show false (TC-039)', async () => {
    wrapper = mount(ConfirmModal, {
      attachTo: document.body,
      global: { components: { BaseIcon } },
      props: { show: true, title: 'Xóa', message: 'Chắc chưa?', cancelText: 'Hủy' },
    });
    await nextTick();

    const cancelBtn = wrapper.find('.modal-footer .btn-secondary');
    await cancelBtn.trigger('click');

    expect(wrapper.emitted('update:show')![0]).toEqual([false]);
  });

  it('CU-027: variant danger → class btn-danger trên nút confirm', async () => {
    wrapper = mount(ConfirmModal, {
      attachTo: document.body,
      global: { components: { BaseIcon } },
      props: { show: true, title: 'Xóa Quiz', message: 'Chắc chưa?', variant: 'danger' },
    });
    await nextTick();

    expect(wrapper.find('.modal-footer .btn-primary').classes()).toContain('btn-danger');
  });

  it('CU-027: variant warning → class btn-warning trên nút confirm', async () => {
    wrapper = mount(ConfirmModal, {
      attachTo: document.body,
      global: { components: { BaseIcon } },
      props: { show: true, title: 'Cảnh báo', message: 'Chắc chưa?', variant: 'warning' },
    });
    await nextTick();

    expect(wrapper.find('.modal-footer .btn-primary').classes()).toContain('btn-warning');
  });

  it('CU-018/CU-027: loading — spinner + cả 2 nút disabled khi parent handler async chưa xong', async () => {
    let resolveConfirm: (() => void) | undefined;
    const pending = new Promise<void>((resolve) => { resolveConfirm = resolve; });

    wrapper = mount(ConfirmModal, {
      attachTo: document.body,
      global: { components: { BaseIcon } },
      props: { show: true, title: 'Xóa', message: 'Chắc chưa?', confirmText: 'Xóa' },
      attrs: { onConfirm: () => pending },
    });
    await nextTick();

    await wrapper.find('.modal-footer .btn-primary').trigger('click');
    await nextTick();

    expect(wrapper.find('.spinner-sm').exists()).toBe(true);
    expect(wrapper.find('.modal-footer .btn-primary').attributes('disabled')).toBeDefined();
    expect(wrapper.find('.modal-footer .btn-secondary').attributes('disabled')).toBeDefined();

    resolveConfirm!();
    await flushPromises();
    await nextTick();

    expect(wrapper.find('.spinner-sm').exists()).toBe(false);
    expect(wrapper.find('.modal-footer .btn-primary').attributes('disabled')).toBeUndefined();
    expect(wrapper.find('.modal-footer .btn-secondary').attributes('disabled')).toBeUndefined();
  });

  it('CU-027: click overlay (.self) → emit update:show false', async () => {
    wrapper = mount(ConfirmModal, {
      attachTo: document.body,
      global: { components: { BaseIcon } },
      props: { show: true, title: 'Xóa', message: 'Chắc chưa?' },
    });
    await nextTick();

    await wrapper.find('.modal-overlay').trigger('click');

    expect(wrapper.emitted('update:show')![0]).toEqual([false]);
  });

  it('CU-027: icon mặc định alert-circle trong modal-title', async () => {
    wrapper = mount(ConfirmModal, {
      attachTo: document.body,
      global: {
        stubs: {
          BaseIcon: { props: ['name'], template: '<i class="base-icon-stub" :data-icon-name="name"></i>' },
        },
      },
      props: { show: true, title: 'Xóa', message: 'Chắc chưa?' },
    });
    await nextTick();

    expect(wrapper.find('.modal-title [data-icon-name="alert-circle"]').exists()).toBe(true);
  });

  it('CU-027: icon prop tùy chỉnh truyền vào BaseIcon', async () => {
    wrapper = mount(ConfirmModal, {
      attachTo: document.body,
      global: {
        stubs: {
          BaseIcon: { props: ['name'], template: '<i class="base-icon-stub" :data-icon-name="name"></i>' },
        },
      },
      props: { show: true, title: 'Xóa', message: 'Chắc chưa?', icon: 'trash' },
    });
    await nextTick();

    expect(wrapper.find('.modal-title [data-icon-name="trash"]').exists()).toBe(true);
  });
});
