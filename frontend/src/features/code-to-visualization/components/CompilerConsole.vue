<template>
  <div class="flex flex-col h-full" style="background: color-mix(in srgb, var(--color-bg-terminal) 85%, transparent);">
    
    <div class="flex items-center justify-between px-4 py-2 border-b"
      style="border-color: var(--color-border-subtle); background: color-mix(in srgb, var(--color-bg-secondary) 40%, transparent);"
    >
      <div class="flex items-center gap-2">
        <BaseIcon name="terminal" class="w-3 h-3 text-text-secondary" />
        <span class="text-xs font-medium text-text-secondary uppercase tracking-wider">
          Compiler Console
        </span>
        <span class="text-[10px] text-text-disabled font-mono">
          {{ logs.length }} dòng
        </span>
      </div>
      <button
        v-if="logs.length > 0"
        @click="compilerStore.clearLogs()"
        class="text-[10px] text-text-muted hover:text-text-secondary transition-colors px-2 py-0.5 rounded"
      >
        Xóa
      </button>
    </div>

    
    <div ref="scrollContainerRef" class="flex-1 overflow-y-auto px-4 py-3 space-y-1.5"
      style="font-family: 'JetBrains Mono', monospace; font-size: 13px;"
    >
      
      <div v-if="logs.length === 0" class="flex items-center justify-center h-full">
        <p class="text-xs text-text-disabled text-center">
          Nhấn <span class="text-accent font-semibold">RUN</span> để bắt đầu biên dịch mã nguồn.
        </p>
      </div>

      
      <div
        v-for="(log, idx) in logs"
        :key="idx"
        class="console-log-line leading-relaxed"
        :class="logLineClass(log.type)"
      >
        <span class="text-text-disabled text-[11px] mr-2 select-none">{{ log.timestamp }}</span>
        <span class="font-semibold mr-1.5 text-[11px] uppercase select-none" :class="logBadgeClass(log.type)">
          [{{ logBadgeText(log.type) }}]
        </span>
        <span>{{ log.text }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref, nextTick } from 'vue';
import { useLiveCompilerStore } from '../store/useLiveCompilerStore';
import type { ConsoleLogEntry } from '../types/compiler.types';

const compilerStore = useLiveCompilerStore();
const scrollContainerRef = ref<HTMLDivElement | null>(null);

const logs = computed(() => compilerStore.compilerConsoleLogs);

watch(
  () => logs.value.length,
  async () => {
    await nextTick();
    if (scrollContainerRef.value) {
      scrollContainerRef.value.scrollTop = scrollContainerRef.value.scrollHeight;
    }
  },
);

function logLineClass(type: ConsoleLogEntry['type']): string {
  switch (type) {
    case 'success': return 'status-success';
    case 'error': return 'status-error';
    case 'warn': return 'status-warn';
    default: return 'status-info';
  }
}

function logBadgeClass(type: ConsoleLogEntry['type']): string {
  switch (type) {
    case 'success': return 'text-accent';
    case 'error': return 'text-accent-red';
    case 'warn': return 'text-accent-yellow';
    default: return 'text-text-secondary';
  }
}

function logBadgeText(type: ConsoleLogEntry['type']): string {
  switch (type) {
    case 'success': return 'SUCCESS';
    case 'error': return 'LỖI';
    case 'warn': return 'CẢNH BÁO';
    default: return 'INFO';
  }
}
</script>

<style scoped>
.status-success {
  color: var(--color-accent-cyan);
  text-shadow: 0 0 8px color-mix(in srgb, var(--color-accent-cyan) 25%, transparent);
}

.status-error {
  color: var(--color-accent-red);
  text-shadow: 0 0 8px color-mix(in srgb, var(--color-accent-red) 25%, transparent);
}

.status-warn {
  color: var(--color-accent-yellow);
}

.status-info {
  color: var(--color-text-secondary);
}
</style>
