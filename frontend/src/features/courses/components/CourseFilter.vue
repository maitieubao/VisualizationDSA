<template>
  <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap bg-slate-900/40 p-4 rounded-xl border border-white/5">
    
    <div class="relative flex-1 min-w-[200px] w-full sm:w-auto">
      <input
        :value="searchQuery"
        @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
        type="text"
        placeholder="Tìm kiếm khóa học..."
        class="w-full px-4 py-2 pl-10 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
      />
      <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>

    
    <div class="flex items-center gap-1.5 flex-wrap">
      <span class="text-[10px] text-slate-500 font-bold uppercase tracking-wider mr-2">Danh mục</span>
      <button
        v-for="cat in categories"
        :key="cat"
        @click="$emit('update:category', cat)"
        class="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
        :class="selectedCategory === cat
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-500/50'
          : 'bg-slate-950/60 text-slate-400 hover:text-white border border-white/5 hover:border-white/20 hover:bg-slate-800'"
      >
        {{ cat === 'All' ? 'Tất cả' : cat }}
      </button>
    </div>

    
    <div class="flex items-center gap-1.5 flex-wrap">
      <span class="text-[10px] text-slate-500 font-bold uppercase tracking-wider mr-2">Độ khó</span>
      <button
        v-for="diff in difficulties"
        :key="diff"
        @click="$emit('update:difficulty', diff)"
        class="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
        :class="selectedDifficulty === diff
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-500/50'
          : 'bg-slate-950/60 text-slate-400 hover:text-white border border-white/5 hover:border-white/20 hover:bg-slate-800'"
      >
        {{ diff === 'All' ? 'Tất cả' : (diff === 'Easy' ? 'Dễ' : diff === 'Medium' ? 'Trung bình' : 'Khó') }}
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
