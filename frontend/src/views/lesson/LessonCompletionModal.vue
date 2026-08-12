<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Overlay -->
    <div class="absolute inset-0 bg-bg-secondary backdrop-blur-md" @click="close" aria-hidden="true" />

    <!-- Dialog (a11y: role=dialog + aria-modal + focus trap + Esc — LM-039) -->
    <div
      ref="dialogEl"
      role="dialog"
      aria-modal="true"
      :aria-label="`Hoàn thành bài học — nhận ${xpReward} XP`"
      class="relative bg-bg-secondary border border-border-subtle rounded-3xl p-8 max-w-md w-full text-center shadow-2xl overflow-hidden"
      tabindex="-1"
    >
      <div class="w-16 h-16 rounded-full bg-accent-green/20 border border-accent-green/30 flex items-center justify-center text-accent-green mx-auto mb-4">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4m6 17v-4m0 0a2 2 0 100-4 2 2 0 000 4zm3.243-8.657a6 6 0 011.414 4.243H16m0 0a6 6 0 01-4.243-1.414M16 17.5a6 6 0 00-4.243-1.414" />
        </svg>
      </div>
      <h3 class="text-2xl font-black text-text-primary">Xuất Sắc!</h3>
      <p class="text-text-secondary mt-2 text-sm">Bạn đã hoàn thành bài học và tích lũy thêm điểm kinh nghiệm.</p>

      <div class="my-6 p-4 rounded-2xl bg-bg-hover border border-border-subtle inline-flex flex-col items-center">
        <span class="text-xs text-text-muted font-bold uppercase tracking-widest">Điểm nhận được</span>
        <span class="text-3xl font-black text-accent-green mt-1">+{{ xpReward }} XP</span>
      </div>

      <div class="flex flex-col gap-3">
        <button
          v-if="nextLessonId"
          @click="$emit('go-next', nextLessonId)"
          class="w-full py-3 bg-gradient-to-r from-accent to-accent-purple hover:from-accent hover:to-accent-purple text-white font-bold rounded-2xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Học bài tiếp theo</span>
          <BaseIcon name="arrow-right" class="w-4 h-4" />
        </button>
        <button
          v-if="quizId"
          @click="$emit('go-quiz', quizId)"
          class="w-full py-3 bg-gradient-to-r from-accent to-accent-purple hover:from-accent hover:to-accent-purple text-white font-bold rounded-2xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Làm bài trắc nghiệm liên kết</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
        <button
          @click="close"
          class="w-full py-3 bg-bg-hover hover:bg-bg-hover text-text-primary font-bold rounded-2xl transition-all border border-border-subtle cursor-pointer"
        >
          Quay lại khóa học
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';

const props = defineProps<{
  show: boolean;
  xpReward: number;
  quizId?: string | null;
  nextLessonId?: string | null;
}>();

const emit = defineEmits<{
  (e: 'go-quiz', quizId: string): void;
  (e: 'go-next', lessonId: string): void;
  (e: 'close'): void;
}>();

const dialogEl = ref<HTMLElement | null>(null);
const previousFocus = ref<HTMLElement | null>(null);

function close(): void {
  emit('close');
}

/** Traps focus trong dialog: Tab/Shift+Tab quay vòng (LM-039). */
function trapFocus(event: KeyboardEvent): void {
  const container = dialogEl.value;
  if (!container) return;

  if (event.key === 'Escape') {
    event.preventDefault();
    close();
    return;
  }
  if (event.key !== 'Tab') return;

  const focusables = Array.from(
    container.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),
  ).filter(el => !el.hasAttribute('disabled'));

  if (focusables.length === 0) {
    event.preventDefault();
    container.focus();
    return;
  }

  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
}

watch(() => props.show, (shown) => {
  if (shown) {
    previousFocus.value = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden'; // lock scroll nền
    window.addEventListener('keydown', trapFocus);
    // Focus vào dialog (không nhảy thẳng vào nút để trình đọc màn hình đọc tiêu đề).
    requestAnimationFrame(() => dialogEl.value?.focus());
  } else {
    document.body.style.overflow = '';
    window.removeEventListener('keydown', trapFocus);
    previousFocus.value?.focus(); // restore focus (LM-039)
    previousFocus.value = null;
  }
}, { immediate: true });

onUnmounted(() => {
  document.body.style.overflow = '';
  window.removeEventListener('keydown', trapFocus);
});
</script>
