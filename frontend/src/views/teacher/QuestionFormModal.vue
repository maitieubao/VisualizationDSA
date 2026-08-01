<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="$emit('update:show', false)">
      <div class="modal-container modal-lg">
        <div class="modal-header">
          <h3 class="modal-title">
            <BaseIcon :name="editingQuestion ? 'edit' : 'plus'" class="w-5 h-5 inline mr-2" />
            {{ editingQuestion ? 'Chá»‰nh sá»­a CÃ¢u há»i' : 'ThÃªm CÃ¢u há»i má»›i' }}
          </h3>
          <button type="button" class="modal-close" @click="$emit('update:show', false)">
            <BaseIcon name="x" class="w-5 h-5" />
          </button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="modal-body">
          <div class="form-field">
            <label class="form-label">CÃ¢u há»i <span class="text-rose-400">*</span></label>
            <textarea v-model="form.question" class="form-input form-textarea" placeholder="Nháº­p cÃ¢u há»i..." rows="3" required maxlength="500"></textarea>
            <p class="form-hint">{{ form.question.length }}/500 kÃ½ tá»±</p>
          </div>
          
          <div class="form-field">
            <label class="form-label">ÄÃ¡p Ã¡n (tá»‘i thiá»ƒu 2, tá»‘i Ä‘a 6) <span class="text-rose-400">*</span></label>
            <div class="options-list space-y-3">
              <div v-for="(opt, idx) in form.options" :key="idx" class="flex items-center gap-3">
                <span class="text-sm text-slate-400 font-mono w-6">{{ idx + 1 }}.</span>
                <input 
                  v-model="form.options[idx]" 
                  type="text" 
                  class="form-input flex-1" 
                  :placeholder="'ÄÃ¡p Ã¡n ' + (idx + 1)" 
                  required 
                  maxlength="200"
                />
                <button type="button" class="btn-action-icon text-slate-400 hover:text-rose-400" @click="removeOption(idx)" :disabled="form.options.length <= 2" title="XÃ³a Ä‘Ã¡p Ã¡n">
                  <BaseIcon name="trash-2" class="w-4 h-4" />
                </button>
              </div>
            </div>
            <button type="button" class="btn-secondary text-sm mt-2" @click="addOption" :disabled="form.options.length >= 6">
              <BaseIcon name="plus" class="w-4 h-4 inline mr-1" /> ThÃªm Ä‘Ã¡p Ã¡n
            </button>
          </div>
          
          <div class="form-field">
            <label class="form-label">ÄÃ¡p Ã¡n Ä‘Ãºng <span class="text-rose-400">*</span></label>
            <select v-model.number="form.correctIndex" class="form-select" required>
              <option v-for="(opt, idx) in form.options" :key="idx" :value="idx">
                {{ idx + 1 }}. {{ opt }}
              </option>
            </select>
          </div>
          
          <div class="form-field">
            <label class="form-label">Giáº£i thÃ­ch</label>
            <textarea v-model="form.explanation" class="form-input form-textarea" placeholder="Giáº£i thÃ­ch táº¡i sao Ä‘Ã¡p Ã¡n nÃ y Ä‘Ãºng..." rows="3" maxlength="1000"></textarea>
            <p class="form-hint">{{ form.explanation.length }}/1000 kÃ½ tá»±</p>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="$emit('update:show', false)">
              Há»§y
            </button>
            <button type="submit" class="btn-primary" :disabled="saving">
              <span v-if="saving" class="flex items-center gap-2">
                <span class="spinner-sm"></span>
                Äang lÆ°u...
              </span>
              <span v-else>{{ editingQuestion ? 'Cáº­p nháº­t CÃ¢u há»i' : 'ThÃªm CÃ¢u há»i' }}</span>
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
    alert('CÃ¢u há»i khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng');
    return;
  }
  if (form.options.some((opt: string) => !opt.trim())) {
    alert('Táº¥t cáº£ Ä‘Ã¡p Ã¡n pháº£i Ä‘Æ°á»£c Ä‘iá»n');
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