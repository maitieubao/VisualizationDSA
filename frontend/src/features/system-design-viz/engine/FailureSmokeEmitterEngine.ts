import type { SmokeParticle } from '../types/system-design-viz.types';
import { SMOKE_BURST_COUNT, SMOKE_CONTINUOUS_PROBABILITY } from '../types/system-design-viz.types';

/**
 * Canvas 2D particle engine for server failure smoke effects.
 * Emits gray smoke particles radiating outward from center with fade-out.
 */
export class FailureSmokeEmitterEngine {
  private particles: SmokeParticle[] = [];
  private animationFrameId: number | null = null;
  private isEmitting = false;
  private canvasWidth: number;
  private canvasHeight: number;
  private drawCallback: ((particles: ReadonlyArray<SmokeParticle>) => void) | null = null;

  constructor(width: number, height: number) {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  public setDrawCallback(cb: (particles: ReadonlyArray<SmokeParticle>) => void): void {
    this.drawCallback = cb;
  }

  public startEmission(): void {
    if (this.isEmitting) return;
    this.isEmitting = true;
    this.loop();
  }

  public stopEmission(): void {
    this.isEmitting = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public triggerBurst(count: number = SMOKE_BURST_COUNT): void {
    const centerX = this.canvasWidth / 2;
    const centerY = this.canvasHeight / 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 1.5 + 0.5;

      this.particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.4,
        size: Math.random() * 8 + 4,
        alpha: 0.9,
        life: 0,
        maxLife: Math.random() * 40 + 30,
      });
    }
  }

  public getParticles(): ReadonlyArray<SmokeParticle> {
    return this.particles;
  }

  public getParticleCount(): number {
    return this.particles.length;
  }

  public isActive(): boolean {
    return this.isEmitting;
  }

  private loop = (): void => {
    if (!this.isEmitting) return;

    this.updateParticles();

    if (this.drawCallback) {
      this.drawCallback(this.particles);
    }

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private updateParticles(): void {
    const centerX = this.canvasWidth / 2;
    const centerY = this.canvasHeight / 2;

    if (Math.random() < SMOKE_CONTINUOUS_PROBABILITY) {
      this.particles.push({
        x: centerX + (Math.random() * 20 - 10),
        y: centerY + 10,
        vx: Math.random() * 0.4 - 0.2,
        vy: -Math.random() * 0.6 - 0.3,
        size: Math.random() * 6 + 3,
        alpha: 0.8,
        life: 0,
        maxLife: Math.random() * 50 + 40,
      });
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      p.size += 0.08;
      p.alpha = 1 - p.life / p.maxLife;

      if (p.life >= p.maxLife || p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  public destroy(): void {
    this.isEmitting = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.particles = [];
    this.drawCallback = null;
  }
}
