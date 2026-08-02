<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="$emit('update:show', false)">
      <div class="modal-container modal-xl">
        <div class="modal-header">
          <h3 class="modal-title">
            <BaseIcon name="plus" class="w-5 h-5 inline mr-2" />
            Tạo bài học tùy chỉnh cho Lớp: {{ classroomName }}
          </h3>
          <button type="button" class="modal-close" @click="$emit('update:show', false)">
            <BaseIcon name="x" class="w-5 h-5" />
          </button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="modal-body">
          
          <div class="step-indicator mb-6">
            <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
              <span class="step-number">1</span>
              <span class="step-label">Thông tin cơ bản</span>
            </div>
            <div class="step-connector" :class="{ completed: currentStep > 1 }"></div>
            <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
              <span class="step-number">2</span>
              <span class="step-label">Nội dung & Lý thuyết</span>
            </div>
            <div class="step-connector" :class="{ completed: currentStep > 2 }"></div>
            <div class="step" :class="{ active: currentStep >= 3, completed: currentStep > 3 }">
              <span class="step-number">3</span>
              <span class="step-label">Hoạt động thực hành</span>
            </div>
            <div class="step-connector" :class="{ completed: currentStep > 3 }"></div>
            <div class="step" :class="{ active: currentStep >= 4 }">
              <span class="step-number">4</span>
              <span class="step-label">Cài đặt & Xuất bản</span>
            </div>
          </div>

          
          <div v-if="currentStep === 1" class="step-content animate-fade-in">
            <h4 class="step-title">Thông tin cơ bản</h4>
            
            <div class="form-field">
              <label class="form-label">Tiêu đề bài học <span class="text-accent-red">*</span></label>
              <input v-model="form.title" type="text" class="form-input" placeholder="VD: Giới thiệu về Bubble Sort" required maxlength="200" />
              <p class="form-hint">{{ form.title.length }}/200 ký tự</p>
            </div>
            
            <div class="form-field">
              <label class="form-label">Mô tả ngắn</label>
              <textarea v-model="form.description" class="form-input form-textarea" placeholder="Mô tả ngắn gọn về bài học..." rows="3" maxlength="1000"></textarea>
              <p class="form-hint">{{ form.description.length }}/1000 ký tự</p>
            </div>
            
            <div class="form-row">
              <div class="form-field">
                <label class="form-label">Module <span class="text-accent-red">*</span></label>
                <select v-model="form.moduleId" class="form-select" required>
                  <option value="">Chọn module</option>
                  <option v-for="m in modules" :key="m.id" :value="m.id">{{ m.title }}</option>
                </select>
              </div>
              <div class="form-field">
                <label class="form-label">Thứ tự trong module <span class="text-accent-red">*</span></label>
                <input v-model.number="form.orderIndex" type="number" class="form-input" min="1" required />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-field">
                <label class="form-label">XP Thưởng <span class="text-accent-red">*</span></label>
                <input v-model.number="form.xpReward" type="number" class="form-input" min="10" max="500" required />
              </div>
              <div class="form-field">
                <label class="form-label">Thời gian ước tính (phút)</label>
                <input v-model.number="form.estimatedTime" type="number" class="form-input" min="5" max="180" />
              </div>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn-primary" @click="nextStep" :disabled="!isStep1Valid">
                <BaseIcon name="arrow-right" class="w-4 h-4 inline mr-1" /> Bước tiếp theo
              </button>
            </div>
          </div>

          
          <div v-if="currentStep === 2" class="step-content animate-fade-in">
            <h4 class="step-title">Nội dung & Lý thuyết</h4>
            
            <div class="form-field">
              <label class="form-label">Loại nội dung <span class="text-accent-red">*</span></label>
              <div class="type-selector">
                <label 
                  v-for="type in contentTypes" 
                  :key="type.value" 
                  class="type-option"
                  :class="{ active: form.contentType === type.value }"
                  @click="form.contentType = type.value"
                >
                  <BaseIcon :name="type.icon" class="w-5 h-5" />
                  <span>{{ type.label }}</span>
                </label>
              </div>
            </div>
            
            
            <div v-if="form.contentType === 'custom'" class="form-field">
              <label class="form-label">Nội dung Markdown <span class="text-accent-red">*</span></label>
              <CustomMarkdownEditor 
                v-model="form.customContent" 
                :placeholder="'Viết nội dung bài học bằng Markdown...'"
                :height="350"
              />
            </div>
            
            
            <div v-if="form.contentType === 'theory'" class="form-field">
              <label class="form-label">Chọn bài viết lý thuyết <span class="text-accent-red">*</span></label>
              <TheoryArticlePickerModal
                v-model:show="showTheoryPicker"
                :multiple="false"
                @select="onTheorySelected"
              />
              <div v-if="form.theoryArticleId" class="selected-theory p-4 bg-accent/10 border border-border-accent rounded-xl">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-semibold text-text-primary">{{ selectedTheory?.title }}</p>
                    <p class="text-sm text-text-secondary">{{ selectedTheory?.category }} • {{ selectedTheory?.readTimeMinutes }} phút đọc</p>
                  </div>
                  <button type="button" class="btn-secondary text-sm" @click="removeTheory">
                    <BaseIcon name="x" class="w-4 h-4 inline mr-1" /> Gỡ bỏ
                  </button>
                </div>
              </div>
              <button type="button" class="btn-primary" @click="showTheoryPicker = true">
                <BaseIcon name="search" class="w-4 h-4 inline mr-1" /> Chọn bài viết lý thuyết
              </button>
            </div>
            
            
            <div class="form-section">
              <h4 class="form-section-title">
                <BaseIcon name="cube" class="w-4 h-4 inline mr-1" />
                Trực quan hóa (Sandbox)
              </h4>
              <div class="form-field">
                <label class="form-label">Loại Sandbox</label>
                <select v-model="form.sandboxType" class="form-select">
                  <option value="">Không có trực quan hóa</option>
                  <option value="sorting">Sắp xếp (Sorting)</option>
                  <option value="graph">Đồ thị (Graph)</option>
                  <option value="tree">Cây (Tree)</option>
                  <option value="array">Mảng (Array)</option>
                  <option value="hash">Bảng băm (Hash)</option>
                </select>
              </div>
              <div class="form-field">
                <label class="form-label">Cấu hình Sandbox (JSON)</label>
                <textarea v-model="form.sandboxConfig" class="form-input form-textarea font-mono text-sm" placeholder='{"initialArray": [5,2,9,1,5,6], "algorithm": "bubble"}' rows="4"></textarea>
              </div>
            </div>
            
            <div class="step-navigation">
              <button type="button" class="btn-secondary" @click="prevStep">
                <BaseIcon name="arrow-left" class="w-4 h-4 inline mr-1" /> Quay lại
              </button>
              <button type="button" class="btn-primary" @click="nextStep" :disabled="!isStep2Valid">
                <BaseIcon name="arrow-right" class="w-4 h-4 inline ml-1" /> Bước tiếp theo
              </button>
            </div>
          </div>

          
          <div v-if="currentStep === 3" class="step-content animate-fade-in">
            <h4 class="step-title">Hoạt động thực hành</h4>
            
            <p class="text-text-secondary text-sm mb-6">Chọn các hoạt động thực hành bổ sung cho bài học (tùy chọn)</p>
            
            <div class="practice-options grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <label v-for="activity in practiceActivities" :key="activity.key" class="practice-card" :class="{ selected: form.practiceActivities.includes(activity.key) }" @click="togglePracticeActivity(activity.key)">
                <div class="practice-icon">
                  <BaseIcon :name="activity.icon" class="w-8 h-8" />
                </div>
                <h5 class="font-semibold text-text-primary">{{ activity.label }}</h5>
                <p class="text-xs text-text-secondary">{{ activity.description }}</p>
                <div class="practice-check">
                  <input type="checkbox" :value="activity.key" v-model="form.practiceActivities" class="form-checkbox" />
                  <span>Chọn</span>
                </div>
              </label>
            </div>
            
            
            <div v-if="form.practiceActivities.includes('quiz')" class="form-section">
              <h4 class="form-section-title">
                <BaseIcon name="help-circle" class="w-4 h-4 inline mr-1" />
                Cấu hình Quiz
              </h4>
              <QuizPickerModal
                v-model:show="showQuizPicker"
                @select="onQuizSelected"
              />
              <div v-if="form.quizId" class="selected-quiz p-4 bg-accent-purple/10 border border-accent-purple/20 rounded-xl">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-semibold text-text-primary">{{ selectedQuiz?.title }}</p>
                    <p class="text-sm text-text-secondary">{{ selectedQuiz?.topic }} • Độ khó {{ selectedQuiz?.difficulty }} • {{ selectedQuiz?.questionCount }} câu</p>
                  </div>
                  <button type="button" class="btn-secondary text-sm" @click="removeQuiz">
                    <BaseIcon name="x" class="w-4 h-4 inline mr-1" /> Gỡ bỏ
                  </button>
                </div>
              </div>
              <button type="button" class="btn-primary" @click="showQuizPicker = true" v-if="!form.quizId">
                <BaseIcon name="plus" class="w-4 h-4 inline mr-1" /> Chọn Quiz
              </div>
            </div>
            
            
            <div v-if="form.practiceActivities.includes('codelab')" class="form-section">
              <h4 class="form-section-title">
                <BaseIcon name="code" class="w-4 h-4 inline mr-1" />
                Cấu hình Codelab
              </h4>
              <CodelabPickerModal
                v-model:show="showCodelabPicker"
                @select="onCodelabSelected"
              />
              <div v-if="form.codelabId" class="selected-codelab p-4 bg-accent-green/10 border border-accent-green/20 rounded-xl">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-semibold text-text-primary">{{ selectedCodelab?.title }}</p>
                    <p class="text-sm text-text-secondary">{{ selectedCodelab?.difficulty }} • {{ selectedCodelab?.testCaseCount }} testcases</p>
                  </div>
                  <button type="button" class="btn-secondary text-sm" @click="removeCodelab">
                    <BaseIcon name="x" class="w-4 h-4 inline mr-1" /> Gỡ bỏ
                  </button>
                </div>
              </div>
              <button type="button" class="btn-primary" @click="showCodelabPicker = true" v-if="!form.codelabId">
                <BaseIcon name="plus" class="w-4 h-4 inline mr-1" /> Chọn Codelab
              </div>
            </div>
            
            <div class="step-navigation">
              <button type="button" class="btn-secondary" @click="prevStep">
                <BaseIcon name="arrow-left" class="w-4 h-4 inline mr-1" /> Quay lại
              </button>
              <button type="button" class="btn-primary" @click="nextStep">
                <BaseIcon name="arrow-right" class="w-4 h-4 inline ml-1" /> Bước tiếp theo
              </button>
            </div>
          </div>

          
          <div v-if="currentStep === 4" class="step-content animate-fade-in">
            <h4 class="step-title">Cài đặt & Xuất bản</h4>
            
            <div class="form-field">
              <label class="form-label flex items-center gap-2 cursor-pointer">
                <input v-model="form.isRequired" type="checkbox" class="form-checkbox" />
                <span>Bắt buộc hoàn thành để mở khóa bài tiếp theo</span>
              </label>
            </div>
            
            <div class="form-field">
              <label class="form-label flex items-center gap-2 cursor-pointer">
                <input v-model="form.isHidden" type="checkbox" class="form-checkbox" />
                <span>Ẩn bài học khỏi học viên (chỉ giáo viên thấy)</span>
              </label>
            </div>
            
            <div class="form-row">
              <div class="form-field">
                <label class="form-label">Mở khóa vào lúc (Unlock At)</label>
                <input v-model="form.unlockAt" type="datetime-local" class="form-input" />
              </div>
              <div class="form-field">
                <label class="form-label">Hạn nộp (Due At)</label>
                <input v-model="form.dueAt" type="datetime-local" class="form-input" />
              </div>
            </div>
            
            <div class="form-field">
              <label class="form-label">Số lần thử tối đa (cho Quiz/Codelab)</label>
              <input v-model.number="form.maxAttempts" type="number" class="form-input" min="1" max="100" placeholder="Không giới hạn" />
            </div>
            
            <div class="form-field">
              <label class="form-label flex items-center gap-2 cursor-pointer">
                <input v-model="form.isSequential" type="checkbox" class="form-checkbox" />
                <span>Yêu cầu hoàn thành theo thứ tự (Sequential)</span>
              </label>
            </div>
            
            <div class="form-field">
              <label class="form-label flex items-center gap-2 cursor-pointer">
                <input v-model="form.isPublished" type="checkbox" class="form-checkbox" />
                <span>Xuất bản ngay sau khi tạo</span>
              </label>
            </div>
            
            <div class="step-navigation">
              <button type="button" class="btn-secondary" @click="prevStep">
                <BaseIcon name="arrow-left" class="w-4 h-4 inline mr-1" /> Quay lại
              </button>
              <button type="submit" class="btn-primary" :disabled="saving">
                <span v-if="saving" class="flex items-center gap-2">
                  <span class="spinner-sm"></span>
                  Đang tạo...
                </span>
                <span v-else>
                  <BaseIcon name="check" class="w-4 h-4 inline mr-1" /> Tạo bài học
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
import { ref, reactive, watch, computed } from 'vue';
import BaseIcon from '@/shared/components/BaseIcon.vue';
import CustomMarkdownEditor from '@/components/editor/CustomMarkdownEditor.vue';
import TheoryArticlePickerModal from './TheoryArticlePickerModal.vue';
import QuizPickerModal from './QuizPickerModal.vue';
import CodelabPickerModal from './CodelabPickerModal.vue';

interface Props {
  show: boolean;
  classroomId: string;
  classroomName: string;
  modules: any[];
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'created', lesson: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const currentStep = ref(1);
const saving = ref(false);

const modules = computed(() => props.modules.filter((m: any) => !m.isDeleted).sort((a: any, b: any) => a.orderIndex - b.orderIndex));

const contentTypes = [
  { value: 'custom', label: 'Tự soạn thảo (Markdown)', icon: 'file-text' },
  { value: 'theory', label: 'Chọn bài viết lý thuyết', icon: 'book-open' }
];

const practiceActivities = [
  { key: 'quiz', label: 'Trắc nghiệm (Quiz)', icon: 'help-circle', description: 'Kiểm tra kiến thức' },
  { key: 'codelab', label: 'Thực hành Code (Codelab)', icon: 'code', description: 'Viết và chạy code' }
];

const form = reactive({
  
  title: '',
  description: '',
  moduleId: '',
  orderIndex: 1,
  xpReward: 50,
  estimatedTime: 30,
  
  
  contentType: 'custom',
  customContent: '',
  theoryArticleId: '',
  sandboxType: '',
  sandboxConfig: '{}',
  
  
  practiceActivities: [] as string[],
  quizId: '',
  codelabId: '',
  
  
  isRequired: true,
  isHidden: false,
  unlockAt: '',
  dueAt: '',
  maxAttempts: null as number | null,
  isSequential: true,
  isPublished: false
});

const showTheoryPicker = ref(false);
const showQuizPicker = ref(false);
const showCodelabPicker = ref(false);

const selectedTheory = ref<any | null>(null);
const selectedQuiz = ref<any | null>(null);
const selectedCodelab = ref<any | null>(null);

const isStep1Valid = computed(() => form.title.trim() && form.moduleId && form.orderIndex >= 1);
const isStep2Valid = computed(() => {
  if (form.contentType === 'custom') return form.customContent.trim().length > 0;
  if (form.contentType === 'theory') return !!form.theoryArticleId;
  return true;
});

function nextStep() {
  if (currentStep.value < 4) currentStep.value++;
}

function prevStep() {
  if (currentStep.value > 1) currentStep.value--;
}

function togglePracticeActivity(key: string) {
  const idx = form.practiceActivities.indexOf(key);
  if (idx >= 0) form.practiceActivities.splice(idx, 1);
  else form.practiceActivities.push(key);
}

function onTheorySelected(articles: any[]) {
  if (articles.length > 0) {
    form.theoryArticleId = articles[0].id;
    selectedTheory.value = articles[0];
  }
  showTheoryPicker.value = false;
}

function removeTheory() {
  form.theoryArticleId = '';
  selectedTheory.value = null;
}

function onQuizSelected(quizzes: any[]) {
  if (quizzes.length > 0) {
    form.quizId = quizzes[0].id;
    selectedQuiz.value = quizzes[0];
  }
  showQuizPicker.value = false;
}

function removeQuiz() {
  form.quizId = '';
  selectedQuiz.value = null;
  form.practiceActivities = form.practiceActivities.filter(a => a !== 'quiz');
}

function onCodelabSelected(codelabs: any[]) {
  if (codelabs.length > 0) {
    form.codelabId = codelabs[0].id;
    selectedCodelab.value = codelabs[0];
  }
  showCodelabPicker.value = false;
}

function removeCodelab() {
  form.codelabId = '';
  selectedCodelab.value = null;
  form.practiceActivities = form.practiceActivities.filter(a => a !== 'codelab');
}

async function handleSubmit() {
  if (!isStep1Valid.value || !isStep2Valid.value) return;
  
  saving.value = true;
  try {
    const lessonData = { ...form };
    await emit('created', lessonData);
  } finally {
    saving.value = false;
  }
}

watch(() => props.show, (newShow) => {
  if (!newShow) {
    currentStep.value = 1;
    
    Object.assign(form, {
      title: '', description: '', moduleId: '', orderIndex: 1, xpReward: 50, estimatedTime: 30,
      contentType: 'custom', customContent: '', theoryArticleId: '', sandboxType: '', sandboxConfig: '{}',
      practiceActivities: [], quizId: '', codelabId: '',
      isRequired: true, isHidden: false, unlockAt: '', dueAt: '', maxAttempts: null, isSequential: true, isPublished: false
    });
    selectedTheory.value = null;
    selectedQuiz.value = null;
    selectedCodelab.value = null;
    showTheoryPicker.value = false;
    showQuizPicker.value = false;
    showCodelabPicker.value = false;
  }
});
</script>

<style scoped>
@import "./CustomLessonCreator.css";
</style>