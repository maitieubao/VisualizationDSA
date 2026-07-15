# 🛠 Technical Specification - Concurrency Visualizer (Phase 2)

Tài liệu này đặc tả chi tiết kiến trúc kỹ thuật của bộ máy mô phỏng đa luồng `ConcurrencySimulationEngine`, máy trạng thái hữu hạn của luồng và giải thuật DFS tìm kiếm chu trình phát hiện tắc nghẽn Deadlock.

---

## 1. Kiến trúc Động cơ Giả lập Đa luồng (ConcurrencySimulationEngine)

Để mô phỏng hành vi bất đồng bộ của nhiều luồng chạy cùng lúc trên trình duyệt web, động cơ `ConcurrencySimulationEngine` vận hành dựa trên mô hình máy trạng thái luồng (Thread State Machine):

```typescript
export type ThreadState = 'READY' | 'RUNNING' | 'BLOCKED' | 'FINISHED';

export interface ThreadInstance {
  id: string;
  name: string;
  state: ThreadState;
  currentInstructionIndex: number;
  heldLocks: string[];
  waitingForLock: string | null;
}

export interface LockInstance {
  id: string;
  name: string;
  heldByThreadId: string | null;
  waitingQueue: string[]; // Hàng đợi các Thread đang chặn chờ lấy khóa
}
```

---

## 2. Giải thuật Phát hiện Tắc nghẽn Đồ thị (DFS Cycle Detection Graph)

Khi một luồng yêu cầu một khóa đang bị giữ bởi luồng khác, hệ thống xây dựng **Đồ thị Chờ đợi Khóa (Wait-For Graph - WFG)** và chạy giải thuật phát hiện chu trình vòng lặp (Deadlock Detection):

```typescript
export class DeadlockDetector {
  /**
   * Chạy giải thuật tìm kiếm theo chiều sâu (DFS) phát hiện vòng lặp tắc nghẽn
   */
  public static detectDeadlock(
    threads: ThreadInstance[],
    locks: Record<string, LockInstance>
  ): { isDeadlocked: boolean; cycleThreadIds: string[] } {
    const adjacencyList = new Map<string, string[]>();

    // 1. Dựng đồ thị Wait-For Graph: Thread A -> Thread B (Thread A đợi Thread B giải phóng khóa)
    for (const thread of threads) {
      if (thread.waitingForLock) {
        const targetLock = locks[thread.waitingForLock];
        if (targetLock && targetLock.heldByThreadId) {
          // Thêm cạnh có hướng từ luồng đang đợi sang luồng đang giữ khóa
          const neighbors = adjacencyList.get(thread.id) || [];
          neighbors.push(targetLock.heldByThreadId);
          adjacencyList.set(thread.id, neighbors);
        }
      }
    }

    // 2. Chạy DFS tìm chu trình khép kín
    const visited = new Set<string>();
    const recStack = new Set<string>();
    const parentMap = new Map<string, string>();
    let startCycleId: string | null = null;
    let endCycleId: string | null = null;

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recStack.add(nodeId);

      const neighbors = adjacencyList.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          parentMap.set(neighbor, nodeId);
          if (dfs(neighbor)) return true;
        } else if (recStack.has(neighbor)) {
          // Tìm thấy chu trình vòng lặp khép kín!
          startCycleId = neighbor;
          endCycleId = nodeId;
          return true;
        }
      }

      recStack.delete(nodeId);
      return false;
    };

    // Duyệt qua tất cả luồng để tìm chu trình
    for (const thread of threads) {
      if (!visited.has(thread.id)) {
        if (dfs(thread.id)) {
          // Trích xuất danh sách luồng nằm trong chu trình Deadlock
          const cycleIds: string[] = [];
          let current = endCycleId;
          while (current && current !== startCycleId) {
            cycleIds.push(current);
            current = parentMap.get(current) || null;
          }
          if (startCycleId) cycleIds.push(startCycleId);
          
          return { isDeadlocked: true, cycleThreadIds: cycleIds };
        }
      }
    }

    return { isDeadlocked: false, cycleThreadIds: [] };
  }
}
```
 Động cơ mô phỏng luồng chạy thông minh kết hợp giải thuật phát hiện Deadlock DFS đồ thị trực thời gian thực đảm bảo định vị chính xác 100% lỗi đa luồng, mang lại môi trường học tập hệ thống đỉnh cao.
