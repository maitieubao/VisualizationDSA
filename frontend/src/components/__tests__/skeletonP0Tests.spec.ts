// @vitest-environment jsdom
// CU-026 (P2): Skeleton — exact 5 skeleton trong SkeletonCard (không >=3),
// variant circle/text/card + custom size + reduced-motion (mock matchMedia).
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SkeletonLoader from '../SkeletonLoader.vue';
import SkeletonCard from '../SkeletonCard.vue';

function stubMatchMedia(matches: boolean): void {
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })));
}

describe('SkeletonLoader + SkeletonCard — CU-026', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    stubMatchMedia(false);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('Skel-001 (P0): variant rect mặc định render pulse', () => {
    const wrapper = mount(SkeletonLoader, { props: { variant: 'rect' } });

    expect(wrapper.find('.skeleton').exists()).toBe(true);
    expect(wrapper.find('.skeleton__shimmer').exists()).toBe(true);
    expect(wrapper.classes()).toContain('skeleton--rect');
  });

  it('CU-026: variant circle → class circle + kích thước mặc định 40px', () => {
    const wrapper = mount(SkeletonLoader, { props: { variant: 'circle' } });

    expect(wrapper.classes()).toContain('skeleton--circle');
    expect(wrapper.attributes('style')).toContain('width: 40px');
    expect(wrapper.attributes('style')).toContain('height: 40px');
  });

  it('CU-026: variant text → height 14px; card → height 120px; rect → height 20px', () => {
    const text = mount(SkeletonLoader, { props: { variant: 'text' } });
    expect(text.classes()).toContain('skeleton--text');
    expect(text.attributes('style')).toContain('height: 14px');

    const card = mount(SkeletonLoader, { props: { variant: 'card' } });
    expect(card.classes()).toContain('skeleton--card');
    expect(card.attributes('style')).toContain('height: 120px');

    const rect = mount(SkeletonLoader, { props: { variant: 'rect' } });
    expect(rect.classes()).toContain('skeleton--rect');
    expect(rect.attributes('style')).toContain('height: 20px');
  });

  it('CU-026: custom size (width/height) + rounded', () => {
    const wrapper = mount(SkeletonLoader, {
      props: { variant: 'rect', width: '240px', height: '36px', rounded: true },
    });

    expect(wrapper.attributes('style')).toContain('width: 240px');
    expect(wrapper.attributes('style')).toContain('height: 36px');
    expect(wrapper.classes()).toContain('skeleton--rounded');
  });

  it('Skel-002 (CU-026): SkeletonCard render đúng 5 skeleton (không >=3)', () => {
    const wrapper = mount(SkeletonCard);

    expect(wrapper.find('.skeleton-card').exists()).toBe(true);
    expect(wrapper.find('.skeleton-card__footer').exists()).toBe(true);
    expect(wrapper.findAll('.skeleton')).toHaveLength(5);
  });

  it('CU-020: prefers-reduced-motion → shimmer tắt animation + aria-hidden', () => {
    stubMatchMedia(true);
    const wrapper = mount(SkeletonLoader, { props: { variant: 'rect' } });

    expect(wrapper.find('.skeleton').classes()).toContain('skeleton--reduced-motion');
    expect(wrapper.find('.skeleton__shimmer').attributes('aria-hidden')).toBe('true');
  });
});
