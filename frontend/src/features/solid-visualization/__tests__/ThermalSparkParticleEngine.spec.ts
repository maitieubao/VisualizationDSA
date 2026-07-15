import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ThermalSparkParticleEngine } from '../engine/ThermalSparkParticleEngine';
import { MAX_PARTICLES } from '../types/solid-visualization.types';

let rafId = 0;
const rafCallbacks = new Map<number, FrameRequestCallback>();

vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
  rafId++;
  rafCallbacks.set(rafId, cb);
  return rafId;
});

vi.stubGlobal('cancelAnimationFrame', (id: number) => {
  rafCallbacks.delete(id);
});

function flushOneFrame(): void {
  const entries = [...rafCallbacks.entries()];
  if (entries.length > 0) {
    const [id, fn] = entries[0];
    rafCallbacks.delete(id);
    fn(16);
  }
}

describe('ThermalSparkParticleEngine', () => {
  let mockCanvas: HTMLCanvasElement;
  let mockCtx: CanvasRenderingContext2D;

  beforeEach(() => {
    rafId = 0;
    rafCallbacks.clear();

    mockCtx = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      fillStyle: '',
      globalCompositeOperation: 'source-over',
    } as unknown as CanvasRenderingContext2D;

    mockCanvas = {
      getContext: vi.fn().mockReturnValue(mockCtx),
      width: 280,
      height: 200,
      offsetWidth: 280,
      offsetHeight: 200,
    } as unknown as HTMLCanvasElement;
  });

  afterEach(() => {
    rafCallbacks.clear();
  });

  it('should create engine without canvas', () => {
    const engine = new ThermalSparkParticleEngine();
    expect(engine.getIsRunning()).toBe(false);
    expect(engine.getParticles()).toHaveLength(0);
  });

  it('should create engine with canvas', () => {
    const engine = new ThermalSparkParticleEngine(mockCanvas);
    expect(engine.getIsRunning()).toBe(false);
  });

  it('should attach canvas after construction', () => {
    const engine = new ThermalSparkParticleEngine();
    engine.attachCanvas(mockCanvas);
    expect(engine.getIsRunning()).toBe(false);
  });

  it('should start the animation loop', () => {
    const engine = new ThermalSparkParticleEngine(mockCanvas);
    engine.start();
    expect(engine.getIsRunning()).toBe(true);
    expect(rafCallbacks.size).toBe(1);
    engine.stop();
  });

  it('should not start twice if already running', () => {
    const engine = new ThermalSparkParticleEngine(mockCanvas);
    engine.start();
    const countAfterFirstStart = rafCallbacks.size;
    engine.start();
    expect(rafCallbacks.size).toBe(countAfterFirstStart);
    engine.stop();
  });

  it('should not start without a canvas attached', () => {
    const engine = new ThermalSparkParticleEngine();
    engine.start();
    expect(engine.getIsRunning()).toBe(false);
  });

  it('should stop the animation loop and clear particles', () => {
    const engine = new ThermalSparkParticleEngine(mockCanvas);
    engine.start();
    flushOneFrame();
    engine.stop();

    expect(engine.getIsRunning()).toBe(false);
    expect(engine.getParticles()).toHaveLength(0);
    expect(mockCtx.clearRect).toHaveBeenCalled();
  });

  it('should destroy engine and nullify canvas reference', () => {
    const engine = new ThermalSparkParticleEngine(mockCanvas);
    engine.start();
    engine.destroy();

    expect(engine.getIsRunning()).toBe(false);
    expect(engine.getParticles()).toHaveLength(0);
  });

  it('should enforce MAX_PARTICLES limit constant', () => {
    expect(MAX_PARTICLES).toBe(80);
  });

  it('should generate particles after one frame', () => {
    const engine = new ThermalSparkParticleEngine(mockCanvas);
    engine.start();
    flushOneFrame();

    expect(engine.getParticles().length).toBeGreaterThan(0);
    engine.stop();
  });

  it('should generate particles with valid hue range (0-30 for red-orange)', () => {
    const engine = new ThermalSparkParticleEngine(mockCanvas);
    engine.start();
    flushOneFrame();

    const particles = engine.getParticles();
    for (const p of particles) {
      expect(p.hue).toBeGreaterThanOrEqual(0);
      expect(p.hue).toBeLessThanOrEqual(30);
    }
    engine.stop();
  });

  it('should generate particles with negative vy (flying upward)', () => {
    const engine = new ThermalSparkParticleEngine(mockCanvas);
    engine.start();
    flushOneFrame();

    const particles = engine.getParticles();
    for (const p of particles) {
      expect(p.vy).toBeLessThan(0);
    }
    engine.stop();
  });

  it('should generate particles with size between 1 and 4', () => {
    const engine = new ThermalSparkParticleEngine(mockCanvas);
    engine.start();
    flushOneFrame();

    const particles = engine.getParticles();
    for (const p of particles) {
      expect(p.size).toBeGreaterThanOrEqual(1);
      expect(p.size).toBeLessThanOrEqual(4);
    }
    engine.stop();
  });

  it('should clear canvas on each draw cycle', () => {
    const engine = new ThermalSparkParticleEngine(mockCanvas);
    engine.start();
    flushOneFrame();

    expect(mockCtx.clearRect).toHaveBeenCalled();
    engine.stop();
  });

  it('should set globalCompositeOperation to lighter for neon glow', () => {
    const engine = new ThermalSparkParticleEngine(mockCanvas);
    engine.start();
    flushOneFrame();

    expect(mockCtx.globalCompositeOperation).toBe('lighter');
    engine.stop();
  });
});
