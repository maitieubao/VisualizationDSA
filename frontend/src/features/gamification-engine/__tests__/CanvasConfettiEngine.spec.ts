// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CanvasConfettiEngine } from '../engine/CanvasConfettiEngine';

function createMockCanvas(): HTMLCanvasElement {
  const ctx = {
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    fillRect: vi.fn(),
    fillStyle: '',
  };
  const canvas = {
    getContext: vi.fn().mockReturnValue(ctx),
    width: 1920,
    height: 1080,
  } as unknown as HTMLCanvasElement;
  return canvas;
}

describe('CanvasConfettiEngine', () => {
  let mockCanvas: HTMLCanvasElement;
  let engine: CanvasConfettiEngine;

  beforeEach(() => {
    mockCanvas = createMockCanvas();
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((_cb) => {
      return 1;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    engine = new CanvasConfettiEngine(mockCanvas);
  });

  afterEach(() => {
    engine.destroy();
    vi.restoreAllMocks();
  });

  it('should construct with valid canvas element', () => {
    expect(engine).toBeDefined();
  });

  it('should throw error when canvas 2D context unavailable', () => {
    const badCanvas = {
      getContext: vi.fn().mockReturnValue(null),
      width: 100,
      height: 100,
    } as unknown as HTMLCanvasElement;
    expect(() => new CanvasConfettiEngine(badCanvas)).toThrow();
  });

  it('should create 150 particles by default on burst', () => {
    engine.burst();
    expect(engine.getParticleCount()).toBe(150);
  });

  it('should create custom count of particles on burst', () => {
    engine.burst(50);
    expect(engine.getParticleCount()).toBe(50);
  });

  it('should start animation frame after burst', () => {
    engine.burst();
    expect(window.requestAnimationFrame).toHaveBeenCalled();
  });

  it('should accumulate particles on multiple bursts', () => {
    engine.burst(50);
    engine.burst(30);
    expect(engine.getParticleCount()).toBe(80);
  });

  it('should clear all particles on destroy', () => {
    engine.burst(100);
    engine.destroy();
    expect(engine.getParticleCount()).toBe(0);
  });

  it('should cancel animation frame on destroy', () => {
    engine.burst();
    engine.destroy();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });

  it('should not crash when destroying without active animation', () => {
    expect(() => engine.destroy()).not.toThrow();
  });

  it('should resize canvas to window dimensions', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 1080, writable: true });
    engine.resizeCanvas();
    expect(mockCanvas.width).toBe(1920);
    expect(mockCanvas.height).toBe(1080);
  });

  it('should use Neon colors for particles', () => {
    engine.burst(1);
    const colors = engine.getParticleColors();
    const validColors = ['#FF007F', '#06B6D4', '#10B981', '#F59E0B', '#8B5CF6'];
    colors.forEach(color => {
      expect(validColors).toContain(color);
    });
  });

  it('should position particles at canvas center on burst', () => {
    mockCanvas.width = 1000;
    mockCanvas.height = 800;
    engine.burst(1);
    const positions = engine.getParticlePositions();
    expect(positions[0].x).toBe(500);
    expect(positions[0].y).toBe(400);
  });

  it('should handle tick by calling clearRect on context', () => {
    const ctx = mockCanvas.getContext('2d')!;
    engine.burst(5);
    engine.tick();
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, mockCanvas.width, mockCanvas.height);
  });

  it('should apply gravity to particles in tick (position changes)', () => {
    engine.burst(1);
    const initialPositions = engine.getParticlePositions();
    const initialX = initialPositions[0].x;
    const initialY = initialPositions[0].y;
    engine.tick();
    const updatedPositions = engine.getParticlePositions();
    const moved = updatedPositions[0].x !== initialX || updatedPositions[0].y !== initialY;
    expect(moved).toBe(true);
  });

  it('should remove particles that fall below canvas height', () => {
    engine.burst(1);
    // Simulate many ticks to let particle fall off screen
    for (let i = 0; i < 500; i++) {
      engine.tick();
    }
    expect(engine.getParticleCount()).toBe(0);
  });

  it('should report active status correctly', () => {
    expect(engine.isActive()).toBe(false);
    engine.burst();
    expect(engine.isActive()).toBe(true);
  });

  it('should not start duplicate animation when already running', () => {
    engine.burst(10);
    const callCount = (window.requestAnimationFrame as ReturnType<typeof vi.fn>).mock.calls.length;
    engine.burst(10);
    expect((window.requestAnimationFrame as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callCount);
  });
});
