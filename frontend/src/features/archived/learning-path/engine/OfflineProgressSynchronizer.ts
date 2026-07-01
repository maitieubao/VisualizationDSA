import type { UserQuizScore, OfflineProgressData, SyncStatus } from '../types/learning-path.types';

const STORAGE_KEY_COMPLETED = 'learning_path_completed';
const STORAGE_KEY_SCORES = 'learning_path_scores';
const STORAGE_KEY_TIMESTAMP = 'learning_path_sync_timestamp';
const DEBOUNCE_MS = 2000;

/**
 * Offline-first progress synchronizer.
 * Saves to localStorage immediately, debounces server sync.
 */
export class OfflineProgressSynchronizer {
  private static debounceTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Save progress to localStorage immediately (0ms delay).
   */
  public static saveToLocalStorage(
    completedNodeIds: string[],
    scoresHistory: UserQuizScore[]
  ): void {
    try {
      localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(completedNodeIds));
      localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify(scoresHistory));
      localStorage.setItem(STORAGE_KEY_TIMESTAMP, JSON.stringify(Date.now()));
    } catch (error) {
      console.warn('Failed to save progress to localStorage:', error);
    }
  }

  /**
   * Load progress from localStorage.
   * Returns null if no saved data exists.
   */
  public static loadFromLocalStorage(): OfflineProgressData | null {
    try {
      const completedRaw = localStorage.getItem(STORAGE_KEY_COMPLETED);
      const scoresRaw = localStorage.getItem(STORAGE_KEY_SCORES);
      const timestampRaw = localStorage.getItem(STORAGE_KEY_TIMESTAMP);

      if (!completedRaw || !scoresRaw) return null;

      return {
        completedNodeIds: JSON.parse(completedRaw) as string[],
        scoresHistory: JSON.parse(scoresRaw) as UserQuizScore[],
        lastSyncTimestamp: timestampRaw ? (JSON.parse(timestampRaw) as number) : 0,
      };
    } catch (error) {
      console.warn('Failed to load progress from localStorage:', error);
      return null;
    }
  }

  /**
   * Clear all learning path data from localStorage.
   */
  public static clearLocalStorage(): void {
    localStorage.removeItem(STORAGE_KEY_COMPLETED);
    localStorage.removeItem(STORAGE_KEY_SCORES);
    localStorage.removeItem(STORAGE_KEY_TIMESTAMP);
  }

  /**
   * Schedule a debounced server sync (2000ms delay).
   * Returns the sync status after attempt.
   */
  public static scheduleDebouncedSync(
    completedNodeIds: string[],
    scoresHistory: UserQuizScore[],
    onStatusChange: (status: SyncStatus) => void
  ): void {
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(async () => {
      onStatusChange('syncing');
      try {
        await fetch('/api/v1/learning-path/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            completedNodes: completedNodeIds,
            scores: scoresHistory,
          }),
        });
        onStatusChange('synced');
      } catch {
        onStatusChange('error');
        console.warn('Server sync failed. Progress is saved offline.');
      }
      this.debounceTimer = null;
    }, DEBOUNCE_MS);
  }

  /**
   * Cancel any pending debounced sync.
   */
  public static cancelPendingSync(): void {
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  /**
   * Check if there is saved progress in localStorage.
   */
  public static hasSavedProgress(): boolean {
    return localStorage.getItem(STORAGE_KEY_COMPLETED) !== null;
  }
}
