import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { FailureSmokeEmitterEngine } from '../engine/FailureSmokeEmitterEngine';

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
    const [id, cb] = entries[0];
    rafCallbacks.delete(id);
    cb(performance.now());
  }
}

describe('FailureSmokeEmitterEngine', () => {
  let emitter: FailureSmokeEmitterEngine;

  beforeEach(() => {
    rafCallbacks.clear();
    rafId = 0;
    emitter = new FailureSmokeEmitterEngine(200, 200);
  });

  afterEach(() => {
    emitter.destroy();
  });

  describe('Initialization', () => {
    it('should start with zero particles', () => {
      expect(emitter.getParticleCount()).toBe(0);
      expect(emitter.isActive()).toBe(false);
    });
  });

  describe('Burst Emission', () => {
    it('should generate default 20 particles on triggerBurst()', () => {
      emitter.triggerBurst();
      expect(emitter.getParticleCount()).toBe(20);
    });

    it('should generate custom count of particles', () => {
      emitter.triggerBurst(5);
      expect(emitter.getParticleCount()).toBe(5);
    });

    it('should create particles at canvas center', () => {
      emitter.triggerBurst(1);
      const particles = emitter.getParticles();
      expect(particles[0].x).toBe(100);
      expect(particles[0].y).toBe(100);
    });

    it('should create particles with valid initial properties', () => {
      emitter.triggerBurst(1);
      const p = emitter.getParticles()[0];
      expect(p.alpha).toBe(0.9);
      expect(p.life).toBe(0);
      expect(p.size).toBeGreaterThanOrEqual(4);
      expect(p.size).toBeLessThanOrEqual(12);
      expect(p.maxLife).toBeGreaterThanOrEqual(30);
      expect(p.maxLife).toBeLessThanOrEqual(70);
    });

    it('should accumulate particles on multiple bursts', () => {
      emitter.triggerBurst(10);
      emitter.triggerBurst(5);
      expect(emitter.getParticleCount()).toBe(15);
    });
  });

  describe('Emission Lifecycle', () => {
    it('should start emission loop', () => {
      emitter.startEmission();
      expect(emitter.isActive()).toBe(true);
    });

    it('should not double-start emission', () => {
      emitter.startEmission();
      emitter.startEmission();
      expect(emitter.isActive()).toBe(true);
    });

    it('should stop emission loop', () => {
      emitter.startEmission();
      emitter.stopEmission();
      expect(emitter.isActive()).toBe(false);
    });
  });

  describe('Draw Callback', () => {
    it('should invoke draw callback when set', () => {
      const cb = vi.fn();
      emitter.setDrawCallback(cb);
      emitter.triggerBurst(5);
      emitter.startEmission();

      flushOneFrame();
      expect(cb).toHaveBeenCalled();
    });
  });

  describe('Destroy / GC', () => {
    it('should clear all particles on destroy', () => {
      emitter.triggerBurst(20);
      emitter.startEmission();
      emitter.destroy();

      expect(emitter.getParticleCount()).toBe(0);
      expect(emitter.isActive()).toBe(false);
    });
  });
});
