// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';

vi.stubGlobal('ResizeObserver', class {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
});

vi.mock('../../animation-engine/store/useAnimationStore', () => ({
  useAnimationStore: () => ({
    currentFrame: null,
    currentIndex: 0,
    totalSteps: 0,
    isPlaying: false,
    playbackSpeed: 1,
    subFrameProgress: 0,
    progressPercent: 0,
    loadResult: vi.fn(),
  }),
}));

vi.mock('../store/useAlgorithmStore', () => ({
  useAlgorithmStore: () => ({
    currentAlgorithm: null,
    metadata: null,
  }),
}));

vi.mock('./renderers/BarChartRenderer', () => ({ default: { template: '<div>BarChart</div>', name: 'BarChartRenderer' } }));
vi.mock('./renderers/BoxArrayRenderer', () => ({ default: { template: '<div>BoxArray</div>', name: 'BoxArrayRenderer' } }));
vi.mock('./renderers/TreeRenderer', () => ({ default: { template: '<div>Tree</div>', name: 'TreeRenderer' } }));
vi.mock('./renderers/TubeRenderer', () => ({ default: { template: '<div>Tube</div>', name: 'TubeRenderer' } }));
vi.mock('./renderers/GraphRenderer', () => ({ default: { template: '<div>Graph</div>', name: 'GraphRenderer' } }));

import AlgorithmVisualizer from '../components/AlgorithmVisualizer.vue';

describe('AlgorithmVisualizer', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders empty state when no frame', () => {
    const wrapper = mount(AlgorithmVisualizer);
    expect(wrapper.text()).toContain('Chọn thuật toán');
  });

  it('shows progress bar', () => {
    const wrapper = mount(AlgorithmVisualizer);
    const progressBar = wrapper.find('.absolute.bottom-0');
    expect(progressBar.exists()).toBe(true);
  });

  it('does not crash when mounted', () => {
    expect(() => mount(AlgorithmVisualizer)).not.toThrow();
  });
});
