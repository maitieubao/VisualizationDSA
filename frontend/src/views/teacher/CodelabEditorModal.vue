<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="$emit('update:show', false)">
      <div class="modal-container modal-xl">
        <div class="modal-header">
          <h3 class="modal-title">
            <BaseIcon :name="editingCodelab ? 'edit' : 'plus'" class="w-5 h-5 inline mr-2" />
            {{ editingCodelab ? 'Chá»‰nh sá»­a Codelab' : 'Táº¡o Codelab má»›i' }}
          </h3>
          <button type="button" class="modal-close" @click="$emit('update:show', false)">
            <BaseIcon name="x" class="w-5 h-5" />
          </button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="modal-body">
          
          <div class="form-field">
            <label class="form-label">TiÃªu Ä‘á» <span class="text-rose-400">*</span></label>
            <input v-model="form.title" type="text" class="form-input" placeholder="VD: CÃ i Ä‘áº·t Bubble Sort" required maxlength="200" />
            <p class="form-hint">{{ form.title.length }}/200 kÃ½ tá»±</p>
          </div>
          
          <div class="form-field">
            <label class="form-label">MÃ´ táº£ <span class="text-rose-400">*</span></label>
            <textarea v-model="form.description" class="form-input form-textarea" placeholder="MÃ´ táº£ chi tiáº¿t bÃ i toÃ¡n..." rows="3" required maxlength="2000"></textarea>
            <p class="form-hint">{{ form.description.length }}/2000 kÃ½ tá»±</p>
          </div>
          
          <div class="form-row">
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
            <div class="form-field">
              <label class="form-label">XP ThÆ°á»Ÿng <span class="text-rose-400">*</span></label>
              <input v-model.number="form.xpReward" type="number" class="form-input" min="10" max="500" required />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-field">
              <label class="form-label">Giá»›i háº¡n thá»i gian (ms)</label>
              <input v-model.number="form.maxRuntimeMs" type="number" class="form-input" min="100" max="10000" />
            </div>
            <div class="form-field">
              <label class="form-label">Giá»›i háº¡n bá»™ nhá»› (bytes)</label>
              <input v-model.number="form.maxMemoryBytes" type="number" class="form-input" min="1000000" max="536870912" />
            </div>
          </div>
          
          <div class="form-field">
            <label class="form-label">NgÃ´n ngá»¯ cho phÃ©p</label>
            <input v-model="form.allowedLanguages" type="text" class="form-input" placeholder="csharp,python,java,javascript,cpp,go" />
            <p class="form-hint">CÃ¡ch nhau bá»Ÿi dáº¥u pháº©y. Máº·c Ä‘á»‹nh: csharp,python,java,javascript</p>
          </div>
          
          
          <div class="form-section">
            <h4 class="form-section-title">
              <BaseIcon name="code" class="w-4 h-4 inline mr-1" />
              Code máº«u (Initial Code)
            </h4>
            <CustomMarkdownEditor 
              v-model="form.initialCode" 
              :placeholder="'Code máº«u cho há»c viÃªn...'"
              :height="200"
            />
          </div>
          
          
          <div class="form-row">
            <div class="form-field">
              <label class="form-label">RÃ ng buá»™c (Constraints)</label>
              <textarea v-model="form.constraints" class="form-input form-textarea" placeholder="N â‰¤ 1000&#10;Time Limit: 1s&#10;Memory Limit: 128MB" rows="4"></textarea>
            </div>
            <div class="form-field">
              <label class="form-label">VÃ­ dá»¥ (Examples - JSON)</label>
              <textarea v-model="form.examples" class="form-input form-textarea" placeholder='[{"input": "[5,2,9,1,5,6]", "output": "[1,2,5,5,6,9]", "explanation": "Sáº¯p xáº¿p tÄƒng dáº§n"}]' rows="4"></textarea>
              <p class="form-hint">Äá»‹nh dáº¡ng JSON: [{"input": "...", "output": "...", "explanation": "..."}]</p>
            </div>
          </div>
          
          
          <div class="form-section">
            <h4 class="form-section-title">
              <BaseIcon name="lightbulb" class="w-4 h-4 inline mr-1" />
              Gá»£i Ã½ (Hints - cÃ³ thá»ƒ tiered vá»›i XP cost)
            </h4>
            <div v-if="form.hints.length === 0" class="text-center py-4 text-slate-500">
              ChÆ°a cÃ³ gá»£i Ã½ nÃ o. <button type="button" class="text-indigo-400 hover:underline" @click="addHint">ThÃªm gá»£i Ã½ Ä‘áº§u tiÃªn</button>
            </div>
            <div v-else class="space-y-3">
              <div v-for="(hint, idx) in form.hints" :key="idx" class="hint-row p-3 rounded-lg border border-white/5 bg-slate-950/50 flex items-start gap-3">
                <span class="text-sm text-slate-400 font-mono w-6">{{ idx + 1 }}.</span>
                <div class="flex-1 min-w-0 space-y-2">
                  <input v-model="hint.content" type="text" class="form-input" :placeholder="`Gá»£i Ã½ ${idx + 1}...`" required />
                  <div class="flex items-center gap-3">
                    <label class="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                      <input type="checkbox" v-model="hint.isTiered" class="form-checkbox" />
                      <span>Gá»£i Ã½ tiered (tá»‘n XP)</span>
                    </label>
                    <div v-if="hint.isTiered" class="flex items-center gap-2">
                      <label class="text-xs text-slate-400">XP cost:</label>
                      <input v-model.number="hint.xpCost" type="number" class="form-input w-20" min="1" max="50" required />
                    </div>
                  </div>
                </div>
                <button type="button" class="btn-action-icon text-rose-400 hover:text-rose-300 p-1.5" @click="removeHint(idx)" title="XÃ³a gá»£i Ã½">
                  <BaseIcon name="trash-2" class="w-4 h-4" />
                </button>
              </div>
            </div>
            <button type="button" class="btn-secondary text-sm mt-2" @click="addHint">
              <BaseIcon name="plus" class="w-4 h-4 inline mr-1" /> ThÃªm gá»£i Ã½
            </button>
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
              <span v-else>{{ editingCodelab ? 'Cáº­p nháº­t Codelab' : 'Táº¡o Codelab' }}</span>
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
import CustomMarkdownEditor from '@/components/editor/CustomMarkdownEditor.vue';

interface Props {
  show: boolean;
  editingCodelab: any | null;
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
  difficulty: 1,
  xpReward: 50,
  maxRuntimeMs: 2000,
  maxMemoryBytes: 134217728,
  allowedLanguages: 'csharp,python,java,javascript',
  initialCode: '',
  constraints: '',
  examples: '',
  hints: [] as Array<{ content: string; isTiered: boolean; xpCost: number }>
});

watch(() => props.show, (newShow) => {
  if (newShow && props.editingCodelab) {
    const c = props.editingCodelab;
    form.title = c.title;
    form.description = c.description;
    form.difficulty = c.difficulty;
    form.xpReward = c.xpReward;
    form.maxRuntimeMs = c.maxRuntimeMs;
    form.maxMemoryBytes = c.maxMemoryBytes;
    form.allowedLanguages = c.allowedLanguages;
    form.initialCode = c.initialCode;
    form.constraints = c.constraints;
    form.examples = c.examples;
    form.hints = (c.hints || []).map((h: any) => ({
      content: h.content,
      isTiered: h.isTiered,
      xpCost: h.xpCost
    }));
  } else if (newShow) {
    form.title = '';
    form.description = '';
    form.difficulty = 1;
    form.xpReward = 50;
    form.maxRuntimeMs = 2000;
    form.maxMemoryBytes = 134217728;
    form.allowedLanguages = 'csharp,python,java,javascript';
    form.initialCode = '';
    form.constraints = '';
    form.examples = '';
    form.hints = [];
  }
});

function addHint() {
  form.hints.push({ content: '', isTiered: false, xpCost: 5 });
}

function removeHint(idx: number) {
  form.hints.splice(idx, 1);
}

async function handleSubmit() {
  if (!form.title.trim() || !form.description.trim()) {
    alert('TiÃªu Ä‘á» vÃ  mÃ´ táº£ khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng');
    return;
  }
  if (form.hints.some(h => !h.content.trim())) {
    alert('Táº¥t cáº£ gá»£i Ã½ pháº£i cÃ³ ná»™i dung');
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
@import "./CodelabEditorModal.css";
</style>