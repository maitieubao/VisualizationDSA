# 🛠 Technical Specification - State Inspector & Dynamic Pointer Lines

Tài liệu này đặc tả chi tiết kiến trúc hạt nhân của bộ theo dõi ngăn xếp xếp chồng **StateInspectorEngine**, giải thuật tính toán tọa độ động DOM vẽ mũi tên Cubic Bezier uốn lượn SVG Pointer và thuật toán dựng cây đệ quy tự co giãn.

---

## 1. Trình Quản lý Call Stack Ngăn xếp (StateInspectorEngine)

Hạt nhân theo dõi Call Stack được thiết lập bằng TypeScript chặt chẽ, tối ưu hóa lưu trữ RAM ảo:

```typescript
export interface StackFrame {
  frameId: string;
  functionName: string;
  lineNumber: number;
  localVariables: Record<string, { value: any; heapAddress?: string }>;
  isActive: boolean;
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
```

---

## 2. Giải thuật Tính tọa độ động Mũi tên Pointer SVG (Dynamic Bezier Math)

Để vẽ đường nối từ một ô biến số trong danh sách biến số ngăn xếp (DOM Element A) sang một ô nhớ của đối tượng tương ứng trên Canvas Heap ảo (DOM Element B):
*   **Bước 1: Bắt bounding box thời gian thực:**
    ```typescript
    const rectA = elementA.getBoundingClientRect();
    const rectB = elementB.getBoundingClientRect();
    ```
*   **Bước 2: Xác định điểm bắt đầu và kết thúc nguồn-đích:**
    *   Điểm đầu $P_0 = (rectA.right, rectA.top + rectA.height / 2)$
    *   Điểm cuối $P_3 = (rectB.left, rectB.top + rectB.height / 2)$
*   **Bước 3: Tính toán 2 điểm kiểm soát Bezier (Control Points) tạo đường cong lượn uốn khúc:**
    *   Điểm kiểm soát $P_1 = (P_{0x} + \Delta x \times 0.4, P_{0y})$
    *   Điểm kiểm soát $P_2 = (P_{3x} - \Delta x \times 0.4, P_{3y})$
    *   *Với $\Delta x = \max(|P_{3x} - P_{0x}|, 40)$*
*   **Bước 4: Sinh mã Path SVG uốn lượn:**
    $$\text{d} = \text{`M } P_{0x} \text{ } P_{0y} \text{ C } P_{1x} \text{ } P_{1y} \text{, } P_{2x} \text{ } P_{2y} \text{, } P_{3x} \text{ } P_{3y}\text{`}$$
*   **Bước 5: Thêm hiệu ứng trượt neon:** Thiết lập nét đứt `stroke-dasharray="10, 15"` kết hợp keyframe trượt âm bản.

---

## 3. Thuật toán Dựng Cây Đệ quy Động (RecursionTreeGenerator)

Để tự động sắp xếp cây đệ quy mà không chồng chéo nút:
*   **Phân phối Tọa độ Tầng (Layered Coordinate Distribution):**
    *   Trục $Y$ của mỗi node cây đệ quy tính theo chiều sâu: $Y_{\text{node}} = \text{depth} \times 80\text{px}$.
    *   Trục $X$ của mỗi node được phân phối đều trong khoảng không gian khả dụng của nút cha chia đôi (Binary Tree Subdivision coordinate math):
        $$X_{\text{left}} = X_{\text{parent}} - \frac{\text{width}}{\text{depth} \times 2}$$
        $$X_{\text{right}} = X_{\text{parent}} + \frac{\text{width}}{\text{depth} \times 2}$$
