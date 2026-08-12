// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';

import { useVcrStore } from '../../vcr-player/store/useVcrStore';
import { useSortingAnimation } from '../composables/useSortingAnimation';
import { generateBubbleSortFrames } from '../algorithms/bubbleSort';
import { generateQuickSortFrames } from '../algorithms/quickSort';
import { generateMergeSortFrames } from '../algorithms/mergeSort';
import { generateHeapSortFrames } from '../algorithms/heapSort';
import { generateRadixSortFrames } from '../algorithms/radixSort';
import { generateCountingSortFrames } from '../algorithms/countingSort';
import { generateBucketSortFrames } from '../algorithms/bucketSort';
import { enrichFramesWithIds } from '../helpers/sortingIdEnricher';
import SortingVisualizerDispatcher from '../components/SortingVisualizerDispatcher.vue';
import type { SortFrame } from '../types/sorting.types';

const FALLBACK_ARRAY = [45, 12, 85, 32, 9, 60];
const MAX_ELEMENTS = 15;

describe('Algorithm Sandbox — Sorting P0/P1 Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // ── US-AS-001 (P0): Chọn thuật toán sắp xếp ──────────────────────────────
  describe('US-AS-001 (P0): Chọn thuật toán sắp xếp', () => {
    it('selectAlgorithm("bubble") gán đúng algorithm cho mọi frame', () => {
      const store = useVcrStore();
      const sorting = useSortingAnimation();

      sorting.selectAlgorithm('bubble');

      expect(sorting.sortFrames.value.length).toBeGreaterThan(0);
      for (const frame of sorting.sortFrames.value) {
        expect(frame.algorithm).toBe('bubble');
      }
      // Đồng bộ sang VCR store
      expect(store.playbackFrames.length).toBe(sorting.sortFrames.value.length);
    });

    it('selectAlgorithm("counting") gán đúng algorithm cho mọi frame', () => {
      const sorting = useSortingAnimation();

      sorting.selectAlgorithm('counting');

      expect(sorting.sortFrames.value.length).toBeGreaterThan(0);
      expect(sorting.sortFrames.value.every(f => f.algorithm === 'counting')).toBe(true);
    });
  });

  // ── US-AS-006 (P0): Empty state dispatcher ────────────────────────────────
  describe('US-AS-006 (P0): Empty state dispatcher', () => {
    it('hiển thị empty state khi frame = null', () => {
      const wrapper = mount(SortingVisualizerDispatcher, {
        props: { frame: null },
        global: { stubs: { BaseIcon: { template: '<span />' } } },
      });

      expect(wrapper.text()).toContain('Chưa có dữ liệu hoạt ảnh');
      expect(wrapper.text()).toContain('Chọn một preset mảng');
    });

    it('không render bất kỳ visualizer nào khi frame = null', () => {
      const wrapper = mount(SortingVisualizerDispatcher, {
        props: { frame: null },
        global: { stubs: { BaseIcon: { template: '<span />' } } },
      });

      expect(wrapper.findComponent({ name: 'BubbleSortVisualizer' }).exists()).toBe(false);
      expect(wrapper.findComponent({ name: 'QuickSortVisualizer' }).exists()).toBe(false);
    });
  });

  // ── US-AS-019 (P1): Bubble sort generator ─────────────────────────────────
  describe('US-AS-019 (P1): Bubble sort generator', () => {
    it('sinh frames với description tiếng Việt và đúng thuật toán', () => {
      const input = [5, 3, 8, 4, 2];
      const frames = generateBubbleSortFrames(input);

      expect(frames.length).toBeGreaterThan(0);
      expect(frames[0].algorithm).toBe('bubble');
      // Frame đầu tiên luôn là khởi tạo
      expect(frames[0].description).toContain('Khởi tạo');
      // Phải có frame so sánh
      const compareFrame = frames.find(f => f.comparingIndices !== null);
      expect(compareFrame).toBeDefined();
      expect(compareFrame!.description).toContain('So sánh');
      // Phải có frame hoán vị
      const swapFrame = frames.find(f => f.swappedIndices !== null);
      expect(swapFrame).toBeDefined();
      expect(swapFrame!.description).toContain('Hoán vị');
      // Frame cuối cùng phải hoàn thành
      const lastFrame = frames[frames.length - 1];
      expect(lastFrame.description).toContain('hoàn thành');
      expect(lastFrame.arrayState).toEqual([2, 3, 4, 5, 8]);
    });

    it('sinh frames có stepIndex tăng dần liên tục', () => {
      const frames = generateBubbleSortFrames([3, 1, 2]);
      frames.forEach((f, i) => expect(f.stepIndex).toBe(i));
    });
  });

  // ── US-AS-026 (P1): Stable ID enrichment ──────────────────────────────────
  describe('US-AS-026 (P1): Stable ID enrichment', () => {
    it('gán id duy nhất cho mọi phần tử qua mọi frame', () => {
      const input = [5, 3, 8, 4, 2];
      const frames = generateBubbleSortFrames(input);
      enrichFramesWithIds(frames);

      for (const frame of frames) {
        expect(frame.arrayStateWithIds).toBeDefined();
        expect(frame.arrayStateWithIds!.length).toBe(input.length);
        const ids = frame.arrayStateWithIds!.map(item => item.id);
        expect(new Set(ids).size).toBe(ids.length);
      }
    });

    it('id không bị trùng khi có phần tử trùng giá trị', () => {
      const input = [5, 3, 5, 3, 2];
      const frames = generateBubbleSortFrames(input);
      enrichFramesWithIds(frames);

      for (const frame of frames) {
        const ids = frame.arrayStateWithIds!.map(item => item.id);
        expect(new Set(ids).size).toBe(ids.length);
      }
    });
  });

  // ── US-AS-027 (P1): Fallback input lỗi ───────────────────────────────────
  describe('US-AS-027 (P1): Fallback input lỗi', () => {
    it('input chứa ký tự không phải số → dùng mảng fallback', () => {
      const store = useVcrStore();
      const sorting = useSortingAnimation();

      store.rawInputArray = 'abc, xyz, !!!';
      sorting.recompileForAlgo('bubble');

      expect(sorting.sortFrames.value.length).toBeGreaterThan(0);
      expect(sorting.sortFrames.value[0].arrayState).toEqual(FALLBACK_ARRAY);
    });

    it('input rỗng → dùng mảng fallback', () => {
      const store = useVcrStore();
      const sorting = useSortingAnimation();

      store.rawInputArray = '';
      sorting.recompileForAlgo('bubble');

      expect(sorting.sortFrames.value[0].arrayState).toEqual(FALLBACK_ARRAY);
    });

    it('input lẫn token hợp lệ và token lỗi → dùng mảng fallback', () => {
      const store = useVcrStore();
      const sorting = useSortingAnimation();

      store.rawInputArray = '5, 3, abc, 8';
      sorting.recompileForAlgo('bubble');

      expect(sorting.sortFrames.value[0].arrayState).toEqual(FALLBACK_ARRAY);
    });
  });

  // ── US-AS-040 (P1): Max 15 phần tử ───────────────────────────────────────
  describe('US-AS-040 (P1): Max 15 phần tử', () => {
    it('input 20 phần tử → sliced còn 15', () => {
      const store = useVcrStore();
      const sorting = useSortingAnimation();

      const bigInput = Array.from({ length: 20 }, (_, i) => (i + 1) * 7 % 100).join(', ');
      store.rawInputArray = bigInput;
      sorting.recompileForAlgo('bubble');

      const firstFrame = sorting.sortFrames.value[0];
      expect(firstFrame.arrayState.length).toBe(MAX_ELEMENTS);
    });

    it('input đúng 15 phần tử → giữ nguyên', () => {
      const store = useVcrStore();
      const sorting = useSortingAnimation();

      const exact = Array.from({ length: 15 }, (_, i) => i + 1).join(', ');
      store.rawInputArray = exact;
      sorting.recompileForAlgo('bubble');

      expect(sorting.sortFrames.value[0].arrayState.length).toBe(15);
    });

    it('input 10 phần tử → không bị cắt', () => {
      const store = useVcrStore();
      const sorting = useSortingAnimation();

      store.rawInputArray = '10, 20, 30, 40, 50, 60, 70, 80, 90, 100';
      sorting.recompileForAlgo('bubble');

      expect(sorting.sortFrames.value[0].arrayState.length).toBe(10);
    });
  });

  // ── US-AS-042 (P1): Store sorting state ───────────────────────────────────
  describe('US-AS-042 (P1): Store sorting state', () => {
    it('isPlaying, currentFrameIndex, totalFrames phản ánh trạng thái thực', () => {
      const store = useVcrStore();
      const sorting = useSortingAnimation();

      sorting.selectAlgorithm('bubble');

      // Ban đầu
      expect(store.isPlaying).toBe(false);
      expect(store.currentFrameIndex).toBe(0);
      expect(store.totalFrames).toBeGreaterThan(0);

      // Play
      store.play();
      expect(store.isPlaying).toBe(true);

      // Step next
      store.stepNext();
      expect(store.currentFrameIndex).toBe(1);

      // Pause
      store.pause();
      expect(store.isPlaying).toBe(false);

      // Reset
      store.stepNext();
      store.stepNext();
      store.reset();
      expect(store.currentFrameIndex).toBe(0);
      expect(store.isPlaying).toBe(false);
    });

    it('totalFrames khớp với số frame từ generator', () => {
      const store = useVcrStore();
      const sorting = useSortingAnimation();

      sorting.selectAlgorithm('bubble');
      expect(store.totalFrames).toBe(sorting.sortFrames.value.length);
    });
  });

  // ── US-AS-014 (P1): Label so sánh theo thuật toán ────────────────────────
  describe('US-AS-014 (P1): Label so sánh theo thuật toán', () => {
    it('counting sort label chứa pattern A[i]→Count[digit]', () => {
      const frames = generateCountingSortFrames([45, 12, 85]);

      // Tìm frame thuộc phase count có comparingIndices (bỏ frame init)
      const countFrames = frames.filter(f => f.countingStep === 'count' && f.comparingIndices !== null);
      expect(countFrames.length).toBeGreaterThan(0);

      // Label phải chứa cả "A[" và "Count["
      const firstCountFrame = countFrames[0];
      expect(firstCountFrame.description).toMatch(/A\[\d+\]/);
      expect(firstCountFrame.description).toMatch(/Count\[\d+\]/);

      // comparingIndices phải map [inputIdx, digitIdx]
      expect(firstCountFrame.comparingIndices).not.toBeNull();
      const [inputIdx, digitIdx] = firstCountFrame.comparingIndices!;
      expect(inputIdx).toBeGreaterThanOrEqual(0);
      expect(inputIdx).toBeLessThan(3);
      expect(digitIdx).toBeGreaterThanOrEqual(0);
      expect(digitIdx).toBeLessThan(10);
    });

    it('bubble sort label dùng pattern arr[i]', () => {
      const frames = generateBubbleSortFrames([5, 3, 8]);
      const compareFrame = frames.find(f => f.comparingIndices !== null);

      expect(compareFrame).toBeDefined();
      expect(compareFrame!.description).toMatch(/arr\[\d+\]/);
    });

    it('counting sort mỗi frame count có comparingIndices khớp input idx và digit', () => {
      // Dùng số 1 chữ số để chỉ có 1 pass (đơn vị) → đúng 2 frame count
      const frames = generateCountingSortFrames([5, 2]);
      const countFrames = frames.filter(f => f.countingStep === 'count' && f.comparingIndices !== null);
      expect(countFrames.length).toBe(2);

      // Frame 0: A[0] = 5, digit = 5 → comparingIndices = [0, 5]
      expect(countFrames[0].comparingIndices![0]).toBe(0);
      expect(countFrames[0].comparingIndices![1]).toBe(5);

      // Frame 1: A[1] = 2, digit = 2 → comparingIndices = [1, 2]
      expect(countFrames[1].comparingIndices![0]).toBe(1);
      expect(countFrames[1].comparingIndices![1]).toBe(2);
    });
  });

  // ── SV-002t (P1): CC-009 contract lineNumber/activeLogicalLineId/highlights ─
  describe('SV-002t (P1): CC-009 — mỗi engine emit lineNumber/activeLogicalLineId/highlights', () => {
    const contractGenerators: Array<[string, (input: number[]) => SortFrame[]]> = [
      ['bubble', generateBubbleSortFrames],
      ['quick', generateQuickSortFrames],
      ['merge', generateMergeSortFrames],
      ['heap', generateHeapSortFrames],
      ['radix', generateRadixSortFrames],
      ['counting', generateCountingSortFrames],
      ['bucket', generateBucketSortFrames],
    ];

    it.each(contractGenerators)('%s: mọi frame emit lineNumber hợp lệ (> 0)', (_name, gen) => {
      const frames = gen([5, 3, 8, 4, 2]);
      expect(frames.length).toBeGreaterThan(0);
      for (const f of frames) {
        expect(f.lineNumber, `frame ${f.stepIndex} thiếu lineNumber`).toBeTypeOf('number');
        expect(f.lineNumber!).toBeGreaterThan(0);
      }
    });

    it.each(contractGenerators)('%s: mọi frame có activeLogicalLineId + highlights chuẩn hóa', (_name, gen) => {
      const frames = gen([5, 3, 8, 4, 2]);
      for (const f of frames) {
        expect(f.activeLogicalLineId, `frame ${f.stepIndex} thiếu activeLogicalLineId`).toBeTypeOf('string');
        expect((f.activeLogicalLineId ?? '').length).toBeGreaterThan(0);
        expect(f.highlights, `frame ${f.stepIndex} thiếu highlights`).toBeDefined();
        expect(Array.isArray(f.highlights!.compare)).toBe(true);
        expect(Array.isArray(f.highlights!.swap)).toBe(true);
        expect(Array.isArray(f.highlights!.sorted)).toBe(true);
      }
    });

    it.each([
      ['bubble', generateBubbleSortFrames],
      ['quick', generateQuickSortFrames],
      ['merge', generateMergeSortFrames],
      ['heap', generateHeapSortFrames],
    ] as Array<[string, (input: number[]) => SortFrame[]]>)(
      '%s: highlights.compare khớp comparingIndices khi có phép so sánh',
      (_name, gen) => {
        const frames = gen([5, 3, 8, 4, 2]);
        const compareFrames = frames.filter(f => f.comparingIndices !== null);
        expect(compareFrames.length).toBeGreaterThan(0);
        for (const f of compareFrames) {
          for (const idx of f.comparingIndices!) {
            expect(f.highlights!.compare, `frame ${f.stepIndex} thiếu highlight compare ${idx}`).toContain(idx);
          }
        }
      },
    );

    it('sau stepNext, currentLineNumber > 0 (Coordinator/pseudocode không chết im lặng)', () => {
      const store = useVcrStore();
      const sorting = useSortingAnimation();

      sorting.selectAlgorithm('bubble');
      expect(store.currentLineNumber).toBeGreaterThan(0);

      store.stepNext();
      expect(store.currentLineNumber).toBeGreaterThan(0);
    });
  });
});
