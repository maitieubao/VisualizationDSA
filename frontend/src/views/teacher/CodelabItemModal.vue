<template>
  <Transition name="modal-fade">
    <!-- TC-028: role=dialog + aria-modal + focus trap + Esc (useModalA11y) -->
    <div v-if="show" ref="overlayEl" class="modal-overlay" role="dialog" aria-modal="true" :aria-label="modalTitle" @click.self="$emit('update:show', false)">
      <div class="modal-container modal-lg">
        <div class="modal-header">
          <h3 class="modal-title">
            <BaseIcon :name="Type === 'testcase' ? 'database' : Type === 'template' ? 'file-text' : 'lightbulb'" class="w-5 h-5 inline mr-2" />
            {{ modalTitle }}
          </h3>
          <button type="button" class="modal-close" @click="$emit('update:show', false)">
            <BaseIcon name="x" class="w-5 h-5" />
          </button>
        </div>
        
        <!-- TC-004: form phải có id="codelab-modal-form" để nút submit ngoài form liên kết đúng -->
        <form id="codelab-modal-form" @submit.prevent="handleSubmit" class="modal-body">
          <template v-if="Type === 'testcase'">
            <div class="form-field">
              <label class="form-label">Input <span class="text-accent-red">*</span></label>
              <textarea v-model="form.input" class="form-input form-textarea font-mono text-sm" placeholder="Input test case (VD: [5,2,9,1,5,6])" rows="4" required maxlength="5000"></textarea>
            </div>
            
            <div class="form-field">
              <label class="form-label">Expected Output <span class="text-accent-red">*</span></label>
              <textarea v-model="form.expectedOutput" class="form-input form-textarea font-mono text-sm" placeholder="Expected output (VD: [1,2,5,5,6,9])" rows="4" required maxlength="5000"></textarea>
            </div>
            
            <div class="form-row">
              <div class="form-field">
                <label class="form-label">Thứ tự <span class="text-accent-red">*</span></label>
                <input v-model.number="form.orderIndex" type="number" class="form-input" min="1" required />
              </div>
              <div class="form-field">
                <label class="form-label flex items-center gap-2 cursor-pointer">
                  <input v-model="form.isHidden" type="checkbox" class="form-checkbox" />
                  <span>Ẩn test case (chỉ dùng cho grading)</span>
                </label>
              </div>
            </div>
          </template>
          
          <template v-if="Type === 'template'">
            <div class="form-field">
              <label class="form-label">Ngôn ngữ <span class="text-accent-red">*</span></label>
              <select v-model="form.language" class="form-select" required>
                <option value="">Chọn ngôn ngữ</option>
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
              <label class="form-label">Starter Code <span class="text-accent-red">*</span></label>
              <CustomMarkdownEditor 
                v-model="form.starterCode" 
                :placeholder="'Starter code cho học viên...'"
                :height="250"
              />
            </div>
            
            <div class="form-field">
              <label class="form-label">Solution Code (đáp án)</label>
              <CustomMarkdownEditor 
                v-model="form.solutionCode" 
                :placeholder="'Solution code (đáp án mẫu)...'"
                :height="250"
              />
            </div>
          </template>
          
          <template v-if="Type === 'hint'">
            <div class="form-field">
              <label class="form-label">Nội dung gợi ý <span class="text-accent-red">*</span></label>
              <textarea v-model="form.content" class="form-input form-textarea" placeholder="Nội dung gợi ý..." rows="4" required maxlength="2000"></textarea>
            </div>
            
            <div class="form-row">
              <div class="form-field">
                <label class="form-label">Thứ tự <span class="text-accent-red">*</span></label>
                <input v-model.number="form.orderIndex" type="number" class="form-input" min="1" required />
              </div>
              <div class="form-field">
                <label class="form-label flex items-center gap-2 cursor-pointer">
                  <input v-model="form.isTiered" type="checkbox" class="form-checkbox" />
                  <span>Gợi ý tiered (tốn XP)</span>
                </label>
              </div>
            </div>
            
            <div v-if="form.isTiered" class="form-field">
              <label class="form-label">XP Cost <span class="text-accent-red">*</span></label>
              <input v-model.number="form.xpCost" type="number" class="form-input" min="1" max="50" required />
              <p class="form-hint">Số XP học viên bị trừ khi xem gợi ý này</p>
            </div>
          </template>
        </form>
        
        <div class="modal-footer">
          <button type="button" class="btn-secondary" @click="$emit('update:show', false)">
            Hủy
          </button>
          <button type="submit" class="btn-primary" :disabled="saving" form="codelab-modal-form">
            <span v-if="saving" class="flex items-center gap-2">
              <span class="spinner-sm"></span>
              Đang lưu...
            </span>
            <span v-else>{{ editingItem ? 'Cập nhật' : 'Thêm' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, toRef } from 'vue';
import BaseIcon from '@/shared/components/BaseIcon.vue';
import CustomMarkdownEditor from '@/components/editor/CustomMarkdownEditor.vue';
import { useModalA11y } from '../../composables/useModalA11y';

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

// TC-028: focus trap + Esc + khóa scroll + hoàn trả focus.
const { overlayEl } = useModalA11y(toRef(props, 'show'));

const modalTitle = computed(() => {
  const kind = props.Type === 'testcase' ? 'Testcase' : props.Type === 'template' ? 'Template' : 'Gợi ý';
  return `${kind}: ${props.editingItem ? 'Chỉnh sửa' : 'Thêm mới'}`;
});

const form = reactive({
  
  input: '',
  expectedOutput: '',
  orderIndex: 1,
  isHidden: false,
  
  
  language: '',
  starterCode: '',
  solutionCode: '',
  
  
  content: '',
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
      alert('Input và Expected Output không được để trống');
      return;
    }
  } else if (props.Type === 'template') {
    if (!form.language || !form.starterCode.trim()) {
      alert('Ngôn ngữ và Starter Code không được để trống');
      return;
    }
  } else if (props.Type === 'hint') {
    if (!form.content.trim()) {
      alert('Nội dung gợi ý không được để trống');
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