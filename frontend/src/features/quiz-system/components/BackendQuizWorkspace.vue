<template>
  <div class="h-full flex flex-col gap-4 p-4 overflow-auto">
    
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
          <BaseIcon name="clipboard-list" class="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 class="text-base font-bold text-text-primary">Ngân Hàng Trắc Nghiệm</h2>
          <p class="text-[10px] text-text-secondary">Chọn chủ đề và bắt đầu luyện tập</p>
        </div>
      </div>
      <div v-if="store.isBackendQuizMode" class="flex items-center gap-2">
        <span class="quiz-progress-badge px-2 py-0.5 rounded-full text-[10px] font-bold text-accent border">
          {{ store.backendQuizProgress }}
        </span>
        <button @click="store.exitBackendQuiz()"
          class="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent-red/20 text-accent-red border border-accent-red/30 hover:bg-accent-red/30 transition-colors">
          Thoát Quiz
        </button>
      </div>
    </div>

    
    <div v-if="store.backendQuizError" class="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-red/10 border border-accent-red/30 text-xs text-accent-red" role="alert">
      <BaseIcon name="warning" class="w-3.5 h-3.5 flex-shrink-0" />
      <span class="flex-1">{{ store.backendQuizError }}</span>
      <button v-if="!store.isBackendQuizMode" @click="store.loadQuizCatalog()"
        class="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-accent-red/20 border border-accent-red/40 hover:bg-accent-red/30 transition-colors">
        Thử lại
      </button>
    </div>

    
    <div v-if="store.isBackendQuizLoading" class="flex-1">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SkeletonCard v-for="i in 6" :key="i" />
      </div>
    </div>

    
    <div v-else-if="store.backendQuizError && displayedQuizzes.length === 0 && !store.isBackendQuizMode" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <span class="text-sm text-accent-red">{{ store.backendQuizError }}</span>
        <button @click="store.loadQuizCatalog()" class="block mx-auto mt-2 px-4 py-1.5 rounded-lg text-xs bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30">
          Thử lại
        </button>
      </div>
    </div>

    
    <div v-else-if="store.backendResult" class="flex-1 flex flex-col items-center justify-center gap-4">
      <div class="rounded-2xl bg-bg-secondary/45 border border-border-subtle backdrop-blur-xl p-8 max-w-lg w-full text-center">
        <div class="text-4xl mb-4"><BaseIcon :name="store.backendResult.passed ? 'trophy' : 'x-circle'" class="w-10 h-10 mx-auto" :class="store.backendResult.passed ? 'text-accent-yellow' : 'text-accent-red'" /></div>
        <h3 class="text-xl font-bold text-text-primary mb-2">
          {{ store.backendResult.passed ? 'Xuất sắc!' : 'Cần cải thiện' }}
        </h3>
        <div class="text-3xl font-bold mb-2" :class="store.backendResult.passed ? 'text-accent-green' : 'text-accent-red'">
          {{ store.backendResult.score }} / {{ store.backendResult.maxScore }}
        </div>
        <div v-if="store.backendResult.xpAwarded > 0" class="text-sm text-accent mb-4">
          +{{ store.backendResult.xpAwarded }} XP
        </div>
        <div v-else-if="store.backendResult.passed" class="text-xs text-text-secondary mb-4 bg-bg-hover border border-border-subtle rounded-lg p-2.5">
          <BaseIcon name="bulb" class="w-3.5 h-3.5 inline mr-1 align-middle" />Bạn đã nhận XP tối đa cho bài quiz này. Làm lại để ôn tập sẽ không nhận thêm XP.
        </div>
        
        <div class="text-left mt-4 space-y-2">
          <div v-for="(qr, i) in store.backendResult.questionResults" :key="qr.questionId"
            class="p-3 rounded-lg" :class="qr.isCorrect ? 'bg-accent-green/10' : 'bg-accent-red/10'">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-sm"><BaseIcon :name="qr.isCorrect ? 'check' : 'close'" class="w-3.5 h-3.5" /></span>
              <span class="text-xs font-medium text-text-primary">Câu {{ i + 1 }}</span>
            </div>
            <p class="text-[11px] text-text-secondary">{{ qr.explanation }}</p>
          </div>
        </div>

        <div class="flex gap-2 justify-center mt-6">
          <button @click="store.exitBackendQuiz()"
            class="px-4 py-2 rounded-lg text-xs font-medium bg-bg-surface text-text-primary border border-border-default hover:bg-bg-surface/80 transition-colors">
            Quay lại danh sách
          </button>
          <button v-if="store.activeBackendQuiz" @click="store.startBackendQuiz(store.activeBackendQuiz.id)"
            class="px-4 py-2 rounded-lg text-xs font-medium bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30 transition-colors">
            Làm lại
          </button>
        </div>
      </div>
    </div>

    
    <div v-else-if="store.isBackendQuizMode && store.currentBackendQuestion" class="flex-1 flex flex-col gap-4">
      <div class="rounded-2xl bg-bg-secondary/45 border border-border-subtle backdrop-blur-xl p-6 flex-1">
        
        <div class="mb-6">
          <span class="text-[10px] text-text-disabled uppercase tracking-wider">Câu hỏi {{ store.backendQuizIndex + 1 }}</span>
          <h3 class="text-sm font-semibold text-text-primary mt-1">{{ store.currentBackendQuestion.text }}</h3>
        </div>

        
        <div class="space-y-2">
          <button v-for="(option, idx) in store.currentBackendQuestion.options" :key="idx"
            @click="store.selectBackendAnswer(idx)"
            class="w-full text-left px-4 py-3 rounded-xl text-xs transition-all duration-200 border"
            :class="store.backendAnswers[store.backendQuizIndex] === idx
              ? 'selected-option text-text-primary'
              : 'bg-bg-surface/30 border-border-default/30 text-text-secondary hover:bg-bg-surface/50'">
            <span class="font-bold mr-2">{{ String.fromCharCode(65 + idx) }}.</span>
            {{ option }}
          </button>
        </div>
      </div>

      
      <div class="flex items-center justify-between">
        <button @click="store.prevBackendQuestion()" :disabled="store.backendQuizIndex <= 0"
          class="px-4 py-2 rounded-lg text-xs font-medium transition-colors"
          :class="store.backendQuizIndex > 0 ? 'bg-bg-surface text-text-primary border border-border-default hover:bg-bg-surface/80' : 'bg-bg-surface/30 text-text-disabled cursor-not-allowed'">
          <BaseIcon name="arrow-left" class="w-3.5 h-3.5 inline mr-1 align-middle" />Câu trước
        </button>
        <span class="text-xs text-text-secondary">{{ store.backendQuizProgress }}</span>
        <button v-if="store.activeBackendQuiz && store.backendQuizIndex < store.activeBackendQuiz.questions.length - 1"
          @click="store.nextBackendQuestion()"
          class="px-4 py-2 rounded-lg text-xs font-medium bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30 transition-colors">
          Câu tiếp <BaseIcon name="arrow-right" class="w-3.5 h-3.5 inline ml-1 align-middle" />
        </button>
        <button v-else @click="store.submitBackendQuiz()"
          :disabled="store.backendAnswers.some(a => a === null) || store.isBackendQuizSubmitting"
          class="px-4 py-2 rounded-lg text-xs font-medium transition-colors"
          :class="store.backendAnswers.every(a => a !== null) && !store.isBackendQuizSubmitting
            ? 'bg-accent-green/20 text-accent-green border border-accent-green/30 hover:bg-accent-green/30'
            : 'bg-bg-surface/30 text-text-disabled cursor-not-allowed'">
          {{ store.isBackendQuizSubmitting ? 'Đang gửi...' : 'Nộp bài' }} <BaseIcon v-if="!store.isBackendQuizSubmitting" name="check" class="w-3.5 h-3.5 inline ml-1 align-middle" />
        </button>
      </div>
    </div>

    
    <div v-else class="flex-1 flex flex-col gap-4">
      


      <div class="topic-filter-bar">
        <button
          v-for="topic in availableTopics"
          :key="topic"
          class="topic-tab"
          :class="{ 'topic-tab--active': selectedTopic === topic }"
          @click="selectedTopic = topic"
        >
          <span class="topic-tab__icon"><BaseIcon :name="topicIcon(topic)" class="w-3.5 h-3.5" /></span>
          <span class="topic-tab__label">{{ topic }}</span>
          <span class="topic-tab__count">{{ countByTopic(topic) }}</span>
        </button>
      </div>

      
      <div class="quiz-search-wrapper">
        <svg class="quiz-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Tìm kiếm quiz theo tên..."
          class="quiz-search-input"
        />
      </div>

      
      <div v-if="isUsingFallback" class="fallback-notice">
        <BaseIcon name="warning" class="w-3.5 h-3.5 inline mr-1 align-middle" />Đang hiển thị quiz mẫu. Kết nối server để tải quiz đầy đủ.
        <button @click="store.loadQuizCatalog()" class="fallback-notice__retry">Thử kết nối lại</button>
      </div>

      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="quiz in displayedQuizzes" :key="quiz.id"
          class="rounded-2xl bg-bg-secondary/45 border border-border-subtle backdrop-blur-xl p-5 cursor-pointer hover:border-accent/30 transition-all duration-200 quiz-card"
          @click="handleQuizClick(quiz)">
          <div class="flex items-center justify-between mb-3">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
              :class="difficultyClass(quiz.difficulty)">
              {{ quiz.difficulty }}
            </span>
            <span class="text-[10px] text-accent">+{{ quiz.xpReward }} XP</span>
          </div>
          <h3 class="text-sm font-semibold text-text-primary mb-1">{{ quiz.title }}</h3>
          <div class="flex items-center gap-3 text-[10px] text-text-secondary">
            <span>{{ quiz.questionCount }} câu hỏi</span>
            <span class="quiz-card__topic-badge">{{ quiz.topic }}</span>
          </div>
        </div>
      </div>

      
      <div v-if="displayedQuizzes.length === 0 && !store.isBackendQuizLoading" class="text-center py-12">
        <p class="text-sm text-text-secondary mb-2">
          {{ searchQuery ? 'Không tìm thấy quiz phù hợp.' : 'Chưa có quiz nào cho chủ đề này.' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useQuizStore } from '../store/useQuizStore';
import SkeletonCard from '../../../components/SkeletonCard.vue';
import { useConfetti } from '../../../composables/useConfetti';
import type { StatelessQuizSummary } from '../service/statelessQuizApi';

const store = useQuizStore();
const { fireQuizPass } = useConfetti();

const selectedTopic = ref('Tất cả');
const searchQuery = ref('');


const FALLBACK_QUIZZES: StatelessQuizSummary[] = [
  { id: 'fallback-dsa-1', title: 'Thuật toán Sắp xếp cơ bản', topic: 'DSA', difficulty: 'easy', xpReward: 50, questionCount: 5 },
  { id: 'fallback-dsa-2', title: 'Cấu trúc dữ liệu Stack & Queue', topic: 'DSA', difficulty: 'medium', xpReward: 80, questionCount: 5 },
  { id: 'fallback-oop-1', title: 'OOP: Kế thừa và Đa hình', topic: 'OOP', difficulty: 'medium', xpReward: 80, questionCount: 5 },
  { id: 'fallback-solid-1', title: 'Nguyên lý SOLID cơ bản', topic: 'SOLID', difficulty: 'hard', xpReward: 120, questionCount: 5 },
  { id: 'fallback-patterns-1', title: 'Design Patterns: Singleton & Factory', topic: 'Patterns', difficulty: 'medium', xpReward: 100, questionCount: 5 },
  { id: 'fallback-di-1', title: 'Dependency Injection & IoC', topic: 'DI', difficulty: 'hard', xpReward: 120, questionCount: 5 },
];

const effectiveQuizzes = computed<StatelessQuizSummary[]>(() => {
  if (store.quizCatalog.length > 0) return store.quizCatalog;
  return FALLBACK_QUIZZES;
});

const isUsingFallback = computed(() => store.quizCatalog.length === 0);

const availableTopics = computed(() => {
  const topics = new Set(effectiveQuizzes.value.map(q => q.topic));
  return ['Tất cả', ...Array.from(topics).sort()];
});

function countByTopic(topic: string): number {
  if (topic === 'Tất cả') return effectiveQuizzes.value.length;
  return effectiveQuizzes.value.filter(q => q.topic === topic).length;
}

function topicIcon(topic: string): string {
  const icons: Record<string, string> = {
    'Tất cả': 'clipboard-list',
    'DSA': 'chart-bar',
    'OOP': 'oop',
    'SOLID': 'construction',
    'Patterns': 'palette',
    'DI': 'di',
  };
  return icons[topic] ?? 'file-text';
}

const displayedQuizzes = computed(() => {
  let quizzes = effectiveQuizzes.value;
  if (selectedTopic.value !== 'Tất cả') {
    quizzes = quizzes.filter(q => q.topic === selectedTopic.value);
  }
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    quizzes = quizzes.filter(q => q.title.toLowerCase().includes(query));
  }
  return quizzes;
});

function handleQuizClick(quiz: StatelessQuizSummary): void {
  if (isUsingFallback.value) {
    
    store.backendQuizError = 'Cần kết nối server để làm quiz. Vui lòng khởi động backend.';
    return;
  }
  store.startBackendQuiz(quiz.id);
}

watch(() => store.backendResult, (result) => {
  if (result?.passed) {
    fireQuizPass();
  }
});

function difficultyClass(difficulty: string): string {
  switch (difficulty) {
    case 'easy': return 'bg-accent-green/10 text-accent-green border border-accent-green/20';
    case 'medium': return 'bg-accent/10 text-accent border border-accent/20';
    case 'hard': return 'bg-accent-red/10 text-accent-red border border-accent-red/20';
    default: return 'bg-bg-surface/50 text-text-secondary';
  }
}

onMounted(() => {
  store.loadQuizCatalog();
});
</script>

<style scoped>
@import "./BackendQuizWorkspace.css";
</style>
