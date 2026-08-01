<template>
  <div
    v-if="activeLoopVars.length > 0"
    class="px-4 py-2 bg-bg-surface/50 border-b border-border-default/30 shrink-0"
  >
    <div class="flex items-center gap-2 flex-wrap">
      <span class="text-[10px] uppercase tracking-wider text-text-muted font-medium">
        Variables:
      </span>
      <span
        v-for="[vName, vVal] in activeLoopVars"
        :key="vName"
        class="px-2 py-0.5 bg-accent-cyan/10 border border-accent-cyan/20 rounded text-xs font-mono text-accent-cyan"
      >
        {{ vName }} = {{ vVal }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  activeLoopVars: [string, any][];
}>();
</script>
