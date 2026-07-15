# ⚙️ Infrastructure & UML Asset Loader - Design Patterns (Phase 2)

Tài liệu này đặc tả chi tiết các giải pháp kỹ thuật hạ tầng tải cấu trúc sơ đồ lớp UML (UML Scenario Preloader), tối ưu hóa luồng vẽ SVG động và quản lý sự kiện chuột kéo thả chống rò rỉ bộ nhớ (Garbage Collection Optimization).

---

## 1. Dịch vụ Tải Sơ đồ Lớp Gang of Four (UML Scenario Asset Loader)

Để người học có thể chuyển đổi mượt mà giữa các mẫu thiết kế hướng đối tượng mà không gặp hiện tượng đứng màn hình, hạ tầng triển khai dịch vụ tiền tải:

```typescript
export interface UMLScenarioPayload {
  patternId: string;
  title: string;
  nodes: Array<{ id: string; name: string; type: string; x: number; y: number }>;
  links: Array<{ id: string; sourceId: string; targetId: string; type: string }>;
}

export class UMLScenarioLoader {
  private static scenarioCache = new Map<string, UMLScenarioPayload>();

  /**
   * Tải trước cấu trúc sơ đồ UML từ API máy chủ
   */
  public static async preloadScenario(patternId: string): Promise<boolean> {
    if (this.scenarioCache.has(patternId)) return true;

    try {
      const res = await fetch(`/api/v1/patterns/scenarios/${patternId}`);
      if (!res.ok) throw new Error('Không thể kết nối máy chủ tải sơ đồ.');
      const data: UMLScenarioPayload = await res.json();
      
      this.scenarioCache.set(patternId, data);
      return true;
    } catch (err) {
      console.error('Lỗi hạ tầng tải sơ đồ lớp UML:', err);
      return false;
    }
  }

  public static getScenario(patternId: string): UMLScenarioPayload | null {
    return this.scenarioCache.get(patternId) || null;
  }
}
```

---

## 2. Tối ưu hóa Chu kỳ Kéo thả chuột & Chống rò rỉ RAM (GC Optimization)

*   **Bộ lắng nghe Sự kiện kéo thả toàn cầu (Global Mousemove Binding):**
    *   Khi người dùng click nhấp giữ thẻ Class Node và di chuột nhanh ra ngoài mép thẻ, nếu chỉ lắng nghe sự kiện `@mousemove` trên chính thẻ đó sẽ gây ra hiện tượng mất dấu node kéo thả (Detached drag).
    *   Hạ tầng khắc phục bằng cách tự động đăng ký sự kiện lắng nghe chuột trên cấp toàn cầu `window.addEventListener('mousemove', ...)` khi bắt đầu drag và hủy đăng ký ngay khi nhả chuột `window.removeEventListener('mouseup', ...)`.
*   **Giải phóng bộ nhớ triệt để (Resource Cleanup):**
    *   Khi sinh viên chuyển sang phân hệ khác hoặc đóng tab học tập, toàn bộ sự kiện chuột kéo thả của window được gỡ bỏ sạch sẽ, đặt cache sơ đồ `scenarioCache.clear()` để tránh tích tụ rác RAM rò rỉ trên trình duyệt.
