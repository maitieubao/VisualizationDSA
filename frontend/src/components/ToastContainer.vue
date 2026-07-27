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
@import "./ToastContainer.css";
</style>
