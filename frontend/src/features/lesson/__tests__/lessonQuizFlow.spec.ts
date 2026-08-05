// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import LessonStepQuiz from '../../../views/lesson/components/LessonStepQuiz.vue';
import BaseIcon from '../../../shared/components/BaseIcon.vue';

import type { QuizQuestion } from '../types/lesson.types';

const QUESTIONS: QuizQuestion[] = [
  { id: 'q1', questionText: 'O(1) nghĩa là gì?', options: ['Tuyến tính', 'Hằng số', 'Bình phương'], correctIndex: 1, explanation: 'O(1) là hằng số.' },
  { id: 'q2', questionText: 'Binary search yêu cầu gì?', options: ['Mảng sắp xếp', 'Mảng rỗng'], correctIndex: 0, explanation: 'Cần mảng sắp xếp.' },
  { id: 'q3', questionText: 'Stack là LIFO?', options: ['Đúng', 'Sai'], correctIndex: 0, explanation: 'Stack vào sau ra trước.' },
  { id: 'q4', questionText: 'Bubble sort best case?', options: ['O(N)', 'O(N²)'], correctIndex: 0, explanation: 'Đã sắp xếp thì O(N).' },
];

let wrapper: VueWrapper | null = null;

function mountQuiz(props: { questions?: QuizQuestion[] } = {}): VueWrapper {
  return mount(LessonStepQuiz, {
    props,
    global: { components: { BaseIcon } },
  });
}

describe('LessonStepQuiz.vue', () => {
  beforeEach(() => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.restoreAllMocks();
  });

  it('TC-A3.1: không truyền questions → hiển thị empty state, không có câu hỏi mặc định', () => {
    wrapper = mountQuiz();
    expect(wrapper.text()).toContain('Không có câu hỏi');
    expect(wrapper.findAll('button[disabled]')).toHaveLength(0);
  });

  it('TC-A3.2: truyền 4 câu hỏi → render đúng 4 câu với options', () => {
    wrapper = mountQuiz({ questions: QUESTIONS });
    expect(wrapper.text()).toContain('O(1) nghĩa là gì?');
    expect(wrapper.text()).toContain('Stack là LIFO?');
    expect(wrapper.text()).toContain('Mảng sắp xếp');
  });

  it('TC-A3.3: đúng 3/4 (≥70%) → emit submit, hiển thị điểm, có nút mở CodeLab', async () => {
    wrapper = mountQuiz({ questions: QUESTIONS });
    const pick = (texts: string[], correctIdx: number) => {
      const opts = wrapper!.findAll('button').filter(b => texts.includes(b.text()));
      void opts[correctIdx]?.trigger('click');
    };
    // Chọn đúng q1, q2, q3 (sai q4)
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
    expect(wrapper.findAll('button').some(b => b.text().includes('Mở Khóa Code Lab'))).toBe(true);
  });

  it('TC-A3.4: đúng 2/4 → không pass, không emit completeStep', async () => {
    wrapper = mountQuiz({ questions: QUESTIONS });
    const pick = (texts: string[], correctIdx: number) => {
      const opts = wrapper!.findAll('button').filter(b => texts.includes(b.text()));
      void opts[correctIdx]?.trigger('click');
    };
    pick(['Hằng số', 'Tuyến tính', 'Bình phương'], 1);
    pick(['Mảng sắp xếp', 'Mảng rỗng'], 0);
    pick(['Đúng', 'Sai'], 1);
    pick(['O(N)', 'O(N²)'], 1);

    await wrapper.findAll('button').find(b => b.text().includes('Nộp Bài Quiz'))!.trigger('click');

    expect(wrapper.emitted('submit')).toBeTruthy();
    expect(wrapper.text()).toContain('2 / 4');
    expect(wrapper.text()).toContain('50%');
    expect(wrapper.text()).toContain('chưa đạt');
    expect(wrapper.findAll('button').some(b => b.text().includes('Mở Khóa Code Lab'))).toBe(false);
    expect(wrapper.emitted('completeStep')).toBeUndefined();
  });

  it('TC-A3.5: submit khi chưa chọn hết → hủy bỏ thì không nộp', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    wrapper = mountQuiz({ questions: QUESTIONS });
    const submitBtn = wrapper.findAll('button').find(b => b.text().includes('Nộp Bài Quiz'));
    await submitBtn!.trigger('click');
    expect(wrapper.emitted('submit')).toBeUndefined();
  });

  it('TC-A3.6: Làm lại reset đáp án', async () => {
    wrapper = mountQuiz({ questions: QUESTIONS });
    const pick = (texts: string[], correctIdx: number) => {
      const opts = wrapper!.findAll('button').filter(b => texts.includes(b.text()));
      void opts[correctIdx]?.trigger('click');
    };
    pick(['Hằng số', 'Tuyến tính', 'Bình phương'], 1);
    pick(['Mảng sắp xếp', 'Mảng rỗng'], 0);
    pick(['Đúng', 'Sai'], 0);
    pick(['O(N)', 'O(N²)'], 1);

    await wrapper.findAll('button').find(b => b.text().includes('Nộp Bài Quiz'))!.trigger('click');
    expect(wrapper.text()).toContain('75%');

    const resetBtn = wrapper.findAll('button').find(b => b.text().includes('Làm lại'));
    await resetBtn!.trigger('click');
    expect(wrapper.text()).toContain('Đã chọn 0 / 4');
  });
});
