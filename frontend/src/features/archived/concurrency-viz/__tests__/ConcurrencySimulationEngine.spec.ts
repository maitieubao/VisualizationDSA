import { describe, it, expect } from 'vitest';
import { ConcurrencySimulationEngine, DeadlockDetector } from '../engine/ConcurrencySimulationEngine';
import type { ThreadInstance, LockInstance } from '../types/concurrency.types';

function makeThread(id: string, overrides: Partial<ThreadInstance> = {}): ThreadInstance {
  return {
    id,
    name: `Thread ${id}`,
    state: 'READY',
    progress: 0,
    heldLocks: [],
    waitingForLock: null,
    ...overrides,
  };
}

describe('ConcurrencySimulationEngine', () => {
  it('should initialize threads and locks', () => {
    const engine = new ConcurrencySimulationEngine(
      [makeThread('T1'), makeThread('T2')],
      ['L1'],
    );
    const state = engine.getEngineState();
    expect(state.threads).toHaveLength(2);
    expect(state.locks['L1']).toBeDefined();
    expect(state.locks['L1'].heldByThreadId).toBeNull();
    expect(state.sharedCounter).toBe(0);
  });

  it('should acquire lock successfully when free', () => {
    const engine = new ConcurrencySimulationEngine(
      [makeThread('T1'), makeThread('T2')],
      ['L1'],
    );
    const acquired = engine.acquireLock('T1', 'L1');
    expect(acquired).toBe(true);

    const state = engine.getEngineState();
    expect(state.locks['L1'].heldByThreadId).toBe('T1');
    expect(state.threads[0].heldLocks).toContain('L1');
    expect(state.threads[0].state).toBe('RUNNING');
  });

  it('should block thread when lock is held by another', () => {
    const engine = new ConcurrencySimulationEngine(
      [makeThread('T1'), makeThread('T2')],
      ['L1'],
    );
    engine.acquireLock('T1', 'L1');
    const acquired = engine.acquireLock('T2', 'L1');
    expect(acquired).toBe(false);

    const state = engine.getEngineState();
    expect(state.threads[1].state).toBe('BLOCKED');
    expect(state.threads[1].waitingForLock).toBe('L1');
    expect(state.locks['L1'].waitingQueue).toContain('T2');
  });

  it('should release lock and wake up waiting thread', () => {
    const engine = new ConcurrencySimulationEngine(
      [makeThread('T1'), makeThread('T2')],
      ['L1'],
    );
    engine.acquireLock('T1', 'L1');
    engine.acquireLock('T2', 'L1');

    engine.releaseLock('T1', 'L1');

    const state = engine.getEngineState();
    expect(state.locks['L1'].heldByThreadId).toBe('T2');
    expect(state.threads[1].state).toBe('RUNNING');
    expect(state.threads[1].heldLocks).toContain('L1');
    expect(state.threads[0].heldLocks).not.toContain('L1');
  });

  it('should move thread progress', () => {
    const engine = new ConcurrencySimulationEngine(
      [makeThread('T1')],
      [],
    );
    engine.moveThread('T1', 50);
    expect(engine.getThreads()[0].progress).toBe(50);
    expect(engine.getThreads()[0].state).toBe('RUNNING');
  });

  it('should finish thread at 100% progress', () => {
    const engine = new ConcurrencySimulationEngine(
      [makeThread('T1')],
      [],
    );
    engine.moveThread('T1', 100);
    expect(engine.getThreads()[0].progress).toBe(100);
    expect(engine.getThreads()[0].state).toBe('FINISHED');
  });

  it('should not move blocked thread', () => {
    const engine = new ConcurrencySimulationEngine(
      [makeThread('T1'), makeThread('T2')],
      ['L1'],
    );
    engine.acquireLock('T1', 'L1');
    engine.acquireLock('T2', 'L1');
    engine.moveThread('T2', 50);
    expect(engine.getThreads()[1].progress).toBe(0);
  });

  it('should increment and read shared counter', () => {
    const engine = new ConcurrencySimulationEngine([], []);
    expect(engine.readCounter()).toBe(0);
    engine.incrementCounter();
    engine.incrementCounter();
    expect(engine.readCounter()).toBe(2);
    expect(engine.getSharedCounter()).toBe(2);
  });

  it('should clamp progress at 100', () => {
    const engine = new ConcurrencySimulationEngine(
      [makeThread('T1')],
      [],
    );
    engine.moveThread('T1', 60);
    engine.moveThread('T1', 60);
    expect(engine.getThreads()[0].progress).toBe(100);
  });

  it('should not release lock held by different thread', () => {
    const engine = new ConcurrencySimulationEngine(
      [makeThread('T1'), makeThread('T2')],
      ['L1'],
    );
    engine.acquireLock('T1', 'L1');
    engine.releaseLock('T2', 'L1');
    expect(engine.getLocks()['L1'].heldByThreadId).toBe('T1');
  });
});

describe('DeadlockDetector', () => {
  it('should detect no deadlock when no waiting threads', () => {
    const threads: ThreadInstance[] = [
      makeThread('T1', { state: 'RUNNING', heldLocks: ['L1'] }),
      makeThread('T2', { state: 'RUNNING' }),
    ];
    const locks: Record<string, LockInstance> = {
      L1: { id: 'L1', name: 'L1', heldByThreadId: 'T1', waitingQueue: [] },
    };
    const result = DeadlockDetector.detectDeadlock(threads, locks);
    expect(result.isDeadlocked).toBe(false);
    expect(result.cycleThreadIds).toHaveLength(0);
  });

  it('should detect circular deadlock between two threads', () => {
    const threads: ThreadInstance[] = [
      makeThread('T1', { state: 'RUNNING', heldLocks: ['L1'], waitingForLock: 'L2' }),
      makeThread('T2', { state: 'RUNNING', heldLocks: ['L2'], waitingForLock: 'L1' }),
    ];
    const locks: Record<string, LockInstance> = {
      L1: { id: 'L1', name: 'L1', heldByThreadId: 'T1', waitingQueue: ['T2'] },
      L2: { id: 'L2', name: 'L2', heldByThreadId: 'T2', waitingQueue: ['T1'] },
    };
    const result = DeadlockDetector.detectDeadlock(threads, locks);
    expect(result.isDeadlocked).toBe(true);
    expect(result.cycleThreadIds).toContain('T1');
    expect(result.cycleThreadIds).toContain('T2');
  });

  it('should detect no deadlock when thread waits but no cycle', () => {
    const threads: ThreadInstance[] = [
      makeThread('T1', { state: 'RUNNING', heldLocks: ['L1'] }),
      makeThread('T2', { state: 'BLOCKED', waitingForLock: 'L1' }),
    ];
    const locks: Record<string, LockInstance> = {
      L1: { id: 'L1', name: 'L1', heldByThreadId: 'T1', waitingQueue: ['T2'] },
    };
    const result = DeadlockDetector.detectDeadlock(threads, locks);
    expect(result.isDeadlocked).toBe(false);
  });

  it('should detect deadlock in dining philosophers scenario (5 threads)', () => {
    const threads: ThreadInstance[] = [
      makeThread('P0', { state: 'BLOCKED', heldLocks: ['F0'], waitingForLock: 'F1' }),
      makeThread('P1', { state: 'BLOCKED', heldLocks: ['F1'], waitingForLock: 'F2' }),
      makeThread('P2', { state: 'BLOCKED', heldLocks: ['F2'], waitingForLock: 'F3' }),
      makeThread('P3', { state: 'BLOCKED', heldLocks: ['F3'], waitingForLock: 'F4' }),
      makeThread('P4', { state: 'BLOCKED', heldLocks: ['F4'], waitingForLock: 'F0' }),
    ];
    const locks: Record<string, LockInstance> = {
      F0: { id: 'F0', name: 'F0', heldByThreadId: 'P0', waitingQueue: ['P4'] },
      F1: { id: 'F1', name: 'F1', heldByThreadId: 'P1', waitingQueue: ['P0'] },
      F2: { id: 'F2', name: 'F2', heldByThreadId: 'P2', waitingQueue: ['P1'] },
      F3: { id: 'F3', name: 'F3', heldByThreadId: 'P3', waitingQueue: ['P2'] },
      F4: { id: 'F4', name: 'F4', heldByThreadId: 'P4', waitingQueue: ['P3'] },
    };
    const result = DeadlockDetector.detectDeadlock(threads, locks);
    expect(result.isDeadlocked).toBe(true);
    expect(result.cycleThreadIds.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle empty threads list', () => {
    const result = DeadlockDetector.detectDeadlock([], {});
    expect(result.isDeadlocked).toBe(false);
    expect(result.cycleThreadIds).toHaveLength(0);
  });

  it('should detect no deadlock when waiting for non-existent lock', () => {
    const threads: ThreadInstance[] = [
      makeThread('T1', { state: 'BLOCKED', waitingForLock: 'NONEXISTENT' }),
    ];
    const result = DeadlockDetector.detectDeadlock(threads, {});
    expect(result.isDeadlocked).toBe(false);
  });
});
