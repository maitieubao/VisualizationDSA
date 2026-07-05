<template>
  <div class="lesson-study-view flex flex-col lg:flex-row h-[calc(100vh-64px)] w-full overflow-hidden bg-slate-950">
    <!-- Mobile Tab Toggle (Show only on screens < 768px) -->
    <div v-if="isMobile" class="flex border-b border-white/10 bg-slate-900/90 backdrop-blur-md flex-shrink-0 z-10">
      <button 
        @click="mobileView = 'theory'"
        :class="['flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider transition-colors', mobileView === 'theory' ? 'bg-slate-950 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400']"
      >
        📖 Đọc Lý Thuyết
      </button>
      <button 
        @click="mobileView = 'sandbox'"
        :class="['flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider transition-colors', mobileView === 'sandbox' ? 'bg-slate-950 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400']"
      >
        ⚡ Xem Hoạt Ảnh
      </button>
    </div>

    <!-- Left Column: Theory & Markdown Content / Discussion -->
    <section 
      v-show="!isMobile || mobileView === 'theory'"
      class="w-full lg:w-1/2 h-full flex flex-col border-r border-white/10 bg-slate-900/60 backdrop-blur-md"
    >
      <!-- Lesson Nav Header -->
      <header class="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/40 flex-shrink-0">
        <div>
          <router-link :to="courseId ? `/courses/${courseId}` : '/courses'" class="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
            <span>←</span> Quay lại khóa học
          </router-link>
          <h2 class="text-base font-extrabold text-white mt-1 line-clamp-1" v-if="lesson">
            {{ lesson.title }}
          </h2>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold text-slate-400">⚡ +{{ lesson?.xpReward ?? 20 }} XP</span>
        </div>
      </header>

      <!-- Loading State -->
      <div v-if="loading" class="flex-1 flex flex-col items-center justify-center p-8">
        <div class="inline-block w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p class="text-slate-400 mt-4 text-sm">Đang tải bài giảng...</p>
      </div>

      <!-- Theory or Discussion Pane -->
      <template v-else-if="lesson">
        <!-- Tabs Header -->
        <div class="flex border-b border-white/10 bg-slate-900/40 px-6 flex-shrink-0">
          <button 
            @click="activeTab = 'theory'"
            :class="['py-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all', activeTab === 'theory' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200']"
          >
            📖 Bài Học Lý Thuyết
          </button>
          <button 
            @click="activeTab = 'discussion'"
            :class="['py-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5', activeTab === 'discussion' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200']"
          >
            💬 Thảo Luận Q&A
          </button>
        </div>

        <!-- Theory Content Pane -->
        <div 
          v-show="activeTab === 'theory'" 
          ref="theoryContainerRef"
          @scroll="handleScroll"
          class="flex-1 overflow-y-auto px-8 py-6 theory-container"
        >
          <!-- Rendered Theory HTML -->
          <article 
            class="prose prose-invert max-w-none text-slate-300 leading-relaxed text-sm" 
            v-html="renderedContent"
            @click="handleTheoryClick"
            @mouseover="handleTheoryMouseOver"
          ></article>

          <!-- Actions Footer -->
          <div class="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-4 justify-between items-center pb-8">
            <div class="text-xs text-slate-400 flex flex-col gap-1">
              <span>Hãy chắc chắn bạn đã đọc kỹ lý thuyết và thực hành thử trên sandbox bên cạnh.</span>
              <!-- Anti-cheat indicator -->
              <span v-if="!isAntiCheatSatisfied && lesson?.sandboxType" class="text-amber-500 font-semibold flex items-center gap-1">
                ⚠️ Tương tác hoặc xem giải thuật để mở khóa (Đã xem: {{ viewedPercent }}%)
              </span>
              <span v-else-if="lesson?.sandboxType" class="text-emerald-400 font-semibold flex items-center gap-1">
                ✓ Đã đạt điều kiện tương tác hoạt họa giải thuật (Đã xem: {{ viewedPercent }}%)
              </span>
            </div>
            <button
              @click="completeCurrentLesson"
              :disabled="completing || !isAntiCheatSatisfied"
              class="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
            >
              {{ completing ? 'Đang gửi...' : 'Đánh dấu hoàn thành ✓' }}
            </button>
          </div>
        </div>

        <!-- Discussion Pane -->
        <div v-if="activeTab === 'discussion'" class="flex-1 min-h-0 p-6">
          <LessonDiscussionPanel :lesson-id="lesson.id" class="h-full" />
        </div>
      </template>
    </section>

    <!-- Right Column: Interactive Sandbox Container -->
    <section 
      v-show="!isMobile || mobileView === 'sandbox'"
      class="w-full lg:w-1/2 h-full bg-slate-950 flex flex-col overflow-hidden relative"
    >
      <div class="px-4 py-2 border-b border-white/10 bg-slate-900/40 text-xs text-slate-400 flex items-center justify-between flex-shrink-0">
        <span>KHÔNG GIAN TƯƠNG TÁC (SANDBOX)</span>
        <span v-if="lesson?.sandboxType" class="text-indigo-400 font-bold uppercase tracking-widest text-[10px]">
          {{ lesson.sandboxType }}
        </span>
      </div>

      <div class="flex-1 min-h-0 w-full relative">
        <component
          v-if="sandboxComponent"
          :is="sandboxComponent"
          class="w-full h-full"
        />
        <div v-else class="w-full h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center">
          <div class="text-4xl mb-2">⚡</div>
          <h4 class="text-slate-400 font-bold text-sm">Sân chơi DSA Tự Do</h4>
          <p class="text-xs mt-1 text-slate-600 max-w-xs">Không có sandbox đặc trưng cho bài này. Hãy tự do khám phá các tính năng khác.</p>
        </div>
      </div>
    </section>

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
            class="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-bold rounded-2xl transition-all duration-300"
          >
            Làm bài trắc nghiệm liên kết 📝
          </button>
          <button
            @click="goBackToCourse"
            class="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all border border-white/5"
          >
            Quay lại khóa học
          </button>
        </div>
      </div>
    </div>

    <!-- Resume Progress Toast (Cross-device Sync) -->
    <div v-if="showResumeToast && resumeData" class="fixed bottom-6 right-6 z-50 max-w-sm bg-slate-900/95 border border-indigo-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-fade-in flex flex-col gap-3">
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
