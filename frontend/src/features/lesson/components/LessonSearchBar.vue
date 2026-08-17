<template>
  <div class="lesson-search-bar relative" ref="rootEl">
    <div class="relative">
      <BaseIcon name="search" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
      <input
        v-model="keyword"
        type="text"
        role="searchbox"
        aria-label="Tìm kiếm bài học"
        placeholder="Tìm kiếm bài học..."
        class="w-full bg-bg-surface text-text-primary border border-border-strong rounded-full pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
        @focus="onFocus"
        @keydown.esc="closeDropdown"
      />
    </div>

    <!-- F4 (FR-2.5): gợi ý sau 300ms debounce — chọn kết quả để mở bài học. -->
    <div
      v-if="isDropdownOpen && (results.length > 0 || isLoading || error)"
      class="absolute left-0 right-0 top-full mt-2 z-30 bg-bg-surface border border-border-default rounded-xl shadow-2xl overflow-hidden"
      role="listbox"
      aria-label="Kết quả tìm kiếm bài học"
    >
      <div v-if="isLoading" class="px-4 py-3 text-xs text-text-muted">Đang tìm kiếm...</div>
      <div v-else-if="error" class="px-4 py-3 text-xs text-accent-red">{{ error }}</div>
      <template v-else>
        <button
          v-for="lesson in results"
          :key="lesson.id"
          role="option"
          class="w-full text-left px-4 py-2.5 hover:bg-bg-hover transition-colors cursor-pointer"
          @click="openLesson(lesson.id)"
        >
          <span class="text-xs font-semibold text-text-primary block truncate">{{ lesson.title }}</span>
          <span class="text-[10px] text-text-muted">{{ lesson.sandboxType ?? 'Lý thuyết' }}</span>
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { lessonSearchApi, type LessonSearchResult } from '../../../services/lessonSearchApi';

const router = useRouter();
const rootEl = ref<HTMLElement | null>(null);

const keyword = ref('');
const results = ref<LessonSearchResult[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const isDropdownOpen = ref(false);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let requestSeq = 0;

function onFocus(): void {
  if (keyword.value.trim().length > 0) isDropdownOpen.value = true;
}

function closeDropdown(): void {
  isDropdownOpen.value = false;
}

function onClickOutside(event: MouseEvent): void {
  if (rootEl.value && !rootEl.value.contains(event.target as Node)) {
    closeDropdown();
  }
}

watch(keyword, (value) => {
  const trimmed = value.trim();
  if (debounceTimer) clearTimeout(debounceTimer);

  if (trimmed.length === 0) {
    results.value = [];
    error.value = null;
    isLoading.value = false;
    isDropdownOpen.value = false;
    return;
  }

  // F4 (FR-2.5): gợi ý sau 300ms — tránh gọi API mỗi lần gõ phím.
  debounceTimer = setTimeout(() => {
    void search(trimmed);
  }, 300);
});

async function search(query: string): Promise<void> {
  const seq = ++requestSeq;
  isLoading.value = true;
  error.value = null;
  isDropdownOpen.value = true;
  try {
    const found = await lessonSearchApi.search(query);
    // F4: guard chống race — response của request cũ không ghi đè request mới.
    if (seq !== requestSeq) return;
    results.value = found;
  } catch (err: unknown) {
    if (seq !== requestSeq) return;
    error.value = err instanceof Error ? err.message : 'Không thể tìm kiếm bài học.';
    results.value = [];
  } finally {
    if (seq === requestSeq) isLoading.value = false;
  }
}

function openLesson(id: string): void {
  closeDropdown();
  keyword.value = '';
  results.value = [];
  void router.push(`/lessons/${id}`);
}

onMounted(() => document.addEventListener('click', onClickOutside));
onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside);
  if (debounceTimer) clearTimeout(debounceTimer);
});
</script>
