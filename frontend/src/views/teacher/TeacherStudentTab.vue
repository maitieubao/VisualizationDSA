<template>
  <section class="students-manage-section">
    <div class="flex justify-between items-center mb-6 flex-wrap gap-3">
      <h2 class="section-heading m-0 text-text-primary">Quản lý & Theo dõi tiến trình học viên</h2>
      <div class="flex gap-2 w-full sm:w-auto">
        <input v-model="searchStudentQuery" @input="debouncedSearchStudents" class="form-input form-input--sm w-64" placeholder="Tìm theo email hoặc username..." />
      </div>
    </div>

    <!-- TC-020: banner lỗi tách khỏi empty state -->
    <div v-if="loadError" class="error-banner mb-6 flex items-center justify-between gap-3 rounded-xl border border-accent-red/30 bg-accent-red/10 px-4 py-3">
      <span class="text-sm text-accent-red"><BaseIcon name="alert-circle" class="w-4 h-4 inline mr-1 align-middle" />{{ loadError }}</span>
      <button type="button" class="btn-secondary text-xs px-3 py-1.5" @click="loadStudents">Thử lại</button>
    </div>

    <div class="quizzes-list-container">
      <div v-if="loadingStudents" class="loading-state">
        <div class="spinner"></div>
        <span>Đang tải danh sách học viên...</span>
      </div>
      <!-- TC-044: phân biệt empty state "chưa gõ gì / rỗng thật" vs "search không có kết quả" -->
      <div v-else-if="studentsList.length === 0" class="empty-state">
        {{ searchStudentQuery.trim() ? 'Không tìm thấy học viên nào phù hợp với từ khóa tìm kiếm.' : 'Chưa có học viên nào trong hệ thống.' }}
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
              <td class="font-bold text-text-primary">
                <div class="flex flex-col">
                  <span>{{ student.username }}</span>
                  <span class="text-xs text-text-muted font-normal">{{ student.email }}</span>
                </div>
              </td>
              <td class="font-bold text-accent">Cấp {{ student.currentLevel ?? 1 }}</td>
              <td class="font-mono text-accent-yellow font-bold">+{{ student.totalXP ?? 0 }} XP</td>
              <td class="font-mono text-accent-purple">{{ student.streakDays ?? 0 }} ngày <BaseIcon name="fire" class="w-3 h-3 inline align-middle" /></td>
              <td class="text-text-muted text-xs">{{ formatDate(student.createdAt) }}</td>
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

        
        <div class="flex justify-between items-center mt-6">
          <span class="text-xs text-text-muted">Hiển thị {{ studentsList.length }} học viên (Tổng số: {{ totalStudents }})</span>
          <div class="flex gap-2">
            <button :disabled="studentsPage === 1" @click="changeStudentsPage(-1)" class="btn-cancel px-3 py-1.5 text-xs disabled:opacity-50 cursor-pointer">Trước</button>
            <span class="text-xs font-mono text-text-primary flex items-center px-2">Trang {{ studentsPage }} / {{ totalStudentsPages }}</span>
            <button :disabled="studentsPage >= totalStudentsPages" @click="changeStudentsPage(1)" class="btn-cancel px-3 py-1.5 text-xs disabled:opacity-50 cursor-pointer">Sau</button>
          </div>
        </div>
      </div>
    </div>

    
    <div v-if="selectedStudentForProgress" class="fixed inset-0 bg-bg-secondary backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div class="bg-bg-secondary border border-border-subtle rounded-3xl p-6 max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        <div class="flex justify-between items-start border-b border-border-subtle pb-4 mb-4">
          <div>
            <h3 class="text-xl font-black text-text-primary">Chi tiết tiến trình: {{ selectedStudentForProgress.username }}</h3>
            <p class="text-xs text-text-muted mt-1">Email: {{ selectedStudentForProgress.email }} &middot; Cấp độ: {{ selectedStudentForProgress.currentLevel }} &middot; XP: {{ selectedStudentForProgress.totalXP }} XP</p>
          </div>
          <button @click="selectedStudentForProgress = null" class="text-text-muted hover:text-text-primary text-2xl font-bold p-1 cursor-pointer">&times;</button>
        </div>

        <div class="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 pr-2">
          
          <div class="flex flex-col gap-4">
            <h4 class="text-sm font-bold uppercase tracking-wider text-accent flex items-center gap-1.5 mb-2">
              <BaseIcon name="learning-path" class="w-4 h-4 text-accent" /> Tiến độ khóa học
            </h4>
            <div v-if="loadingStudentCourseProgress" class="text-center py-6 text-text-muted text-xs">Đang tải tiến độ học tập...</div>
            <div v-else-if="studentCourseProgress.length === 0" class="text-center py-6 text-text-muted text-xs">Học viên chưa tham gia khóa học nào.</div>
            <div v-else class="space-y-4">
              <div v-for="course in studentCourseProgress" :key="course.id" class="p-4 rounded-xl border border-border-subtle bg-bg-secondary/40 flex flex-col gap-2">
                <div class="flex justify-between items-center">
                  <span class="text-sm font-bold text-text-primary">{{ course.title }}</span>
                  <span class="text-xs font-mono font-bold text-accent">{{ course.progressPercent }}%</span>
                </div>
                <div class="w-full h-2 bg-bg-surface rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-accent to-accent-purple" :style="{ width: course.progressPercent + '%' }"></div>
                </div>
                <div class="text-[10px] text-text-muted flex justify-between">
                  <span>Độ khó: {{ course.difficulty }}</span>
                  <span>Đã học: {{ course.completedLessons }} / {{ course.totalLessons }} bài giảng</span>
                </div>
              </div>
            </div>
          </div>

          
          <div class="flex flex-col gap-4">
            <h4 class="text-sm font-bold uppercase tracking-wider text-accent-purple flex items-center gap-1.5 mb-2">
              <BaseIcon name="quiz" class="w-4 h-4 text-accent-purple" /> Lịch sử làm bài trắc nghiệm
            </h4>
            <div v-if="loadingStudentQuizHistory" class="text-center py-6 text-text-muted text-xs">Đang tải lịch sử thi trắc nghiệm...</div>
            <div v-else-if="studentQuizHistory.length === 0" class="text-center py-6 text-text-muted text-xs">Học viên chưa thực hiện bài trắc nghiệm nào.</div>
            <div v-else class="space-y-2">
              <div v-for="attempt in studentQuizHistory" :key="attempt.id" class="p-3.5 rounded-xl border border-border-subtle bg-bg-secondary/40 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span class="font-bold text-text-primary block">{{ attempt.quizTitle }}</span>
                  <span class="text-[10px] text-text-muted">{{ formatAttemptDate(attempt.attemptedAt) }}</span>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <span class="font-mono font-bold text-accent">{{ attempt.score }} / {{ attempt.maxScore }}</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold" :class="attempt.passed ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'">
                    {{ attempt.passed ? 'ĐẠT' : 'HỎNG' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-border-subtle pt-4 mt-4 flex justify-end">
          <button @click="selectedStudentForProgress = null" class="btn-cancel px-5 py-2 text-xs font-bold rounded-xl cursor-pointer">Đóng cửa sổ</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTeacherApi } from './useTeacherApi';

const { BASE_URL, teacherRequest, formatDate, formatAttemptDate } = useTeacherApi();

const studentsList = ref<any[]>([]);
const loadingStudents = ref(false);
const loadError = ref('');
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
  loadError.value = '';
  try {
    const res = await teacherRequest(`${BASE_URL}/api/v1/concepts/admin/users?page=${studentsPage.value}&pageSize=${studentsPageSize}&search=${encodeURIComponent(searchStudentQuery.value)}`);
    if (!res.ok) throw new Error('Không thể tải danh sách học viên.');
    const data = await res.json(); studentsList.value = data.users || []; totalStudents.value = data.total || 0;
  } catch (err) {
    loadError.value = err instanceof Error ? err.message : 'Lỗi khi tải học viên.';
  }
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
    const res = await teacherRequest(`${BASE_URL}/api/v1/concepts/courses?userId=${student.id}`);
    if (res.ok) studentCourseProgress.value = await res.json();
  } catch (err) { console.error(err); } finally { loadingStudentCourseProgress.value = false; }
  try {
    const res = await teacherRequest(`${BASE_URL}/api/v1/concepts/quiz/history?userId=${student.id}`);
    if (res.ok) studentQuizHistory.value = await res.json();
  } catch (err) { console.error(err); } finally { loadingStudentQuizHistory.value = false; }
}

loadStudents();
</script>
