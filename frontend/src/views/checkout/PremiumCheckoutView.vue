<template>
  <div class="checkout-container flex items-center justify-center min-h-screen px-4 py-8">
    <div class="glass-panel main-card w-full max-w-4xl overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-0 relative">

      <div class="absolute -top-40 -left-40 w-80 h-80 bg-accent rounded-full blur-3xl opacity-20 pointer-events-none"></div>
      <div class="absolute -bottom-40 -right-40 w-80 h-80 bg-accent-red rounded-full blur-3xl opacity-20 pointer-events-none"></div>


      <PremiumMarketingCard />


      <!-- PM-050: ref + tabindex để quản lý focus khi chuyển state -->
      <div ref="panelRef" tabindex="-1" class="col-span-12 md:col-span-7 p-8 flex flex-col justify-center min-h-[480px] outline-none">

        <div v-if="!authStore.isAuthenticated" class="text-center py-12 flex flex-col items-center gap-6">
          <div class="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-2xl">
            <BaseIcon name="crown" class="w-8 h-8" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-text-primary mb-2">Yêu cầu Đăng nhập</h3>
            <p class="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
              Bạn cần đăng nhập hoặc tạo tài khoản VisualizationDSA trước khi nâng cấp Premium để chúng tôi lưu trữ và đồng bộ hóa quyền lợi của bạn.
            </p>
          </div>
          <button
            class="px-6 py-2.5 bg-accent text-bg-primary font-bold text-sm rounded-xl hover:bg-accent/90 transition-all shadow-lg shadow-accent/20"
            @click="emit('openLogin')"
          >
            Đăng nhập / Đăng ký
          </button>
        </div>

        <template v-else>

          <!-- PM-026: user đã premium không cần mua tiếp -->
          <div v-if="authStore.isPremium" class="text-center py-12">
            <div class="w-16 h-16 mx-auto mb-6 bg-accent-green/10 border border-accent-green/30 rounded-full flex items-center justify-center shadow-[0_0_15px_var(--color-emerald-glow)]">
              <BaseIcon name="check" class="w-7 h-7 text-accent-green" />
            </div>
            <h3 class="text-xl font-bold text-accent-green mb-3">Bạn đã là Premium</h3>
            <p class="text-sm text-text-secondary max-w-md mx-auto mb-8">
              Tài khoản của bạn đã mở khóa toàn bộ tính năng. Không cần thanh toán thêm.
            </p>
            <button
              class="px-6 py-2.5 bg-accent text-bg-primary font-bold text-sm rounded-xl hover:bg-accent/90 transition-all shadow-lg shadow-accent/20"
              @click="goBack"
            >
              Quay lại khám phá
            </button>
          </div>

          <CheckoutIdleScreen
            v-else-if="paymentStore.checkoutState === 'idle'"
            :is-loading="paymentStore.isLoading"
            :error="paymentStore.paymentError"
            @start="initiatePayment"
          />

          <QrPaymentPanel
            v-else-if="paymentStore.checkoutState === 'paying'"
            :order="paymentStore.currentOrder"
            :formattedTime="formattedTime"
            :isExpired="isExpired"
            :isWarningTime="isWarningTime"
            @retry="initiatePayment"
          />

          <!-- PM-048: nhánh 'verifying' bỏ — agent store đã nối verify qua polling, tránh dead UI -->

          <CheckoutSuccessScreen v-else-if="paymentStore.checkoutState === 'success'" @finish="finishCheckout" />

          <!-- PM-027: map lỗi raw → tiếng Việt · PM-049: retry gọi thẳng initiatePayment -->
          <div v-else-if="paymentStore.checkoutState === 'error'" class="text-center py-12">
            <p class="text-accent-red mb-4">{{ friendlyError }}</p>
            <button
              class="px-6 py-2 bg-accent text-bg-primary font-bold text-sm rounded-lg hover:bg-accent/90 transition disabled:opacity-50 disabled:pointer-events-none"
              :disabled="paymentStore.isLoading"
              @click="initiatePayment"
            >
              Thử lại
            </button>
          </div>


          <div v-if="paymentStore.checkoutState === 'paying' && isDev" class="mt-4 text-center">
            <button
              class="px-4 py-2 text-xs bg-accent-green/20 border border-accent-green/40 rounded-lg hover:bg-accent-green/30 transition"
              @click="handleSimulatePayment"
            >
              <BaseIcon name="flask" class="w-3.5 h-3.5 inline mr-1 align-middle" />Mô phỏng: Xác nhận đã thanh toán
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { usePaymentStore } from '../../features/payment/store/usePaymentStore';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import PremiumMarketingCard from '../../features/payment/components/PremiumMarketingCard.vue';
import QrPaymentPanel from '../../features/payment/components/QrPaymentPanel.vue';
import CheckoutIdleScreen from '../../features/payment/components/CheckoutIdleScreen.vue';
import CheckoutSuccessScreen from '../../features/payment/components/CheckoutSuccessScreen.vue';
import { usePaymentTimer } from '../../features/payment/composables/usePaymentTimer';
import { useConfetti } from '../../composables/useConfetti';
import { getErrorMessage } from '../../utils/format';

const emit = defineEmits<{ openLogin: [] }>();


const isDev = import.meta.env.DEV && !import.meta.env.PROD;

const router = useRouter();
const route = useRoute();
const paymentStore = usePaymentStore();
const authStore = useAuthStore();

const { isExpired, isWarningTime, formattedTime, startTimer, stopTimer } = usePaymentTimer(900);
const { firePremium } = useConfetti();

// PM-050: focus vào panel khi chuyển state (idle → QR → success)
const panelRef = ref<HTMLElement | null>(null);

// PM-027: map lỗi raw (HTTP 500...) → tiếng Việt thân thiện
const friendlyError = computed(() => getErrorMessage(paymentStore.paymentError));

onMounted(() => {
  paymentStore.loadConfig();
  paymentStore.resetCheckout();
  if (authStore.isAuthenticated) {
    paymentStore.loadPremiumStatus();
  }
});

// PM-050: chuyển focus về heading/panel mới mỗi khi checkoutState đổi
watch(
  () => paymentStore.checkoutState,
  () => {
    nextTick(() => panelRef.value?.focus());
  },
);

async function initiatePayment(): Promise<void> {
  await paymentStore.startCheckout('vietqr');
  if (paymentStore.checkoutState === 'paying') {
    startTimer(900);
  }
}

async function handleSimulatePayment(): Promise<void> {
  stopTimer();
  await paymentStore.simulatePaymentSuccess();
  if (paymentStore.checkoutState === 'success') {
    firePremium();
  }
}

// PM-029: quay lại route nguồn qua query `redirect` (nếu có) thay vì cứng /sorting
function resolveReturnPath(): string {
  const redirect = route.query.redirect;
  if (typeof redirect === 'string' && redirect.trim() !== '' && redirect.startsWith('/')) {
    return redirect;
  }
  return '/sorting';
}

function finishCheckout(): void {
  paymentStore.resetCheckout();
  router.push(resolveReturnPath());
}

function goBack(): void {
  router.push(resolveReturnPath());
}

onUnmounted(() => {
  stopTimer();
  paymentStore.resetCheckout();
});
</script>

<style scoped>
.checkout-container { background: radial-gradient(circle at center, var(--color-bg-secondary) 0%, var(--color-bg-primary) 100%); min-height: 100vh; }
.main-card { border-color: var(--border-color); box-shadow: 0 0 50px -15px var(--color-accent-cyan-glow); }
</style>
