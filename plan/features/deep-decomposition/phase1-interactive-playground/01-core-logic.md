# 🧠 Mathematical Graph Interaction & Arrow Routing Logic (TypeScript)

Tài liệu này đặc tả chi tiết mã nguồn hiện thực hóa thuật toán hình học va chạm đỉnh, lượng giác tính điểm tiếp xúc viền ngoài đầu mũi tên và vòng lặp vật lý lực đẩy tự ổn định đồ thị viết bằng **TypeScript**.

---

## 1. Va chạm Đỉnh & Vẽ Mũi tên Sát viền (Geometry & Trigonometry Engine)

Bộ máy tương tác hình học chịu trách nhiệm nhận diện đỉnh bị click chuột và tính toán đường vẽ liên kết có hướng sắc nét:

```typescript
export interface Point {
  x: number;
  y: number;
}

export interface NodeElement {
  id: string;
  label: string;
  x: number;
  y: number;
  radius: number;
}

export interface EdgeElement {
  id: string;
  from: string;
  to: string;
  weight: number;
}

export class GraphGeometryEngine {
  /**
   * 1. Thuật toán nhận diện va chạm hình học Euclide (Hit Detection)
   * 
   * Công thức: (x - cx)^2 + (y - cy)^2 <= R^2
   */
  public static hitTestNode(mousePos: Point, nodes: NodeElement[]): NodeElement | null {
    for (const node of nodes) {
      const dx = mousePos.x - node.x;
      const dy = mousePos.y - node.y;
      const distanceSquared = dx * dx + dy * dy;
      
      if (distanceSquared <= node.radius * node.radius) {
        return node; // Trả về node bị click trúng đầu tiên
      }
    }
    return null;
  }

  /**
   * 2. Thuật toán lượng giác định vị đầu mũi tên liên kết có hướng (Arrowhead Placement)
   * 
   * Đầu mũi tên bắt buộc phải dừng lại sát viền ngoài của node đích, tránh đâm xuyên vào tâm.
   */
  public static calculateArrowheadPlacement(from: Point, to: Point, targetRadius: number): { start: Point; end: Point; angle: number } {
    // A. Tính góc chéo giữa hai điểm tâm
    const angle = Math.atan2(to.y - from.y, to.x - from.x);

    // B. Tính tọa độ tiếp xúc viền ngoài của Node đích (to)
    const endX = to.x - targetRadius * Math.cos(angle);
    const endY = to.y - targetRadius * Math.sin(angle);

    // C. Tính tọa độ tiếp xúc viền ngoài của Node nguồn (from)
    const startX = from.x + targetRadius * Math.cos(angle);
    const startY = from.y + targetRadius * Math.sin(angle);

    return {
      start: { x: startX, y: startY },
      end: { x: endX, y: endY },
      angle
    };
  }
}
```

---

## 2. Vòng lặp Mô phỏng Vật lý Đồ thị (Force-Directed Simulation Engine)

Để đồ thị tự động giàn trải khoảng cách tối ưu mà không bị chồng lấp các đỉnh lên nhau, chúng ta cài đặt công thức vật lý lực đẩy tĩnh điện và lực kéo lò xo Hooke:

```typescript
export class ForceDirectedPhysicsEngine {
  private repulsionConstant = 4000; // Hệ số lực đẩy tĩnh điện
  private springConstant = 0.05;     // Hệ số độ cứng lò xo
  private desiredSpringLength = 150; // Khoảng cách lý tưởng giữa 2 node kề
  private damping = 0.85;            // Hệ số ma sát tiêu hao năng lượng

  /**
   * Thực thi một bước mô phỏng vật lý cập nhật tọa độ cho các đỉnh đồ thị ở 60 FPS
   */
  public updatePhysicsStep(nodes: NodeElement[], edges: EdgeElement[]): void {
    const velocities = new Map<string, Point>();
    
    // Khởi tạo vận tốc ban đầu bằng 0
    nodes.forEach(node => velocities.set(node.id, { x: 0, y: 0 }));

    // 1. TÍNH LỰC ĐẨY TĨNH ĐIỆN (Repulsive Forces) - Đẩy tất cả các đỉnh xa nhau
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const nodeA = nodes[i];
        const nodeB = nodes[j];

        const dx = nodeB.x - nodeA.x;
        const dy = nodeB.y - nodeA.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1.0;

        // Công thức Coulomb: Lực đẩy tỉ lệ nghịch với khoảng cách
        const force = this.repulsionConstant / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        // Đẩy hai node ngược hướng nhau
        const velA = velocities.get(nodeA.id)!;
        const velB = velocities.get(nodeB.id)!;

        velocities.set(nodeA.id, { x: velA.x - fx, y: velA.y - fy });
        velocities.set(nodeB.id, { x: velB.x + fx, y: velB.y + fy });
      }
    }

    // 2. TÍNH LỰC KÉO LÒ XO (Attractive Forces) - Kéo các node có nối cạnh kề lại gần
    for (const edge of edges) {
      const nodeA = nodes.find(n => n.id === edge.from);
      const nodeB = nodes.find(n => n.id === edge.to);
      if (!nodeA || !nodeB) continue;

      const dx = nodeB.x - nodeA.x;
      const dy = nodeB.y - nodeA.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1.0;

      // Lực đàn hồi Hooke: Tỉ lệ với khoảng cách lệch so với chiều dài tự nhiên
      const force = this.springConstant * (dist - this.desiredSpringLength);
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      const velA = velocities.get(nodeA.id)!;
      const velB = velocities.get(nodeB.id)!;

      velocities.set(nodeA.id, { x: velA.x + fx, y: velA.y + fy });
      velocities.set(nodeB.id, { x: velB.x - fx, y: velB.y - fy });
    }

    // 3. ÁP DỤNG VẬN TỐC & HỆ SỐ MA SÁT ĐỂ CẬP NHẬT TỌA ĐỘ MỚI
    for (const node of nodes) {
      const vel = velocities.get(node.id)!;
      
      // Áp dụng ma sát để tắt dần chuyển động tránh giật lắc mãi mãi
      vel.x *= this.damping;
      vel.y *= this.damping;

      node.x += vel.x;
      node.y += vel.y;

      // Giới hạn biên màn hình Canvas không cho node trượt ra ngoài
      node.x = Math.max(node.radius, Math.min(800 - node.radius, node.x));
      node.y = Math.max(node.radius, Math.min(500 - node.radius, node.y));
    }
  }
}
```
Vòng lặp vật lý tự ổn định này mang lại trải nghiệm đồ họa đàn hồi lò xo vô cùng bắt mắt, chuyên nghiệp tiệm cận các phần mềm mô phỏng giải thuật quốc tế.
