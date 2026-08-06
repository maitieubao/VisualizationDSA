<template>
  <div class="vcr-controls-left">
    
    <button class="vcr-action-btn" :disabled="isFirstFrame || isUninitialized"
      title="Lùi 1 bước (ArrowLeft)" aria-label="Lùi 1 bước" @click="$emit('stepBackward')">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="19 20 9 12 19 4 19 20" fill="currentColor" /><line x1="5" y1="19" x2="5" y2="5" />
      </svg>
    </button>

    
    <button class="vcr-play-btn" :disabled="isUninitialized"
      :title="isPlaying ? 'Tạm dừng (Space)' : isFinished ? 'Phát lại (Space)' : 'Phát (Space)'"
      :aria-label="isPlaying ? 'Tạm dừng' : isFinished ? 'Phát lại' : 'Phát'"
      @click="$emit('togglePlay')">
      <svg v-if="isPlaying" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />
      </svg>
      <svg v-else-if="isFinished" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    </button>

    
    <button class="vcr-action-btn" :disabled="isLastFrame || isUninitialized"
      title="Tiến 1 bước (ArrowRight)" aria-label="Tiến 1 bước" @click="$emit('stepForward')">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="5 4 15 12 5 20 5 4" fill="currentColor" /><line x1="19" y1="5" x2="19" y2="19" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ isFirstFrame: boolean; isLastFrame: boolean; isUninitialized: boolean; isPlaying: boolean; isFinished: boolean }>();
defineEmits<{ stepBackward: []; stepForward: []; togglePlay: [] }>();
</script>

<style scoped>
.vcr-controls-left { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.vcr-action-btn { padding: 8px; border-radius: 10px; border: 1px solid var(--color-border-strong); color: var(--color-text-secondary); background: transparent; cursor: pointer; transition: all 0.15s; }
.vcr-action-btn:hover:not(:disabled) { color: var(--color-text-primary); border-color: var(--color-border-strong); background: var(--color-bg-hover); }
.vcr-action-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.vcr-play-btn { padding: 10px; border-radius: 50%; background: linear-gradient(135deg, var(--color-accent-cyan-light), var(--color-accent-cyan)); color: #fff; border: none; cursor: pointer; transition: all 0.15s; box-shadow: 0 0 16px color-mix(in srgb, var(--color-accent-cyan) 30%, transparent); }
.vcr-play-btn:hover:not(:disabled) { background: linear-gradient(135deg, var(--color-accent-cyan-light), var(--color-accent-cyan)); box-shadow: 0 0 24px color-mix(in srgb, var(--color-accent-cyan) 50%, transparent); transform: scale(1.05); }
.vcr-play-btn:disabled { opacity: 0.35; cursor: not-allowed; }
</style>
