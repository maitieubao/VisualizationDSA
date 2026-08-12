<template>
  <section class="panel-section">
    <div class="panel-header">
      <h2 class="panel-title">Badges &amp; Progress</h2>
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

      <!-- PR-025: streak + ngày hoạt động gần nhất từ contract getUserProgress (server) -->
      <div class="xp-streak-row">
        <span class="stat-pill stat-pill--fire"><BaseIcon name="fire" class="w-3.5 h-3.5 inline mr-1 align-middle" />{{ currentStreak }} ngày streak</span>
        <span v-if="lastActiveDate" class="xp-last-active">Hoạt động gần nhất: {{ formatLastActive }}</span>
      </div>
    </div>

    <div class="badges-panel-group">
      <div class="group-title-row">
        <h3>Huy hiệu đã mở khóa ({{ badgesList.length }})</h3>
        <router-link to="/quiz" class="btn-link-action">
          Làm trắc nghiệm để nhận thêm <BaseIcon name="arrow-right" class="w-3 h-3 inline ml-0.5 align-middle" />
        </router-link>
      </div>

      <div v-if="badgesList.length > 0" class="badges-postman-grid">
        <div v-for="badge in badgesList" :key="badge.id" class="pm-badge-card" :style="{ '--badge-theme': badge.color }">
          <!-- PR-031: màu 3 ký tự (#f00) phải mở rộng thành 6 ký tự trước khi nối alpha -->
          <div class="badge-icon-box" :style="{ backgroundColor: expandColor(badge.color) + '1A', color: badge.color }">
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
        <BaseIcon name="medal" class="w-10 h-10 text-text-muted mb-2" />
        <p class="empty-title">Chưa nhận được huy hiệu nào</p>
        <p class="empty-desc">Hoàn thành bài tập trắc nghiệm và bài học DSA để nhận huy hiệu đầu tiên.</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { fetchUserProgress } from '../../features/user-progress/service/userProgressApi';
import type { UserProgressDto } from '../../features/user-progress/service/userProgressApi';
import { statelessGamificationApi } from '../../features/gamification-engine/service/statelessGamificationApi';

const authStore = useAuthStore();

// PR-026: KHÔNG hardcode bảng ngưỡng — lấy từ server `/concepts/gamification/config`
// (levels[].xpRequired). Bảng mặc định chỉ là fallback khi server không trả được.
const FALLBACK_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2200, 3000];
const levelThresholds = ref<number[]>([]);

// PR-025: contract Round 17 — getUserProgress trả currentStreak/lastActiveDate/xpToNextLevel
// do SERVER tính (nguồn chân lý streak, GM-008) thay vì đoán theo giờ local.
const serverProgress = ref<UserProgressDto | null>(null);

onMounted(async () => {
  const token = authStore.getAccessToken();
  if (token) {
    try {
      serverProgress.value = await fetchUserProgress(token);
    } catch {
      // Lỗi mạng/5xx — giữ dữ liệu từ auth store, không đánh đổ UI.
    }
  }
  try {
    const config = await statelessGamificationApi.getConfig();
    const levels = (config as { levels?: Array<{ xpRequired?: number }> }).levels;
    if (Array.isArray(levels) && levels.length > 0) {
      levelThresholds.value = levels.map(l => (typeof l?.xpRequired === 'number' ? l.xpRequired : 0));
    }
  } catch {
    // Server config không trả được — fallback bảng mặc định.
  }
});

const activeThresholds = computed(() => (
  levelThresholds.value.length > 0 ? levelThresholds.value : FALLBACK_THRESHOLDS
));

// PR-016: xpToNext LUÔN clamp Math.max(0, ...) — hết cảnh "Cần thêm -10 XP" vô nghĩa.
const xpToNext = computed(() => {
  const serverValue = serverProgress.value?.xpToNextLevel;
  if (typeof serverValue === 'number') return Math.max(0, serverValue);
  const lvl = authStore.userLevel;
  const table = activeThresholds.value;
  if (lvl >= table.length) return 0;
  return Math.max(0, table[lvl] - authStore.userXP);
});

const progressPercent = computed(() => {
  const serverValue = serverProgress.value?.levelProgressPercent;
  if (typeof serverValue === 'number') return Math.min(100, Math.max(0, serverValue));
  const lvl = authStore.userLevel;
  const table = activeThresholds.value;
  if (lvl <= 0 || lvl >= table.length) return 100;
  const prev = table[lvl - 1];
  const next = table[lvl];
  const range = next - prev;
  if (range <= 0) return 100;
  return Math.min(100, Math.max(0, ((authStore.userXP - prev) / range) * 100));
});

// PR-025: streak hiển thị theo nguồn server trước, fallback auth store.
const currentStreak = computed(() => serverProgress.value?.currentStreak ?? authStore.currentUser?.streakDays ?? 0);
const lastActiveDate = computed(() => serverProgress.value?.lastActiveDate ?? '');

const formatLastActive = computed(() => {
  const date = lastActiveDate.value;
  if (!date) return '';
  try {
    return new Date(date).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return date;
  }
});

interface Badge { id: string; name: string; description: string; icon: string; color: string; earnedAt: string; }

// PR-031: chuẩn hóa màu 3 ký tự (#f00 → #ff0000) trước khi nối alpha "1A" — tránh "#f001A".
function expandColor(color: string): string {
  const trimmed = color.trim();
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    return '#' + trimmed.slice(1).split('').map(c => c + c).join('');
  }
  return trimmed;
}

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
