<template>
  <div v-if="store.hasShareLink" class="qr-section">
    <label class="qr-label">QR Code — Quét camera mở nhanh sơ đồ</label>
    <div v-if="qrError" class="qr-error" role="alert">
      {{ qrError }}
    </div>
    <div v-else class="share-qr-code-wrapper">
      <canvas
        ref="qrCanvas"
        class="qr-canvas"
        role="img"
        :aria-label="`QR Code chứa liên kết chia sẻ phòng lab: ${store.generatedShareLink}`"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import QRCode from 'qrcode';
import { useExportShareStore } from '../store/useExportShareStore';

const store = useExportShareStore();
const qrCanvas = ref<HTMLCanvasElement | null>(null);
const qrError = ref('');

// EX-003: toCanvas có thể throw (payload vượt dung lượng QR, màu CSS không hợp
// lệ...) — bắt lỗi, ẩn canvas và hiển thị thông báo ngắn thay vì để
// unhandled rejection im lặng.
function drawQRCode(value: string): void {
  const canvas = qrCanvas.value;
  if (!canvas) return;

  try {
    // EX-024: màu hex hợp lệ đã được store cấp sẵn (fallback đen/trắng an toàn
    // khi CSS var trả về rgb()/color-mix() không hợp lệ cho thư viện qrcode).
    const qrDark = store.qrDarkColor;
    const qrLight = store.qrLightColor;

    void QRCode.toCanvas(canvas, value, {
      width: 180,
      margin: 2,
      color: {
        dark: qrDark,
        light: qrLight,
      },
    }).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      qrError.value = 'Không thể dựng mã QR cho liên kết này (dữ liệu quá dài).';
      console.error('Lỗi hạ tầng dựng QR Code:', message);
    });
  } catch (err) {
    qrError.value = 'Không thể dựng mã QR cho liên kết này.';
    console.error('Lỗi hạ tầng dựng QR Code:', err);
  }
}

// EX-001: vẽ QR ở 2 thời điểm — onMounted (link đã có SẴN trước khi component
// mount, watcher không kích hoạt vì giá trị không đổi) + watch flush 'post'
// (link sinh ra/đổi SAU khi mount, đợi v-if mount canvas xong mới vẽ).
onMounted(() => {
  const value = store.qrCodeValue;
  if (value) {
    qrError.value = '';
    drawQRCode(value);
  }
});

watch(
  () => store.qrCodeValue,
  (value) => {
    if (value) {
      qrError.value = '';
      drawQRCode(value);
    }
  },
  { flush: 'post' },
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
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.qr-error {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--color-accent-red);
  text-shadow: 0 0 6px color-mix(in srgb, var(--color-accent-red) 20%, transparent);
  padding: 8px 12px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--color-accent-red) 6%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent-red) 15%, transparent);
  text-align: center;
}

.share-qr-code-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  background: var(--color-bg-surface);
  border: 2px solid var(--color-accent-yellow);
  border-radius: 16px;
  box-shadow: 0 0 20px color-mix(in srgb, var(--color-accent-yellow) 15%, transparent);
  transition: transform 0.3s ease;
}

.share-qr-code-wrapper:hover {
  transform: scale(1.05);
}

.qr-canvas {
  border-radius: 8px;
}
</style>
