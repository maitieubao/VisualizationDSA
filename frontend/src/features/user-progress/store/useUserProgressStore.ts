/**
 * useUserProgressStore.ts — Bridge giữa XPEngine local và Backend persistence.
 *
 * Luồng hoạt động:
 * 1. App khởi động → nếu đã đăng nhập → fetchFromServer() hydrate local state
 * 2. Khi user làm quiz/xem lecture → syncXP() tính local + fire-and-forget lên server
 * 3. Offline mode: XP tích lũy trong pendingSyncQueue → flush khi online lại
 *
 * Sprint E enhancements:
 * - Tự động flush queue khi mạng phục hồi (window 'online' event)
 * - Retry 3 lần với exponential backoff (1s → 2s → 4s)
 * - Rollback XP local khi server reject (HTTP 4xx)
 */

import { defineStore } from 'pinia';
import { ref, computed, onUnmounted } from 'vue';
import { useAuthStore } from '../../auth/store/useAuthStore';
import {
  fetchUserProgress,
  syncXPToServer,
  markModuleComplete,
  ApiError,
  type UserProgressDto,
  type XPSyncPayload,
} from '../service/userProgressApi';

// ── Constants ─────────────────────────────────────────────────────────────────
const SYNC_QUEUE_KEY = 'vdsa_xp_sync_queue';
const MAX_RETRY_ATTEMPTS = 5;
const BASE_RETRY_DELAY_MS = 1000; // 1s → 2s → 4s → 8s → 16s with random jitter

// ── Offline sync queue ────────────────────────────────────────────────────────

function loadSyncQueue(): XPSyncPayload[] {
  try {
    return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveSyncQueue(queue: XPSyncPayload[]): void {
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('Failed to save XP sync queue to localStorage:', err);
  }
}

/** Delay helper for exponential backoff */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useUserProgressStore = defineStore('userProgress', () => {
  const authStore = useAuthStore();

  // State — mirror của backend UserProgressDto
  const totalXP              = ref<number>(0);
  const currentLevel         = ref<number>(1);
  const xpToNextLevel        = ref<number>(100);
  const levelProgressPercent = ref<number>(0);
  const currentStreak        = ref<number>(0);
  const completedModuleIds   = ref<string[]>([]);
  const isSyncing            = ref<boolean>(false);
  const isSyncError          = ref<boolean>(false);
  const pendingSyncQueue     = ref<XPSyncPayload[]>(loadSyncQueue());

  // Getters
  const isModuleCompleted = computed(
    () => (moduleId: string) => completedModuleIds.value.includes(moduleId),
  );

  // ── Online event listener ───────────────────────────────────────────────

  function _onOnline(): void {
    const token = authStore.getAccessToken();
    if (token && pendingSyncQueue.value.length > 0) {
      console.info('🌐 Mạng phục hồi — tự động flush XP queue...');
      _flushPendingQueue(token);
    }
  }

  // Đăng ký listener ngay khi store khởi tạo
  if (typeof window !== 'undefined') {
    window.addEventListener('online', _onOnline);
  }

  // Gỡ listener khi store bị hủy (tránh memory leak)
  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', _onOnline);
    }
  });

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Khởi động: đồng bộ dữ liệu từ server nếu đã đăng nhập.
   * Gọi trong App.vue sau khi useAuthStore.init() hoàn thành.
   */
  async function loadProgress(): Promise<void> {
    const token = authStore.getAccessToken();
    if (!token) return;

    isSyncError.value = false;

    try {
      // Gọi fetchUserProgress — global fetch interceptor (main.ts) đã tự động:
      //   1. Inject Bearer token vào header
      //   2. Nếu nhận 401 → tự refresh token và retry
      // KHÔNG tự ý gọi refreshAccessToken() ở đây để tránh race condition song song.
      const data = await fetchUserProgress(token);
      _hydrateFromDto(data);
    } catch (error: any) {
      // Interceptor đã thử refresh + retry nhưng vẫn thất bại → đánh dấu lỗi nhẹ,
      // không throw exception để không làm crash Vue Router.
      console.warn("⚠️ loadProgress thất bại (interceptor đã retry):", error?.message ?? error);
      isSyncError.value = true;
    }
  }

  async function initFromServer(): Promise<void> {
    try {
      await loadProgress();
      const token = authStore.getAccessToken();
      if (token) {
        await _flushPendingQueue(token);
      }
    } catch {
      // Server không khả dụng → tiếp tục dùng local state
    }
  }

  /**
   * Cộng XP sau sự kiện học tập.
   * Tính local ngay lập tức → sync server background.
   */
  async function syncXP(amount: number, reason: string): Promise<void> {
    // Lưu snapshot trước khi optimistic update (để rollback nếu cần)
    const snapshotXP    = totalXP.value;
    const snapshotLevel = currentLevel.value;

    // Cập nhật local ngay (optimistic update)
    totalXP.value += amount;
    _recalculateLevel();

    const payload: XPSyncPayload = { amount, reason };
    const token = authStore.getAccessToken();

    if (!token) {
      // Offline/guest: lưu vào queue để sync sau
      pendingSyncQueue.value.push(payload);
      saveSyncQueue(pendingSyncQueue.value);
      return;
    }

    try {
      isSyncing.value = true;
      const result = await syncXPToServer(token, payload);
      // Cập nhật lại với giá trị server (single source of truth)
      totalXP.value      = result.totalXP;
      currentLevel.value = result.currentLevel;
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        // Server reject vì lý do nghiệp vụ (4xx) → rollback local state
        console.warn(`⚠️ Server reject XP (HTTP ${error.status}): ${error.message}. Rollback local state.`);
        totalXP.value      = snapshotXP;
        currentLevel.value = snapshotLevel;
        _recalculateLevel();
        // Đồng bộ lại từ server để đảm bảo single source of truth
        await loadProgress();
      } else {
        // Lỗi mạng hoặc server 5xx → giữ local state, queue lại
        pendingSyncQueue.value.push(payload);
        saveSyncQueue(pendingSyncQueue.value);
      }
    } finally {
      isSyncing.value = false;
    }
  }

  /**
   * Đánh dấu module hoàn thành (optimistic local + sync server).
   */
  async function completeModule(moduleId: string): Promise<void> {
    if (completedModuleIds.value.includes(moduleId)) return;

    completedModuleIds.value = [...completedModuleIds.value, moduleId];

    const token = authStore.getAccessToken();
    if (!token) return;

    try {
      await markModuleComplete(token, moduleId);
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        // Server reject → rollback
        completedModuleIds.value = completedModuleIds.value.filter(id => id !== moduleId);
      }
      // Lỗi mạng → giữ local, sẽ sync lần sau khi initFromServer
    }
  }

  // ── Private ────────────────────────────────────────────────────────────────

  function _hydrateFromDto(data: UserProgressDto): void {
    totalXP.value              = data.totalXP;
    currentLevel.value         = data.currentLevel;
    xpToNextLevel.value        = data.xpToNextLevel;
    levelProgressPercent.value = data.levelProgressPercent;
    currentStreak.value        = data.currentStreak;
    completedModuleIds.value   = data.completedModuleIds;
  }

  /** Tính cấp độ đơn giản theo công thức backend: Level = 1 + floor(sqrt(XP/100)) */
  function _recalculateLevel(): void {
    const newLevel = 1 + Math.floor(Math.sqrt(totalXP.value / 100));
    currentLevel.value = newLevel;
  }

  /**
   * Flush pending XP sync queue với retry logic.
   * Mỗi payload được retry tối đa MAX_RETRY_ATTEMPTS lần với exponential backoff.
   * Nếu vẫn thất bại → giữ lại trong queue (không xóa vĩnh viễn).
   */
  async function _flushPendingQueue(token: string): Promise<void> {
    if (pendingSyncQueue.value.length === 0) return;

    const queue = [...pendingSyncQueue.value];
    const failedPayloads: XPSyncPayload[] = [];

    // Xóa queue tạm thời để tránh duplicate nếu flush được gọi lại
    pendingSyncQueue.value = [];
    saveSyncQueue([]);

    for (const payload of queue) {
      let success = false;

      for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
        try {
          await syncXPToServer(token, payload);
          success = true;
          break;
        } catch (error: unknown) {
          if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
            // Server reject nghiệp vụ → không retry, bỏ payload này
            console.warn(`⚠️ Queue item rejected (HTTP ${error.status}): ${payload.reason}. Discarding.`);
            success = true; // Đánh dấu "handled" để không giữ lại
            break;
          }

          // Lỗi mạng/server → retry với exponential backoff + random jitter
          if (attempt < MAX_RETRY_ATTEMPTS) {
            const jitterMs = Math.floor(Math.random() * 800) - 400; // random offset between -400ms and 400ms
            const backoffMs = Math.max(200, (BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1)) + jitterMs);
            console.info(`🔄 Retry ${attempt}/${MAX_RETRY_ATTEMPTS} cho "${payload.reason}" sau ${backoffMs}ms...`);
            await delay(backoffMs);
          }
        }
      }

      if (!success) {
        // Thất bại sau tất cả retries → giữ lại trong queue
        failedPayloads.push(payload);
      }
    }

    // Nếu có payload thất bại → lưu lại vào queue
    if (failedPayloads.length > 0) {
      pendingSyncQueue.value = failedPayloads;
      saveSyncQueue(failedPayloads);
      isSyncError.value = true;
      console.warn(`⚠️ ${failedPayloads.length} XP item(s) vẫn chưa sync được. Sẽ thử lại khi mạng phục hồi.`);
    }

    // Re-hydrate từ server sau khi flush để đảm bảo consistency
    try {
      const freshData = await fetchUserProgress(token);
      _hydrateFromDto(freshData);
    } catch {
      // Không critical — local state đã tương đối chính xác
    }
  }

  return {
    totalXP,
    currentLevel,
    xpToNextLevel,
    levelProgressPercent,
    currentStreak,
    completedModuleIds,
    isSyncing,
    isSyncError,
    isModuleCompleted,
    loadProgress,
    initFromServer,
    syncXP,
    completeModule,
  };
});
