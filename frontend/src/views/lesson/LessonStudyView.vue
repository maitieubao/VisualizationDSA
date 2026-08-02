<template>
  <div class="lesson-study-view flex flex-col min-h-[calc(100vh-64px)] w-full overflow-auto bg-bg-secondary font-sans">
    
    <header class="px-6 py-3 border-b border-border-subtle bg-bg-secondary backdrop-blur-md flex items-center justify-between shrink-0 shadow-lg z-20">
      
      <div class="flex items-center gap-3">
        <router-link :to="courseId ? `/courses/${courseId}` : '/courses'" class="text-xs font-semibold text-text-muted hover:text-white transition-colors flex items-center gap-1">
          <span>←</span> Quay lại
        </router-link>
        <span class="text-text-disabled">|</span>
        <h2 class="text-sm font-extrabold text-white line-clamp-1" v-if="lesson">
          {{ lesson.title }}
        </h2>
      </div>

      
      <div class="flex items-center gap-2">
        <button
          v-for="step in steps"
          :key="step.number"
          @click="activeStep = step.number"
          class="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
          :class="activeStep === step.number
            ? 'bg-accent text-white shadow-md shadow-accent/30'
            : 'bg-bg-secondary text-text-muted hover:text-text-primary border border-border-subtle'"
        >
          <span class="w-4 h-4 rounded-full flex items-center justify-center text-[10px]" :class="activeStep === step.number ? 'bg-bg-hover text-white' : 'bg-bg-surface text-text-muted'">
            {{ step.number }}
          </span>
          <span>{{ step.label }}</span>
        </button>
      </div>

      
      <div class="flex items-center gap-2 font-mono text-xs">
        <span class="px-2.5 py-1 rounded-lg bg-accent-yellow/50 text-accent-yellow border border-accent-yellow/30 font-bold flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 text-accent-yellow" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <span>+{{ lesson?.xpReward ?? 50 }} XP</span>
        </span>
      </div>
    </header>

    <main class="flex-1 min-h-0 relative w-full h-full overflow-hidden bg-bg-primary">
      <Transition name="fade-slide" mode="out-in">
        <LessonStepTheory
          v-if="currentStepLabel === 'Lý Thuyết'"
          :title="lesson?.title || 'Lý Thuyết Thuật Toán'"
          :content="lesson?.contentMd || 'Đọc tài liệu lý thuyết nền tảng trước khi xem mô phỏng trực quan hóa.'"
          @completeStep="goToNextStep"
        />

        <LessonStepViz
          v-else-if="currentStepLabel === 'Trực Quan Hóa'"
          :vizTitle="lesson?.title"
          :moduleKey="lesson?.sandboxType || 'sorting'"
          @completeStep="goToNextStep"
        />

        <LessonStepQuiz
          v-else-if="currentStepLabel === 'Quiz'"
          :quizId="lesson?.quizId"
          @completeStep="goToNextStep"
        />

        <LessonStepCodeLab
          v-else-if="currentStepLabel === 'Code Lab'"
          :problemTitle="'Thực hành: ' + (lesson?.codelab?.title || lesson?.title)"
          :codelab="lesson?.codelab"
          @completeStep="goToNextStep"
        />

        <LessonStepLeetCode
          v-else-if="currentStepLabel === 'LeetCode'"
          :leetCodeId="lesson?.leetCodeId"
          @completeLesson="completeLesson"
        />
      </Transition>
    </main>

    <LessonCompletionModal
      :show="showCompletionModal"
      :xpReward="lesson?.xpReward ?? 50"
      @close="goToNextLesson"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LessonStepTheory from './components/LessonStepTheory.vue';
import LessonStepViz from './components/LessonStepViz.vue';
import LessonStepQuiz from './components/LessonStepQuiz.vue';
import LessonStepCodeLab from './components/LessonStepCodeLab.vue';
import LessonStepLeetCode from './components/LessonStepLeetCode.vue';
import LessonCompletionModal from './LessonCompletionModal.vue';
import { api } from '@/services/apiClient';

const route = useRoute();
const router = useRouter();

const lessonId = route.params.id as string;
const courseId = route.query.courseId as string;

const activeStep = ref(1);
const showCompletionModal = ref(false);

const lesson = ref<any>(null);
const steps = ref<{ number: number; label: string }[]>([]);

const currentStepLabel = computed(() => steps.value.find(s => s.number === activeStep.value)?.label || '');

async function goToNextStep() {
  if (activeStep.value < steps.value.length) {
    activeStep.value++;
  } else {
    await completeLesson();
  }
}

async function completeLesson() {
  try {
    await api.post(`/concepts/lessons/${lessonId}/complete`);
  } catch (e) {
    console.error("Failed to complete lesson:", e);
  }
  showCompletionModal.value = true;
}

onMounted(async () => {
  try {
    const response = await api.get(`/concepts/lessons/${lessonId}`) as any;
    lesson.value = response;
    
    let stepNum = 1;
    const dynamicSteps: { number: number; label: string }[] = [];
    dynamicSteps.push({ number: stepNum++, label: 'Lý Thuyết' });
    dynamicSteps.push({ number: stepNum++, label: 'Trực Quan Hóa' });
    
    if (lesson.value.quizId) {
      dynamicSteps.push({ number: stepNum++, label: 'Quiz' });
    }
    
    if (lesson.value.codelab) {
      dynamicSteps.push({ number: stepNum++, label: 'Code Lab' });
    }
    
    if (lesson.value.leetCodeId) {
      dynamicSteps.push({ number: stepNum++, label: 'LeetCode' });
    }
    
    steps.value = dynamicSteps;
  } catch (error) {
    console.error("Failed to fetch lesson:", error);
  }
});

function goToNextLesson(): void {
  showCompletionModal.value = false;
  if (courseId) {
    router.push(/courses/ + courseId);
  } else {
    router.push('/courses');
  }
}
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
