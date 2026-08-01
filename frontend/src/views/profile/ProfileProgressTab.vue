<template>
  <section class="panel-section">
    <div class="panel-header">
      <h2 class="panel-title">Badges & Progress</h2>
      <p class="panel-subtitle">Theo dõi cấp độ học tập, điểm kinh nghiệm XP và bộ sưu tập huy hiệu của bạn.</p>
    </div>

    
    <div class="pm-card xp-overview-card">
      <div class="xp-card-header">
        <div class="xp-title-group">
          <span class="level-badge">CẤP ĐỘ {{ authStore.userLevel }}</span>
          <span class="xp-amount-text">{{ authStore.userXP }} XP</span>
        </div>
        <span class="xp-hint-text" v-if="xpToNext > 0">
          Cần thêm <strong>{{ xpToNext }} XP</strong> để thăng Cấp {{ authStore.userLevel + 1 }}
        </span>
        <span class="xp-hint-text" v-else>Bạn đã đạt cấp độ tối đa!</span>
      </div>

      <div class="pm-progress-track">
        <div class="pm-progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
    </div>

    
    <div class="badges-panel-group">
      <div class="group-title-row">
        <h3>Huy hiệu đã mở khóa ({{ badgesList.length }})</h3>
        <router-link to="/quiz" class="btn-link-action">
          Làm trắc nghiệm để nhận thêm →
        </router-link>
      </div>

      <div v-if="badgesList.length > 0" class="badges-postman-grid">
        <div v-for="badge in badgesList" :key="badge.id" class="pm-badge-card" :style="{ '--badge-theme': badge.color }">
          <div class="badge-icon-box" :style="{ backgroundColor: badge.color + '1A', color: badge.color }">
            <BaseIcon :name="getBadgeIconName(badge.icon)" class="w-6 h-6" />
          </div>
          <div class="badge-body">
            <h4 class="badge-name">{{ badge.name }}</h4>
            <p class="badge-description">{{ badge.description }}</p>
            <span class="badge-date">Ngày nhận: {{ formatDate(badge.earnedAt) }}</span>
          </div>
        </div>
      </div>

      <div v-else class="empty-state-box">
        <BaseIcon name="medal" class="w-10 h-10 text-slate-500 mb-2" />
        <p class="empty-title">Chưa nhận được huy hiệu nào</p>
        <p class="empty-desc">Hoàn thành bài tập trắc nghiệm và bài học DSA để nhận huy hiệu đầu tiên.</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '../../features/auth/store/useAuthStore';

const authStore = useAuthStore();
const levelThresholds = [0, 100, 300, 600, 1000, 1500, 2200, 3000];

const xpToNext = computed(() => {
  const lvl = authStore.userLevel;
  if (lvl >= levelThresholds.length) return 0;
  return levelThresholds[lvl] - authStore.userXP;
});

const progressPercent = computed(() => {
  const lvl = authStore.userLevel;
  if (lvl <= 0 || lvl >= levelThresholds.length) return 100;
  const prev = levelThresholds[lvl - 1];
  const next = levelThresholds[lvl];
  const range = next - prev;
  if (range <= 0) return 100;
  return Math.min(100, ((authStore.userXP - prev) / range) * 100);
});

interface Badge { id: string; name: string; description: string; icon: string; color: string; earnedAt: string; }

function getBadgeIconName(emojiIcon: string): string {
  const map: Record<string, string> = {
    '🏆': 'dsa-champion', '📊': 'sorting-wizard', '🧬': 'oop-guru',
    '🏗️': 'solid-master', '🎨': 'pattern-hunter', '💉': 'system-architect',
    '📝': 'first-steps', '🏅': 'badge'
  };
  return map[emojiIcon] || 'badge';
}

const badgesList = computed<Badge[]>(() => {
  const badges = authStore.currentUser?.badges || [];
  return badges.map(b => {
    const raw = b as Record<string, unknown>;
    return {
      id: String(raw.id || ''), name: String(raw.name || ''),
      description: String(raw.description || ''), icon: String(raw.icon || '🏅'),
      color: String(raw.color || '#6366f1'), earnedAt: String(raw.earnedAt || new Date().toISOString())
    };
  });
});

function formatDate(dateString: string): string {
  try { return new Date(dateString).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' }); }
  catch { return dateString; }
}
</script>
