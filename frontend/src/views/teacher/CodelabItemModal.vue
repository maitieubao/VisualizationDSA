<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="$emit('update:show', false)">
      <div class="modal-container modal-lg">
        <div class="modal-header">
          <h3 class="modal-title">
            <BaseIcon :name="editingTestCaseModalType === 'testcase' ? 'database' : Type === 'template' ? 'file-text' : 'lightbulb'" class="w-5 h-5 inline mr-2" />
            {{ Type === 'testcase' ? 'Testcase' : Type === 'template' ? 'Template' : 'Gá»£i Ã½' }}: {{ editingItem ? 'Chá»‰nh sá»­a' : 'ThÃªm má»›i' }}
          </h3>
          <button type="button" class="modal-close" @click="$emit('update:show', false)">
            <BaseIcon name="x" class="w-5 h-5" />
          </button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="modal-body">
          <template v-if="Type === 'testcase'">
            <div class="form-field">
              <label class="form-label">Input <span class="text-rose-400">*</span></label>
              <textarea v-model="form.input" class="form-input form-textarea font-mono text-sm" placeholder="Input test case (VD: [5,2,9,1,5,6])" rows="4" required maxlength="5000"></textarea>
            </div>
            
            <div class="form-field">
              <label class="form-label">Expected Output <span class="text-rose-400">*</span></label>
              <textarea v-model="form.expectedOutput" class="form-input form-textarea font-mono text-sm" placeholder="Expected output (VD: [1,2,5,5,6,9])" rows="4" required maxlength="5000"></textarea>
            </div>
            
            <div class="form-row">
              <div class="form-field">
                <label class="form-label">Thá»© tá»± <span class="text-rose-400">*</span></label>
                <input v-model.number="form.orderIndex" type="number" class="form-input" min="1" required />
              </div>
              <div class="form-field">
                <label class="form-label flex items-center gap-2 cursor-pointer">
                  <input v-model="form.isHidden" type="checkbox" class="form-checkbox" />
                  <span>áº¨n test case (chá»‰ dÃ¹ng cho grading)</span>
                </label>
              </div>
            </div>
          </template>
          
          <template v-if="Type === 'template'">
            <div class="form-field">
              <label class="form-label">NgÃ´n ngá»¯ <span class="text-rose-400">*</span></label>
              <select v-model="form.language" class="form-select" required>
                <option value="">Chá»n ngÃ´n ngá»¯</option>
                <option value="csharp">C#</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="javascript">JavaScript</option>
                <option value="cpp">C++</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="typescript">TypeScript</option>
              </select>
            </div>
            
            <div class="form-field">
              <label class="form-label">Starter Code <span class="text-rose-400">*</span></label>
              <CustomMarkdownEditor 
                v-model="form.starterCode" 
                :placeholder="'Starter code cho há»c viÃªn...'"
                :height="250"
              />
            </div>
            
            <div class="form-field">
              <label class="form-label">Solution Code (Ä‘Ã¡p Ã¡n)</label>
              <CustomMarkdownEditor 
                v-model="form.solutionCode" 
                :placeholder="'Solution code (Ä‘Ã¡p Ã¡n máº«u)...'"
                :height="250"
              />
            </div>
          </template>
          
          <template v-if="Type === 'hint'">
            <div class="form-field">
              <label class="form-label">Ná»™i dung gá»£i Ã½ <span class="text-rose-400">*</span></label>
              <textarea v-model="form.content" class="form-input form-textarea" placeholder="Ná»™i dung gá»£i Ã½..." rows="4" required maxlength="2000"></textarea>
            </div>
            
            <div class="form-row">
              <div class="form-field">
                <label class="form-label">Thá»© tá»± <span class="text-rose-400">*</span></label>
                <input v-model.number="form.orderIndex" type="number" class="form-input" min="1" required />
              </div>
              <div class="form-field">
                <label class="form-label flex items-center gap-2 cursor-pointer">
                  <input v-model="form.isTiered" type="checkbox" class="form-checkbox" />
                  <span>Gá»£i Ã½ tiered (tá»‘n XP)</span>
                </label>
              </div>
            </div>
            
            <div v-if="form.isTiered" class="form-field">
              <label class="form-label">XP Cost <span class="text-rose-400">*</span></label>
              <input v-model.number="form.xpCost" type="number" class="form-input" min="1" max="50" required />
              <p class="form-hint">Sá»‘ XP há»c viÃªn bá»‹ trá»« khi xem gá»£i Ã½ nÃ y</p>
            </div>
          </template>
        </form>
        
        <div class="modal-footer">
          <button type="button" class="btn-secondary" @click="$emit('update:show', false)">
            Há»§y
          </button>
          <button type="submit" class="btn-primary" :disabled="saving" form="codelab-modal-form">
            <span v-if="saving" class="flex items-center gap-2">
              <span class="spinner-sm"></span>
              Äang lÆ°u...
            </span>
            <span v-else>{{ editingItem ? 'Cáº­p nháº­t' : 'ThÃªm' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import BaseIcon from '@/shared/components/BaseIcon.vue';
import CustomMarkdownEditor from '@/components/editor/CustomMarkdownEditor.vue';

type ModalType = 'testcase' | 'template' | 'hint';

interface Props {
  show: boolean;
  Type: ModalType;
  editingItem: any | null;
  parentCodelabId: string;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'save', data: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const saving = ref(false);

const form = reactive({
  
  input: '',
  expectedOutput: '',
  orderIndex: 1,
  isHidden: false,
  
  
  language: '',
  starterCode: '',
  solutionCode: '',
  
  
  content: '',
  orderIndex: 1,
  isTiered: false,
  xpCost: 5
});

function getDefaults(Type: string) {
  switch (Type) {
    case 'testcase':
      return { input: '', expectedOutput: '', orderIndex: 1, isHidden: false };
    case 'template':
      return { language: '', starterCode: '', solutionCode: '' };
    case 'hint':
      return { content: '', orderIndex: 1, isTiered: false, xpCost: 5 };
    default:
      return {};
  }
}

watch(() => props.show, (newShow) => {
  if (newShow && props.editingItem) {
    const item = props.editingItem;
    if (props.Type === 'testcase') {
      form.input = item.input;
      form.expectedOutput = item.expectedOutput;
      form.orderIndex = item.orderIndex;
      form.isHidden = item.isHidden;
    } else if (props.Type === 'template') {
      form.language = item.language;
      form.starterCode = item.starterCode;
      form.solutionCode = item.solutionCode;
    } else if (props.Type === 'hint') {
      form.content = item.content;
      form.orderIndex = item.orderIndex;
      form.isTiered = item.isTiered;
      form.xpCost = item.xpCost;
    }
  } else if (newShow) {
    const defaults = getDefaults(props.Type);
    Object.assign(form, defaults);
  }
});

async function handleSubmit() {
  if (props.Type === 'testcase') {
    if (!form.input.trim() || !form.expectedOutput.trim()) {
      alert('Input vÃ  Expected Output khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng');
      return;
    }
  } else if (props.Type === 'template') {
    if (!form.language || !form.starterCode.trim()) {
      alert('NgÃ´n ngá»¯ vÃ  Starter Code khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng');
      return;
    }
  } else if (props.Type === 'hint') {
    if (!form.content.trim()) {
      alert('Ná»™i dung gá»£i Ã½ khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng');
      return;
    }
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
@import "./CodelabItemModal.css";
</style>