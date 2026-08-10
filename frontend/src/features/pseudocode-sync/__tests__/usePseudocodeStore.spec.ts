import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePseudocodeStore } from '../store/usePseudocodeStore';
import { useAnimationStore } from '../../animation-engine/store/useAnimationStore';
import { getSyncFrames } from '../store/pseudocodeStoreHelpers';
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

describe('usePseudocodeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('initializes with default state', () => {
    const store = usePseudocodeStore();
    expect(store.selectedLanguage).toBe('cpp');
    expect(store.codeLanguages).toEqual([]);
    expect(store.activeCodeLines).toEqual([]);
    expect(store.isScriptLoaded).toBe(false);
  });

  it('loads pseudocode script correctly', () => {
    const store = usePseudocodeStore();
    store.loadPseudocodeScript(mockLanguages);
    expect(store.codeLanguages).toHaveLength(2);
    expect(store.isScriptLoaded).toBe(true);
  });

  it('returns correct active code lines for selected language', () => {
    const store = usePseudocodeStore();
    store.loadPseudocodeScript(mockLanguages);
    expect(store.activeCodeLines).toHaveLength(4);
    expect(store.activeCodeLines[0].logicalId).toBe('FUNC_DECL');
  });

  it('changes language and updates active code lines', () => {
    const store = usePseudocodeStore();
    store.loadPseudocodeScript(mockLanguages);
    store.changeLanguage('python');
    expect(store.selectedLanguage).toBe('python');
    expect(store.activeCodeLines).toHaveLength(4);
    expect(store.activeCodeLines[0].text).toBe('def bubble_sort(arr):');
  });

  it('cycles through available languages', () => {
    const store = usePseudocodeStore();
    store.loadPseudocodeScript(mockLanguages);
    expect(store.selectedLanguage).toBe('cpp');
    store.cycleLanguage();
    expect(store.selectedLanguage).toBe('python');
    store.cycleLanguage();
    expect(store.selectedLanguage).toBe('cpp');
  });

  it('returns available languages', () => {
    const store = usePseudocodeStore();
    store.loadPseudocodeScript(mockLanguages);
    expect(store.availableLanguages).toEqual(['cpp', 'python']);
  });

  it('computes activePhysicalLineNumber from animation frame', () => {
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

  it('computes activePhysicalLineNumber correctly when language changes', () => {
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
    store.changeLanguage('python');
    expect(store.activePhysicalLineNumber).toBe(4);
  });

  it('returns null activePhysicalLineNumber when no frames loaded', () => {
    const store = usePseudocodeStore();
    store.loadPseudocodeScript(mockLanguages);
    expect(store.activePhysicalLineNumber).toBeNull();
  });

  it('computes watchVariablesList from animation frame', () => {
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
          variables: { i: 2, j: 3, n: 5 },
        },
      ],
    });

    expect(store.watchVariablesList).toEqual([
      { name: 'i', value: 2 },
      { name: 'j', value: 3 },
      { name: 'n', value: 5 },
    ]);
  });

  it('returns empty watchVariablesList when no frames', () => {
    const store = usePseudocodeStore();
    expect(store.watchVariablesList).toEqual([]);
  });

  it('snapToLogicalLine jumps animation to correct frame', () => {
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
          dataState: [5, 3],
          highlights: { compare: [], swap: [], sorted: [] },
          activeLogicalLineId: 'FUNC_DECL',
          variables: { n: 2 },
        },
        {
          stepId: 2,
          activeLine: 2,
          explanation: '',
          dataState: [5, 3],
          highlights: { compare: [0, 1], swap: [], sorted: [] },
          activeLogicalLineId: 'COMPARE_STEP',
          variables: { i: 0, j: 0 },
        },
        {
          stepId: 3,
          activeLine: 3,
          explanation: '',
          dataState: [3, 5],
          highlights: { compare: [], swap: [0, 1], sorted: [] },
          activeLogicalLineId: 'SWAP_STEP',
          variables: { i: 0, j: 0, temp: 5 },
        },
      ],
    });

    store.snapToLogicalLine('SWAP_STEP');
    expect(animStore.currentIndex).toBe(2);
  });

  it('getOccurrenceInfo returns correct counts', () => {
    const store = usePseudocodeStore();
    const animStore = useAnimationStore();

    store.loadPseudocodeScript(mockLanguages);
    animStore.loadResult({
      algorithmId: 'bubble-sort',
      pseudoCode: [],
      frames: [
        {
          stepId: 1, activeLine: 0, explanation: '', dataState: [],
          highlights: { compare: [], swap: [], sorted: [] },
          activeLogicalLineId: 'COMPARE_STEP', variables: { i: 0, j: 0 },
        },
        {
          stepId: 2, activeLine: 0, explanation: '', dataState: [],
          highlights: { compare: [], swap: [], sorted: [] },
          activeLogicalLineId: 'SWAP_STEP', variables: { i: 0, j: 0 },
        },
        {
          stepId: 3, activeLine: 0, explanation: '', dataState: [],
          highlights: { compare: [], swap: [], sorted: [] },
          activeLogicalLineId: 'COMPARE_STEP', variables: { i: 0, j: 1 },
        },
      ],
    });

    const info = store.getOccurrenceInfo('COMPARE_STEP');
    expect(info.total).toBe(2);
  });

  it('resetStore clears all state', () => {
    const store = usePseudocodeStore();
    store.loadPseudocodeScript(mockLanguages);
    store.changeLanguage('python');

    store.resetStore();
    expect(store.selectedLanguage).toBe('cpp');
    expect(store.codeLanguages).toEqual([]);
    expect(store.isScriptLoaded).toBe(false);
  });

  it('falls back to first available language if selected not in script', () => {
    const store = usePseudocodeStore();
    store.changeLanguage('javascript');
    store.loadPseudocodeScript(mockLanguages);
    expect(store.selectedLanguage).toBe('cpp');
  });
});

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

describe('PS-029: occurrence snapping, sync frames & stale-state edges', () => {
  function loadOccurrenceFrames(animStore: ReturnType<typeof useAnimationStore>): void {
    animStore.loadResult({
      algorithmId: 'bubble-sort',
      pseudoCode: [],
      frames: [
        makeFrame('FUNC_DECL'),
        makeFrame('COMPARE_STEP'),
        makeFrame('SWAP_STEP'),
        makeFrame('COMPARE_STEP'),
        makeFrame('SWAP_STEP'),
        makeFrame('COMPARE_STEP'),
      ],
    });
  }

  it('snapToNextOccurrence advances to the next occurrence', () => {
    const store = usePseudocodeStore();
    const animStore = useAnimationStore();
    store.loadPseudocodeScript(mockLanguages);
    loadOccurrenceFrames(animStore);
    animStore.goToFrame(1);
    store.snapToNextOccurrence('SWAP_STEP');
    expect(animStore.currentIndex).toBe(2);
    expect(animStore.isPlaying).toBe(false);
  });

  it('snapToNextOccurrence wraps around to the first occurrence after the last one', () => {
    const store = usePseudocodeStore();
    const animStore = useAnimationStore();
    store.loadPseudocodeScript(mockLanguages);
    loadOccurrenceFrames(animStore);
    animStore.goToFrame(4);
    store.snapToNextOccurrence('SWAP_STEP');
    expect(animStore.currentIndex).toBe(2);
  });

  it('snapToNextOccurrence is a no-op for a logicalId with no frames', () => {
    const store = usePseudocodeStore();
    const animStore = useAnimationStore();
    store.loadPseudocodeScript(mockLanguages);
    loadOccurrenceFrames(animStore);
    animStore.goToFrame(0);
    store.snapToNextOccurrence('UNKNOWN_STEP');
    expect(animStore.currentIndex).toBe(0);
  });

  it('getOccurrenceInfo.current points to the next occurrence when currentIndex sits between two occurrences', () => {
    const store = usePseudocodeStore();
    const animStore = useAnimationStore();
    store.loadPseudocodeScript(mockLanguages);
    loadOccurrenceFrames(animStore);
    animStore.goToFrame(2);
    expect(store.getOccurrenceInfo('COMPARE_STEP')).toEqual({ current: 2, total: 3 });
    animStore.goToFrame(4);
    expect(store.getOccurrenceInfo('COMPARE_STEP')).toEqual({ current: 3, total: 3 });
  });

  it('getOccurrenceInfo returns 0/0 for a logicalId without frames', () => {
    const store = usePseudocodeStore();
    const animStore = useAnimationStore();
    store.loadPseudocodeScript(mockLanguages);
    loadOccurrenceFrames(animStore);
    expect(store.getOccurrenceInfo('UNKNOWN_STEP')).toEqual({ current: 0, total: 0 });
  });

  it('getSyncFrames maps raw frames with fallbacks for missing fields', () => {
    expect(
      getSyncFrames([
        { activeLogicalLineId: 'A', variables: { x: 1 } },
        {},
        { activeLogicalLineId: 'B' },
      ]),
    ).toEqual([
      { frameIndex: 0, activeLogicalLineId: 'A', variables: { x: 1 } },
      { frameIndex: 1, activeLogicalLineId: '', variables: {} },
      { frameIndex: 2, activeLogicalLineId: 'B', variables: {} },
    ]);
  });

  it('returns null physical line when frame logicalId is absent from the script', () => {
    const store = usePseudocodeStore();
    const animStore = useAnimationStore();
    store.loadPseudocodeScript(mockLanguages);
    animStore.loadResult({
      algorithmId: 'quick-sort',
      pseudoCode: [],
      frames: [makeFrame('PARTITION_STEP', { pivot: 5 })],
    });
    expect(store.activeLogicalLineId).toBe('PARTITION_STEP');
    expect(store.activePhysicalLineNumber).toBeNull();
  });

  it('clears stale highlight when the dataset switches mid-way', () => {
    const store = usePseudocodeStore();
    const animStore = useAnimationStore();
    store.loadPseudocodeScript(mockLanguages);
    animStore.loadResult({
      algorithmId: 'bubble-sort',
      pseudoCode: [],
      frames: [makeFrame('COMPARE_STEP', { i: 0 })],
    });
    expect(store.activePhysicalLineNumber).toBe(3);
    animStore.loadResult({
      algorithmId: 'quick-sort',
      pseudoCode: [],
      frames: [makeFrame('PARTITION_STEP', { pivot: 5 })],
    });
    expect(store.activePhysicalLineNumber).toBeNull();
    animStore.loadResult({
      algorithmId: 'bubble-sort',
      pseudoCode: [],
      frames: [makeFrame('SWAP_STEP', { i: 0 })],
    });
    expect(store.activePhysicalLineNumber).toBe(4);
  });

  it('recomputes physical lines when a new script is loaded over existing frames', () => {
    const store = usePseudocodeStore();
    const animStore = useAnimationStore();
    store.loadPseudocodeScript(mockLanguages);
    animStore.loadResult({
      algorithmId: 'bubble-sort',
      pseudoCode: [],
      frames: [makeFrame('COMPARE_STEP', { i: 0 })],
    });
    expect(store.activePhysicalLineNumber).toBe(3);
    store.loadPseudocodeScript([
      {
        language: 'cpp',
        lines: [
          { lineNumber: 1, text: 'a', logicalId: 'COMPARE_STEP' },
          { lineNumber: 2, text: 'b', logicalId: 'SWAP_STEP' },
        ],
      },
    ]);
    expect(store.activePhysicalLineNumber).toBe(1);
  });
});

describe('PS-031: debounced highlight at speed >= 2.0 (BEHAVIOR_SPEC §1)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('updates the active line synchronously when speed < 2', () => {
    const store = usePseudocodeStore();
    const animStore = useAnimationStore();
    store.loadPseudocodeScript(mockLanguages);
    animStore.setSpeed(1);
    animStore.loadResult({
      algorithmId: 'bubble-sort',
      pseudoCode: [],
      frames: [makeFrame('COMPARE_STEP', { i: 0, j: 0 })],
    });
    expect(store.activePhysicalLineNumber).toBe(3);
  });

  it('defers the active line update by exactly 50ms when speed >= 2', () => {
    vi.useFakeTimers();
    const store = usePseudocodeStore();
    const animStore = useAnimationStore();
    store.loadPseudocodeScript(mockLanguages);
    animStore.setSpeed(2);
    animStore.loadResult({
      algorithmId: 'bubble-sort',
      pseudoCode: [],
      frames: [makeFrame('COMPARE_STEP', { i: 0, j: 0 })],
    });
    expect(store.activePhysicalLineNumber).toBeNull();
    vi.advanceTimersByTime(49);
    expect(store.activePhysicalLineNumber).toBeNull();
    vi.advanceTimersByTime(1);
    expect(store.activePhysicalLineNumber).toBe(3);
  });

  it('skips intermediate highlights at speed >= 2 and keeps only the final line', () => {
    vi.useFakeTimers();
    const store = usePseudocodeStore();
    const animStore = useAnimationStore();
    store.loadPseudocodeScript(mockLanguages);
    animStore.setSpeed(2);
    animStore.loadResult({
      algorithmId: 'bubble-sort',
      pseudoCode: [],
      frames: [
        makeFrame('COMPARE_STEP', { i: 0, j: 0 }),
        makeFrame('SWAP_STEP', { i: 0, j: 0, temp: 5 }),
        makeFrame('OUTER_LOOP', { i: 1 }),
      ],
    });
    animStore.goToFrame(1);
    animStore.goToFrame(2);
    expect(store.activePhysicalLineNumber).toBeNull();
    vi.advanceTimersByTime(50);
    expect(store.activePhysicalLineNumber).toBe(2);
  });
});
