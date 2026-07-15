# ⚙️ Technical Specification - Interactive Playground & Custom Input (Sprint 5)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của trình phân tích dữ liệu tùy biến **CustomInputParser** và bộ điều khiển tương tác tự tay click vẽ nút đồ thị **InteractivePlaygroundEngine** trong Sprint 5.

---

## 1. Trình Phân Tích Dữ Liệu Tùy Biến (CustomInputParser TypeScript)

Lớp hạt nhân chịu trách nhiệm biên dịch các chuỗi chữ do học viên nhập thành mảng số hoặc ma trận kề đồ thị hợp lệ:

```typescript
export interface ParsedGraph {
  nodes: Array<{ id: string }>;
  edges: Array<{ sourceId: string; targetId: string; weight: number }>;
}

export class CustomInputParser {
  /**
   * Phân tích chuỗi mảng tùy biến của sinh viên (ví dụ: "12, 5, 8, 20")
   */
  public static parseNumberArray(input: string): number[] {
    const cleaned = input.trim();
    if (!cleaned) return [];

    // Tách bằng dấu phẩy và làm sạch khoảng trắng
    const tokens = cleaned.split(',').map(t => t.trim());
    const result: number[] = [];

    for (const token of tokens) {
      const num = Number(token);
      if (isNaN(num)) {
        throw new Error(`Giá trị '${token}' không phải là số hợp lệ!`);
      }
      result.push(num);
    }

    if (result.length > 20) {
      throw new Error('Độ dài mảng tùy biến không được vượt quá 20 phần tử!');
    }

    return result;
  }

  /**
   * Phân tích ma trận kề đồ thị dạng chuỗi văn bản (Adjacency Matrix Text Parser)
   * Định dạng mong đợi: "A-B:10, B-C:20, A-C:50"
   */
  public static parseAdjacencyList(input: string): ParsedGraph {
    const cleaned = input.trim();
    if (!cleaned) return { nodes: [], edges: [] };

    const nodesSet = new Set<string>();
    const edges: Array<{ sourceId: string; targetId: string; weight: number }> = [];

    const tokens = cleaned.split(',').map(t => t.trim());

    for (const token of tokens) {
      // Biểu thức Regex kiểm tra định dạng "Source-Target:Weight"
      const match = token.match(/^([A-Za-z0-9]+)-([A-Za-z0-9]+):([0-9]+)$/);
      if (!match) {
        throw new Error(`Định dạng cạnh nối '${token}' không đúng! Định dạng chuẩn: Source-Target:Weight (Ví dụ: A-B:10)`);
      }

      const source = match[1];
      const target = match[2];
      const weight = Number(match[3]);

      nodesSet.add(source);
      nodesSet.add(target);
      edges.push({ sourceId: source, targetId: target, weight });
    }

    const nodes = Array.from(nodesSet).map(id => ({ id }));
    return { nodes, edges };
  }
}
```

---

## 2. Động Cơ Vẽ Đồ Thị Tương Tác (InteractivePlaygroundEngine TS)

Bộ điều khiển nhấp chuột Canvas tạo mới Vertex đồ thị và kéo liên kết Bezier cạnh nối:

```typescript
export interface Vertex {
  id: string;
  x: number;
  y: number;
}

export class InteractivePlaygroundEngine {
  private vertices: Vertex[] = [];
  private selectedVertexId: string | null = null;
  private onStateChange: (vertices: Vertex[]) => void;

  constructor(onStateChange: (vertices: Vertex[]) => void) {
    this.onStateChange = onStateChange;
  }

  /**
   * Tạo Vertex đồ thị mới khi nhấp đúp chuột lên tọa độ Canvas (Double Click)
   */
  public handleDoubleClick(x: number, y: number): void {
    // Tạo ID tự động bằng chữ cái: A, B, C, D...
    const nextId = String.fromCharCode(65 + this.vertices.length); // A = ASCII 65
    
    // Kiểm tra va chạm khoảng cách tránh nút đè khít lên nhau
    const isOverlap = this.vertices.some(v => {
      const dist = Math.hypot(v.x - x, v.y - y);
      return dist < 50; // Bán kính va chạm 50px
    });

    if (isOverlap) return;

    this.vertices.push({ id: nextId, x, y });
    this.onStateChange([...this.vertices]);
  }

  public selectVertex(id: string): void {
    this.selectedVertexId = id;
  }

  public getSelectedVertexId(): string | null {
    return this.selectedVertexId;
  }

  public clear(): void {
    this.vertices = [];
    this.selectedVertexId = null;
    this.onStateChange([]);
  }
}
```

---

## 3. Ca Kiểm Thử Tự Động Phân Tích & Vẽ Nút (Unit Test Specs)

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CustomInputParser, InteractivePlaygroundEngine } from './CustomInputParser';

describe('Sprint 5 Custom Input & Playground Unit Tests', () => {
  it('Should successfully parse numbers list string and reject invalid characters', () => {
    const input = '5, 8, 12, 20';
    const arr = CustomInputParser.parseNumberArray(input);

    expect(arr).toEqual([5, 8, 12, 20]);

    // Nhập chữ cái -> Bắt buộc ném ra ngoại lệ báo lỗi
    expect(() => {
      CustomInputParser.parseNumberArray('5, abc, 12');
    }).toThrowError("Giá trị 'abc' không phải là số hợp lệ!");
  });

  it('Should successfully parse graph adjacency list formatting text', () => {
    const input = 'A-B:10, B-C:20';
    const graph = CustomInputParser.parseAdjacencyList(input);

    expect(graph.nodes.length).toBe(3);
    expect(graph.nodes.map(n => n.id)).toContain('A');
    expect(graph.edges[0]).toEqual({ sourceId: 'A', targetId: 'B', weight: 10 });

    // Sai định dạng -> Ném lỗi cảnh báo
    expect(() => {
      CustomInputParser.parseAdjacencyList('A-B=10');
    }).toThrow();
  });

  it('Should add vertices on canvas click avoiding vertex overlapping bounds', () => {
    const mockCallback = vi.fn();
    const engine = new InteractivePlaygroundEngine(mockCallback);

    // Click nút thứ nhất tại (100, 100) -> Thêm thành công nút 'A'
    engine.handleDoubleClick(100, 100);
    expect(mockCallback).toHaveBeenCalledTimes(1);

    // Click nút thứ hai đè sát (110, 110) -> Bị chặn va chạm overlap -> Không thêm nút 'B'
    engine.handleDoubleClick(110, 110);
    expect(mockCallback).toHaveBeenCalledTimes(1); // Số lần gọi không tăng
  });
});
```
 Thiết kế bộ giải mã phân tích mảng tùy biến và ma trận kề đồ thị chặt chẽ kết hợp bộ chặn va chạm chồng đè nút Canvas tương tác 60 FPS đảm bảo sinh viên thỏa sức sáng tạo mạng lưới tự vẽ trực quan học tập.
