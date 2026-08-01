<script setup lang="ts">
import { ref } from 'vue';
import { courseApi } from '../../../services/courseApi';
import type { CreateCourseDto, AddModuleDto, AddModuleItemDto } from '../../../services/courseApi';

const step = ref<number>(1);
const courseId = ref<string | null>(null);
const moduleId = ref<string | null>(null);
const successMessage = ref<string>('');


const courseForm = ref<CreateCourseDto>({
  title: '',
  description: '',
  category: 'DataStructure',
  difficulty: 'Beginner',
  isPremium: false,
  coverImageUrl: '',
  isPublished: false
});

const moduleForm = ref<AddModuleDto>({
  title: '',
  description: '',
  orderIndex: 1000
});

const itemForm = ref<AddModuleItemDto>({
  itemType: 'Lesson',
  overrideTitle: '',
  orderIndex: 1000,
  isRequired: true
});

const isSubmitting = ref<boolean>(false);

async function createCourse() {
  isSubmitting.value = true;
  try {
    const res = await courseApi.createCourse(courseForm.value) as any;
    courseId.value = res.data.courseId;
    successMessage.value = res.data.message;
    step.value = 2;
  } catch (error) {
    alert('Failed to create course');
  } finally {
    isSubmitting.value = false;
  }
}

async function addModule() {
  if (!courseId.value) return;
  isSubmitting.value = true;
  try {
    const res = await courseApi.addModule(courseId.value, moduleForm.value) as any;
    moduleId.value = res.data.moduleId;
    successMessage.value = res.data.message;
    step.value = 3;
  } catch (error) {
    alert('Failed to add module');
  } finally {
    isSubmitting.value = false;
  }
}

async function addModuleItem() {
  if (!moduleId.value) return;
  isSubmitting.value = true;
  try {
    
    const payload = { ...itemForm.value };
    if (!payload.lessonId) payload.lessonId = null;
    if (!payload.quizId) payload.quizId = null;
    if (!payload.codelabId) payload.codelabId = null;

    const res = await courseApi.addModuleItem(moduleId.value, payload) as any;
    successMessage.value = res.data.message;
    
    
    itemForm.value.overrideTitle = '';
    itemForm.value.orderIndex += 1000;
    
  } catch (error) {
    alert('Failed to add module item');
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="course-builder-container">
    <h2>Trình tạo Khóa học (Course Builder)</h2>
    <div v-if="successMessage" class="success-alert">
      {{ successMessage }}
    </div>

    
    <div class="step-card" v-if="step === 1">
      <h3>Bước 1: Thông tin chung Khóa học</h3>
      <div class="form-group">
        <label>Tiêu đề:</label>
        <input v-model="courseForm.title" type="text" placeholder="Nhập tiêu đề..." />
      </div>
      <div class="form-group">
        <label>Mô tả:</label>
        <textarea v-model="courseForm.description" placeholder="Nhập mô tả..."></textarea>
      </div>
      <div class="form-group">
        <label>Category:</label>
        <select v-model="courseForm.category">
          <option value="DataStructure">DataStructure</option>
          <option value="Algorithm">Algorithm</option>
          <option value="SystemDesign">SystemDesign</option>
        </select>
      </div>
      <div class="form-group">
        <label>Difficulty:</label>
        <select v-model="courseForm.difficulty">
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>
      <button :disabled="isSubmitting" @click="createCourse" class="btn-primary">Tạo Khóa học</button>
    </div>

    
    <div class="step-card" v-if="step === 2">
      <h3>Bước 2: Tạo Module (Chương)</h3>
      <div class="form-group">
        <label>Tên Chương:</label>
        <input v-model="moduleForm.title" type="text" />
      </div>
      <div class="form-group">
        <label>Mô tả Chương:</label>
        <textarea v-model="moduleForm.description"></textarea>
      </div>
      <div class="form-group">
        <label>Order Index:</label>
        <input v-model.number="moduleForm.orderIndex" type="number" />
      </div>
      <button :disabled="isSubmitting" @click="addModule" class="btn-primary">Thêm Module</button>
    </div>

    
    <div class="step-card" v-if="step === 3">
      <h3>Bước 3: Thêm Nội dung vào Module</h3>
      <div class="form-group">
        <label>Loại nội dung:</label>
        <select v-model="itemForm.itemType">
          <option value="Lesson">Bài học (Lesson)</option>
          <option value="Quiz">Trắc nghiệm (Quiz)</option>
          <option value="Codelab">Thực hành (Codelab)</option>
        </select>
      </div>
      <div class="form-group" v-if="itemForm.itemType === 'Lesson'">
        <label>Lesson ID:</label>
        <input v-model="itemForm.lessonId" type="text" placeholder="UUID của bài học có sẵn" />
      </div>
      <div class="form-group" v-if="itemForm.itemType === 'Quiz'">
        <label>Quiz ID:</label>
        <input v-model="itemForm.quizId" type="text" placeholder="UUID của bài trắc nghiệm" />
      </div>
      <div class="form-group">
        <label>Tiêu đề hiển thị (Override Title):</label>
        <input v-model="itemForm.overrideTitle" type="text" />
      </div>
      <div class="form-group">
        <label>Thứ tự (Order Index):</label>
        <input v-model.number="itemForm.orderIndex" type="number" />
      </div>
      <button :disabled="isSubmitting" @click="addModuleItem" class="btn-primary">Thêm Item</button>
      
      <button @click="step = 2" class="btn-secondary" style="margin-left: 10px">Thêm Module khác</button>
    </div>
  </div>
</template>

<style scoped>
.course-builder-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  color: var(--color-text-primary);
  background: var(--bg-card);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

h2 {
  text-align: center;
  color: var(--color-brand-primary);
  margin-bottom: 24px;
}

.success-alert {
  padding: 12px;
  background-color: rgba(34, 197, 94, 0.1);
  border-left: 4px solid #22c55e;
  color: #4ade80;
  margin-bottom: 20px;
  border-radius: 4px;
}

.step-card {
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 10px 14px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(0, 0, 0, 0.2);
  color: white;
  font-size: 14px;
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: var(--color-brand-primary);
  outline: none;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.btn-primary {
  padding: 10px 20px;
  background: var(--color-brand-primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  background: #4f46e5;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
}
</style>
