<template>
  <div v-if="show && resumeData" class="fixed bottom-6 right-6 z-50 max-w-sm bg-bg-secondary border border-accent/30 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-fade-in flex flex-col gap-3">
    <div class="flex items-start gap-3">
      <span class="text-xl">🔄</span>
      <div>
        <h4 class="text-xs font-bold text-white uppercase tracking-wider">Khôi phục tiến trình</h4>
        <p class="text-[11px] text-text-secondary mt-1 leading-relaxed">
          Hệ thống ghi nhận bạn đang học dở bài học này tại bước {{ resumeData.frameIndex + 1 }} (vị trí đọc {{ Math.round(resumeData.scrollPercent) }}%). Bạn có muốn tiếp tục từ vị trí này?
        </p>
      </div>
    </div>
    <div class="flex justify-end gap-2 text-xs">
      <button @click="$emit('dismiss')" class="px-3 py-1.5 rounded-lg bg-bg-hover hover:bg-bg-hover text-text-muted hover:text-white transition cursor-pointer">
        Bỏ qua
      </button>
      <button @click="$emit('accept')" class="px-3 py-1.5 rounded-lg bg-accent hover:bg-accent text-white font-bold transition cursor-pointer">
        Đồng ý
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean;
  resumeData: { frameIndex: number; scrollPercent: number } | null;
}>();

defineEmits<{
  (e: 'dismiss'): void;
  (e: 'accept'): void;
}>();
</script>
