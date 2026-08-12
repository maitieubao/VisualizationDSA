// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useLessonStore } from '../store/useLessonStore';
import type { LessonDetailResponse } from '../services/lessonApi';

vi.mock('../services/lessonApi', () => ({
  fetchLessonDetail: vi.fn(),
  fetchLessonProgress: vi.fn(async () => ({})),
  saveLessonProgress: vi.fn(async () => true),
  awardXp: vi.fn(async () => ({ xp: 0 })),
  getLessonAuthToken: vi.fn(() => 'token-abc'),
}));

vi.mock('../../quiz-system/service/statelessQuizApi', () => ({
  statelessQuizApi: {
    getAllQuizzes: vi.fn(),
    getTopics: vi.fn(),
    getQuizById: vi.fn(),
    getQuizzesByTopic: vi.fn(),
    submitAttempt: vi.fn(),
  },
}));

import { fetchLessonDetail } from '../services/lessonApi';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

function makeDetail(id: string, title: string): LessonDetailResponse {
  return {
    id,
    title,
    courseId: 'c1',
    courseTitle: 'Course',
    contentMd: '# x',
    sandboxType: '',
    sandboxConfig: '',
    quizId: null,
    xpReward: 10,
    orderIndex: 1,
    status: 'NotStarted',
    lastActiveFrameIndex: 0,
    lastScrollPercent: 0,
  };
}

describe('useLessonStore — race đổi bài A→B (LM-046)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    localStorage.setItem('token', 'token-abc');
    vi.clearAllMocks();
  });

  it('LM-046: loadLesson(A) chậm rồi loadLesson(B) nhanh → kết quả B, response A trả sau bị bỏ', async () => {
    const dA = deferred<LessonDetailResponse>();
    const dB = deferred<LessonDetailResponse>();
    vi.mocked(fetchLessonDetail)
      .mockReturnValueOnce(dA.promise)
      .mockReturnValueOnce(dB.promise);

    const store = useLessonStore();
    const pA = store.loadLesson('lesson-a');
    const pB = store.loadLesson('lesson-b');

    dB.resolve(makeDetail('lesson-b', 'Lesson B'));
    await pB;
    expect(store.currentLesson?.title).toBe('Lesson B');

    dA.resolve(makeDetail('lesson-a', 'Lesson A'));
    await pA;
    expect(store.currentLesson?.title).toBe('Lesson B');
    expect(store.error).toBeNull();
    expect(store.isLoading).toBe(false);
  });

  it('LM-046: không race — chỉ loadLesson(A) → kết quả A', async () => {
    const dA = deferred<LessonDetailResponse>();
    vi.mocked(fetchLessonDetail).mockReturnValueOnce(dA.promise);

    const store = useLessonStore();
    const pA = store.loadLesson('lesson-a');
    dA.resolve(makeDetail('lesson-a', 'Lesson A'));
    await pA;

    expect(store.currentLesson?.title).toBe('Lesson A');
    expect(store.isLoading).toBe(false);
  });

  it('LM-046: loadLesson(B) reject (403) khi A đang chờ → response A trả sau bị bỏ, giữ error B', async () => {
    const dA = deferred<LessonDetailResponse>();
    const dB = deferred<LessonDetailResponse>();
    vi.mocked(fetchLessonDetail)
      .mockReturnValueOnce(dA.promise)
      .mockReturnValueOnce(dB.promise);

    const store = useLessonStore();
    const pA = store.loadLesson('lesson-a');
    const pB = store.loadLesson('lesson-b');

    dB.reject(Object.assign(new Error('Forbidden'), { status: 403 }));
    await pB;
    expect(store.error).toBe('Bài học này yêu cầu tài khoản Premium để truy cập.');
    expect(store.currentLesson).toBeNull();

    dA.resolve(makeDetail('lesson-a', 'Lesson A'));
    await pA;
    expect(store.currentLesson).toBeNull();
    expect(store.error).toBe('Bài học này yêu cầu tài khoản Premium để truy cập.');
  });
});
