<template>
  <div class="lesson-study-view flex flex-col h-full w-full overflow-hidden font-sans">
    
    <header class="glass-panel px-6 py-4 flex flex-col md:flex-row items-center justify-between shrink-0 z-20 border-b border-border-default relative">
      <!-- Progress Bar Background (Glassmorphism) -->
      <div class="absolute inset-0 bg-gradient-to-r from-accent/5 to-accent-purple/5 pointer-events-none"></div>

      <div class="flex items-center gap-4 w-full md:w-auto relative z-10 mb-4 md:mb-0">
        <router-link :to="courseId ? '/courses/' + courseId : '/courses'" class="flex items-center justify-center w-8 h-8 rounded-full bg-bg-surface hover:bg-bg-surface border border-border-default text-text-secondary hover:text-text-primary transition-all group">
          <BaseIcon name="arrow-left" class="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" />
        </router-link>
        <div class="h-6 w-px bg-bg-surface mx-1"></div>
        <h2 class="text-base font-extrabold text-text-primary line-clamp-1 tracking-wide" v-if="lesson">
          {{ lesson.title }}
        </h2>
      </div>

      <!-- Steps Progress UI -->
      <div class="flex flex-1 w-full md:w-auto justify-center relative z-10 max-w-2xl px-4 md:px-8">
        <div class="flex items-center justify-between w-full relative">
          <!-- Connecting Line -->
          <div class="absolute top-1/2 left-0 w-full h-0.5 bg-bg-surface -translate-y-1/2 rounded-full z-0 hidden sm:block">
            <div class="h-full bg-gradient-to-r from-accent to-accent-purple rounded-full transition-all duration-500"
                 :style="{ width: `${((activeStep - 1) / (steps.length - 1)) * 100}%` }"></div>
          </div>
          
          <button
            v-for="step in steps"
            :key="step.number"
            @click="activeStep = step.number"
            class="relative z-10 flex flex-col items-center gap-2 group cursor-pointer"
          >
            <!-- Step Circle -->
            <div 
              class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 shadow-lg backdrop-blur-md"
              :class="[
                activeStep === step.number 
                  ? 'bg-accent border-border-accent text-text-primary shadow-indigo-600/50 scale-110' 
                  : activeStep > step.number
                    ? 'bg-accent/20 border-border-accent/50 text-accent hover:bg-accent/30'
                    : 'bg-bg-secondary/80 border-border-default/50 text-text-muted hover:border-slate-500/50 hover:text-text-secondary'
              ]"
            >
              <BaseIcon v-if="activeStep > step.number" name="check" class="w-5 h-5" />
              <span v-else>{{ step.number }}</span>
            </div>
            
            <!-- Step Label -->
            <span 
              class="text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors duration-300 hidden sm:block absolute -bottom-6 whitespace-nowrap"
              :class="activeStep === step.number ? 'text-accent' : 'text-text-muted group-hover:text-text-secondary'"
            >
              {{ step.label }}
            </span>
          </button>
        </div>
      </div>

      <!-- XP Badge -->
      <div class="flex items-center justify-end w-full md:w-auto relative z-10 mt-6 sm:mt-0">
        <span class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-accent-warm/10 to-accent-warm/10 border border-accent-warm/20 text-accent-warm font-bold flex items-center gap-2 shadow-inner backdrop-blur-sm">
          <BaseIcon name="lightning" class="w-4 h-4 text-accent-warm" />
          <span class="text-sm">+{{ lesson?.xpReward ?? 50 }} XP</span>
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
