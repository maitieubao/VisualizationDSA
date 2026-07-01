export type ThreadState = 'READY' | 'RUNNING' | 'BLOCKED' | 'FINISHED';

export interface ThreadInstance {
  id: string;
  name: string;
  state: ThreadState;
  progress: number;
  heldLocks: string[];
  waitingForLock: string | null;
}

export interface LockInstance {
  id: string;
  name: string;
  heldByThreadId: string | null;
  waitingQueue: string[];
}

export interface DeadlockResult {
  isDeadlocked: boolean;
  cycleThreadIds: string[];
}

export interface ConcurrencyScenario {
  id: string;
  title: string;
  description: string;
  threads: ThreadInstance[];
  lockIds: string[];
  lockNames: Record<string, string>;
  mutexEnabled: boolean;
  pseudocode: string;
  steps: ScenarioStep[];
}

export interface ScenarioStep {
  threadId: string;
  action: 'MOVE' | 'ACQUIRE_LOCK' | 'RELEASE_LOCK' | 'INCREMENT_COUNTER' | 'READ_COUNTER';
  lockId?: string;
  progressTarget?: number;
}

export interface ConcurrencySnapshot {
  threads: ThreadInstance[];
  locks: Record<string, LockInstance>;
  sharedCounter: number;
  isDeadlocked: boolean;
  deadlockedThreadIds: string[];
  stepIndex: number;
  totalSteps: number;
}

export type PlaybackMode = 'IDLE' | 'PLAYING' | 'PAUSED' | 'FINISHED' | 'DEADLOCKED';
