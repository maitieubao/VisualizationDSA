<template>
  <Transition name="modal-fade">
    <!-- TC-028: role=dialog + aria-modal + focus trap + Esc (useModalA11y) -->
    <div v-if="show" ref="overlayEl" class="modal-overlay" role="dialog" aria-modal="true" aria-label="Tạo hoặc chỉnh sửa quiz" @click.self="$emit('update:show', false)">
      <div class="modal-container modal-lg">
        <div class="modal-header">
          <h3 class="modal-title">
            <BaseIcon :name="editingQuiz ? 'edit' : 'plus'" class="w-5 h-5 inline mr-2" />
            {{ editingQuiz ? 'Chỉnh sửa Quiz' : 'Tạo Quiz mới' }}
          </h3>
          <button type="button" class="modal-close" @click="$emit('update:show', false)">
            <BaseIcon name="x" class="w-5 h-5" />
          </button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="modal-body">
          <div class="form-field">
            <label class="form-label">Tiêu đề Quiz <span class="text-accent-red">*</span></label>
            <input v-model="form.title" type="text" class="form-input" placeholder="VD: Kiểm tra kiến thức Bubble Sort" required maxlength="200" />
            <p class="form-hint">{{ form.title.length }}/200 ký tự</p>
          </div>
          
          <div class="form-field">
            <label class="form-label">Mô tả</label>
            <textarea v-model="form.description" class="form-input form-textarea" placeholder="Mô tả ngắn gọn về quiz..." rows="3" maxlength="1000"></textarea>
            <p class="form-hint">{{ form.description.length }}/1000 ký tự</p>
          </div>
          
          <div class="form-row">
            <div class="form-field">
              <label class="form-label">Chủ đề <span class="text-accent-red">*</span></label>
              <select v-model="form.topic" class="form-select" required>
                <option value="">Chọn chủ đề</option>
                <option v-for="t in topics" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Độ khó <span class="text-accent-red">*</span></label>
              <select v-model.number="form.difficulty" class="form-select" required>
                <option value="1">1 - Dễ</option>
                <option value="2">2 - Dễ</option>
                <option value="3">3 - Trung bình</option>
                <option value="4">4 - Khó</option>
                <option value="5">5 - Rất khó</option>
              </select>
            </div>
          </div>
          
          <div class="form-field">
            <label class="form-label">XP Thưởng <span class="text-accent-red">*</span></label>
            <input v-model.number="form.xpReward" type="number" class="form-input" min="10" max="500" required />
            <p class="form-hint">Điểm kinh nghiệm học viên nhận được khi hoàn thành</p>
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
              <span v-else>{{ editingQuiz ? 'Cập nhật Quiz' : 'Tạo Quiz' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, reactive, watch, toRef } from 'vue';
import BaseIcon from '@/shared/components/BaseIcon.vue';
import { useModalA11y } from '../../composables/useModalA11y';

interface Props {
  show: boolean;
  editingQuiz: any | null;
  topics: string[];
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'save', data: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const saving = ref(false);

// TC-028: focus trap + Esc + khóa scroll + hoàn trả focus.
const { overlayEl } = useModalA11y(toRef(props, 'show'));

const form = reactive({
  title: '',
  description: '',
  topic: '',
  difficulty: 3,
  xpReward: 50
});

watch(() => props.show, (newShow) => {
  if (newShow && props.editingQuiz) {
    const q = props.editingQuiz;
    form.title = q.title;
    form.description = q.description;
    form.topic = q.topic;
    form.difficulty = q.difficulty;
    form.xpReward = q.xpReward;
  } else if (newShow) {
    form.title = '';
    form.description = '';
    form.topic = '';
    form.difficulty = 3;
    form.xpReward = 50;
  }
});

async function handleSubmit() {
  if (!form.title.trim() || !form.topic) {
    alert('Tiêu đề và chủ đề không được để trống');
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
@import "./QuizFormModal.css";
</style>