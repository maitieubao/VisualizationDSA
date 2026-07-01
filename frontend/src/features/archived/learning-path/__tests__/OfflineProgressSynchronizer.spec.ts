import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OfflineProgressSynchronizer } from '../engine/OfflineProgressSynchronizer';
import type { UserQuizScore, SyncStatus } from '../types/learning-path.types';

describe('OfflineProgressSynchronizer', () => {
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    mockStorage = {};
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => mockStorage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
      }),
    });
    OfflineProgressSynchronizer.cancelPendingSync();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('saveToLocalStorage', () => {
    it('should save completed nodes to localStorage', () => {
      OfflineProgressSynchronizer.saveToLocalStorage(['bubble-sort', 'quicksort'], []);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'learning_path_completed',
        JSON.stringify(['bubble-sort', 'quicksort'])
      );
    });

    it('should save scores to localStorage', () => {
      const scores: UserQuizScore[] = [
        { algorithmId: 'bubble-sort', scorePercentage: 85, timeSpentSeconds: 90 },
      ];

      OfflineProgressSynchronizer.saveToLocalStorage([], scores);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'learning_path_scores',
        JSON.stringify(scores)
      );
    });

    it('should save timestamp to localStorage', () => {
      vi.spyOn(Date, 'now').mockReturnValue(1234567890);

      OfflineProgressSynchronizer.saveToLocalStorage([], []);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'learning_path_sync_timestamp',
        JSON.stringify(1234567890)
      );
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.stubGlobal('localStorage', {
        getItem: vi.fn(),
        setItem: vi.fn(() => {
          throw new Error('QuotaExceededError');
        }),
        removeItem: vi.fn(),
      });

      expect(() => OfflineProgressSynchronizer.saveToLocalStorage([], [])).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('loadFromLocalStorage', () => {
    it('should return saved data from localStorage', () => {
      mockStorage['learning_path_completed'] = JSON.stringify(['bubble-sort']);
      mockStorage['learning_path_scores'] = JSON.stringify([
        { algorithmId: 'bubble-sort', scorePercentage: 85, timeSpentSeconds: 90 },
      ]);
      mockStorage['learning_path_sync_timestamp'] = JSON.stringify(1234567890);

      const data = OfflineProgressSynchronizer.loadFromLocalStorage();

      expect(data).not.toBeNull();
      expect(data!.completedNodeIds).toEqual(['bubble-sort']);
      expect(data!.scoresHistory).toHaveLength(1);
      expect(data!.lastSyncTimestamp).toBe(1234567890);
    });

    it('should return null when no saved data exists', () => {
      const data = OfflineProgressSynchronizer.loadFromLocalStorage();
      expect(data).toBeNull();
    });

    it('should return null when only completed data exists without scores', () => {
      mockStorage['learning_path_completed'] = JSON.stringify(['a']);
      const data = OfflineProgressSynchronizer.loadFromLocalStorage();
      expect(data).toBeNull();
    });

    it('should handle missing timestamp gracefully', () => {
      mockStorage['learning_path_completed'] = JSON.stringify(['a']);
      mockStorage['learning_path_scores'] = JSON.stringify([]);

      const data = OfflineProgressSynchronizer.loadFromLocalStorage();
      expect(data).not.toBeNull();
      expect(data!.lastSyncTimestamp).toBe(0);
    });

    it('should handle corrupted JSON gracefully', () => {
      mockStorage['learning_path_completed'] = 'not-json';
      mockStorage['learning_path_scores'] = 'not-json';

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const data = OfflineProgressSynchronizer.loadFromLocalStorage();

      expect(data).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('clearLocalStorage', () => {
    it('should remove all learning path keys', () => {
      OfflineProgressSynchronizer.clearLocalStorage();

      expect(localStorage.removeItem).toHaveBeenCalledWith('learning_path_completed');
      expect(localStorage.removeItem).toHaveBeenCalledWith('learning_path_scores');
      expect(localStorage.removeItem).toHaveBeenCalledWith('learning_path_sync_timestamp');
    });
  });

  describe('hasSavedProgress', () => {
    it('should return true when completed data exists', () => {
      mockStorage['learning_path_completed'] = JSON.stringify(['a']);
      expect(OfflineProgressSynchronizer.hasSavedProgress()).toBe(true);
    });

    it('should return false when no data exists', () => {
      expect(OfflineProgressSynchronizer.hasSavedProgress()).toBe(false);
    });
  });

  describe('scheduleDebouncedSync', () => {
    it('should call onStatusChange with syncing then synced on success', async () => {
      vi.useFakeTimers();
      const fetchMock = vi.fn().mockResolvedValue({ ok: true });
      vi.stubGlobal('fetch', fetchMock);

      const statuses: SyncStatus[] = [];
      const onStatusChange = (status: SyncStatus) => statuses.push(status);

      OfflineProgressSynchronizer.scheduleDebouncedSync(['a'], [], onStatusChange);

      vi.advanceTimersByTime(2000);
      await vi.runAllTimersAsync();

      expect(statuses).toContain('syncing');
      expect(statuses).toContain('synced');
      expect(fetchMock).toHaveBeenCalledOnce();

      vi.useRealTimers();
    });

    it('should call onStatusChange with error on fetch failure', async () => {
      vi.useFakeTimers();
      const fetchMock = vi.fn().mockRejectedValue(new Error('Network error'));
      vi.stubGlobal('fetch', fetchMock);

      vi.spyOn(console, 'warn').mockImplementation(() => {});
      const statuses: SyncStatus[] = [];
      const onStatusChange = (status: SyncStatus) => statuses.push(status);

      OfflineProgressSynchronizer.scheduleDebouncedSync(['a'], [], onStatusChange);

      vi.advanceTimersByTime(2000);
      await vi.runAllTimersAsync();

      expect(statuses).toContain('syncing');
      expect(statuses).toContain('error');

      vi.useRealTimers();
    });

    it('should debounce multiple sync requests', () => {
      vi.useFakeTimers();
      const fetchMock = vi.fn().mockResolvedValue({ ok: true });
      vi.stubGlobal('fetch', fetchMock);

      const onStatusChange = vi.fn();

      OfflineProgressSynchronizer.scheduleDebouncedSync(['a'], [], onStatusChange);
      vi.advanceTimersByTime(1000);
      OfflineProgressSynchronizer.scheduleDebouncedSync(['a', 'b'], [], onStatusChange);
      vi.advanceTimersByTime(1000);

      expect(fetchMock).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1000);

      vi.useRealTimers();
    });
  });

  describe('cancelPendingSync', () => {
    it('should cancel pending debounced sync', () => {
      vi.useFakeTimers();
      const fetchMock = vi.fn().mockResolvedValue({ ok: true });
      vi.stubGlobal('fetch', fetchMock);

      const onStatusChange = vi.fn();

      OfflineProgressSynchronizer.scheduleDebouncedSync(['a'], [], onStatusChange);
      OfflineProgressSynchronizer.cancelPendingSync();

      vi.advanceTimersByTime(3000);

      expect(fetchMock).not.toHaveBeenCalled();
      expect(onStatusChange).not.toHaveBeenCalled();

      vi.useRealTimers();
    });
  });
});
