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
import { EmbedWidgetWorkspace } from '../../features/embed-widget';
import { useAuthStore } from '../../features/auth/store/useAuthStore';

import SortingView from '../sorting/SortingView.vue';
import GraphView from '../graph/GraphView.vue';
import DIView from '../di/DIView.vue';
import PatternsView from '../patterns/PatternsView.vue';
import OOPVisualizationView from '../oop/OOPVisualizationView.vue';
import SOLIDVisualizationView from '../solid/SOLIDVisualizationView.vue';
import SystemDesignVizView from '../system-design/SystemDesignVizView.vue';

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
@import "./EmbedWidgetView.css";
</style>
