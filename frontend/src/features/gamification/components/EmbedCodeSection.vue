<template>
  <div class="space-y-4">
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="text-[10px] text-text-muted">Widget Type</label>
        <select :value="embedConfig.widgetType" @change="updateField('widgetType', $event)" class="w-full mt-1 px-2 py-1 bg-bg-secondary border border-border-default rounded text-xs text-text-secondary font-sans select-none">
          <option value="array-visualizer">Array Visualizer</option>
          <option value="sorting-algo">Sorting Algorithm</option>
          <option value="graph-playground">Graph Playground</option>
          <option value="oop-sandbox">OOP Sandbox</option>
        </select>
      </div>
      <div>
        <label class="text-[10px] text-text-muted">Theme</label>
        <select :value="embedConfig.theme" @change="updateField('theme', $event)" class="w-full mt-1 px-2 py-1 bg-bg-secondary border border-border-default rounded text-xs text-text-secondary font-sans select-none">
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="text-[10px] text-text-muted">Width (px)</label>
        <input :value="embedConfig.width" @input="updateNumField('width', $event)" type="number" class="w-full mt-1 px-2 py-1 bg-bg-secondary border border-border-default rounded text-xs text-text-secondary" />
      </div>
      <div>
        <label class="text-[10px] text-text-muted">Height (px)</label>
        <input :value="embedConfig.height" @input="updateNumField('height', $event)" type="number" class="w-full mt-1 px-2 py-1 bg-bg-secondary border border-border-default rounded text-xs text-text-secondary" />
      </div>
    </div>

    <div class="flex gap-4">
      <label class="flex items-center gap-2 text-[10px] text-text-secondary">
        <input :checked="embedConfig.autoPlay" @change="updateBoolField('autoPlay', $event)" type="checkbox" class="rounded bg-bg-secondary border-border-default" />
        Auto Play
      </label>
      <label class="flex items-center gap-2 text-[10px] text-text-secondary">
        <input :checked="embedConfig.showControls" @change="updateBoolField('showControls', $event)" type="checkbox" class="rounded bg-bg-secondary border-border-default" />
        Show Controls
      </label>
    </div>

    <div class="p-3 bg-bg-primary border border-border-subtle rounded-lg">
      <div class="text-[10px] text-text-muted mb-2">Embed Code</div>
      <pre class="text-[10px] text-text-secondary overflow-x-auto whitespace-pre-wrap">{{ generatedEmbedCode }}</pre>
    </div>

    <button 
      @click="emit('copy')"
      class="w-full px-3 py-2 bg-accent-yellow/40 border border-accent-yellow/40 text-accent-yellow text-xs font-bold rounded-lg hover:bg-accent-yellow/40 transition-all"
    >
      {{ copySuccess ? '✓ Copied!' : 'Copy Embed Code' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { EmbedConfig } from '../xpConfig';

const props = defineProps<{
  embedConfig: EmbedConfig;
  generatedEmbedCode: string;
  copySuccess: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:embedConfig', val: EmbedConfig): void;
  (e: 'copy'): void;
}>();

const updateField = (field: keyof EmbedConfig, e: Event) => {
  const target = e.target as HTMLSelectElement;
  emit('update:embedConfig', { ...props.embedConfig, [field]: target.value });
};

const updateNumField = (field: keyof EmbedConfig, e: Event) => {
  const target = e.target as HTMLInputElement;
  emit('update:embedConfig', { ...props.embedConfig, [field]: Number(target.value) });
};

const updateBoolField = (field: keyof EmbedConfig, e: Event) => {
  const target = e.target as HTMLInputElement;
  emit('update:embedConfig', { ...props.embedConfig, [field]: target.checked });
};
</script>
