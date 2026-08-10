<template>
  <div class="flex flex-col h-full w-full gap-2">
    
    <div class="flex-1 flex gap-2 min-h-0">
      <VisualizationCanvas
        :is-loading="inputStore.isLoading"
        :show-quiz-summary="showQuizSummary"
        :session-correct="quizStore.sessionCorrect"
        :session-total="quizStore.sessionTotal"
        :show-lecture-btn="!lectureStore.isActive && lectureAvailable"
        @retry="retryQuiz"
        @close-summary="closeQuizSummary"
        @open-lecture="openLecture"
      />

      
      <div class="flex-[4] flex flex-col gap-2 min-h-0">
        <div class="sidebar-panel flex-1 min-h-0">
          <MultilingualCodePanel />
        </div>
        <div class="sidebar-panel flex-1 min-h-0">
          <CustomInputForm :algorithm-id="animStore.algorithmId" />
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
import { ref, watch, onUnmounted } from 'vue';
import VisualizationCanvas from './VisualizationCanvas.vue';
import ExplanationPanel from './ExplanationPanel.vue';
import AnimControlPanel from './AnimControlPanel.vue';
import { CustomInputForm } from '../../custom-input';
import { useInputStore } from '../../custom-input/store/useInputStore';
import { useLectureStore, loadLecture, isLectureAvailable } from '../../e-lecture';
import { MultilingualCodePanel, usePseudocodeStore, loadPseudocodeScript as loadPsScript } from '../../pseudocode-sync';
import { useQuizStore, loadQuizScript } from '../../quiz-system';
import { useAnimationStore } from '../store/useAnimationStore';

const inputStore      = useInputStore();
const lectureStore    = useLectureStore();
const animStore       = useAnimationStore();
const pseudocodeStore = usePseudocodeStore();
const quizStore       = useQuizStore();
const showQuizSummary = ref(false);

const lectureAvailable = ref(false);

watch(() => animStore.algorithmId, (newId) => {
  inputStore.setAlgorithmLimit(newId);
  if (!newId) { pseudocodeStore.resetStore(); quizStore.resetQuizStore(); lectureAvailable.value = false; return; }
  const script = loadPsScript(newId);
  // PS-004: thuật toán KHÔNG có script trong registry → reset pseudocode
  // store thay vì âm thầm giữ mã giả của thuật toán cũ (trước đây `if` thiếu
  // `else` → panel hiện bubble-sort trong khi canvas chạy quick-sort).
  if (script) pseudocodeStore.loadPseudocodeScript(script.languages);
  else pseudocodeStore.resetStore();
  const quizScript = loadQuizScript(newId);
  // QZ-006: truyền quizId (algorithmId) để bật đồng bộ XP — trước đây chỉ truyền
  // checkpoints → sessionQuizId null → syncSessionToServer/submitQuizAttempt không bao giờ chạy.
  if (quizScript) quizStore.loadCheckpoints(quizScript.checkpoints, quizScript.algorithmId);
  else quizStore.resetQuizStore();
  void isLectureAvailable(newId).then((available) => { lectureAvailable.value = available; });
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
  // QZ-006: truyền quizId để sync XP hoạt động cả khi chơi lại.
  if (quizScript) quizStore.loadCheckpoints(quizScript.checkpoints, quizScript.algorithmId);
  animStore.stop();
}

function closeQuizSummary(): void { showQuizSummary.value = false; }

// Rời view giữa câu hỏi checkpoint → reset quiz + nhả lock 'quiz'
// (trước đây để lại activeQuestion + lock → overlay câu cũ hiện lại khi quay vào).
// PS-008: reset luôn pseudocode store — trước đây thiếu → mã giả/stale state
// của thuật toán cũ lọt sang view khác (panel hiện dòng code không đồng bộ).
onUnmounted(() => {
  pseudocodeStore.resetStore();
  quizStore.resetQuizStore();
  animStore.destroy();
});
</script>

<style scoped>

.sidebar-panel {
  border-radius: var(--radius-xl);
  overflow: hidden;
  border: 1px solid var(--color-border-subtle);
  box-shadow: var(--shadow-md);
}
</style>
