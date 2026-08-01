<template>
  <div class="embed-code-snippet-section">
    <div class="snippet-header">
      <div class="flex items-center gap-2">
        <span class="snippet-dot" />
        <span class="snippet-title">Mã nhúng Iframe</span>
      </div>
      <button
        class="copy-btn"
        :class="{ copied: store.isCopied }"
        @click="store.copyEmbedCodeToClipboard()"
      >
        {{ store.isCopied ? 'COPIED!' : 'COPY CODE' }}
      </button>
    </div>

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
import { computed } from 'vue';
import { useEmbedConfiguratorStore } from '../store/useEmbedConfiguratorStore';

const store = useEmbedConfiguratorStore();

const hostIntegrationScript = computed(() => {
  return `<script>
  const iframe = document.querySelector('iframe');
  window.addEventListener('message', (event) => {
    const msg = event.data;
    if (msg?.source === 'VISUALIZATION_DSA_WIDGET') {
      if (msg.action === 'HEIGHT_CHANGED') {
        iframe.style.height = msg.payload.height + 'px';
      }
      if (msg.action === 'QUIZ_COMPLETED') {
        console.log('Quiz score:', msg.payload.quizScore);
      }
    }
  });
<\/script>`;
});
</script>

<style scoped>
@import "./EmbedCodeSnippet.css";
</style>
