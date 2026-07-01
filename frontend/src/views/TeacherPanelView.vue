<template>
  <div class="teacher-panel">
    <h1 class="panel-title">
      <BaseIcon name="academic" class="w-6 h-6 text-accent inline-block mr-2 align-bottom" />
      Bảng điều khiển Giảng viên
      <span class="panel-title__badge">Giảng viên</span>
    </h1>

    <!-- Analytics Grid -->
    <section class="analytics-section">
      <h2 class="section-heading">Thống kê lớp học</h2>
      <div class="analytics-grid">
        <div v-for="metric in analyticsCards" :key="metric.label" class="metric-card">
          <span class="metric-card__value">{{ metric.value }}</span>
          <span class="metric-card__label">{{ metric.label }}</span>
        </div>
      </div>
    </section>

    <!-- Quiz Management -->
    <section class="quiz-manage-section">
      <div class="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h2 class="section-heading m-0">Quản lý ngân hàng câu hỏi trắc nghiệm</h2>
        <div class="flex gap-2">
          <button 
            type="button" 
            class="btn-toggle-form" 
            :class="{ 'btn-toggle-form--active': activeFormType === 'manual' }"
            @click="toggleForm('manual')"
          >
            <span v-if="activeFormType === 'manual'"><BaseIcon name="close" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> Đóng Form</span>
            <span v-else><BaseIcon name="plus" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> Tạo trắc nghiệm thủ công</span>
          </button>
          <button 
            type="button" 
            class="btn-toggle-form btn-toggle-form--excel" 
            :class="{ 'btn-toggle-form--active': activeFormType === 'excel' }"
            @click="toggleForm('excel')"
          >
            <span v-if="activeFormType === 'excel'"><BaseIcon name="close" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> Đóng Form</span>
            <span v-else><BaseIcon name="export-share" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> Nhập từ Excel</span>
          </button>
        </div>
      </div>

      <!-- Form Thêm / Chỉnh sửa Quiz thủ công -->
      <form v-if="activeFormType === 'manual'" class="quiz-form mb-8 animate-fade-in" @submit.prevent="submitQuiz">
        <h3 class="form-title-context">
          <span v-if="isEditMode"><BaseIcon name="edit" class="w-4 h-4 text-accent inline mr-1 align-middle" /> Chỉnh sửa bài trắc nghiệm</span>
          <span v-else><BaseIcon name="plus" class="w-4 h-4 text-accent inline mr-1 align-middle" /> Thêm câu hỏi trắc nghiệm mới</span>
        </h3>
        <div class="form-row">
          <label class="form-label">Tiêu đề trắc nghiệm</label>
          <input v-model="newQuiz.title" class="form-input" placeholder="VD: Cơ bản về danh sách liên kết" required />
        </div>
        <div class="form-row">
          <label class="form-label">Chủ đề</label>
          <select v-model="newQuiz.topic" class="form-select" required>
            <option value="" disabled selected>Chọn chủ đề...</option>
            <option value="sorting">Sắp xếp</option>
            <option value="graph">Đồ thị</option>
            <option value="oop">Hướng đối tượng</option>
            <option value="solid">Nguyên lý SOLID</option>
            <option value="di">DI/IoC (Dependency Injection)</option>
            <option value="array">Mảng tĩnh & Mảng động</option>
            <option value="linked-list">Danh sách liên kết</option>
            <option value="design-patterns">Mẫu thiết kế</option>
          </select>
        </div>
        <div class="form-row form-row--inline">
          <div>
            <label class="form-label">Độ khó</label>
            <select v-model="newQuiz.difficulty" class="form-select">
              <option value="easy">Dễ</option>
              <option value="medium">Trung bình</option>
              <option value="hard">Khó</option>
            </select>
          </div>
          <div>
            <label class="form-label">XP thưởng</label>
            <input v-model.number="newQuiz.xpReward" type="number" class="form-input" min="10" max="500" />
          </div>
        </div>

        <!-- Questions -->
        <div class="questions-section">
          <h3 class="questions-heading">
            Câu hỏi ({{ newQuiz.questions.length }})
            <button type="button" class="btn-add-q" @click="addQuestion">+ Thêm câu</button>
          </h3>
          <div v-for="(q, qi) in newQuiz.questions" :key="qi" class="question-block">
            <div class="question-block__header">
              <span class="question-block__num">Câu {{ qi + 1 }}</span>
              <button v-if="newQuiz.questions.length > 1" type="button" class="btn-remove" @click="removeQuestion(qi)">×</button>
            </div>
            <input v-model="q.text" class="form-input" placeholder="Nội dung câu hỏi..." required />
            <div class="options-grid">
              <div v-for="(_, oi) in q.options" :key="oi" class="option-row">
                <input type="radio" :name="'correct-' + qi" :value="oi" v-model="q.correctIndex" />
                <input v-model="q.options[oi]" class="form-input form-input--sm" :placeholder="'Đáp án ' + String.fromCharCode(65 + oi)" required />
              </div>
            </div>
            <input v-model="q.explanation" class="form-input form-input--sm" placeholder="Giải thích đáp án đúng..." />
          </div>
        </div>

        <div class="form-actions flex justify-center gap-3">
          <button type="submit" class="btn-submit" :disabled="submitting">
            {{ submitting ? 'Đang gửi...' : isEditMode ? 'Cập nhật bài trắc nghiệm' : 'Thêm bài trắc nghiệm vào hệ thống' }}
          </button>
          <button type="button" class="btn-cancel" @click="cancelEdit">
            {{ isEditMode ? 'Hủy' : 'Đóng' }}
          </button>
        </div>
        <div class="text-center">
          <p v-if="submitMessage" class="submit-message" :class="{ 'submit-message--error': submitError }">
            {{ submitMessage }}
          </p>
        </div>
      </form>

      <!-- Import Excel Component -->
      <div v-if="activeFormType === 'excel'" class="mb-8 animate-fade-in">
        <ExcelQuizImporter @import-success="onImportSuccess" />
      </div>

      <!-- Danh sách Quiz hiện có (CRUD Panel) -->
      <div class="quizzes-list-container">
        <h3 class="subsection-heading mb-4">Danh sách bài trắc nghiệm đang hoạt động</h3>
        <div v-if="loadingQuizzes" class="loading-state">
          <div class="spinner"></div>
          <span>Đang tải danh sách bài trắc nghiệm...</span>
        </div>
        <div v-else-if="quizzesList.length === 0" class="empty-state">
          Chưa có bài trắc nghiệm nào trong hệ thống. Hãy tạo mới!
        </div>
        <div v-else class="table-responsive">
          <table class="quizzes-table">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Chủ đề</th>
                <th>Độ khó</th>
                <th>XP Thưởng</th>
                <th>Số câu hỏi</th>
                <th class="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="q in quizzesList" :key="q.id">
                <tr @click="toggleQuizAccordion(String(q.id))" class="cursor-pointer hover:bg-white/5 transition-colors">
                  <td class="font-bold text-white">
                    <span class="inline-block mr-1 transition-transform duration-200" :style="expandedQuizId === String(q.id) ? 'transform: rotate(90deg)' : ''">▶</span>
                    {{ q.title }}
                  </td>
                  <td>
                    <span class="topic-badge" :class="'topic-' + q.topic">
                      {{ formatTopic(q.topic) }}
                    </span>
                  </td>
                  <td>
                    <span class="diff-badge" :class="'diff-' + q.difficulty">
                      {{ formatDifficulty(q.difficulty) }}
                    </span>
                  </td>
                  <td class="font-mono text-amber-400 font-bold"><BaseIcon name="diamond" class="w-4 h-4 text-amber-400 inline mr-1 align-text-bottom" />+{{ q.xpReward }} XP</td>
                  <td class="font-mono text-slate-300">{{ q.questionCount }} câu</td>
                  <td>
                    <div class="flex justify-center gap-2" @click.stop>
                      <button type="button" class="btn-action btn-action--edit" @click="editQuiz(q.id)" title="Chỉnh sửa">
                        <BaseIcon name="edit" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> Sửa
                      </button>
                      <button type="button" class="btn-action btn-action--delete" @click="deleteQuiz(q.id)" title="Xóa">
                        <BaseIcon name="trash" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> Xóa
                      </button>
                    </div>
                  </td>
                </tr>
                <!-- Accordion Row -->
                <tr v-if="expandedQuizId === String(q.id)" class="accordion-row">
                  <td colspan="6" class="accordion-cell">
                    <div v-if="loadingDetail[String(q.id)]" class="loading-detail py-4">
                      <div class="spinner spinner--sm"></div>
                      <span>Đang tải danh sách câu hỏi...</span>
                    </div>
                    <div v-else-if="quizDetails[String(q.id)]" class="quiz-detail-panel animate-fade-in">
                      <div class="flex justify-between items-center mb-4">
                        <h4 class="detail-title text-indigo-400 font-bold m-0"><BaseIcon name="quiz" class="w-4 h-4 text-indigo-400 inline mr-1 align-text-bottom" /> Chỉnh sửa câu hỏi con</h4>
                        <button type="button" class="btn-add-inline" @click="addInlineQuestion(String(q.id))">
                          <BaseIcon name="plus" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> Thêm câu hỏi mới
                        </button>
                      </div>

                      <div v-if="quizDetails[String(q.id)].questions.length === 0" class="empty-state py-4 text-center">
                        Bài trắc nghiệm này chưa có câu hỏi nào. Hãy thêm câu hỏi mới!
                      </div>
                      
                      <div v-for="(subQ, qi) in quizDetails[String(q.id)].questions" :key="qi" class="sub-question-card">
                        <div class="flex justify-between items-center mb-3">
                          <span class="sub-q-num text-amber-400 font-bold">Câu hỏi {{ Number(qi) + 1 }}</span>
                          <button type="button" class="btn-remove-inline" @click="removeInlineQuestion(String(q.id), Number(qi))">
                            <BaseIcon name="close" class="w-3 h-3 inline mr-1 align-text-bottom" /> Xóa câu này
                          </button>
                        </div>

                        <!-- Nhập câu hỏi -->
                        <div class="form-row">
                          <label class="form-label">Nội dung câu hỏi</label>
                          <input v-model="subQ.text" class="form-input" placeholder="Nhập nội dung câu hỏi..." />
                        </div>

                        <!-- Các đáp án -->
                        <div class="options-grid">
                          <div v-for="(_, oi) in subQ.options" :key="oi" class="option-row">
                            <input type="radio" :name="'correct-inline-' + String(q.id) + '-' + qi" :value="oi" v-model="subQ.correctIndex" />
                            <input v-model="subQ.options[oi]" class="form-input form-input--sm" :placeholder="'Đáp án ' + String.fromCharCode(65 + Number(oi))" />
                          </div>
                        </div>

                        <!-- Giải thích -->
                        <div class="form-row">
                          <label class="form-label">Giải thích đáp án đúng</label>
                          <input v-model="subQ.explanation" class="form-input form-input--sm" placeholder="Giải thích vì sao đáp án này đúng..." />
                        </div>
                      </div>

                      <div class="flex justify-end gap-2 mt-4">
                        <button type="button" class="btn-save-inline" @click="saveInlineQuiz(String(q.id))" :disabled="savingDetail[String(q.id)]">
                          <span v-if="savingDetail[String(q.id)]">Đang lưu...</span>
                          <span v-else><BaseIcon name="save" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> Lưu tất cả thay đổi</span>
                        </button>
                        <button type="button" class="btn-close-inline" @click="expandedQuizId = null">
                          Đóng
                        </button>
                      </div>
                      <p v-if="inlineError[String(q.id)]" class="text-rose-400 text-sm mt-2 text-right">
                        {{ inlineError[String(q.id)] }}
                      </p>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '../features/auth/store/useAuthStore';
import ExcelQuizImporter from '../features/quiz/components/ExcelQuizImporter.vue';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';
const authStore = useAuthStore();

interface QuestionForm {
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const activeFormType = ref<'none' | 'manual' | 'excel'>('none');
const isEditMode = ref(false);
const editingQuizId = ref<string | null>(null);

const expandedQuizId = ref<string | null>(null);
const loadingDetail = ref<Record<string, boolean>>({});
const savingDetail = ref<Record<string, boolean>>({});
const quizDetails = ref<Record<string, any>>({});
const inlineError = ref<Record<string, string>>({});

const newQuiz = reactive({
  title: '',
  topic: '',
  difficulty: 'medium',
  xpReward: 50,
  questions: [createEmptyQuestion()] as QuestionForm[],
});

const submitting = ref(false);
const submitMessage = ref('');
const submitError = ref(false);

const quizzesList = ref<any[]>([]);
const loadingQuizzes = ref(false);

interface AnalyticsMetric {
  label: string;
  value: string | number;
}

const analyticsCards = ref<AnalyticsMetric[]>([
  { label: 'Tổng số bài trắc nghiệm', value: '—' },
  { label: 'Tổng số câu hỏi', value: '—' },
  { label: 'Tổng số người dùng', value: '—' },
  { label: 'Thành viên Premium', value: '—' },
]);

function createEmptyQuestion(): QuestionForm {
  return { text: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' };
}

function addQuestion(): void {
  newQuiz.questions.push(createEmptyQuestion());
}

function removeQuestion(index: number): void {
  newQuiz.questions.splice(index, 1);
}

function toggleForm(type: 'manual' | 'excel'): void {
  if (activeFormType.value === type) {
    activeFormType.value = 'none';
    if (isEditMode.value) cancelEdit();
  } else {
    activeFormType.value = type;
    if (type !== 'manual' && isEditMode.value) cancelEdit();
  }
}

function cancelEdit(): void {
  isEditMode.value = false;
  editingQuizId.value = null;
  activeFormType.value = 'none';
  // Reset form
  newQuiz.title = '';
  newQuiz.topic = '';
  newQuiz.difficulty = 'medium';
  newQuiz.xpReward = 50;
  newQuiz.questions = [createEmptyQuestion()];
  submitMessage.value = '';
}

function getAuthHeaders() {
  const token = authStore.getAccessToken() || '';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

async function loadAnalytics(): Promise<void> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/quiz/analytics`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return;
    const data = await res.json();
    analyticsCards.value = [
      { label: 'Tổng số bài trắc nghiệm', value: data.totalQuizzes },
      { label: 'Tổng số câu hỏi', value: data.totalQuestionsInBank },
      { label: 'Tổng số người dùng', value: data.totalUsers },
      { label: 'Thành viên Premium', value: data.premiumUsers },
    ];
  } catch { /* analytics is optional */ }
}

async function loadQuizzes(): Promise<void> {
  loadingQuizzes.value = true;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/quiz/all`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      quizzesList.value = await res.json();
    }
  } catch (err) {
    console.error('Lỗi khi tải danh sách quiz:', err);
  } finally {
    loadingQuizzes.value = false;
  }
}

async function editQuiz(quizId: string): Promise<void> {
  submitMessage.value = '';
  submitError.value = false;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/quiz/${quizId}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      throw new Error('Không thể tải chi tiết bài trắc nghiệm');
    }
    const data = await res.json();
    
    // Đổ dữ liệu vào form
    newQuiz.title = data.title;
    newQuiz.topic = data.topic;
    newQuiz.difficulty = data.difficulty;
    newQuiz.xpReward = data.xpReward;
    newQuiz.questions = data.questions.map((q: any) => ({
      text: q.text,
      options: [...q.options],
      correctIndex: q.correctIndex,
      explanation: q.explanation ?? ''
    }));

    isEditMode.value = true;
    editingQuizId.value = quizId;
    activeFormType.value = 'manual';

    // Cuộn lên form sửa
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err: any) {
    alert(err.message || 'Lỗi khi tải thông tin bài trắc nghiệm');
  }
}

async function deleteQuiz(quizId: string): Promise<void> {
  if (!confirm('Bạn có chắc chắn muốn xóa bài trắc nghiệm này không? Hành động này sẽ xóa vĩnh viễn dữ liệu khỏi hệ thống.')) {
    return;
  }
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/quiz/manage/${quizId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message ?? 'Xóa bài trắc nghiệm thất bại');
    }
    alert('Đã xóa bài trắc nghiệm thành công!');
    await loadQuizzes();
    await loadAnalytics();
  } catch (err: any) {
    alert(err.message || 'Lỗi không xác định khi xóa');
  }
}

async function submitQuiz(): Promise<void> {
  submitting.value = true;
  submitMessage.value = '';
  submitError.value = false;

  const payload = {
    id: isEditMode.value ? editingQuizId.value : '',
    title: newQuiz.title,
    topic: newQuiz.topic,
    difficulty: newQuiz.difficulty,
    xpReward: newQuiz.xpReward,
    questions: newQuiz.questions.map((q, i) => ({
      id: isEditMode.value ? `q${i + 1}` : `custom-q${i + 1}`,
      text: q.text,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
    })),
  };

  try {
    const url = isEditMode.value 
      ? `${BASE_URL}/api/v1/concepts/quiz/manage/${editingQuizId.value}`
      : `${BASE_URL}/api/v1/concepts/quiz/manage`;
      
    const res = await fetch(url, {
      method: isEditMode.value ? 'PUT' : 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message ?? (isEditMode.value ? 'Cập nhật bài trắc nghiệm thất bại' : 'Thêm bài trắc nghiệm thất bại'));
    }
    
    submitMessage.value = isEditMode.value 
      ? 'Bài trắc nghiệm đã được cập nhật thành công!'
      : 'Bài trắc nghiệm đã được thêm thành công!';
      
    cancelEdit();
    await loadQuizzes();
    await loadAnalytics();
  } catch (err: unknown) {
    submitError.value = true;
    submitMessage.value = err instanceof Error ? err.message : 'Lỗi không xác định';
  } finally {
    submitting.value = false;
  }
}

async function toggleQuizAccordion(quizId: string): Promise<void> {
  if (expandedQuizId.value === quizId) {
    expandedQuizId.value = null;
    return;
  }
  expandedQuizId.value = quizId;
  if (!quizDetails.value[quizId]) {
    await fetchQuizDetail(quizId);
  }
}

async function fetchQuizDetail(quizId: string): Promise<void> {
  loadingDetail.value[quizId] = true;
  inlineError.value[quizId] = '';
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/quiz/${quizId}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      throw new Error('Không thể tải chi tiết câu hỏi');
    }
    const data = await res.json();
    quizDetails.value[quizId] = data;
  } catch (err: any) {
    inlineError.value[quizId] = err.message || 'Lỗi khi tải chi tiết';
  } finally {
    loadingDetail.value[quizId] = false;
  }
}

function addInlineQuestion(quizId: string): void {
  const detail = quizDetails.value[quizId];
  if (!detail) return;
  detail.questions.push({
    id: `inline-q-${Date.now()}`,
    text: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    explanation: ''
  });
}

function removeInlineQuestion(quizId: string, index: number): void {
  const detail = quizDetails.value[quizId];
  if (!detail) return;
  detail.questions.splice(index, 1);
}

async function saveInlineQuiz(quizId: string): Promise<void> {
  const detail = quizDetails.value[quizId];
  if (!detail) return;

  savingDetail.value[quizId] = true;
  inlineError.value[quizId] = '';

  // Validate phía client trước khi gửi lên backend
  for (let i = 0; i < detail.questions.length; i++) {
    const q = detail.questions[i];
    if (!q.text || !q.text.trim()) {
      inlineError.value[quizId] = `Hàng ${i + 1}: Câu hỏi không được để trống.`;
      savingDetail.value[quizId] = false;
      return;
    }
    if (!q.options[0] || !q.options[0].trim() || !q.options[1] || !q.options[1].trim()) {
      inlineError.value[quizId] = `Hàng ${i + 1}: Thiếu đáp án bắt buộc A hoặc B.`;
      savingDetail.value[quizId] = false;
      return;
    }
    const validOpts = q.options.filter((o: string) => o && o.trim() !== '');
    if (validOpts.length < 2) {
      inlineError.value[quizId] = `Hàng ${i + 1}: Phải có ít nhất 2 đáp án.`;
      savingDetail.value[quizId] = false;
      return;
    }
    if (q.correctIndex < 0 || q.correctIndex >= q.options.length || !q.options[q.correctIndex] || !q.options[q.correctIndex].trim()) {
      inlineError.value[quizId] = `Hàng ${i + 1}: Đáp án đúng không hợp lệ hoặc trỏ vào ô rỗng.`;
      savingDetail.value[quizId] = false;
      return;
    }
  }

  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/quiz/manage/${quizId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(detail),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Cập nhật bài trắc nghiệm thất bại');
    }

    alert('Đã cập nhật các câu hỏi con thành công!');
    expandedQuizId.value = null;
    await loadQuizzes();
    await loadAnalytics();
  } catch (err: any) {
    inlineError.value[quizId] = err.message || 'Lỗi khi lưu thay đổi';
  } finally {
    savingDetail.value[quizId] = false;
  }
}

function onImportSuccess(): void {
  alert('Nhập danh sách trắc nghiệm từ Excel thành công!');
  activeFormType.value = 'none';
  loadQuizzes();
  loadAnalytics();
}

function formatTopic(topic: string): string {
  const map: Record<string, string> = {
    'sorting': 'Sắp xếp',
    'graph': 'Đồ thị',
    'oop': 'Hướng đối tượng',
    'solid': 'Nguyên lý SOLID',
    'di': 'DI/IoC',
    'array': 'Mảng',
    'linked-list': 'Danh sách liên kết',
    'design-patterns': 'Mẫu thiết kế'
  };
  return map[topic] || topic;
}

function formatDifficulty(diff: string): string {
  const map: Record<string, string> = {
    'easy': 'Dễ',
    'medium': 'Trung bình',
    'hard': 'Khó'
  };
  return map[diff] || diff;
}

onMounted(() => {
  loadAnalytics();
  loadQuizzes();
});
</script>

<style scoped>
.teacher-panel {
  padding: 2rem;
  min-height: 100%;
  overflow-y: auto;
}

.panel-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary, #e2e8f0);
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.panel-title__badge {
  font-size: 0.7rem;
  padding: 2px 10px;
  border-radius: 4px;
  background: rgba(234, 179, 8, 0.15);
  color: #eab308;
  font-weight: 700;
  text-transform: uppercase;
}

.section-heading {
  font-size: 1.1rem;
  color: var(--text-primary, #e2e8f0);
  margin-bottom: 1rem;
  font-weight: 500;
}

.subsection-heading {
  font-size: 1rem;
  color: var(--text-secondary, #94a3b8);
  font-weight: 500;
}

/* ── Analytics ──────────────────────────── */
.analytics-section {
  margin-bottom: 2.5rem;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.metric-card {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.25rem;
  text-align: center;
}

.metric-card__value {
  display: block;
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.metric-card__label {
  font-size: 0.8rem;
  color: var(--text-tertiary, #64748b);
}

/* ── Quiz Form ──────────────────────────── */
.quiz-form {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.5rem;
}

.form-title-context {
  font-size: 1rem;
  font-weight: 600;
  color: #818cf8;
  margin-top: 0;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 0.5rem;
}

.form-row {
  margin-bottom: 1rem;
}

.form-row--inline {
  display: flex;
  gap: 1rem;
}

.form-row--inline > div {
  flex: 1;
}

.form-label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-secondary, #94a3b8);
  margin-bottom: 0.35rem;
  font-weight: 500;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary, #e2e8f0);
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.15s;
}

.form-input:focus,
.form-select:focus {
  border-color: #6366f1;
}

.form-input--sm {
  padding: 0.4rem 0.6rem;
  font-size: 0.85rem;
}

.form-select option {
  background: #1e1e2e;
  color: #e2e8f0;
}

/* ── Questions ──────────────────────────── */
.questions-section {
  margin-top: 1.5rem;
}

.questions-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.95rem;
  color: var(--text-primary, #e2e8f0);
  margin-bottom: 1rem;
}

.btn-add-q {
  font-size: 0.8rem;
  padding: 4px 12px;
  border-radius: 6px;
  border: 1px solid rgba(99, 102, 241, 0.4);
  background: transparent;
  color: #818cf8;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-add-q:hover {
  background: rgba(99, 102, 241, 0.1);
}

.question-block {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.question-block__header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.question-block__num {
  font-size: 0.8rem;
  font-weight: 600;
  color: #818cf8;
}

.btn-remove {
  background: transparent;
  border: none;
  color: #f87171;
  font-size: 1.1rem;
  cursor: pointer;
  line-height: 1;
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin: 0.75rem 0;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.option-row input[type="radio"] {
  accent-color: #6366f1;
}

/* ── Actions ───────────────────────────── */
.form-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
  gap: 0.75rem;
}

.btn-submit {
  padding: 0.7rem 2rem;
  border-radius: 8px;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: #fff;
  border: none;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: opacity 0.15s, box-shadow 0.15s;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-submit:hover:not(:disabled) {
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.35);
}

.btn-cancel {
  padding: 0.7rem 2rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.15);
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-toggle-form {
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  background: rgba(99, 102, 241, 0.1);
  color: #818cf8;
  border: 1px solid rgba(99, 102, 241, 0.25);
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-toggle-form:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.4);
}

.btn-toggle-form--active {
  background: linear-gradient(135deg, #6366f1, #a855f7) !important;
  color: #fff !important;
  border-color: transparent !important;
}

.btn-toggle-form--excel {
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.25);
  background: rgba(16, 185, 129, 0.1);
}

.btn-toggle-form--excel:hover {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.4);
}

.animate-fade-in {
  animation: fadeIn 0.25s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.submit-message {
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: #34d399;
}

.submit-message--error {
  color: #f87171;
}

/* ── Quizzes List Table ────────────────── */
.quizzes-list-container {
  margin-top: 2rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 1.5rem;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.quizzes-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.9rem;
}

.quizzes-table th {
  padding: 0.75rem 1rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.08);
  color: var(--text-secondary, #94a3b8);
  font-weight: 600;
}

.quizzes-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  color: var(--text-primary, #e2e8f0);
}

.quizzes-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.01);
}

/* Badges */
.topic-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.08);
  color: #94a3b8;
}
.topic-sorting { background: rgba(56, 189, 248, 0.15); color: #38bdf8; }
.topic-graph { background: rgba(168, 85, 247, 0.15); color: #c084fc; }
.topic-oop { background: rgba(236, 72, 153, 0.15); color: #f472b6; }
.topic-solid { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
.topic-di { background: rgba(16, 185, 129, 0.15); color: #34d399; }

.diff-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}
.diff-easy { background: rgba(16, 185, 129, 0.15); color: #34d399; }
.diff-medium { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
.diff-hard { background: rgba(239, 68, 68, 0.15); color: #f87171; }

.btn-action {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s;
  background: transparent;
}
.btn-action--edit {
  color: #fbbf24;
  border-color: rgba(245, 158, 11, 0.3);
}
.btn-action--edit:hover {
  background: rgba(245, 158, 11, 0.1);
}
.btn-action--delete {
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.3);
}
.btn-action--delete:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* Loading & Empty States */
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: var(--text-secondary, #94a3b8);
  font-size: 0.95rem;
  gap: 1rem;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.flex { display: flex; }
.flex-wrap { flex-wrap: wrap; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }
.m-0 { margin: 0; }
.font-bold { font-weight: 700; }
.text-white { color: #fff; }
.text-center { text-align: center; }
.font-mono { font-family: var(--font-mono); }
.text-amber-400 { color: #fbbf24; }
.text-slate-300 { color: #cbd5e1; }

/* ── Responsive ─────────────────────── */
@media (max-width: 768px) {
  .teacher-panel { padding: 1rem; }
  .panel-title { font-size: 1.2rem; }
  .analytics-grid { grid-template-columns: 1fr 1fr; }
  .form-row--inline { flex-direction: column; gap: 0.75rem; }
  .options-grid { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .analytics-grid { grid-template-columns: 1fr; }
  .metric-card__value { font-size: 1.4rem; }
}

/* ── Accordion & Inline CRUD ────────── */
.cursor-pointer {
  cursor: pointer;
}
.inline-block {
  display: inline-block;
}
.mr-1 {
  margin-right: 0.25rem;
}
.transition-transform {
  transition-property: transform;
}
.duration-200 {
  transition-duration: 200ms;
}

.accordion-row {
  background: rgba(255, 255, 255, 0.01);
}

.accordion-cell {
  padding: 1.5rem !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.quiz-detail-panel {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
}

.sub-question-card {
  background: rgba(255, 255, 255, 0.015);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1.25rem;
}

.sub-question-card:last-child {
  margin-bottom: 0;
}

.btn-add-inline {
  font-size: 0.8rem;
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid rgba(16, 185, 129, 0.4);
  background: transparent;
  color: #34d399;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
}

.btn-add-inline:hover {
  background: rgba(16, 185, 129, 0.1);
  border-color: #10b981;
}

.btn-remove-inline {
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 4px;
  border: 1px solid rgba(239, 68, 68, 0.4);
  background: transparent;
  color: #f87171;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
}

.btn-remove-inline:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: #ef4444;
}

.btn-save-inline {
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  border: none;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: box-shadow 0.15s;
}

.btn-save-inline:hover {
  box-shadow: 0 2px 10px rgba(16, 185, 129, 0.35);
}

.btn-save-inline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-close-inline {
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-close-inline:hover {
  background: rgba(255, 255, 255, 0.15);
}

.loading-detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary, #94a3b8);
  font-size: 0.9rem;
}

.spinner--sm {
  width: 16px !important;
  height: 16px !important;
  border-width: 2px !important;
}

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.text-rose-400 {
  color: #fb7185;
}

.text-indigo-400 {
  color: #818cf8;
}

.text-amber-400 {
  color: #fbbf24;
}

.text-right {
  text-align: right;
}

.text-sm {
  font-size: 0.875rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-4 {
  margin-top: 1rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}
</style>
