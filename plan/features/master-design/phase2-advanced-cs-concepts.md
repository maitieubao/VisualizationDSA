# 🚀 Advanced CS Concepts & SOLID LCOM4 Mathematics Design (Phase 2)

Tài liệu này đặc tả chi tiết kiến trúc kỹ thuật của các phân hệ nâng cao trong **Phase 2 - Advanced CS Concepts**, tập trung sâu vào giải thuật tính toán độ kết dính lớp **LCOM4 Cohesion Calculator** để minh chứng nguyên lý Single Responsibility Principle (SRP) của SOLID.

---

## 1. Bản thiết kế Phân hệ SOLID Principles Visualizer & LCOM4 Math

Nguyên lý SRP (Single Responsibility Principle) được định lượng cụ thể bằng chỉ số LCOM4 (Lack of Cohesion in Methods). LCOM4 đo lường mức độ rời rạc của các phương thức lớp thông qua chia tách thành các đồ thị con không liên kết:

```typescript
export interface MethodNode {
  name: string;
  accessedFields: Set<string>;
}

export class SOLIDLCOM4Calculator {
  /**
   * Tính toán chỉ số LCOM4 của một Lớp đối tượng (SRP Cohesion Math)
   * Sử dụng thuật toán Tìm các thành phần liên thông của đồ thị (Disjoint Set Union or BFS)
   */
  public static calculateLCOM4(methods: MethodNode[], fieldsCount: number): number {
    if (methods.length === 0) return 0;

    const adj: Record<string, string[]> = {};
    methods.forEach(m => {
      adj[m.name] = [];
    });

    // Tạo các cạnh nối giữa 2 phương thức nếu chúng truy cập chung ít nhất một trường dữ liệu (field)
    for (let i = 0; i < methods.length; i++) {
      for (let j = i + 1; j < methods.length; j++) {
        const m1 = methods[i];
        const m2 = methods[j];
        
        // Kiểm tra tập giao các trường dữ liệu truy xuất (Intersection set)
        const commonFields = [...m1.accessedFields].filter(f => m2.accessedFields.has(f));
        if (commonFields.length > 0) {
          adj[m1.name].push(m2.name);
          adj[m2.name].push(m1.name);
        }
      }
    }

    // Đếm số thành phần liên thông đồ thị bằng duyệt BFS/DFS (Disjoint Connected Components)
    const visited: Set<string> = new Set();
    let connectedComponentsCount = 0;

    methods.forEach(m => {
      if (!visited.has(m.name)) {
        connectedComponentsCount++;
        this.bfs(m.name, adj, visited);
      }
    });

    return connectedComponentsCount;
  }

  private static bfs(start: string, adj: Record<string, string[]>, visited: Set<string>): void {
    const queue = [start];
    visited.add(start);

    while (queue.length > 0) {
      const u = queue.shift()!;
      adj[u].forEach(v => {
        if (!visited.has(v)) {
          visited.add(v);
          queue.push(v);
        }
      });
    }
  }
}
```

---

## 2. Bản thiết kế Kiến trúc Trục quan hóa Đa phân hệ Phase 2

Hệ thống Phase 2 liên kết các phân hệ thông qua Store trung tâm và bộ vẽ uốn lượn:

```
[OOP Reflection Engine] =======> (VTable & Heap Cards Allocation) =======> [Canvas WebGL/SVG]
[SOLID Cohesion LCOM4] ======> (Connected Components DFS Graph) =======> [SRP Thermal Glow UI]
[State Inspector RAM] ======> (Xếp chồng Call Stack 3D + Bezier Pointer) ===> [PointerArrowBatchRenderer]
[System Design visual] ======> (Round-Robin routing + Smoke failover) ======> [FailureSmokeEmitterEngine]
[VCR Playback Engine] ======> (rAF high-res frame snapshot caching) ====> [VCRProgressBar Scrubber]
```

### 2.1. Đồ thị Bezier Pointer Stack-to-Heap (`PointerArrowBatchRenderer`)
Mũi tên chỉ con trỏ từ ô Stack sang Node Heap được vẽ bằng thẻ SVG Bezier uốn cong nét đứt Neon sáng hổ phách Amber:
$$P(t) = (1-t)^3 P_0 + 3(1-t)^2 t P_1 + 3(1-t) t^2 P_2 + t^3 P_3$$
*   *Hành vi:* Co giãn bám bắt tọa độ hai đầu tuyệt đối khi thay đổi kích thước layout.

### 2.2. Khói bốc hạt Canvas 2D khi sập máy chủ (`FailureSmokeEmitterEngine`)
Phun luồng khí khói xám bay tản mác 60 FPS khi sập Server: update tọa độ hạt, giảm dần độ trong suốt alpha, tự động thu hồi GC tháo dỡ RAM Client-side ngay khi hạt tan biến biến mất.

---

## 3. Ca Kiểm Thử Tự Động Thuật Toán LCOM4 Cohesion (Unit Test Specs)

```typescript
import { describe, it, expect } from 'vitest';
import { SOLIDLCOM4Calculator, MethodNode } from './SOLIDLCOM4Calculator';

describe('Phase 2 SOLID Principle Cohesion Unit Tests', () => {
  it('Should correctly compute LCOM4 count = 1 for a highly cohesive Single Responsibility Class', () => {
    // 2 phương thức cùng truy xuất chung trường 'userId' -> Gắn kết cao
    const methods: MethodNode[] = [
      { name: 'getUserName', accessedFields: new Set(['userId', 'name']) },
      { name: 'updateUserProfile', accessedFields: new Set(['userId', 'email']) }
    ];

    const lcom4 = SOLIDLCOM4Calculator.calculateLCOM4(methods, 3);

    // LCOM4 = 1 chỉ ra lớp có độ gắn kết hoàn hảo, tuân thủ xuất sắc SRP
    expect(lcom4).toBe(1);
  });

  it('Should compute LCOM4 count >= 2 for disjoint classes violating SRP', () => {
    // Phương thức 1 truy cập 'dbConnection', phương thức 2 truy cập 'reportData' -> Hoàn toàn rời rạc
    const methods: MethodNode[] = [
      { name: 'connectDatabase', accessedFields: new Set(['dbConnection']) },
      { name: 'generateReportXml', accessedFields: new Set(['reportData']) }
    ];

    const lcom4 = SOLIDLCOM4Calculator.calculateLCOM4(methods, 2);

    // LCOM4 = 2 chỉ ra lớp chứa 2 trách nhiệm rời rạc, vi phạm SRP nghiêm trọng
    expect(lcom4).toBe(2);
  });
});
```
 Thiết kế giải thuật tính kết dính LCOM4 đo lường SRP, cơ cấu mũi tên con trỏ uốn Bezier SVG và máy phun khói failover Canvas 2D mang lại khả năng thấu hiểu kiến trúc phần mềm cao cấp trực quan đỉnh cao tuyệt vời nhất.
