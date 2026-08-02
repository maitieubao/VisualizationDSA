<template>
  <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap bg-bg-surface p-4 rounded-xl border border-border-default">
    
    <div class="relative flex-1 min-w-[200px] w-full sm:w-auto">
      <input
        :value="searchQuery"
        @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
        type="text"
        placeholder="TÃ¬m kiáº¿m khÃ³a há»c..."
        class="w-full px-4 py-2 pl-10 bg-bg-primary/60 border border-border-default rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-accent/50 transition-colors"
      />
      <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>

    
    <div class="flex items-center gap-1.5 flex-wrap">
      <span class="text-[10px] text-text-muted font-bold uppercase tracking-wider mr-2">Danh má»¥c</span>
      <button
        v-for="cat in categories"
        :key="cat"
        @click="$emit('update:category', cat)"
        class="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
        :class="selectedCategory === cat
          ? 'bg-accent text-text-primary shadow-lg shadow-indigo-600/30 border border-border-accent/50'
          : 'bg-bg-primary/60 text-text-secondary hover:text-text-primary border border-border-default hover:border-border-strong hover:bg-bg-hover'"
      >
        {{ cat === 'All' ? 'Táº¥t cáº£' : cat }}
      </button>
    </div>

    
    <div class="flex items-center gap-1.5 flex-wrap">
      <span class="text-[10px] text-text-muted font-bold uppercase tracking-wider mr-2">Äá»™ khÃ³</span>
      <button
        v-for="diff in difficulties"
        :key="diff"
        @click="$emit('update:difficulty', diff)"
        class="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
        :class="selectedDifficulty === diff
          ? 'bg-accent text-text-primary shadow-lg shadow-indigo-600/30 border border-border-accent/50'
          : 'bg-bg-primary/60 text-text-secondary hover:text-text-primary border border-border-default hover:border-border-strong hover:bg-bg-hover'"
      >
        {{ diff === 'All' ? 'Táº¥t cáº£' : (diff === 'Easy' ? 'Dá»…' : diff === 'Medium' ? 'Trung bÃ¬nh' : 'KhÃ³') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  categories: string[];
  difficulties: string[];
  selectedCategory: string;
  selectedDifficulty: string;
  searchQuery: string;
}>();

defineEmits<{
  (e: 'update:category', value: string): void;
  (e: 'update:difficulty', value: string): void;
  (e: 'update:searchQuery', value: string): void;
}>();
</script>
