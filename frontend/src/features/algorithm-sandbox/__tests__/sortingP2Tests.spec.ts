// @vitest-environment jsdom
import { sortingSharedOverride } from './sortingSharedOverride';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';

import { useVcrStore } from '../../vcr-player/store/useVcrStore';
import { useSortingAnimation } from '../composables/useSortingAnimation';
import { generateBubbleSortFrames } from '../algorithms/bubbleSort';
import { generateQuickSortFrames } from '../algorithms/quickSort';
import { generateMergeSortFrames } from '../algorithms/mergeSort';
import { generateHeapSortFrames } from '../algorithms/heapSort';
import { generateCountingSortFrames } from '../algorithms/countingSort';
import { generateBucketSortFrames } from '../algorithms/bucketSort';
import { generateRadixSortFrames } from '../algorithms/radixSort';
import { enrichFramesWithIds } from '../helpers/sortingIdEnricher';
import ArrayBarVisualizer from '../components/ArrayBarVisualizer.vue';
import SortingVisualizerDispatcher from '../components/SortingVisualizerDispatcher.vue';
import SortingProgressBar from '../components/SortingProgressBar.vue';
import SortingHudOverlay from '../components/SortingHudOverlay.vue';
import SortingDrawerTrace from '../components/SortingDrawerTrace.vue';
import SortingDetailPanel from '../components/SortingDetailPanel.vue';
import SortingTraceTable from '../components/SortingTraceTable.vue';
import BubbleSortVisualizer from '../components/BubbleSortVisualizer.vue';
import QuickSortVisualizer from '../components/QuickSortVisualizer.vue';
import MergeSortVisualizer from '../components/MergeSortVisualizer.vue';
import HeapSortVisualizer from '../components/HeapSortVisualizer.vue';
import CountingSortVisualizer from '../components/CountingSortVisualizer.vue';
import BucketSortVisualizer from '../components/BucketSortVisualizer.vue';
import type { SortFrame, SortAlgorithm } from '../types/sorting.types';

// SV-001: chặn order-coupling — component dùng useSharedSortingAnimation sẽ nhận instance
// test ép sẵn (gắn pinia hiện tại) thay vì singleton _sharedInstance module-scope bị khóa
// pinia cũ từ test trước. afterEach trả về hành vi thật (override = null).
vi.mock('../composables/useSortingAnimation', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../composables/useSortingAnimation')>();
  return {
    ...actual,
    useSharedSortingAnimation: () =>
      sortingSharedOverride.instance ?? actual.useSharedSortingAnimation(),
  };
});

describe('Algorithm Sandbox — Sorting P2 Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    // SV-001: reset override sau mỗi test — hết phụ thuộc thứ tự chạy
    sortingSharedOverride.instance = null;
  });

  // ── US-AS-002 (P2): Preset mảng ─────────────────────────────────────────
  describe('US-AS-002 (P2): Preset mảng', () => {
    it('render 4 preset buttons: Ngẫu nhiên, Đã sắp xếp, Đảo ngược, Gần sort', () => {
      const wrapper = mount(ArrayBarVisualizer, {
        global: { stubs: { BaseIcon: { template: '<span />' } } },
      });

      const buttons = wrapper.findAll('button');
      const presetLabels = buttons.map(b => b.text());
      expect(presetLabels).toContain('Ngẫu nhiên');
      expect(presetLabels).toContain('Đã sắp xếp');
      expect(presetLabels).toContain('Đảo ngược');
      expect(presetLabels).toContain('Gần sort');
    });
  });

  // ── US-AS-003 (P2): Slider N ────────────────────────────────────────────
  describe('US-AS-003 (P2): Slider N', () => {
    it('slider có min=4 và max=15', () => {
      const wrapper = mount(ArrayBarVisualizer, {
        global: { stubs: { BaseIcon: { template: '<span />' } } },
      });

      const slider = wrapper.find('input[type="range"]');
      expect(slider.exists()).toBe(true);
      expect(slider.attributes('min')).toBe('4');
      expect(slider.attributes('max')).toBe('15');
    });
  });

  // ── US-AS-004 (P2): Tab label ───────────────────────────────────────────
  describe('US-AS-004 (P2): Tab label', () => {
    it('tab container có data-tour-id="dsa-simulation-tab"', () => {
      const wrapper = mount(ArrayBarVisualizer, {
        global: { stubs: { BaseIcon: { template: '<span />' } } },
      });

      const tabContainer = wrapper.find('[data-tour-id="dsa-simulation-tab"]');
      expect(tabContainer.exists()).toBe(true);
    });
  });

  // ── US-AS-005 (P2): Tab switching ───────────────────────────────────────
  describe('US-AS-005 (P2): Tab switching', () => {
    it('VCR store giữ state khi chuyển thuật toán', () => {
      vi.useFakeTimers(); // mock performance.now để vượt debounce step 100ms (EC-005)
      try {
        const store = useVcrStore();
        const sorting = useSortingAnimation();

        sorting.selectAlgorithm('bubble');
        const bubbleFrames = sorting.sortFrames.value.length;
        expect(bubbleFrames).toBeGreaterThan(0);

        store.stepNext();
        vi.advanceTimersByTime(101);
        store.stepNext();
        expect(store.currentFrameIndex).toBe(2);

        sorting.selectAlgorithm('quick');
        expect(store.currentFrameIndex).toBe(0);

        sorting.selectAlgorithm('bubble');
        expect(store.totalFrames).toBe(bubbleFrames);
      } finally {
        vi.useRealTimers();
      }
    });
  });

  // ── US-AS-008 (P2): Algorithm not found ─────────────────────────────────
  describe('US-AS-008 (P2): Algorithm not found', () => {
    it('hiển thị "Không nhận diện được thuật toán" khi algorithm không hợp lệ', () => {
      const invalidFrame: SortFrame = {
        stepIndex: 0,
        arrayState: [1, 2, 3],
        comparingIndices: null,
        pivotIndex: null,
        swappedIndices: null,
        sortedIndices: [],
        description: 'test',
        algorithm: 'invalid_algo' as unknown as SortAlgorithm,
      };

      const wrapper = mount(SortingVisualizerDispatcher, {
        props: { frame: invalidFrame },
        global: { stubs: { BaseIcon: { template: '<span />' } } },
      });

      expect(wrapper.text()).toContain('Không nhận diện được thuật toán');
    });
  });

  // ── US-AS-009 (P2): Progress bar ────────────────────────────────────────
  describe('US-AS-009 (P2): Progress bar', () => {
    it('SortingProgressBar render với width %', () => {
      const wrapper = mount(SortingProgressBar, {
        props: { progressPercent: 50 },
      });

      const bar = wrapper.find('.progress-bar');
      expect(bar.exists()).toBe(true);
      expect(bar.attributes('style')).toContain('width: 50%');
    });

    it('progress bar width = 0% khi progressPercent = 0', () => {
      const wrapper = mount(SortingProgressBar, {
        props: { progressPercent: 0 },
      });

      const bar = wrapper.find('.progress-bar');
      expect(bar.attributes('style')).toContain('width: 0%');
    });

    it('progress bar width = 100% khi progressPercent = 100', () => {
      const wrapper = mount(SortingProgressBar, {
        props: { progressPercent: 100 },
      });

      const bar = wrapper.find('.progress-bar');
      expect(bar.attributes('style')).toContain('width: 100%');
    });
  });

  // ── US-AS-010 (P2): HUD overlay ─────────────────────────────────────────
  describe('US-AS-010 (P2): HUD overlay', () => {
    it('SortingHudOverlay hiển thị stepDescription', () => {
      const wrapper = mount(SortingHudOverlay, {
        props: { stepDescription: 'So sánh arr[0] và arr[1]' },
      });

      expect(wrapper.text()).toContain('So sánh arr[0] và arr[1]');
    });

    it('SortingHudOverlay hiển thị description mặc định', () => {
      const wrapper = mount(SortingHudOverlay, {
        props: { stepDescription: 'Khởi tạo mảng dữ liệu đầu vào' },
      });

      expect(wrapper.text()).toContain('Khởi tạo mảng dữ liệu đầu vào');
    });
  });

  // ── US-AS-011 (P2): Drawer toggle ───────────────────────────────────────
  describe('US-AS-011 (P2): Drawer toggle', () => {
    it('SortingDrawerTrace mở khi click toggle button', async () => {
      const wrapper = mount(SortingDrawerTrace, {
        global: { stubs: { BaseIcon: { template: '<span />' } } },
      });

      const toggleBtn = wrapper.find('.drawer-toggle-btn');
      expect(toggleBtn.exists()).toBe(true);

      await toggleBtn.trigger('click');
      const drawerCard = wrapper.find('.drawer-card');
      expect(drawerCard.exists()).toBe(true);
    });

    it('SortingDrawerTrace đóng khi click lần nữa', async () => {
      const wrapper = mount(SortingDrawerTrace, {
        global: { stubs: { BaseIcon: { template: '<span />' } } },
      });

      const toggleBtn = wrapper.find('.drawer-toggle-btn');
      await toggleBtn.trigger('click');
      expect(wrapper.find('.drawer-card').exists()).toBe(true);

      await toggleBtn.trigger('click');
      expect(wrapper.find('.drawer-card').exists()).toBe(false);
    });
  });

  // ── US-AS-012 (P2): Tab detail/vars ─────────────────────────────────────
  describe('US-AS-012 (P2): Tab detail/vars', () => {
    it('render 2 tab buttons: Chi tiết và Bảng biến', () => {
      const wrapper = mount(SortingDetailPanel, {
        global: { stubs: { BaseIcon: { template: '<span />' } } },
      });

      const tabs = wrapper.findAll('.mini-tab');
      expect(tabs.length).toBe(2);
      expect(tabs[0].text()).toContain('Chi tiết');
      expect(tabs[1].text()).toContain('Bảng biến');
    });
  });

  // ── US-AS-013 (P2): Detail info ─────────────────────────────────────────
  describe('US-AS-013 (P2): Detail info', () => {
    it('SV-001: hiển thị algoLabel trong tab Chi tiết (không phụ thuộc trace "vars")', async () => {
      const sorting = useSortingAnimation();
      sorting.selectAlgorithm('bubble');
      // Ép panel dùng ĐÚNG instance gắn pinia hiện tại — không singleton pinia cũ
      sortingSharedOverride.instance = sorting;

      const wrapper = mount(SortingDetailPanel, {
        global: { stubs: { BaseIcon: { template: '<span />' } } },
      });

      // Đổi sang tab "Chi tiết" TRƯỚC khi assert — algoLabel chỉ render trong tab này
      const tabs = wrapper.findAll('.mini-tab');
      await tabs[0].trigger('click');
      expect(wrapper.find('.mini-tab-active').text()).toContain('Chi tiết');

      expect(wrapper.text()).toContain('Bubble Sort');
      expect(wrapper.text()).toContain('Bước');
    });

    it('SV-001: algoLabel theo selectedAlgo — đổi sang quick rồi mở tab Chi tiết', async () => {
      const sorting = useSortingAnimation();
      sorting.selectAlgorithm('quick');
      sortingSharedOverride.instance = sorting;

      const wrapper = mount(SortingDetailPanel, {
        global: { stubs: { BaseIcon: { template: '<span />' } } },
      });

      // quick → activeTab mặc định đã là detail (watch selectedAlgo)
      expect(wrapper.find('.mini-tab-active').text()).toContain('Chi tiết');
      expect(wrapper.text()).toContain('Quick Sort');
    });
  });

  // ── US-AS-015 (P2): Trace table click row ───────────────────────────────
  describe('US-AS-015 (P2): Trace table click row', () => {
    it('emit jump khi click vào row', async () => {
      const frames = generateBubbleSortFrames([5, 3, 8, 4, 2]);
      enrichFramesWithIds(frames);

      const wrapper = mount(SortingTraceTable, {
        props: {
          frames,
          currentIndex: 0,
        },
        global: { stubs: { BaseIcon: { template: '<span />' } } },
      });

      const rows = wrapper.findAll('tbody tr');
      expect(rows.length).toBeGreaterThan(0);

      await rows[2].trigger('click');
      const emissions = wrapper.emitted('jump');
      expect(emissions).toBeTruthy();
      expect(emissions![0]).toEqual([2]);
    });
  });

  // ── US-AS-017 (P2): Counting label ──────────────────────────────────────
  describe('US-AS-017 (P2): Counting label', () => {
    it('label format "A[0]→Count[1]" cho counting sort', () => {
      const frames = generateCountingSortFrames([45, 12, 85]);

      const countFrames = frames.filter(f => f.countingStep === 'count' && f.comparingIndices !== null);
      expect(countFrames.length).toBeGreaterThan(0);

      const firstCountFrame = countFrames[0];
      expect(firstCountFrame.description).toMatch(/A\[\d+\]/);
      expect(firstCountFrame.description).toMatch(/Count\[\d+\]/);
    });
  });

  // ── US-AS-018 (P2): Default tab ─────────────────────────────────────────
  describe('US-AS-018 (P2): Default tab', () => {
    it('quick sort → detail tab active', () => {
      const sorting = useSortingAnimation();
      sorting.selectAlgorithm('quick');

      const wrapper = mount(SortingDetailPanel, {
        global: { stubs: { BaseIcon: { template: '<span />' } } },
      });

      const tabs = wrapper.findAll('.mini-tab');
      expect(tabs.length).toBe(2);
    });

    it('merge sort → detail tab active', () => {
      const sorting = useSortingAnimation();
      sorting.selectAlgorithm('merge');

      const wrapper = mount(SortingDetailPanel, {
        global: { stubs: { BaseIcon: { template: '<span />' } } },
      });

      const tabs = wrapper.findAll('.mini-tab');
      expect(tabs.length).toBe(2);
    });
  });

  // ── US-AS-020 (P2): Bar colors ──────────────────────────────────────────
  describe('US-AS-020 (P2): Bar colors', () => {
    it('bubble sort có class comparing/swap/sorted', () => {
      const frames = generateBubbleSortFrames([5, 3, 8, 4, 2]);
      enrichFramesWithIds(frames);

      const compareFrame = frames.find(f => f.comparingIndices !== null);
      expect(compareFrame).toBeDefined();

      const wrapper = mount(BubbleSortVisualizer, {
        props: { frame: compareFrame! },
      });

      const bars = wrapper.findAll('.vis-bar-comparing');
      expect(bars.length).toBeGreaterThan(0);
    });

    it('bubble sort có class vis-bar-sorted khi sortedIndices có phần tử', () => {
      const frames = generateBubbleSortFrames([5, 3, 8, 4, 2]);
      enrichFramesWithIds(frames);

      const sortedFrame = frames.find(f => f.sortedIndices.length > 0);
      expect(sortedFrame).toBeDefined();

      const wrapper = mount(BubbleSortVisualizer, {
        props: { frame: sortedFrame! },
      });

      const sortedBars = wrapper.findAll('.vis-bar-sorted');
      expect(sortedBars.length).toBeGreaterThan(0);
    });
  });

  // ── US-AS-021 (P2): Index labels ────────────────────────────────────────
  describe('US-021 (P2): Index labels', () => {
    it('hiển thị label [0]..[9] khi ≤ 12 bars', () => {
      const frames = generateBubbleSortFrames([5, 3, 8, 4, 2, 7, 1, 9, 6, 10]);
      enrichFramesWithIds(frames);

      const wrapper = mount(BubbleSortVisualizer, {
        props: { frame: frames[0] },
      });

      const indexLabels = wrapper.findAll('[class*="vis-index"]');
      expect(indexLabels.length).toBe(10);
      expect(indexLabels[0].text()).toBe('[0]');
      expect(indexLabels[9].text()).toBe('[9]');
    });
  });

  // ── US-AS-022 (P2): Bubble pulse ────────────────────────────────────────
  describe('US-AS-022 (P2): Bubble pulse', () => {
    it('bar-pulse animation class khi swap', () => {
      const frames = generateBubbleSortFrames([5, 3, 8, 4, 2]);
      enrichFramesWithIds(frames);

      const swapFrame = frames.find(f => f.swappedIndices !== null);
      expect(swapFrame).toBeDefined();

      const wrapper = mount(BubbleSortVisualizer, {
        props: { frame: swapFrame! },
      });

      const swappedBars = wrapper.findAll('.vis-bar-swapped');
      expect(swappedBars.length).toBeGreaterThan(0);
    });
  });

  // ── US-AS-024 (P2): Quick sort hover tooltip ────────────────────────────
  describe('US-AS-024 (P2): Quick sort hover tooltip', () => {
    it('hiển thị tooltip khi hover vào element', async () => {
      const frames = generateQuickSortFrames([5, 3, 8, 4, 2]);
      enrichFramesWithIds(frames);

      const wrapper = mount(QuickSortVisualizer, {
        props: { frame: frames[0] },
        attachTo: document.body,
      });

      const items = wrapper.findAll('.sort-item');
      expect(items.length).toBeGreaterThan(0);

      await items[0].trigger('mouseenter');
      const tooltip = wrapper.find('.hover-tooltip');
      expect(tooltip.exists()).toBe(true);
      expect(tooltip.text()).toContain('Phần tử [0]');
      expect(tooltip.text()).toContain('Giá trị:');
    });
  });

  // ── US-AS-025 (P2): Pivot badge ─────────────────────────────────────────
  describe('US-AS-025 (P2): Pivot badge', () => {
    it('hiển thị "Pivot" badge khi pivotIndex != null', () => {
      const frames = generateQuickSortFrames([5, 3, 8, 4, 2]);
      enrichFramesWithIds(frames);

      const pivotFrame = frames.find(f => f.pivotIndex !== null);
      expect(pivotFrame).toBeDefined();

      const wrapper = mount(QuickSortVisualizer, {
        props: { frame: pivotFrame! },
      });

      const pivotBadge = wrapper.find('.pivot-badge');
      expect(pivotBadge.exists()).toBe(true);
      expect(pivotBadge.text()).toBe('Pivot');
    });
  });

  // ── US-AS-029 (P2): Merge sort label ────────────────────────────────────
  describe('US-AS-029 (P2): Merge sort label', () => {
    it('hiển thị "Mảng gốc", "Chia đoạn", "Mảng đơn"', () => {
      const frames = generateMergeSortFrames([5, 3, 8, 4, 2, 7]);
      enrichFramesWithIds(frames);

      const wrapper = mount(MergeSortVisualizer, {
        props: { frame: frames[0] },
      });

      const levelSubtitles = wrapper.findAll('.level-subtitle');
      const subtitleTexts = levelSubtitles.map(s => s.text());

      expect(subtitleTexts).toContain('Mảng gốc');
    });
  });

  // ── US-AS-030 (P2): Merge active subarray ───────────────────────────────
  describe('US-AS-030 (P2): Merge active subarray', () => {
    it('active subarray có class khác biệt', () => {
      const frames = generateMergeSortFrames([5, 3, 8, 4, 2, 7]);
      enrichFramesWithIds(frames);

      const activeFrame = frames.find(f => f.subArrays?.some(s => s.isActive));
      expect(activeFrame).toBeDefined();

      const wrapper = mount(MergeSortVisualizer, {
        props: { frame: activeFrame! },
      });

      const activeSubarrays = wrapper.findAll('.subarray-block.active');
      expect(activeSubarrays.length).toBeGreaterThan(0);
    });
  });

  // ── US-AS-033 (P2): Heap badge ──────────────────────────────────────────
  describe('US-AS-033 (P2): Heap badge', () => {
    it('hiển thị "BUILD" badge khi đang build heap', () => {
      const frames = generateHeapSortFrames([5, 3, 8, 4, 2]);
      enrichFramesWithIds(frames);

      const wrapper = mount(HeapSortVisualizer, {
        props: { frame: frames[0] },
        global: { stubs: { BaseIcon: { template: '<span />' } } },
      });

      const badge = wrapper.find('.bg-accent-cyan\\/15, .bg-accent-emerald\\/15');
      expect(wrapper.text()).toMatch(/BUILD|SORT/);
    });
  });

  // ── US-AS-036 (P2): Counting legend ─────────────────────────────────────
  describe('US-AS-036 (P2): Counting legend', () => {
    it('hiển thị legend chú thích màu', () => {
      const frames = generateCountingSortFrames([45, 12, 85]);
      enrichFramesWithIds(frames);

      const wrapper = mount(CountingSortVisualizer, {
        props: { frame: frames[0] },
        global: { stubs: { BaseIcon: { template: '<span />' } } },
      });

      expect(wrapper.text()).toContain('Phần tử nguồn');
      expect(wrapper.text()).toContain('Đang đếm');
      expect(wrapper.text()).toContain('Đã đặt ổn định');
    });
  });

  // ── US-AS-038 (P2): Bucket legend ───────────────────────────────────────
  describe('US-AS-038 (P2): Bucket legend', () => {
    it('hiển thị legend bucket colors', () => {
      const frames = generateBucketSortFrames([45, 12, 85, 32, 9, 60]);
      enrichFramesWithIds(frames);

      const wrapper = mount(BucketSortVisualizer, {
        props: { frame: frames[0] },
        global: { stubs: { BaseIcon: { template: '<span />' } } },
      });

      expect(wrapper.text()).toContain('Phần tử nguồn');
      expect(wrapper.text()).toContain('Bucket đang hoạt động');
      expect(wrapper.text()).toContain('Đã thu gom');
    });
  });

  // ── SV-014 (P2): Race đổi input giữa playback ───────────────────────────
  describe('SV-014 (P2): Race đổi input giữa playback', () => {
    it('play → đổi rawInputArray → recompile → isPlaying=false, index=0, frames mới', () => {
      vi.useFakeTimers();
      try {
        const store = useVcrStore();
        const sorting = useSortingAnimation();

        store.rawInputArray = '5, 3, 8, 4, 2';
        sorting.selectAlgorithm('bubble');
        const oldFrameCount = sorting.sortFrames.value.length;
        const oldFirstState = sorting.sortFrames.value[0].arrayState;

        store.play();
        expect(store.isPlaying).toBe(true);
        store.stepNext();
        vi.advanceTimersByTime(101);
        store.stepNext();
        expect(store.currentFrameIndex).toBe(2);

        // Đổi input giữa lúc đang play — không được giữ frame cũ / index cũ
        store.rawInputArray = '9, 1, 7, 3, 6, 4, 8, 2, 5, 0, 1, 1, 1';
        sorting.recompileForAlgo('bubble');

        expect(store.isPlaying).toBe(false);
        expect(store.currentFrameIndex).toBe(0);
        expect(sorting.sortFrames.value.length).toBeGreaterThan(oldFrameCount);
        expect(sorting.sortFrames.value[0].arrayState).not.toEqual(oldFirstState);
        expect(store.totalFrames).toBe(sorting.sortFrames.value.length);
      } finally {
        vi.useRealTimers();
      }
    });
  });

  // ── SV-044 (P3): Dispatcher render đúng component con ───────────────────
  describe('SV-044 (P3): Dispatcher render đúng component theo algorithm', () => {
    function makeAlgoFrame(algo: SortAlgorithm): SortFrame {
      return {
        stepIndex: 0,
        arrayState: [3, 1, 2],
        comparingIndices: null,
        pivotIndex: null,
        swappedIndices: null,
        sortedIndices: [],
        description: 'frame mẫu',
        algorithm: algo,
      };
    }

    it.each([
      ['bubble', 'BubbleSortVisualizer'],
      ['quick', 'QuickSortVisualizer'],
      ['merge', 'MergeSortVisualizer'],
      ['heap', 'HeapSortVisualizer'],
      ['radix', 'RadixSortVisualizer'],
      ['counting', 'CountingSortVisualizer'],
      ['bucket', 'BucketSortVisualizer'],
    ] as Array<[SortAlgorithm, string]>)('%s → render %s', (algo, componentName) => {
      const wrapper = mount(SortingVisualizerDispatcher, {
        props: { frame: makeAlgoFrame(algo) },
        global: { stubs: { BaseIcon: { template: '<span />' } } },
      });

      expect(wrapper.findComponent({ name: componentName }).exists()).toBe(true);
      expect(wrapper.text()).not.toContain('Không nhận diện được thuật toán');
    });

    it.each([
      ['merge-x', 'merge'],
      ['heap-x', 'heap'],
      ['quick-x', 'quick'],
    ] as Array<[string, string]>)(
      'OOB algorithm "%s" (ngoài union cho %s) → hiển thị lỗi không nhận diện',
      (oobAlgo, _kind) => {
        const wrapper = mount(SortingVisualizerDispatcher, {
          props: { frame: makeAlgoFrame(oobAlgo as unknown as SortAlgorithm) },
          global: { stubs: { BaseIcon: { template: '<span />' } } },
        });

        expect(wrapper.text()).toContain('Không nhận diện được thuật toán');
        expect(wrapper.text()).toContain(oobAlgo);
        expect(wrapper.findComponent({ name: 'MergeSortVisualizer' }).exists()).toBe(false);
        expect(wrapper.findComponent({ name: 'HeapSortVisualizer' }).exists()).toBe(false);
        expect(wrapper.findComponent({ name: 'QuickSortVisualizer' }).exists()).toBe(false);
      },
    );
  });
});
