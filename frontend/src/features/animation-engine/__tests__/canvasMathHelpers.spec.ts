import { describe, it, expect } from 'vitest';
import {
  calculateColumnWidth,
  calculateColumnHeight,
  calculateX,
  MARGIN,
  MARGIN_BOTTOM,
  PADDING_TOP,
  GAP,
  COLOR_DEFAULT,
  COLOR_COMPARE,
  COLOR_SWAP,
  COLOR_SORTED,
  COLOR_TEXT,
} from '../composables/canvasMathHelpers';
import { lerp, easeOut, clamp } from '../composables/canvasMathHelpers';

describe('canvasMathHelpers — constants', () => {
  it('MARGIN is 40', () => expect(MARGIN).toBe(40));
  it('MARGIN_BOTTOM is 40', () => expect(MARGIN_BOTTOM).toBe(40));
  it('PADDING_TOP is 50', () => expect(PADDING_TOP).toBe(50));
  it('GAP is 8', () => expect(GAP).toBe(8));
  it('COLOR_DEFAULT is sky-400', () => expect(COLOR_DEFAULT).toBe('#38BDF8'));
  it('COLOR_COMPARE is amber-400', () => expect(COLOR_COMPARE).toBe('#FBBF24'));
  it('COLOR_SWAP is red-500', () => expect(COLOR_SWAP).toBe('#EF4444'));
  it('COLOR_SORTED is emerald-500', () => expect(COLOR_SORTED).toBe('#10B981'));
  it('COLOR_TEXT is white', () => expect(COLOR_TEXT).toBe('#FFFFFF'));
});

describe('canvasMathHelpers — re-exports from utils/math', () => {
  it('lerp is re-exported', () => {
    expect(lerp).toBeTypeOf('function');
    expect(lerp(0, 100, 0.5)).toBe(50);
  });

  it('easeOut is re-exported', () => {
    expect(easeOut).toBeTypeOf('function');
    expect(easeOut(0)).toBe(0);
    expect(easeOut(1)).toBe(1);
  });

  it('clamp is re-exported', () => {
    expect(clamp).toBeTypeOf('function');
    expect(clamp(5, 0, 10)).toBe(5);
  });
});

describe('canvasMathHelpers — calculateColumnWidth', () => {
  it('returns 0 when n <= 0', () => {
    expect(calculateColumnWidth(0, 800)).toBe(0);
    expect(calculateColumnWidth(-1, 800)).toBe(0);
  });

  it('calculates width for single column', () => {
    const w = calculateColumnWidth(1, 800);
    expect(w).toBe(800 - MARGIN * 2);
  });

  it('calculates width for multiple columns', () => {
    const w = calculateColumnWidth(5, 800);
    const expected = (800 - GAP * 4 - MARGIN * 2) / 5;
    expect(w).toBe(expected);
  });

  it('columns fit within canvas width', () => {
    const n = 10;
    const canvasW = 600;
    const colW = calculateColumnWidth(n, canvasW);
    const totalWidth = colW * n + GAP * (n - 1) + MARGIN * 2;
    expect(totalWidth).toBe(canvasW);
  });
});

describe('canvasMathHelpers — calculateColumnHeight', () => {
  it('returns 0 when maxValue <= 0', () => {
    expect(calculateColumnHeight(50, 0, 500)).toBe(0);
    expect(calculateColumnHeight(50, -1, 500)).toBe(0);
  });

  it('returns full height when value == maxValue', () => {
    const h = calculateColumnHeight(100, 100, 500);
    const expected = 500 - PADDING_TOP - MARGIN_BOTTOM;
    expect(h).toBe(expected);
  });

  it('returns half height when value == maxValue/2', () => {
    const h = calculateColumnHeight(50, 100, 500);
    const full = 500 - PADDING_TOP - MARGIN_BOTTOM;
    expect(h).toBe(full / 2);
  });

  it('returns 0 when value is 0', () => {
    expect(calculateColumnHeight(0, 100, 500)).toBe(0);
  });
});

describe('canvasMathHelpers — calculateX', () => {
  it('first column starts at MARGIN', () => {
    expect(calculateX(0, 80)).toBe(MARGIN);
  });

  it('second column starts at MARGIN + columnWidth + GAP', () => {
    const colW = 80;
    expect(calculateX(1, colW)).toBe(MARGIN + colW + GAP);
  });

  it('nth column position is correct', () => {
    const colW = 60;
    const index = 3;
    const expected = MARGIN + index * (colW + GAP);
    expect(calculateX(index, colW)).toBe(expected);
  });
});
