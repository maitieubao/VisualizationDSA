<template>
  <div class="embed-live-preview-canvas">
    <div class="preview-header">
      <div class="flex items-center gap-2">
        <span class="preview-dot" />
        <span class="preview-title">Live Preview</span>
      </div>
      <div class="flex items-center gap-3">
        
        <span v-if="isScaledDown" class="preview-scale-badge">(hiển thị thu nhỏ)</span>
        <div class="preview-dimensions">
          {{ store.widgetWidth }} × {{ store.widgetHeight }}px
        </div>
      </div>
    </div>

    <div class="preview-viewport">
      <div
        class="preview-frame"
        :style="{
          width: scaledWidth + 'px',
          height: scaledHeight + 'px',
          borderRadius: '16px',
        }"
      >
        
        <iframe
          ref="iframeRef"
          class="preview-iframe"
          :src="previewSrcUrl"
          :title="'Live preview — ' + store.algorithmLabel"
          sandbox="allow-scripts allow-same-origin"
          :style="{ pointerEvents: store.isInteractive ? 'auto' : 'none' }"
          @load="onIframeLoad"
        />

        
        <div v-if="!isIframeLoaded && !iframeError" class="preview-overlay">
          <span class="preview-spinner" aria-hidden="true" />
          <span class="preview-overlay-text">Đang tải widget...</span>
        </div>

        
        <div v-if="iframeError" class="preview-overlay preview-error-state">
          <BaseIcon name="warning" class="w-6 h-6" />
          <span class="preview-overlay-text">Không thể tải widget.</span>
          <button type="button" class="preview-retry-btn" @click="reloadPreview">
            <BaseIcon name="refresh-ccw" class="w-3.5 h-3.5 inline mr-1 align-middle" />
            Thử lại
          </button>
        </div>

        
        <div v-if="store.showVcrControls && !iframeError" class="preview-vcr">
          <button
            type="button"
            class="preview-vcr-btn"
            :disabled="!isIframeLoaded"
            aria-label="Bước trước"
            title="Gửi STEP_BACKWARD tới widget"
            @click="postToWidget('STEP_BACKWARD')"
          >
            <BaseIcon name="step-backward" class="w-3 h-3" />
          </button>
          <button
            type="button"
            class="preview-vcr-btn"
            :disabled="!isIframeLoaded"
            aria-label="Bước tiếp theo"
            title="Gửi STEP_FORWARD tới widget"
            @click="postToWidget('STEP_FORWARD')"
          >
            <BaseIcon name="step-forward" class="w-3 h-3" />
          </button>
          <button
            type="button"
            class="preview-vcr-btn"
            :disabled="!isIframeLoaded"
            aria-label="Đặt lại widget"
            title="Gửi RESET tới widget"
            @click="postToWidget('RESET')"
          >
            <BaseIcon name="refresh-ccw" class="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import { useEmbedConfiguratorStore } from '../store/useEmbedConfiguratorStore';
import { EMBED_BASE_URL } from '../types/embed-widget.types';
import type { EmbedMessageAction } from '../types/embed-widget.types';

const store = useEmbedConfiguratorStore();

const MAX_PREVIEW_WIDTH = 600;
const MAX_PREVIEW_HEIGHT = 400;
const IFRAME_LOAD_TIMEOUT_MS = 8000;

const iframeRef = ref<HTMLIFrameElement | null>(null);
const isIframeLoaded = ref(false);
const iframeError = ref(false);
let loadTimer: ReturnType<typeof setTimeout> | null = null;

const scale = computed(() => {
  const scaleX = MAX_PREVIEW_WIDTH / store.widgetWidth;
  const scaleY = MAX_PREVIEW_HEIGHT / store.widgetHeight;
  return Math.min(1, scaleX, scaleY);
});

const scaledWidth = computed(() => Math.round(store.widgetWidth * scale.value));
const scaledHeight = computed(() => Math.round(store.widgetHeight * scale.value));

// EW-028: chỉ báo "(hiển thị thu nhỏ)" khi frame thật bị thu nhỏ để vừa viewport.
const isScaledDown = computed(() => scale.value < 1);

// ─── EW-004: iframe THẬT chạy widget /embed?algo=... — hết mock tĩnh ───
// EMBED_BASE_URL trỏ production; khi dev trên localhost thì đổi origin sang
// local app để preview chạy được ngay lập tức (EW-024 thuộc agent store).
const previewSrcUrl = computed(() => {
  const host = window.location.hostname;
  const isDevHost = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  if (!isDevHost) return store.iframeSrcUrl;
  try {
    const url = new URL(store.iframeSrcUrl);
    // URL.origin là read-only → dựng lại chuỗi từ origin local + path/query/hash.
    return `${window.location.origin}${url.pathname}${url.search}${url.hash}`;
  } catch {
    return store.iframeSrcUrl;
  }
});

function onIframeLoad(): void {
  isIframeLoaded.value = true;
  iframeError.value = false;
  clearLoadTimer();
}

// ─── EW-015: nếu iframe không load trong thời gian cho phép → error state ───
function clearLoadTimer(): void {
  if (loadTimer !== null) {
    clearTimeout(loadTimer);
    loadTimer = null;
  }
}

function armLoadTimer(): void {
  clearLoadTimer();
  isIframeLoaded.value = false;
  iframeError.value = false;
  loadTimer = setTimeout(() => {
    if (!isIframeLoaded.value) iframeError.value = true;
    loadTimer = null;
  }, IFRAME_LOAD_TIMEOUT_MS);
}

function reloadPreview(): void {
  armLoadTimer();
  const iframe = iframeRef.value;
  if (iframe) iframe.src = previewSrcUrl.value;
}

// ─── EW-015: nút VCR THẬT — gửi postMessage cho widget bên trong iframe ───
function postToWidget(action: Extract<EmbedMessageAction, 'STEP_FORWARD' | 'STEP_BACKWARD' | 'RESET'>): void {
  const iframe = iframeRef.value;
  if (!iframe?.contentWindow) return;
  iframe.contentWindow.postMessage(
    { source: 'VISUALIZATION_DSA_HOST', action, payload: null },
    previewSrcUrl.value,
  );
}

watch(previewSrcUrl, () => armLoadTimer());
armLoadTimer();

onUnmounted(() => clearLoadTimer());
</script>

<style scoped>
@import "./LiveWidgetPreview.css";
</style>
