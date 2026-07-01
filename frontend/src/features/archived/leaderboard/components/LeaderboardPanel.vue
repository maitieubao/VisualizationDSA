<template>
  <div class="leaderboard-panel">
    <LeaderboardHeader
      :count="entries.length"
      :is-loading="isLoading"
      @refresh="fetchLeaderboard"
    />

    <LeaderboardMyRankCard
      v-if="authStore.isAuthenticated && myRank"
      :rank="myRank"
    />

    <!-- Error state -->
    <div v-if="error" class="error-state">
      <span>⚠️ {{ error }}</span>
      <button class="retry-btn" @click="fetchLeaderboard">Thử lại</button>
    </div>

    <!-- Loading skeleton -->
    <div v-else-if="isLoading" class="entries-list">
      <div v-for="i in 10" :key="i" class="entry-skeleton">
        <div class="skeleton-rank"></div>
        <div class="skeleton-avatar"></div>
        <div class="skeleton-info">
          <div class="skeleton-name"></div>
          <div class="skeleton-xp"></div>
        </div>
      </div>
    </div>

    <!-- Leaderboard entries -->
    <div v-else class="entries-list">
      <TransitionGroup name="entry-list" tag="div">
        <LeaderboardEntryRow
          v-for="entry in entries"
          :key="entry.userId"
          :entry="entry"
          :is-mine="authStore.currentUser?.id === entry.userId.toString()"
          :max-x-p="entries[0]?.totalXP ?? 1"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../auth/store/useAuthStore';
import LeaderboardHeader from './LeaderboardHeader.vue';
import LeaderboardMyRankCard from './LeaderboardMyRankCard.vue';
import LeaderboardEntryRow from './LeaderboardEntryRow.vue';

interface LeaderboardEntry {
  rank: number; userId: string; username: string;
  totalXP: number; level: number; streakDays: number; badgeCount: number;
}
interface UserRank { rank: number; totalXP: number; isInTop: boolean; }

const props = withDefaults(defineProps<{ limit?: number }>(), { limit: 20 });

const authStore  = useAuthStore();
const entries    = ref<LeaderboardEntry[]>([]);
const myRank     = ref<UserRank | null>(null);
const isLoading  = ref(false);
const error      = ref<string | null>(null);
const API_BASE   = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

async function fetchLeaderboard(): Promise<void> {
  isLoading.value = true;
  error.value     = null;
  try {
    const [topRes, rankRes] = await Promise.allSettled([
      fetch(`${API_BASE}/api/v1/leaderboard/top?limit=${props.limit}`),
      authStore.isAuthenticated
        ? fetch(`${API_BASE}/api/v1/leaderboard/me/rank`, {
            headers: { 'Authorization': `Bearer ${authStore.getAccessToken()}` },
          })
        : Promise.resolve(null),
    ]);
    if (topRes.status === 'fulfilled' && topRes.value.ok) {
      entries.value = await topRes.value.json();
    } else {
      throw new Error('Không thể tải bảng xếp hạng.');
    }
    if (rankRes.status === 'fulfilled' && rankRes.value?.ok) {
      myRank.value = await rankRes.value.json();
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Lỗi không xác định.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchLeaderboard);
</script>

<style scoped>
.leaderboard-panel { display: flex; flex-direction: column; gap: 12px; height: 100%; min-height: 0; }
.entries-list { flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; padding-right: 4px; }
.entry-skeleton { display: grid; grid-template-columns: 48px 48px 1fr; gap: 12px; padding: 12px 16px; align-items: center; }
.skeleton-rank, .skeleton-avatar { height: 32px; border-radius: 4px; background: rgba(148, 163, 184, 0.1); animation: pulse 1.5s ease-in-out infinite; }
.skeleton-avatar { border-radius: 50%; }
.skeleton-info { display: flex; flex-direction: column; gap: 6px; }
.skeleton-name, .skeleton-xp { height: 10px; border-radius: 4px; background: rgba(148, 163, 184, 0.1); animation: pulse 1.5s ease-in-out infinite; }
.skeleton-name { width: 60%; }
.skeleton-xp   { width: 40%; }
@keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
.error-state { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 8px; color: #fca5a5; font-size: 0.8rem; }
.retry-btn { background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.3); color: #fca5a5; border-radius: 6px; padding: 4px 10px; cursor: pointer; font-size: 0.75rem; transition: all 0.2s; }
.retry-btn:hover { background: rgba(239, 68, 68, 0.3); }
.entry-list-enter-active, .entry-list-leave-active { transition: all 0.3s ease; }
.entry-list-enter-from { opacity: 0; transform: translateY(-8px); }
.entry-list-leave-to   { opacity: 0; transform: translateY(8px); }
</style>
