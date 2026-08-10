// @vitest-environment jsdom
// QZ-051: file cũ mock 100% service của nó (userProgressApi) — test "Quiz→XP"
// chỉ gọi thẳng syncXP, không đi qua submit thật. Bổ sung integration test
// lesson→quiz→XP: component LessonStepQuiz + useLessonStore + lessonApi THẬT,
// chỉ mock lớp mạng (global fetch).
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mount } from '@vue/test-utils';
import { useUserProgressStore } from '../../features/user-progress/store/useUserProgressStore';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { useLessonStore } from '../../features/lesson/store/useLessonStore';
import LessonStepQuiz from '../../views/lesson/components/LessonStepQuiz.vue';
import BaseIcon from '../../shared/components/BaseIcon.vue';
import * as userProgressApi from '../../features/user-progress/service/userProgressApi';


vi.mock('../../features/user-progress/service/userProgressApi', () => {
  return {
    fetchUserProgress: vi.fn(),
    syncXPToServer: vi.fn(),
    markModuleComplete: vi.fn(),
    ApiError: class ApiError extends Error {
      status: number;
      constructor(message: string, status: number) {
        super(message);
        this.status = status;
      }
    }
  };
});

describe('E2E Learning Flow Integration Test (Vitest Mock)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    
    
    const authStore = useAuthStore();
    vi.spyOn(authStore, 'getAccessToken').mockReturnValue('mock-jwt-token');
    authStore.statelessUser = { id: 'user-1', email: 'test@example.com', roles: ['Student'] } as any;
  });

  it('phải mô phỏng toàn bộ luồng: Xem bài giảng -> Làm Quiz -> Gõ Code -> Chấm điểm -> Qua bài mới', async () => {
    const progressStore = useUserProgressStore();
    
    
    vi.mocked(userProgressApi.fetchUserProgress).mockResolvedValueOnce({
      totalXP: 100,
      currentLevel: 2,
      xpToNextLevel: 150,
      levelProgressPercent: 50,
      badgesEarned: 1,
      modulesCompleted: 1,
      currentStreak: 1,
      completedModuleIds: ['lesson-1-id'],
      badges: []
    });

    await progressStore.loadProgress();
    expect(progressStore.totalXP).toBe(100);
    expect(progressStore.isModuleCompleted('lesson-1-id')).toBe(true);
    expect(progressStore.isModuleCompleted('quiz-1-id')).toBe(false);

    
    vi.mocked(userProgressApi.syncXPToServer).mockResolvedValueOnce({
      message: 'OK',
      totalXP: 150,
      currentLevel: 2
    });
    vi.mocked(userProgressApi.markModuleComplete).mockResolvedValueOnce();

    await progressStore.syncXP(50, 'Completed Quiz 1');
    await progressStore.completeModule('quiz-1-id');

    expect(progressStore.totalXP).toBe(150);
    expect(progressStore.isModuleCompleted('quiz-1-id')).toBe(true);

    
    
    vi.mocked(userProgressApi.syncXPToServer).mockResolvedValueOnce({
      message: 'OK',
      totalXP: 250,
      currentLevel: 3
    });
    vi.mocked(userProgressApi.markModuleComplete).mockResolvedValueOnce();

    await progressStore.syncXP(100, 'Completed Codelab 1');
    await progressStore.completeModule('codelab-1-id');

    
    expect(progressStore.totalXP).toBe(250);
    expect(progressStore.currentLevel).toBe(3);
    expect(progressStore.isModuleCompleted('codelab-1-id')).toBe(true);
  });
  
  it('phải tự động rollback trạng thái local nếu Backend từ chối XP (HTTP 400)', async () => {
    const progressStore = useUserProgressStore();
    
    vi.mocked(userProgressApi.fetchUserProgress).mockResolvedValue({
      totalXP: 50,
      currentLevel: 1,
      xpToNextLevel: 50,
      levelProgressPercent: 50,
      badgesEarned: 0,
      modulesCompleted: 0,
      currentStreak: 1,
      completedModuleIds: [],
      badges: []
    });

    await progressStore.loadProgress();
    expect(progressStore.totalXP).toBe(50);

    
    vi.mocked(userProgressApi.syncXPToServer).mockRejectedValueOnce(
      new userProgressApi.ApiError("Invalid XP submission", 400)
    );

    await progressStore.syncXP(1000, 'Hacked Quiz');
    
    
    expect(progressStore.totalXP).toBe(50); 
  });

  describe('QZ-051: Integration lesson→quiz→XP qua submit THẬT (chỉ mock fetch)', () => {
    // Route mock fetch theo URL — services/lessonApi + statelessQuizApi + awardXp
    // vẫn chạy code THẬT (không mock module).
    function stubNetworkFetch(): ReturnType<typeof vi.fn> {
      const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        const method = init?.method ?? 'GET';
        const json = (data: unknown) => Promise.resolve({
          ok: true,
          status: 200,
          json: async () => data,
        });

        if (method === 'GET' && url.includes('/api/v1/concepts/lessons/integration-lesson')) {
          return json({
            id: 'integration-lesson',
            courseId: 'course-1',
            courseTitle: 'Course',
            title: 'Integration Lesson',
            contentMd: '# Bài học tích hợp',
            sandboxType: 'array',
            sandboxConfig: '',
            quizId: 'lesson-quiz',
            xpReward: 100,
            orderIndex: 1,
            status: 'active',
            lastActiveFrameIndex: 0,
            lastScrollPercent: 0,
          });
        }
        if (method === 'GET' && url.includes('/api/v1/concepts/auth/progress/')) {
          return json({ hasWatchedVisualizer: false, quizScore: null, codelabCompleted: false, xpAwarded: 0, totalXp: 0 });
        }
        if (method === 'GET' && url.includes('/api/v1/concepts/quiz/lesson-quiz')) {
          return json({
            id: 'lesson-quiz',
            title: 'Lesson Quiz',
            topic: 'DSA',
            difficulty: 'easy',
            xpReward: 100,
            questions: [
              { id: 'iq1', text: 'Câu 1?', options: ['A', 'B'], correctIndex: 0, explanation: 'E1' },
              { id: 'iq2', text: 'Câu 2?', options: ['A', 'B'], correctIndex: 0, explanation: 'E2' },
              { id: 'iq3', text: 'Câu 3?', options: ['A', 'B'], correctIndex: 0, explanation: 'E3' },
              { id: 'iq4', text: 'Câu 4?', options: ['A', 'B'], correctIndex: 0, explanation: 'E4' },
            ],
          });
        }
        if (method === 'POST' && url.includes('/api/v1/concepts/auth/progress/')) {
          return json({ success: true });
        }
        if (method === 'POST' && url.includes('/api/v1/concepts/auth/award-xp')) {
          const body = JSON.parse(String(init?.body ?? '{}')) as { amount?: number };
          return json({ success: true, xp: body.amount ?? 0 });
        }
        return Promise.reject(new Error(`Unmocked fetch: ${method} ${url}`));
      });
      vi.stubGlobal('fetch', fetchMock);
      return fetchMock;
    }

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    beforeEach(() => {
      // jsdom env dùng chung 1 localStorage cho cả file — test 1 lưu tiến trình
      // lesson phải không rò rỉ sang test 2 (xpAwarded kế thừa 100).
      localStorage.clear();
    });

    it('hoàn thành quiz qua LessonStepQuiz thật → submitQuiz → awardXp(100) qua fetch', async () => {
      const fetchMock = stubNetworkFetch();
      const lessonStore = useLessonStore();
      await lessonStore.loadLesson('integration-lesson');

      expect(lessonStore.currentLesson).not.toBeNull();
      expect(lessonStore.currentLesson?.quizQuestions).toHaveLength(4);

      const questions = lessonStore.currentLesson!.quizQuestions!;
      const wrapper = mount(LessonStepQuiz, {
        props: { questions },
        global: { components: { BaseIcon } },
      });

      // Trả lời đúng cả 4 câu (mỗi câu 2 phương án A/B — button i*2 + 0)
      for (let i = 0; i < questions.length; i++) {
        await wrapper.findAll('button')[i * 2].trigger('click');
      }
      await wrapper.findAll('button').find(b => b.text().includes('Nộp Bài Quiz'))!.trigger('click');

      const answers = wrapper.emitted('submit')![0][0] as Record<string, number>;
      await lessonStore.submitQuiz(answers);

      expect(lessonStore.quizScore).toBe(4);
      expect(lessonStore.quizPassed).toBe(true);
      expect(lessonStore.xpAwarded).toBe(100);

      const xpCalls = fetchMock.mock.calls.filter(
        (call) => String(call[0]).includes('/api/v1/concepts/auth/award-xp') && (call[1]?.method ?? 'GET') === 'POST',
      );
      expect(xpCalls).toHaveLength(1);
      const body = JSON.parse(String(xpCalls[0][1]?.body)) as { amount: number; reason: string };
      expect(body.amount).toBe(100);
      expect(body.reason).toContain('Integration Lesson');

      // Không đi đường tắt: kênh XP của user-progress KHÔNG được gọi trong luồng này
      expect(userProgressApi.syncXPToServer).not.toHaveBeenCalled();

      wrapper.unmount();
    });

    it('submit quiz lần 2 → xpAwarded không tăng thêm (cap per-lesson)', async () => {
      const fetchMock = stubNetworkFetch();
      const lessonStore = useLessonStore();
      await lessonStore.loadLesson('integration-lesson');
      const questions = lessonStore.currentLesson!.quizQuestions!;

      const answers: Record<string, number> = {};
      for (const q of questions) answers[q.id] = 0;

      await lessonStore.submitQuiz(answers);
      expect(lessonStore.xpAwarded).toBe(100);

      await lessonStore.submitQuiz(answers);
      expect(lessonStore.xpAwarded).toBe(100);

      const xpCalls = fetchMock.mock.calls.filter(
        (call) => String(call[0]).includes('/api/v1/concepts/auth/award-xp') && (call[1]?.method ?? 'GET') === 'POST',
      );
      expect(xpCalls).toHaveLength(1);
    });
  });
});
