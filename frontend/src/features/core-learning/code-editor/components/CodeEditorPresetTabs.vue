<template>
  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-border-subtle">
    <div class="flex items-center gap-1.5 shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2.5" class="text-accent">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
      <span class="text-xs font-bold uppercase tracking-wider text-text-secondary">Mã Thuật Toán</span>
    </div>
    <div class="flex gap-1.5 flex-wrap">
      <button
        v-for="(tpl, key) in presets"
        :key="key"
        @click="$emit('select', key)"
        class="px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer"
        :class="
          activePreset === key
            ? 'bg-accent text-text-primary border-border-accent shadow-sm'
            : 'bg-bg-primary text-text-secondary border-border-default hover:text-text-primary hover:bg-bg-hover'
        "
      >
        {{ tpl.name.split(' (')[0] }}
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
