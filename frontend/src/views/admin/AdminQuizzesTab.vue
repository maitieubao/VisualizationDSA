<template>
  <section class="tab-section fade-in">
    <div class="card card--quizzes">
      <h3 class="card-heading"><BaseIcon name="clipboard-list" style="width:18px;height:18px" /> Ngân hàng Quiz hiện có</h3>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width:32px"></th>
              <th>Tiêu đề</th><th>Chủ đề</th><th>Độ khó</th>
              <th>XP</th><th>Số câu hỏi</th><th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="q in quizzesList" :key="q.id">
              <tr class="quiz-row" @click="toggleQuizDetails(q.id)" style="cursor:pointer">
                <td class="td-expand-icon">{{ expandedQuizId === q.id ? '▼' : '▶' }}</td>
                <td class="td-title">{{ q.title }}</td>
                <td><span class="tag-topic">{{ q.topic }}</span></td>
                <td><span class="tag-difficulty" :class="'tag-difficulty--' + q.difficulty">{{ getDifficultyLabel(q.difficulty) }}</span></td>
                <td>{{ q.xpReward }} XP</td>
                <td>{{ q.questionCount }} câu</td>
                <td><button class="btn-delete" @click.stop="deleteQuiz(q.id, q.title)"><BaseIcon name="trash" style="width:14px;height:14px" /> Xóa</button></td>
              </tr>
              <tr v-if="expandedQuizId === q.id" class="quiz-details-row">
                <td colspan="7" style="padding: 0">
                  <div class="quiz-details-panel">
                    <div v-if="quizDetailsLoading" class="quiz-loading"><BaseIcon name="hourglass" style="width:14px;height:14px" /> Đang tải câu hỏi...</div>
                    <div v-else-if="quizDetails.length === 0" class="quiz-loading">Không có câu hỏi nào.</div>
                    <div v-else class="quiz-questions-list">
                      <div v-for="(qs, idx) in quizDetails" :key="idx" class="quiz-question-item">
                        <div class="qs-header"><span class="qs-num">Câu {{ idx + 1 }}</span><span class="qs-text">{{ qs.text }}</span></div>
                        <div class="qs-options">
                          <div v-for="(opt, oi) in qs.options" :key="oi" class="qs-option" :class="{ 'qs-option--correct': oi === qs.correctIndex }">
                            <span class="qs-opt-letter">{{ ['A', 'B', 'C', 'D'][oi] }}.</span>
                            {{ opt }}
                            <span v-if="oi === qs.correctIndex" class="qs-correct-badge"><BaseIcon name="check-circle" style="width:13px;height:13px" /> Đáp án đúng</span>
                          </div>
                        </div>
                        <div v-if="qs.explanation" class="qs-explanation"><BaseIcon name="bulb" style="width:13px;height:13px" /> {{ qs.explanation }}</div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
            <tr v-if="quizzesList.length === 0"><td colspan="7" class="empty-table-text">Đang tải danh sách Quiz...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAdminApi } from './useAdminApi';

const emit = defineEmits<{ (e: 'refresh-dashboard'): void }>();
const { BASE_URL, getAuthHeaders, pushLog, getDifficultyLabel } = useAdminApi();

interface QuizQuestion { text: string; options: string[]; correctIndex: number; explanation?: string; }
interface QuizItem { id: string; title: string; topic: string; difficulty: string; xpReward: number; questionCount: number; createdAt: string; }

const quizzesList = ref<QuizItem[]>([]);
const expandedQuizId = ref<string | null>(null);
const quizDetails = ref<QuizQuestion[]>([]);
const quizDetailsLoading = ref(false);

async function loadQuizzes(): Promise<void> {
  try { const res = await fetch(`${BASE_URL}/api/v1/concepts/admin/quizzes`, { headers: getAuthHeaders() }); if (res.ok) quizzesList.value = await res.json(); }
  catch { pushLog('ERROR', 'Lỗi tải danh sách Quiz.'); }
}

async function deleteQuiz(quizId: string, title: string): Promise<void> {
  if (!confirm(`Bạn có chắc chắn muốn xóa Quiz "${title}" không?`)) return;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/admin/quizzes/${quizId}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (res.ok) { quizzesList.value = quizzesList.value.filter(q => q.id !== quizId); pushLog('INFO', `Đã xóa quiz "${title}"`); emit('refresh-dashboard'); }
    else alert('Lỗi khi xóa Quiz.');
  } catch { alert('Lỗi kết nối khi xóa Quiz.'); }
}

async function toggleQuizDetails(quizId: string): Promise<void> {
  if (expandedQuizId.value === quizId) { expandedQuizId.value = null; quizDetails.value = []; return; }
  expandedQuizId.value = quizId; quizDetails.value = []; quizDetailsLoading.value = true;
  try { const res = await fetch(`${BASE_URL}/api/v1/concepts/quiz/${quizId}`, { headers: getAuthHeaders() }); if (res.ok) { const data = await res.json(); quizDetails.value = data.questions ?? []; } }
  catch { pushLog('ERROR', 'Lỗi tải chi tiết câu hỏi.'); } finally { quizDetailsLoading.value = false; }
}

onMounted(() => loadQuizzes());
</script>
