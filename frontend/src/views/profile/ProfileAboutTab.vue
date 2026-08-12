<template>
  <section class="panel-section">
    <div class="panel-header">
      <h2 class="panel-title">About</h2>
      <p class="panel-subtitle">Thông số phiên bản, cấu trúc kỹ nghệ phần mềm và thông tin nền tảng.</p>
    </div>

    <div class="about-spec-grid">
      <div class="spec-card">
        <span class="spec-label">PHIÊN BẢN ỨNG DỤNG</span>
        <!-- PR-034: phiên bản từ import.meta.env (VITE_APP_VERSION) — không hardcode -->
        <span class="spec-value">VisualizationDSA v{{ appVersion }}</span>
      </div>
      <div class="spec-card">
        <span class="spec-label">ĐỘNG CƠ HOẠT ẢNH</span>
        <span class="spec-value">HTML5 Canvas 2D Lerp 60 FPS</span>
      </div>
      <div class="spec-card">
        <span class="spec-label">KIẾN TRÚC LÕI</span>
        <span class="spec-value">Clean Architecture & Stateless Engine</span>
      </div>
      <div class="spec-card">
        <span class="spec-label">MÔ HÌNH XÁC THỰC</span>
        <span class="spec-value">JWT Bearer & InMemory Session</span>
      </div>
    </div>

    <div class="about-tech-stack">
      <h3>Công nghệ phát triển</h3>
      <div class="tech-tags">
        <span class="tech-tag">Vue 3 (Composition API)</span>
        <span class="tech-tag">TypeScript</span>
        <span class="tech-tag">Pinia State</span>
        <span class="tech-tag">Monaco Editor</span>
        <span class="tech-tag">.NET 10 WebAPI</span>
        <span class="tech-tag">SQLite Database</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// PR-034: phiên bản lấy từ VITE_APP_VERSION (xem frontend/.env.development) —
// fallback chỉ dùng khi biến env vắng mặt trong môi trường build.
const appVersion: string = import.meta.env.VITE_APP_VERSION ?? '2.0.0';
</script>
