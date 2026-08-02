













import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from '../../auth/store/useAuthStore';
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


function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  const pendingSyncQueue     = ref<XPSyncPayload[]>(loadSyncQueue());

  
  const isModuleCompleted = computed(
    () => (moduleId: string) => completedModuleIds.value.includes(moduleId),
  );

  

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
    } catch (error: any) {
      
      
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
      
    }
  }

  



  async function syncXP(amount: number, reason: string): Promise<void> {
    
    const snapshotXP    = totalXP.value;
    const snapshotLevel = currentLevel.value;

    
    totalXP.value += amount;
    _recalculateLevel();

    const payload: XPSyncPayload = { amount, reason };
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

  
  function _recalculateLevel(): void {
    const newLevel = 1 + Math.floor(Math.sqrt(totalXP.value / 100));
    currentLevel.value = newLevel;
  }

  




  async function _flushPendingQueue(token: string): Promise<void> {
    if (pendingSyncQueue.value.length === 0) return;

    const queue = [...pendingSyncQueue.value];
    const failedPayloads: XPSyncPayload[] = [];

    
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
  };
});
