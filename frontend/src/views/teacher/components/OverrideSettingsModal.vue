<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="$emit('update:show', false)">
      <div class="modal-container modal-md">
        <div class="modal-header">
          <h3 class="modal-title">
            <BaseIcon name="settings" class="w-5 h-5 inline mr-2" />
            Cài đặt nâng cao: {{ item?.overrideTitle || item?.lessonTitle || item?.quizTitle || item?.codelabTitle }}
          </h3>
          <button type="button" class="modal-close" @click="$emit('update:show', false)">
            <BaseIcon name="x" class="w-5 h-5" />
          </button>
        </div>
        
        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div class="form-section">
              <h4 class="form-section-title">
                <BaseIcon name="lock" class="w-4 h-4" />
                Điều kiện mở khóa (Unlock Conditions)
              </h4>
              
              <div class="form-field">
                <label class="form-label">Mở khóa vào lúc (Unlock At)</label>
                <input 
                  v-model="form.unlockAt" 
                  type="datetime-local" 
                  class="form-input"
                  @change="updateUnlockAt"
                >
                <p class="form-hint">Học viên chỉ thấy bài học sau thời điểm này. Để trống để mở ngay khi module mở.</p>
              </div>
              
              <div class="form-field">
                <label class="form-label">Điều kiện tiên quyết (Prerequisite)</label>
                <select v-model="form.prerequisiteItemId" class="form-input">
                  <option value="">Không có (Mở ngay khi module mở)</option>
                  <option 
                    v-for="m in prerequisiteOptions" 
                    :key="m.id" 
                    :value="m.id"
                  >
                    {{ m.overrideTitle || m.lessonTitle || m.quizTitle || m.codelabTitle || 'Untitled' }} (Bước {{ prerequisiteOptions.indexOf(m) + 1 }})
                  </option>
                </select>
                <p class="form-hint">Chỉ mở khi bài học được chọn đã hoàn thành.</p>
              </div>
              
              <div class="form-field">
                <label class="form-label flex items-center gap-2 cursor-pointer">
                  <input 
                    v-model="form.isSequential" 
                    type="checkbox" 
                    class="form-checkbox"
                  >
                  <span>Yêu cầu hoàn thành theo thứ tự (Sequential)</span>
                </label>
                <p class="form-hint">Học viên phải hoàn thành bài trước mới được làm bài sau trong cùng module.</p>
              </div>
            </div>
            
            <div class="form-section">
              <h4 class="form-section-title">
                <BaseIcon name="calendar" class="w-4 h-4" />
                Hạn nộp & Giới hạn lần làm
              </h4>
              
              <div class="form-field">
                <label class="form-label">Hạn nộp (Due Date)</label>
                <input 
                  v-model="form.dueAt" 
                  type="datetime-local" 
                  class="form-input"
                  @change="updateDueAt"
                >
                <p class="form-hint">Sau thời điểm này, học viên có thể bị chặn nộp hoặc bị trừ điểm (tùy cấu hình).</p>
              </div>
              
              <div class="form-field">
                <label class="form-label">Số lần làm tối đa (Max Attempts)</label>
                <input 
                  v-model.number="form.maxAttempts" 
                  type="number" 
                  min="1" 
                  max="100"
                  class="form-input"
                  placeholder="Không giới hạn"
                >
                <p class="form-hint">Chỉ áp dụng cho Quiz và Codelab. Để trống = không giới hạn.</p>
              </div>
            </div>
            
            <div class="form-section">
              <h4 class="form-section-title">
                <BaseIcon name="eye" class="w-4 h-4" />
                Hiển thị
              </h4>
              
              <div class="form-field">
                <label class="form-label flex items-center gap-2 cursor-pointer">
                  <input 
                    v-model="form.isHidden" 
                    type="checkbox" 
                    class="form-checkbox"
                  >
                  <span>Ẩn khỏi học viên (Chỉ giáo viên thấy)</span>
                </label>
                <p class="form-hint">Dùng để chuẩn bị nội dung hoặc ẩn bài học cũ.</p>
              </div>
              
              <div class="form-field">
                <label class="form-label flex items-center gap-2 cursor-pointer">
                  <input 
                    v-model="form.isRequired" 
                    type="checkbox" 
                    class="form-checkbox"
                  >
                  <span>Bắt buộc (Required)</span>
                </label>
                <p class="form-hint">Học viên phải hoàn thành bài này mới được tính hoàn thành module.</p>
              </div>
            </div>
            
            <div class="form-section">
              <h4 class="form-section-title">
                <BaseIcon name="edit-2" class="w-4 h-4" />
                Ghi đè tiêu đề & mô tả
              </h4>
              
              <div class="form-field">
                <label class="form-label">Tiêu đề hiển thị cho học viên</label>
                <input 
                  v-model="form.overrideTitle" 
                  type="text" 
                  class="form-input"
                  placeholder="Để trống để dùng tiêu đề gốc"
                >
              </div>
              
              <div class="form-field">
                <label class="form-label">Mô tả hiển thị cho học viên</label>
                <textarea 
                  v-model="form.overrideDescription" 
                  class="form-input form-textarea"
                  rows="3"
                  placeholder="Để trống để dùng mô tả gốc"
                ></textarea>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="$emit('update:show', false)">
              Hủy
            </button>
            <button type="submit" class="btn-primary" :disabled="saving">
              <span v-if="saving" class="flex items-center gap-2">
                <span class="spinner-sm"></span>
                Đang lưu...
              </span>
              <span v-else>Lưu cài đặt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import BaseIcon from '@/shared/components/BaseIcon.vue';

interface Props {
  show: boolean;
  item: any;
  module: any;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'save', data: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const saving = ref(false);

// LS-016: dùng đúng tên field isHidden (khớp interface ClassroomModuleItem) —
// không còn isHiddenForStudent gây mất persist khi toggle.
const form = ref({
  unlockAt: '',
  dueAt: '',
  maxAttempts: null as number | null,
  isHidden: false,
  isRequired: true,
  isSequential: true,
  prerequisiteItemId: '',
  overrideTitle: '',
  overrideDescription: ''
});

// LS-032: lọc bỏ chính item đang chỉnh sửa khỏi danh sách prerequisite (chống tự khóa vòng).
const prerequisiteOptions = computed(() => {
  const items = props.module?.items ?? [];
  return items.filter((m: any) => !props.item || m.id !== props.item.id);
});

watch(() => props.show, (newShow) => {
  if (newShow && props.item) {
    const item = props.item;
    form.value.unlockAt = item.unlockAt ? new Date(item.unlockAt).toISOString().slice(0, 16) : '';
    form.value.dueAt = item.dueAt ? new Date(item.dueAt).toISOString().slice(0, 16) : '';
    form.value.maxAttempts = item.maxAttempts;
    form.value.isHidden = !!item.isHidden;
    form.value.isRequired = item.isRequired;
    form.value.isSequential = item.isSequential;
    form.value.prerequisiteItemId = item.prerequisiteItemId || '';
    form.value.overrideTitle = item.overrideTitle || '';
    form.value.overrideDescription = item.overrideDescription || '';
  } else if (newShow) {
    
    form.value = {
      unlockAt: '',
      dueAt: '',
      maxAttempts: null,
      isHidden: false,
      isRequired: true,
      isSequential: true,
      prerequisiteItemId: '',
      overrideTitle: '',
      overrideDescription: ''
    };
  }
});

function updateUnlockAt() {
  
}

function updateDueAt() {
  
}

async function handleSubmit() {
  saving.value = true;
  try {
    emit('save', { ...form.value });
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
@import "./OverrideSettingsModal.css";
</style>