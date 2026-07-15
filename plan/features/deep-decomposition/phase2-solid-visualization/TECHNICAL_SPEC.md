# 🛠 Technical Specification - SOLID Evaluator Engine & Thermal Spark Canvas

Tài liệu này đặc tả chi tiết kiến trúc kỹ thuật của bộ máy chấm điểm đo lường thiết kế **SOLIDEvaluatorEngine**, giải thuật tính toán độ gắn kết LCOM (Lack of Cohesion in Methods) phục vụ SRP, thuật toán rạn nứt laser LSP và công thức tọa độ hạt tia lửa Canvas 2D.

---

## 1. Trình chấm điểm Nguyên lý SRP bằng LCOM Cohesion (LCOM Calculator)

Để đo đạc mức độ vi phạm Single Responsibility khoa học, hệ thống lập trình giải thuật Lack of Cohesion in Methods (LCOM4). Nếu LCOM4 $\ge 2$, lớp đó chính thức bị chia cắt thành các vùng nhiệm vụ không tương tác nhau (Vi phạm SRP):

```typescript
export interface UMLClassMember {
  name: string;
  type: 'FIELD' | 'METHOD';
  accessedFields: string[]; // Các thuộc tính mà phương thức này đọc/ghi
}

export class LCOMCalculator {
  /**
   * Tính toán chỉ số LCOM4 (Lack of Cohesion in Methods)
   * LCOM4 đếm số lượng các thành phần liên thông (Connected Components) trong đồ thị phương thức-thuộc tính.
   * Nếu LCOM4 = 1: Lớp gắn kết hoàn hảo (SRP ĐẠT)
   * Nếu LCOM4 >= 2: Lớp có các nhóm phương thức độc lập không liên quan thuộc tính của nhau (SRP VI PHẠM!)
   */
  public static calculateLCOM4(members: UMLClassMember[]): number {
    const methods = members.filter(m => m.type === 'METHOD');
    const fields = members.filter(m => m.type === 'FIELD');
    
    // Xây dựng đồ thị liên kết
    const adjList: Map<string, string[]> = new Map();
    methods.forEach(m => adjList.set(m.name, []));

    // Nối các phương thức dùng chung thuộc tính (Shared attributes connectivity)
    for (let i = 0; i < methods.length; i++) {
      for (let j = i + 1; j < methods.length; j++) {
        const m1 = methods[i];
        const m2 = methods[j];
        
        // Kiểm tra xem 2 phương thức có dùng chung ít nhất 1 thuộc tính field nào không
        const hasSharedField = m1.accessedFields.some(f => m2.accessedFields.includes(f));
        if (hasSharedField) {
          adjList.get(m1.name)!.push(m2.name);
          adjList.get(m2.name)!.push(m1.name);
        }
      }
    }

    // Đếm số lượng thành phần liên thông bằng thuật toán duyệt BFS/DFS
    const visited = new Set<string>();
    let connectedComponentsCount = 0;

    methods.forEach(m => {
      if (!visited.has(m.name)) {
        connectedComponentsCount++;
        this.dfs(m.name, adjList, visited);
      }
    });

    return connectedComponentsCount;
  }

  private static dfs(node: string, adjList: Map<string, string[]>, visited: Set<string>): void {
    visited.add(node);
    const neighbors = adjList.get(node) || [];
    neighbors.forEach(neighbor => {
      if (!visited.has(neighbor)) {
        this.dfs(neighbor, adjList, visited);
      }
    });
  }
}
```

---

## 2. Giải thuật nứt vỡ rạn nứt Laser LSP (SVG Laser Fracture Math)

Khi con trỏ lớp con ném lỗi `NotImplementedException` (vi phạm LSP), tia laser SVG kết nối giữa hàm gọi và đối tượng bị rạn nứt.
*   **Vector dẫn Laser chính:** Nối từ điểm gọi `A` đến điểm đích `B`.
*   **Thuật toán sinh vết nứt rạn rách rưới (SVG Fracture Overlay):**
    *   Tự động sinh ra 10 - 15 mảnh răng cưa ngẫu nhiên chạy dọc theo đường thẳng nối $AB$.
    *   Sử dụng công thức dịch dịch offset vuông góc với đường nối để tạo răng cưa ziczac kính nứt:
        $$x_{\text{fracture}} = x_{\text{mid}} + \text{random}(-12, 12) \times \sin(\theta)$$
        $$y_{\text{fracture}} = y_{\text{mid}} + \text{random}(-12, 12) \times \cos(\theta)$$
    *   Các đoạn nứt phát sáng đỏ rực, sau đó vỡ đôi làm đường laser chính đứt đôi rơi xuống.

---

## 3. Hệ thống hạt Canvas Hạt Lửa Nhiệt lượng (Thermal Spark Particle Math)

Hạt lửa bùng cháy phía sau thẻ lớp SRP vi phạm có tọa độ tính theo công thức vật lý giả lập:
*   **Gia tốc bay hướng lên:** $V_y = V_{y0} - a \times t$ (Với $a > 0$ là lực nổi nhiệt lượng).
*   **Lực cản gió hỗn loạn:** $x_{\text{particle}} = x_0 + \sin(t \times \text{freq}) \times \text{amplitude}$.
*   **Màu hạt:** HSL tailored color palette: `hsl(random(0, 30), 100%, 50%)` (Đỏ sang Cam Neon phát sáng rực rỡ).
