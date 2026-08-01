<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="$emit('update:show', false)">
      <div class="modal-container modal-xl">
        <div class="modal-header">
          <h3 class="modal-title">
            <BaseIcon name="plus" class="w-5 h-5 inline mr-2" />
            Táº¡o bÃ i há»c tÃ¹y chá»‰nh cho Lá»›p: {{ classroomName }}
          </h3>
          <button type="button" class="modal-close" @click="$emit('update:show', false)">
            <BaseIcon name="x" class="w-5 h-5" />
          </button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="modal-body">
          
          <div class="step-indicator mb-6">
            <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
              <span class="step-number">1</span>
              <span class="step-label">ThÃ´ng tin cÆ¡ báº£n</span>
            </div>
            <div class="step-connector" :class="{ completed: currentStep > 1 }"></div>
            <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
              <span class="step-number">2</span>
              <span class="step-label">Ná»™i dung & LÃ½ thuyáº¿t</span>
            </div>
            <div class="step-connector" :class="{ completed: currentStep > 2 }"></div>
            <div class="step" :class="{ active: currentStep >= 3, completed: currentStep > 3 }">
              <span class="step-number">3</span>
              <span class="step-label">Hoáº¡t Ä‘á»™ng thá»±c hÃ nh</span>
            </div>
            <div class="step-connector" :class="{ completed: currentStep > 3 }"></div>
            <div class="step" :class="{ active: currentStep >= 4 }">
              <span class="step-number">4</span>
              <span class="step-label">CÃ i Ä‘áº·t & Xuáº¥t báº£n</span>
            </div>
          </div>

          
          <div v-if="currentStep === 1" class="step-content animate-fade-in">
            <h4 class="step-title">ThÃ´ng tin cÆ¡ báº£n</h4>
            
            <div class="form-field">
              <label class="form-label">TiÃªu Ä‘á» bÃ i há»c <span class="text-rose-400">*</span></label>
              <input v-model="form.title" type="text" class="form-input" placeholder="VD: Giá»›i thiá»‡u vá» Bubble Sort" required maxlength="200" />
              <p class="form-hint">{{ form.title.length }}/200 kÃ½ tá»±</p>
            </div>
            
            <div class="form-field">
              <label class="form-label">MÃ´ táº£ ngáº¯n</label>
              <textarea v-model="form.description" class="form-input form-textarea" placeholder="MÃ´ táº£ ngáº¯n gá»n vá» bÃ i há»c..." rows="3" maxlength="1000"></textarea>
              <p class="form-hint">{{ form.description.length }}/1000 kÃ½ tá»±</p>
            </div>
            
            <div class="form-row">
              <div class="form-field">
                <label class="form-label">Module <span class="text-rose-400">*</span></label>
                <select v-model="form.moduleId" class="form-select" required>
                  <option value="">Chá»n module</option>
                  <option v-for="m in modules" :key="m.id" :value="m.id">{{ m.title }}</option>
                </select>
              </div>
              <div class="form-field">
                <label class="form-label">Thá»© tá»± trong module <span class="text-rose-400">*</span></label>
                <input v-model.number="form.orderIndex" type="number" class="form-input" min="1" required />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-field">
                <label class="form-label">XP ThÆ°á»Ÿng <span class="text-rose-400">*</span></label>
                <input v-model.number="form.xpReward" type="number" class="form-input" min="10" max="500" required />
              </div>
              <div class="form-field">
                <label class="form-label">Thá»i gian Æ°á»›c tÃ­nh (phÃºt)</label>
                <input v-model.number="form.estimatedTime" type="number" class="form-input" min="5" max="180" />
              </div>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn-primary" @click="nextStep" :disabled="!isStep1Valid">
                <BaseIcon name="arrow-right" class="w-4 h-4 inline mr-1" /> BÆ°á»›c tiáº¿p theo
              </button>
            </div>
          </div>

          
          <div v-if="currentStep === 2" class="step-content animate-fade-in">
            <h4 class="step-title">Ná»™i dung & LÃ½ thuyáº¿t</h4>
            
            <div class="form-field">
              <label class="form-label">Loáº¡i ná»™i dung <span class="text-rose-400">*</span></label>
              <div class="type-selector">
                <label 
                  v-for="type in contentTypes" 
                  :key="type.value" 
                  class="type-option"
                  :class="{ active: form.contentType === type.value }"
                  @click="form.contentType = type.value"
                >
                  <BaseIcon :name="type.icon" class="w-5 h-5" />
                  <span>{{ type.label }}</span>
                </label>
              </div>
            </div>
            
            
            <div v-if="form.contentType === 'custom'" class="form-field">
              <label class="form-label">Ná»™i dung Markdown <span class="text-rose-400">*</span></label>
              <CustomMarkdownEditor 
                v-model="form.customContent" 
                :placeholder="'Viáº¿t ná»™i dung bÃ i há»c báº±ng Markdown...'"
                :height="350"
              />
            </div>
            
            
            <div v-if="form.contentType === 'theory'" class="form-field">
              <label class="form-label">Chá»n bÃ i viáº¿t lÃ½ thuyáº¿t <span class="text-rose-400">*</span></label>
              <TheoryArticlePickerModal
                v-model:show="showTheoryPicker"
                :multiple="false"
                @select="onTheorySelected"
              />
              <div v-if="form.theoryArticleId" class="selected-theory p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-semibold text-white">{{ selectedTheory?.title }}</p>
                    <p class="text-sm text-slate-400">{{ selectedTheory?.category }} â€¢ {{ selectedTheory?.readTimeMinutes }} phÃºt Ä‘á»c</p>
                  </div>
                  <button type="button" class="btn-secondary text-sm" @click="removeTheory">
                    <BaseIcon name="x" class="w-4 h-4 inline mr-1" /> Gá»¡ bá»
                  </button>
                </div>
              </div>
              <button type="button" class="btn-primary" @click="showTheoryPicker = true">
                <BaseIcon name="search" class="w-4 h-4 inline mr-1" /> Chá»n bÃ i viáº¿t lÃ½ thuyáº¿t
              </button>
            </div>
            
            
            <div class="form-section">
              <h4 class="form-section-title">
                <BaseIcon name="cube" class="w-4 h-4 inline mr-1" />
                Trá»±c quan hÃ³a (Sandbox)
              </h4>
              <div class="form-field">
                <label class="form-label">Loáº¡i Sandbox</label>
                <select v-model="form.sandboxType" class="form-select">
                  <option value="">KhÃ´ng cÃ³ trá»±c quan hÃ³a</option>
                  <option value="sorting">Sáº¯p xáº¿p (Sorting)</option>
                  <option value="graph">Äá»“ thá»‹ (Graph)</option>
                  <option value="tree">CÃ¢y (Tree)</option>
                  <option value="array">Máº£ng (Array)</option>
                  <option value="hash">Báº£ng bÄƒm (Hash)</option>
                </select>
              </div>
              <div class="form-field">
                <label class="form-label">Cáº¥u hÃ¬nh Sandbox (JSON)</label>
                <textarea v-model="form.sandboxConfig" class="form-input form-textarea font-mono text-sm" placeholder='{"initialArray": [5,2,9,1,5,6], "algorithm": "bubble"}' rows="4"></textarea>
              </div>
            </div>
            
            <div class="step-navigation">
              <button type="button" class="btn-secondary" @click="prevStep">
                <BaseIcon name="arrow-left" class="w-4 h-4 inline mr-1" /> Quay láº¡i
              </button>
              <button type="button" class="btn-primary" @click="nextStep" :disabled="!isStep2Valid">
                <BaseIcon name="arrow-right" class="w-4 h-4 inline ml-1" /> BÆ°á»›c tiáº¿p theo
              </button>
            </div>
          </div>

          
          <div v-if="currentStep === 3" class="step-content animate-fade-in">
            <h4 class="step-title">Hoáº¡t Ä‘á»™ng thá»±c hÃ nh</h4>
            
            <p class="text-slate-400 text-sm mb-6">Chá»n cÃ¡c hoáº¡t Ä‘á»™ng thá»±c hÃ nh bá»• sung cho bÃ i há»c (tÃ¹y chá»n)</p>
            
            <div class="practice-options grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <label v-for="activity in practiceActivities" :key="activity.key" class="practice-card" :class="{ selected: form.practiceActivities.includes(activity.key) }" @click="togglePracticeActivity(activity.key)">
                <div class="practice-icon">
                  <BaseIcon :name="activity.icon" class="w-8 h-8" />
                </div>
                <h5 class="font-semibold text-white">{{ activity.label }}</h5>
                <p class="text-xs text-slate-400">{{ activity.description }}</p>
                <div class="practice-check">
                  <input type="checkbox" :value="activity.key" v-model="form.practiceActivities" class="form-checkbox" />
                  <span>Chá»n</span>
                </div>
              </label>
            </div>
            
            
            <div v-if="form.practiceActivities.includes('quiz')" class="form-section">
              <h4 class="form-section-title">
                <BaseIcon name="help-circle" class="w-4 h-4 inline mr-1" />
                Cáº¥u hÃ¬nh Quiz
              </h4>
              <QuizPickerModal
                v-model:show="showQuizPicker"
                @select="onQuizSelected"
              />
              <div v-if="form.quizId" class="selected-quiz p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-semibold text-white">{{ selectedQuiz?.title }}</p>
                    <p class="text-sm text-slate-400">{{ selectedQuiz?.topic }} â€¢ Äá»™ khÃ³ {{ selectedQuiz?.difficulty }} â€¢ {{ selectedQuiz?.questionCount }} cÃ¢u</p>
                  </div>
                  <button type="button" class="btn-secondary text-sm" @click="removeQuiz">
                    <BaseIcon name="x" class="w-4 h-4 inline mr-1" /> Gá»¡ bá»
                  </button>
                </div>
              </div>
              <button type="button" class="btn-primary" @click="showQuizPicker = true" v-if="!form.quizId">
                <BaseIcon name="plus" class="w-4 h-4 inline mr-1" /> Chá»n Quiz
              </div>
            </div>
            
            
            <div v-if="form.practiceActivities.includes('codelab')" class="form-section">
              <h4 class="form-section-title">
                <BaseIcon name="code" class="w-4 h-4 inline mr-1" />
                Cáº¥u hÃ¬nh Codelab
              </h4>
              <CodelabPickerModal
                v-model:show="showCodelabPicker"
                @select="onCodelabSelected"
              />
              <div v-if="form.codelabId" class="selected-codelab p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-semibold text-white">{{ selectedCodelab?.title }}</p>
                    <p class="text-sm text-slate-400">{{ selectedCodelab?.difficulty }} â€¢ {{ selectedCodelab?.testCaseCount }} testcases</p>
                  </div>
                  <button type="button" class="btn-secondary text-sm" @click="removeCodelab">
                    <BaseIcon name="x" class="w-4 h-4 inline mr-1" /> Gá»¡ bá»
                  </button>
                </div>
              </div>
              <button type="button" class="btn-primary" @click="showCodelabPicker = true" v-if="!form.codelabId">
                <BaseIcon name="plus" class="w-4 h-4 inline mr-1" /> Chá»n Codelab
              </div>
            </div>
            
            <div class="step-navigation">
              <button type="button" class="btn-secondary" @click="prevStep">
                <BaseIcon name="arrow-left" class="w-4 h-4 inline mr-1" /> Quay láº¡i
              </button>
              <button type="button" class="btn-primary" @click="nextStep">
                <BaseIcon name="arrow-right" class="w-4 h-4 inline ml-1" /> BÆ°á»›c tiáº¿p theo
              </button>
            </div>
          </div>

          
          <div v-if="currentStep === 4" class="step-content animate-fade-in">
            <h4 class="step-title">CÃ i Ä‘áº·t & Xuáº¥t báº£n</h4>
            
            <div class="form-field">
              <label class="form-label flex items-center gap-2 cursor-pointer">
                <input v-model="form.isRequired" type="checkbox" class="form-checkbox" />
                <span>Báº¯t buá»™c hoÃ n thÃ nh Ä‘á»ƒ má»Ÿ khÃ³a bÃ i tiáº¿p theo</span>
              </label>
            </div>
            
            <div class="form-field">
              <label class="form-label flex items-center gap-2 cursor-pointer">
                <input v-model="form.isHidden" type="checkbox" class="form-checkbox" />
                <span>áº¨n bÃ i há»c khá»i há»c viÃªn (chá»‰ giÃ¡o viÃªn tháº¥y)</span>
              </label>
            </div>
            
            <div class="form-row">
              <div class="form-field">
                <label class="form-label">Má»Ÿ khÃ³a vÃ o lÃºc (Unlock At)</label>
                <input v-model="form.unlockAt" type="datetime-local" class="form-input" />
              </div>
              <div class="form-field">
                <label class="form-label">Háº¡n ná»™p (Due At)</label>
                <input v-model="form.dueAt" type="datetime-local" class="form-input" />
              </div>
            </div>
            
            <div class="form-field">
              <label class="form-label">Sá»‘ láº§n thá»­ tá»‘i Ä‘a (cho Quiz/Codelab)</label>
              <input v-model.number="form.maxAttempts" type="number" class="form-input" min="1" max="100" placeholder="KhÃ´ng giá»›i háº¡n" />
            </div>
            
            <div class="form-field">
              <label class="form-label flex items-center gap-2 cursor-pointer">
                <input v-model="form.isSequential" type="checkbox" class="form-checkbox" />
                <span>YÃªu cáº§u hoÃ n thÃ nh theo thá»© tá»± (Sequential)</span>
              </label>
            </div>
            
            <div class="form-field">
              <label class="form-label flex items-center gap-2 cursor-pointer">
                <input v-model="form.isPublished" type="checkbox" class="form-checkbox" />
                <span>Xuáº¥t báº£n ngay sau khi táº¡o</span>
              </label>
            </div>
            
            <div class="step-navigation">
              <button type="button" class="btn-secondary" @click="prevStep">
                <BaseIcon name="arrow-left" class="w-4 h-4 inline mr-1" /> Quay láº¡i
              </button>
              <button type="submit" class="btn-primary" :disabled="saving">
                <span v-if="saving" class="flex items-center gap-2">
                  <span class="spinner-sm"></span>
                  Äang táº¡o...
                </span>
                <span v-else>
                  <BaseIcon name="check" class="w-4 h-4 inline mr-1" /> Táº¡o bÃ i há»c
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import BaseIcon from '@/shared/components/BaseIcon.vue';
import CustomMarkdownEditor from '@/components/editor/CustomMarkdownEditor.vue';
import TheoryArticlePickerModal from './TheoryArticlePickerModal.vue';
import QuizPickerModal from './QuizPickerModal.vue';
import CodelabPickerModal from './CodelabPickerModal.vue';

interface Props {
  show: boolean;
  classroomId: string;
  classroomName: string;
  modules: any[];
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'created', lesson: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const currentStep = ref(1);
const saving = ref(false);

const modules = computed(() => props.modules.filter((m: any) => !m.isDeleted).sort((a: any, b: any) => a.orderIndex - b.orderIndex));

const contentTypes = [
  { value: 'custom', label: 'Tá»± soáº¡n tháº£o (Markdown)', icon: 'file-text' },
  { value: 'theory', label: 'Chá»n bÃ i viáº¿t lÃ½ thuyáº¿t', icon: 'book-open' }
];

const practiceActivities = [
  { key: 'quiz', label: 'Tráº¯c nghiá»‡m (Quiz)', icon: 'help-circle', description: 'Kiá»ƒm tra kiáº¿n thá»©c' },
  { key: 'codelab', label: 'Thá»±c hÃ nh Code (Codelab)', icon: 'code', description: 'Viáº¿t vÃ  cháº¡y code' }
];

const form = reactive({
  
  title: '',
  description: '',
  moduleId: '',
  orderIndex: 1,
  xpReward: 50,
  estimatedTime: 30,
  
  
  contentType: 'custom',
  customContent: '',
  theoryArticleId: '',
  sandboxType: '',
  sandboxConfig: '{}',
  
  
  practiceActivities: [] as string[],
  quizId: '',
  codelabId: '',
  
  
  isRequired: true,
  isHidden: false,
  unlockAt: '',
  dueAt: '',
  maxAttempts: null as number | null,
  isSequential: true,
  isPublished: false
});

const showTheoryPicker = ref(false);
const showQuizPicker = ref(false);
const showCodelabPicker = ref(false);

const selectedTheory = ref<any | null>(null);
const selectedQuiz = ref<any | null>(null);
const selectedCodelab = ref<any | null>(null);

const isStep1Valid = computed(() => form.title.trim() && form.moduleId && form.orderIndex >= 1);
const isStep2Valid = computed(() => {
  if (form.contentType === 'custom') return form.customContent.trim().length > 0;
  if (form.contentType === 'theory') return !!form.theoryArticleId;
  return true;
});

function nextStep() {
  if (currentStep.value < 4) currentStep.value++;
}

function prevStep() {
  if (currentStep.value > 1) currentStep.value--;
}

function togglePracticeActivity(key: string) {
  const idx = form.practiceActivities.indexOf(key);
  if (idx >= 0) form.practiceActivities.splice(idx, 1);
  else form.practiceActivities.push(key);
}

function onTheorySelected(articles: any[]) {
  if (articles.length > 0) {
    form.theoryArticleId = articles[0].id;
    selectedTheory.value = articles[0];
  }
  showTheoryPicker.value = false;
}

function removeTheory() {
  form.theoryArticleId = '';
  selectedTheory.value = null;
}

function onQuizSelected(quizzes: any[]) {
  if (quizzes.length > 0) {
    form.quizId = quizzes[0].id;
    selectedQuiz.value = quizzes[0];
  }
  showQuizPicker.value = false;
}

function removeQuiz() {
  form.quizId = '';
  selectedQuiz.value = null;
  form.practiceActivities = form.practiceActivities.filter(a => a !== 'quiz');
}

function onCodelabSelected(codelabs: any[]) {
  if (codelabs.length > 0) {
    form.codelabId = codelabs[0].id;
    selectedCodelab.value = codelabs[0];
  }
  showCodelabPicker.value = false;
}

function removeCodelab() {
  form.codelabId = '';
  selectedCodelab.value = null;
  form.practiceActivities = form.practiceActivities.filter(a => a !== 'codelab');
}

async function handleSubmit() {
  if (!isStep1Valid.value || !isStep2Valid.value) return;
  
  saving.value = true;
  try {
    const lessonData = { ...form };
    await emit('created', lessonData);
  } finally {
    saving.value = false;
  }
}

watch(() => props.show, (newShow) => {
  if (!newShow) {
    currentStep.value = 1;
    
    Object.assign(form, {
      title: '', description: '', moduleId: '', orderIndex: 1, xpReward: 50, estimatedTime: 30,
      contentType: 'custom', customContent: '', theoryArticleId: '', sandboxType: '', sandboxConfig: '{}',
      practiceActivities: [], quizId: '', codelabId: '',
      isRequired: true, isHidden: false, unlockAt: '', dueAt: '', maxAttempts: null, isSequential: true, isPublished: false
    });
    selectedTheory.value = null;
    selectedQuiz.value = null;
    selectedCodelab.value = null;
    showTheoryPicker.value = false;
    showQuizPicker.value = false;
    showCodelabPicker.value = false;
  }
});
</script>

<style scoped>
@import "./CustomLessonCreator.css";
</style>