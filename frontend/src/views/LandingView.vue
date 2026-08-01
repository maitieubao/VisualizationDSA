<template>
  <div class="min-h-screen flex flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
    <!-- Hero Section -->
    <section class="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-6 py-12 text-center vcr-frame-enter">
      <!-- Glow effect -->
      <div class="pointer-events-none absolute inset-0 flex items-center justify-center opacity-60 mix-blend-screen motion-safe:animate-pulse" style="animation-duration: 4s;">
        <div class="h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,var(--color-accent-primary-glow)_0%,transparent_70%)] blur-3xl"></div>
      </div>
      
      <div class="relative z-10 max-w-2xl">
        <h1 class="mb-4 font-display text-4xl font-bold tracking-tight text-[var(--color-text-heading)] sm:text-5xl md:text-6xl">
          <span class="text-[var(--color-accent-primary)]">~/</span>
          VisualizationDSA
        </h1>
        <p class="mb-2 text-lg text-[var(--color-text-secondary)] sm:text-xl">
          Nền tảng trực quan hóa
          <span class="font-semibold text-[var(--color-text-heading)]">Cấu trúc Dữ liệu &amp; Giải thuật</span>
          dành cho sinh viên Việt Nam
        </p>
        <p class="mb-8 text-sm text-[var(--color-text-muted)]">
          Khám phá Sorting, Graph, OOP, SOLID, Design Patterns, DI/IoC —
          tất cả trong một giao diện tương tác cinematic.
        </p>
        <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button class="cursor-pointer select-none inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold text-[length:var(--font-semibold)] bg-[var(--color-accent-primary)] text-white shadow-[0_0_20px_var(--color-accent-primary-glow)] transition-[transform,box-shadow,background-color] duration-[var(--duration-normal)] ease-[var(--ease-spring)] hover:bg-[var(--color-accent-primary-light)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-primary)] w-full sm:w-auto" @click="handleCta">
            {{ authStore.isAuthenticated ? 'Vào bảng điều khiển ➔' : 'Bắt đầu ngay' }}
          </button>
          <a href="https://github.com/maitieubao/VisualizationDSA"
             target="_blank" rel="noopener noreferrer"
             class="cursor-pointer inline-flex items-center justify-center rounded-lg px-6 py-3 bg-transparent text-[var(--color-text-secondary)] ring-1 ring-[var(--color-border-default)] hover:text-[var(--color-text-heading)] hover:bg-[var(--color-bg-hover)] hover:ring-[var(--color-border-strong)] transition-[transform,background-color,box-shadow] duration-[var(--duration-normal)] ease-[var(--ease-smooth)] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] w-full sm:w-auto">
            Mã nguồn GitHub
          </a>
        </div>
      </div>
    </section>

    <!-- Feature Grid -->
    <section class="mx-auto w-full max-w-7xl px-6 py-12">
      <h2 class="mb-10 text-center font-display text-2xl font-semibold text-[var(--color-text-heading)]">Modules học tập</h2>
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="(feature, index) in features" :key="feature.icon" 
             class="spring-hover stagger-enter rounded-xl p-5 sm:p-6 bg-[var(--color-bg-surface)] border border-[var(--color-border-card)] shadow-[var(--shadow-card)] transition-[box-shadow,transform,border-color] duration-[var(--duration-normal)] ease-[var(--ease-smooth)]"
             :style="`animation-delay: ${index * 0.05}s`">
          <BaseIcon :name="feature.icon" class="mb-4 h-8 w-8 text-[var(--color-accent-primary)]" />
          <h3 class="mb-1.5 text-base font-semibold text-[var(--color-text-heading)]">{{ feature.title }}</h3>
          <p class="text-sm leading-relaxed text-[var(--color-text-secondary)]">{{ feature.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Stats bar -->
    <section class="mt-auto border-t border-[var(--color-border-subtle)]">
      <div class="mx-auto flex max-w-5xl flex-wrap justify-center gap-8 p-8 md:gap-16">
        <div class="text-center" v-for="stat in stats" :key="stat.label">
          <span class="block font-display text-3xl font-bold text-[var(--color-text-heading)] drop-shadow-[0_0_12px_var(--color-accent-primary-glow)]">{{ stat.value }}</span>
          <span class="mt-1 block text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">{{ stat.label }}</span>
        </div>
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
/* Layout, colors, and shadows migrated entirely to Tailwind tokens based on MASTER.md */
</style>
