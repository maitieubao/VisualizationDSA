<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="$emit('update:show', false)">
      <div class="modal-container modal-lg">
        <div class="modal-header">
          <h3 class="modal-title">
            <BaseIcon name="help-circle" class="w-5 h-5 inline mr-2" />
            Chá»n Quiz
          </h3>
          <button type="button" class="modal-close" @click="$emit('update:show', false)">
            <BaseIcon name="x" class="w-5 h-5" />
          </button>
        </div>
        
        <div class="modal-body">
          
          <div class="picker-toolbar mb-4 flex flex-wrap gap-3">
            <div class="search-box flex-1 min-w-[200px]">
              <div class="relative">
                <BaseIcon name="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  v-model="searchQuery" 
                  type="text" 
                  class="form-input pl-10" 
                  placeholder="TÃ¬m kiáº¿m quiz..."
                  @input="debouncedSearch"
                />
              </div>
            </div>
            <div class="flex items-center gap-3 flex-wrap">
              <select v-model="filterTopic" class="form-select w-40" @change="loadQuizzes">
                <option value="">Táº¥t cáº£ chá»§ Ä‘á»</option>
                <option v-for="t in topics" :key="t" :value="t">{{ t }}</option>
              </select>
              <select v-model="filterDifficulty" class="form-select w-24" @change="loadQuizzes">
                <option value="">Táº¥t cáº£ Ä‘á»™ khÃ³</option>
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
            <span>Äang táº£i...</span>
          </div>
          
          <div v-else-if="quizzes.length === 0" class="empty-state text-center py-8">
            <BaseIcon name="help-circle" class="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <p class="text-slate-400">KhÃ´ng tÃ¬m tháº¥y quiz phÃ¹ há»£p</p>
          </div>
          
          <div v-else class="quizzes-table-container">
            <table class="w-full">
              <thead>
                <tr class="border-b border-white/10">
                  <th class="text-left p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-10"></th>
                  <th class="text-left p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Quiz</th>
                  <th class="text-left p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-32">Chá»§ Ä‘á»</th>
                  <th class="text-left p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-20">Äá»™ khÃ³</th>
                  <th class="text-left p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-20">Sá»‘ cÃ¢u</th>
                  <th class="text-left p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-10"></th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="q in quizzes" 
                  :key="q.id"
                  class="border-b border-white/5 hover:bg-white/5 transition-colors"
                  @click="selectQuiz(q)"
                >
                  <td class="p-3">
                    <input 
                      type="radio" 
                      class="form-radio accent-indigo-500 h-4 w-4" 
                      :checked="selectedQuizId === q.id"
                      @click.stop
                    >
                  </td>
                  <td class="p-3">
                      <div class="font-medium text-white truncate max-w-xs">{{ q.title }}</div></td>
                    <td class="p-3">
                      <span class="badge" :class="topicBadgeClass(q.topic)">{{ q.topic }}</span>
                    </td>
                    <td class="p-3">
                      <span class="badge" :class="difficultyBadgeClass(q.difficulty)">{{ q.difficulty }}</span>
                    </td>
                    <td class="p-3 text-sm text-slate-400 font-mono">{{ q.questionCount }} cÃ¢u</td>
                    <td class="p-3">
                      <button 
                        type="button" 
                        class="btn-action-icon text-slate-400 hover:text-indigo-400"
                        @click.stop="previewQuiz(q)"
                        title="Xem trÆ°á»›c"
                      >
                        <BaseIcon name="eye" class="w-4 h-4" />
                      </button>
                    </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          
          <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-4 pt-4 border-t border-white/10">
            <button class="btn-secondary px-3 text-xs" @click="changePage(page - 1)" :disabled="page <= 1">TrÆ°á»›c</button>
            <span class="text-sm text-slate-400 px-2">Trang {{ page }} / {{ totalPages }}</span>
            <button class="btn-secondary px-3 text-xs" @click="changePage(page + 1)" :disabled="page >= totalPages">Sau</button>
          </div>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn-secondary" @click="$emit('update:show', false)">
            Há»§y
          </button>
          <button type="button" class="btn-primary" :disabled="!selectedQuizId" @click="confirmSelect">
            <BaseIcon name="check" class="w-4 h-4 inline mr-1" /> Chá»n Quiz nÃ y
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import BaseIcon from '@/shared/components/BaseIcon.vue';

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

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

function getAuthHeaders() {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

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
    const params = new URLSearchParams({
      page: page.value.toString(),
      pageSize: pageSize.toString()
    });
    if (searchQuery.value) params.append('search', searchQuery.value);
    if (filterTopic.value) params.append('topic', filterTopic.value);
    if (filterDifficulty.value) params.append('difficulty', filterDifficulty.value);
    
    const res = await fetch(`${BASE_URL}/api/v1/quizzes?${params}`, { headers: getAuthHeaders() });
    if (res.ok) {
      const data = await res.json();
      quizzes.value = data.quizzes || data;
      totalCount.value = data.totalCount || data.length;
    }
  } catch (err) {
    console.error('Failed to load quizzes:', err);
  } finally {
    loading.value = false;
  }
}

async function loadTopics() {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/quizzes?pageSize=1000`, { headers: getAuthHeaders() });
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

function previewQuiz(quiz: any) {
  
  console.log('Preview quiz:', quiz);
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