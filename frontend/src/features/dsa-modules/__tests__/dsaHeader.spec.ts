// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import DSAHeader from '../components/DSAHeader.vue';

const mockAlgorithm = {
  id: 'bubble-sort',
  name: 'Bubble Sort',
  category: 'Sorting',
  difficulty: 'Easy' as const,
  timeComplexity: 'O(N²)',
  spaceComplexity: 'O(1)',
};

const mockMetadata = {
  timeComplexity: 'O(N²)',
  spaceComplexity: 'O(1)',
  description: 'Test description',
  pseudoCode: ['line1'],
};

describe('DSAHeader', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders algorithm name', () => {
    const wrapper = mount(DSAHeader, {
      props: { algorithm: mockAlgorithm, metadata: null, isExecuting: false, isTheoryOpen: false },
      global: { stubs: { BaseIcon: { template: '<span />' } } },
    });
    expect(wrapper.text()).toContain('Bubble Sort');
  });

  it('renders category badge', () => {
    const wrapper = mount(DSAHeader, {
      props: { algorithm: mockAlgorithm, metadata: null, isExecuting: false, isTheoryOpen: false },
      global: { stubs: { BaseIcon: { template: '<span />' } } },
    });
    expect(wrapper.text()).toContain('Sorting');
  });

  it('renders complexity when metadata provided', () => {
    const wrapper = mount(DSAHeader, {
      props: { algorithm: mockAlgorithm, metadata: mockMetadata, isExecuting: false, isTheoryOpen: false },
      global: { stubs: { BaseIcon: { template: '<span />' } } },
    });
    expect(wrapper.text()).toContain('O(N²)');
  });

  it('emits back when back button clicked', async () => {
    const wrapper = mount(DSAHeader, {
      props: { algorithm: mockAlgorithm, metadata: null, isExecuting: false, isTheoryOpen: false },
      global: { stubs: { BaseIcon: { template: '<span />' } } },
    });

    const buttons = wrapper.findAll('button');
    const backBtn = buttons.find(b => b.text().includes('Quay lại'));
    await backBtn!.trigger('click');
    expect(wrapper.emitted('back')).toBeTruthy();
  });

  it('emits execute when execute button clicked', async () => {
    const wrapper = mount(DSAHeader, {
      props: { algorithm: mockAlgorithm, metadata: null, isExecuting: false, isTheoryOpen: false },
      global: { stubs: { BaseIcon: { template: '<span />' } } },
    });

    const buttons = wrapper.findAll('button');
    const executeBtn = buttons.find(b => b.text().includes('Trực quan hóa'));
    await executeBtn!.trigger('click');
    expect(wrapper.emitted('execute')).toBeTruthy();
  });

  it('disables execute button when isExecuting', () => {
    const wrapper = mount(DSAHeader, {
      props: { algorithm: mockAlgorithm, metadata: null, isExecuting: true, isTheoryOpen: false },
      global: { stubs: { BaseIcon: { template: '<span />' } } },
    });

    const buttons = wrapper.findAll('button');
    const executeBtn = buttons.find(b => b.text().includes('Đang chạy'));
    expect(executeBtn!.attributes('disabled')).toBeDefined();
  });

  it('emits toggleTheory when theory button clicked', async () => {
    const wrapper = mount(DSAHeader, {
      props: { algorithm: mockAlgorithm, metadata: null, isExecuting: false, isTheoryOpen: false },
      global: { stubs: { BaseIcon: { template: '<span />' } } },
    });

    const buttons = wrapper.findAll('button');
    const theoryBtn = buttons.find(b => b.text().includes('Lý thuyết'));
    await theoryBtn!.trigger('click');
    expect(wrapper.emitted('toggleTheory')).toBeTruthy();
  });

  it('highlights theory button when isTheoryOpen', () => {
    const wrapper = mount(DSAHeader, {
      props: { algorithm: mockAlgorithm, metadata: null, isExecuting: false, isTheoryOpen: true },
      global: { stubs: { BaseIcon: { template: '<span />' } } },
    });

    const buttons = wrapper.findAll('button');
    const theoryBtn = buttons.find(b => b.text().includes('Lý thuyết'));
    expect(theoryBtn!.classes()).toContain('bg-accent-primary-dim');
  });
});
