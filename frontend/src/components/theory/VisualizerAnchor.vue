<template>
  <div class="my-4 p-4 border border-indigo-500/30 bg-indigo-500/10 rounded-xl flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play"><polygon points="6 3 20 12 6 21 6 3"/></svg>
      </div>
      <div>
        <h4 class="text-sm font-semibold text-indigo-300">Hoạt ảnh trực quan</h4>
        <p class="text-xs text-slate-400">Xem hoạt ảnh ở Frame #{{ frameIndex }}</p>
      </div>
    </div>
    <button 
      @click="$emit('seek', frameIndex)"
      class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
    >
      Xem ngay
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  frameIndex: number;
}>();
defineEmits<{
  (e: 'seek', frameIndex: number): void;
}>();
</script>
