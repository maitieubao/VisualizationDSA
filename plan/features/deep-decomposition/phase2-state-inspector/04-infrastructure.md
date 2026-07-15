# ⚙️ Infrastructure & Dynamic Pointer Arrow Recalculator (Phase 2)

Tài liệu này đặc tả chi tiết giải pháp kỹ thuật vẽ co giãn mũi tên tham chiếu (Dynamic Pointer Arrow Recalculator) co giãn màn hình mượt mà 60 FPS bằng requestAnimationFrame (rAF) và tháo dỡ RAM an toàn.

---

## 1. Bộ Vẽ Co Giãn Mũi Tên Tham Chiếu SVG (PointerArrowBatchRenderer)

Khi kích hoạt trắc nghiệm hoặc thanh tra ngăn xếp biến con trỏ chỉ sang Heap ảo, tọa độ của các thẻ DOM ngăn xếp (Stack) và Heap thay đổi liên tục khi cuộn (scroll) hoặc resize cửa sổ. Chúng ta thiết lập bộ render tự co giãn tọa độ động cực cực kỳ chính xác:

```typescript
export interface PointerLink {
  sourceId: string; // ID thẻ HTML chứa ô biến số trong ngăn xếp Stack
  targetId: string; // ID thẻ HTML chứa ô đối tượng Node trong Heap ảo
  pathElement: SVGPathElement;
}

export class PointerArrowBatchRenderer {
  private links: PointerLink[] = [];
  private animationFrameId: number | null = null;
  private isRendering = false;

  constructor() {
    // Tự động lắng nghe resize cửa sổ để vẽ lại chính xác 100%
    window.addEventListener('resize', this.triggerRecalculate);
  }

  public registerLink(sourceId: string, targetId: string, pathElement: SVGPathElement): void {
    this.links.push({ sourceId, targetId, pathElement });
    if (!this.isRendering) {
      this.startRenderLoop();
    }
  }

  private startRenderLoop(): void {
    this.isRendering = true;
    this.loop();
  }

  private loop = (): void => {
    if (!this.isRendering) return;
    
    this.recalculateCoordinates();
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  /**
   * Tính toán lại toàn bộ tọa độ uốn lượn Bezier bám sát vị trí thực tế của DOM
   */
  private recalculateCoordinates(): void {
    this.links.forEach(link => {
      const sourceEl = document.getElementById(link.sourceId);
      const targetEl = document.getElementById(link.targetId);

      if (!sourceEl || !targetEl) return;

      const rectA = sourceEl.getBoundingClientRect();
      const rectB = targetEl.getBoundingClientRect();

      // Điểm bắt đầu nguồn (Mép phải ngăn xếp Stack variable)
      const p0x = rectA.right + window.scrollX;
      const p0y = rectA.top + rectA.height / 2 + window.scrollY;

      // Điểm kết thúc đích (Mép trái ô nhớ đối tượng Node bên Heap)
      const p3x = rectB.left + window.scrollX;
      const p3y = rectB.top + rectB.height / 2 + window.scrollY;

      const dx = Math.max(Math.abs(p3x - p0x), 40);
      const p1x = p0x + dx * 0.4;
      const p1y = p0y;
      const p2x = p3x - dx * 0.4;
      const p2y = p3y;

      // Sinh chuỗi Cubic Bezier lộng lẫy
      const pathD = `M ${p0x} ${p0y} C ${p1x} ${p1y}, ${p2x} ${p2y}, ${p3x} ${p3y}`;
      link.pathElement.setAttribute('d', pathD);
    });
  }

  private triggerRecalculate = (): void => {
    this.recalculateCoordinates();
  };

  /**
   * Giải phóng thu hồi tài nguyên và dọn dẹp bộ nhớ RAM GC
   */
  public destroy(): void {
    this.isRendering = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    window.removeEventListener('resize', this.triggerRecalculate);
    this.links = [];
  }
}
```

---

## 2. Giải pháp tháo dỡ RAM & GC Memory Leak Prevent

*   **Chống rò rỉ bộ nhớ Window Event:**
    *   Hạ tầng đăng ký lắng nghe sự kiện `resize` bắt buộc phải được gỡ bỏ bằng `.destroy()` ngay khi sinh viên đóng workspace hoặc chuyển giải thuật học tập cấu trúc dữ liệu mới.
    *   `cancelAnimationFrame` dừng ngay lập tức vòng lặp `requestAnimationFrame` nhàn rỗi, cam kết giải phóng hoàn toàn CPU của học sinh đạt hiệu năng đỉnh cao nhất.
