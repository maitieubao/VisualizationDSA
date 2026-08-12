// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AutoHeightResizer } from '../engine/AutoHeightResizer';
import { EMBED_RESIZE_DEBOUNCE_MS } from '../types/embed-widget.types';
import type { EmbedCommunicationBridge } from '../engine/EmbedCommunicationBridge';

function createMockBridge(): EmbedCommunicationBridge {
  return {
    sendMessage: vi.fn(),
    onMessage: vi.fn(() => () => {}),
    destroy: vi.fn(),
    listenerCount: 0,
  } as unknown as EmbedCommunicationBridge;
}

class MockResizeObserver {
  static instances: MockResizeObserver[] = [];
  callback: ResizeObserverCallback;
  observed: Element[] = [];

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    MockResizeObserver.instances.push(this);
  }

  observe(target: Element): void {
    this.observed.push(target);
  }

  unobserve(): void {}
  disconnect(): void {}

  fire(height: number): void {
    this.callback(
      [{ contentRect: { height } } as ResizeObserverEntry],
      this as unknown as ResizeObserver,
    );
  }
}

globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

describe('AutoHeightResizer', () => {
  let resizer: AutoHeightResizer;
  let mockBridge: EmbedCommunicationBridge;
  let mockContainer: HTMLElement;

  beforeEach(() => {
    MockResizeObserver.instances = [];
    mockBridge = createMockBridge();
    mockContainer = document.createElement('div');
    vi.useFakeTimers();
  });

  afterEach(() => {
    resizer?.destroy();
    vi.useRealTimers();
    vi.clearAllMocks();
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

    it('EW-023: should keep last reported height for non-finite input', () => {
      resizer = new AutoHeightResizer(mockBridge, mockContainer);
      expect(resizer.clampHeight(NaN)).toBe(0);
      expect(resizer.clampHeight(Infinity)).toBe(0);
    });
  });

  describe('initial state', () => {
    it('should start with lastReportedHeight of 0 and no pending height', () => {
      resizer = new AutoHeightResizer(mockBridge, mockContainer);
      expect(resizer.getLastReportedHeight()).toBe(0);
      expect(resizer.getPendingHeight()).toBeNull();
    });
  });

  describe('EW-008t (P1): RO pipeline — debounce → clamp → HEIGHT_CHANGED', () => {
    it('should send HEIGHT_CHANGED with clamped height after debounce when RO fires', () => {
      resizer = new AutoHeightResizer(mockBridge, mockContainer);
      resizer.start();

      const observer = MockResizeObserver.instances[0];
      expect(observer).toBeDefined();
      observer.fire(700);

      expect(mockBridge.sendMessage).not.toHaveBeenCalled();

      vi.advanceTimersByTime(EMBED_RESIZE_DEBOUNCE_MS);

      expect(mockBridge.sendMessage).toHaveBeenCalledTimes(1);
      expect(mockBridge.sendMessage).toHaveBeenCalledWith(
        window.parent,
        {
          source: 'VISUALIZATION_DSA_WIDGET',
          action: 'HEIGHT_CHANGED',
          payload: { height: 700 },
        },
        undefined,
      );
      expect(resizer.getLastReportedHeight()).toBe(700);
    });

    it('should clamp oversized height to max (1200) before sending', () => {
      resizer = new AutoHeightResizer(mockBridge, mockContainer);
      resizer.start();

      MockResizeObserver.instances[0].fire(2000);
      vi.advanceTimersByTime(EMBED_RESIZE_DEBOUNCE_MS);

      expect(mockBridge.sendMessage).toHaveBeenCalledWith(
        window.parent,
        expect.objectContaining({
          action: 'HEIGHT_CHANGED',
          payload: { height: 1200 },
        }),
        undefined,
      );
    });

    it('should clamp undersized height to min (300) before sending', () => {
      resizer = new AutoHeightResizer(mockBridge, mockContainer);
      resizer.start();

      MockResizeObserver.instances[0].fire(100);
      vi.advanceTimersByTime(EMBED_RESIZE_DEBOUNCE_MS);

      expect(mockBridge.sendMessage).toHaveBeenCalledWith(
        window.parent,
        expect.objectContaining({ payload: { height: 300 } }),
        undefined,
      );
    });

    it('should NOT spam — repeated same height sends only once', () => {
      resizer = new AutoHeightResizer(mockBridge, mockContainer);
      resizer.start();

      const observer = MockResizeObserver.instances[0];
      observer.fire(500);
      vi.advanceTimersByTime(EMBED_RESIZE_DEBOUNCE_MS);
      expect(mockBridge.sendMessage).toHaveBeenCalledTimes(1);

      observer.fire(500);
      vi.advanceTimersByTime(EMBED_RESIZE_DEBOUNCE_MS);

      expect(mockBridge.sendMessage).toHaveBeenCalledTimes(1);
    });

    it('should NOT send stale value — rapid 500→600→500 sends only final 500, never 600', () => {
      resizer = new AutoHeightResizer(mockBridge, mockContainer);
      resizer.start();

      const observer = MockResizeObserver.instances[0];
      observer.fire(500);
      observer.fire(600);
      observer.fire(500);
      vi.advanceTimersByTime(EMBED_RESIZE_DEBOUNCE_MS);

      expect(mockBridge.sendMessage).toHaveBeenCalledTimes(1);
      expect(mockBridge.sendMessage).toHaveBeenCalledWith(
        window.parent,
        expect.objectContaining({ payload: { height: 500 } }),
        undefined,
      );
      const sentPayloads = (mockBridge.sendMessage as ReturnType<typeof vi.fn>).mock.calls.map(
        (call) => (call[1] as { payload: { height: number } }).payload.height,
      );
      expect(sentPayloads).not.toContain(600);
    });

    it('should pass hostOrigin as targetOrigin when configured (EW-001)', () => {
      resizer = new AutoHeightResizer(mockBridge, mockContainer, 300, 1200, 100, 'https://moodle.hust.edu.vn');
      resizer.start();

      MockResizeObserver.instances[0].fire(600);
      vi.advanceTimersByTime(100);

      expect(mockBridge.sendMessage).toHaveBeenCalledWith(
        window.parent,
        expect.objectContaining({ action: 'HEIGHT_CHANGED' }),
        'https://moodle.hust.edu.vn',
      );
    });

    it('should debounce bursts — multiple distinct heights send only the latest', () => {
      resizer = new AutoHeightResizer(mockBridge, mockContainer);
      resizer.start();

      const observer = MockResizeObserver.instances[0];
      observer.fire(400);
      observer.fire(410);
      observer.fire(420);
      vi.advanceTimersByTime(EMBED_RESIZE_DEBOUNCE_MS);

      expect(mockBridge.sendMessage).toHaveBeenCalledTimes(1);
      expect(mockBridge.sendMessage).toHaveBeenCalledWith(
        window.parent,
        expect.objectContaining({ payload: { height: 420 } }),
        undefined,
      );
    });

    it('should observe the container element', () => {
      resizer = new AutoHeightResizer(mockBridge, mockContainer);
      resizer.start();

      const observer = MockResizeObserver.instances[0];
      expect(observer.observed).toContain(mockContainer);
    });
  });

  describe('destroy', () => {
    it('should reset lastReportedHeight and pendingHeight on destroy', () => {
      resizer = new AutoHeightResizer(mockBridge, mockContainer);
      resizer.start();
      MockResizeObserver.instances[0].fire(500);
      resizer.destroy();

      expect(resizer.getLastReportedHeight()).toBe(0);
      expect(resizer.getPendingHeight()).toBeNull();
    });

    it('should cancel pending debounce timer on destroy', () => {
      resizer = new AutoHeightResizer(mockBridge, mockContainer);
      resizer.start();
      MockResizeObserver.instances[0].fire(500);
      resizer.destroy();
      vi.advanceTimersByTime(EMBED_RESIZE_DEBOUNCE_MS);

      expect(mockBridge.sendMessage).not.toHaveBeenCalled();
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
      expect(MockResizeObserver.instances).toHaveLength(1);
    });
  });
});
