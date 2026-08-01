<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="$emit('update:show', false)">
      <div class="modal-container modal-lg">
        <div class="modal-header">
          <h3 class="modal-title">
            <BaseIcon :name="editingQuiz ? 'edit' : 'plus'" class="w-5 h-5 inline mr-2" />
            {{ editingQuiz ? 'Chá»‰nh sá»­a Quiz' : 'Táº¡o Quiz má»›i' }}
          </h3>
          <button type="button" class="modal-close" @click="$emit('update:show', false)">
            <BaseIcon name="x" class="w-5 h-5" />
          </button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="modal-body">
          <div class="form-field">
            <label class="form-label">TiÃªu Ä‘á» Quiz <span class="text-rose-400">*</span></label>
            <input v-model="form.title" type="text" class="form-input" placeholder="VD: Kiá»ƒm tra kiáº¿n thá»©c Bubble Sort" required maxlength="200" />
            <p class="form-hint">{{ form.title.length }}/200 kÃ½ tá»±</p>
          </div>
          
          <div class="form-field">
            <label class="form-label">MÃ´ táº£</label>
            <textarea v-model="form.description" class="form-input form-textarea" placeholder="MÃ´ táº£ ngáº¯n gá»n vá» quiz..." rows="3" maxlength="1000"></textarea>
            <p class="form-hint">{{ form.description.length }}/1000 kÃ½ tá»±</p>
          </div>
          
          <div class="form-row">
            <div class="form-field">
              <label class="form-label">Chá»§ Ä‘á» <span class="text-rose-400">*</span></label>
              <select v-model="form.topic" class="form-select" required>
                <option value="">Chá»n chá»§ Ä‘á»</option>
                <option v-for="t in topics" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Äá»™ khÃ³ <span class="text-rose-400">*</span></label>
              <select v-model.number="form.difficulty" class="form-select" required>
                <option value="1">1 - Dá»…</option>
                <option value="2">2 - Dá»…</option>
                <option value="3">3 - Trung bÃ¬nh</option>
                <option value="4">4 - KhÃ³</option>
                <option value="5">5 - Ráº¥t khÃ³</option>
              </select>
            </div>
          </div>
          
          <div class="form-field">
            <label class="form-label">XP ThÆ°á»Ÿng <span class="text-rose-400">*</span></label>
            <input v-model.number="form.xpReward" type="number" class="form-input" min="10" max="500" required />
            <p class="form-hint">Äiá»ƒm kinh nghiá»‡m há»c viÃªn nháº­n Ä‘Æ°á»£c khi hoÃ n thÃ nh</p>
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
              <span v-else>{{ editingQuiz ? 'Cáº­p nháº­t Quiz' : 'Táº¡o Quiz' }}</span>
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
    alert('TiÃªu Ä‘á» vÃ  chá»§ Ä‘á» khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng');
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