import { expect, test, describe, vi, beforeEach, afterEach } from 'vitest';
import { CoreAnimationEngine } from '../CoreAnimationEngine';
import { CompilerStepExecutor } from '../CompilerStepExecutor';

let originalRAF: typeof requestAnimationFrame;
let originalCAF: typeof cancelAnimationFrame;

beforeEach(() => {
  originalRAF = globalThis.requestAnimationFrame;
  originalCAF = globalThis.cancelAnimationFrame;
  globalThis.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16.67) as any);
  globalThis.cancelAnimationFrame = vi.fn((id) => clearTimeout(id));
  vi.useFakeTimers();
});

afterEach(() => {
  globalThis.requestAnimationFrame = originalRAF;
  globalThis.cancelAnimationFrame = originalCAF;
  vi.restoreAllMocks();
});

describe('1. CoreAnimationEngine Unit Test Suit', () => {

  test('Phép toán Lerp phải hoạt động chính xác trong giới hạn 0-1', () => {
    expect(CoreAnimationEngine.lerp(10, 20, 0.5)).toBe(15);
    expect(CoreAnimationEngine.lerp(10, 20, -1)).toBe(10); // Clamp dưới
    expect(CoreAnimationEngine.lerp(10, 20, 2)).toBe(20);  // Clamp trên
  });

  test('Phép toán lerpPoint phải hoạt động chính xác cho tọa độ 2D', () => {
    const p1 = { x: 0, y: 0 };
    const p2 = { x: 100, y: 200 };
    expect(CoreAnimationEngine.lerpPoint(p1, p2, 0.5)).toEqual({ x: 50, y: 100 });
    expect(CoreAnimationEngine.lerpPoint(p1, p2, -0.1)).toEqual({ x: 0, y: 0 });
    expect(CoreAnimationEngine.lerpPoint(p1, p2, 1.5)).toEqual({ x: 100, y: 200 });
  });

  test('Đăng ký, hủy đăng ký callback và chạy loop rAF', () => {
    const engine = new CoreAnimationEngine();
    const mockCallback = vi.fn();

    // Mock requestAnimationFrame
    let rafCallback: any = null;
    const mockRaf = vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallback = cb;
      return 123;
    });

    engine.registerRender(mockCallback);
    expect(mockRaf).toHaveBeenCalled();
    expect(rafCallback).toBeDefined();

    // Giả lập callback rAF chạy lần 1
    if (rafCallback) {
      rafCallback(performance.now() + 16.67);
    }
    expect(mockCallback).toHaveBeenCalled();

    // Hủy đăng ký callback
    engine.unregisterRender(mockCallback);
    engine.destroy();
  });

  test('Clamping DeltaTime không vượt quá 32ms ngay cả khi trễ lớn', () => {
    const engine = new CoreAnimationEngine();
    let recordedDelta = 0;
    const callback = (dt: number) => {
      recordedDelta = dt;
    };

    let rafCallback: any = null;
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallback = cb;
      return 456;
    });

    engine.registerRender(callback);

    // Kích hoạt loop lần đầu tiên để ghi nhận timestamp gốc
    if (rafCallback) {
      rafCallback(1000);
    }

    // Giả lập bước nhảy thời gian cực lớn (1000ms) để kiểm tra clamping
    if (rafCallback) {
      rafCallback(2000);
    }

    expect(recordedDelta).toBe(32); // Phải clamp ở mức 32ms

    engine.destroy();
  });
});

describe('2. CompilerStepExecutor Unit Test Suit', () => {
  test('Biên dịch AST dòng so sánh và hoán vị chính xác', () => {
    const pseudocode = `
      compare(arr[0], arr[1])
      swap(arr[0], arr[1])
    `;
    const frames = CompilerStepExecutor.compileAlgorithm(pseudocode, [10, 20]);
    expect(frames.length).toBe(2);
    expect(frames[0].lineNumber).toBe(2); // Dòng so sánh
    expect(frames[1].lineNumber).toBe(3); // Dòng hoán vị
    expect(frames[0].canvasStateSnapshot.comparingIndices).toEqual([0, 1]);
    expect(frames[1].canvasStateSnapshot.swappingIndices).toEqual([0, 1]);
    // Kiểm tra trạng thái mảng sau swap
    expect(frames[1].canvasStateSnapshot.array).toEqual([20, 10]);
  });

  test('Bỏ qua dòng trống và bình luận', () => {
    const pseudocode = `
      // Đây là bình luận
      
      compare(arr[0], arr[1])
    `;
    const frames = CompilerStepExecutor.compileAlgorithm(pseudocode, [10, 20]);
    expect(frames.length).toBe(1);
    expect(frames[0].lineNumber).toBe(4);
  });

  test('Biên dịch từ khóa loop, for, while chính xác', () => {
    const pseudocode = `
      loop i from 0
      for j from 1
      while k
    `;
    const frames = CompilerStepExecutor.compileAlgorithm(pseudocode, [10, 20, 30]);
    expect(frames.length).toBe(3);
    
    // Kiểm tra dòng 1: loop i from 0
    expect(frames[0].lineNumber).toBe(2);
    expect(frames[0].canvasStateSnapshot.loopVariables).toEqual({ i: 0 });
    expect(frames[0].canvasStateSnapshot.highlightedIndices).toEqual([0]);
    expect(frames[0].description).toContain("biến 'i'");
    
    // Kiểm tra dòng 2: for j from 1
    expect(frames[1].lineNumber).toBe(3);
    expect(frames[1].canvasStateSnapshot.loopVariables).toEqual({ j: 1 });
    expect(frames[1].canvasStateSnapshot.highlightedIndices).toEqual([1]);
    
    // Kiểm tra dòng 3: while k (không có value, mặc định 0)
    expect(frames[2].lineNumber).toBe(4);
    expect(frames[2].canvasStateSnapshot.loopVariables).toEqual({ k: 0 });
  });

  test('Biên dịch chuỗi rỗng hoặc chỉ có dòng trống', () => {
    const frames = CompilerStepExecutor.compileAlgorithm("   \n\n  // comment only ", [10, 20]);
    expect(frames.length).toBe(0);
  });
});

describe('3. Additional Edge Cases Unit Test Suit', () => {
  test('Hủy đăng ký một callback chưa từng đăng ký', () => {
    const engine = new CoreAnimationEngine();
    const mockCallback = vi.fn();
    
    // Unregister khi mảng callbacks trống
    expect(() => engine.unregisterRender(mockCallback)).not.toThrow();
    
    // Unregister callback khác khi đang chạy
    const activeCb = vi.fn();
    engine.registerRender(activeCb);
    expect(() => engine.unregisterRender(mockCallback)).not.toThrow();
    
    engine.destroy();
  });

  test('Gọi destroy nhiều lần phải an toàn không gây lỗi', () => {
    const engine = new CoreAnimationEngine();
    engine.destroy();
    expect(() => engine.destroy()).not.toThrow();
  });

  test('Lerp toán học tại các điểm biên', () => {
    expect(CoreAnimationEngine.lerp(0, 100, 0)).toBe(0);
    expect(CoreAnimationEngine.lerp(0, 100, 1)).toBe(100);
  });
});
