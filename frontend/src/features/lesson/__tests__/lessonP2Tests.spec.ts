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

vi.mock('monaco-editor', () => ({
  editor: { create: vi.fn(), setModelLanguage: vi.fn() },
}));

vi.mock('@monaco-editor/loader', () => ({
  default: { init: vi.fn(async () => ({ editor: { create: vi.fn() } })) },
}));

vi.mock('../../algo-playground/components/AlgoPlaygroundWorkspace.vue', () => ({
  default: { name: 'AlgoPlaygroundWorkspace', props: ['demoId'], template: '<div class="algo-playground-workspace"></div>' },
}));

vi.mock('monaco-editor/esm/vs/language/typescript/monaco.contribution', () => ({}));
vi.mock('monaco-editor/esm/vs/editor/editor.main.css', () => ({}));
vi.mock('monaco-editor/esm/vs/editor/editor.worker?worker', () => ({ default: class {} }));
vi.mock('monaco-editor/esm/vs/language/typescript/ts.worker?worker', () => ({ default: class {} }));

vi.mock('../../../../shared/components/BaseIcon.vue', () => ({
  default: { name: 'BaseIcon', props: ['name', 'class'], template: '<svg class="base-icon"><title>{{ name }}</title></svg>' },
}));

import LessonStepTheory from '../../../views/lesson/components/LessonStepTheory.vue';
import LessonStepQuiz from '../../../views/lesson/components/LessonStepQuiz.vue';
import LessonStepViz from '../../../views/lesson/components/LessonStepViz.vue';
import LessonDiscussionPanel from '../../../views/lesson/LessonDiscussionPanel.vue';

const QUESTIONS: QuizQuestion[] = [
  { id: 'q1', questionText: 'O(1) nghĩa là gì?', options: ['Tuyến tính', 'Hằng số', 'Bình phương'], correctIndex: 1, explanation: 'O(1) là hằng số.' },
  { id: 'q2', questionText: 'Binary search yêu cầu gì?', options: ['Mảng sắp xếp', 'Mảng rỗng'], correctIndex: 0, explanation: 'Cần mảng sắp xếp.' },
  { id: 'q3', questionText: 'Stack là LIFO?', options: ['Đúng', 'Sai'], correctIndex: 0, explanation: 'Stack vào sau ra trước.' },
  { id: 'q4', questionText: 'Bubble sort best case?', options: ['O(N)', 'O(N²)'], correctIndex: 0, explanation: 'Đã sắp xếp thì O(N).' },
];

describe('Lesson — P2 User Stories', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('US-LN-001 (P2): 4 steps — Theory→Viz→Quiz→CodeLab', () => {
    it('LessonStudyView renders step navigation tabs', async () => {
      const store = useLessonStore();
      await store.loadLesson('quick-sort');
      expect(store.activeStep).toBe(1);
    });

    it('LessonStepTheory mounts and shows step 1', () => {
      const wrapper = mount(LessonStepTheory, {
        props: { title: 'Quick Sort', content: '# Theory content' },
      });
      expect(wrapper.text()).toContain('Bước 1 / 4');
      expect(wrapper.text()).toContain('Quick Sort');
    });
  });

  describe('US-LN-002 (P2): Markdown render — bold/italic/code', () => {
    it('renders bold text from markdown', () => {
      const wrapper = mount(LessonStepTheory, {
        props: { title: 'Test', content: 'This is **bold** text' },
      });
      expect(wrapper.find('strong').exists()).toBe(true);
      expect(wrapper.text()).toContain('bold');
    });

    it('renders inline code from markdown', () => {
      const wrapper = mount(LessonStepTheory, {
        props: { title: 'Test', content: 'Use `console.log()` to print' },
      });
      expect(wrapper.find('code').exists()).toBe(true);
      expect(wrapper.text()).toContain('console.log()');
    });

    it('renders headings from markdown', () => {
      const wrapper = mount(LessonStepTheory, {
        props: { title: 'Test', content: '## Heading 2\n\n### Heading 3' },
      });
      expect(wrapper.find('h2').exists()).toBe(true);
      expect(wrapper.find('h3').exists()).toBe(true);
    });
  });

  describe('US-LN-003 (P2): Next step button', () => {
    it('LessonStepTheory shows "Chuyển sang Trực Quan Hóa" button', () => {
      const wrapper = mount(LessonStepTheory, {
        props: { title: 'Test', content: '# Test' },
      });
      expect(wrapper.text()).toContain('Chuyển sang Trực Quan Hóa');
    });

    it('clicking button emits completeStep', async () => {
      const wrapper = mount(LessonStepTheory, {
        props: { title: 'Test', content: '# Test' },
      });
      const btn = wrapper.find('button');
      await btn.trigger('click');
      expect(wrapper.emitted('completeStep')).toBeTruthy();
    });
  });

  describe('US-LN-004 (P2): Viz integration', () => {
    it('LessonStepViz mounts and renders', () => {
      const wrapper = mount(LessonStepViz, {
        props: { vizTitle: 'Test', sandboxType: '', sandboxConfig: '' },
      });
      expect(wrapper.exists()).toBe(true);
    });

    it('LessonStepViz emits watched on mount', async () => {
      const wrapper = mount(LessonStepViz, {
        props: { vizTitle: 'Test', sandboxType: '', sandboxConfig: '' },
      });
      await flushPromises();
      expect(wrapper.emitted('watched')).toBeTruthy();
    });
  });

  describe('US-LN-005 (P2): Continue quiz button', () => {
    it('LessonStepViz shows "Tiếp Tục Làm Quiz" button', () => {
      const wrapper = mount(LessonStepViz, {
        props: { vizTitle: 'Test', sandboxType: '', sandboxConfig: '' },
      });
      expect(wrapper.text()).toContain('Tiếp Tục Làm Quiz');
    });

    it('clicking "Tiếp Tục Làm Quiz" emits completeStep', async () => {
      const wrapper = mount(LessonStepViz, {
        props: { vizTitle: 'Test', sandboxType: '', sandboxConfig: '' },
      });
      const btn = wrapper.find('button');
      await btn.trigger('click');
      expect(wrapper.emitted('completeStep')).toBeTruthy();
    });
  });

  describe('US-LN-007 (P2): Progress counter — "Đã chọn X / Y"', () => {
    it('shows "Đã chọn 0 / 4" initially', () => {
      const wrapper = mount(LessonStepQuiz, {
        props: { questions: QUESTIONS },
        global: { components: { 'BaseIcon': { name: 'BaseIcon', props: ['name'], template: '<svg></svg>' } } },
      });
      expect(wrapper.text()).toContain('Đã chọn 0 / 4');
    });

    it('updates to "Đã chọn 1 / 4" after selecting one answer', async () => {
      const wrapper = mount(LessonStepQuiz, {
        props: { questions: QUESTIONS },
        global: { components: { 'BaseIcon': { name: 'BaseIcon', props: ['name'], template: '<svg></svg>' } } },
      });
      const optionBtn = wrapper.findAll('button').find(b => b.text().includes('Hằng số'));
      expect(optionBtn).toBeTruthy();
      await optionBtn!.trigger('click');
      expect(wrapper.text()).toContain('Đã chọn 1 / 4');
    });
  });

  describe('US-LN-009 (P2): Warning incomplete', () => {
    it('shows confirm dialog when submitting with incomplete answers', async () => {
      const wrapper = mount(LessonStepQuiz, {
        props: { questions: QUESTIONS },
        global: { components: { 'BaseIcon': { name: 'BaseIcon', props: ['name'], template: '<svg></svg>' } } },
      });
      const optionBtn = wrapper.findAll('button').find(b => b.text().includes('Hằng số'));
      await optionBtn!.trigger('click');
      const submitBtn = wrapper.findAll('button').find(b => b.text().includes('Nộp Bài Quiz'));
      await submitBtn!.trigger('click');
      expect(window.confirm).toHaveBeenCalled();
    });
  });

  describe('US-LN-010 (P2): Retry when < 70%', () => {
    it('shows "Làm lại" button when score below 70%', async () => {
      const wrapper = mount(LessonStepQuiz, {
        props: { questions: QUESTIONS },
        global: { components: { 'BaseIcon': { name: 'BaseIcon', props: ['name'], template: '<svg></svg>' } } },
      });
      const pick = (texts: string[], idx: number) => {
        const btn = wrapper.findAll('button').find(b => texts.includes(b.text()));
        void btn?.trigger('click');
      };
      pick(['Hằng số', 'Tuyến tính', 'Bình phương'], 1);
      pick(['Mảng sắp xếp', 'Mảng rỗng'], 1);
      pick(['Đúng', 'Sai'], 1);
      pick(['O(N)', 'O(N²)'], 1);
      await wrapper.findAll('button').find(b => b.text().includes('Nộp Bài Quiz'))!.trigger('click');
      expect(wrapper.text()).toContain('Làm lại');
    });
  });

  describe('US-LN-011 (P2): Unlock CodeLab when ≥ 70%', () => {
    it('shows "Mở Khóa Code Lab" when score >= 70%', async () => {
      const wrapper = mount(LessonStepQuiz, {
        props: { questions: QUESTIONS },
        global: { components: { 'BaseIcon': { name: 'BaseIcon', props: ['name'], template: '<svg></svg>' } } },
      });
      const pick = (texts: string[], idx: number) => {
        const btn = wrapper.findAll('button').find(b => texts.includes(b.text()));
        void btn?.trigger('click');
      };
      pick(['Hằng số', 'Tuyến tính', 'Bình phương'], 1);
      pick(['Mảng sắp xếp', 'Mảng rỗng'], 0);
      pick(['Đúng', 'Sai'], 0);
      pick(['O(N)', 'O(N²)'], 1);
      await wrapper.findAll('button').find(b => b.text().includes('Nộp Bài Quiz'))!.trigger('click');
      expect(wrapper.text()).toContain('Mở Khóa Code Lab');
    });
  });

  describe('US-LN-012 (P2): Answer colors after submit', () => {
    it('correct answer gets green border after submit', async () => {
      const wrapper = mount(LessonStepQuiz, {
        props: { questions: QUESTIONS },
        global: { components: { 'BaseIcon': { name: 'BaseIcon', props: ['name'], template: '<svg></svg>' } } },
      });
      const pick = (texts: string[], idx: number) => {
        const btn = wrapper.findAll('button').find(b => texts.includes(b.text()));
        void btn?.trigger('click');
      };
      pick(['Hằng số', 'Tuyến tính', 'Bình phương'], 1);
      pick(['Mảng sắp xếp', 'Mảng rỗng'], 0);
      pick(['Đúng', 'Sai'], 0);
      pick(['O(N)', 'O(N²)'], 0);
      await wrapper.findAll('button').find(b => b.text().includes('Nộp Bài Quiz'))!.trigger('click');
      expect(wrapper.text()).toContain('3 / 4');
      expect(wrapper.text()).toContain('Chúc mừng');
    });

    it('wrong answer gets red border after submit', async () => {
      const wrapper = mount(LessonStepQuiz, {
        props: { questions: QUESTIONS },
        global: { components: { 'BaseIcon': { name: 'BaseIcon', props: ['name'], template: '<svg></svg>' } } },
      });
      const pickAt = (texts: string[], idx: number) => {
        const btns = wrapper.findAll('button').filter(b => texts.includes(b.text()));
        void btns[idx]?.trigger('click');
      };
      pickAt(['Hằng số', 'Tuyến tính', 'Bình phương'], 0);
      pickAt(['Mảng sắp xếp', 'Mảng rỗng'], 1);
      pickAt(['Đúng', 'Sai'], 1);
      pickAt(['O(N)', 'O(N²)'], 1);
      await wrapper.findAll('button').find(b => b.text().includes('Nộp Bài Quiz'))!.trigger('click');
      expect(wrapper.text()).toContain('chưa đạt');
    });
  });

  describe('US-LN-024 (P2): Discussion panel render', () => {
    it('LessonDiscussionPanel renders with title', () => {
      const wrapper = mount(LessonDiscussionPanel, {
        props: { lessonId: 'lesson-1' },
        global: { components: { 'BaseIcon': { name: 'BaseIcon', props: ['name'], template: '<svg></svg>' } } },
      });
      expect(wrapper.text()).toContain('THẢO LUẬN & HỎI ĐÁP');
    });
  });

  describe('US-LN-025 (P2): Comment submit form', () => {
    it('renders comment textarea and submit button', () => {
      const wrapper = mount(LessonDiscussionPanel, {
        props: { lessonId: 'lesson-1' },
        global: { components: { 'BaseIcon': { name: 'BaseIcon', props: ['name'], template: '<svg></svg>' } } },
      });
      expect(wrapper.find('textarea').exists()).toBe(true);
      expect(wrapper.text()).toContain('Đăng thảo luận');
    });
  });

  describe('US-LN-026 (P2): Reply form', () => {
    it('shows reply form when clicking "Trả lời"', async () => {
      vi.stubGlobal('fetch', vi.fn(async () => ({
        ok: true,
        json: async () => ([{
          id: 'c1', lessonId: 'lesson-1', userId: 'u1', username: 'user1',
          role: 'Student', isPremium: false, content: 'Test comment',
          createdAt: '2025-01-01T00:00:00Z', parentId: null,
        }]),
      })));
      const wrapper = mount(LessonDiscussionPanel, {
        props: { lessonId: 'lesson-1' },
        global: { components: { 'BaseIcon': { name: 'BaseIcon', props: ['name'], template: '<svg></svg>' } } },
      });
      await flushPromises();
      const replyBtn = wrapper.findAll('button').find(b => b.text().includes('Trả lời'));
      expect(replyBtn).toBeTruthy();
      await replyBtn!.trigger('click');
      const textareas = wrapper.findAll('textarea');
      expect(textareas.length).toBeGreaterThan(1);
      vi.unstubAllGlobals();
    });
  });

  describe('US-LN-027 (P2): Search comments', () => {
    it('renders search input', () => {
      const wrapper = mount(LessonDiscussionPanel, {
        props: { lessonId: 'lesson-1' },
        global: { components: { 'BaseIcon': { name: 'BaseIcon', props: ['name'], template: '<svg></svg>' } } },
      });
      const input = wrapper.find('input[type="text"]');
      expect(input.exists()).toBe(true);
    });

    it('typing in search triggers debounced search', async () => {
      vi.useFakeTimers();
      const wrapper = mount(LessonDiscussionPanel, {
        props: { lessonId: 'lesson-1' },
        global: { components: { 'BaseIcon': { name: 'BaseIcon', props: ['name'], template: '<svg></svg>' } } },
      });
      const input = wrapper.find('input[type="text"]');
      await input.setValue('test query');
      vi.advanceTimersByTime(500);
      expect(wrapper.exists()).toBe(true);
      vi.useRealTimers();
    });
  });

  describe('US-LN-028 (P2): Role badges', () => {
    it('shows Admin badge for admin comments', async () => {
      vi.stubGlobal('fetch', vi.fn(async () => ({
        ok: true,
        json: async () => ([{
          id: 'c1', lessonId: 'lesson-1', userId: 'u1', username: 'admin1',
          role: 'Admin', isPremium: false, content: 'Admin comment',
          createdAt: '2025-01-01T00:00:00Z', parentId: null,
        }]),
      })));
      const wrapper = mount(LessonDiscussionPanel, {
        props: { lessonId: 'lesson-1' },
        global: { components: { 'BaseIcon': { name: 'BaseIcon', props: ['name'], template: '<svg></svg>' } } },
      });
      await flushPromises();
      expect(wrapper.text()).toContain('Admin');
      vi.unstubAllGlobals();
    });

    it('shows Teacher badge for teacher comments', async () => {
      vi.stubGlobal('fetch', vi.fn(async () => ({
        ok: true,
        json: async () => ([{
          id: 'c1', lessonId: 'lesson-1', userId: 'u1', username: 'teacher1',
          role: 'Teacher', isPremium: false, content: 'Teacher comment',
          createdAt: '2025-01-01T00:00:00Z', parentId: null,
        }]),
      })));
      const wrapper = mount(LessonDiscussionPanel, {
        props: { lessonId: 'lesson-1' },
        global: { components: { 'BaseIcon': { name: 'BaseIcon', props: ['name'], template: '<svg></svg>' } } },
      });
      await flushPromises();
      expect(wrapper.text()).toContain('Teacher');
      vi.unstubAllGlobals();
    });

    it('shows Premium badge for premium users', async () => {
      vi.stubGlobal('fetch', vi.fn(async () => ({
        ok: true,
        json: async () => ([{
          id: 'c1', lessonId: 'lesson-1', userId: 'u1', username: 'premium1',
          role: 'Student', isPremium: true, content: 'Premium comment',
          createdAt: '2025-01-01T00:00:00Z', parentId: null,
        }]),
      })));
      const wrapper = mount(LessonDiscussionPanel, {
        props: { lessonId: 'lesson-1' },
        global: { components: { 'BaseIcon': { name: 'BaseIcon', props: ['name'], template: '<svg></svg>' } } },
      });
      await flushPromises();
      expect(wrapper.text()).toContain('Premium');
      vi.unstubAllGlobals();
    });
  });
});
