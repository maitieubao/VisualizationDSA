<template>
  <div class="landing">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero__glow"></div>
      <div class="hero__content">
        <h1 class="hero__title">
          <span class="hero__prefix">~/</span>
          <span class="hero__name">VisualizationDSA</span>
        </h1>
        <p class="hero__tagline">
          Nền tảng trực quan hóa
          <span class="hero__highlight">Cấu trúc Dữ liệu &amp; Giải thuật</span>
          dành cho sinh viên Việt Nam
        </p>
        <p class="hero__sub">
          Khám phá Sorting, Graph, OOP, SOLID, Design Patterns, DI/IoC —
          tất cả trong một giao diện tương tác cinematic.
        </p>
        <div class="hero__actions">
          <button class="hero__cta hero__cta--primary" @click="handleCta">
            {{ authStore.isAuthenticated ? 'Vào bảng điều khiển ➔' : 'Bắt đầu ngay' }}
          </button>
          <a href="https://github.com/maitieubao/VisualizationDSA"
             target="_blank" rel="noopener noreferrer"
             class="hero__cta hero__cta--ghost">
            Mã nguồn GitHub
          </a>
        </div>
      </div>
    </section>

    <!-- Feature Grid -->
    <section class="features">
      <h2 class="features__heading">Modules học tập</h2>
      <div class="features__grid">
        <div v-for="feature in features" :key="feature.icon" class="feature-card">
          <BaseIcon :name="feature.icon" class="feature-card__icon" />
          <h3 class="feature-card__title">{{ feature.title }}</h3>
          <p class="feature-card__desc">{{ feature.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Stats bar -->
    <section class="stats-bar">
      <div class="stat-item" v-for="stat in stats" :key="stat.label">
        <span class="stat-item__value">{{ stat.value }}</span>
        <span class="stat-item__label">{{ stat.label }}</span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '../features/auth/store/useAuthStore';

const emit = defineEmits<{ openLogin: [] }>();
const authStore = useAuthStore();
const router = useRouter();

function handleCta(): void {
  if (authStore.isAuthenticated) {
    router.push('/dashboard');
  } else {
    emit('openLogin');
  }
}

const features = [
  { icon: 'sorting', title: 'Thuật toán Sắp xếp', desc: '7 thuật toán sắp xếp với hoạt ảnh VCR từng bước' },
  { icon: 'graph', title: 'Sân chơi Đồ thị', desc: 'BFS, DFS, Dijkstra — kéo thả đồ thị tương tác' },
  { icon: 'oop', title: 'Trực quan OOP', desc: 'Encapsulation, Inheritance, Polymorphism trực quan' },
  { icon: 'solid', title: 'Nguyên tắc SOLID', desc: '5 nguyên tắc SOLID với ví dụ vi phạm & tuân thủ' },
  { icon: 'patterns', title: 'Mẫu thiết kế', desc: 'Observer, Strategy, Factory — UML + mã nguồn' },
  { icon: 'di', title: 'DI/IoC Container', desc: 'Dependency Injection với Singleton, Transient, Scoped' },
  { icon: 'quiz', title: 'Hệ thống Trắc nghiệm', desc: '27+ câu hỏi trắc nghiệm tiếng Việt kèm giải thích' },
  { icon: 'gamification', title: 'Trò chơi hóa', desc: 'XP, Level, Huy hiệu, Bảng xếp hạng — học mà chơi' },
] as const;

const stats = [
  { value: '7+', label: 'Thuật toán Sắp xếp' },
  { value: '27+', label: 'Câu hỏi Trắc nghiệm' },
  { value: '8', label: 'Cấp độ Huy hiệu' },
  { value: '100%', label: 'Tiếng Việt' },
] as const;
</script>

<style scoped>
.landing {
  min-height: 100%;
  padding-bottom: 3rem;
  background: var(--bg-primary, #0a0a0f);
  color: var(--text-primary, #e2e8f0);
}

/* ── Hero ───────────────────────────────────────────── */
.hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: 3rem 2rem;
  text-align: center;
  overflow: hidden;
}

.hero__glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 600px;
  height: 600px;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
  pointer-events: none;
  animation: pulseGlow 4s ease-in-out infinite;
}

@keyframes pulseGlow {
  0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
}

.hero__content {
  position: relative;
  z-index: 1;
  max-width: 680px;
}

.hero__title {
  font-size: 3.5rem;
  font-weight: 700;
  font-family: var(--font-display);
  margin-bottom: 1rem;
}

.hero__prefix {
  color: #6366f1;
}

.hero__name {
  background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero__tagline {
  font-size: 1.25rem;
  line-height: 1.6;
  color: var(--text-secondary, #94a3b8);
  margin-bottom: 0.5rem;
}

.hero__highlight {
  color: #a855f7;
  font-weight: 600;
}

.hero__sub {
  font-size: 0.95rem;
  color: var(--text-tertiary, #64748b);
  margin-bottom: 2rem;
}

.hero__actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.hero__cta {
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.hero__cta--primary {
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: #fff;
  border: none;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
}

.hero__cta--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px rgba(99, 102, 241, 0.45);
}

.hero__cta--ghost {
  background: transparent;
  color: var(--text-secondary, #94a3b8);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
}

.hero__cta--ghost:hover {
  border-color: #6366f1;
  color: #6366f1;
}

/* ── Features Grid ──────────────────────────────────── */
.features {
  padding: 3rem 2rem;
  max-width: 1100px;
  margin: 0 auto;
}

.features__heading {
  text-align: center;
  font-size: 1.5rem;
  margin-bottom: 2rem;
  color: var(--text-primary, #e2e8f0);
}

.features__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.25rem;
}

.feature-card {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.25rem;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(99, 102, 241, 0.12);
  border-color: rgba(99, 102, 241, 0.3);
}

.feature-card__icon {
  width: 2rem;
  height: 2rem;
  display: block;
  margin-bottom: 0.75rem;
  color: var(--color-accent-primary, #6366f1);
}

.feature-card__title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.4rem;
  color: var(--text-primary, #e2e8f0);
}

.feature-card__desc {
  font-size: 0.85rem;
  color: var(--text-tertiary, #64748b);
  line-height: 1.5;
}

/* ── Stats Bar ──────────────────────────────────────── */
.stats-bar {
  display: flex;
  justify-content: center;
  gap: 3rem;
  padding: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
}

.stat-item__value {
  display: block;
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-item__label {
  font-size: 0.8rem;
  color: var(--text-tertiary, #64748b);
}

/* ── Responsive ─────────────────────────── */
@media (max-width: 768px) {
  .hero { min-height: 55vh; padding: 2rem 1.5rem; }
  .hero__title { font-size: 2.5rem; }
  .hero__tagline { font-size: 1.05rem; }
  .features { padding: 2rem 1.5rem; }
  .features__grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
  .stats-bar { gap: 2rem; }
}

@media (max-width: 480px) {
  .hero__title { font-size: 1.8rem; }
  .hero__tagline { font-size: 0.95rem; }
  .hero__actions { flex-direction: column; align-items: stretch; }
  .hero__cta { text-align: center; }
  .features__grid { grid-template-columns: 1fr; }
  .stats-bar { gap: 1.5rem; padding: 1.5rem 1rem; }
  .stat-item__value { font-size: 1.4rem; }
}
</style>
