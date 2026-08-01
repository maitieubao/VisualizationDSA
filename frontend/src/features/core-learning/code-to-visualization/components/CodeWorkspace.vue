<template>
  <div class="ide-workspace-container">
    
    <div class="ide-editor-panel">
      <div class="flex-[6] min-h-0"><MonacoEditorPanel /></div>
      <div class="flex-[4] min-h-0 border-t" style="border-color: rgba(255, 255, 255, 0.05);">
        <CompilerConsole />
      </div>
    </div>

    
    <div class="ide-canvas-panel">
      <ArrayInputBar
        v-model="inputArrayText"
        :is-valid="inputValid"
        :is-compiling="compilerStore.isCompiling"
        @parse="parseInputArray"
        @run="runCompilation"
      />

      
      <div class="flex-1 rounded-xl overflow-hidden border shadow-lg relative min-h-0" style="border-color: rgba(255, 255, 255, 0.05);">
        <CanvasLayer />
        <div v-if="!hasFrames" class="absolute inset-0 flex items-center justify-center" style="background: rgba(15, 23, 42, 0.8);">
          <div class="text-center px-8">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto mb-3 text-text-disabled">
              <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
            </svg>
            <p class="text-sm text-text-muted">
              Viết mã sắp xếp bên trái, nhấn <span class="text-accent font-semibold">RUN</span> để xem hoạt ảnh.
            </p>
          </div>
        </div>
      </div>

      
      <div class="mt-2 rounded-xl overflow-hidden border shadow-lg h-32" style="border-color: rgba(255, 255, 255, 0.05);">
        <AnimControlPanel />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import MonacoEditorPanel from './MonacoEditorPanel.vue';
import CompilerConsole from './CompilerConsole.vue';
import ArrayInputBar from './ArrayInputBar.vue';
import CanvasLayer from '@/features/core-learning/animation-engine/components/CanvasLayer.vue';
import AnimControlPanel from '@/features/core-learning/animation-engine/components/AnimControlPanel.vue';
import { useLiveCompilerStore } from '../store/useLiveCompilerStore';
import { useAnimationStore } from '@/features/core-learning/animation-engine/store/useAnimationStore';

const compilerStore = useLiveCompilerStore();
const animStore = useAnimationStore();
const inputArrayText = ref('5, 3, 8, 1, 9, 2, 7, 4, 6');
const inputValid = ref(true);
const hasFrames = computed(() => animStore.totalSteps > 0);

function parseInputArray(): void {
  const text = inputArrayText.value.trim();
  if (!text) { inputValid.value = false; return; }
  const parts = text.split(',').map((s) => s.trim());
  const numbers: number[] = [];
  for (const part of parts) {
    const num = Number(part);
    if (isNaN(num) || !isFinite(num)) { inputValid.value = false; return; }
    numbers.push(num);
  }
  if (numbers.length < 2 || numbers.length > 50) { inputValid.value = false; return; }
  inputValid.value = true;
  compilerStore.setInputArray(numbers);
}

function runCompilation(): void {
  parseInputArray();
  if (!inputValid.value) return;
  compilerStore.compileAndExecuteCode();
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
.ide-editor-panel { display: flex; flex-direction: column; background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; overflow: hidden; backdrop-filter: blur(10px); }
.ide-canvas-panel { display: flex; flex-direction: column; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 16px; }
</style>
