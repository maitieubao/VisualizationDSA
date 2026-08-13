// @vitest-environment jsdom
// A1.4 (CONTRACT MỚI — Roadmap A1.5): Lesson Authoring Tool — form nâng cấp.
//   • Tab Soạn thảo / Xem trước: preview render markdown an toàn (escape trước, không XSS)
//   • Codelab picker: chọn codelab → payload submit chứa codelabId; nút xoá gắn kết → codelabId null
//   • sandboxConfig: JSON hợp lệ → submit; JSON lỗi → inline error + KHÔNG submit
//   • publishStatus: chọn Published → payload publishStatus đúng
//   • Nút "Xem trước như học viên" → router.push('/lessons/{lessonId}')
//
// ⚠️ CONTRACT dành cho FE agent (teacher-course-tab đang sửa song song) — form lesson
// phải cung cấp các phần tử data-test sau:
//   - [data-test="tab-edit"]            : tab Soạn thảo
//   - [data-test="tab-preview"]         : tab Xem trước (render markdown qua v-html)
//   - [data-test="preview-content"]     : vùng nội dung preview
//   - [data-test="codelab-picker"]      : <select> chọn codelab (value = codelab id)
//   - [data-test="codelab-remove"]      : nút "Xoá gắn kết codelab"
//   - [data-test="codelab-link"]        : hiển thị tiêu đề codelab đang gắn (tuỳ chọn)
//   - [data-test="sandbox-config"]      : textarea sandboxConfig (JSON)
//   - [data-test="sandbox-config-error"]: inline error khi JSON không hợp lệ
//   - [data-test="publish-status"]      : <select> publishStatus (Draft/Published)
//   - [data-test="preview-student"]     : nút "Xem trước như học viên"
// Payload submit lesson phải gồm: title, contentMd, sandboxType, sandboxConfig, quizId,
// xpReward, orderIndex + codelabId (string|null) + publishStatus.
// Nguồn danh sách codelab: GET bất kỳ URL chứa "codelab" → mảng [{id, title}] (mock trong file này).
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import BaseIcon from '../../../shared/components/BaseIcon.vue';

const authMocks = vi.hoisted(() => ({
  getAccessToken: () => 'teacher-token',
  refreshAccessToken: vi.fn(),
  impersonate: vi.fn(),
  currentUser: { id: 'teacher-001' },
}));

vi.mock('../../../features/auth/store/useAuthStore', () => ({
  useAuthStore: () => ({
    getAccessToken: authMocks.getAccessToken,
    refreshAccessToken: authMocks.refreshAccessToken,
    impersonate: authMocks.impersonate,
    currentUser: authMocks.currentUser,
  }),
}));

// A1.4: "Xem trước như học viên" dùng useRouter().push('/lessons/{id}').
const routerMocks = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: 'x' } }),
  useRouter: () => routerMocks,
}));

import TeacherCourseTab from '../TeacherCourseTab.vue';

const BASE_URL = 'http://localhost:5055';

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

const mockCourses = [
  { id: 'c1', title: 'Sorting Course', description: 'Desc 1', category: 'Sorting', difficulty: 'Beginner', isPremium: false, isPublished: true, coverImageUrl: '', totalLessons: 2 },
];

let fetchMock: ReturnType<typeof vi.fn>;
let wrapper: VueWrapper | null = null;

async function mountCourseTab(): Promise<VueWrapper> {
  wrapper = mount(TeacherCourseTab, {
    attachTo: document.body,
    global: {
      components: { BaseIcon },
    },
    props: { quizzesList: [] },
  });
  await flushPromises();
  await nextTick();
  return wrapper;
}

/** Mở accordion khóa c1 + form "Thêm bài giảng mới" (create mode) + điền title/contentMd bắt buộc. */
async function openLessonCreateForm(w: VueWrapper): Promise<void> {
  const courseRow = w.findAll('tr').find((tr) => tr.text().includes('Sorting Course'));
  expect(courseRow).toBeTruthy();
  await courseRow!.trigger('click');
  await flushPromises();
  await nextTick();
  await w.find('.btn-add-inline').trigger('click');
  await nextTick();
  await w.find('input[placeholder*="Sắp xếp Nổi bọt (Bubble Sort)"]').setValue('Bubble Sort Pro');
  await w.find('textarea[placeholder*="Tiêu đề lớn"]').setValue('# Lý thuyết');
}

describe('TeacherCourseTab — Lesson Authoring (A1.4 CONTRACT MỚI)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    fetchMock = vi.fn(async (url: string) => {
      // A1.4: danh sách codelab của teacher — mọi URL chứa "codelab".
      if (url.toLowerCase().includes('codelab')) {
        return jsonResponse([{ id: 'cl-1', title: 'Codelab Bubble Sort' }]);
      }
      if (url.includes('/api/v1/concepts/courses/') && !url.includes('/lessons')) {
        return jsonResponse({ lessons: [
          { id: 'l1', title: 'Bubble Sort', contentMd: '# Bubble', sandboxType: 'sorting', sandboxConfig: '{}', quizId: null, xpReward: 20, orderIndex: 1 },
        ] });
      }
      if (url.includes('/api/v1/concepts/courses')) {
        return jsonResponse(mockCourses);
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
    routerMocks.push.mockReset();
  });

  it('A1.4.1 tab Xem trước: render markdown — bold hiển thị, script/link javascript bị escape (không XSS)', async () => {
    const w = await mountCourseTab();
    await openLessonCreateForm(w);

    await w.find('textarea[placeholder*="Tiêu đề lớn"]').setValue('**Đậm chữ** <script>alert(1)</script> [XSS](javascript:alert(2))');

    await w.find('[data-test="tab-preview"]').trigger('click');
    await nextTick();

    const preview = w.find('[data-test="preview-content"]');
    expect(preview.exists()).toBe(true);
    // Bold được render (không còn dấu ** thô).
    expect(preview.text()).toContain('Đậm chữ');
    expect(preview.text()).not.toContain('**');
    // XSS: script không bao giờ là thẻ thật — phải bị escape.
    expect(preview.html()).not.toContain('<script>');
    expect(preview.html()).not.toContain('javascript:');
    expect(preview.html()).toContain('&lt;script&gt;');
  });

  it('A1.4.2 codelab picker: chọn codelab → payload submit chứa codelabId', async () => {
    const w = await mountCourseTab();
    await openLessonCreateForm(w);

    const picker = w.find('select[data-test="codelab-picker"]');
    expect(picker.exists()).toBe(true);
    await picker.setValue('cl-1');
    await w.find('.btn-submit').trigger('click');
    await flushPromises();
    await nextTick();

    const postCall = getCalls(fetchMock).find((c) => c.init?.method === 'POST' && c.url.includes('/lessons'));
    expect(postCall).toBeTruthy();
    expect(parseBody(postCall!.init).codelabId).toBe('cl-1');
  });

  it('A1.4.2b nút xoá gắn kết codelab → payload submit có codelabId null', async () => {
    const w = await mountCourseTab();
    await openLessonCreateForm(w);

    await w.find('select[data-test="codelab-picker"]').setValue('cl-1');
    const removeBtn = w.find('[data-test="codelab-remove"]');
    expect(removeBtn.exists()).toBe(true);
    await removeBtn.trigger('click');
    await nextTick();

    await w.find('.btn-submit').trigger('click');
    await flushPromises();
    await nextTick();

    const postCall = getCalls(fetchMock).find((c) => c.init?.method === 'POST' && c.url.includes('/lessons'));
    expect(postCall).toBeTruthy();
    expect(parseBody(postCall!.init).codelabId).toBeNull();
  });

  it('A1.4.3 sandboxConfig JSON hợp lệ → submit và payload giữ nguyên JSON', async () => {
    const w = await mountCourseTab();
    await openLessonCreateForm(w);

    const configInput = w.find('textarea[data-test="sandbox-config"]');
    expect(configInput.exists()).toBe(true);
    await configInput.setValue('{"demo":"bubble-sort","speed":0.5}');

    await w.find('.btn-submit').trigger('click');
    await flushPromises();
    await nextTick();

    const postCall = getCalls(fetchMock).find((c) => c.init?.method === 'POST' && c.url.includes('/lessons'));
    expect(postCall).toBeTruthy();
    expect(parseBody(postCall!.init).sandboxConfig).toBe('{"demo":"bubble-sort","speed":0.5}');
  });

  it('A1.4.3b sandboxConfig JSON lỗi → inline error hiển thị + KHÔNG submit', async () => {
    const w = await mountCourseTab();
    await openLessonCreateForm(w);

    await w.find('textarea[data-test="sandbox-config"]').setValue('{not-valid-json');
    await w.find('.btn-submit').trigger('click');
    await nextTick();

    const errorBox = w.find('[data-test="sandbox-config-error"]');
    expect(errorBox.exists()).toBe(true);
    expect(errorBox.text().trim()).not.toBe('');
    // Không có bất kỳ POST nào được gửi (course + lesson).
    expect(getCalls(fetchMock).some((c) => c.init?.method === 'POST')).toBe(false);
  });

  it('A1.4.4 publishStatus: chọn Published → payload publishStatus = Published', async () => {
    const w = await mountCourseTab();
    await openLessonCreateForm(w);

    const statusSelect = w.find('select[data-test="publish-status"]');
    expect(statusSelect.exists()).toBe(true);
    await statusSelect.setValue('Published');
    await w.find('.btn-submit').trigger('click');
    await flushPromises();
    await nextTick();

    const postCall = getCalls(fetchMock).find((c) => c.init?.method === 'POST' && c.url.includes('/lessons'));
    expect(postCall).toBeTruthy();
    expect(parseBody(postCall!.init).publishStatus).toBe('Published');
  });

  it('A1.4.5 nút "Xem trước như học viên" → router.push("/lessons/{lessonId}")', async () => {
    const w = await mountCourseTab();

    // Mở accordion → chỉnh sửa bài l1 (edit mode — đã có id).
    const courseRow = w.findAll('tr').find((tr) => tr.text().includes('Sorting Course'));
    await courseRow!.trigger('click');
    await flushPromises();
    await nextTick();

    const lessonEditBtns = w.findAll('.sub-question-card .btn-action--edit');
    expect(lessonEditBtns.length).toBeGreaterThan(0);
    await lessonEditBtns[0].trigger('click');
    await nextTick();

    const previewBtn = w.find('[data-test="preview-student"]');
    expect(previewBtn.exists()).toBe(true);
    await previewBtn.trigger('click');

    expect(routerMocks.push).toHaveBeenCalledTimes(1);
    expect(routerMocks.push).toHaveBeenCalledWith('/lessons/l1');
  });
});
