# 🧠 Multi-View Event Bus & Synchronized Timeline Manager (TypeScript)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của lớp truyền tin đồng bộ siêu tốc dưới 1ms `MultiViewEventBus`, bộ quản lý dòng thời gian `SynchronizedTimelineManager` và các ca kiểm thử tự động (Unit Tests) xác thực tính ổn định của hệ thống.

---

## 1. Trục Đồng bộ Đa giao diện Song song (TypeScript Core Logic)

Mã nguồn lõi được thiết lập bằng TypeScript chặt chẽ, tối ưu hóa truyền tin callback trực tiếp trên RAM:

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
  public static dispatch(step: TimelineStep): number {
    const startTime = performance.now();
    
    this.listeners.forEach((callbacks) => {
      callbacks.forEach(callback => callback(step));
    });

    const elapsed = performance.now() - startTime;
    return elapsed; // Trả về thời gian trễ đồng bộ đo đạc bằng mili-giây
  }

  /**
   * Hủy bỏ toàn bộ đăng ký để Garbage Collection thu hồi RAM tránh rò rỉ
   */
  public static unsubscribeAll(): void {
    this.listeners.clear();
  }

  /**
   * Lấy số lượng panel đang đăng ký lắng nghe
   */
  public static getListenerCount(): number {
    let count = 0;
    this.listeners.forEach(callbacks => {
      count += callbacks.length;
    });
    return count;
  }
}

export class SynchronizedTimelineManager {
  private steps: TimelineStep[] = [];
  private currentStepIndex = 0;

  constructor(steps: TimelineStep[]) {
    this.steps = steps;
  }

  /**
   * Tua nhanh dòng thời gian đến một bước chỉ định
   */
  public seekToStep(index: number): { success: boolean; elapsedMs: number } {
    if (index < 0 || index >= this.steps.length) {
      return { success: false, elapsedMs: 0 };
    }
    this.currentStepIndex = index;
    const targetStep = this.steps[index];
    
    const elapsed = MultiViewEventBus.dispatch(targetStep);
    return { success: true, elapsedMs: elapsed };
  }

  public getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }
}
```

---

## 2. Kiểm thử Tích hợp Đơn vị (Unit Test Specs)

Chúng ta xây dựng bộ unit tests xác thực tốc độ truyền tin cực hạn dưới 1ms và ngăn chặn lệch pha:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MultiViewEventBus, SynchronizedTimelineManager, TimelineStep } from './MultiViewEventBus';

describe('Multi-View Synchronization Unit Tests', () => {
  beforeEach(() => {
    MultiViewEventBus.unsubscribeAll();
  });

  it('Should successfully dispatch STEP_CHANGED event to all registered panels below 1ms', () => {
    const mockStep: TimelineStep = {
      stepIndex: 15,
      activeLineNumber: 8,
      activeFlowchartNodeId: 'node-partition',
      memoryStateSnapshot: { array: [3, 1, 2, 4] }
    };

    const monacoCallback = vi.fn();
    const svgCallback = vi.fn();

    // 1. Đăng ký các panel lắng nghe
    MultiViewEventBus.subscribe('monaco-editor', monacoCallback);
    MultiViewEventBus.subscribe('svg-visualizer', svgCallback);

    expect(MultiViewEventBus.getListenerCount()).toBe(2);

    // 2. Phát tán sự kiện đồng bộ và đo đạc thời gian trễ
    const latency = MultiViewEventBus.dispatch(mockStep);

    // 3. Khẳng định các callback được kích hoạt chính xác
    expect(monacoCallback).toHaveBeenCalledWith(mockStep);
    expect(svgCallback).toHaveBeenCalledWith(mockStep);
    
    // Khẳng định thời gian truyền tin siêu tốc dưới 1ms
    expect(latency).toBeLessThan(1.0);
  });

  it('Should prevent seeking out of timeline step bounds', () => {
    const mockSteps: TimelineStep[] = [
      { stepIndex: 0, activeLineNumber: 1, activeFlowchartNodeId: 'start', memoryStateSnapshot: {} },
      { stepIndex: 1, activeLineNumber: 2, activeFlowchartNodeId: 'process', memoryStateSnapshot: {} }
    ];

    const manager = new SynchronizedTimelineManager(mockSteps);

    // Thử tua đến bước vượt quá giới hạn (-1 hoặc 5)
    const resultUnder = manager.seekToStep(-1);
    const resultOver = manager.seekToStep(5);

    expect(resultUnder.success).toBe(false);
    expect(resultOver.success).toBe(false);
    expect(manager.getCurrentStepIndex()).toBe(0); // Vẫn giữ nguyên vị trí cũ
  });
});
```
 Trục truyền tin đồng bộ đơn hướng `MultiViewEventBus` thuần RAM và các ca kiểm thử đo đạc latency cực hạn cam kết hệ thống hoạt động vô cùng trơn tru mượt mà, loại bỏ hoàn toàn hiện tượng lệch pha giữa các khung nhìn.
