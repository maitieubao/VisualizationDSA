<template>
  <section class="codelab-builder-section">
    <div class="flex justify-between items-center mb-6 flex-wrap gap-3">
      <div>
        <h2 class="section-heading m-0">Quản lý Codelab (Thực hành Code)</h2>
        <p class="text-text-muted text-sm mt-1">Tạo bài tập lập trình với testcases, starter code đa ngôn ngữ, hints tiered</p>
      </div>
      <button type="button" class="btn-primary" @click="createNewCodelab">
        <BaseIcon name="plus" class="w-4 h-4 inline mr-1 align-middle" /> Tạo Codelab mới
      </button>
    </div>

    <!-- TC-020: banner lỗi tách khỏi empty state -->
    <div v-if="loadError" class="error-banner mb-6 flex items-center justify-between gap-3 rounded-xl border border-accent-red/30 bg-accent-red/10 px-4 py-3">
      <span class="text-sm text-accent-red"><BaseIcon name="alert-circle" class="w-4 h-4 inline mr-1 align-middle" />{{ loadError }}</span>
      <button type="button" class="btn-secondary text-xs px-3 py-1.5" @click="loadCodelabs">Thử lại</button>
    </div>

    <!-- TC-031: thang độ khó đồng bộ easy/medium/hard (dễ hiểu hơn 1-5) -->
    <div class="filters-bar mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
      <div class="relative w-full sm:w-64">
        <input v-model="searchQuery" @input="debouncedSearch" type="text" placeholder="Tìm kiếm codelab..." class="appearance-none w-full bg-bg-secondary text-text-primary border border-border-subtle rounded-full pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all" />
        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-text-muted">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
      </div>
      <div class="flex gap-2 w-full sm:w-auto">
        <select v-model="filterDifficulty" class="appearance-none bg-bg-secondary text-text-primary border border-border-subtle rounded-full pl-4 pr-10 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all cursor-pointer">
          <option value="">Tất cả độ khó</option>
          <option value="1">Dễ (1)</option>
          <option value="2">Dễ (2)</option>
          <option value="3">Trung bình (3)</option>
          <option value="4">Khó (4)</option>
          <option value="5">Rất khó (5)</option>
        </select>
        <select v-model="filterLanguage" class="appearance-none bg-bg-secondary text-text-primary border border-border-subtle rounded-full pl-4 pr-10 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all cursor-pointer">
          <option value="">Tất cả ngôn ngữ</option>
          <option value="csharp">C#</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="javascript">JavaScript</option>
          <option value="cpp">C++</option>
          <option value="go">Go</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <span>Đang tải danh sách Codelab...</span>
    </div>

    <div v-else-if="codelabsList.length === 0" class="empty-state">
      <div class="text-5xl mb-4"><BaseIcon name="monitor" class="w-12 h-12 text-text-muted mx-auto" /></div>
      <h3 class="text-xl font-bold text-text-primary">Chưa có Codelab nào</h3>
      <p class="text-text-muted mt-2 max-w-md">Tạo Codelab đầu tiên để bắt đầu xây dựng bài tập thực hành</p>
      <button class="btn-primary mt-6" @click="createNewCodelab">
        <BaseIcon name="plus" class="w-4 h-4 inline mr-1" /> Tạo Codelab đầu tiên
      </button>
    </div>

    <div v-else class="codelabs-table-container">
      <table class="codelabs-table">
        <thead>
          <tr>
            <th>Codelab</th>
            <th>Độ khó</th>
            <th>Ngôn ngữ</th>
            <th>Testcases</th>
            <th>XP</th>
            <th class="text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="c in codelabsList" :key="c.id">
            <tr @click="toggleCodelabAccordion(c.id)" class="cursor-pointer hover:bg-bg-hover transition-colors">
              <td class="font-bold text-text-primary">
                <span class="inline-block mr-1 transition-transform duration-200" :style="expandedCodelabId === c.id ? 'transform: rotate(90deg)' : ''">▶</span>
                {{ c.title }}
              </td>
              <td><span class="diff-badge" :class="'diff-' + c.difficulty">{{ c.difficulty }}</span></td>
              <td class="text-xs text-text-muted font-mono">{{ c.allowedLanguages }}</td>
              <td class="font-mono text-text-secondary">{{ c.testCaseCount }} tests</td>
              <td class="font-bold text-accent-yellow">+{{ c.xpReward }} XP</td>
              <td>
                <div class="flex justify-center gap-2" @click.stop>
                  <button type="button" class="btn-action btn-action--edit" @click="editCodelab(c)" title="Chỉnh sửa">
                    <BaseIcon name="edit" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> Sửa
                  </button>
                  <button type="button" class="btn-action btn-action--delete" @click="deleteCodelab(c.id)" title="Xóa">
                    <BaseIcon name="trash" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> Xóa
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="expandedCodelabId === c.id" class="accordion-row">
              <td colspan="6" class="accordion-cell">
                <div v-if="loadingCodelabDetails[c.id]" class="loading-detail py-4">
                  <div class="spinner spinner--sm"></div>
                  <span>Đang tải chi tiết...</span>
                </div>
                <div v-else class="codelab-detail-panel animate-fade-in">
                  <div class="flex justify-between items-center mb-4">
                    <h4 class="detail-title text-accent font-bold m-0"><BaseIcon name="code" class="w-4 h-4 text-accent inline mr-1 align-text-bottom" /> Chi tiết: {{ c.title }}</h4>
                  </div>
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- TC-003: Testcases — CRUD thật qua /api/v1/codelabs/{id}/testcases -->
                    <div class="space-y-3">
                      <h5 class="text-xs font-semibold text-accent uppercase tracking-wider mb-3">Testcases ({{ c.testcases?.length || 0 }})</h5>
                      <div v-if="!c.testcases?.length" class="empty-state py-4 text-center text-sm">Chưa có testcase nào</div>
                      <div v-else class="space-y-2">
                        <div v-for="tc in c.testcases" :key="tc.id" class="testcase-card p-3 rounded-lg border border-border-subtle bg-bg-secondary/20 flex items-center justify-between">
                          <div class="flex items-center gap-3">
                            <span class="badge" :class="tc.isHidden ? 'badge-rose' : 'badge-emerald'">{{ tc.isHidden ? 'Ẩn' : 'Công khai' }}</span>
                            <span class="text-xs text-text-muted font-mono">Input: {{ tc.input }}</span>
                            <span class="text-xs text-text-muted font-mono">Expected: {{ tc.expectedOutput }}</span>
                          </div>
                          <div class="flex gap-2">
                            <button type="button" class="btn-action btn-action--edit text-xs" @click="editTestCase(c, tc)">Sửa</button>
                            <button type="button" class="btn-action btn-action--delete text-xs" @click="deleteTestCase(c.id, tc.id)">Xóa</button>
                          </div>
                        </div>
                      </div>
                      <button type="button" class="btn-add-inline w-full" @click="addTestCase(c)">
                        <BaseIcon name="plus" class="w-3.5 h-3.5 inline mr-1" /> Thêm Testcase
                      </button>
                    </div>

                    <!-- TC-003: Templates — CRUD thật qua /api/v1/codelabs/{id}/templates -->
                    <div class="space-y-3">
                      <h5 class="text-xs font-semibold text-accent-green uppercase tracking-wider mb-3">Starter Templates ({{ c.templates?.length || 0 }})</h5>
                      <div v-if="!c.templates?.length" class="empty-state py-4 text-center text-sm">Chưa có template nào</div>
                      <div v-else class="space-y-2">
                        <div v-for="tmpl in c.templates" :key="tmpl.id" class="template-card p-3 rounded-lg border border-border-subtle bg-bg-secondary/20 flex items-center justify-between">
                          <div class="flex items-center gap-3">
                            <span class="badge badge-emerald text-xs">{{ tmpl.language }}</span>
                            <span class="text-xs text-text-muted">Starter code: {{ tmpl.starterCode?.length || 0 }} ký tự</span>
                          </div>
                          <div class="flex gap-2">
                            <button type="button" class="btn-action btn-action--edit text-xs" @click="editTemplate(c, tmpl)">Sửa</button>
                            <button type="button" class="btn-action btn-action--delete text-xs" @click="deleteTemplate(c.id, tmpl.id)">Xóa</button>
                          </div>
                        </div>
                      </div>
                      <button type="button" class="btn-add-inline w-full" @click="addTemplate(c)">
                        <BaseIcon name="plus" class="w-3.5 h-3.5 inline mr-1" /> Thêm Template
                      </button>
                    </div>
                  </div>

                  <!-- TC-003: Hints — CRUD thật qua /api/v1/codelabs/{id}/hints -->
                  <div class="mt-6">
                    <h5 class="text-xs font-semibold text-accent-purple uppercase tracking-wider mb-3">Hints ({{ c.hints?.length || 0 }})</h5>
                    <div v-if="!c.hints?.length" class="empty-state py-4 text-center text-sm">Chưa có hint nào</div>
                    <div v-else class="space-y-2">
                      <div v-for="hint in c.hints" :key="hint.id" class="hint-card p-3 rounded-lg border border-border-subtle bg-bg-secondary/20 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                          <span class="badge badge-purple text-xs">Hint #{{ hint.orderIndex }}</span>
                          <span class="badge" :class="hint.isTiered ? 'badge-amber' : 'badge-slate'">{{ hint.isTiered ? 'Tiered (XP cost)' : 'Thường' }}</span>
                          <span class="text-xs text-text-muted line-clamp-1 max-w-xs">{{ hint.content }}</span>
                        </div>
                        <div class="flex gap-2">
                          <button type="button" class="btn-action btn-action--edit text-xs" @click="editHint(c, hint)">Sửa</button>
                          <button type="button" class="btn-action btn-action--delete text-xs" @click="deleteHint(c.id, hint.id)">Xóa</button>
                        </div>
                      </div>
                    </div>
                    <button type="button" class="btn-add-inline w-full" @click="addHint(c)">
                      <BaseIcon name="plus" class="w-3.5 h-3.5 inline mr-1" /> Thêm Hint
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- TC-002: CodelabEditorModal — CRUD thật -->
    <CodelabEditorModal
      v-model:show="showCodelabEditor"
      :editing-codelab="editingCodelab"
      @save="saveCodelab"
    />

    <!-- TC-003: thay 3 modal stub (TestCase/Template/Hint) bằng CodelabItemModal thật -->
    <CodelabItemModal
      v-model:show="showItemModal"
      :Type="itemModalType"
      :editing-item="editingItem"
      :parent-codelab-id="editingItemCodelabId"
      @save="saveItem"
    />

    <!-- Confirm Xóa -->
    <ConfirmModal
      v-model:show="showConfirmDelete"
      :title="confirmDeleteTitle"
      :message="confirmDeleteMessage"
      :confirm-text="'Xóa'"
      :variant="'danger'"
      @confirm="executeDelete"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useTeacherApi } from './useTeacherApi';
import { useToastStore } from '../../composables/useToast';
import CodelabEditorModal from './CodelabEditorModal.vue';
import CodelabItemModal from './CodelabItemModal.vue';
import ConfirmModal from '@/components/ui/ConfirmModal.vue';
import BaseIcon from '@/shared/components/BaseIcon.vue';

// TC-002/TC-003: backend CodelabController đã có đầy đủ CRUD /api/v1/codelabs
// (POST/PUT/DELETE + testcases/templates/hints) — implement thật, không phải stub.

interface CodelabListItem {
  id: string;
  title: string;
  difficulty: number;
  xpReward: number;
  allowedLanguages: string;
  testCaseCount: number;
  tags: string;
}

interface CodelabDetail extends CodelabListItem {
  description: string;
  initialCode: string;
  maxRuntimeMs: number;
  maxMemoryBytes: number;
  constraints: string;
  examples: string;
  testcases?: Array<{ id: string; input: string; expectedOutput: string; isHidden: boolean; orderIndex: number }>;
  templates?: Array<{ id: string; language: string; starterCode: string }>;
  hints?: Array<{ id: string; content: string; isTiered: boolean; xpCost: number; orderIndex: number }>;
}

const { BASE_URL, teacherRequest } = useTeacherApi();
const toastStore = useToastStore();

const codelabsList = ref<CodelabDetail[]>([]);
const loading = ref(false);
const loadError = ref('');
const searchQuery = ref('');
const filterDifficulty = ref('');
const filterLanguage = ref('');
const expandedCodelabId = ref<string | null>(null);
const loadingCodelabDetails = ref<Record<string, boolean>>({});

const showCodelabEditor = ref(false);
const editingCodelab = ref<CodelabDetail | null>(null);

// CodelabItemModal (thay TestCaseModal/TemplateModal/HintModal stub)
const showItemModal = ref(false);
const itemModalType = ref<'testcase' | 'template' | 'hint'>('testcase');
const editingItem = ref<any | null>(null);
const editingItemCodelabId = ref('');

const showConfirmDelete = ref(false);
const confirmDeleteTitle = ref('');
const confirmDeleteMessage = ref('');
const deleteAction = ref<(() => Promise<void>) | null>(null);

async function loadCodelabs() {
  loading.value = true;
  loadError.value = '';
  try {
    const params = new URLSearchParams();
    if (searchQuery.value) params.append('search', searchQuery.value);
    if (filterDifficulty.value) params.append('difficulty', filterDifficulty.value);
    if (filterLanguage.value) params.append('language', filterLanguage.value);

    const res = await teacherRequest(`${BASE_URL}/api/v1/codelabs?${params}`);
    if (!res.ok) throw new Error('Không thể tải danh sách Codelab.');
    codelabsList.value = await res.json();
  } catch (err) {
    loadError.value = err instanceof Error ? err.message : 'Lỗi khi tải Codelab.';
  }
  finally { loading.value = false; }
}

async function loadCodelabDetails(codelabId: string) {
  loadingCodelabDetails.value[codelabId] = true;
  try {
    const res = await teacherRequest(`${BASE_URL}/api/v1/codelabs/${codelabId}`);
    if (!res.ok) throw new Error('Không thể tải chi tiết Codelab.');
    const codelab = await res.json();
    const idx = codelabsList.value.findIndex((c) => c.id === codelabId);
    if (idx >= 0) {
      codelabsList.value[idx] = { ...codelabsList.value[idx], ...codelab };
    }
  } catch (err) {
    toastStore.handleApiError(err, 'Lỗi khi tải chi tiết.');
  }
  finally { loadingCodelabDetails.value[codelabId] = false; }
}

function toggleCodelabAccordion(codelabId: string) {
  if (expandedCodelabId.value === codelabId) {
    expandedCodelabId.value = null;
  } else {
    expandedCodelabId.value = codelabId;
    loadCodelabDetails(codelabId);
  }
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null;
function debouncedSearch() {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => loadCodelabs(), 400);
}

function createNewCodelab() {
  showCodelabEditor.value = true;
  editingCodelab.value = null;
}

function editCodelab(c: CodelabDetail) {
  editingCodelab.value = c;
  showCodelabEditor.value = true;
}

// ─── Testcase ───────────────────────────────────────────────────────────
function openItemModal(type: 'testcase' | 'template' | 'hint', codelabId: string, item: any | null) {
  itemModalType.value = type;
  editingItem.value = item;
  editingItemCodelabId.value = codelabId;
  showItemModal.value = true;
}
function addTestCase(c: CodelabDetail) { openItemModal('testcase', c.id, null); }
function editTestCase(c: CodelabDetail, tc: any) { openItemModal('testcase', c.id, tc); }
function addTemplate(c: CodelabDetail) { openItemModal('template', c.id, null); }
function editTemplate(c: CodelabDetail, tmpl: any) { openItemModal('template', c.id, tmpl); }
function addHint(c: CodelabDetail) { openItemModal('hint', c.id, null); }
function editHint(c: CodelabDetail, hint: any) { openItemModal('hint', c.id, hint); }

// TC-002/TC-003: lưu testcase/template/hint qua endpoint thật.
async function saveItem(itemData: any) {
  if (!editingItemCodelabId.value) return;
  const codelabId = editingItemCodelabId.value;
  const type = itemModalType.value;
  try {
    let url = `${BASE_URL}/api/v1/codelabs/${codelabId}/${type === 'testcase' ? 'testcases' : type === 'template' ? 'templates' : 'hints'}`;
    let method = 'POST';
    if (editingItem.value?.id) {
      url += `/${editingItem.value.id}`;
      method = 'PUT';
    }
    const body: Record<string, unknown> = { ...itemData };
    if (type === 'testcase') {
      body.scoreWeight = itemData.scoreWeight ?? 1;
      body.orderIndex = itemData.orderIndex ?? 1;
    } else if (type === 'template') {
      // API template không nhận solutionCode — chỉ gửi language + starterCode.
      delete body.solutionCode;
    } else if (type === 'hint') {
      body.orderIndex = itemData.orderIndex ?? 1;
    }
    const res = await teacherRequest(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || 'Lưu thất bại.');
    }
    toastStore.success(method === 'POST' ? 'Thêm thành công!' : 'Cập nhật thành công!');
    showItemModal.value = false;
    editingItem.value = null;
    await loadCodelabDetails(codelabId);
  } catch (err) {
    toastStore.handleApiError(err, 'Lỗi khi lưu.');
  }
}

async function deleteTestCase(codelabId: string, testCaseId: string) {
  await deleteChildItem(codelabId, testCaseId, 'testcases', 'Testcase');
}
async function deleteTemplate(codelabId: string, templateId: string) {
  await deleteChildItem(codelabId, templateId, 'templates', 'Template');
}
async function deleteHint(codelabId: string, hintId: string) {
  await deleteChildItem(codelabId, hintId, 'hints', 'Hint');
}

async function deleteChildItem(codelabId: string, itemId: string, resource: 'testcases' | 'templates' | 'hints', label: string) {
  if (!confirm(`Bạn có chắc chắn muốn xóa ${label} này?`)) return;
  try {
    const res = await teacherRequest(`${BASE_URL}/api/v1/codelabs/${codelabId}/${resource}/${itemId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Xóa ${label} thất bại.`);
    toastStore.success(`Đã xóa ${label}.`);
    await loadCodelabDetails(codelabId);
  } catch (err) {
    toastStore.handleApiError(err, `Lỗi khi xóa ${label}.`);
  }
}

// TC-002: lưu Codelab (tạo/sửa) qua endpoint thật.
async function saveCodelab(codelabData: any) {
  const isEdit = Boolean(editingCodelab.value?.id);
  try {
    const payload = {
      title: codelabData.title,
      description: codelabData.description,
      initialCode: codelabData.initialCode,
      difficulty: codelabData.difficulty,
      xpReward: codelabData.xpReward,
      maxRuntimeMs: codelabData.maxRuntimeMs,
      maxMemoryBytes: codelabData.maxMemoryBytes,
      allowedLanguages: codelabData.allowedLanguages,
      constraints: codelabData.constraints,
      examples: codelabData.examples,
      tags: codelabData.tags ?? '',
      hints: (codelabData.hints || []).map((h: any, i: number) => ({
        content: h.content,
        isTiered: h.isTiered,
        xpCost: h.xpCost ?? 0,
        orderIndex: i + 1
      }))
    };
    const url = isEdit ? `${BASE_URL}/api/v1/codelabs/${editingCodelab.value!.id}` : `${BASE_URL}/api/v1/codelabs`;
    const res = await teacherRequest(url, { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || (isEdit ? 'Cập nhật Codelab thất bại.' : 'Tạo Codelab thất bại.'));
    }
    toastStore.success(isEdit ? 'Cập nhật Codelab thành công!' : 'Tạo Codelab thành công!');
    showCodelabEditor.value = false;
    editingCodelab.value = null;
    await loadCodelabs();
  } catch (err) {
    toastStore.handleApiError(err, 'Lỗi khi lưu Codelab.');
  }
}

function deleteCodelab(codelabId: string) {
  confirmDeleteTitle.value = 'Xóa Codelab';
  confirmDeleteMessage.value = 'Bạn có chắc chắn muốn xóa Codelab này? Hành động này không thể hoàn tác.';
  deleteAction.value = async () => {
    const res = await teacherRequest(`${BASE_URL}/api/v1/codelabs/${codelabId}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || 'Xóa Codelab thất bại.');
    }
    toastStore.success('Đã xóa Codelab.');
    codelabsList.value = codelabsList.value.filter((c) => c.id !== codelabId);
    if (expandedCodelabId.value === codelabId) expandedCodelabId.value = null;
  };
  showConfirmDelete.value = true;
}

async function executeDelete() {
  if (!deleteAction.value) return;
  try {
    await deleteAction.value();
    showConfirmDelete.value = false;
    deleteAction.value = null;
  } catch (err) {
    toastStore.handleApiError(err, 'Lỗi khi xóa Codelab.');
  }
}

watch([filterDifficulty, filterLanguage], () => loadCodelabs());

onMounted(() => loadCodelabs());
</script>

<style scoped>
@import "./CodelabBuilderTab.css";
</style>
