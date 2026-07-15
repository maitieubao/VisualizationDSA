import { CONFETTI_COLORS, CONFETTI_PARTICLE_COUNT } from '../types/gamification.types';
import type { ConfettiParticle } from '../types/gamification.types';

export class CanvasConfettiEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: ConfettiParticle[] = [];
  private animationFrameId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Cannot initialize Canvas 2D context.');
    this.ctx = context;
    this.resizeCanvas();
  }

  public resizeCanvas(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  public burst(count: number = CONFETTI_PARTICLE_COUNT): void {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: centerX,
        y: centerY,
        size: Math.random() * 8 + 4,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        speedX: (Math.random() - 0.5) * 15,
        speedY: (Math.random() - 0.8) * 18,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
      });
    }

    if (!this.animationFrameId) {
      this.animationFrameId = requestAnimationFrame(this.tick);
    }
  }

  public tick = (): void => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.speedX;
      p.y += p.speedY;
      p.speedY += 0.25;
      p.speedX *= 0.98;
      p.rotation += p.rotationSpeed;

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      this.ctx.restore();

      if (p.y > this.canvas.height) {
        this.particles.splice(i, 1);
      }
    }

    if (this.particles.length > 0) {
      this.animationFrameId = requestAnimationFrame(this.tick);
    } else {
      this.animationFrameId = null;
    }
  };

  public destroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.particles = [];
  }

  public getParticleCount = (): number => this.particles.length;
  public getParticleColors = (): string[] => this.particles.map(p => p.color);
  public getParticlePositions = (): { x: number; y: number }[] => this.particles.map(p => ({ x: p.x, y: p.y }));
  public isActive = (): boolean => this.particles.length > 0;
}
