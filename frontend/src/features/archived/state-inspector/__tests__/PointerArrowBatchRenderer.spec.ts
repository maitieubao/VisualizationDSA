import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PointerArrowBatchRenderer } from '../engine/PointerArrowBatchRenderer';
import { BEZIER_CONTROL_FACTOR, BEZIER_MIN_DX } from '../types/state-inspector.types';

describe('PointerArrowBatchRenderer — Dynamic Bezier SVG Pointer Arrows', () => {
  let renderer: PointerArrowBatchRenderer;
  let rafCallback: FrameRequestCallback | null = null;

  beforeEach(() => {
    rafCallback = null;

    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCallback = cb;
      return 42;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal('window', {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    renderer = new PointerArrowBatchRenderer();
  });

  afterEach(() => {
    renderer.destroy();
    vi.restoreAllMocks();
  });

  // ---- Link Registration ----

  it('should start with no links and not running', () => {
    expect(renderer.getLinks()).toEqual([]);
    expect(renderer.getIsRunning()).toBe(false);
  });

  it('should register a link', () => {
    renderer.registerLink('src-1', 'tgt-1');
    expect(renderer.getLinks().length).toBe(1);
    expect(renderer.getLinks()[0]).toEqual({ sourceId: 'src-1', targetId: 'tgt-1' });
  });

  it('should not register duplicate link', () => {
    renderer.registerLink('src-1', 'tgt-1');
    renderer.registerLink('src-1', 'tgt-1');
    expect(renderer.getLinks().length).toBe(1);
  });

  it('should register multiple distinct links', () => {
    renderer.registerLink('src-1', 'tgt-1');
    renderer.registerLink('src-2', 'tgt-2');
    expect(renderer.getLinks().length).toBe(2);
  });

  it('should remove link by sourceId', () => {
    renderer.registerLink('src-1', 'tgt-1');
    renderer.registerLink('src-2', 'tgt-2');
    renderer.removeLink('src-1');
    expect(renderer.getLinks().length).toBe(1);
    expect(renderer.getLinks()[0].sourceId).toBe('src-2');
  });

  it('should handle removing non-existent link', () => {
    renderer.registerLink('src-1', 'tgt-1');
    renderer.removeLink('src-999');
    expect(renderer.getLinks().length).toBe(1);
  });

  it('should clear all links', () => {
    renderer.registerLink('src-1', 'tgt-1');
    renderer.registerLink('src-2', 'tgt-2');
    renderer.clearLinks();
    expect(renderer.getLinks()).toEqual([]);
  });

  it('should return shallow copy from getLinks', () => {
    renderer.registerLink('src-1', 'tgt-1');
    const links1 = renderer.getLinks();
    const links2 = renderer.getLinks();
    expect(links1).not.toBe(links2);
    expect(links1).toEqual(links2);
  });

  // ---- Start / Stop ----

  it('should start render loop', () => {
    renderer.start();
    expect(renderer.getIsRunning()).toBe(true);
  });

  it('should not double-start', () => {
    renderer.start();
    renderer.start();
    expect(renderer.getIsRunning()).toBe(true);
  });

  it('should stop render loop', () => {
    renderer.start();
    renderer.stop();
    expect(renderer.getIsRunning()).toBe(false);
  });

  it('should call cancelAnimationFrame on stop', () => {
    renderer.start();
    renderer.stop();
    expect(cancelAnimationFrame).toHaveBeenCalled();
  });

  it('should handle stop when not running', () => {
    renderer.stop();
    expect(renderer.getIsRunning()).toBe(false);
  });

  // ---- Destroy ----

  it('should destroy: stop + clear links', () => {
    renderer.registerLink('src-1', 'tgt-1');
    renderer.start();
    renderer.destroy();
    expect(renderer.getIsRunning()).toBe(false);
    expect(renderer.getLinks()).toEqual([]);
  });

  // ---- Static Bezier Calculation ----

  it('should calculate Bezier path with standard rects', () => {
    const sourceRect = { right: 100, top: 50, height: 30 };
    const targetRect = { left: 400, top: 80, height: 30 };

    const result = PointerArrowBatchRenderer.calculateBezierPath(
      sourceRect,
      targetRect,
      0,
      0
    );

    expect(result.p0x).toBe(100);
    expect(result.p0y).toBe(65); // 50 + 30/2
    expect(result.p3x).toBe(400);
    expect(result.p3y).toBe(95); // 80 + 30/2

    const dx = Math.abs(400 - 100); // 300
    expect(result.p1x).toBe(100 + dx * BEZIER_CONTROL_FACTOR);
    expect(result.p2x).toBe(400 - dx * BEZIER_CONTROL_FACTOR);
  });

  it('should use BEZIER_MIN_DX when source and target are close', () => {
    const sourceRect = { right: 100, top: 50, height: 20 };
    const targetRect = { left: 110, top: 50, height: 20 };

    const result = PointerArrowBatchRenderer.calculateBezierPath(
      sourceRect,
      targetRect,
      0,
      0
    );

    // |110 - 100| = 10 < BEZIER_MIN_DX(40), so dx = 40
    expect(result.p1x).toBe(100 + BEZIER_MIN_DX * BEZIER_CONTROL_FACTOR);
    expect(result.p2x).toBe(110 - BEZIER_MIN_DX * BEZIER_CONTROL_FACTOR);
  });

  it('should include scroll offsets in calculation', () => {
    const sourceRect = { right: 100, top: 50, height: 20 };
    const targetRect = { left: 400, top: 80, height: 20 };

    const result = PointerArrowBatchRenderer.calculateBezierPath(
      sourceRect,
      targetRect,
      50,
      100
    );

    expect(result.p0x).toBe(150); // 100 + 50
    expect(result.p0y).toBe(160); // 50 + 10 + 100
    expect(result.p3x).toBe(450); // 400 + 50
    expect(result.p3y).toBe(190); // 80 + 10 + 100
  });

  it('should generate valid SVG path string', () => {
    const sourceRect = { right: 100, top: 50, height: 20 };
    const targetRect = { left: 300, top: 50, height: 20 };

    const result = PointerArrowBatchRenderer.calculateBezierPath(
      sourceRect,
      targetRect,
      0,
      0
    );

    expect(result.pathD).toMatch(/^M \d+ \d+ C \d+ \d+, \d+ \d+, \d+ \d+$/);
    expect(result.pathD).toContain('M 100 60');
    expect(result.pathD).toContain('300 60');
  });

  it('should handle negative scroll values', () => {
    const sourceRect = { right: 200, top: 100, height: 40 };
    const targetRect = { left: 500, top: 100, height: 40 };

    const result = PointerArrowBatchRenderer.calculateBezierPath(
      sourceRect,
      targetRect,
      -10,
      -20
    );

    expect(result.p0x).toBe(190);
    expect(result.p0y).toBe(100);
  });

  it('should handle zero-height rects', () => {
    const sourceRect = { right: 100, top: 50, height: 0 };
    const targetRect = { left: 300, top: 50, height: 0 };

    const result = PointerArrowBatchRenderer.calculateBezierPath(
      sourceRect,
      targetRect,
      0,
      0
    );

    expect(result.p0y).toBe(50);
    expect(result.p3y).toBe(50);
  });
});
