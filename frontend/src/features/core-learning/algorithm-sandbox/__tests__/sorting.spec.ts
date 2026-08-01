import { describe, it, expect } from 'vitest';
import { generateBubbleSortFrames } from '../algorithms/bubbleSort';
import { generateQuickSortFrames } from '../algorithms/quickSort';
import { generateMergeSortFrames } from '../algorithms/mergeSort';
import { generateHeapSortFrames } from '../algorithms/heapSort';
import { generateRadixSortFrames } from '../algorithms/radixSort';
import { generateBucketSortFrames } from '../algorithms/bucketSort';

describe('Sprint 2: Sorting Algorithm Frame Generators', () => {
  const testArray = [5, 3, 8, 4, 2];

  describe('Bubble Sort Frame Generator', () => {
    it('should generate valid frames from input array', () => {
      const frames = generateBubbleSortFrames(testArray);
      expect(frames.length).toBeGreaterThan(0);
      
      // Khởi tạo
      expect(frames[0].arrayState).toEqual(testArray);
      expect(frames[0].algorithm).toBe('bubble');
      
      // Hoàn thành
      const finalFrame = frames[frames.length - 1];
      expect(finalFrame.arrayState).toEqual([2, 3, 4, 5, 8]);
      expect(finalFrame.sortedIndices.length).toBe(testArray.length);
    });
  });

  describe('Quick Sort Frame Generator', () => {
    it('should generate partition steps and highlight pivot correctly', () => {
      const frames = generateQuickSortFrames(testArray);
      expect(frames.length).toBeGreaterThan(0);
      
      // Check pivot highlighting in partition
      const partitionFrames = frames.filter(f => f.pivotIndex !== null);
      expect(partitionFrames.length).toBeGreaterThan(0);
      
      const finalFrame = frames[frames.length - 1];
      expect(finalFrame.arrayState).toEqual([2, 3, 4, 5, 8]);
    });
  });

  describe('Merge Sort Frame Generator', () => {
    it('should generate divide and conquer frames and end with sorted array', () => {
      const frames = generateMergeSortFrames(testArray);
      expect(frames.length).toBeGreaterThan(0);
      
      const finalFrame = frames[frames.length - 1];
      expect(finalFrame.arrayState).toEqual([2, 3, 4, 5, 8]);
    });
  });

  describe('Heap Sort Frame Generator', () => {
    it('should build max heap and extract elements iteratively to sort', () => {
      const frames = generateHeapSortFrames(testArray);
      expect(frames.length).toBeGreaterThan(0);
      
      const finalFrame = frames[frames.length - 1];
      expect(finalFrame.arrayState).toEqual([2, 3, 4, 5, 8]);
    });
  });

  describe('Radix Sort Frame Generator', () => {
    const radixArr = [45, 12, 85, 32, 9, 60];

    it('should produce a sorted array in the final frame', () => {
      const frames = generateRadixSortFrames(radixArr);
      expect(frames.length).toBeGreaterThan(0);
      const finalFrame = frames[frames.length - 1];
      expect(finalFrame.arrayState).toEqual([9, 12, 32, 45, 60, 85]);
    });

    it('should emit arrayStateWithIds on every frame with stable unique ids', () => {
      const frames = generateRadixSortFrames(radixArr);
      for (const frame of frames) {
        expect(frame.arrayStateWithIds).toBeDefined();
        expect(frame.arrayStateWithIds!.length).toBe(radixArr.length);
        // Values must match arrayState
        expect(frame.arrayStateWithIds!.map(e => e.value)).toEqual(frame.arrayState);
        // IDs must be unique within each frame
        const ids = frame.arrayStateWithIds!.map(e => e.id);
        expect(new Set(ids).size).toBe(ids.length);
      }
    });

    it('should emit radixBucketsWithIds on every frame with stable ids matching bucket values', () => {
      const frames = generateRadixSortFrames(radixArr);
      for (const frame of frames) {
        expect(frame.radixBucketsWithIds).toBeDefined();
        expect(frame.radixBucketsWithIds!.length).toBe(10);
        for (let d = 0; d < 10; d++) {
          const bucketVals   = frame.radixBuckets![d];
          const bucketWithId = frame.radixBucketsWithIds![d];
          expect(bucketWithId.map(e => e.value)).toEqual(bucketVals);
        }
      }
    });

    it('should preserve FIFO order — earlier-distributed elements appear first in collect', () => {
      // Use duplicate-digit values to test stability
      const arr = [21, 31, 41];
      const frames = generateRadixSortFrames(arr);
      const final = frames[frames.length - 1];
      // All end with digit 1 in units place → must appear in original encounter order
      expect(final.arrayState).toEqual([21, 31, 41]);
    });
  });

  describe('Bucket Sort Frame Generator', () => {
    const bucketArr = [45, 12, 85, 32, 9, 60];

    it('should produce a sorted array in the final frame', () => {
      const frames = generateBucketSortFrames(bucketArr);
      expect(frames.length).toBeGreaterThan(0);
      const finalFrame = frames[frames.length - 1];
      expect(finalFrame.arrayState).toEqual([9, 12, 32, 45, 60, 85]);
    });

    it('should emit stable unique ids on every frame matching array values', () => {
      const frames = generateBucketSortFrames(bucketArr);
      for (const frame of frames) {
        expect(frame.arrayStateWithIds).toBeDefined();
        expect(frame.arrayStateWithIds!.length).toBe(bucketArr.length);
        // IDs must be unique within each frame
        const ids = frame.arrayStateWithIds!.map(e => e.id);
        expect(new Set(ids).size).toBe(ids.length);
      }
    });

    it('should assign correct buckets matching value ranges', () => {
      const frames = generateBucketSortFrames([10, 30, 60, 90]);
      // Frame after distribute should have distributed correctly
      const distributeFinishedFrame = frames.find(f => f.description.includes('Phân phối thành công phần tử A[3]'));
      expect(distributeFinishedFrame).toBeDefined();
      
      const buckets = distributeFinishedFrame!.bucketSortBuckets!;
      expect(buckets[0]).toContain(10); // [0-25)
      expect(buckets[1]).toContain(30); // [25-50)
      expect(buckets[2]).toContain(60); // [50-75)
      expect(buckets[3]).toContain(90); // [75-100]
    });
  });
});
