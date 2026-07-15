<template>
  <div class="flex-shrink-0 flex items-center gap-4 px-4 py-3 bg-bg-secondary/80 rounded-xl border border-border-subtle">
    <!-- Playback Controls -->
    <div class="flex items-center gap-2">
      <button @click="$emit('stop')" class="vcr-btn" title="Dừng (R)">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="1" /></svg>
      </button>
      <button @click="$emit('step-backward')" :disabled="stepIndex <= 0" class="vcr-btn disabled:opacity-30 disabled:cursor-not-allowed" title="Lùi (←)">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></svg>
      </button>
      <button @click="$emit('toggle-play')" :disabled="isDeadlocked && playbackMode !== 'DEADLOCKED'"
        data-tour-id="concurrency-play-btn"
        class="w-10 h-10 rounded-xl flex items-center justify-center transition-colors" :class="playButtonClass">
        <svg v-if="playbackMode === 'FINISHED'" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
        </svg>
        <svg v-else-if="!isPlaying" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
      </button>
      <button @click="$emit('step-forward')" :disabled="stepIndex >= totalSteps || isDeadlocked"
        data-tour-id="concurrency-step-forward"
        class="vcr-btn disabled:opacity-30 disabled:cursor-not-allowed" title="Tiến (→)">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
      </button>
    </div>

    <!-- Timeline Slider -->
    <div class="flex-1 flex items-center gap-3">
      <span class="text-[10px] text-text-muted tabular-nums w-16 text-right">{{ stepIndex }} / {{ totalSteps }}</span>
      <input type="range" :min="0" :max="totalSteps" :value="stepIndex"
        data-tour-id="concurrency-slider"
        @input="e => $emit('scrub', Number((e.target as HTMLInputElement).value))"
        class="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
        :class="isDeadlocked ? 'accent-rose-500' : 'accent-cyan-500'" />
      <span class="text-[10px] tabular-nums w-8" :class="isDeadlocked ? 'text-accent-red' : 'text-accent'">
        {{ progressPercent }}%
      </span>
    </div>

    <!-- Speed + Mode -->
    <div class="flex items-center gap-2 flex-shrink-0">
      <span class="text-[10px] text-text-secondary uppercase tracking-wider">Tốc độ</span>
      <select :value="playSpeed" @change="e => $emit('speed-change', Number((e.target as HTMLSelectElement).value))"
        data-tour-id="concurrency-speed-select"
        class="bg-bg-surface border border-border-default text-text-secondary text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-accent">
        <option :value="0.25">0.25x</option><option :value="0.5">0.5x</option>
        <option :value="1">1x</option><option :value="2">2x</option><option :value="4">4x</option>
      </select>
    </div>
    <div class="flex-shrink-0">
      <span class="text-[9px] font-bold uppercase px-2 py-1 rounded-md" :class="modeBadgeClass">
        {{ playbackMode }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  stepIndex: number; totalSteps: number; progressPercent: number;
  isPlaying: boolean; isDeadlocked: boolean;
  playbackMode: string; playSpeed: number;
}>();

defineEmits<{
  stop: []; 'step-backward': []; 'step-forward': []; 'toggle-play': [];
  scrub: [value: number]; 'speed-change': [value: number];
}>();

const playButtonClass = computed(() => {
  if (props.playbackMode === 'DEADLOCKED') return 'bg-accent-red/30 text-accent-red cursor-not-allowed';
  if (props.playbackMode === 'FINISHED') return 'bg-accent-green/30 text-accent-green hover:bg-accent-green/50';
  if (props.isPlaying) return 'bg-accent text-text-primary hover:bg-accent-light';
  return 'bg-accent-cyan/30 text-accent hover:bg-accent-cyan/50';
});

const modeBadgeClass = computed(() => {
  const map: Record<string, string> = {
    PLAYING: 'bg-accent-cyan/40 text-accent', PAUSED: 'bg-accent-yellow/40 text-accent-yellow',
    FINISHED: 'bg-accent-green/40 text-accent-green', DEADLOCKED: 'bg-accent-red/40 text-accent-red',
  };
  return map[props.playbackMode] ?? 'bg-bg-surface text-text-muted';
});
</script>

<style scoped>
.vcr-btn {
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-lg, 8px);
  background: rgba(30, 41, 59, 0.8);   /* slate-800 equivalent */
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(148, 163, 184);           /* slate-400 equivalent */
  transition: background 0.15s ease, color 0.15s ease;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
}

.vcr-btn:hover {
  background: rgb(51, 65, 85);         /* slate-700 equivalent */
  color: #ffffff;
}
</style>

