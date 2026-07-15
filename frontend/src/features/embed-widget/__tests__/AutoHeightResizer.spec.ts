// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AutoHeightResizer } from '../engine/AutoHeightResizer';
import type { EmbedCommunicationBridge } from '../engine/EmbedCommunicationBridge';

function createMockBridge(): EmbedCommunicationBridge {
  return {
    sendMessage: vi.fn(),
    onMessage: vi.fn(() => () => {}),
    destroy: vi.fn(),
    listenerCount: 0,
  } as unknown as EmbedCommunicationBridge;
}

// Mock ResizeObserver for jsdom
class MockResizeObserver {
  callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

describe('AutoHeightResizer', () => {
  let resizer: AutoHeightResizer;
  let mockBridge: EmbedCommunicationBridge;
  let mockContainer: HTMLElement;

  beforeEach(() => {
    mockBridge = createMockBridge();
    mockContainer = document.createElement('div');
  });

  afterEach(() => {
    resizer?.destroy();
  });

  describe('clampHeight', () => {
    it('should return value within default bounds', () => {
      resizer = new AutoHeightResizer(mockBridge, mockContainer);
      expect(resizer.clampHeight(500)).toBe(500);
    });

    it('should clamp to minimum height (300px default)', () => {
      resizer = new AutoHeightResizer(mockBridge, mockContainer);
      expect(resizer.clampHeight(100)).toBe(300);
    });

    it('should clamp to maximum height (1200px default)', () => {
      resizer = new AutoHeightResizer(mockBridge, mockContainer);
      expect(resizer.clampHeight(2000)).toBe(1200);
    });

    it('should accept exact boundary values', () => {
      resizer = new AutoHeightResizer(mockBridge, mockContainer);
      expect(resizer.clampHeight(300)).toBe(300);
      expect(resizer.clampHeight(1200)).toBe(1200);
    });

    it('should respect custom min/max bounds', () => {
      resizer = new AutoHeightResizer(mockBridge, mockContainer, 400, 800);
      expect(resizer.clampHeight(350)).toBe(400);
      expect(resizer.clampHeight(900)).toBe(800);
      expect(resizer.clampHeight(600)).toBe(600);
    });
  });

  describe('initial state', () => {
    it('should start with lastReportedHeight of 0', () => {
      resizer = new AutoHeightResizer(mockBridge, mockContainer);
      expect(resizer.getLastReportedHeight()).toBe(0);
    });
  });

  describe('destroy', () => {
    it('should reset lastReportedHeight on destroy', () => {
      resizer = new AutoHeightResizer(mockBridge, mockContainer);
      resizer.destroy();
      expect(resizer.getLastReportedHeight()).toBe(0);
    });

    it('should handle double destroy gracefully', () => {
      resizer = new AutoHeightResizer(mockBridge, mockContainer);
      resizer.start();
      resizer.destroy();
      expect(() => resizer.destroy()).not.toThrow();
    });
  });

  describe('start', () => {
    it('should not throw when starting observation', () => {
      resizer = new AutoHeightResizer(mockBridge, mockContainer);
      expect(() => resizer.start()).not.toThrow();
    });

    it('should be idempotent when called multiple times', () => {
      resizer = new AutoHeightResizer(mockBridge, mockContainer);
      resizer.start();
      expect(() => resizer.start()).not.toThrow();
    });
  });
});
