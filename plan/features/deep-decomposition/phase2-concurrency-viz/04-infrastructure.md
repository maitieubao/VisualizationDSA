# ⚙️ Infrastructure & Scenario Preloader - Concurrency Viz (Phase 2)

Tài liệu này đặc tả chi tiết các giải pháp kỹ thuật hạ tầng tải trước kịch bản đa luồng (Multi-thread Scenario Preloader), dọn dẹp giải phóng bộ nhớ chống rò rỉ (Memory leak prevention) và tối ưu hóa vẽ nhiều luồng di chuyển đồng thời trên Canvas.

---

## 1. Dịch vụ Tải trước Kịch bản Đa luồng (Multi-thread Scenario Preloader)

Để sinh viên lựa chọn mượt mà giữa các giáo trình đa luồng kinh điển như *Dining Philosophers* hay *Producer-Consumer* mà không gặp hiện tượng trễ mạng, hệ thống triển khai dịch vụ tiền tải:

```typescript
export interface ConcurrencyScenarioPayload {
  id: string;
  title: string;
  threadsCount: number;
  initialLocks: string[];
  pseudocode: string;
}

export class ConcurrencyScenarioLoader {
  private static scenarioCache = new Map<string, ConcurrencyScenarioPayload>();

  /**
   * Tải trước kịch bản song song từ máy chủ API
   */
  public static async preloadScenario(scenarioId: string): Promise<boolean> {
    if (this.scenarioCache.has(scenarioId)) return true;

    try {
      const res = await fetch(`/api/v1/concurrency/scenarios/${scenarioId}`);
      if (!res.ok) throw new Error('Không thể kết nối đến máy chủ tải kịch bản.');
      const data: ConcurrencyScenarioPayload = await res.json();
      
      this.scenarioCache.set(scenarioId, data);
      return true;
    } catch (err) {
      console.error('Lỗi hạ tầng tiền tải kịch bản đa luồng:', err);
      return false;
    }
  }

  public static getScenario(scenarioId: string): ConcurrencyScenarioPayload | null {
    return this.scenarioCache.get(scenarioId) || null;
  }
}
```

---

## 2. Giải pháp Hợp nhất Chu kỳ Vẽ & Phòng ngừa Rò rỉ RAM (GC & RAF Optimization)

*   **Vẽ nhiều luồng đồng hành song song (Batch rendering):** 
    *   Khi mô phỏng kịch bản có nhiều luồng (ví dụ kịch bản Dining Philosophers có 5 triết gia và 5 luồng cùng di chuyển tranh chấp 5 chiếc đũa), hệ thống không tạo riêng lẻ các vòng lặp vẽ bất đồng bộ.
    *   Hạ tầng sử dụng bộ gom chu kỳ **RequestAnimationFrame Batching**, dồn tất cả tọa độ cập nhật của cả 5 quả cầu luồng và trạng thái 5 ổ khóa vẽ vào chung đúng một chu kỳ quét Canvas duy nhất của GPU, cam kết tốc độ hiển thị luôn đạt chuẩn 60 FPS mượt mà ổn định.
*   **Giải phóng bộ nhớ triệt để (GC Optimization):**
    *   Khi người dùng thoát khỏi tab học tập đa luồng, hệ thống tự động tắt bộ hẹn giờ `setTimeout` đập nhịp giải lập, đặt thực thể `simulationEngine = null` và giải phóng cache kịch bản để bộ thu gom rác (Garbage Collector) dọn sạch tài nguyên RAM máy tính Client ngay lập tức.
