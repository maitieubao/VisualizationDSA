<template>
  <div class="leaderboard-view p-8 max-w-5xl mx-auto min-h-screen">
    <header class="mb-10 text-center space-y-4">
      <h1 class="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 drop-shadow-md">
        Hall of Fame
      </h1>
      <p class="text-text-muted text-lg">Top learners shaping the future of algorithms</p>
    </header>

    <div v-if="loading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
    </div>

    <div v-else-if="error" class="bg-red-500/10 border border-red-500/30 text-red-400 p-6 rounded-2xl text-center">
      <h3 class="text-xl font-bold mb-2">Failed to load leaderboard</h3>
      <p>{{ error }}</p>
      <button @click="fetchLeaderboard" class="mt-4 px-6 py-2 bg-red-500/20 hover:bg-red-500/40 rounded-full transition-colors font-semibold">
        Try Again
      </button>
    </div>

    <div v-else class="leaderboard-card bg-surface-dark/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
      <!-- Podium for Top 3 -->
      <div class="podium-section p-8 bg-black/20 flex flex-col md:flex-row justify-center items-end gap-6 md:gap-12 border-b border-white/10">
        <!-- Rank 2 -->
        <div v-if="topPlayers[1]" class="podium-item flex flex-col items-center order-2 md:order-1 transform hover:-translate-y-2 transition-transform duration-300">
          <div class="relative mb-2">
            <div class="w-20 h-20 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 p-1 shadow-lg shadow-gray-500/30">
              <div class="w-full h-full rounded-full bg-surface-dark flex items-center justify-center overflow-hidden">
                <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${topPlayers[1].username}`" alt="Avatar" class="w-full h-full object-cover bg-white" />
              </div>
            </div>
            <div class="absolute -bottom-3 -right-2 bg-gray-400 text-gray-900 font-bold w-8 h-8 rounded-full flex items-center justify-center border-2 border-surface-dark">2</div>
          </div>
          <div class="text-lg font-bold text-white mt-2">{{ topPlayers[1].username }}</div>
          <div class="text-yellow-400 font-semibold flex items-center gap-1">
            <span>⭐</span> {{ topPlayers[1].totalXP }} XP
          </div>
          <div class="h-24 w-24 bg-gradient-to-t from-gray-600/50 to-gray-400/20 rounded-t-lg mt-4 border-t border-x border-gray-400/30 flex items-end justify-center pb-2">
            <span class="text-gray-300 font-bold">Lvl {{ topPlayers[1].currentLevel }}</span>
          </div>
        </div>

        <!-- Rank 1 -->
        <div v-if="topPlayers[0]" class="podium-item flex flex-col items-center order-1 md:order-2 transform hover:-translate-y-3 transition-transform duration-300 relative z-10">
          <div class="absolute -top-10 text-4xl animate-bounce">👑</div>
          <div class="relative mb-2">
            <div class="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700 p-1 shadow-xl shadow-yellow-500/40">
              <div class="w-full h-full rounded-full bg-surface-dark flex items-center justify-center overflow-hidden">
                <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${topPlayers[0].username}`" alt="Avatar" class="w-full h-full object-cover bg-white" />
              </div>
            </div>
            <div class="absolute -bottom-4 -right-2 bg-yellow-500 text-yellow-900 font-bold w-10 h-10 rounded-full flex items-center justify-center border-2 border-surface-dark text-lg">1</div>
          </div>
          <div class="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 mt-3">{{ topPlayers[0].username }}</div>
          <div class="text-yellow-400 font-bold flex items-center gap-1 text-lg">
            <span>⭐</span> {{ topPlayers[0].totalXP }} XP
          </div>
          <div class="h-32 w-28 bg-gradient-to-t from-yellow-600/50 to-yellow-400/20 rounded-t-xl mt-4 border-t-2 border-x-2 border-yellow-400/50 flex items-end justify-center pb-3 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
             <span class="text-yellow-300 font-bold text-lg">Lvl {{ topPlayers[0].currentLevel }}</span>
          </div>
        </div>

        <!-- Rank 3 -->
        <div v-if="topPlayers[2]" class="podium-item flex flex-col items-center order-3 transform hover:-translate-y-2 transition-transform duration-300">
          <div class="relative mb-2">
            <div class="w-20 h-20 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 p-1 shadow-lg shadow-amber-700/30">
              <div class="w-full h-full rounded-full bg-surface-dark flex items-center justify-center overflow-hidden">
                <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${topPlayers[2].username}`" alt="Avatar" class="w-full h-full object-cover bg-white" />
              </div>
            </div>
            <div class="absolute -bottom-3 -right-2 bg-amber-700 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center border-2 border-surface-dark">3</div>
          </div>
          <div class="text-lg font-bold text-white mt-2">{{ topPlayers[2].username }}</div>
          <div class="text-yellow-400 font-semibold flex items-center gap-1">
            <span>⭐</span> {{ topPlayers[2].totalXP }} XP
          </div>
          <div class="h-20 w-24 bg-gradient-to-t from-amber-900/50 to-amber-700/20 rounded-t-lg mt-4 border-t border-x border-amber-700/30 flex items-end justify-center pb-2">
             <span class="text-amber-500 font-bold">Lvl {{ topPlayers[2].currentLevel }}</span>
          </div>
        </div>
      </div>

      <!-- Rest of the List -->
      <div class="list-section p-4 md:p-6">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="text-text-muted text-sm uppercase tracking-wider border-b border-white/5">
                <th class="p-4 font-semibold w-20 text-center">Rank</th>
                <th class="p-4 font-semibold">User</th>
                <th class="p-4 font-semibold text-center">Level</th>
                <th class="p-4 font-semibold text-right">Badges</th>
                <th class="p-4 font-semibold text-right">Total XP</th>
              </tr>
            </thead>
            <transition-group name="list" tag="tbody">
              <tr v-for="(player, index) in remainingPlayers" :key="player.username" 
                  class="border-b border-white/5 hover:bg-white/5 transition-colors group">
                <td class="p-4 text-center font-bold text-text-muted group-hover:text-white transition-colors">
                  {{ index + 4 }}
                </td>
                <td class="p-4">
                  <div class="flex items-center gap-3">
                    <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${player.username}`" class="w-10 h-10 rounded-full bg-white/10" />
                    <span class="font-medium text-white">{{ player.username }}</span>
                  </div>
                </td>
                <td class="p-4 text-center">
                  <span class="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-bold">
                    {{ player.currentLevel }}
                  </span>
                </td>
                <td class="p-4 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <span class="text-blue-400">🏅</span>
                    <span class="text-text font-medium">{{ player.badgeCount }}</span>
                  </div>
                </td>
                <td class="p-4 text-right text-yellow-400 font-bold">
                  {{ player.totalXP.toLocaleString() }}
                </td>
              </tr>
            </transition-group>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { leaderboardApi, type LeaderboardEntryDto } from '@/services/leaderboardApi';

const players = ref<LeaderboardEntryDto[]>([]);
const loading = ref(true);
const error = ref('');

const fetchLeaderboard = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await leaderboardApi.getTopPlayers(50);
    players.value = res;
  } catch (err: any) {
    error.value = err.message || 'An error occurred while fetching leaderboard.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchLeaderboard();
});

const topPlayers = computed(() => players.value.slice(0, 3));
const remainingPlayers = computed(() => players.value.slice(3));
</script>

<style scoped>
.leaderboard-view {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
