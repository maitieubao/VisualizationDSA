<template>
  <div class="dash-root h-full flex flex-col gap-6 overflow-auto p-4 font-sans">
    
    <div class="flex items-center justify-between dash-border-b pb-4">
      <div class="flex items-center gap-2">
        <span class="font-mono text-base font-bold dash-text-secondary">~/visualizationdsa</span>
        <span class="w-1.5 h-4 dash-bg-accent animate-pulse inline-block"></span>
      </div>
    </div>

    
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
          <svg class="absolute left-0 w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search 10 skills: try 'binary search', 'monotonic stack', 'dijkstra'..."
            class="w-full bg-transparent pl-6 pr-3 py-1 dash-input focus:outline-none border-b border-transparent transition-colors"
            @input="algoStore.setSearchQuery(searchQuery)"
          />
        </div>
      </div>
    </div>

    
    <div class="flex items-center gap-3 text-xs font-mono px-1">
      <span class="dash-text-green font-bold shrink-0">$ ls difficulty/</span>
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="chip in ['All', 'Easy', 'Medium', 'Hard']"
          :key="chip"
          class="px-2 py-0.5 rounded text-[11px] font-bold transition-all duration-200"
          :class="
            selectedDifficulty === chip
              ? 'dash-chip-active border'
              : 'dash-chip-idle border border-transparent'
          "
          @click="selectedDifficulty = chip"
        >
          {{ chip.toLowerCase() }}/
        </button>
      </div>
    </div>

    
    <div v-if="algoStore.isLoading" class="space-y-4 mt-2">
      <div class="flex items-center gap-2 px-1">
        <SkeletonLoader variant="rect" width="120px" height="12px" />
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SkeletonCard v-for="i in 6" :key="i" />
      </div>
    </div>

    
    <div v-if="featuredAlgorithms.length && !searchQuery.trim() && selectedDifficulty === 'All' && (!allowedCategories || allowedCategories.length === 0)" class="space-y-3 mt-2">
      <div class="flex items-center gap-1.5 px-1">
        <span class="text-[10px] text-accent-yellow font-mono font-bold">⭐ GỢI Ý HỌC TẬP /</span>
        <h3 class="text-[10px] font-bold uppercase tracking-wider text-accent-yellow font-mono">
          featured-skills
        </h3>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        <div
          v-for="algo in featuredAlgorithms"
          :key="algo.id"
          class="group relative dash-card rounded-xl p-4 flex flex-col transition-all duration-300"
          :class="[
            algoStore.currentAlgorithm?.id === algo.id ? 'dash-card--active' : ''
          ]"
        >
          
          <div class="absolute -top-2.5 left-4 px-2 py-0.5 rounded dash-badge-recommended text-[9px] font-bold flex items-center gap-1 shadow-md font-mono">
            <span class="w-1.5 h-1.5 rounded-full bg-accent-yellow animate-ping"></span>
            highly-recommended
          </div>

          
          <div class="flex items-center justify-between dash-border-b pb-2 mb-3 mt-1">
            <div class="flex items-center gap-1.5">
              <div class="flex gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-accent-red"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-accent-yellow"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-accent-green"></span>
              </div>
              <span class="text-xs font-mono font-bold dash-text-secondary group-hover:dash-text-primary">
                {{ algo.id }}
              </span>
            </div>
            <span class="text-[9px] px-1.5 py-0.5 rounded font-bold" :class="difficultyClass(algo.difficulty)">
              {{ algo.difficulty }}
            </span>
          </div>

          
          <div class="flex items-center gap-1 text-[10px] font-mono dash-text-muted mb-2">
            <component :is="getCategoryIcon(algo.category)" class="w-3 h-3 dash-icon" />
            <span class="dash-text-green" style="opacity:0.8">{{ algo.category }}</span>
          </div>

          
          <p class="text-[11px] dash-text-secondary leading-relaxed mb-3 line-clamp-3 min-h-[3.5rem]">
            {{ getDesc(algo.id) }}
          </p>

          
          <div class="h-16 my-3 rounded dash-viz-preview overflow-hidden flex items-center justify-center relative">
            <component :is="getMiniVisualizer(algo.id)" :hovered="true" />
          </div>

          
          <div class="mt-auto flex items-center gap-2 pt-3 dash-border-t">
            <button 
              class="dash-btn-primary flex-1 py-1.5 px-2.5 rounded text-[11px] font-bold transition-all active:scale-95 flex items-center justify-center gap-1"
              @click.stop="handleSelect(algo)"
            >
              <svg class="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Mô phỏng
            </button>
            <button 
              class="dash-btn-ghost flex-1 py-1.5 px-2.5 rounded text-[11px] font-medium transition-all active:scale-95 flex items-center justify-center gap-1"
              @click.stop="handleTheorySelect(algo)"
            >
              <svg class="w-2.5 h-2.5 dash-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Lý thuyết
            </button>
          </div>
        </div>
      </div>
    </div>

    
    <div
      v-for="category in groupedAlgorithms"
      :key="category.name"
      class="space-y-4 mt-2"
    >
      
      <div class="flex items-center gap-2 px-1 dash-border-b pb-2">
        <component :is="getCategoryIcon(category.name)" class="w-4 h-4 dash-text-accent" />
        <span class="text-[10px] dash-text-muted font-mono">ls {{ category.name.toLowerCase() }}/</span>
        <span class="text-[9px] px-1.5 py-0.5 rounded-full dash-badge-count font-bold font-mono">
          {{ category.items.length }} skills
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        <div
          v-for="algo in category.items"
          :key="algo.id"
          class="group dash-card rounded-xl p-4 flex flex-col transition-all duration-300"
          :class="[
            algoStore.currentAlgorithm?.id === algo.id
              ? 'dash-card--active'
              : ''
          ]"
        >
          
          <div class="flex items-center justify-between dash-border-b pb-2 mb-3">
            <div class="flex items-center gap-1.5 min-w-0">
              <div class="flex gap-1 shrink-0">
                <span class="w-1.5 h-1.5 rounded-full bg-accent-red/80"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-accent-yellow/80"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-accent-green/80"></span>
              </div>
              <span class="text-xs font-mono font-bold dash-text-secondary truncate">
                {{ algo.id }}
              </span>
            </div>
            <span class="text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 ml-1" :class="difficultyClass(algo.difficulty)">
              {{ algo.difficulty }}
            </span>
          </div>

          
          <div class="flex items-center gap-1 text-[10px] font-mono dash-text-muted mb-2">
            <component :is="getCategoryIcon(algo.category)" class="w-3 h-3 dash-icon" />
            <span class="dash-text-green" style="opacity:0.8">{{ algo.category }}</span>
          </div>

          
          <p class="text-[11px] dash-text-secondary leading-relaxed mb-3 line-clamp-3 min-h-[3.5rem]">
            {{ getDesc(algo.id) }}
          </p>

          
          <div class="h-16 my-2 rounded dash-viz-preview flex items-center justify-center relative overflow-hidden">
            <component :is="getMiniVisualizer(algo.id)" :hovered="false" />
          </div>

          
          <div class="mt-auto flex items-center gap-2 pt-3 dash-border-t">
            <button 
              class="dash-btn-primary flex-1 py-1.5 px-2.5 rounded text-[11px] font-bold transition-all flex items-center justify-center gap-1 active:scale-95"
              @click.stop="handleSelect(algo)"
            >
              <svg class="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Mô phỏng
            </button>
            <button 
              class="dash-btn-ghost flex-1 py-1.5 px-2.5 rounded text-[11px] font-medium transition-all flex items-center justify-center gap-1 active:scale-95"
              @click.stop="handleTheorySelect(algo)"
            >
              <svg class="w-2.5 h-2.5 dash-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Lý thuyết
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, h } from 'vue';
import { useAlgorithmStore } from '../store/useAlgorithmStore';
import type { Algorithm } from '../types/algorithm.types';
import { ALGORITHM_CATALOG } from '../services/algorithmCatalog';
import { LOCAL_METADATA } from '../store/algorithmLocalMetadata';
import SkeletonLoader from '../../../components/SkeletonLoader.vue';
import SkeletonCard from '../../../components/SkeletonCard.vue';

const props = defineProps<{
  allowedCategories?: string[];
}>();

const algoStore = useAlgorithmStore();
const searchQuery = ref('');
const searchInput = ref<HTMLInputElement | null>(null);
const selectedDifficulty = ref('All');
const progressMap = ref<Record<string, 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'>>({});
const likedMap = ref<Record<string, boolean>>({});

const emit = defineEmits<{
  (e: 'select', algo: Algorithm): void;
}>();


function loadProgress() {
  try {
    const saved = localStorage.getItem('dsa_progress');
    if (saved) progressMap.value = JSON.parse(saved);
  } catch {
    progressMap.value = {};
  }
}

function saveProgress() {
  try {
    localStorage.setItem('dsa_progress', JSON.stringify(progressMap.value));
  } catch (err) {
    console.error('Failed to save dsa progress to localStorage:', err);
  }
}

function toggleProgress(algoId: string) {
  const current = progressMap.value[algoId] || 'NOT_STARTED';
  let next: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' = 'NOT_STARTED';
  
  if (current === 'NOT_STARTED') next = 'IN_PROGRESS';
  else if (current === 'IN_PROGRESS') next = 'COMPLETED';
  
  progressMap.value[algoId] = next;
  saveProgress();
}

function progressClass(status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'): string {
  switch (status) {
    case 'COMPLETED':
      return 'bg-accent-green/40 text-accent-green border-accent-green/30 hover:bg-accent-green/60';
    case 'IN_PROGRESS':
      return 'bg-accent-yellow/40 text-accent-yellow border-accent-yellow/30 hover:bg-accent-yellow/60';
    default:
      return 'bg-bg-secondary/40 text-text-muted border-zinc-900 hover:bg-bg-secondary/20';
  }
}

function progressText(status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'): string {
  switch (status) {
    case 'COMPLETED': return 'Completed';
    case 'IN_PROGRESS': return 'Learning';
    default: return 'Todo';
  }
}


function loadLikes() {
  try {
    const saved = localStorage.getItem('dsa_likes');
    if (saved) likedMap.value = JSON.parse(saved);
  } catch {
    likedMap.value = {};
  }
}

function toggleLike(algoId: string) {
  likedMap.value[algoId] = !likedMap.value[algoId];
  try {
    localStorage.setItem('dsa_likes', JSON.stringify(likedMap.value));
  } catch (err) {
    console.error('Failed to save dsa likes to localStorage:', err);
  }
}


const featuredAlgorithms = computed<Algorithm[]>(() => {
  const ids = ['binary-search', 'monotonic-stack', 'dijkstra'];
  let list = algoStore.algorithms.length ? algoStore.algorithms : ALGORITHM_CATALOG;
  const allowed = props.allowedCategories;
  if (allowed && allowed.length > 0) {
    list = list.filter((a) => allowed.includes(a.category));
  }
  return list.filter((a) => ids.includes(a.id));
});


const filteredAlgorithms = computed<Algorithm[]>(() => {
  let list = algoStore.algorithms.length ? algoStore.algorithms : ALGORITHM_CATALOG;
  
  const allowed = props.allowedCategories;
  if (allowed && allowed.length > 0) {
    list = list.filter((a) => allowed.includes(a.category));
  }
  
  
  if (selectedDifficulty.value !== 'All') {
    list = list.filter((a) => a.difficulty === selectedDifficulty.value);
  }
  
  
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter((a) => {
      const nameMatch = a.name.toLowerCase().includes(q);
      const catMatch = a.category.toLowerCase().includes(q);
      const idMatch = a.id.toLowerCase().includes(q);
      
      let conceptMatch = false;
      if (q === 'graph' || q === 'đồ thị') {
        conceptMatch = ['bfs', 'dfs', 'dijkstra'].includes(a.id);
      } else if (q === 'tree' || q === 'cây') {
        conceptMatch = ['bst', 'bfs', 'dfs', 'dijkstra'].includes(a.id);
      } else if (q === 'lifo' || q === 'ngăn xếp') {
        conceptMatch = ['stack', 'monotonic-stack'].includes(a.id);
      } else if (q === 'fifo' || q === 'hàng đợi') {
        conceptMatch = ['queue'].includes(a.id);
      } else if (q === 'mảng' || q === 'array') {
        conceptMatch = ['linear-search', 'binary-search', 'sliding-window'].includes(a.id);
      }
      
      return nameMatch || catMatch || idMatch || conceptMatch;
    });
  }
  
  return list;
});

const groupedAlgorithms = computed(() => {
  const groups: Record<string, Algorithm[]> = {};
  for (const algo of filteredAlgorithms.value) {
    if (!groups[algo.category]) groups[algo.category] = [];
    groups[algo.category].push(algo);
  }
  return Object.entries(groups).map(([name, items]) => ({ name, items }));
});


function difficultyClass(difficulty: string): string {
  switch (difficulty) {
    case 'Easy': return 'bg-accent-green/40 text-accent-green border border-accent-green/30';
    case 'Medium': return 'bg-accent-yellow/40 text-accent-yellow border border-accent-yellow/30';
    case 'Hard': return 'bg-accent-red/40 text-accent-red border border-accent-red/30';
    default: return 'bg-bg-secondary text-text-muted';
  }
}


function getDesc(algoId: string): string {
  if (LOCAL_METADATA[algoId] && LOCAL_METADATA[algoId].description) {
    return LOCAL_METADATA[algoId].description;
  }
  return 'Mô phỏng cấu trúc dữ liệu và giải thuật một cách trực quan và sư phạm nhất.';
}


function handleSelect(algo: Algorithm): void {
  algoStore.selectAlgorithm(algo, 'simulation');
  emit('select', algo);
}

function handleTheorySelect(algo: Algorithm): void {
  algoStore.selectAlgorithm(algo, 'theory');
  emit('select', algo);
}

function loadMore(): void {
  
}

function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}


function getCategoryIcon(catName: string) {
  if (catName === 'Searching') {
    return {
      render: () => h('svg', { class: 'w-4 h-4 text-[#ff7c5c]', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2.5' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' })
      ])
    };
  }
  if (catName === 'Stack-Queue') {
    return {
      render: () => h('svg', { class: 'w-4 h-4 text-[#ff7c5c]', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2.5' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v2m14 0V5a2 2 0 00-2-2H5a2 2 0 00-2 2v6' })
      ])
    };
  }
  if (catName === 'Graph') {
    return {
      render: () => h('svg', { class: 'w-4 h-4 text-[#ff7c5c]', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2.5' }, [
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' })
      ])
    };
  }
  return {
    render: () => h('svg', { class: 'w-4 h-4 text-[#ff7c5c]', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2.5' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M12 2a9 9 0 00-9 9c0 2.22 1 4.22 2.5 5.58L4 22l4-2 3.5 1.5L12 22l.5-.5 3.5 1.5 4-2-1.5-5.42A8.995 8.995 0 0012 2zm0 13c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z' })
    ])
  };
}


function getMiniVisualizer(algoId: string) {
  return {
    props: { hovered: Boolean },
    setup(props: any) {
      return () => {
        const hCls = 'w-full h-full flex items-center justify-center scale-90';
        
        switch (algoId) {
          case 'linear-search':
            return h('div', { class: hCls }, [
              h('div', { class: 'flex gap-1.5' }, Array.from({ length: 5 }).map((_, i) => 
                h('div', { 
                  class: `w-4 h-4 rounded border text-[7px] flex items-center justify-center font-mono linear-box-${i} border-zinc-800 bg-bg-secondary/50 text-text-muted`
                }, String((i + 1) * 10))
              ))
            ]);
            
          case 'binary-search':
            return h('div', { class: hCls }, [
              h('div', { class: 'flex gap-1 relative' }, Array.from({ length: 7 }).map((_, i) => 
                h('div', {
                  class: `w-3.5 h-3.5 rounded border text-[7px] flex items-center justify-center font-mono border-zinc-800 text-text-muted bg-bg-secondary/50 ${
                    i >= 4 ? 'binary-box-right' : ''
                  }`
                }, String(i * 5 + 5))
              ))
            ]);
            
          case 'sliding-window':
            return h('div', { class: hCls + ' relative px-2' }, [
              h('div', { class: 'flex gap-1 w-full justify-between relative' }, [
                Array.from({ length: 6 }).map((_, i) => 
                  h('div', { class: 'w-3.5 h-3.5 rounded border border-zinc-800/60 bg-bg-secondary/30' })
                ),
                h('div', { class: 'absolute top-0 h-3.5 rounded border border-accent-cyan bg-accent-cyan/30 shadow-sm shadow-accent-cyan/20 sliding-window-overlay' })
              ])
            ]);
            
          case 'stack':
            return h('div', { class: hCls }, [
              h('div', { class: 'w-8 h-10 border-b border-x border-zinc-800 relative flex flex-col justify-end items-center gap-0.5 pb-0.5 overflow-hidden' }, [
                h('div', { class: 'w-6 h-2 rounded bg-accent-cyan/90 stack-push-pop-2' }),
                h('div', { class: 'w-6 h-2 rounded bg-accent-cyan/70 stack-push-pop-1' }),
                h('div', { class: 'w-6 h-2 rounded bg-accent-cyan/50 stack-push-pop-0' })
              ])
            ]);
            
          case 'queue':
            return h('div', { class: hCls }, [
              h('div', { class: 'w-16 h-5 border-y border-zinc-800 relative flex items-center overflow-hidden justify-around' }, [
                h('div', { class: 'w-3 h-3 rounded-full bg-accent-cyan shadow-sm shadow-accent-cyan/45 queue-flow-2' }),
                h('div', { class: 'w-3 h-3 rounded-full bg-accent-cyan/70 queue-flow-1' }),
                h('div', { class: 'w-3 h-3 rounded-full bg-accent-cyan/50 queue-flow-0' })
              ])
            ]);
            
          case 'monotonic-stack':
            return h('div', { class: hCls }, [
              h('div', { class: 'w-8 h-10 border-b border-x border-zinc-800 relative flex flex-col justify-end items-center gap-0.5 pb-0.5 overflow-hidden' }, [
                h('div', { class: 'w-6 h-3 rounded bg-accent-cyan/90 mono-box-2' }),
                h('div', { class: 'w-5 h-2 rounded bg-accent-cyan/70 mono-box-1' }),
                h('div', { class: 'w-4 h-1.5 rounded bg-accent-cyan/50 mono-box-0' })
              ])
            ]);
            
          case 'bst':
            return h('div', { class: hCls + ' relative' }, [
              h('div', { class: 'w-14 h-10 relative' }, [
                h('div', { class: 'absolute top-2 left-3 w-4 h-px bg-bg-secondary rotate-45 origin-left' }),
                h('div', { class: 'absolute top-2 right-3 w-4 h-px bg-bg-secondary -rotate-45 origin-right' }),
                h('div', { class: 'absolute top-0 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border border-zinc-800 bg-bg-secondary bst-root' }),
                h('div', { class: 'absolute bottom-0 left-0 w-3.5 h-3.5 rounded-full border border-zinc-800 bg-bg-secondary bst-left' }),
                h('div', { class: 'absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border border-zinc-800 bg-bg-secondary bst-right' })
              ])
            ]);
            
          case 'bfs':
            return h('div', { class: hCls }, [
              h('div', { class: 'w-14 h-10 relative' }, [
                h('div', { class: 'absolute top-2 left-3 w-4 h-px bg-bg-secondary rotate-45' }),
                h('div', { class: 'absolute top-2 right-3 w-4 h-px bg-bg-secondary -rotate-45' }),
                h('div', { class: 'absolute top-0 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border border-zinc-800 bg-bg-secondary bfs-root' }),
                h('div', { class: 'absolute bottom-0 left-0 w-3.5 h-3.5 rounded-full border border-zinc-800 bg-bg-secondary bfs-child' }),
                h('div', { class: 'absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border border-zinc-800 bg-bg-secondary bfs-child' })
              ])
            ]);
            
          case 'dfs':
            return h('div', { class: hCls }, [
              h('div', { class: 'w-14 h-10 relative' }, [
                h('div', { class: 'absolute top-2 left-3 w-4 h-px bg-bg-secondary rotate-45' }),
                h('div', { class: 'absolute top-2 right-3 w-4 h-px bg-bg-secondary -rotate-45' }),
                h('div', { class: 'absolute top-0 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border border-zinc-800 bg-bg-secondary dfs-root' }),
                h('div', { class: 'absolute bottom-0 left-0 w-3.5 h-3.5 rounded-full border border-zinc-800 bg-bg-secondary dfs-left' }),
                h('div', { class: 'absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border border-zinc-800 bg-bg-secondary dfs-right' })
              ])
            ]);
            
          case 'dijkstra':
          case 'bellman-ford':
          case 'kruskal':
          case 'prim':
          case 'tarjan':
          case 'a-star':
            return h('div', { class: hCls }, [
              h('div', { class: 'w-14 h-10 relative flex items-center justify-between' }, [
                h('div', { class: 'w-3.5 h-3.5 rounded-full border border-zinc-800 bg-bg-secondary dij-node-start relative' }, [
                  h('div', { class: 'absolute top-1/2 left-full w-6 h-0.5 bg-bg-secondary dij-line-top origin-left' }),
                  h('div', { class: 'absolute top-1/2 left-full w-6 h-0.5 bg-bg-secondary dij-line-bottom origin-left rotate-45' })
                ]),
                h('div', { class: 'w-3.5 h-3.5 rounded-full border border-zinc-800 bg-bg-secondary dij-node-mid relative' }, [
                  h('div', { class: 'absolute top-1/2 left-full w-6 h-0.5 bg-bg-secondary dij-line-mid origin-left -rotate-45' })
                ]),
                h('div', { class: 'w-3.5 h-3.5 rounded-full border border-zinc-800 bg-bg-secondary dij-node-end' })
              ])
            ]);
            
          default:
            return h('div', { class: 'text-[9px] text-text-muted font-mono' }, '[ Blueprint ]');
        }
      };
    }
  };
}

function handleKeydown(e: KeyboardEvent): void {
  if (e.key === '/' && document.activeElement !== searchInput.value) {
    e.preventDefault();
    searchInput.value?.focus();
  }
  if (e.key === 'Escape') {
    searchQuery.value = '';
    algoStore.setSearchQuery('');
    searchInput.value?.blur();
  }
}

onMounted(() => {
  algoStore.fetchAlgorithms();
  loadProgress();
  loadLikes();
  document.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
@import "./AlgorithmDashboard.css";
</style>

<style scoped>







.dash-root {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
}


.dash-text-primary   { color: var(--color-text-primary); }
.dash-text-secondary { color: var(--color-text-secondary); }
.dash-text-muted     { color: var(--color-text-muted); }
.dash-text-accent    { color: var(--color-accent-primary); }
.dash-text-green     { color: var(--color-accent-green); }


.dash-bg-accent { background-color: var(--color-accent-primary); }


.dash-icon { color: var(--color-text-muted); }


.dash-border-b { border-bottom: 1px solid var(--color-border-default); }
.dash-border-t { border-top:    1px solid var(--color-border-default); }


.dash-input {
  color: var(--color-text-primary);
}
.dash-input::placeholder { color: var(--color-text-muted); }


.dash-terminal-block {
  background-color: var(--color-bg-terminal);
  border: 1px solid var(--color-border-default);
}
.dash-terminal-header {
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border-subtle);
}


.dash-chip-active {
  color: var(--color-accent-primary);
  background-color: var(--color-accent-primary-dim);
  border-color: var(--color-accent-primary-glow) !important;
}
.dash-chip-idle {
  color: var(--color-text-muted);
}
.dash-chip-idle:hover {
  color: var(--color-text-secondary);
}


.dash-nav-btn {
  color: var(--color-text-muted);
  border: 1px solid var(--color-border-subtle);
  background-color: transparent;
  transition: var(--transition-fast);
}
.dash-nav-btn:hover {
  color: var(--color-text-primary);
  border-color: var(--color-border-default);
}


.dash-btn-signin {
  color: var(--color-accent-primary);
  border: 1px solid var(--color-border-accent);
  background-color: transparent;
}
.dash-btn-signin:hover {
  background-color: var(--color-accent-primary-dim);
  border-color: var(--color-accent-primary);
}


.dash-btn-primary {
  background-color: var(--color-accent-primary);
  color: var(--color-text-inverse);
  box-shadow: 0 0 12px var(--color-accent-primary-glow);
}
.dash-btn-primary:hover {
  background-color: var(--color-accent-primary-light);
}


.dash-btn-ghost {
  border: 1px solid var(--color-border-default);
  background-color: transparent;
  color: var(--color-text-secondary);
}
.dash-btn-ghost:hover {
  border-color: var(--color-border-strong);
  color: var(--color-text-primary);
}


.dash-card {
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(12px) saturate(1.3);
  -webkit-backdrop-filter: blur(12px) saturate(1.3);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.3s ease,
              border-color 0.3s ease,
              background 0.3s ease;
}
.dash-card:hover {
  transform: translateY(-4px) scale(1.015);
  background: rgba(30, 41, 59, 0.6);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25),
              0 0 20px rgba(6, 182, 212, 0.06);
}
.dash-card:active {
  transform: translateY(-1px) scale(0.99);
  transition-duration: 0.1s;
}

.dash-card--active {
  border-color: var(--color-accent-primary) !important;
  background: rgba(6, 182, 212, 0.08) !important;
  box-shadow: 0 0 0 1px var(--color-accent-primary-dim),
              0 0 16px rgba(6, 182, 212, 0.12);
}


.dash-badge-recommended {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-accent-yellow-glow);
  color: var(--color-accent-yellow);
}


.dash-badge-count {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-subtle);
  color: var(--color-text-muted);
}


.dash-viz-preview {
  background-color: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--color-border-subtle);
}
</style>
