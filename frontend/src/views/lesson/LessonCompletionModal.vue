<template>
  <div v-if="show" class="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
    <div class="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
      <div class="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-4">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4m6 17v-4m0 0a2 2 0 100-4 2 2 0 000 4zm3.243-8.657a6 6 0 011.414 4.243H16m0 0a6 6 0 01-4.243-1.414M16 17.5a6 6 0 00-4.243-1.414" />
        </svg>
      </div>
      <h3 class="text-2xl font-black text-white">Xuất Sắc!</h3>
      <p class="text-slate-300 mt-2 text-sm">Bạn đã hoàn thành bài học và tích lũy thêm điểm kinh nghiệm.</p>
      
      <div class="my-6 p-4 rounded-2xl bg-white/5 border border-white/5 inline-flex flex-col items-center">
        <span class="text-xs text-slate-400 font-bold uppercase tracking-widest">Điểm nhận được</span>
        <span class="text-3xl font-black text-emerald-400 mt-1">+{{ xpReward }} XP</span>
      </div>

      <div class="flex flex-col gap-3">
        <button
          v-if="quizId"
          @click="$emit('go-quiz', quizId)"
          class="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-bold rounded-2xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Làm bài trắc nghiệm liên kết</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
        <button
          @click="$emit('close')"
          class="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all border border-white/5 cursor-pointer"
        >
          Quay lại khóa học
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean;
  xpReward: number;
  quizId?: string | null;
}>();

defineEmits<{
  (e: 'go-quiz', quizId: string): void;
  (e: 'close'): void;
}>();
</script>
