<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="$emit('update:show', false)">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">
            <BaseIcon :name="editingModule ? 'edit' : 'plus'" class="w-5 h-5 inline mr-2" />
            {{ editingModule ? 'Chỉnh sửa Module' : 'Tạo Module mới' }}
          </h3>
          <button type="button" class="modal-close" @click="$emit('update:show', false)">
            <BaseIcon name="x" class="w-5 h-5" />
          </button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="modal-body">
          <div class="form-field">
            <label class="form-label">Tiêu đề Module <span class="text-accent-red">*</span></label>
            <input 
              v-model="form.title" 
              type="text" 
              class="form-input" 
              placeholder="VD: Phần 1 - Cơ bản về Sắp xếp"
              required
              maxlength="200"
            />
            <p class="form-hint">{{ form.title.length }}/200 ký tự</p>
          </div>
          
          <div class="form-field">
            <label class="form-label">Mô tả</label>
            <textarea 
              v-model="form.description" 
              class="form-input form-textarea" 
              placeholder="Mô tả ngắn gọn về nội dung module..."
              rows="3"
              maxlength="2000"
            ></textarea>
            <p class="form-hint">{{ form.description.length }}/2000 ký tự</p>
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
              <label class="form-label">Mở khóa vào (tùy chọn)</label>
              <input 
                v-model="form.unlockAt" 
                type="datetime-local" 
                class="form-input"
              />
              <p class="form-hint">Để trống để mở ngay lập tức</p>
            </div>
          </div>
          
          <div class="form-field">
            <label class="form-label flex items-center gap-2 cursor-pointer">
              <input 
                v-model="form.isHidden" 
                type="checkbox" 
                class="form-checkbox"
              />
              <span>Ẩn module này khỏi học viên (chỉ giáo viên thấy)</span>
            </label>
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
              <span v-else>{{ editingModule ? 'Cập nhật' : 'Tạo Module' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import BaseIcon from '@/shared/components/BaseIcon.vue';

interface Props {
  show: boolean;
  editingModule: any | null;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'save', data: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const form = reactive({
  title: '',
  description: '',
  orderIndex: 1,
  unlockAt: '',
  isHidden: false
});

const saving = ref(false);

watch(() => props.show, (newShow) => {
  if (newShow && props.editingModule) {
    const m = props.editingModule;
    form.title = m.title;
    form.description = m.description;
    form.orderIndex = m.orderIndex;
    form.unlockAt = m.unlockAt ? new Date(m.unlockAt).toISOString().slice(0, 16) : '';
    form.isHidden = m.isHidden;
  } else if (newShow) {
    form.title = '';
    form.description = '';
    form.orderIndex = 1;
    form.unlockAt = '';
    form.isHidden = false;
  }
});

async function handleSubmit() {
  if (!form.title.trim()) return;
  
  saving.value = true;
  try {
    await emit('save', { ...form });
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
@import "./ModuleFormModal.css";
</style>