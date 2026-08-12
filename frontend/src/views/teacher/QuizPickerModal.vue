<template>
  <Transition name="modal-fade">
    <!-- TC-028: role=dialog + aria-modal + focus trap + Esc (useModalA11y) -->
    <div v-if="show" ref="overlayEl" class="modal-overlay" role="dialog" aria-modal="true" aria-label="Chọn quiz" @click.self="$emit('update:show', false)">
      <div class="modal-container modal-lg">
        <div class="modal-header">
          <h3 class="modal-title">
            <BaseIcon name="help-circle" class="w-5 h-5 inline mr-2" />
            Chọn Quiz
          </h3>
          <button type="button" class="modal-close" @click="$emit('update:show', false)">
            <BaseIcon name="x" class="w-5 h-5" />
          </button>
        </div>
        
        <div class="modal-body">
          
          <div class="picker-toolbar mb-4 flex flex-wrap gap-3">
            <div class="search-box flex-1 min-w-[200px]">
              <div class="relative">
                <BaseIcon name="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input 
                  v-model="searchQuery" 
                  type="text" 
                  class="form-input pl-10" 
                  placeholder="Tìm kiếm quiz..."
                  @input="debouncedSearch"
                />
              </div>
            </div>
            <div class="flex items-center gap-3 flex-wrap">
              <select v-model="filterTopic" class="form-select w-40" @change="loadQuizzes">
                <option value="">Tất cả chủ đề</option>
                <option v-for="t in topics" :key="t" :value="t">{{ t }}</option>
              </select>
              <select v-model="filterDifficulty" class="form-select w-24" @change="loadQuizzes">
                <option value="">Tất cả độ khó</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>
          </div>
          
          
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <span>Đang tải...</span>
          </div>
          
          <div v-else-if="quizzes.length === 0" class="empty-state text-center py-8">
            <BaseIcon name="help-circle" class="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p class="text-text-muted">Không tìm thấy quiz phù hợp</p>
          </div>
          
          <div v-else class="quizzes-table-container">
            <table class="w-full">
              <thead>
                <tr class="border-b border-border-subtle">
                  <th class="text-left p-3 text-xs font-semibold text-text-muted uppercase tracking-wider w-10"></th>
                  <th class="text-left p-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Quiz</th>
                  <th class="text-left p-3 text-xs font-semibold text-text-muted uppercase tracking-wider w-32">Chủ đề</th>
                  <th class="text-left p-3 text-xs font-semibold text-text-muted uppercase tracking-wider w-20">Độ khó</th>
                  <th class="text-left p-3 text-xs font-semibold text-text-muted uppercase tracking-wider w-20">Số câu</th>
                  <th class="text-left p-3 text-xs font-semibold text-text-muted uppercase tracking-wider w-10"></th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="q in quizzes" 
                  :key="q.id"
                  class="border-b border-border-subtle hover:bg-bg-hover transition-colors"
                  @click="selectQuiz(q)"
                >
                  <td class="p-3">
                    <input 
                      type="radio" 
                      class="form-radio accent-accent h-4 w-4" 
                      :checked="selectedQuizId === q.id"
                      @click.stop
                    >
                  </td>
                  <td class="p-3">
                      <div class="font-medium text-text-primary truncate max-w-xs">{{ q.title }}</div></td>
                    <td class="p-3">
                      <span class="badge" :class="topicBadgeClass(q.topic)">{{ q.topic }}</span>
                    </td>
                    <td class="p-3">
                      <span class="badge" :class="difficultyBadgeClass(q.difficulty)">{{ q.difficulty }}</span>
                    </td>
                    <td class="p-3 text-sm text-text-muted font-mono">{{ q.questionCount }} câu</td>
                    <td class="p-3">
                      <button 
                        type="button" 
                        class="btn-action-icon text-text-muted hover:text-accent"
                        @click.stop="previewQuiz(q)"
                        title="Xem trước"
                      >
                        <BaseIcon name="eye" class="w-4 h-4" />
                      </button>
                    </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          
          <!-- TC-029: icon mắt "Xem trước" — hiển thị preview chi tiết thật -->
          <div v-if="previewQuizData" class="quiz-preview-panel mt-4 p-4 rounded-xl border border-accent/30 bg-accent/10 animate-fade-in">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-sm font-bold text-text-primary">{{ previewQuizData.title }}</h4>
              <button type="button" class="btn-action-icon text-text-muted hover:text-accent" @click="previewQuizData = null" title="Đóng preview">
                <BaseIcon name="close" class="w-4 h-4" />
              </button>
            </div>
            <p class="text-xs text-text-muted mb-3">Chủ đề: {{ previewQuizData.topic }} · Độ khó: {{ previewQuizData.difficulty }}</p>
            <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
              <div v-for="(question, qi) in previewQuizData.questions" :key="qi" class="p-3 rounded-lg bg-bg-secondary border border-border-subtle">
                <p class="text-xs font-semibold text-text-primary mb-2">{{ Number(qi) + 1 }}. {{ question.text || question.question }}</p>
                <ul class="space-y-1">
                  <li v-for="(opt, oi) in question.options" :key="oi" class="text-xs text-text-secondary">
                    {{ String.fromCharCode(65 + Number(oi)) }}. {{ opt }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-4 pt-4 border-t border-border-subtle">
            <button class="btn-secondary px-3 text-xs" @click="changePage(page - 1)" :disabled="page <= 1">Trước</button>
            <span class="text-sm text-text-muted px-2">Trang {{ page }} / {{ totalPages }}</span>
            <button class="btn-secondary px-3 text-xs" @click="changePage(page + 1)" :disabled="page >= totalPages">Sau</button>
          </div>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn-secondary" @click="$emit('update:show', false)">
            Hủy
          </button>
          <button type="button" class="btn-primary" :disabled="!selectedQuizId" @click="confirmSelect">
            <BaseIcon name="check" class="w-4 h-4 inline mr-1" /> Chọn Quiz này
          </button>
        </div>
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
  (e: 'select', quizzes: any[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const loading = ref(false);
const searchQuery = ref('');
const filterTopic = ref('');
const filterDifficulty = ref('');
const page = ref(1);
const pageSize = 20;
const quizzes = ref<any[]>([]);
const totalCount = ref(0);
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize) || 1);
const topics = ref<string[]>([]);
const selectedQuizId = ref<string | null>(null);
// TC-029: preview chi tiết quiz (đọc detail thật).
const previewQuizData = ref<any | null>(null);

const { BASE_URL, teacherRequest } = useTeacherApi();

// TC-028: focus trap + Esc + khóa scroll + hoàn trả focus.
const { overlayEl } = useModalA11y(toRef(props, 'show'));

function topicBadgeClass(topic: string): string {
  const map: Record<string, string> = {
    'sorting': 'badge-emerald',
    'algorithm': 'badge-blue',
    'graph': 'badge-purple',
    'oop': 'badge-amber',
    'solid': 'badge-rose',
    'patterns': 'badge-indigo',
    'systemdesign': 'badge-slate'
  };
  return map[topic] || 'badge-slate';
}

function difficultyBadgeClass(diff: number | string): string {
  const d = Number(diff);
  if (d <= 2) return 'badge-emerald';
  if (d === 3) return 'badge-amber';
  return 'badge-rose';
}

async function loadQuizzes() {
  loading.value = true;
  try {
    // TC-001: dùng endpoint /concepts/quiz/all (không còn /api/v1/quizzes CRUD cũ).
    const res = await teacherRequest(`${BASE_URL}/api/v1/concepts/quiz/all`);
    if (res.ok) {
      const data = await res.json();
      const all = data.quizzes || data;
      quizzes.value = all.filter((q: any) => {
        const matchesSearch = !searchQuery.value || q.title.toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchesTopic = !filterTopic.value || q.topic === filterTopic.value;
        const matchesDifficulty = !filterDifficulty.value || String(q.difficulty) === filterDifficulty.value || (Number(q.difficulty) <= 2 ? 'easy' : Number(q.difficulty) >= 4 ? 'hard' : 'medium') === filterDifficulty.value;
        return matchesSearch && matchesTopic && matchesDifficulty;
      });
      totalCount.value = all.length;
    }
  } catch (err) {
    console.error('Failed to load quizzes:', err);
  } finally {
    loading.value = false;
  }
}

async function loadTopics() {
  try {
    const res = await teacherRequest(`${BASE_URL}/api/v1/concepts/quiz/all`);
    if (res.ok) {
      const data = await res.json();
      const ts = [...new Set((data.quizzes || data).map((q: any) => q.topic).filter(Boolean))] as string[];
      topics.value = ts.sort();
    }
  } catch (err) {
    console.error('Failed to load topics:', err);
  }
}

function changePage(newPage: number) {
  if (newPage < 1 || newPage > totalPages.value) return;
  page.value = newPage;
  loadQuizzes();
}

function selectQuiz(quiz: any) {
  selectedQuizId.value = quiz.id;
}

// TC-029: xem trước chi tiết quiz — đọc detail thật (không console.log).
async function previewQuiz(quiz: any) {
  try {
    const res = await teacherRequest(`${BASE_URL}/api/v1/concepts/quiz/${quiz.id}`);
    if (res.ok) {
      previewQuizData.value = await res.json();
    }
  } catch (err) {
    console.error('Failed to preview quiz:', err);
  }
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null;
function debouncedSearch() {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    loadQuizzes();
  }, 300);
}

function confirmSelect() {
  const selected = quizzes.value.find(q => q.id === selectedQuizId.value);
  if (selected) {
    emit('select', [selected]);
    emit('update:show', false);
  }
}

watch(() => props.show, (newShow) => {
  if (newShow) {
    page.value = 1;
    selectedQuizId.value = null;
    loadQuizzes();
    
    if (topics.value.length === 0) loadTopics();
  }
});

watch([filterTopic, filterDifficulty], () => {
  page.value = 1;
  loadQuizzes();
});
</script>

<style scoped>
@import "./QuizPickerModal.css";
</style>