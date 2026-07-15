<template>
  <Teleport to="body">
    <div class="toast-container" aria-live="polite" aria-atomic="true">
      <TransitionGroup name="toast-slide">
        <div
          v-for="toast in toastStore.activeToasts"
          :key="toast.id"
          class="toast-item"
          :class="`toast-item--${toast.type}`"
          role="alert"
          @click="toastStore.removeToast(toast.id)"
        >
          <div class="toast-icon">
            <span v-if="toast.type === 'success'">✓</span>
            <span v-else-if="toast.type === 'error'">✕</span>
            <span v-else-if="toast.type === 'warning'">⚠</span>
            <span v-else>ℹ</span>
          </div>
          <div class="toast-body">
            <div class="toast-title">{{ toast.title }}</div>
            <div class="toast-message">{{ toast.message }}</div>
          </div>
          <button
            class="toast-close"
            aria-label="Đóng"
            @click.stop="toastStore.removeToast(toast.id)"
          >×</button>
          <div
            class="toast-progress"
            :style="{ animationDuration: `${toast.duration}ms` }"
          />
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToastStore } from '../composables/useToast';

const toastStore = useToastStore();
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 380px;
  width: 100%;
  pointer-events: none;
}

.toast-item {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 10px;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.toast-item--success {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.3);
}
.toast-item--error {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
}
.toast-item--warning {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.3);
}
.toast-item--info {
  background: rgba(6, 182, 212, 0.15);
  border-color: rgba(6, 182, 212, 0.3);
}

.toast-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}
.toast-item--success .toast-icon { background: rgba(16, 185, 129, 0.3); color: #10b981; }
.toast-item--error   .toast-icon { background: rgba(239, 68, 68, 0.3);  color: #ef4444; }
.toast-item--warning .toast-icon { background: rgba(245, 158, 11, 0.3); color: #f59e0b; }
.toast-item--info    .toast-icon { background: rgba(6, 182, 212, 0.3);  color: #06b6d4; }

.toast-body {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary, #fff);
  margin-bottom: 2px;
}

.toast-message {
  font-size: 11px;
  color: var(--text-secondary, #aaa);
  line-height: 1.4;
  word-break: break-word;
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--text-muted, #666);
  font-size: 16px;
  cursor: pointer;
  padding: 0 2px;
  line-height: 1;
  opacity: 0.5;
  transition: opacity 0.2s;
}
.toast-close:hover { opacity: 1; }

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  width: 100%;
  animation: toast-shrink linear forwards;
}
.toast-item--success .toast-progress { background: #10b981; }
.toast-item--error   .toast-progress { background: #ef4444; }
.toast-item--warning .toast-progress { background: #f59e0b; }
.toast-item--info    .toast-progress { background: #06b6d4; }

@keyframes toast-shrink {
  from { transform: scaleX(1); transform-origin: left; }
  to   { transform: scaleX(0); transform-origin: left; }
}

/* Slide transitions */
.toast-slide-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-slide-leave-active {
  transition: all 0.2s ease-in;
}
.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(100px) scale(0.9);
}
.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(60px) scale(0.95);
}
.toast-slide-move {
  transition: transform 0.3s ease;
}
</style>
