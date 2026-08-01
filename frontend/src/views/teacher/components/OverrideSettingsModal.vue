<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="$emit('update:show', false)">
      <div class="modal-container modal-md">
        <div class="modal-header">
          <h3 class="modal-title">
            <BaseIcon name="settings" class="w-5 h-5 inline mr-2" />
            CÃ i Ä‘áº·t nÃ¢ng cao: {{ item?.overrideTitle || item?.lessonTitle || item?.quizTitle || item?.codelabTitle }}
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
                Äiá»u kiá»‡n má»Ÿ khÃ³a (Unlock Conditions)
              </h4>
              
              <div class="form-field">
                <label class="form-label">Má»Ÿ khÃ³a vÃ o lÃºc (Unlock At)</label>
                <input 
                  v-model="form.unlockAt" 
                  type="datetime-local" 
                  class="form-input"
                  @change="updateUnlockAt"
                >
                <p class="form-hint">Há»c viÃªn chá»‰ tháº¥y bÃ i há»c sau thá»i Ä‘iá»ƒm nÃ y. Äá»ƒ trá»‘ng Ä‘á»ƒ má»Ÿ ngay khi module má»Ÿ.</p>
              </div>
              
              <div class="form-field">
                <label class="form-label">Äiá»u kiá»‡n tiÃªn quyáº¿t (Prerequisite)</label>
                <select v-model="form.prerequisiteItemId" class="form-input">
                  <option value="">KhÃ´ng cÃ³ (Má»Ÿ ngay khi module má»Ÿ)</option>
                  <option 
                    v-for="m in module?.items" 
                    :key="m.id" 
                    :value="m.id"
                  >
                    {{ m.overrideTitle || m.lessonTitle || m.quizTitle || m.codelabTitle || 'Untitled' }} (BÆ°á»›c {{ module.items.indexOf(m) + 1 }})
                  </option>
                </select>
                <p class="form-hint">Chá»‰ má»Ÿ khi bÃ i há»c Ä‘Æ°á»£c chá»n Ä‘Ã£ hoÃ n thÃ nh.</p>
              </div>
              
              <div class="form-field">
                <label class="form-label flex items-center gap-2 cursor-pointer">
                  <input 
                    v-model="form.isSequential" 
                    type="checkbox" 
                    class="form-checkbox"
                  >
                  <span>YÃªu cáº§u hoÃ n thÃ nh theo thá»© tá»± (Sequential)</span>
                </label>
                <p class="form-hint">Há»c viÃªn pháº£i hoÃ n thÃ nh bÃ i trÆ°á»›c má»›i Ä‘Æ°á»£c lÃ m bÃ i sau trong cÃ¹ng module.</p>
              </div>
            </div>
            
            <div class="form-section">
              <h4 class="form-section-title">
                <BaseIcon name="calendar" class="w-4 h-4" />
                Háº¡n ná»™p & Giá»›i háº¡n láº§n lÃ m
              </h4>
              
              <div class="form-field">
                <label class="form-label">Háº¡n ná»™p (Due Date)</label>
                <input 
                  v-model="form.dueAt" 
                  type="datetime-local" 
                  class="form-input"
                  @change="updateDueAt"
                >
                <p class="form-hint">Sau thá»i Ä‘iá»ƒm nÃ y, há»c viÃªn cÃ³ thá»ƒ bá»‹ cháº·n ná»™p hoáº·c bá»‹ trá»« Ä‘iá»ƒm (tÃ¹y cáº¥u hÃ¬nh).</p>
              </div>
              
              <div class="form-field">
                <label class="form-label">Sá»‘ láº§n lÃ m tá»‘i Ä‘a (Max Attempts)</label>
                <input 
                  v-model.number="form.maxAttempts" 
                  type="number" 
                  min="1" 
                  max="100"
                  class="form-input"
                  placeholder="KhÃ´ng giá»›i háº¡n"
                >
                <p class="form-hint">Chá»‰ Ã¡p dá»¥ng cho Quiz vÃ  Codelab. Äá»ƒ trá»‘ng = khÃ´ng giá»›i háº¡n.</p>
              </div>
            </div>
            
            <div class="form-section">
              <h4 class="form-section-title">
                <BaseIcon name="eye" class="w-4 h-4" />
                Hiá»ƒn thá»‹
              </h4>
              
              <div class="form-field">
                <label class="form-label flex items-center gap-2 cursor-pointer">
                  <input 
                    v-model="form.isHiddenForStudent" 
                    type="checkbox" 
                    class="form-checkbox"
                  >
                  <span>áº¨n khá»i há»c viÃªn (Chá»‰ giÃ¡o viÃªn tháº¥y)</span>
                </label>
                <p class="form-hint">DÃ¹ng Ä‘á»ƒ chuáº©n bá»‹ ná»™i dung hoáº·c áº©n bÃ i há»c cÅ©.</p>
              </div>
              
              <div class="form-field">
                <label class="form-label flex items-center gap-2 cursor-pointer">
                  <input 
                    v-model="form.isRequired" 
                    type="checkbox" 
                    class="form-checkbox"
                  >
                  <span>Báº¯t buá»™c (Required)</span>
                </label>
                <p class="form-hint">Há»c viÃªn pháº£i hoÃ n thÃ nh bÃ i nÃ y má»›i Ä‘Æ°á»£c tÃ­nh hoÃ n thÃ nh module.</p>
              </div>
            </div>
            
            <div class="form-section">
              <h4 class="form-section-title">
                <BaseIcon name="edit-2" class="w-4 h-4" />
                Ghi Ä‘Ã¨ tiÃªu Ä‘á» & mÃ´ táº£
              </h4>
              
              <div class="form-field">
                <label class="form-label">TiÃªu Ä‘á» hiá»ƒn thá»‹ cho há»c viÃªn</label>
                <input 
                  v-model="form.overrideTitle" 
                  type="text" 
                  class="form-input"
                  placeholder="Äá»ƒ trá»‘ng Ä‘á»ƒ dÃ¹ng tiÃªu Ä‘á» gá»‘c"
                >
              </div>
              
              <div class="form-field">
                <label class="form-label">MÃ´ táº£ hiá»ƒn thá»‹ cho há»c viÃªn</label>
                <textarea 
                  v-model="form.overrideDescription" 
                  class="form-input form-textarea"
                  rows="3"
                  placeholder="Äá»ƒ trá»‘ng Ä‘á»ƒ dÃ¹ng mÃ´ táº£ gá»‘c"
                ></textarea>
              </div>
            </div>
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
              <span v-else>LÆ°u cÃ i Ä‘áº·t</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
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

const form = ref({
  unlockAt: '',
  dueAt: '',
  maxAttempts: null as number | null,
  isHiddenForStudent: false,
  isRequired: true,
  isSequential: true,
  prerequisiteItemId: '',
  overrideTitle: '',
  overrideDescription: ''
});

watch(() => props.show, (newShow) => {
  if (newShow && props.item) {
    const item = props.item;
    form.value.unlockAt = item.unlockAt ? new Date(item.unlockAt).toISOString().slice(0, 16) : '';
    form.value.dueAt = item.dueAt ? new Date(item.dueAt).toISOString().slice(0, 16) : '';
    form.value.maxAttempts = item.maxAttempts;
    form.value.isHiddenForStudent = item.isHiddenForStudent || item.isHidden;
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
      isHiddenForStudent: false,
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