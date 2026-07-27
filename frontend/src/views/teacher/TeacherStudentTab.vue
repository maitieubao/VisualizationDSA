<template>
  <section class="students-manage-section">
    <div class="flex justify-between items-center mb-6 flex-wrap gap-3">
      <h2 class="section-heading m-0 text-white">Quản lý & Theo dõi tiến trình học viên</h2>
      <div class="flex gap-2 w-full sm:w-auto">
        <input v-model="searchStudentQuery" @input="debouncedSearchStudents" class="form-input form-input--sm w-64" placeholder="Tìm theo email hoặc username..." />
      </div>
    </div>

    <div class="quizzes-list-container">
      <div v-if="loadingStudents" class="loading-state">
        <div class="spinner"></div>
        <span>Đang tải danh sách học viên...</span>
      </div>
      <div v-else-if="studentsList.length === 0" class="empty-state">
        Không tìm thấy học viên nào phù hợp với từ khóa tìm kiếm.
      </div>
      <div v-else class="table-responsive">
        <table class="quizzes-table">
          <thead>
            <tr>
              <th>Học viên</th>
              <th>Cấp độ</th>
              <th>Tích lũy XP</th>
              <th>Streak hiện tại</th>
              <th>Ngày tham gia</th>
              <th class="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in studentsList" :key="student.id">
              <td class="font-bold text-white">
                <div class="flex flex-col">
                  <span>{{ student.username }}</span>
                  <span class="text-xs text-slate-400 font-normal">{{ student.email }}</span>
                </div>
              </td>
              <td class="font-bold text-indigo-300">Cấp {{ student.currentLevel ?? 1 }}</td>
              <td class="font-mono text-amber-400 font-bold">+{{ student.totalXP ?? 0 }} XP</td>
              <td class="font-mono text-purple-400">{{ student.streakDays ?? 0 }} ngày 🔥</td>
              <td class="text-slate-400 text-xs">{{ formatDate(student.createdAt) }}</td>
              <td>
                <div class="flex justify-center">
                  <button type="button" class="btn-action btn-action--edit" @click="viewStudentProgress(student)">
                    <BaseIcon name="eye" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> Xem chi tiết
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="flex justify-between items-center mt-6">
          <span class="text-xs text-slate-400">Hiển thị {{ studentsList.length }} học viên (Tổng số: {{ totalStudents }})</span>
          <div class="flex gap-2">
            <button :disabled="studentsPage === 1" @click="changeStudentsPage(-1)" class="btn-cancel px-3 py-1.5 text-xs disabled:opacity-50 cursor-pointer">Trước</button>
            <span class="text-xs font-mono text-white flex items-center px-2">Trang {{ studentsPage }} / {{ totalStudentsPages }}</span>
            <button :disabled="studentsPage >= totalStudentsPages" @click="changeStudentsPage(1)" class="btn-cancel px-3 py-1.5 text-xs disabled:opacity-50 cursor-pointer">Sau</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Student Progress Detail Modal -->
    <div v-if="selectedStudentForProgress" class="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div class="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        <div class="flex justify-between items-start border-b border-white/10 pb-4 mb-4">
          <div>
            <h3 class="text-xl font-black text-white">Chi tiết tiến trình: {{ selectedStudentForProgress.username }}</h3>
            <p class="text-xs text-slate-400 mt-1">Email: {{ selectedStudentForProgress.email }} &middot; Cấp độ: {{ selectedStudentForProgress.currentLevel }} &middot; XP: {{ selectedStudentForProgress.totalXP }} XP</p>
          </div>
          <button @click="selectedStudentForProgress = null" class="text-slate-400 hover:text-white text-2xl font-bold p-1 cursor-pointer">&times;</button>
        </div>

        <div class="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 pr-2">
          <!-- Left Column: Course Progress -->
          <div class="flex flex-col gap-4">
            <h4 class="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 mb-2">
              <BaseIcon name="learning-path" class="w-4 h-4 text-indigo-400" /> Tiến độ khóa học
            </h4>
            <div v-if="loadingStudentCourseProgress" class="text-center py-6 text-slate-500 text-xs">Đang tải tiến độ học tập...</div>
            <div v-else-if="studentCourseProgress.length === 0" class="text-center py-6 text-slate-500 text-xs">Học viên chưa tham gia khóa học nào.</div>
            <div v-else class="space-y-4">
              <div v-for="course in studentCourseProgress" :key="course.id" class="p-4 rounded-xl border border-white/5 bg-slate-950/40 flex flex-col gap-2">
                <div class="flex justify-between items-center">
                  <span class="text-sm font-bold text-white">{{ course.title }}</span>
                  <span class="text-xs font-mono font-bold text-indigo-300">{{ course.progressPercent }}%</span>
                </div>
                <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500" :style="{ width: course.progressPercent + '%' }"></div>
                </div>
                <div class="text-[10px] text-slate-500 flex justify-between">
                  <span>Độ khó: {{ course.difficulty }}</span>
                  <span>Đã học: {{ course.completedLessons }} / {{ course.totalLessons }} bài giảng</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Quiz Attempts History -->
          <div class="flex flex-col gap-4">
            <h4 class="text-sm font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 mb-2">
              <BaseIcon name="quiz" class="w-4 h-4 text-purple-400" /> Lịch sử làm bài trắc nghiệm
            </h4>
            <div v-if="loadingStudentQuizHistory" class="text-center py-6 text-slate-500 text-xs">Đang tải lịch sử thi trắc nghiệm...</div>
            <div v-else-if="studentQuizHistory.length === 0" class="text-center py-6 text-slate-500 text-xs">Học viên chưa thực hiện bài trắc nghiệm nào.</div>
            <div v-else class="space-y-2">
              <div v-for="attempt in studentQuizHistory" :key="attempt.id" class="p-3.5 rounded-xl border border-white/5 bg-slate-950/40 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span class="font-bold text-white block">{{ attempt.quizTitle }}</span>
                  <span class="text-[10px] text-slate-500">{{ formatAttemptDate(attempt.attemptedAt) }}</span>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <span class="font-mono font-bold text-indigo-300">{{ attempt.score }} / {{ attempt.maxScore }}</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold" :class="attempt.passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'">
                    {{ attempt.passed ? 'ĐẠT' : 'HỎNG' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-white/10 pt-4 mt-4 flex justify-end">
          <button @click="selectedStudentForProgress = null" class="btn-cancel px-5 py-2 text-xs font-bold rounded-xl cursor-pointer">Đóng cửa sổ</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTeacherApi } from './useTeacherApi';

const { BASE_URL, getAuthHeaders, formatDate, formatAttemptDate } = useTeacherApi();

const studentsList = ref<any[]>([]);
const loadingStudents = ref(false);
const searchStudentQuery = ref('');
const studentsPage = ref(1);
const totalStudents = ref(0);
const studentsPageSize = 10;
const totalStudentsPages = computed(() => Math.ceil(totalStudents.value / studentsPageSize) || 1);

const selectedStudentForProgress = ref<any | null>(null);
const studentCourseProgress = ref<any[]>([]);
const loadingStudentCourseProgress = ref(false);
const studentQuizHistory = ref<any[]>([]);
const loadingStudentQuizHistory = ref(false);

async function loadStudents(): Promise<void> {
  loadingStudents.value = true;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/admin/users?page=${studentsPage.value}&pageSize=${studentsPageSize}&search=${encodeURIComponent(searchStudentQuery.value)}`, { headers: getAuthHeaders() });
    if (res.ok) { const data = await res.json(); studentsList.value = data.users || []; totalStudents.value = data.total || 0; }
  } catch (err) { console.error('Failed to load students:', err); }
  finally { loadingStudents.value = false; }
}

function changeStudentsPage(delta: number): void {
  const newPage = studentsPage.value + delta;
  if (newPage >= 1 && newPage <= totalStudentsPages.value) { studentsPage.value = newPage; loadStudents(); }
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null;
function debouncedSearchStudents(): void {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => { studentsPage.value = 1; loadStudents(); }, 400);
}

async function viewStudentProgress(student: any): Promise<void> {
  selectedStudentForProgress.value = student;
  loadingStudentCourseProgress.value = true;
  loadingStudentQuizHistory.value = true;
  studentCourseProgress.value = [];
  studentQuizHistory.value = [];
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/courses?userId=${student.id}`, { headers: getAuthHeaders() });
    if (res.ok) studentCourseProgress.value = await res.json();
  } catch (err) { console.error(err); } finally { loadingStudentCourseProgress.value = false; }
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/quiz/history?userId=${student.id}`, { headers: getAuthHeaders() });
    if (res.ok) studentQuizHistory.value = await res.json();
  } catch (err) { console.error(err); } finally { loadingStudentQuizHistory.value = false; }
}

loadStudents();
</script>
