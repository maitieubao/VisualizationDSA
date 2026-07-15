# ⚙️ Infrastructure & Throttled Drag Coordinator (Phase 2)

Tài liệu này đặc tả chi tiết giải pháp kỹ thuật kéo thả phân cực mượt mà 60 FPS (Throttled Drag Coordinator) và bộ quản lý thu dọn sự kiện tháo lắp panel đa giao diện song song.

---

## 1. Bộ điều phối Kéo thả Co giãn Tối ưu hóa rAF (Throttled Drag Coordinator)

Kéo thanh chia ô màn hình liên tục sinh ra hàng vạn sự kiện tính toán chiều rộng DOM mỗi giây. Để triệt tiêu hoàn toàn lỗi đơ giật do quá tải tính toán layout dồn dập (Browser Layout Thrashing), hạ tầng xây dựng lớp điều phối kéo thả áp dụng cơ chế giới hạn tần suất (Throttle) bằng `requestAnimationFrame`:

```typescript
export class ThrottledDragCoordinator {
  private isDragging = false;
  private containerElement: HTMLElement;
  private dragCallback: (percentage: number) => void;
  private ticking = false;
  private currentX = 0;

  constructor(
    container: HTMLElement, 
    onDragUpdate: (percentage: number) => void
  ) {
    this.containerElement = container;
    this.dragCallback = onDragUpdate;
  }

  /**
   * Bắt đầu phiên kéo thả thanh phân chia panel
   */
  public startDrag(): void {
    this.isDragging = true;
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none'; // Chống bôi đen văn bản khi đang kéo
  }

  /**
   * Theo dõi tọa độ chuột và kích hoạt throttle rAF
   */
  private handleMouseMove = (e: MouseEvent): void => {
    if (!this.isDragging) return;
    this.currentX = e.clientX;

    if (!this.ticking) {
      requestAnimationFrame(this.updateLayout);
      this.ticking = true;
    }
  };

  /**
   * Tính toán lại tỷ lệ phần trăm phân bổ pane trong một khung hình 60 FPS
   */
  private updateLayout = (): void => {
    const rect = this.containerElement.getBoundingClientRect();
    const relativeX = this.currentX - rect.left;
    
    // Tính tỷ lệ % bề rộng thực
    let percentage = (relativeX / rect.width) * 100;
    
    // Giới hạn biên an toàn tối thiểu và tối đa (Clamping)
    if (percentage < 15) percentage = 15;
    if (percentage > 85) percentage = 85;

    this.dragCallback(percentage);
    this.ticking = false;
  };

  /**
   * Kết thúc phiên kéo thả, thu dọn các listener
   */
  private handleMouseUp = (): void => {
    this.isDragging = false;
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  /**
   * Hủy giải phóng triệt để tránh rò rỉ RAM khi tháo dỡ pane
   */
  public destroy(): void {
    this.handleMouseUp();
  }
}
```

---

## 2. Quy trình Tháo lắp Panel & GC thu hồi tài nguyên (Cleanups on Unmount)

*   **Chống rò rỉ Monaco Editor RAM:**
    *   Khi thay đổi danh sách panel hiển thị (ví dụ: tắt Monaco Editor để xem toàn màn hình SVG), Monaco phải gọi hàm `.dispose()` để giải phóng toàn bộ mô hình ngôn ngữ và gutter decorations, tránh việc editor chạy ngầm ăn mòn bộ nhớ RAM.
*   **Hủy đăng ký Window Listener:**
    *   Tất cả sự kiện kéo thả chuột toàn màn hình đăng ký trực tiếp vào `window` đều được lớp `ThrottledDragCoordinator` gỡ bỏ hoàn toàn khi kết thúc thao tác kéo thả hoặc khi component Vue unmount.
