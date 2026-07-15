<template>
  <div class="flex flex-col h-full w-full gap-2">
    <!-- Top Area: Canvas + Sidebar -->
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

      <!-- Sidebar (40%): Pseudocode + Custom Input stacked -->
      <div class="flex-[4] flex flex-col gap-2 min-h-0">
        <div class="sidebar-panel flex-1 min-h-0">
          <MultilingualCodePanel />
        </div>
        <div class="sidebar-panel flex-1 min-h-0">
          <CustomInputForm />
        </div>
      </div>
    </div>

    <!-- Explanation Row -->
    <div class="sidebar-panel h-16">
      <ExplanationPanel />
    </div>

    <!-- Control Panel Row -->
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
import { useLectureStore, loadLecture, hasLecture } from '../../e-lecture';
import { MultilingualCodePanel, usePseudocodeStore, loadPseudocodeScript as loadPsScript } from '../../pseudocode-sync';
import { useQuizStore, loadQuizScript } from '../../quiz-system';
import { useAnimationStore } from '../store/useAnimationStore';

const inputStore      = useInputStore();
const lectureStore    = useLectureStore();
const animStore       = useAnimationStore();
const pseudocodeStore = usePseudocodeStore();
const quizStore       = useQuizStore();
const showQuizSummary = ref(false);

const hasLectureAvailable = computed(() => hasLecture(animStore.algorithmId));

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
  const script = await loadLecture(animStore.algorithmId);
  if (script) lectureStore.startLecture(script);
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
/* Sidebar panels dùng CSS token thay vì border-border-subtle hardcoded */
.sidebar-panel {
  border-radius: var(--radius-xl);
  overflow: hidden;
  border: 1px solid var(--color-border-subtle);
  box-shadow: var(--shadow-md);
}
</style>
