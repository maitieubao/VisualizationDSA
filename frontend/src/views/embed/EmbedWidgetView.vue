<template>
  <section
    ref="widgetRoot"
    class="flex-1 min-h-0 embed-widget-root"
    :class="{
      'widget-noninteractive': isMinimalMode && interactiveParam === 'false',
    }"
  >
    <template v-if="isMinimalMode">
      
      <div v-if="isPremiumBlocked" class="embed-premium-overlay">
        <div class="embed-premium-card">
          <div class="embed-premium-icon"><BaseIcon name="lock" class="w-8 h-8" /></div>
          <h2>Nội dung Premium</h2>
          <p>Nội dung này yêu cầu tài khoản Premium để truy cập.</p>
          <a :href="loginUrl" class="embed-premium-btn">Đăng nhập / Nâng cấp</a>
        </div>
      </div>

      
      <div v-else-if="isInvalidAlgo" class="embed-error-overlay">
        <div class="embed-error-card">
          <div class="embed-error-icon"><BaseIcon name="warning" class="w-8 h-8" /></div>
          <h2>Thuật toán không hợp lệ</h2>
          <p>Tham số <code>algo={{ algoParam }}</code> không được hỗ trợ.</p>
          <p class="embed-error-hint">Các giá trị hợp lệ: {{ validAlgoHint }}</p>
        </div>
      </div>

      
      <div v-else-if="widgetError" class="embed-error-overlay">
        <div class="embed-error-card">
          <div class="embed-error-icon"><BaseIcon name="warning" class="w-8 h-8" /></div>
          <h2>Widget gặp sự cố</h2>
          <p>Đã xảy ra lỗi khi khởi chạy trực quan hóa. Vui lòng tải lại.</p>
          <p class="embed-error-hint">{{ widgetError }}</p>
          <button type="button" class="embed-premium-btn" @click="reloadWidget">
            Tải lại widget
          </button>
        </div>
      </div>

      
      <component v-else :is="activeVisualizerComponent" class="embed-player-view" />
    </template>
    <template v-else>
      <EmbedWidgetWorkspace />
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, onErrorCaptured, ref, watch, type Component } from 'vue';
import { useRoute } from 'vue-router';
import {
  EmbedWidgetWorkspace,
  EmbedCommunicationBridge,
  AutoHeightResizer,
} from '../../features/embed-widget';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { useAnimationStore } from '../../features/animation-engine/store/useAnimationStore';
import { useVcrStore } from '../../features/vcr-player/store/useVcrStore';

import SortingView from '../sorting/SortingView.vue';
import GraphView from '../graph/GraphView.vue';

// Danh sách renderer thật mà view embed hỗ trợ — hint lỗi (EW-011) được sinh
// TỰ ĐỘNG từ keys của map này để không bao giờ liệt kê algo không tồn tại.
const VISUALIZER_MAP: Record<string, Component> = {
  'bubble-sort': SortingView,
  'selection-sort': SortingView,
  'insertion-sort': SortingView,
  'quicksort-recursion': SortingView,
  'quick-sort': SortingView,
  'merge-sort': SortingView,
  'heap-sort': SortingView,
  'bst': GraphView,
  'graph-bfs': GraphView,
  'graph-dfs': GraphView,
  'dijkstra': GraphView,
};

// EW-016: dijkstra là thuật toán premium duy nhất tồn tại trong VISUALIZER_MAP.
const PREMIUM_ALGOS = new Set(['dijkstra']);

const route = useRoute();
const authStore = useAuthStore();
const widgetRoot = ref<HTMLElement | null>(null);
const widgetError = ref<string | null>(null);

// EW-005: route.query.algo có thể là array (`?algo=a&algo=b`) hoặc chuỗi rỗng
// (`?algo=`) — phải guard trước khi `.toLowerCase()` / lookup để không crash
// hoặc để màn hình trắng không thông báo.
function readQueryParam(value: unknown): string {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : '';
  }
  return typeof value === 'string' ? value : '';
}

const algoParam = computed(() => readQueryParam(route.query.algo).trim());
const themeParam = computed(() => readQueryParam(route.query.theme).trim());
const interactiveParam = computed(() => readQueryParam(route.query.interactive).trim());

const isMinimalMode = computed(() => route.query.algo !== undefined);

const activeVisualizerComponent = computed<Component | null>(() => {
  const key = algoParam.value.toLowerCase();
  return VISUALIZER_MAP[key] ?? null;
});

// EW-005: algo rỗng (thiếu value) cũng là "không hợp lệ" — không trắng màn hình.
const isInvalidAlgo = computed(() => {
  const key = algoParam.value.toLowerCase();
  return !key || !VISUALIZER_MAP[key];
});

const isPremiumBlocked = computed(() => {
  const key = algoParam.value.toLowerCase();
  if (!PREMIUM_ALGOS.has(key)) return false;
  return !authStore.isAuthenticated || !authStore.isPremium;
});

// EW-011: hint liệt kê đúng + đầy đủ các key renderer thật có.
const validAlgoHint = computed(() => Object.keys(VISUALIZER_MAP).join(', '));

const loginUrl = computed(() => `${window.location.origin}/login`);

// ─── EW-003: tiêu thụ query theme (glass/dark → terminal-dark, light → light) ───
// Widget chạy trong iframe độc lập nên ghi trực tiếp lên <html> là an toàn —
// không làm nhiễu giao diện chính của app (minimal mode không có header điều hướng).
function applyWidgetTheme(): void {
  if (!isMinimalMode.value) return;
  const theme = themeParam.value;
  document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : 'terminal-dark');
}

// ─── EW-002: wire Animation Engine — bridge + auto-height resizer ───
// Widget nhận lệnh STEP_FORWARD/STEP_BACKWARD/RESET từ host page và báo
// WIDGET_READY + HEIGHT_CHANGED để host đồng bộ chiều cao iframe.
// Dùng allowlist ['*'] CHO WIDGET SIDE: nơi nhúng là Moodle/Canvas/trang tùy
// biến không xác định trước — outgoing targetOrigin '*' để postMessage
// cross-origin không bị browser loại bỏ (policy fail-closed mặc định của
// bridge thuộc engine agent — EW-006).
const bridge = new EmbedCommunicationBridge(['*']);
let heightResizer: AutoHeightResizer | null = null;
let stopBridgeListen: (() => void) | null = null;

function wireEmbedEngine(): void {
  if (!isMinimalMode.value) return;
  const animStore = useAnimationStore();
  const vcrStore = useVcrStore();

  stopBridgeListen = bridge.onMessage((msg) => {
    if (msg.source !== 'VISUALIZATION_DSA_HOST') return;
    switch (msg.action) {
      case 'STEP_FORWARD':
        animStore.stepForward();
        vcrStore.stepNext();
        break;
      case 'STEP_BACKWARD':
        animStore.stepBackward();
        vcrStore.stepPrev();
        break;
      case 'RESET':
        animStore.stop();
        vcrStore.reset();
        break;
      default:
        break;
    }
  });

  if (widgetRoot.value) {
    heightResizer = new AutoHeightResizer(bridge, widgetRoot.value);
    heightResizer.start();
  }

  // Báo host biết widget đã sẵn sàng nhận lệnh (handshake EW-002).
  void nextTick(() => {
    bridge.sendMessage(window.parent, {
      source: 'VISUALIZATION_DSA_WIDGET',
      action: 'WIDGET_READY',
      payload: null,
    });
  });
}

function unWireEmbedEngine(): void {
  stopBridgeListen?.();
  stopBridgeListen = null;
  heightResizer?.destroy();
  heightResizer = null;
}

// EW-010: error-boundary — lỗi từ child (SortingView/GraphView) hiển thị overlay
// có hướng dẫn thay vì iframe trắng vô nghĩa.
onErrorCaptured((err: unknown) => {
  widgetError.value = err instanceof Error ? err.message : String(err);
  return false;
});

function reloadWidget(): void {
  widgetError.value = null;
  window.location.reload();
}

watch([isMinimalMode, themeParam], () => applyWidgetTheme());

onMounted(() => {
  applyWidgetTheme();
  wireEmbedEngine();
});

onUnmounted(() => {
  unWireEmbedEngine();
  bridge.destroy();
});
</script>

<style scoped>
@import "./EmbedWidgetView.css";
</style>
