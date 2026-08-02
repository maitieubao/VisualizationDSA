<template>
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

    
    <div v-if="activeFormType === 'excel'" class="mb-8 animate-fade-in">
      
    </div>

    
    <div class="quizzes-list-container !bg-transparent !border-none !p-0 !shadow-none mt-8">
      <h3 class="subsection-heading mb-4 text-text-primary font-bold text-lg">Danh sách bài trắc nghiệm đang hoạt động</h3>
      <div v-if="loadingQuizzes" class="loading-state">
        <div class="spinner"></div>
        <span>Đang tải danh sách bài trắc nghiệm...</span>
      </div>
      <div v-else-if="quizzesList.length === 0" class="empty-state">
        <BaseIcon name="quiz" class="w-16 h-16 text-text-muted mb-2" />
        <h3 class="text-text-primary text-xl font-bold">Chưa có bài trắc nghiệm</h3>
        <p class="text-text-secondary">Tạo bài trắc nghiệm để học viên có thể ôn tập kiến thức.</p>
        <button class="btn-submit mt-4" @click="toggleForm('manual')">Tạo thủ công</button>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="q in quizzesList" :key="q.id" class="course-card flex flex-col p-0 overflow-hidden hover:border-border-accent/50 transition-colors cursor-pointer group" @click="toggleQuizAccordion(String(q.id))">
          
          <div class="p-5 flex-1 flex flex-col relative">
            <div class="absolute top-4 right-4 flex gap-2">
              <span class="topic-badge shadow-md" :class="'topic-' + q.topic">{{ formatTopic(q.topic) }}</span>
            </div>
            
            <BaseIcon name="quiz" class="w-10 h-10 text-accent/50 mb-4" />
            <h4 class="text-lg font-bold text-text-primary mb-2 line-clamp-2 leading-tight group-hover:text-accent transition-colors pr-20">{{ q.title }}</h4>
            
            <div class="flex items-center justify-between text-xs text-text-secondary mb-4 mt-auto pt-4">
              <span class="flex items-center gap-1"><BaseIcon name="collection" class="w-3.5 h-3.5" /> {{ q.questionCount }} câu</span>
              <span class="font-mono text-accent-warm font-bold flex items-center gap-1"><BaseIcon name="diamond" class="w-3.5 h-3.5" />+{{ q.xpReward }} XP</span>
              <span class="diff-badge" :class="'diff-' + q.difficulty">{{ formatDifficulty(q.difficulty) }}</span>
            </div>
            
            <div class="flex justify-between gap-2 border-t border-border-default pt-4">
              <button class="btn-action btn-action--edit flex-1 flex items-center justify-center gap-1" @click.stop="editQuiz(q.id)">
                <BaseIcon name="edit" class="w-3.5 h-3.5" /> Sửa
              </button>
              <button class="btn-action btn-action--delete flex items-center justify-center" @click.stop="deleteQuiz(q.id)">
                <BaseIcon name="trash" class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Expanded Questions Area -->
          <div v-if="expandedQuizId === String(q.id)" class="bg-black/40 border-t border-border-default p-4" @click.stop>
            <div class="flex justify-between items-center mb-3">
              <h5 class="text-sm font-bold text-accent m-0 flex items-center gap-1"><BaseIcon name="chevron-down" class="w-4 h-4" /> Câu hỏi ({{ q.questionCount }})</h5>
            </div>
            
            <div v-if="loadingDetail[String(q.id)]" class="loading-detail py-2 justify-center">
              <div class="spinner spinner--sm"></div>
            </div>
            <div v-else-if="quizDetails[String(q.id)]" class="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <div class="flex justify-between">
                <button type="button" class="btn-add-inline w-full" @click="addInlineQuestion(String(q.id))">
                  + Thêm câu hỏi
                </button>
              </div>
              <div v-for="(subQ, qi) in quizDetails[String(q.id)].questions" :key="qi" class="bg-bg-surface p-3 rounded border border-border-default">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-accent-warm text-xs font-bold">Câu {{ Number(qi) + 1 }}</span>
                  <button type="button" class="text-accent-red hover:text-accent-red text-xs" @click="removeInlineQuestion(String(q.id), Number(qi))">Xóa</button>
                </div>
                <input v-model="subQ.text" class="form-input text-sm mb-2" placeholder="Nội dung câu hỏi..." />
                <div class="grid grid-cols-1 gap-2 mb-2">
                  <div v-for="(_, oi) in subQ.options" :key="oi" class="flex items-center gap-2">
                    <input type="radio" :name="'correct-inline-' + String(q.id) + '-' + qi" :value="oi" v-model="subQ.correctIndex" />
                    <input v-model="subQ.options[oi]" class="form-input form-input--sm text-xs py-1" :placeholder="'Đáp án ' + String.fromCharCode(65 + Number(oi))" />
                  </div>
                </div>
                <input v-model="subQ.explanation" class="form-input form-input--sm text-xs py-1" placeholder="Giải thích..." />
              </div>
              
              <div class="flex gap-2 sticky bottom-0 bg-bg-secondary/95 backdrop-blur pt-3 pb-1 z-10 border-t border-border-default mt-2">
                <button type="button" class="btn-submit text-sm py-1.5 flex-1" @click="saveInlineQuiz(String(q.id))" :disabled="savingDetail[String(q.id)]">
                  <span v-if="savingDetail[String(q.id)]">Đang lưu...</span>
                  <span v-else>Lưu thay đổi</span>
                </button>
                <button type="button" class="btn-cancel text-sm py-1.5" @click="expandedQuizId = null">Đóng</button>
              </div>
              <p v-if="inlineError[String(q.id)]" class="text-accent-red text-xs text-center mt-1">{{ inlineError[String(q.id)] }}</p>
            </div>
          </div>
        </div>
      </div>

      
      <div class="quizzes-report-container mt-10 p-6 rounded-2xl border border-border-default bg-bg-surface">
        <h3 class="subsection-heading mb-2 flex items-center gap-2 text-text-primary">
          <BaseIcon name="chart-bar" class="w-5 h-5 text-accent" />
          Báo cáo hiệu suất bài tập trắc nghiệm
        </h3>
        <p class="text-xs text-text-secondary mb-6">Thống kê tổng hợp điểm số trung bình và tỷ lệ đậu theo từng chủ đề bài thi.</p>

        <div v-if="loadingAnalytics" class="text-center py-6 text-text-muted">Đang tải dữ liệu báo cáo...</div>
        <div v-else-if="!quizPerformanceStats.length" class="text-center py-6 text-text-muted">Chưa có lượt làm bài nào để thống kê hiệu suất.</div>
        <div v-else class="table-responsive">
          <table class="quizzes-table">
            <thead>
              <tr>
                <th>Tên bài trắc nghiệm</th>
                <th>Chủ đề</th>
                <th class="text-center">Tổng lượt làm</th>
                <th class="text-center">Lượt đậu</th>
                <th class="text-center">Điểm TB (%)</th>
                <th class="text-center">Tỷ lệ đậu (%)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="stat in quizPerformanceStats" :key="stat.quizId">
                <td class="font-bold text-text-primary">{{ stat.title }}</td>
                <td><span class="topic-badge" :class="'topic-' + stat.topic">{{ formatTopic(stat.topic) }}</span></td>
                <td class="text-center font-mono font-bold text-text-secondary">{{ stat.totalAttempts }} lượt</td>
                <td class="text-center font-mono text-accent-green">{{ stat.passedCount }} lượt</td>
                <td class="text-center font-mono text-accent font-bold">{{ stat.avgScore }}%</td>
                <td class="text-center">
                  <span 
                    class="px-2 py-0.5 rounded-lg text-xs font-bold font-mono"
                    :class="stat.passRatePercent >= 70 ? 'bg-accent-green/10 text-accent-green' : stat.passRatePercent >= 40 ? 'bg-accent-warm/10 text-accent-warm' : 'bg-accent-red/10 text-accent-red'"
                  >
                    {{ stat.passRatePercent }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useTeacherApi } from './useTeacherApi';


const { BASE_URL, getAuthHeaders, formatTopic, formatDifficulty } = useTeacherApi();

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
const submitting = ref(false);
const submitMessage = ref('');
const submitError = ref(false);
const quizzesList = ref<any[]>([]);
const loadingQuizzes = ref(false);
const loadingAnalytics = ref(false);
const quizPerformanceStats = ref<any[]>([]);

const newQuiz = reactive({
  title: '',
  topic: '',
  difficulty: 'medium',
  xpReward: 50,
  questions: [createEmptyQuestion()] as QuestionForm[],
});

function createEmptyQuestion(): QuestionForm {
  return { text: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' };
}

function addQuestion(): void { newQuiz.questions.push(createEmptyQuestion()); }
function removeQuestion(index: number): void { newQuiz.questions.splice(index, 1); }

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
  Object.assign(newQuiz, { title: '', topic: '', difficulty: 'medium', xpReward: 50 });
  newQuiz.questions = [createEmptyQuestion()];
  submitMessage.value = '';
}

async function loadAnalytics(): Promise<void> {
  loadingAnalytics.value = true;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/quiz/analytics`, { headers: getAuthHeaders() });
    if (!res.ok) return;
    const data = await res.json();
    quizPerformanceStats.value = data.perQuizStats || [];
  } catch {  }
  finally { loadingAnalytics.value = false; }
}

async function loadQuizzes(): Promise<void> {
  loadingQuizzes.value = true;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/quiz/all`, { headers: getAuthHeaders() });
    if (res.ok) quizzesList.value = await res.json();
  } catch (err) { console.error('Lỗi khi tải danh sách quiz:', err); }
  finally { loadingQuizzes.value = false; }
}

async function editQuiz(quizId: string): Promise<void> {
  submitMessage.value = ''; submitError.value = false;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/quiz/${quizId}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Không thể tải chi tiết trắc nghiệm');
    const data = await res.json();
    isEditMode.value = true; editingQuizId.value = quizId; activeFormType.value = 'manual';
    Object.assign(newQuiz, { title: data.title, topic: data.topic, difficulty: data.difficulty, xpReward: data.xpReward });
    newQuiz.questions = data.questions.map((q: any) => ({ text: q.text, options: [...q.options], correctIndex: q.correctIndex, explanation: q.explanation ?? '' }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err: any) { alert(err.message || 'Lỗi khi tải thông tin bài trắc nghiệm'); }
}

async function deleteQuiz(quizId: string): Promise<void> {
  if (!confirm('Bạn có chắc chắn muốn xóa bài trắc nghiệm này?')) return;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/quiz/manage/${quizId}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Xóa bài trắc nghiệm thất bại');
    alert('Đã xóa bài trắc nghiệm thành công!');
    await loadQuizzes(); await loadAnalytics();
  } catch (err: any) { alert(err.message || 'Lỗi không xác định khi xóa'); }
}

async function submitQuiz(): Promise<void> {
  submitting.value = true; submitMessage.value = ''; submitError.value = false;
  const payload = {
    id: isEditMode.value ? editingQuizId.value : '',
    title: newQuiz.title, topic: newQuiz.topic, difficulty: newQuiz.difficulty, xpReward: newQuiz.xpReward,
    questions: newQuiz.questions.map((q, i) => ({ id: isEditMode.value ? `q${i + 1}` : `custom-q${i + 1}`, text: q.text, options: q.options, correctIndex: q.correctIndex, explanation: q.explanation })),
  };
  try {
    const url = isEditMode.value ? `${BASE_URL}/api/v1/concepts/quiz/manage/${editingQuizId.value}` : `${BASE_URL}/api/v1/concepts/quiz/manage`;
    const res = await fetch(url, { method: isEditMode.value ? 'PUT' : 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) });
    if (!res.ok) { const err = await res.json(); throw new Error(err.message ?? (isEditMode.value ? 'Cập nhật thất bại' : 'Thêm thất bại')); }
    submitMessage.value = isEditMode.value ? 'Cập nhật thành công!' : 'Thêm thành công!';
    cancelEdit(); await loadQuizzes(); await loadAnalytics();
  } catch (err: unknown) { submitError.value = true; submitMessage.value = err instanceof Error ? err.message : 'Lỗi không xác định'; }
  finally { submitting.value = false; }
}

async function toggleQuizAccordion(quizId: string): Promise<void> {
  if (expandedQuizId.value === quizId) { expandedQuizId.value = null; return; }
  expandedQuizId.value = quizId;
  if (!quizDetails.value[quizId]) await fetchQuizDetail(quizId);
}

async function fetchQuizDetail(quizId: string): Promise<void> {
  loadingDetail.value[quizId] = true; inlineError.value[quizId] = '';
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/quiz/${quizId}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Không thể tải chi tiết trắc nghiệm');
    quizDetails.value[quizId] = await res.json();
  } catch (err: any) { inlineError.value[quizId] = err.message || 'Lỗi khi tải chi tiết'; }
  finally { loadingDetail.value[quizId] = false; }
}

function addInlineQuestion(quizId: string): void {
  if (!quizDetails.value[quizId]) return;
  quizDetails.value[quizId].questions.push({ text: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' });
}

function removeInlineQuestion(quizId: string, index: number): void {
  if (!quizDetails.value[quizId]) return;
  quizDetails.value[quizId].questions.splice(index, 1);
}

async function saveInlineQuiz(quizId: string): Promise<void> {
  savingDetail.value[quizId] = true; inlineError.value[quizId] = '';
  try {
    const payload = quizDetails.value[quizId];
    const res = await fetch(`${BASE_URL}/api/v1/concepts/quiz/manage/${quizId}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(payload) });
    if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Cập nhật thất bại'); }
    alert('Đã cập nhật các câu hỏi con thành công!');
    expandedQuizId.value = null; await loadQuizzes(); await loadAnalytics();
  } catch (err: any) { inlineError.value[quizId] = err.message || 'Lỗi khi lưu thay đổi'; }
  finally { savingDetail.value[quizId] = false; }
}

function onImportSuccess(): void {
  alert('Nhập danh sách trắc nghiệm từ Excel thành công!');
  activeFormType.value = 'none'; loadQuizzes(); loadAnalytics();
}


defineExpose({ loadQuizzes, loadAnalytics, quizzesList });

loadQuizzes();
loadAnalytics();
</script>
