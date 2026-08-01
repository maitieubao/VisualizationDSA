<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  show: boolean;
  currentStep: string;
}>();

const emit = defineEmits<{
  (e: 'resume'): void;
  (e: 'restart'): void;
}>();

const stepName = computed(() => {
  switch (props.currentStep) {
    case 'Theory': return 'Lý thuyết';
    case 'Quiz': return 'Bài tập trắc nghiệm';
    case 'Lab': return 'Thực hành Lab';
    case 'LeetCode': return 'Bài tập Code';
    default: return props.currentStep;
  }
});
</script>

<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <h2>Tiếp tục phiên học? 📚</h2>
      <p>Bạn đang có một phiên học dang dở. Bạn muốn tiếp tục hay bắt đầu lại từ đầu?</p>
      
      <div class="info-box">
        <p><strong>Tiến trình hiện tại:</strong> {{ stepName }}</p>
      </div>

      <div class="actions">
        <button class="btn-cancel" @click="emit('restart')">Bắt đầu lại (Trừ 1 ❤️)</button>
        <button class="btn-primary" @click="emit('resume')">Tiếp tục (Miễn phí)</button>
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
  max-width: 450px;
  width: 90%;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}
.modal-content h2 {
  margin-top: 0;
  color: var(--color-primary);
}
.info-box {
  background: var(--color-surface-hover);
  padding: 12px;
  border-radius: 8px;
  margin: 16px 0;
}
.info-box p {
  margin: 4px 0;
  font-size: 1.05rem;
  color: var(--color-text-primary);
}
.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
}
button {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}
.btn-primary {
  background: var(--color-primary);
  color: white;
}
.btn-cancel {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
}
.btn-cancel:hover {
  background: var(--color-surface-hover);
}
</style>
