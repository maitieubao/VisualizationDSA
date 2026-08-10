import { describe, it, expect } from 'vitest';
import { clamp, lerp, easeOut, lerpArray } from '../math';

describe('utils/math — clamp', () => {
  it('returns value within range unchanged', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamps to min when value < min', () => {
    expect(clamp(-3, 0, 10)).toBe(0);
  });

  it('clamps to max when value > max', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('returns min when value equals min', () => {
    expect(clamp(0, 0, 10)).toBe(0);
  });

  it('returns max when value equals max', () => {
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it('handles negative ranges', () => {
    expect(clamp(-5, -10, -1)).toBe(-5);
    expect(clamp(-15, -10, -1)).toBe(-10);
    expect(clamp(0, -10, -1)).toBe(-1);
  });
});

describe('utils/math — lerp', () => {
  it('returns start when t = 0', () => {
    expect(lerp(0, 100, 0)).toBe(0);
  });

  it('returns end when t = 1', () => {
    expect(lerp(0, 100, 1)).toBe(100);
  });

  it('returns midpoint when t = 0.5', () => {
    expect(lerp(0, 100, 0.5)).toBe(50);
  });

  it('clamps t < 0 to start', () => {
    expect(lerp(10, 20, -0.5)).toBe(10);
  });

  it('clamps t > 1 to end', () => {
    expect(lerp(10, 20, 1.5)).toBe(20);
  });

  it('works with negative numbers', () => {
    expect(lerp(-100, 100, 0.5)).toBe(0);
  });

  it('works when start > end (reverse)', () => {
    expect(lerp(100, 0, 0.5)).toBe(50);
  });
});

describe('utils/math — easeOut', () => {
  it('returns 0 at t = 0', () => {
    expect(easeOut(0)).toBe(0);
  });

  it('returns 1 at t = 1', () => {
    expect(easeOut(1)).toBe(1);
  });

  it('returns value between 0 and 1 for t in (0,1)', () => {
    const result = easeOut(0.5);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(1);
  });

  it('is faster at start than linear (easeOut cubic)', () => {
    const easeMid = easeOut(0.5);
    expect(easeMid).toBeGreaterThan(0.5);
  });

  it('clamps t < 0 to 0', () => {
    expect(easeOut(-0.5)).toBe(0);
  });

  it('clamps t > 1 to 1', () => {
    expect(easeOut(1.5)).toBe(1);
  });
});

describe('utils/math — lerpArray', () => {
  it('interpolates two equal-length arrays', () => {
    const result = lerpArray([0, 0, 0], [10, 20, 30], 0.5);
    expect(result).toEqual([5, 10, 15]);
  });

  it('returns from array when t = 0', () => {
    const result = lerpArray([1, 2, 3], [4, 5, 6], 0);
    expect(result).toEqual([1, 2, 3]);
  });

  it('returns to array when t = 1', () => {
    const result = lerpArray([1, 2, 3], [4, 5, 6], 1);
    expect(result).toEqual([4, 5, 6]);
  });

  it('clamps t to [0, 1]', () => {
    const result = lerpArray([0, 0], [10, 10], 1.5);
    expect(result).toEqual([10, 10]);
  });

  it('handles different-length arrays (uses min length)', () => {
    const result = lerpArray([0, 0, 0], [10, 10], 0.5);
    expect(result).toEqual([5, 5]);
    expect(result.length).toBe(2);
  });

  it('does not mutate input arrays', () => {
    const from = [1, 2, 3];
    const to = [4, 5, 6];
    lerpArray(from, to, 0.5);
    expect(from).toEqual([1, 2, 3]);
    expect(to).toEqual([4, 5, 6]);
  });
});
