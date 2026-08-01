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

    
    <main class="flex-1 min-h-0 relative w-full h-full overflow-hidden">
      
      <LessonStepTheory
        v-if="activeStep === 1"
        :title="lesson?.title || 'Lý Thuyết Thuật Toán'"
        :content="lesson?.contentMarkdown || 'Đọc tài liệu lý thuyết nền tảng trước khi xem mô phỏng trực quan hóa.'"
        @completeStep="activeStep = 2"
      />

      
      <LessonStepViz
        v-else-if="activeStep === 2"
        :vizTitle="lesson?.title"
        moduleKey="sorting"
        @completeStep="activeStep = 3"
      />

      
      <LessonStepQuiz
        v-else-if="activeStep === 3"
        @completeStep="activeStep = 4"
      />

      
      <LessonStepCodeLab
        v-else-if="activeStep === 4"
        :problemTitle="`Thực hành: ${lesson?.title || 'Lập trình thuật toán'}`"
        @completeLesson="showCompletionModal = true"
      />
    </main>

    
    <LessonCompletionModal
      :show="showCompletionModal"
      :xpReward="lesson?.xpReward ?? 50"
      @close="showCompletionModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LessonStepTheory from './components/LessonStepTheory.vue';
import LessonStepViz from './components/LessonStepViz.vue';
import LessonStepQuiz from './components/LessonStepQuiz.vue';
import LessonStepCodeLab from './components/LessonStepCodeLab.vue';
import LessonCompletionModal from './LessonCompletionModal.vue';

const route = useRoute();
const router = useRouter();

const lessonId = route.params.id as string;
const courseId = route.query.courseId as string;

const activeStep = ref(1);
const showCompletionModal = ref(false);

const lesson = ref({
  id: lessonId || '1',
  title: 'Khởi Tạo Thuật Toán Sắp Xếp Bubble Sort',
  xpReward: 50,
  contentMarkdown: `### 1. Giới thiệu Thuật toán Bubble Sort
  
Bubble Sort (Sắp xếp nổi bọt) là một thuật toán sắp xếp đơn giản hoạt động bằng cách duyệt qua mảng nhiều lần, so sánh các cặp phần tử kế tiếp và hoán đổi chúng nếu chúng sai thứ tự.
  
### 2. Các Bước Thực Hiện
1. Duyệt qua mảng từ vị trí 0 đến N-1.
2. So sánh \`arr[j]\` và \`arr[j+1]\`.
3. Nếu \`arr[j] > arr[j+1]\`, hoán đổi vị trí của 2 phần tử.
4. Lặp lại cho đến khi mảng được sắp xếp hoàn toàn.

### 3. Độ Phức Tạp Thuật Toán
- **Thời gian (Time Complexity)**: Trung bình và Xấu nhất là **O(N²)**.
- **Bộ nhớ (Space Complexity)**: **O(1)** (Sắp xếp tại chỗ - In-place sort).`
});

const steps = [
  { number: 1, label: 'Lý Thuyết' },
  { number: 2, label: 'Trực Quan Hóa' },
  { number: 3, label: 'Quiz' },
  { number: 4, label: 'Code Lab' }
];

function goToNextLesson(): void {
  showCompletionModal.value = false;
  router.push('/courses');
}
</script>
