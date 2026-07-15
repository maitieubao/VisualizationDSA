<template>
  <div class="virtual-mascot-container relative flex flex-col items-center select-none">
    <!-- Floating Avatar Character -->
    <div
      class="mascot-avatar w-16 h-16 rounded-full border border-white/20 flex items-center justify-center shadow-lg transition-all duration-500"
      :class="[mascotClass, emotionGlowClass]"
    >
      <!-- SVG Animated Robot Visualizer -->
      <svg
        viewBox="0 0 100 100"
        class="w-12 h-12 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]"
      >
        <!-- Floating body / head -->
        <g class="animate-bob">
          <!-- Robot Head (Glassmorphic look) -->
          <rect
            x="25"
            y="25"
            width="50"
            height="40"
            rx="12"
            fill="rgba(15, 23, 42, 0.4)"
            stroke="rgba(255, 255, 255, 0.3)"
            stroke-width="2"
          />
          <!-- Ears / Antennas -->
          <line x1="25" y1="45" x2="15" y2="45" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
          <line x1="75" y1="45" x2="85" y2="45" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
          <circle cx="15" cy="45" r="3" fill="currentColor" />
          <circle cx="85" cy="45" r="3" fill="currentColor" />

          <!-- Antenna on top -->
          <line x1="50" y1="25" x2="50" y2="12" stroke="currentColor" stroke-width="2.5" />
          <circle cx="50" cy="10" r="4" fill="currentColor" class="animate-pulse" />

          <!-- Animated Eyes based on Emotion State -->
          <g v-if="state === 'GREETING'" class="text-accent-cyan">
            <!-- Happy curved eyes -->
            <path d="M 34 47 Q 40 40 44 47" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
            <path d="M 56 47 Q 60 40 66 47" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
          </g>

          <g v-else-if="state === 'SIMULATING'" class="text-amber-400">
            <!-- Focused narrow lines -->
            <line x1="33" y1="45" x2="45" y2="45" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" />
            <line x1="55" y1="45" x2="67" y2="45" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" />
          </g>

          <g v-else-if="state === 'SUCCESS'" class="text-emerald-400">
            <!-- Winking / Joyful eyes -->
            <path d="M 33 48 Q 40 40 45 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
            <path d="M 55 45 L 67 49 M 55 49 L 67 45" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
          </g>

          <g v-else class="text-accent-cyan">
            <!-- Default round glowing eyes -->
            <circle cx="39" cy="45" r="4" fill="currentColor" class="animate-pulse" />
            <circle cx="61" cy="45" r="4" fill="currentColor" class="animate-pulse" />
          </g>

          <!-- Smiling mouth -->
          <path
            v-if="state === 'SUCCESS' || state === 'GREETING'"
            d="M 42 56 Q 50 63 58 56"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
          />
          <path
            v-else
            d="M 45 57 L 55 57"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </g>
      </svg>
    </div>

    <!-- Small glow ring beneath the floating mascot -->
    <div class="w-8 h-1 bg-accent-cyan/25 rounded-full blur-[2px] mt-2 animate-shadowScale" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  state: 'GREETING' | 'EXPLAINING' | 'SIMULATING' | 'SUCCESS';
}>();

const mascotClass = computed(() => {
  switch (props.state) {
    case 'GREETING':
      return 'border-accent-cyan/40 bg-slate-900/60 text-accent-cyan';
    case 'SIMULATING':
      return 'border-amber-500/40 bg-slate-900/60 text-amber-400';
    case 'SUCCESS':
      return 'border-emerald-500/40 bg-slate-900/60 text-emerald-400';
    default:
      return 'border-white/20 bg-slate-900/60 text-accent-cyan';
  }
});

const emotionGlowClass = computed(() => {
  switch (props.state) {
    case 'GREETING':
      return 'shadow-[0_0_20px_rgba(6,182,212,0.25)]';
    case 'SIMULATING':
      return 'shadow-[0_0_20px_rgba(245,158,11,0.25)] animate-pulse';
    case 'SUCCESS':
      return 'shadow-[0_0_25px_rgba(16,185,129,0.3)]';
    default:
      return 'shadow-[0_0_15px_rgba(255,255,255,0.05)]';
  }
});
</script>

<style scoped>
.mascot-avatar {
  backdrop-filter: blur(12px);
}

@keyframes bob {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.animate-bob {
  animation: bob 3s ease-in-out infinite;
}

@keyframes shadowScale {
  0%, 100% {
    transform: scaleX(1);
    opacity: 0.25;
  }
  50% {
    transform: scaleX(0.7);
    opacity: 0.12;
  }
}

.animate-shadowScale {
  animation: shadowScale 3s ease-in-out infinite;
}
</style>
