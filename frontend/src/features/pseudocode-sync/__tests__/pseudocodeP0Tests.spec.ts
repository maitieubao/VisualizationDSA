// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { usePseudocodeStore } from '../store/usePseudocodeStore';
import { useAnimationStore } from '../../animation-engine/store/useAnimationStore';
import MultilingualCodePanel from '../components/MultilingualCodePanel.vue';
import VariableWatchPanel from '../components/VariableWatchPanel.vue';
import type { LanguageCode } from '../types/pseudocode.types';

const mockLanguages: LanguageCode[] = [
  {
    language: 'cpp',
    lines: [
      { lineNumber: 1, text: 'void bubbleSort(int arr[], int n) {', logicalId: 'FUNC_DECL' },
      { lineNumber: 2, text: '  for (int i = 0; i < n-1; i++) {', logicalId: 'OUTER_LOOP' },
      { lineNumber: 3, text: '    if (arr[j] > arr[j+1]) {', logicalId: 'COMPARE_STEP' },
      { lineNumber: 4, text: '      swap(arr[j], arr[j+1]);', logicalId: 'SWAP_STEP' },
    ],
  },
  {
    language: 'python',
    lines: [
      { lineNumber: 1, text: 'def bubble_sort(arr):', logicalId: 'FUNC_DECL' },
      { lineNumber: 2, text: '    for i in range(n - 1):', logicalId: 'OUTER_LOOP' },
      { lineNumber: 3, text: '        if arr[j] > arr[j + 1]:', logicalId: 'COMPARE_STEP' },
      { lineNumber: 4, text: '            arr[j], arr[j+1] = arr[j+1], arr[j]', logicalId: 'SWAP_STEP' },
    ],
  },
];

describe('PS-001 (P0): Xem mã đồng bộ frame', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('store.activeCodeLines reflects selected language code', () => {
    const store = usePseudocodeStore();
    store.loadPseudocodeScript(mockLanguages);

    expect(store.activeCodeLines).toHaveLength(4);
    expect(store.activeCodeLines[0].text).toBe('void bubbleSort(int arr[], int n) {');
  });

  it('activePhysicalLineNumber updates based on animation frame', () => {
    const store = usePseudocodeStore();
    const animStore = useAnimationStore();

    store.loadPseudocodeScript(mockLanguages);
    animStore.loadResult({
      algorithmId: 'bubble-sort',
      pseudoCode: [],
      frames: [
        {
          stepId: 1,
          activeLine: 0,
          explanation: '',
          dataState: [],
          highlights: { compare: [], swap: [], sorted: [] },
          activeLogicalLineId: 'COMPARE_STEP',
          variables: { i: 0, j: 0 },
        },
      ],
    });

    expect(store.activePhysicalLineNumber).toBe(3);
  });
});

describe('PS-002 (P0): Chuyển ngôn ngữ', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('setLanguage("python") changes code lines to Python', () => {
    const store = usePseudocodeStore();
    store.loadPseudocodeScript(mockLanguages);

    expect(store.selectedLanguage).toBe('cpp');
    store.changeLanguage('python');

    expect(store.selectedLanguage).toBe('python');
    expect(store.activeCodeLines[0].text).toBe('def bubble_sort(arr):');
  });

  it('MultilingualCodePanel renders language tabs and switches on click', async () => {
    const store = usePseudocodeStore();
    store.loadPseudocodeScript(mockLanguages);

    const wrapper = mount(MultilingualCodePanel, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const tabs = wrapper.findAll('.lang-btn');
    expect(tabs.length).toBe(2);

    await tabs[1].trigger('click');
    expect(store.selectedLanguage).toBe('python');
  });
});

describe('PS-005 (P0): Watch variables', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('variables panel renders watch variables from frame', () => {
    const store = usePseudocodeStore();
    const animStore = useAnimationStore();

    store.loadPseudocodeScript(mockLanguages);
    animStore.loadResult({
      algorithmId: 'bubble-sort',
      pseudoCode: [],
      frames: [
        {
          stepId: 1,
          activeLine: 0,
          explanation: '',
          dataState: [],
          highlights: { compare: [], swap: [], sorted: [] },
          activeLogicalLineId: 'COMPARE_STEP',
          variables: { i: 2, j: 5 },
        },
      ],
    });

    expect(store.watchVariablesList).toEqual([
      { name: 'i', value: 2 },
      { name: 'j', value: 5 },
    ]);
  });

  it('VariableWatchPanel renders variable badges', async () => {
    const store = usePseudocodeStore();
    const animStore = useAnimationStore();

    store.loadPseudocodeScript(mockLanguages);
    animStore.loadResult({
      algorithmId: 'bubble-sort',
      pseudoCode: [],
      frames: [
        {
          stepId: 1,
          activeLine: 0,
          explanation: '',
          dataState: [],
          highlights: { compare: [], swap: [], sorted: [] },
          activeLogicalLineId: 'COMPARE_STEP',
          variables: { i: 2, j: 5 },
        },
      ],
    });

    const wrapper = mount(VariableWatchPanel);

    expect(wrapper.text()).toContain('WATCH VARIABLES');
    expect(wrapper.text()).toContain('i');
    expect(wrapper.text()).toContain('2');
  });
});

describe('PS-007 (P1): Auto scroll to active', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('scrollToIndex computed from activePhysicalLineNumber', () => {
    const store = usePseudocodeStore();
    const animStore = useAnimationStore();

    store.loadPseudocodeScript(mockLanguages);
    animStore.loadResult({
      algorithmId: 'bubble-sort',
      pseudoCode: [],
      frames: [
        {
          stepId: 1,
          activeLine: 0,
          explanation: '',
          dataState: [],
          highlights: { compare: [], swap: [], sorted: [] },
          activeLogicalLineId: 'SWAP_STEP',
          variables: { i: 0, j: 0 },
        },
      ],
    });

    expect(store.activePhysicalLineNumber).toBe(4);
  });

  it('MultilingualCodePanel renders active line with correct class', () => {
    const store = usePseudocodeStore();
    const animStore = useAnimationStore();

    store.loadPseudocodeScript(mockLanguages);
    animStore.loadResult({
      algorithmId: 'bubble-sort',
      pseudoCode: [],
      frames: [
        {
          stepId: 1,
          activeLine: 0,
          explanation: '',
          dataState: [],
          highlights: { compare: [], swap: [], sorted: [] },
          activeLogicalLineId: 'OUTER_LOOP',
          variables: { i: 0 },
        },
      ],
    });

    const wrapper = mount(MultilingualCodePanel);
    const activeLine = wrapper.find('.code-line.active');

    expect(activeLine.exists()).toBe(true);
  });
});
