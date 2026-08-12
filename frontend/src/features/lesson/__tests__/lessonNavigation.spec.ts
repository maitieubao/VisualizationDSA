// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import LessonCompletionModal from '../../../views/lesson/LessonCompletionModal.vue';
import BaseIcon from '../../../shared/components/BaseIcon.vue';

let wrapper: VueWrapper | null = null;

function mountModal(props: { quizId?: string | null; nextLessonId?: string | null; xpReward?: number }): VueWrapper {
  wrapper = mount(LessonCompletionModal, {
    props: { show: true, xpReward: props.xpReward ?? 100, quizId: props.quizId ?? null, nextLessonId: props.nextLessonId ?? null },
    global: { components: { BaseIcon } },
  });
  return wrapper;
}

describe('LessonCompletionModal.vue — điều hướng sau hoàn thành bài', () => {
  // LM-070: unmount wrapper giữa các test — tránh DOM/event listener rò rỉ.
  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
  });
  it('TC-A5.1: có quizId → nút "Làm bài trắc nghiệm liên kết" hiển thị và emit go-quiz', async () => {
    const wrapper = mountModal({ quizId: 'quiz-abc', nextLessonId: null });
    const quizBtn = wrapper.findAll('button').find(b => b.text().includes('Làm bài trắc nghiệm liên kết'));
    expect(quizBtn).toBeTruthy();
    await quizBtn!.trigger('click');
    expect(wrapper.emitted('go-quiz')).toBeTruthy();
    expect(wrapper.emitted('go-quiz')![0][0]).toBe('quiz-abc');
  });

  it('TC-A5.2: không có quizId → không hiển thị nút quiz', () => {
    const wrapper = mountModal({ quizId: null, nextLessonId: null });
    expect(wrapper.findAll('button').some(b => b.text().includes('Làm bài trắc nghiệm liên kết'))).toBe(false);
  });

  it('TC-A5.4: có nextLessonId → nút "Học bài tiếp theo" emit go-next', async () => {
    const wrapper = mountModal({ quizId: null, nextLessonId: 'lesson-2' });
    const nextBtn = wrapper.findAll('button').find(b => b.text().includes('Học bài tiếp theo'));
    expect(nextBtn).toBeTruthy();
    await nextBtn!.trigger('click');
    expect(wrapper.emitted('go-next')).toBeTruthy();
    expect(wrapper.emitted('go-next')![0][0]).toBe('lesson-2');
  });

  it('TC-A5.4b: không có nextLessonId (bài cuối) → không hiển thị nút tiếp theo', () => {
    const wrapper = mountModal({ quizId: null, nextLessonId: null });
    expect(wrapper.findAll('button').some(b => b.text().includes('Học bài tiếp theo'))).toBe(false);
  });

  it('TC-A5.3: nút "Quay lại khóa học" emit close', async () => {
    const wrapper = mountModal({ quizId: null, nextLessonId: 'lesson-2' });
    const backBtn = wrapper.findAll('button').find(b => b.text().includes('Quay lại khóa học'));
    expect(backBtn).toBeTruthy();
    await backBtn!.trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('Hiển thị đúng XP nhận được', () => {
    const wrapper = mountModal({ quizId: null, nextLessonId: null, xpReward: 250 });
    expect(wrapper.text()).toContain('+250 XP');
  });
});
