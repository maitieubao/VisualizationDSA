<template>
  <div class="space-y-2" data-tour-id="vcr-input-bar">
    <label class="text-[10px] uppercase tracking-wider text-text-muted font-medium">Input Array</label>
    <div class="flex gap-2">
      <div class="flex-1 relative">
        <input
          :value="rawInputArray"
          type="text"
          placeholder="45, 12, 85, 32, 9, 60"
          @input="$emit('update:rawInputArray', ($event.target as HTMLInputElement).value)"
          class="vcr-array-input w-full bg-bg-primary border border-border-default/50 rounded-lg px-3 py-2 text-sm font-mono text-text-secondary placeholder:text-text-muted focus:border-accent-cyan/50 focus:outline-none transition-colors"
        />
      </div>
      <button @click="$emit('randomize')" class="px-3 py-2 bg-bg-hover hover:bg-bg-hover text-text-secondary border border-border-default rounded-lg text-xs font-bold transition-colors cursor-pointer">
        Random
      </button>
      <button @click="$emit('compile')" class="px-5 py-2 bg-accent hover:bg-accent text-text-primary shadow-lg shadow-indigo-500/20 rounded-lg text-xs font-bold transition-colors cursor-pointer">
        Run
      </button>
    </div>
    <div v-if="compilationError" class="p-2.5 bg-accent-red/10 border border-accent-red/20 rounded-lg text-xs text-accent-red">
      {{ compilationError }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ rawInputArray: string; compilationError: string | null }>();
defineEmits<{ randomize: []; compile: []; 'update:rawInputArray': [value: string] }>();
</script>
