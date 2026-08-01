<template>
  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
    <div class="flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2.5" class="text-accent">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
      <span class="text-xs font-bold uppercase tracking-wider text-text-secondary">Soạn thảo thuật toán</span>
    </div>
    <div class="flex gap-2">
      <button
        v-for="(tpl, key) in presets"
        :key="key"
        @click="$emit('select', key)"
        class="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95"
        :class="
          activePreset === key
            ? 'bg-accent-cyan/40 text-accent border-accent-cyan/80'
            : 'bg-bg-primary text-text-secondary border-border-subtle hover:text-text-primary'
        "
      >
        {{ tpl.name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  presets: Record<string, { name: string; code: string }>;
  activePreset: string;
}>();

defineEmits<{ select: [key: string] }>();
</script>
