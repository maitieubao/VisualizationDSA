<template>
  <div class="not-found-container">
    
    <div class="particles" aria-hidden="true">
      <span v-for="i in 12" :key="i" class="particle" :style="particleStyle(i)" />
    </div>

    <div class="not-found-card glass">
      
      <div class="error-code" data-text="404" aria-hidden="true">404</div>

      
      <div class="error-icon">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="32" cy="32" r="30" stroke="var(--color-accent-cyan)" stroke-width="2" stroke-dasharray="6 3" class="rotating-ring" />
          <path d="M21 21L43 43M43 21L21 43" stroke="var(--color-accent-amber)" stroke-width="3" stroke-linecap="round" />
        </svg>
      </div>

      <h1 class="error-title">Trang không tồn tại</h1>
      <p class="error-description">
        Đường dẫn <code class="error-path">{{ currentPath }}</code> không được tìm thấy.<br />
        Trang có thể đã bị xóa hoặc địa chỉ URL không chính xác.
      </p>

      
      <div class="error-actions">
        <button id="btn-go-home" class="btn-primary" @click="goHome">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Về trang chủ
        </button>
        <button id="btn-go-back" class="btn-secondary" @click="goBack">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Quay lại
        </button>
      </div>

      
      <div class="quick-nav">
        <p class="quick-nav-label">Truy cập nhanh:</p>
        <div class="quick-nav-links">
          <router-link to="/sorting" class="quick-link">Sắp xếp</router-link>
          <router-link to="/graph" class="quick-link">Đồ thị</router-link>
          <router-link to="/oop" class="quick-link">OOP</router-link>
          <router-link to="/gamification" class="quick-link">Bảng xếp hạng</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route  = useRoute();

const currentPath = computed(() => route.path);

function goHome(): void {
  router.push('/');
}

function goBack(): void {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/');
  }
}

function particleStyle(i: number): Record<string, string> {
  const angle = (i / 12) * 360;
  const radius = 40 + (i % 3) * 20;
  const size   = 4 + (i % 4) * 3;
  const delay  = (i * 0.4).toFixed(1);
  const dur    = (4 + (i % 3)).toFixed(1);
  return {
    '--angle': `${angle}deg`,
    '--radius': `${radius}px`,
    width:     `${size}px`,
    height:    `${size}px`,
    animationDelay:    `${delay}s`,
    animationDuration: `${dur}s`,
  };
}
</script>

<style scoped>
@import "./NotFoundView.css";
</style>
