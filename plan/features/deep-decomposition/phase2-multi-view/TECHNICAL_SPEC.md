# 🛠 Technical Specification - Multi-View Sync Engine & Unidirectional Event Bus

Tài liệu này đặc tả chi tiết kiến trúc điều phối thông điệp bất đồng bộ đơn hướng, giải thuật đồng bộ mốc thời gian tua nhanh timeline siêu tốc dưới 1ms và bộ co giãn bố cục resizable layout.

---

## 1. Trục Đồng bộ Đơn hướng Event Bus thuần RAM (MultiViewEventBus)

Để triệt tiêu hoàn toàn độ trễ của các cơ chế reactive proxy thông thường khi người dùng kéo tua chuột tốc độ cao trên thanh trượt timeline, hệ thống thiết lập trục truyền thông điệp thuần bộ nhớ RAM trực tiếp:

```typescript
export interface TimelineStep {
  stepIndex: number;
  activeLineNumber: number;
  activeFlowchartNodeId: string;
  memoryStateSnapshot: any; // Trạng thái mảng hoặc cấu trúc cây tại bước này
}

type StepChangedCallback = (step: TimelineStep) => void;

export class MultiViewEventBus {
  private static listeners: Map<string, StepChangedCallback[]> = new Map();

  /**
   * Đăng ký lắng nghe sự kiện thay đổi bước giải thuật
   */
  public static subscribe(viewId: string, callback: StepChangedCallback): void {
    if (!this.listeners.has(viewId)) {
      this.listeners.set(viewId, []);
    }
    this.listeners.get(viewId)!.push(callback);
  }

  /**
   * Phát đi thông điệp thay đổi bước giải thuật tức khắc
   */
  public static dispatch(step: TimelineStep): void {
    const startTime = performance.now();
    
    this.listeners.forEach((callbacks) => {
      callbacks.forEach(callback => callback(step));
    });

    const elapsed = performance.now() - startTime;
    if (elapsed > 1.0) {
      console.warn(`SYNC_WARNING: Thời gian đồng bộ vượt quá 1ms (${elapsed.toFixed(2)}ms). Cần tối ưu hóa render.`);
    }
  }

  /**
   * Hủy bỏ toàn bộ đăng ký tránh rò rỉ bộ nhớ RAM khi unmount view
   */
  public static unsubscribeAll(): void {
    this.listeners.clear();
  }
}
```

---

## 2. Giải thuật Đồng bộ hóa Monaco Gutter Highlighting & SVG Visualizer

```typescript
export class SynchronizedTimelineManager {
  private steps: TimelineStep[] = [];
  private currentStepIndex = 0;

  constructor(steps: TimelineStep[]) {
    this.steps = steps;
  }

  /**
   * Tua nhanh snap sang một bước thời gian chỉ định
   */
  public seekToStep(index: number): void {
    if (index < 0 || index >= this.steps.length) return;
    this.currentStepIndex = index;
    
    const targetStep = this.steps[index];
    
    // Phát tán thông điệp tức thời đến tất cả các panel đăng ký
    MultiViewEventBus.dispatch(targetStep);
  }
}
```

*   **Tương tác Monaco Editor (Monaco decorations):**
    *   Lắng nghe sự kiện `MultiViewEventBus`.
    *   Sử dụng API `editor.deltaDecorations()` của Monaco để vẽ/xóa vùng highlight active line cực nhanh mà không cần khởi tạo lại editor.
*   **Tính toán kéo co giãn Resizable Splitter (Calculations math):**
    *   Tỷ lệ chia màn hình tính theo phần trăm % thực tế dựa trên bề rộng của Container chứa:
        $$\text{PaneWidth}\% = \left( \frac{\text{ClientX} - \text{ContainerLeft}}{\text{ContainerWidth}} \right) \times 100$$
    *   Giới hạn ngưỡng an toàn (Clamping parameters): $\text{PaneWidth} \ge 15\%$ và $\le 85\%$ để ngăn chặn pane biến mất hoàn toàn.
