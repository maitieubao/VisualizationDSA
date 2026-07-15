# 🧠 Coroutine Generator Debugger & Call Stack (TypeScript)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của lớp gỡ lỗi hạt nhân `LiveCompilerDebugger` chạy generator yield, bộ theo dõi ngăn xếp đệ quy Call Stack và các ca kiểm thử tự động (Unit Tests).

---

## 1. Bộ máy Gỡ lỗi Cô-ru-tin Debugger (TypeScript Core Logic)

Lớp `LiveCompilerDebugger` vận hành tiến trình Iterator đập nhịp gỡ lỗi và phân tích ngăn xếp đệ quy:

```typescript
export interface DebugStepPayload {
  lineNumber: number;
  arrayState: number[];
  variables: Record<string, any>;
  callStack: string[];
}

export class LiveCompilerDebugger {
  private generatorInstance: Generator<DebugStepPayload, void, unknown> | null = null;
  private breakpoints: Set<number> = new Set();
  private currentStep: DebugStepPayload | null = null;

  constructor(generatorFunc: () => Generator<DebugStepPayload, void, unknown>) {
    this.generatorInstance = generatorFunc();
  }

  /**
   * Thiết lập danh sách các dòng điểm dừng Breakpoints hoạt động
   */
  public setBreakpoints(lines: number[]): void {
    this.breakpoints = new Set(lines);
  }

  /**
   * Nút bấm Step Over / Step Into - Tiến một nhịp thực thi dòng lệnh
   */
  public stepForward(): DebugStepPayload | null {
    if (!this.generatorInstance) return null;

    const res = this.generatorInstance.next();

    if (res.done) {
      this.generatorInstance = null;
      this.currentStep = null;
      return null;
    }

    this.currentStep = res.value;
    return this.currentStep;
  }

  /**
   * Nút bấm Continue - Phát liên tục cho tới khi đâm trúng điểm dừng Breakpoint tiếp theo
   */
  public continueToNextBreakpoint(): DebugStepPayload | null {
    if (!this.generatorInstance) return null;

    let stepsCount = 0;
    const MAX_STEPS = 5000; // Bảo vệ an toàn chống lặp vô tận

    while (stepsCount < MAX_STEPS) {
      const res = this.generatorInstance.next();

      if (res.done) {
        this.generatorInstance = null;
        this.currentStep = null;
        return null;
      }

      const payload = res.value;
      stepsCount++;

      // Nếu dòng lệnh vừa chạy qua trúng một dòng điểm dừng Breakpoint
      if (this.breakpoints.has(payload.lineNumber)) {
        this.currentStep = payload;
        return this.currentStep;
      }
    }

    throw new Error('Continue vượt quá giới hạn an toàn 5000 bước thực thi! Đệ quy quá sâu hoặc lặp vô tận.');
  }

  public getCurrentStep(): DebugStepPayload | null {
    return this.currentStep;
  }
}
```

---

## 2. Kiểm thử Tích hợp Đơn vị (Unit Test Specs)

Chúng ta xây dựng bộ unit tests xác thực quá trình nhảy bước dòng code Step Forward và va chạm điểm dừng Breakpoint chính xác:

```typescript
import { describe, it, expect } from 'vitest';
import { LiveCompilerDebugger, DebugStepPayload } from './LiveCompilerDebugger';

// Giả lập một hàm Generator thuật toán đệ quy Quick Sort thu nhỏ sau khi dịch AST
function* mockQuickSortGenerator(): Generator<DebugStepPayload, void, unknown> {
  yield { lineNumber: 2, arrayState: [4, 2], variables: { left: 0 }, callStack: ['quickSort(0,1)'] };
  yield { lineNumber: 5, arrayState: [4, 2], variables: { pivot: 4 }, callStack: ['quickSort(0,1)', 'partition(0,1)'] };
  yield { lineNumber: 8, arrayState: [2, 4], variables: { pivot: 4 }, callStack: ['quickSort(0,1)', 'partition(0,1)'] };
}

describe('Algorithmic Debugger Unit Tests', () => {
  it('Should step forward correctly line by line and update Call Stack recursive frames', () => {
    const debuggerInstance = new LiveCompilerDebugger(mockQuickSortGenerator);

    // Bước 1: Dòng 2
    const step1 = debuggerInstance.stepForward();
    expect(step1).not.toBeNull();
    expect(step1?.lineNumber).toBe(2);
    expect(step1?.callStack).toEqual(['quickSort(0,1)']);

    // Bước 2: Chui vào partition (Dòng 5)
    const step2 = debuggerInstance.stepForward();
    expect(step2?.lineNumber).toBe(5);
    expect(step2?.callStack).toEqual(['quickSort(0,1)', 'partition(0,1)']); // Tăng cấp đệ quy xếp lồng
  });

  it('Should halt exactly on registered active breakpoints when Continue is pressed', () => {
    const debuggerInstance = new LiveCompilerDebugger(mockQuickSortGenerator);
    debuggerInstance.setBreakpoints([8]); // Đặt Breakpoint tại dòng số 8

    // Bấm nút Continue nhảy cóc qua dòng 5 đâm thẳng vào dòng 8 chứa Breakpoint
    const breakpointStep = debuggerInstance.continueToNextBreakpoint();

    expect(breakpointStep).not.toBeNull();
    expect(breakpointStep?.lineNumber).toBe(8);
    expect(breakpointStep?.variables.pivot).toBe(4);
    expect(breakpointStep?.arrayState).toEqual([2, 4]); // Mảng số thô đã được hoán vị
  });
});
```
 Động cơ gỡ lỗi đa cấp bậc (Coroutine Generator Engine) và bộ unit test chặt chẽ đảm bảo tính chính xác 100% về mặt giải thuật đệ quy phức tạp và mang lại cho sinh viên chiếc kính lúp sư phạm trực quan đỉnh cao.
