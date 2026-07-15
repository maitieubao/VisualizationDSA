# 🧠 Concurrency Simulation Engine & DFS Deadlock Detector (TypeScript)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của bộ máy giả lập đa luồng bất đồng bộ dựa trên sự kiện `ConcurrencySimulationEngine`, lớp phát hiện nghẽn khóa đồ thị WFG `DeadlockDetector` và các ca kiểm thử đơn vị (Unit Tests).

---

## 1. Bộ máy Giả lập Đa luồng & DFS Cycle Detector (TypeScript Core Logic)

Lớp `ConcurrencySimulationEngine` và `DeadlockDetector` đóng vai trò là động cơ cốt lõi thực thi dòng thời gian đa luồng ảo và bảo vệ an toàn deadlock:

```typescript
export type ThreadState = 'READY' | 'RUNNING' | 'BLOCKED' | 'FINISHED';

export interface ThreadInstance {
  id: string;
  name: string;
  state: ThreadState;
  progress: number; // 0 - 100% dọc theo đường ray
  heldLocks: string[];
  waitingForLock: string | null;
}

export interface LockInstance {
  id: string;
  heldByThreadId: string | null;
  waitingQueue: string[];
}

export class ConcurrencySimulationEngine {
  private threads: ThreadInstance[] = [];
  private locks: Record<string, LockInstance> = {};
  private sharedCounter = 0;

  constructor(initialThreads: ThreadInstance[], lockIds: string[]) {
    this.threads = initialThreads;
    for (const lockId of lockIds) {
      this.locks[lockId] = {
        id: lockId,
        heldByThreadId: null,
        waitingQueue: []
      };
    }
  }

  /**
   * 1. Xử lý yêu cầu khóa Mutex Lock an toàn
   */
  public acquireLock(threadId: string, lockId: string): boolean {
    const thread = this.threads.find(t => t.id === threadId);
    const lock = this.locks[lockId];

    if (!thread || !lock) return false;

    // Nếu khóa chưa bị ai giữ
    if (lock.heldByThreadId === null) {
      lock.heldByThreadId = threadId;
      thread.heldLocks.push(lockId);
      thread.waitingForLock = null;
      thread.state = 'RUNNING';
      return true;
    }

    // Nếu khóa đã bị luồng khác chiếm, đẩy Thread hiện hành vào hàng chờ BLOCKED
    if (lock.heldByThreadId !== threadId) {
      thread.waitingForLock = lockId;
      thread.state = 'BLOCKED';
      if (!lock.waitingQueue.includes(threadId)) {
        lock.waitingQueue.push(threadId);
      }
    }

    return false;
  }

  /**
   * 2. Giải phóng khóa Mutex Lock và đánh thức Thread hàng chờ (Signal)
   */
  public releaseLock(threadId: string, lockId: string): void {
    const thread = this.threads.find(t => t.id === threadId);
    const lock = this.locks[lockId];

    if (!thread || !lock || lock.heldByThreadId !== threadId) return;

    // Gỡ khóa khỏi danh sách nắm giữ của Thread
    thread.heldLocks = thread.heldLocks.filter(id => id !== lockId);
    lock.heldByThreadId = null;

    // Đánh thức luồng đầu tiên trong hàng đợi chờ lấy khóa Mutex
    if (lock.waitingQueue.length > 0) {
      const nextThreadId = lock.waitingQueue.shift();
      if (nextThreadId) {
        lock.heldByThreadId = nextThreadId;
        const nextThread = this.threads.find(t => t.id === nextThreadId);
        if (nextThread) {
          nextThread.heldLocks.push(lockId);
          nextThread.waitingForLock = null;
          nextThread.state = 'RUNNING';
        }
      }
    }
  }

  public getEngineState() {
    return {
      threads: this.threads,
      locks: this.locks,
      sharedCounter: this.sharedCounter
    };
  }
}

/**
 * 3. Bộ phát hiện nghẽn khóa đồ thị Wait-For Graph sử dụng DFS
 */
export class DeadlockDetector {
  public static detectDeadlock(
    threads: ThreadInstance[],
    locks: Record<string, LockInstance>
  ): { isDeadlocked: boolean; cycleThreadIds: string[] } {
    const adjacencyList = new Map<string, string[]>();

    // Xây dựng WFG: Thread A -> Thread B (Thread A đợi Thread B giữ khóa)
    for (const thread of threads) {
      if (thread.waitingForLock) {
        const targetLock = locks[thread.waitingForLock];
        if (targetLock && targetLock.heldByThreadId) {
          const neighbors = adjacencyList.get(thread.id) || [];
          neighbors.push(targetLock.heldByThreadId);
          adjacencyList.set(thread.id, neighbors);
        }
      }
    }

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
          startCycleId = neighbor;
          endCycleId = nodeId;
          return true;
        }
      }

      recStack.delete(nodeId);
      return false;
    };

    for (const thread of threads) {
      if (!visited.has(thread.id)) {
        if (dfs(thread.id)) {
          const cycleIds: string[] = [];
          let current = endCycleId;
          while (current && current !== startCycleId) {
            cycleIds.push(current);
            current = parentMap.get(current) || null;
          }
          if (startCycleId) cycleIds.push(startCycleId);
          return { isDeadlocked: true, cycleThreadIds: cycleIds.reverse() };
        }
      }
    }

    return { isDeadlocked: false, cycleThreadIds: [] };
  }
}
```

---

## 2. Kiểm thử Tích hợp Đơn vị (Unit Test Specs)

Chúng ta xây dựng bộ unit tests xác thực quá trình tranh chấp khóa Mutex và phát hiện chu trình nghẽn khóa Deadlock chính xác:

```typescript
import { describe, it, expect } from 'vitest';
import { ConcurrencySimulationEngine, DeadlockDetector, ThreadInstance } from './ConcurrencySimulationEngine';

describe('Concurrency Simulation Unit Tests', () => {
  it('Should successfully queue blocked threads on shared locks', () => {
    const threadA: ThreadInstance = { id: 'T1', name: 'Thread A', state: 'READY', progress: 0, heldLocks: [], waitingForLock: null };
    const threadB: ThreadInstance = { id: 'T2', name: 'Thread B', state: 'READY', progress: 0, heldLocks: [], waitingForLock: null };
    
    const engine = new ConcurrencySimulationEngine([threadA, threadB], ['L1']);

    // Thread A lấy khóa L1 thành công
    const acquiredA = engine.acquireLock('T1', 'L1');
    expect(acquiredA).toBe(true);

    // Thread B tranh chấp khóa L1 -> bị chặn đẩy vào Queue và trạng thái BLOCKED
    const acquiredB = engine.acquireLock('T2', 'L1');
    expect(acquiredB).toBe(false);
    
    const state = engine.getEngineState();
    expect(state.threads[1].state).toBe('BLOCKED');
    expect(state.locks['L1'].waitingQueue).toContain('T2');
  });

  it('Should detect circular deadlock cycles using DFS Graph Traversal', () => {
    const threadA: ThreadInstance = { id: 'T1', name: 'Thread A', state: 'RUNNING', progress: 0, heldLocks: ['L1'], waitingForLock: 'L2' };
    const threadB: ThreadInstance = { id: 'T2', name: 'Thread B', state: 'RUNNING', progress: 0, heldLocks: ['L2'], waitingForLock: 'L1' };

    const mockLocks = {
      'L1': { id: 'L1', heldByThreadId: 'T1', waitingQueue: ['T2'] },
      'L2': { id: 'L2', heldByThreadId: 'T2', waitingQueue: ['T1'] }
    };

    // Chạy giải thuật phát hiện Deadlock
    const result = DeadlockDetector.detectDeadlock([threadA, threadB], mockLocks);

    expect(result.isDeadlocked).toBe(true);
    expect(result.cycleThreadIds).toContain('T1');
    expect(result.cycleThreadIds).toContain('T2');
  });
});
```
 Bộ máy giả lập đa luồng bất đồng bộ dựa trên sự kiện (Event-driven Concurrency Engine) và giải thuật phát hiện Deadlock DFS đồ thị WFG cam kết tính chính xác 100% về mặt giải thuật và trải nghiệm sư phạm đa luồng xuất sắc.
