import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { statelessPaymentApi } from '../services/statelessPaymentApi';
import * as paymentApi from '../services/paymentApi';
import type {
  StatelessOrderDto,
  StatelessPaymentConfig,
  StatelessPremiumStatus,
} from '../services/statelessPaymentApi';

// PM-019: Thời hạn QR (15 phút) và POLLING_TIMEOUT dùng CHUNG 1 hằng số duy nhất —
// trước đây QR 900s nhưng polling timeout 5 phút → user chuyển tiền ở phút 6-15
// bị lỗi giả "hết thời gian chờ". View lấy duration timer từ hằng số này.
export const PAYMENT_QR_TIMEOUT_MS = 15 * 60 * 1000;

export const usePaymentStore = defineStore('payment', () => {
  const authStore = useAuthStore();

  const currentOrder   = ref<StatelessOrderDto | paymentApi.OrderDto | null>(null);
  const paymentConfig  = ref<StatelessPaymentConfig | null>(null);
  const premiumStatus  = ref<StatelessPremiumStatus | null>(null);
  const isLoading      = ref(false);
  const paymentError   = ref<string | null>(null);
  const checkoutState  = ref<'idle' | 'paying' | 'verifying' | 'success' | 'error'>('idle');

  let pollingInterval: ReturnType<typeof setInterval> | null = null;
  let pollingStartTime = 0;
  // PM-025: Đếm số lần fail liên tiếp của polling — đủ N lần thì báo lỗi thay vì
  // nuốt im lặng khiến user chờ vô ích (vd token chết).
  let consecutivePollingFailures = 0;
  // PM-023: Guard in-flight — chặn 2 request /status chạy song song.
  let statusRequestInFlight = false;
  const POLLING_TIMEOUT = PAYMENT_QR_TIMEOUT_MS;
  const POLLING_INTERVAL_MS = 5000;
  const MAX_POLLING_FAILURES = 3;

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
    try {
      premiumStatus.value = await statelessPaymentApi.getPremiumStatus();
    } catch {  }
  }

  // Lấy trạng thái order theo đúng mode (stateless/classic) — dùng chung cho
  // verifyPayment lẫn startPolling (PM-016: stateless không có polling riêng,
  // dùng getOrderStatus của stateless API).
  async function fetchOrderStatus(orderId: string): Promise<StatelessOrderDto | paymentApi.OrderDto> {
    if (authStore.isStatelessMode) {
      return statelessPaymentApi.getOrderStatus(orderId);
    }
    const token = authStore.accessToken;
    if (!token) {
      throw new Error('Phiên làm việc không hợp lệ.');
    }
    return paymentApi.getOrderStatus(orderId, token);
  }

  // Tạo order classic — tách riêng để nhánh token rõ ràng (không fallback localStorage).
  async function createClassicOrder(): Promise<paymentApi.OrderDto> {
    const token = authStore.accessToken;
    if (!token) {
      throw new Error('Phiên làm việc không hợp lệ.');
    }
    return paymentApi.createOrder(token);
  }

  async function startCheckout(paymentMethod = 'vietqr'): Promise<void> {
    // PM-017: Guard reentrancy — chặn double-submit (nút "Thử lại" bấm nhiều lần
    // khi request đang chạy) tạo nhiều order.
    if (isLoading.value) return;
    if (!authStore.isAuthenticated) {
      paymentError.value = 'Bạn cần đăng nhập để thực hiện thanh toán.';
      checkoutState.value = 'error';
      return;
    }
    // PM-042: Reset order/trạng thái cũ trước khi tạo order mới — retry từ trạng thái
    // error/expired không còn order stale.
    resetCheckout();
    isLoading.value = true;
    paymentError.value = null;

    try {
      const order = authStore.isStatelessMode
        ? await statelessPaymentApi.checkout(paymentMethod)
        : await createClassicOrder();
      currentOrder.value = order;
      checkoutState.value = 'paying';
      // PM-016: Bắt polling cho CẢ 2 branch (stateless dùng getOrderStatus chung) —
      // trước đây stateless không polling → user kẹt mãi 'paying'.
      startPolling();
    } catch (err: unknown) {
      paymentError.value = err instanceof Error ? err.message : 'Không thể tạo hóa đơn.';
      checkoutState.value = 'error';
    } finally {
      isLoading.value = false;
    }
  }

  async function verifyPayment(): Promise<void> {
    if (!currentOrder.value) return;
    if (!authStore.isAuthenticated) {
      paymentError.value = 'Bạn cần đăng nhập để thực hiện thanh toán.';
      checkoutState.value = 'error';
      return;
    }
    // PM-017: Chặn verify trùng lặp khi đang chạy.
    if (isLoading.value) return;
    isLoading.value = true;
    checkoutState.value = 'verifying';

    try {
      // Dùng chung fetchOrderStatus: xác nhận qua trạng thái order, không gọi
      // endpoint verify trực tiếp (tránh phụ thuộc dev-guard backend — PM-001).
      const result = await fetchOrderStatus(currentOrder.value.id);
      currentOrder.value = result;

      // PM-039: Backend chỉ trả Pending/Completed — bỏ nhánh 'paid'.
      if (result.status === 'Completed') {
        checkoutState.value = 'success';
        stopPolling();
        authStore.markPremium();
        // PM-021: loadPremiumStatus ở CẢ 2 nhánh success (stateless + classic).
        await loadPremiumStatus();
      } else {
        // Chưa Completed → quay lại 'paying' và nối lại polling.
        checkoutState.value = 'paying';
        startPolling();
      }
    } catch (err: unknown) {
      paymentError.value = err instanceof Error ? err.message : 'Kiểm tra trạng thái thanh toán thất bại.';
      checkoutState.value = 'error';
    } finally {
      isLoading.value = false;
    }
  }

  function startPolling() {
    stopPolling();
    consecutivePollingFailures = 0;
    pollingStartTime = Date.now();
    pollingInterval = setInterval(async () => {
      // PM-019: Hết thời hạn QR (15 phút, cùng 1 hằng số) → dừng + báo lỗi.
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

      // PM-018: Mất token (logout/session expired) → dừng HẲN polling, không để
      // interval chạy tiếp và poll nhầm order/user mới.
      if (!authStore.accessToken) {
        stopPolling();
        return;
      }

      // PM-023: Guard in-flight — bỏ qua tick nếu request /status trước còn treo.
      if (statusRequestInFlight) return;

      try {
        statusRequestInFlight = true;
        const result = await fetchOrderStatus(currentOrder.value.id);
        consecutivePollingFailures = 0;
        // PM-039: Chỉ 'Completed' mới tính là thành công.
        if (result.status === 'Completed') {
          currentOrder.value = result;
          checkoutState.value = 'success';
          stopPolling();
          authStore.markPremium();
          await loadPremiumStatus();
        }
      } catch (err: unknown) {
        // PM-025: Log lỗi + sau N lần fail liên tiếp (3) → set error state.
        consecutivePollingFailures++;
        console.error(`[Payment] Lấy trạng thái order thất bại (lần ${consecutivePollingFailures}/${MAX_POLLING_FAILURES}):`, err);
        if (consecutivePollingFailures >= MAX_POLLING_FAILURES) {
          stopPolling();
          checkoutState.value = 'error';
          paymentError.value = 'Không thể kiểm tra trạng thái thanh toán. Vui lòng thử lại hoặc liên hệ Admin.';
        }
      } finally {
        statusRequestInFlight = false;
      }
    }, POLLING_INTERVAL_MS);
  }

  function stopPolling() {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  }

  async function simulatePaymentSuccess(): Promise<void> {
    // Chỉ tồn tại ở môi trường phát triển — production build KHÔNG có nhánh này.
    if (!import.meta.env.DEV) {
      paymentError.value = 'Tính năng mô phỏng chỉ khả dụng ở môi trường phát triển.';
      return;
    }
    if (!currentOrder.value) return;
    if (!authStore.isAuthenticated) {
      paymentError.value = 'Bạn cần đăng nhập để thực hiện thanh toán.';
      return;
    }
    isLoading.value = true;

    try {
      stopPolling();
      const result = await statelessPaymentApi.simulateWebhook(currentOrder.value.id);
      currentOrder.value = result;
      checkoutState.value = 'success';
      authStore.markPremium();
      await loadPremiumStatus();
    } catch (err: unknown) {
      paymentError.value = err instanceof Error ? err.message : 'Mô phỏng thanh toán thất bại.';
    } finally {
      isLoading.value = false;
    }
  }

  function resetCheckout(): void {
    stopPolling();
    currentOrder.value = null;
    checkoutState.value = 'idle';
    paymentError.value = null;
  }

  // PM-022: Reset toàn bộ trạng thái payment khi phiên auth thay đổi
  // (login/logout/đổi user) — tránh premiumStatus/currentOrder/config của user cũ
  // lộ sang phiên mới. View watch isAuthenticated/userId rồi gọi action này.
  function resetOnAuthChange(): void {
    resetCheckout();
    premiumStatus.value = null;
    paymentConfig.value = null;
  }

  // PM-043: QUYẾT ĐỊNH — checkFeatureAccess + freeFeatures hardcode là dead code
  // (chỉ test dùng, PremiumGate tự hardcode freeFeatures). Đã xóa khỏi store.
  // TODO(UI agent): PremiumGate.vue cần chuyển sang gọi backend check-access
  // (statelessPaymentApi.checkFeatureAccess) thay vì danh sách freeFeatures cứng;
  // test paymentP0Tests cần bỏ test checkFeatureAccess tương ứng.

  return {
    currentOrder, paymentConfig, premiumStatus, isLoading, paymentError, checkoutState,
    isPremium, premiumPrice,
    loadConfig, loadPremiumStatus, startCheckout, verifyPayment,
    simulatePaymentSuccess, resetCheckout, resetOnAuthChange,
  };
});
