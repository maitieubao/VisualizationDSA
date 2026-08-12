// @vitest-environment jsdom
// TC-040 (P2): QuizBuilderTab spec — mount TAB THẬT + useQuizBuilder THẬT (fetch stub).
//  - list render, filter (TC-007), accordion, delete confirm (ConfirmModal),
//  - saveQuestion wire gọi addQuestionToQuiz (TC-008), create/edit quiz qua modals thật.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import BaseIcon from '../../../shared/components/BaseIcon.vue';

vi.mock('../../../features/auth/store/useAuthStore', () => ({
  useAuthStore: () => ({
    getAccessToken: () => 'teacher-token',
    refreshAccessToken: vi.fn(),
    impersonate: vi.fn(),
    currentUser: { id: 'teacher-001' },
  }),
}));

import QuizBuilderTab from '../QuizBuilderTab.vue';

const BASE_URL = 'http://localhost:5055';

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return { ok, status, statusText: ok ? 'OK' : 'Error', json: async () => body } as unknown as Response;
}

interface FetchCall {
  url: string;
  init?: RequestInit;
}

function getCalls(fetchMock: ReturnType<typeof vi.fn>): FetchCall[] {
  return (fetchMock.mock.calls as [string, RequestInit?][]).map(([url, init]) => ({ url, init }));
}

const sampleQuiz = (id: string, title: string, topic: string): Record<string, unknown> => ({
  id, title, topic, difficulty: 'easy', xpReward: 50, questionCount: 2, description: 'Mô tả quiz',
});

let fetchMock: ReturnType<typeof vi.fn>;
let wrapper: VueWrapper | null = null;

async function mountTab(): Promise<VueWrapper> {
  wrapper = mount(QuizBuilderTab, {
    attachTo: document.body,
    global: { components: { BaseIcon } },
  });
  await flushPromises();
  await nextTick();
  return wrapper;
}

describe('QuizBuilderTab — Contract Spec (TC-040)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      const u = String(url);
      if (init?.method === 'DELETE') return jsonResponse({ success: true });
      if (init?.method === 'POST') return jsonResponse({ message: 'Created' });
      if (init?.method === 'PUT') return jsonResponse({ message: 'Updated' });
      if (u.includes('/api/v1/concepts/quiz/') && u.includes('withAnswers=true')) {
        return jsonResponse([{ id: 'qs1', question: 'Bubble sort complexity?', options: ['O(n^2)', 'O(n)', 'O(log n)', 'O(1)'], correctIndex: 0, explanation: 'Trung bình O(n^2)' }]);
      }
      if (u.includes('/api/v1/concepts/quiz/all')) {
        return jsonResponse({ quizzes: [] });
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

  it('renders empty state "Chưa có Quiz nào" khi backend trả danh sách rỗng', async () => {
    const w = await mountTab();
    expect(w.text()).toContain('Chưa có Quiz nào');
    expect(w.text()).toContain('Tạo Quiz đầu tiên');
  });

  it('loads list via GET /api/v1/concepts/quiz/all + render rows (TC-040)', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (String(url).includes('/api/v1/concepts/quiz/all')) {
        return jsonResponse({ quizzes: [sampleQuiz('q1', 'Sorting Basics', 'sorting'), sampleQuiz('q2', 'Graph Theory', 'graph')] });
      }
      return jsonResponse({});
    });

    const w = await mountTab();

    const calls = getCalls(fetchMock);
    const loadCall = calls.find((c) => c.url.includes('/api/v1/concepts/quiz/all'));
    expect(loadCall).toBeTruthy();
    expect(loadCall!.url).toBe(`${BASE_URL}/api/v1/concepts/quiz/all`);
    expect(loadCall!.init?.method ?? 'GET').toBe('GET');

    expect(w.text()).toContain('Sorting Basics');
    expect(w.text()).toContain('Graph Theory');
    expect(w.text()).toContain('+50 XP');
  });

  it('filter: gõ search → chỉ render quiz khớp (TC-007/TC-040)', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (String(url).includes('/api/v1/concepts/quiz/all')) {
        return jsonResponse({ quizzes: [sampleQuiz('q1', 'Sorting Basics', 'sorting'), sampleQuiz('q2', 'Graph Theory', 'graph')] });
      }
      return jsonResponse({});
    });
    const w = await mountTab();

    const searchInput = w.find('input[placeholder="Tìm kiếm quiz..."]');
    await searchInput.setValue('Graph');
    await nextTick();

    expect(w.text()).toContain('Graph Theory');
    expect(w.text()).not.toContain('Sorting Basics');
  });

  it('filter: chọn topic → chỉ render quiz cùng topic (TC-040)', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (String(url).includes('/api/v1/concepts/quiz/all')) {
        return jsonResponse({ quizzes: [sampleQuiz('q1', 'Sorting Basics', 'sorting'), sampleQuiz('q2', 'Graph Theory', 'graph')] });
      }
      return jsonResponse({});
    });
    const w = await mountTab();

    const selects = w.findAll('select');
    await selects[0].setValue('graph');
    await nextTick();

    expect(w.text()).toContain('Graph Theory');
    expect(w.text()).not.toContain('Sorting Basics');
  });

  it('accordion: click hàng quiz → GET detail withAnswers + render câu hỏi (TC-040)', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      const u = String(url);
      if (u.includes('/api/v1/concepts/quiz/all')) {
        return jsonResponse({ quizzes: [sampleQuiz('q1', 'Sorting Basics', 'sorting')] });
      }
      if (u.includes('/api/v1/concepts/quiz/q1?withAnswers=true')) {
        return jsonResponse([{ id: 'qs1', question: 'Bubble sort complexity?', options: ['O(n^2)', 'O(n)'], correctIndex: 0, explanation: 'Trung bình O(n^2)' }]);
      }
      return jsonResponse({});
    });
    const w = await mountTab();

    const firstRow = w.findAll('tbody tr')[0];
    await firstRow.trigger('click');
    await flushPromises();
    await nextTick();

    const detailCall = getCalls(fetchMock).find((c) => c.url.includes('withAnswers=true'));
    expect(detailCall).toBeTruthy();
    expect(detailCall!.url).toBe(`${BASE_URL}/api/v1/concepts/quiz/q1?withAnswers=true`);

    expect(w.text()).toContain('Bubble sort complexity?');
    expect(w.text()).toContain('O(n^2)');
    expect(w.text()).toContain('Giải thích:');
  });

  it('delete quiz: ConfirmModal confirm → DELETE /api/v1/concepts/quiz/manage/{id} (TC-040)', async () => {
    fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
      const u = String(url);
      if (init?.method === 'DELETE') return jsonResponse({ success: true });
      if (u.includes('/api/v1/concepts/quiz/all')) {
        return jsonResponse({ quizzes: [sampleQuiz('q1', 'Sorting Basics', 'sorting')] });
      }
      return jsonResponse({});
    });
    const w = await mountTab();

    const deleteBtn = w.findAll('button').find((b) => b.attributes('title') === 'Xóa');
    expect(deleteBtn).toBeTruthy();
    await deleteBtn!.trigger('click');
    await nextTick();

    const modal = w.find('.modal-overlay');
    expect(modal.exists()).toBe(true);
    expect(modal.text()).toContain('Xóa Quiz');

    const confirmBtn = modal.findAll('button').find((b) => b.text().trim() === 'Xóa');
    expect(confirmBtn).toBeTruthy();
    await confirmBtn!.trigger('click');
    await flushPromises();
    await nextTick();

    const deleteCalls = getCalls(fetchMock).filter((c) => c.init?.method === 'DELETE');
    expect(deleteCalls).toHaveLength(1);
    expect(deleteCalls[0].url).toBe(`${BASE_URL}/api/v1/concepts/quiz/manage/q1`);
  });

  it('create quiz qua QuizFormModal → POST /api/v1/concepts/quiz/manage payload (TC-040)', async () => {
    // topics của select lấy từ danh sách quiz đã load → mock có topic để option tồn tại.
    fetchMock.mockImplementation(async (url: string) => {
      if (String(url).includes('/api/v1/concepts/quiz/all')) {
        return jsonResponse({ quizzes: [sampleQuiz('q1', 'Sorting Basics', 'sorting'), sampleQuiz('q2', 'Graph Theory', 'graph')] });
      }
      return jsonResponse({});
    });
    const w = await mountTab();

    await w.find('.btn-primary').trigger('click');
    await nextTick();

    const modal = w.find('.modal-overlay');
    expect(modal.text()).toContain('Tạo Quiz mới');

    await modal.find('input[type="text"]').setValue('New Sorting Quiz');
    await modal.findAll('select')[0].setValue('sorting');
    // jsdom quirk: click submit button không luôn kích hoạt form submit → trigger trực tiếp.
    await modal.find('form').trigger('submit');
    await flushPromises();
    await nextTick();

    const postCalls = getCalls(fetchMock).filter((c) => c.init?.method === 'POST' && c.url.endsWith('/api/v1/concepts/quiz/manage'));
    expect(postCalls).toHaveLength(1);
    expect(postCalls[0].url).toBe(`${BASE_URL}/api/v1/concepts/quiz/manage`);
    const body = JSON.parse(String(postCalls[0].init?.body)) as Record<string, unknown>;
    expect(body).toEqual({
      title: 'New Sorting Quiz',
      topic: 'sorting',
      // TC-031: difficulty chuẩn hóa về nhãn easy/medium/hard (3 → 'medium').
      difficulty: 'medium',
      xpReward: 50,
      questions: [],
    });
  });

  it('edit quiz qua QuizFormModal → PUT /api/v1/concepts/quiz/manage/{id} (TC-040)', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (String(url).includes('/api/v1/concepts/quiz/all')) {
        return jsonResponse({ quizzes: [sampleQuiz('q1', 'Sorting Basics', 'sorting')] });
      }
      return jsonResponse({});
    });
    const w = await mountTab();

    const editBtn = w.findAll('button').find((b) => b.attributes('title') === 'Chỉnh sửa');
    await editBtn!.trigger('click');
    await nextTick();

    const modal = w.find('.modal-overlay');
    expect(modal.text()).toContain('Chỉnh sửa Quiz');

    const titleInput = modal.find('input[type="text"]');
    expect((titleInput.element as HTMLInputElement).value).toBe('Sorting Basics');
    await titleInput.setValue('Sorting Basics V2');
    // jsdom quirk: click submit button không luôn kích hoạt form submit → trigger trực tiếp.
    await modal.find('form').trigger('submit');
    await flushPromises();
    await nextTick();

    const putCalls = getCalls(fetchMock).filter((c) => c.init?.method === 'PUT');
    expect(putCalls).toHaveLength(1);
    expect(putCalls[0].url).toBe(`${BASE_URL}/api/v1/concepts/quiz/manage/q1`);
    const body = JSON.parse(String(putCalls[0].init?.body)) as Record<string, unknown>;
    expect(body.title).toBe('Sorting Basics V2');
  });

  it('saveQuestion: "Thêm câu hỏi" mở QuestionFormModal → save → POST manage/{quizId}/questions (TC-008/TC-040)', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      const u = String(url);
      if (u.includes('/api/v1/concepts/quiz/all')) {
        return jsonResponse({ quizzes: [sampleQuiz('q1', 'Sorting Basics', 'sorting')] });
      }
      if (u.includes('withAnswers=true')) {
        return jsonResponse([]);
      }
      if (u.includes('/questions') ) {
        return jsonResponse({ success: true });
      }
      return jsonResponse({});
    });
    const w = await mountTab();

    const firstRow = w.findAll('tbody tr')[0];
    await firstRow.trigger('click');
    await flushPromises();
    await nextTick();

    const addQuestionBtn = w.findAll('button').find((b) => b.text().includes('Thêm câu hỏi'));
    expect(addQuestionBtn).toBeTruthy();
    await addQuestionBtn!.trigger('click');
    await nextTick();

    const modal = w.find('.modal-overlay');
    expect(modal.exists()).toBe(true);
    expect(modal.text()).toContain('Thêm Câu hỏi mới');

    await modal.find('textarea').setValue('What is 2+2?');
    const optionInputs = modal.findAll('input[placeholder^="Đáp án"]');
    await optionInputs[0].setValue('3');
    await optionInputs[1].setValue('4');
    await modal.find('form').trigger('submit');
    await flushPromises();
    await nextTick();

    const postCalls = getCalls(fetchMock).filter((c) => c.init?.method === 'POST' && c.url.includes('/questions'));
    expect(postCalls).toHaveLength(1);
    expect(postCalls[0].url).toBe(`${BASE_URL}/api/v1/concepts/quiz/manage/q1/questions`);
    const body = JSON.parse(String(postCalls[0].init?.body)) as Record<string, unknown>;
    expect(body).toEqual({
      question: 'What is 2+2?',
      options: ['3', '4'],
      correctIndex: 0,
      explanation: '',
    });
  });
});
