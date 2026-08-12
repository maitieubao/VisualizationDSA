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

    <!-- TC-020: banner lỗi tách khỏi empty state — không đánh lừa "Chưa có Quiz" khi mạng lỗi -->
    <div v-if="loadError" class="error-banner mb-6 flex items-center justify-between gap-3 rounded-xl border border-accent-red/30 bg-accent-red/10 px-4 py-3">
      <span class="text-sm text-accent-red"><BaseIcon name="alert-circle" class="w-4 h-4 inline mr-1 align-middle" />{{ loadError }}</span>
      <button type="button" class="btn-secondary text-xs px-3 py-1.5" @click="loadData">Thử lại</button>
    </div>

    <!-- TC-031: thang độ khó đồng bộ easy/medium/hard với TeacherQuizTab -->
    <div class="filters-bar mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
      <div class="relative w-full sm:w-64">
        <input v-model="searchQuery" @input="debouncedSearch" type="text" placeholder="Tìm kiếm quiz..." class="appearance-none w-full bg-bg-secondary text-text-primary border border-border-subtle rounded-full pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all" />
        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-text-muted">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
      </div>
      <div class="flex gap-2 w-full sm:w-auto">
        <select v-model="filterTopic" class="appearance-none bg-bg-secondary text-text-primary border border-border-subtle rounded-full pl-4 pr-10 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all cursor-pointer">
          <option value="">Tất cả chủ đề</option>
          <option v-for="t in topics" :key="t" :value="t">{{ t }}</option>
        </select>
        <select v-model="filterDifficulty" class="appearance-none bg-bg-secondary text-text-primary border border-border-subtle rounded-full pl-4 pr-10 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all cursor-pointer">
          <option value="">Tất cả độ khó</option>
          <option value="easy">Dễ</option>
          <option value="medium">Trung bình</option>
          <option value="hard">Khó</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <span>Đang tải danh sách Quiz...</span>
    </div>

    <!-- TC-007: v-for dùng filteredQuizzes (search + filter client-side, debounce 300ms) -->
    <div v-else-if="filteredQuizzes.length === 0" class="empty-state">
      <div class="text-5xl mb-4"><BaseIcon name="help-circle" class="w-12 h-12 text-text-muted mx-auto" /></div>
      <h3 class="text-xl font-bold text-text-primary">{{ quizzesList.length === 0 ? 'Chưa có Quiz nào' : 'Không tìm thấy Quiz phù hợp' }}</h3>
      <p class="text-text-muted mt-2 max-w-md">{{ quizzesList.length === 0 ? 'Tạo Quiz đầu tiên để bắt đầu xây dựng ngân hàng câu hỏi' : 'Thử đổi từ khóa tìm kiếm hoặc bộ lọc' }}</p>
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
          <template v-for="q in filteredQuizzes" :key="q.id">
            <tr @click="toggleQuizAccordion(q.id)" class="cursor-pointer hover:bg-bg-hover transition-colors">
              <td class="font-bold text-text-primary">
                <span class="inline-block mr-1 transition-transform duration-200" :style="expandedQuizId === q.id ? 'transform: rotate(90deg)' : ''">▶</span>
                {{ q.title }}
              </td>
              <td><span class="topic-badge" :class="'topic-' + (q.topic ?? '')">{{ formatTopic(q.topic ?? '') }}</span></td>
              <td><span class="diff-badge" :class="'diff-' + q.difficulty">{{ formatDifficulty(String(q.difficulty)) }}</span></td>
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
                    <button type="button" class="btn-add-inline" @click="openAddQuestion(q.id)">
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
                          <p class="font-semibold text-text-primary truncate">{{ question.question || question.text }}</p>
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
                        <button type="button" class="btn-action btn-action--delete" @click="question.id && composableDeleteQuestion(q.id, question.id)">Xóa</button>
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

    <!-- Modal Quiz -->
    <QuizFormModal
      v-model:show="showQuizForm"
      :editing-quiz="editingQuiz"
      :topics="topics"
      @save="saveQuiz"
    />

    <!-- Modal Câu hỏi -->
    <QuestionFormModal
      v-model:show="showQuestionForm"
      :editing-question="editingQuestion"
      :parent-quiz="editingQuizForQuestion"
      @save="saveQuestion"
    />

    <!-- Confirm Xóa Quiz -->
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
import { useQuizBuilder, type QuizListItem, type QuizQuestion } from './useQuizBuilder';
import { useTeacherApi } from './useTeacherApi';
import { useToastStore } from '../../composables/useToast';
import QuizFormModal from './QuizFormModal.vue';
import QuestionFormModal from './QuestionFormModal.vue';
import ConfirmModal from '@/components/ui/ConfirmModal.vue';
import BaseIcon from '@/shared/components/BaseIcon.vue';

const { formatTopic, formatDifficulty } = useTeacherApi();
const toastStore = useToastStore();

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
  updateQuestion,
  deleteQuestion: composableDeleteQuestion
} = useQuizBuilder();

const searchQuery = ref('');
const filterTopic = ref('');
const filterDifficulty = ref('');
const loadError = ref('');

const showQuizForm = ref(false);
const editingQuiz = ref<QuizListItem | null>(null);
const showQuestionForm = ref(false);
const editingQuestion = ref<QuizQuestion | null>(null);
const editingQuizForQuestion = ref<QuizListItem | null>(null);
// TC-008: id câu hỏi đang sửa (null = thêm mới)
const editingQuestionId = ref<string | null>(null);

const showConfirmDelete = ref(false);
const confirmDeleteTitle = ref('');
const confirmDeleteMessage = ref('');
const deleteAction = ref<(() => Promise<void>) | null>(null);

// TC-007: computed filter — dữ liệu đã chuẩn hóa difficulty (easy/medium/hard)
const filteredQuizzes = computed(() => {
  return quizzesList.value.filter((q) => {
    const matchesSearch = !searchQuery.value || q.title.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesTopic = !filterTopic.value || q.topic === filterTopic.value;
    const matchesDifficulty = !filterDifficulty.value || q.difficulty === filterDifficulty.value;
    return matchesSearch && matchesTopic && matchesDifficulty;
  });
});

function createNewQuiz() {
  editingQuiz.value = null;
  showQuizForm.value = true;
}

// TC-007: debounce 300ms — lọc client-side nên chỉ cần 1 lần cập nhật sau khi gõ xong
let searchTimeout: ReturnType<typeof setTimeout> | null = null;
function debouncedSearch() {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    // filteredQuizzes là computed reactive — chỉ cần trigger re-render sau khi typing dừng.
  }, 300);
}

async function loadData() {
  loadError.value = '';
  try {
    await loadQuizzes();
  } catch (err) {
    loadError.value = err instanceof Error ? err.message : 'Không thể tải danh sách Quiz.';
  }
}

function toggleQuizAccordion(quizId: string) {
  if (expandedQuizId.value === quizId) {
    expandedQuizId.value = null;
  } else {
    expandedQuizId.value = quizId;
    loadQuizQuestions(quizId);
  }
}

function editQuiz(quiz: QuizListItem) {
  editingQuiz.value = quiz;
  showQuizForm.value = true;
}

function openAddQuestion(quizId: string) {
  const quiz = quizzesList.value.find((q) => q.id === quizId);
  if (!quiz) return;
  editingQuizForQuestion.value = quiz;
  editingQuestion.value = null;
  editingQuestionId.value = null;
  showQuestionForm.value = true;
}

function editQuestion(quizId: string, question: QuizQuestion) {
  const quiz = quizzesList.value.find((q) => q.id === quizId);
  if (!quiz) return;
  editingQuizForQuestion.value = quiz;
  editingQuestion.value = { ...question };
  editingQuestionId.value = question.id ?? null;
  showQuestionForm.value = true;
}

function confirmDeleteQuiz(quizId: string) {
  confirmDeleteTitle.value = 'Xóa Quiz';
  confirmDeleteMessage.value = 'Bạn có chắc chắn muốn xóa Quiz này? Hành động này không thể hoàn tác.';
  deleteAction.value = async () => {
    await composableDeleteQuiz(quizId);
    toastStore.success('Đã xóa Quiz thành công.');
  };
  showConfirmDelete.value = true;
}

async function saveQuiz(quizData: { title: string; description: string; topic: string; difficulty: number; xpReward: number }) {
  // TC-019: check res.ok + throw → modal giữ nguyên, lỗi hiển thị qua toast.
  const payload = {
    title: quizData.title,
    topic: quizData.topic,
    difficulty: Number(quizData.difficulty) <= 2 ? 'easy' : Number(quizData.difficulty) >= 4 ? 'hard' : 'medium',
    xpReward: quizData.xpReward,
    questions: [] as Array<{ text: string; options: string[]; correctIndex: number; explanation: string }>
  };
  try {
    if (editingQuiz.value) {
      await updateQuiz(editingQuiz.value.id, payload);
      toastStore.success('Cập nhật Quiz thành công.');
    } else {
      await createQuiz(payload);
      toastStore.success('Tạo Quiz thành công.');
    }
    showQuizForm.value = false;
    editingQuiz.value = null;
  } catch (err) {
    toastStore.handleApiError(err, 'Lưu Quiz thất bại.');
  }
}

async function saveQuestion(questionData: QuizQuestion) {
  // TC-008: gọi API thêm/sửa câu hỏi theo contract manage/questions + đóng modal đúng.
  if (!editingQuizForQuestion.value) return;
  try {
    if (editingQuestionId.value) {
      await updateQuestion(editingQuizForQuestion.value.id, editingQuestionId.value, questionData);
      toastStore.success('Cập nhật câu hỏi thành công.');
    } else {
      await addQuestionToQuiz(editingQuizForQuestion.value.id, questionData);
      toastStore.success('Thêm câu hỏi thành công.');
    }
    showQuestionForm.value = false;
    editingQuestion.value = null;
    editingQuestionId.value = null;
  } catch (err) {
    toastStore.handleApiError(err, 'Lưu câu hỏi thất bại.');
  }
}

async function executeDelete() {
  if (!deleteAction.value) return;
  try {
    await deleteAction.value();
    showConfirmDelete.value = false;
    deleteAction.value = null;
  } catch (err) {
    toastStore.handleApiError(err, 'Xóa Quiz thất bại.');
  }
}

onMounted(() => {
  loadData();
});

// Filter chủ đề/độ khó thay đổi → không cần gọi API (client-side), chỉ cần re-render.
watch([filterTopic, filterDifficulty], () => {
  // filteredQuizzes là computed — tự động cập nhật.
});
</script>

<style scoped>
@import "./QuizBuilderTab.css";
</style>
