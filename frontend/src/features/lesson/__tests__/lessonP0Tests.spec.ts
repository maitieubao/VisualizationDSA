// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { useLessonStore } from '../store/useLessonStore';
import type { QuizQuestion } from '../types/lesson.types';

vi.mock('../services/lessonApi', () => ({
  fetchLessonDetail: vi.fn(async () => ({
    id: 'x',
    title: 'Test',
    contentMd: '# Test',
    sandboxType: 'sorting',
    quizId: 'q1',
    xpReward: 30,
    courseId: 'c1',
    courseTitle: 'Test Course',
    sandboxConfig: '',
    orderIndex: 0,
    status: 'active',
    lastActiveFrameIndex: 0,
    lastScrollPercent: 0,
  })),
  fetchLessonProgress: vi.fn(async () => ({})),
  saveLessonProgress: vi.fn(async () => true),
  getLessonAuthToken: vi.fn(() => null),
  awardXp: vi.fn(async () => ({ xp: 0 })),
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

import LessonStepQuiz from '../../../views/lesson/components/LessonStepQuiz.vue';
import LessonCompletionModal from '../../../views/lesson/LessonCompletionModal.vue';
import BaseIcon from '../../../shared/components/BaseIcon.vue';

const QUESTIONS: QuizQuestion[] = [
  { id: 'q1', questionText: 'O(1) nghĩa là gì?', options: ['Tuyến tính', 'Hằng số', 'Bình phương'], correctIndex: 1, explanation: 'O(1) là hằng số.' },
  { id: 'q2', questionText: 'Binary search yêu cầu gì?', options: ['Mảng sắp xếp', 'Mảng rỗng'], correctIndex: 0, explanation: 'Cần mảng sắp xếp.' },
  { id: 'q3', questionText: 'Stack là LIFO?', options: ['Đúng', 'Sai'], correctIndex: 0, explanation: 'Stack vào sau ra trước.' },
  { id: 'q4', questionText: 'Bubble sort best case?', options: ['O(N)', 'O(N²)'], correctIndex: 0, explanation: 'Đã sắp xếp thì O(N).' },
];

describe('Lesson + Quiz — P0/P1 User Stories', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('US-LN-006 (P0): Làm quiz bài học', () => {
    it('LessonStepQuiz nhận câu hỏi qua props và render đúng số câu', () => {
      const wrapper = mount(LessonStepQuiz, {
        props: { questions: QUESTIONS },
        global: { components: { BaseIcon } },
      });

      expect(wrapper.text()).toContain('O(1) nghĩa là gì?');
      expect(wrapper.text()).toContain('Stack là LIFO?');
      expect(wrapper.text()).toContain('Mảng sắp xếp');
    });

    it('chọn đáp án cập nhật trạng thái selected', async () => {
      const wrapper = mount(LessonStepQuiz, {
        props: { questions: QUESTIONS },
        global: { components: { BaseIcon } },
      });

      const allButtons = wrapper.findAll('button');
      const optionButtons = allButtons.filter(b =>
        ['Tuyến tính', 'Hằng số', 'Bình phương'].includes(b.text())
      );
      expect(optionButtons).toHaveLength(3);

      await optionButtons[1].trigger('click');
      expect(wrapper.text()).toContain('Đã chọn 1 / 4');
    });
  });

  describe('US-LN-008 (P1): Nộp quiz + xem kết quả', () => {
    it('submitQuiz hiển thị điểm số và emit submit', async () => {
      const wrapper = mount(LessonStepQuiz, {
        props: { questions: QUESTIONS },
        global: { components: { BaseIcon } },
      });

      const pick = (texts: string[], correctIdx: number) => {
        const opts = wrapper.findAll('button').filter(b => texts.includes(b.text()));
        void opts[correctIdx]?.trigger('click');
      };

      pick(['Hằng số', 'Tuyến tính', 'Bình phương'], 1);
      pick(['Mảng sắp xếp', 'Mảng rỗng'], 0);
      pick(['Đúng', 'Sai'], 0);
      pick(['O(N)', 'O(N²)'], 1);

      await wrapper.findAll('button').find(b => b.text().includes('Nộp Bài Quiz'))!.trigger('click');

      expect(wrapper.emitted('submit')).toBeTruthy();
      const answers = wrapper.emitted('submit')![0][0] as Record<string, number>;
      expect(answers).toEqual({ q1: 1, q2: 0, q3: 0, q4: 1 });
      expect(wrapper.text()).toContain('3 / 4');
      expect(wrapper.text()).toContain('75%');
    });

    it('điểm dưới 70% → hiển thị chưa đạt', async () => {
      const wrapper = mount(LessonStepQuiz, {
        props: { questions: QUESTIONS },
        global: { components: { BaseIcon } },
      });

      const pick = (texts: string[], correctIdx: number) => {
        const opts = wrapper.findAll('button').filter(b => texts.includes(b.text()));
        void opts[correctIdx]?.trigger('click');
      };

      pick(['Hằng số', 'Tuyến tính', 'Bình phương'], 1);
      pick(['Mảng sắp xếp', 'Mảng rỗng'], 1);
      pick(['Đúng', 'Sai'], 1);
      pick(['O(N)', 'O(N²)'], 1);

      await wrapper.findAll('button').find(b => b.text().includes('Nộp Bài Quiz'))!.trigger('click');

      expect(wrapper.emitted('submit')).toBeTruthy();
      expect(wrapper.text()).toContain('1 / 4');
      expect(wrapper.text()).toContain('chưa đạt');
    });

    it('useLessonStore.submitQuiz() cập nhật quizScore', async () => {
      const store = useLessonStore();
      await store.loadLesson('quick-sort');

      await store.submitQuiz({ q1: 3, q2: 2, q3: 1, q4: 1 });

      expect(store.quizScore).toBe(4);
    });
  });

  describe('US-LN-022 (P1): Modal hoàn thành', () => {
    it('LessonCompletionModal emit complete khi bấm nút', async () => {
      const wrapper = mount(LessonCompletionModal, {
        props: {
          show: true,
          xpReward: 50,
          nextLessonId: 'next-1',
          quizId: 'quiz-1',
        },
        global: { components: { BaseIcon } },
      });

      const buttons = wrapper.findAll('button');
      const nextBtn = buttons.find(b => b.text().includes('Học bài tiếp theo'));
      expect(nextBtn).toBeTruthy();

      await nextBtn!.trigger('click');
      expect(wrapper.emitted('go-next')).toBeTruthy();
      expect(wrapper.emitted('go-next')![0]).toEqual(['next-1']);
    });

    it('LessonCompletionModal emit go-quiz khi bấm nút làm quiz', async () => {
      const wrapper = mount(LessonCompletionModal, {
        props: {
          show: true,
          xpReward: 50,
          nextLessonId: null,
          quizId: 'quiz-1',
        },
        global: { components: { BaseIcon } },
      });

      const buttons = wrapper.findAll('button');
      const quizBtn = buttons.find(b => b.text().includes('Làm bài trắc nghiệm liên kết'));
      expect(quizBtn).toBeTruthy();

      await quizBtn!.trigger('click');
      expect(wrapper.emitted('go-quiz')).toBeTruthy();
      expect(wrapper.emitted('go-quiz')![0]).toEqual(['quiz-1']);
    });

    it('LessonCompletionModal hiển thị XP reward', () => {
      const wrapper = mount(LessonCompletionModal, {
        props: {
          show: true,
          xpReward: 75,
          nextLessonId: null,
          quizId: null,
        },
        global: { components: { BaseIcon } },
      });

      expect(wrapper.text()).toContain('+75 XP');
    });
  });
});
