# ⚙️ Infrastructure & Canvas Overload Particles Engine (Phase 2)

Tài liệu này đặc tả chi tiết giải pháp hạ tầng đồng bộ liên kết tọa độ kéo thả (Dynamic Connection Paths) và hệ thống hạt bụi khói sập nguồn **FailureSmokeEmitterEngine** chạy ở Canvas 2D 60 FPS.

---

## 1. Hệ thống Canvas Hạt Khói Nghi ngút (FailureSmokeEmitterEngine)

Khi học sinh bấm tắt nguồn sập server, hệ thống khởi chạy một bộ máy phát hạt khói Canvas 2D cục bộ xung quanh card đó để mang lại hiệu ứng thị giác "sụp đổ vật lý" tuyệt đẹp:

```typescript
export interface SmokeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number; // Tuổi thọ hạt
  maxLife: number;
}

export class FailureSmokeEmitterEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: SmokeParticle[] = [];
  private animationFrameId: number | null = null;
  private isEmitting = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  public startEmission(): void {
    if (this.isEmitting) return;
    this.isEmitting = true;
    this.loop();
  }

  public triggerBurst(count = 20): void {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 1.5 + 0.5;
      
      this.particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.4, // Phun nhẹ lên trên
        size: Math.random() * 8 + 4,
        alpha: 0.9,
        life: 0,
        maxLife: Math.random() * 40 + 30
      });
    }
  }

  private loop = (): void => {
    if (!this.isEmitting) return;

    this.updateParticles();
    this.draw();
    
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private updateParticles(): void {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    // Liên tục sinh ra một ít khói bốc lên nhẹ nhàng nếu máy chủ vẫn sập
    if (Math.random() < 0.25) {
      this.particles.push({
        x: centerX + (Math.random() * 20 - 10),
        y: centerY + 10,
        vx: Math.random() * 0.4 - 0.2,
        vy: -Math.random() * 0.6 - 0.3,
        size: Math.random() * 6 + 3,
        alpha: 0.8,
        life: 0,
        maxLife: Math.random() * 50 + 40
      });
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      
      // Khói nở to dần ra ngoài không gian
      p.size += 0.08;
      
      // Mờ dần theo tuổi thọ
      p.alpha = 1 - (p.life / p.maxLife);

      if (p.life >= p.maxLife || p.alpha <= 0) {
        this.particles.splice(i, 1); // Dọn RAM GC sạch sẽ
      }
    }
  }

  private draw(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach(p => {
      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = 'rgba(120, 120, 130, 0.4)'; // Khói xám tro mờ ảo
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  /**
   * Dọn dẹp tháo dỡ RAM GC an toàn tránh rò rỉ bộ nhớ
   */
  public destroy(): void {
    this.isEmitting = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.particles = [];
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
```

---

## 2. Giải pháp tháo dỡ RAM & GC Memory Leak Prevent

*   **Chống rò rỉ bộ nhớ Canvas Particle Loop:**
    *   Hạt khói bốc lên bốc lên liên tục và tự hủy triệt để khỏi mảng `particles` bằng mảng splice khi `alpha <= 0` hoặc tuổi thọ đạt hạn mức.
    *   `cancelAnimationFrame` dừng ngay lập tức vòng lặp `requestAnimationFrame` nhàn rỗi, cam kết giải phóng hoàn toàn CPU của máy khách đạt hiệu năng mát lạnh đỉnh cao.
