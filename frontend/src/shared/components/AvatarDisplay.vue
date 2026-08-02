<template>
  <div class="relative flex items-center justify-center" :class="size">
    <!-- Avatar Image or Initials -->
    <div class="w-full h-full rounded-full overflow-hidden bg-bg-surface border-2 border-border-default flex items-center justify-center relative z-10 shadow-inner">
      <img v-if="avatarUrl" :src="avatarUrl" alt="Avatar" class="w-full h-full object-cover" />
      <span v-else class="font-bold text-text-heading text-lg">{{ initials?.charAt(0).toUpperCase() || 'U' }}</span>
      
      <!-- Overlay slots for hover effects (e.g., upload icon) -->
      <slot name="overlay"></slot>
    </div>

    <!-- Frame Overlay -->
    <img 
      v-if="frameUrl && !frameError" 
      :src="frameUrl" 
      alt="Frame" 
      class="absolute z-20 pointer-events-none object-contain"
      style="width: 135%; height: 135%; max-width: 135%; mix-blend-mode: screen;" 
      @error="onFrameError"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps({
  avatarUrl: { type: String, default: '' },
  frameType: { type: String, default: '' },
  initials: { type: String, default: '' },
  size: { type: String, default: 'w-10 h-10' },
});

const frameError = ref(false);

const onFrameError = () => {
  frameError.value = true;
};

const frameUrl = computed(() => {
  if (!props.frameType) return '';
  const type = props.frameType.toLowerCase().trim();
  
  // If the user already passes "frame_gold", just use it
  if (type.startsWith('frame_')) return `/assets/frames/${type}.png`;
  
  // Otherwise format it
  return `/assets/frames/frame_${type}.png`;
});
</script>
