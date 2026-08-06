<template>
  <div class="dash-root">
    <div class="dash-header">
      <div class="dash-header__search">
        <BaseIcon name="search" class="dash-header__search-icon w-[18px] h-[18px]" />
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          placeholder="Tìm kiếm thuật toán..."
          class="dash-header__input"
          @input="onSearch"
        />
        <kbd class="dash-header__shortcut">/</kbd>
      </div>
      <div class="dash-header__filters">
        <button
          v-for="chip in difficultyChips"
          :key="chip"
          class="dash-chip"
          :class="{ 'dash-chip--active': selectedDifficulty === chip }"
          @click="selectedDifficulty = chip"
        >
          {{ chip }}
        </button>
      </div>
    </div>

    <div v-if="algoStore.error" class="dash-error" role="alert">
      <BaseIcon name="warning" class="w-4 h-4 flex-shrink-0" />
      <span class="dash-error__text">{{ algoStore.error }}</span>
      <button class="dash-btn dash-btn--ghost dash-error__retry" @click="retryFetch">Thử lại</button>
    </div>

    <div v-if="algoStore.isLoading" class="dash-loading">
      <div class="dash-skeleton" v-for="i in 6" :key="i"></div>
    </div>

    <div v-if="featuredAlgorithms.length && !searchQuery && selectedDifficulty === 'All'" class="dash-section">
      <div class="dash-section__header">
        <span class="dash-section__badge"><BaseIcon name="star" class="w-3 h-3" /></span>
        <h3 class="dash-section__title">Gợi ý học tập</h3>
      </div>
      <div class="dash-grid">
        <div
          v-for="algo in featuredAlgorithms"
          :key="algo.id"
          class="dash-card"
          :class="{ 'dash-card--active': algoStore.currentAlgorithm?.id === algo.id }"
        >
          <div class="dash-card__header">
            <span class="dash-card__id">{{ algo.id }}</span>
            <span class="dash-badge" :class="difficultyClass(algo.difficulty)">{{ algo.difficulty }}</span>
          </div>
          <p class="dash-card__desc">{{ getDesc(algo.id) }}</p>
          <div class="dash-card__viz">
            <component :is="getMiniVisualizer(algo.id)" :hovered="true" />
          </div>
          <div class="dash-card__actions">
            <button class="dash-btn dash-btn--primary" @click.stop="handleSelect(algo)">Mô phỏng</button>
            <button class="dash-btn dash-btn--ghost" @click.stop="handleTheorySelect(algo)">Lý thuyết</button>
          </div>
        </div>
      </div>
    </div>

    <div v-for="category in groupedAlgorithms" :key="category.name" class="dash-section">
      <div class="dash-section__header">
        <component :is="getCategoryIcon(category.name)" class="dash-section__icon" />
        <h3 class="dash-section__title">{{ category.name }}</h3>
        <span class="dash-section__count">{{ category.items.length }}</span>
      </div>
      <div class="dash-grid">
        <div
          v-for="algo in category.items"
          :key="algo.id"
          class="dash-card"
          :class="{ 'dash-card--active': algoStore.currentAlgorithm?.id === algo.id }"
        >
          <div class="dash-card__header">
            <span class="dash-card__id">{{ algo.id }}</span>
            <span class="dash-badge" :class="difficultyClass(algo.difficulty)">{{ algo.difficulty }}</span>
          </div>
          <p class="dash-card__desc">{{ getDesc(algo.id) }}</p>
          <div class="dash-card__viz">
            <component :is="getMiniVisualizer(algo.id)" :hovered="false" />
          </div>
          <div class="dash-card__actions">
            <button class="dash-btn dash-btn--primary" @click.stop="handleSelect(algo)">Mô phỏng</button>
            <button class="dash-btn dash-btn--ghost" @click.stop="handleTheorySelect(algo)">Lý thuyết</button>
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

const props = defineProps<{
  allowedCategories?: string[];
}>();

const algoStore = useAlgorithmStore();
const searchQuery = ref('');
const searchInputRef = ref<HTMLInputElement | null>(null);
const selectedDifficulty = ref('All');

const difficultyChips = ['All', 'Easy', 'Medium', 'Hard'];

const emit = defineEmits<{
  (e: 'select', algo: Algorithm): void;
}>();

function onSearch() {
  algoStore.setSearchQuery(searchQuery.value);
}

function retryFetch(): void {
  algoStore.fetchAlgorithms();
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
    case 'Easy': return 'dash-badge--easy';
    case 'Medium': return 'dash-badge--medium';
    case 'Hard': return 'dash-badge--hard';
    default: return '';
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

function getCategoryIcon(catName: string) {
  return {
    render: () => h('svg', { class: 'dash-section__icon-svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2.5' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M12 2a9 9 0 00-9 9c0 2.22 1 4.22 2.5 5.58L4 22l4-2 3.5 1.5L12 22l.5-.5 3.5 1.5 4-2-1.5-5.42A8.995 8.995 0 0012 2zm0 13c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z' })
    ])
  };
}

function getMiniVisualizer(algoId: string) {
  return {
    props: { hovered: Boolean },
    setup() {
      return () => {
        const hCls = 'w-full h-full flex items-center justify-center scale-90';
        switch (algoId) {
          case 'linear-search':
            return h('div', { class: hCls }, [
              h('div', { class: 'flex gap-1.5' }, Array.from({ length: 5 }).map((_, i) =>
                h('div', { class: `w-4 h-4 rounded border text-[7px] flex items-center justify-center font-mono border-border-default bg-bg-secondary/50 text-text-muted` }, String((i + 1) * 10))
              ))
            ]);
          case 'binary-search':
            return h('div', { class: hCls }, [
              h('div', { class: 'flex gap-1 relative' }, Array.from({ length: 7 }).map((_, i) =>
                h('div', { class: `w-3.5 h-3.5 rounded border text-[7px] flex items-center justify-center font-mono border-border-default text-text-muted bg-bg-secondary/50 ${i >= 4 ? 'binary-box-right' : ''}` }, String(i * 5 + 5))
              ))
            ]);
          case 'stack':
            return h('div', { class: hCls }, [
              h('div', { class: 'w-8 h-10 border-b border-x border-border-default relative flex flex-col justify-end items-center gap-0.5 pb-0.5 overflow-hidden' }, [
                h('div', { class: 'w-6 h-2 rounded bg-accent-cyan/90' }),
                h('div', { class: 'w-6 h-2 rounded bg-accent-cyan/70' }),
                h('div', { class: 'w-6 h-2 rounded bg-accent-cyan/50' })
              ])
            ]);
          case 'queue':
            return h('div', { class: hCls }, [
              h('div', { class: 'w-16 h-5 border-y border-border-default relative flex items-center overflow-hidden justify-around' }, [
                h('div', { class: 'w-3 h-3 rounded-full bg-accent-cyan shadow-sm shadow-accent-cyan/45' }),
                h('div', { class: 'w-3 h-3 rounded-full bg-accent-cyan/70' }),
                h('div', { class: 'w-3 h-3 rounded-full bg-accent-cyan/50' })
              ])
            ]);
          case 'bst':
          case 'bfs':
          case 'dfs':
            return h('div', { class: hCls + ' relative' }, [
              h('div', { class: 'w-14 h-10 relative' }, [
                h('div', { class: 'absolute top-2 left-3 w-4 h-px bg-bg-secondary rotate-45' }),
                h('div', { class: 'absolute top-2 right-3 w-4 h-px bg-bg-secondary -rotate-45' }),
                h('div', { class: 'absolute top-0 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border border-border-default bg-bg-secondary' }),
                h('div', { class: 'absolute bottom-0 left-0 w-3.5 h-3.5 rounded-full border border-border-default bg-bg-secondary' }),
                h('div', { class: 'absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border border-border-default bg-bg-secondary' })
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
                h('div', { class: 'w-3.5 h-3.5 rounded-full border border-border-default bg-bg-secondary relative' }, [
                  h('div', { class: 'absolute top-1/2 left-full w-6 h-0.5 bg-bg-secondary origin-left' }),
                  h('div', { class: 'absolute top-1/2 left-full w-6 h-0.5 bg-bg-secondary origin-left rotate-45' })
                ]),
                h('div', { class: 'w-3.5 h-3.5 rounded-full border border-border-default bg-bg-secondary relative' }, [
                  h('div', { class: 'absolute top-1/2 left-full w-6 h-0.5 bg-bg-secondary origin-left -rotate-45' })
                ]),
                h('div', { class: 'w-3.5 h-3.5 rounded-full border border-border-default bg-bg-secondary' })
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
  if (e.key === '/' && document.activeElement !== searchInputRef.value) {
    e.preventDefault();
    searchInputRef.value?.focus();
  }
  if (e.key === 'Escape') {
    searchQuery.value = '';
    algoStore.setSearchQuery('');
    searchInputRef.value?.blur();
  }
}

onMounted(() => {
  algoStore.fetchAlgorithms();
  document.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.dash-root {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  padding: 1.5rem;
}

.dash-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.dash-header__search {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-subtle);
  transition: border-color 0.2s ease;
}

.dash-header__search:focus-within {
  border-color: var(--color-accent-primary);
}

.dash-header__search-icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.dash-header__input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--color-text-primary);
  font-size: 0.9rem;
  font-family: inherit;
}

.dash-header__input::placeholder {
  color: var(--color-text-muted);
}

.dash-header__shortcut {
  font-size: 0.65rem;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--color-bg-active);
  color: var(--color-text-muted);
  border: 1px solid var(--color-border-subtle);
  font-family: var(--font-mono);
}

.dash-header__filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.dash-chip {
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.dash-chip:hover {
  color: var(--color-text-secondary);
  background: var(--color-bg-hover);
}

.dash-chip--active {
  color: var(--color-accent-primary);
  background: var(--color-accent-primary-dim);
  border-color: var(--color-accent-primary);
}

.dash-loading {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.dash-error {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border-radius: 10px;
  background: color-mix(in srgb, var(--color-accent-red) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent-red) 30%, transparent);
  color: var(--color-accent-red-light);
  font-size: 0.8rem;
}

.dash-error__text {
  flex: 1;
}

.dash-error__retry {
  flex: 0 0 auto;
  padding: 0.3rem 0.75rem;
  color: var(--color-accent-red-light);
  border-color: color-mix(in srgb, var(--color-accent-red) 40%, transparent);
}

.dash-error__retry:hover {
  border-color: var(--color-accent-red-light);
  color: var(--color-text-primary);
}

.dash-skeleton {
  height: 200px;
  border-radius: 12px;
  background: var(--color-bg-surface);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.dash-section {
  margin-bottom: 2rem;
}

.dash-section__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border-subtle);
}

.dash-section__badge {
  font-size: 0.85rem;
}

.dash-section__title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-family: var(--font-mono);
}

.dash-section__count {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--color-bg-active);
  color: var(--color-text-muted);
  font-weight: 600;
  font-family: var(--font-mono);
}

.dash-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.dash-card {
  background: color-mix(in srgb, var(--color-bg-surface) 50%, transparent);
  backdrop-filter: blur(12px) saturate(1.3);
  -webkit-backdrop-filter: blur(12px) saturate(1.3);
  border: 1px solid var(--color-border-default);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dash-card:hover {
  transform: translateY(-2px);
  background: color-mix(in srgb, var(--color-bg-secondary) 60%, transparent);
  border-color: var(--color-border-strong);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.dash-card--active {
  border-color: var(--color-accent-primary) !important;
  background: color-mix(in srgb, var(--color-accent-cyan) 8%, transparent) !important;
  box-shadow: 0 0 0 1px var(--color-accent-primary-dim), 0 0 16px color-mix(in srgb, var(--color-accent-cyan) 12%, transparent);
}

.dash-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.dash-card__id {
  font-size: 0.8rem;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--color-text-secondary);
}

.dash-badge {
  font-size: 0.65rem;
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: 700;
  font-family: var(--font-mono);
  text-transform: uppercase;
}

.dash-badge--easy {
  background: color-mix(in srgb, var(--color-accent-green) 20%, transparent);
  color: var(--color-accent-green);
  border: 1px solid color-mix(in srgb, var(--color-accent-green) 30%, transparent);
}

.dash-badge--medium {
  background: color-mix(in srgb, var(--color-accent-yellow) 20%, transparent);
  color: var(--color-accent-yellow);
  border: 1px solid color-mix(in srgb, var(--color-accent-yellow) 30%, transparent);
}

.dash-badge--hard {
  background: color-mix(in srgb, var(--color-accent-red) 20%, transparent);
  color: var(--color-accent-red-light);
  border: 1px solid color-mix(in srgb, var(--color-accent-red) 30%, transparent);
}

.dash-card__desc {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin-bottom: 0.75rem;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.dash-card__viz {
  height: 64px;
  margin: 0 -0.25rem 0.75rem;
  border-radius: 8px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-subtle);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dash-card__actions {
  display: flex;
  gap: 0.5rem;
}

.dash-btn {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
  font-family: inherit;
}

.dash-btn--primary {
  background: var(--color-accent-primary);
  color: var(--color-text-inverse);
}

.dash-btn--primary:hover {
  background: var(--color-accent-primary-light);
}

.dash-btn--ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-default);
}

.dash-btn--ghost:hover {
  border-color: var(--color-border-strong);
  color: var(--color-text-primary);
}

@media (max-width: 768px) {
  .dash-root { padding: 1rem; }
  .dash-grid { grid-template-columns: 1fr; }
  .dash-header__filters { flex-wrap: wrap; }
}
</style>