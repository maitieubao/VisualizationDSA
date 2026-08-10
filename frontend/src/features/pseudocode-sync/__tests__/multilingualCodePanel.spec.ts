// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { setActivePinia, createPinia } from 'pinia';
import { usePseudocodeStore } from '../store/usePseudocodeStore';
import { useAnimationStore } from '../../animation-engine/store/useAnimationStore';
import MultilingualCodePanel from '../components/MultilingualCodePanel.vue';
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

function makeFrame(id: string, vars: Record<string, string | number> = {}): {
  stepId: number;
  activeLine: number;
  explanation: string;
  dataState: number[];
  highlights: { compare: number[]; swap: number[]; sorted: number[] };
  activeLogicalLineId: string;
  variables: Record<string, string | number>;
} {
  return {
    stepId: 1,
    activeLine: 0,
    explanation: '',
    dataState: [],
    highlights: { compare: [], swap: [], sorted: [] },
    activeLogicalLineId: id,
    variables: vars,
  };
}

describe('MultilingualCodePanel: PS-014 keyboard language switching', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('Ctrl+Tab cycles to the next language', () => {
    const store = usePseudocodeStore();
    store.loadPseudocodeScript(mockLanguages);
    const wrapper = mount(MultilingualCodePanel);
    const viewport = wrapper.find('.code-viewport');
    const ctrlTab = new KeyboardEvent('keydown', {
      key: 'Tab',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    viewport.element.dispatchEvent(ctrlTab);
    expect(store.selectedLanguage).toBe('python');
  });

  it('plain Tab is not preventDefaulted so focus can leave the panel (PS-014)', () => {
    const store = usePseudocodeStore();
    store.loadPseudocodeScript(mockLanguages);
    const wrapper = mount(MultilingualCodePanel);
    const viewport = wrapper.find('.code-viewport');
    const plainTab = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });
    viewport.element.dispatchEvent(plainTab);
    expect(plainTab.defaultPrevented).toBe(false);
    expect(store.selectedLanguage).toBe('cpp');
  });
});

describe('MultilingualCodePanel: PS-005 auto-scroll into view', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  function mountWithStubbedMetrics(): {
    wrapper: ReturnType<typeof mount>;
    viewportEl: HTMLDivElement;
  } {
    const longScript: LanguageCode[] = [
      {
        language: 'cpp',
        lines: Array.from({ length: 20 }, (_, i) => ({
          lineNumber: i + 1,
          text: `line ${i + 1}`,
          logicalId: `STEP_${i + 1}`,
        })),
      },
    ];
    const store = usePseudocodeStore();
    store.loadPseudocodeScript(longScript);
    const wrapper = mount(MultilingualCodePanel);
    const viewportEl = wrapper.find('.code-viewport').element as HTMLDivElement;
    Object.defineProperty(viewportEl, 'scrollTo', { configurable: true, value: vi.fn() });
    Object.defineProperty(viewportEl, 'clientHeight', { configurable: true, value: 300 });
    return { wrapper, viewportEl };
  }

  it('scrolls the active line into view when it sits below the fold', async () => {
    const { wrapper, viewportEl } = mountWithStubbedMetrics();
    const animStore = useAnimationStore();
    const lineEl = wrapper.findAll('.code-line')[19].element;
    Object.defineProperty(lineEl, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ top: 480, height: 24 }),
    });
    animStore.loadResult({
      algorithmId: 'bubble-sort',
      pseudoCode: [],
      frames: [makeFrame('STEP_20')],
    });
    await nextTick();
    await nextTick();
    expect(viewportEl.scrollTo).toHaveBeenCalled();
    const call = (viewportEl.scrollTo as ReturnType<typeof vi.fn>).mock.calls[0][0] as {
      top: number;
    };
    expect(call.top).toBeGreaterThan(0);
  });

  it('does not scroll when the active line is already visible', async () => {
    const { wrapper, viewportEl } = mountWithStubbedMetrics();
    const animStore = useAnimationStore();
    const lineEl = wrapper.findAll('.code-line')[0].element;
    Object.defineProperty(lineEl, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ top: 24, height: 24 }),
    });
    animStore.loadResult({
      algorithmId: 'bubble-sort',
      pseudoCode: [],
      frames: [makeFrame('STEP_1')],
    });
    await nextTick();
    await nextTick();
    expect(viewportEl.scrollTo).not.toHaveBeenCalled();
  });
});

describe('MultilingualCodePanel: PS-032 click-to-snap', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  function loadSwapFrames(): ReturnType<typeof useAnimationStore> {
    const animStore = useAnimationStore();
    animStore.loadResult({
      algorithmId: 'bubble-sort',
      pseudoCode: [],
      frames: [
        makeFrame('FUNC_DECL'),
        makeFrame('COMPARE_STEP'),
        makeFrame('SWAP_STEP'),
        makeFrame('COMPARE_STEP'),
        makeFrame('COMPARE_STEP'),
        makeFrame('SWAP_STEP'),
      ],
    });
    return animStore;
  }

  it('clicking an executable line pauses playback', async () => {
    const store = usePseudocodeStore();
    const animStore = loadSwapFrames();
    store.loadPseudocodeScript(mockLanguages);
    animStore.play();
    const wrapper = mount(MultilingualCodePanel);
    await wrapper.findAll('.code-line')[3].trigger('click');
    expect(animStore.isPlaying).toBe(false);
  });

  it('clicking before the first occurrence snaps to the first occurrence', async () => {
    const store = usePseudocodeStore();
    const animStore = loadSwapFrames();
    store.loadPseudocodeScript(mockLanguages);
    animStore.goToFrame(0);
    const wrapper = mount(MultilingualCodePanel);
    await wrapper.findAll('.code-line')[3].trigger('click');
    expect(animStore.currentIndex).toBe(2);
  });

  it('clicking while currentIndex sits between occurrences snaps back to the FIRST occurrence (BEHAVIOR_SPEC §2)', async () => {
    const store = usePseudocodeStore();
    const animStore = loadSwapFrames();
    store.loadPseudocodeScript(mockLanguages);
    animStore.goToFrame(4);
    const wrapper = mount(MultilingualCodePanel);
    await wrapper.findAll('.code-line')[3].trigger('click');
    expect(animStore.currentIndex).toBe(2);
  });
});
