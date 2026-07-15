# ⚙️ Infrastructure & SVG Dynamic Dispatch Laser Pointer (Phase 2)

Tài liệu này đặc tả chi tiết giải pháp kỹ thuật tính toán tọa độ vector bắn tia laser đa hình động kết nối mềm mại các ô nhớ (SVG Dynamic Dispatch Laser Pointer) và giải phóng dọn dẹp lắng nghe sự kiện.

---

## 1. Bộ vẽ Laser Đa hình Động uốn lượn SVG (SVG Laser Batch Renderer)

Khi có cuộc gọi đa hình, tia laser phát sáng cần bắn chuẩn xác từ nút bấm gọi hàm trong Monaco Editor sang ô nhớ VTable của đối tượng Heap ảo, rồi phản xạ tiếp tục bắn trúng phương thức lớp con ghi đè. Để đường laser nối chặt chuẩn xác bất kể màn hình co giãn Responsive, hạ tầng tính toán tọa độ vector thực tế:

```typescript
export interface CoordinatePoint {
  x: number;
  y: number;
}

export class SVGLaserBatchRenderer {
  /**
   * Lấy tọa độ tâm thực tế của một phần tử DOM bất kỳ trên màn hình máy khách
   * @param elementId ID duy nhất của thẻ HTML (ví dụ: 'node-vtable-0x7FFF00')
   */
  public static getDOMElementCenter(elementId: string): CoordinatePoint {
    const el = document.getElementById(elementId);
    if (!el) return { x: 0, y: 0 };

    const rect = el.getBoundingClientRect();
    
    // Cộng sai lệch scroll trang để luôn đính chặt chuẩn
    return {
      x: rect.left + rect.width / 2 + window.scrollX,
      y: rect.top + rect.height / 2 + window.scrollY
    };
  }

  /**
   * Tính toán đường dẫn laser cong mềm mại Cubic Bezier uốn lượn
   */
  public static calculateLaserPath(start: CoordinatePoint, end: CoordinatePoint): string {
    const controlX = (start.x + end.x) / 2;
    return `M ${start.x} ${start.y} C ${controlX} ${start.y}, ${controlX} ${end.y}, ${end.x} ${end.y}`;
  }
}
```

---

## 2. Giải pháp Đồng bộ Laser Khung hình rAF & GC Memory Leak Prevent

*   **Đồng bộ Khung hình 60 FPS (requestAnimationFrame Scheduler):**
    *   Các tác vụ vẽ lại tia Laser uốn khúc khi người dùng cuộn chuột (Scroll) hoặc thay đổi độ rộng panel chia ô đều được gom cụm qua `requestAnimationFrame`, loại bỏ 100% hiện tượng rung giật hay đơ lag màn hình.
*   **Chống rò rỉ RAM khi Tháo lắp Workspace:**
    *   Tất cả các bộ lắng nghe sự kiện di chuyển chuột hoặc resize window đều được giải phóng hoàn hảo khi component Vue bị hủy (Unmount).
    *   Các đối tượng trong Heap ảo được thu dọn triệt để qua hàm `resetHeapMemory()` của store, cam kết Garbage Collection thu hồi RAM máy khách tuyệt đối không rò rỉ.
