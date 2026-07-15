import type { ThreadInstance } from '../types/concurrency.types';

export function threadLabelClass(thread: ThreadInstance): string {
  switch (thread.state) {
    case 'RUNNING':  return 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30';
    case 'BLOCKED':  return 'bg-accent-yellow/15 text-accent-yellow border border-accent-yellow/30';
    case 'FINISHED': return 'bg-accent-green/15 text-accent-green border border-accent-green/30';
    default: return 'bg-bg-surface text-text-secondary border border-border-default';
  }
}

export function threadNodeClass(thread: ThreadInstance): string {
  if (thread.state === 'BLOCKED')  return 'thread-runner-node status-blocked';
  if (thread.state === 'FINISHED') return 'thread-runner-node status-finished';
  return 'thread-runner-node';
}

export function stateBadgeClass(thread: ThreadInstance): string {
  switch (thread.state) {
    case 'RUNNING':  return 'bg-accent-cyan/30 text-accent';
    case 'BLOCKED':  return 'bg-accent-yellow/30 text-accent-yellow';
    case 'FINISHED': return 'bg-accent-green/30 text-accent-green';
    default: return 'bg-bg-surface text-text-muted';
  }
}

export function isThreadHoldingAnyLock(thread: ThreadInstance): boolean {
  return thread.heldLocks.length > 0;
}

export function lockIconClass(thread: ThreadInstance): string {
  return thread.heldLocks.length > 0 ? 'mutex-lock-icon state-locked' : 'mutex-lock-icon';
}

export function lockTextClass(thread: ThreadInstance): string {
  return thread.heldLocks.length > 0 ? 'text-accent-yellow' : 'text-accent-cyan/60';
}

export function getLockStatusText(thread: ThreadInstance): string {
  if (thread.heldLocks.length > 0) return thread.heldLocks.join(', ');
  if (thread.waitingForLock) return `Đợi ${thread.waitingForLock}`;
  return '';
}
