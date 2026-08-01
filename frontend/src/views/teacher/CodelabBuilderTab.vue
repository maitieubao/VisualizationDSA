<template>
  <section class="codelab-builder-section">
    <div class="flex justify-between items-center mb-6 flex-wrap gap-3">
      <div>
        <h2 class="section-heading m-0">Quáº£n lÃ½ Codelab (Thá»±c hÃ nh Code)</h2>
        <p class="text-slate-400 text-sm mt-1">Táº¡o bÃ i táº­p láº­p trÃ¬nh vá»›i testcases, starter code Ä‘a ngÃ´n ngá»¯, hints tiered</p>
      </div>
      <button type="button" class="btn-primary" @click="createNewCodelab">
        <BaseIcon name="plus" class="w-4 h-4 inline mr-1 align-middle" /> Táº¡o Codelab má»›i
      </button>
    </div>

    
    <div class="filters-bar mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
      <div class="relative w-full sm:w-64">
        <input v-model="searchQuery" @input="debouncedSearch" type="text" placeholder="TÃ¬m kiáº¿m codelab..." class="appearance-none w-full bg-slate-900/80 text-white border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all" />
        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
      </div>
      <div class="flex gap-2 w-full sm:w-auto">
        <select v-model="filterDifficulty" class="appearance-none bg-slate-900/80 text-white border border-white/10 rounded-full pl-4 pr-10 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all cursor-pointer">
          <option value="">Táº¥t cáº£ Ä‘á»™ khÃ³</option>
          <option value="1">Dá»… (1)</option>
          <option value="2">Dá»… (2)</option>
          <option value="3">Trung bÃ¬nh (3)</option>
          <option value="4">KhÃ³ (4)</option>
          <option value="5">Ráº¥t khÃ³ (5)</option>
        </select>
        <select v-model="filterLanguage" class="appearance-none bg-slate-900/80 text-white border border-white/10 rounded-full pl-4 pr-10 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all cursor-pointer">
          <option value="">Táº¥t cáº£ ngÃ´n ngá»¯</option>
          <option value="csharp">C#</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="javascript">JavaScript</option>
          <option value="cpp">C++</option>
          <option value="go">Go</option>
        </select>
      </div>
    </div>

    
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <span>Äang táº£i danh sÃ¡ch Codelab...</span>
    </div>

    <div v-else-if="codelabsList.length === 0" class="empty-state">
      <div class="text-5xl mb-4">ðŸ’»</div>
      <h3 class="text-xl font-bold text-white">ChÆ°a cÃ³ Codelab nÃ o</h3>
      <p class="text-slate-400 mt-2 max-w-md">Táº¡o Codelab Ä‘áº§u tiÃªn Ä‘á»ƒ báº¯t Ä‘áº§u xÃ¢y dá»±ng bÃ i táº­p thá»±c hÃ nh</p>
      <button class="btn-primary mt-6" @click="createNewCodelab">
        <BaseIcon name="plus" class="w-4 h-4 inline mr-1" /> Táº¡o Codelab Ä‘áº§u tiÃªn
      </button>
    </div>

    <div v-else class="codelabs-table-container">
      <table class="codelabs-table">
        <thead>
          <tr>
            <th>Codelab</th>
            <th>Äá»™ khÃ³</th>
            <th>NgÃ´n ngá»¯</th>
            <th>Testcases</th>
            <th>XP</th>
            <th class="text-center">Thao tÃ¡c</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="c in codelabsList" :key="c.id">
            <tr @click="toggleCodelabAccordion(c.id)" class="cursor-pointer hover:bg-white/5 transition-colors">
              <td class="font-bold text-white">
                <span class="inline-block mr-1 transition-transform duration-200" :style="expandedCodelabId === c.id ? 'transform: rotate(90deg)' : ''">â–¶</span>
                {{ c.title }}
              </td>
              <td><span class="diff-badge" :class="'diff-' + c.difficulty">{{ c.difficulty }}</span></td>
              <td class="text-xs text-slate-400 font-mono">{{ c.allowedLanguages }}</td>
              <td class="font-mono text-slate-300">{{ c.testCaseCount }} tests</td>
              <td class="font-bold text-amber-400">+{{ c.xpReward }} XP</td>
              <td>
                <div class="flex justify-center gap-2" @click.stop>
                  <button type="button" class="btn-action btn-action--edit" @click="editCodelab(c)" title="Chá»‰nh sá»­a">
                    <BaseIcon name="edit" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> Sá»­a
                  </button>
                  <button type="button" class="btn-action btn-action--delete" @click="deleteCodelab(c.id)" title="XÃ³a">
                    <BaseIcon name="trash" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> XÃ³a
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="expandedCodelabId === c.id" class="accordion-row">
              <td colspan="6" class="accordion-cell">
                <div v-if="loadingCodelabDetails[c.id]" class="loading-detail py-4">
                  <div class="spinner spinner--sm"></div>
                  <span>Äang táº£i chi tiáº¿t...</span>
                </div>
                <div v-else class="codelab-detail-panel animate-fade-in">
                  <div class="flex justify-between items-center mb-4">
                    <h4 class="detail-title text-indigo-400 font-bold m-0"><BaseIcon name="code" class="w-4 h-4 text-indigo-400 inline mr-1 align-text-bottom" /> Chi tiáº¿t: {{ c.title }}</h4>
                    <div class="flex gap-2">
                      <button type="button" class="btn-add-inline" @click="addTestCase(c)">
                        <BaseIcon name="plus" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> Testcase
                      </button>
                      <button type="button" class="btn-add-inline" @click="addTemplate(c)">
                        <BaseIcon name="file-text" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> Template
                      </button>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    <div class="space-y-3">
                      <h5 class="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">Testcases ({{ c.testcases?.length || 0 }})</h5>
                      <div v-if="!c.testcases?.length" class="empty-state py-4 text-center text-sm">ChÆ°a cÃ³ testcase nÃ o</div>
                      <div v-else class="space-y-2">
                        <div v-for="tc in c.testcases" :key="tc.id" class="testcase-card p-3 rounded-lg border border-white/5 bg-slate-950/20 flex items-center justify-between">
                          <div class="flex items-center gap-3">
                            <span class="badge" :class="tc.isHidden ? 'badge-rose' : 'badge-emerald'">{{ tc.isHidden ? 'áº¨n' : 'CÃ´ng khai' }}</span>
                            <span class="text-xs text-slate-400 font-mono">Input: {{ tc.input }}</span>
                            <span class="text-xs text-slate-400 font-mono">Expected: {{ tc.expectedOutput }}</span>
                          </div>
                          <div class="flex gap-2">
                            <button type="button" class="btn-action btn-action--edit text-xs" @click="editTestCase(c, tc)">Sá»­a</button>
                            <button type="button" class="btn-action btn-action--delete text-xs" @click="deleteTestCase(c.id, tc.id)">XÃ³a</button>
                          </div>
                        </div>
                      </div>
                      <button type="button" class="btn-add-inline w-full" @click="addTestCase(c)">
                        <BaseIcon name="plus" class="w-3.5 h-3.5 inline mr-1" /> ThÃªm Testcase
                      </button>
                    </div>
                    
                    
                    <div class="space-y-3">
                      <h5 class="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">Starter Templates ({{ c.templates?.length || 0 }})</h5>
                      <div v-if="!c.templates?.length" class="empty-state py-4 text-center text-sm">ChÆ°a cÃ³ template nÃ o</div>
                      <div v-else class="space-y-2">
                        <div v-for="tmpl in c.templates" :key="tmpl.id" class="template-card p-3 rounded-lg border border-white/5 bg-slate-950/20 flex items-center justify-between">
                          <div class="flex items-center gap-3">
                            <span class="badge badge-emerald text-xs">{{ tmpl.language }}</span>
                            <span class="text-xs text-slate-400">Starter code: {{ tmpl.starterCode?.length || 0 }} kÃ½ tá»±</span>
                          </div>
                          <div class="flex gap-2">
                            <button type="button" class="btn-action btn-action--edit text-xs" @click="editTemplate(c, tmpl)">Sá»­a</button>
                            <button type="button" class="btn-action btn-action--delete text-xs" @click="deleteTemplate(c.id, tmpl.id)">XÃ³a</button>
                          </div>
                        </div>
                      </div>
                      <button type="button" class="btn-add-inline w-full" @click="addTemplate(c)">
                        <BaseIcon name="plus" class="w-3.5 h-3.5 inline mr-1" /> ThÃªm Template
                      </button>
                    </div>
                  </div>
                  
                  
                  <div class="mt-6">
                    <h5 class="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">Hints ({{ c.hints?.length || 0 }})</h5>
                    <div v-if="!c.hints?.length" class="empty-state py-4 text-center text-sm">ChÆ°a cÃ³ hint nÃ o</div>
                    <div v-else class="space-y-2">
                      <div v-for="hint in c.hints" :key="hint.id" class="hint-card p-3 rounded-lg border border-white/5 bg-slate-950/20 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                          <span class="badge badge-purple text-xs">Hint #{{ hint.orderIndex }}</span>
                          <span class="badge" :class="hint.isTiered ? 'badge-amber' : 'badge-slate'">{{ hint.isTiered ? 'Tiered (XP cost)' : 'ThÆ°á»ng' }}</span>
                          <span class="text-xs text-slate-400 line-clamp-1 max-w-xs">{{ hint.content }}</span>
                        </div>
                        <div class="flex gap-2">
                          <button type="button" class="btn-action btn-action--edit text-xs" @click="editHint(c, hint)">Sá»­a</button>
                          <button type="button" class="btn-action btn-action--delete text-xs" @click="deleteHint(c.id, hint.id)">XÃ³a</button>
                        </div>
                      </div>
                    </div>
                    <button type="button" class="btn-add-inline w-full" @click="addHint(c)">
                      <BaseIcon name="plus" class="w-3.5 h-3.5 inline mr-1" /> ThÃªm Hint
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    
    <CodelabEditorModal
      v-model:show="showCodelabEditor"
      :editing-codelab="editingCodelab"
      @save="saveCodelab"
    />

    
    <TestCaseModal
      v-model:show="showTestCaseModal"
      :editing-testcase="editingTestCase"
      :parent-codelab="editingCodelabForTestCase"
      @save="saveTestCase"
    />

    
    <TemplateModal
      v-model:show="showTemplateModal"
      :editing-template="editingTemplate"
      :parent-codelab="editingCodelabForTemplate"
      @save="saveTemplate"
    />

    
    <HintModal
      v-model:show="showHintModal"
      :editing-hint="editingHint"
      :parent-codelab="editingCodelabForHint"
      @save="saveHint"
    />

    
    <ConfirmModal
      v-model:show="showConfirmDelete"
      :title="confirmDeleteTitle"
      :message="confirmDeleteMessage"
      :confirm-text="'XÃ³a'"
      :variant="'danger'"
      @confirm="executeDelete"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useTeacherApi } from './useTeacherApi';
import CodelabEditorModal from './CodelabEditorModal.vue';
import TestCaseModal from './TestCaseModal.vue';
import TemplateModal from './TemplateModal.vue';
import HintModal from './HintModal.vue';
import ConfirmModal from '@/components/ui/ConfirmModal.vue';
import BaseIcon from '@/shared/components/BaseIcon.vue';

const { BASE_URL, getAuthHeaders } = useTeacherApi();

const codelabsList = ref<any[]>([]);
const loading = ref(false);
const searchQuery = ref('');
const filterDifficulty = ref('');
const filterLanguage = ref('');
const expandedCodelabId = ref<string | null>(null);
const loadingCodelabDetails = ref<Record<string, boolean>>({});

const showCodelabEditor = ref(false);
const editingCodelab = ref<any | null>(null);
const showTestCaseModal = ref(false);
const editingTestCase = ref<any | null>(null);
const editingCodelabForTestCase = ref<any | null>(null);
const showTemplateModal = ref(false);
const editingTemplate = ref<any | null>(null);
const editingCodelabForTemplate = ref<any | null>(null);
const showHintModal = ref(false);
const editingHint = ref<any | null>(null);
const editingCodelabForHint = ref<any | null>(null);

const showConfirmDelete = ref(false);
const confirmDeleteTitle = ref('');
const confirmDeleteMessage = ref('');
const deleteAction = ref<() => Promise<void>>();

async function loadCodelabs() {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    if (searchQuery.value) params.append('search', searchQuery.value);
    if (filterDifficulty.value) params.append('difficulty', filterDifficulty.value);
    if (filterLanguage.value) params.append('language', filterLanguage.value);
    
    const res = await fetch(`${BASE_URL}/api/v1/codelabs?${params}`, { headers: getAuthHeaders() });
    if (res.ok) codelabsList.value = await res.json();
  } catch (err) { console.error('Failed to load codelabs:', err); }
  finally { loading.value = false; }
}

async function loadCodelabDetails(codelabId: string) {
  loadingCodelabDetails.value[codelabId] = true;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/codelabs/${codelabId}`, { headers: getAuthHeaders() });
    if (res.ok) {
      const codelab = await res.json();
      const idx = codelabsList.value.findIndex(c => c.id === codelabId);
      if (idx >= 0) {
        codelabsList.value[idx] = { ...codelabsList.value[idx], ...codelab };
      }
    }
  } catch (err) { console.error(err); }
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

function editCodelab(c: any) {
  editingCodelab.value = c;
  showCodelabEditor.value = true;
}

function addTestCase(c: any) {
  editingTestCase.value = null;
  editingCodelabForTestCase.value = c;
  showTestCaseModal.value = true;
}

function editTestCase(c: any, tc: any) {
  editingTestCase.value = tc;
  editingCodelabForTestCase.value = c;
  showTestCaseModal.value = true;
}



















function crudNotImplemented(action: string, endpoint: string): void {
  const msg =
    `ðŸš§ Chá»©c nÄƒng "${action}" Ä‘ang Ä‘Æ°á»£c phÃ¡t triá»ƒn.\n\n` +
    `Backend endpoint chÆ°a Ä‘Æ°á»£c implement:\n${endpoint}\n\n` +
    `Vui lÃ²ng liÃªn há»‡ team backend Ä‘á»ƒ hoÃ n táº¥t command/query tÆ°Æ¡ng á»©ng.`;
  console.warn(`[CodelabBuilderTab] ${action} â†’ ${endpoint}`);
  alert(msg);
}

function deleteTestCase(codelabId: string, testCaseId: string) {
  crudNotImplemented(
    'XÃ³a Testcase',
    `DELETE /api/v1/codelabs/${codelabId}/testcases/${testCaseId}`,
  );
  
  
  
  
  
  
}

function addTemplate(c: any) {
  editingTemplate.value = null;
  editingCodelabForTemplate.value = c;
  showTemplateModal.value = true;
}

function editTemplate(c: any, tmpl: any) {
  editingTemplate.value = tmpl;
  editingCodelabForTemplate.value = c;
  showTemplateModal.value = true;
}

function deleteTemplate(codelabId: string, templateId: string) {
  crudNotImplemented(
    'XÃ³a Starter Template',
    `DELETE /api/v1/codelabs/${codelabId}/templates/${templateId}`,
  );
  
  
  
  
  
  
}

function addHint(c: any) {
  editingHint.value = null;
  editingCodelabForHint.value = c;
  showHintModal.value = true;
}

function editHint(c: any, hint: any) {
  editingHint.value = hint;
  editingCodelabForHint.value = c;
  showHintModal.value = true;
}

function deleteHint(codelabId: string, hintId: string) {
  crudNotImplemented(
    'XÃ³a Hint',
    `DELETE /api/v1/codelabs/${codelabId}/hints/${hintId}`,
  );
  
  
  
  
  
  
}

async function saveCodelab(codelabData: any) {
  
  
  crudNotImplemented(
    'LÆ°u Codelab',
    codelabData?.id
      ? `PUT  /api/v1/codelabs/${codelabData.id}`
      : `POST /api/v1/codelabs`,
  );
  
  
  
  
  
  
  
  
  
  
  
  
}

async function saveTestCase(testCaseData: any) {
  
  
  crudNotImplemented(
    'LÆ°u Testcase',
    testCaseData?.id
      ? `PUT  /api/v1/codelabs/${editingCodelabForTestCase.value?.id}/testcases/${testCaseData.id}`
      : `POST /api/v1/codelabs/${editingCodelabForTestCase.value?.id}/testcases`,
  );
  
  
  
  
  
  
  
  
  
  
  
  
}

async function saveTemplate(templateData: any) {
  
  crudNotImplemented(
    'LÆ°u Starter Template',
    templateData?.id
      ? `PUT  /api/v1/codelabs/${editingCodelabForTemplate.value?.id}/templates/${templateData.id}`
      : `POST /api/v1/codelabs/${editingCodelabForTemplate.value?.id}/templates`,
  );
  
  
  
  
  
  
  
  
  
  
  
  
}

async function saveHint(hintData: any) {
  
  crudNotImplemented(
    'LÆ°u Hint',
    hintData?.id
      ? `PUT  /api/v1/codelabs/${editingCodelabForHint.value?.id}/hints/${hintData.id}`
      : `POST /api/v1/codelabs/${editingCodelabForHint.value?.id}/hints`,
  );
  
  
  
  
  
  
  
  
  
  
  
  
}

function deleteCodelab(codelabId: string) {
  
  
  confirmDeleteTitle.value = 'XÃ³a Codelab';
  confirmDeleteMessage.value = 'Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a Codelab nÃ y? HÃ nh Ä‘á»™ng nÃ y khÃ´ng thá»ƒ hoÃ n tÃ¡c.';
  deleteAction.value = async () => {
    crudNotImplemented('XÃ³a Codelab', `DELETE /api/v1/codelabs/${codelabId}`);
    
    
    
    
    
    
  };
  showConfirmDelete.value = true;
}

function executeDelete() {
  if (deleteAction.value) deleteAction.value();
  showConfirmDelete.value = false;
  deleteAction.value = undefined;
}

watch([filterDifficulty, filterLanguage], () => loadCodelabs());

onMounted(() => loadCodelabs());
</script>

<style scoped>
@import "./CodelabBuilderTab.css";
</style>