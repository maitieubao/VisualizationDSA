<template>
  <section class="analytics-manage-section animate-fade-in mt-6">
    <div class="flex justify-between items-center mb-6 flex-wrap gap-3">
      <h2 class="section-heading m-0 text-text-primary">Thống kê & Phân tích chi tiết lớp học</h2>
      <div class="flex items-center gap-2">
        <label class="text-xs font-bold text-text-muted uppercase">Chọn lớp học:</label>
        <select v-model="selectedClassroomId" @change="loadClassroomAnalytics" class="form-select bg-bg-secondary border border-border-subtle rounded-xl px-4 py-2 text-xs font-bold text-text-primary focus:outline-none focus:border-accent w-64">
          <option value="" disabled>-- Chọn lớp học --</option>
          <option v-for="c in classroomsList" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>
    </div>

    <div v-if="loadingAnalyticsData" class="loading-state py-12 flex flex-col items-center justify-center gap-3">
      <div class="spinner inline-block w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
      <span class="text-text-muted text-xs">Đang tải số liệu thống kê...</span>
    </div>

    <!-- TC-020: banner lỗi tách khỏi empty state -->
    <div v-else-if="loadError" class="error-banner mb-6 flex items-center justify-between gap-3 rounded-xl border border-accent-red/30 bg-accent-red/10 px-4 py-3">
      <span class="text-sm text-accent-red"><BaseIcon name="alert-circle" class="w-4 h-4 inline mr-1 align-middle" />{{ loadError }}</span>
      <button type="button" class="btn-secondary text-xs px-3 py-1.5" @click="reloadAll">Thử lại</button>
    </div>

    <div v-else-if="!selectedClassroomId" class="empty-state py-12 text-center text-text-muted text-xs bg-bg-secondary/20 border border-border-subtle border-dashed rounded-3xl">
      Vui lòng chọn một lớp học ở trên để xem phân tích chi tiết.
    </div>

    <div v-else class="space-y-8 animate-fade-in">
      
      <div class="analytics-grid grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="metric-card bg-accent/20 border border-accent/10 rounded-3xl p-6 flex flex-col items-center justify-center">
          <span class="metric-card__value text-4xl font-black text-accent drop-shadow-md">{{ analyticsData.totalStudents }}</span>
          <span class="metric-card__label text-xs font-bold text-text-muted mt-2 uppercase tracking-wider">Học viên tham gia</span>
        </div>
        <div class="metric-card bg-accent-green/20 border border-accent-green/10 rounded-3xl p-6 flex flex-col items-center justify-center">
          <!-- TC-017: backend trả completionRate 0-1 → UI nhân ×100 -->
          <span class="metric-card__value text-4xl font-black text-accent-green drop-shadow-md">{{ (analyticsData.completionRate * 100).toFixed(1) }}%</span>
          <span class="metric-card__label text-xs font-bold text-text-muted mt-2 uppercase tracking-wider">Tỷ lệ hoàn thành</span>
        </div>
        <div class="metric-card bg-accent-yellow/20 border border-accent-yellow/10 rounded-3xl p-6 flex flex-col items-center justify-center">
          <span class="metric-card__value text-4xl font-black text-accent-yellow drop-shadow-md">{{ analyticsData.avgScore.toFixed(1) }}</span>
          <span class="metric-card__label text-xs font-bold text-text-muted mt-2 uppercase tracking-wider">Điểm trung bình</span>
        </div>
        <div class="metric-card bg-accent-purple/20 border border-accent-purple/10 rounded-3xl p-6 flex flex-col items-center justify-center">
          <span class="metric-card__value text-4xl font-black text-accent-purple drop-shadow-md">{{ analyticsData.passRate.toFixed(1) }}%</span>
          <span class="metric-card__label text-xs font-bold text-text-muted mt-2 uppercase tracking-wider">Tỷ lệ đạt</span>
        </div>
      </div>

      
      <div class="quizzes-list-container p-6 bg-bg-secondary/40 border border-border-subtle rounded-3xl backdrop-blur-xl">
        <h3 class="text-sm font-bold text-text-primary mb-6 uppercase tracking-wider flex items-center justify-between">
          <span>Bảng điểm học viên (Quiz & Codelab)</span>
          <button @click="exportToExcel" :disabled="exporting" class="bg-accent hover:bg-accent text-white px-3 py-1.5 rounded-lg text-xs normal-case font-bold cursor-pointer transition-colors shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            <span v-if="exporting" class="spinner-sm inline-block"></span>
            <BaseIcon name="file-text" class="w-3.5 h-3.5" />
            {{ exporting ? 'Đang xuất...' : 'Xuất Excel' }}
          </button>
        </h3>
        <div class="table-responsive overflow-x-auto">
          <table class="quizzes-table w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-border-subtle text-text-muted text-xs uppercase tracking-wider">
                <th class="pb-4 font-semibold min-w-[150px]">Học viên</th>
                <th v-for="(title, id) in analyticsData.quizTitles" :key="id" class="pb-4 font-semibold text-center whitespace-nowrap min-w-[100px]" :title="title">
                  <span class="text-accent"><BaseIcon name="clipboard-list" class="w-3 h-3 inline mr-1 align-middle" />Quiz</span><br/>
                  <span class="text-[10px] text-text-muted truncate max-w-[100px] inline-block">{{ title }}</span>
                </th>
                <th v-for="(title, id) in analyticsData.codelabTitles" :key="id" class="pb-4 font-semibold text-center whitespace-nowrap min-w-[100px]" :title="title">
                  <span class="text-accent-green"><BaseIcon name="monitor" class="w-3 h-3 inline mr-1 align-middle" />Code</span><br/>
                  <span class="text-[10px] text-text-muted truncate max-w-[100px] inline-block">{{ title }}</span>
                </th>
                <th class="pb-4 font-semibold text-center text-accent-yellow min-w-[100px]">Tổng Điểm (XP)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in analyticsData.studentScores" :key="student.studentId" class="border-b border-border-subtle text-xs hover:bg-bg-hover transition-colors group">
                <td class="py-4 font-bold text-text-primary group-hover:text-text-primary transition-colors">{{ student.name }}</td>
                
                
                <td v-for="(title, quizId) in analyticsData.quizTitles" :key="'q-'+quizId" class="py-4 text-center font-mono text-accent font-bold">
                  {{ student.scoresPerQuiz[quizId] !== undefined ? student.scoresPerQuiz[quizId] : '-' }}
                </td>
                
                
                <td v-for="(title, codelabId) in analyticsData.codelabTitles" :key="'c-'+codelabId" class="py-4 text-center font-mono text-accent-green font-bold">
                  {{ student.scoresPerCodelab[codelabId] !== undefined ? student.scoresPerCodelab[codelabId] : '-' }}
                </td>
                
                <td class="py-4 text-center font-mono text-accent-yellow/80 font-black group-hover:text-accent-yellow text-sm">
                  {{ student.totalXP }}
                </td>
              </tr>
              <tr v-if="analyticsData.studentScores.length === 0">
                <td :colspan="1 + Object.keys(analyticsData.quizTitles).length + Object.keys(analyticsData.codelabTitles).length + 1" class="py-8 text-center text-text-muted">
                  Lớp học này chưa có học viên nào tham gia làm bài.
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
















import { ref, onMounted } from 'vue';
import { useTeacherApi } from './useTeacherApi';
import { useToastStore } from '../../composables/useToast';

interface ClassroomBasicInfo {
  id: string;
  name: string;
}

interface StudentScoreRow {
  studentId: string;
  name: string;
  scoresPerQuiz: Record<string, number>;
  scoresPerCodelab: Record<string, number>;
  totalXP: number;
}

interface AnalyticsData {
  totalStudents: number;
  avgScore: number;
  passRate: number;
  completionRate: number;
  quizTitles: Record<string, string>;
  codelabTitles: Record<string, string>;
  studentScores: StudentScoreRow[];
}

const { BASE_URL, teacherRequest } = useTeacherApi();
const toastStore = useToastStore();

const classroomsList = ref<ClassroomBasicInfo[]>([]);
const selectedClassroomId = ref<string>('');
const loadingAnalyticsData = ref(false);
// TC-020: lỗi fetch hiển thị banner — không rơi vào empty state giả.
const loadError = ref('');
// TC-032: trạng thái export Excel — disable + spinner + toast.
const exporting = ref(false);
const analyticsData = ref<AnalyticsData>({
  totalStudents: 0,
  avgScore: 0.0,
  passRate: 0.0,
  completionRate: 0.0,
  quizTitles: {},
  codelabTitles: {},
  studentScores: []
});

// TC-005: URL thiếu segment v1 → 404; sửa sang /api/v1/classrooms/...
async function loadClassrooms() {
  loadError.value = '';
  try {
    const res = await teacherRequest(`${BASE_URL}/api/v1/classrooms/mine`);
    if (!res.ok) throw new Error('Không thể tải danh sách lớp học.');
    classroomsList.value = await res.json();
  } catch (err) {
    loadError.value = err instanceof Error ? err.message : 'Lỗi khi tải danh sách lớp học.';
  }
}

async function loadClassroomAnalytics() {
  if (!selectedClassroomId.value) return;
  loadingAnalyticsData.value = true;
  loadError.value = '';
  try {
    const res = await teacherRequest(`${BASE_URL}/api/v1/classrooms/${selectedClassroomId.value}/statistics`);
    if (!res.ok) throw new Error('Không thể tải dữ liệu thống kê của lớp học.');
    analyticsData.value = await res.json();
  } catch (err) {
    loadError.value = err instanceof Error ? err.message : 'Lỗi khi tải thống kê lớp học.';
  }
  finally { loadingAnalyticsData.value = false; }
}

// TC-032: export có trạng thái loading + disable nút + toast lỗi.
async function exportToExcel() {
  if (!selectedClassroomId.value || exporting.value) return;
  exporting.value = true;
  try {
    const res = await teacherRequest(`${BASE_URL}/api/v1/classrooms/${selectedClassroomId.value}/export-excel`);
    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Classroom_Report_${selectedClassroomId.value.substring(0,6)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toastStore.success('Đã xuất báo cáo Excel.');
    } else {
      throw new Error('Không thể xuất báo cáo Excel.');
    }
  } catch (err) {
    toastStore.handleApiError(err, 'Lỗi khi xuất báo cáo.');
  } finally {
    exporting.value = false;
  }
}

function reloadAll(): void {
  loadClassrooms();
  if (selectedClassroomId.value) loadClassroomAnalytics();
}

onMounted(() => {
  loadClassrooms();
});
</script>
