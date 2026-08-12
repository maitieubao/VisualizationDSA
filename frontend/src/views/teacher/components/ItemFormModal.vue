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
                @click="form.itemType = type.value"
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
                :disabled="optionsLoading || !linkedContentOptions.length"
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
              <p v-if="optionsLoading" class="form-hint">
                Đang tải danh sách {{ linkedContentLabel.toLowerCase() }}...
              </p>
              <p v-else-if="!linkedContentOptions.length" class="form-hint">
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
            
            
            <div class="form-field" v-if="prerequisiteOptions.length > 1">
              <label class="form-label">Điều kiện mở khóa (Prerequisite)</label>
              <select v-model="form.prerequisiteItemId" class="form-input">
                <option value="">Không có (Mở ngay khi module mở)</option>
                <option 
                  v-for="item in prerequisiteOptions" 
                  :key="item.id" 
                  :value="item.id"
                >
                  {{ item.overrideTitle || item.lessonTitle || item.quizTitle || item.codelabTitle || 'Untitled' }} (Bước {{ prerequisiteOptions.indexOf(item) + 1 }})
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

interface LinkedOption {
  id: string;
  title: string;
  sandboxType?: string;
}

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
// LS-005: danh sách nội dung liên kết nạp THẬT từ API (thay vì return [] vô hiệu).
const linkedContentOptions = ref<LinkedOption[]>([]);
const optionsLoading = ref(false);

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

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

// LS-032: prerequisite không được chọn chính item đang edit (chống tự khóa vòng).
const prerequisiteOptions = computed(() => {
  const items = props.parentModule?.items ?? [];
  return items.filter((i: any) => !props.editingItem || i.id !== props.editingItem.id);
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

// ── LS-005: nạp danh sách Lesson/Quiz/Codelab thật từ API ──
async function loadLinkedContentOptions() {
  optionsLoading.value = true;
  linkedContentOptions.value = [];
  linkedContentId.value = getLinkedContentId();
  try {
    if (form.itemType === 'Lesson') {
      const res = await fetch(`${BASE_URL}/api/v1/concepts/courses`, { headers: getAuthHeaders() });
      if (res.ok) {
        const courses = await res.json();
        const published = (Array.isArray(courses) ? courses : courses.items ?? [])
          .filter((c: any) => c.isPublished && !c.isDeleted);
        const perCourse = await Promise.all(
          published.map(async (c: any) => {
            try {
              const detailRes = await fetch(`${BASE_URL}/api/v1/concepts/courses/${c.id}`, { headers: getAuthHeaders() });
              if (!detailRes.ok) return [] as LinkedOption[];
              const detail = await detailRes.json();
              return (detail.lessons ?? []).map((l: any): LinkedOption => ({
                id: l.id,
                title: l.title,
                sandboxType: l.sandboxType
              }));
            } catch {
              return [] as LinkedOption[];
            }
          })
        );
        linkedContentOptions.value = perCourse.flat();
      }
    } else if (form.itemType === 'Quiz') {
      const res = await fetch(`${BASE_URL}/api/v1/quizzes`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        const quizzes = data.quizzes ?? data ?? [];
        linkedContentOptions.value = (Array.isArray(quizzes) ? quizzes : [])
          .map((q: any): LinkedOption => ({ id: q.id, title: q.title }));
      }
    } else if (form.itemType === 'Codelab') {
      const res = await fetch(`${BASE_URL}/api/v1/codelabs?page=1&pageSize=100`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        const codelabs = Array.isArray(data) ? data : (data.items ?? []);
        linkedContentOptions.value = codelabs.map((c: any): LinkedOption => ({
          id: c.id,
          title: c.title,
          sandboxType: c.language || c.allowedLanguages
        }));
      }
    }
  } catch {
    // Giữ danh sách rỗng — form hiển thị gợi ý "tạo trước ở tab quản lý".
  } finally {
    optionsLoading.value = false;
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
    void loadLinkedContentOptions();
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
    void loadLinkedContentOptions();
  }
});

// Đổi loại nội dung → nạp lại danh sách tương ứng + reset liên kết đang chọn.
watch(() => form.itemType, (newType) => {
  if (newType === 'CustomLesson' || !props.show) return;
  form.lessonId = null;
  form.quizId = null;
  form.codelabId = null;
  linkedContentId.value = null;
  void loadLinkedContentOptions();
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