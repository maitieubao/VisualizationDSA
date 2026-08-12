// @vitest-environment jsdom
// LS-018 + CR-009/CR-030/CR-031/CR-037t/CR-026t/CR-008: CONTRACT SPEC — StudentClassroomView.
//  - load 3 endpoint /api/v1/classrooms/{id} + curriculum/student + my-progress song song
//  - chọn bài từ sidebar → navigate emit → item player hiện + POST start
//  - CR-031: start/complete mock trả 200 kèm JSON (contract backend, không 204)
//  - CR-030: whitelist mock — URL lạ → 404 (không fallback ok:true); test path lỗi 403/404/500
//  - CR-009: chuỗi @complete — POST complete → loadCurriculum → loadProgressSummary → navigate kế tiếp
//  - CR-009: trackItemProgress PUT /module-items/{id}/progress (flush khi đổi bài + scroll debounce)
//  - CR-037t: deep-link ?itemId → trackItemStart được gọi
//  - CR-026t: nút "Rời lớp" → POST /leave → router.push('/classrooms')
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import StudentClassroomView from '../StudentClassroomView.vue';

const routeState = vi.hoisted(() => ({
  route: { query: {}, params: { id: 'room-123' } },
  router: { push: vi.fn(), replace: vi.fn() },
}));

vi.mock('vue-router', () => ({
  useRoute: () => routeState.route,
  useRouter: () => routeState.router,
}));

vi.mock('@/features/auth/store/useAuthStore', () => ({
  useAuthStore: () => ({
    getAccessToken: () => 'fake-token',
    currentUser: { id: 'student-1' },
  }),
}));

vi.mock('@/composables/useToast', () => ({
  useToastStore: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  }),
}));

const BaseIconStub = {
  name: 'BaseIcon',
  props: ['name', 'class'],
  template: '<svg class="base-icon-stub"><title>{{ name }}</title></svg>',
};

const Curriculum = {
  classroomId: 'room-123',
  classroomName: 'Lớp 12A1',
  modules: [
    {
      id: 'm1',
      title: 'Module 1',
      items: [
        { id: 'i1', itemType: 'Lesson', overrideTitle: 'Bài 1', status: 'NotStarted', isRequired: true, isHidden: false, lessonTitle: 'Lesson 1' },
        { id: 'i2', itemType: 'Quiz', overrideTitle: 'Bài 2', status: 'NotStarted', isRequired: true, isHidden: false, quizTitle: 'Quiz 1' },
      ],
    },
  ],
};

const okJson = (data: unknown): Response =>
  ({ ok: true, status: 200, json: async () => data }) as unknown as Response;

const errJson = (status: number, body: unknown = {}): Response =>
  ({ ok: false, status, json: async () => body }) as unknown as Response;

// Player stub có khả năng emit — test được chuỗi @complete (CR-009).
const ItemPlayerStub = {
  name: 'ClassroomItemPlayer',
  props: ['item', 'classroomId', 'curriculum'],
  emits: ['complete', 'next', 'back'],
  template: `
    <div class="item-player-stub">
      <span class="stub-item-id">{{ item?.id }}</span>
      <button type="button" class="stub-complete" @click="$emit('complete')">complete</button>
    </div>`,
};

interface MockState {
  classroomStatus: number;
  completeResult: Record<string, unknown>;
  newlyUnlocked: string[];
}

const mockState: MockState = {
  classroomStatus: 200,
  completeResult: { success: true, status: 'Completed', newlyUnlockedItemIds: [] },
  newlyUnlocked: [],
};

// CR-030: whitelist — chỉ URL quen thuộc trả 200; URL lạ → 404 (bắt đổi sai path).
async function mockResponses(url: string, init?: RequestInit): Promise<Response> {
  const method = (init?.method ?? 'GET').toUpperCase();
  if (url.includes('/api/v1/classrooms/room-123/curriculum/student')) {
    return okJson(Curriculum);
  }
  if (url.includes('/api/v1/classrooms/room-123/my-progress')) {
    return okJson({ completedItems: 0, totalItems: 2, inProgressItems: 0, lockedItems: 0, overallProgressPercent: 0, modules: [] });
  }
  if (url.includes('/api/v1/classrooms/room-123/leave') && method === 'POST') {
    return okJson({ success: true });
  }
  if (url.includes('/module-items/') && url.includes('/complete')) {
    const result = { ...mockState.completeResult, newlyUnlockedItemIds: mockState.newlyUnlocked };
    return okJson(result);
  }
  if (url.includes('/module-items/') && url.includes('/progress') && method === 'PUT') {
    return okJson({ success: true, status: 'InProgress' });
  }
  if (url.includes('/module-items/') && url.includes('/start')) {
    // CR-031: backend trả 200 kèm JSON ItemProgressResult (không phải 204).
    return okJson({ success: true, message: '', status: 'InProgress', newlyUnlockedItemIds: [] });
  }
  if (url.includes('/api/v1/classrooms/room-123')) {
    if (mockState.classroomStatus !== 200) return errJson(mockState.classroomStatus);
    return okJson({ id: 'room-123', name: 'Lớp 12A1' });
  }
  return errJson(404);
}

let wrapper: VueWrapper | null = null;

async function mountView(): Promise<VueWrapper> {
  routeState.route = { query: {}, params: { id: 'room-123' } };
  wrapper = mount(StudentClassroomView, {
    attachTo: document.body,
    global: {
      components: { BaseIcon: BaseIconStub },
      stubs: {
        StudentCurriculumSidebar: true,
        ClassroomItemPlayer: ItemPlayerStub,
      },
    },
  });
  await flushPromises();
  await nextTick();
  return wrapper;
}

describe('StudentClassroomView — Contract Spec (LS-018 + CR-009/030/031)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    routeState.router.push.mockClear();
    routeState.router.replace.mockClear();
    mockState.classroomStatus = 200;
    mockState.completeResult = { success: true, status: 'Completed', newlyUnlockedItemIds: [] };
    mockState.newlyUnlocked = [];
    vi.stubGlobal('fetch', vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => mockResponses(String(url), init)));
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('load 3 endpoint song song: classroom + curriculum/student + my-progress (đều /api/v1/classrooms)', async () => {
    const fetchMock = vi.mocked(global.fetch);
    const w = await mountView();

    const urls = fetchMock.mock.calls.map((c) => String(c[0]));
    expect(urls.some(u => u.includes('/api/v1/classrooms/room-123/curriculum/student'))).toBe(true);
    expect(urls.some(u => u.includes('/api/v1/classrooms/room-123/my-progress'))).toBe(true);
    expect(urls.some(u => u === 'http://localhost:5055/api/v1/classrooms/room-123')).toBe(true);
    // CR-030: không URL legacy /api/Classroom.
    expect(urls.join(' ')).not.toContain('/api/Classroom');
    expect(w.text()).not.toContain('Đang tải lớp học...');
  });

  it('sidebar emit navigate → chọn bài mở → hiển thị player + POST start (CR-031: 200 kèm JSON)', async () => {
    const fetchMock = vi.mocked(global.fetch);
    const w = await mountView();

    const sidebar = w.findComponent({ name: 'StudentCurriculumSidebar' });
    sidebar.vm.$emit('navigate', 'i1');
    await flushPromises();
    await nextTick();

    expect(w.find('.item-player-stub').exists()).toBe(true);
    const startCall = fetchMock.mock.calls.find(
      (c) => String(c[0]).includes('/module-items/i1/start') && (c[1] as RequestInit)?.method === 'POST'
    );
    expect(startCall).toBeTruthy();
  });

  it('navigate bài khác → start của bài mới được gọi', async () => {
    const fetchMock = vi.mocked(global.fetch);
    const w = await mountView();

    const sidebar = w.findComponent({ name: 'StudentCurriculumSidebar' });
    sidebar.vm.$emit('navigate', 'i1');
    await flushPromises();
    await nextTick();
    sidebar.vm.$emit('navigate', 'i2');
    await flushPromises();
    await nextTick();

    const starts = fetchMock.mock.calls.filter(
      (c) => String(c[0]).includes('/module-items/') && String(c[0]).includes('/start')
    );
    expect(starts.length).toBe(2);
    expect(starts.some((c) => String(c[0]).includes('i1/start'))).toBe(true);
    expect(starts.some((c) => String(c[0]).includes('i2/start'))).toBe(true);
  });

  it('itemId từ route.query → truyền current-item-id cho sidebar (deep-link highlight)', async () => {
    routeState.route = { query: { itemId: 'i2' }, params: { id: 'room-123' } };
    wrapper = mount(StudentClassroomView, {
      attachTo: document.body,
      global: {
        components: { BaseIcon: BaseIconStub },
        stubs: {
          StudentCurriculumSidebar: true,
          ClassroomItemPlayer: ItemPlayerStub,
        },
      },
    });
    await flushPromises();
    await nextTick();

    const sidebar = wrapper.findComponent({ name: 'StudentCurriculumSidebar' });
    expect(sidebar.props('currentItemId')).toBe('i2');
  });

  // CR-037t: deep-link ?itemId → mở thẳng bài + trackItemStart được gọi.
  it('CR-037t: deep-link ?itemId=i2 → POST /module-items/i2/start được gọi', async () => {
    const fetchMock = vi.mocked(global.fetch);
    routeState.route = { query: { itemId: 'i2' }, params: { id: 'room-123' } };
    wrapper = mount(StudentClassroomView, {
      attachTo: document.body,
      global: {
        components: { BaseIcon: BaseIconStub },
        stubs: {
          StudentCurriculumSidebar: true,
          ClassroomItemPlayer: ItemPlayerStub,
        },
      },
    });
    await flushPromises();
    await nextTick();

    const startI2 = fetchMock.mock.calls.find(
      (c) => String(c[0]).includes('/module-items/i2/start') && (c[1] as RequestInit)?.method === 'POST'
    );
    expect(startI2).toBeTruthy();
  });

  // CR-009: chuỗi @complete — POST complete → loadCurriculum → loadProgressSummary → navigate kế tiếp.
  it('CR-009: player emit complete → POST complete → loadCurriculum + loadProgressSummary → navigate i2 + start i2', async () => {
    const fetchMock = vi.mocked(global.fetch);
    const w = await mountView();

    const sidebar = w.findComponent({ name: 'StudentCurriculumSidebar' });
    sidebar.vm.$emit('navigate', 'i1');
    await flushPromises();
    await nextTick();

    const curriculumBefore = fetchMock.mock.calls.filter((c) => String(c[0]).includes('/curriculum/student')).length;
    const progressBefore = fetchMock.mock.calls.filter((c) => String(c[0]).includes('/my-progress')).length;

    const player = w.findComponent({ name: 'ClassroomItemPlayer' });
    player.vm.$emit('complete');
    await flushPromises();
    await nextTick();
    await flushPromises();

    const completeCall = fetchMock.mock.calls.find(
      (c) => String(c[0]).includes('/module-items/i1/complete') && (c[1] as RequestInit)?.method === 'POST'
    );
    expect(completeCall).toBeTruthy();

    const curriculumAfter = fetchMock.mock.calls.filter((c) => String(c[0]).includes('/curriculum/student')).length;
    const progressAfter = fetchMock.mock.calls.filter((c) => String(c[0]).includes('/my-progress')).length;
    expect(curriculumAfter).toBeGreaterThan(curriculumBefore);
    expect(progressAfter).toBeGreaterThan(progressBefore);

    // Navigate kế tiếp: player nhận item i2 + start i2 được gọi.
    expect(player.props('item').id).toBe('i2');
    const startI2 = fetchMock.mock.calls.find((c) => String(c[0]).includes('/module-items/i2/start'));
    expect(startI2).toBeTruthy();
  });

  // CR-009: khi complete trả newlyUnlockedItemIds — curriculum vẫn được nạp lại (CR-007 load LUÔN).
  it('CR-009: complete trả newlyUnlockedItemIds → loadCurriculum được gọi lại', async () => {
    const fetchMock = vi.mocked(global.fetch);
    mockState.newlyUnlocked = ['i2'];
    const w = await mountView();

    const sidebar = w.findComponent({ name: 'StudentCurriculumSidebar' });
    sidebar.vm.$emit('navigate', 'i1');
    await flushPromises();
    await nextTick();

    const curriculumBefore = fetchMock.mock.calls.filter((c) => String(c[0]).includes('/curriculum/student')).length;
    const player = w.findComponent({ name: 'ClassroomItemPlayer' });
    player.vm.$emit('complete');
    await flushPromises();
    await nextTick();
    await flushPromises();

    const curriculumAfter = fetchMock.mock.calls.filter((c) => String(c[0]).includes('/curriculum/student')).length;
    expect(curriculumAfter).toBeGreaterThan(curriculumBefore);
  });

  // CR-009: trackItemProgress — PUT /module-items/{id}/progress khi chuyển bài (flushProgressSync).
  it('CR-009: chuyển bài → flush progress bài cũ qua PUT /module-items/{id}/progress', async () => {
    const fetchMock = vi.mocked(global.fetch);
    const w = await mountView();

    const sidebar = w.findComponent({ name: 'StudentCurriculumSidebar' });
    sidebar.vm.$emit('navigate', 'i1');
    await flushPromises();
    await nextTick();

    sidebar.vm.$emit('navigate', 'i2');
    await flushPromises();
    await nextTick();

    const putProgress = fetchMock.mock.calls.find((c) =>
      String(c[0]).includes('/module-items/i1/progress') && (c[1] as RequestInit)?.method === 'PUT'
    );
    expect(putProgress).toBeTruthy();
    const body = JSON.parse(((putProgress?.[1] as RequestInit | undefined)?.body as string) ?? '{}');
    expect(body).toHaveProperty('activeFrame');
    expect(body).toHaveProperty('scrollPercent');
  });

  // CR-021: scroll main → debounce 800ms → PUT /progress.
  it('CR-021: scroll main container → debounce 800ms → PUT /module-items/{id}/progress', async () => {
    vi.useFakeTimers();
    try {
      const fetchMock = vi.mocked(global.fetch);
      const w = await mountView();

      const sidebar = w.findComponent({ name: 'StudentCurriculumSidebar' });
      sidebar.vm.$emit('navigate', 'i1');
      await flushPromises();
      await nextTick();

      const putBefore = fetchMock.mock.calls.filter((c) => String(c[0]).includes('/progress')).length;
      await w.find('main').trigger('scroll');
      await vi.advanceTimersByTimeAsync(800);
      await nextTick();

      const putAfter = fetchMock.mock.calls.filter((c) => String(c[0]).includes('/progress')).length;
      expect(putAfter).toBeGreaterThan(putBefore);
      const putCalls = fetchMock.mock.calls.filter((c) => String(c[0]).includes('/progress'));
      const lastPut = putCalls[putCalls.length - 1];
      expect((lastPut?.[1] as RequestInit | undefined)?.method).toBe('PUT');
    } finally {
      vi.useRealTimers();
    }
  });

  // CR-030: path lỗi — classroom 403 → error state, không hiện welcome giả.
  it('CR-030: classroom 403 → error state "Bạn không trong lớp này.", không welcome giả', async () => {
    mockState.classroomStatus = 403;
    const w = await mountView();

    expect(w.text()).toContain('Bạn không trong lớp này.');
    expect(w.text()).not.toContain('Chào mừng đến với lớp học!');
  });

  it('CR-030: classroom 404 → error state "Lớp không tồn tại."', async () => {
    mockState.classroomStatus = 404;
    const w = await mountView();

    expect(w.text()).toContain('Lớp không tồn tại.');
    expect(w.text()).not.toContain('Chào mừng đến với lớp học!');
  });

  it('CR-030: classroom 500 → error state "Không thể tải lớp học (500)."', async () => {
    mockState.classroomStatus = 500;
    const w = await mountView();

    expect(w.text()).toContain('Không thể tải lớp học (500).');
    expect(w.text()).not.toContain('Chào mừng đến với lớp học!');
  });

  // CR-031: mock start phải theo contract backend — 200 kèm JSON, không phải 204.
  it('CR-031: mock /start theo contract backend — status 200 kèm JSON success', async () => {
    const res = await mockResponses('http://localhost:5055/api/v1/classrooms/module-items/i1/start', { method: 'POST' });
    expect(res.ok).toBe(true);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('success');
  });

  // CR-026t: nút "Rời lớp" → POST /api/v1/classrooms/{id}/leave → router.push('/classrooms').
  it('CR-026t: nút "Rời lớp" → confirm → POST /leave → router.push("/classrooms")', async () => {
    const fetchMock = vi.mocked(global.fetch);
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    try {
      const w = await mountView();

      const leaveBtn = w.findAll('button').find((b) => b.text().includes('Rời lớp'));
      expect(leaveBtn).toBeTruthy();
      await leaveBtn!.trigger('click');
      await flushPromises();
      await nextTick();

      const leaveCall = fetchMock.mock.calls.find(
        (c) => String(c[0]).includes('/api/v1/classrooms/room-123/leave') && (c[1] as RequestInit)?.method === 'POST'
      );
      expect(leaveCall).toBeTruthy();
      expect(routeState.router.push).toHaveBeenCalledWith('/classrooms');
    } finally {
      confirmSpy.mockRestore();
    }
  });
});
