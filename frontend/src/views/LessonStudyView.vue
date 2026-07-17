<template>
  <div class="lesson-study-view flex flex-col h-[calc(100vh-64px)] w-full bg-slate-950 overflow-hidden relative lg:flex-row">
    
    <!-- Mobile Tab Toggle (Show only on screens < 768px) -->
    <div v-if="isMobile" class="flex border-b border-white/10 bg-slate-900/90 backdrop-blur-md flex-shrink-0 z-10 w-full">
      <button 
        @click="mobileView = 'theory'"
        :class="['flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider transition-colors', mobileView === 'theory' ? 'bg-slate-950 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400']"
      >
        Lý Thuyết
      </button>
      <button 
        @click="mobileView = 'sandbox'"
        :class="['flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider transition-colors', mobileView === 'sandbox' ? 'bg-slate-950 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400']"
      >
        Mục lục / Thực hành
      </button>
    </div>

    <!-- ==================== DEFAULT MODE ==================== -->
    <!-- Main Content Area (Scrollable Vertically) -->
    <div 
      v-if="!isDevMode"
      v-show="!isMobile || mobileView === 'theory'"
      class="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar relative" 
      ref="theoryContainerRef" 
      @scroll="handleScroll"
    >
      
      <!-- Top Half: Sandbox (Fixed Height) -->
      <section class="w-full h-[75vh] min-h-[600px] border-b border-white/10 bg-slate-950 relative flex-shrink-0">
        <div class="absolute top-0 left-0 w-full px-4 py-2 bg-slate-900/80 text-xs text-slate-400 flex items-center justify-between z-10 border-b border-white/10 backdrop-blur-sm">
          <span>KHÔNG GIAN TƯƠNG TÁC (SANDBOX)</span>
          <div class="flex items-center gap-4">
            <span v-if="lesson?.sandboxType" class="text-indigo-400 font-bold uppercase tracking-widest text-[10px]">
              {{ lesson.sandboxType }}
            </span>
            <button @click="isDevMode = true" class="px-3 py-1 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 rounded border border-indigo-500/30 font-bold flex items-center gap-1 transition">
              <span>🚀 Dev Mode</span>
            </button>
          </div>
        </div>
        <div class="w-full h-full pt-8">
          <component
            v-if="sandboxComponent"
            :is="sandboxComponent"
            class="w-full h-full"
          />
          <div v-else class="w-full h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center pt-12">
            <div class="text-4xl mb-2">⚡</div>
            <h4 class="text-slate-400 font-bold text-sm">Sân chơi DSA Tự Do</h4>
            <p class="text-xs mt-1 text-slate-600 max-w-xs">Không có sandbox đặc trưng cho bài này.</p>
          </div>
        </div>
      </section>

      <!-- Loading State for Content -->
      <div v-if="loading" class="flex-1 flex flex-col items-center justify-center p-12 bg-slate-900/40">
        <div class="inline-block w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p class="text-slate-400 mt-4 text-sm">Đang tải bài giảng...</p>
      </div>

      <!-- Bottom Half: Theory & Discussion -->
      <section v-else-if="lesson" class="w-full bg-slate-900/40 flex-1 flex flex-col items-center">
        <div class="w-full max-w-5xl">
          <!-- Lesson Header -->
          <header class="px-6 lg:px-12 py-8 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <router-link :to="courseId ? `/courses/${courseId}` : '/courses'" class="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 mb-3">
                <span>←</span> Quay lại khóa học
              </router-link>
              <h1 class="text-3xl font-black text-white">
                {{ lesson.title }}
              </h1>
            </div>
            <div class="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 shadow-inner">
              <span class="text-sm font-bold text-emerald-400">⚡ Nhận +{{ lesson?.xpReward ?? 20 }} XP</span>
            </div>
          </header>

          <!-- Tabs Header -->
          <div class="flex border-b border-white/10 px-6 lg:px-12">
            <button 
              @click="activeTab = 'theory'"
              :class="['py-4 px-6 text-sm font-black uppercase tracking-wider border-b-2 transition-all', activeTab === 'theory' ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' : 'border-transparent text-slate-400 hover:text-slate-200']"
            >
              📖 Lý Thuyết
            </button>
            <button 
              @click="activeTab = 'discussion'"
              :class="['py-4 px-6 text-sm font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2', activeTab === 'discussion' ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' : 'border-transparent text-slate-400 hover:text-slate-200']"
            >
              💬 Thảo Luận
            </button>
          </div>

          <!-- Theory Content -->
          <div v-show="activeTab === 'theory'" class="px-6 lg:px-12 py-10 pb-24">
            <article class="prose prose-invert max-w-none text-slate-300 leading-relaxed text-base md:text-lg" v-html="renderedContent" @click="handleTheoryClick" @mouseover="handleTheoryMouseOver"></article>
            <!-- Actions Footer -->
            <div class="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-6 justify-between items-center">
              <div class="text-sm text-slate-400 flex flex-col gap-2">
                <span>Hãy chắc chắn bạn đã đọc kỹ lý thuyết và thực hành thử.</span>
                <span v-if="!isAntiCheatSatisfied && lesson?.sandboxType" class="text-amber-500 font-semibold flex items-center gap-2">⚠️ Xem giải thuật chạy để mở khóa (Đã xem: {{ viewedPercent }}%)</span>
                <span v-else-if="lesson?.sandboxType" class="text-emerald-400 font-semibold flex items-center gap-2">✓ Đã đạt đủ điều kiện hoàn thành (Đã xem: {{ viewedPercent }}%)</span>
              </div>
              <button @click="completeCurrentLesson" :disabled="completing || !isAntiCheatSatisfied" class="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(5,150,105,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none text-base whitespace-nowrap">
                {{ completing ? 'Đang gửi...' : 'Đánh dấu hoàn thành ✓' }}
              </button>
            </div>
          </div>
          <!-- Discussion Pane -->
          <div v-if="activeTab === 'discussion'" class="px-6 lg:px-12 py-10 pb-24">
            <LessonDiscussionPanel :lesson-id="lesson.id" />
          </div>
        </div>
      </section>
    </div>

    <!-- ==================== COURSE PLAYLIST DRAWER (SLIDE IN/OUT) ==================== -->
    <!-- Overlay for mobile -->
    <div 
      v-if="isPlaylistOpen && isMobile" 
      @click="isPlaylistOpen = false"
      class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-[1999]"
    ></div>

    <aside 
      :class="[
        'absolute top-0 right-0 h-full z-[2000] flex flex-col bg-[#0f1423] border-l border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-in-out',
        isPlaylistOpen ? 'translate-x-0 w-80 lg:w-96' : 'translate-x-full w-80 lg:w-96',
        {'hidden': isMobile && mobileView !== 'sandbox'}
      ]"
    >
      <div class="px-6 py-5 border-b border-white/10 bg-slate-900 shadow-sm z-10 flex justify-between items-center">
        <div>
          <h3 class="text-sm font-black text-white uppercase tracking-widest">Nội dung khóa học</h3>
          <p class="text-xs text-slate-400 mt-1 line-clamp-1" v-if="courseDetails">{{ courseDetails.title }}</p>
        </div>
        <button @click="isPlaylistOpen = false" class="p-2 -mr-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      
      <div class="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2 bg-[#090b14]">
        <div v-if="!courseDetails" class="text-center text-slate-500 text-sm mt-10">Đang tải danh sách...</div>
        <template v-else>
          <button v-for="(item, index) in courseDetails.lessons" :key="item.id" @click="goToLesson(item.id)" :class="['w-full text-left p-4 rounded-xl border transition-all duration-300 flex gap-4 group', item.id === lesson?.id ? 'bg-indigo-600/20 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)] relative overflow-hidden' : 'bg-slate-800/40 border-transparent hover:bg-slate-800 hover:border-white/10']">
            <div v-if="item.id === lesson?.id" class="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-xl shadow-[0_0_10px_rgba(99,102,241,1)]"></div>
            <div class="mt-0.5 z-10 relative">
              <div v-if="item.status === 'Completed'" class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <div v-else-if="item.id === lesson?.id" class="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 relative">
                <div class="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
              </div>
              <div v-else class="w-5 h-5 rounded-full bg-slate-800 border border-slate-600 text-slate-500 flex items-center justify-center text-[10px] font-bold">{{ Number(index) + 1 }}</div>
            </div>
            <div class="flex-1 z-10 relative">
              <h4 :class="['text-sm font-bold leading-snug', item.id === lesson?.id ? 'text-indigo-200' : 'text-slate-300 group-hover:text-white']">{{ item.title }}</h4>
              <div class="flex items-center gap-3 mt-1.5 text-[11px] font-semibold text-slate-500">
                <span class="flex items-center gap-1 text-emerald-500/80">⚡ {{ item.xpReward }} XP</span>
                <span v-if="item.quizId" class="flex items-center gap-1 text-amber-500/70">📝 Có Quiz</span>
              </div>
            </div>
          </button>
        </template>
      </div>
    </aside>

    <!-- Floating Toggle Button for Playlist -->
    <button 
      v-show="!isPlaylistOpen"
      @click="isPlaylistOpen = true"
      class="absolute bottom-6 right-6 z-30 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-full shadow-[0_5px_20px_rgba(79,70,229,0.4)] border border-indigo-400/30 flex items-center gap-2 font-bold text-sm transition-all hover:scale-105 active:scale-95"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
      Mục lục
    </button>

    <!-- ==================== DEV MODE (SPLIT SCREEN) ==================== -->
    <template v-if="isDevMode">
      <section class="w-full h-full bg-slate-950 relative flex flex-col">
        <div class="w-full px-4 py-2 bg-slate-900/90 text-sm text-slate-300 flex items-center justify-between z-20 border-b border-white/10 flex-shrink-0">
          <div class="flex items-center gap-2">
            <span class="text-indigo-400">⚡ Dev Mode</span>
            <span class="text-slate-500 text-xs hidden md:inline">| Không gian lập trình chuyên nghiệp</span>
          </div>
          <button @click="isDevMode = false" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-white/10 font-bold text-xs transition">
            Đóng Dev Mode ✕
          </button>
        </div>
        
        <div class="flex-1 w-full relative">
          <component
            v-if="sandboxComponent"
            :is="sandboxComponent"
            class="absolute inset-0 w-full h-full"
          >
            <!-- Injected Theory for DevMode -->
            <template #theory>
              <div class="flex flex-col h-full w-full bg-[#090b14]">
                <header class="px-6 py-4 border-b border-white/10 flex flex-col justify-between gap-3 bg-slate-950 flex-shrink-0">
                  <h1 class="text-lg font-black text-white line-clamp-1" v-if="lesson" :title="lesson?.title">{{ lesson?.title }}</h1>
                  <div class="flex gap-4">
                    <button @click="activeTab = 'theory'" :class="['text-xs font-bold uppercase tracking-wider', activeTab === 'theory' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300']">Lý Thuyết</button>
                    <button @click="activeTab = 'discussion'" :class="['text-xs font-bold uppercase tracking-wider', activeTab === 'discussion' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300']">Thảo Luận</button>
                  </div>
                </header>

                <div class="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 relative" ref="theoryContainerRef" @scroll="handleScroll">
                  <div v-show="activeTab === 'theory'">
                    <article class="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed" v-html="renderedContent" @click="handleTheoryClick" @mouseover="handleTheoryMouseOver"></article>
                    <div class="mt-8 pt-6 border-t border-white/10 flex flex-col gap-4 items-start">
                      <span v-if="!isAntiCheatSatisfied && lesson?.sandboxType" class="text-amber-500 text-xs font-semibold">⚠️ Cần xem giải thuật chạy (Đã xem: {{ viewedPercent }}%)</span>
                      <button @click="completeCurrentLesson" :disabled="completing || !isAntiCheatSatisfied" class="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                        {{ completing ? 'Đang gửi...' : 'Hoàn thành bài học ✓' }}
                      </button>
                    </div>
                  </div>
                  <div v-if="activeTab === 'discussion'">
                    <LessonDiscussionPanel :lesson-id="lesson.id" />
                  </div>
                </div>
              </div>
            </template>
          </component>
        </div>
      </section>
    </template>


    <!-- Success Modal Popup -->
    <div v-if="showSuccessModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div class="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
        <div class="text-5xl mb-4">🎉</div>
        <h3 class="text-2xl font-black text-white">Xuất Sắc!</h3>
        <p class="text-slate-300 mt-2 text-sm">Bạn đã hoàn thành bài học và tích lũy thêm điểm kinh nghiệm.</p>
        
        <div class="my-6 p-4 rounded-2xl bg-white/5 border border-white/5 inline-flex flex-col items-center">
          <span class="text-xs text-slate-400 font-bold uppercase tracking-widest">Điểm nhận được</span>
          <span class="text-3xl font-black text-emerald-400 mt-1">+{{ lesson?.xpReward }} XP</span>
        </div>

        <div class="flex flex-col gap-3">
          <button
            v-if="lesson?.quizId"
            @click="goToLinkedQuiz(lesson.quizId)"
            class="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg"
          >
            Làm bài trắc nghiệm liên kết 📝
          </button>
          
          <!-- Nút học bài tiếp theo nếu có -->
          <button
            v-if="nextLessonId"
            @click="goToLesson(nextLessonId)"
            class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg"
          >
            Học bài tiếp theo ➔
          </button>

          <button
            @click="goBackToCourse"
            class="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all border border-white/5"
          >
            Quay lại trang khóa học
          </button>
        </div>
      </div>
    </div>

    <!-- Resume Progress Toast (Cross-device Sync) -->
    <div v-if="showResumeToast && resumeData" class="fixed bottom-6 right-6 lg:right-[420px] z-50 max-w-sm bg-slate-900/95 border border-indigo-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-fade-in flex flex-col gap-3">
      <div class="flex items-start gap-3">
        <span class="text-xl">🔄</span>
        <div>
          <h4 class="text-xs font-bold text-white uppercase tracking-wider">Khôi phục tiến trình</h4>
          <p class="text-[11px] text-slate-300 mt-1 leading-relaxed">
            Hệ thống ghi nhận bạn đang học dở bài học này tại bước {{ resumeData.frameIndex + 1 }} (vị trí đọc {{ Math.round(resumeData.scrollPercent) }}%). Bạn có muốn tiếp tục từ vị trí này?
          </p>
        </div>
      </div>
      <div class="flex justify-end gap-2 text-xs">
        <button @click="showResumeToast = false" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition">
          Bỏ qua
        </button>
        <button @click="acceptResume" class="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition">
          Đồng ý
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../features/auth/store/useAuthStore';
import { useQuizStore } from '../features/quiz-system/store/useQuizStore';
import { useConfetti } from '../composables/useConfetti';
import { useAnimationStore } from '../features/animation-engine/store/useAnimationStore';
import LessonDiscussionPanel from './LessonDiscussionPanel.vue';

// Import các sandbox views có sẵn làm dynamic components
import SortingView from './SortingView.vue';
import GraphView from './GraphView.vue';
import OOPVisualizationView from './OOPVisualizationView.vue';
import SOLIDVisualizationView from './SOLIDVisualizationView.vue';
import PatternsView from './PatternsView.vue';
import SystemDesignVizView from './SystemDesignVizView.vue';

interface LessonDetailDto {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  contentMd: string;
  sandboxType: string;
  sandboxConfig: string;
  quizId: string | null;
  xpReward: number;
  orderIndex: number;
  status: string;
  lastActiveFrameIndex: number;
  lastScrollPercent: number;
}

declare global {
  interface Window {
    MathJax?: any;
    mermaid?: any;
  }
}

const authStore = useAuthStore();
const quizStore = useQuizStore();
const animStore = useAnimationStore();
const route = useRoute();
const router = useRouter();
const { fireQuizPass } = useConfetti();
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

const loading = ref(true);
const completing = ref(false);
const lesson = ref<LessonDetailDto | null>(null);
const showSuccessModal = ref(false);

const activeTab = ref<'theory' | 'discussion'>('theory');
const theoryContainerRef = ref<HTMLElement | null>(null);

// ── Mobile Responsive State ──
const isMobile = ref(false);
const mobileView = ref<'theory' | 'sandbox'>('theory');

// ── Anti-cheat State ──
const visitedFrames = ref<Set<number>>(new Set());

// ── Resume Progress State ──
const showResumeToast = ref(false);
const resumeData = ref<{ frameIndex: number; scrollPercent: number } | null>(null);

// ── View Modes ──
const isDevMode = ref(false);
const isPlaylistOpen = ref(window.innerWidth >= 1024); // Tự động mở trên desktop ban đầu

// ── Course Outline State ──
const courseDetails = ref<any>(null);
const nextLessonId = computed(() => {
  if (!courseDetails.value || !lesson.value) return null;
  const lessons = courseDetails.value.lessons;
  const currentIndex = lessons.findIndex((l: any) => l.id === lesson.value?.id);
  if (currentIndex >= 0 && currentIndex < lessons.length - 1) {
    return lessons[currentIndex + 1].id;
  }
  return null;
});

const courseId = computed(() => lesson.value?.courseId ?? '');

const sandboxComponent = computed(() => {
  if (!lesson.value?.sandboxType) return null;
  switch (lesson.value.sandboxType.toLowerCase()) {
    case 'sorting': return SortingView;
    case 'graph': return GraphView;
    case 'oop': return OOPVisualizationView;
    case 'solid': return SOLIDVisualizationView;
    case 'patterns': return PatternsView;
    case 'system': return SystemDesignVizView;
    default: return null;
  }
});

// Custom Markdown to HTML simple parser supporting data-frame-index and LaTeX/Mermaid elements
const renderedContent = computed(() => {
  if (!lesson.value?.contentMd) return '';
  let md = lesson.value.contentMd;

  // Replace ```mermaid codeblocks with <pre class="mermaid">
  md = md.replace(/```mermaid\n([\s\S]*?)```/g, '<pre class="mermaid">$1</pre>');

  // Headers
  md = md.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-white mt-6 mb-2">$1</h3>');
  md = md.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-white mt-8 mb-3">$1</h2>');
  md = md.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-black text-white mt-4 mb-4">$1</h1>');

  // Bullet points
  md = md.replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-slate-300 my-1">$1</li>');

  // Two-way highlight syntax: [Text description](frame:X)
  md = md.replace(/\[([^\]]+)\]\(frame:(\d+)\)/g, '<span class="theory-step cursor-pointer hover:text-indigo-300 border-b border-indigo-500/20 hover:border-indigo-400 transition-all font-bold text-indigo-400" data-frame-index="$2">$1</span>');

  // Bold text
  md = md.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');

  // Inline code
  md = md.replace(/`(.*?)`/g, '<code class="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-xs">$1</code>');

  // Line breaks
  md = md.replace(/\n/g, '<br />');

  return md;
});

const viewedPercent = computed(() => {
  if (animStore.totalSteps <= 1) return 100;
  return Math.round((visitedFrames.value.size / animStore.totalSteps) * 100);
});

const isAntiCheatSatisfied = computed(() => {
  if (!lesson.value?.sandboxType || animStore.totalSteps <= 1) return true;
  return viewedPercent.value >= 90;
});

// Dynamic Loader for MathJax and Mermaid.js
function loadExternalScripts() {
  // MathJax Configuration & Injection
  if (!window.MathJax) {
    window.MathJax = {
      tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']]
      },
      svg: {
        fontCache: 'global'
      }
    };
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
    script.async = true;
    document.head.appendChild(script);
  } else {
    triggerMathJaxRender();
  }

  // Mermaid.js Injection
  if (!window.mermaid) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
    script.async = true;
    script.onload = () => {
      window.mermaid.initialize({ startOnLoad: false, theme: 'dark' });
      triggerMermaidRender();
    };
    document.head.appendChild(script);
  } else {
    triggerMermaidRender();
  }
}

function triggerMathJaxRender() {
  if (window.MathJax && window.MathJax.typesetPromise) {
    nextTick(() => {
      window.MathJax.typesetPromise().catch((err: any) => console.error('MathJax error:', err));
    });
  }
}

function triggerMermaidRender() {
  if (window.mermaid && window.mermaid.run) {
    nextTick(() => {
      window.mermaid.run().catch((err: any) => console.error('Mermaid run error:', err));
    });
  }
}

// ── Mobile detection ──
function updateIsMobile() {
  isMobile.value = window.innerWidth < 768;
}

// ── Two-way sync: click or hover to jump frame ──
function handleTheoryClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  const frameIdxAttr = target.getAttribute('data-frame-index') || target.closest('[data-frame-index]')?.getAttribute('data-frame-index');
  if (frameIdxAttr) {
    const idx = parseInt(frameIdxAttr, 10);
    animStore.goToFrame(idx);
  }
}

let hoverTimeout: ReturnType<typeof setTimeout> | null = null;
function handleTheoryMouseOver(e: MouseEvent) {
  const target = e.target as HTMLElement;
  const frameIdxAttr = target.getAttribute('data-frame-index') || target.closest('[data-frame-index]')?.getAttribute('data-frame-index');
  if (frameIdxAttr) {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    hoverTimeout = setTimeout(() => {
      const idx = parseInt(frameIdxAttr, 10);
      if (animStore.currentIndex !== idx && !animStore.isPlaying) {
        animStore.goToFrame(idx);
      }
    }, 150);
  }
}

// Sync progress tracking optimized
let progressTimer: ReturnType<typeof setTimeout> | null = null;

async function saveProgressImmediate(frameIndex: number, scrollPercent: number, keepalive = false) {
  if (!lesson.value) return;
  const token = authStore.getAccessToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    await fetch(`${BASE_URL}/api/v1/concepts/lessons/${lesson.value.id}/progress`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        lastActiveFrameIndex: frameIndex,
        lastScrollPercent: scrollPercent
      }),
      keepalive
    });
  } catch (err) {
    console.error('Failed to save progress:', err);
  }
}

function saveProgressDebounced(frameIndex: number, scrollPercent: number) {
  if (!lesson.value) return;

  // Cache to sessionStorage for reliable retrieval during page unload
  try {
    sessionStorage.setItem(`vdsa_progress_${lesson.value.id}`, JSON.stringify({ frameIndex, scrollPercent }));
  } catch {}

  if (progressTimer) clearTimeout(progressTimer);
  progressTimer = setTimeout(() => {
    saveProgressImmediate(frameIndex, scrollPercent);
  }, 5000); // 5 seconds debounce to reduce backend load
}

function handleBeforeUnload() {
  if (!lesson.value) return;
  try {
    const saved = sessionStorage.getItem(`vdsa_progress_${lesson.value.id}`);
    if (saved) {
      const { frameIndex, scrollPercent } = JSON.parse(saved);
      saveProgressImmediate(frameIndex, scrollPercent, true);
    }
  } catch {}
}

function handleScroll() {
  if (!theoryContainerRef.value || !lesson.value) return;
  const el = theoryContainerRef.value;
  const maxScroll = el.scrollHeight - el.clientHeight;
  const percent = maxScroll > 0 ? (el.scrollTop / maxScroll) * 100 : 0;
  saveProgressDebounced(animStore.currentIndex, percent);
}

// Watch animation frame index changes to trigger auto-save & highlights
let frameDwellTimer: ReturnType<typeof setTimeout> | null = null;

watch(() => animStore.currentIndex, (newIndex) => {
  if (!lesson.value || activeTab.value !== 'theory') return;
  
  // Track visited frames for anti-cheat:
  // If visualizer is playing, trust it and add instantly.
  // If manually scrubbing/clicking, enforce 1000ms dwell time.
  if (frameDwellTimer) clearTimeout(frameDwellTimer);
  if (animStore.isPlaying) {
    visitedFrames.value.add(newIndex);
  } else {
    frameDwellTimer = setTimeout(() => {
      visitedFrames.value.add(newIndex);
    }, 1000);
  }

  let scrollPercent = 0;
  if (theoryContainerRef.value) {
    const el = theoryContainerRef.value;
    const maxScroll = el.scrollHeight - el.clientHeight;
    scrollPercent = maxScroll > 0 ? (el.scrollTop / maxScroll) * 100 : 0;
  }
  saveProgressDebounced(newIndex, scrollPercent);

  // Two-way highlight sync logic (Visualizer -> Theory)
  if (theoryContainerRef.value) {
    // Reset all highlights
    const steps = theoryContainerRef.value.querySelectorAll('[data-frame-index]');
    steps.forEach(el => {
      el.classList.remove('bg-amber-500/20', 'text-amber-300', 'border-amber-400');
    });

    // Highlight active element
    const currentStep = theoryContainerRef.value.querySelector(`[data-frame-index="${newIndex}"]`);
    if (currentStep) {
      currentStep.classList.add('bg-amber-500/20', 'text-amber-300', 'border-amber-400');
      currentStep.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
});

// Re-render LaTeX / diagrams on content updates
watch(renderedContent, () => {
  triggerMathJaxRender();
  triggerMermaidRender();
});

async function loadLessonDetail() {
  loading.value = true;
  const lessonId = route.params.id;

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = authStore.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}/api/v1/concepts/lessons/${lessonId}`, { headers });
    if (res.ok) {
      const data: LessonDetailDto = await res.json();
      lesson.value = data;
      visitedFrames.value.clear();

        // Load course details for the sidebar playlist
        loadCourseDetail(data.courseId);

        // Show toast to confirm resuming position and frame index (Cross-device Sync)
        if (data.lastActiveFrameIndex > 0 || data.lastScrollPercent > 0) {
          resumeData.value = {
            frameIndex: data.lastActiveFrameIndex,
            scrollPercent: data.lastScrollPercent
          };
          showResumeToast.value = true;
          // Auto dismiss after 10s
          setTimeout(() => {
            showResumeToast.value = false;
          }, 10000);
        }
      } else {
        router.push('/courses');
      }
    } catch (err) {
      console.error('Failed to load lesson detail:', err);
      router.push('/courses');
    } finally {
      loading.value = false;
    }
}

async function loadCourseDetail(cId: string) {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = authStore.getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/api/v1/concepts/courses/${cId}`, { headers });
    if (res.ok) {
      courseDetails.value = await res.json();
    }
  } catch (err) {
    console.error('Failed to load course details', err);
  }
}

function goToLesson(id: string) {
  if (id !== lesson.value?.id) {
    showSuccessModal.value = false;
    router.push(`/lessons/${id}`);
    
    // We can manually trigger reload since route params change doesn't always remount
    setTimeout(() => {
      loadLessonDetail(); 
      if (theoryContainerRef.value) theoryContainerRef.value.scrollTop = 0;
    }, 50);
  }
}

function acceptResume() {
  showResumeToast.value = false;
  if (!resumeData.value || !lesson.value) return;
  const { frameIndex, scrollPercent } = resumeData.value;

  // Restore scroll
  if (theoryContainerRef.value && scrollPercent > 0) {
    const el = theoryContainerRef.value;
    const maxScroll = el.scrollHeight - el.clientHeight;
    el.scrollTop = (scrollPercent / 100) * maxScroll;
  }

  // Restore frame index
  if (frameIndex > 0) {
    const interval = setInterval(() => {
      if (animStore.frames && animStore.frames.length > 0) {
        animStore.goToFrame(frameIndex);
        clearInterval(interval);
      }
    }, 100);
    setTimeout(() => clearInterval(interval), 5000);
  }
}

async function completeCurrentLesson() {
  if (!lesson.value) return;
  completing.value = true;

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = authStore.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}/api/v1/concepts/lessons/${lesson.value.id}/complete`, {
      method: 'POST',
      headers
    });

    if (res.ok) {
      const data = await res.json();
      // Sync to local user stats
      if (authStore.currentUser) {
        authStore.currentUser.totalXP = data.totalXp;
        authStore.currentUser.currentLevel = data.currentLevel;
      }
      
      // Fire confetti effect
      fireQuizPass();
      showSuccessModal.value = true;
    }
  } catch (err) {
    console.error('Failed to complete lesson:', err);
  } finally {
    completing.value = false;
  }
}

function goToLinkedQuiz(quizId: string) {
  quizStore.startBackendQuiz(quizId);
  router.push('/quiz');
}

function goBackToCourse() {
  showSuccessModal.value = false;
  if (lesson.value) {
    router.push(`/courses/${lesson.value.courseId}`);
  } else {
    router.push('/courses');
  }
}

onMounted(() => {
  loadLessonDetail();
  loadExternalScripts();
  updateIsMobile();
  window.addEventListener('beforeunload', handleBeforeUnload);
  window.addEventListener('resize', updateIsMobile);
});

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
  window.removeEventListener('resize', updateIsMobile);
  if (hoverTimeout) clearTimeout(hoverTimeout);
  if (frameDwellTimer) clearTimeout(frameDwellTimer);
});
</script>

<style scoped>
.lesson-study-view {
  min-height: calc(100vh - 64px);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent; 
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1); 
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2); 
}

.theory-container {
  scrollbar-width: thin;
}

.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
