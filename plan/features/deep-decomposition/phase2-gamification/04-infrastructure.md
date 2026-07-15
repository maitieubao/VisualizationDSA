# ⚙️ Infrastructure & Canvas Confetti Particle System (Phase 2)

Tài liệu này đặc tả chi tiết giải pháp kỹ thuật vẽ hạt pháo hoa Confetti mượt mà hiệu năng cao (HTML5 Canvas Confetti Particle Generator) và bộ quản lý múi giờ đồng bộ an toàn.

---

## 1. Động cơ Phun hạt Canvas Confetti (HTML5 Canvas Confetti Engine)

Để tránh hiện tượng gián đoạn màn hình (UI Lag) do sinh hàng ngàn thẻ div DOM khi nổ pháo hoa chúc mừng thăng cấp, hạ tầng xây dựng bộ máy phun hạt vẽ trực tiếp lên Canvas 2D ẩn:

```typescript
interface ConfettiParticle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
}

export class CanvasConfettiEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: ConfettiParticle[] = [];
  private animationFrameId: number | null = null;
  private colors = ['#FF007F', '#06B6D4', '#10B981', '#F59E0B', '#8B5CF6']; // Tông màu Neon rực rỡ

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Không thể khởi tạo môi trường vẽ Canvas 2D.');
    this.ctx = context;
    this.resizeCanvas();
  }

  public resizeCanvas(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  /**
   * Phun trào hạt confetti ăn mừng cực mạnh
   */
  public burst(count: number = 150): void {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: centerX,
        y: centerY,
        size: Math.random() * 8 + 4,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        speedX: (Math.random() - 0.5) * 15,
        speedY: (Math.random() - 0.8) * 18,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
      });
    }

    if (!this.animationFrameId) {
      this.tick();
    }
  }

  /**
   * Vòng lặp vẽ và cập nhật tọa độ hạt 60 FPS mượt mà
   */
  private tick = (): void => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.speedX;
      p.y += p.speedY;
      
      // Chịu lực cản gió ảo và trọng lực rơi rụng
      p.speedY += 0.25; // Trọng lực rơi xuống
      p.speedX *= 0.98; // Lực cản không khí
      p.rotation += p.rotationSpeed;

      // Vẽ hạt confetti dạng hình chữ nhật xoay chao lượn
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      this.ctx.restore();

      // Loại bỏ hạt rơi khỏi mép dưới màn hình để giải phóng RAM
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

  /**
   * Giải phóng bộ nhớ RAM triệt để chống rò rỉ khi Unmount
   */
  public destroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.particles = [];
  }
}
```
 Động cơ Canvas pháo hoa `CanvasConfettiEngine` vẽ hạt 60 FPS mượt mà kết hợp dọn dẹp RAM Garbage Collection triệt để cam kết trải nghiệm học game hóa luôn sống động rực rỡ, nhẹ nhàng hoàn hảo cho trình duyệt của học sinh.
