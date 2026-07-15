<template>
  <div class="my-rank-card">
    <span class="rank-label">Thứ hạng của bạn</span>
    <div class="rank-info">
      <span class="rank-number">#{{ rank.rank }}</span>
      <span class="rank-xp">{{ rank.totalXP.toLocaleString() }} XP</span>
      <span v-if="rank.isInTop" class="top-badge flex items-center gap-1">Top 20 <BaseIcon name="streak" class="w-3.5 h-3.5 text-accent-yellow" /></span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  rank: { rank: number; totalXP: number; isInTop: boolean };
}>();
</script>

<style scoped>
.my-rank-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(99, 102, 241, 0.1));
  border: 1px solid rgba(6, 182, 212, 0.25);
  border-radius: 10px;
}
.rank-label { font-size: 0.7rem; color: #94a3b8; }
.rank-info  { display: flex; align-items: center; gap: 12px; }
.rank-number { font-size: 1.1rem; font-weight: 800; color: #06b6d4; }
.rank-xp    { font-size: 0.8rem; color: #e2e8f0; }
.top-badge  { font-size: 0.7rem; background: rgba(251, 191, 36, 0.2); color: #fbbf24; padding: 2px 8px; border-radius: 99px; }
</style>
