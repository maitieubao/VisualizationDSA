// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSliderTooltip, truncateText } from '../composables/useSliderTooltip';
import { useAnimationStore } from '../store/useAnimationStore';
import { generateDummyBubbleSortResult } from '../services/algorithmApi';
import type { AlgorithmResult } from '../types/animation.types';

function createTestResult(): AlgorithmResult {
  return generateDummyBubbleSortResult([5, 3, 8, 1, 9]);
}

describe('useSliderTooltip — truncateText', () => {
  it('returns original text when shorter than maxLength', () => {
    expect(truncateText('Hello', 20)).toBe('Hello');
  });

  it('returns original text when equal to maxLength', () => {
    expect(truncateText('Hello', 5)).toBe('Hello');
  });

  it('truncates and adds "..." when longer than maxLength', () => {
    expect(truncateText('This is a long text', 10)).toBe('This is a ...');
  });

  it('handles empty string', () => {
    expect(truncateText('', 10)).toBe('');
  });

  it('handles maxLength of 0', () => {
    expect(truncateText('Hello', 0)).toBe('...');
  });
});

describe('useSliderTooltip — useSliderTooltip composable', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('tooltip starts hidden', () => {
    const { tooltip } = useSliderTooltip();
    expect(tooltip.value.visible).toBe(false);
    expect(tooltip.value.x).toBe(0);
    expect(tooltip.value.step).toBe(0);
    expect(tooltip.value.text).toBe('');
  });

  it('handleSliderHover hides tooltip when container is null', () => {
    const { tooltip, handleSliderHover } = useSliderTooltip();
    handleSliderHover(new MouseEvent('mousemove'), null);
    expect(tooltip.value.visible).toBe(false);
  });

  it('handleSliderHover hides tooltip when frames <= 1', () => {
    const { tooltip, handleSliderHover } = useSliderTooltip();
    const store = useAnimationStore();
    store.loadResult(createTestResult());
    store.frames = store.frames.slice(0, 1);

    const container = document.createElement('div');
    Object.defineProperty(container, 'getBoundingClientRect', {
      value: () => ({ left: 0, width: 200, top: 0, height: 50 }),
    });

    handleSliderHover(new MouseEvent('mousemove'), container);
    expect(tooltip.value.visible).toBe(false);
  });

  it('handleSliderHover shows tooltip at left edge', () => {
    const { tooltip, handleSliderHover } = useSliderTooltip();
    const store = useAnimationStore();
    store.loadResult(createTestResult());

    const container = document.createElement('div');
    Object.defineProperty(container, 'getBoundingClientRect', {
      value: () => ({ left: 0, width: 200, top: 0, height: 50 }),
    });

    const event = new MouseEvent('mousemove', { clientX: 0, clientY: 0 });
    Object.defineProperty(event, 'clientX', { value: 0 });
    handleSliderHover(event, container);

    expect(tooltip.value.visible).toBe(true);
    expect(tooltip.value.step).toBe(1);
  });

  it('handleSliderHover shows tooltip at right edge', () => {
    const { tooltip, handleSliderHover } = useSliderTooltip();
    const store = useAnimationStore();
    store.loadResult(createTestResult());

    const container = document.createElement('div');
    Object.defineProperty(container, 'getBoundingClientRect', {
      value: () => ({ left: 0, width: 200, top: 0, height: 50 }),
    });

    const event = new MouseEvent('mousemove', { clientX: 200, clientY: 0 });
    Object.defineProperty(event, 'clientX', { value: 200 });
    handleSliderHover(event, container);

    expect(tooltip.value.visible).toBe(true);
    expect(tooltip.value.step).toBe(store.frames.length);
  });

  it('hideTooltip hides tooltip', () => {
    const { tooltip, handleSliderHover, hideTooltip } = useSliderTooltip();
    const store = useAnimationStore();
    store.loadResult(createTestResult());

    const container = document.createElement('div');
    Object.defineProperty(container, 'getBoundingClientRect', {
      value: () => ({ left: 0, width: 200, top: 0, height: 50 }),
    });

    const event = new MouseEvent('mousemove', { clientX: 100, clientY: 0 });
    Object.defineProperty(event, 'clientX', { value: 100 });
    handleSliderHover(event, container);
    expect(tooltip.value.visible).toBe(true);

    hideTooltip();
    expect(tooltip.value.visible).toBe(false);
  });
});
