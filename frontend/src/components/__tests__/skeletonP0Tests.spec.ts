// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SkeletonLoader from '../SkeletonLoader.vue';
import SkeletonCard from '../SkeletonCard.vue';

describe('SkeletonLoader + SkeletonCard — P0 Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('Skel-001 (P0): SkeletonLoader renders with animated pulse', () => {
    const wrapper = mount(SkeletonLoader, {
      props: { variant: 'rect' },
    });

    expect(wrapper.find('.skeleton').exists()).toBe(true);
    expect(wrapper.find('.skeleton__shimmer').exists()).toBe(true);
    expect(wrapper.classes()).toContain('skeleton--rect');
  });

  it('Skel-002 (P0): SkeletonCard renders placeholder structure', () => {
    const wrapper = mount(SkeletonCard);

    expect(wrapper.find('.skeleton-card').exists()).toBe(true);
    expect(wrapper.find('.skeleton-card__footer').exists()).toBe(true);

    const skeletons = wrapper.findAll('.skeleton');
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });
});
