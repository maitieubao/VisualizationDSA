import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ReplicationLagScheduler } from '../engine/ReplicationLagScheduler';

describe('ReplicationLagScheduler', () => {
  let scheduler: ReplicationLagScheduler;

  beforeEach(() => {
    vi.useFakeTimers();
    scheduler = new ReplicationLagScheduler();
  });

  afterEach(() => {
    scheduler.clear();
    vi.useRealTimers();
  });

  describe('Job Scheduling', () => {
    it('should schedule a replication job', () => {
      const cb = vi.fn();
      const job = scheduler.scheduleReplication('primary-1', 'replica-1', 1000, cb);

      expect(job).not.toBeNull();
      expect(job!.primaryId).toBe('primary-1');
      expect(job!.replicaId).toBe('replica-1');
      expect(job!.lagDurationMs).toBe(1000);
      expect(job!.packetColor).toBe('#FBBF24');
    });

    it('should add job to pending queue', () => {
      scheduler.scheduleReplication('p', 'r', 2000, vi.fn());
      expect(scheduler.getPendingCount()).toBe(1);
    });

    it('should complete job after lag duration', () => {
      const cb = vi.fn();
      scheduler.scheduleReplication('p', 'r', 1000, cb);

      vi.advanceTimersByTime(999);
      expect(cb).not.toHaveBeenCalled();
      expect(scheduler.getPendingCount()).toBe(1);

      vi.advanceTimersByTime(1);
      expect(cb).toHaveBeenCalledTimes(1);
      expect(scheduler.getPendingCount()).toBe(0);
      expect(scheduler.getCompletedCount()).toBe(1);
    });

    it('should pass the job object to callback', () => {
      const cb = vi.fn();
      const job = scheduler.scheduleReplication('p', 'r', 500, cb);
      vi.advanceTimersByTime(500);

      expect(cb).toHaveBeenCalledWith(job);
    });
  });

  describe('Lag Clamping', () => {
    it('should clamp lag below minimum (100ms)', () => {
      const job = scheduler.scheduleReplication('p', 'r', 50, vi.fn());
      expect(job!.lagDurationMs).toBe(100);
    });

    it('should clamp lag above maximum (5000ms)', () => {
      const job = scheduler.scheduleReplication('p', 'r', 10000, vi.fn());
      expect(job!.lagDurationMs).toBe(5000);
    });

    it('should accept lag within valid range', () => {
      const job = scheduler.scheduleReplication('p', 'r', 2500, vi.fn());
      expect(job!.lagDurationMs).toBe(2500);
    });
  });

  describe('Multiple Jobs', () => {
    it('should handle multiple concurrent replication jobs', () => {
      const cb1 = vi.fn();
      const cb2 = vi.fn();
      scheduler.scheduleReplication('p', 'r1', 500, cb1);
      scheduler.scheduleReplication('p', 'r2', 1000, cb2);

      expect(scheduler.getPendingCount()).toBe(2);

      vi.advanceTimersByTime(500);
      expect(cb1).toHaveBeenCalledTimes(1);
      expect(cb2).not.toHaveBeenCalled();
      expect(scheduler.getPendingCount()).toBe(1);

      vi.advanceTimersByTime(500);
      expect(cb2).toHaveBeenCalledTimes(1);
      expect(scheduler.getPendingCount()).toBe(0);
      expect(scheduler.getCompletedCount()).toBe(2);
    });
  });

  describe('Job Query', () => {
    it('should check if a job is pending', () => {
      const job = scheduler.scheduleReplication('p', 'r', 1000, vi.fn());
      expect(scheduler.isJobPending(job!.jobId)).toBe(true);

      vi.advanceTimersByTime(1000);
      expect(scheduler.isJobPending(job!.jobId)).toBe(false);
    });

    it('should return pending jobs list', () => {
      scheduler.scheduleReplication('p', 'r1', 500, vi.fn());
      scheduler.scheduleReplication('p', 'r2', 1000, vi.fn());

      const pending = scheduler.getPendingJobs();
      expect(pending).toHaveLength(2);
      expect(pending[0].replicaId).toBe('r1');
      expect(pending[1].replicaId).toBe('r2');
    });
  });

  describe('Clear / GC', () => {
    it('should cancel all pending timers on clear', () => {
      const cb = vi.fn();
      scheduler.scheduleReplication('p', 'r', 1000, cb);
      scheduler.clear();

      vi.advanceTimersByTime(2000);
      expect(cb).not.toHaveBeenCalled();
      expect(scheduler.getPendingCount()).toBe(0);
      expect(scheduler.getCompletedCount()).toBe(0);
    });
  });
});
