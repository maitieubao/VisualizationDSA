<template>
  <div>
    
    <div class="dash-terminal-block rounded-xl overflow-hidden shadow-2xl">
      
      <div class="dash-terminal-header flex items-center justify-between px-4 py-2">
        <div class="flex gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full" style="background:var(--color-dot-close)"></span>
          <span class="w-2.5 h-2.5 rounded-full" style="background:var(--color-dot-min)"></span>
          <span class="w-2.5 h-2.5 rounded-full" style="background:var(--color-dot-max)"></span>
        </div>
        <span class="text-[10px] font-mono dash-text-muted">Type to search algorithms</span>
        <div class="w-10"></div>
      </div>
      
      
      <div class="p-4 flex items-center gap-2 text-xs font-mono dash-text-secondary relative">
        <span class="dash-text-accent font-bold shrink-0">$ find</span>
        <div class="relative w-full flex items-center">
          <svg class="absolute left-0 w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            :value="searchQuery"
            type="text"
            placeholder="Search 10 skills: try 'binary search', 'monotonic stack', 'dijkstra'..."
            class="w-full bg-transparent pl-6 pr-3 py-1 dash-input focus:outline-none border-b border-transparent transition-colors"
            @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>
    </div>

    
    <div class="flex items-center gap-3 text-xs font-mono px-1 mt-4">
      <span class="dash-text-green font-bold shrink-0">$ ls difficulty/</span>
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="chip in ['All', 'Easy', 'Medium', 'Hard']"
          :key="chip"
          class="px-2 py-0.5 rounded text-[11px] font-bold transition-all duration-200 cursor-pointer"
          :class="selectedDifficulty === chip ? 'dash-chip-active border' : 'dash-chip-idle border border-transparent'"
          @click="$emit('update:selectedDifficulty', chip)"
        >
          {{ chip.toLowerCase() }}/
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  searchQuery: string;
  selectedDifficulty: string;
}>();

defineEmits<{
  (e: 'update:searchQuery', val: string): void;
  (e: 'update:selectedDifficulty', val: string): void;
}>();
</script>
