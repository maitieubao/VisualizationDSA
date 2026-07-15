<template>
  <Transition name="fade">
    <div
      v-if="tourStore.isActive"
      class="guided-tour-overlay-root fixed inset-0 z-[9999] font-sans select-none"
      :class="{ 'flex items-center justify-center': !spotlightStyle }"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 transition-all duration-300"
        :class="spotlightStyle ? 'bg-transparent' : 'bg-slate-950/70 backdrop-blur-[2px]'"
        @click="handleBackdropClick"
      />

      <!-- Spotlight Highlighter (if element exists) -->
      <div
        v-if="spotlightStyle"
        class="spotlight-highlight absolute border-2 border-accent-cyan/80 rounded-xl transition-all duration-300 pointer-events-none"
        :style="spotlightStyle"
      >
        <span class="absolute -top-6 left-0 bg-accent-cyan text-slate-950 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-t-md shadow-lg shadow-accent-cyan/20 animate-pulse">
          Tiêu điểm
        </span>
      </div>

      <!-- Virtual Pointer for Auto-Play Simulation -->
      <VirtualPointer
        v-if="tourStore.virtualCursor"
        :x="tourStore.virtualCursor.x"
        :y="tourStore.virtualCursor.y"
        :visible="tourStore.virtualCursor.visible"
        :clicking="tourStore.virtualCursor.clicking"
      />

      <!-- Tour Dialog Card (Glassmorphic) with Mascot side-by-side -->
      <Transition name="scale" mode="out-in">
        <div
          :key="tourStore.currentStepIndex"
          class="dialog-card p-6 rounded-2xl border border-white/10 shadow-2xl flex flex-col gap-4 text-left transition-all duration-300"
          :style="[cardStyle, defaultCardStyle]"
        >
          <!-- Mascot and content wrapper -->
          <div class="flex gap-4 items-start">
            <!-- Virtual Mascot side column -->
            <VirtualMascot :state="currentStep.avatarState || 'EXPLAINING'" class="mt-1 flex-shrink-0" />

            <!-- Main Content Area -->
            <div class="flex-1 flex flex-col gap-2 min-w-0">
              <!-- Top indicators -->
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-mono font-bold tracking-widest text-accent-cyan uppercase">
                  Trợ lý ảo • {{ tourStore.currentStepIndex + 1 }} / {{ tourStore.currentSteps.length }}
                </span>
                
                <!-- Talking Voice Waves (Equalizer) -->
                <div v-if="isTyping" class="voice-wave flex items-end gap-0.5 h-3 ml-2">
                  <span class="w-0.5 bg-accent-cyan animate-bar1"></span>
                  <span class="w-0.5 bg-accent-cyan animate-bar2"></span>
                  <span class="w-0.5 bg-accent-cyan animate-bar3"></span>
                  <span class="w-0.5 bg-accent-cyan animate-bar4"></span>
                </div>

                <div class="flex gap-1 ml-auto">
                  <span
                    v-for="(_, idx) in tourStore.currentSteps"
                    :key="idx"
                    class="w-1.5 h-1.5 rounded-full transition-all duration-200"
                    :class="idx === tourStore.currentStepIndex ? 'bg-accent-cyan w-3' : 'bg-white/20'"
                  />
                </div>
              </div>

              <!-- Main Info -->
              <div class="flex flex-col gap-1.5 mt-1">
                <h3 class="text-base font-bold text-text-primary tracking-tight">
                  {{ currentStep.title }}
                </h3>
                <p class="text-xs text-text-secondary leading-relaxed break-words">
                  {{ typedDescription }}
                </p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-between mt-1 pt-4 border-t border-white/5">
            <button
              class="px-3 py-1.5 rounded-lg text-xs font-bold text-text-muted hover:text-text-primary hover:bg-white/5 transition-all cursor-pointer"
              @click="tourStore.skipTour()"
            >
              Bỏ qua
            </button>

            <!-- Simulation auto-play button -->
            <button
              v-if="currentStep.actionScript && currentStep.actionScript.length > 0"
              class="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/35 transition-all cursor-pointer flex items-center gap-1 shadow-lg shadow-amber-500/10"
              :disabled="tourStore.isExecutingScript"
              @click="tourStore.runCurrentStepScript()"
            >
              <span>{{ tourStore.isExecutingScript ? 'Đang chạy...' : 'Xem Trợ lý Thao tác ⚡' }}</span>
            </button>

            <div class="flex gap-2">
              <button
                v-if="tourStore.currentStepIndex > 0"
                class="px-3.5 py-1.5 rounded-lg text-xs font-bold text-text-secondary border border-white/10 hover:bg-white/5 transition-all cursor-pointer"
                @click="tourStore.prevStep()"
              >
                Quay lại
              </button>
              <button
                class="px-4 py-1.5 rounded-lg text-xs font-bold bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30 hover:bg-accent-cyan/35 transition-all cursor-pointer flex items-center gap-1 shadow-lg shadow-accent-cyan/10"
                @click="tourStore.nextStep()"
              >
                <span>{{ isLastStep ? 'Hoàn tất' : 'Tiếp tục' }}</span>
                <span class="text-[10px] font-mono">{{ isLastStep ? '✓' : '→' }}</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useGuidedTourStore } from '../store/useGuidedTourStore';
import VirtualMascot from './VirtualMascot.vue';
import VirtualPointer from './VirtualPointer.vue';

const tourStore = useGuidedTourStore();

const currentStep  = computed(() => tourStore.currentSteps[tourStore.currentStepIndex]);
const isLastStep   = computed(() => tourStore.currentStepIndex === tourStore.currentSteps.length - 1);

const spotlightStyle = ref<{ top: string; left: string; width: string; height: string } | null>(null);
const cardStyle = ref<Record<string, string>>({});

const defaultCardStyle = {
  background: 'rgba(15, 23, 42, 0.75)',
  backdropFilter: 'blur(16px)',
  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
};

const typedDescription = ref('');
const isTyping = ref(false);
let typingInterval: any = null;

const startTypewriter = (text: string) => {
  if (typingInterval) clearInterval(typingInterval);
  typedDescription.value = '';
  isTyping.value = true;
  let idx = 0;
  typingInterval = setInterval(() => {
    if (idx < text.length) {
      typedDescription.value += text[idx];
      idx++;
    } else {
      isTyping.value = false;
      clearInterval(typingInterval);
    }
  }, 15);
};

function handleBackdropClick() {
  // Silent prevent closing on backdrop unless skip is intended
}

function updateSpotlight(skipScroll = false) {
  const step     = tourStore.currentSteps[tourStore.currentStepIndex];
  const selector = step?.highlightSelector;
  if (!selector) {
    spotlightStyle.value = null;
    cardStyle.value = {};
    return;
  }

  const el = document.querySelector(selector);
  if (!el) {
    spotlightStyle.value = null;
    cardStyle.value = {};
    return;
  }

  const rect = el.getBoundingClientRect();
  const pad = 8;
  const safeMargin = 16;

  spotlightStyle.value = {
    top: `${rect.top - pad + window.scrollY}px`,
    left: `${rect.left - pad + window.scrollX}px`,
    width: `${rect.width + pad * 2}px`,
    height: `${rect.height + pad * 2}px`,
  };

  // Calculate position card floating beside highlight element
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const cardWidth = Math.min(450, viewportWidth - 32);
  const descLength = step.description?.length || 0;
  const cardHeight = descLength > 150 ? 250 : 200;
  const tooltipHeight = cardHeight;

  let top = 0;
  let left = 0;
  let placement = 'bottom';

  const defaultTooltipHeight = 220;

  if (rect.bottom + defaultTooltipHeight > viewportHeight) {
    placement = 'top';
  } else {
    const fitsBottom = rect.bottom + pad + 12 + tooltipHeight <= viewportHeight - safeMargin;
    const fitsTop = rect.top - pad - 12 - tooltipHeight >= safeMargin;
    const fitsRight = rect.right + pad + 12 + cardWidth <= viewportWidth - safeMargin;
    const fitsLeft = rect.left - pad - 12 - cardWidth >= safeMargin;

    if (fitsBottom) {
      placement = 'bottom';
    } else if (fitsTop) {
      placement = 'top';
    } else if (fitsRight) {
      placement = 'right';
    } else if (fitsLeft) {
      placement = 'left';
    } else {
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      placement = spaceBelow > spaceAbove ? 'bottom' : 'top';
    }
  }

  if (placement === 'bottom') {
    top = rect.bottom + pad + 12;
    left = rect.left + rect.width / 2 - cardWidth / 2;
    left = Math.max(safeMargin, Math.min(left, viewportWidth - cardWidth - safeMargin));
  } else if (placement === 'top') {
    top = rect.top - tooltipHeight - pad - 12;
    left = rect.left + rect.width / 2 - cardWidth / 2;
    left = Math.max(safeMargin, Math.min(left, viewportWidth - cardWidth - safeMargin));
  } else if (placement === 'right') {
    left = rect.right + pad + 12;
    top = rect.top + rect.height / 2 - tooltipHeight / 2;
    top = Math.max(safeMargin, Math.min(top, viewportHeight - tooltipHeight - safeMargin));
  } else if (placement === 'left') {
    left = rect.left - cardWidth - pad - 12;
    top = rect.top + rect.height / 2 - tooltipHeight / 2;
    top = Math.max(safeMargin, Math.min(top, viewportHeight - tooltipHeight - safeMargin));
  }

  top = Math.max(20, Math.min(top, viewportHeight - tooltipHeight - 20));

  cardStyle.value = {
    position: 'absolute',
    top: `${top + window.scrollY}px`,
    left: `${left + window.scrollX}px`,
    width: `${cardWidth}px`,
    zIndex: '9999',
  };

  if (!skipScroll) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => updateSpotlight(true), 300);
  }
}

// Watch active state and current step to calculate spotlight position and typewriter effect
watch(
  () => [tourStore.isActive, tourStore.currentStepIndex],
  () => {
    if (tourStore.isActive) {
      const step = tourStore.currentSteps[tourStore.currentStepIndex];
      if (step) {
        startTypewriter(step.description);
      }
    }
    setTimeout(() => updateSpotlight(false), 150);
  },
  { deep: true, immediate: true }
);

const handleResize = () => {
  updateSpotlight(true);
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  if (typingInterval) clearInterval(typingInterval);
});
</script>

<style scoped>
.guided-tour-overlay-root {
  z-index: 9999;
}

.spotlight-highlight {
  box-shadow: 0 0 0 9999px rgba(2, 6, 23, 0.65), 0 0 15px rgba(6, 182, 212, 0.4);
  z-index: 9998;
}

/* Voice Equalizer animation bars */
@keyframes soundWave {
  0%, 100% { height: 4px; }
  50% { height: 12px; }
}
.animate-bar1 { animation: soundWave 0.6s infinite ease-in-out; }
.animate-bar2 { animation: soundWave 0.4s infinite ease-in-out; }
.animate-bar3 { animation: soundWave 0.8s infinite ease-in-out; }
.animate-bar4 { animation: soundWave 0.5s infinite ease-in-out; }

/* Vue Transition Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.scale-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}

.scale-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-5px);
}
</style>
