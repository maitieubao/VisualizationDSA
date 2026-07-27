<template>
  <div class="lesson-study-view flex flex-col min-h-[calc(100vh-64px)] w-full overflow-auto bg-slate-950 font-sans">
    
    <!-- Loading State -->
    <div v-if="lessonStore.isLoading" class="flex items-center justify-center h-full">
      <div class="flex flex-col items-center gap-4 text-indigo-400">
        <svg class="w-10 h-10 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-sm font-semibold">Đang tải bài học...</span>
      </div>
    </div>

    <!-- 404 / Error State -->
    <div v-else-if="!lessonStore.currentLesson" class="flex flex-col items-center justify-center h-full p-8 text-center">
      <div class="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-4 border border-rose-500/20">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 class="text-2xl font-bold text-white mb-2">Không tìm thấy bài học</h2>
      <p class="text-slate-400 max-w-md">Bài học bạn yêu cầu không tồn tại hoặc đã bị gỡ bỏ khỏi hệ thống.</p>
      <router-link to="/courses" class="mt-6 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors">
        Quay lại danh sách khóa học
      </router-link>
    </div>

    <!-- Normal Content State -->
    <template v-else>
      <!-- Top Stepper Header Bar (The 4-Step Pedagogical Flow) -->
      <header class="px-6 py-3 border-b border-white/10 bg-slate-900/90 backdrop-blur-md flex items-center justify-between shrink-0 shadow-lg z-20">
        <!-- Back Link & Lesson Title -->
        <div class="flex items-center gap-3">
          <router-link to="/courses" class="text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1">
            <span>←</span> Quay lại
          </router-link>
          <span class="text-slate-600">|</span>
          <h2 class="text-sm font-extrabold text-white line-clamp-1">
            {{ lessonStore.currentLesson.title }}
          </h2>
        </div>

        <!-- Stepper Pills (Step 1 -> Step 2 -> Step 3 -> Step 4) -->
        <LessonTabs 
          :activeStep="lessonStore.activeStep"
          :hasWatchedVisualizer="lessonStore.hasWatchedVisualizer"
          :quizPassed="lessonStore.quizPassed"
          :codelabCompleted="lessonStore.codelabCompleted"
          @change="lessonStore.goToStep"
        />

        <!-- Sync & XP Status -->
        <div class="flex items-center gap-3 font-mono text-xs">
          <!-- Sync Indicator -->
          <div class="flex items-center gap-1.5 text-slate-400 bg-slate-800/50 px-2.5 py-1.5 rounded-lg border border-white/5 font-sans">
            <template v-if="lessonStore.isSyncing">
              <span class="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
              <span>Đang đồng bộ...</span>
            </template>
            <template v-else-if="lessonStore.isOnline">
              <span class="w-2 h-2 bg-emerald-400 rounded-full"></span>
              <span class="text-emerald-400">Đã đồng bộ</span>
            </template>
            <template v-else>
              <span class="w-2 h-2 bg-amber-400 rounded-full"></span>
              <span class="text-amber-400">Ngoại tuyến</span>
            </template>
          </div>

          <!-- XP Status -->
          <span class="px-2.5 py-1.5 rounded-lg bg-amber-950/50 text-amber-400 border border-amber-500/30 font-bold flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span>+{{ lessonStore.currentLesson.xpReward ?? 0 }} XP</span>
          </span>
        </div>
      </header>

      <!-- Main Step Content Viewport -->
      <main class="flex-1 min-h-0 relative w-full h-full overflow-hidden">
        <!-- Step 1: Theory -->
        <TheoryPanel
          v-if="lessonStore.activeStep === 1"
          :title="lessonStore.currentLesson.title"
          :content="lessonStore.currentLesson.theoryContent"
          @completeStep="lessonStore.goToStep(2)"
        />

        <!-- Step 2: Visualization -->
        <VisualizerPanel
          v-else-if="lessonStore.activeStep === 2"
          :vizTitle="lessonStore.currentLesson.title"
          :algorithmId="lessonStore.currentLesson.algorithmId"
          @watched="handleWatchedVisualizer"
          @completeStep="lessonStore.goToStep(3)"
        />

        <!-- Step 3: Quiz -->
        <QuizPanel
          v-else-if="lessonStore.activeStep === 3"
          :questions="lessonStore.currentLesson.quizQuestions"
          :quizPassed="lessonStore.quizPassed"
          :quizScore="lessonStore.quizScore"
          :bestScore="lessonStore.bestScore"
          @submit="lessonStore.submitQuiz"
          @reset="lessonStore.resetQuiz"
          @completeStep="lessonStore.goToStep(4)"
        />

        <!-- Step 4: Code Lab -->
        <CodeLabPanel
          v-else-if="lessonStore.activeStep === 4"
          :problemTitle="`Thực hành: ${lessonStore.currentLesson.title}`"
          :task="lessonStore.currentLesson.codelabTask"
          @completeLesson="handleCodelabCompleted"
        />
      </main>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useLessonStore } from '../store/useLessonStore';
import { useAlgorithmStore } from '../../dsa-modules/store/useAlgorithmStore';

import LessonTabs from '../components/LessonTabs.vue';
import TheoryPanel from '../components/TheoryPanel.vue';
import VisualizerPanel from '../components/VisualizerPanel.vue';
import QuizPanel from '../components/QuizPanel.vue';
import CodeLabPanel from '../components/CodeLabPanel.vue';

const route = useRoute();
const lessonStore = useLessonStore();
const algoStore = useAlgorithmStore();

onMounted(async () => {
  const lessonId = route.params.id as string;
  if (lessonId) {
    lessonStore.loadLesson(lessonId);
    
    // We also need to load the algorithm for the visualizer to show the right algorithm
    if (lessonStore.currentLesson) {
      if (algoStore.algorithms.length === 0) {
        await algoStore.fetchAlgorithms();
      }
      await algoStore.loadAlgorithmDetails(lessonStore.currentLesson.algorithmId);
    }
  }
});

onUnmounted(() => {
  // optionally cleanup
});

function handleWatchedVisualizer() {
  lessonStore.markVisualizerWatched();
}

function handleCodelabCompleted() {
  lessonStore.completeCodelab();
  alert('Hoàn thành xuất sắc bài học!');
}
</script>
