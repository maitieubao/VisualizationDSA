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
