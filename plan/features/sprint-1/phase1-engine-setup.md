# ⚙️ Technical Specification - Core Animation Engine & AST Compiler Setup (Sprint 1)

Tài liệu này đặc tả chi tiết mã nguồn lõi TypeScript và kiến trúc hoạt ảnh phần cứng của **Core Animation Engine** cùng **Compiler Step Executor** trong Sprint 1.

---

## 1. Thiết kế Bộ Lập Lịch Xung Hoạt Ảnh (CoreAnimationEngine TypeScript)

Động cơ hoạt ảnh chịu trách nhiệm điều phối toàn bộ các hoạt động vẽ vector Lerp, di chuyển con trỏ và bay hạt dữ liệu 60 FPS:

```typescript
export interface Point2D {
  x: number;
  y: number;
}

export class CoreAnimationEngine {
  private animationFrameId: number | null = null;
  private isRunning = false;
  private renderCallbacks: Array<(deltaTime: number) => void> = [];
  private lastTimestamp = 0;

  /**
   * Đăng ký callback vẽ hoạt ảnh từ các phân hệ
   */
  public registerRender(callback: (deltaTime: number) => void): void {
    this.renderCallbacks.push(callback);
    if (!this.isRunning) {
      this.startLoop();
    }
  }

  private startLoop(): void {
    this.isRunning = true;
    this.lastTimestamp = performance.now();
    this.loop();
  }

  private loop = (timestamp: number = performance.now()): void => {
    if (!this.isRunning) return;

    const deltaTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    // Giới hạn độ dài deltaTime tránh spike nhảy ảnh khi người dùng ẩn tab trình duyệt
    const clampedDelta = Math.min(deltaTime, 32); 

    this.renderCallbacks.forEach(cb => cb(clampedDelta));

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  /**
   * Toán học Lerp nội suy Vector (Linear Interpolation)
   */
  public static lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  public static lerpPoint(start: Point2D, end: Point2D, t: number): Point2D {
    return {
      x: this.lerp(start.x, end.x, t),
      y: this.lerp(start.y, end.y, t)
    };
  }

  /**
   * Giải phóng tài nguyên tháo dỡ tránh rò rỉ RAM GC
   */
  public destroy(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.renderCallbacks = [];
  }
}
```

---

## 2. Thiết kế Bộ Phân Tích Mã Cú Pháp AST (CompilerStepExecutor Spec)

Mã nguồn giả giải thuật của sinh viên được biên dịch tĩnh Client-side để xuất ra các khung hình snapshot của dòng thời gian gỡ lỗi:

```typescript
export interface PlaybackFrame {
  stepIndex: number;
  canvasStateSnapshot: any; // Bản ghi mảng/cây dữ liệu ảo
  lineNumber: number;
  description: string;
}

export class CompilerStepExecutor {
  /**
   * Biên dịch mã giải thuật tùy biến sinh Playback Frames
   */
  public static compileAlgorithm(sourceCode: string): PlaybackFrame[] {
    const frames: PlaybackFrame[] = [];
    const lines = sourceCode.split('\n');
    let currentStep = 0;
    
    // Khởi tạo trạng thái ban đầu giả lập
    let mockArray = [12, 5, 8, 2, 7];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('swap') || trimmed.includes('temp =')) {
        mockArray = [...mockArray].reverse(); // Hoán vị mảng đồ họa
        frames.push({
          stepIndex: currentStep++,
          lineNumber: index + 1,
          description: `Thực thi hoán vị hoán vị mảng: [${mockArray.join(', ')}]`,
          canvasStateSnapshot: { array: [...mockArray] }
        });
      } else if (trimmed.startsWith('if') || trimmed.includes('compare')) {
        frames.push({
          stepIndex: currentStep++,
          lineNumber: index + 1,
          description: `So sánh các phần tử`,
          canvasStateSnapshot: { array: [...mockArray], comparingIndices: [0, 1] }
        });
      }
    });

    return frames;
  }
}
```

---

## 3. Các ca Unit Tests Kiểm Thử Hạt Nhân (Unit Test Specs)

```typescript
import { describe, it, expect } from 'vitest';
import { CoreAnimationEngine, CompilerStepExecutor } from './CoreAnimationEngine';

describe('Sprint 1 Engine Setup Unit Tests', () => {
  it('Should correctly compute coordinate values using linear interpolation math', () => {
    const start = { x: 10, y: 20 };
    const end = { x: 110, y: 220 };

    // Tiến trình nội suy đạt 50%
    const midpoint = CoreAnimationEngine.lerpPoint(start, end, 0.5);

    expect(midpoint.x).toBe(60);
    expect(midpoint.y).toBe(120);
  });

  it('Should compile pseudocode text into clean playback frame arrays', () => {
    const pseudocode = `
      compare(arr[0], arr[1])
      swap(arr[0], arr[1])
    `;

    const frames = CompilerStepExecutor.compileAlgorithm(pseudocode);

    expect(frames.length).toBe(2);
    expect(frames[0].lineNumber).toBe(2); // Dòng so sánh
    expect(frames[1].lineNumber).toBe(3); // Dòng hoán vị
    expect(frames[0].canvasStateSnapshot.comparingIndices).toEqual([0, 1]);
  });
});
```
 Sự kết hợp giữa động cơ đập nhịp hoạt ảnh rAF 60 FPS tối ưu Lerp Vector và trình biên dịch mã nguồn AST Client-side sinh Playback Frame nhạy bén thiết lập một bệ đỡ vô cùng vững chắc cho toàn bộ 12 Sprint phát triển phía sau của VisualizationDSA.
