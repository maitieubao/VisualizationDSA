<template>
  <div class="interactive-lab w-full h-full flex flex-col bg-bg-secondary border border-border-default rounded-xl overflow-hidden shadow-2xl">
    <div class="px-5 py-4 border-b border-border-default bg-bg-primary flex justify-between items-center shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center border border-border-accent">
          <svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div>
          <h2 class="text-sm font-bold text-text-primary leading-tight">Interactive Lab</h2>
          <p class="text-[11px] text-text-secondary">Thực hành kéo thả và mô phỏng thuật toán trực quan</p>
        </div>
      </div>
    </div>

    <div class="flex-1 flex flex-col items-center justify-center p-8 text-center bg-bg-secondary relative overflow-hidden">
      <!-- Decorative background elements -->
      <div class="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[100px] rounded-full pointer-events-none"></div>
      <div class="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent-purple/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div class="z-10 bg-bg-primary/80 backdrop-blur-md p-8 rounded-2xl border border-border-default max-w-md w-full shadow-2xl">
        <div class="w-20 h-20 mx-auto mb-6 bg-accent-dark/50 rounded-2xl flex items-center justify-center border border-border-accent shadow-[0_0_30px_rgba(99,102,241,0.2)]">
          <svg class="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-text-primary mb-2">Đang phát triển</h3>
        <p class="text-sm text-text-secondary mb-8 leading-relaxed">
          Tính năng Interactive Lab (Kéo thả thao tác mô phỏng) hiện đang được xây dựng và sẽ sớm ra mắt trong phiên bản tiếp theo.
        </p>
        
        <button @click="$emit('completeStep')" 
          class="w-full py-3 bg-gradient-to-r from-accent to-accent-purple hover:from-accent hover:to-accent-purple text-text-primary rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
          <span>Tiếp tục học</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'completeStep'): void;
}>();
</script>
