# ⚙️ Infrastructure & rAF Laser Batch Renderer (Phase 2)

Tài liệu này đặc tả chi tiết giải pháp kỹ thuật vẽ đồng bộ tọa độ cầu nối ánh sáng Laser SVG co giãn Responsive (rAF Laser Batch Renderer), và dọn dẹp giải phóng bộ nhớ RAM chống rò rỉ khi Resize màn hình.

---

## 1. Bộ vẽ Laser Đồng bộ Khung hình rAF (rAF Laser Batch Renderer)

Khi người dùng co giãn cửa sổ trình duyệt (Window Resize), tọa độ thực của các node tròn ải giải thuật xê dịch liên tục. Để tránh hiện tượng giật đơ khung hình do tính toán layout dồn dập (Browser Layout Thrashing), hạ tầng thiết lập dịch vụ vẽ gom luồng bằng `requestAnimationFrame` (rAF):

```typescript
export interface Point {
  x: number;
  y: number;
}

export class LaserBatchRenderer {
  private static renderScheduled = false;

  /**
   * Tính toán vẽ đường cong Cubic Bezier nối giữa hai điểm Node tròn
   * @param start Điểm xuất phát của Laser
   * @param end Điểm kết thúc của Laser
   */
  public static calculateBezierPath(start: Point, end: Point): string {
    // Tính toán điểm neo uốn cong mềm mại giữa hai node
    const controlX = (start.x + end.x) / 2;
    return `M ${start.x} ${start.y} C ${controlX} ${start.y}, ${controlX} ${end.y}, ${end.x} ${end.y}`;
  }

  /**
   * Gom các tác vụ tính toán tọa độ và vẽ lại laser vào một khung hình rAF duy nhất
   * @param updateCallback Hàm callback thực thi vẽ lại SVG
   */
  public static scheduleBatchRender(updateCallback: () => void): void {
    if (this.renderScheduled) return;

    this.renderScheduled = true;
    requestAnimationFrame(() => {
      updateCallback();
      this.renderScheduled = false;
    });
  }
}
```

---

## 2. Giải pháp Đồng bộ Tọa độ Responsive & Chống rò rỉ RAM

*   **Tính toán Tọa độ Node thực tế (Responsive Target Syncing):**
    *   Sử dụng hàm `getBoundingClientRect()` để trích xuất tọa độ tâm thực tế của các Node tròn đang hiển thị trên giao diện máy khách.
    *   Bù trừ sai lệch cuộn màn hình (Scroll offset) để đảm bảo đường Laser luôn đính chặt vào chính giữa các Node tròn.
*   **Chống rò rỉ RAM khi Unmount (ResizeObserver Disconnect):**
    *   Hạ tầng sử dụng `ResizeObserver` giám sát sự co giãn của khung chứa bản đồ RPG Map.
    *   Khi học sinh rời trang học tập chuyển sang phân hệ khác, hệ thống thực thi đóng ngắt bộ giám sát `resizeObserver.disconnect()` và hủy đăng ký sự kiện `window.removeEventListener('resize')` để Garbage Collection thu hồi 100% tài nguyên RAM máy khách, cam kết hiệu năng bền bỉ.
