<template>
  <div
    ref="containerRef"
    class="concurrency-rails-container relative w-full h-full rounded-3xl overflow-hidden"
    :class="{ 'deadlock-active': isDeadlocked }"
  >
    <!-- Deadlock Alert Overlay -->
    <div v-if="isDeadlocked" class="deadlock-alert-overlay">
      <svg class="w-5 h-5 text-accent-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>DEADLOCK: Chu trình nghẽn khép kín!</span>
    </div>

    <!-- Thread Rails -->
    <div class="flex flex-col gap-6 p-6 h-full justify-center">
      <div v-for="thread in threads" :key="thread.id" class="thread-rail-row relative">
        <!-- Thread label -->
        <div class="absolute left-0 top-1/2 -translate-y-1/2 w-[160px] flex items-center gap-2 z-10">
          <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md whitespace-nowrap" :class="threadLabelClass(thread)">
            {{ thread.name }}
          </span>
        </div>

        <!-- Rail track -->
        <div class="rail-track relative ml-[180px] mr-[110px] h-12 rounded-lg flex items-center">
          <!-- Critical Section Gate -->
          <div class="critical-section-gate">
            <div class="flex flex-col items-center gap-0.5">
              <svg class="mutex-lock-icon" :class="lockIconClass(thread)" viewBox="0 0 24 24" fill="currentColor">
                <template v-if="isThreadHoldingAnyLock(thread)">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </template>
                <template v-else>
                  <path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z"/>
                </template>
              </svg>
              <span class="text-[8px] font-medium" :class="lockTextClass(thread)">{{ getLockStatusText(thread) }}</span>
            </div>
          </div>

          <!-- Thread runner node -->
          <div class="thread-runner-node" :class="threadNodeClass(thread)" :style="{ left: `calc(${thread.progress}% - 12px)` }">
            <span class="text-[8px] font-bold text-text-primary absolute inset-0 flex items-center justify-center">{{ thread.id }}</span>
          </div>

          <!-- Progress markers -->
          <div class="absolute inset-0 flex items-center pointer-events-none">
            <div class="absolute left-0 top-1/2 w-1 h-1 rounded-full bg-bg-hover -translate-y-1/2"></div>
            <div class="absolute left-1/4 top-1/2 w-1 h-1 rounded-full bg-bg-hover -translate-y-1/2"></div>
            <div class="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full bg-bg-hover -translate-y-1/2"></div>
            <div class="absolute left-3/4 top-1/2 w-1 h-1 rounded-full bg-bg-hover -translate-y-1/2"></div>
            <div class="absolute right-0 top-1/2 w-1 h-1 rounded-full bg-bg-hover -translate-y-1/2"></div>
          </div>
        </div>

        <!-- State badge -->
        <div class="absolute right-0 top-1/2 -translate-y-1/2 w-[90px] flex justify-end z-10">
          <span class="text-[9px] font-bold uppercase px-2.5 py-1 rounded-md" :class="stateBadgeClass(thread)">{{ thread.state }}</span>
        </div>
      </div>
    </div>

    <!-- Shared Counter -->
    <div class="absolute bottom-4 right-4 flex items-center gap-3">
      <div class="counter-display">
        <span class="text-[10px] text-text-secondary uppercase tracking-wider">Counter</span>
        <span class="text-2xl font-bold tabular-nums" :class="isDeadlocked ? 'text-accent-red' : 'text-accent-green'">{{ sharedCounter }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { ThreadInstance } from '../types/concurrency.types';
import {
  threadLabelClass, threadNodeClass, stateBadgeClass,
  isThreadHoldingAnyLock, lockIconClass, lockTextClass, getLockStatusText,
} from '../composables/useThreadClassHelpers';

defineProps<{
  threads: ThreadInstance[];
  locks: Record<string, { id: string; name: string; heldByThreadId: string | null; waitingQueue: string[] }>;
  sharedCounter: number;
  isDeadlocked: boolean;
  deadlockedThreadIds: string[];
}>();

const containerRef = ref<HTMLDivElement | null>(null);
</script>

<style scoped>
.concurrency-rails-container { background: #0B0F19; border: 1px solid rgba(255,255,255,0.03); }
.rail-track { background: rgba(255,255,255,0.02); border-bottom: 2px dashed rgba(255,255,255,0.08); }
.thread-runner-node { position: absolute; width: 24px; height: 24px; border-radius: 50%; background: #06B6D4; box-shadow: 0 0 12px #06B6D4; transition: left 0.3s ease-out, background-color 0.2s ease; z-index: 5; }
.thread-runner-node.status-blocked  { background: #F59E0B; box-shadow: 0 0 12px #F59E0B; }
.thread-runner-node.status-finished { background: #10B981; box-shadow: 0 0 12px #10B981; }
.critical-section-gate { position: absolute; left: 50%; transform: translateX(-50%); width: 60px; height: 100%; background: rgba(244,63,94,0.05); border-left: 2px solid rgba(244,63,94,0.2); border-right: 2px solid rgba(244,63,94,0.2); display: flex; justify-content: center; align-items: center; z-index: 3; }
.mutex-lock-icon { width: 20px; height: 20px; color: #06B6D4; filter: drop-shadow(0 0 6px #06B6D4); transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
.mutex-lock-icon.state-locked { color: #F59E0B; filter: drop-shadow(0 0 8px #F59E0B); transform: scale(1.15); }
.counter-display { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 8px 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; backdrop-filter: blur(8px); }
@keyframes deadlock-neon-pulse {
  0%   { border-color: rgba(244,63,94,0.2); box-shadow: 0 0 15px rgba(244,63,94,0.1); }
  50%  { border-color: #F43F5E; box-shadow: 0 0 35px rgba(244,63,94,0.6); }
  100% { border-color: rgba(244,63,94,0.2); box-shadow: 0 0 15px rgba(244,63,94,0.1); }
}
.concurrency-rails-container.deadlock-active { animation: deadlock-neon-pulse 1.2s infinite ease-in-out; border-width: 2px; }
.deadlock-alert-overlay { position: absolute; top: 16px; right: 16px; background: rgba(244,63,94,0.15); border: 1px solid #F43F5E; padding: 10px 16px; border-radius: 12px; color: #FDA4AF; font-weight: 700; font-size: 12px; backdrop-filter: blur(8px); display: flex; align-items: center; gap: 8px; z-index: 20; }
</style>
