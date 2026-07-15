<template>
  <div class="embed-widget-workspace">
    <!-- Header -->
    <div class="workspace-header">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2.5" class="text-accent">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
        <span class="text-xs font-bold uppercase tracking-wider text-text-secondary">
          Interactive Embed Widget Configurator
        </span>
      </div>
      <div class="flex items-center gap-2">
        <span class="header-badge badge-theme">{{ store.selectedTheme }}</span>
        <span class="header-badge badge-algo">{{ algorithmLabel }}</span>
      </div>
    </div>

    <!-- Main content: sidebar + preview + code -->
    <div class="workspace-body">
      <!-- Left: Configurator sidebar -->
      <EmbedConfiguratorSidebar />

      <!-- Center + Right: Preview and Code -->
      <div class="workspace-content">
        <!-- Live Preview -->
        <LiveWidgetPreview />

        <!-- Code Snippet -->
        <div class="code-section">
          <EmbedCodeSnippet />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEmbedConfiguratorStore } from '../store/useEmbedConfiguratorStore';
import { EMBED_ALGORITHM_OPTIONS } from '../types/embed-widget.types';
import EmbedConfiguratorSidebar from './EmbedConfiguratorSidebar.vue';
import LiveWidgetPreview from './LiveWidgetPreview.vue';
import EmbedCodeSnippet from './EmbedCodeSnippet.vue';

const store = useEmbedConfiguratorStore();

const algorithmLabel = computed(() => {
  const found = EMBED_ALGORITHM_OPTIONS.find(
    (a) => a.id === store.selectedAlgorithm,
  );
  return found ? found.label : store.selectedAlgorithm;
});
</script>

<style scoped>
.embed-widget-workspace {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: rgba(14, 23, 38, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(100, 116, 139, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  height: 100%;
  overflow: hidden;
}

.workspace-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.header-badge {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 3px 8px;
  border-radius: 6px;
}

.badge-theme {
  background: rgba(6, 182, 212, 0.1);
  color: #06b6d4;
  border: 1px solid rgba(6, 182, 212, 0.2);
}

.badge-algo {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.workspace-body {
  display: flex;
  gap: 12px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.workspace-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  overflow-y: auto;
}

.code-section {
  flex-shrink: 0;
  padding: 16px;
  background: rgba(7, 11, 19, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 14px;
}
</style>
