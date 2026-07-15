import type { ThreadInstance, LockInstance, DeadlockResult } from '../types/concurrency.types';

export class ConcurrencySimulationEngine {
  private threads: ThreadInstance[];
  private locks: Record<string, LockInstance>;
  private sharedCounter: number;

  constructor(threads: ThreadInstance[], lockIds: string[], lockNames: Record<string, string> = {}) {
    this.threads = threads.map(t => ({ ...t, heldLocks: [...t.heldLocks] }));
    this.locks = {};
    this.sharedCounter = 0;

    for (const lockId of lockIds) {
      this.locks[lockId] = {
        id: lockId,
        name: lockNames[lockId] ?? lockId,
        heldByThreadId: null,
        waitingQueue: [],
      };
    }
  }

  public acquireLock(threadId: string, lockId: string): boolean {
    const thread = this.threads.find(t => t.id === threadId);
    const lock = this.locks[lockId];
    if (!thread || !lock) return false;

    if (lock.heldByThreadId === null) {
      lock.heldByThreadId = threadId;
      thread.heldLocks.push(lockId);
      thread.waitingForLock = null;
      thread.state = 'RUNNING';
      return true;
    }

    if (lock.heldByThreadId !== threadId) {
      thread.waitingForLock = lockId;
      thread.state = 'BLOCKED';
      if (!lock.waitingQueue.includes(threadId)) {
        lock.waitingQueue.push(threadId);
      }
    }

    return false;
  }

  public releaseLock(threadId: string, lockId: string): void {
    const thread = this.threads.find(t => t.id === threadId);
    const lock = this.locks[lockId];
    if (!thread || !lock || lock.heldByThreadId !== threadId) return;

    thread.heldLocks = thread.heldLocks.filter(id => id !== lockId);
    lock.heldByThreadId = null;

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

  public moveThread(threadId: string, progressDelta: number): void {
    const thread = this.threads.find(t => t.id === threadId);
    if (!thread || thread.state === 'BLOCKED' || thread.state === 'FINISHED') return;

    if (thread.state === 'READY') {
      thread.state = 'RUNNING';
    }

    thread.progress = Math.min(100, thread.progress + progressDelta);

    if (thread.progress >= 100) {
      thread.state = 'FINISHED';
    }
  }

  public incrementCounter(): void {
    this.sharedCounter += 1;
  }

  public readCounter(): number {
    return this.sharedCounter;
  }

  public resetCounter(): void {
    this.sharedCounter = 0;
  }

  public getThreads(): ThreadInstance[] {
    return this.threads;
  }

  public getLocks(): Record<string, LockInstance> {
    return this.locks;
  }

  public getSharedCounter(): number {
    return this.sharedCounter;
  }

  public getEngineState(): {
    threads: ThreadInstance[];
    locks: Record<string, LockInstance>;
    sharedCounter: number;
  } {
    return {
      threads: this.threads,
      locks: this.locks,
      sharedCounter: this.sharedCounter,
    };
  }
}

export class DeadlockDetector {
  public static detectDeadlock(
    threads: ThreadInstance[],
    locks: Record<string, LockInstance>,
  ): DeadlockResult {
    const adjacencyList = new Map<string, string[]>();

    for (const thread of threads) {
      if (thread.waitingForLock) {
        const targetLock = locks[thread.waitingForLock];
        if (targetLock && targetLock.heldByThreadId) {
          const neighbors = adjacencyList.get(thread.id) ?? [];
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

      const neighbors = adjacencyList.get(nodeId) ?? [];
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
          let current: string | null = endCycleId;
          while (current && current !== startCycleId) {
            cycleIds.push(current);
            current = parentMap.get(current) ?? null;
          }
          if (startCycleId) cycleIds.push(startCycleId);
          return { isDeadlocked: true, cycleThreadIds: cycleIds.reverse() };
        }
      }
    }

    return { isDeadlocked: false, cycleThreadIds: [] };
  }
}
