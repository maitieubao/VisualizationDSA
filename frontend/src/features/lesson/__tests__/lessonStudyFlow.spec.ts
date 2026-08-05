// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { useLessonStore } from '../store/useLessonStore';
import BaseIcon from '../../../shared/components/BaseIcon.vue';

vi.mock('../services/lessonApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/lessonApi')>();
  return {
    ...actual,
    fetchLessonProgress: vi.fn(async () => ({})),
    saveLessonProgress: vi.fn(async () => true),
    awardXp: vi.fn(async () => ({ xp: 0 })),
    fetchLessonDetail: vi.fn(),
  };
});

vi.mock('../../quiz-system/service/statelessQuizApi', () => ({
  statelessQuizApi: {
    getAllQuizzes: vi.fn(),
    getTopics: vi.fn(),
    getQuizById: vi.fn(),
    getQuizzesByTopic: vi.fn(),
    submitAttempt: vi.fn(),
  },
}));

// ── Mocks cho view test (LessonStudyView) ──
vi.mock('monaco-editor', () => ({ editor: { create: vi.fn(), setTheme: vi.fn() } }));
vi.mock('monaco-editor/esm/vs/language/typescript/monaco.contribution', () => ({}));
vi.mock('monaco-editor/min/vs/editor/editor.main.css', () => ({}));
vi.mock('monaco-editor/esm/vs/editor/editor.worker?worker', () => ({ default: class WorkerStub {} }));
vi.mock('monaco-editor/esm/vs/language/typescript/ts.worker?worker', () => ({ default: class WorkerStub {} }));
vi.mock('@monaco-editor/loader', () => ({ default: { init: vi.fn(async () => ({ editor: { create: vi.fn() } })) } }));
vi.mock('splitpanes', () => ({
  Splitpanes: { name: 'Splitpanes', template: '<div><slot /></div>' },
  Pane: { name: 'Pane', template: '<div><slot /></div>' },
}));
vi.mock('splitpanes/dist/splitpanes.css', () => ({}));
vi.mock('../../../core/compileWorker', () => ({
  compileInWorker: vi.fn(),
  disposeCompileWorker: vi.fn(),
}));
vi.mock('vue-router', () => ({
  // mockLessonId có thể thay đổi giữa các test (xem TC-A4.2)
  useRoute: () => ({ params: { id: mockLessonId }, query: { courseId: 'course-1' } }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

let mockLessonId = 'quick-sort';

import { fetchLessonDetail, fetchLessonProgress, awardXp } from '../services/lessonApi';
import { statelessQuizApi } from '../../quiz-system/service/statelessQuizApi';
import LessonStudyView from '../../../views/lesson/LessonStudyView.vue';

const mockedFetchLessonDetail = vi.mocked(fetchLessonDetail);
const mockedFetchLessonProgress = vi.mocked(fetchLessonProgress);
const mockedGetQuizById = vi.mocked(statelessQuizApi.getQuizById);
const mockedAwardXp = vi.mocked(awardXp);

describe('useLessonStore.loadLesson — nguồn dữ liệu bài học', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('TC-A1.1: tải lesson local khi chưa đăng nhập (offline-first)', async () => {
    const store = useLessonStore();
    await store.loadLesson('quick-sort');
    expect(store.currentLesson?.title).toBe('Quick Sort - Sắp xếp nhanh');
    expect(store.isLoading).toBe(false);
    expect(store.activeStep).toBe(1);
    expect(store.lessonMeta).toBeNull();
  });

  it('TC-A1.2: dữ liệu backend ghi đè local (title/quiz/codelab từ registry)', async () => {
    mockedFetchLessonDetail.mockResolvedValueOnce({
      id: 'guid-lesson-1',
      courseId: 'course-1',
      courseTitle: 'Nhập môn Cấu trúc dữ liệu & Giải thuật',
      title: 'Tìm kiếm nhị phân',
      contentMd: '# Nội dung từ backend',
      sandboxType: 'searching',
      sandboxConfig: '{"demo":"binary-search"}',
      quizId: 'quiz-binary',
      xpReward: 30,
      orderIndex: 4,
      status: 'NotStarted',
      lastActiveFrameIndex: 0,
      lastScrollPercent: 0,
    });
    mockedGetQuizById.mockResolvedValueOnce({
      id: 'quiz-binary',
      title: 'Trắc nghiệm Tìm kiếm nhị phân',
      topic: 'searching',
      difficulty: '1',
      xpReward: 40,
      questions: [
        { id: 'q1', text: 'Điều kiện để dùng binary search?', options: ['Mảng sắp xếp', 'Mảng ngẫu nhiên'], correctIndex: 0, explanation: 'Cần mảng sắp xếp.' },
        { id: 'q2', text: 'Độ phức tạp?', options: ['O(N)', 'O(log N)'], correctIndex: 1, explanation: 'O(log N).' },
      ],
    });
    localStorage.setItem('token', 'token-abc');

    const store = useLessonStore();
    await store.loadLesson('guid-lesson-1');

    expect(store.currentLesson?.title).toBe('Tìm kiếm nhị phân');
    expect(store.currentLesson?.theoryContent).toContain('Nội dung từ backend');
    expect(store.currentLesson?.quizQuestions).toHaveLength(2);
    expect(store.currentLesson?.quizQuestions?.[0].questionText).toBe('Điều kiện để dùng binary search?');
    expect(store.currentLesson?.codelabTask?.entryFunction).toBe('binarySearch');
    expect(store.lessonMeta?.quizId).toBe('quiz-binary');
    expect(store.lessonMeta?.courseId).toBe('course-1');
  });

  it('TC-A1.3: API lỗi → fallback local; id không tồn tại → error', async () => {
    mockedFetchLessonDetail.mockRejectedValueOnce(new Error('network down'));
    localStorage.setItem('token', 'token-abc');

    const store = useLessonStore();
    await store.loadLesson('quick-sort');
    expect(store.currentLesson?.title).toBe('Quick Sort - Sắp xếp nhanh');
    expect(store.error).toBeNull();

    mockedFetchLessonDetail.mockRejectedValueOnce(new Error('network down'));
    await store.loadLesson('unknown-lesson');
    expect(store.currentLesson).toBeNull();
    expect(store.error).toBe('Không tìm thấy bài học');
  });

  it('TC-A1.4: khôi phục activeStep theo tiến độ đã lưu', async () => {
    localStorage.setItem('lesson_progress_quick-sort', JSON.stringify({ hasWatchedVisualizer: true, quizScore: null, codelabCompleted: false, xpAwarded: 0 }));
    const store = useLessonStore();
    await store.loadLesson('quick-sort');
    expect(store.activeStep).toBe(2);

    localStorage.setItem('lesson_progress_quick-sort', JSON.stringify({ hasWatchedVisualizer: true, quizScore: 4, bestScore: 4, codelabCompleted: false, xpAwarded: 50 }));
    await store.loadLesson('quick-sort');
    expect(store.activeStep).toBe(3);

    localStorage.setItem('lesson_progress_quick-sort', JSON.stringify({ hasWatchedVisualizer: true, quizScore: 4, codelabCompleted: true, xpAwarded: 100 }));
    await store.loadLesson('quick-sort');
    expect(store.activeStep).toBe(4);
  });

  it('TC-A1.4b: tiến độ từ server được merge (quizScore server > local)', async () => {
    mockedFetchLessonDetail.mockRejectedValueOnce(new Error('offline'));
    mockedFetchLessonProgress.mockResolvedValueOnce({ hasWatchedVisualizer: true, quizScore: 4, bestScore: 4, codelabCompleted: false, xpAwarded: 50 });
    localStorage.setItem('token', 'token-abc');

    const store = useLessonStore();
    await store.loadLesson('quick-sort');
    expect(store.quizScore).toBe(4);
    expect(store.hasWatchedVisualizer).toBe(true);
  });

  it('TC-A3.7: submitQuiz lưu quizScore vào localStorage và KHÔNG double-award XP', async () => {
    const store = useLessonStore();
    await store.loadLesson('quick-sort'); // local: 5 câu, xpReward=100 → halfXp=50

    // Đúng 4/5 → pass (ngưỡng ceil(5*0.7)=4)
    const answers = { q1: 3, q2: 2, q3: 1, q4: 1, q5: 0 };
    await store.submitQuiz(answers);

    expect(store.quizScore).toBe(4);
    expect(store.quizPassed).toBe(true);
    expect(mockedAwardXp).toHaveBeenCalledTimes(1);
    expect(mockedAwardXp).toHaveBeenCalledWith(50, expect.stringContaining('Quiz'));
    expect(store.xpAwarded).toBe(50);

    // Verify localStorage
    const saved = JSON.parse(localStorage.getItem('lesson_progress_quick-sort') ?? '{}');
    expect(saved.quizScore).toBe(4);
    expect(saved.xpAwarded).toBe(50);

    // Nộp lại cùng điểm → KHÔNG cộng XP lần 2
    await store.submitQuiz(answers);
    expect(mockedAwardXp).toHaveBeenCalledTimes(1);
    expect(store.xpAwarded).toBe(50);
  });

  it('TC-A3.7b: submitQuiz dưới ngưỡng → không award XP', async () => {
    const store = useLessonStore();
    await store.loadLesson('quick-sort');

    // Đúng 2/5 → fail
    await store.submitQuiz({ q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 });
    expect(store.quizScore).toBe(0);
    expect(store.quizPassed).toBe(false);
    expect(mockedAwardXp).not.toHaveBeenCalled();
    expect(store.xpAwarded).toBe(0);
  });
});

describe('LessonStudyView.vue — render từ store', () => {
  let wrapper: VueWrapper | null = null;

  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
    mockLessonId = 'quick-sort';
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  it('TC-A1.5: hiển thị tiêu đề bài học từ store (không hardcode Bubble Sort)', async () => {
    wrapper = mount(LessonStudyView, {
      attachTo: document.body,
      global: { components: { BaseIcon }, stubs: { RouterLink: true } },
    });
    await flushPromises();
    await nextTick();

    expect(wrapper.text()).toContain('Quick Sort - Sắp xếp nhanh');
    expect(wrapper.text()).not.toContain('Bubble Sort');
    expect(wrapper.text()).toContain('+100 XP');
  });

  it('TC-A4.2: lesson không có codelabTask → chỉ 3 bước (ẩn Code Lab)', async () => {
    mockLessonId = 'backend-lesson-no-codelab';
    mockedFetchLessonDetail.mockResolvedValueOnce({
      id: 'backend-lesson-no-codelab',
      courseId: 'course-1',
      courseTitle: 'Nhập môn Cấu trúc dữ liệu & Giải thuật',
      title: 'Bài học không có CodeLab',
      contentMd: '# Lý thuyết',
      sandboxType: 'dsa',
      sandboxConfig: '{"demo":"khong-ton-tai-demo"}',
      quizId: null,
      xpReward: 20,
      orderIndex: 1,
      status: 'NotStarted',
      lastActiveFrameIndex: 0,
      lastScrollPercent: 0,
    });

    wrapper = mount(LessonStudyView, {
      attachTo: document.body,
      global: { components: { BaseIcon }, stubs: { RouterLink: true } },
    });
    await flushPromises();
    await nextTick();

    expect(wrapper.text()).toContain('Lý Thuyết');
    expect(wrapper.text()).toContain('Trực Quan Hóa');
    expect(wrapper.text()).toContain('Quiz');
    expect(wrapper.text()).not.toContain('Code Lab');
  });
});
