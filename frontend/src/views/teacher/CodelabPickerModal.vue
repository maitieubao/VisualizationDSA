<template>
  <Transition name="modal-fade">
    <!-- TC-028: role=dialog + aria-modal + focus trap + Esc (useModalA11y) -->
    <div v-if="show" ref="overlayEl" class="modal-overlay" role="dialog" aria-modal="true" aria-label="Chọn codelab" @click.self="$emit('update:show', false)">
      <div class="modal-container modal-xl">
        <div class="modal-header">
          <h3 class="modal-title">
            <BaseIcon name="code" class="w-5 h-5 inline mr-2" />
            Chọn Codelab
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
                    placeholder="Tìm kiếm codelab..."
                    @input="debouncedSearch"
                  />
                </div>
              </div>
              <div class="flex items-center gap-3">
                <select v-model="filterDifficulty" class="form-select w-32" @change="loadCodelabs">
                  <option value="">Tất cả độ khó</option>
                  <option value="1">Dễ (1)</option>
                  <option value="2">Dễ (2)</option>
                  <option value="3">Trung bình (3)</option>
                  <option value="4">Khó (4)</option>
                  <option value="5">Rất khó (5)</option>
                </select>
                <select v-model="filterLanguage" class="form-select w-36" @change="loadCodelabs">
                  <option value="">Tất cả ngôn ngữ</option>
                  <option value="csharp">C#</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="javascript">JavaScript</option>
                  <option value="cpp">C++</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                </select>
              </div>
            </div>
            
            
            <div v-if="loading" class="loading-state">
              <div class="spinner"></div>
              <span>Đang tải...</span>
            </div>
            
            <div v-else-if="codelabs.length === 0" class="empty-state text-center py-8">
              <BaseIcon name="code" class="w-12 h-12 text-text-muted mx-auto mb-3" />
              <p class="text-text-muted">Không tìm thấy Codelab phù hợp</p>
            </div>
            
            <div v-else class="codelabs-table overflow-hidden">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-border-subtle">
                    <th class="text-left p-3 text-xs font-semibold text-text-muted uppercase tracking-wider w-10"></th>
                    <th class="text-left p-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Codelab</th>
                    <th class="text-left p-3 text-xs font-semibold text-text-muted uppercase tracking-wider w-24">Độ khó</th>
                    <th class="text-left p-3 text-xs font-semibold text-text-muted uppercase tracking-wider w-32">Ngôn ngữ</th>
                    <th class="text-left p-3 text-xs font-semibold text-text-muted uppercase tracking-wider w-24">Testcases</th>
                    <th class="text-left p-3 text-xs font-semibold text-text-muted uppercase tracking-wider w-20">XP</th>
                    <th class="text-left p-3 text-xs font-semibold text-text-muted uppercase tracking-wider w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="c in codelabs" 
                    :key="c.id"
                    class="border-b border-border-subtle hover:bg-bg-hover transition-colors"
                  >
                    <td class="p-3">
                      <input 
                        type="radio" 
                        class="form-radio h-4 w-4 accent-accent" 
                        :checked="selectedCodelabId === c.id"
                        @click="selectedCodelabId = c.id"
                      >
                    </td>
                    <td class="p-3">
                      <div class="font-medium text-text-primary truncate max-w-xs">{{ c.title }}</div>
                      <div class="text-xs text-text-muted truncate max-w-xs mt-0.5">{{ c.description }}</div>
                    </td>
                    <td class="p-3">
                      <span class="diff-badge" :class="'diff-' + c.difficulty">{{ c.difficulty }}</span>
                    </td>
                    <td class="p-3 text-xs text-text-muted font-mono">{{ c.allowedLanguages }}</td>
                    <td class="p-3 text-xs text-text-muted font-mono">{{ c.testCaseCount || 0 }} tests</td>
                    <td class="p-3 text-xs text-accent-yellow font-bold">{{ c.xpReward }} XP</td>
                    <td class="p-3">
                      <button 
                        type="button" 
                        class="btn-action-icon text-text-muted hover:text-accent"
                        @click.stop="previewCodelab(c)"
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
            
            <!-- TC-029: icon mắt "Xem trước" — preview chi tiết thật -->
            <div v-if="previewCodelabData" class="codelab-preview-panel mt-4 p-4 rounded-xl border border-accent/30 bg-accent/10 animate-fade-in">
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-sm font-bold text-text-primary">{{ previewCodelabData.title }}</h4>
                <button type="button" class="btn-action-icon text-text-muted hover:text-accent" @click="previewCodelabData = null" title="Đóng preview">
                  <BaseIcon name="close" class="w-4 h-4" />
                </button>
              </div>
              <p class="text-xs text-text-muted mb-3">{{ previewCodelabData.description }}</p>
              <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
                <div v-for="tc in previewCodelabData.testCases" :key="tc.id" class="p-3 rounded-lg bg-bg-secondary border border-border-subtle">
                  <p class="text-xs font-mono text-text-secondary">Input: {{ tc.input }}</p>
                  <p class="text-xs font-mono text-text-secondary">Expected: {{ tc.expectedOutput }}</p>
                </div>
                <p v-if="!previewCodelabData.testCases?.length" class="text-xs text-text-muted">Chưa có testcase công khai.</p>
              </div>
            </div>

            
            <div v-if="selectedCodelabId" class="mt-4 p-4 bg-accent-green/10 border border-accent-green/20 rounded-xl">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-accent-green">
                  Đã chọn Codelab
                </span>
                <button type="button" class="text-text-muted hover:text-text-primary text-xs" @click="selectedCodelabId = null">
                  Xóa lựa chọn
                </button>
              </div>
              <div class="flex flex-wrap gap-2">
                <template v-for="c in codelabs" :key="c.id">
                  <span 
                    v-if="c.id === selectedCodelabId"
                    class="badge badge-emerald text-xs px-2 py-1"
                  >
                    {{ c.title }}
                  </span>
                </template>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="$emit('update:show', false)">
              Hủy
            </button>
            <button type="submit" class="btn-primary" :disabled="!selectedCodelabId">
              <span>Chọn Codelab này</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, toRef } from 'vue';
import BaseIcon from '@/shared/components/BaseIcon.vue';
import { useTeacherApi } from './useTeacherApi';
import { useModalA11y } from '../../composables/useModalA11y';

interface Props {
  show: boolean;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'select', codelab: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const loading = ref(false);
const searchQuery = ref('');
const filterDifficulty = ref('');
const filterLanguage = ref('');
const page = ref(1);
const pageSize = 20;
const codelabs = ref<any[]>([]);
const totalCount = ref(0);
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize) || 1);
const selectedCodelabId = ref<string | null>(null);
// TC-029: preview chi tiết codelab (đọc detail thật).
const previewCodelabData = ref<any | null>(null);

const { BASE_URL, teacherRequest } = useTeacherApi();

// TC-028: focus trap + Esc + khóa scroll + hoàn trả focus.
const { overlayEl } = useModalA11y(toRef(props, 'show'));

async function loadCodelabs() {
  loading.value = true;
  try {
    const params = new URLSearchParams({
      page: page.value.toString(),
      pageSize: pageSize.toString()
    });
    if (searchQuery.value) params.append('search', searchQuery.value);
    if (filterDifficulty.value) params.append('difficulty', filterDifficulty.value);
    if (filterLanguage.value) params.append('language', filterLanguage.value);

    const res = await teacherRequest(`${BASE_URL}/api/v1/codelabs?${params}`);
    if (res.ok) {
      const data = await res.json();
      codelabs.value = data.codelabs || data;
      totalCount.value = data.totalCount || data.length;
    }
  } catch (err) {
    console.error('Failed to load codelabs:', err);
  } finally {
    loading.value = false;
  }
}

function changePage(newPage: number) {
  if (newPage < 1 || newPage > totalPages.value) return;
  page.value = newPage;
  loadCodelabs();
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null;
function debouncedSearch() {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    loadCodelabs();
  }, 300);
}

function handleSelect() {
  const selected = codelabs.value.find(c => c.id === selectedCodelabId.value);
  if (selected) {
    emit('select', selected);
    emit('update:show', false);
  }
}

// TC-029: xem trước chi tiết codelab — đọc detail thật (không console.log).
async function previewCodelab(c: any) {
  try {
    const res = await teacherRequest(`${BASE_URL}/api/v1/codelabs/${c.id}`);
    if (res.ok) {
      previewCodelabData.value = await res.json();
    }
  } catch (err) {
    console.error('Failed to preview codelab:', err);
  }
}

watch(() => props.show, (newShow) => {
  if (newShow) {
    page.value = 1;
    selectedCodelabId.value = null;
    loadCodelabs();
  }
});

watch([filterDifficulty, filterLanguage], () => {
  page.value = 1;
  loadCodelabs();
});
</script>

<style scoped>
@import "./CodelabPickerModal.css";
</style>