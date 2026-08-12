<template>
  <div class="ide-workspace-container">
    
    <div class="ide-editor-panel">
      <div class="flex-[6] min-h-0"><MonacoEditorPanel /></div>
      <div class="flex-[4] min-h-0 border-t" style="border-color: var(--color-border-subtle);">
        <CompilerConsole />
      </div>
    </div>

    
    <div class="ide-canvas-panel">
      <ArrayInputBar
        v-model="inputArrayText"
        :is-valid="inputValid"
        :is-compiling="compilerStore.isCompiling"
        :error-message="inputErrorMessage"
        @parse="parseInputArray"
        @run="runCompilation"
        @cancel="cancelCompilation"
      />

      
      <div data-tour-id="code-ide-canvas" class="flex-1 rounded-xl overflow-hidden border shadow-lg relative min-h-0" style="border-color: var(--color-border-subtle);">
        <CanvasLayer />
        <div v-if="!hasFrames" class="absolute inset-0 flex items-center justify-center" style="background: color-mix(in srgb, var(--color-bg-primary) 80%, transparent);">
          <div class="text-center px-8">
            <BaseIcon name="code" class="w-10 h-10 mx-auto mb-3 text-text-disabled" />
            <p class="text-sm text-text-muted">
              Viết mã sắp xếp bên trái, nhấn <span class="text-accent font-semibold">RUN</span> để xem hoạt ảnh.
            </p>
          </div>
        </div>
      </div>

      
      <div data-tour-id="code-ide-vcr" class="mt-2 rounded-xl overflow-hidden border shadow-lg h-32" style="border-color: var(--color-border-subtle);">
        <AnimControlPanel />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import MonacoEditorPanel from './MonacoEditorPanel.vue';
import CompilerConsole from './CompilerConsole.vue';
import ArrayInputBar from './ArrayInputBar.vue';
import CanvasLayer from '../../animation-engine/components/CanvasLayer.vue';
import AnimControlPanel from '../../animation-engine/components/AnimControlPanel.vue';
import { useLiveCompilerStore } from '../store/useLiveCompilerStore';
import { useAnimationStore } from '../../animation-engine/store/useAnimationStore';
import { DEFAULT_INPUT_ARRAY } from '../store/liveCompilerDefaults';

const ARRAY_SEGMENT_REGEX = /^\s*-?\d+(\.\d+)?\s*$/;

const compilerStore = useLiveCompilerStore();
const animStore = useAnimationStore();
const inputArrayText = ref(DEFAULT_INPUT_ARRAY.join(', '));
const inputValid = ref(true);
const inputErrorMessage = ref('');
const hasFrames = computed(() => animStore.totalSteps > 0);

function parseInputArray(): boolean {
  const text = inputArrayText.value.trim();
  if (!text) {
    inputValid.value = false;
    inputErrorMessage.value = 'Vui lòng nhập mảng số (tối thiểu 2 số, tối đa 50 số).';
    return false;
  }
  const parts = text.split(',');
  const numbers: number[] = [];
  for (const part of parts) {
    if (!ARRAY_SEGMENT_REGEX.test(part)) {
      inputValid.value = false;
      inputErrorMessage.value = `Giá trị "${part.trim()}" không hợp lệ — chỉ chấp nhận số nguyên/thập phân, ngăn cách bằng dấu phẩy.`;
      return false;
    }
    numbers.push(parseFloat(part));
  }
  if (numbers.length < 2 || numbers.length > 50) {
    inputValid.value = false;
    inputErrorMessage.value = `Mảng phải chứa từ 2 đến 50 phần tử (hiện tại: ${numbers.length}).`;
    return false;
  }
  inputValid.value = true;
  inputErrorMessage.value = '';
  compilerStore.setInputArray(numbers);
  return true;
}

watch(inputArrayText, () => {
  parseInputArray();
});

function runCompilation(): void {
  if (!parseInputArray()) return;
  compilerStore.compileAndExecuteCode();
}

function cancelCompilation(): void {
  compilerStore.cancelExecution();
}

onMounted(() => {
  animStore.clear();
  compilerStore.clearLogs();
  parseInputArray();
});

onBeforeUnmount(() => {
  compilerStore.cancelExecution();
});
</script>

<style scoped>
.ide-workspace-container { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; width: 100%; height: 100%; font-family: 'Outfit', sans-serif; }
.ide-editor-panel { display: flex; flex-direction: column; background: color-mix(in srgb, var(--color-bg-secondary) 40%, transparent); border: 1px solid var(--color-border-subtle); border-radius: 16px; overflow: hidden; backdrop-filter: blur(10px); }
.ide-canvas-panel { display: flex; flex-direction: column; background: color-mix(in srgb, var(--color-bg-primary) 60%, transparent); border: 1px solid var(--color-border-subtle); border-radius: 16px; padding: 16px; min-height: 0; }

@media (max-width: 768px) {
  .ide-workspace-container { grid-template-columns: 1fr; overflow-y: auto; }
  .ide-editor-panel { min-height: 420px; }
  .ide-canvas-panel { min-height: 520px; }
}
</style>
