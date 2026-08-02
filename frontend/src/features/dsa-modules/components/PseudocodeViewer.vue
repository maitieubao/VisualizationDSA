<template>
  <div class="flex-1 rounded-xl overflow-hidden border border-border-subtle shadow-lg min-h-0 bg-bg-secondary p-3 flex flex-col">
    <h4 class="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-2 shrink-0">Mã giả (Pseudocode)</h4>
    <div class="flex-1 overflow-y-auto min-h-0 pr-1 space-y-0.5">
      <div v-if="pseudoCode.length > 0" class="space-y-0.5">
        <div
          v-for="(line, idx) in pseudoCode"
          :key="idx"
          class="text-xs font-mono px-2 py-0.5 rounded transition-colors whitespace-pre-wrap"
          :class="
            activeLine === idx
              ? 'bg-accent-cyan/40 text-accent-cyan font-semibold'
              : 'text-text-secondary'
          "
        >
          {{ line }}
        </div>
      </div>
      <div v-if="description" class="mt-3 text-xs text-text-muted leading-relaxed border-t border-border-subtle/30 pt-2">
        {{ description }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  pseudoCode: string[];
  activeLine: number | undefined;
  description: string;
}>();
</script>
