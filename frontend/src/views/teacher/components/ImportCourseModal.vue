<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="$emit('update:show', false)">
      <div class="modal-container modal-lg">
        <div class="modal-header">
          <h3 class="modal-title">
            <BaseIcon name="download" class="w-5 h-5 inline mr-2" />
            Import Khóa học vào Lớp
          </h3>
          <button type="button" class="modal-close" @click="$emit('update:show', false)">
            <BaseIcon name="x" class="w-5 h-5" />
          </button>
        </div>
        
        <form @submit.prevent="handleImport" class="modal-body">
          
          <div v-if="step === 1" class="import-step">
            <div class="step-header">
              <div class="step-indicator">
                <span class="step-number active">1</span>
                <span class="step-label">Chọn Khóa học</span>
              </div>
              <div class="step-indicator">
                <span class="step-number">2</span>
                <span class="step-label">Tùy chỉnh</span>
              </div>
              <div class="step-indicator">
                <span class="step-number">3</span>
                <span class="step-label">Xác nhận</span>
              </div>
            </div>
            
            <div class="form-field">
              <label class="form-label">Khóa học <span class="text-accent-red">*</span></label>
              <select 
                v-model="form.courseId" 
                class="form-input"
                @change="onCourseSelect"
              >
                <option value="">-- Chọn khóa học --</option>
                <option 
                  v-for="course in courses" 
                  :key="course.id" 
                  :value="course.id"
                >
                  {{ course.title }} ({{ course.category }}, {{ course.difficulty }}) {{ course.totalLessons }} bài
                </option>
              </select>
            </div>
            
            <div v-if="selectedCourse" class="course-preview">
              <h4 class="preview-title">{{ selectedCourse.title }}</h4>
              <p class="preview-desc">{{ selectedCourse.description }}</p>
              <div class="preview-meta">
                <span class="meta-item">
                  <BaseIcon name="folder" class="w-3 h-3" />
                  {{ selectedCourse.category }}
                </span>
                <span class="meta-item">
                  <BaseIcon name="trending-up" class="w-3 h-3" />
                  {{ selectedCourse.difficulty }}
                </span>
                <span class="meta-item">
                  <BaseIcon name="book-open" class="w-3 h-3" />
                  {{ selectedCourse.totalModules }} modules
                </span>
                <span class="meta-item">
                  <BaseIcon name="layers" class="w-3 h-3" />
                  {{ selectedCourse.totalLessons }} bài học
                </span>
              </div>
            </div>
            
            <div class="form-field">
              <label class="form-label flex items-center gap-2 cursor-pointer">
                <input 
                  v-model="form.overrideExisting" 
                  type="checkbox" 
                  class="form-checkbox"
                >
                <span>Ghi đè chương trình học hiện tại (xóa modules/bài học cũ)</span>
              </label>
              <p class="form-hint text-accent-warm">⚠️ Hành động này không thể hoàn tác!</p>
            </div>
            
            <div class="modal-footer">
              <button type="button" class="btn-secondary" @click="$emit('update:show', false)">
                Hủy
              </button>
              <button type="button" class="btn-primary" :disabled="!form.courseId" @click="step = 2">
                <BaseIcon name="arrow-right" class="w-4 h-4" />
                Tiếp theo
              </button>
            </div>
          </div>
          
          
          <div v-if="step === 2" class="import-step">
            <div class="step-header">
              <div class="step-indicator">
                <span class="step-number done">1</span>
                <span class="step-label">Chọn Khóa học</span>
              </div>
              <div class="step-indicator">
                <span class="step-number active">2</span>
                <span class="step-label">Tùy chỉnh Module</span>
              </div>
              <div class="step-indicator">
                <span class="step-number">3</span>
                <span class="step-label">Xác nhận</span>
              </div>
            </div>
            
            <p class="step-description">
              Chọn các module bạn muốn import. Các module không chọn sẽ không được đưa vào lớp học.
            </p>
            
            <div class="modules-selection">
              <label 
                v-for="module in selectedCourseModules" 
                :key="module.id"
                class="module-checkbox"
              >
                <input 
                  type="checkbox" 
                  v-model="form.selectedModuleIds" 
                  :value="module.id"
                  class="form-checkbox"
                >
                <div class="module-info">
                  <span class="module-title">{{ module.title }}</span>
                  <span class="module-meta">{{ module.itemsCount }} bài học</span>
                </div>
              </label>
            </div>
            
            <div v-if="selectedCourseModules.length === 0" class="empty-modules">
              <BaseIcon name="info" class="w-6 h-6 text-text-muted" />
              <p>Khóa học này chưa có module nào.</p>
            </div>
            
            <div class="modal-footer">
              <button type="button" class="btn-secondary" @click="step = 1">
                <BaseIcon name="arrow-left" class="w-4 h-4" />
                Quay lại
              </button>
              <button type="button" class="btn-primary" :disabled="form.selectedModuleIds.length === 0" @click="step = 3">
                <BaseIcon name="arrow-right" class="w-4 h-4" />
                Tiếp theo
              </button>
            </div>
          </div>
          
          
          <div v-if="step === 3" class="import-step">
            <div class="step-header">
              <div class="step-indicator">
                <span class="step-number done">1</span>
                <span class="step-label">Chọn Khóa học</span>
              </div>
              <div class="step-indicator">
                <span class="step-number done">2</span>
                <span class="step-label">Tùy chỉnh Module</span>
              </div>
              <div class="step-indicator">
                <span class="step-number active">3</span>
                <span class="step-label">Xác nhận</span>
              </div>
            </div>
            
            <div class="confirm-summary">
              <h4 class="confirm-title">Tóm tắt Import</h4>
              <div class="summary-grid">
                <div class="summary-item">
                  <span class="summary-label">Khóa học</span>
                  <span class="summary-value">{{ selectedCourse?.title }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Số Module sẽ import</span>
                  <span class="summary-value">{{ form.selectedModuleIds.length }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Ghi đè hiện tại</span>
                  <span class="summary-value" :class="form.overrideExisting ? 'text-accent-warm' : 'text-accent-green'">
                    {{ form.overrideExisting ? 'Có' : 'Không' }}
                  </span>
                </div>
              </div>
              
              <div class="warning-box" v-if="form.overrideExisting">
                <BaseIcon name="alert-triangle" class="w-5 h-5" />
                <span>Chương trình học hiện tại của lớp sẽ bị xóa và thay thế bằng nội dung mới.</span>
              </div>
            </div>
            
            <div class="modal-footer">
              <button type="button" class="btn-secondary" @click="step = 2">
                <BaseIcon name="arrow-left" class="w-4 h-4" />
                Quay lại
              </button>
              <button type="submit" class="btn-primary btn-danger" :disabled="importing">
                <span v-if="importing" class="flex items-center gap-2">
                  <span class="spinner-sm"></span>
                  Đang import...
                </span>
                <span v-else>
                  <BaseIcon name="download" class="w-4 h-4" />
                  Import ngay
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, reactive } from 'vue';
import BaseIcon from '@/shared/components/BaseIcon.vue';

interface Props {
  show: boolean;
  teacherId: string;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'imported'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const step = ref(1);
const importing = ref(false);
const courses = ref<any[]>([]);
const selectedCourse = ref<any>(null);
const selectedCourseModules = ref<any[]>([]);

const form = reactive({
  courseId: '',
  overrideExisting: false,
  selectedModuleIds: [] as string[]
});

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

async function fetchCourses() {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/courses`, {
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      courses.value = data.filter((c: any) => c.isPublished && !c.isDeleted);
    }
  } catch (err) {
    console.error('Failed to fetch courses:', err);
  }
}

async function onCourseSelect() {
  if (!form.courseId) {
    selectedCourse.value = null;
    selectedCourseModules.value = [];
    form.selectedModuleIds = [];
    return;
  }
  
  selectedCourse.value = courses.value.find(c => c.id === form.courseId);
  
  if (selectedCourse.value) {
    
    try {
      const res = await fetch(`${BASE_URL}/api/v1/concepts/courses/${form.courseId}`, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        selectedCourseModules.value = data.modules
          ?.filter((m: any) => !m.isDeleted)
          .map((m: any) => ({
            id: m.id,
            title: m.title,
            itemsCount: m.items?.filter((i: any) => i.itemType === 'Lesson' && !i.isDeleted).length || 0
          })) || [];
        
        
        form.selectedModuleIds = selectedCourseModules.value.map(m => m.id);
      }
    } catch (err) {
      console.error('Failed to fetch course modules:', err);
    }
  }
}

async function handleImport() {
  if (!form.courseId || form.selectedModuleIds.length === 0) return;
  
  importing.value = true;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/classrooms/${props.teacherId}/import-course`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId: form.courseId,
        includeAllModules: form.selectedModuleIds.length === selectedCourseModules.value.length,
        selectedModuleIds: form.selectedModuleIds.length === selectedCourseModules.value.length ? undefined : form.selectedModuleIds,
        overrideExisting: form.overrideExisting
      })
    });
    
    if (res.ok) {
      emit('imported');
    } else {
      const err = await res.json();
      alert(err.message || 'Import thất bại');
    }
  } catch (err) {
    console.error('Import failed:', err);
    alert('Không thể kết nối máy chủ');
  } finally {
    importing.value = false;
  }
}

watch(() => props.show, (newShow) => {
  if (newShow) {
    step.value = 1;
    form.courseId = '';
    form.overrideExisting = false;
    form.selectedModuleIds = [];
    selectedCourse.value = null;
    selectedCourseModules.value = [];
    fetchCourses();
  }
});
</script>

<style scoped>
@import "./ImportCourseModal.css";
</style>