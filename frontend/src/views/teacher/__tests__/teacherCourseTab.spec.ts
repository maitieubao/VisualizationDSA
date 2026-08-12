// @vitest-environment jsdom
// TC-036 (P2): CONTRACT SPEC cho TeacherCourseTab — CRUD course/lesson,
// upload cover (FormData không Content-Type — TC-010), toggle premium/published,
// payload dùng field `thumbnail` (TC-009), formatTopic map đầy đủ.
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

import TeacherCourseTab from '../TeacherCourseTab.vue';
import { useTeacherApi } from '../useTeacherApi';

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
  { id: 'c2', title: 'Graph Course', description: 'Desc 2', category: 'Graph', difficulty: 'Advanced', isPremium: true, isPublished: false, coverImageUrl: '', totalLessons: 0 },
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

describe('TeacherCourseTab — Contract Spec (TC-036)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    fetchMock = vi.fn(async (url: string) => {
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
  });

  it('formatTopic map đầy đủ DataStructure/Algorithm/Sorting/Patterns/SystemDesign (TC-036)', () => {
    const api = useTeacherApi();
    expect(api.formatTopic('DataStructure')).toBe('Cấu trúc dữ liệu');
    expect(api.formatTopic('Algorithm')).toBe('Thuật toán');
    expect(api.formatTopic('Sorting')).toBe('Sắp xếp');
    expect(api.formatTopic('Patterns')).toBe('Mẫu thiết kế');
    expect(api.formatTopic('SystemDesign')).toBe('Thiết kế hệ thống');
  });

  it('loadCourses: GET /api/v1/concepts/courses + Bearer + render danh sách', async () => {
    const w = await mountCourseTab();

    const calls = getCalls(fetchMock);
    const loadCall = calls.find((c) => c.url.endsWith('/api/v1/concepts/courses') && (c.init?.method ?? 'GET') === 'GET');
    expect(loadCall).toBeTruthy();
    const headers = loadCall?.init?.headers as Record<string, string> | undefined;
    expect(headers?.['Authorization']).toBe('Bearer teacher-token');

    expect(w.text()).toContain('Sorting Course');
    expect(w.text()).toContain('Graph Course');
  });

  it('create course: POST /api/v1/concepts/courses + payload có field thumbnail (TC-009)', async () => {
    const w = await mountCourseTab();
    await w.find('.btn-toggle-form').trigger('click');
    await nextTick();

    await w.find('input[placeholder*="Thuật toán Sắp xếp Cơ bản"]').setValue('My New Course');
    await w.find('textarea[placeholder*="Nhập mô tả"]').setValue('My description');
    await w.find('.btn-submit').trigger('click');
    await flushPromises();
    await nextTick();

    const calls = getCalls(fetchMock);
    const postCall = calls.find((c) => c.init?.method === 'POST');
    expect(postCall).toBeTruthy();
    expect(postCall!.url).toBe(`${BASE_URL}/api/v1/concepts/courses`);

    const body = parseBody(postCall!.init);
    expect(body).toEqual(expect.objectContaining({
      title: 'My New Course',
      description: 'My description',
      category: 'Sorting',
      difficulty: 'Beginner',
      isPremium: false,
      isPublished: true,
    }));
    // TC-009: DTO course dùng field `thumbnail` — không được gửi `coverImageUrl`.
    expect('thumbnail' in body).toBe(true);
    expect('coverImageUrl' in body).toBe(false);
  });

  it('toggle premium/published checkboxes → payload phản ánh đúng (TC-036)', async () => {
    const w = await mountCourseTab();
    await w.find('.btn-toggle-form').trigger('click');
    await nextTick();

    await w.find('input[placeholder*="Thuật toán Sắp xếp Cơ bản"]').setValue('Premium Course');
    await w.find('textarea[placeholder*="Nhập mô tả"]').setValue('Desc premium');
    const checkboxes = w.findAll('input[type="checkbox"]');
    await checkboxes[0].setValue(true); // isPremium
    await checkboxes[1].setValue(false); // isPublished
    await w.find('form').trigger('submit');
    await flushPromises();
    await nextTick();

    const calls = getCalls(fetchMock);
    const postCall = calls.find((c) => c.init?.method === 'POST');
    const body = parseBody(postCall!.init);
    expect(body.isPremium).toBe(true);
    expect(body.isPublished).toBe(false);
  });

  it('upload cover: POST /api/v1/upload/image với FormData và KHÔNG Content-Type (TC-010)', async () => {
    const w = await mountCourseTab();
    await w.find('.btn-toggle-form').trigger('click');
    await nextTick();

    const fileInput = w.find('input[type="file"]');
    const file = new File(['fake-image-bytes'], 'cover.png', { type: 'image/png' });
    Object.defineProperty(fileInput.element, 'files', { value: [file], configurable: true });
    await fileInput.trigger('change');
    await flushPromises();
    await nextTick();

    const calls = getCalls(fetchMock);
    const uploadCall = calls.find((c) => c.url.includes('/api/v1/upload/image'));
    expect(uploadCall).toBeTruthy();
    expect(uploadCall!.url).toBe(`${BASE_URL}/api/v1/upload/image`);
    expect(uploadCall!.init?.method).toBe('POST');
    // TC-010: FormData multipart — gửi Content-Type json sẽ mất boundary → 400 NO_FILE.
    expect(uploadCall!.init?.body).toBeInstanceOf(FormData);
    const headers = uploadCall!.init?.headers as Record<string, string> | undefined;
    expect(headers?.['Content-Type'] ?? null).toBeNull();
  });

  it('edit course: PUT /api/v1/concepts/courses/{id} + body đầy đủ', async () => {
    const w = await mountCourseTab();
    await w.find('.btn-action--edit').trigger('click');
    await nextTick();

    const titleInput = w.find('input[placeholder*="Thuật toán Sắp xếp Cơ bản"]');
    expect((titleInput.element as HTMLInputElement).value).toBe('Sorting Course');

    await titleInput.setValue('Sorting Course Renamed');
    await w.find('.btn-submit').trigger('click');
    await flushPromises();
    await nextTick();

    const calls = getCalls(fetchMock);
    const putCall = calls.find((c) => c.init?.method === 'PUT');
    expect(putCall).toBeTruthy();
    expect(putCall!.url).toBe(`${BASE_URL}/api/v1/concepts/courses/c1`);
    const body = parseBody(putCall!.init);
    expect(body.title).toBe('Sorting Course Renamed');
    expect(body.category).toBe('Sorting');
    expect(body.isPublished).toBe(true);
  });

  it('create lesson: POST /api/v1/concepts/courses/{id}/lessons + payload đầy đủ (TC-036)', async () => {
    const w = await mountCourseTab();

    // Mở accordion khóa c1 → tải lessons.
    const courseRow = w.findAll('tr').find((tr) => tr.text().includes('Sorting Course'));
    expect(courseRow).toBeTruthy();
    await courseRow!.trigger('click');
    await flushPromises();
    await nextTick();
    expect(w.text()).toContain('Bubble Sort');

    await w.find('.btn-add-inline').trigger('click');
    await nextTick();

    await w.find('input[placeholder*="Sắp xếp Nổi bọt (Bubble Sort)"]').setValue('Merge Sort Lesson');
    await w.find('textarea[placeholder*="Tiêu đề lớn"]').setValue('# Merge Sort');
    await w.find('.btn-submit').trigger('click');
    await flushPromises();
    await nextTick();

    const calls = getCalls(fetchMock);
    const postCall = calls.find((c) => c.init?.method === 'POST' && c.url.includes('/lessons'));
    expect(postCall).toBeTruthy();
    expect(postCall!.url).toBe(`${BASE_URL}/api/v1/concepts/courses/c1/lessons`);
    expect(parseBody(postCall!.init)).toEqual(expect.objectContaining({
      title: 'Merge Sort Lesson',
      contentMd: '# Merge Sort',
      sandboxType: 'sorting',
      sandboxConfig: '{}',
      quizId: null,
      xpReward: 20,
      // có sẵn 1 bài (Bubble Sort) → orderIndex tự động = length + 1 = 2.
      orderIndex: 2,
    }));
  });

  it('delete course: confirm(true) → DELETE /api/v1/concepts/courses/{id}; confirm(false) → không gọi (TC-038)', async () => {
    const w = await mountCourseTab();

    await w.find('.btn-action--delete').trigger('click');
    await flushPromises();
    await nextTick();

    const calls = getCalls(fetchMock);
    const deleteCall = calls.find((c) => c.init?.method === 'DELETE');
    expect(deleteCall).toBeTruthy();
    expect(deleteCall!.url).toBe(`${BASE_URL}/api/v1/concepts/courses/c1`);

    fetchMock.mockClear();
    vi.mocked(window.confirm).mockReturnValue(false);
    await w.find('.btn-action--delete').trigger('click');
    await flushPromises();
    await nextTick();
    expect(fetchMock.mock.calls.some((call: unknown[]) => (call[1] as RequestInit | undefined)?.method === 'DELETE')).toBe(false);
  });
});
