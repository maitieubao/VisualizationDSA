// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import FaqView from '../FaqView.vue';

function mountWithRouter() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/docs', component: { template: '<div />' } },
    ],
  });

  return mount(FaqView, {
    global: {
      plugins: [router],
    },
  });
}

describe('FaqView', () => {
  it('render đủ các câu hỏi FAQ về các chủ đề chính', () => {
    const wrapper = mountWithRouter();
    const questions = wrapper.findAll('.faq-question');

    expect(questions.length).toBeGreaterThanOrEqual(6);

    const text = wrapper.text().toLowerCase();
    expect(text).toContain('mô phỏng');
    expect(text).toContain('trắc nghiệm');
    expect(text).toContain('codelab');
    expect(text).toContain('lớp học');
    expect(text).toContain('premium');
    expect(text).toContain('tài khoản');
  });

  it('expand/collapse khi click vào câu hỏi', async () => {
    const wrapper = mountWithRouter();

    // Ban đầu chưa có câu trả lời nào được mở.
    expect(wrapper.findAll('.faq-answer').length).toBe(0);

    const firstQuestion = wrapper.findAll('.faq-question')[0];
    await firstQuestion.trigger('click');

    expect(wrapper.findAll('.faq-answer').length).toBe(1);
    expect(wrapper.find('.faq-answer').text()).toContain('mô phỏng');

    await firstQuestion.trigger('click');
    expect(wrapper.findAll('.faq-answer').length).toBe(0);
  });

  it('chứa link dẫn tới /docs', () => {
    const wrapper = mountWithRouter();
    const link = wrapper.find('.faq-docs-link');

    expect(link.exists()).toBe(true);
    expect(link.attributes('href')).toBe('/docs');
  });
});
