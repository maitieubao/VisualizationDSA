// @vitest-environment jsdom
// LS-017 (P1): CONTRACT SPEC — store classroomCurriculum thật + vi.stubGlobal('fetch').
// Contract mới (sau fix LS-001/LS-002/LS-003/LS-041):
//  - toàn bộ URL có prefix /api/v1/classrooms/...
//  - update/delete item có endpoint PUT/DELETE
//  - reorder wire: body { teacherId, itemOrders } / { teacherId, moduleOrders }
//  - override field là `isHidden`
//  - fetchCurriculum bỏ stale data khi race 2 classroom
//  - saving = true trong lúc request đang chờ (guard double-submit)
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { flushPromises } from '@vue/test-utils';
import {
  useClassroomCurriculumStore,
  type ClassroomCurriculum,
  type ClassroomModule,
  type ClassroomModuleItem,
} from '../classroomCurriculum';

const BASE_URL = 'http://localhost:5055';

interface Deferred<T = unknown> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
}

function deferred<T = unknown>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return { ok, status, statusText: ok ? 'OK' : 'Error', json: async () => body } as unknown as Response;
}

function fetchUrl(call: unknown[]): string {
  return String(call[0]);
}

function fetchInit(call: unknown[]): RequestInit {
  return (call[1] ?? {}) as RequestInit;
}

function bodyOf(init: RequestInit): Record<string, unknown> {
  return JSON.parse(String(init.body)) as Record<string, unknown>;
}

function makeItem(overrides: Partial<ClassroomModuleItem> = {}): ClassroomModuleItem {
  return {
    id: 'item-1',
    moduleId: 'module-1',
    itemType: 'Lesson',
    overrideTitle: 'Bài 1',
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
    ...overrides,
  };
}

function makeModule(overrides: Partial<ClassroomModule> = {}): ClassroomModule {
  return {
    id: 'module-1',
    classroomId: 'classroom-1',
    title: 'Module 1',
    description: 'Mô tả module',
    orderIndex: 1,
    isHidden: false,
    unlockAt: null,
    items: [makeItem()],
    ...overrides,
  };
}

function makeCurriculum(overrides: Partial<ClassroomCurriculum> = {}): ClassroomCurriculum {
  return {
    classroomId: 'classroom-1',
    classroomName: 'Lớp 12A1',
    modules: [makeModule()],
    ...overrides,
  };
}

let fetchMock: ReturnType<typeof vi.fn>;

describe('classroomCurriculum — Contract Spec (LS-017)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('fetchCurriculum: GET /api/v1/classrooms/{id}/curriculum/teacher + Bearer + cập nhật state', async () => {
    localStorage.setItem('accessToken', 'token-abc');
    fetchMock.mockResolvedValueOnce(jsonResponse(makeCurriculum()));

    const store = useClassroomCurriculumStore();
    await store.fetchCurriculum('classroom-1', 'teacher-1');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = fetchUrl(fetchMock.mock.calls[0]);
    const init = fetchInit(fetchMock.mock.calls[0]);
    expect(url).toContain('/api/v1/classrooms/classroom-1/curriculum/teacher');
    expect(init.method ?? 'GET').toBe('GET');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer token-abc');
    expect(store.curriculum?.classroomName).toBe('Lớp 12A1');
    expect(store.curriculum?.modules.length).toBe(1);
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('fetchCurriculum: lỗi HTTP → error state + throw (không giữ loading)', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({ message: 'boom' }) } as unknown as Response);

    const store = useClassroomCurriculumStore();
    await expect(store.fetchCurriculum('classroom-1', 'teacher-1')).rejects.toThrow('boom');
    expect(store.error).toBe('boom');
    expect(store.loading).toBe(false);
  });

  it('fetchCurriculum: race 2 classroom — response cũ (stale) bị bỏ', async () => {
    const dA = deferred<Response>();
    const dB = deferred<Response>();
    fetchMock.mockImplementationOnce(() => dA.promise);
    fetchMock.mockImplementationOnce(() => dB.promise);

    const store = useClassroomCurriculumStore();
    const pA = store.fetchCurriculum('classroom-A', 'teacher-1').catch(() => {});
    const pB = store.fetchCurriculum('classroom-B', 'teacher-1').catch(() => {});
    expect(store.loading).toBe(true);

    dB.resolve(jsonResponse(makeCurriculum({ classroomId: 'classroom-B', classroomName: 'Lớp B' })));
    await flushPromises();
    expect(store.curriculum?.classroomId).toBe('classroom-B');

    dA.resolve(jsonResponse(makeCurriculum({ classroomId: 'classroom-A', classroomName: 'Lớp A' })));
    await flushPromises();

    // Response cũ trả về SAU response mới → phải bị bỏ (stale data).
    expect(store.curriculum?.classroomId).toBe('classroom-B');
    await Promise.all([pA, pB]);
    expect(store.loading).toBe(false);
  });

  it('createModuleApi: POST /api/v1/classrooms/{id}/modules với {teacherId, ...module} + state có id trả về', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ moduleId: 'module-new' }));

    const store = useClassroomCurriculumStore();
    store.setCurriculum(makeCurriculum({ modules: [] }));
    await store.createModuleApi('classroom-1', 'teacher-1', { title: 'Module Mới', description: 'abc', orderIndex: 2, isHidden: false, unlockAt: null });

    const url = fetchUrl(fetchMock.mock.calls[0]);
    const init = fetchInit(fetchMock.mock.calls[0]);
    expect(url).toContain('/api/v1/classrooms/classroom-1/modules');
    expect(init.method).toBe('POST');
    const body = bodyOf(init);
    expect(body.teacherId).toBe('teacher-1');
    expect(body.title).toBe('Module Mới');
    expect(store.curriculum?.modules.some(m => m.id === 'module-new' && m.title === 'Module Mới')).toBe(true);
  });

  it('updateModuleApi: PUT /api/v1/modules/{moduleId} + state cập nhật', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, status: 204, json: async () => ({}) } as unknown as Response);

    const store = useClassroomCurriculumStore();
    store.setCurriculum(makeCurriculum());
    await store.updateModuleApi('module-1', { title: 'Module Đổi Tên' });

    const url = fetchUrl(fetchMock.mock.calls[0]);
    const init = fetchInit(fetchMock.mock.calls[0]);
    expect(url).toContain('/api/v1/modules/module-1');
    expect(init.method).toBe('PUT');
    expect(bodyOf(init).title).toBe('Module Đổi Tên');
    expect(store.curriculum?.modules[0].title).toBe('Module Đổi Tên');
  });

  it('deleteModuleApi: DELETE /api/v1/modules/{moduleId} + state xóa module', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, status: 204, json: async () => ({}) } as unknown as Response);

    const store = useClassroomCurriculumStore();
    store.setCurriculum(makeCurriculum());
    await store.deleteModuleApi('module-1');

    const url = fetchUrl(fetchMock.mock.calls[0]);
    const init = fetchInit(fetchMock.mock.calls[0]);
    expect(url).toContain('/api/v1/modules/module-1');
    expect(init.method).toBe('DELETE');
    expect(store.curriculum?.modules.length).toBe(0);
  });

  it('createItemApi: POST /api/v1/modules/{moduleId}/items + state có item id trả về', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ itemId: 'item-new' }));

    const store = useClassroomCurriculumStore();
    store.setCurriculum(makeCurriculum({ modules: [makeModule({ items: [] })] }));
    const item = makeItem({ id: '', moduleId: 'module-1' });
    await store.createItemApi('module-1', item);

    const url = fetchUrl(fetchMock.mock.calls[0]);
    const init = fetchInit(fetchMock.mock.calls[0]);
    expect(url).toContain('/api/v1/modules/module-1/items');
    expect(init.method).toBe('POST');
    expect(store.curriculum?.modules[0].items.some(i => i.id === 'item-new')).toBe(true);
  });

  it('updateItemApi: PUT /api/v1/modules/{moduleId}/items/{itemId} + state cập nhật (isHidden override)', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, status: 204, json: async () => ({}) } as unknown as Response);

    const store = useClassroomCurriculumStore();
    store.setCurriculum(makeCurriculum());
    await store.updateItemApi('module-1', 'item-1', { isHidden: true, isRequired: false });

    const url = fetchUrl(fetchMock.mock.calls[0]);
    const init = fetchInit(fetchMock.mock.calls[0]);
    expect(url).toContain('/api/v1/modules/module-1/items/item-1');
    expect(init.method).toBe('PUT');
    expect(bodyOf(init).isHidden).toBe(true);
    expect(store.getItem('module-1', 'item-1')?.isHidden).toBe(true);
    expect(store.getItem('module-1', 'item-1')?.isRequired).toBe(false);
  });

  it('deleteItemApi: DELETE /api/v1/modules/{moduleId}/items/{itemId} + state xóa item', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, status: 204, json: async () => ({}) } as unknown as Response);

    const store = useClassroomCurriculumStore();
    store.setCurriculum(makeCurriculum());
    await store.deleteItemApi('module-1', 'item-1');

    const url = fetchUrl(fetchMock.mock.calls[0]);
    const init = fetchInit(fetchMock.mock.calls[0]);
    expect(url).toContain('/api/v1/modules/module-1/items/item-1');
    expect(init.method).toBe('DELETE');
    expect(store.curriculum?.modules[0].items.length).toBe(0);
  });

  it('reorderModulesApi: PUT /api/v1/classrooms/{id}/modules/reorder body {teacherId, moduleOrders} + state sắp lại', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, status: 204, json: async () => ({}) } as unknown as Response);

    const store = useClassroomCurriculumStore();
    store.setCurriculum(makeCurriculum({
      modules: [makeModule({ id: 'm1', orderIndex: 1 }), makeModule({ id: 'm2', orderIndex: 2 })],
    }));
    const orders = [
      { moduleId: 'm2', orderIndex: 1 },
      { moduleId: 'm1', orderIndex: 2 },
    ];
    await store.reorderModulesApi('classroom-1', 'teacher-1', orders);

    const url = fetchUrl(fetchMock.mock.calls[0]);
    const init = fetchInit(fetchMock.mock.calls[0]);
    expect(url).toContain('/api/v1/classrooms/classroom-1/modules/reorder');
    expect(init.method).toBe('PUT');
    const body = bodyOf(init);
    expect(body.teacherId).toBe('teacher-1');
    expect(body.moduleOrders).toEqual(orders);
    expect(store.curriculum?.modules.map(m => m.id)).toEqual(['m2', 'm1']);
  });

  it('reorderItemsApi: PUT /api/v1/modules/{moduleId}/items/reorder body {teacherId, itemOrders} (LS-003t)', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, status: 204, json: async () => ({}) } as unknown as Response);

    const store = useClassroomCurriculumStore();
    store.setCurriculum(makeCurriculum({
      modules: [makeModule({
        items: [makeItem({ id: 'i1', orderIndex: 1 }), makeItem({ id: 'i2', orderIndex: 2 })],
      })],
    }));
    const orders = [
      { itemId: 'i2', orderIndex: 1 },
      { itemId: 'i1', orderIndex: 2 },
    ];
    await store.reorderItemsApi('module-1', 'teacher-1', orders);

    const url = fetchUrl(fetchMock.mock.calls[0]);
    const init = fetchInit(fetchMock.mock.calls[0]);
    expect(url).toContain('/api/v1/modules/module-1/items/reorder');
    expect(init.method).toBe('PUT');
    const body = bodyOf(init);
    expect(body.teacherId).toBe('teacher-1');
    expect(body.itemOrders).toEqual(orders);
    expect(store.curriculum?.modules[0].items.map(i => i.id)).toEqual(['i2', 'i1']);
  });

  it('applyDragDrop: drop item cùng module → reorderItems local (không gọi API)', async () => {
    const store = useClassroomCurriculumStore();
    store.setCurriculum(makeCurriculum({
      modules: [makeModule({
        items: [
          makeItem({ id: 'i1', orderIndex: 1, moduleId: 'module-1' }),
          makeItem({ id: 'i2', orderIndex: 2, moduleId: 'module-1' }),
        ],
      })],
    }));
    const i1 = store.getItem('module-1', 'i1')!;
    const i2 = store.getItem('module-1', 'i2')!;
    store.setDraggingItem(i1, 'module-1');
    store.setDragOverItem(i2, 'module-1');
    store.applyDragDrop();

    expect(store.curriculum?.modules[0].items.map(i => i.id)).toEqual(['i2', 'i1']);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('saving = true trong lúc request chờ, false sau khi xong (LS-041t — chống double-submit)', async () => {
    const d = deferred<Response>();
    fetchMock.mockImplementationOnce(() => d.promise);

    const store = useClassroomCurriculumStore();
    store.setCurriculum(makeCurriculum({ modules: [] }));
    const pending = store.createModuleApi('classroom-1', 'teacher-1', { title: 'M', description: '', orderIndex: 1, isHidden: false, unlockAt: null });
    expect(store.saving).toBe(true);

    d.resolve(jsonResponse({ moduleId: 'module-x' }));
    await pending;
    expect(store.saving).toBe(false);
  });

  it('reset: dọn toàn bộ state + drag state', () => {
    const store = useClassroomCurriculumStore();
    store.setCurriculum(makeCurriculum());
    store.setError('boom');
    store.setLoading(true);
    store.toggleModuleExpanded('module-1');
    store.setDraggingItem(makeItem(), 'module-1');

    store.reset();
    expect(store.curriculum).toBeNull();
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
    expect(store.saving).toBe(false);
    expect(store.draggingItem).toBeNull();
    expect(store.isModuleExpanded('module-1')).toBe(false);
  });
});
