<template>
  <section class="theory-library-section">
    <div class="flex justify-between items-center mb-6 flex-wrap gap-3">
      <div>
        <h2 class="section-heading m-0">Thư viện Bài viết Lý thuyết</h2>
        <p class="text-text-muted text-sm mt-1">Quản lý và soạn thảo bài viết kiến thức nền tảng cho học viên</p>
      </div>
      <div class="flex gap-2 flex-wrap">
        <button type="button" class="btn-secondary" @click="showFilters = !showFilters">
          <BaseIcon name="filter" class="w-4 h-4 inline mr-1" />
          {{ showFilters ? 'Ẩn' : 'Hiện' }} bộ lọc
        </button>
        <button type="button" class="btn-primary" @click="createNewArticle">
          <BaseIcon name="plus" class="w-4 h-4 inline mr-1" />
          Tạo bài viết mới
        </button>
      </div>
    </div>

    
    <div v-if="showFilters" class="filters-panel mb-6 p-4 bg-bg-secondary border border-border-subtle rounded-xl animate-slide-down">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="form-label">Tìm kiếm</label>
          <input v-model="filters.search" type="text" class="form-input" placeholder="Tiêu đề, nội dung, tags..." @keyup.enter="loadArticles" />
        </div>
        <div>
          <label class="form-label">Danh mục</label>
          <select v-model="filters.category" class="form-select" @change="loadArticles">
            <option value="">Tất cả</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
        <div>
          <label class="form-label">Độ khó</label>
          <select v-model="filters.difficulty" class="form-select" @change="loadArticles">
            <option value="">Tất cả</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label class="form-label flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="filters.onlyPublished" class="form-checkbox" @change="loadArticles" />
            <span>Chỉ bài đã xuất bản</span>
          </label>
        </div>
      </div>
      <div class="flex gap-2 mt-4">
        <button type="button" class="btn-secondary" @click="resetFilters">
          <BaseIcon name="rotate-ccw" class="w-4 h-4 inline mr-1" />
          Đặt lại
        </button>
        <button type="button" class="btn-primary" @click="loadArticles">
          <BaseIcon name="search" class="w-4 h-4 inline mr-1" />
          Lọc
        </button>
      </div>
    </div>

    
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <span>Đang tải bài viết...</span>
    </div>

    <div v-else-if="articles.length === 0" class="empty-state">
      <div class="text-5xl mb-4"><BaseIcon name="book-open" class="w-12 h-12 text-text-muted mx-auto" /></div>
      <h3 class="text-xl font-bold text-white">Chưa có bài viết nào</h3>
      <p class="text-text-muted mt-2 max-w-md">Hãy tạo bài viết đầu tiên để bắt đầu xây dựng thư viện kiến thức</p>
      <button class="btn-primary mt-6" @click="createNewArticle">
        <BaseIcon name="plus" class="w-4 h-4 inline mr-1" /> Tạo bài viết đầu tiên
      </button>
    </div>

    <div v-else class="space-y-3">
      <div v-for="article in articles" :key="article.id" class="article-card bg-bg-secondary border border-border-subtle rounded-xl p-5 hover:border-accent/30 transition-colors">
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap mb-2">
              <h3 class="font-bold text-white truncate">{{ article.title }}</h3>
              <span v-if="article.isPublished" class="badge badge-emerald text-xs">Đã xuất bản</span>
              <span v-else class="badge badge-warning text-xs">Nháp</span>
              <span class="badge badge-indigo text-xs">{{ article.category }}</span>
              <span class="badge badge-slate text-xs">{{ article.difficulty }}</span>
            </div>
            <p class="text-text-muted text-sm line-clamp-2 mb-3">{{ article.slug }}</p>
            <div class="flex items-center gap-4 text-xs text-text-muted flex-wrap">
              <span><BaseIcon name="eye" class="w-3 h-3 inline mr-1" /> {{ article.viewCount }} lượt xem</span>
              <span><BaseIcon name="clock" class="w-3 h-3 inline mr-1" /> {{ article.readTimeMinutes }} phút đọc</span>
              <span v-if="article.tags"><BaseIcon name="tag" class="w-3 h-3 inline mr-1" /> {{ article.tags }}</span>
              <span><BaseIcon name="calendar" class="w-3 h-3 inline mr-1" /> {{ formatDate(article.updatedAt) }}</span>
              <span v-if="article.authorName"><BaseIcon name="user" class="w-3 h-3 inline mr-1" /> {{ article.authorName }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button type="button" class="btn-action-icon" @click="editArticle(article)" title="Chỉnh sửa">
              <BaseIcon name="edit-2" class="w-4 h-4" />
            </button>
            <button type="button" class="btn-action-icon" :class="article.isPublished ? 'text-accent-yellow hover:text-accent-yellow' : 'text-accent-green hover:text-accent-green'" @click="togglePublish(article)" :title="article.isPublished ? 'Gỡ xuất bản' : 'Xuất bản'">
              <BaseIcon :name="article.isPublished ? 'eye-off' : 'eye'" class="w-4 h-4" />
            </button>
            <button type="button" class="btn-action-icon text-accent-red hover:text-accent-red" @click="confirmDeleteArticle(article)" title="Xóa">
              <BaseIcon name="trash-2" class="w-4 h-4" />
            </button>
            <button type="button" class="btn-action-icon text-accent hover:text-accent" @click="viewVersions(article)" title="Xem lịch sử phiên bản">
              <BaseIcon name="git-branch" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    
    <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-6">
      <button class="btn-secondary px-3" @click="changePage(page - 1)" :disabled="page <= 1">Trước</button>
      <span class="flex items-center px-3 text-sm text-text-muted">Trang {{ page }} / {{ totalPages }}</span>
      <button class="btn-secondary px-3" @click="changePage(page + 1)" :disabled="page >= totalPages">Sau</button>
    </div>

    
    <TheoryArticleEditorModal
      v-model:show="showEditor"
      :editing-article="editingArticle"
      :categories="categories"
      @save="saveArticle"
    />

    
    <ConfirmModal
      v-model:show="showConfirmDelete"
      title="Xóa bài viết"
      :message="`Bạn có chắc chắn muốn xóa bài viết &quot;${articleToDelete?.title || ''}&quot;? Hành động này không thể hoàn tác.`"
      variant="danger"
      @confirm="deleteArticle"
    />

    
    <VersionsModal
      v-model:show="showVersions"
      :article="versionArticle"
      @restore="restoreVersion"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import BaseIcon from '@/shared/components/BaseIcon.vue';
import TheoryArticleEditorModal from './TheoryArticleEditorModal.vue';
import ConfirmModal from '@/components/ui/ConfirmModal.vue';
import VersionsModal from './VersionsModal.vue';

interface TheoryArticle {
  id: string;
  title: string;
  slug: string;
  contentMd: string;
  category: string;
  difficulty: string;
  tags: string;
  readTimeMinutes: number;
  viewCount: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  authorId: string;
  authorName: string;
  versions?: any[];
}

const articles = ref<TheoryArticle[]>([]);
const loading = ref(false);
const showEditor = ref(false);
const editingArticle = ref<TheoryArticle | null>(null);
const showConfirmDelete = ref(false);
const articleToDelete = ref<TheoryArticle | null>(null);
const showVersions = ref(false);
const versionArticle = ref<TheoryArticle | null>(null);

const page = ref(1);
const pageSize = ref(20);
const totalCount = ref(0);
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value) || 1);

const showFilters = ref(false);

const filters = ref({
  search: '',
  category: '',
  difficulty: '',
  onlyPublished: true
});

const categories = ref<string[]>([]);

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

function getAuthHeaders() {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

async function loadCategories() {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/theory-articles`, { headers: getAuthHeaders() });
    if (res.ok) {
      const data = await res.json();
      const cats = [...new Set(data.map((a: any) => a.category).filter(Boolean))] as string[];
      categories.value = cats.sort();
    }
  } catch (err) {
    console.error('Failed to load categories:', err);
  }
}

async function loadArticles() {
  page.value = 1;
  loading.value = true;
  try {
    const params = new URLSearchParams({
      page: page.value.toString(),
      pageSize: pageSize.value.toString(),
      onlyPublished: filters.value.onlyPublished.toString()
    });
    if (filters.value.search) params.append('search', filters.value.search);
    if (filters.value.category) params.append('category', filters.value.category);
    if (filters.value.difficulty) params.append('difficulty', filters.value.difficulty);

    const res = await fetch(`${BASE_URL}/api/v1/theory-articles?${params}`, { headers: getAuthHeaders() });
    if (res.ok) {
      const data = await res.json();
      articles.value = data.articles || data;
      totalCount.value = data.totalCount || data.length;
    } else {
      console.error('Failed to load articles:', await res.text());
    }
  } catch (err) {
    console.error('Failed to load articles:', err);
  } finally {
    loading.value = false;
  }
}

function changePage(newPage: number) {
  if (newPage < 1 || newPage > totalPages.value) return;
  page.value = newPage;
  loadArticles();
}

function resetFilters() {
  filters.value = {
    search: '',
    category: '',
    difficulty: '',
    onlyPublished: true
  };
  loadArticles();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function createNewArticle() {
  editingArticle.value = null;
  showEditor.value = true;
}

function editArticle(article: TheoryArticle) {
  editingArticle.value = { ...article };
  showEditor.value = true;
}

async function togglePublish(article: TheoryArticle) {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/theory-articles/${article.id}/publish`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ publish: !article.isPublished })
    });
    if (res.ok) {
      article.isPublished = !article.isPublished;
      article.publishedAt = article.isPublished ? new Date().toISOString() : null;
    } else {
      const err = await res.json();
      alert(err.message || 'Lỗi khi thay đổi trạng thái xuất bản');
    }
  } catch (err) {
    console.error('Toggle publish failed:', err);
    alert('Không thể kết nối máy chủ');
  }
}

function confirmDeleteArticle(article: TheoryArticle) {
  articleToDelete.value = article;
  showConfirmDelete.value = true;
}

async function deleteArticle() {
  if (!articleToDelete.value) return;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/theory-articles/${articleToDelete.value.id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (res.ok) {
      articles.value = articles.value.filter(a => a.id !== articleToDelete.value!.id);
      totalCount.value--;
      showConfirmDelete.value = false;
      articleToDelete.value = null;
    } else {
      const err = await res.json();
      alert(err.message || 'Xóa thất bại');
    }
  } catch (err) {
    console.error('Delete failed:', err);
    alert('Không thể kết nối máy chủ');
  }
}

function viewVersions(article: TheoryArticle) {
  versionArticle.value = article;
  showVersions.value = true;
}

function restoreVersion(version: any) {
  
  console.log('Restore version:', version);
}

async function saveArticle(data: any) {
  try {
    let res: Response;
    if (editingArticle.value) {
      res = await fetch(`${BASE_URL}/api/v1/theory-articles/${editingArticle.value.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
    } else {
      res = await fetch(`${BASE_URL}/api/v1/theory-articles`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
    }
    if (res.ok) {
      showEditor.value = false;
      editingArticle.value = null;
      loadArticles();
    } else {
      const err = await res.json();
      alert(err.message || 'Lưu thất bại');
    }
  } catch (err) {
    console.error('Save article failed:', err);
    alert('Không thể kết nối máy chủ');
  }
}

onMounted(() => {
  loadCategories();
  loadArticles();
});
</script>

<style scoped>
@import "./TheoryArticleLibraryTab.css";
</style>