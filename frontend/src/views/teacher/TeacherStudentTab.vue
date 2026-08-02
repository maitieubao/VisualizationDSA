<template>
  <section class="students-manage-section">
    <div class="flex justify-between items-center mb-6 flex-wrap gap-3">
      <h2 class="section-heading m-0 text-text-primary">Quản lý & Theo dõi tiến trình học viên</h2>
      <div class="flex gap-2 w-full sm:w-auto">
        <input v-model="searchStudentQuery" @input="debouncedSearchStudents" class="form-input form-input--sm w-64" placeholder="Tìm theo email hoặc username..." />
      </div>
    </div>

    <div class="quizzes-list-container !bg-transparent !border-none !p-0 !shadow-none mt-8">
      <div v-if="loadingStudents" class="loading-state">
        <div class="spinner"></div>
        <span>Đang tải danh sách học viên...</span>
      </div>
      <div v-else-if="studentsList.length === 0" class="empty-state">
        <BaseIcon name="collection" class="w-16 h-16 text-text-muted mb-2" />
        <h3 class="text-text-primary text-xl font-bold">Không tìm thấy học viên</h3>
        <p class="text-text-secondary">Không tìm thấy học viên nào phù hợp với từ khóa tìm kiếm.</p>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="student in studentsList" :key="student.id" class="course-card flex flex-col p-5 hover:border-border-accent/50 transition-colors">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-xl uppercase border border-border-accent flex-shrink-0">
              {{ student.username.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="text-text-primary font-bold truncate group-hover:text-accent transition-colors">{{ student.username }}</h4>
              <p class="text-xs text-text-secondary truncate">{{ student.email }}</p>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="bg-black/30 rounded-lg p-2 text-center border border-border-default">
              <span class="block text-[10px] text-text-secondary uppercase font-bold mb-1">Cấp độ</span>
              <span class="block text-sm font-bold text-accent">Cấp {{ student.currentLevel ?? 1 }}</span>
            </div>
            <div class="bg-black/30 rounded-lg p-2 text-center border border-border-default">
              <span class="block text-[10px] text-text-secondary uppercase font-bold mb-1">Tổng XP</span>
              <span class="block text-sm font-bold font-mono text-accent-warm">{{ student.totalXP ?? 0 }}</span>
            </div>
          </div>
          
          <div class="flex justify-between items-center mt-auto pt-4 border-t border-border-default">
            <span class="font-mono text-accent-purple font-bold text-xs">{{ student.streakDays ?? 0 }} ngày 🔥</span>
            <button type="button" class="btn-action btn-action--edit flex items-center justify-center gap-1 text-xs px-3 py-1.5" @click="viewStudentProgress(student)">
              <BaseIcon name="eye" class="w-3.5 h-3.5" /> Chi tiết
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="studentsList.length > 0" class="flex justify-between items-center mt-6 p-4 bg-bg-secondary/50 rounded-2xl border border-border-default">
        <span class="text-sm text-text-secondary">Hiển thị <strong class="text-text-primary">{{ studentsList.length }}</strong> học viên (Tổng số: <strong class="text-text-primary">{{ totalStudents }}</strong>)</span>
        <div class="flex gap-2 bg-black/40 rounded-lg p-1 border border-border-default">
          <button :disabled="studentsPage === 1" @click="changeStudentsPage(-1)" class="btn-cancel !bg-transparent !border-none !px-3 !py-1.5 text-xs disabled:opacity-50 hover:bg-bg-surface rounded-md transition-colors">Trước</button>
          <span class="text-xs font-bold text-text-primary flex items-center px-3 bg-accent/20 rounded-md border border-border-accent">Trang {{ studentsPage }} / {{ totalStudentsPages }}</span>
          <button :disabled="studentsPage >= totalStudentsPages" @click="changeStudentsPage(1)" class="btn-cancel !bg-transparent !border-none !px-3 !py-1.5 text-xs disabled:opacity-50 hover:bg-bg-surface rounded-md transition-colors">Sau</button>
        </div>
      </div>
    </div>

    
    <div v-if="selectedStudentForProgress" class="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div class="bg-bg-secondary border border-border-default rounded-3xl p-6 max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        <div class="flex justify-between items-start border-b border-border-default pb-4 mb-4">
          <div>
            <h3 class="text-xl font-black text-text-primary">Chi tiết tiến trình: {{ selectedStudentForProgress.username }}</h3>
            <p class="text-xs text-text-secondary mt-1">Email: {{ selectedStudentForProgress.email }} &middot; Cấp độ: {{ selectedStudentForProgress.currentLevel }} &middot; XP: {{ selectedStudentForProgress.totalXP }} XP</p>
          </div>
          <button @click="selectedStudentForProgress = null" class="text-text-secondary hover:text-text-primary text-2xl font-bold p-1 cursor-pointer">&times;</button>
        </div>

        <div class="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 pr-2">
          
          <div class="flex flex-col gap-4">
            <h4 class="text-sm font-bold uppercase tracking-wider text-accent flex items-center gap-1.5 mb-2">
              <BaseIcon name="learning-path" class="w-4 h-4 text-accent" /> Tiến độ khóa học
            </h4>
            <div v-if="loadingStudentCourseProgress" class="text-center py-6 text-text-muted text-xs">Đang tải tiến độ học tập...</div>
            <div v-else-if="studentCourseProgress.length === 0" class="text-center py-6 text-text-muted text-xs">Học viên chưa tham gia khóa học nào.</div>
            <div v-else class="space-y-4">
              <div v-for="course in studentCourseProgress" :key="course.id" class="p-4 rounded-xl border border-border-default bg-bg-primary/40 flex flex-col gap-2">
                <div class="flex justify-between items-center">
                  <span class="text-sm font-bold text-text-primary">{{ course.title }}</span>
                  <span class="text-xs font-mono font-bold text-accent">{{ course.progressPercent }}%</span>
                </div>
                <div class="w-full h-2 bg-bg-hover rounded-full overflow-hidden">
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
              <div v-for="attempt in studentQuizHistory" :key="attempt.id" class="p-3.5 rounded-xl border border-border-default bg-bg-primary/40 flex items-center justify-between gap-3 text-xs">
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

        <div class="border-t border-border-default pt-4 mt-4 flex justify-end">
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
