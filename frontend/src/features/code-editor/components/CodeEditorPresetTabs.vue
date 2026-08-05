<template>
  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-border-subtle">
    <div class="flex items-center gap-1.5 shrink-0">
      <BaseIcon name="code" class="w-3.5 h-3.5 text-accent" />
      <span class="text-xs font-bold uppercase tracking-wider text-text-secondary">Mã Thuật Toán</span>
    </div>
    <div class="flex gap-1.5 flex-wrap">
      <button
        v-for="(tpl, key) in presets"
        :key="key"
        type="button"
        :aria-pressed="activePreset === key"
        @click="$emit('select', key)"
        class="px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer"
        :class="
          activePreset === key
            ? 'bg-accent text-white border-accent shadow-sm'
            : 'bg-bg-secondary text-text-muted border-border-subtle hover:text-white hover:bg-bg-surface'
        "
      >
        {{ tpl.shortName }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  presets: Record<string, { name: string; shortName: string; code: string }>;
  activePreset: string;
}>();

defineEmits<{ select: [key: string] }>();
</script>
