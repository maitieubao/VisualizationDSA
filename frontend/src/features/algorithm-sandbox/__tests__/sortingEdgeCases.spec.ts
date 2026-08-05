import { describe, it, expect } from 'vitest';
import { generateCountingSortFrames } from '../algorithms/countingSort';
import { generateRadixSortFrames } from '../algorithms/radixSort';
import { generateQuickSortFrames } from '../algorithms/quickSort';
import { generateMergeSortFrames } from '../algorithms/mergeSort';
import { generateHeapSortFrames } from '../algorithms/heapSort';
import { generateBubbleSortFrames } from '../algorithms/bubbleSort';
import { generateBucketSortFrames } from '../algorithms/bucketSort';
import { enrichFramesWithIds } from '../helpers/sortingIdEnricher';
import type { SortFrame } from '../types/sorting.types';

function makeFrame(arrayState: number[], swapped: [number, number] | null): SortFrame {
  return {
    stepIndex: 0,
    arrayState,
    comparingIndices: null,
    pivotIndex: null,
    swappedIndices: swapped,
    sortedIndices: [],
    description: 'test',
    algorithm: 'bubble',
  };
}

describe('Counting Sort — sắp xếp đúng chuẩn', () => {
  it('sắp xếp đúng mảng đa chữ số', () => {
    const frames = generateCountingSortFrames([45, 12, 85, 32, 9, 60]);
    expect(frames[frames.length - 1].arrayState).toEqual([9, 12, 32, 45, 60, 85]);
  });

  it('hỗ trợ số âm thông qua offset', () => {
    const frames = generateCountingSortFrames([-5, 8, -9, 3]);
    expect(frames[frames.length - 1].arrayState).toEqual([-9, -5, 3, 8]);
  });

  it('ổn định với phần tử trùng lặp (giữ nguyên thứ tự xuất hiện)', () => {
    const frames = generateCountingSortFrames([3, 1, 2, 1]);
    const final = frames[frames.length - 1];
    expect(final.arrayState).toEqual([1, 1, 2, 3]);
    expect(final.arrayStateWithIds!.map((e) => e.id)).toEqual([1, 3, 2, 0]);
  });

  it('giữ metadata ID của input sau mỗi pass LSD', () => {
    const frames = generateCountingSortFrames([13, 1, 22, 11]);
    const tensPass = frames.find((frame) => frame.countingStep === 'count' && frame.activeDigitPlace === 10);
    expect(tensPass?.inputArrayWithIds?.map((item) => item.id)).toEqual([1, 3, 2, 0]);
    expect(new Set(tensPass?.inputArrayWithIds?.map((item) => item.id)).size).toBe(4);
  });

  it('mảng rỗng không crash', () => {
    const frames = generateCountingSortFrames([]);
    expect(frames[frames.length - 1].arrayState).toEqual([]);
  });

  it('stepIndex bắt đầu từ 0 và tăng liên tục', () => {
    const frames = generateCountingSortFrames([5, 3, 8]);
    expect(frames[0].stepIndex).toBe(0);
    frames.forEach((f, idx) => expect(f.stepIndex).toBe(idx));
  });

  it('chỉ số cột (bar index) không bao giờ vượt giới hạn mảng', () => {
    const frames = generateCountingSortFrames([5]);
    for (const f of frames) {
      if (!f.comparingIndices) continue;
      if (f.countingStep === 'accumulate') continue; // so sánh giữa 2 ô Count [0..9], không phải bar
      const [barIdx] = f.comparingIndices;
      expect(barIdx).toBeGreaterThanOrEqual(0);
      expect(barIdx).toBeLessThan(f.arrayState.length);
    }
  });

  it('arrayState tiến hóa dần trong pha output (không đứng im)', () => {
    const input = [4, 2, 5, 1];
    const frames = generateCountingSortFrames(input);
    const outputFrames = frames.filter((f) => f.countingStep === 'output');
    expect(
      outputFrames.some((f) => f.arrayState.some((v, i) => v !== input[i]))
    ).toBe(true);
  });

  it('frame cuối đánh dấu sortedIndices đủ toàn bộ', () => {
    const frames = generateCountingSortFrames([5, 3, 8]);
    expect(frames[frames.length - 1].sortedIndices).toEqual([0, 1, 2]);
  });

  it('mỗi pass giữ countArray đúng 10 ô chữ số', () => {
    const frames = generateCountingSortFrames([45, 12, 85, 32, 9, 60]);
    for (const f of frames) {
      if (f.countArray) expect(f.countArray.length).toBe(10);
    }
  });
});

describe('Radix Sort — hỗ trợ số âm & edge case', () => {
  it('mảng lẫn số âm sắp xếp đúng, không crash', () => {
    const frames = generateRadixSortFrames([-3, 5, 2, -1, 0]);
    expect(frames[frames.length - 1].arrayState).toEqual([-3, -1, 0, 2, 5]);
  });

  it('mảng toàn số âm không crash và sắp xếp đúng', () => {
    const frames = generateRadixSortFrames([-5, -3, -9, -1]);
    expect(frames[frames.length - 1].arrayState).toEqual([-9, -5, -3, -1]);
  });

  it('frame cuối đánh dấu sortedIndices đủ toàn bộ', () => {
    const frames = generateRadixSortFrames([45, 12, 85, 32, 9, 60]);
    expect(frames[frames.length - 1].sortedIndices).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('mảng rỗng không crash', () => {
    const frames = generateRadixSortFrames([]);
    expect(frames[frames.length - 1].arrayState).toEqual([]);
  });
});

describe('Quick Sort — stats chính xác & đệ quy an toàn', () => {
  it('đếm đủ swaps bao gồm cả bước đặt pivot', () => {
    const frames = generateQuickSortFrames([5, 3, 8, 4, 2]);
    const final = frames[frames.length - 1];
    expect(final.variables!.swaps).toBe(4);
  });

  it('số swaps khớp với số frame hoán vị (swappedIndices != null)', () => {
    const frames = generateQuickSortFrames([5, 3, 8, 4, 2]);
    const swapFrames = frames.filter((f) => f.swappedIndices !== null).length;
    expect(frames[frames.length - 1].variables!.swaps).toBe(swapFrames);
  });

  it('mảng đã sắp xếp lớn vẫn sắp xếp đúng (không tràn stack)', () => {
    const big = Array.from({ length: 100 }, (_, i) => i);
    const frames = generateQuickSortFrames(big);
    expect(frames[frames.length - 1].arrayState).toEqual(big);
  });
});

describe('Merge Sort — sortedIndices đúng ngữ nghĩa & stats', () => {
  it('không đánh dấu sorted trước khi segment thực sự yên vị', () => {
    const frames = generateMergeSortFrames([5, 4, 3, 2, 1, 0]);
    const beforeFinal = frames[frames.length - 2];
    expect(beforeFinal.sortedIndices).toEqual([]);
  });

  it('đếm số phép so sánh khớp với số frame so sánh', () => {
    const frames = generateMergeSortFrames([5, 3, 8, 4, 2]);
    const cmpFrames = frames.filter((f) => f.comparingIndices !== null).length;
    expect(frames[frames.length - 1].variables!.comparisons).toBe(cmpFrames);
  });
});

describe('Heap Sort — stats & edge case', () => {
  it('đếm comparisons khớp với số frame so sánh', () => {
    const frames = generateHeapSortFrames([5, 3, 8, 4, 2]);
    const cmpFrames = frames.filter((f) => f.comparingIndices !== null).length;
    expect(frames[frames.length - 1].variables!.comparisons).toBe(cmpFrames);
  });

  it('mảng rỗng không crash, không gán sortedIndices [0] sai', () => {
    const frames = generateHeapSortFrames([]);
    const final = frames[frames.length - 1];
    expect(final.arrayState).toEqual([]);
    expect(final.sortedIndices).toEqual([]);
    expect(final.description).not.toContain('undefined');
  });

  it('mảng 1 phần tử sắp xếp đúng', () => {
    const frames = generateHeapSortFrames([7]);
    const final = frames[frames.length - 1];
    expect(final.arrayState).toEqual([7]);
    expect(final.sortedIndices).toEqual([0]);
  });
});

describe('Bubble Sort — edge case', () => {
  it('mảng rỗng: sortedIndices rỗng, không crash', () => {
    const frames = generateBubbleSortFrames([]);
    const final = frames[frames.length - 1];
    expect(final.arrayState).toEqual([]);
    expect(final.sortedIndices).toEqual([]);
  });
});

describe('Bucket Sort — stats & arrayState tiến hóa', () => {
  it('đếm comparisons/swaps khớp với số frame tương ứng', () => {
    const frames = generateBucketSortFrames([45, 12, 85, 32, 9, 60]);
    const final = frames[frames.length - 1];
    const cmpFrames = frames.filter((f) => f.description.startsWith('So sánh')).length;
    const swapFrames = frames.filter((f) => f.description.startsWith('Hoán đổi')).length;
    expect(final.variables!.comparisons).toBe(cmpFrames);
    expect(final.variables!.swaps).toBe(swapFrames);
  });

  it('arrayState tiến hóa dần trong pha collect (không đứng im)', () => {
    const input = [45, 12, 85, 32, 9, 60];
    const frames = generateBucketSortFrames(input);
    const collectFrames = frames.filter((f) => f.bucketStep === 'collect');
    expect(
      collectFrames.some((f) => f.arrayState.some((v, i) => v !== input[i]))
    ).toBe(true);
  });

  it('dải Bucket được tính động theo giá trị thực tế (số âm & > 100)', () => {
    const frames = generateBucketSortFrames([-20, 5, 1000, 300]);
    expect(frames[0].description).toContain('[-20-1000]');

    const distributeDone = frames.find((f) => f.description.includes('Phân phối thành công phần tử A[3]'));
    expect(distributeDone).toBeDefined();
    const buckets = distributeDone!.bucketSortBuckets!;
    const nonEmpty = buckets.filter((b) => b.length > 0).length;
    expect(nonEmpty).toBeGreaterThanOrEqual(3);

    const final = frames[frames.length - 1];
    expect(final.arrayState).toEqual([-20, 5, 300, 1000]);
  });

  it('giữ input identity và range label động trong mọi phase', () => {
    const input = [45, -20, 1000, 300];
    const frames = generateBucketSortFrames(input);
    const collectFrame = frames.find((frame) => frame.bucketStep === 'collect');
    expect(collectFrame?.inputArrayWithIds?.map((item) => item.id)).toEqual([0, 1, 2, 3]);
    expect(collectFrame?.bucketRangeLabels).toHaveLength(4);
    expect(collectFrame?.bucketRangeLabels?.[0]).toContain('-20');
    expect(new Set(collectFrame?.inputArrayWithIds?.map((item) => item.id)).size).toBe(input.length);
  });
});

describe('sortingIdEnricher — identity ổn định với phần tử trùng giá trị', () => {
  it('swap [0]↔[2] qua phần tử trùng giữ nguyên identity đúng', () => {
    const frames: SortFrame[] = [
      makeFrame([10, 5, 5], null),
      makeFrame([5, 5, 10], [0, 2]),
    ];
    enrichFramesWithIds(frames);
    expect(frames[1].arrayStateWithIds!.map((e) => e.id)).toEqual([2, 1, 0]);
  });

  it('frame ghi đè kiểu merge vẫn dùng greedy matching fallback', () => {
    const frames: SortFrame[] = [
      makeFrame([2, 1, 0], null),
      makeFrame([1, 2, 0], [0, 0]),
    ];
    enrichFramesWithIds(frames);
    expect(frames[1].arrayStateWithIds!.map((e) => e.value)).toEqual([1, 2, 0]);
    expect(frames[1].arrayStateWithIds!.map((e) => e.id)).toEqual([1, 0, 2]);
  });

  it('no-op khi frame đầu đã có arrayStateWithIds (radix/counting/bucket)', () => {
    const frames: SortFrame[] = [
      { ...makeFrame([3, 1, 2], null), arrayStateWithIds: [{ id: 7, value: 3 }, { id: 8, value: 1 }, { id: 9, value: 2 }] },
      makeFrame([1, 3, 2], [0, 1]),
    ];
    enrichFramesWithIds(frames);
    expect(frames[1].arrayStateWithIds).toBeUndefined();
  });
});

describe('Merge Sort — identity theo phần tử qua frame ghi đè', () => {
  it('không đúc id ảo (≥10000) với phần tử trùng giá trị', () => {
    const frames = generateMergeSortFrames([2, 1, 1]);
    enrichFramesWithIds(frames);
    for (const f of frames) {
      const ids = f.arrayStateWithIds!.map((e) => e.id);
      expect(ids.every((id) => id >= 0 && id < 10000)).toBe(true);
    }
  });

  it('frame ghi đè giữ đúng id của phần tử nguồn (kết quả ổn định)', () => {
    const frames = generateMergeSortFrames([2, 1, 1]);
    const final = frames[frames.length - 1];
    expect(final.arrayState).toEqual([1, 1, 2]);
    expect(final.arrayStateWithIds!.map((e) => e.id)).toEqual([1, 2, 0]);
    expect(new Set(final.arrayStateWithIds!.map((e) => e.id)).size).toBe(3);
  });

  it('mọi frame đều có arrayStateWithIds (không phụ thuộc greedy fallback)', () => {
    const frames = generateMergeSortFrames([3, 1, 2, 1]);
    expect(frames.every((f) => f.arrayStateWithIds && f.arrayStateWithIds.length === 4)).toBe(true);
  });
});
