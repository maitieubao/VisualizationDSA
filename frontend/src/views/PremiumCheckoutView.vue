<template>
  <div class="checkout-container flex items-center justify-center min-h-screen px-4 py-8">
    <div class="glass-panel main-card w-full max-w-4xl overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-0 relative">
      <!-- Decorative background glows -->
      <div class="absolute -top-40 -left-40 w-80 h-80 bg-accent rounded-full blur-3xl opacity-20 pointer-events-none"></div>
      <div class="absolute -bottom-40 -right-40 w-80 h-80 bg-accent-red rounded-full blur-3xl opacity-20 pointer-events-none"></div>

      <!-- Left Column: Marketing / Pricing -->
      <PremiumMarketingCard />

      <!-- Right Column: Interactive payment handler -->
      <div class="col-span-12 md:col-span-7 p-8 flex flex-col justify-center min-h-[480px]">
        <!-- Screen: Auth Required -->
        <div v-if="!authStore.isAuthenticated" class="text-center py-12 flex flex-col items-center gap-6">
          <div class="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-2xl">
            👑
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
          <!-- Screen 1: Idle -->
          <CheckoutIdleScreen
            v-if="paymentStore.checkoutState === 'idle'"
            :is-loading="paymentStore.isLoading"
            :error="paymentStore.paymentError"
            @start="initiatePayment"
          />

          <!-- Screen 2: QR Payment -->
          <QrPaymentPanel
            v-else-if="paymentStore.checkoutState === 'paying'"
            :order="paymentStore.currentOrder"
            :formattedTime="formattedTime"
            :isExpired="isExpired"
            :isWarningTime="isWarningTime"
            @retry="initiatePayment"
          />

          <!-- Screen 2b: Verifying -->
          <div v-else-if="paymentStore.checkoutState === 'verifying'" class="text-center py-12">
            <div class="spinner-lg mx-auto mb-4"></div>
            <p class="text-sm text-[var(--text-secondary)]">Đang xác nhận thanh toán...</p>
          </div>

          <!-- Screen 3: Success -->
          <CheckoutSuccessScreen v-else-if="paymentStore.checkoutState === 'success'" @finish="finishCheckout" />

          <!-- Screen 4: Error -->
          <div v-else-if="paymentStore.checkoutState === 'error'" class="text-center py-12">
            <p class="text-accent-red mb-4">{{ paymentStore.paymentError }}</p>
            <button class="px-6 py-2 bg-accent rounded-lg" @click="paymentStore.resetCheckout()">Thử lại</button>
          </div>

          <!-- Simulate Payment Button (dev mode only — ẩn trong production) -->
          <div v-if="paymentStore.checkoutState === 'paying' && isDev" class="mt-4 text-center">
            <button
              class="px-4 py-2 text-xs bg-accent-green/20 border border-accent-green/40 rounded-lg hover:bg-accent-green/30 transition"
              @click="handleSimulatePayment"
            >
              🧪 Mô phỏng: Xác nhận đã thanh toán
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePaymentStore } from '../features/payment/store/usePaymentStore';
import { useAuthStore } from '../features/auth/store/useAuthStore';
import PremiumMarketingCard from '../features/payment/components/PremiumMarketingCard.vue';
import QrPaymentPanel from '../features/payment/components/QrPaymentPanel.vue';
import CheckoutIdleScreen from '../features/payment/components/CheckoutIdleScreen.vue';
import CheckoutSuccessScreen from '../features/payment/components/CheckoutSuccessScreen.vue';
import { usePaymentTimer } from '../features/payment/composables/usePaymentTimer';
import { useConfetti } from '../composables/useConfetti';

const emit = defineEmits<{ openLogin: [] }>();

/** Chỉ hiện UI dev-only khi chạy trong môi trường development (Vite dev server) */
const isDev = import.meta.env.DEV;

const router = useRouter();
const paymentStore = usePaymentStore();
const authStore = useAuthStore();

const { isExpired, isWarningTime, formattedTime, startTimer, stopTimer } = usePaymentTimer(900);
const { firePremium } = useConfetti();

onMounted(() => {
  paymentStore.loadConfig();
  paymentStore.resetCheckout();
  if (authStore.isAuthenticated) {
    paymentStore.loadPremiumStatus();
  }
});

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

function finishCheckout(): void {
  paymentStore.resetCheckout();
  router.push('/sorting');
}

onUnmounted(() => {
  stopTimer();
  paymentStore.resetCheckout();
});
</script>

<style scoped>
.checkout-container { background: radial-gradient(circle at center, var(--color-bg-secondary) 0%, var(--color-bg-primary) 100%); min-height: 100vh; }
.main-card { border-color: var(--border-color); box-shadow: 0 0 50px -15px rgba(6,182,212,0.15); }
.spinner-lg { width: 2rem; height: 2rem; border: 3px solid rgba(255,255,255,0.2); border-radius: 50%; border-top-color: var(--color-accent-primary); animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
