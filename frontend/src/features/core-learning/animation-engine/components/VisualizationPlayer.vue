<template>
  <div class="flex flex-col h-full w-full gap-2">
    
    <div class="flex-1 flex gap-2 min-h-0">
      <VisualizationCanvas
        :is-loading="inputStore.isLoading"
        :show-quiz-summary="showQuizSummary"
        :session-correct="quizStore.sessionCorrect"
        :session-total="quizStore.sessionTotal"
        :show-lecture-btn="!lectureStore.isActive && hasLectureAvailable"
        @retry="retryQuiz"
        @close-summary="closeQuizSummary"
        @open-lecture="openLecture"
      />

      
      <div class="flex-[4] flex flex-col gap-2 min-h-0">
        <div class="sidebar-panel flex-1 min-h-0">
          <MultilingualCodePanel />
        </div>
        <div class="sidebar-panel flex-1 min-h-0">
          <CustomInputForm />
        </div>
      </div>
    </div>

    
    <div class="sidebar-panel h-16">
      <ExplanationPanel />
    </div>

    
    <div class="sidebar-panel h-40">
      <AnimControlPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import VisualizationCanvas from './VisualizationCanvas.vue';
import ExplanationPanel from './ExplanationPanel.vue';
import AnimControlPanel from './AnimControlPanel.vue';
import { CustomInputForm } from '../../custom-input';
import { useInputStore } from '../../custom-input/store/useInputStore';
// e-lecture removed
import { MultilingualCodePanel, usePseudocodeStore, loadPseudocodeScript as loadPsScript } from '../../pseudocode-sync';
import { useQuizStore, loadQuizScript } from '../../quiz-system';
import { useAnimationStore } from '../store/useAnimationStore';

const inputStore      = useInputStore();
const lectureStore    = null as any; // e-lecture removed
const animStore       = useAnimationStore();
const pseudocodeStore = usePseudocodeStore();
const quizStore       = useQuizStore();
const showQuizSummary = ref(false);

const hasLectureAvailable = computed(() => false);

watch(() => animStore.algorithmId, (newId) => {
  if (!newId) { pseudocodeStore.resetStore(); quizStore.resetQuizStore(); return; }
  const script = loadPsScript(newId);
  if (script) pseudocodeStore.loadPseudocodeScript(script.languages);
  const quizScript = loadQuizScript(newId);
  if (quizScript) quizStore.loadCheckpoints(quizScript.checkpoints);
  else quizStore.resetQuizStore();
}, { immediate: true });

watch(() => animStore.currentIndex, (newIndex) => {
  if (quizStore.checkpoints.length > 0) quizStore.checkFrameForQuiz(newIndex);
});

watch(() => quizStore.allCheckpointsCompleted, (completed) => {
  if (completed && quizStore.sessionTotal > 0) showQuizSummary.value = true;
});

async function openLecture(): Promise<void> {
  // disabled
}

function retryQuiz(): void {
  showQuizSummary.value = false;
  quizStore.resetQuizStore();
  const quizScript = loadQuizScript(animStore.algorithmId);
  if (quizScript) quizStore.loadCheckpoints(quizScript.checkpoints);
  animStore.stop();
}

function closeQuizSummary(): void { showQuizSummary.value = false; }
</script>

<style scoped>

.sidebar-panel {
  border-radius: var(--radius-xl);
  overflow: hidden;
  border: 1px solid var(--color-border-subtle);
  box-shadow: var(--shadow-md);
}
</style>
