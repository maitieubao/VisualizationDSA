<template>
  <section class="quiz-builder-section">
    <div class="flex justify-between items-center mb-6 flex-wrap gap-3">
      <div>
        <h2 class="section-heading m-0">Quáº£n lÃ½ Tráº¯c nghiá»‡m</h2>
        <p class="text-slate-400 text-sm mt-1">Táº¡o vÃ  quáº£n lÃ½ bá»™ cÃ¢u há»i tráº¯c nghiá»‡m cho bÃ i há»c</p>
      </div>
      <button type="button" class="btn-primary" @click="createNewQuiz">
        <BaseIcon name="plus" class="w-4 h-4 inline mr-1 align-middle" /> Táº¡o Quiz má»›i
      </button>
    </div>

    
    <div class="filters-bar mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
      <div class="relative w-full sm:w-64">
        <input v-model="searchQuery" @input="debouncedSearch" type="text" placeholder="TÃ¬m kiáº¿m quiz..." class="appearance-none w-full bg-slate-900/80 text-white border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all" />
        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
      </div>
      <div class="flex gap-2 w-full sm:w-auto">
        <select v-model="filterTopic" class="appearance-none bg-slate-900/80 text-white border border-white/10 rounded-full pl-4 pr-10 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all cursor-pointer">
          <option value="">Táº¥t cáº£ chá»§ Ä‘á»</option>
          <option v-for="t in topics" :key="t" :value="t">{{ t }}</option>
        </select>
        <select v-model="filterDifficulty" class="appearance-none bg-slate-900/80 text-white border border-white/10 rounded-full pl-4 pr-10 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all cursor-pointer">
          <option value="">Táº¥t cáº£ Ä‘á»™ khÃ³</option>
          <option value="1">Dá»… (1)</option>
          <option value="2">Dá»… (2)</option>
          <option value="3">Trung bÃ¬nh (3)</option>
          <option value="4">KhÃ³ (4)</option>
          <option value="5">Ráº¥t khÃ³ (5)</option>
        </select>
      </div>
    </div>

    
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <span>Äang táº£i danh sÃ¡ch Quiz...</span>
    </div>

    <div v-else-if="quizzesList.length === 0" class="empty-state">
      <div class="text-5xl mb-4">â“</div>
      <h3 class="text-xl font-bold text-white">ChÆ°a cÃ³ Quiz nÃ o</h3>
      <p class="text-slate-400 mt-2 max-w-md">Táº¡o Quiz Ä‘áº§u tiÃªn Ä‘á»ƒ báº¯t Ä‘áº§u xÃ¢y dá»±ng ngÃ¢n hÃ ng cÃ¢u há»i</p>
      <button class="btn-primary mt-6" @click="createNewQuiz">
        <BaseIcon name="plus" class="w-4 h-4 inline mr-1" /> Táº¡o Quiz Ä‘áº§u tiÃªn
      </button>
    </div>

    <div v-else class="quizzes-table-container">
      <table class="quizzes-table">
        <thead>
          <tr>
            <th>Quiz</th>
            <th>Chá»§ Ä‘á»</th>
            <th>Äá»™ khÃ³</th>
            <th>Sá»‘ cÃ¢u</th>
            <th>XP</th>
            <th class="text-center">Thao tÃ¡c</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="q in quizzesList" :key="q.id">
            <tr @click="toggleQuizAccordion(q.id)" class="cursor-pointer hover:bg-white/5 transition-colors">
              <td class="font-bold text-white">
                <span class="inline-block mr-1 transition-transform duration-200" :style="expandedQuizId === q.id ? 'transform: rotate(90deg)' : ''">â–¶</span>
                {{ q.title }}
              </td>
              <td><span class="topic-badge" :class="'topic-' + q.topic">{{ q.topic }}</span></td>
              <td><span class="diff-badge" :class="'diff-' + q.difficulty">{{ q.difficulty }}</span></td>
              <td class="font-mono text-slate-300">{{ q.questionCount }} cÃ¢u</td>
              <td class="font-bold text-amber-400">+{{ q.xpReward }} XP</td>
              <td>
                <div class="flex justify-center gap-2" @click.stop>
                  <button type="button" class="btn-action btn-action--edit" @click="editQuiz(q)" title="Chá»‰nh sá»­a">
                    <BaseIcon name="edit" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> Sá»­a
                  </button>
                  <button type="button" class="btn-action btn-action--delete" @click="confirmDeleteQuiz(q.id)" title="XÃ³a">
                    <BaseIcon name="trash" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> XÃ³a
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="expandedQuizId === q.id" class="accordion-row">
              <td colspan="6" class="accordion-cell">
                <div v-if="loadingQuizQuestions[q.id]" class="loading-detail py-4">
                  <div class="spinner spinner--sm"></div>
                  <span>Äang táº£i cÃ¢u há»i...</span>
                </div>
                <div v-else class="quiz-detail-panel animate-fade-in">
                  <div class="flex justify-between items-center mb-4">
                    <h4 class="detail-title text-indigo-400 font-bold m-0"><BaseIcon name="help-circle" class="w-4 h-4 text-indigo-400 inline mr-1 align-text-bottom" /> Chi tiáº¿t Quiz: {{ q.title }}</h4>
                    <button type="button" class="btn-add-inline" @click="addQuestionToQuiz(q.id, {})">
                      <BaseIcon name="plus" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> ThÃªm cÃ¢u há»i
                    </button>
                  </div>
                  <div v-if="!quizQuestions[q.id] || quizQuestions[q.id].length === 0" class="empty-state py-4 text-center">
                    Quiz nÃ y chÆ°a cÃ³ cÃ¢u há»i nÃ o. HÃ£y thÃªm cÃ¢u há»i Ä‘áº§u tiÃªn!
                  </div>
                  <div v-else class="space-y-3">
                    <div v-for="(question, qIdx) in quizQuestions[q.id]" :key="question.id" class="question-card p-4 rounded-xl border border-white/5 bg-slate-950/20">
                      <div class="flex items-start justify-between gap-4 mb-3">
                        <div class="flex items-center gap-3 flex-1 min-w-0">
                          <span class="w-6 h-6 rounded-full bg-indigo-500/30 border border-indigo-500/50 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">{{ qIdx + 1 }}</span>
                          <p class="font-semibold text-white truncate">{{ question.question }}</p>
                        </div>
                        <span class="badge badge-indigo text-xs shrink-0">CÃ¢u há»i</span>
                      </div>
                      <div class="grid grid-cols-2 gap-2.5 ml-9">
                        <button 
                          v-for="(opt, oIdx) in question.options" 
                          :key="oIdx"
                          class="px-3 py-2 rounded-lg border text-left text-xs font-semibold transition-all cursor-pointer"
                          :class="oIdx === question.correctIndex
                            ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                            : 'bg-slate-950/60 text-slate-300 border-white/10 hover:border-white/20 hover:bg-slate-800'"
                        >
                          {{ opt }}
                          <span v-if="oIdx === question.correctIndex" class="ml-2 text-sm">âœ“</span>
                        </button>
                      </div>
                      <div v-if="question.explanation" class="mt-3 p-3 rounded-lg bg-slate-900/50 border border-white/5">
                        <span class="text-xs text-indigo-400 font-bold">Giáº£i thÃ­ch:</span>
                        <span class="text-xs text-slate-300 ml-2">{{ question.explanation }}</span>
                      </div>
                      <div class="flex justify-end gap-2 mt-3 pt-3 border-t border-white/5">
                        <button type="button" class="btn-action btn-action--edit" @click="editQuestion(q.id, question)">Sá»­a</button>
                        <button type="button" class="btn-action btn-action--delete" @click="composableDeleteQuestion(q.id, question.id)">XÃ³a</button>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    
    <QuizFormModal
      v-model:show="showQuizForm"
      :editing-quiz="editingQuiz"
      :topics="topics"
      @save="saveQuiz"
    />

    
    <QuestionFormModal
      v-model:show="showQuestionForm"
      :editing-question="editingQuestion"
      :parent-quiz="editingQuizForQuestion"
      @save="saveQuestion"
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
import { useQuizBuilder } from './useQuizBuilder';
import QuizFormModal from './QuizFormModal.vue';
import QuestionFormModal from './QuestionFormModal.vue';
import ConfirmModal from '@/components/ui/ConfirmModal.vue';
import BaseIcon from '@/shared/components/BaseIcon.vue';

const {
  quizzesList,
  loading,
  quizQuestions,
  loadingQuizQuestions,
  expandedQuizId,
  topics,
  loadQuizzes,
  loadQuizQuestions,
  createQuiz,
  updateQuiz,
  deleteQuiz: composableDeleteQuiz,
  addQuestionToQuiz,
  deleteQuestion: composableDeleteQuestion
} = useQuizBuilder();

const searchQuery = ref('');
const filterTopic = ref('');
const filterDifficulty = ref('');

const showQuizForm = ref(false);
const editingQuiz = ref<any | null>(null);
const showQuestionForm = ref(false);
const editingQuestion = ref<any | null>(null);
const editingQuizForQuestion = ref<any | null>(null);

const showConfirmDelete = ref(false);
const confirmDeleteTitle = ref('');
const confirmDeleteMessage = ref('');
const deleteAction = ref<() => Promise<void>>();

const filteredQuizzes = computed(() => {
  return quizzesList.value.filter(q => {
    const matchesSearch = !searchQuery.value || q.title.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesTopic = !filterTopic.value || q.topic === filterTopic.value;
    const matchesDifficulty = !filterDifficulty.value || q.difficulty.toString() === filterDifficulty.value;
    return matchesSearch && matchesTopic && matchesDifficulty;
  });
});

function createNewQuiz() {
  editingQuiz.value = null;
  showQuizForm.value = true;
}

function debouncedSearch() {
  
}

async function loadData() {
  await loadQuizzes();
}

function toggleQuizAccordion(quizId: string) {
  if (expandedQuizId.value === quizId) {
    expandedQuizId.value = null;
  } else {
    expandedQuizId.value = quizId;
    loadQuizQuestions(quizId);
  }
}

function editQuiz(quiz: any) {
  editingQuiz.value = quiz;
  showQuizForm.value = true;
}

function editQuestion(quizId: string, question: any) {
  const quiz = quizzesList.value.find(q => q.id === quizId);
  if (quiz) {
    editingQuestion.value = question;
    editingQuizForQuestion.value = quiz;
    showQuestionForm.value = true;
  }
}

function confirmDeleteQuiz(quizId: string) {
  confirmDeleteTitle.value = 'XÃ³a Quiz';
  confirmDeleteMessage.value = 'Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a Quiz nÃ y? HÃ nh Ä‘á»™ng nÃ y khÃ´ng thá»ƒ hoÃ n tÃ¡c.';
  deleteAction.value = async () => {
    await composableDeleteQuiz(quizId);
  };
  showConfirmDelete.value = true;
}

async function saveQuiz(quizData: any) {
  if (editingQuiz.value) {
    await updateQuiz(editingQuiz.value.id, quizData);
  } else {
    await createQuiz(quizData);
  }
  showQuizForm.value = false;
  editingQuiz.value = null;
}

async function saveQuestion(questionData: any) {
  
}

async function executeDelete() {
  if (deleteAction.value) {
    await deleteAction.value();
    deleteAction.value = undefined;
    showConfirmDelete.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
@import "./QuizBuilderTab.css";
</style>