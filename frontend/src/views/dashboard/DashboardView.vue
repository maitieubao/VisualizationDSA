<template>
  <div class="dashboard">
    <div class="greeting-banner">
      <div class="greeting-banner__avatar">
        <span class="greeting-banner__avatar-text">{{ initials }}</span>
      </div>
      <h1 class="greeting-banner__title">
        Chào mừng <span class="greeting-banner__name">{{ authStore.userName }}</span> quay trở lại!
      </h1>
      <p class="greeting-banner__sub">
        <span class="greeting-banner__level">Level {{ authStore.userLevel }}</span>
        <span class="greeting-banner__dot">·</span>
        <span>{{ authStore.userXP }} XP</span>
        <span class="greeting-banner__dot">·</span>
        <span v-if="authStore.isTeacher" class="role-tag role-tag--teacher">Giảng viên</span>
        <span v-else class="role-tag role-tag--student">Sinh viên</span>
      </p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--courses">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__val">{{ stats.totalCourses }}</span>
          <span class="stat-card__label">Khóa học</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--completed">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__val">{{ stats.completedCourses }}</span>
          <span class="stat-card__label">Đã hoàn thành</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--xp">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__val">{{ authStore.userXP }}</span>
          <span class="stat-card__label">Tổng XP</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--streak">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__val">{{ stats.streak }}</span>
          <span class="stat-card__label">Streak ngày</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card__body stat-card__body--wide">
          <HeartsWidget />
          <span class="stat-card__label">Tim học tập</span>
        </div>
      </div>
    </div>

    <div class="dashboard__grid">
      <div class="dash-card quickstart-card">
        <h3 class="dash-card__title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          Bắt Đầu Nhanh
        </h3>
        <p class="quickstart-intro">Bạn mới đến? Hãy bắt đầu từ đây:</p>
        <div class="quickstart-steps">
          <router-link to="/sorting" class="quickstart-item">
            <span class="quickstart-item__number">1</span>
            <div class="quickstart-item__content">
              <span class="quickstart-item__title">Xem mô phỏng Bubble Sort</span>
              <span class="quickstart-item__desc">Hiểu cách sắp xếp nổi bọt hoạt động qua hoạt ảnh trực quan</span>
            </div>
            <span class="quickstart-item__arrow"><BaseIcon name="arrow-right" class="w-4 h-4" /></span>
          </router-link>
          <router-link to="/quiz" class="quickstart-item">
            <span class="quickstart-item__number">2</span>
            <div class="quickstart-item__content">
              <span class="quickstart-item__title">Thử quiz DSA cơ bản</span>
              <span class="quickstart-item__desc">Kiểm tra kiến thức thuật toán qua trắc nghiệm tương tác</span>
            </div>
            <span class="quickstart-item__arrow"><BaseIcon name="arrow-right" class="w-4 h-4" /></span>
          </router-link>
          <router-link to="/graph" class="quickstart-item">
            <span class="quickstart-item__number">3</span>
            <div class="quickstart-item__content">
              <span class="quickstart-item__title">Khám phá cấu trúc Đồ thị</span>
              <span class="quickstart-item__desc">Vẽ đồ thị, chạy BFS/DFS và Dijkstra trực tiếp trên canvas</span>
            </div>
            <span class="quickstart-item__arrow"><BaseIcon name="arrow-right" class="w-4 h-4" /></span>
          </router-link>
          <router-link to="/oop" class="quickstart-item">
            <span class="quickstart-item__number">4</span>
            <div class="quickstart-item__content">
              <span class="quickstart-item__title">Tìm hiểu OOP trực quan</span>
              <span class="quickstart-item__desc">Xem VTable, Heap và tính kế thừa hoạt động bên trong</span>
            </div>
            <span class="quickstart-item__arrow"><BaseIcon name="arrow-right" class="w-4 h-4" /></span>
          </router-link>
        </div>
        <button class="quickstart-tour-btn" @click="startSortingTour">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Xem hướng dẫn đầy đủ
        </button>
      </div>

      <div class="dash-card xp-card">
        <h3 class="dash-card__title">Tiến trình XP</h3>
        <div class="xp-progress">
          <div class="xp-progress__bar">
            <div class="xp-progress__fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
          <div class="xp-progress__info">
            <span class="xp-progress__level">Lv.{{ authStore.userLevel }}</span>
            <span class="xp-progress__xp">{{ authStore.userXP }} / {{ nextLevelXP }} XP</span>
          </div>
        </div>
        <p class="xp-card__hint">{{ xpToNext }} XP để lên level tiếp theo</p>
      </div>

      <div class="dash-card radar-card">
        <SkillRadarChart />
      </div>

      <!-- F9 (FR-2.10): bản đồ Learning Path — card hiển thị lộ trình đầu tiên có sẵn. -->
      <div class="dash-card learning-path-card">
        <h3 class="dash-card__title">Lộ trình học</h3>
        <LearningPathMap
          v-for="path in visibleLearningPaths"
          :key="path.id"
          :path-id="path.id"
        />
        <p v-if="visibleLearningPaths.length === 0" class="learning-path-empty">
          Chưa có lộ trình học nào.
        </p>
      </div>

      <div class="dash-card badges-card">
        <h3 class="dash-card__title">Huy hiệu đã mở</h3>
        <div class="badges-grid">
          <div v-for="badge in topBadges" :key="badge.id" class="badge-item">
            <span class="badge-item__icon" v-html="parseEmojiToSvg(escapeHtmlText(badge.icon))"></span>
            <span class="badge-item__name">{{ badge.name }}</span>
          </div>
          <div v-if="topBadges.length === 0" class="badges-empty">
            Chưa có huy hiệu nào. Hãy bắt đầu học!
          </div>
        </div>
      </div>

      <div class="dash-card quicklinks-card">
        <h3 class="dash-card__title">Truy cập nhanh</h3>
        <div class="quicklinks">
          <router-link to="/courses" class="quicklink">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            <span>Khóa học</span>
          </router-link>
          <router-link to="/sorting" class="quicklink">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            <span>Sắp xếp</span>
          </router-link>
          <router-link to="/quiz" class="quicklink">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9 9h6M9 13h6M9 17h4"/></svg>
            <span>Trắc nghiệm</span>
          </router-link>
          <router-link to="/gamification" class="quicklink">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
            <span>Bảng xếp hạng</span>
          </router-link>
          <router-link v-if="authStore.isTeacher" to="/teacher" class="quicklink quicklink--teacher">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>Quản lý Giảng viên</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- F9 (FR-10.1): modal hết tim — hiển thị khi store đánh dấu heartsEmpty. -->
    <HeartsEmptyModal v-model="heartsEmptyOpen" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { parseEmojiToSvg, escapeHtmlText } from '../../utils/emojiParser';
import { useGuidedTourStore } from '../../features/guided-tour/store/useGuidedTourStore';
import { useUserProgressStore } from '../../features/user-progress/store/useUserProgressStore';
import { useCourseStore } from '../../features/courses/store/useCourseStore';
import SkillRadarChart from '../../features/user-progress/components/SkillRadarChart.vue';
import LearningPathMap from '../../features/learning-path/components/LearningPathMap.vue';
import HeartsWidget from '../../features/learning-path/components/HeartsWidget.vue';
import HeartsEmptyModal from '../../features/learning-path/components/HeartsEmptyModal.vue';
import { useLearningPathStore } from '../../features/learning-path/store/useLearningPathStore';

const authStore = useAuthStore();
const tourStore = useGuidedTourStore();
const progressStore = useUserProgressStore();
const courseStore = useCourseStore();
const learningPathStore = useLearningPathStore();
const router = useRouter();

onMounted(() => {
  if (courseStore.courses.length === 0) courseStore.loadCourses();
  if (progressStore.completedModuleIds.length === 0) progressStore.initFromServer();
  // F9: tải danh sách lộ trình để hiển thị bản đồ trên dashboard.
  if (learningPathStore.paths.length === 0) learningPathStore.loadPaths();
});

const visibleLearningPaths = computed(() => learningPathStore.paths.slice(0, 2));

// F9: đồng bộ modal hết tim với store (enter node trả 403 HEARTS_EMPTY → heartsEmpty=true).
const heartsEmptyOpen = computed({
  get: () => learningPathStore.heartsEmpty,
  set: (value: boolean) => {
    if (!value) learningPathStore.dismissHeartsEmpty();
  },
});

const initials = computed(() => {
  const name = authStore.userName || 'U';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
});

const levelThresholds = [0, 100, 300, 600, 1000, 1500, 2200, 3000];

const xpToNext = computed(() => {
  const lvl = authStore.userLevel;
  if (lvl >= levelThresholds.length) return 0;
  return levelThresholds[lvl] - authStore.userXP;
});

const nextLevelXP = computed(() => {
  const lvl = authStore.userLevel;
  if (lvl >= levelThresholds.length) return authStore.userXP;
  return levelThresholds[lvl];
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

const stats = computed(() => ({
  totalCourses: courseStore.courses.length,
  completedCourses: progressStore.completedModuleIds.length,
  streak: progressStore.currentStreak,
}));

interface BadgeDisplay {
  id: string;
  name: string;
  icon: string;
}

const topBadges = computed<BadgeDisplay[]>(() => {
  const badges = authStore.currentUser?.badges ?? [];
  return badges.slice(0, 3).map((badge) => {
    const b = badge as Record<string, unknown>;
    return {
      id: String(b.id ?? ''),
      name: String(b.name ?? ''),
      icon: String(b.icon ?? '🏅'),
    };
  });
});

function startSortingTour() {
  router.push('/sorting');
  tourStore.startPageTour('/sorting', true);
}
</script>

<style scoped>
.dashboard {
  padding: 2rem;
  min-height: 100%;
  overflow-y: auto;
}

.greeting-banner {
  text-align: center;
  margin-bottom: 2rem;
  padding: 2rem;
  border-radius: 16px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--color-accent-primary) 12%, transparent), rgba(99, 102, 241, 0.08));
  border: 1px solid var(--color-border-accent);
  animation: fadeSlideIn 0.5s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.greeting-banner__avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-accent-primary), #6366f1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 700;
  color: #fff;
  box-shadow: 0 4px 16px color-mix(in srgb, var(--color-accent-primary) 30%, transparent);
}

.greeting-banner__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary, #e2e8f0);
  margin: 0;
}

.greeting-banner__name {
  background: linear-gradient(135deg, var(--color-accent-primary), #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.greeting-banner__sub {
  font-size: 0.9rem;
  color: var(--color-text-secondary, #94a3b8);
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.greeting-banner__level {
  font-weight: 600;
  color: var(--color-accent-primary, #3d9970);
}

.greeting-banner__dot {
  color: var(--color-text-muted, #475569);
}

.role-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.role-tag--teacher {
  background: rgba(234, 179, 8, 0.15);
  color: #eab308;
}

.role-tag--student {
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  background: color-mix(in srgb, var(--color-bg-surface) 4%, transparent);
  backdrop-filter: blur(16px);
  border: 1px solid var(--color-border-default);
  transition: all 0.2s ease;
}

.stat-card:hover {
  background: var(--color-bg-hover);
  border-color: var(--color-border-strong);
  transform: translateY(-1px);
}

.stat-card__icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-card__icon--courses {
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
}

.stat-card__icon--completed {
  background: color-mix(in srgb, var(--color-accent-emerald) 15%, transparent);
  color: var(--color-accent-emerald-light);
}

.stat-card__icon--xp {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.stat-card__icon--streak {
  background: rgba(244, 63, 94, 0.15);
  color: #fb7185;
}

.stat-card__body {
  display: flex;
  flex-direction: column;
}

.stat-card__val {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary, #e2e8f0);
  line-height: 1.2;
}

.stat-card__label {
  font-size: 0.75rem;
  color: var(--color-text-muted, #64748b);
}

.dashboard__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

.dash-card {
  background: color-mix(in srgb, var(--color-bg-surface) 4%, transparent);
  backdrop-filter: blur(16px);
  border: 1px solid var(--color-border-default);
  border-radius: 12px;
  padding: 1.5rem;
}

.dash-card__title {
  font-size: 0.9rem;
  color: var(--color-text-secondary, #94a3b8);
  margin-bottom: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quickstart-card {
  grid-column: 1 / -1;
}

.quickstart-intro {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-bottom: 1rem;
}

.quickstart-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 0.75rem;
}

.quickstart-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: 10px;
  background: color-mix(in srgb, var(--color-bg-surface) 3%, transparent);
  border: 1px solid var(--color-border-subtle);
  text-decoration: none;
  transition: all 0.2s ease;
}

.quickstart-item:hover {
  background: color-mix(in srgb, var(--color-accent-primary) 8%, transparent);
  border-color: color-mix(in srgb, var(--color-accent-primary) 20%, transparent);
  transform: translateY(-1px);
}

.quickstart-item__number {
  width: 28px;
  height: 28px;
  min-width: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--color-accent-primary) 20%, transparent), rgba(99, 102, 241, 0.15));
  color: var(--color-accent-primary);
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quickstart-item__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.quickstart-item__title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-primary, #e2e8f0);
}

.quickstart-item__desc {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  line-height: 1.3;
}

.quickstart-item__arrow {
  color: var(--color-text-disabled, #334155);
  font-size: 0.9rem;
  transition: color 0.15s ease;
}

.quickstart-item:hover .quickstart-item__arrow {
  color: var(--color-accent-primary);
}

.quickstart-tour-btn {
  margin-top: 1rem;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-accent-primary);
  background: color-mix(in srgb, var(--color-accent-primary) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent-primary) 20%, transparent);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quickstart-tour-btn:hover {
  background: color-mix(in srgb, var(--color-accent-primary) 18%, transparent);
  box-shadow: 0 0 12px color-mix(in srgb, var(--color-accent-primary) 15%, transparent);
}

.xp-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.xp-progress {
  width: 100%;
  margin-bottom: 0.75rem;
}

.xp-progress__bar {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: var(--color-bg-hover);
  overflow: hidden;
}

.xp-progress__fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--color-accent-primary), #6366f1);
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.xp-progress__info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

.xp-progress__level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-primary, #e2e8f0);
}

.xp-progress__xp {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.xp-card__hint {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-top: 0.5rem;
}

.radar-card {
  min-height: 300px;
}

.badges-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.badge-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--color-bg-hover);
  border-radius: 8px;
  border: 1px solid var(--color-border-default);
}

.badge-item__icon {
  font-size: 1.25rem;
}

.badge-item__name {
  font-size: 0.8rem;
  color: var(--color-text-primary, #e2e8f0);
}

.badges-empty {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  font-style: italic;
}

.quicklinks {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.quicklink {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 8px;
  color: var(--color-text-primary, #e2e8f0);
  text-decoration: none;
  font-size: 0.9rem;
  transition: background 0.15s ease;
}

.quicklink:hover {
  background: var(--color-bg-hover);
}

.quicklink--teacher {
  border: 1px solid rgba(234, 179, 8, 0.2);
}

@media (max-width: 768px) {
  .dashboard { padding: 1rem; }
  .dashboard__grid { gap: 1rem; grid-template-columns: 1fr; }
  .dash-card { padding: 1rem; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .quickstart-steps { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .greeting-banner__title { font-size: 1.3rem; }
  .quicklinks { display: grid; grid-template-columns: 1fr 1fr; }
  .stats-grid { grid-template-columns: 1fr 1fr; }
}
</style>