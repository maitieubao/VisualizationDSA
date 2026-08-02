<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="$emit('update:show', false)">
      <div class="modal-container modal-lg">
        <div class="modal-header">
          <h3 class="modal-title">
            <BaseIcon :name="editingItem ? 'edit' : 'plus'" class="w-5 h-5 inline mr-2" />
            {{ editingItem ? 'Chỉnh sửa Bài học' : 'Thêm Bài học mới' }}
          </h3>
          <button type="button" class="modal-close" @click="$emit('update:show', false)">
            <BaseIcon name="x" class="w-5 h-5" />
          </button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="modal-body">
          
          <div class="form-field">
            <label class="form-label">Loại nội dung <span class="text-accent-red">*</span></label>
            <div class="type-selector">
              <label 
                v-for="type in itemTypes" 
                :key="type.value" 
                class="type-option"
                :class="{ active: form.itemType === type.value }"
                @click="form.itemType = type.value as 'Lesson' | 'Quiz' | 'Codelab' | 'CustomLesson'"
              >
                <BaseIcon :name="type.icon" class="w-5 h-5" />
                <span>{{ type.label }}</span>
              </label>
            </div>
          </div>
          
          
          <div class="form-field" v-if="form.itemType !== 'CustomLesson'">
            <label class="form-label">
              {{ linkedContentLabel }} <span class="text-accent-red">*</span>
            </label>
            <div class="linked-content-selector">
              <select 
                v-model="linkedContentId" 
                class="form-input" 
                :disabled="!linkedContentOptions.length"
                @change="updateLinkedContent"
              >
                <option :value="null" disabled>-- Chọn {{ linkedContentLabel.toLowerCase() }} --</option>
                <option 
                  v-for="opt in linkedContentOptions" 
                  :key="opt.id" 
                  :value="opt.id"
                >
                  {{ opt.title }} {{ opt.sandboxType ? `(${opt.sandboxType})` : '' }}
                </option>
              </select>
              <p v-if="!linkedContentOptions.length" class="form-hint">
                Chưa có {{ linkedContentLabel.toLowerCase() }} nào. Hãy tạo trước ở tab quản lý.
              </p>
            </div>
          </div>
          
          
          <div v-if="form.itemType === 'CustomLesson'" class="custom-lesson-editor">
            <CustomMarkdownEditor 
              v-model="form.customLessonContent" 
              :placeholder="'Viết nội dung bài học bằng Markdown...'"
            />
          </div>
          
          
          <div class="form-section">
            <h4 class="form-section-title">
              <BaseIcon name="settings" class="w-4 h-4 inline mr-1" />
              Tùy chỉnh cho Module này
            </h4>
            
            <div class="form-field">
              <label class="form-label">Tiêu đề hiển thị (ghi đè)</label>
              <input 
                v-model="form.overrideTitle" 
                type="text" 
                class="form-input" 
                placeholder="Để trống để dùng tiêu đề gốc"
              />
            </div>
            
            <div class="form-field">
              <label class="form-label">Mô tả hiển thị (ghi đè)</label>
              <textarea 
                v-model="form.overrideDescription" 
                class="form-input form-textarea" 
                placeholder="Mô tả ngắn gọn cho học viên..."
                rows="2"
              ></textarea>
            </div>
            
            <div class="form-row">
              <div class="form-field">
                <label class="form-label">Thứ tự <span class="text-accent-red">*</span></label>
                <input 
                  v-model.number="form.orderIndex" 
                  type="number" 
                  class="form-input" 
                  min="1"
                  required
                />
              </div>
              
              <div class="form-field">
                <label class="form-label">Mở khóa vào</label>
                <input 
                  v-model="form.unlockAt" 
                  type="datetime-local" 
                  class="form-input"
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-field">
                <label class="form-label">Hạn nộp (Due date)</label>
                <input 
                  v-model="form.dueAt" 
                  type="datetime-local" 
                  class="form-input"
                />
              </div>
              
              <div class="form-field">
                <label class="form-label">Số lần thử tối đa (Quiz/Codelab)</label>
                <input 
                  v-model.number="form.maxAttempts" 
                  type="number" 
                  class="form-input" 
                  min="1"
                  placeholder="Không giới hạn"
                />
              </div>
            </div>
            
            <div class="form-field">
              <label class="form-label flex items-center gap-2 cursor-pointer">
                <input 
                  v-model="form.isRequired" 
                  type="checkbox" 
                  class="form-checkbox"
                />
                <span>Bắt buộc hoàn thành để mở khóa bài tiếp theo</span>
              </label>
            </div>
            
            <div class="form-field">
              <label class="form-label flex items-center gap-2 cursor-pointer">
                <input 
                  v-model="form.isHidden" 
                  type="checkbox" 
                  class="form-checkbox"
                />
                <span>Ẩn bài học này khỏi học viên</span>
              </label>
            </div>
            
            
            <div class="form-field" v-if="parentModule && parentModule.items.length > 1">
              <label class="form-label">Điều kiện mở khóa (Prerequisite)</label>
              <select v-model="form.prerequisiteItemId" class="form-input">
                <option value="">Không có (Mở ngay khi module mở)</option>
                <option 
                  v-for="item in parentModule.items" 
                  :key="item.id" 
                  :value="item.id"
                >
                  {{ item.overrideTitle || item.lessonTitle || item.quizTitle || item.codelabTitle || 'Untitled' }} (Bước {{ parentModule.items.indexOf(item) + 1 }})
                </option>
              </select>
              <p class="form-hint">Chỉ mở khóa khi bài học trước đã hoàn thành</p>
            </div>
            
            <div class="form-field">
              <label class="form-label flex items-center gap-2 cursor-pointer">
                <input 
                  v-model="form.isSequential" 
                  type="checkbox" 
                  class="form-checkbox"
                />
                <span>Yêu cầu hoàn thành theo thứ tự (Sequential)</span>
              </label>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="$emit('update:show', false)">
              Hủy
            </button>
            <button type="submit" class="btn-primary" :disabled="saving || !isValid">
              <span v-if="saving" class="flex items-center gap-2">
                <span class="spinner-sm"></span>
                Đang lưu...
              </span>
              <span v-else>{{ editingItem ? 'Cập nhật' : 'Tạo Bài học' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue';
import BaseIcon from '@/shared/components/BaseIcon.vue';
import CustomMarkdownEditor from '@/components/editor/CustomMarkdownEditor.vue';

interface Props {
  show: boolean;
  editingItem: any | null;
  parentModule: any | null;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'save', data: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const saving = ref(false);
const linkedContentId = ref<string | null>(null);

const itemTypes: Array<{ value: 'Lesson' | 'Quiz' | 'Codelab' | 'CustomLesson'; label: string; icon: string }> = [
  { value: 'Lesson', label: 'Bài học (Lesson)', icon: 'book-open' },
  { value: 'Quiz', label: 'Trắc nghiệm (Quiz)', icon: 'help-circle' },
  { value: 'Codelab', label: 'Thực hành Code (Codelab)', icon: 'code' },
  { value: 'CustomLesson', label: 'Tự soạn bài học', icon: 'file-text' }
];

const form = reactive({
  itemType: 'Lesson' as 'Lesson' | 'Quiz' | 'Codelab' | 'CustomLesson',
  lessonId: null as string | null,
  quizId: null as string | null,
  codelabId: null as string | null,
  customLessonContent: '',
  overrideTitle: '',
  overrideDescription: '',
  orderIndex: 1,
  unlockAt: '',
  dueAt: '',
  maxAttempts: null as number | null,
  isRequired: true,
  isHidden: false,
  prerequisiteItemId: '',
  isSequential: true
});

const linkedContentOptions = computed(() => {
  
  return [] as any[];
});

const linkedContentLabel = computed(() => {
  switch (form.itemType) {
    case 'Lesson': return 'Bài học';
    case 'Quiz': return 'Trắc nghiệm';
    case 'Codelab': return 'Codelab';
    default: return '';
  }
});

const isValid = computed(() => {
  if (!form.overrideTitle.trim() && form.itemType === 'CustomLesson' && !form.customLessonContent.trim()) {
    return false;
  }
  if (form.itemType !== 'CustomLesson' && !getLinkedContentId()) {
    return false;
  }
  return true;
});

function getLinkedContentId() {
  switch (form.itemType) {
    case 'Lesson': return form.lessonId;
    case 'Quiz': return form.quizId;
    case 'Codelab': return form.codelabId;
    default: return null;
  }
}

function updateLinkedContent() {
  switch (form.itemType) {
    case 'Lesson': form.lessonId = linkedContentId.value; break;
    case 'Quiz': form.quizId = linkedContentId.value; break;
    case 'Codelab': form.codelabId = linkedContentId.value; break;
  }
}

watch(() => props.show, (newShow) => {
  if (newShow && props.editingItem) {
    const item = props.editingItem;
    form.itemType = item.itemType;
    form.lessonId = item.lessonId;
    form.quizId = item.quizId;
    form.codelabId = item.codelabId;
    form.customLessonContent = item.customLessonContent || '';
    form.overrideTitle = item.overrideTitle;
    form.overrideDescription = item.overrideDescription;
    form.orderIndex = item.orderIndex;
    form.unlockAt = item.unlockAt ? new Date(item.unlockAt).toISOString().slice(0, 16) : '';
    form.dueAt = item.dueAt ? new Date(item.dueAt).toISOString().slice(0, 16) : '';
    form.maxAttempts = item.maxAttempts;
    form.isRequired = item.isRequired;
    form.isHidden = item.isHidden;
    form.prerequisiteItemId = item.prerequisiteItemId || '';
    form.isSequential = item.isSequential;
    linkedContentId.value = getLinkedContentId();
  } else if (newShow) {
    
    form.itemType = 'Lesson';
    form.lessonId = null;
    form.quizId = null;
    form.codelabId = null;
    form.customLessonContent = '';
    form.overrideTitle = '';
    form.overrideDescription = '';
    form.orderIndex = (props.parentModule?.items?.length || 0) + 1;
    form.unlockAt = '';
    form.dueAt = '';
    form.maxAttempts = null;
    form.isRequired = true;
    form.isHidden = false;
    form.prerequisiteItemId = '';
    form.isSequential = true;
    linkedContentId.value = null;
  }
});

async function handleSubmit() {
  if (!isValid.value) return;
  
  saving.value = true;
  try {
    await emit('save', { ...form });
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
@import "./ItemFormModal.css";
</style>