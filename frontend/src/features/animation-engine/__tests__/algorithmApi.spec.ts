import { describe, it, expect } from 'vitest';
import { generateDummyBubbleSortResult } from '../services/algorithmApi';

describe('generateDummyBubbleSortResult', () => {
  it('returns correct algorithmId and pseudoCode', () => {
    const result = generateDummyBubbleSortResult([5, 3, 8]);
    expect(result.algorithmId).toBe('bubble-sort');
    expect(result.pseudoCode).toHaveLength(4);
  });

  it('first frame is initialization with unsorted array', () => {
    const input = [5, 3, 8];
    const result = generateDummyBubbleSortResult(input);
    const first = result.frames[0];

    expect(first.stepId).toBe(1);
    expect(first.dataState).toEqual([5, 3, 8]);
    expect(first.highlights!.compare).toEqual([]);
    expect(first.highlights!.swap).toEqual([]);
    expect(first.highlights!.sorted).toEqual([]);
  });

  it('last frame is sorted with all indices marked sorted', () => {
    const input = [5, 3, 8];
    const result = generateDummyBubbleSortResult(input);
    const last = result.frames[result.frames.length - 1];

    expect(last.dataState).toEqual([3, 5, 8]);
    expect(last.highlights!.sorted.length).toBe(input.length);
  });

  it('generates frames with sequential stepIds', () => {
    const result = generateDummyBubbleSortResult([9, 1, 4, 2]);
    for (let i = 0; i < result.frames.length; i++) {
      expect(result.frames[i].stepId).toBe(i + 1);
    }
  });

  it('handles single element array', () => {
    const result = generateDummyBubbleSortResult([42]);
    expect(result.frames.length).toBeGreaterThanOrEqual(1);
    const last = result.frames[result.frames.length - 1];
    expect(last.dataState).toEqual([42]);
  });

  it('handles already sorted array', () => {
    const result = generateDummyBubbleSortResult([1, 2, 3]);
    const last = result.frames[result.frames.length - 1];
    expect(last.dataState).toEqual([1, 2, 3]);
    expect(last.highlights!.sorted.length).toBe(3);
  });

  it('compare frames have correct highlight indices', () => {
    const result = generateDummyBubbleSortResult([5, 3, 8]);
    const compareFrames = result.frames.filter(f => f.highlights!.compare.length > 0);
    expect(compareFrames.length).toBeGreaterThan(0);

    for (const frame of compareFrames) {
      expect(frame.highlights!.compare).toHaveLength(2);
      expect(frame.highlights!.compare[1] - frame.highlights!.compare[0]).toBe(1);
    }
  });
});
