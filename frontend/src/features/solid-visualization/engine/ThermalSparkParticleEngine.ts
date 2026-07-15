// ============================================================
// ThermalSparkParticleEngine — Canvas 2D Fire Particle System
// Renders thermal sparks behind SRP-violating class cards at 60 FPS
// Max 80 particles per card to prevent CPU overload
// ============================================================

import type { FireParticle } from '../types/solid-visualization.types';
import { MAX_PARTICLES } from '../types/solid-visualization.types';

export class ThermalSparkParticleEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: FireParticle[] = [];
  private animationFrameId: number | null = null;
  private isRunning = false;

  constructor(canvas?: HTMLCanvasElement) {
    if (canvas) {
      this.attachCanvas(canvas);
    }
  }

  public attachCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  public getParticles(): ReadonlyArray<FireParticle> {
    return this.particles;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public start(): void {
    if (this.isRunning) return;
    if (!this.canvas || !this.ctx) return;
    this.isRunning = true;
    this.loop();
  }

  private loop = (): void => {
    if (!this.isRunning) return;

    this.updateParticles();
    this.drawParticles();

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private updateParticles(): void {
    if (!this.canvas) return;

    if (this.particles.length < MAX_PARTICLES) {
      this.particles.push(this.createParticle());
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      p.y += p.vy;
      p.x += p.vx + Math.sin(p.life * 0.05) * 0.5;
      p.life--;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private createParticle(): FireParticle {
    const canvasWidth = this.canvas?.width ?? 280;
    const canvasHeight = this.canvas?.height ?? 200;

    return {
      x: Math.random() * canvasWidth,
      y: canvasHeight - 5,
      vx: (Math.random() - 0.5) * 1.2,
      vy: -(Math.random() * 2.0 + 1.0),
      maxLife: Math.random() * 40 + 20,
      life: Math.floor(Math.random() * 40 + 20),
      size: Math.random() * 3 + 1,
      hue: Math.random() * 30,
    };
  }

  private drawParticles(): void {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalCompositeOperation = 'lighter';

    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      this.ctx.fillStyle = `hsla(${p.hue}, 100%, 50%, ${alpha})`;
      this.ctx.fill();
    }
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.particles = [];
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  public destroy(): void {
    this.stop();
    this.canvas = null;
    this.ctx = null;
  }
}
