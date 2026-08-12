













import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { STATELESS_USER_ID_KEY } from '../../auth/store/authSessionHelpers';
import {
  fetchUserProgress,
  syncXPToServer,
  markModuleComplete,
  ApiError,
  type UserProgressDto,
  type XPSyncPayload,
} from '../service/userProgressApi';


const SYNC_QUEUE_KEY = 'vdsa_xp_sync_queue';
const MAX_RETRY_ATTEMPTS = 5;
const BASE_RETRY_DELAY_MS = 1000; 

// Mục queue gắn kèm userId (AU-006): flush chỉ xử lý mục thuộc user hiện tại,
// chống XP của user A bị đẩy sang user B khi đăng nhập sau.
interface QueuedSyncPayload extends XPSyncPayload {
  userId: string | null;
}



function loadSyncQueue(): QueuedSyncPayload[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) ?? '[]');
    if (!Array.isArray(raw)) return [];
    return (raw as unknown[]).flatMap((entry): QueuedSyncPayload[] => {
      if (typeof entry !== 'object' || entry === null) return [];
      const item = entry as Partial<QueuedSyncPayload>;
      // Queue phiên bản cũ (trước AU-006) không có userId — hủy để tránh flush sang tài khoản khác.
      if (typeof item.userId !== 'string') {
        console.warn('⚠️ XP sync queue chứa mục cũ không có userId — đã hủy để tránh flush nhầm tài khoản.');
        return [];
      }
      return [{ amount: Number(item.amount ?? 0), reason: String(item.reason ?? ''), userId: item.userId }];
    });
  } catch {
    return [];
  }
}

function saveSyncQueue(queue: QueuedSyncPayload[]): void {
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('Failed to save XP sync queue to localStorage:', err);
  }
}


function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}



export const useUserProgressStore = defineStore('userProgress', () => {
  const authStore = useAuthStore();

  
  const totalXP              = ref<number>(0);
  const currentLevel         = ref<number>(1);
  const xpToNextLevel        = ref<number>(100);
  const levelProgressPercent = ref<number>(0);
  const currentStreak        = ref<number>(0);
  const completedModuleIds   = ref<string[]>([]);
  const isSyncing            = ref<boolean>(false);
  const isSyncError          = ref<boolean>(false);
  const pendingSyncQueue     = ref<QueuedSyncPayload[]>(loadSyncQueue());

  
  const isModuleCompleted = computed(
    () => (moduleId: string) => completedModuleIds.value.includes(moduleId),
  );

  // userId của user đang đăng nhập — dùng để gắn vào queue và lọc khi flush (AU-006).
  function _currentUserId(): string | null {
    return authStore.statelessUser?.id ?? localStorage.getItem(STATELESS_USER_ID_KEY);
  }

  // Reset toàn bộ state + xóa pendingSyncQueue khi logout/session hết hạn (AU-006).
  function resetForLogout(): void {
    totalXP.value = 0;
    currentLevel.value = 1;
    xpToNextLevel.value = 100;
    levelProgressPercent.value = 0;
    currentStreak.value = 0;
    completedModuleIds.value = [];
    isSyncError.value = false;
    pendingSyncQueue.value = [];
    localStorage.removeItem(SYNC_QUEUE_KEY);
  }

  

  function _onOnline(): void {
    const token = authStore.getAccessToken();
    if (token && pendingSyncQueue.value.length > 0) {
      console.info('🌐 Mạng phục hồi — tự động flush XP queue...');
      _flushPendingQueue(token);
    }
  }

  
  if (typeof window !== 'undefined') {
    window.addEventListener('online', _onOnline);
  }

  
  

  

  



  async function loadProgress(): Promise<void> {
    isSyncError.value = false; 
    
    const token = authStore.getAccessToken();
    if (!token) return;

    try {
      
      
      
      
      const data = await fetchUserProgress(token, authStore.statelessUser?.id);
      _hydrateFromDto(data);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      // Interceptor đã retry phía dưới; chỉ đánh dấu trạng thái lỗi để UI hiển thị.
      console.warn("⚠️ loadProgress thất bại (interceptor đã retry):", message);
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
      
    }
  }

  



  async function syncXP(amount: number, reason: string): Promise<void> {
    
    const snapshotXP    = totalXP.value;
    const snapshotLevel = currentLevel.value;

    
    totalXP.value += amount;
    _recalculateLevel();

    const payload: QueuedSyncPayload = { amount, reason, userId: _currentUserId() };
    const token = authStore.getAccessToken();

    if (!token) {
      
      pendingSyncQueue.value.push(payload);
      saveSyncQueue(pendingSyncQueue.value);
      return;
    }

    try {
      isSyncing.value = true;
      const result = await syncXPToServer(token, payload, authStore.statelessUser?.id);
      
      totalXP.value      = result.totalXP;
      currentLevel.value = result.currentLevel;
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        
        console.warn(`⚠️ Server reject XP (HTTP ${error.status}): ${error.message}. Rollback local state.`);
        totalXP.value      = snapshotXP;
        currentLevel.value = snapshotLevel;
        _recalculateLevel();
        
        await loadProgress();
      } else {
        
        pendingSyncQueue.value.push(payload);
        saveSyncQueue(pendingSyncQueue.value);
      }
    } finally {
      isSyncing.value = false;
    }
  }

  


  async function completeModule(moduleId: string): Promise<void> {
    if (completedModuleIds.value.includes(moduleId)) return;

    completedModuleIds.value = [...completedModuleIds.value, moduleId];

    const token = authStore.getAccessToken();
    if (!token) return;

    try {
      await markModuleComplete(token, moduleId);
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        
        completedModuleIds.value = completedModuleIds.value.filter(id => id !== moduleId);
      }
      
    }
  }

  

  function _hydrateFromDto(data: UserProgressDto): void {
    totalXP.value              = data.totalXP;
    currentLevel.value         = data.currentLevel;
    xpToNextLevel.value        = data.xpToNextLevel;
    levelProgressPercent.value = data.levelProgressPercent;
    currentStreak.value        = data.currentStreak;
    completedModuleIds.value   = data.completedModuleIds;
  }

  
  // Bảng ngưỡng level KHỚP backend (User.cs) — trước đây dùng sqrt(1 + XP/100) lệch level hiển thị.
  const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2200, 3000];

  function _recalculateLevel(): void {
    let level = 1;
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (totalXP.value >= LEVEL_THRESHOLDS[i]) { level = i + 1; break; }
    }
    currentLevel.value = level;

    const current = LEVEL_THRESHOLDS[Math.min(level - 1, LEVEL_THRESHOLDS.length - 1)] ?? 0;
    const next = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    xpToNextLevel.value = Math.max(0, next - totalXP.value);
    levelProgressPercent.value = next > current
      ? Math.min(100, Math.round(((totalXP.value - current) / (next - current)) * 100))
      : 100;
  }

  




  async function _flushPendingQueue(token: string): Promise<void> {
    if (pendingSyncQueue.value.length === 0) return;

    // Chỉ flush mục thuộc user hiện tại — mục của user cũ (nếu sót) bị bỏ (AU-006).
    const currentUserId = _currentUserId();
    const queue = pendingSyncQueue.value.filter((item) => item.userId === currentUserId);
    const failedPayloads: QueuedSyncPayload[] = [];

    
    pendingSyncQueue.value = [];
    saveSyncQueue([]);

    for (const payload of queue) {
      let success = false;

      for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
        try {
          await syncXPToServer(token, payload, authStore.statelessUser?.id);
          success = true;
          break;
        } catch (error: unknown) {
          if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
            
            console.warn(`⚠️ Queue item rejected (HTTP ${error.status}): ${payload.reason}. Discarding.`);
            success = true; 
            break;
          }

          
          if (attempt < MAX_RETRY_ATTEMPTS) {
            const jitterMs = Math.floor(Math.random() * 800) - 400; 
            const backoffMs = Math.max(200, (BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1)) + jitterMs);
            console.info(`🔄 Retry ${attempt}/${MAX_RETRY_ATTEMPTS} cho "${payload.reason}" sau ${backoffMs}ms...`);
            await delay(backoffMs);
          }
        }
      }

      if (!success) {
        
        failedPayloads.push(payload);
      }
    }

    
    if (failedPayloads.length > 0) {
      pendingSyncQueue.value = failedPayloads;
      saveSyncQueue(failedPayloads);
      isSyncError.value = true;
      console.warn(`⚠️ ${failedPayloads.length} XP item(s) vẫn chưa sync được. Sẽ thử lại khi mạng phục hồi.`);
    }

    
    try {
      const freshData = await fetchUserProgress(token, authStore.statelessUser?.id);
      _hydrateFromDto(freshData);
    } catch {
      
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
    resetForLogout,
  };
});
