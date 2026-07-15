# ⚙️ Infrastructure & Canvas Spark Physics Scheduler (Phase 2)

Tài liệu này đặc tả chi tiết giải pháp kỹ thuật bộ phát hạt Canvas 2D mô phỏng nhiệt lượng bùng cháy (Canvas Spark Physics Scheduler) và dọn dẹp giải phóng sự kiện chuột tháo dỡ RAM.

---

## 1. Bộ phát Hạt lửa Nhiệt lượng Canvas 2D (ThermalSparkParticleEngine)

Khi một lớp vi phạm SRP, viền card sẽ phát sáng đỏ rực và kích hoạt Canvas 2D vẽ hàng ngàn hạt lửa bay bốc lên phía sau. Để đảm bảo hoạt ảnh chạy mượt mà 60 FPS, hệ thống thiết kế hệ vật lý hạt tối ưu:

```typescript
export interface FireParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
}

export class ThermalSparkParticleEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: FireParticle[] = [];
  private animationFrameId: number | null = null;
  private isRunning = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  /**
   * Khởi chạy vòng lặp phát hoạt ảnh bùng cháy 60 FPS
   */
  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.loop();
  }

  private loop = (): void => {
    if (!this.isRunning) return;
    
    this.updateParticles();
    this.drawParticles();
    
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  /**
   * Sinh hạt mới và cập nhật tọa độ vật lý bay lên
   */
  private updateParticles(): void {
    // Luôn giữ mật độ hạt vừa phải tránh nghẽn CPU
    if (this.particles.length < 80) {
      this.particles.push(this.createParticle());
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      // Cháy bốc bay lên
      p.y += p.vy;
      p.x += p.vx + Math.sin(p.life * 0.05) * 0.5; // Lắc gió nhẹ
      p.life--;

      // Hạt nguội dần phai nhỏ
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private createParticle(): FireParticle {
    return {
      x: Math.random() * this.canvas.width,
      y: this.canvas.height - 5,
      vx: (Math.random() - 0.5) * 1.2,
      vy: -(Math.random() * 2.0 + 1.0), // Tốc độ bay ngược lên trên
      maxLife: Math.random() * 40 + 20,
      life: 0,
      size: Math.random() * 3 + 1,
      hue: Math.random() * 30 // Màu từ đỏ sang cam bập bùng
    };
  }

  /**
   * Vẽ hạt phát sáng lên Canvas 2D
   */
  private drawParticles(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalCompositeOperation = 'lighter'; // Cộng gộp ánh sáng phát quang Neon

    this.particles.forEach(p => {
      p.life++;
      const alpha = 1 - p.life / p.maxLife;
      
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      this.ctx.fillStyle = `hsla(${p.hue}, 100%, 50%, ${alpha})`;
      this.ctx.fill();
    });
  }

  /**
   * Dừng hoạt ảnh bùng cháy và dọn sạch RAM GC
   */
  public stop(): void {
    this.isRunning = false;
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

*   **Dọn sạch Canvas Loop:**
    *   Khi sinh viên chuyển bài học SOLID (ví dụ: chuyển từ SRP sang LSP), component sẽ gọi `.stop()` của bộ máy phát hạt lửa để giải phóng vòng lặp `requestAnimationFrame`, dọn sạch mảng `particles` trong RAM.
*   **Hủy lắng nghe Window Resize:**
    *   Tọa độ canvas tự động resize co giãn được quản lý an toàn và gỡ bỏ hoàn toàn listener khi unmount, cam kết Garbage Collection dọn dẹp RAM máy khách 100% sạch sẽ.
