<template>
  <section class="course-manage-section">
    <div class="flex justify-between items-center mb-6 flex-wrap gap-3">
      <h2 class="section-heading m-0">Quản lý khóa học & bài giảng</h2>
      <button type="button" class="btn-toggle-form" :class="{ 'btn-toggle-form--active': activeCourseForm !== 'none' }" @click="toggleCourseForm()">
        <span v-if="activeCourseForm !== 'none'"><BaseIcon name="close" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> Đóng Form</span>
        <span v-else><BaseIcon name="plus" class="w-3.5 h-3.5 inline mr-1 align-text-bottom" /> Tạo khóa học mới</span>
      </button>
    </div>

    
    <form v-if="activeCourseForm !== 'none'" class="quiz-form mb-8 animate-fade-in" @submit.prevent="submitCourse">
      <h3 class="form-title-context">
        <span v-if="activeCourseForm === 'edit'"><BaseIcon name="edit" class="w-4 h-4 text-accent inline mr-1 align-middle" /> Chỉnh sửa khóa học</span>
        <span v-else><BaseIcon name="plus" class="w-4 h-4 text-accent inline mr-1 align-middle" /> Tạo khóa học mới</span>
      </h3>
      <div class="form-row">
        <label class="form-label">Tiêu đề khóa học</label>
        <input v-model="courseForm.title" class="form-input" placeholder="VD: Thuật toán Sắp xếp Cơ bản" required />
      </div>
      <div class="form-row">
        <label class="form-label">Mô tả ngắn</label>
        <textarea v-model="courseForm.description" class="form-input h-24 py-2" placeholder="Nhập mô tả chi tiết khóa học..." required></textarea>
      </div>
      <div class="form-row form-row--inline">
        <div>
          <label class="form-label">Danh mục</label>
          <select v-model="courseForm.category" class="form-select">
            <option value="DataStructure">Cấu trúc dữ liệu</option>
            <option value="Algorithm">Thuật toán</option>
            <option value="Sorting">Sắp xếp (Sorting)</option>
            <option value="Graph">Đồ thị (Graph)</option>
            <option value="OOP">Hướng đối tượng (OOP)</option>
            <option value="SOLID">Nguyên lý SOLID</option>
            <option value="Patterns">Mẫu thiết kế (Patterns)</option>
            <option value="SystemDesign">Thiết kế hệ thống</option>
            <option value="Other">Khác</option>
          </select>
        </div>
        <div>
          <label class="form-label">Độ khó</label>
          <select v-model="courseForm.difficulty" class="form-select">
            <option value="Beginner">Dễ</option>
            <option value="Intermediate">Trung bình</option>
            <option value="Advanced">Khó</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <label class="form-label">Ảnh bìa khóa học</label>
        <div class="flex items-center gap-4">
          <input type="file" accept="image/*" @change="uploadCoverImage" class="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent/20 file:text-accent hover:file:bg-accent/30 text-text-secondary text-sm" />
          <span v-if="uploadingImage" class="text-xs text-accent animate-pulse">Đang tải...</span>
        </div>
        <div v-if="courseForm.coverImageUrl" class="mt-3">
          <img :src="courseForm.coverImageUrl.startsWith('http') ? courseForm.coverImageUrl : `${BASE_URL}${courseForm.coverImageUrl}`" alt="Cover Preview" class="w-48 h-28 object-cover rounded-xl border border-border-default shadow-lg" />
        </div>
      </div>
      <div class="form-row flex items-center gap-6 mt-4">
        <label class="flex items-center gap-2 cursor-pointer text-text-secondary text-sm">
          <input type="checkbox" v-model="courseForm.isPremium" /> Yêu cầu tài khoản Premium
        </label>
        <label class="flex items-center gap-2 cursor-pointer text-text-secondary text-sm">
          <input type="checkbox" v-model="courseForm.isPublished" /> Xuất bản khóa học ngay
        </label>
      </div>
      <div class="form-actions flex justify-center gap-3 mt-6">
        <button type="submit" class="btn-submit" :disabled="submitting">
          {{ submitting ? 'Đang gửi...' : activeCourseForm === 'edit' ? 'Cập nhật khóa học' : 'Tạo khóa học' }}
        </button>
        <button type="button" class="btn-cancel" @click="cancelCourseEdit">Hủy</button>
      </div>
    </form>

    
    <form v-if="activeLessonForm !== 'none'" class="quiz-form mb-8 animate-fade-in" @submit.prevent="submitLesson">
      <h3 class="form-title-context">
        <span v-if="activeLessonForm === 'edit'"><BaseIcon name="edit" class="w-4 h-4 text-accent inline mr-1 align-middle" /> Chỉnh sửa bài giảng</span>
        <span v-else><BaseIcon name="plus" class="w-4 h-4 text-accent inline mr-1 align-middle" /> Thêm bài giảng vào khóa: {{ activeCourseForLesson?.title }}</span>
      </h3>
      <div class="form-row">
        <label class="form-label">Tiêu đề bài giảng</label>
        <input v-model="lessonForm.title" class="form-input" placeholder="VD: Sắp xếp Nổi bọt (Bubble Sort)" required />
      </div>
      <div class="form-row">
        <label class="form-label">Nội dung bài giảng (Markdown)</label>
        <textarea v-model="lessonForm.contentMd" class="form-input h-48 py-2 font-mono text-sm leading-relaxed" placeholder="# Tiêu đề lớn&#10;- Ý chính 1&#10;- Ý chính 2&#10;**Chữ in đậm**" required></textarea>
      </div>
      <div class="form-row form-row--inline">
        <div>
          <label class="form-label">Không gian tương tác (Sandbox)</label>
          <select v-model="lessonForm.sandboxType" class="form-select">
            <option value="">Không có sandbox</option>
            <option value="sorting">Sắp xếp (Sorting)</option>
            <option value="graph">Đồ thị (Graph)</option>
            <option value="oop">Hướng đối tượng (OOP)</option>
            <option value="solid">Nguyên lý SOLID</option>
            <option value="patterns">Mẫu thiết kế (Patterns)</option>
            <option value="system">Thiết kế hệ thống (System)</option>
          </select>
        </div>
        <div>
          <label class="form-label">Bài trắc nghiệm liên kết (Không bắt buộc)</label>
          <select v-model="lessonForm.quizId" class="form-select">
            <option :value="null">Không liên kết quiz</option>
            <option v-for="q in quizzesList" :key="q.id" :value="q.id">{{ q.title }}</option>
          </select>
        </div>
      </div>
      <div class="form-row form-row--inline">
        <div>
          <label class="form-label">XP Thưởng hoàn thành</label>
          <input type="number" v-model.number="lessonForm.xpReward" class="form-input" min="10" max="200" required />
        </div>
        <div>
          <label class="form-label">Thứ tự bài giảng (Index)</label>
          <input type="number" v-model.number="lessonForm.orderIndex" class="form-input" min="1" required />
        </div>
      </div>
      <div class="form-actions flex justify-center gap-3 mt-6">
        <button type="submit" class="btn-submit" :disabled="submitting">
          {{ submitting ? 'Đang gửi...' : activeLessonForm === 'edit' ? 'Cập nhật bài giảng' : 'Tạo bài giảng' }}
        </button>
        <button type="button" class="btn-cancel" @click="cancelLessonEdit">Hủy</button>
      </div>
    </form>

    
    <div class="quizzes-list-container !bg-transparent !border-none !p-0 !shadow-none mt-8">
      <h3 class="subsection-heading mb-4 text-text-primary font-bold text-lg">Danh sách khóa học hiện có</h3>
      <div v-if="loadingCourses" class="loading-state">
        <div class="spinner"></div>
        <span>Đang tải danh sách khóa học...</span>
      </div>
      <div v-else-if="coursesList.length === 0" class="empty-state">
        <BaseIcon name="collection" class="w-16 h-16 text-text-muted mb-2" />
        <h3 class="text-text-primary text-xl font-bold">Chưa có khóa học nào</h3>
        <p class="text-text-secondary">Bắt đầu xây dựng lộ trình học tập của bạn bằng cách tạo khóa học đầu tiên.</p>
        <button class="btn-submit mt-4" @click="toggleCourseForm()">Tạo khóa học ngay</button>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="c in coursesList" :key="c.id" class="course-card flex flex-col p-0 overflow-hidden hover:border-border-accent/50 transition-colors cursor-pointer group" @click="toggleCourseAccordion(String(c.id))">
          
          <!-- Cover -->
          <div class="h-32 relative bg-bg-hover flex-shrink-0">
            <img v-if="c.coverImageUrl" :src="c.coverImageUrl.startsWith('http') ? c.coverImageUrl : `${BASE_URL}${c.coverImageUrl}`" class="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
            <div v-else class="w-full h-full flex items-center justify-center bg-accent-dark/30">
              <BaseIcon name="academic" class="w-10 h-10 text-accent/50" />
            </div>
            <div class="absolute top-3 left-3 flex gap-2">
              <span class="topic-badge shadow-lg" :class="'topic-' + c.category">{{ formatTopic(c.category) }}</span>
            </div>
            <div class="absolute top-3 right-3 flex gap-2">
              <span v-if="c.isPremium" class="px-2 py-1 rounded bg-accent-warm/90 text-accent-warm-dark text-xs font-bold shadow-lg">Premium</span>
            </div>
          </div>
          
          <!-- Info -->
          <div class="p-5 flex-1 flex flex-col">
            <h4 class="text-lg font-bold text-text-primary mb-2 line-clamp-2 leading-tight group-hover:text-accent transition-colors">{{ c.title }}</h4>
            <div class="flex items-center justify-between text-xs text-text-secondary mb-4">
              <span class="flex items-center gap-1"><BaseIcon name="collection" class="w-3.5 h-3.5" /> {{ c.totalLessons }} bài</span>
              <span class="diff-badge" :class="'diff-' + c.difficulty?.toLowerCase()">{{ formatDifficulty(c.difficulty?.toLowerCase()) }}</span>
            </div>
            
            <!-- Actions -->
            <div class="mt-auto flex justify-between gap-2 border-t border-border-default pt-4">
              <button class="btn-action btn-action--edit flex-1 flex items-center justify-center gap-1" @click.stop="editCourse(c)">
                <BaseIcon name="edit" class="w-3.5 h-3.5" /> Sửa
              </button>
              <button class="btn-action btn-action--delete flex items-center justify-center" @click.stop="deleteCourse(c.id)">
                <BaseIcon name="trash" class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Expanded Lessons Area -->
          <div v-if="expandedCourseId === String(c.id)" class="bg-black/40 border-t border-border-default p-4" @click.stop>
            <div class="flex justify-between items-center mb-3">
              <h5 class="text-sm font-bold text-accent m-0 flex items-center gap-1"><BaseIcon name="chevron-down" class="w-4 h-4" /> Bài giảng ({{ c.totalLessons }})</h5>
              <button class="btn-add-inline text-xs py-1 px-2" @click.stop="addNewLessonToCourse(c)">+ Thêm</button>
            </div>
            
            <div v-if="loadingCourseLessons[String(c.id)]" class="loading-detail py-2 justify-center">
              <div class="spinner spinner--sm"></div>
            </div>
            <div v-else-if="!courseLessons[String(c.id)]?.length" class="text-xs text-text-muted text-center py-2">
              Chưa có bài giảng
            </div>
            <div v-else class="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              <div v-for="l in courseLessons[String(c.id)]" :key="l.id" class="flex justify-between items-center p-2 rounded bg-bg-surface hover:bg-bg-surface group/lesson">
                <div class="flex flex-col min-w-0 flex-1">
                  <span class="text-xs text-text-primary truncate"><span class="text-accent opacity-70">#{{ l.orderIndex }}</span> {{ l.title }}</span>
                </div>
                <div class="flex gap-1 opacity-0 group-hover/lesson:opacity-100 transition-opacity flex-shrink-0">
                  <button class="p-1 text-accent-warm hover:bg-accent-warm/20 rounded" @click.stop="editLesson(l, c)"><BaseIcon name="edit" class="w-3 h-3" /></button>
                  <button class="p-1 text-accent-red hover:bg-accent-red/20 rounded" @click.stop="deleteLesson(l.id, c.id)"><BaseIcon name="trash" class="w-3 h-3" /></button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useTeacherApi } from './useTeacherApi';

const props = defineProps<{ quizzesList: any[] }>();

const { BASE_URL, getAuthHeaders, formatTopic, formatDifficulty } = useTeacherApi();

const coursesList = ref<any[]>([]);
const loadingCourses = ref(false);
const expandedCourseId = ref<string | null>(null);
const courseLessons = ref<Record<string, any[]>>({});
const loadingCourseLessons = ref<Record<string, boolean>>({});
const submitting = ref(false);
const uploadingImage = ref(false);

const activeCourseForm = ref<'none' | 'create' | 'edit'>('none');
const editingCourseId = ref<string | null>(null);
const courseForm = reactive({ title: '', description: '', category: 'sorting', difficulty: 'Beginner', isPremium: false, coverImageUrl: '', isPublished: true });

const activeLessonForm = ref<'none' | 'create' | 'edit'>('none');
const editingLessonId = ref<string | null>(null);
const activeCourseForLesson = ref<any | null>(null);
const lessonForm = reactive({ title: '', contentMd: '', sandboxType: 'sorting', sandboxConfig: '{}', quizId: null as string | null, xpReward: 20, orderIndex: 1 });

async function loadCourses(): Promise<void> {
  loadingCourses.value = true;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/courses`, { headers: getAuthHeaders() });
    if (res.ok) coursesList.value = await res.json();
  } catch (err) { console.error('Failed to load courses:', err); }
  finally { loadingCourses.value = false; }
}

async function toggleCourseAccordion(courseId: string) {
  if (expandedCourseId.value === courseId) { expandedCourseId.value = null; } 
  else { expandedCourseId.value = courseId; await loadCourseLessons(courseId); }
}

async function loadCourseLessons(courseId: string) {
  loadingCourseLessons.value[courseId] = true;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/courses/${courseId}`, { headers: getAuthHeaders() });
    if (res.ok) { const data = await res.json(); courseLessons.value[courseId] = data.lessons; }
  } catch (err) { console.error(err); }
  finally { loadingCourseLessons.value[courseId] = false; }
}

function toggleCourseForm() { if (activeCourseForm.value !== 'none') cancelCourseEdit(); else activeCourseForm.value = 'create'; }

function cancelCourseEdit() {
  activeCourseForm.value = 'none'; editingCourseId.value = null;
  Object.assign(courseForm, { title: '', description: '', category: 'sorting', difficulty: 'Beginner', isPremium: false, coverImageUrl: '', isPublished: true });
}

async function submitCourse() {
  submitting.value = true;
  try {
    const url = editingCourseId.value ? `${BASE_URL}/api/v1/concepts/courses/${editingCourseId.value}` : `${BASE_URL}/api/v1/concepts/courses`;
    const res = await fetch(url, { method: editingCourseId.value ? 'PUT' : 'POST', headers: getAuthHeaders(), body: JSON.stringify(courseForm) });
    if (res.ok) { 
      const responseData = await res.json();
      alert(editingCourseId.value ? 'Cập nhật thành công!' : 'Tạo thành công!'); 
      const isCreate = !editingCourseId.value;
      cancelCourseEdit(); 
      await loadCourses(); 
      
      if (isCreate && responseData.course) {
        addNewLessonToCourse(responseData.course);
      }
    }
    else { const err = await res.json(); alert(err.message || 'Lỗi khi lưu khóa học.'); }
  } catch { alert('Không thể kết nối máy chủ.'); }
  finally { submitting.value = false; }
}

async function editCourse(c: any) {
  activeCourseForm.value = 'edit'; editingCourseId.value = c.id;
  Object.assign(courseForm, { title: c.title, description: c.description, category: c.category, difficulty: c.difficulty, isPremium: c.isPremium, coverImageUrl: c.coverImageUrl, isPublished: c.isPublished });
  window.scrollTo({ top: 300, behavior: 'smooth' });
}

async function uploadCoverImage(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  uploadingImage.value = true;
  try {
    const formData = new FormData();
    formData.append('file', file);
    const headers = { ...getAuthHeaders() };
    delete headers['Content-Type'];
    const res = await fetch(`${BASE_URL}/api/v1/upload/image`, {
      method: 'POST',
      headers, 
      body: formData
    });
    
    if (res.ok) {
      const data = await res.json();
      courseForm.coverImageUrl = data.url;
    } else {
      const err = await res.json();
      alert(err.message || 'Lỗi tải ảnh.');
    }
  } catch (err) {
    alert('Không thể kết nối máy chủ để tải ảnh.');
  } finally {
    uploadingImage.value = false;
  }
}

async function deleteCourse(courseId: string) {
  if (!confirm('Bạn có chắc chắn muốn xóa khóa học này?')) return;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/courses/${courseId}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (res.ok) { alert('Xóa thành công!'); await loadCourses(); }
  } catch (err) { console.error(err); }
}

function addNewLessonToCourse(c: any) {
  activeLessonForm.value = 'create'; activeCourseForLesson.value = c; editingLessonId.value = null;
  Object.assign(lessonForm, { title: '', contentMd: '', sandboxType: 'sorting', sandboxConfig: '{}', quizId: null, xpReward: 20 });
  lessonForm.orderIndex = (courseLessons.value[c.id] ?? []).length + 1;
}

function cancelLessonEdit() { activeLessonForm.value = 'none'; activeCourseForLesson.value = null; editingLessonId.value = null; }

async function submitLesson() {
  if (!activeCourseForLesson.value) return;
  submitting.value = true;
  try {
    const url = editingLessonId.value ? `${BASE_URL}/api/v1/concepts/lessons/${editingLessonId.value}` : `${BASE_URL}/api/v1/concepts/courses/${activeCourseForLesson.value.id}/lessons`;
    const res = await fetch(url, { method: editingLessonId.value ? 'PUT' : 'POST', headers: getAuthHeaders(), body: JSON.stringify(lessonForm) });
    if (res.ok) { alert(editingLessonId.value ? 'Cập nhật thành công!' : 'Tạo thành công!'); const cid = activeCourseForLesson.value.id; cancelLessonEdit(); await loadCourseLessons(cid); await loadCourses(); }
    else { const err = await res.json(); alert(err.message || 'Lỗi khi lưu bài giảng.'); }
  } catch (err) { console.error(err); }
  finally { submitting.value = false; }
}

function editLesson(l: any, c: any) {
  activeLessonForm.value = 'edit'; activeCourseForLesson.value = c; editingLessonId.value = l.id;
  Object.assign(lessonForm, { title: l.title, contentMd: l.contentMd, sandboxType: l.sandboxType, sandboxConfig: l.sandboxConfig ?? '{}', quizId: l.quizId, xpReward: l.xpReward, orderIndex: l.orderIndex });
  window.scrollTo({ top: 300, behavior: 'smooth' });
}

async function deleteLesson(lessonId: string, courseId: string) {
  if (!confirm('Bạn có chắc chắn muốn xóa bài giảng này?')) return;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/lessons/${lessonId}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (res.ok) { alert('Xóa thành công!'); await loadCourseLessons(courseId); await loadCourses(); }
  } catch (err) { console.error(err); }
}

defineExpose({ coursesList, loadCourses });
loadCourses();
</script>
