import type { ReplicationJob } from '../types/system-design-viz.types';
import {
  REPLICATION_LAG_MIN_MS,
  REPLICATION_LAG_MAX_MS,
} from '../types/system-design-viz.types';

/**
 * Schedules replication sync from Primary DB to Replica DB
 * with configurable lag duration (100ms – 5000ms).
 */
export class ReplicationLagScheduler {
  private pendingJobs: ReplicationJob[] = [];
  private completedJobIds: Set<string> = new Set();
  private jobCounter = 0;
  private timers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  /**
   * Enqueue a replication job with specified lag.
   * Returns the job or null if lagDurationMs is out of valid range.
   */
  public scheduleReplication(
    primaryId: string,
    replicaId: string,
    lagDurationMs: number,
    onSyncComplete: (job: ReplicationJob) => void,
  ): ReplicationJob | null {
    const clampedLag = Math.max(
      REPLICATION_LAG_MIN_MS,
      Math.min(REPLICATION_LAG_MAX_MS, lagDurationMs),
    );

    this.jobCounter++;
    const job: ReplicationJob = {
      jobId: `repl-${this.jobCounter}`,
      primaryId,
      replicaId,
      lagDurationMs: clampedLag,
      startedAt: Date.now(),
      packetColor: '#FBBF24',
    };

    this.pendingJobs.push(job);

    const timer = setTimeout(() => {
      this.completedJobIds.add(job.jobId);
      this.pendingJobs = this.pendingJobs.filter((j) => j.jobId !== job.jobId);
      this.timers.delete(job.jobId);
      onSyncComplete(job);
    }, clampedLag);

    this.timers.set(job.jobId, timer);
    return job;
  }

  public getPendingJobs(): ReplicationJob[] {
    return [...this.pendingJobs];
  }

  public getPendingCount(): number {
    return this.pendingJobs.length;
  }

  public getCompletedCount(): number {
    return this.completedJobIds.size;
  }

  public isJobPending(jobId: string): boolean {
    return this.pendingJobs.some((j) => j.jobId === jobId);
  }

  public clear(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.pendingJobs = [];
    this.completedJobIds.clear();
    this.jobCounter = 0;
  }
}
