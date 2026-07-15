# 🧠 Call Stack Engine & Recursion Tree Generator (TypeScript)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của trình quản lý ngăn xếp `StateInspectorEngine`, hạt nhân dựng cây đệ quy `RecursionTreeGenerator` và các ca kiểm thử tự động (Unit Tests) bảo đảm tính chính xác.

---

## 1. Trình Quản lý Ngăn xếp & Cây Đệ quy (TypeScript Core Logic)

Mã nguồn lõi được thiết lập bằng TypeScript chặt chẽ, tối ưu hóa lưu trữ RAM ảo:

```typescript
export interface StackFrame {
  frameId: string;
  functionName: string;
  lineNumber: number;
  localVariables: Record<string, { value: any; heapAddress?: string }>;
  isActive: boolean;
}

export interface RecursionNode {
  nodeId: string;
  label: string;
  depth: number;
  returnValue?: any;
  status: 'ACTIVE' | 'RESOLVED' | 'PENDING';
  children: RecursionNode[];
}

export class StateInspectorEngine {
  private stack: StackFrame[] = [];
  private activeFrameIndex = -1;

  public pushFrame(frame: StackFrame): void {
    this.stack.forEach(f => f.isActive = false);
    frame.isActive = true;
    this.stack.push(frame);
    this.activeFrameIndex = this.stack.length - 1;
  }

  public popFrame(): StackFrame | null {
    if (this.stack.length === 0) return null;
    const popped = this.stack.pop()!;
    this.activeFrameIndex = this.stack.length - 1;
    if (this.activeFrameIndex >= 0) {
      this.stack[this.activeFrameIndex].isActive = true;
    }
    return popped;
  }

  public getStack(): StackFrame[] {
    return this.stack;
  }

  public switchActiveFrame(index: number): StackFrame | null {
    if (index < 0 || index >= this.stack.length) return null;
    this.stack.forEach(f => f.isActive = false);
    this.stack[index].isActive = true;
    this.activeFrameIndex = index;
    return this.stack[index];
  }

  public clear(): void {
    this.stack = [];
    this.activeFrameIndex = -1;
  }
}

export class RecursionTreeGenerator {
  /**
   * Tính toán tọa độ phân bổ tầng tự động dựng Cây đệ quy SVG co giãn
   * @param root Node gốc cây đệ quy
   * @param canvasWidth Chiều rộng tối đa khả dụng
   * @returns Mảng phẳng chứa node và tọa độ (x, y) phục vụ render SVG
   */
  public static calculateCoordinates(
    root: RecursionNode,
    canvasWidth: number
  ): Array<{ nodeId: string; label: string; x: number; y: number; status: string; parentId: string | null }> {
    const result: Array<{ nodeId: string; label: string; x: number; y: number; status: string; parentId: string | null }> = [];
    
    const traverse = (
      node: RecursionNode, 
      x: number, 
      width: number, 
      parentId: string | null
    ) => {
      const y = node.depth * 80 + 40; // Chiều sâu tính theo tầng 80px
      
      result.push({
        nodeId: node.nodeId,
        label: node.label,
        x,
        y,
        status: node.status,
        parentId
      });

      if (node.children.length === 0) return;

      const subWidth = width / node.children.length;
      const startX = x - width / 2 + subWidth / 2;

      node.children.forEach((child, index) => {
        const childX = startX + index * subWidth;
        traverse(child, childX, subWidth, node.nodeId);
      });
    };

    traverse(root, canvasWidth / 2, canvasWidth / 2, null);
    return result;
  }
}
```

---

## 2. Kiểm thử Tích hợp Đơn vị (Unit Test Specs)

Chúng ta xây dựng bộ unit tests xác thực ngăn xếp Call Stack push/pop và tọa độ cây đệ quy SVG:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { StateInspectorEngine, RecursionTreeGenerator, StackFrame, RecursionNode } from './StateInspectorEngine';

describe('State Inspector & Recursion Tree Unit Tests', () => {
  let engine: StateInspectorEngine;

  beforeEach(() => {
    engine = new StateInspectorEngine();
  });

  it('Should correctly push and pop stack frames with active states', () => {
    const frame1: StackFrame = {
      frameId: 'fib-3-frame',
      functionName: 'fib(3)',
      lineNumber: 12,
      localVariables: { n: { value: 3 } },
      isActive: false
    };

    const frame2: StackFrame = {
      frameId: 'fib-2-frame',
      functionName: 'fib(2)',
      lineNumber: 14,
      localVariables: { n: { value: 2 } },
      isActive: false
    };

    // Push frame 1 -> Phải active
    engine.pushFrame(frame1);
    expect(engine.getStack().length).toBe(1);
    expect(engine.getStack()[0].isActive).toBe(true);

    // Push frame 2 -> Frame 2 active, frame 1 de-active
    engine.pushFrame(frame2);
    expect(engine.getStack().length).toBe(2);
    expect(engine.getStack()[0].isActive).toBe(false);
    expect(engine.getStack()[1].isActive).toBe(true);

    // Pop frame -> Frame 2 ra ngoài, frame 1 khôi phục active
    const popped = engine.popFrame();
    expect(popped?.frameId).toBe('fib-2-frame');
    expect(engine.getStack().length).toBe(1);
    expect(engine.getStack()[0].isActive).toBe(true);
  });

  it('Should distribute layered coordinates for binary recursion tree correctly without overlaps', () => {
    // Dựng cây đệ quy fib(2) -> children: fib(1), fib(0)
    const mockTree: RecursionNode = {
      nodeId: 'root-fib-2',
      label: 'fib(2)',
      depth: 0,
      status: 'RESOLVED',
      children: [
        { nodeId: 'child-fib-1', label: 'fib(1)', depth: 1, status: 'RESOLVED', children: [] },
        { nodeId: 'child-fib-0', label: 'fib(0)', depth: 1, status: 'RESOLVED', children: [] }
      ]
    };

    const coords = RecursionTreeGenerator.calculateCoordinates(mockTree, 800);

    expect(coords.length).toBe(3);
    // Node gốc ở giữa trục X
    expect(coords[0].x).toBe(400);
    expect(coords[0].y).toBe(40);

    // Lớp con ở tầng 1 (Y = 120) và phân bố đều sang 2 bên
    expect(coords[1].y).toBe(120);
    expect(coords[2].y).toBe(120);
    expect(coords[1].x).toBeLessThan(400); // Trái
    expect(coords[2].x).toBeGreaterThan(400); // Phải
  });
});
```
 Bộ động cơ StateInspectorEngine quản lý Call Stack RAM ảo và công thức phân phối cây đệ quy kết hợp unit tests chặt chẽ giúp toàn bộ phân hệ vận hành vô cùng nhạy bén, chính xác tuyệt đối.
