// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import LectureNavigation from '../components/LectureNavigation.vue';

const slides = [
  { slideId: 1 },
  { slideId: 2 },
  { slideId: 3 },
];

function mountNavigation(overrides: Partial<InstanceType<typeof LectureNavigation>['$props']> = {}) {
  return mount(LectureNavigation, {
    props: {
      slides,
      currentSlideIndex: 0,
      isFirstSlide: true,
      isLastSlide: false,
      isWaiting: false,
      ...overrides,
    } as never,
    global: {
      stubs: {
        BaseIcon: { template: '<i class="base-icon" />' },
      },
    },
  });
}

describe('LectureNavigation', () => {
  it('render đúng số lượng pagination dots', () => {
    const wrapper = mountNavigation();

    expect(wrapper.findAll('.dot').length).toBe(3);
  });

  it('dot active được đánh dấu theo currentSlideIndex', () => {
    const wrapper = mountNavigation({ currentSlideIndex: 1 });

    const dots = wrapper.findAll('.dot');
    expect(dots[1].classes()).toContain('dot-active');
    expect(dots[0].classes()).not.toContain('dot-active');
  });

  it('click dot phát emit goTo với đúng index', async () => {
    const wrapper = mountNavigation({ currentSlideIndex: 1 });

    await wrapper.findAll('.dot')[2].trigger('click');

    expect(wrapper.emitted('goTo')).toBeTruthy();
    expect(wrapper.emitted('goTo')![0]).toEqual([2]);
  });

  it('dots bị disable khi đang chờ animation', () => {
    const wrapper = mountNavigation({ isWaiting: true });

    const dots = wrapper.findAll('.dot');
    expect(dots.every(d => d.attributes('disabled') !== undefined)).toBe(true);
  });

  it('nút Quay lại bị disable ở slide đầu', () => {
    const wrapper = mountNavigation({ isFirstSlide: true });

    expect(wrapper.find('.nav-btn-back').attributes('disabled')).toBeDefined();
  });

  it('nút Quay lại bị disable khi đang chờ animation', () => {
    const wrapper = mountNavigation({ isFirstSlide: false, isWaiting: true });

    expect(wrapper.find('.nav-btn-back').attributes('disabled')).toBeDefined();
  });

  it('nút Quay lại phát emit prev khi bấm', async () => {
    const wrapper = mountNavigation({ isFirstSlide: false, currentSlideIndex: 1 });

    await wrapper.find('.nav-btn-back').trigger('click');

    expect(wrapper.emitted('prev')).toBeTruthy();
  });

  it('nút Tiếp tục phát emit next và đổi nhãn thành "Bỏ qua" khi chờ animation', async () => {
    const wrapper = mountNavigation({ isFirstSlide: false });

    expect(wrapper.find('.nav-btn-next').text()).toContain('Tiếp tục');
    await wrapper.find('.nav-btn-next').trigger('click');
    expect(wrapper.emitted('next')).toBeTruthy();

    const waitingWrapper = mountNavigation({ isFirstSlide: false, isWaiting: true });
    expect(waitingWrapper.find('.nav-btn-next').text()).toContain('Bỏ qua');
  });

  it('slide cuối hiện nút "Thoát Bài giảng" và phát emit exit', async () => {
    const wrapper = mountNavigation({ isFirstSlide: false, isLastSlide: true, currentSlideIndex: 2 });

    expect(wrapper.find('.nav-btn-finish').exists()).toBe(true);
    expect(wrapper.find('.nav-btn-next').exists()).toBe(false);

    await wrapper.find('.nav-btn-finish').trigger('click');

    expect(wrapper.emitted('exit')).toBeTruthy();
  });
});
