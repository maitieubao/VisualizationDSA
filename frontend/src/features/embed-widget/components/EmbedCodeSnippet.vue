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

    <!-- Host Integration Script -->
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
.embed-code-snippet-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.snippet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.snippet-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
}

.snippet-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #94a3b8;
}

.copy-btn {
  padding: 8px 18px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  border-radius: 8px;
  border: 1px solid rgba(6, 182, 212, 0.35);
  background: rgba(6, 182, 212, 0.1);
  color: #06b6d4;
  cursor: pointer;
  transition: all 0.25s ease;
}

.copy-btn:hover {
  background: rgba(6, 182, 212, 0.2);
  box-shadow: 0 0 18px rgba(6, 182, 212, 0.2);
}

.copy-btn.copied {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.4);
  color: #10b981;
  box-shadow: 0 0 18px rgba(16, 185, 129, 0.2);
}

.embed-code-snippet-box {
  background: rgba(10, 15, 26, 0.8);
  border: 1px solid rgba(6, 182, 212, 0.2);
  border-radius: 12px;
  padding: 16px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #e2e8f0;
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.08);
  position: relative;
  overflow: hidden;
}

.embed-code-snippet-box::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(6, 182, 212, 0.03), transparent);
  transform: rotate(45deg);
  transition: transform 0.5s ease;
  pointer-events: none;
}

.embed-code-snippet-box:hover::after {
  transform: translate(50%, 50%) rotate(45deg);
}

.snippet-code {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.7;
}

.integration-section {
  margin-top: 4px;
}

.integration-header {
  margin-bottom: 8px;
}

.integration-title {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
}

.integration-code {
  border-color: rgba(245, 158, 11, 0.15);
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.05);
}

.integration-code .snippet-code {
  font-size: 11px;
  color: #cbd5e1;
}
</style>
