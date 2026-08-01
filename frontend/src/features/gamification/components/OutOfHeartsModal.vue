<script setup lang="ts">
import { computed } from 'vue';
import type { HeartRecoveryInfoDto } from '@/features/gamification/gamification-engine/service/sessionApi';

const props = defineProps<{
  show: boolean;
  recoveryInfo: HeartRecoveryInfoDto | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'watch-ad'): void;
}>();

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const adsRemaining = computed(() => {
  if (!props.recoveryInfo) return 0;
  return Math.max(0, props.recoveryInfo.adsMaxPerDay - props.recoveryInfo.adsWatchedToday);
});
</script>

<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <h2>Hết Trái Tim 💔</h2>
      <p>Bạn đã sử dụng hết trái tim. Hãy đợi tim hồi phục hoặc xem quảng cáo để nhận thêm.</p>
      
      <div v-if="recoveryInfo" class="info-box">
        <p><strong>Thời gian hồi phục:</strong> {{ formatTime(recoveryInfo.heartRecoverySeconds) }}</p>
        <p><strong>Lượt xem quảng cáo còn lại:</strong> {{ adsRemaining }}/{{ recoveryInfo.adsMaxPerDay }}</p>
      </div>

      <div class="actions">
        <button class="btn-cancel" @click="emit('close')">Đóng</button>
        <button class="btn-primary" :disabled="adsRemaining <= 0" @click="emit('watch-ad')">
          Xem Quảng Cáo (+1 ❤️)
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: var(--color-surface);
  padding: 24px;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}
.modal-content h2 {
  margin-top: 0;
  color: var(--color-error);
}
.info-box {
  background: var(--color-surface-hover);
  padding: 12px;
  border-radius: 8px;
  margin: 16px 0;
}
.info-box p {
  margin: 4px 0;
  font-size: 0.95rem;
}
.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
}
button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}
.btn-primary {
  background: var(--color-primary);
  color: white;
}
.btn-primary:disabled {
  background: var(--color-text-muted);
  cursor: not-allowed;
}
.btn-cancel {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
}
</style>
