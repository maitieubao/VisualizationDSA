// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mount } from '@vue/test-utils';
import NotFoundView from '../NotFoundView.vue';

const mockRouter = {
  push: vi.fn(),
  back: vi.fn(),
};

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => ({ path: '/non-existent-page' }),
}));

describe('NotFoundView — P0 Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('NF-001 (P0): Render "404" + "Không tìm thấy trang"', () => {
    const wrapper = mount(NotFoundView);

    expect(wrapper.text()).toContain('404');
    expect(wrapper.text()).toContain('Trang không tồn tại');
  });

  it('NF-002 (P0): Nút "Về trang chủ" renders', () => {
    const wrapper = mount(NotFoundView);

    const homeBtn = wrapper.find('#btn-go-home');
    expect(homeBtn.exists()).toBe(true);
    expect(homeBtn.text()).toContain('Về trang chủ');
  });
});
