<template>
  <div v-if="!hasAccess" class="premium-gate">
    <!-- PM-030: overlay là dialog modal + aria-modal; focus chuyển vào nút nâng cấp khi mở -->
    <div class="premium-gate__overlay" role="dialog" aria-modal="true" aria-labelledby="premium-gate-title">
      <div class="premium-gate__card">
        <span class="premium-gate__icon"><BaseIcon name="crown" class="w-8 h-8" /></span>
        <h3 id="premium-gate-title" class="premium-gate__title">Nội dung Premium</h3>
        <p class="premium-gate__desc">
          {{ message || 'Tính năng này yêu cầu tài khoản Premium. Nâng cấp để mở khóa toàn bộ sức mạnh DSA!' }}
        </p>
        <button ref="upgradeBtnRef" type="button" class="premium-gate__btn" @click="goToCheckout">
          Nâng cấp Premium — {{ formatVND(paymentStore.premiumPrice) }}
        </button>
      </div>
    </div>
    <!-- PM-030: nội dung bị khóa không được vào tab order -->
    <div class="premium-gate__content" aria-hidden="true" tabindex="-1">
      <slot />
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { usePaymentStore } from '../store/usePaymentStore';
import { formatVND } from '../../../utils/format';

// TODO (PM-020): PremiumGate hiện chưa được mount đại trà trong sản phẩm.
// Agent store phối hợp mount qua `checkFeatureAccess` khi gating tính năng thật
// (lesson/sandbox premium) — giữ component hoạt động đúng + đầy đủ a11y.
const props = defineProps<{
  featureId?: string;
  message?: string;
}>();

// useRouter/useRoute có thể trả undefined trong môi trường test thiếu router injection.
const router = useRouter();
const route = useRoute();
const paymentStore = usePaymentStore();

const upgradeBtnRef = ref<HTMLButtonElement | null>(null);

const hasAccess = computed(() => {
  if (paymentStore.isPremium) return true;
  if (!props.featureId) return false;

  const freeFeatures = ['basic-viz', 'quiz-basic'];
  return freeFeatures.includes(props.featureId);
});

// PM-030: khi gate mở khóa (chưa có quyền), chuyển focus vào nút nâng cấp.
function focusUpgradeButton(): void {
  nextTick(() => {
    upgradeBtnRef.value?.focus();
  });
}

onMounted(() => {
  if (!hasAccess.value) focusUpgradeButton();
});

watch(hasAccess, (val) => {
  if (!val) focusUpgradeButton();
});

function goToCheckout(): void {
  // Mang theo đường dẫn hiện tại để sau khi thanh toán quay lại đúng nơi user bị chặn (PM-029).
  const redirect = route?.fullPath && route.fullPath !== '/' ? route.fullPath : undefined;
  if (router) {
    if (redirect) {
      router.push({ path: '/checkout', query: { redirect } });
    } else {
      router.push('/checkout');
    }
    return;
  }
  // Fallback khi không có router (edge case test) — điều hướng thủ công.
  if (typeof window !== 'undefined') {
    window.location.assign('/#/checkout');
  }
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
  background: var(--color-bg-overlay);
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
  color: var(--color-text-secondary);
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
