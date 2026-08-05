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
        :class="{ copied: store.isCopied, failed: copyError }"
        aria-label="Sao chép mã nhúng"
        @click="onCopyClick"
      >
        <BaseIcon v-if="store.isCopied" name="check" class="w-3 h-3 inline mr-1 align-middle" />
        <BaseIcon v-else name="clipboard-list" class="w-3 h-3 inline mr-1 align-middle" />
        {{ store.isCopied ? 'ĐÃ SAO CHÉP!' : 'SAO CHÉP MÃ' }}
      </button>
    </div>

    <p v-if="copyError" class="copy-error" role="alert">
      Không thể sao chép: trình duyệt chặn clipboard. Vui lòng thử lại.
    </p>

    <div class="embed-code-snippet-box">
      <pre class="snippet-code"><code>{{ store.generatedIframeCode }}</code></pre>
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
import { computed, ref } from 'vue';
import { useEmbedConfiguratorStore } from '../store/useEmbedConfiguratorStore';

const store = useEmbedConfiguratorStore();
const copyError = ref(false);

async function onCopyClick(): Promise<void> {
  copyError.value = false;
  const ok = await store.copyEmbedCodeToClipboard();
  copyError.value = !ok;
}

const hostIntegrationScript = computed(() => {
  const embedOrigin = (() => {
    try { return new URL(store.generatedIframeCode.match(/src="([^"]+)"/)?.[1] ?? '').origin; } catch { return 'https://visualization-dsa.edu.vn'; }
  })();
  return `<script>
  const iframe = document.querySelector('iframe');
  window.addEventListener('message', (event) => {
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
