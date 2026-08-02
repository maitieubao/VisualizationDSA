<template>
  <div class="dashboard stagger-enter">
    
    <div class="greeting-banner glass-panel spring-hover" data-aos="fade-down">
      <div class="greeting-banner__content">
        <h1 class="greeting-banner__title font-display text-2xl mb-2">
          Chào mừng <span class="greeting-banner__name text-gradient">{{ authStore.userName }}</span> quay trở lại!
        </h1>
        <p class="greeting-banner__sub text-secondary">
          Level <span class="text-accent font-bold">{{ authStore.userLevel }}</span> · <span class="text-accent-warm font-bold">{{ authStore.userXP }} XP</span> ·
          <span v-if="authStore.isTeacher" class="role-tag role-tag--teacher">Giảng viên</span>
          <span v-else class="role-tag role-tag--student">Sinh viên</span>
        </p>
      </div>
      <div class="greeting-banner__graphic ambient-float">
        <BaseIcon name="gamification" class="w-16 h-16 text-accent opacity-20" />
      </div>
    </div>

    
    <div class="dashboard__grid">


      


      <div class="dash-card quickstart-card glass-panel spring-hover" data-aos="fade-up" data-aos-delay="100">
        <h3 class="dash-card__title">
          <BaseIcon name="playground" class="w-4 h-4 text-accent inline-block mr-1 align-text-bottom" />
          Khám phá Lộ trình học
        </h3>
        <p class="quickstart-intro">Bắt đầu hành trình chinh phục Thuật toán bằng cách đi theo lộ trình được thiết kế sẵn:</p>
        <div class="quickstart-steps">
          <router-link to="/courses" class="quickstart-item" style="border-color: rgba(99, 102, 241, 0.4); background: rgba(99, 102, 241, 0.05);">
            <div class="quickstart-item__content">
              <span class="quickstart-item__title text-accent">Xem Bản đồ Lộ trình</span>
              <span class="quickstart-item__desc">Học qua từng bài học, mô phỏng trực quan và bài tập thực hành.</span>
            </div>
            <BaseIcon name="arrow-right" class="quickstart-item__arrow text-accent" />
          </router-link>
          
          <router-link to="/classrooms" class="quickstart-item mt-3">
            <div class="quickstart-item__content">
              <span class="quickstart-item__title">Tham gia Lớp học</span>
              <span class="quickstart-item__desc">Nhập mã từ Giảng viên để theo dõi tiến độ cùng lớp.</span>
            </div>
            <BaseIcon name="arrow-right" class="quickstart-item__arrow" />
          </router-link>
        </div>
        <router-link to="/courses" class="quickstart-tour-btn text-center block mt-4">
          Bắt đầu ngay
        </router-link>
      </div>

      

      <!-- User Progress Header -->
      
      <div class="dash-card xp-card glass-panel spring-hover" data-aos="fade-up" data-aos-delay="150">
        <h3 class="dash-card__title">Tiến trình XP</h3>
        <div class="xp-wheel">
          <svg viewBox="0 0 120 120" class="xp-wheel__svg">
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="8" />
            <circle cx="60" cy="60" r="52"
              fill="none"
              stroke="url(#xpGrad)"
              stroke-width="8"
              stroke-linecap="round"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="dashOffset"
              class="xp-wheel__progress"
            />
            <defs>
              <linearGradient id="xpGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#6366f1" />
                <stop offset="100%" stop-color="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
          <div class="xp-wheel__center">
            <span class="xp-wheel__level">Lv.{{ authStore.userLevel }}</span>
            <span class="xp-wheel__xp"><span class="xp-num">{{ authStore.userXP }}</span> XP</span>
          </div>
        </div>
        <p class="xp-card__hint">{{ xpToNext }} XP để lên level tiếp theo</p>
      </div>

      <div class="dash-card streak-card glass-panel spring-hover" data-aos="fade-up" data-aos-delay="200">
        <h3 class="dash-card__title">Chuỗi ngày học</h3>
        <div class="flex items-center justify-center gap-4 py-2">
          <BaseIcon name="fire" class="w-10 h-10 text-accent-warm animate-pulse" />
          <div>
            <div class="text-2xl font-bold text-accent-warm"><span class="streak-num">3</span> Ngày</div>
            <div class="text-xs text-text-tertiary">Giữ lửa học tập!</div>
          </div>
        </div>
        <div class="flex justify-between mt-4">
          <div v-for="d in ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']" :key="d" 
            class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-200" 
            :class="d === 'T2' || d === 'T3' || d === 'T4' ? 'bg-accent-warm/20 text-accent-warm border border-accent-warm/50' : 'bg-bg-surface text-text-disabled border border-border-default'">
            {{ d }}
          </div>
        </div>
      </div>

      <div class="dash-card glass-panel spring-hover" style="padding: 0; overflow: hidden;" data-aos="fade-up" data-aos-delay="250">
        <DailyQuestsCard />
      </div>

      <div class="dash-card glass-panel spring-hover" style="padding: 0; overflow: hidden;" data-aos="fade-up" data-aos-delay="300">
        <SkillRadarChart />
      </div>

      
      <div class="dash-card badges-card glass-panel spring-hover" data-aos="zoom-in" data-aos-delay="350">
        <h3 class="dash-card__title">Huy hiệu đã mở</h3>
        <div class="badges-grid">
          <div v-for="badge in topBadges" :key="badge.id" class="badge-item">
            <BaseIcon :name="getBadgeIconName(badge.icon)" class="badge-item__icon" />
            <span class="badge-item__name">{{ badge.name }}</span>
          </div>
          <div v-if="topBadges.length === 0" class="badges-empty flex flex-col items-center">
            <LottiePlayer path="https://lottie.host/8c067882-abcf-4d92-bf3f-bdff6a24683d/v2p60HlPib.json" size="80px" />
            <span class="mt-2 text-sm">Chưa có huy hiệu nào. Hãy bắt đầu học!</span>
          </div>
        </div>
      </div>

      
      <div class="dash-card quicklinks-card glass-panel spring-hover" data-aos="fade-up" data-aos-delay="400">
        <h3 class="dash-card__title">Truy cập nhanh</h3>
        <div class="quicklinks">
          <router-link to="/courses" class="quicklink">
            <BaseIcon name="learning-path" class="quicklink__icon" />
            <span>Bản đồ Lộ trình</span>
          </router-link>
          <router-link to="/gamification" class="quicklink">
            <BaseIcon name="gamification" class="quicklink__icon" />
            <span>Bảng xếp hạng</span>
          </router-link>
          <router-link to="/gems-shop" class="quicklink">
            <BaseIcon name="shopping-bag" class="quicklink__icon" />
            <span>Cửa hàng Gems</span>
          </router-link>
          <router-link v-if="authStore.isTeacher" to="/teacher" class="quicklink quicklink--teacher">
            <BaseIcon name="academic" class="quicklink__icon" />
            <span>Quản lý Giảng viên</span>
          </router-link>
          <router-link v-if="authStore.isTeacher" to="/teacher-studio" class="quicklink quicklink--teacher">
            <BaseIcon name="presentation-chart-line" class="quicklink__icon" />
            <span>Teacher Studio</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import SkillRadarChart from '@/features/gamification/user-progress/components/SkillRadarChart.vue';
import DailyQuestsCard from '@/features/gamification/components/DailyQuestsCard.vue';
import LottiePlayer from '@/shared/components/LottiePlayer.vue';

import { useGuidedTourStore } from '@/features/guided-tour/store/useGuidedTourStore';
import { onMounted, onUnmounted, watch } from 'vue';
import gsap from 'gsap';

const authStore = useAuthStore();
const router = useRouter();

const levelThresholds = [0, 100, 300, 600, 1000, 1500, 2200, 3000];
const circumference = 2 * Math.PI * 52;

const xpToNext = computed(() => {
  const lvl = authStore.userLevel;
  if (lvl >= levelThresholds.length) return 0;
  return levelThresholds[lvl] - authStore.userXP;
});

const progressPercent = computed(() => {
  const lvl = authStore.userLevel;
  if (lvl <= 0) return 0;
  if (lvl >= levelThresholds.length) return 100;
  const prev = levelThresholds[lvl - 1];
  const next = levelThresholds[lvl];
  const range = next - prev;
  if (range <= 0) return 100;
  return Math.min(100, ((authStore.userXP - prev) / range) * 100);
});

const dashOffset = computed(() => {
  return circumference * (1 - progressPercent.value / 100);
});

interface BadgeDisplay {
  id: string;
  name: string;
  icon: string;
}

const topBadges = computed<BadgeDisplay[]>(() => {
  const badges = authStore.currentUser?.badges ?? [];
  return [...badges].reverse().slice(0, 3).map((badge) => {
    const b = badge as Record<string, unknown>;
    return {
      id: String(b.id ?? ''),
      name: String(b.name ?? ''),
      icon: String(b.icon ?? '🏅'),
    };
  });
});

function getBadgeIconName(emojiIcon: string): string {
  const map: Record<string, string> = {
    '🏆': 'dsa-champion',
    '📊': 'sorting-wizard',
    '🧬': 'oop-guru',
    '🏗️': 'solid-master',
    '🎨': 'pattern-hunter',
    '💉': 'system-architect',
    '📝': 'first-steps',
    '🏅': 'badge'
  };
  return map[emojiIcon] || 'badge';
}

async function startSortingTour() {
  await router.push('/sorting');
  // tourStore.startPageTour('/sorting', true);
}

let ctx: gsap.Context;

onMounted(() => {
  ctx = gsap.context(() => {
    // XP Number Counter
    gsap.fromTo('.xp-num',
      { innerHTML: 0 },
      {
        innerHTML: authStore.userXP,
        duration: 2,
        ease: 'power2.out',
        snap: { innerHTML: 1 }
      }
    );

    // Streak Number Counter
    gsap.fromTo('.streak-num',
      { innerHTML: 0 },
      {
        innerHTML: 3,
        duration: 1.5,
        ease: 'power2.out',
        snap: { innerHTML: 1 }
      }
    );
  });
});

watch(() => authStore.userXP, (newVal) => {
  if (ctx) {
    gsap.to('.xp-num', {
      innerHTML: newVal,
      duration: 1,
      ease: 'power2.out',
      snap: { innerHTML: 1 }
    });
  }
});

onUnmounted(() => {
  if (ctx) ctx.revert();
});
</script>

<style scoped>
.dashboard {
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  padding: 2rem;
  min-height: 100%;
  overflow-y: auto;
}

.greeting-banner {
  text-align: center;
  margin-bottom: 2rem;
  padding: 2rem;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.08));
  border: 1px solid rgba(99, 102, 241, 0.2);
  animation: fadeSlideIn 0.5s ease;
}

@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.greeting-banner__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary, #e2e8f0);
}

.greeting-banner__name {
  background: linear-gradient(135deg, #6366f1, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.greeting-banner__sub {
  font-size: 0.9rem;
  color: var(--text-secondary, #94a3b8);
  margin-top: 0.5rem;
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


.dashboard__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

.dash-card {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.5rem;
}

.dash-card__title {
  font-size: 0.9rem;
  color: var(--text-secondary, #94a3b8);
  margin-bottom: 1rem;
  font-weight: 500;
}




.quickstart-card {
  grid-column: 1 / -1;
}

.quickstart-intro {
  font-size: 0.85rem;
  color: var(--text-tertiary, #64748b);
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
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  text-decoration: none;
  transition: all 0.2s ease;
}

.quickstart-item:hover {
  background: rgba(99, 102, 241, 0.08);
  border-color: rgba(99, 102, 241, 0.2);
  transform: translateY(-1px);
}

.quickstart-item__number {
  width: 28px;
  height: 28px;
  min-width: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.15));
  color: #818cf8;
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
  color: var(--text-tertiary, #64748b);
  line-height: 1.3;
}

.quickstart-item__arrow {
  color: var(--text-disabled, #334155);
  font-size: 0.9rem;
  transition: color 0.15s ease;
}

.quickstart-item:hover .quickstart-item__arrow {
  color: #818cf8;
}

.quickstart-tour-btn {
  margin-top: 1rem;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #818cf8;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.quickstart-tour-btn:hover {
  background: rgba(99, 102, 241, 0.18);
  box-shadow: 0 0 12px rgba(99, 102, 241, 0.15);
}


.xp-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.xp-wheel {
  position: relative;
  width: 140px;
  height: 140px;
}

.xp-wheel__svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.xp-wheel__progress {
  transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.xp-wheel__center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.xp-wheel__level {
  display: block;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-text-primary, #e2e8f0);
}

.xp-wheel__xp {
  font-size: 0.75rem;
  color: var(--text-tertiary, #64748b);
}

.xp-card__hint {
  font-size: 0.8rem;
  color: var(--text-tertiary, #64748b);
  margin-top: 0.75rem;
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
  background: rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.badge-item__icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-accent-primary);
}

.badge-item__name {
  font-size: 0.8rem;
  color: var(--color-text-primary, #e2e8f0);
}

.badges-empty {
  font-size: 0.85rem;
  color: var(--text-tertiary, #64748b);
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
  background: rgba(255, 255, 255, 0.06);
}

.quicklink--teacher {
  border: 1px solid rgba(234, 179, 8, 0.2);
}

.quicklink__icon {
  width: 1.1rem;
  height: 1.1rem;
  color: var(--color-accent-primary);
}


@media (max-width: 768px) {
  .dashboard { padding: 1rem; }
  .dashboard__grid { gap: 1rem; grid-template-columns: 1fr; }
  .dash-card { padding: 1rem; }
  .xp-wheel { width: 110px; height: 110px; }
  .quickstart-steps { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .greeting__title { font-size: 1.3rem; }
  .quicklinks { display: grid; grid-template-columns: 1fr 1fr; }
}
</style>
