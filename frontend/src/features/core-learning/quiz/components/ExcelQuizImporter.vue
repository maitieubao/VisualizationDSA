<template>
  <div class="excel-importer-card">
    <div class="card-header">
      <h3 class="card-title">📂 Nhập trắc nghiệm từ file Excel</h3>
      <p class="card-subtitle">
        Tải file mẫu Excel, điền thông tin các câu hỏi và tải lên để nhập hàng loạt câu hỏi vào hệ thống.
      </p>
    </div>

    <!-- Download Template & Import Controls -->
    <div class="controls-row">
      <button class="btn-secondary" @click="downloadTemplate">
        📥 Tải File Mẫu Excel
      </button>

      <label class="btn-primary file-input-label">
        📤 Chọn File Excel...
        <input
          type="file"
          accept=".xlsx, .xls"
          class="hidden-file-input"
          @change="handleFileUpload"
        />
      </label>
    </div>

    <!-- Preview Area -->
    <div v-if="parsedQuizzes.length > 0" class="preview-section">
      <h4 class="preview-heading">👀 Xem trước dữ liệu (Tìm thấy {{ parsedQuizzes.length }} bài trắc nghiệm)</h4>
      
      <div class="quizzes-preview-list">
        <div 
          v-for="(quiz, qi) in parsedQuizzes" 
          :key="qi" 
          class="quiz-preview-card"
          :class="{ 'quiz-preview-card--invalid': quiz.validationErrors.length > 0 }"
        >
          <div class="quiz-preview-card__header">
            <div>
              <span class="quiz-title">{{ quiz.title || '(Chưa có tiêu đề)' }}</span>
              <div class="quiz-meta-row">
                <span class="badge badge--topic">Chủ đề: {{ getTopicLabel(quiz.topic) }}</span>
                <span class="badge" :class="'badge--diff-' + quiz.difficulty">
                  {{ getDifficultyLabel(quiz.difficulty) }}
                </span>
                <span class="badge badge--xp">+{{ quiz.xpReward }} XP</span>
              </div>
            </div>
            <span v-if="quiz.validationErrors.length > 0" class="status-badge status-badge--error">
              Lỗi ({{ quiz.validationErrors.length }})
            </span>
            <span v-else-if="quiz.imported" class="status-badge status-badge--success">
              Đã nhập xong ✅
            </span>
            <span v-else class="status-badge status-badge--ready">
              Sẵn sàng
            </span>
          </div>

          <!-- Errors list -->
          <ul v-if="quiz.validationErrors.length > 0" class="errors-list">
            <li v-for="(err, ei) in quiz.validationErrors" :key="ei">
              ⚠️ {{ err }}
            </li>
          </ul>

          <!-- Questions list nested preview -->
          <div class="preview-questions">
            <div 
              v-for="(q, qidx) in quiz.questions" 
              :key="qidx" 
              class="preview-q-row"
            >
              <span class="q-num">Câu {{ qidx + 1 }}:</span>
              <div class="q-content">
                <p class="q-text">{{ q.text }}</p>
                <div class="options-preview">
                  <div 
                    v-for="(opt, oidx) in q.options" 
                    :key="oidx"
                    class="opt-item"
                    :class="{ 'opt-item--correct': oidx === q.correctIndex }"
                  >
                    <span class="opt-label">{{ String.fromCharCode(65 + oidx) }}.</span>
                    {{ opt }}
                  </div>
                </div>
                <p v-if="q.explanation" class="q-explanation">
                  💡 <em>Giải thích:</em> {{ q.explanation }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="import-actions">
        <button 
          class="btn-submit-all" 
          :disabled="hasInvalidQuizzes || importing" 
          @click="submitAllQuizzes"
        >
          {{ importing ? 'Đang tải lên...' : '🚀 Xác nhận nhập tất cả các bài trắc nghiệm hợp lệ' }}
        </button>
        <span v-if="hasInvalidQuizzes" class="warning-text">
          * Vui lòng chỉnh sửa các ô bị lỗi trong file Excel trước khi tiến hành import.
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import * as XLSX from 'xlsx';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

const emit = defineEmits(['import-success']);
const authStore = useAuthStore();
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

import { 
  parseExcelRows, 
  type QuizImportData,
  type ExcelRowInput
} from '../service/excelParser';

const parsedQuizzes = ref<QuizImportData[]>([]);
const importing = ref(false);

const hasInvalidQuizzes = computed(() => {
  return parsedQuizzes.value.some(q => q.validationErrors.length > 0);
});

function getDifficultyLabel(diff: string): string {
  if (diff === 'easy') return 'Dễ';
  if (diff === 'hard') return 'Khó';
  return 'Trung bình';
}

function getTopicLabel(topic: string): string {
  const map: Record<string, string> = {
    'sorting': 'Sắp xếp',
    'graph': 'Đồ thị',
    'oop': 'Hướng đối tượng',
    'solid': 'Nguyên lý SOLID',
    'di': 'DI/IoC (Dependency Injection)',
    'array': 'Mảng tĩnh & Mảng động',
    'linked-list': 'Danh sách liên kết'
  };
  return map[topic.toLowerCase()] || topic;
}

/**
 * Tạo & tải xuống file Excel mẫu
 */
function downloadTemplate(): void {
  const headers = [
    'Tiêu đề trắc nghiệm',
    'Chủ đề',
    'Độ khó (easy/medium/hard)',
    'XP Thưởng',
    'Câu hỏi',
    'Đáp án A',
    'Đáp án B',
    'Đáp án C',
    'Đáp án D',
    'Đáp án đúng (A/B/C/D)',
    'Giải thích'
  ];

  const sampleData = [
    [
      'Mảng tĩnh và Mảng động',
      'array',
      'easy',
      50,
      'Độ phức tạp thời gian truy xuất phần tử theo chỉ số trong mảng là gì?',
      'O(1)',
      'O(N)',
      'O(log N)',
      'O(N log N)',
      'A',
      'Mảng lưu trữ các phần tử liên tiếp trong bộ nhớ, cho phép tính toán trực tiếp địa chỉ và truy xuất chỉ trong O(1).'
    ],
    [
      'Mảng tĩnh và Mảng động',
      'array',
      'easy',
      50,
      'Mảng động tăng kích thước như thế nào khi bị đầy?',
      'Tự động tăng thêm 1 phần tử',
      'Nhân đôi dung lượng hiện tại và sao chép phần tử cũ sang',
      'Báo lỗi tràn bộ nhớ lập tức',
      'Giảm kích thước phần tử để nhét thêm',
      'B',
      'Mảng động (Vector/ArrayList) thường cấp phát mảng mới lớn gấp đôi (hoặc gấp 1.5 lần) khi đầy rồi sao chép dữ liệu cũ sang.'
    ],
    [
      'Giải thuật BFS và DFS',
      'graph',
      'medium',
      100,
      'BFS (Breadth-First Search) sử dụng cấu trúc dữ liệu nào?',
      'Ngăn xếp (Stack)',
      'Hàng đợi (Queue)',
      'Cây nhị phân (Binary Tree)',
      'Bảng băm (Hash Table)',
      'B',
      'BFS duyệt theo chiều rộng, phần tử nào khám phá trước sẽ được thăm trước nên dùng hàng đợi FIFO (Queue).'
    ]
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Quiz Template');
  
  XLSX.writeFile(wb, 'vdsa_quiz_template.xlsx');
}

/**
 * Xử lý file upload Excel
 */
async function handleFileUpload(event: Event): Promise<void> {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  
  // 1. Giới hạn kích thước file tải lên (Tối đa 5MB)
  const maxSizeBytes = 5 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    alert("Kích thước file vượt quá giới hạn cho phép (Tối đa 5MB).");
    target.value = ''; // Reset file input
    return;
  }

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<ExcelRowInput>(worksheet);

      // 2. Giới hạn số lượng câu hỏi/dòng tối đa (Tối đa 2000 dòng)
      if (rows.length > 2000) {
        alert("File Excel chứa quá nhiều câu hỏi (Giới hạn tối đa là 2000 dòng).");
        target.value = ''; // Reset file input
        parsedQuizzes.value = [];
        return;
      }

      parsedQuizzes.value = parseExcelRows(rows);
    } catch (err) {
      alert("Đã xảy ra lỗi khi đọc file Excel. Vui lòng kiểm tra lại định dạng file.");
      target.value = ''; // Reset file input
      parsedQuizzes.value = [];
    }
  };

  reader.readAsArrayBuffer(file);
}


/**
 * Submit tất cả các Quiz hợp lệ lên Backend
 */
async function submitAllQuizzes(): Promise<void> {
  if (hasInvalidQuizzes.value || parsedQuizzes.value.length === 0) return;

  importing.value = true;
  let successCount = 0;

  for (const quiz of parsedQuizzes.value) {
    if (quiz.imported) continue;

    const payload = {
      id: '',
      title: quiz.title,
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      xpReward: quiz.xpReward,
      questions: quiz.questions
    };

    try {
      const res = await fetch(`${BASE_URL}/api/v1/concepts/quiz/manage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.getAccessToken() || ''}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        quiz.imported = true;
        successCount++;
      } else {
        const errData = await res.json();
        quiz.validationErrors.push(errData.message || 'Lỗi tải lên máy chủ.');
      }
    } catch (err) {
      quiz.validationErrors.push('Lỗi kết nối tới máy chủ.');
    }
  }

  importing.value = false;
  if (successCount > 0) {
    emit('import-success');
  }
}
</script>

<style scoped>
.excel-importer-card {
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
}

.card-header {
  margin-bottom: 1.25rem;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #f1f5f9;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-subtitle {
  font-size: 0.825rem;
  color: #94a3b8;
  margin-top: 0.25rem;
}

.controls-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.btn-primary, .btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 1.2rem;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: #ffffff;
  border: none;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #e2e8f0;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.file-input-label {
  position: relative;
}

.hidden-file-input {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

/* ── Preview Area ───────────────────────── */
.preview-section {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 1.25rem;
}

.preview-heading {
  font-size: 0.95rem;
  font-weight: 600;
  color: #cbd5e1;
  margin-bottom: 1rem;
}

.quizzes-preview-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 1.5rem;
  padding-right: 0.25rem;
}

.quiz-preview-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 1rem;
  transition: border-color 0.2s;
}

.quiz-preview-card:hover {
  border-color: rgba(255, 255, 255, 0.12);
}

.quiz-preview-card--invalid {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.02);
}

.quiz-preview-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.quiz-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #f8fafc;
}

.quiz-meta-row {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.35rem;
}

.badge {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.06);
  color: #cbd5e1;
}

.badge--topic {
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
}

.badge--diff-easy {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.badge--diff-medium {
  background: rgba(234, 179, 8, 0.15);
  color: #facc15;
}

.badge--diff-hard {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.badge--xp {
  background: rgba(168, 85, 247, 0.15);
  color: #c084fc;
}

.status-badge {
  font-size: 0.725rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
}

.status-badge--ready {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
}

.status-badge--error {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.status-badge--success {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}

.errors-list {
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.12);
  border-radius: 6px;
  padding: 0.5rem 1rem;
  margin-bottom: 0.75rem;
  font-size: 0.775rem;
  color: #fca5a5;
  list-style: none;
}

.preview-questions {
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  padding-top: 0.5rem;
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preview-q-row {
  display: flex;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.q-num {
  color: #94a3b8;
  font-weight: 600;
}

.q-content {
  flex: 1;
}

.q-text {
  color: #e2e8f0;
  margin-bottom: 0.25rem;
}

.options-preview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.25rem;
}

.opt-item {
  color: #94a3b8;
  padding: 2px 6px;
  border-radius: 4px;
}

.opt-item--correct {
  color: #4ade80;
  background: rgba(34, 197, 94, 0.08);
  font-weight: 500;
}

.opt-label {
  font-weight: 600;
}

.q-explanation {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.import-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.btn-submit-all {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.75rem 2rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.btn-submit-all:disabled {
  background: #334155;
  color: #64748b;
  box-shadow: none;
  cursor: not-allowed;
}

.btn-submit-all:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
}

.warning-text {
  font-size: 0.75rem;
  color: #f87171;
}
</style>
