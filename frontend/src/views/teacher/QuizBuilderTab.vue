<template>
  <section class="quiz-builder-section">
    <div class="flex justify-between items-center mb-6 flex-wrap gap-3">
      <div>
        <h2 class="section-heading m-0">Quản lý Trắc nghiệm</h2>
        <p class="text-text-muted text-sm mt-1">Tạo và quản lý bộ câu hỏi trắc nghiệm cho bài học</p>
      </div>
      <button type="button" class="btn-primary" @click="createNewQuiz">
        <BaseIcon name="plus" class="w-4 h-4 inline mr-1 align-middle" /> Tạo Quiz mới
      </button>
    </div>

    
    <div class="filters-bar mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
      <div class="relative w-full sm:w-64">
        <input v-model="searchQuery" @input="debouncedSearch" type="text" placeholder="Tìm kiếm quiz..." class="appearance-none w-full bg-bg-secondary text-white border border-border-subtle rounded-full pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all" />
        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-text-muted">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
      </div>
      <div class="flex gap-2 w-full sm:w-auto">
        <select v-model="filterTopic" class="appearance-none bg-bg-secondary text-white border border-border-subtle rounded-full pl-4 pr-10 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all cursor-pointer">
          <option value="">Tất cả chủ đề</option>
          <option v-for="t in topics" :key="t" :value="t">{{ t }}</option>
        </select>
        <select v-model="filterDifficulty" class="appearance-none bg-bg-secondary text-white border border-border-subtle rounded-full pl-4 pr-10 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all cursor-pointer">
          <option value="">Tất cả độ khó</option>
          <option value="1">Dễ (1)</option>
          <option value="2">Dễ (2)</option>
          <option value="3">Trung bình (3)</option>
          <option value="4">Khó (4)</option>
          <option value="5">Rất khó (5)</option>
        </select>
      </div>
    </div>

    
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <span>Đang tải danh sách Quiz...</span>
    </div>

    <div v-else-if="quizzesList.length === 0" class="empty-state">
      <div class="text-5xl mb-4"><BaseIcon name="help-circle" class="w-12 h-12 text-text-muted mx-auto" /></div>
      <h3 class="text-xl font-bold text-white">Chưa có Quiz nào</h3>
      <p class="text-text-muted mt-2 max-w-md">Tạo Quiz đầu tiên để bắt đầu xây dựng ngân hàng câu hỏi</p>
      <button class="btn-primary mt-6" @click="createNewQuiz">
        <BaseIcon name="plus" class="w-4 h-4 inline mr-1" /> Tạo Quiz đầu tiên
      </button>
    </div>

    <div v-else class="quizzes-table-container">
      <table class="quizzes-table">
        <thead>
          <tr>
            <th>Quiz</th>
            <th>Chủ đề</th>
            <th>Độ khó</th>
            <th>Số câu</th>
            <th>XP</th>
            <th class="text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="q in quizzesList" :key="q.id">
            <tr @click="toggleQuizAccordion(q.id)" class="cursor-pointer hover:bg-bg-hover transition-colors">
              <td class="font-bold text-white">
                <span class="inline-block mr-1 transition-transform duration-200" :style="expandedQuizId === q.id ? 'transform: rotate(90deg)' : ''">▶</span>
                {{ q.title }}
              </td>
              <td><span class="topic-badge" :class="'topic-' + q.topic">{{ q.topic }}</span></td>
              <td><span class="diff-badge" :class="'diff-' + q.difficulty">{{ q.difficulty }}</span></td>
              <td class="font-mono text-text-secondary">{{ q.questionCount }} câu</td>
              <td class="font-bold text-accent-yellow">+{{ q.xpReward }} XP</td>
              <td>
                <div class="flex justify-center gap-2" @click.stop>
                  <button type="button" class="btn-action btn-action--edit" @click="editQuiz(q)" title="Chỉnh sửa">
                    <BaseIcon name="edit" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> Sửa
                  </button>
                  <button type="button" class="btn-action btn-action--delete" @click="confirmDeleteQuiz(q.id)" title="Xóa">
                    <BaseIcon name="trash" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> Xóa
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="expandedQuizId === q.id" class="accordion-row">
              <td colspan="6" class="accordion-cell">
                <div v-if="loadingQuizQuestions[q.id]" class="loading-detail py-4">
                  <div class="spinner spinner--sm"></div>
                  <span>Đang tải câu hỏi...</span>
                </div>
                <div v-else class="quiz-detail-panel animate-fade-in">
                  <div class="flex justify-between items-center mb-4">
                    <h4 class="detail-title text-accent font-bold m-0"><BaseIcon name="help-circle" class="w-4 h-4 text-accent inline mr-1 align-text-bottom" /> Chi tiết Quiz: {{ q.title }}</h4>
                    <button type="button" class="btn-add-inline" @click="addQuestionToQuiz(q.id, {})">
                      <BaseIcon name="plus" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> Thêm câu hỏi
                    </button>
                  </div>
                  <div v-if="!quizQuestions[q.id] || quizQuestions[q.id].length === 0" class="empty-state py-4 text-center">
                    Quiz này chưa có câu hỏi nào. Hãy thêm câu hỏi đầu tiên!
                  </div>
                  <div v-else class="space-y-3">
                    <div v-for="(question, qIdx) in quizQuestions[q.id]" :key="question.id" class="question-card p-4 rounded-xl border border-border-subtle bg-bg-secondary/20">
                      <div class="flex items-start justify-between gap-4 mb-3">
                        <div class="flex items-center gap-3 flex-1 min-w-0">
                          <span class="w-6 h-6 rounded-full bg-accent/30 border border-accent/50 text-accent font-bold text-xs flex items-center justify-center shrink-0">{{ qIdx + 1 }}</span>
                          <p class="font-semibold text-white truncate">{{ question.question }}</p>
                        </div>
                        <span class="badge badge-indigo text-xs shrink-0">Câu hỏi</span>
                      </div>
                      <div class="grid grid-cols-2 gap-2.5 ml-9">
                        <button 
                          v-for="(opt, oIdx) in question.options" 
                          :key="oIdx"
                          class="px-3 py-2 rounded-lg border text-left text-xs font-semibold transition-all cursor-pointer"
                          :class="oIdx === question.correctIndex
                            ? 'bg-accent text-white border-accent shadow-md'
                            : 'bg-bg-secondary text-text-secondary border-border-subtle hover:border-border-default hover:bg-bg-surface'"
                        >
                          {{ opt }}
                          <span v-if="oIdx === question.correctIndex" class="ml-2 text-sm"><BaseIcon name="check" class="w-3.5 h-3.5" /></span>
                        </button>
                      </div>
                      <div v-if="question.explanation" class="mt-3 p-3 rounded-lg bg-bg-secondary border border-border-subtle">
                        <span class="text-xs text-accent font-bold">Giải thích:</span>
                        <span class="text-xs text-text-secondary ml-2">{{ question.explanation }}</span>
                      </div>
                      <div class="flex justify-end gap-2 mt-3 pt-3 border-t border-border-subtle">
                        <button type="button" class="btn-action btn-action--edit" @click="editQuestion(q.id, question)">Sửa</button>
                        <button type="button" class="btn-action btn-action--delete" @click="composableDeleteQuestion(q.id, question.id)">Xóa</button>
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
      :confirm-text="'Xóa'"
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
  confirmDeleteTitle.value = 'Xóa Quiz';
  confirmDeleteMessage.value = 'Bạn có chắc chắn muốn xóa Quiz này? Hành động này không thể hoàn tác.';
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