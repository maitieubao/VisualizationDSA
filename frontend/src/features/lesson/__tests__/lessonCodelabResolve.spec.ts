// @vitest-environment jsdom
// A1.3 (CONTRACT MỚI — Roadmap A1.5): useLessonStore.resolve codelab.
//   • Lesson detail có codelabId → codelabTask lấy TỪ PAYLOAD API (không tra registry)
//   • Lesson detail KHÔNG có codelabId → fallback registry theo sandboxConfig demo
//     (bảo toàn hành vi cũ — codelabTask từ CODELAB_TASK_REGISTRY)
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useLessonStore } from '../store/useLessonStore';
import { fetchLessonDetail, type LessonDetailResponse } from '../services/lessonApi';
import { CODELAB_TASK_REGISTRY } from '../utils/codelabTaskRegistry';
import type { CodeLabTask } from '../types/lesson.types';

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

vi.mock('../../../services/courseApi', () => ({
  courseApi: { getCourseById: vi.fn() },
}));

/** Shape backend mới (A1.2): LessonDetailResponse mở rộng codelabId + codelabTask. */
type LessonDetailWithCodelab = LessonDetailResponse & {
  codelabId?: string | null;
  codelabTask?: CodeLabTask | null;
};

function makeDetail(overrides: Partial<LessonDetailWithCodelab> = {}): LessonDetailWithCodelab {
  return {
    id: 'backend-lesson-1',
    courseId: 'course-1',
    courseTitle: 'Course',
    title: 'Bài học backend',
    contentMd: '# Lý thuyết',
    sandboxType: 'sorting',
    sandboxConfig: '{"demo":"bubble-sort"}',
    quizId: null,
    xpReward: 30,
    orderIndex: 1,
    status: 'NotStarted',
    lastActiveFrameIndex: 0,
    lastScrollPercent: 0,
    ...overrides,
  };
}

const mockedFetchLessonDetail = vi.mocked(fetchLessonDetail);

describe('useLessonStore — resolve codelabTask (A1.3 CONTRACT MỚI)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
    localStorage.setItem('token', 'token-abc');
  });

  it('A1.3.1 lesson có codelabId → codelabTask = payload API (KHÔNG dùng registry demo)', async () => {
    const apiTask: CodeLabTask = {
      description: 'Task codelab thật do teacher gắn',
      initialCode: 'function f(arr) {\n  return arr;\n}',
      solution: 'function f(arr) {\n  return arr.sort((a, b) => a - b);\n}',
      testCases: [
        { input: '[[3, 1, 2]]', expectedOutput: '[1, 2, 3]' },
        { input: '[[]]', expectedOutput: '[]', isHidden: true },
      ],
      entryFunction: 'f',
      hints: ['Hint gắn thật'],
    };
    // sandboxConfig vẫn có demo binary-search nhưng VÌ có codelabId nên registry bị bỏ qua.
    mockedFetchLessonDetail.mockResolvedValueOnce(makeDetail({
      sandboxType: 'searching',
      sandboxConfig: '{"demo":"binary-search"}',
      codelabId: 'cl-backend-1',
      codelabTask: apiTask,
    }) as LessonDetailResponse);

    const store = useLessonStore();
    await store.loadLesson('backend-lesson-1');

    expect(store.currentLesson?.codelabTask).toEqual(apiTask);
    expect(store.currentLesson?.codelabTask?.entryFunction).toBe('f');
    // Chứng minh KHÔNG phải registry (binary-search đã có sẵn).
    expect(store.currentLesson?.codelabTask).not.toEqual(CODELAB_TASK_REGISTRY['binary-search']);
  });

  it('A1.3.2 lesson KHÔNG có codelabId → fallback registry theo sandboxConfig demo (hành vi cũ bảo toàn)', async () => {
    mockedFetchLessonDetail.mockResolvedValueOnce(makeDetail({ sandboxConfig: '{"demo":"bubble-sort"}' }) as LessonDetailResponse);

    const store = useLessonStore();
    await store.loadLesson('backend-lesson-1');

    expect(store.currentLesson?.codelabTask).toEqual(CODELAB_TASK_REGISTRY['bubble-sort']);
    expect(store.currentLesson?.codelabTask?.entryFunction).toBe('bubbleSort');
  });

  it('A1.3.3 lesson KHÔNG có codelabId + demo lạ → codelabTask undefined (không crash)', async () => {
    mockedFetchLessonDetail.mockResolvedValueOnce(makeDetail({ sandboxConfig: '{"demo":"khong-ton-tai-demo"}' }) as LessonDetailResponse);

    const store = useLessonStore();
    await store.loadLesson('backend-lesson-1');

    expect(store.currentLesson?.codelabTask).toBeUndefined();
    expect(store.isLoading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('A2.3.1 lesson có codelabId nhưng payload codelabTask null (backend trả field `codelab`) → store không dùng registry', async () => {
    // A2: backend trả codelab dưới field `codelab` — lessonApi đã map sang `codelabTask`.
    // Store nhận payload CHUẨN (codelabTask) là nguồn ưu tiên tuyệt đối, kể cả khi bài
    // KHÔNG có sandboxConfig demo — chứng minh không fallback registry gây nhầm nội dung.
    const apiTask: CodeLabTask = {
      description: 'Task BFS chuẩn hoá từ backend',
      initialCode: 'function solution(graph, start) { return [start]; }',
      solution: '',
      testCases: [{ input: '[[[1, 2], [0], [0]], 0]', expectedOutput: '[0, 1, 2]' }],
      entryFunction: undefined,
      hints: ['Dùng queue FIFO'],
      difficulty: 'Trung bình',
    };
    mockedFetchLessonDetail.mockResolvedValueOnce(makeDetail({
      sandboxType: 'graph',
      sandboxConfig: '{}',
      codelabId: 'cl-backend-bfs',
      codelabTask: apiTask,
    }) as LessonDetailResponse);

    const store = useLessonStore();
    await store.loadLesson('backend-lesson-1');

    expect(store.currentLesson?.codelabTask).toEqual(apiTask);
    expect(store.currentLesson?.codelabTask?.entryFunction).toBeUndefined();
    expect(store.currentLesson?.codelabTask?.difficulty).toBe('Trung bình');
    // Lesson codelabTask không được là registry (bài này demo = {} → registry trống).
    expect(store.currentLesson?.codelabTask?.description).toContain('BFS');
  });
});
