<template>
  <div class="landing">
    
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
            <template v-if="authStore.isAuthenticated">Vào bảng điều khiển <BaseIcon name="arrow-right" class="w-4 h-4 inline ml-1 align-middle" /></template><template v-else>Bắt đầu ngay</template>
          </button>
          <a href="https://github.com/maitieubao/VisualizationDSA"
             target="_blank" rel="noopener noreferrer"
             class="hero__cta hero__cta--ghost">
            Mã nguồn GitHub
          </a>
        </div>
      </div>
    </section>

    
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
import { useAuthStore } from '../../features/auth/store/useAuthStore';

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
@import "./LandingView.css";
</style>
