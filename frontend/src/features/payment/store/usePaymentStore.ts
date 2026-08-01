




import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { statelessPaymentApi } from '@/features/payment/services/statelessPaymentApi';
import * as paymentApi from '@/features/payment/services/paymentApi';
import type {
  StatelessOrderDto,
  StatelessPaymentConfig,
  StatelessPremiumStatus,
} from '@/features/payment/services/statelessPaymentApi';

export const usePaymentStore = defineStore('payment', () => {
  const authStore = useAuthStore();

  
  const currentOrder   = ref<any | null>(null); 
  const paymentConfig  = ref<StatelessPaymentConfig | null>(null);
  const premiumStatus  = ref<StatelessPremiumStatus | null>(null);
  const isLoading      = ref(false);
  const paymentError   = ref<string | null>(null);
  const checkoutState  = ref<'idle' | 'paying' | 'verifying' | 'success' | 'error'>('idle');

  
  let pollingInterval: ReturnType<typeof setInterval> | null = null;
  let pollingStartTime = 0;
  const POLLING_TIMEOUT = 5 * 60 * 1000; 

  
  const isPremium = computed(() => {
    if (premiumStatus.value?.isPremium) return true;
    return authStore.currentUser?.isPremium ?? false;
  });

  const premiumPrice = computed(() => paymentConfig.value?.premiumPrice ?? 199_000);

  

  async function loadConfig(): Promise<void> {
    try {
      paymentConfig.value = await statelessPaymentApi.getConfig();
    } catch {  }
  }

  async function loadPremiumStatus(): Promise<void> {
    const userId = authStore.statelessUser?.id ?? authStore.currentUser?.id;
    if (!userId) return;
    try {
      premiumStatus.value = await statelessPaymentApi.getPremiumStatus(String(userId));
    } catch {  }
  }

  async function startCheckout(paymentMethod = 'vietqr'): Promise<void> {
    if (!authStore.isAuthenticated) {
      paymentError.value = 'Bạn cần đăng nhập để thực hiện thanh toán.';
      checkoutState.value = 'error';
      return;
    }
    isLoading.value = true;
    paymentError.value = null;

    if (authStore.isStatelessMode) {
      
      const userId = authStore.statelessUser?.id;
      if (!userId) {
        paymentError.value = 'Không tìm thấy thông tin người dùng.';
        checkoutState.value = 'error';
        isLoading.value = false;
        return;
      }
      try {
        const order = await statelessPaymentApi.checkout(String(userId), paymentMethod);
        currentOrder.value = order;
        checkoutState.value = 'paying';
      } catch (err: unknown) {
        paymentError.value = err instanceof Error ? err.message : 'Không thể tạo hóa đơn.';
        checkoutState.value = 'error';
      } finally {
        isLoading.value = false;
      }
    } else {
      
      const token = authStore.accessToken;
      if (!token) {
        paymentError.value = 'Phiên làm việc không hợp lệ.';
        checkoutState.value = 'error';
        isLoading.value = false;
        return;
      }
      try {
        const order = await paymentApi.createOrder(token);
        currentOrder.value = order;
        checkoutState.value = 'paying';
        
        
        startPolling();
      } catch (err: unknown) {
        paymentError.value = err instanceof Error ? err.message : 'Không thể tạo hóa đơn từ máy chủ.';
        checkoutState.value = 'error';
      } finally {
        isLoading.value = false;
      }
    }
  }

  async function verifyPayment(): Promise<void> {
    if (!currentOrder.value) return;
    if (!authStore.isAuthenticated) {
      paymentError.value = 'Bạn cần đăng nhập để thực hiện thanh toán.';
      checkoutState.value = 'error';
      return;
    }
    isLoading.value = true;
    checkoutState.value = 'verifying';

    if (authStore.isStatelessMode) {
      const userId = authStore.statelessUser?.id;
      if (!userId) {
        paymentError.value = 'Không tìm thấy thông tin người dùng.';
        checkoutState.value = 'error';
        isLoading.value = false;
        return;
      }
      try {
        const result = await statelessPaymentApi.verify(currentOrder.value.id, String(userId));
        currentOrder.value = result;

        if (result.status === 'Completed') {
          checkoutState.value = 'success';
          if (authStore.currentUser) {
            authStore.currentUser.isPremium = true;
          }
          await loadPremiumStatus();
        }
      } catch (err: unknown) {
        paymentError.value = err instanceof Error ? err.message : 'Xác nhận thanh toán thất bại.';
        checkoutState.value = 'error';
      } finally {
        isLoading.value = false;
      }
    } else {
      
      const token = authStore.accessToken;
      if (!token) {
        paymentError.value = 'Phiên làm việc không hợp lệ.';
        checkoutState.value = 'error';
        isLoading.value = false;
        return;
      }
      try {
        const result = await paymentApi.getOrderStatus(currentOrder.value.id, token);
        currentOrder.value = result;

        if (result.status === 'Completed' || result.status === 'paid') {
          checkoutState.value = 'success';
          stopPolling();
          if (authStore.currentUser) {
            authStore.currentUser.isPremium = true;
          }
        }
      } catch (err: unknown) {
        paymentError.value = err instanceof Error ? err.message : 'Kiểm tra trạng thái thanh toán thất bại.';
        checkoutState.value = 'error';
      } finally {
        isLoading.value = false;
      }
    }
  }

  
  function startPolling() {
    stopPolling();
    pollingStartTime = Date.now();
    pollingInterval = setInterval(async () => {
      
      if (Date.now() - pollingStartTime > POLLING_TIMEOUT) {
        stopPolling();
        checkoutState.value = 'error';
        paymentError.value = 'Hết thời gian chờ thanh toán. Nếu bạn đã chuyển tiền thành công, hãy liên hệ Admin hoặc làm mới trang.';
        return;
      }

      
      if (checkoutState.value !== 'paying' || !currentOrder.value) {
        stopPolling();
        return;
      }
      const token = authStore.accessToken;
      if (!token) return;
      
      try {
        const result = await paymentApi.getOrderStatus(currentOrder.value.id, token);
        if (result.status === 'Completed' || result.status === 'paid') {
          currentOrder.value = result;
          checkoutState.value = 'success';
          stopPolling();
          if (authStore.currentUser) {
            authStore.currentUser.isPremium = true;
          }
        }
      } catch {
        
      }
    }, 5000);
  }

  function stopPolling() {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  }

  async function simulatePaymentSuccess(): Promise<void> {
    if (!currentOrder.value) return;
    if (!authStore.isAuthenticated) {
      paymentError.value = 'Bạn cần đăng nhập để thực hiện thanh toán.';
      return;
    }
    isLoading.value = true;

    if (authStore.isStatelessMode) {
      try {
        const result = await statelessPaymentApi.simulateWebhook(currentOrder.value.id);
        currentOrder.value = result;
        checkoutState.value = 'success';
        if (authStore.currentUser) {
          authStore.currentUser.isPremium = true;
        }
        await loadPremiumStatus();
      } catch (err: unknown) {
        paymentError.value = err instanceof Error ? err.message : 'Mô phỏng thanh toán thất bại.';
      } finally {
        isLoading.value = false;
      }
    } else {
      
      try {
        stopPolling();
        await paymentApi.simulateWebhook(currentOrder.value.paymentCode, currentOrder.value.amount);
        
        
        await verifyPayment();
      } catch (err: unknown) {
        paymentError.value = err instanceof Error ? err.message : 'Mô phỏng thanh toán SePay thất bại.';
      } finally {
        isLoading.value = false;
      }
    }
  }

  function resetCheckout(): void {
    stopPolling();
    currentOrder.value = null;
    checkoutState.value = 'idle';
    paymentError.value = null;
  }

  async function checkFeatureAccess(featureId: string): Promise<boolean> {
    if (isPremium.value) return true;
    const userId = authStore.statelessUser?.id ?? authStore.currentUser?.id;
    if (!userId) return false;
    try {
      const result = await statelessPaymentApi.checkFeatureAccess(featureId, String(userId));
      return result.hasAccess;
    } catch {
      return false;
    }
  }

  return {
    currentOrder, paymentConfig, premiumStatus, isLoading, paymentError, checkoutState,
    isPremium, premiumPrice,
    loadConfig, loadPremiumStatus, startCheckout, verifyPayment,
    simulatePaymentSuccess, resetCheckout, checkFeatureAccess,
  };
});
