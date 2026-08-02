<template>
  <div v-if="!hasAccess" class="premium-gate group">
    <div class="premium-gate__overlay bg-black/80 backdrop-blur-md absolute inset-0 z-10 flex items-center justify-center rounded-2xl transition-all duration-300">
      <div class="premium-gate__card bg-black/40 border border-accent-warm/20 shadow-2xl shadow-accent p-8 rounded-3xl max-w-sm text-center transform transition-all duration-300 group-hover:scale-105 group-hover:border-accent-warm/40 relative overflow-hidden">
        
        <!-- Premium Shimmer Effect -->
        <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-bg-surface/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none"></div>

        <div class="premium-gate__icon-wrapper w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-accent-warm-light/20 to-accent-warm/20 rounded-full flex items-center justify-center border border-accent-warm/30 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
          <BaseIcon name="gem" class="w-10 h-10 text-accent-warm drop-shadow-md" />
        </div>
        
        <h3 class="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-warm-light to-accent-warm-light mb-2">
          Nội dung Premium
        </h3>
        
        <p class="text-sm text-text-secondary mb-6 leading-relaxed">
          {{ message || 'Tính năng này yêu cầu tài khoản Premium. Nâng cấp để mở khóa toàn bộ sức mạnh!' }}
        </p>
        
        <button 
          class="w-full relative overflow-hidden bg-gradient-to-r from-accent-warm to-accent-warm text-black font-black text-sm py-3 px-6 rounded-xl shadow-[0_4px_15px_rgba(245,158,11,0.4)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.6)] transform hover:-translate-y-0.5 transition-all duration-200"
          @click="goToCheckout"
        >
          <span class="relative z-10 flex items-center justify-center gap-2">
            Nâng cấp Premium — 199.000đ
            <BaseIcon name="arrow-right" class="w-4 h-4" />
          </span>
        </button>
      </div>
    </div>
    <div class="premium-gate__content select-none pointer-events-none filter blur-md opacity-50 transition-all duration-300 group-hover:blur-xl" aria-hidden="true">
      <slot />
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { usePaymentStore } from '../store/usePaymentStore';
import BaseIcon from '@/shared/components/BaseIcon.vue';

const props = defineProps<{
  featureId?: string;
  message?: string;
}>();

const router = useRouter();
const paymentStore = usePaymentStore();

const hasAccess = computed(() => {
  if (paymentStore.isPremium) return true;
  if (!props.featureId) return false;
  
  const freeFeatures = ['basic-viz', 'quiz-basic'];
  return freeFeatures.includes(props.featureId);
});

function goToCheckout(): void {
  router.push('/checkout');
}
</script>

<style scoped>
.premium-gate {
  position: relative;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 1.5s infinite;
}
</style>
