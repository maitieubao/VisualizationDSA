# ⚙️ Infrastructure & IoC Scenario Loader (Phase 2)

Tài liệu này đặc tả chi tiết các giải pháp kỹ thuật hạ tầng tải trước kịch bản Dependency Injection (DI Scenario Preloader), dọn dẹp giải phóng bộ nhớ (GC Optimization) và tối ưu hóa chu kỳ vẽ luồng phân giải đệ quy.

---

## 1. Dịch vụ Tải cấu trúc Đăng ký IoC (DI Scenario Asset Loader)

Để sinh viên có thể chuyển đổi mượt mà giữa các mô hình thiết kế phức tạp (ví dụ: *Clean Architecture API* hay *CQRS Pattern*) mà không gặp hiện tượng trễ hình ảnh, hệ thống triển khai dịch vụ tiền tải:

```typescript
export interface DIScenarioPayload {
  scenarioId: string;
  title: string;
  registrations: Array<{
    serviceType: string;
    implementationType: string;
    lifetime: 'SINGLETON' | 'TRANSIENT';
    dependencies: string[];
  }>;
}

export class DIScenarioLoader {
  private static scenarioCache = new Map<string, DIScenarioPayload>();

  /**
   * Tải trước kịch bản đăng ký DI từ máy chủ API
   */
  public static async preloadScenario(scenarioId: string): Promise<boolean> {
    if (this.scenarioCache.has(scenarioId)) return true;

    try {
      const res = await fetch(`/api/v1/ioc/scenarios/${scenarioId}`);
      if (!res.ok) throw new Error('Không thể kết nối đến máy chủ tải kịch bản.');
      const data: DIScenarioPayload = await res.json();
      
      this.scenarioCache.set(scenarioId, data);
      return true;
    } catch (err) {
      console.error('Lỗi hạ tầng tiền tải kịch bản DI:', err);
      return false;
    }
  }

  public static getScenario(scenarioId: string): DIScenarioPayload | null {
    return this.scenarioCache.get(scenarioId) || null;
  }
}
```

---

## 2. Giải pháp Hợp nhất Vẽ & Phòng ngừa rò rỉ RAM (Resource Cleanups)

*   **Vẽ luồng laser Neon hiệu năng cao (SVG Layer optimization):**
    *   Tất cả các tia laser Neon biểu thị bơm phụ thuộc được gom chung vẽ trong một lớp nền SVG overlay duy nhất sử dụng cơ chế `RequestAnimationFrame Batching`.
    *   Giúp giảm tối đa tần suất quét vẽ lại (Reflow/Repaint) của trình duyệt, cam kết các quả cầu Neon laser trượt mượt mà 60 FPS kể cả trên màn hình di động yếu.
*   **Dọn dẹp dập tắt timer gỡ lỗi (Memory Leak Prevention):**
    *   Khi sinh viên đóng cửa sổ học tập DI, hệ thống gỡ bỏ sạch sẽ các bộ hẹn giờ đập nhịp hoạt ảnh phân giải đệ quy `setTimeout` đang chạy dở.
    *   Làm sạch bộ nhớ đệm `scenarioCache.clear()`, đặt đối tượng `iocSimulator = null` để giải phóng RAM Client ngay tức khắc.
