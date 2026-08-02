<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="$emit('update:show', false)">
      <div class="modal-container modal-lg">
        <div class="modal-header">
          <h3 class="modal-title">
            <BaseIcon :name="editingQuestion ? 'edit' : 'plus'" class="w-5 h-5 inline mr-2" />
            {{ editingQuestion ? 'Chỉnh sửa Câu hỏi' : 'Thêm Câu hỏi mới' }}
          </h3>
          <button type="button" class="modal-close" @click="$emit('update:show', false)">
            <BaseIcon name="x" class="w-5 h-5" />
          </button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="modal-body">
          <div class="form-field">
            <label class="form-label">Câu hỏi <span class="text-accent-red">*</span></label>
            <textarea v-model="form.question" class="form-input form-textarea" placeholder="Nhập câu hỏi..." rows="3" required maxlength="500"></textarea>
            <p class="form-hint">{{ form.question.length }}/500 ký tự</p>
          </div>
          
          <div class="form-field">
            <label class="form-label">Đáp án (tối thiểu 2, tối đa 6) <span class="text-accent-red">*</span></label>
            <div class="options-list space-y-3">
              <div v-for="(opt, idx) in form.options" :key="idx" class="flex items-center gap-3">
                <span class="text-sm text-text-muted font-mono w-6">{{ idx + 1 }}.</span>
                <input 
                  v-model="form.options[idx]" 
                  type="text" 
                  class="form-input flex-1" 
                  :placeholder="'Đáp án ' + (idx + 1)" 
                  required 
                  maxlength="200"
                />
                <button type="button" class="btn-action-icon text-text-muted hover:text-accent-red" @click="removeOption(idx)" :disabled="form.options.length <= 2" title="Xóa đáp án">
                  <BaseIcon name="trash-2" class="w-4 h-4" />
                </button>
              </div>
            </div>
            <button type="button" class="btn-secondary text-sm mt-2" @click="addOption" :disabled="form.options.length >= 6">
              <BaseIcon name="plus" class="w-4 h-4 inline mr-1" /> Thêm đáp án
            </button>
          </div>
          
          <div class="form-field">
            <label class="form-label">Đáp án đúng <span class="text-accent-red">*</span></label>
            <select v-model.number="form.correctIndex" class="form-select" required>
              <option v-for="(opt, idx) in form.options" :key="idx" :value="idx">
                {{ idx + 1 }}. {{ opt }}
              </option>
            </select>
          </div>
          
          <div class="form-field">
            <label class="form-label">Giải thích</label>
            <textarea v-model="form.explanation" class="form-input form-textarea" placeholder="Giải thích tại sao đáp án này đúng..." rows="3" maxlength="1000"></textarea>
            <p class="form-hint">{{ form.explanation.length }}/1000 ký tự</p>
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
              <span v-else>{{ editingQuestion ? 'Cập nhật Câu hỏi' : 'Thêm Câu hỏi' }}</span>
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
  editingQuestion: any | null;
  parentQuiz: any | null;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'save', data: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const saving = ref(false);

const form = reactive({
  question: '',
  options: ['', ''],
  correctIndex: 0,
  explanation: ''
});

function addOption() {
  if (form.options.length < 6) {
    form.options.push('');
  }
}

function removeOption(idx: number) {
  if (form.options.length > 2) {
    form.options.splice(idx, 1);
    if (form.correctIndex >= idx && form.correctIndex > 0) {
      form.correctIndex--;
    }
  }
}

watch(() => props.show, (newShow) => {
  if (newShow && props.editingQuestion) {
    const q = props.editingQuestion;
    form.question = q.question;
    form.options = [...(q.options || ['', ''])];
    form.correctIndex = q.correctIndex || 0;
    form.explanation = q.explanation || '';
  } else if (newShow) {
    form.question = '';
    form.options = ['', ''];
    form.correctIndex = 0;
    form.explanation = '';
  }
});

async function handleSubmit() {
  if (!form.question.trim()) {
    alert('Câu hỏi không được để trống');
    return;
  }
  if (form.options.some((opt: string) => !opt.trim())) {
    alert('Tất cả đáp án phải được điền');
    return;
  }
  
  saving.value = true;
  try {
    await emit('save', { ...form });
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
@import "./QuestionFormModal.css";
</style>