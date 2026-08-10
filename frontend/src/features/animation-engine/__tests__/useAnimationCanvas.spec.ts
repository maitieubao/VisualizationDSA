// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { ref } from 'vue';
import { useAnimationCanvas } from '../composables/useAnimationCanvas';
import { useAnimationStore } from '../store/useAnimationStore';
import { generateDummyBubbleSortResult } from '../services/algorithmApi';
import type { AlgorithmResult } from '../types/animation.types';

function createTestResult(): AlgorithmResult {
  return generateDummyBubbleSortResult([5, 3, 8, 1, 9]);
}

function createMockCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  Object.defineProperty(canvas, 'getContext', {
    value: () => ({
      setTransform: vi.fn(),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      strokeText: vi.fn(),
      fillText: vi.fn(),
      set: vi.fn(),
    }),
  });
  Object.defineProperty(canvas, 'width', { value: 800, writable: true });
  Object.defineProperty(canvas, 'height', { value: 600, writable: true });
  Object.defineProperty(canvas, 'style', { value: {}, writable: true });
  return canvas;
}

function createMockContainer(): HTMLDivElement {
  const container = document.createElement('div');
  Object.defineProperty(container, 'getBoundingClientRect', {
    value: () => ({ left: 0, top: 0, width: 800, height: 600 }),
  });
  return container;
}

describe('useAnimationCanvas — composable', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      return setTimeout(() => cb(performance.now()), 16) as unknown as number;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));
    vi.stubGlobal('ResizeObserver', class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    });
    vi.stubGlobal('getComputedStyle', () => ({
      getPropertyValue: (prop: string) => {
        if (prop === '--canvas-bg') return '#080808';
        return '';
      },
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('returns currentFrame, totalSteps, progressPercent', () => {
    const canvasRef = ref<HTMLCanvasElement | null>(createMockCanvas());
    const containerRef = ref<HTMLDivElement | null>(createMockContainer());

    const { currentFrame, totalSteps, progressPercent } = useAnimationCanvas(canvasRef, containerRef);

    expect(currentFrame).toBeDefined();
    expect(totalSteps).toBeDefined();
    expect(progressPercent).toBeDefined();
    expect(currentFrame.value).toBeNull();
    expect(totalSteps.value).toBe(0);
    expect(progressPercent.value).toBe(0);
  });

  it('currentFrame updates when store loads data', () => {
    const canvasRef = ref<HTMLCanvasElement | null>(createMockCanvas());
    const containerRef = ref<HTMLDivElement | null>(createMockContainer());

    const { currentFrame, totalSteps } = useAnimationCanvas(canvasRef, containerRef);
    const store = useAnimationStore();
    store.loadResult(createTestResult());

    expect(currentFrame.value).not.toBeNull();
    expect(totalSteps.value).toBeGreaterThan(0);
  });

  it('progressPercent updates when currentIndex changes', () => {
    const canvasRef = ref<HTMLCanvasElement | null>(createMockCanvas());
    const containerRef = ref<HTMLDivElement | null>(createMockContainer());

    const { progressPercent } = useAnimationCanvas(canvasRef, containerRef);
    const store = useAnimationStore();
    store.loadResult(createTestResult());

    expect(progressPercent.value).toBe(0);

    store.scrubTo(2);
    expect(progressPercent.value).toBeGreaterThan(0);
  });

  it('handles null canvas gracefully', () => {
    const canvasRef = ref<HTMLCanvasElement | null>(null);
    const containerRef = ref<HTMLDivElement | null>(createMockContainer());

    expect(() => {
      useAnimationCanvas(canvasRef, containerRef);
    }).not.toThrow();
  });

  it('handles null container gracefully', () => {
    const canvasRef = ref<HTMLCanvasElement | null>(createMockCanvas());
    const containerRef = ref<HTMLDivElement | null>(null);

    expect(() => {
      useAnimationCanvas(canvasRef, containerRef);
    }).not.toThrow();
  });
});
