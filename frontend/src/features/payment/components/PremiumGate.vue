<template>
  <div v-if="!hasAccess" class="premium-gate">
    <div class="premium-gate__overlay">
      <div class="premium-gate__card">
        <span class="premium-gate__icon">👑</span>
        <h3 class="premium-gate__title">Nội dung Premium</h3>
        <p class="premium-gate__desc">
          {{ message || 'Tính năng này yêu cầu tài khoản Premium. Nâng cấp để mở khóa toàn bộ sức mạnh DSA!' }}
        </p>
        <button class="premium-gate__btn" @click="goToCheckout">
          Nâng cấp Premium — 199.000đ
        </button>
      </div>
    </div>
    <div class="premium-gate__content" aria-hidden="true">
      <slot />
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { usePaymentStore } from '../store/usePaymentStore';

const props = defineProps<{
  featureId?: string;
  message?: string;
}>();

const router = useRouter();
const paymentStore = usePaymentStore();

const hasAccess = computed(() => {
  if (paymentStore.isPremium) return true;
  if (!props.featureId) return false;
  // Free features always accessible
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

.premium-gate__overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg, 12px);
}

.premium-gate__card {
  text-align: center;
  padding: 24px;
  max-width: 320px;
}

.premium-gate__icon {
  font-size: 40px;
  display: block;
  margin-bottom: 12px;
  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
}

.premium-gate__title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-gold, #ffd700);
  margin-bottom: 8px;
}

.premium-gate__desc {
  font-size: 12px;
  color: var(--color-text-secondary, #aaa);
  line-height: 1.5;
  margin-bottom: 16px;
}

.premium-gate__btn {
  background: linear-gradient(90deg, #ffd700, #ff8c00);
  color: #000;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
}
.premium-gate__btn:hover { opacity: 0.9; }
.premium-gate__btn:active { transform: scale(0.97); }

.premium-gate__content {
  filter: blur(4px);
  pointer-events: none;
  user-select: none;
}
</style>
