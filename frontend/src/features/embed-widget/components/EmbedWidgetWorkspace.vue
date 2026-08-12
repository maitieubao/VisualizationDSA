<template>
  <div class="embed-widget-workspace">
    
    <div class="workspace-header">
      <div class="flex items-center gap-2">
        <BaseIcon name="monitor" :stroke-width="2.5" class="text-accent" style="width:18px;height:18px" />
        <span class="text-xs font-bold uppercase tracking-wider text-text-secondary">
          Interactive Embed Widget Configurator
        </span>
      </div>
      <div class="flex items-center gap-2">
        <span class="header-badge badge-theme">{{ store.themeLabel }}</span>
        <span class="header-badge badge-algo">{{ store.algorithmLabel }}</span>
      </div>
    </div>

    
    <div class="workspace-body">
      
      <EmbedConfiguratorSidebar />

      
      <div class="workspace-content">
        
        <LiveWidgetPreview />

        
        <div class="code-section">
          <EmbedCodeSnippet />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEmbedConfiguratorStore } from '../store/useEmbedConfiguratorStore';
import EmbedConfiguratorSidebar from './EmbedConfiguratorSidebar.vue';
import LiveWidgetPreview from './LiveWidgetPreview.vue';
import EmbedCodeSnippet from './EmbedCodeSnippet.vue';

const store = useEmbedConfiguratorStore();
</script>

<style scoped>
.embed-widget-workspace {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
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
  border-bottom: 1px solid var(--color-border-subtle);
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
  background: color-mix(in srgb, var(--color-accent-cyan) 10%, transparent);
  color: var(--color-accent-cyan);
  border: 1px solid color-mix(in srgb, var(--color-accent-cyan) 20%, transparent);
}

.badge-algo {
  background: color-mix(in srgb, var(--color-accent-emerald) 10%, transparent);
  color: var(--color-accent-emerald);
  border: 1px solid color-mix(in srgb, var(--color-accent-emerald) 20%, transparent);
}

.workspace-body {
  display: flex;
  gap: 12px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* ─── EW-018: mobile — sidebar trên, preview dưới (xếp dọc) ─── */
@media (max-width: 768px) {
  .workspace-body {
    flex-direction: column;
    overflow-y: auto;
  }
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
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-subtle);
  border-radius: 14px;
}
</style>
