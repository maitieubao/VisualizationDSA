# 🗄️ State Management - usePlaygroundStore (Pinia Vue 3)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript bộ quản lý trạng thái **usePlaygroundStore** chịu trách nhiệm vận hành dữ liệu đồ thị vectơ, điều khiển công cụ vẽ và dọn dẹp liên kết khi xóa đỉnh.

---

## 1. Cấu trúc Mã nguồn Store (`usePlaygroundStore.ts`)

Mã nguồn được viết theo cú pháp **Setup Store** tiêu chuẩn, khai báo đầy đủ các Interface và kiểm soát tính toàn vẹn dữ liệu khi có hành vi chỉnh sửa bản vẽ đồ thị.

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';

// ==========================================
// ĐỊNH NGHĨA KIỂU DỮ LIỆU ĐỒ THỊ
// ==========================================

export interface NodeDTO {
  id: string;
  label: string;
  x: number;
  y: number;
  radius: number;
}

export interface EdgeDTO {
  id: string;
  from: string; // ID của node nguồn
  to: string;   // ID của node đích
  weight: number;
}

export type PlaygroundMode = 'SELECT' | 'ADD_NODE' | 'ADD_EDGE' | 'WEIGHT' | 'DELETE';

export const usePlaygroundStore = defineStore('playground', () => {
  // ==========================================
  // STATE (Trạng thái)
  // ==========================================
  const mode = ref<PlaygroundMode>('SELECT');
  const nodes = ref<NodeDTO[]>([]);
  const edges = ref<EdgeDTO[]>([]);
  const selectedNodeId = ref<string | null>(null);
  const selectedEdgeId = ref<string | null>(null);

  // ==========================================
  // ACTIONS (Hành động điều khiển)
  // ==========================================

  /**
   * Thay đổi chế độ công cụ vẽ hiện tại
   */
  function setMode(newMode: PlaygroundMode) {
    mode.value = newMode;
    clearSelection();
  }

  /**
   * Thêm một Đỉnh (Node) mới vào bản vẽ Canvas
   */
  function addNode(x: number, y: number) {
    // Đặt tên đỉnh theo chữ cái A, B, C... dựa trên số lượng đỉnh hiện có
    const label = String.fromCharCode(65 + (nodes.value.length % 26));
    const id = `node_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    
    nodes.value.push({
      id,
      label,
      x,
      y,
      radius: 20 // Bán kính tiêu chuẩn
    });
  }

  /**
   * Tạo liên kết Cạnh (Edge) mới nối từ đỉnh nguồn sang đỉnh đích
   */
  function addEdge(fromId: string, toId: string) {
    if (fromId === toId) return; // Tránh tự liên kết bản thân (Self-loops) ở Phase 1

    // Kiểm tra liên kết đã tồn tại hay chưa để tránh trùng lặp
    const exists = edges.value.some(
      e => (e.from === fromId && e.to === toId) || (e.from === toId && e.to === fromId)
    );

    if (!exists) {
      const id = `edge_${Date.now()}`;
      edges.value.push({
        id,
        from: fromId,
        to: toId,
        weight: 1 // Trọng số mặc định
      });
    }
  }

  /**
   * Gán trọng số mới cho cạnh chỉ định
   */
  function updateEdgeWeight(edgeId: string, newWeight: number) {
    const edge = edges.value.find(e => e.id === edgeId);
    if (edge && newWeight > 0) {
      edge.weight = newWeight;
    }
  }

  /**
   * Xóa một Đỉnh (Node) chỉ định và tự động dọn dẹp các Cạnh liên quan (Cascade Delete)
   */
  function deleteNode(nodeId: string) {
    // 1. Loại bỏ node khỏi danh sách đỉnh
    nodes.value = nodes.value.filter(n => n.id !== nodeId);

    // 2. Cascade Delete: Tự động xóa bỏ tất cả các cạnh có nối với đỉnh vừa xóa
    edges.value = edges.value.filter(e => e.from !== nodeId && e.to !== nodeId);

    if (selectedNodeId.value === nodeId) {
      selectedNodeId.value = null;
    }
  }

  /**
   * Xóa một Cạnh liên kết chỉ định
   */
  function deleteEdge(edgeId: string) {
    edges.value = edges.value.filter(e => e.id !== edgeId);
    if (selectedEdgeId.value === edgeId) {
      selectedEdgeId.value = null;
    }
  }

  /**
   * Xóa sạch toàn bộ bản vẽ Canvas
   */
  function clearAll() {
    nodes.value = [];
    edges.value = [];
    clearSelection();
  }

  /**
   * Dọn dẹp trạng thái các đối tượng đang được click chọn
   */
  function clearSelection() {
    selectedNodeId.value = null;
    selectedEdgeId.value = null;
  }

  return {
    // States
    mode,
    nodes,
    edges,
    selectedNodeId,
    selectedEdgeId,
    
    // Actions
    setMode,
    addNode,
    addEdge,
    updateEdgeWeight,
    deleteNode,
    deleteEdge,
    clearAll,
    clearSelection
  };
});
```

---

## 2. Ưu điểm của Thiết kế Cascade Delete

Bằng cách thiết lập cơ chế tự động dọn dẹp cạnh liên quan trong hàm `deleteNode`:
*   **Tránh lỗi Orphaned Edges:** Tránh tình trạng tồn tại các cạnh liên kết trơ trọi chỉ tới một đỉnh ảo không còn tồn tại trong tọa độ Canvas.
*   **Bảo toàn dữ liệu biên dịch:** Đảm bảo đồ thị xuất ra định dạng JSON adjacency list luôn hợp lệ và không gây lỗi biên dịch ở Backend API.
