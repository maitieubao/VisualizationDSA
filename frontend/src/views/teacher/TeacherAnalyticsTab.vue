<template>
  <section class="analytics-manage-section animate-fade-in mt-6">
    <div class="flex justify-between items-center mb-6 flex-wrap gap-3">
      <h2 class="section-heading m-0 text-white">Thống kê & Phân tích chi tiết lớp học</h2>
      <div class="flex items-center gap-2">
        <label class="text-xs font-bold text-slate-400 uppercase">Chọn lớp học:</label>
        <select v-model="selectedClassroomId" @change="loadClassroomAnalytics" class="form-select bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 w-64">
          <option value="" disabled>-- Chọn lớp học --</option>
          <option v-for="c in classroomsList" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>
    </div>

    <div v-if="loadingAnalyticsData" class="loading-state py-12 flex flex-col items-center justify-center gap-3">
      <div class="spinner inline-block w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      <span class="text-slate-400 text-xs">Đang tải số liệu thống kê...</span>
    </div>

    <div v-else-if="!selectedClassroomId" class="empty-state py-12 text-center text-slate-500 text-xs bg-slate-900/20 border border-white/5 border-dashed rounded-3xl">
      Vui lòng chọn một lớp học ở trên để xem phân tích chi tiết.
    </div>

    <div v-else class="space-y-8 animate-fade-in">
      
      <div class="analytics-grid grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="metric-card bg-indigo-950/20 border border-indigo-500/10 rounded-3xl p-6 flex flex-col items-center justify-center">
          <span class="metric-card__value text-4xl font-black text-indigo-400 drop-shadow-md">{{ analyticsData.totalStudents }}</span>
          <span class="metric-card__label text-xs font-bold text-slate-400 mt-2 uppercase tracking-wider">Học viên tham gia</span>
        </div>
        <div class="metric-card bg-emerald-950/20 border border-emerald-500/10 rounded-3xl p-6 flex flex-col items-center justify-center">
          <span class="metric-card__value text-4xl font-black text-emerald-400 drop-shadow-md">{{ analyticsData.completionRate.toFixed(1) }}%</span>
          <span class="metric-card__label text-xs font-bold text-slate-400 mt-2 uppercase tracking-wider">Tỷ lệ hoàn thành</span>
        </div>
        <div class="metric-card bg-amber-950/20 border border-amber-500/10 rounded-3xl p-6 flex flex-col items-center justify-center">
          <span class="metric-card__value text-4xl font-black text-amber-400 drop-shadow-md">{{ analyticsData.avgScore.toFixed(1) }}</span>
          <span class="metric-card__label text-xs font-bold text-slate-400 mt-2 uppercase tracking-wider">Điểm trung bình</span>
        </div>
        <div class="metric-card bg-purple-950/20 border border-purple-500/10 rounded-3xl p-6 flex flex-col items-center justify-center">
          <span class="metric-card__value text-4xl font-black text-purple-400 drop-shadow-md">{{ analyticsData.passRate.toFixed(1) }}%</span>
          <span class="metric-card__label text-xs font-bold text-slate-400 mt-2 uppercase tracking-wider">Tỷ lệ đạt</span>
        </div>
      </div>

      
      <div class="quizzes-list-container p-6 bg-slate-900/40 border border-white/5 rounded-3xl backdrop-blur-xl">
        <h3 class="text-sm font-bold text-white mb-6 uppercase tracking-wider flex items-center justify-between">
          <span>Bảng điểm học viên (Quiz & Codelab)</span>
          <button @click="exportToExcel" class="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs normal-case font-bold cursor-pointer transition-colors shadow-lg shadow-indigo-500/20">
            Xuất Excel
          </button>
        </h3>
        <div class="table-responsive overflow-x-auto">
          <table class="quizzes-table w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-white/10 text-slate-400 text-xs uppercase tracking-wider">
                <th class="pb-4 font-semibold min-w-[150px]">Học viên</th>
                <th v-for="(title, id) in analyticsData.quizTitles" :key="id" class="pb-4 font-semibold text-center whitespace-nowrap min-w-[100px]" :title="title">
                  <span class="text-indigo-400">📝 Quiz</span><br/>
                  <span class="text-[10px] text-slate-500 truncate max-w-[100px] inline-block">{{ title }}</span>
                </th>
                <th v-for="(title, id) in analyticsData.codelabTitles" :key="id" class="pb-4 font-semibold text-center whitespace-nowrap min-w-[100px]" :title="title">
                  <span class="text-emerald-400">💻 Code</span><br/>
                  <span class="text-[10px] text-slate-500 truncate max-w-[100px] inline-block">{{ title }}</span>
                </th>
                <th class="pb-4 font-semibold text-center text-amber-400 min-w-[100px]">Tổng Điểm (XP)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in analyticsData.studentScores" :key="student.studentId" class="border-b border-white/5 text-xs hover:bg-white/[0.02] transition-colors group">
                <td class="py-4 font-bold text-slate-200 group-hover:text-white transition-colors">{{ student.name }}</td>
                
                
                <td v-for="(title, quizId) in analyticsData.quizTitles" :key="'q-'+quizId" class="py-4 text-center font-mono text-indigo-300 font-bold">
                  {{ student.scoresPerQuiz[quizId] !== undefined ? student.scoresPerQuiz[quizId] : '-' }}
                </td>
                
                
                <td v-for="(title, codelabId) in analyticsData.codelabTitles" :key="'c-'+codelabId" class="py-4 text-center font-mono text-emerald-300 font-bold">
                  {{ student.scoresPerCodelab[codelabId] !== undefined ? student.scoresPerCodelab[codelabId] : '-' }}
                </td>
                
                <td class="py-4 text-center font-mono text-amber-400/80 font-black group-hover:text-amber-400 text-sm">
                  {{ student.totalXP }}
                </td>
              </tr>
              <tr v-if="analyticsData.studentScores.length === 0">
                <td :colspan="1 + Object.keys(analyticsData.quizTitles).length + Object.keys(analyticsData.codelabTitles).length + 1" class="py-8 text-center text-slate-500">
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

const { BASE_URL, getAuthHeaders } = useTeacherApi();

const classroomsList = ref<ClassroomBasicInfo[]>([]);
const selectedClassroomId = ref<string>('');
const loadingAnalyticsData = ref(false);
const analyticsData = ref<AnalyticsData>({
  totalStudents: 0,
  avgScore: 0.0,
  passRate: 0.0,
  completionRate: 0.0,
  quizTitles: {},
  codelabTitles: {},
  studentScores: []
});

async function loadClassrooms() {
  try {
    const res = await fetch(`${BASE_URL}/api/Classroom/mine`, { headers: getAuthHeaders() });
    if (res.ok) classroomsList.value = await res.json();
  } catch (err) { console.error('Failed to load classrooms:', err); }
}

async function loadClassroomAnalytics() {
  if (!selectedClassroomId.value) return;
  loadingAnalyticsData.value = true;
  try {
    const res = await fetch(`${BASE_URL}/api/Classroom/${selectedClassroomId.value}/statistics`, { headers: getAuthHeaders() });
    if (res.ok) analyticsData.value = await res.json();
    else alert('Không thể tải dữ liệu thống kê của lớp học.');
  } catch (err) { console.error('Failed to load course analytics:', err); }
  finally { loadingAnalyticsData.value = false; }
}

async function exportToExcel() {
  if (!selectedClassroomId.value) return;
  try {
    const res = await fetch(`${BASE_URL}/api/Classroom/${selectedClassroomId.value}/export-excel`, { headers: getAuthHeaders() });
    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Classroom_Report_${selectedClassroomId.value.substring(0,6)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      alert('Không thể xuất báo cáo Excel.');
    }
  } catch (err) {
    console.error('Lỗi khi xuất báo cáo:', err);
  }
}

onMounted(() => {
  loadClassrooms();
});
</script>
