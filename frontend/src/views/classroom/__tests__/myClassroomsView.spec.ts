// @vitest-environment jsdom
// CR-002t (P0) + CR-011: CONTRACT SPEC — MyClassroomsView.
//  - GET /api/v1/classrooms/mine + POST /api/v1/classrooms/join (không /api/Classroom)
//  - whitelist mock: URL lạ → 404 (bắt CR-002 — đổi sai path sẽ fail)
//  - join code sai (CR-024: đúng 6 ký tự) → lỗi hiển thị, không gọi fetch
//  - join thành công → reload danh sách + router.push(/classrooms/{id})
//  - nút join bị disable khi joining
//  - CR-025: load list lỗi → error state (không empty state giả)
//  - CR-026t: nút "Rời lớp" → POST /api/v1/classrooms/{id}/leave + reload + toast
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import MyClassroomsView from '../MyClassroomsView.vue';

const routerMock = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
}));

vi.mock('vue-router', () => ({
  useRouter: () => routerMock,
}));

vi.mock('@/features/auth/store/useAuthStore', () => ({
  useAuthStore: () => ({
    getAccessToken: () => 'fake-token',
    currentUser: { id: 'student-1' },
    isTeacher: false,
  }),
}));

const toastMock = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
}));

vi.mock('@/composables/useToast', () => ({
  useToastStore: () => toastMock,
}));

const BaseIconStub = {
  name: 'BaseIcon',
  props: ['name', 'class'],
  template: '<svg class="base-icon-stub"><title>{{ name }}</title></svg>',
};

const RouterLinkStub = {
  name: 'RouterLink',
  props: ['to'],
  template: '<a class="rl-stub"><slot /></a>',
};

const okJson = (data: unknown): Response =>
  ({ ok: true, status: 200, json: async () => data }) as unknown as Response;

const errJson = (status: number, body: unknown = {}): Response =>
  ({ ok: false, status, json: async () => body }) as unknown as Response;

interface MockConfig {
  mineBody: unknown;
  mineStatus: number;
  joinBody: unknown;
  joinStatus: number;
  joinDelay?: Promise<Response>;
}

let config: MockConfig = {
  mineBody: [],
  mineStatus: 200,
  joinBody: {},
  joinStatus: 200,
};

// CR-002t: whitelist — chỉ /api/v1/classrooms/mine + /join + /leave trả dữ liệu; URL lạ → 404.
async function mockResponses(url: string, init?: RequestInit): Promise<Response> {
  if (url.includes('/api/v1/classrooms/mine')) {
    if (config.mineStatus !== 200) return errJson(config.mineStatus);
    return okJson(config.mineBody);
  }
  if (url.includes('/api/v1/classrooms/join') && (init?.method ?? 'GET').toUpperCase() === 'POST') {
    if (config.joinDelay) return config.joinDelay;
    if (config.joinStatus !== 200) return errJson(config.joinStatus, config.joinBody);
    return okJson(config.joinBody);
  }
  if (url.includes('/api/v1/classrooms/') && url.includes('/leave') && (init?.method ?? 'GET').toUpperCase() === 'POST') {
    return okJson({ success: true });
  }
  return errJson(404);
}

let wrapper: VueWrapper | null = null;

async function mountView(): Promise<VueWrapper> {
  wrapper = mount(MyClassroomsView, {
    attachTo: document.body,
    global: {
      components: { BaseIcon: BaseIconStub },
      stubs: { RouterLink: RouterLinkStub },
    },
  });
  await flushPromises();
  await nextTick();
  return wrapper;
}

async function openJoinModal(w: VueWrapper): Promise<void> {
  const openBtn = w.findAll('button').find((b) => b.text().includes('Tham gia bằng mã mời'));
  expect(openBtn).toBeTruthy();
  await openBtn!.trigger('click');
  await nextTick();
}

async function submitJoin(w: VueWrapper, code: string): Promise<void> {
  const input = w.find('input');
  await input.setValue(code);
  const joinBtn = w.findAll('button').find((b) => b.text().includes('Tham gia') && !b.text().includes('bằng mã mời'));
  expect(joinBtn).toBeTruthy();
  await joinBtn!.trigger('click');
}

describe('MyClassroomsView — Contract Spec (CR-002t / CR-011 / CR-025 / CR-026t)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    routerMock.push.mockClear();
    routerMock.replace.mockClear();
    toastMock.success.mockClear();
    toastMock.error.mockClear();
    config = { mineBody: [], mineStatus: 200, joinBody: {}, joinStatus: 200 };
    vi.stubGlobal('fetch', vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => mockResponses(String(url), init)));
    vi.stubGlobal('confirm', vi.fn(() => true));
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    vi.unstubAllGlobals();
  });

  it('CR-002t: load danh sách qua GET /api/v1/classrooms/mine (không /api/Classroom), hiển thị lớp', async () => {
    const fetchMock = vi.mocked(global.fetch);
    config.mineBody = [
      { id: 'c1', name: 'Lớp 12A1', description: 'Toán', studentCount: 3 },
    ];
    const w = await mountView();

    const mineCall = fetchMock.mock.calls.find((c) => String(c[0]).includes('/mine'));
    expect(mineCall).toBeTruthy();
    expect(String(mineCall![0])).toBe('http://localhost:5055/api/v1/classrooms/mine');
    expect(String(mineCall![0])).not.toContain('/api/Classroom');

    expect(w.text()).toContain('Lớp 12A1');
    expect(w.text()).toContain('3 học viên');
    expect(w.text()).not.toContain('Bạn chưa tham gia lớp học nào');
  });

  it('CR-002t: join → POST /api/v1/classrooms/join với inviteCode (không /api/Classroom)', async () => {
    const fetchMock = vi.mocked(global.fetch);
    const w = await mountView();
    await openJoinModal(w);
    await submitJoin(w, 'abc123');
    await flushPromises();
    await nextTick();

    const joinCall = fetchMock.mock.calls.find(
      (c) => String(c[0]).includes('/join') && (c[1] as RequestInit)?.method === 'POST'
    );
    expect(joinCall).toBeTruthy();
    expect(String(joinCall![0])).toBe('http://localhost:5055/api/v1/classrooms/join');
    expect(String(joinCall![0])).not.toContain('/api/Classroom');
    const body = JSON.parse(((joinCall![1] as RequestInit).body as string) ?? '{}');
    expect(body).toEqual({ inviteCode: 'ABC123' });
  });

  it('CR-024: join code <6 ký tự → lỗi hiển thị, KHÔNG gọi fetch /join', async () => {
    const fetchMock = vi.mocked(global.fetch);
    const w = await mountView();
    await openJoinModal(w);
    await submitJoin(w, 'abc');
    await flushPromises();
    await nextTick();

    expect(w.text()).toContain('Mã mời phải gồm đúng 6 ký tự chữ hoặc số.');
    const joinCall = fetchMock.mock.calls.find((c) => String(c[0]).includes('/join'));
    expect(joinCall).toBeUndefined();
  });

  it('CR-002t: join server trả lỗi (400 + Message) → hiển thị lỗi, modal không đóng', async () => {
    config.joinStatus = 400;
    config.joinBody = { Message: 'Mã mời không đúng định dạng.' };
    const w = await mountView();
    await openJoinModal(w);
    await submitJoin(w, 'abc123');
    await flushPromises();
    await nextTick();

    expect(w.text()).toContain('Mã mời không đúng định dạng.');
    expect(w.find('input').exists()).toBe(true);
  });

  it('CR-002t: join thành công → reload danh sách (mine gọi lại) + router.push(/classrooms/{id}) + đóng modal', async () => {
    const fetchMock = vi.mocked(global.fetch);
    config.joinBody = { id: 'c9', name: 'Lớp Mới' };
    const w = await mountView();
    await openJoinModal(w);
    await submitJoin(w, 'abc123');
    await flushPromises();
    await nextTick();

    const mineCalls = fetchMock.mock.calls.filter((c) => String(c[0]).includes('/mine'));
    expect(mineCalls.length).toBe(2);
    expect(routerMock.push).toHaveBeenCalledWith('/classrooms/c9');
    expect(w.find('input').exists()).toBe(false);
  });

  it('CR-002t: đang joining → nút bị disable + text "Đang tham gia..."', async () => {
    const fetchMock = vi.mocked(global.fetch);
    let resolveJoin!: (r: Response) => void;
    config.joinDelay = new Promise<Response>((resolve) => { resolveJoin = resolve; });
    const w = await mountView();
    await openJoinModal(w);
    await submitJoin(w, 'abc123');
    await nextTick();

    const joinBtn = w.findAll('button').find((b) => b.text().includes('Đang tham gia'));
    expect(joinBtn).toBeTruthy();
    expect(joinBtn!.attributes('disabled')).toBeDefined();

    resolveJoin(okJson({ id: 'c9', name: 'Lớp Mới' }));
    await flushPromises();
    await nextTick();

    // Join thành công → modal đóng + reload danh sách.
    expect(w.find('input').exists()).toBe(false);
    const mineCalls = fetchMock.mock.calls.filter((c) => String(c[0]).includes('/mine'));
    expect(mineCalls.length).toBe(2);
  });

  it('CR-025: load danh sách lỗi (500) → error state "Thử lại", KHÔNG hiện empty state giả', async () => {
    config.mineStatus = 500;
    const w = await mountView();

    expect(w.text()).toContain('Không thể tải danh sách lớp học (500)');
    expect(w.text()).not.toContain('Bạn chưa tham gia lớp học nào');
    const retryBtn = w.findAll('button').find((b) => b.text().includes('Thử lại'));
    expect(retryBtn).toBeTruthy();
  });

  it('CR-025: bấm "Thử lại" → load lại danh sách thành công', async () => {
    const fetchMock = vi.mocked(global.fetch);
    config.mineStatus = 500;
    const w = await mountView();
    expect(w.text()).toContain('Thử lại');

    config.mineStatus = 200;
    config.mineBody = [{ id: 'c1', name: 'Lớp 12A1' }];
    const retryBtn = w.findAll('button').find((b) => b.text().includes('Thử lại'));
    await retryBtn!.trigger('click');
    await flushPromises();
    await nextTick();

    expect(w.text()).toContain('Lớp 12A1');
    const mineCalls = fetchMock.mock.calls.filter((c) => String(c[0]).includes('/mine'));
    expect(mineCalls.length).toBe(2);
  });

  it('CR-002t: /mine trả 401 → router.push("/")', async () => {
    config.mineStatus = 401;
    await mountView();
    await flushPromises();
    await nextTick();

    expect(routerMock.push).toHaveBeenCalledWith('/');
  });

  it('CR-026t: nút "Rời lớp" → confirm → POST /api/v1/classrooms/{id}/leave → reload + toast success', async () => {
    const fetchMock = vi.mocked(global.fetch);
    config.mineBody = [{ id: 'c1', name: 'Lớp 12A1', studentCount: 3 }];
    const w = await mountView();

    const leaveBtn = w.findAll('button').find((b) => b.text().includes('Rời lớp'));
    expect(leaveBtn).toBeTruthy();
    await leaveBtn!.trigger('click');
    await flushPromises();
    await nextTick();

    const leaveCall = fetchMock.mock.calls.find(
      (c) => String(c[0]).includes('/api/v1/classrooms/c1/leave') && (c[1] as RequestInit)?.method === 'POST'
    );
    expect(leaveCall).toBeTruthy();
    expect(String(leaveCall![0])).not.toContain('/api/Classroom');
    expect(toastMock.success).toHaveBeenCalled();
    const mineCalls = fetchMock.mock.calls.filter((c) => String(c[0]).includes('/mine'));
    expect(mineCalls.length).toBe(2);
  });

  it('CR-026t: confirm hủy → không gọi /leave', async () => {
    const fetchMock = vi.mocked(global.fetch);
    vi.stubGlobal('confirm', vi.fn(() => false));
    config.mineBody = [{ id: 'c1', name: 'Lớp 12A1' }];
    const w = await mountView();

    const leaveBtn = w.findAll('button').find((b) => b.text().includes('Rời lớp'));
    await leaveBtn!.trigger('click');
    await flushPromises();
    await nextTick();

    const leaveCall = fetchMock.mock.calls.find((c) => String(c[0]).includes('/leave'));
    expect(leaveCall).toBeUndefined();
  });
});
