import type { SmokeParticle, ServerNode } from '../types/system-sandbox.types';

export class SmokeManager {
  public smokeParticles: Map<string, SmokeParticle> = new Map();
  private particleCounter = 0;

  public createSmoke(server: ServerNode | undefined, intensity: number = 50): void {
    if (!server) return;

    for (let i = 0; i < intensity; i++) {
      this.particleCounter++;
      const particle: SmokeParticle = {
        id: `smoke-${this.particleCounter}`,
        x: server.position.x + (Math.random() - 0.5) * 40,
        y: server.position.y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 3 - 1, // Rise upward
        size: Math.random() * 10 + 5,
        opacity: Math.random() * 0.5 + 0.3,
        life: 1,
        color: `rgba(${100 + Math.random() * 50}, ${100 + Math.random() * 50}, ${100 + Math.random() * 50}`,
      };
      this.smokeParticles.set(particle.id, particle);
    }
  }

  public updateSmoke(deltaTime: number): void {
    for (const particle of this.smokeParticles.values()) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= deltaTime * 0.001;
      particle.opacity *= 0.995;
      particle.size *= 1.005;

      if (particle.life <= 0 || particle.opacity < 0.01) {
        this.smokeParticles.delete(particle.id);
      }
    }
  }

  public getSmokeParticles(): SmokeParticle[] {
    return Array.from(this.smokeParticles.values());
  }

  public clear(): void {
    this.smokeParticles.clear();
    this.particleCounter = 0;
  }
}
