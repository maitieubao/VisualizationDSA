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
            <BaseIcon v-if="toast.type === 'success'" name="check" class="w-4 h-4" />
            <BaseIcon v-else-if="toast.type === 'error'" name="close" class="w-4 h-4" />
            <BaseIcon v-else-if="toast.type === 'warning'" name="warning" class="w-4 h-4" />
            <BaseIcon v-else name="info" class="w-4 h-4" />
          </div>
          <div class="toast-body">
            <div class="toast-title" v-html="parseEmojiToSvg(escapeHtmlText(toast.title))"></div>
            <div class="toast-message" v-html="parseEmojiToSvg(escapeHtmlText(toast.message))"></div>
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
import { parseEmojiToSvg, escapeHtmlText } from '../utils/emojiParser';

const toastStore = useToastStore();
</script>

<style scoped>
@import "./ToastContainer.css";
</style>
