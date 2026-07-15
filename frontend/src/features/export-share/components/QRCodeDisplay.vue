<template>
  <div v-if="store.hasShareLink" class="qr-section">
    <label class="qr-label">QR Code — Quét camera mở nhanh sơ đồ</label>
    <div class="share-qr-code-wrapper">
      <canvas ref="qrCanvas" class="qr-canvas" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import QRCode from 'qrcode';
import { useExportShareStore } from '../store/useExportShareStore';

const store = useExportShareStore();
const qrCanvas = ref<HTMLCanvasElement | null>(null);

watch(
  () => store.qrCodeValue,
  async (value) => {
    if (value && qrCanvas.value) {
      const rootStyle = typeof window !== 'undefined' ? window.getComputedStyle(document.documentElement) : null;
      const qrDark = rootStyle?.getPropertyValue('--color-text-primary').trim() || '#f8fafc';
      const qrLight = rootStyle?.getPropertyValue('--color-bg-primary').trim() || '#0f172a';

      await QRCode.toCanvas(qrCanvas.value, value, {
        width: 180,
        margin: 2,
        color: {
          dark: qrDark,
          light: qrLight,
        },
      });
    }
  },
);
</script>

<style scoped>
.qr-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.qr-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.share-qr-code-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid #f59e0b;
  border-radius: 16px;
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.15);
  transition: transform 0.3s ease;
}

.share-qr-code-wrapper:hover {
  transform: scale(1.05);
}

.qr-canvas {
  border-radius: 8px;
}
</style>
