<template>
  <section class="flex-1 min-h-0">
    <template v-if="isMinimalMode">
      <!-- Premium guard overlay -->
      <div v-if="isPremiumBlocked" class="embed-premium-overlay">
        <div class="embed-premium-card">
          <div class="embed-premium-icon">🔒</div>
          <h2>Nội dung Premium</h2>
          <p>Nội dung này yêu cầu tài khoản Premium để truy cập.</p>
          <a :href="loginUrl" class="embed-premium-btn">Đăng nhập / Nâng cấp</a>
        </div>
      </div>
      <!-- Invalid algo error -->
      <div v-else-if="isInvalidAlgo" class="embed-error-overlay">
        <div class="embed-error-card">
          <div class="embed-error-icon">⚠️</div>
          <h2>Thuật toán không hợp lệ</h2>
          <p>Tham số <code>algo={{ algoParam }}</code> không được hỗ trợ.</p>
          <p class="embed-error-hint">Các giá trị hợp lệ: bubble-sort, selection-sort, insertion-sort, quick-sort, merge-sort, heap-sort, bst, graph-bfs, graph-dfs, dijkstra, oop, solid, di, design-patterns, system-design</p>
        </div>
      </div>
      <!-- Valid visualizer -->
      <component v-else :is="activeVisualizerComponent" class="embed-player-view" />
    </template>
    <template v-else>
      <EmbedWidgetWorkspace />
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue';
import { useRoute } from 'vue-router';
import { EmbedWidgetWorkspace } from '../features/embed-widget';
import { useAuthStore } from '../features/auth/store/useAuthStore';

import SortingView from './SortingView.vue';
import GraphView from './GraphView.vue';
import DIView from './DIView.vue';
import PatternsView from './PatternsView.vue';
import OOPVisualizationView from './OOPVisualizationView.vue';
import SOLIDVisualizationView from './SOLIDVisualizationView.vue';
import SystemDesignVizView from './SystemDesignVizView.vue';

// ── Enum-based Visualizer Map ──────────────────────────────────────────────
const VISUALIZER_MAP: Record<string, Component> = {
  'bubble-sort': SortingView,
  'selection-sort': SortingView,
  'insertion-sort': SortingView,
  'quick-sort': SortingView,
  'merge-sort': SortingView,
  'heap-sort': SortingView,
  'bst': GraphView,
  'graph-bfs': GraphView,
  'graph-dfs': GraphView,
  'dijkstra': GraphView,
  'oop': OOPVisualizationView,
  'solid': SOLIDVisualizationView,
  'di': DIView,
  'design-patterns': PatternsView,
  'system-design': SystemDesignVizView,
};

// ── Premium-only visualizers ───────────────────────────────────────────────
const PREMIUM_ALGOS = new Set(['system-design', 'dijkstra', 'design-patterns']);

const route = useRoute();
const authStore = useAuthStore();

const algoParam = computed(() => (route.query.algo as string) ?? '');
const isMinimalMode = computed(() => route.query.algo !== undefined);

const activeVisualizerComponent = computed<Component | null>(() => {
  const key = algoParam.value.toLowerCase();
  return VISUALIZER_MAP[key] ?? null;
});

const isInvalidAlgo = computed(() => {
  if (!algoParam.value) return false;
  return !VISUALIZER_MAP[algoParam.value.toLowerCase()];
});

const isPremiumBlocked = computed(() => {
  const key = algoParam.value.toLowerCase();
  if (!PREMIUM_ALGOS.has(key)) return false;
  // Nếu chưa đăng nhập hoặc không phải Premium → chặn
  return !authStore.isAuthenticated || !authStore.isPremium;
});

const loginUrl = computed(() => {
  // Chuyển hướng đến trang đăng nhập chính (không phải embed)
  return `${window.location.origin}/login`;
});
</script>

<style scoped>
.embed-player-view {
  width: 100vw;
  height: 100vh;
  padding: 0;
  margin: 0;
  border: none;
}

/* ── Premium Overlay ─────────────────────────────────────────── */
.embed-premium-overlay,
.embed-error-overlay {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
}

.embed-premium-card,
.embed-error-card {
  text-align: center;
  padding: 2.5rem 3rem;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px);
  border-radius: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  max-width: 420px;
  color: #e0e0e0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.embed-premium-icon,
.embed-error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.embed-premium-card h2,
.embed-error-card h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.75rem 0;
}

.embed-premium-card p,
.embed-error-card p {
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0 0 1.25rem 0;
  color: #b0b0b0;
}

.embed-premium-btn {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  border-radius: 0.75rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.embed-premium-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(102, 126, 234, 0.4);
}

.embed-error-hint {
  font-size: 0.8rem;
  color: #888;
  word-break: break-all;
}

.embed-error-card code {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.15em 0.4em;
  border-radius: 4px;
  font-size: 0.9em;
}
</style>
