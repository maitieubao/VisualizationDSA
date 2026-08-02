<template>
  <div class="lesson-step-leetcode h-full w-full flex flex-col p-6 animate-fade-in overflow-y-auto">
    <div class="max-w-4xl mx-auto w-full">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-text-primary mb-2 flex items-center gap-3">
          <BaseIcon name="code" class="w-8 h-8 text-accent-warm" />
          Thử thách LeetCode
        </h2>
        <p class="text-text-secondary">Áp dụng kiến thức thuật toán vào bài toán thực tế trên LeetCode.</p>
      </div>
      
      <div class="glass-panel p-8 rounded-2xl border border-accent-warm/20 bg-gradient-to-br from-bg-secondary to-accent-warm/20 text-center shadow-xl shadow-accent relative overflow-hidden">
        
        <div class="absolute top-0 right-0 -mt-10 -mr-10 text-accent-warm/10 pointer-events-none">
          <BaseIcon name="code" class="w-64 h-64" />
        </div>
        
        <div class="relative z-10">
          <div class="w-20 h-20 mx-auto bg-accent-warm/20 rounded-2xl flex items-center justify-center mb-6 border border-accent-warm/30">
            <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png" alt="LeetCode" class="w-12 h-12 object-contain filter invert opacity-90" />
          </div>
          
          <h3 class="text-xl font-bold text-text-primary mb-3">Bài tập: {{ leetCodeId }}</h3>
          <p class="text-text-secondary max-w-lg mx-auto mb-8 leading-relaxed">
            Để hoàn thành bài học này, bạn cần giải quyết bài toán <strong class="text-accent-warm">{{ leetCodeId }}</strong> trên nền tảng LeetCode. 
            Hãy đảm bảo bạn đã code pass tất cả các test cases!
          </p>
          
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              :href="`https://leetcode.com/problems/${leetCodeId}/`" 
              target="_blank"
              class="px-6 py-3 bg-accent-warm hover:bg-accent-warm text-text-primary font-bold rounded-xl transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2 transform hover:-translate-y-1"
            >
              <BaseIcon name="external-link" class="w-5 h-5" />
              Mở LeetCode
            </a>
            
            <button 
              @click="markCompleted"
              class="px-6 py-3 bg-accent-green/20 hover:bg-accent-green/30 text-accent-green border border-accent-green/30 font-bold rounded-xl transition-all flex items-center gap-2 transform hover:-translate-y-1"
            >
              <BaseIcon name="check-circle" class="w-5 h-5" />
              Tôi đã giải xong
            </button>
          </div>
        </div>
      </div>
      
      <div class="mt-8 p-5 rounded-xl bg-bg-secondary border border-border-default text-sm text-text-secondary">
        <h4 class="font-bold text-text-secondary mb-2 flex items-center gap-2">
          <BaseIcon name="bulb" class="w-4 h-4 text-accent-warm" />
          Mẹo giải bài
        </h4>
        <ul class="list-disc pl-5 space-y-1.5">
          <li>Đọc kỹ yêu cầu bài toán và các ràng buộc (constraints).</li>
          <li>Thử áp dụng kiến thức lý thuyết và xem lại minh họa (Trực quan hóa) nếu cần.</li>
          <li>Bắt đầu với brute force (vét cạn) nếu chưa nghĩ ra giải pháp tối ưu.</li>
          <li>Kiểm tra các trường hợp đặc biệt (edge cases).</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseIcon from '@/shared/components/BaseIcon.vue';

const props = defineProps<{
  leetCodeId: string;
}>();

const emit = defineEmits(['completeStep', 'completeLesson']);

function markCompleted() {
  // Can trigger confetti here
  emit('completeLesson');
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
