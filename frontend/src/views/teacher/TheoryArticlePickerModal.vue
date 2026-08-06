<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="$emit('update:show', false)">
      <div class="modal-container modal-xl">
        <div class="modal-header">
          <h3 class="modal-title">
            <BaseIcon name="book-open" class="w-5 h-5 inline mr-2" />
            Chọn bài viết lý thuyết
          </h3>
          <button type="button" class="modal-close" @click="$emit('update:show', false)">
            <BaseIcon name="x" class="w-5 h-5" />
          </button>
        </div>
        
        <form @submit.prevent="handleSelect">
          <div class="modal-body">
            
            <div class="picker-toolbar mb-4">
              <div class="search-box flex-1">
                <div class="relative">
                  <BaseIcon name="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input 
                    v-model="searchQuery" 
                    type="text" 
                    class="form-input pl-10" 
                    placeholder="Tìm kiếm theo tiêu đề, danh mục, tags..."
                    @input="debouncedSearch"
                  />
                </div>
              </div>
              <div class="flex items-center gap-3">
                <select v-model="filterCategory" class="form-select w-40" @change="loadArticles">
                  <option value="">Tất cả danh mục</option>
                  <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
                <select v-model="filterDifficulty" class="form-select w-32" @change="loadArticles">
                  <option value="">Tất cả độ khó</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
            
            
            <div v-if="loading" class="loading-state">
              <div class="spinner"></div>
              <span>Đang tải...</span>
            </div>
            
            <div v-else-if="articles.length === 0" class="empty-state text-center py-8">
              <BaseIcon name="book-open" class="w-12 h-12 text-text-muted mx-auto mb-3" />
              <p class="text-text-muted">Không tìm thấy bài viết phù hợp</p>
            </div>
            
            <div v-else class="articles-table overflow-hidden">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-border-subtle">
                    <th class="text-left p-3 text-xs font-semibold text-text-muted uppercase tracking-wider w-10"></th>
                    <th class="text-left p-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Bài viết</th>
                    <th class="text-left p-3 text-xs font-semibold text-text-muted uppercase tracking-wider w-32">Danh mục</th>
                    <th class="text-left p-3 text-xs font-semibold text-text-muted uppercase tracking-wider w-24">Độ khó</th>
                    <th class="text-left p-3 text-xs font-semibold text-text-muted uppercase tracking-wider w-20">Đọc</th>
                    <th class="text-left p-3 text-xs font-semibold text-text-muted uppercase tracking-wider w-20">Lượt xem</th>
                    <th class="text-left p-3 text-xs font-semibold text-text-muted uppercase tracking-wider w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="article in articles" 
                    :key="article.id"
                    class="border-b border-border-subtle hover:bg-bg-hover transition-colors"
                    @click="toggleSelect(article)"
                  >
                    <td class="p-3">
                      <input 
                        type="checkbox" 
                        class="form-checkbox h-4 w-4 accent-accent" 
                        :checked="isSelected(article)"
                        @click.stop
                      >
                    </td>
                    <td class="p-3">
                      <div class="font-medium text-text-primary truncate max-w-xs">{{ article.title }}</div>
                      <div class="text-xs text-text-muted truncate max-w-xs mt-0.5">{{ article.slug }}</div>
                    </td>
                    <td class="p-3 text-xs text-text-muted">{{ article.category }}</td>
                    <td class="p-3">
                      <span class="badge" :class="difficultyBadgeClass(article.difficulty)">
                        {{ article.difficulty }}
                      </span>
                    </td>
                    <td class="p-3 text-xs text-text-muted">{{ article.readTimeMinutes }} phút</td>
                    <td class="p-3 text-xs text-text-muted">{{ article.viewCount }}</td>
                    <td class="p-3">
                      <button 
                        type="button" 
                        class="btn-action-icon text-text-muted hover:text-accent"
                        @click.stop="previewArticle(article)"
                        title="Xem trước"
                      >
                        <BaseIcon name="eye" class="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            
            <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-4 pt-4 border-t border-border-subtle">
              <button class="btn-secondary px-3 text-xs" @click="changePage(page - 1)" :disabled="page <= 1">Trước</button>
              <span class="text-sm text-text-muted px-2">Trang {{ page }} / {{ totalPages }}</span>
              <button class="btn-secondary px-3 text-xs" @click="changePage(page + 1)" :disabled="page >= totalPages">Sau</button>
            </div>
            
            
            <div v-if="selectedArticles.length > 0" class="mt-4 p-4 bg-accent/10 border border-accent/20 rounded-xl">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-accent">
                  Đã chọn {{ selectedArticles.length }} bài viết
                </span>
                <button type="button" class="text-text-muted hover:text-text-primary text-xs" @click="clearSelection">
                  Xóa tất cả
                </button>
              </div>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="a in selectedArticles" 
                  :key="a.id"
                  class="badge badge-indigo text-xs px-2 py-1"
                >
                  {{ a.title }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="$emit('update:show', false)">
              Hủy
            </button>
            <button type="submit" class="btn-primary" :disabled="selectedArticles.length === 0">
              <span v-if="multiple">
                Chọn {{ selectedArticles.length }} bài viết
              </span>
              <span v-else>
                Chọn bài viết này
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import BaseIcon from '@/shared/components/BaseIcon.vue';

interface Props {
  show: boolean;
  multiple?: boolean;
  selectedArticleIds?: string[];
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'select', articles: any[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  selectedArticleIds: () => []
});

const emit = defineEmits<Emits>();

const loading = ref(false);
const searchQuery = ref('');
const filterCategory = ref('');
const filterDifficulty = ref('');
const page = ref(1);
const pageSize = 20;
const articles = ref<any[]>([]);
const totalCount = ref(0);
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize) || 1);
const categories = ref<string[]>([]);
const selectedArticles = ref<any[]>([]);

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

function getAuthHeaders() {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

function isSelected(article: any): boolean {
  return props.selectedArticleIds?.includes(article.id) || selectedArticles.value.some(s => s.id === article.id);
}

function toggleSelect(article: any) {
  const idx = selectedArticles.value.findIndex(a => a.id === article.id);
  if (idx >= 0) {
    selectedArticles.value.splice(idx, 1);
  } else {
    if (!props.multiple) {
      selectedArticles.value = [];
    }
    selectedArticles.value.push(article);
  }
}

function clearSelection() {
  selectedArticles.value = [];
}

function handleSelect() {
  emit('select', selectedArticles.value);
  emit('update:show', false);
}

function previewArticle(article: any) {
  
  console.log('Preview:', article);
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null;
function debouncedSearch() {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    loadArticles();
  }, 300);
}

async function loadArticles() {
  loading.value = true;
  try {
    const params = new URLSearchParams({
      page: page.value.toString(),
      pageSize: pageSize.toString(),
      onlyPublished: 'true'
    });
    if (searchQuery.value) params.append('search', searchQuery.value);
    if (filterCategory.value) params.append('category', filterCategory.value);
    if (filterDifficulty.value) params.append('difficulty', filterDifficulty.value);

    const res = await fetch(`${BASE_URL}/api/v1/theory-articles?${params}`, { headers: getAuthHeaders() });
    if (res.ok) {
      const data = await res.json();
      articles.value = data.articles || data;
      totalCount.value = data.totalCount || data.length;
    }
  } catch (err) {
    console.error('Failed to load articles:', err);
  } finally {
    loading.value = false;
  }
}

async function loadCategories() {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/theory-articles?pageSize=1000`, { headers: getAuthHeaders() });
    if (res.ok) {
      const data = await res.json();
      const cats = [...new Set((data.articles || data).map((a: any) => a.category).filter(Boolean))] as string[];
      categories.value = cats.sort();
    }
  } catch (err) {
    console.error('Failed to load categories:', err);
  }
}

function changePage(newPage: number) {
  if (newPage < 1 || newPage > totalPages.value) return;
  page.value = newPage;
  loadArticles();
}

function difficultyBadgeClass(diff: string): string {
  switch (diff) {
    case 'Beginner': return 'badge-emerald';
    case 'Intermediate': return 'badge-amber';
    case 'Advanced': return 'badge-rose';
    default: return 'badge-slate';
  }
}


watch(() => props.show, (newShow) => {
  if (newShow) {
    page.value = 1;
    selectedArticles.value = [];
    loadArticles();
    loadCategories();
  }
});

watch(() => props.selectedArticleIds, (newIds) => {
  if (newIds && newIds.length > 0 && selectedArticles.value.length === 0) {
    
  }
});
</script>

<style scoped>
@import "./TheoryArticlePickerModal.css";
</style>