# ⚙️ Infrastructure & Dual Canvas Rendering Optimization (Phase 2)

Tài liệu này đặc tả chi tiết các giải pháp kỹ thuật hạ tầng tối ưu hiệu suất vẽ chu kỳ kép (Dual Canvas rendering), giải phóng tài nguyên bộ đệm chống tràn RAM và dịch vụ tiền tải dữ liệu so sánh (Preloading double payloads).

---

## 1. Dịch vụ Tải trước Giáo trình Song hành (Double Payloads Preloader)

Để đảm bảo khi sinh viên bấm chọn một cặp so sánh (ví dụ: Bubble Sort vs Quick Sort), cả hai giải thuật tải tức thời không trễ mạng, hệ thống triển khai cơ chế tải trước song hành:

```typescript
export class DoublePayloadsPreloader {
  private static cache = new Map<string, any>();

  /**
   * Tải trước song hành kịch bản của cả hai thuật toán đối sánh
   */
  public static async preloadCompareSession(leftAlgId: string, rightAlgId: string): Promise<boolean> {
    const targets = [leftAlgId, rightAlgId];
    const fetchPromises = targets.map(id => {
      if (this.cache.has(id)) return Promise.resolve(true);
      return fetch(`/api/v1/algorithms/${id}/frames`)
        .then(res => {
          if (!res.ok) throw new Error(`Lỗi tải dữ liệu ${id}`);
          return res.json();
        })
        .then(data => {
          this.cache.set(id, data);
          return true;
        })
        .catch(err => {
          console.error(err);
          return false;
        });
    });

    const results = await Promise.all(fetchPromises);
    return results.every(res => res === true);
  }

  public static getCachedPayload(algId: string): any | null {
    return this.cache.get(algId) || null;
  }
}
```

---

## 2. Giải pháp Phòng ngừa Tràn Bộ nhớ Đệm Canvas (Double Buffer Recycling)

Vẽ song song hai Canvas động 60 FPS liên tục tạo ra hàng triệu đối tượng đồ họa tính toán tọa độ mỗi giây:
*   **Tránh Khởi tạo đối tượng trong vòng lặp vẽ (Zero-allocation drawing):** Không khai báo biến `let dx`, `let dy`, `let dist` hoặc tạo mới các thực thể `new Path2D()` bên trong hàm vẽ `tick()`. Tất cả các biến phục vụ tính toán hình học được khai báo tĩnh bên ngoài và tái sử dụng (Recycle) liên tục xuyên suốt vòng đời trang so sánh.
*   **Lớp phủ dọn dẹp (Garbage Collection optimization):** Khi sinh viên thoát khỏi màn hình so sánh, hệ thống tự động giải phóng các mảng Frames khổng lồ, thu hồi luồng requestAnimationFrame và gọi `canvasContext.clearRect()` để làm sạch tuyệt đối tài nguyên VRAM đồ họa của máy tính học viên.
