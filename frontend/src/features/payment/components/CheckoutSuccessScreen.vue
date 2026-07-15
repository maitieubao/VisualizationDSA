<template>
  <div class="text-center py-6">
    <div class="w-20 h-20 mx-auto mb-6 bg-accent-green/10 border border-accent-green/30 rounded-full flex items-center justify-center shadow-[0_0_20px_var(--color-emerald-glow)] success-check animate-bounce">
      <BaseIcon name="success" class="w-10 h-10 text-accent-green" />
    </div>
    <h3 class="text-2xl font-bold text-accent-green mb-2">Thanh Toán Thành Công!</h3>
    <p class="text-sm text-[var(--text-secondary)] max-w-sm mx-auto mb-8">
      Chúc mừng bạn! Tài khoản đã được nâng cấp lên **Premium**. Mọi giới hạn học tập và sandbox giải thuật đã được giải phóng.
    </p>
    <button
      @click="$emit('finish')"
      class="px-8 py-3 rounded-[var(--radius-lg)] bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-text-primary font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95"
    >
      Bắt đầu trải nghiệm ngay
    </button>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ finish: [] }>();
</script>

<style scoped>
.success-check { animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes pop { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
</style>
