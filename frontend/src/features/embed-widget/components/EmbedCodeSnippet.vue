<template>
  <div class="embed-code-snippet-section">
    <div class="snippet-header">
      <div class="flex items-center gap-2">
        <span class="snippet-dot" />
        <span class="snippet-title">Mã nhúng Iframe</span>
      </div>
      <button
        type="button"
        class="copy-btn"
        :class="{ copied: isCopied, failed: copyError }"
        aria-label="Sao chép mã nhúng"
        @click="onCopyClick"
      >
        <BaseIcon v-if="isCopied" name="check" class="w-3 h-3 inline mr-1 align-middle" />
        <BaseIcon v-else name="clipboard-list" class="w-3 h-3 inline mr-1 align-middle" />
        {{ isCopied ? 'ĐÃ SAO CHÉP!' : 'SAO CHÉP MÃ' }}
      </button>
    </div>

    <!-- EW-026: thông báo trạng thái sao chép cho screen reader (aria-live polite). -->
    <p class="sr-only" role="status" aria-live="polite">{{ liveStatusText }}</p>

    <p v-if="copyError" class="copy-error" role="alert">
      Không thể sao chép: trình duyệt chặn clipboard. Vui lòng thử lại.
    </p>

    <div class="embed-code-snippet-box">
      <pre class="snippet-code"><code>{{ displayIframeCode }}</code></pre>
    </div>

    
    <div class="integration-section">
      <div class="integration-header">
        <span class="integration-title">Mã tích hợp Host (Tùy chọn)</span>
      </div>
      <div class="embed-code-snippet-box integration-code">
        <pre class="snippet-code"><code>{{ hostIntegrationScript }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import { useEmbedConfiguratorStore } from '../store/useEmbedConfiguratorStore';

const store = useEmbedConfiguratorStore();
const copyError = ref(false);
const isCopied = ref(false);

const COPY_FEEDBACK_MS = 2000;
const COPY_ERROR_HIDE_MS = 4000;
let feedbackTimer: ReturnType<typeof setTimeout> | null = null;
let errorHideTimer: ReturnType<typeof setTimeout> | null = null;

function clearTimers(): void {
  if (feedbackTimer !== null) {
    clearTimeout(feedbackTimer);
    feedbackTimer = null;
  }
  if (errorHideTimer !== null) {
    clearTimeout(errorHideTimer);
    errorHideTimer = null;
  }
}

// ─── EW-017: thêm `data-embed-widget` vào thẻ iframe để host script chọn
// ĐÚNG iframe widget (không bấu nhầm iframe khác trên trang) ───
const displayIframeCode = computed(() => {
  const raw = store.generatedIframeCode;
  if (raw.includes('data-embed-widget')) return raw;
  return raw.replace('<iframe', '<iframe data-embed-widget');
});

const liveStatusText = computed(() => {
  if (copyError.value) return 'Sao chép thất bại';
  if (isCopied.value) return 'Đã sao chép mã nhúng';
  return '';
});

async function onCopyClick(): Promise<void> {
  copyError.value = false;
  try {
    await navigator.clipboard.writeText(displayIframeCode.value);
    isCopied.value = true;
    if (feedbackTimer !== null) clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => {
      isCopied.value = false;
      feedbackTimer = null;
    }, COPY_FEEDBACK_MS);
  } catch (err) {
    console.error('Lỗi hạ tầng sao chép mã nhúng:', err);
    copyError.value = true;
    if (errorHideTimer !== null) clearTimeout(errorHideTimer);
    errorHideTimer = setTimeout(() => {
      copyError.value = false;
      errorHideTimer = null;
    }, COPY_ERROR_HIDE_MS);
  }
}

// ─── EW-027: copyError tự ẩn sau thời gian + reset khi user "Đặt lại Mặc định"
// (cũng reset khi bất kỳ cấu hình nào thay đổi — mã nhúng đã khác). ───
watch(() => store.generatedIframeCode, () => {
  copyError.value = false;
  isCopied.value = false;
  clearTimers();
});

onUnmounted(() => clearTimers());

// ─── EW-017: host script — selector [data-embed-widget] + verify event.source ───
const hostIntegrationScript = computed(() => {
  const embedOrigin = (() => {
    try { return new URL(store.generatedIframeCode.match(/src="([^"]+)"/)?.[1] ?? '').origin; } catch { return 'https://visualization-dsa.edu.vn'; }
  })();
  return `<script>
  // Chọn ĐÚNG iframe widget qua data-embed-widget (tránh bấu nhầm iframe đầu tiên trên trang).
  const iframe = document.querySelector('[data-embed-widget]');
  if (!iframe) return;
  window.addEventListener('message', (event) => {
    // Chỉ nhận tin từ ĐÚNG iframe này (chống giả mạo event.source).
    if (event.source !== iframe.contentWindow) return;
    // BẮT BUỘC verify origin — chỉ nhận tin từ widget của chúng ta (chống CSS injection/UI redressing).
    if (event.origin !== ${JSON.stringify(embedOrigin)}) return;
    const msg = event.data;
    if (msg?.source === 'VISUALIZATION_DSA_WIDGET') {
      if (msg.action === 'HEIGHT_CHANGED' && Number.isFinite(Number(msg.payload?.height))) {
        const h = Math.min(2000, Math.max(100, Number(msg.payload.height)));
        iframe.style.height = h + 'px';
      }
      if (msg.action === 'QUIZ_COMPLETED') {
        console.log('Quiz score:', msg.payload?.quizScore);
      }
    }
  });
<\/script>`;
});
</script>

<style scoped>
@import "./EmbedCodeSnippet.css";
</style>
