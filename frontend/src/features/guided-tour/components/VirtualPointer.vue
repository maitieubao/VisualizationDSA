<template>
  <Transition name="fade">
    <div
      v-if="visible"
      class="virtual-pointer fixed pointer-events-none z-[10000] transition-all duration-700 ease-out-quint"
      :style="{
        top: `${y}px`,
        left: `${x}px`,
      }"
    >
      <!-- Glowing cursor ring -->
      <div
        class="relative w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent-cyan/80 flex items-center justify-center transition-all duration-300"
        :class="clicking ? 'scale-75 bg-accent-cyan/35' : 'scale-100 bg-accent-cyan/10'"
      >
        <!-- Center core dot -->
        <div class="w-2.5 h-2.5 rounded-full bg-accent-cyan shadow-[0_0_8px_rgba(6,182,212,0.8)]" />

        <!-- Pulse Ring -->
        <div class="absolute inset-0 rounded-full border border-accent-cyan/40 animate-ping opacity-60" />

        <!-- Mouse Arrow Indicator overlay -->
        <svg
          viewBox="0 0 24 24"
          class="absolute top-2 left-2 w-4 h-4 text-accent-cyan drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
        >
          <path
            d="M4.5 3V17.5L8.9 13.1L13.5 21L16.2 19.5L11.7 11.7L17 11.5L4.5 3Z"
            fill="currentColor"
            stroke="black"
            stroke-width="1.5"
          />
        </svg>

        <!-- Click Ripple Ring -->
        <span
          v-if="clicking"
          class="click-ripple absolute w-16 h-16 rounded-full border-2 border-accent-cyan/90"
        />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  x: number;
  y: number;
  visible: boolean;
  clicking: boolean;
}>();
</script>

<style scoped>
.virtual-pointer {
  /* Using smooth transition for x/y coordinate movement */
  will-change: top, left;
}

/* Custom bezier for smooth snapping movement */
.ease-out-quint {
  transition-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
}

@keyframes ripple {
  0% {
    transform: scale(0.4);
    opacity: 1;
  }
  100% {
    transform: scale(1.6);
    opacity: 0;
  }
}

.click-ripple {
  animation: ripple 0.5s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
