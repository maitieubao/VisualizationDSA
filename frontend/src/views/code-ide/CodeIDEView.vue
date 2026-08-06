<template>
  <div class="code-debugger-view-root flex flex-col h-full w-full gap-4 p-4 max-w-[1600px] mx-auto overflow-hidden">
    
    <div class="tabs-header-bar flex items-center justify-between px-4 py-3 border rounded-xl"
      style="background: var(--glass-bg); backdrop-filter: blur(12px); border-color: var(--glass-border);"
    >
      <div class="flex items-center gap-2 font-mono text-xs font-bold text-text-primary">
        <BaseIcon name="code-ide" class="w-4 h-4 text-[var(--color-accent-cyan)]" />
        <span>Gỡ lỗi Code (IDE Workspace)</span>
      </div>
      <div class="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-text-muted select-none">
        <span class="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-cyan)] animate-pulse"></span>
        <span>Code IDE Suite</span>
      </div>
    </div>

    
    <div class="flex-1 min-h-0 relative">
      <CodeWorkspace class="absolute inset-0 w-full h-full" />
    </div>

    
    <HelpButton />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { CodeWorkspace } from '../../features/code-to-visualization';
import BaseIcon from '../../shared/components/BaseIcon.vue';
import HelpButton from '../../features/guided-tour/components/HelpButton.vue';
import { useGuidedTourStore } from '../../features/guided-tour/store/useGuidedTourStore';

const tourStore = useGuidedTourStore();

onMounted(() => {
  tourStore.startPageTour('/code-ide', false);
});
</script>

<style scoped>
.code-debugger-view-root {
  background-color: var(--color-bg-primary);
}
</style>
