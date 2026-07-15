# 📚 Core DSA Library Visualizer & Tree/Graph Rotation Math (Phase 1)

Tài liệu này đặc tả chi tiết thiết kế thư viện thuật toán nền tảng **Core DSA Library**, giải thuật xoay cây nhị phân cân bằng (AVL, Red-Black Tree) và thuật toán vẽ đồ thị tìm đường đi ngắn nhất (Dijkstra, A*).

---

## 1. Phân phối Tọa độ và Xoay Cây AVL Tự Cân bằng (Tree Rotations Spec)

Để vẽ cây nhị phân mượt mà không bị các nút đè lên nhau, hệ thống sử dụng thuật toán phân bổ tọa độ tầng kết hợp hoạt ảnh Lerp uốn lượn khi xoay cây:

```typescript
export interface TreeNode {
  value: number;
  height: number;
  left: TreeNode | null;
  right: TreeNode | null;
  x: number;
  y: number;
}

export class AVLTreeVisualizer {
  /**
   * Xoay Trái Cây AVL (Left Rotation Math)
   */
  public static rotateLeft(y: TreeNode): TreeNode {
    const x = y.right!;
    const T2 = x.left;

    // Thực hiện xoay
    x.left = y;
    y.right = T2;

    // Cập nhật lại chiều cao của nút cây dưới RAM
    y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;
    x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;

    return x;
  }

  /**
   * Xoay Phải Cây AVL (Right Rotation Math)
   */
  public static rotateRight(y: TreeNode): TreeNode {
    const x = y.left!;
    const T2 = x.right;

    // Thực hiện xoay
    x.right = y;
    y.left = T2;

    // Cập nhật lại chiều cao
    y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;
    x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;

    return x;
  }

  private static getHeight(node: TreeNode | null): number {
    return node ? node.height : 0;
  }

  /**
   * Phân bổ tọa độ tầng tự co giãn cho các nút cây
   */
  public static calculateCoordinates(
    node: TreeNode | null,
    x: number,
    y: number,
    hSpacing: number
  ): void {
    if (!node) return;

    node.x = x;
    node.y = y;

    // Con trái rẽ trái bằng hSpacing chia đôi, con phải rẽ phải
    this.calculateCoordinates(node.left, x - hSpacing, y + 80, hSpacing / 2);
    this.calculateCoordinates(node.right, x + hSpacing, y + 80, hSpacing / 2);
  }
}
```

---

## 2. Tìm Đường Đồ Thị Dijkstra & Vẽ Luồng Hạt Neon (Graph Layout Math)

Khi chạy giải thuật Dijkstra tìm đường đi ngắn nhất, hệ thống tự động bắn hạt Neon sáng xanh Cyan chạy dọc theo các cạnh nối trôi nổi biểu thị truyền tải tin:

```typescript
export interface GraphNode {
  id: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  sourceId: string;
  targetId: string;
  weight: number;
}

export class DijkstraVisualizer {
  /**
   * Giải thuật Dijkstra giải tìm đường đi ngắn nhất
   */
  public static solveDijkstra(
    nodes: GraphNode[],
    edges: GraphEdge[],
    startId: string
  ): Record<string, { distance: number; parentId: string | null }> {
    const dist: Record<string, number> = {};
    const parent: Record<string, string | null> = {};
    const visited: Set<string> = new Set();

    nodes.forEach(n => {
      dist[n.id] = Infinity;
      parent[n.id] = null;
    });
    dist[startId] = 0;

    while (visited.size < nodes.length) {
      // Tìm node có khoảng cách nhỏ nhất chưa duyệt
      let u: string | null = null;
      let minDist = Infinity;

      nodes.forEach(n => {
        if (!visited.has(n.id) && dist[n.id] < minDist) {
          minDist = dist[n.id];
          u = n.id;
        }
      });

      if (u === null) break;
      visited.add(u);

      // Cập nhật khoảng cách các node láng giềng kề
      const neighbors = edges.filter(e => e.sourceId === u);
      neighbors.forEach(edge => {
        const v = edge.targetId;
        const alt = dist[u!] + edge.weight;
        if (alt < dist[v]) {
          dist[v] = alt;
          parent[v] = u;
        }
      });
    }

    const result: Record<string, { distance: number; parentId: string | null }> = {};
    nodes.forEach(n => {
      result[n.id] = { distance: dist[n.id], parentId: parent[n.id] };
    });

    return result;
  }
}
```

---

## 3. Ca Kiểm Thử Tự Động Thư Viện Thuật Toán (Unit Test Specs)

```typescript
import { describe, it, expect } from 'vitest';
import { AVLTreeVisualizer, TreeNode, DijkstraVisualizer, GraphNode, GraphEdge } from './AVLTreeVisualizer';

describe('Phase 1 DSA Library Unit Tests', () => {
  it('Should successfully balance tree nodes using Left-Right Rotations', () => {
    // Dựng cây bị lệch phải: 1 -> 2 -> 3
    const node3: TreeNode = { value: 3, height: 1, left: null, right: null, x: 0, y: 0 };
    const node2: TreeNode = { value: 2, height: 2, left: null, right: node3, x: 0, y: 0 };
    const node1: TreeNode = { value: 1, height: 3, left: null, right: node2, x: 0, y: 0 };

    // Xoay trái để cân bằng cây
    const newRoot = AVLTreeVisualizer.rotateLeft(node1);

    expect(newRoot.value).toBe(2);
    expect(newRoot.left?.value).toBe(1);
    expect(newRoot.right?.value).toBe(3);
  });

  it('Should resolve shortest path matrix accurately using Dijkstra algorithm solver', () => {
    const nodes: GraphNode[] = [
      { id: 'A', x: 0, y: 0 },
      { id: 'B', x: 100, y: 0 },
      { id: 'C', x: 200, y: 0 }
    ];

    const edges: GraphEdge[] = [
      { sourceId: 'A', targetId: 'B', weight: 10 },
      { sourceId: 'B', targetId: 'C', weight: 20 },
      { sourceId: 'A', targetId: 'C', weight: 50 }
    ];

    const dists = DijkstraVisualizer.solveDijkstra(nodes, edges, 'A');

    // Đường đi ngắn nhất A -> C qua B tốn: 10 + 20 = 30 (Nhỏ hơn đi trực tiếp A -> C tốn 50)
    expect(dists['C'].distance).toBe(30);
    expect(dists['C'].parentId).toBe('B');
  });
});
```
 Thiết kế giải thuật phân phối tọa độ tầng xoay cây AVL mượt mà Lerp và bộ giải ma trận tìm đường Dijkstra đồ thị Neon đảm bảo chất lượng giảng dạy DSA trực quan luôn đạt hiệu suất đỉnh cao hàng đầu, khoa học tối ưu.
